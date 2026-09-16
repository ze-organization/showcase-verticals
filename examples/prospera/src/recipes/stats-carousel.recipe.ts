import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";
import {
  CARD_CAROUSEL_PARAMS,
  CARD_EMPTY_STATE_PARAMS,
  CARD_LIST_BASE_PARAMS,
  CARD_STYLING_PARAMS,
} from "../lib/registry/card-list-shared-params";
import {
  STAT_CARD_ALIGN_PARAM,
  STAT_LABEL_CASE_PARAM,
  STAT_SHOW_LABEL_PARAM,
  STAT_TONE_PARAM,
  STAT_TREND_DISPLAY_PARAM,
  STAT_VALUE_SIZE_PARAM,
} from "./_family-params";

/**
 * Recipe for `StatsCarousel` — carousel layout rendering for the
 * stats family. Same datasource shape as `stats-list-grid@1`, so
 * the two are marked compatible (authors swap layout via the
 * rendering picker without re-binding their stats).
 *
 * References `card-carousel-params@1` for autoplay, slides per view,
 * navigation, pagination, and the shared base/styling params.
 */
export const statsCarouselRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "stats-carousel@1",
  icon: componentIcons["stats-carousel@1"],
  name: "stats-carousel",
  displayName: "Stats Carousel",
  description:
    "Stats carousel. Same datasource as stats-list-grid (composed / curated / search). Variants: Default, FullBleed, FeatureSpotlight.",
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
        hint: "Curated mode — pick stats-card items. Leave empty to use the placeholder for composed mode, or populate SearchConfig for search mode.",
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
        hint: "Search-mode config blob. Populated via the sai/search-source Marketplace plugin.",
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
  // Inline params (not `parameters: { handle }`): see stats-list-grid —
  // the stats carousel reads `CardAlign`/`ShowLabel`/`Emphasis`/
  // `TrendDisplay`/`Tone`/`ValueSize`/`LabelCase` off the SAME
  // `adaptCardThemeOptions` the grid uses.
  params: [
    ...CARD_LIST_BASE_PARAMS,
    ...CARD_CAROUSEL_PARAMS,
    ...CARD_STYLING_PARAMS,
    ...CARD_EMPTY_STATE_PARAMS,
    STAT_CARD_ALIGN_PARAM,
    STAT_SHOW_LABEL_PARAM,
    // `STAT_EMPHASIS_PARAM` was removed 2026-08: `stat-emphasis@1` picks
    // which slot dominates in the grid's `FlankedLabels` / `Milestones`
    // variants, and the carousel ships neither — its variants are
    // default / full-bleed / feature-spotlight, none of which flank a
    // label. The grid keeps the param, and `stats-card@1` keeps its own
    // for composed mode.
    STAT_TREND_DISPLAY_PARAM,
    STAT_TONE_PARAM,
    STAT_VALUE_SIZE_PARAM,
    STAT_LABEL_CASE_PARAM,
  ],
  variants: [
    { name: "Default" },
    { name: "FullBleed" },
    { name: "FeatureSpotlight" },
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

export default statsCarouselRecipe;
