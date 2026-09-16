import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

export const conditionalOperatorEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "conditional-operator@1",
  name: "ConditionalOperator",
  displayName: "Conditional Operator",
  description: "Comparison operator for form-conditional@1.",
  location: { scope: "site", folder: ["Forms"] },
  default: "equals",
  values: [
    { name: "equals", displayName: "Equals" },
    { name: "not-equals", displayName: "Not equals" },
    { name: "contains", displayName: "Contains (any of)" },
    { name: "is-set", displayName: "Is set (not empty)" },
    { name: "is-empty", displayName: "Is empty" },
  ],
} satisfies EnumerationRecipe;

export default conditionalOperatorEnumRecipe;
