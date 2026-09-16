import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";
import {
  CARD_CTA_ICON_TRAILING_PARAM,
  CARD_EMPTY_STATE_PARAMS,
  CARD_LIST_BASE_PARAMS,
  CARD_LIST_GRID_PARAMS,
  CARD_MEDIA_ASPECT_PARAMS,
  CARD_STYLING_PARAMS,
} from "../lib/registry/card-list-shared-params";

/**
 * Recipe for `FeaturesListGrid` — the list/grid layout rendering for
 * the features family. References `card-list-grid-params@1` for all
 * styling/layout params. Datasource carries:
 *
 *   - `Title`, `Lead`     — heading copy
 *   - `Features`          — curated Treelist of feature-card@1 items
 *   - `SearchConfig`      — Plugin field; populated only in search mode
 *
 * Component dispatches by which is populated. Composed mode uses the
 * `cards-features-{*}` placeholder (insertOptions restrict to
 * `feature-card@1`).
 *
 * Variants `Grid`, `NumberedGrid`, `MediaBanded`, `MediaStacked`,
 * `IconTile` each carry a distinct card topology, so they live as
 * variants rather than params; see [[feedback-variant-vs-parameter]].
 * Single-column / two-column stacks are NOT variants — authors reach
 * them via the `ColumnsLg`/`ColumnsMd`/`ColumnsSm` + `Gap` params on
 * the `Grid` variant.
 *
 * Marked as compatible with `features-carousel@1` via the shared
 * datasource template — swapping renderings preserves data.
 */
export const featuresListGridRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "features-list-grid@1",
  icon: componentIcons["features-list-grid@1"],
  name: "features-list-grid",
  displayName: "Features List / Grid",
  description:
    "Features list or grid. Composed (placeholder children), curated (Treelist), or search-driven (when nested in a search-experience). Variants: Grid (default vertical cards), NumberedGrid (ordinal tiles), MediaBanded (image with overlaid title band), MediaStacked (image-top editorial tiles), IconTile (icon + copy tiles), HorizontalRows (media-left horizontal cards — pick when the source shows side-by-side image + copy rows rather than stacked tiles).",
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
        en: "Features",
        ar: "الميزات",
        es: "Características",
        fr: "Fonctionnalités",
        de: "Funktionen",
        da: "Funktioner",
        ja: "機能",
        "zh-CN": "功能",
        "zh-TW": "功能",
        it: "Funzionalità",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Section heading shown above the features.",
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
      name: "Features",
      shape: "reference",
      multiple: true,
      sitecore: {
        type: "treelist",
        hint: "Curated mode — pick feature-card items to list. Leave empty to use the placeholder for composed mode, or populate SearchConfig for search mode.",
        source: { kind: "filter", types: ["feature-card@1"] },
        section: "Content",
        sortOrder: 300,
      },
    },
    {
      name: "SearchConfig",
      shape: "text",
      sitecore: {
        type: "Plugin",
        hint: "Search-mode config blob. Populated via the sai/search-source Marketplace plugin (filters, sort, personalization). Ignored unless this rendering is nested inside a features-search-experience.",
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
  params: [
    ...CARD_LIST_BASE_PARAMS,
    ...CARD_LIST_GRID_PARAMS,
    ...CARD_STYLING_PARAMS,
    ...CARD_MEDIA_ASPECT_PARAMS,
    CARD_CTA_ICON_TRAILING_PARAM,
    ...CARD_EMPTY_STATE_PARAMS,
  ],
  variants: [
    { name: "Grid" },
    { name: "NumberedGrid" },
    { name: "MediaBanded" },
    { name: "MediaStacked" },
    { name: "IconTile" },
    { name: "HorizontalRows" },
    { name: "OverlayPanel" },
  ],
  dynamicPlaceholders: true,

  placeholders: [
    {
      key: "cards-features-{*}",
      allowedRenderingHandles: ["feature-card@1"],
    },
  ],
  placedIn: ["headless-main-{*}", "search-results-{*}"],



  // Child-items authoring pattern (mirrors accordion-block): authors
  // can create items directly under this rendering's datasource via
  // Insert, then reference them from the curated Treelist.
  insertOptions: ["feature-card@1"],

  // Folder template Insert Options so Sitecore Insert surfaces the
  // card/item type under each folder instance.
  children: { allowedHandles: ["feature-card@1"] },

  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Features" },
      { scope: "site", subfolder: "Features" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default featuresListGridRecipe;
