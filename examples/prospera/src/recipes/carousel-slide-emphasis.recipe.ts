import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration for the `SlideEmphasis` rendering parameter on every cards-and-lists carousel parameters template.
 *
 * Reference via `sitecore.enumHandle: "carousel-slide-emphasis@1"`. Lands at
 * `<enumerationsRoot>/Components/Carousel/CarouselSlideEmphasis` per-site.
 */
export const carouselSlideEmphasisEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "carousel-slide-emphasis@1",
  name: "CarouselSlideEmphasis",
  displayName: "Carousel Slide Emphasis",
  description:
    "How slides share visual weight: uniform keeps every slide the same size; spotlight center-aligns the strip and renders the selected slide full-size with scaled-down, dimmed neighbours peeking at the edges — clicking a compact slide advances it into the spotlight.",
  location: { scope: "site", folder: ["Components", "Carousel"] },
  default: "uniform",
  values: [
    { name: "uniform", displayName: "Uniform" },
    { name: "spotlight", displayName: "Spotlight" },
  ],
} satisfies EnumerationRecipe;

export default carouselSlideEmphasisEnumRecipe;
