import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration for the `NavigationButtonStyle` rendering parameter on carousel parameters templates.
 *
 * Reference via `sitecore.enumHandle: "carousel-button-style@1"`. Lands at
 * `<enumerationsRoot>/Components/Carousel/CarouselButtonStyle` per-site.
 */
export const carouselButtonStyleEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "carousel-button-style@1",
  name: "CarouselButtonStyle",
  displayName: "Carousel Button Style",
  description:
    "Navigation-arrow chrome: default (soft shadow pill), outline (transparent fill + thin border), solid (primary fill), or ghost (bare glyph).",
  location: { scope: "site", folder: ["Components", "Carousel"] },
  default: "default",
  values: [
    { name: "default", displayName: "Default" },
    { name: "outline", displayName: "Outline" },
    { name: "solid", displayName: "Solid" },
    { name: "ghost", displayName: "Ghost" },
  ],
} satisfies EnumerationRecipe;

export default carouselButtonStyleEnumRecipe;
