import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration for `LabelCase`-style params (stats-card).
 *
 * Reference via `sitecore.enumHandle: "label-case@1"`. Lands at
 * `<enumerationsRoot>/Typography/LabelCase` per-site.
 */
export const labelCaseEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "label-case@1",
  name: "LabelCase",
  displayName: "Label Case",
  description:
    "Label casing: default (as authored) or uppercase (small-caps tracking).",
  location: { scope: "site", folder: ["Typography"] },
  default: "default",
  values: [
    { name: "default", displayName: "Default" },
    { name: "uppercase", displayName: "Uppercase" },
  ],
} satisfies EnumerationRecipe;

export default labelCaseEnumRecipe;
