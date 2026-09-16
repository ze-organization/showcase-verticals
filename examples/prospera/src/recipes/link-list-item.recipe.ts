import type { ContentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Content template for a single link-list entry — one link with an
 * optional topic title. Used as the Treelist target on
 * `link-list-content@1`'s `Items` field, AND as a `children` insert
 * option so authors can create items as direct children of a LinkList
 * datasource (the same dual related-items / child-items pattern as
 * `accordion-block@1` / `accordion-item@1`).
 *
 * Field names mirror `LinkListItemFields` in `./link-list.tsx` exactly
 * — scai hashes each name into a deterministic field GUID and the
 * React side reads from those names via the layout-service `fields`
 * object. Don't rename without updating both sides.
 */
export const linkListItemRecipe = {
  kind: "content-template",
  schemaVersion: "1",
  handle: "link-list-item@1",
  name: "link-list-item",
  displayName: "Link List Item",
  description:
    "A single link entry — used by `link-list-content@1` as a Treelist target and as an insert-option child.",

  fields: [
    {
      name: "Title",
      shape: "text",
      default: {
        en: "Link label",
        ar: "تسمية الرابط",
        es: "Etiqueta del enlace",
        fr: "Libellé du lien",
        de: "Linkbeschriftung",
        da: "Linketiket",
        ja: "リンクラベル",
        "zh-CN": "链接标签",
        "zh-TW": "連結標籤",
        it: "Etichetta del collegamento",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Optional topic label. When set with Link, the link wraps this text. When set without Link, renders as static text (topic listing).",
        sortOrder: 100,
      },
    },
    {
      name: "Link",
      shape: "link",
      // The URL half is `/` on purpose — scai encodes a `#` URL as
      // linktype="anchor" WITHOUT the `anchor` attribute the Layout
      // Service builds hrefs from, so the SV arrived as href:"" and the
      // link rendered blank (see cta-button.recipe.ts diagnosis).
      default: "Link label|/",
      sitecore: {
        type: "general-link",
        hint: "Target URL. Required for link entries (omit for static topic labels).",
        sortOrder: 200,
      },
    },
    {
      name: "IconName",
      shape: "enum",
      sitecore: {
        enumHandle: "icon-name@1",
        hint: "Named vector icon for this entry, picked from the shared icon-name@1 vocabulary. Rendered as the row's leading icon by link-list's IconLed variant only; other variants ignore it. Unknown/empty names degrade to a text-only row.",
        sortOrder: 300,
      },
    },
    {
      name: "Description",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Optional one-line supporting description. Rendered under the label by link-list's IconLed variant only; other variants ignore it.",
        sortOrder: 400,
      },
    },
  ],
} satisfies ContentTemplateRecipe;

export default linkListItemRecipe;
