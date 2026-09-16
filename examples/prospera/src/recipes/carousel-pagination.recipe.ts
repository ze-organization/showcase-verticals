import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration for the `Pagination` rendering parameter on carousel parameters templates.
 *
 * Reference via `sitecore.enumHandle: "carousel-pagination@1"`. Lands at
 * `<enumerationsRoot>/Components/Carousel/CarouselPagination` per-site.
 */
export const carouselPaginationEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "carousel-pagination@1",
  name: "CarouselPagination",
  displayName: "Carousel Pagination",
  description:
    "Pagination indicator style below the slides: none, dots, numbers, or a progress bar.",
  location: { scope: "site", folder: ["Components", "Carousel"] },
  default: "none",
  values: [
    { name: "none", displayName: "None" },
    { name: "dots", displayName: "Dots" },
    { name: "numbers", displayName: "Numbers" },
    { name: "progress", displayName: "Progress" },
  ],
} satisfies EnumerationRecipe;

export default carouselPaginationEnumRecipe;
