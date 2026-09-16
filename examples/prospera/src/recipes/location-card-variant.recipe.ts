import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing the grid-level `CardVariant` rendering parameter
 * on the `locations-carousel@1` rendering (the locations list-grid does
 * not expose a card-variant axis). Values match the carousel adapter's
 * allowed set in `locations.sitecore.ts`. Lands at
 * `<enumerationsRoot>/Card/LocationCardVariant` per-site.
 *
 * Reference via `sitecore.enumHandle: "location-card-variant@1"`.
 */
export const locationCardVariantEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "location-card-variant@1",
  name: "LocationCardVariant",
  displayName: "Location Card Variant",
  description:
    "Card shape forwarded to every location card in a curated carousel: compact (default), default, inline, or pin.",
  location: { scope: "site", folder: ["Card"] },
  default: "compact",
  values: [
    { name: "default", displayName: "Default" },
    { name: "compact", displayName: "Compact" },
    { name: "inline", displayName: "Inline" },
    { name: "pin", displayName: "Pin" },
  ],
} satisfies EnumerationRecipe;

export default locationCardVariantEnumRecipe;
