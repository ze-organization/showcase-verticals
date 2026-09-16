/**
 * Per-component Sitecore adapter for `destinations-list-grid` — wires the shared
 * destinations-family `adaptListGridProps` (Sitecore {fields, params} → flat { items, … })
 * to every variant export so the component map applies it via withSitecore,
 * in the registry preview AND every installed repo. See
 * features-list-grid.sitecore.ts for the rationale; keys mirror the variant
 * export names.
 */
import { adaptListGridProps } from "./destinations.sitecore";

export const Grid = adaptListGridProps;
export const Stacked = adaptListGridProps;
export const Split = adaptListGridProps;
export const Inline = adaptListGridProps;
export const Featured = adaptListGridProps;
export const FiftyFifty = adaptListGridProps;
export const Default = adaptListGridProps;
