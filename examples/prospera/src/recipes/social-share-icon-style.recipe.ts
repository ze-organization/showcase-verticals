import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing `SocialShare`'s `IconStyle` rendering parameter —
 * controls the visual treatment of each platform's icon chip. Lands at
 * `<enumerationsRoot>/Social Share Icon Style` per-site.
 *
 *   native        Each network's own brand color (Facebook blue, X
 *                 black, …). Maximum recognizability; default.
 *   color-scheme  The chip is painted with the placement's selected
 *                 ColorScheme role — solid `bg-<scheme>` chip with a
 *                 `text-<scheme>-foreground` glyph (the color-roles
 *                 solid-surface pairing). One brand-coherent tint for
 *                 the whole row.
 *   outline       Outlined chip: transparent fill, ring + glyph in the
 *                 scheme color (`text-<scheme>` soft treatment) —
 *                 quietest option, good for footers and dense rails.
 *
 * The `Display`, `Vertical`, and `Size` axes are orthogonal — combine
 * freely. The ColorScheme param tints the icon chip only; visible
 * labels always stay neutral page text.
 */
export const socialShareIconStyleEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "social-share-icon-style@1",
  name: "Social Share Icon Style",
  displayName: "Social Share Icon Style",
  description:
    "Visual treatment for social-share icon chips. Social Native Colors keeps each network's brand color; Color Scheme paints the chip with the selected color scheme; Outline is a quiet stroked chip in the scheme color.",
  location: { scope: "site", folder: ["Social"] },
  default: "native",
  values: [
    { name: "native", displayName: "Social Native Colors" },
    { name: "color-scheme", displayName: "Color Scheme" },
    { name: "outline", displayName: "Outline" },
  ],
} satisfies EnumerationRecipe;

export default socialShareIconStyleEnumRecipe;
