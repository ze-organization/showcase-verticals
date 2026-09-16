/**
 * Per-component Sitecore adapter for `pricing-carousel` — wires the shared
 * pricing-family `adaptCarouselProps` (Sitecore {fields, params} → flat { items, … })
 * to every variant export so the component map applies it via withSitecore,
 * in the registry preview AND every installed repo. See
 * features-list-grid.sitecore.ts for the rationale; keys mirror the variant
 * export names.
 */
import { adaptCarouselProps } from "./pricing.sitecore";

export const Default = adaptCarouselProps;
export const FullBleed = adaptCarouselProps;
export const FeatureSpotlight = adaptCarouselProps;
