import type { ContentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Content template for a single MainNav item — title + optional link
 * + a HasPanel opt-in that turns on the per-item mega-menu panel
 * placeholder. Used as the Treelist target on `main-nav@1`'s `Items`
 * field, AND as a `children` insert option so authors can create
 * items as direct children of a MainNav datasource (the same dual
 * related-items / child-items pattern as `accordion-block@1` /
 * `accordion-item@1`).
 *
 * Field names mirror `NavItemFields` in `./main-nav.tsx` exactly —
 * scai hashes each name into a deterministic field GUID and the
 * React side reads from those names via the layout-service `fields`
 * object. Don't rename without updating both sides.
 */
export const navItemRecipe = {
  kind: "content-template",
  schemaVersion: "1",
  handle: "nav-item@1",
  name: "nav-item",
  displayName: "Nav Item",
  description:
    "Single top-level navigation item. Used by `main-nav@1` as a Treelist target and as an insert-option child.",

  fields: [
    {
      name: "Title",
      shape: "text",
      default: {
        en: "Nav item",
        ar: "عنصر التنقل",
        es: "Elemento de navegación",
        fr: "Élément de navigation",
        de: "Navigationselement",
        da: "Navigationspunkt",
        ja: "ナビ項目",
        "zh-CN": "导航项",
        "zh-TW": "導覽項目",
        it: "Voce di navigazione",
      },
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "Display text for the nav item (e.g. 'Insurance & more').",
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
      default: "Nav item|/",
      sitecore: {
        type: "general-link",
        hint: "Optional target URL. When set without HasPanel, the item is a plain link. When set with HasPanel, the title navigates and the chevron opens the panel. Leave empty to make the item panel-only.",
        sortOrder: 200,
      },
    },
    {
      name: "HasPanel",
      shape: "boolean",
      default: "false",
      sitecore: {
        type: "checkbox",
        hint: "Enable the per-item mega-menu panel. When on, a `nav-item-panel-{index}` placeholder appears next to the item and a chevron toggles it.",
        sortOrder: 300,
      },
    },
    {
      // Field-driven mega-menu columns — the flat-composable
      // alternative to HasPanel. Each referenced link-list-content@1
      // item renders as one dropdown column (heading + links) in a
      // hover/focus panel, with no placeholder composition required.
      // HasPanel (placeholder mode) wins when both are set.
      name: "Groups",
      shape: "reference",
      multiple: true,
      sitecore: {
        type: "treelist",
        source: { kind: "filter", types: ["link-list-content@1"] },
        hint: "Mega-menu columns: each Link List renders as one dropdown column (its Title as the column heading, its optional Image above it, its Items as the links). Column count adapts to 2-4 groups. Leave empty for a plain nav item. HasPanel wins when both are set.",
        sortOrder: 400,
      },
    },
    {
      name: "PromoTitle",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Optional promo-card title shown beside the Groups columns in the dropdown panel.",
        section: "Promo",
        sortOrder: 500,
      },
    },
    {
      name: "PromoText",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Optional promo-card supporting copy.",
        section: "Promo",
        sortOrder: 600,
      },
    },
    {
      name: "PromoLink",
      shape: "link",
      sitecore: {
        type: "general-link",
        hint: "Optional promo-card CTA link.",
        section: "Promo",
        sortOrder: 700,
      },
    },
    {
      name: "PromoImage",
      shape: "image",
      sitecore: {
        type: "image",
        hint: "Optional promo-card image, rendered above the promo title.",
        section: "Promo",
        sortOrder: 800,
      },
    },
  ],
} satisfies ContentTemplateRecipe;

export default navItemRecipe;
