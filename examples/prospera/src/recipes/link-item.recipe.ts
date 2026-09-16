import type { ContentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Content template for a **virtual link item** — a curated link record
 * whose fields mirror the defaults every page template carries
 * (`page@1`: Title for the label, MetaDescription for the supporting
 * line, OgImage for the thumbnail) PLUS the one thing a page cannot
 * express: an explicit `Url` general-link, so EXTERNAL destinations
 * (status pages, app stores, partner portals) can be curated anywhere
 * internal pages can.
 *
 * **Why this exists.** Link-driven components (`quick-links-tiles@1`'s
 * `Tiles`, `link-list-content@1`'s `Items`) accept PAGE items directly
 * — the tile/row reads the page's own Title / MetaDescription /
 * OgImage and links to the page's URL. A Link Item is the same
 * contract for destinations that are NOT pages in this site: same
 * title/description/thumbnail/icon surface, plus the free-form Url.
 * Renderings treat both sources identically.
 *
 * **Not** `link-list-item@1` (whose label lives on the Link field and
 * whose Title is an optional topic label) and **not** `nav-item@1`
 * (which carries mega-menu panel concerns). This template is the
 * page-aligned shape: Title is the canonical label, Url is a pure
 * destination.
 *
 * Field names mirror the readers in
 * `quick-links-tiles.tsx` (`resolveTileEntry`) and `link-list.tsx`
 * (`resolveLinkTargetEntry`) exactly — scai hashes each name into a
 * deterministic field GUID and the React side reads from those names
 * via the layout-service `fields` object. Don't rename without
 * updating both sides.
 *
 * Shared instances live in the site-scope `Site Shared UI/Links`
 * pool (declared on `quick-links-tiles@1`'s datasource locations,
 * following the `Site Shared UI/Avatars` / `Authors` precedent).
 */
export const linkItemRecipe = {
  kind: "content-template",
  schemaVersion: "1",
  handle: "link-item@1",
  name: "link-item",
  displayName: "Link Item",
  description:
    "Virtual link record — page-aligned fields (Title, Description, Thumbnail, IconName) plus an explicit Url general-link for external or off-site destinations. Curate wherever pages can be linked (quick-links tiles, link lists).",

  fields: [
    {
      name: "Title",
      shape: "text",
      default: "Learn more",
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "Link label — plays the role a page's Title plays for internal links.",
        sortOrder: 100,
      },
    },
    {
      name: "Description",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Optional one-line supporting description — the MetaDescription equivalent. Rendered where the consuming component shows descriptions (quick-links grid tiles, link-list IconLed rows).",
        sortOrder: 200,
      },
    },
    {
      name: "Thumbnail",
      shape: "image",
      sitecore: {
        type: "image",
        hint: "Optional thumbnail/pictogram — the OgImage equivalent. Used when the consuming component renders an image (quick-links tiles fall back to it when IconName is empty or unknown).",
        sortOrder: 300,
      },
    },
    {
      name: "IconName",
      shape: "enum",
      sitecore: {
        enumHandle: "icon-name@1",
        hint: "Named vector icon from the shared icon-name@1 vocabulary (~80 semantic names like bill, globe, sign-in, location). Preferred over Thumbnail where the consumer renders icons — crisp at any size and theme-colored.",
        sortOrder: 400,
      },
    },
    {
      name: "Url",
      shape: "link",
      // The URL half is `/` on purpose — scai encodes a `#` URL as
      // linktype="anchor" WITHOUT the `anchor` attribute the Layout
      // Service builds hrefs from, so the SV arrived as href:"" and the
      // link rendered blank (see cta-button.recipe.ts diagnosis).
      default: "Learn more|/",
      sitecore: {
        type: "general-link",
        required: true,
        hint: "Destination URL — external links welcome (this is the reason a Link Item exists instead of linking a page directly).",
        sortOrder: 500,
      },
    },
  ],
} satisfies ContentTemplateRecipe;

export default linkItemRecipe;
