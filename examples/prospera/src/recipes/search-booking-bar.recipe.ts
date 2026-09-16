import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for `SearchBookingBar` — a horizontal search / booking bar:
 * segmented input cells (curated via the `Segments` Treelist,
 * search-booking-segment@1) ending in a prominent action button.
 *
 * Presentational by design — the inputs are display-only and the
 * action button follows ActionLink when set. For the card-shaped
 * multi-mode travel widget use `travel-search@1`; for wired
 * site-content search use `search-bar@1`.
 */
export const searchBookingBarRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "search-booking-bar@1",
  icon: componentIcons["search-booking-bar@1"],
  name: "search-booking-bar",
  displayName: "Search Booking Bar",
  description:
    "Horizontal search / booking bar section: segmented input cells (origin / destination / dates, or query + category) ending in a prominent action button. Presentational — display-only inputs, optional action link. Use for flight search bars, trip planners, hotel booking bars, tour finders, event search strips. Variants: Default (full segmented bar with labelled cells and dividers), Compact (condensed single-row pill), MultiMode (tabbed multi-mode widget — a tab per booking mode via the Modes Treelist, each tab with its own segments and action; the Emirates Flights/Hotels/Holidays pattern).",
  section: { handle: "search-section@1" },
  fields: [
    {
      name: "Title",
      shape: "text",
      default: {
        en: "Where to next?",
        ar: "إلى أين وجهتك القادمة؟",
        es: "¿A dónde vas ahora?",
        fr: "Quelle est votre prochaine destination ?",
        de: "Wohin geht es als Nächstes?",
        da: "Hvor skal du hen?",
        ja: "次の目的地は？",
        "zh-CN": "下一站去哪里？",
        "zh-TW": "下一站去哪裡？",
        it: "Qual è la tua prossima meta?",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Optional heading above the bar. Leave blank to render the bar alone.",
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
        hint: "Curated input cells — pick search-booking-segment entries in display order. 2-5 segments recommended. Default/Compact only — MultiMode reads each mode's own Segments instead.",
        source: { kind: "filter", types: ["search-booking-segment@1"] },
        section: "Content",
        sortOrder: 200,
      },
    },
    {
      name: "Modes",
      shape: "reference",
      multiple: true,
      sitecore: {
        type: "treelist",
        hint: "MultiMode only — one search-booking-mode entry per tab (Flights / Hotels / Holidays…), each carrying its own Segments and optional action. 2-5 modes recommended. Default/Compact ignore this.",
        source: { kind: "filter", types: ["search-booking-mode@1"] },
        section: "Content",
        sortOrder: 250,
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
        hint: "Label for the action button. Ignored when ActionLink carries its own text.",
        section: "Content",
        sortOrder: 300,
      },
    },
    {
      name: "ActionLink",
      shape: "link",
      sitecore: {
        type: "general-link",
        hint: "Optional link the action button follows (e.g. the booking flow entry page). Leave blank for a plain display-only button.",
        section: "Content",
        sortOrder: 400,
      },
    },
  ],
  params: [
    {
      name: "ColorScheme",
      shape: "enum",
      default: "none",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Background tone of the section around the bar.",
        section: "Style",
        sortOrder: 100,
      },
    },
    {
      // Defaults to the in-list `auto` member: the bar's natural
      // padding is the responsive `py-8 md:py-10` (search-booking-bar
      // .tsx), which no concrete `padding-y@1` token reproduces. `auto` maps to
      // that ramp; a concrete pick takes over.
      name: "PaddingY",
      shape: "enum",
      default: "auto",
      sitecore: {
        enumHandle: "padding-y@1",
        hint: "Vertical padding around the section. `auto` (default) keeps a tight band so the bar can sit directly under a hero.",
        section: "Style",
        sortOrder: 200,
      },
    },
  ],
  variants: [{ name: "Default" }, { name: "Compact" }, { name: "MultiMode" }],
  placedIn: ["headless-main-{*}"],
  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Booking Bars" },
      { scope: "site", subfolder: "Booking Bars" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default searchBookingBarRecipe;
