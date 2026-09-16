import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for the `Matrix` component (./matrix.tsx).
 *
 * Authoring model — three typed columns, label-only rows, cells
 * scoped under their owning column:
 *
 *   - **Rows**           `matrix-row@1` — just a label. The leftmost
 *                        column of the rendered table shows these
 *                        labels under the heading set by the matrix
 *                        item's `AspectsLabel` field.
 *   - **Columns**        three specialized templates, picked per
 *                        column based on the kind of value being
 *                        compared. Each enforces its own cell type
 *                        via `insertOptions`:
 *       - `matrix-column-text@1`    text values    → `matrix-cell-text@1` children
 *       - `matrix-column-icon@1`    check/cross/dash/none icons → `matrix-cell-icon@1` children
 *       - `matrix-column-number@1`  numeric values → `matrix-cell-number@1` children
 *
 *   - **Cells**          live as children of their owning column, NOT
 *                        under each row. Each cell Droplinks the row
 *                        it belongs to and carries one of:
 *                        - `matrix-cell-text@1.Value`     a string
 *                        - `matrix-cell-icon@1.IconType`  enum: check / cross / dash / none
 *                        - `matrix-cell-number@1.Value`   a number
 *
 * Why this shape: a single author owns both a column's type and all
 * its cell values, so type mismatches are impossible — the cell
 * template literally can't be created under the wrong column type.
 * The earlier check / cross / dash split into separate column
 * templates was redundant — they all shared a render shape, just
 * differed in icon. Collapsed into one Icon column with per-cell
 * icon choice.
 *
 * The React `Matrix` component consumes `MatrixColumn[]` /
 * `MatrixRow[]` arrays directly. The `matrix.sitecore.ts` sibling
 * adapter (`mapMatrix`) walks each column's children, joins them
 * back to row references, and flattens into the
 * `values: Record<columnId, …>` shape `MatrixRow` expects.
 *
 * Column identity invariant: the adapter uses each column item's
 * `name` (with `id` GUID fallback) as the React `MatrixColumn.id`,
 * the cell→column key, AND the `expandedColumnId` value. Page-level
 * `resolveLayoutDroplists` resolves the `ExpandedColumn` Droplink
 * param to the same `name`, so all three references line up without
 * manual GUID bookkeeping.
 */
export const matrixRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "matrix@1",
  icon: componentIcons["matrix@1"],
  name: "matrix",
  displayName: "Matrix",
  description:
    "Comparison matrix. Rows are labeled aspects; columns are typed (text / icon / number) and own their cells.",

  section: { handle: "ui-section@1" },

  fields: [
    {
      // Sitecore Marketplace plugin field. Mounts the @sai/matrix-editor
      // iframe at the top of the matrix item's editor; the plugin reads
      // the matrix's Rows/Columns treelists, walks each column's cells,
      // and writes structural edits back through Authoring GraphQL. The
      // field's stored value is a stable digest the plugin postMessages
      // back via `client.setValue()` after every successful save — its
      // sole purpose is to mark the rendering dirty so Pages save fires.
      // Authors can also edit the underlying Rows/Columns treelists
      // directly; the plugin is an affordance, not the only path.
      name: "TableEditor",
      shape: "text",
      sitecore: {
        type: "Plugin",
        source: {
          kind: "plugin",
          id: "sai/matrix-editor",
          defaultAppId: "132e9379-0e85-4840-8d1f-f3e4b9e32553",
        },
        hint: "Visual editor for this matrix's rows, columns, and cells. Opens the matrix editor plugin.",
        section: "Editor",
        sortOrder: 100,
      },
    },
    {
      name: "Title",
      shape: "text",
      default: {
        en: "Comparison matrix",
        ar: "مصفوفة المقارنة",
        es: "Matriz comparativa",
        fr: "Matrice comparative",
        de: "Vergleichsmatrix",
        da: "Sammenligningsmatrix",
        ja: "比較マトリクス",
        "zh-CN": "对比矩阵",
        "zh-TW": "比較矩陣",
        it: "Matrice di confronto",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Section heading shown above the matrix.",
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "Description",
      shape: "text",
      default: {
        en: "Compare approaches across common aspects.",
        ar: "قارن بين الأساليب عبر جوانب مشتركة.",
        es: "Compara enfoques según aspectos comunes.",
        fr: "Comparez les approches selon des aspects communs.",
        de: "Vergleichen Sie Ansätze anhand gemeinsamer Aspekte.",
        da: "Sammenlign tilgange på tværs af fælles aspekter.",
        ja: "共通の観点でアプローチを比較しましょう。",
        "zh-CN": "从共同维度比较各种方案。",
        "zh-TW": "從共同面向比較各種方案。",
        it: "Confronta gli approcci secondo aspetti comuni.",
      },
      sitecore: {
        type: "multi-line-text",
        hint: "Short subhead shown directly under the title. Plain text.",
        section: "Content",
        sortOrder: 200,
      },
    },
    {
      name: "AspectsLabel",
      shape: "text",
      default: {
        en: "Aspects",
        ar: "الجوانب",
        es: "Aspectos",
        fr: "Aspects",
        de: "Aspekte",
        da: "Aspekter",
        ja: "項目",
        "zh-CN": "对比维度",
        "zh-TW": "比較面向",
        it: "Aspetti",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Heading for the leftmost column (where row labels live). Default 'Aspects'; override per-matrix when a different framing reads better ('Features', 'Dimensions', 'Capabilities').",
        section: "Content",
        sortOrder: 300,
      },
    },
    {
      name: "Columns",
      shape: "reference",
      multiple: true,
      sitecore: {
        type: "treelist",
        source: {
          kind: "filter",
          types: [
            "matrix-column-text@1",
            "matrix-column-icon@1",
            "matrix-column-number@1",
          ],
        },
        hint: "Pick the columns for this matrix. Mix and match column types — each column owns its own cells.",
        section: "Content",
        sortOrder: 400,
      },
    },
    {
      name: "Rows",
      shape: "reference",
      multiple: true,
      sitecore: {
        type: "treelist",
        source: { kind: "filter", types: ["matrix-row@1"] },
        hint: "Pick the rows for this matrix. Each row is just a label; cell values live under each column.",
        section: "Content",
        sortOrder: 500,
      },
    },
  ],

  // Child-items pattern: authors can create rows and any of the three
  // column types as direct children of this matrix's datasource.
  insertOptions: [
    "matrix-row@1",
    "matrix-column-text@1",
    "matrix-column-icon@1",
    "matrix-column-number@1",
  ],

  children: {
    allowedHandles: [
      "matrix-row@1",
      "matrix-column-text@1",
      "matrix-column-icon@1",
      "matrix-column-number@1",
    ],
  },

  // The React file exports only `Matrix` (a single default
  // presentation). Column-layout / color scheme / zebra rows are
  // params, not variants — same fields and composition, only the
  // styling shifts. Textbook parameter per the variant-vs-parameter
  // rule.
  variants: [{ name: "Default" }],

  params: [
    {
      name: "ColumnLayout",
      shape: "enum",
      default: "even",
      sitecore: {
        enumHandle: "matrix-column-layout@1",
        hint: "How column widths are allocated. 'even' splits evenly; 'expand-one' makes one column twice as wide (pick which via ExpandedColumn).",
        sortOrder: 100,
      },
    },
    {
      // Droplink (single reference). Page-level `resolveLayoutDroplists`
      // resolves this param to the picked column item's `name` before
      // it reaches the adapter, which then uses it directly as
      // `expandedColumnId` (the same key cells use to address columns).
      //
      // NOTE: no `source` filter. Earlier we constrained the picker to
      // matrix-column-* templates via `source: { kind: "filter", types
      // }`, but scai's compilation of that source produced a value
      // Pages couldn't parse — selecting the matrix rendering left the
      // right-panel blank with no console error. Dropping the source
      // lets the panel load. Author UX is slightly worse (picker shows
      // any item) but the resolver only cares about the picked
      // item's name, so the behavior at render time is unchanged.
      // Restore the filter once we have a scai-side fix.
      name: "ExpandedColumn",
      shape: "reference",
      sitecore: {
        hint: "Only used when ColumnLayout is 'expand-one'. Pick which column to widen.",
        sortOrder: 200,
      },
    },
    {
      // Shared with every other component's ColorScheme param (badge,
      // cta-button, alert-banner, etc.). Drives accent colors on the
      // matrix — header band tint, badge color, and the zebra-row
      // background when ZebraRows is on.
      name: "ColorScheme",
      shape: "enum",
      default: "neutral",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Accent color scheme. Drives header tint, badges, and the zebra-row background.",
        sortOrder: 300,
      },
    },
    {
      // Vertical padding on cells + header. compact / default /
      // comfortable / spacious. Default is `default` (cozy without
      // being tight).
      name: "Density",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "matrix-density@1",
        hint: "Cell padding density. Compact = tight rows, Spacious = open rows.",
        sortOrder: 350,
      },
    },
    {
      // Overall typographic scale + minimum table width. sm / md / lg.
      name: "Size",
      shape: "enum",
      default: "md",
      sitecore: {
        enumHandle: "matrix-size@1",
        hint: "Overall scale of the matrix — Small reads as data-dense, Large reads as a presentation panel.",
        sortOrder: 370,
      },
    },
    {
      // Alternating subtle background on body rows. Defaults on
      // because zebra striping makes wide comparison tables much
      // easier to scan.
      name: "ZebraRows",
      shape: "boolean",
      default: "true",
      sitecore: {
        type: "checkbox",
        hint: "Alternate row background tint for readability.",
        sortOrder: 400,
      },
    },
  ],

  /**
   * Convention: matrix datasources live in the site's Data folder.
   */
  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Matrices" },
      { scope: "site", subfolder: "Site Shared UI/Matrices" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default matrixRecipe;
