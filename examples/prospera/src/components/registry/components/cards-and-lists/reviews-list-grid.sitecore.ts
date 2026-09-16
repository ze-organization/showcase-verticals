/**
 * Per-component Sitecore adapter for `reviews-list-grid` — wires the shared
 * reviews-family `adaptListGridProps` (Sitecore {fields, params} → flat { items, … })
 * to every variant export so the component map applies it via withSitecore,
 * in the registry preview AND every installed repo. See
 * features-list-grid.sitecore.ts for the rationale; keys mirror the variant
 * export names.
 */
import { adaptListGridProps } from "./reviews.sitecore";

export const GridCard = adaptListGridProps;
export const GridQuote = adaptListGridProps;
export const ListQuote = adaptListGridProps;
export const Default = adaptListGridProps;
