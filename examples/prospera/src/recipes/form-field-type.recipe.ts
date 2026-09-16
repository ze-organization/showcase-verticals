import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * HTML5 input type enum backing the `Type` rendering parameter on
 * `form-text-field`. Each value flips both the rendered `<input type>`
 * AND the input's `inputMode` / `autoComplete` defaults so virtual
 * keyboards and password managers do the right thing.
 *
 * Reference via `sitecore.enumHandle: "form-field-type@1"`. Lands at
 * `<enumerationsRoot>/Form Field Type` per-site.
 */
export const formFieldTypeEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "form-field-type@1",
  name: "Form Field Type",
  displayName: "Form Field Type",
  description:
    "HTML5 input type for a text-style form field. Drives input mode and autocomplete defaults.",
  location: { scope: "site", folder: ["Forms"] },
  default: "text",
  values: [
    { name: "text", displayName: "Text" },
    { name: "email", displayName: "Email" },
    { name: "tel", displayName: "Phone" },
    { name: "url", displayName: "URL" },
    { name: "number", displayName: "Number" },
    { name: "password", displayName: "Password" },
  ],
} satisfies EnumerationRecipe;

export default formFieldTypeEnumRecipe;
