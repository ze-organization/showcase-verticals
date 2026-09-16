import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing the grid-level `CardVariant` rendering parameter
 * on the destinations renderings (`destinations-list-grid@1` /
 * `destinations-carousel@1`). Values match the `ALLOWED_CARD_VARIANTS`
 * set the `destinations.sitecore.ts` adapter parses. Lands at
 * `<enumerationsRoot>/Card/DestinationCardVariant` per-site.
 *
 * Reference via `sitecore.enumHandle: "destination-card-variant@1"`.
 */
export const destinationCardVariantEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "destination-card-variant@1",
  name: "DestinationCardVariant",
  displayName: "Destination Card Variant",
  description:
    "Card shape forwarded to every destination card in a curated grid/carousel: tile (default), full, compact, essential, hero, highlight, listing-horizontal, or listing-horizontal-comprehensive.",
  location: { scope: "site", folder: ["Card"] },
  default: "tile",
  values: [
    { name: "full", displayName: "Full" },
    { name: "compact", displayName: "Compact" },
    { name: "essential", displayName: "Essential" },
    { name: "hero", displayName: "Hero" },
    { name: "highlight", displayName: "Highlight" },
    { name: "tile", displayName: "Tile" },
    { name: "listing-horizontal", displayName: "Listing (Horizontal)" },
    {
      name: "listing-horizontal-comprehensive",
      displayName: "Listing (Horizontal, Comprehensive)",
    },
  ],
} satisfies EnumerationRecipe;

export default destinationCardVariantEnumRecipe;
