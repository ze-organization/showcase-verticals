import type { ComponentTemplateRecipe } from "../lib/registry/sitecore-recipes";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for the `HeroCarousel` component (./hero-carousel.tsx).
 *
 * Multi-slide, full-bleed rotating hero — PLACEHOLDER-COMPOSED (the
 * visual-tabs pattern). Authors drop `hero@1` renderings into the
 * `hero-carousel-{*}` placeholder and each dropped hero becomes one
 * slide, carrying the FULL hero control surface (overlay axes, heading
 * treatment, media playback, CTAs) one hero at a time. There is
 * deliberately NO Slides/Items field — the placeholder is the slide
 * list. In editing, the slot renders as a stacked tray of hero
 * sections with Pages chrome for add / select / reorder.
 *
 * Behavior params (carousel-level):
 *
 *   - `AutoplayInterval` (`autoplay-interval@1`) — off / 4s / 6s / 8s.
 *     Autoplay pauses on hover/focus and is disabled entirely under
 *     `prefers-reduced-motion` (static first slide, manual controls).
 *   - `Transition` (`carousel-transition@1`) — slide / fade.
 *   - `ShowArrows` / `ShowIndicators` / `Loop` — chrome + wrap.
 *
 * Per-slide design axes (overlay / heading / CTA / media) live on each
 * dropped hero rendering, not here.
 */
export const heroCarouselRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "hero-carousel@1",
  icon: componentIcons["hero-carousel@1"],
  name: "hero-carousel",
  displayName: "Hero Carousel",
  description:
    "Rotating multi-slide hero, composed via placeholder: drop Hero renderings into the `hero-carousel-{*}` slot and each hero becomes one slide with its full control surface (overlay, heading, media playback, CTAs — including MediaInset/OverlayBreach for inset-photo slides). Carousel-level params: AutoplayInterval (off/4s/6s/8s, pauses on hover/focus, reduced-motion safe), Transition (slide/fade), arrows, indicator dots, loop, IndicatorPlacement (`inside` over the slides, or `below` — dots + arrows on the page background under the band, pairs with inset slides). Use for homepage hero rotators and featured-stories carousels; for a single-slide hero use hero@1.",

  section: { handle: "heros-and-promos-section@1" },

  // Each dropped hero@1 = one slide. Restricted so authors can only
  // drop the right thing.
  dynamicPlaceholders: true,
  placeholders: [
    {
      key: "hero-carousel-{*}",
      allowedRenderingHandles: ["hero@1"],
    },
  ],

  params: [
    // ─── Carousel behavior ────────────────────────────────────────
    {
      name: "AutoplayInterval",
      shape: "enum",
      default: "off",
      sitecore: {
        enumHandle: "autoplay-interval@1",
        hint: "Auto-rotation cadence. `off` (default) requires manual navigation. Autoplay pauses on hover/focus and is disabled under prefers-reduced-motion.",
        section: "Carousel",
        sortOrder: 100,
      },
    },
    {
      name: "Transition",
      shape: "enum",
      default: "slide",
      sitecore: {
        enumHandle: "carousel-transition@1",
        hint: "How slides move between snaps — `slide` scrolls horizontally, `fade` cross-fades in place.",
        section: "Carousel",
        sortOrder: 110,
      },
    },
    {
      name: "ShowArrows",
      shape: "boolean",
      default: "true",
      sitecore: {
        type: "checkbox",
        hint: "Render the previous / next arrow buttons over the slides.",
        section: "Carousel",
        sortOrder: 120,
      },
    },
    {
      name: "ShowIndicators",
      shape: "boolean",
      default: "true",
      sitecore: {
        type: "checkbox",
        hint: "Render the indicator dot rail at the bottom of the band.",
        section: "Carousel",
        sortOrder: 130,
      },
    },
    {
      name: "IndicatorPlacement",
      shape: "enum",
      default: "inside",
      sitecore: {
        enumHandle: "indicator-placement@1",
        hint: "Where the carousel chrome sits: `inside` (default) overlays the dot rail and arrows on the slides; `below` renders dots AND prev/next arrows on the page background under the band — pairs with inset (`MediaInset: contained`/`card`) hero slides.",
        section: "Carousel",
        sortOrder: 135,
      },
    },
    {
      name: "Loop",
      shape: "boolean",
      default: "true",
      sitecore: {
        type: "checkbox",
        hint: "Wrap from the last slide back to the first.",
        section: "Carousel",
        sortOrder: 140,
      },
    },
  ],

  // One rendering variant — the full-bleed rotating treatment. The
  // per-slide design axes live on each composed hero rendering.
  variants: [{ name: "Default" }],
} satisfies ComponentTemplateRecipe;

export default heroCarouselRecipe;
