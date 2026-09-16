import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for the `SearchBar` rendering.
 *
 * Free-text input that drives controller state when nested inside a
 * `<family>-search-experience` wrapper container (via
 * `useSearchControllerContext`). Standalone placements navigate to
 * `Action` on submit (default `/search`).
 */
export const searchBarRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "search-bar@1",
  icon: componentIcons["search-bar@1"],
  name: "search-bar",
  displayName: "Search Bar",
  description:
    "Free-text search input. Inside a search-experience wrapper, drives the controller's query state; standalone, submits to the Action URL.",
  section: { handle: "search-section@1" },
  fields: [
    {
      name: "PlaceholderText",
      shape: "text",
      // No Standard Value: left blank so the component resolves the
      // localized default from the `core-ui-labels@1` dictionary
      // (`search-placeholder`). A Standard Value here would pre-fill the
      // field, so resolution would stop at the authored value and never
      // reach the dictionary. See src/lib/registry/forms/form-chrome.ts.
      sitecore: {
        type: "single-line-text",
        hint: "Placeholder text shown in the empty input. Leave blank to use the localized default from the Core UI Labels dictionary.",
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "SubmitLabel",
      shape: "text",
      // No Standard Value — localized via `core-ui-labels@1`
      // (`search-submit`). See PlaceholderText above.
      sitecore: {
        type: "single-line-text",
        hint: "Label for the submit button. Used when the variant shows a button. Leave blank to use the localized default from the Core UI Labels dictionary.",
        section: "Content",
        sortOrder: 200,
      },
    },
    {
      name: "Action",
      shape: "link",
      sitecore: {
        type: "general-link",
        hint: "Destination URL when the bar is submitted outside a search-experience wrapper. Ignored when nested inside a wrapper.",
        section: "Action",
        sortOrder: 100,
      },
    },
  ],
  params: [
    {
      name: "Variant",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "search-bar-variant@1",
        hint: "Bar style.",
        section: "Style",
        sortOrder: 100,
      },
    },
  ],
  variants: [{ name: "Default" }],
  placedIn: [
    "search-controls-leading-{*}",
    "search-controls-trailing-{*}",
    "headless-main-{*}",
  ],
  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Search Bars" },
      { scope: "site", subfolder: "Search Bars" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default searchBarRecipe;
