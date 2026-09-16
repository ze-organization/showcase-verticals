import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration for the `NavigationButtonShape` rendering parameter on carousel parameters templates.
 *
 * Reference via `sitecore.enumHandle: "carousel-button-shape@1"`. Lands at
 * `<enumerationsRoot>/Components/Carousel/CarouselButtonShape` per-site.
 */
export const carouselButtonShapeEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "carousel-button-shape@1",
  name: "CarouselButtonShape",
  displayName: "Carousel Button Shape",
  description:
    "Navigation-arrow corners: default keeps the pill; square uses the theme small radius token.",
  location: { scope: "site", folder: ["Components", "Carousel"] },
  default: "default",
  values: [
    { name: "default", displayName: "Default" },
    { name: "square", displayName: "Square" },
  ],
} satisfies EnumerationRecipe;

export default carouselButtonShapeEnumRecipe;
