import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for `VersusList` — a date-groupable list of two-party matchup
 * rows. Curated via the `Items` Treelist (versus-item@1); the
 * rendering dispatches between stacked rows (`Default`, optionally
 * grouped under date-label headings), a responsive card grid
 * (`Cards`), and a compact auto-scrolling score-ticker strip
 * (`Ticker`).
 *
 * Models fixtures/results but equally debates, comparisons, and
 * head-to-heads — parties, center value, and meta are un-opinionated.
 */
export const versusListRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "versus-list@1",
  icon: componentIcons["versus-list@1"],
  name: "versus-list",
  displayName: "Versus List",
  description:
    "Date-groupable list of two-party matchup rows: party A vs party B (name + badge), a center value (score, time, or status text), an upcoming/live/finished status token, a meta line, and an optional link. Use for fixtures, results, schedules, debates, head-to-heads, live score tickers. Variants: Default (stacked rows), Cards (grid), Ticker (compact auto-scrolling strip, pause on hover).",
  section: { handle: "cards-and-lists-section@1" },
  fields: [
    {
      name: "Title",
      shape: "text",
      default: {
        en: "Fixtures & results",
        ar: "المباريات والنتائج",
        es: "Partidos y resultados",
        fr: "Calendrier et résultats",
        de: "Spielplan & Ergebnisse",
        da: "Kampe & resultater",
        ja: "試合日程・結果",
        "zh-CN": "赛程与结果",
        "zh-TW": "賽程與結果",
        it: "Partite e risultati",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Section heading shown above the list.",
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "Lead",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Supporting copy under the title.",
        section: "Content",
        sortOrder: 200,
      },
    },
    {
      name: "Items",
      shape: "reference",
      multiple: true,
      sitecore: {
        type: "treelist",
        hint: "Curated mode — pick versus-item entries in display order.",
        source: { kind: "filter", types: ["versus-item@1"] },
        section: "Content",
        sortOrder: 300,
      },
    },
  ],
  params: [
    {
      name: "GroupByDate",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Group rows under their DateLabel headings (Default variant). Items keep Treelist order within each group. Default variant only — Cards is an ungrouped grid and Ticker a continuous marquee, so neither has a grouping axis to key on.",
        section: "Behavior",
        sortOrder: 100,
      },
    },
    {
      name: "Columns",
      shape: "enum",
      default: "3",
      sitecore: {
        enumHandle: "versus-list-columns@1",
        hint: "Columns at the lg breakpoint — Cards variant only.",
        section: "Layout",
        sortOrder: 200,
      },
    },
    {
      name: "ColorScheme",
      shape: "enum",
      default: "none",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Background tone of the section around the list.",
        section: "Style",
        sortOrder: 300,
      },
    },
    {
      name: "PanelStyle",
      shape: "enum",
      default: "card",
      sitecore: {
        enumHandle: "panel-style@1",
        hint: "Chrome around the rows — `card` (bordered elevated panel, default) or `flat` (rows sit directly on the section surface). Ticker has no panel and ignores this.",
        section: "Style",
        sortOrder: 310,
      },
    },
    {
      // Defaults to the in-list `auto` member: the section's natural
      // padding is the responsive `py-12 md:py-16` (versus-list.tsx),
      // which no concrete `padding-y@1` token reproduces. `auto` maps to
      // that ramp; a concrete pick takes over.
      name: "PaddingY",
      shape: "enum",
      default: "auto",
      sitecore: {
        enumHandle: "padding-y@1",
        hint: "Vertical padding around the section. `auto` (default) keeps the section's natural responsive padding; `none` flattens it for dense stacked compositions.",
        section: "Style",
        sortOrder: 320,
      },
    },
  ],
  variants: [{ name: "Default" }, { name: "Cards" }, { name: "Ticker" }],
  placedIn: ["headless-main-{*}"],
  // Child-items authoring pattern (mirrors accordion-block): authors
  // can create `versus-item@1` items directly under this rendering's
  // datasource item via the Sitecore "Insert" UX, then reference them
  // from the curated Treelist. Compiled onto the datasource template's
  // __Standard Values Insert Options — handles resolve to the
  // content-item (datasource) template GUIDs, not the rendering GUIDs,
  // so "add item" creates an authorable card item.
  insertOptions: ["versus-item@1"],

  // Generate a `<Versus List> Folder` template under
  // Components/<section>/Component Folders/. The folder template's
  // standard-values Insert Options field references the listed handles
  // so the Sitecore "Insert" UX surfaces `versus-item@1` items under
  // each folder instance.
  children: { allowedHandles: ["versus-item@1"] },

  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Matchups" },
      { scope: "site", subfolder: "Matchups" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default versusListRecipe;
