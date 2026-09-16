import type { ComponentSectionRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { sectionIcons } from "./_component-icons";

/**
 * Section recipe for the `search` group of components — the bar
 * renderings (search-bar, filter-panel, sort-dropdown, pagination,
 * results-per-page, results-summary, view-toggle) plus the
 * search-results-component and the location/preview search specials.
 *
 * The bars are independent renderings: authors drop them into the
 * `search-controls-leading-{*}` / `search-controls-trailing-{*}`
 * placeholders exposed by `<family>-search-experience` wrapper
 * containers. Each bar reads controller state from
 * `useSearchControllerContext()` when nested inside a wrapper, or
 * falls back to its own props when placed standalone.
 */
export const searchSectionRecipe = {
  kind: "component-section",
  schemaVersion: "1",
  handle: "search-section@1",
  icon: sectionIcons["search-section@1"],
  name: "search",
  displayName: "Search",
  description:
    "Search bar, filter panel, sort dropdown, pagination, results-per-page, results-summary, and view-toggle renderings. Composed inside `<family>-search-experience` wrapper containers (see the cards-and-lists section).",
} satisfies ComponentSectionRecipe;

export default searchSectionRecipe;
