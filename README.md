# JellyfinPeopleDiscoveryPlugin

A Jellyfin 12 server plugin that adds a native-looking **people browser** at
`#/people`: search, actor/director/writer/producer/composer filters, sort
order, favorites-only, count chip, prev/next paging, infinite scroll, a
header **People** nav entry, and automatic hiding of Jellyfin's fallback page
for the custom route.

It works by inlining one self-contained script + stylesheet into the served
`index.html` via the **File Transformation** plugin — every browser using
jellyfin-web gets it, no JS Injector or userscripts needed.

## Layout

```text
JellyfinPeopleDiscoveryPlugin/
├── Jellyfin.Plugin.JellyfinPeopleDiscoveryPlugin.csproj  # net10.0, Jellyfin 12
├── Plugin.cs                        # plugin metadata (Name/GUID/description)
├── FileTransformation.cs            # index.html patch + registration retry loop
├── Configuration/PluginConfiguration.cs
├── WebUI/src/                       # React 18 + TS UI (see below)
│   ├── main.tsx                     # bundle entry (double-load guard)
│   ├── bootstrap.tsx                # mount + header nav observer
│   ├── app.tsx                      # <App/> composition only
│   ├── constants.ts                 # ids, route, filters
│   ├── api.ts                       # typed ApiClient helpers
│   ├── routing.ts                   # route/nav DOM integration
│   ├── hooks/                       # useRouteSync, usePersons, useDebouncedValue
│   ├── components/                  # Toolbar, TypeTabs, FilterBar, PeopleGrid, ...
│   └── app.css                      # Tailwind + a few non-utility rules
├── WebUI/dist/                      # built bundle (git-ignored): people.bundle.js + .css
```

## Requirements

1. Jellyfin server 12 (`JellyfinVersion` in the `.csproj` tracks Dashboard > About).
2. **File Transformation** plugin installed
   (https://github.com/IAmParadox27/jellyfin-plugin-file-transformation).
3. Node 24 + pnpm 10 to rebuild the front end (TypeScript + Tailwind v4).
4. .NET 10 SDK to rebuild the DLL.

Styling: Tailwind v4, CSS-first config in `app.css` (`@theme` tokens, utilities
nested under `#peoplePage` so nothing leaks; no preflight import so
Jellyfin's own CSS is untouched). Run `pnpm run typecheck` for the TS check.

## Build

```powershell
# 1. Front end
cd WebUI
pnpm install
pnpm run build   # → dist\people.bundle.js + dist\people.bundle.css (pnpm run watch for dev)

# 2. Plugin (from the project root)
cd ..
dotnet build -c Release
# → bin\Release\net10.0\Jellyfin.Plugin.JellyfinPeopleDiscoveryPlugin.dll
```

## Install

Copy the DLL to `<jellyfin-data>\plugins\JellyfinPeopleDiscoveryPlugin\`,
restart Jellyfin, hard-refresh the web client (`Ctrl+Shift+R`), open `#/people`.

Verify injection directly (no browser needed):

```powershell
(Invoke-WebRequest http://localhost:8096/web/index.html -UseBasicParsing).Content.Contains('__JF_PEOPLE_BUNDLE__')
# → True
```

Server log should show:

- `People Discovery: registered index.html transformation.`

## Updating the injected JS without rebuilding the DLL

Drop edited copies here (bundle + CSS):

```text
<jellyfin-data>/plugins-data/People Discovery/people.bundle.js
<jellyfin-data>/plugins-data/People Discovery/people.bundle.css
```

They take effect on the next page load (hard-refresh the browser).

## Notes for maintainers

- Safety model (do not regress this): the UI lives in `#jfPeopleMount`, a
  fixed overlay attached to `<body>`, fitted at runtime between the app
  header and bottom nav. We **never hide, restyle, or annotate Jellyfin's
  own nodes** — inline `display:none` on React-managed pages desyncs React
  and blanks other pages. Off-route we are one hidden node + read-only
  observers. All custom CSS is scoped to `#peoplePage` / `#jfPeopleMount`.
- File Transformation integration details that already bit once:
  `fileNamePattern` must be the plain string `index.html` (its matcher does
  not treat `index\.html$` as expected), and the callback **must return the
  raw new file text as `string`** — it is read via `Invoke(...) as string`,
  so any non-string return is silently discarded.
- v12 removed `MediaBrowser.*` NuGet packages (use `Jellyfin.*`, the old
  namespaces arrive transitively) and removed `IApplicationHost` /
  `IServerApplicationHost` / `IPluginServiceRegistrator`, so registration
  runs from a retry loop in the plugin constructor.
- If two copies ever load (old `PeoplePage` plugin + this one), remove the
  old `plugins\PeoplePage\` folder. The bundle also guards with
  `window.__JF_PEOPLE_BUNDLE__`.
