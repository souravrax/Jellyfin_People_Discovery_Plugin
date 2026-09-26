using System;
using System.Collections;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Runtime.Loader;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json.Linq;

namespace Jellyfin.Plugin.JellyfinPeopleDiscoveryPlugin;

/// <summary>
/// Registers our transformation with the File Transformation plugin
/// (https://github.com/IAmParadox27/jellyfin-plugin-file-transformation)
/// via its reflection-based RegisterTransformation API, so no direct
/// assembly reference (and its load-context issues) is needed.
///
/// Runs as a retry loop because plugin load order is undefined: the File
/// Transformation assembly may not be loaded yet when our constructor runs.
/// Retries every 10s for ~6 minutes, then gives up with a warning.
///
/// NOTE (v12): IPluginServiceRegistrator / IHostedService wiring was dropped
/// because IServerApplicationHost no longer exists.
/// </summary>
public static class StartupRegistration
{
    // Must be stable: File Transformation uses it to de-dupe registrations.
    private static readonly Guid RegistrationId = Guid.Parse("78e761e1-2f5b-488b-aa1e-02fad240d3af");

    public static void StartRetryLoop(ILogger logger)
    {
        _ = Task.Run(async () =>
        {
            for (var i = 0; i < 36; i++)
            {
                try
                {
                    if (TryRegister())
                    {
                        logger.LogInformation("People Discovery: registered index.html transformation.");
                        return;
                    }
                }
                catch (Exception ex)
                {
                    logger.LogDebug(ex, "People Discovery: transformation registration attempt failed, retrying.");
                }

                await Task.Delay(TimeSpan.FromSeconds(10)).ConfigureAwait(false);
            }

            logger.LogWarning(
                "People Discovery: File Transformation plugin not found. Install it and restart, otherwise #/people will not be injected.");
        });
    }

    private static bool TryRegister()
    {
        var ftAssembly = AssemblyLoadContext.All
            .SelectMany(x => x.Assemblies)
            .FirstOrDefault(x => x.FullName?.Contains(".FileTransformation") ?? false);

        if (ftAssembly is null)
        {
            return false;
        }

        var iface = ftAssembly.GetType("Jellyfin.Plugin.FileTransformation.PluginInterface");
        var register = iface?.GetMethod("RegisterTransformation");
        if (register is null)
        {
            return false;
        }

        var payload = new JObject
        {
            ["id"] = RegistrationId.ToString(),
            ["fileNamePattern"] = "index.html",
            ["callbackAssembly"] = typeof(PeoplePageTransform).Assembly.FullName,
            ["callbackClass"] = typeof(PeoplePageTransform).FullName,
            ["callbackMethod"] = nameof(PeoplePageTransform.Transform),
        };

        register.Invoke(null, new object?[] { payload });
        return true;
    }
}

/// <summary>
/// Callback invoked by the File Transformation plugin with the current
/// index.html contents as { "contents": "..." }. Returns the raw new file
/// text (verified against File Transformation's TransformationHelper, which
/// does <c>Invoke(...) as string</c>).
/// </summary>
public static class PeoplePageTransform
{
    private const string BundleResource = "people.bundle.js";
    private const string BundleCssResource = "people.bundle.css";

    /// <summary>
    /// MUST return the raw new file contents as a string (or null to leave
    /// the file untouched). File Transformation does
    /// <c>method.Invoke(null, [paramObj]) as string</c> — anything that is
    /// not a string is silently discarded and the file is served unpatched.
    /// </summary>
    public static string? Transform(object? input)
    {
        try
        {
            var contents = ExtractContents(input);
            if (string.IsNullOrEmpty(contents))
            {
                return null;
            }

            // SAFETY: fileNamePattern is matched as an UNANCHORED regex, so
            // "index.html" also matches lazy chunks like
            // "itemDetails-index-html.*.chunk.js" (the dots match dashes).
            // Patching one corrupts it (11 KB JS + our tags = SyntaxError =
            // blank page). Only the real index.html references the main
            // bundle AND has a body close tag — chunks have neither.
            if (!contents.Contains("main.jellyfin.bundle", StringComparison.Ordinal)
                || !contents.Contains("</body>", StringComparison.Ordinal))
            {
                return contents;
            }

            // Idempotent: never patch twice.
            if (contents.Contains("__JF_PEOPLE_BUNDLE__", StringComparison.Ordinal))
            {
                return contents;
            }

            // Single implementation: the React + Tailwind bundle. Without it
            // there is nothing to inject — leave the file untouched.
            var bundle = LoadScript(BundleResource);
            if (string.IsNullOrEmpty(bundle))
            {
                return contents;
            }

            bundle = bundle.Replace("</script", "<\\/script", StringComparison.Ordinal);
            var css = LoadScript(BundleCssResource);
            var style = string.IsNullOrEmpty(css)
                ? string.Empty
                : "<style>" + css.Replace("</style", "<\\/style", StringComparison.Ordinal) + "</style>\n";
            var tags = style + "<script>" + bundle + "</script>\n</body>";

            return contents.Contains("</body>", StringComparison.Ordinal)
                ? contents.Replace("</body>", tags, StringComparison.Ordinal)
                : contents + tags;
        }
        catch
        {
            // Never break page serving because of our injection.
            return null;
        }
    }

    private static string? ExtractContents(object? input)
    {
        switch (input)
        {
            case null:
                return null;
            case string s when LooksLikeJson(s):
                try
                {
                    return JObject.Parse(s)["contents"]?.Value<string>();
                }
                catch
                {
                    return null;
                }
            case string s:
                return s;
            case JObject o:
                return o["contents"]?.Value<string>();
            case IDictionary d when d.Contains("contents"):
                return d["contents"]?.ToString();
            default:
            {
                var prop = input.GetType().GetProperty("contents")
                    ?? input.GetType().GetProperty("Contents");
                return prop?.GetValue(input)?.ToString();
            }
        }
    }

    private static bool LooksLikeJson(string s)
    {
        var t = s.TrimStart();
        return t.StartsWith("{", StringComparison.Ordinal);
    }

    /// <summary>
    /// Operator override first: drop edited files next to the plugin DLL's
    /// data folder to update the injected JS without rebuilding. Falls back
    /// to the JS embedded at build time.
    /// </summary>
    private static string LoadScript(string fileName)
    {
        try
        {
            var dataDir = Plugin.Instance?.DataFolderPath;
            if (!string.IsNullOrEmpty(dataDir))
            {
                var overridePath = Path.Combine(dataDir, fileName);
                if (File.Exists(overridePath))
                {
                    return File.ReadAllText(overridePath);
                }
            }
        }
        catch
        {
            // Fall through to embedded resource.
        }

        var asm = typeof(PeoplePageTransform).Assembly;
        var name = asm.GetManifestResourceNames()
            .FirstOrDefault(n => n.EndsWith(fileName, StringComparison.OrdinalIgnoreCase));
        if (name is null)
        {
            return string.Empty;
        }

        using var stream = asm.GetManifestResourceStream(name);
        using var reader = new StreamReader(stream!);
        return reader.ReadToEnd();
    }
}
