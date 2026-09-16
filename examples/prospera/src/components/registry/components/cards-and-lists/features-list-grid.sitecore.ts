/**
 * Per-component Sitecore adapter for `features-list-grid`. Wires the shared
 * features-family adapter (`adaptListGridProps`: Sitecore `{fields, params}`
 * → flat `{ items, title, columns… }`) to EVERY variant export, so the
 * generated component map applies it via `withSitecore` — in the registry
 * preview AND every installed repo (both run the same component-map
 * template, which keys adapters off this sibling `<component>.sitecore.ts`).
 *
 * Without this sibling the map falls back to `flattenLinkedItems`, which
 * produces a `features` prop the component never reads (it reads `items`),
 * so curated grids render empty. Keys mirror the component's variant export
 * names — see `SitecoreAdapter` in `with-sitecore`.
 */
import { adaptListGridProps } from "./features.sitecore";

export const Default = adaptListGridProps;
export const Grid = adaptListGridProps;
export const NumberedGrid = adaptListGridProps;
export const MediaBanded = adaptListGridProps;
export const MediaStacked = adaptListGridProps;
export const IconTile = adaptListGridProps;
// HorizontalRows / OverlayPanel were added to the component without
// matching adapter entries — the convention map then delivered
// `features` instead of `items`, so curated features rendered empty
// on those variants.
export const HorizontalRows = adaptListGridProps;
export const OverlayPanel = adaptListGridProps;
