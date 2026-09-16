import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing the `CheckboxPosition` rendering parameter on
 * `form-checkbox-field@1`. Picks which side of the label the checkbox
 * sits on.
 *
 *   - `start`  Checkbox at the inline-start edge, label to the end.
 *              The conventional pattern (`[x] I agree to the terms`),
 *              RTL-safe via logical `start`.
 *   - `end`    Checkbox at the inline-end edge, label to the start.
 *              Right for opt-out toggles or settings-style rows where
 *              the label reads as a question + the checkbox is the
 *              answer (`Receive marketing emails [x]`).
 *
 * Reference from a component recipe via
 * `sitecore.enumHandle: "checkbox-position@1"`. Lands at
 * `<enumerationsRoot>/Forms/Checkbox Position` per-site.
 */
export const checkboxPositionEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "checkbox-position@1",
  name: "Checkbox Position",
  displayName: "Checkbox Position",
  description:
    "Which side of the label the checkbox sits on. `start` is the conventional pattern; `end` reads the label as a question + the checkbox as the answer (right for settings-style toggles).",
  location: { scope: "site", folder: ["Forms"] },
  default: "start",
  values: [
    { name: "start", displayName: "Start (checkbox first)" },
    { name: "end", displayName: "End (label first)" },
  ],
} satisfies EnumerationRecipe;

export default checkboxPositionEnumRecipe;
