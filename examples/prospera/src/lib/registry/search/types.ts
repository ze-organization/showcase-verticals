/**
 * Provider-agnostic search contracts.
 *
 * The cards-and-lists family's search-mode renderings store a
 * `SearchConfig` blob on their datasource (authored via the
 * `sai/search-source` Marketplace plugin once that ships; until then,
 * via a string-ID reference to a `search-source@1` content item the
 * resolver looks up). The blob is opaque to the React component — at
 * render time it's handed to `useSearchResults`, which dispatches to a
 * registered `SearchProvider` implementation by `provider` key.
 *
 * The same shape must work for Sitecore Search, Coveo, Algolia, and
 * any custom provider — no Sitecore-specific fields here.
 */

/** Known search providers. `custom` is the escape hatch for in-page item arrays. */
export type SearchProviderKey =
  | "sitecore-search"
  | "coveo"
  | "algolia"
  | "custom";

/**
 * A single AND'd predicate over a facet field.
 *
 * Providers translate `op` to their native filter dialect:
 *   - sitecore-search → facet contains/equals/range
 *   - coveo           → @field=="value" / @field>=min / @field<=max
 *   - algolia         → numericFilters / facetFilters
 *
 * `field` is the provider-side index field, NOT the React-side card prop.
 * Card mapping happens via `mapHit` further down.
 */
export interface SearchFilter {
  field: string;
  op: "eq" | "neq" | "in" | "contains" | "range" | "exists";
  value?: string | number | boolean;
  values?: Array<string | number>;
  min?: number;
  max?: number;
}

export interface SearchSort {
  field: string;
  direction: "asc" | "desc";
}

export interface SearchPersonalization {
  audience?: string;
  ruleSet?: string;
  /** Opaque provider-specific personalization payload. */
  context?: Record<string, unknown>;
}

/**
 * Provider-agnostic search source descriptor. Authored once (via the
 * marketplace plugin's editor) and serialized as the value of the
 * `SearchConfig` field on a search-experience datasource.
 *
 * The `source` field is provider-defined — it might be a Sitecore
 * Search index name, a Coveo organization+source, an Algolia app ID
 * + index pair, or anything the custom adapter understands.
 */
export interface SearchConfig {
  provider: SearchProviderKey;
  source: string;
  freeText?: string;
  filters?: SearchFilter[];
  sort?: SearchSort[];
  personalization?: SearchPersonalization;
  pagination?: {
    resultsPerPage?: number;
    page?: number;
  };
  /**
   * Location query state — drives the locations family + the
   * location-search-bar. The provider does the geocoding
   * (ZIP/city → lat/lng) and distance filtering; the React surface
   * never sees coords until the provider populates them on the
   * response. `lat/lng` here are optional input hints (e.g. when the
   * "use my location" affordance has already resolved them); the
   * provider can skip its geocoding step when present.
   */
  location?: {
    query?: string;
    lat?: number;
    lng?: number;
    radius?: number;
    unit?: "mi" | "km";
  };
  /**
   * Provider-specific extra config that doesn't fit the shared shape.
   * Opaque to the React side — passed through verbatim to the provider
   * adapter.
   */
  providerOptions?: Record<string, unknown>;
}

/**
 * The flat, Sitecore-agnostic shape every card-list React component
 * receives, regardless of which composition mode populated it
 * (composed placeholder children, curated Treelist, search result hit).
 *
 * Adapters on the boundary (`*.sitecore.ts`, search provider clients)
 * are responsible for unwrapping their native shape into this. The
 * component never sees Sitecore field objects, Coveo result shapes, or
 * Algolia hit shapes directly.
 *
 * `extras` is a typed escape hatch for family-specific fields that
 * don't fit the common shape (e.g. a product's price, an offer's
 * discount token). Family card components destructure their needed
 * fields out of extras.
 */
export interface FlatItem<TExtras = unknown> {
  id: string;
  title?: string;
  description?: string;
  image?: {
    src: string;
    alt?: string;
    width?: number;
    height?: number;
  };
  href?: string;
  type?: string;
  /** Family-specific fields the card component reads. */
  extras?: TExtras;
}

/**
 * A facet returned by a search provider — same shape regardless of
 * which provider produced it.
 */
export interface SearchFacetResult {
  id: string;
  label: string;
  type: "list" | "range";
  values?: Array<{ id: string; label: string; count?: number }>;
  range?: { min: number; max: number };
}

/**
 * The result envelope every provider adapter returns.
 */
export interface SearchResultPayload<
  TItem extends FlatItem<unknown> = FlatItem,
> {
  items: TItem[];
  totalItems: number;
  facets: SearchFacetResult[];
}

/**
 * Contract every provider client implements. Implementations live in
 * `src/lib/registry/search/providers/<provider>.ts`. Registered with
 * `registerSearchProvider(key, provider)`.
 */
export interface SearchProvider<TItem extends FlatItem<unknown> = FlatItem> {
  key: SearchProviderKey;
  /**
   * Resolve a `SearchConfig` to a result payload. May run client-side
   * (in-memory provider) or server-side (fetch to a search API
   * endpoint). The hook layer treats all providers as async.
   */
  fetch(
    config: SearchConfig,
    signal?: AbortSignal,
  ): Promise<SearchResultPayload<TItem>>;
}

/**
 * State exposed by `useSearchResults`. Mirrors the state of the
 * `useCollectionController` hook so the same bar renderings (search-bar,
 * sort-dropdown, pagination, etc.) can consume either via shared
 * `SearchControllerContext` regardless of whether items came from a
 * curated Treelist or a search provider.
 */
export interface SearchControllerState<
  TItem extends FlatItem<unknown> = FlatItem,
> {
  /** True while the provider is fetching. */
  isLoading: boolean;
  /** Provider error, if any. */
  error: Error | null;
  /** Items for the current page. */
  pagedItems: TItem[];
  /** Filtered items across all pages (provider-applied filters). */
  filteredItems: TItem[];
  /** Total result count from the provider. */
  totalItems: number;
  /** Page-size and page state — bound to `Pagination` rendering. */
  currentPage: number;
  totalPages: number;
  pageSize: number;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  /** Free-text query state — bound to `SearchBar` rendering. */
  query: string;
  setQuery: (value: string) => void;
  /** Sort state — bound to `SortDropdown` rendering. */
  sortValue: string;
  setSortValue: (value: string) => void;
  /** Facets returned by the provider — bound to `FilterPanel` rendering. */
  facets: SearchFacetResult[];
  selectedFacetValues: Record<string, Set<string>>;
  selectedFacetRanges: Record<string, { min: number; max: number }>;
  toggleFacetValue: (
    facetId: string,
    valueId: string,
    nextChecked?: boolean,
  ) => void;
  setFacetRange: (
    facetId: string,
    nextRange: { min: number; max: number } | null,
  ) => void;
  clearAllFacets: () => void;
  /** View shape — bound to `ViewToggle` rendering. */
  view: "grid" | "list";
  setView: (next: "grid" | "list") => void;
  /** Range summary for `ResultsSummary` rendering. */
  resultRange: { start: number; end: number };
  /**
   * Location query state — bound to `LocationSearchBar` and consumed
   * by map renderings + the locations family. Coords get populated by
   * the provider response (round-trip from a ZIP/city query); the
   * "use my location" affordance pre-fills `lat/lng` to skip the
   * geocoding step.
   */
  location: {
    query: string;
    lat?: number;
    lng?: number;
    radius?: number;
    unit: "mi" | "km";
  };
  setLocationQuery: (query: string) => void;
  setLocationCoords: (coords: { lat: number; lng: number } | null) => void;
  setLocationRadius: (radius: number | null) => void;
  setLocationUnit: (unit: "mi" | "km") => void;
  clearLocation: () => void;
  /**
   * True when the wrapper has a real `SearchConfig` (index / provider).
   * False when the controller is only a shell — inner listings may
   * seed curated Treelist items via {@link replaceItems}.
   */
  hasSource: boolean;
  /**
   * Push curated Treelist items into an empty wrapper so search bars
   * can filter/sort/page them in-memory (`custom` provider).
   */
  replaceItems: (items: FlatItem[]) => void;
}
