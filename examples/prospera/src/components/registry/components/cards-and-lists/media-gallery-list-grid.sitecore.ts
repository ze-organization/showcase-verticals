/**
 * Per-component Sitecore adapter for `media-gallery-list-grid` — wires the
 * shared media-gallery-family `adaptListGridProps` (Sitecore `{fields,
 * params}` → flat `{ items, title, … }`) to every variant export so the
 * component map applies it via `withSitecore`. See
 * `features-list-grid.sitecore.ts` for the rationale; keys mirror the
 * variant export names.
 */
import { adaptListGridProps } from "./media-gallery.sitecore";

export const Default = adaptListGridProps;
export const Grid = adaptListGridProps;
export const NoSpacing = adaptListGridProps;
export const FiftyFifty = adaptListGridProps;
export const Featured = adaptListGridProps;
export const TwistedMixedMedia = adaptListGridProps;
export const List = adaptListGridProps;
