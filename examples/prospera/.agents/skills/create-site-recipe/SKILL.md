---
name: create-site-recipe
description: Author Sitecore site structure as recipes in src/recipes/. Use when adding a page template, an insertable type (Insert → Article), page design, page recipe, partial design, site template, or when scaffolding Sitecore page structure. Copy the Article stack for insertable types. For a React rendering use content-sdk-component-scaffold.
---

# Create a site / page recipe

Structural recipes live **flat** at `src/recipes/<kebab>.recipe.ts`. scai globs that path; nested `experiences/` folders are not picked up.

Copy the matching reference file. Do not reconstruct shapes from memory.

| Kind | `kind` | Type import | Copy this |
|------|--------|-------------|-----------|
| Page template | `page-template` | `@sitecoreai-labs/sitecoreai-cli/recipe` | `src/recipes/page.recipe.ts` |
| Insertable type (Article, …) | `page-template` + `page-design` + `partial-design` | `@sitecoreai-labs/sitecoreai-cli/recipe` | `article.recipe.ts` + `article-page.recipe.ts` + `article-details-partial.recipe.ts` (+ `article-details.recipe.ts` for the rendering) |
| Page design | `page-design` | `@sitecoreai-labs/sitecoreai-cli/recipe` | `src/recipes/standard-page.recipe.ts` |
| Page | `page` | `@sitecoreai-labs/sitecoreai-cli/recipe` | `src/recipes/homepage-demo.recipe.ts` |
| Partial design | `partial-design` | `@sitecoreai-labs/sitecoreai-cli/recipe` | `src/recipes/header-brand-nav.recipe.ts` |
| Site template | `site-template` | `@sitecoreai-labs/sitecoreai-cli/recipe/unstable` | `src/recipes/starter-site-template.recipe.ts` |
| Dictionary | `dictionary` | `@sitecoreai-labs/sitecoreai-cli/recipe` | `src/recipes/ai-chat-ui-labels-composer.recipe.ts` |
| Site | `site` | `@sitecoreai-labs/sitecoreai-cli/recipe/unstable` | Do **not** add unless provisioning a **new** Sitecore site. This tenant already has `starter`. |

Handle form: `<kebab>@<major>` (e.g. `standard-page@1`). Type-only imports from scai; **value imports relative, never `@/*`**. End every file with `satisfies <Kind>Recipe` — never `as`.

Page-design, partial-design, and page-template recipes must set `thumbnail` via `src/recipes/_wireframe-thumbnail.ts` (`pageDesignThumbnail` / `partialDesignThumbnail` / `pageTemplateThumbnail`). PNG lives under `src/recipes/media/wireframes/page-designs/` or `partial-designs/`. Page templates reuse the matching page-design PNG (hub listing types share `Hub_Page_Template.png`). Paths are repo-root relative. Do not add `thumbnail` on `kind: "site-template"` unless you intend the Sites picker card.

## Composition graph

```
PartialDesign ─┐
               ├─▶ PageDesign ──▶ PageTemplate ──▶ Page
Dictionary ────┘                         ▲
                                         │
SiteTemplate (pageTemplates, pageDesigns, templatesToDesigns, insertOptionsMatrix)
```

- **Page template** — fields on the page item (`page@1` is Title / Eyebrow / SEO / OG / Twitter / Sitemap / JSON-LD). Most marketing content lives on rendering datasources. An **insertable type** (`article@1`) adds type-specific page fields (dek, body, lead image) so Insert → Article is already a real page.
- **Page design** — chrome + body shell. `appliesTo` binds templates; `partials` lists the designs that fill `headless-header` / `headless-main` / `headless-footer`. `standard-page@1` is header + footer + a Container in `layout`. An insertable type puts the **body in a partial**, not in page-design `layout`.
- **Page** — one URL. `itemPath` starts with `/sitecore/content/{site}/`. Marketing pages use `template: "page@1"` and `container1Layout(...)` (Container on `headless-main` in FINAL). Insertable children use `template: "article@1"` (etc.) and `pageDesign: "article-page@1"`; page fields feed the details component.

## When to add which kind

| Want | Add | Do not |
|------|-----|--------|
| Another marketing URL | Page recipe (copy `homepage-demo`) | A new page template |
| Different chrome (full-bleed, no container, other header) | Page design; `appliesTo: ["page@1"]` unless fields differ | Grow `page@1` |
| Extra fields **on the page item** (event date, location) | New page template + a page design `appliesTo` that handle | Edit `page@1` |
| Article / product / service **listing** | Page recipe on `page@1` + `standard-page@1` placing a list-grid | A listing page template |
| **Insertable type** (Insert → Article under a listing) | Page template + body **partial** + page design (copy the Article stack below) | Grow `page@1`; put the body in page-design `layout` or a top-level `container-1` key |
| Wildcard detail (one layout, many slugs, `itemPath` ends in `/*`) | Content template + wildcard Page | An insertable type (those are one page item per URL) |
| New Sitecore site | `kind: "site"` (ask first) | Copy a showcase-site recipe onto this tenant |

## Insertable type (copy the Article stack)

This is the common “new template authors can insert” flow. `page@1` stays marketing. The new type exists because **insert options and the default layout** differ, not because SEO fields changed.

```
article@1                 page-template   SEO + ShortDescription / Content / Image
article-details-partial@1 partial-design  headless-main ← article-details@1 (kind: none)
article-page@1            page-design     appliesTo article@1
                                          partials: header-brand-nav@1,
                                                    article-details-partial@1,
                                                    footer-link-columns@1
                                          layout: { placeholders: {} }
articles@1                page            listing on page@1 + standard-page@1
```

1. **Page template** — copy `article.recipe.ts`. Keep the `page@1` SEO set. Add only the fields the details component reads from the **page item**. Set `insertOptions` to this handle so children of the type stay the type. Copy `thumbnail` (`pageTemplateThumbnail`) and add a matching PNG under `src/recipes/media/wireframes/page-designs/`.
2. **Details component** — recipe + rendering (not unfinished). `dynamicPlaceholders: true` and `placeholders` for in-column + full-width slots. `datasourceRef: { kind: "none" }` on the partial; the React component must `sitecorePassthrough` and merge `page.layout.sitecore.route.fields` (Layout Service does not fill an empty datasource). Inner slots use `<Placeholder name rendering>` like Container — never `AppPlaceholder` with an empty fallback map (that is the "missing React implementation" error on drop). Pages drop zones need Placeholder Settings whose key matches what SXA emits (`article-details-*-0-1`, not `article-details-1`).
3. **Body partial** — copy `article-details-partial.recipe.ts`. Place the details component on `headless-main` with **no outer Container**. Header/footer partials do not fill `headless-main`; without this third partial, Insert yields chrome-only pages. Copy `thumbnail` (`partialDesignThumbnail`) and add a PNG under `src/recipes/media/wireframes/partial-designs/`.
4. **Page design** — copy `article-page.recipe.ts`. `appliesTo` the new template. **Three partials, empty `layout`.** Do not pre-place Container / article-header / content-block on the design — those belong on marketing `page@1` via `container1Layout`, which this design does not have. Copy `thumbnail` (`pageDesignThumbnail`); the PNG is the same file the page template uses.
5. **Listing + insert options** — listing stays `page@1` + `standard-page@1`. `PageTemplateRecipe.insertOptions` is what children of **that type** can be (`article@1` → Article). `PageRecipe` has no such field. A listing on `page@1` cannot be Article-only from recipes without also offering Article under Home; patch the listing item after push. Author `insertOptionsMatrix` on the site template anyway (scai currently emits setup actions, not a live item patch). Nav Items Treelist is CreateOnly (`primary-nav-content@1`); add a `nav-item-*` recipe and patch the live treelist, do not re-push the nav content item.
6. **Site template** — append the new template/design to `pageTemplates` / `pageDesigns` / `templatesToDesigns` / `insertOptionsMatrix`.
7. Push with `SITECOREAI_RECIPE_SANDBOX=0` and an interactive scai login (`m2m` cannot write). Do not push `kind: "site"`.

## Layout model

```ts
layout: {
  placeholders: {
    "<placeholder-name>": [
      {
        componentHandle: "<kebab>@1",
        variant: "FullBleed",              // verbatim from that component's variants[]
        params: { MaxWidth: "wide" },      // enum values verbatim from enumHandle recipes
        datasourceRef:
          { kind: "shared", handle: "<content-item>@1" } |
          { kind: "scoped", slot: "Hero", fields: { Title: "…" } } |
          { kind: "none" },
      },
    ],
  },
}
```

- **`shared`** — chrome reused across pages (logo, nav).
- **`scoped`** — page-local body copy; scai materializes `<page>/Data/<slot>`.
- **`none`** — structural (container, splitter) **or** “use the current page” (article-details on a type partial).

Partial top-level keys must be root placeholders (`headless-header` / `headless-main` / `headless-footer`). Nest child slots on the shell component — never address `header-nav` or `container-1` at the page-recipe top level.

Pages labels `headless-main` as **Main**. That is the root body slot in `src/Layout.tsx`. Classic SXA `main` is unused; do not place content there and do not remove `headless-main`.

Marketing / hub listings: use `container1Layout(...)` from `_hub-grammar.ts`. That places `container@1` on `headless-main` in page **FINAL**. Leading FullBleed heroes / carousels nest in a **FullBleed** Container (same `container-{*}` slot, no max-width). The rest nest in a sibling **Default** Container (`/headless-main/container-{id}`). Do not drop seeded heroes on Main. Addressing `container-1` as a top-level page key orphans the stack — Pages shows empty Main and the components never render. The page-design SHARED Container is not enough.

Insertable types fill `headless-main` via a **partial** (details component, no outer Container). Their page recipes should use `layout: { placeholders: {} }` so leftover FINAL Container stacks do not linger.

## Rules that bite

1. Every `componentHandle`, `partials[]`, `appliesTo[]`, `template`, and `siteTemplate` must exist as a recipe in `src/recipes/`. `tsc` will not catch dangling handles.
2. Variants and enum param values are copied from the target component / enumeration recipe — never invented (`hero@1` variants are `FullBleed` / `Placeholders`, not `Default`).
3. Author SiteTemplate `pageTemplates` / `pageDesigns` / `templatesToDesigns` / `insertOptionsMatrix` / `dictionaries` even though scai currently drops most of them at install. Live binding today is PageDesign `appliesTo` plus `PageTemplateRecipe.insertOptions`.
4. `dictionaries` (and every other handle list) may only name recipes that exist in this repo.
5. `{site}` in `itemPath` is required and is one path segment at compile time; collection nesting is a deploy-profile concern.
6. Recipes reach Sitecore via scai / MCP `recipe_push`, not `npm run build`. Interactive login + `SITECOREAI_RECIPE_SANDBOX=0`; `m2m` callers cannot write.
7. Insertable types: body is a **partial** on `headless-main` with `kind: "none"`. Never put the details stack in page-design `layout` (that is how you get header/footer-only pages).

## Steps

1. Confirm no existing `src/recipes/<kebab>.recipe.ts` or handle collision.
2. Copy the reference file for that kind; adapt handle, name, and graph refs. For an insertable type, copy the four Article files (template, details rendering, body partial, page design) and append the site-template catalog.
3. Eyeball the handle graph against `src/recipes/*.recipe.ts`.
4. `npx tsc --noEmit`.
5. Tell the user the files, the handle graph, and that a live push is a separate scai/MCP step.

## OOTB stack in this repo

```
page@1                    page-template     src/recipes/page.recipe.ts
standard-page@1           page-design       src/recipes/standard-page.recipe.ts
  appliesTo: page@1
  partials: header-brand-nav@1, footer-link-columns@1
homepage-demo@1           page (site Home)  src/recipes/homepage-demo.recipe.ts
article@1                 page-template     src/recipes/article.recipe.ts
  insertOptions: article@1
article-page@1            page-design       src/recipes/article-page.recipe.ts
  appliesTo: article@1
  partials: header-brand-nav@1, article-details-partial@1, footer-link-columns@1
article-details-partial@1 partial-design    src/recipes/article-details-partial.recipe.ts
  headless-main: article-details@1 (placeholders article-details-{*} + article-details-full-width-{*})
articles@1                page (listing)    src/recipes/articles.recipe.ts
starter-site-template@1   site-template     src/recipes/starter-site-template.recipe.ts
```
