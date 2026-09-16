import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Visual treatment for `form-fieldset@1`.
 *
 *   - `default`  — heading-only, no border (works best for inline form sections)
 *   - `bordered` — thin 1px border + rounded corners (calls the group out)
 *   - `card`     — soft muted background (heaviest visual weight)
 */
export const formFieldsetVariantEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "form-fieldset-variant@1",
  name: "FormFieldsetVariant",
  displayName: "Form Fieldset Variant",
  description:
    "Visual treatment for a Form Fieldset group. Default = heading-only, bordered = card border, card = soft tinted background.",
  location: { scope: "site", folder: ["Forms"] },
  default: "default",
  values: [
    { name: "default", displayName: "Default (heading only)" },
    { name: "bordered", displayName: "Bordered card" },
    { name: "card", displayName: "Soft card (muted background)" },
  ],
} satisfies EnumerationRecipe;

export default formFieldsetVariantEnumRecipe;
