/**
 * Per-component Sitecore adapter for `articles-carousel` — wires the shared
 * articles-family `adaptCarouselProps` (Sitecore {fields, params} → flat { items, … })
 * to every variant export so the component map applies it via withSitecore,
 * in the registry preview AND every installed repo. See
 * features-list-grid.sitecore.ts for the rationale; keys mirror the variant
 * export names.
 */
import { adaptCarouselProps } from "./articles.sitecore";

export const Default = adaptCarouselProps;
export const FullBleed = adaptCarouselProps;
export const WithPreviewBelow = adaptCarouselProps;
export const Hero = adaptCarouselProps;
export const FeatureSpotlight = adaptCarouselProps;
// VerticalSplit was added to the component without a matching adapter
// entry — the convention map then delivered `articles` instead of
// `items`, so curated articles rendered empty on that variant.
export const VerticalSplit = adaptCarouselProps;
