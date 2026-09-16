import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration for distance-unit params (location-card DistanceUnit, location-search-bar DefaultUnit).
 *
 * Reference via `sitecore.enumHandle: "distance-unit@1"`. Lands at
 * `<enumerationsRoot>/Search/DistanceUnit` per-site.
 */
export const distanceUnitEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "distance-unit@1",
  name: "DistanceUnit",
  displayName: "Distance Unit",
  description:
    "Distance unit for radius/di stance labels: miles (mi) or kilometers (km).",
  location: { scope: "site", folder: ["Search"] },
  default: "mi",
  values: [
    { name: "mi", displayName: "Miles" },
    { name: "km", displayName: "Kilometers" },
  ],
} satisfies EnumerationRecipe;

export default distanceUnitEnumRecipe;
