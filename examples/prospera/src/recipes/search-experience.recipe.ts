import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";
import {
  CARD_LIST_BASE_PARAMS,
  CARD_SEARCH_EXPERIENCE_PARAMS,
} from "../lib/registry/card-list-shared-params";

/**
 * Recipe for `SearchExperience` — the single generic search-mode
 * wrapper container that supersedes the per-family
 * `<family>-search-experience@1` renderings.
 *
 * Owns the search controller and exposes three placeholders authors
 * fill: bars above (leading), the inner list-grid/carousel rendering
 * (results), and bars below (trailing). The wrapper itself is
 * family-agnostic; authors pick which family's list-grid or carousel
 * goes into the results placeholder.
 *
 * The `search-results-{*}` placeholder has no `insertOptions`
 * restriction — that decision moved to the inner list-grid/carousel
 * (its `cards-<family>-{*}` placeholder still enforces leaf-card
 * insertOptions). Less type-safety at the results-rendering boundary
 * in exchange for a single shared wrapper across every family.
 */
export const searchExperienceRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "search-experience@1",
  icon: componentIcons["search-experience@1"],
  name: "search-experience",
  displayName: "Search Experience",
  description:
    "Generic search-mode wrapper. Owns the controller; exposes leading-controls / results / trailing-controls placeholders. Populate SearchConfig for an index, or pick items on the inner list-grid Treelist to search in-memory.",
  section: { handle: "search-section@1" },
  fields: [
    {
      name: "Title",
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
        hint: "Optional heading shown above the controls + results.",
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "Lead",
      shape: "richText",
      sitecore: {
        type: "rich-text",
        hint: "Optional supporting copy under the title.",
        section: "Content",
        sortOrder: 200,
      },
    },
    {
      name: "SearchConfig",
      shape: "text",
      sitecore: {
        type: "Plugin",
        hint: "Optional search source + filters + sort + personalization, authored via the sai/search-source Marketplace plugin. Leave empty to search a curated Treelist on the inner list-grid/carousel instead.",
        source: {
          kind: "plugin",
          id: "sai/search-source",
          defaultAppId: "de8f8957-9bc7-47b0-a9e0-8aaa8a562cb2",
        },
        section: "Search",
        sortOrder: 100,
      },
    },
  ],
  // Inline (not `parameters: { handle }`) so the synthesised per-recipe
  // parameters template can carry `_IDynamicPlaceholder`. scai forbids
  // combining `dynamicPlaceholders: true` with a shared external params
  // template (`card-search-experience-params@1`).
  params: [...CARD_LIST_BASE_PARAMS, ...CARD_SEARCH_EXPERIENCE_PARAMS],
  variants: [{ name: "Default" }, { name: "SidebarFacets" }],
  // SXA dynamic-placeholder mode: each Search Experience instance gets
  // unique leading / results / trailing slots (`…-*-0-{id}`).
  dynamicPlaceholders: true,
  placeholders: [
    {
      key: "search-controls-leading-{*}",
      allowedRenderingHandles: [
        // The bundled bar covers the common "horizontal controls row"
        // case in one drop. SearchBar stays for standalone-input
        // placements (sticky header search). FilterPanel stays because
        // the Sidebar variant *is* the sidebar column in SidebarFacets
        // — a structural layout role no bundled bar replaces.
        // LocationSearchBar is its own bundled bar (geolocation +
        // radius) rather than a Show* param on SearchControlsBar.
        "search-controls-bar@1",
        "search-bar@1",
        "filter-panel@1",
        "location-search-bar@1",
      ],
    },
    {
      key: "search-results-{*}",
      // intentionally unrestricted — authors pick any family's
      // list-grid or carousel; the inner placeholder still
      // enforces leaf-card insertOptions
    },
    {
      key: "search-controls-trailing-{*}",
      allowedRenderingHandles: ["search-pagination-bar@1"],
    },
  ],
  placedIn: ["headless-main-{*}"],
  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: true,
    locations: [
      { scope: "page", subfolder: "Search Experiences" },
      { scope: "site", subfolder: "Search Experiences" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default searchExperienceRecipe;
