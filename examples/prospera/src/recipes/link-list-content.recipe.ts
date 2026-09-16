import type { ContentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Content template for the canonical link-list datasource — an
 * optional heading plus EITHER a curated Treelist of
 * `link-list-item@1` entries OR a single `ParentRef` droplink that
 * the component walks for children at render time.
 *
 * Coexists with `social-follow-content@1` as a **compatible datasource**
 * for `link-list@1`. Pick this template for any generic link list
 * (nav column, footer column, sidebar resources, in-page jump links,
 * section navigation, etc.). Pick `social-follow-content@1` when the
 * list is specifically the 5 canonical social platforms (icons
 * derived from URL host on the React side).
 *
 * **Two authoring modes:**
 *
 *   1. Curated (today)         — author picks individual link-list-
 *                                 item@1 entries in `Items`. Works in
 *                                 every SitecoreAI tenant.
 *
 *   2. Tree-reference (Phase 2 — author picks a single parent item
 *      requires IGQL)            in `ParentRef`; the component
 *                                 renders that parent's child pages
 *                                 as links. The walk needs a SitecoreAI
 *                                 Integrated GraphQL query template
 *                                 colocated with the rendering plus
 *                                 the SDK's IGQL pipeline configured
 *                                 in the consuming tenant —
 *                                 infrastructure not present in this
 *                                 registry. Recipe declares the
 *                                 authoring surface so the
 *                                 conversation is "set up IGQL" not
 *                                 "extend the recipe."
 *
 * `Items` wins when both fields are set — curated explicit-list
 * authoring overrides the auto-walked tree.
 *
 * Mirrors `LinkListFields` in `./link-list.tsx`. Keep field names
 * exactly aligned: scai hashes each name into a deterministic field
 * GUID and the React component reads from those names via the
 * layout-service `fields` object.
 */
export const linkListContentRecipe = {
  kind: "content-template",
  schemaVersion: "1",
  handle: "link-list-content@1",
  name: "link-list-content",
  displayName: "Link List",
  description:
    "Generic link-list datasource — optional heading plus either a curated Treelist of link entries (link-list-item entries, pages, or link-item virtual links, freely mixed) or a ParentRef droplink for tree-reference mode (Phase 2, requires IGQL).",

  fields: [
    {
      name: "Title",
      shape: "text",
      default: {
        en: "Quick links",
        ar: "روابط سريعة",
        es: "Enlaces rápidos",
        fr: "Liens rapides",
        de: "Schnellzugriffe",
        da: "Hurtige links",
        ja: "クイックリンク",
        "zh-CN": "快速链接",
        "zh-TW": "快速連結",
        it: "Collegamenti rapidi",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Optional heading shown above the list.",
        sortOrder: 100,
      },
    },
    {
      name: "Link",
      shape: "link",
      sitecore: {
        type: "general-link",
        hint: "Optional link for the group itself — where the consumer supports it (tree-navigation's drill-down panels), the group heading renders as a navigable row pointing here. The desktop nav mega-menu columns and link-list variants ignore it.",
        sortOrder: 150,
      },
    },
    {
      name: "Items",
      shape: "reference",
      multiple: true,
      sitecore: {
        type: "treelist",
        source: {
          kind: "filter",
          types: [
            "link-list-item@1",
            "link-list-content@1",
            "link-item@1",
            "page@1",
          ],
        },
        hint: "Curated mode — pick entries in render order, freely mixed from four sources: link-list-item entries (classic curated link), PAGES (the row reads the page's Title/NavigationTitle and links to the page itself), link-item entries (virtual links: page-aligned Title/Description/IconName plus an explicit Url for EXTERNAL destinations), and nested Link Lists (MultiColumn renders each as one headed column; other variants render only flat entries). Wins over ParentRef when both are set.",
        sortOrder: 200,
      },
    },
    {
      name: "Image",
      shape: "image",
      sitecore: {
        type: "image",
        hint: "Optional group image. Rendered above the column heading when this Link List is a nav mega-menu column (a nav-item's / header's Groups ref), and as the panel image above the heading by link-list's IconLed variant; the other link-list variants ignore it.",
        sortOrder: 250,
      },
    },
    {
      name: "ParentRef",
      shape: "reference",
      sitecore: {
        type: "droplink",
        hint: "Tree-reference mode (Phase 2, requires IGQL) — pick a single parent item; the component renders that parent's child pages as links at runtime. Leave blank for curated mode (Items). Only one mode applies per placement; Items wins if both are set.",
        sortOrder: 300,
      },
    },
  ],
} satisfies ContentTemplateRecipe;

export default linkListContentRecipe;
