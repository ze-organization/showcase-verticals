/**
 * Per-component Sitecore adapter for `reviews-carousel` — wires the shared
 * reviews-family `adaptCarouselProps` (Sitecore {fields, params} → flat { items, … })
 * to every variant export so the component map applies it via withSitecore,
 * in the registry preview AND every installed repo. See
 * features-list-grid.sitecore.ts for the rationale; keys mirror the variant
 * export names.
 */
import { adaptCarouselProps } from "./reviews.sitecore";

export const CarouselCard = adaptCarouselProps;
export const CarouselQuote = adaptCarouselProps;
export const FullBleed = adaptCarouselProps;
export const Hero = adaptCarouselProps;
export const FeatureSpotlight = adaptCarouselProps;
export const Default = adaptCarouselProps;
