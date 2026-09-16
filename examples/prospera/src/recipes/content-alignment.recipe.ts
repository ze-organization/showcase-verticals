import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Horizontal alignment for a block whose natural alignment is not a
 * fixed pick but **defers to another axis on the same component**.
 * Lands at `<enumerationsRoot>/ContentAlignment` per-site.
 *
 * This is `alignment@1` plus an `auto` sentinel. Split out 2026-08:
 * `auto` used to live on `alignment@1` itself, which meant all fifteen
 * consumers offered it in their Pages dropdown while only ONE could act
 * on it. On the other fourteen — the four layout shells (section-wrapper,
 * container, column-splitter, row-splitter) and the ten content blocks —
 * there is no second axis to defer to, so `auto` resolved to the same
 * class as their declared default: a control that visibly did nothing.
 *
 * The distinguishing test for which enum a param wants:
 *
 *   - Does the component have ANOTHER param that already implies a
 *     horizontal alignment (a Layout / Position axis)? Then `auto`
 *     means "don't override it" and this enum is right.
 *   - Otherwise the component has one concrete natural alignment.
 *     Bind `alignment@1` and declare that pick as the param default.
 *
 * Today the only consumer is promo's `ContentAlign`, which falls back
 * to its `Layout` param (`start` / `centered` / `end`) when left on
 * `auto` — see `parseTextAlign` in `promo.tsx`.
 */
export const contentAlignmentEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "content-alignment@1",
  name: "ContentAlignment",
  displayName: "Content Alignment",
  description:
    "Horizontal alignment that may defer to the component's own layout axis. Logical (RTL-safe).",
  location: { scope: "site", folder: ["Layout"] },
  default: "auto",
  values: [
    { name: "auto", displayName: "Auto (defer to layout)" },
    { name: "start", displayName: "Start" },
    { name: "center", displayName: "Center" },
    { name: "end", displayName: "End" },
  ],
} satisfies EnumerationRecipe;

export default contentAlignmentEnumRecipe;
