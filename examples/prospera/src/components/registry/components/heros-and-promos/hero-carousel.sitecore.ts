/**
 * Sitecore adapter for `hero-carousel@1` — unwraps the Layout-Service
 * `{ fields, params }` envelope into the flat `HeroCarouselProps` the
 * React rendering consumes.
 *
 * The authoring model is placeholder composition (`hero-carousel-{*}`
 * carries `hero@1` renderings, one per slide) — the adapter's job for
 * that path is just forwarding `rendering` + `DynamicPlaceholderId`.
 */

import type { SitecoreInput } from "@/lib/registry/with-sitecore";
import type { HeroCarouselProps } from "./hero-carousel";

// The rendering carries no datasource fields — slides are placeholder-composed
// `hero@1` renderings resolved from `rendering.placeholders`.
export type HeroCarouselFields = Record<string, never>;

export function mapHeroCarousel({
  params,
  isEditing,
  rendering,
}: SitecoreInput<HeroCarouselFields>): HeroCarouselProps {
  return {
    // Placeholder-composed path: the component resolves hero children
    // from `rendering.placeholders["hero-carousel-<n>"]`.
    rendering,
    dynamicPlaceholderId: params?.DynamicPlaceholderId,

    autoplayInterval: params?.AutoplayInterval,
    transition: params?.Transition,
    showIndicators: params?.ShowIndicators,
    showArrows: params?.ShowArrows,
    indicatorPlacement: params?.IndicatorPlacement,
    loop: params?.Loop,

    id: params?.RenderingIdentifier,
    styles: params?.styles,
    isEditing,
  };
}

// Sitecore's variant lookup resolves the export matching the recipe's
// `variants[]` names — `Default` here.
export { mapHeroCarousel as Default };
