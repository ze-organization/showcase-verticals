/**
 * Per-component Sitecore adapter for `person-list-grid` — wires the shared
 * person-family `adaptListGridProps` (Sitecore {fields, params} → flat { items, … })
 * to every variant export so the component map applies it via withSitecore,
 * in the registry preview AND every installed repo. See
 * features-list-grid.sitecore.ts for the rationale; keys mirror the variant
 * export names.
 */
import { adaptListGridProps } from "./persons.sitecore";

export const Grid = adaptListGridProps;
export const List = adaptListGridProps;
export const Cards = adaptListGridProps;
export const Featured = adaptListGridProps;
export const FiftyFifty = adaptListGridProps;
export const Default = adaptListGridProps;
