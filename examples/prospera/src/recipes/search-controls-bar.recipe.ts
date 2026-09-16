import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for the `SearchControlsBar` rendering.
 *
 * One-drop horizontal controls row for the search-experience wrapper.
 * Bundles the granular bar primitives (search-bar, sort-dropdown,
 * filter chips, view-toggle, result-count, results-per-page) into a
 * single rendering authors drop into `search-controls-leading-{*}`,
 * each sub-bar gated by a `Show…` param.
 *
 * Why bundled when the granular renderings already exist:
 *   - Common case is "a horizontal controls row above the results."
 *     The granular shape needs 4-6 drops; this is 1.
 *   - Compose-by-default still works for advanced layouts (facets in
 *     a sidebar, sticky top bar with only sort, etc.) — drop the
 *     granular bars instead.
 *
 * For sidebar facets — a vertically-stacked column of facet groups —
 * keep using `filter-panel@1` with the Sidebar variant; structurally
 * distinct from a horizontal bar.
 */
export const searchControlsBarRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "search-controls-bar@1",
  icon: componentIcons["search-controls-bar@1"],
  name: "search-controls-bar",
  displayName: "Search Controls Bar",
  description:
    "Bundled horizontal controls row — search + sort + filter chips + view-toggle + count + results-per-page in one drop. Each sub-bar gated by a Show* param.",
  section: { handle: "search-section@1" },
  fields: [
    {
      name: "SearchPlaceholder",
      shape: "text",
      default: {
        en: "Search",
        ar: "بحث",
        es: "Buscar",
        fr: "Rechercher",
        de: "Suchen",
        da: "Søg",
        ja: "検索",
        "zh-CN": "搜索",
        "zh-TW": "搜尋",
        it: "Cerca",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Placeholder text shown in the empty search input.",
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "SortLabel",
      shape: "text",
      default: {
        en: "Sort by",
        ar: "الترتيب حسب",
        es: "Ordenar por",
        fr: "Trier par",
        de: "Sortieren nach",
        da: "Sortér efter",
        ja: "並び替え",
        "zh-CN": "排序方式",
        "zh-TW": "排序方式",
        it: "Ordina per",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Label next to the sort dropdown trigger.",
        section: "Content",
        sortOrder: 200,
      },
    },
    {
      name: "FiltersButtonLabel",
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
        hint: "Label on the filters button / chip row.",
        section: "Content",
        sortOrder: 300,
      },
    },
  ],
  params: [
    {
      name: "ShowSearch",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Show the free-text search input.",
        section: "Visibility",
        sortOrder: 100,
      },
    },
    {
      name: "ShowSort",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Show the sort dropdown.",
        section: "Visibility",
        sortOrder: 200,
      },
    },
    {
      name: "ShowFilter",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Show the filter chip row (inline) or filters button (sidebar).",
        section: "Visibility",
        sortOrder: 300,
      },
    },
    {
      name: "ShowView",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Show the grid/list view toggle.",
        section: "Visibility",
        sortOrder: 400,
      },
    },
    {
      name: "ShowCount",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Show the X of N result-count summary.",
        section: "Visibility",
        sortOrder: 500,
      },
    },
    {
      name: "ShowPerPage",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Show the results-per-page selector.",
        section: "Visibility",
        sortOrder: 600,
      },
    },
    {
      name: "FiltersPlacement",
      shape: "enum",
      default: "inline",
      sitecore: {
        enumHandle: "filters-placement@1",
        hint: "Inline chips embedded in the bar, or a filters button that opens a sidebar/drawer.",
        section: "Behavior",
        sortOrder: 100,
      },
    },
    {
      name: "Surface",
      shape: "enum",
      default: "card",
      sitecore: {
        enumHandle: "search-controls-surface@1",
        hint: "Visual surface treatment.",
        section: "Style",
        sortOrder: 100,
      },
    },
    {
      name: "Density",
      shape: "enum",
      default: "comfortable",
      sitecore: {
        enumHandle: "density@1",
        hint: "Bar density.",
        section: "Style",
        sortOrder: 200,
      },
    },
  ],
  variants: [{ name: "Default" }, { name: "Minimal" }, { name: "Compact" }],
  placedIn: ["search-controls-leading-{*}", "search-controls-trailing-{*}"],
  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Search Controls Bars" },
      { scope: "site", subfolder: "Search Controls Bars" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default searchControlsBarRecipe;
