import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for the `FilterPanel` rendering.
 *
 * Renders facet selectors over the ambient search controller's facets.
 * Three layout variants: `Sidebar` (default vertical column),
 * `HorizontalChips` (chip-shaped pills above the results), `Drawer`
 * (off-canvas; opens via a trigger button).
 *
 * Must be placed inside a `<family>-search-experience` wrapper — it
 * has no useful standalone behavior because facets come from the
 * controller's last fetch.
 */
export const filterPanelRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "filter-panel@1",
  icon: componentIcons["filter-panel@1"],
  name: "filter-panel",
  displayName: "Filter Panel",
  description:
    "Facet selectors driven by the ambient search controller. Three layout variants — Sidebar, HorizontalChips, Drawer. Must be nested inside a search-experience wrapper.",
  section: { handle: "search-section@1" },
  fields: [
    {
      name: "Title",
      shape: "text",
      default: {
        en: "Filters",
        ar: "عوامل التصفية",
        es: "Filtros",
        fr: "Filtres",
        de: "Filter",
        da: "Filtre",
        ja: "フィルター",
        "zh-CN": "筛选",
        "zh-TW": "篩選",
        it: "Filtri",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Heading shown above the facet list.",
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "TriggerLabel",
      shape: "text",
      default: {
        en: "Filters",
        ar: "عوامل التصفية",
        es: "Filtros",
        fr: "Filtres",
        de: "Filter",
        da: "Filtre",
        ja: "フィルター",
        "zh-CN": "筛选",
        "zh-TW": "篩選",
        it: "Filtri",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Label on the trigger button. Used by the Drawer variant.",
        section: "Content",
        sortOrder: 200,
      },
    },
    {
      name: "ClearLabel",
      shape: "text",
      default: {
        en: "Clear all",
        ar: "مسح الكل",
        es: "Borrar todo",
        fr: "Tout effacer",
        de: "Alle löschen",
        da: "Ryd alt",
        ja: "すべてクリア",
        "zh-CN": "全部清除",
        "zh-TW": "全部清除",
        it: "Cancella tutto",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Label on the clear-all-facets button.",
        section: "Content",
        sortOrder: 300,
      },
    },
  ],
  params: [
    {
      name: "ShowCounts",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Show item counts next to each facet value.",
        section: "Behavior",
        sortOrder: 100,
      },
    },
    {
      name: "Collapsible",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Allow facet groups to collapse.",
        section: "Behavior",
        sortOrder: 200,
      },
    },
  ],
  variants: [
    { name: "Sidebar" },
    { name: "HorizontalChips" },
    { name: "Drawer" },
  ],
  placedIn: [
    "search-controls-leading-{*}",
    "search-controls-trailing-{*}",
    "headless-main-{*}",
  ],
  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Filter Panels" },
      { scope: "site", subfolder: "Filter Panels" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default filterPanelRecipe;
