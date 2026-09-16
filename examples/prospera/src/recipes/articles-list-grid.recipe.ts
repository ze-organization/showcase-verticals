import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";
import {
  CARD_CTA_PLACEMENT_PARAM,
  CARD_EMPTY_STATE_PARAMS,
  CARD_LIST_BASE_PARAMS,
  CARD_LIST_GRID_PARAMS,
  CARD_MEDIA_ASPECT_PARAMS,
  CARD_STYLING_PARAMS,
  CARD_TITLE_LINK_ICON_PARAM,
} from "../lib/registry/card-list-shared-params";
import { ARTICLE_CARD_VARIANT_PARAM } from "./_family-params";

/**
 * Recipe for `ArticlesListGrid` — the list/grid layout rendering for
 * the articles family. References `card-list-grid-params@1` for all
 * styling/layout params. Datasource carries:
 *
 *   - `Title`, `Lead`     — heading copy
 *   - `Articles`          — curated Treelist of article-card@1 items
 *   - `SearchConfig`      — Plugin field; populated only in search mode
 *
 * Component dispatches by which is populated. Composed mode uses the
 * `cards-articles-{*}` placeholder (insertOptions restrict to
 * `article-card@1`).
 *
 * Marked as compatible with `articles-carousel@1` via the shared
 * datasource template — swapping renderings preserves data.
 */
export const articlesListGridRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "articles-list-grid@1",
  icon: componentIcons["articles-list-grid@1"],
  name: "articles-list-grid",
  displayName: "Articles List / Grid",
  description:
    "Articles list or grid. Composed (placeholder children), curated (Treelist), or search-driven (when nested in a search-experience). Variants: Grid, List, Cards, Featured, FiftyFifty.",
  section: { handle: "cards-and-lists-section@1" },
  fields: [
    {
      name: "Eyebrow",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Optional kicker line above the title — rendered as a small-caps eyebrow. Populate when the source shows a short label above the section headline (centered small-caps kicker + large title → Eyebrow + HeadingSize xl + HeadingLayout centered).",
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "Title",
      shape: "text",
      default: {
        en: "Latest articles",
        ar: "أحدث المقالات",
        es: "Últimos artículos",
        fr: "Derniers articles",
        de: "Neueste Artikel",
        da: "Seneste artikler",
        ja: "最新記事",
        "zh-CN": "最新文章",
        "zh-TW": "最新文章",
        it: "Ultimi articoli",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Section heading shown above the articles.",
        section: "Content",
        sortOrder: 110,
      },
    },
    {
      name: "Lead",
      shape: "richText",
      sitecore: {
        type: "rich-text",
        hint: "Supporting copy under the title.",
        section: "Content",
        sortOrder: 200,
      },
    },
    {
      name: "Articles",
      shape: "reference",
      multiple: true,
      sitecore: {
        type: "treelist",
        hint: "Curated mode — pick article-card items to list. Leave empty to use the placeholder for composed mode, or populate SearchConfig for search mode.",
        source: { kind: "filter", types: ["article-card@1"] },
        section: "Content",
        sortOrder: 300,
      },
    },
    {
      name: "SearchConfig",
      shape: "text",
      sitecore: {
        type: "Plugin",
        hint: "Search-mode config blob. Populated via the sai/search-source Marketplace plugin (filters, sort, personalization). Ignored unless this rendering is nested inside an articles-search-experience.",
        source: {
          kind: "plugin",
          id: "sai/list-source",
          defaultAppId: "a559eb70-e5c3-4b3c-a0de-84def425a9c4",
        },
        section: "Search",
        sortOrder: 100,
      },
    },
  ],
  // Inline params (not `parameters: { handle }`): the shared external
  // `card-list-grid-params@1` template can't carry the family-specific
  // `CardVariant` axis (each family allows different values), and the
  // recipe schema makes `parameters` and inline `params` mutually
  // exclusive. Spread the shared groups + the family param — the shared
  // vocabulary stays single-sourced in `card-list-shared-params.ts`.
  params: [
    ...CARD_LIST_BASE_PARAMS,
    ...CARD_LIST_GRID_PARAMS,
    ...CARD_STYLING_PARAMS,
    CARD_TITLE_LINK_ICON_PARAM,
    ...CARD_MEDIA_ASPECT_PARAMS,
    CARD_CTA_PLACEMENT_PARAM,
    ...CARD_EMPTY_STATE_PARAMS,
    ARTICLE_CARD_VARIANT_PARAM,
  ],
  variants: [
    { name: "Grid" },
    { name: "List" },
    { name: "Cards" },
    { name: "Featured" },
    // One large lead article beside an UNCAPPED divider-separated
    // compact list of every remaining entry — pick when the source
    // shows a featured story next to a long link list (customer-story
    // + resources, featured exhibition + programme). `Featured` is the
    // capped 1 + 3 sidebar arrangement.
    { name: "FeaturedList" },
    { name: "FiftyFifty" },
  ],
  dynamicPlaceholders: true,

  placeholders: [
    {
      key: "cards-articles-{*}",
      allowedRenderingHandles: ["article-card@1"],
    },
  ],
  placedIn: ["headless-main-{*}", "search-results-{*}"],
  // Child-items authoring pattern (mirrors accordion-block): authors
  // can create `article-card@1` items directly under this rendering's
  // datasource item via the Sitecore "Insert" UX, then reference them
  // from the curated Treelist. Compiled onto the datasource template's
  // __Standard Values Insert Options — handles resolve to the
  // content-item (datasource) template GUIDs, not the rendering GUIDs,
  // so "add item" creates an authorable card item.
  insertOptions: ["article-card@1"],

  // Generate a `<Articles List / Grid> Folder` template under
  // Components/<section>/Component Folders/. The folder template's
  // standard-values Insert Options field references the listed handles
  // so the Sitecore "Insert" UX surfaces `article-card@1` items under
  // each folder instance.
  children: { allowedHandles: ["article-card@1"] },

  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Articles" },
      { scope: "site", subfolder: "Articles" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default articlesListGridRecipe;
