import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

export const rangeModeEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "range-mode@1",
  name: "RangeMode",
  displayName: "Range Mode",
  description:
    "Single-thumb (one pick) or dual-thumb (from/to range) for form-range-field@1.",
  location: { scope: "site", folder: ["Forms"] },
  default: "single",
  values: [
    { name: "single", displayName: "Single (one thumb)" },
    { name: "range", displayName: "Range (from / to)" },
  ],
} satisfies EnumerationRecipe;

export default rangeModeEnumRecipe;
