import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for the `AvatarBlock` component (./avatar-block.tsx).
 *
 * **Compatible datasources — two CONTENT templates, no inline fields.**
 * The rendering itself carries no fields; it accepts either of two
 * shared content templates via `datasource.templates` (the same
 * pattern as `link-list@1`):
 *
 *   1. `avatar-item@1` — the PRIMARY shape (first in the list —
 *      `datasource.templates[0]` is what scai materialises for
 *      scoped/local datasource slots): the focused avatar trio
 *      (Name, Description, Image) as a standalone content template
 *      (`src/content/registry/models/avatar-item.recipe.ts`). Pick
 *      for ad-hoc attributions: testimonial bylines, team tiles,
 *      fictional personas — anywhere the full Author surface would
 *      be noise.
 *
 *   2. `author@1` — the shared Author person template (full profile:
 *      role, bio, contact, socials —
 *      `src/content/registry/models/author.recipe.ts`). Pick when the
 *      avatar is a real attributed person who also lives elsewhere on
 *      the site as an Author entity.
 *
 * Author is a superset of the avatar concerns; this rendering only
 * reads the avatar-relevant subset (AuthorName → name, About →
 * description, Avatar → image). The `.sitecore.ts` adapter normalises
 * whichever field shape arrives — including the nested
 * `{id, fields: {…}}` linked-item envelope when the item comes in via
 * a reference field. Renderings that need the richer author surface
 * (profile pages, full bylines) declare their own adapter against
 * `author@1`.
 *
 * **Insert options / folder scoping.**
 *
 *   - Page scope: the page-local `Data/Avatars` subfolder is for
 *     Avatar Items ONLY (`allowedTemplates`). Authors are shared,
 *     site-level content — they never belong in a page's Data folder.
 *     NOTE (scai, as of 0.32.x): the page-scope `allowedTemplates`
 *     allow-list is declared here for intent and forward-compat, but
 *     scai's page compiler currently derives a page Data folder's
 *     Insert Options from the UNION of `datasource.templates[]`
 *     across placements (`compile/page.ts` →
 *     `collectPageDataInsertOptions`), ignoring per-location
 *     allow-lists — and writes them with a `CreateOnly` SetField, so
 *     folders that predate a recipe update keep their stale options
 *     ("Field already set; CreateOnly policy preserves CMS edits").
 *     Both need scai-side fixes; the declaration below is the correct
 *     recipe-side contract for when they land.
 *
 *   - Site scope: TWO shared pools under the site content root —
 *     `Site Shared UI/Avatars` (Avatar Items) and
 *     `Site Shared UI/Authors` (Authors). Each folder conforms to a
 *     per-location Data Folder template whose `__Standard Values`
 *     Insert Options carry that location's allow-list; those
 *     SetFields are CreateAndUpdate, so re-pushing the recipe DOES
 *     refresh site-level insert options on existing tenants.
 *
 * The React component is a single export — no rendering variants.
 */
export const avatarBlockRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "avatar-block@1",
  icon: componentIcons["avatar-block@1"],
  name: "avatar-block",
  displayName: "Avatar",
  description:
    "Person/profile avatar with name, description, and image. Accepts a focused Avatar Item (avatar-item@1, primary) or a full Author (author@1) as compatible datasources.",

  section: { handle: "ui-section@1" },

  variants: [{ name: "Default" }],

  params: [
    {
      // Shared with every other component's Size param via `size@1`.
      // No `default:` override — the enum's own default (`default`)
      // cascades through, and AvatarBlock maps `default` to its
      // natural default size (`md`).
      name: "Size",
      shape: "enum",
      sitecore: {
        enumHandle: "size@1",
        hint: "Avatar size.",
        sortOrder: 100,
      },
    },
    {
      // Shared with avatar-layout@1. Like Size, the enum's own default
      // (`default`) cascades through and the component maps it to its
      // natural `row` layout.
      name: "Layout",
      shape: "enum",
      sitecore: {
        enumHandle: "avatar-layout@1",
        hint: "Avatar above (stack) or beside (row) the text.",
        sortOrder: 200,
      },
    },
  ],

  datasource: {
    // Two compatible CONTENT templates at the rendering level — scai
    // pipe-joins their GUIDs into the rendering's `Datasource Template`
    // shared field, so the picker surfaces items of either type. The
    // FIRST entry is the primary shape (used for scoped/local slot
    // materialisation). Per-location `allowedTemplates` below narrows
    // which template is creatable in each scope.
    templates: [{ handle: "avatar-item@1" }, { handle: "author@1" }],
    // No auto-create: with multiple compatible templates the compiler
    // can't pick one unambiguously. Dropping the rendering opens the
    // datasource picker so the author chooses Avatar Item vs. Author
    // intentionally.
    autoCreate: false,
    openPropertiesAfterAdd: false,
    locations: [
      // Page-local avatars (testimonials, ad-hoc bylines) — Avatar
      // Items only. Authors are site-level shared content and must not
      // be creatable inside a page's Data folder.
      {
        scope: "page",
        subfolder: "Avatars",
        allowedTemplates: [{ handle: "avatar-item@1" }],
      },
      // Shared site-level Avatars pool — reusable Avatar Items shared
      // across pages.
      {
        scope: "site",
        subfolder: "Site Shared UI/Avatars",
        allowedTemplates: [{ handle: "avatar-item@1" }],
      },
      // Shared site-level Authors pool — real attributed people live
      // here once and get reused across pages (and by other
      // author-aware renderings, e.g. article-header's byline).
      {
        scope: "site",
        subfolder: "Site Shared UI/Authors",
        allowedTemplates: [{ handle: "author@1" }],
      },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default avatarBlockRecipe;
