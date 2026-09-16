import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration for the `NavigationLayout` rendering parameter on every cards-and-lists carousel parameters template.
 *
 * Reference via `sitecore.enumHandle: "carousel-navigation-layout@1"`. Lands at
 * `<enumerationsRoot>/Components/Carousel/CarouselNavigationLayout` per-site.
 */
export const carouselNavigationLayoutEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "carousel-navigation-layout@1",
  name: "CarouselNavigationLayout",
  displayName: "Carousel Navigation Layout",
  description:
    "Where carousel navigation arrows sit: inline (flanking the strip), overlay (floating over it), header (heading-row corner), center-flank (edges of the center slide), edge-stacked (prev/next stacked in a column at the strip's end edge — pairs with spotlight SlideEmphasis). below is an alias that renders as inline.",
  location: { scope: "site", folder: ["Components", "Carousel"] },
  default: "inline",
  values: [
    { name: "inline", displayName: "Inline" },
    { name: "overlay", displayName: "Overlay" },
    { name: "below", displayName: "Below (renders as Inline)" },
    { name: "header", displayName: "Header" },
    { name: "center-flank", displayName: "Center Flank" },
    { name: "edge-stacked", displayName: "Edge Stacked" },
  ],
} satisfies EnumerationRecipe;

export default carouselNavigationLayoutEnumRecipe;
