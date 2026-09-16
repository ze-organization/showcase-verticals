import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";
import {
  CARD_EMPTY_STATE_PARAMS,
  CARD_LIST_BASE_PARAMS,
  CARD_LIST_GRID_PARAMS,
  CARD_STYLING_PARAMS,
} from "../lib/registry/card-list-shared-params";
import {
  STAT_CARD_ALIGN_PARAM,
  STAT_EMPHASIS_PARAM,
  STAT_HEADING_PLACEMENT_PARAM,
  STAT_LABEL_CASE_PARAM,
  STAT_SHOW_DIVIDERS_PARAM,
  STAT_SHOW_LABEL_PARAM,
  STAT_TONE_PARAM,
  STAT_TREND_DISPLAY_PARAM,
  STAT_VALUE_SIZE_PARAM,
} from "./_family-params";

/**
 * Recipe for `StatsListGrid` — the list/grid layout rendering for
 * the stats family. References `card-list-grid-params@1` for all
 * styling/layout params. Datasource carries:
 *
 *   - `Title`, `Lead`     — heading copy
 *   - `Stats`             — curated Treelist of stats-card@1 items
 *   - `SearchConfig`      — Plugin field; populated only in search mode
 *
 * Component dispatches by which is populated. Composed mode uses the
 * `cards-stats-{*}` placeholder (insertOptions restrict to
 * `stats-card@1`).
 *
 * Marked as compatible with `stats-carousel@1` via the shared
 * datasource template — swapping renderings preserves data.
 */
export const statsListGridRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "stats-list-grid@1",
  icon: componentIcons["stats-list-grid@1"],
  name: "stats-list-grid",
  displayName: "Stats List / Grid",
  description:
    "Stats list or grid. Composed (placeholder children), curated (Treelist), or search-driven (when nested in a search-experience). Variants: Grid (tile grid of metric cards), FlankedLabels (editorial stat band — rotated flank text beside each big number, one wide-guttered row; the Emphasis param flips number-primary vs label-primary), Milestones (chrome-free stats band — big value stacked over a short descriptor, center-aligned, 3-4 across; ShowDividers draws vertical hairlines between cells, HeadingPlacement `inline` puts the section heading in the band's leading cell, and an explicit Style pick renders the whole band as ONE card; Emphasis flips value-vs-label weighting).",
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
        en: "By the numbers",
        ar: "بالأرقام",
        es: "En cifras",
        fr: "En chiffres",
        de: "In Zahlen",
        da: "I tal",
        ja: "数字で見る",
        "zh-CN": "数据一览",
        "zh-TW": "數據一覽",
        it: "In numeri",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Section heading shown above the stats.",
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
      name: "Stats",
      shape: "reference",
      multiple: true,
      sitecore: {
        type: "treelist",
        hint: "Curated mode — pick stats-card items to list. Leave empty to use the placeholder for composed mode, or populate SearchConfig for search mode.",
        source: { kind: "filter", types: ["stats-card@1"] },
        section: "Content",
        sortOrder: 300,
      },
    },
    {
      name: "SearchConfig",
      shape: "text",
      sitecore: {
        type: "Plugin",
        hint: "Search-mode config blob. Populated via the sai/search-source Marketplace plugin (filters, sort, personalization). Ignored unless this rendering is nested inside a stats-search-experience.",
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
  // Inline params (not `parameters: { handle }`): the stats grid reads
  // family-specific `CardAlign`/`ShowLabel`/`Emphasis`/`TrendDisplay`/
  // `Tone`/`ValueSize`/`LabelCase` (via `adaptCardThemeOptions`) that the
  // shared external template can't carry. Those last five also mirror the
  // leaf `stats-card@1` recipe — declared here so a grid author can set
  // the axis row-wide instead of card-by-card.
  params: [
    ...CARD_LIST_BASE_PARAMS,
    ...CARD_LIST_GRID_PARAMS,
    ...CARD_STYLING_PARAMS,
    ...CARD_EMPTY_STATE_PARAMS,
    STAT_CARD_ALIGN_PARAM,
    STAT_SHOW_LABEL_PARAM,
    STAT_EMPHASIS_PARAM,
    STAT_TREND_DISPLAY_PARAM,
    STAT_TONE_PARAM,
    STAT_VALUE_SIZE_PARAM,
    STAT_LABEL_CASE_PARAM,
    STAT_SHOW_DIVIDERS_PARAM,
    STAT_HEADING_PLACEMENT_PARAM,
  ],
  variants: [
    { name: "Grid" },
    { name: "FlankedLabels" },
    { name: "Milestones" },
  ],
  dynamicPlaceholders: true,

  placeholders: [
    {
      key: "cards-stats-{*}",
      allowedRenderingHandles: ["stats-card@1"],
    },
  ],
  placedIn: ["headless-main-{*}", "search-results-{*}"],



  // Child-items authoring pattern (mirrors accordion-block): authors
  // can create items directly under this rendering's datasource via
  // Insert, then reference them from the curated Treelist.
  insertOptions: ["stats-card@1"],

  // Folder template Insert Options so Sitecore Insert surfaces the
  // card/item type under each folder instance.
  children: { allowedHandles: ["stats-card@1"] },

  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Stats" },
      { scope: "site", subfolder: "Stats" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default statsListGridRecipe;
