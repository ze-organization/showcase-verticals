import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for `SearchBookingMode` — the per-tab datasource item for the
 * `search-booking-bar@1` MultiMode variant. Recipe-only (no rendering
 * of its own, like `search-booking-segment@1`): the parent bar reads
 * these via its `Modes` Treelist and renders each as one tab of the
 * multi-mode booking widget (Flights / Hotels / Holidays…), each tab
 * carrying its own segment row and action button.
 */
export const searchBookingModeRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "search-booking-mode@1",
  icon: componentIcons["search-booking-mode@1"],
  name: "search-booking-mode",
  displayName: "Search Booking Mode",
  description:
    "Single mode (tab) for the search-booking-bar MultiMode variant: a tab label, its own Segments Treelist, and an optional per-mode action label/link. Presentational — inputs are display-only.",
  section: { handle: "search-section@1" },
  fields: [
    {
      name: "Label",
      shape: "text",
      default: {
        en: "Flights",
        ar: "رحلات الطيران",
        es: "Vuelos",
        fr: "Vols",
        de: "Flüge",
        da: "Fly",
        ja: "フライト",
        "zh-CN": "机票",
        "zh-TW": "機票",
        it: "Voli",
      },
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: 'The tab label — the booking mode\'s name ("Flights", "Hotels", "Flight + Hotel", "Manage booking").',
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "Segments",
      shape: "reference",
      multiple: true,
      sitecore: {
        type: "treelist",
        hint: "This mode's input cells (origin / destination / dates …) — search-booking-segment items, in display order.",
        source: { kind: "filter", types: ["search-booking-segment@1"] },
        section: "Content",
        sortOrder: 200,
      },
    },
    {
      name: "ActionLabel",
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
        hint: "This mode's action button label. Falls back to the bar's own ActionLabel when empty.",
        section: "Content",
        sortOrder: 300,
      },
    },
    {
      name: "ActionLink",
      shape: "link",
      sitecore: {
        type: "general-link",
        hint: "Optional link this mode's action button follows. Falls back to the bar's own ActionLink; empty everywhere = plain button.",
        section: "Content",
        sortOrder: 400,
      },
    },
  ],
  variants: [{ name: "Default" }],
} satisfies ComponentTemplateRecipe;

export default searchBookingModeRecipe;
