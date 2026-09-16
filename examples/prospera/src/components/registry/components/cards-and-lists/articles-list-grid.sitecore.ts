/**
 * Per-component Sitecore adapter for `articles-list-grid` — wires the shared
 * articles-family `adaptListGridProps` (Sitecore {fields, params} → flat { items, … })
 * to every variant export so the component map applies it via withSitecore,
 * in the registry preview AND every installed repo. See
 * features-list-grid.sitecore.ts for the rationale; keys mirror the variant
 * export names.
 */
import { adaptListGridProps } from "./articles.sitecore";

export const Grid = adaptListGridProps;
export const List = adaptListGridProps;
export const Cards = adaptListGridProps;
export const Featured = adaptListGridProps;
export const FiftyFifty = adaptListGridProps;
export const Default = adaptListGridProps;
// FeaturedList was added to the component without a matching adapter
// entry — the convention map then delivered `articles` instead of
// `items`, so curated articles rendered empty on that variant.
export const FeaturedList = adaptListGridProps;
