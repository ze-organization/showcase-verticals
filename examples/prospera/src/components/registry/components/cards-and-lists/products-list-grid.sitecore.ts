/**
 * Per-component Sitecore adapter for `products-list-grid` — wires the shared
 * products-family `adaptListGridProps` (Sitecore {fields, params} → flat { items, … })
 * to every variant export so the component map applies it via withSitecore,
 * in the registry preview AND every installed repo. See
 * features-list-grid.sitecore.ts for the rationale; keys mirror the variant
 * export names.
 */
import { adaptListGridProps } from "./products.sitecore";

export const Grid = adaptListGridProps;
export const Featured = adaptListGridProps;
export const FiftyFifty = adaptListGridProps;
export const NoSpacing = adaptListGridProps;
export const Default = adaptListGridProps;
