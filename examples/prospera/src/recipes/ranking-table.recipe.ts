import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for `RankingTable` — a generic data table for ranked
 * entities. Curated via the `Rows` Treelist (ranking-row@1); column
 * headers for up to six stat columns live on this parent datasource so
 * one child template serves every ranking shape (only labelled columns
 * render).
 *
 * "Highlight zones" (top N / bottom N rows painted with a semantic
 * tone) are generic zone striping — qualification/relegation zones,
 * promotion cut-offs, top-performer bands.
 */
export const rankingTableRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "ranking-table@1",
  icon: componentIcons["ranking-table@1"],
  name: "ranking-table",
  displayName: "Ranking Table",
  description:
    "Data table for ranked entities: rank, movement (up/down/steady), badge image, name, secondary label, up to six configurable stat columns, and an emphasised total. Use for league standings, world rankings, leaderboards, top-10 charts. Variants: Default (full table), Compact (rank/name/total for sidebars).",
  section: { handle: "cards-and-lists-section@1" },
  fields: [
    {
      name: "Title",
      shape: "text",
      default: {
        en: "Standings",
        ar: "الترتيب",
        es: "Clasificación",
        fr: "Classement",
        de: "Tabelle",
        da: "Stilling",
        ja: "順位表",
        "zh-CN": "排名",
        "zh-TW": "排名",
        it: "Classifica",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Section heading shown above the table.",
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
      name: "Rows",
      shape: "reference",
      multiple: true,
      sitecore: {
        type: "treelist",
        hint: "Curated mode — pick ranking-row items in rank order.",
        source: { kind: "filter", types: ["ranking-row@1"] },
        section: "Content",
        sortOrder: 300,
      },
    },
    {
      name: "NameLabel",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Header for the name column, e.g. 'Team', 'Player', 'Branch'. Defaults to 'Name'.",
        section: "Columns",
        sortOrder: 400,
      },
    },
    {
      name: "Stat1Label",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Header for stat column 1. Leave empty to hide the column.",
        section: "Columns",
        sortOrder: 410,
      },
    },
    {
      name: "Stat2Label",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Header for stat column 2. Leave empty to hide the column.",
        section: "Columns",
        sortOrder: 420,
      },
    },
    {
      name: "Stat3Label",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Header for stat column 3. Leave empty to hide the column.",
        section: "Columns",
        sortOrder: 430,
      },
    },
    {
      name: "Stat4Label",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Header for stat column 4. Leave empty to hide the column.",
        section: "Columns",
        sortOrder: 440,
      },
    },
    {
      name: "Stat5Label",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Header for stat column 5. Leave empty to hide the column.",
        section: "Columns",
        sortOrder: 450,
      },
    },
    {
      name: "Stat6Label",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Header for stat column 6. Leave empty to hide the column.",
        section: "Columns",
        sortOrder: 460,
      },
    },
    {
      name: "TotalLabel",
      shape: "text",
      default: {
        en: "Points",
        ar: "النقاط",
        es: "Puntos",
        fr: "Points",
        de: "Punkte",
        da: "Point",
        ja: "ポイント",
        "zh-CN": "积分",
        "zh-TW": "積分",
        it: "Punti",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Header for the emphasised total column, e.g. 'Points', 'Score', 'Revenue'.",
        section: "Columns",
        sortOrder: 470,
      },
    },
  ],
  params: [
    {
      name: "ShowMovement",
      shape: "boolean",
      default: "true",
      sitecore: {
        type: "checkbox",
        hint: "Show the movement (up/down/steady + places) column. Hidden on the Compact variant regardless.",
        section: "Behavior",
        sortOrder: 100,
      },
    },
    {
      name: "ShowBadge",
      shape: "boolean",
      default: "true",
      sitecore: {
        type: "checkbox",
        hint: "Show the badge / crest image before each name.",
        section: "Behavior",
        sortOrder: 110,
      },
    },
    {
      name: "ShowSecondaryLabel",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Show the secondary label (category / group / region) under each name.",
        section: "Behavior",
        sortOrder: 120,
      },
    },
    {
      name: "HighlightTopCount",
      shape: "integer",
      default: "0",
      sitecore: {
        hint: "Paint the first N rows with the top-zone tone (e.g. a qualification zone). 0 disables.",
        section: "Zones",
        sortOrder: 200,
      },
    },
    {
      name: "HighlightTopTone",
      shape: "enum",
      default: "success",
      sitecore: {
        enumHandle: "highlight-tone@1",
        hint: "Soft tone for the top highlight zone.",
        section: "Zones",
        sortOrder: 210,
      },
    },
    {
      name: "HighlightBottomCount",
      shape: "integer",
      default: "0",
      sitecore: {
        hint: "Paint the last N rows with the bottom-zone tone (e.g. a relegation / at-risk zone). 0 disables.",
        section: "Zones",
        sortOrder: 220,
      },
    },
    {
      name: "HighlightBottomTone",
      shape: "enum",
      default: "destructive",
      sitecore: {
        enumHandle: "highlight-tone@1",
        hint: "Soft tone for the bottom highlight zone.",
        section: "Zones",
        sortOrder: 230,
      },
    },
    {
      name: "Density",
      shape: "enum",
      default: "comfortable",
      sitecore: {
        enumHandle: "density@1",
        hint: "Row density — `compact` tightens vertical padding for long tables.",
        section: "Style",
        sortOrder: 300,
      },
    },
    {
      name: "ColorScheme",
      shape: "enum",
      default: "none",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Background tone of the section around the table.",
        section: "Style",
        sortOrder: 310,
      },
    },
    {
      name: "PanelStyle",
      shape: "enum",
      default: "card",
      sitecore: {
        enumHandle: "panel-style@1",
        hint: "Chrome around the rows — `card` (bordered elevated panel, default) or `flat` (rows sit directly on the section surface).",
        section: "Style",
        sortOrder: 320,
      },
    },
    {
      // Defaults to the in-list `auto` member: the section's natural
      // padding is the responsive `py-12 md:py-16` (ranking-table.tsx),
      // which no concrete `padding-y@1` token reproduces. `auto` maps to
      // that ramp; a concrete pick takes over.
      name: "PaddingY",
      shape: "enum",
      default: "auto",
      sitecore: {
        enumHandle: "padding-y@1",
        hint: "Vertical padding around the section. `auto` (default) keeps the section's natural responsive padding; `none` flattens it for dense stacked compositions.",
        section: "Style",
        sortOrder: 330,
      },
    },
  ],
  variants: [{ name: "Default" }, { name: "Compact" }],
  placedIn: ["headless-main-{*}"],
  // Child-items authoring pattern (mirrors accordion-block): authors
  // can create `ranking-row@1` items directly under this rendering's
  // datasource item via the Sitecore "Insert" UX, then reference them
  // from the curated Treelist. Compiled onto the datasource template's
  // __Standard Values Insert Options — handles resolve to the
  // content-item (datasource) template GUIDs, not the rendering GUIDs,
  // so "add item" creates an authorable card item.
  insertOptions: ["ranking-row@1"],

  // Generate a `<Ranking Table> Folder` template under
  // Components/<section>/Component Folders/. The folder template's
  // standard-values Insert Options field references the listed handles
  // so the Sitecore "Insert" UX surfaces `ranking-row@1` items under
  // each folder instance.
  children: { allowedHandles: ["ranking-row@1"] },

  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Rankings" },
      { scope: "site", subfolder: "Rankings" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default rankingTableRecipe;
