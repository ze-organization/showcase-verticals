import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for the `RowSplitter` component (./row-splitter.tsx).
 *
 * Up to 8 permissive row slots (`row-1-{*}` ... `row-8-{*}`). The
 * `EnabledPlaceholders` param is a comma-separated list of row indices
 * the author has turned on (e.g. `"1,2,4"`) — the React component
 * renders one slot per enabled row.
 *
 * **Shared vocabulary.** Position / MaxWidth / Alignment / Gap come
 * from the section-shell family (`position@1` / `max-width@1` /
 * `alignment@1` / `gap@1`) — same as Container and ColumnSplitter.
 */
const MAX_ROWS = 8;
const placeholderSlots = Array.from({ length: MAX_ROWS }, (_, i) => ({
  key: `row-${i + 1}-{*}`,
}));

export const rowSplitterRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "row-splitter@1",
  icon: componentIcons["row-splitter@1"],
  name: "row-splitter",
  displayName: "Row Splitter",
  description:
    "Vertical splitter — up to 8 permissive row slots, toggled per-placement via EnabledPlaceholders. Shares the section-shell param vocabulary.",

  section: { handle: "layout-section@1" },

  variants: [{ name: "Default" }],

  params: [
    {
      // Plain count picker — React reads `rowCount` and enables rows
      // 1..N at runtime. Matches the column-count@1 pattern.
      name: "RowCount",
      shape: "enum",
      default: "2",
      sitecore: {
        enumHandle: "row-count@1",
        hint: "Number of row slots (1–8). Rows render top-down.",
        sortOrder: 100,
      },
    },
    {
      // Vertical analogue of column-splitter's Distribution — named
      // height pattern across the rows. `flow` (default) = normal
      // content-height flow, exactly the pre-Distribution behavior.
      name: "Distribution",
      shape: "enum",
      default: "flow",
      sitecore: {
        enumHandle: "row-distribution@1",
        hint: "Named height pattern. `flow` sizes each row to its content; `even` equalizes row heights; `hero-*` makes the first/last row dominant; `compact-*` pins the first/last row to its natural height.",
        sortOrder: 150,
      },
    },
    {
      // `md` is the splitter's natural gap — concrete default now
      // that gap@1 dropped its literal `default` value.
      name: "Gap",
      shape: "enum",
      default: "md",
      sitecore: {
        enumHandle: "gap@1",
        hint: "Vertical space between rows.",
        sortOrder: 200,
      },
    },
    {
      name: "Position",
      shape: "enum",
      default: "inline",
      sitecore: {
        enumHandle: "position@1",
        hint: "Inline in page flow, or pin to top / bottom (CSS `position: sticky`).",
        sortOrder: 300,
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
        sortOrder: 400,
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
        sortOrder: 500,
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
        sortOrder: 550,
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
        sortOrder: 560,
      },
    },
    {
      // Mirrors container.recipe.ts. Lets authors give the splitter
      // breathing room when it's used as a nested layout slot
      // without a section wrapper around it. `none` is the splitter's
      // real default.
      name: "PaddingY",
      shape: "enum",
      default: "none",
      sitecore: {
        enumHandle: "padding-y@1",
        hint: "Vertical padding token applied to the splitter shell. Default = none — the wrapping section provides spacing. Use to give the splitter its own breathing room when nested.",
        sortOrder: 570,
      },
    },
    {
      // Hairline separators between rows — banded header / body /
      // footer compositions (the mobile-nav drawer case).
      // Off by default — omitted `default` IS the unchecked Standard
      // Value (scai encodes a boolean default into the SV checkbox; absent
      // and "false" both land unchecked, so OFF checkboxes omit it per
      // project convention).
      name: "ShowDividers",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Draw a hairline divider between rows.",
        sortOrder: 580,
      },
    },
  ],

  dynamicPlaceholders: true,
  placeholders: placeholderSlots,
} satisfies ComponentTemplateRecipe;

export default rowSplitterRecipe;
