/**
 * Per-component Sitecore adapter for `locations-list-grid` — wires the shared
 * locations-family `adaptListGridProps` (Sitecore {fields, params} → flat { items, … })
 * to every variant export so the component map applies it via withSitecore,
 * in the registry preview AND every installed repo. See
 * features-list-grid.sitecore.ts for the rationale; keys mirror the variant
 * export names.
 */
import { adaptListGridProps } from "./locations.sitecore";

export const Grid = adaptListGridProps;
export const List = adaptListGridProps;
export const MapAndList = adaptListGridProps;
export const MapAbove = adaptListGridProps;
export const MapWithSidebar = adaptListGridProps;
export const Default = adaptListGridProps;
