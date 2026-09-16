import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing the TaglineBanner `Size` rendering parameter.
 * Maps the four height + tagline-type-scale steps the React component
 * reads via `displayOptions.size`.
 *
 * Distinct from the shared `size@1` enum because tagline-banner has
 * no "default" step — picking a size is load-bearing for the band's
 * visual identity (a tagline-banner without a chosen size doesn't
 * render meaningfully).
 */
export const taglineBannerSizeEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "tagline-banner-size@1",
  name: "TaglineBannerSize",
  displayName: "Tagline Banner Size",
  description:
    "Banner height + tagline type scale for the TaglineBanner component.",
  location: { scope: "site", folder: ["Tagline Banner"] },
  default: "xl",
  values: [
    { name: "sm", displayName: "Small (brand strip)" },
    { name: "md", displayName: "Medium (band)" },
    { name: "lg", displayName: "Large (section)" },
    { name: "xl", displayName: "Extra-Large (display)" },
  ],
} satisfies EnumerationRecipe;

export default taglineBannerSizeEnumRecipe;
