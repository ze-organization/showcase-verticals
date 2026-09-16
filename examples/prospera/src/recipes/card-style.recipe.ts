import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing the `Style` rendering parameter on `card-block@1`.
 * Mirrors the Card primitive's `style` CVA axis. Lands at
 * `<enumerationsRoot>/Components/Card/CardStyle` per-site.
 *
 * Card-only today; promoted to a shared enum if another component grows
 * the same flat/outline/filled axis.
 */
export const cardStyleEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "card-style@1",
  name: "CardStyle",
  displayName: "Card Style",
  description: "Visual style of a card surface.",
  location: { scope: "site", folder: ["Components", "Card"] },
  default: "flat",
  values: [
    { name: "flat", displayName: "Flat" },
    { name: "outline", displayName: "Outline" },
    { name: "filled", displayName: "Filled" },
    { name: "elevated", displayName: "Elevated" },
    { name: "bare", displayName: "Bare (surfaceless)" },
  ],
} satisfies EnumerationRecipe;

export default cardStyleEnumRecipe;
