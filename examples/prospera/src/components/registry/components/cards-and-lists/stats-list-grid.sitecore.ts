/**
 * Per-component Sitecore adapter for `stats-list-grid` — wires the shared
 * stats-family `adaptListGridProps` (Sitecore `{fields, params}` → flat
 * `{ items, title, … }`) to every variant export so the component map
 * applies it via `withSitecore`. See `features-list-grid.sitecore.ts` for
 * the rationale; keys mirror the variant export names.
 */
import { adaptListGridProps } from "./stats.sitecore";

export const Default = adaptListGridProps;
export const Grid = adaptListGridProps;
// FlankedLabels was added to the component without a matching adapter
// entry — the convention map then delivered `stats` instead of
// `items`, so curated stats rendered empty on that variant.
export const FlankedLabels = adaptListGridProps;
export const Milestones = adaptListGridProps;
