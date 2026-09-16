import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for `TravelSearch` — a generic travel search entry widget. A
 * mode toggle (flight / hotel / train) relabels the fields; the shape
 * (origin, destination, two dates, party size, Search) stays constant,
 * so one rendering serves airlines, hotels, and rail.
 *
 * Variants: `Default` (solid card in a section) and `HeroEmbed`
 * (translucent panel that overlaps a hero image).
 */
export const travelSearchRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "travel-search@1",
  icon: componentIcons["travel-search@1"],
  name: "travel-search",
  displayName: "Travel Search",
  description:
    "Generic travel search widget with a flight / hotel / train mode toggle, origin + destination + dates + party size, and a Search CTA. Use as the booking entry surface in an airline / hotel / rail hero. Variants: Default (card), HeroEmbed (overlaps a hero image).",
  section: { handle: "search-section@1" },
  fields: [
    {
      name: "Title",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Optional heading above the fields (Default variant only).",
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "Subtitle",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Optional supporting line under the title.",
        section: "Content",
        sortOrder: 200,
      },
    },
    {
      name: "SearchLabel",
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
        hint: "Label on the search button. Ignored when SearchLink is set.",
        section: "Content",
        sortOrder: 300,
      },
    },
    {
      name: "SearchLink",
      shape: "link",
      sitecore: {
        type: "general-link",
        hint: "Where the Search button goes. Leave empty to submit the form instead.",
        section: "Content",
        sortOrder: 400,
      },
    },
  ],
  params: [
    {
      name: "ShowHotel",
      shape: "boolean",
      default: "true",
      sitecore: {
        type: "checkbox",
        hint: "Show the Hotels tab in the mode toggle.",
        section: "Modes",
        sortOrder: 100,
      },
    },
    {
      name: "ShowTrain",
      shape: "boolean",
      default: "true",
      sitecore: {
        type: "checkbox",
        hint: "Show the Trains tab in the mode toggle.",
        section: "Modes",
        sortOrder: 200,
      },
    },
    {
      name: "DefaultMode",
      shape: "text",
      default: "flight",
      sitecore: {
        type: "single-line-text",
        hint: "Initial active mode — one of: flight, hotel, train.",
        section: "Modes",
        sortOrder: 300,
      },
    },
  ],
  variants: [{ name: "Default" }, { name: "HeroEmbed" }],
  placedIn: ["headless-main-{*}"],
  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Search" },
      { scope: "site", subfolder: "Search" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default travelSearchRecipe;
