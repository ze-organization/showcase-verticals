import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing the `LabelOrientation` rendering parameter on
 * the four form-field recipes (text / textarea / select / checkbox).
 * Drives where a field's label sits relative to its input.
 *
 *   - `stack`  Label stacked above the input (the default — works at
 *              every viewport width).
 *   - `row`    Label sits beside the input on a single horizontal
 *              row. Right for short labels + short inputs (zip,
 *              quantity) where the vertical stack wastes space.
 *   - `inset`  Label sits inside the input as a floating-label
 *              affordance — visually inside the input's chrome,
 *              shrinks to the top on focus / when the input has a
 *              value. Right for dense forms where stacked labels
 *              would crowd the surface.
 *
 * Reference from a component recipe via
 * `sitecore.enumHandle: "label-orientation@1"`. Lands at
 * `<enumerationsRoot>/Forms/Label Orientation` per-site.
 */
export const labelOrientationEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "label-orientation@1",
  name: "Label Orientation",
  displayName: "Label Orientation",
  description:
    "Where a form field's label sits relative to its input: stacked above (default), beside on a single row, or inset (floating label inside the input chrome).",
  location: { scope: "site", folder: ["Forms"] },
  default: "stack",
  values: [
    { name: "stack", displayName: "Stack (above)" },
    { name: "row", displayName: "Row (beside)" },
    { name: "inset", displayName: "Inset (floating)" },
  ],
} satisfies EnumerationRecipe;

export default labelOrientationEnumRecipe;
