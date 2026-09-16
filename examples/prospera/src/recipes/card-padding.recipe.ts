import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing the `Padding` rendering parameter on
 * `card-block@1`. Inner padding density of the card surface.
 *
 * Kept distinct from `size@1` because the Card primitive's `padding`
 * prop only narrows to `sm | md | lg` — surfacing `size@1`'s
 * `default/xs/xl` would let authors pick values that silently no-op.
 *
 * Lands at `<enumerationsRoot>/Components/Card/CardPadding` per-site.
 */
export const cardPaddingEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "card-padding@1",
  name: "CardPadding",
  displayName: "Card Padding",
  description: "Inner padding density of a card surface.",
  location: { scope: "site", folder: ["Components", "Card"] },
  default: "md",
  values: [
    { name: "sm", displayName: "Small" },
    { name: "md", displayName: "Medium" },
    { name: "lg", displayName: "Large" },
  ],
} satisfies EnumerationRecipe;

export default cardPaddingEnumRecipe;
