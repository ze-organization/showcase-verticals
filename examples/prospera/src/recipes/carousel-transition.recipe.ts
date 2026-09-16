import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing the `Transition` rendering parameter on
 * carousel-like surfaces (hero-carousel).
 *
 *   - `slide` (default) — slides scroll horizontally (Embla's native
 *                         translate transition).
 *   - `fade`            — slides cross-fade in place (Embla fade
 *                         plugin) — the classic full-bleed hero
 *                         rotator treatment.
 */
export const carouselTransitionEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "carousel-transition@1",
  name: "CarouselTransition",
  displayName: "Carousel Transition",
  description:
    "How carousel slides move between snaps. `slide` (default) scrolls horizontally; `fade` cross-fades slides in place.",
  location: { scope: "site", folder: ["Layout"] },
  default: "slide",
  values: [
    { name: "slide", displayName: "Slide" },
    { name: "fade", displayName: "Fade" },
  ],
} satisfies EnumerationRecipe;

export default carouselTransitionEnumRecipe;
