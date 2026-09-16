import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing the `ArcSpread` rendering parameter — how far
 * around a fanned photo-arc composition wraps. Lands at
 * `<enumerationsRoot>/Layout/ArcSpread` per-site.
 *
 * Reference from a component recipe via `sitecore.enumHandle:
 * "arc-spread@1"`. First consumer: `media-wall@1`'s Arc variant —
 * `wide` fans the tiles around a near-semicircle (~180°), `tight`
 * keeps them in a ~120° crown near the apex. Non-arc variants ignore
 * the param.
 */
export const arcSpreadEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "arc-spread@1",
  name: "ArcSpread",
  displayName: "Arc Spread",
  description:
    "How far around a fanned photo arc wraps: `tight` (~120° crown) or `wide` (~180° near-semicircle).",
  location: { scope: "site", folder: ["Layout"] },
  default: "wide",
  values: [
    { name: "tight", displayName: "Tight (~120°)" },
    { name: "wide", displayName: "Wide (~180°)" },
  ],
} satisfies EnumerationRecipe;

export default arcSpreadEnumRecipe;
