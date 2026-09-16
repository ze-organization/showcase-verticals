import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing the `MobileColumns` / `TabletColumns` /
 * `LaptopColumns` rendering parameters on `column-splitter@1`. Each
 * picks how many columns the splitter renders at the corresponding
 * sub-desktop viewport breakpoint. There is deliberately no
 * DesktopColumns axis — the splitter's `ColumnCount` IS the desktop
 * count.
 *
 * No literal `default` value — it eroded standard-value logic. The
 * consuming recipe seeds concrete per-breakpoint standard values
 * (mobile 1 / tablet 2 / laptop 3); an unset pick falls back to the
 * component-side inherit chain. Every value is clamped to
 * `ColumnCount` at runtime, so allowing 6 everywhere can't strand
 * empty tracks.
 *
 * Shared enum (not inline `values + type:"droplist"`) for the same
 * reason as `column-count@1` — SXA Headless's Pages rendering-parameter
 * dialog doesn't reliably render pipe-delimited Droplist Source. The
 * per-breakpoint pickers were rendering empty until they switched to a
 * shared enum.
 */
export const breakpointColumnsEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "breakpoint-columns@1",
  name: "BreakpointColumns",
  displayName: "Breakpoint Columns",
  description:
    "Column count to render at a sub-desktop viewport breakpoint (mobile / tablet / laptop). Clamped to the splitter's ColumnCount at runtime — desktop always renders ColumnCount with the Distribution pattern.",
  location: { scope: "site", folder: ["Layout"] },
  default: "1",
  values: [
    { name: "1", displayName: "One" },
    { name: "2", displayName: "Two" },
    { name: "3", displayName: "Three" },
    { name: "4", displayName: "Four" },
    { name: "5", displayName: "Five" },
    { name: "6", displayName: "Six" },
  ],
} satisfies EnumerationRecipe;

export default breakpointColumnsEnumRecipe;
