# Showcase Verticals

FEDE-shaped SitecoreAI / XM Cloud monorepo: **CM authoring + Prospera editing host in one repo**, deployable as a single SitecoreAI project.

> Org/env unbound — connect any organization and environment in Deploy. Serialized items are Prospera (`starter-collection`) content + Project-scoped templates/layout/media; they are not hard-wired to a specific org ID.

## Layout

```
showcase-verticals/
├── authoring/                 # CM platform + SCS modules/YAML
│   ├── platform/              # Platform.csproj (buildTargets)
│   ├── items/                 # *.module.json + ~22k serialized YAML
│   └── XmCloudAuthoring.sln
├── examples/
│   └── prospera/              # Enabled rendering / editing host (pnpm)
├── sitecore.json              # DevEx serialization root
├── xmcloud.build.json         # CM + renderingHosts map (Deploy entrypoint)
├── nuget.config
└── sitecoreai.cli.json.example  # Optional local scai profile (copy → sitecoreai.cli.json)
```

No root `package.json` / workspace — same as FEDE. Each `examples/*` app is its own Node package.

## Deploy to SitecoreAI / XM Cloud

1. **Create or open a SitecoreAI project** and connect this GitHub repository.
2. Deploy uses root [`xmcloud.build.json`](./xmcloud.build.json):
   - Builds CM from `./authoring/platform/Platform.csproj`
   - Builds and runs the **prospera** rendering host from `./examples/prospera` (`pnpm`, scripts `build` / `next:start`)
3. After first deploy, set environment variables on the editing host (Edge context ID, site name, editing secret, etc.). See [`examples/prospera/.env.remote.example`](./examples/prospera/.env.remote.example).
4. Serialized items under `authoring/items` are included via `sitecore.json` modules (`authoring/items/**/*.module.json`) and deploy with CM.

### Rendering host (local)

```bash
cd examples/prospera
pnpm install
cp .env.remote.example .env.local   # fill values for your environment
pnpm run dev
```

### Optional local Sitecore CLI / scai

```bash
dotnet tool restore                  # from repo root (.config/dotnet-tools.json)
cp sitecoreai.cli.json.example sitecoreai.cli.json
# edit sitecoreai.cli.json with YOUR org / project / environment IDs
```

`sitecoreai.cli.json` is gitignored — do not commit org-specific IDs or automation client credentials.

## Serialization coverage

Single module: `authoring/items/items/prospera/prospera.module.json` (`Project.prospera`).

Includes (module-scoped, not entire CM):

| Include | Sitecore path |
|---------|----------------|
| Content | `/sitecore/content/starter-collection` |
| Templates | `/sitecore/templates/Project` |
| Branches | `/sitecore/templates/Branches/Project` |
| Renderings | `/sitecore/Layout/Renderings/Project` |
| Placeholders | `/sitecore/Layout/Placeholder Settings/Project` |
| Layouts | `/sitecore/Layout/Layouts/Project` |
| Settings | `/sitecore/system/Settings/Project` |
| Media | `/sitecore/media library/Project` |

Not included: Feature media, SPE script libraries, roles/security, Forms outside these paths, or other site collections.

## Reference

Modeled after [ze-fede-fork](https://github.com/ze-organization/ze-fede-fork) (CM + enabled `examples/*` host, root `xmcloud.build.json`).
