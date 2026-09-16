/**
 * Per-component Sitecore adapter for `offers-list-grid` — wires the shared
 * offers-family `adaptListGridProps` (Sitecore {fields, params} → flat { items, … })
 * to every variant export so the component map applies it via withSitecore,
 * in the registry preview AND every installed repo. See
 * features-list-grid.sitecore.ts for the rationale; keys mirror the variant
 * export names.
 */
import { adaptListGridProps } from "./offers.sitecore";

export const Grid = adaptListGridProps;
export const Default = adaptListGridProps;
