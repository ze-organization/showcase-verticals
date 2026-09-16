import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Visual treatment for input chrome inside `form-builder@1` and
 * `subscribe-section@1`. Drives the `FormInputStyle` rendering param;
 * applied at the form root via descendant selectors so every input,
 * textarea, and select-trigger picks up the treatment without per-
 * field wiring.
 *
 * Two values keep the dropdown short:
 *
 *   - `outline` (default) — the Input primitive's natural chrome.
 *     Full 1px border, rounded corners, surface-background fill.
 *     Reads as a discrete bordered cell.
 *   - `underline` — bare editorial treatment. No top / inline
 *     borders, transparent background, only a 1px bottom border.
 *     Reads as a flowing column of underlined fields, dense and
 *     editorial. Pairs well with the `inset` label orientation.
 */
export const formInputStyleEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "form-input-style@1",
  name: "FormInputStyle",
  displayName: "Form Input Style",
  description:
    "Visual treatment for input chrome on forms. `outline` (default) is the full bordered cell; `underline` is bottom-edge only.",
  location: { scope: "site", folder: ["Forms"] },
  default: "outline",
  values: [
    { name: "outline", displayName: "Outline (bordered cell)" },
    { name: "underline", displayName: "Underline (bottom edge only)" },
  ],
} satisfies EnumerationRecipe;

export default formInputStyleEnumRecipe;
