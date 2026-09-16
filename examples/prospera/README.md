# ZE Showcase Starter

SitecoreAI Content SDK Next.js (App Router) head application, plus the scai recipes that install the showcase site structure into a SitecoreAI tenant.

Official SDK docs: [SitecoreAI Content SDK](https://doc.sitecore.com/sai/en/developers/content-sdk/sitecore-content-sdk-for-sitecoreai.html)

This README is the **from-zero** path: a clean Sitecore Cloud Portal organization, an empty authoring environment, a Start from scratch site, this head app as the editing host, scai CLI connected, and recipes pushed.

---

## What you are installing

Two repositories, two jobs:

| Repo | Role |
|------|------|
| [ze-organization/ze-showcase](https://github.com/ze-organization/ze-showcase) | **Authoring / CMS** — SitecoreAI CM solution (`authoring/`, `sitecore.json`, `xmcloud.build.json`). Deploy this first. It does not contain the Next.js app. |
| [ze-organization/ze-showcase-starter](https://github.com/ze-organization/ze-showcase-starter) (this repo) | **Head app + recipes** — Next.js Content SDK app, Page Builder components, and `src/recipes/*.recipe.ts`. Connect this as the **editing host**, then push recipes with scai. |

Recipes do **not** deploy when you `pnpm run build`. They reach Sitecore only through scai (`scai provision recipe push` or the MCP `recipe_push` tool).

Canonical names this repo expects (use them on a clean instance unless you also change scai config):

| Thing | Value |
|-------|--------|
| Site name | `starter` |
| Site collection | `starter-collection` |
| Editing host / `renderingHosts` key | `starter` (see `xmcloud.build.json`) |
| scai environment profile | `ze-starter` (local name; you can pick another) |
| Default language | `en` |
| Additional languages | `fr-FR`, `de-DE`, `es-ES`, `ar-SA` (Sitecore culture names; recipe defaults use `fr` / `de` / `es` / `ar` and scai fans them onto these variants. `ar-SA` is RTL.) |

---

## Prerequisites

- Sitecore Cloud Portal access as **Organization Admin** or **Organization Owner**
- GitHub access to fork (or clone) both repos above
- Node.js **24.10.x** (matches `xmcloud.build.json`)
- [pnpm](https://pnpm.io) **11.4.0** (`packageManager` in `package.json`)
- A browser for the scai device-code login (recipe writes need an **interactive** login, not machine credentials)

---

## 1. Fork or clone the two repos

Do this in **your** GitHub org so SitecoreAI Deploy can read them.

```bash
# Authoring (CMS)
git clone https://github.com/ze-organization/ze-showcase.git
# or: fork it, then clone your fork

# Head app (this repo)
git clone https://github.com/ze-organization/ze-showcase-starter.git
# or: fork it, then clone your fork
```

You will point Deploy at the **GitHub remotes**, not only at local clones. The local clone of this repo is what you run scai from later.

---

## 2. Connect GitHub to SitecoreAI Deploy

1. Open [Sitecore Cloud Portal](https://portal.sitecorecloud.io) and switch to the target organization.
2. Open **SitecoreAI Deploy** (`https://deploy.sitecorecloud.io/`).
3. Connect GitHub if it is not already connected: **Connections** (or during project create, **Add GitHub account**).
4. Grant the Deploy app access to the org that holds your forks (read metadata, read/write code as required by your org policy). See [source control connections](https://doc.sitecore.com/sai/en/developers/sitecoreai/deploying-sitecoreai/deploy-app/manage-connections-for-source-control-and-hosting-providers.html).

New projects use **decoupled deployment** by default: authoring (CM) and the editing host are separate environments and can use **different repositories**. That is the model this pair of repos is built for.

---

## 3. Create the project and deploy the authoring environment

Use **your own code**, not the Sitecore starter kit. The authoring source is **ze-showcase**.

1. In Deploy, click **Projects** → **Create project**.
2. Name the project (for example `ZE Showcase`).
3. Under source code setup, choose **Use your own code**. Click **Continue**.
4. **Authoring environment**
   - Name: for example `dev` or `Getting Started`.
   - Repository: the **ze-showcase** fork (CMS repo), branch `main` (or whatever you deploy from).
   - Leave **Production SaaS SLA** off unless this really is production (the setting cannot be changed later).
   - Turn **Auto deploy on push** on if you want CM rebuilds on every push to that branch.
5. **Editing host (optional on this screen)**  
   You can skip it here and add it in step 5 after the site exists. If you set it now:
   - **Editing host name** must be exactly `starter` (the key in this repo’s `xmcloud.build.json` → `renderingHosts`).
   - Repository: **ze-showcase-starter** (this head app), same branch you will develop on.
6. Click **Start deployment**.

Provisioning takes several minutes. Watch the deployment log until the authoring environment is **Complete**. If it fails, open the log, fix the authoring repo or connection, and rerun.

When it succeeds, the environment appears as an app in Cloud Portal. You still have **no site** until the next step.

---

## 4. Create a Start from scratch site

Recipes bind to an existing SXA Headless site. They do **not** create the Sitecore site. Create an empty site first.

1. From Deploy, open the environment → **Open app**, or go to `https://app.sitecorecloud.io`.
2. In the left nav, open **Channels**.
3. Click **Create site** (or **Create your first site**).
4. Choose the **empty / Start from scratch** template (not **Basic**).  
   Sitecore’s empty template is a Home page with empty placeholders. Basic Site ships extra pages and components you would have to tear down before this showcase’s recipes land.
5. Name the site **`starter`**.
6. Collection: create **`starter-collection`** (type the name and click **Create starter-collection**).
7. Languages: keep **English (`en`)** as the default unless you already know you need more.
8. Click **Create** and wait until the site tile appears (up to a couple of minutes).

If you use different names, you must pass the same names to scai (`--site` / `--site-collection`) in step 7. Page recipes use `{site}` in `itemPath`; scai substitutes the profile’s site name.

---

## 5. Install this head app as the editing host

Page Builder needs a hosted Next.js app that matches this codebase. Add it as a Sitecore-managed editing host.

1. In Deploy, open the project → **Editing hosts** → **Add editing host**.
2. **Editing host name:** `starter`  
   This **must** match `renderingHosts.starter` in `xmcloud.build.json`.
3. **Link to authoring environment:** the environment from step 3.
4. Source control: GitHub → your **ze-showcase-starter** repo → branch (usually `main`).
5. Enable **Auto deploy on push** if you want editing-host rebuilds on push.
6. Save. Deploy starts automatically. Wait until the editing host deployment is **Complete**.

If you already attached this repo during project create, skip this step and confirm the host name is `starter`.

---

## 6. Clone this repo locally and install packages

```bash
git clone https://github.com/ze-organization/ze-showcase-starter.git
cd ze-showcase-starter
pnpm install
```

Do not commit `.env.local`, `sitecoreai.cli.json`, or `.cursor/mcp.json`. They are gitignored and machine-specific.

---

## 7. Connect the scai CLI

scai (`@sitecoreai-labs/sitecoreai-cli`, binary `scai`) is already a dependency of this repo. Run it from the **repo root** so it finds `sitecoreai.cli.json` once that file exists.

### 7.1 Fast path — guided bootstrap (recommended)

After the authoring environment is healthy **and** the `starter` site exists:

```bash
pnpm exec scai setup bootstrap --wizard
```

Follow the prompts. The wizard, in order:

1. **init** — creates `sitecoreai.cli.json` and an env profile (use `ze-starter` to match comments in this repo, or another name).
2. **policy** — enrolls that environment in the local workspace allowlist (`~/.sitecoreai/policy.json`).
3. **login** — browser device flow. Sign in with the same Cloud Portal user that can write to the environment.
4. **client** — mints an env-scoped CM automation client (stored in the OS keychain).
5. **site** — pick **`starter`**. scai discovers `starter-collection` and derives recipe roots.
6. **assets** — can write `.env.local` from the environment (you can `--skip-assets` if you prefer to copy Developer Settings yourself in step 9).
7. **push** — applies the recipe glob. On a **first** install you usually want this. To connect first and push later:  
   `pnpm exec scai setup bootstrap ze-starter --skip-push`

Consent prompts appear unless you pass `--yes`.

### 7.2 Manual path (same result, step by step)

```bash
# Create the profile (wizard picks org / project / environment)
pnpm exec scai setup init --wizard -n ze-starter --allow-write --set-default --site starter --site-collection starter-collection

# Interactive login (required for recipe writes — do not use --use-client-credentials here)
pnpm exec scai setup login -n ze-starter

# Mint the CM automation client
pnpm exec scai setup client create ze-starter

# Confirm
pnpm exec scai setup status
pnpm exec scai doctor
```

`sitecoreai.cli.json` is created locally. A working profile looks like this (ids and host will be **your** environment, not these placeholders):

```json
{
  "$schema": "https://schemas.sitecoreai.dev/v1/sitecoreai.cli.json",
  "recipes": [
    "src/recipes/**/*.recipe.ts",
    "!src/recipes/starter-site-template.recipe.ts"
  ],
  "envProfiles": {
    "ze-starter": {
      "organizationId": "org_…",
      "projectId": "…",
      "environmentId": "…",
      "environmentType": "cm",
      "host": "xmc-….sitecorecloud.io",
      "authority": "https://auth.sitecorecloud.io",
      "allowWrite": true,
      "site": "starter",
      "siteCollection": "starter-collection"
    }
  },
  "defaultEnvProfile": "ze-starter"
}
```

The `recipes` glob is important: it includes every `*.recipe.ts` under `src/recipes/` and **excludes** `starter-site-template.recipe.ts`. That file is a catalog for authors, not something to push onto a tenant that already has a site.

If `init` did not persist site names, set them when you push, or re-run init with `--site starter --site-collection starter-collection`. You can print the derived Sitecore paths with:

```bash
pnpm exec scai provision recipe roots --site starter --site-collection starter-collection -n ze-starter --json
```

### 7.3 Login rules that matter for recipes

- Use **interactive** `scai setup login` (browser). Machine / m2m credentials (`--use-client-credentials`) are for CI and agents; they **cannot** apply recipe writes.
- `scai doctor` should be clean before you push.
- If a command returns `AUTH_REQUIRED` or `POLICY_DENIED`, run `pnpm exec scai setup login -n ze-starter` again and `pnpm exec scai policy show`.

---

## 8. Push recipes into the environment

This is what turns the empty Start from scratch site into the showcase (templates, renderings, partials, page designs, sample pages, dictionaries, media).

### 8.1 Dry-run first

```bash
pnpm exec scai provision recipe push -n ze-starter --what-if
```

This compiles the glob and plans against the tenant. It does not mutate. Review the plan for unexpected deletes or path mismatches (wrong `site` / `siteCollection` is the usual cause).

### 8.2 Apply

```bash
pnpm exec scai provision recipe push -n ze-starter --allow-write
```

The first push compiles and applies a large set. Expect it to take a while. Re-runs are incremental.

Useful variants:

```bash
# One recipe
pnpm exec scai provision recipe push -i src/recipes/homepage-demo.recipe.ts -n ze-starter --allow-write

# English only (faster first content pass; re-push later for other locales)
pnpm exec scai provision recipe push -n ze-starter --allow-write --languages en

# Add French / German / Spanish / Arabic (Sitecore culture names; registers them if missing)
pnpm exec scai provision recipe push -n ze-starter --allow-write --languages en,fr-FR,de-DE,es-ES,ar-SA --provision-languages

# After a successful first push, drop leftover SXA Headless OOTB folders
pnpm exec scai provision recipe prune-defaults -n ze-starter --what-if
pnpm exec scai provision recipe prune-defaults -n ze-starter --allow-write
```

Do **not**:

- Push `kind: "site"` recipes (this tenant already has `starter`).
- Push `starter-site-template.recipe.ts` (already excluded by the glob).
- Expect `pnpm run build` or the editing-host deploy to install recipes.

### 8.3 From Cursor (MCP)

After step 10, you can ask the agent to dry-run then apply with MCP `recipe_push` (`allowWrite: true` only after you approve). That is the same executor as the CLI.

---

## 9. Connect the Next.js app to the environment

### 9.1 Environment variables

In Deploy: project → authoring environment → **Developer settings**.

1. Set the context switcher to **Preview** (local and editing-host work need drafts).
2. Choose site **`starter`**.
3. SDK: **Content SDK** (this app is `@sitecore-content-sdk/nextjs` 2.1.x).
4. Copy the sample `.env` block.

In this repo:

```bash
cp .env.remote.example .env.local
```

Paste the copied values. At minimum set:

| Variable | Where it comes from |
|----------|---------------------|
| `SITECORE_EDGE_CONTEXT_ID` | Preview Context ID (Developer settings / Details) |
| `NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID` | Same Preview ID for local; for production client calls use a [scoped Context ID](https://doc.sitecore.com/portal/en/developers/sitecore-cloud-portal/manage-context-ids.html) |
| `NEXT_PUBLIC_DEFAULT_SITE_NAME` | `starter` |
| `NEXT_PUBLIC_DEFAULT_LANGUAGE` | `en` |
| `SITECORE_EDITING_SECRET` | Developer settings / editing secret |
| `SITECORE_ENUMERATIONS_ROOTS` | After recipes exist: `/sitecore/content/starter-collection/starter/Presentation/Enumerations` |

If bootstrap already wrote `.env.local`, merge rather than overwrite, and still set `SITECORE_ENUMERATIONS_ROOTS` after the first recipe push.

Never commit `.env.local`.

### 9.2 Run locally

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000). After a successful recipe push you should see the showcase Home (and other recipe pages), not an empty Start from scratch Home.

`pnpm run dev` regenerates `.sitecore/component-map.ts` and `.sitecore/component-map.client.ts` from `src/components/`. Do not edit those maps by hand.

### 9.3 Map the site to the editing host (Page Builder)

In SitecoreAI, open **Channels** → site **starter** → site settings / site host, and confirm it uses the **`starter`** editing host from step 5. Then open **Page builder** on Home. You should get this Next.js app in the canvas, not a blank or default host.

If the canvas 404s, confirm the editing-host deploy succeeded and `NEXT_PUBLIC_DEFAULT_SITE_NAME` on that host is `starter`.

---

## 10. Connect scai to Cursor (optional, for agents)

`.cursor/mcp.json` is gitignored. Create it in this repo after `sitecoreai.cli.json` exists:

```json
{
  "mcpServers": {
    "scai-ze-starter": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "--no-install",
        "scai",
        "mcp",
        "serve",
        "--environment-name",
        "ze-starter"
      ]
    }
  }
}
```

Use the same `--environment-name` as `defaultEnvProfile`. Restart Cursor (or reload MCP) so the `scai-ze-starter` server comes up.

Then, in this workspace:

- `scai_overview` — bound env, credentials, tool list
- `access_check` — if a tool fails auth or policy
- `recipe_push` — same as `scai provision recipe push` (set `whatIf: true` first)

Login, client minting, and secrets stay **human-terminal-only** (`scai setup login`, `scai setup client create`). The MCP server will not mint those for you.

---

## Day-to-day after the first install

| Goal | Command |
|------|---------|
| Pull latest head app | `git pull` then `pnpm install` |
| Local site | `pnpm run dev` |
| Re-login when tokens expire | `pnpm exec scai setup login -n ze-starter` |
| See what recipes would change | `pnpm exec scai provision recipe push -n ze-starter --what-if` |
| Apply recipe changes | `pnpm exec scai provision recipe push -n ze-starter --allow-write` |
| Authoring CM code | change **ze-showcase**, push, wait for the authoring deploy |
| Head / components | change **this** repo, push, wait for the **editing host** deploy (or run locally) |

Recipe authoring conventions live in [`.agents/skills/create-site-recipe/SKILL.md`](.agents/skills/create-site-recipe/SKILL.md). App Router guardrails: [`AGENTS.md`](AGENTS.md).

---

## Troubleshooting

**Authoring deploy failed**  
Confirm Deploy is pointed at **ze-showcase** (CMS), not this Next.js repo. The authoring repo must have `sitecore.json`, `xmcloud.build.json`, and `authoring/`.

**Editing host name rejected or host never builds**  
The name must be `starter`, matching `xmcloud.build.json` → `renderingHosts`. The editing-host repo must be **this** head app.

**Recipe push cannot find the site / wrong paths**  
Site in Channels must be `starter` under `starter-collection`, and the scai profile must use those names. Run `scai provision recipe roots …` and compare to Content Editor.

**`AUTH_REQUIRED` / writes blocked**  
Interactive `scai setup login -n ze-starter`. Do not use client-credentials for recipe apply. Check `scai policy show` and `scai doctor`.

**Page Builder shows empty Home after push**  
Confirm you used Start from scratch (not a leftover Basic site), the push finished without rolling back, and the site’s editing host is `starter`. Hard-refresh Pages.

**Localhost has no content**  
Preview Context ID in `.env.local`, `NEXT_PUBLIC_DEFAULT_SITE_NAME=starter`, recipes actually applied, `pnpm run dev` from repo root.

**Enum params show GUIDs instead of names**  
Set `SITECORE_ENUMERATIONS_ROOTS` and restart `pnpm run dev` so `predev` can write `.sitecore/enum-manifest.json`.

---

## Commands (this head app)

```bash
pnpm install
pnpm run dev          # generate maps + Next.js
pnpm run build
pnpm run start
pnpm run lint
```

Copy `.env.remote.example` → `.env.local` for a remote SitecoreAI environment. Never commit `.env`, `.env.local`, or `sitecoreai.cli.json`.
