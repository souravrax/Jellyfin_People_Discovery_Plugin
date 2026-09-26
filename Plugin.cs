using System;
using MediaBrowser.Common.Configuration;
using MediaBrowser.Common.Plugins;
using MediaBrowser.Model.Plugins;
using MediaBrowser.Model.Serialization;
using Microsoft.Extensions.Logging;
using Jellyfin.Plugin.JellyfinPeopleDiscoveryPlugin.Configuration;

namespace Jellyfin.Plugin.JellyfinPeopleDiscoveryPlugin;

/// <summary>
/// Injects the People browser (page + route scripts) into jellyfin-web
/// via the File Transformation plugin. No config page: nothing to configure.
///
/// NOTE (v12): IApplicationHost / IServerApplicationHost /
/// IPluginServiceRegistrator are gone, so registration runs from a small
/// background retry loop in the constructor instead of a hosted service.
/// </summary>
public class Plugin : BasePlugin<PluginConfiguration>
{
    public Plugin(
        IApplicationPaths applicationPaths,
        IXmlSerializer xmlSerializer,
        ILogger<Plugin> logger)
        : base(applicationPaths, xmlSerializer)
    {
        Instance = this;
        StartupRegistration.StartRetryLoop(logger);
    }

    public override string Name => "People Discovery";

    public override string Description =>
        "Adds a native-looking people browser at #/people: search, actor/director/writer filters, sort, favorites, infinite scroll.";

    public override Guid Id => Guid.Parse("591c7936-dd66-440e-be38-ad0cc91b1f63");

    public static Plugin? Instance { get; private set; }
}
