import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for the `ColumnSplitter` component (./column-splitter.tsx).
 *
 * A 2- or 3-column splitter with one permissive placeholder slot per
 * column (`column-1-{*}` ... `column-3-{*}`). Authors pick the column
 * count + a named distribution preset; the React component derives the
 * twelfths split. No structured per-column JSON — pixel-perfect cases
 * use the `styles` param + CSS overrides.
 *
 * **Shared vocabulary.** Position / MaxWidth / Alignment / Gap come
 * from the section-shell family (`position@1` / `max-width@1` /
 * `alignment@1` / `gap@1`). The component-specific axes are
 * `ColumnCount` (inline) and `Distribution` (inline).
 *
 * **No BreakpointsBase.** The component is its own container-query
 * context (`@container/column-splitter` on the root), so it reflows
 * against its own width — works whether it's placed at page width or
 * inside a sidebar. The previous viewport-vs-container toggle was
 * confusing and unnecessary.
 */

export const columnSplitterRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "column-splitter@1",
  icon: componentIcons["column-splitter@1"],
  name: "column-splitter",
  displayName: "Column Splitter",
  description:
    "2- or 3-column splitter with one permissive placeholder per column. Picks the split via ColumnCount + Distribution preset; shares the section-shell param vocabulary.",

  section: { handle: "layout-section@1" },

  variants: [{ name: "Default" }],

  params: [
    {
      // Switched from inline `values + type:"droplist"` → shared enum
      // recipe. SXA Headless's Pages dialog doesn't reliably render
      // pipe-delimited Droplist Source for rendering parameters; the
      // ColumnCount dropdown was empty until authors picked a value
      // via Standard Values. The `column-count@1` enum lives at
      // `<enumerationsRoot>/Layout/ColumnCount` and surfaces the same
      // 2/3 choices via the working Droplink + folder-of-values path.
      name: "ColumnCount",
      shape: "enum",
      default: "2",
      sitecore: {
        enumHandle: "column-count@1",
        hint: "Number of column slots — this is the DESKTOP (1280px+) column count. Mobile/Tablet/Laptop Columns define how the layout collapses below it.",
        sortOrder: 100,
      },
    },
    {
      // Same fix as ColumnCount — shared `column-distribution@1` enum
      // replaces the inline pipe-list Droplist that wasn't rendering
      // in chrome. The React component maps each value (combined with
      // ColumnCount) to a twelfths split — see DISTRIBUTION_WIDTHS in
      // column-splitter.tsx for the matrix.
      name: "Distribution",
      shape: "enum",
      default: "even",
      sitecore: {
        enumHandle: "column-distribution@1",
        hint: "Named width pattern at desktop. `even` divides evenly; `sidebar-*` narrows the start/end column; `primary-*` makes the start/end column dominant. Sub-desktop breakpoints render uniform tracks.",
        sortOrder: 200,
      },
    },
    {
      // `md` is the splitter's natural gap — a concrete standard value,
      // so the SV IS the real setting.
      name: "Gap",
      shape: "enum",
      default: "md",
      sitecore: {
        enumHandle: "gap@1",
        hint: "Space between columns.",
        sortOrder: 300,
      },
    },
    {
      name: "Position",
      shape: "enum",
      default: "inline",
      sitecore: {
        enumHandle: "position@1",
        hint: "Inline in page flow, or pin to top / bottom (CSS `position: sticky`).",
        sortOrder: 400,
      },
    },
    {
      // `full` (no constraint) is the splitter's real default — it
      // fills its parent.
      name: "MaxWidth",
      shape: "enum",
      default: "full",
      sitecore: {
        enumHandle: "max-width@1",
        hint: "Semantic width cap for the splitter. `full` (default) fills the parent.",
        sortOrder: 500,
      },
    },
    {
      // `start` is the splitter's real default when constrained; a
      // no-op when MaxWidth is `full`.
      name: "Alignment",
      shape: "enum",
      default: "start",
      sitecore: {
        enumHandle: "alignment@1",
        hint: "Horizontal placement of the constrained block. `start` (default); only meaningful when MaxWidth is not `full`.",
        sortOrder: 600,
      },
    },
    {
      // Surface fill — same axis as Container's ColorScheme.
      // Renamed from `BackgroundColor` (2026-07 param normalization). The
      // React side reads the old name as a permanent alias — scai CreateOnly
      // leaves the stale BackgroundColor field (with stored values) on
      // existing tenants.
      name: "ColorScheme",
      shape: "enum",
      default: "none",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Surface fill. `none` is transparent — the splitter adopts whatever's behind it. The other schemes apply the matching subdued background.",
        sortOrder: 650,
      },
    },
    {
      // See container.recipe.ts — bold composes with the chosen
      name: "BackgroundIntensity",
      shape: "enum",
      default: "subtle",
      sitecore: {
        enumHandle: "background-intensity@1",
        hint: "`subtle` keeps the soft -background tint (default). `bold` uses the pure scheme color (any scheme, incl. status colors) and inverts text inside the splitter.",
        sortOrder: 660,
      },
    },
    {
      // Mirrors container.recipe.ts. `none` is the splitter's real
      // default — the wrapping section provides spacing.
      name: "PaddingY",
      shape: "enum",
      default: "none",
      sitecore: {
        enumHandle: "padding-y@1",
        hint: "Vertical padding token applied to the splitter shell. Default = none — the wrapping section provides spacing. Use to give the splitter its own breathing room when nested.",
        sortOrder: 670,
      },
    },
    {
      // Hairline separators between slots — lets a splitter compose
      // visually banded regions (e.g. header / body / footer inside a
      // mobile-nav drawer). Orientation follows the layout: horizontal
      // rules while stacked, vertical rules on a single row; wrapped
      // breakpoints draw none.
      // Off by default — omitted `default` IS the unchecked Standard
      // Value (scai encodes a boolean default into the SV checkbox; absent
      // and "false" both land unchecked, so OFF checkboxes omit it per
      // project convention).
      name: "ShowDividers",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Draw a hairline divider between columns (horizontal while stacked, vertical side-by-side).",
        sortOrder: 680,
      },
    },
    {
      // Sub-desktop collapse counts. There is deliberately NO
      // DesktopColumns axis — `ColumnCount` IS the desktop count, so the
      // track count can never diverge from the distribution spans. Each
      // pick is a plain uniform track count for that breakpoint, clamped
      // to ColumnCount at runtime; Distribution keeps applying at
      // desktop. Concrete standard values (1 / 2 / 3) on
      // breakpoint-columns@1.
      name: "MobileColumns",
      shape: "enum",
      default: "1",
      sitecore: {
        enumHandle: "breakpoint-columns@1",
        hint: "Column count under 640px (phone). Default 1 = stack.",
        sortOrder: 700,
      },
    },
    {
      name: "TabletColumns",
      shape: "enum",
      default: "2",
      sitecore: {
        enumHandle: "breakpoint-columns@1",
        hint: "Column count at 640px–1023px (tablet). Clamped to ColumnCount.",
        sortOrder: 710,
      },
    },
    {
      name: "LaptopColumns",
      shape: "enum",
      default: "3",
      sitecore: {
        enumHandle: "breakpoint-columns@1",
        hint: "Column count at 1024px–1279px (laptop). Clamped to ColumnCount — desktop (1280px+) always shows the full ColumnCount with the Distribution pattern.",
        sortOrder: 720,
      },
    },
  ],

  dynamicPlaceholders: true,
  // One permissive slot per possible column, declared as an inline
  // literal (not built with Array.from) so contract extractors — the
  // registry source endpoint's structured `placeholders` field the page
  // composer reads — see the real keys in the recipe text.
  placeholders: [
    { key: "column-1-{*}" },
    { key: "column-2-{*}" },
    { key: "column-3-{*}" },
    { key: "column-4-{*}" },
    { key: "column-5-{*}" },
    { key: "column-6-{*}" },
  ],
} satisfies ComponentTemplateRecipe;

export default columnSplitterRecipe;
