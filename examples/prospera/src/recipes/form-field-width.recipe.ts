import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Width enum for form fields inside a `FormBuilder` grid. Drives the
 * field's grid-column basis so authors can place two half-width fields
 * side-by-side (firstName + lastName) without an explicit row-grouping
 * rendering.
 *
 * Reference via `sitecore.enumHandle: "form-field-width@1"`. Lands at
 * `<enumerationsRoot>/Form Field Width` per-site.
 */
export const formFieldWidthEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "form-field-width@1",
  name: "Form Field Width",
  displayName: "Form Field Width",
  description:
    "Width of a form field inside the FormBuilder grid. Full row, half, one-third, or inline (sized to the input's natural width — right for postcodes, short codes, and other content-bound inputs that would look cavernous at full width).",
  location: { scope: "site", folder: ["Forms"] },
  default: "full",
  values: [
    { name: "full", displayName: "Full row" },
    { name: "half", displayName: "Half" },
    { name: "third", displayName: "One third" },
    { name: "inline", displayName: "Inline (content width)" },
  ],
} satisfies EnumerationRecipe;

export default formFieldWidthEnumRecipe;
