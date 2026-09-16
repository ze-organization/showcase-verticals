"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getSearchProvider } from "./registry";
import type {
  FlatItem,
  SearchConfig,
  SearchControllerState,
  SearchFacetResult,
} from "./types";

/**
 * Provider-agnostic search hook. Dispatches a `SearchConfig` to the
 * registered provider client (`SearchProvider.fetch`) and exposes
 * controller state matching the existing `useCollectionController`
 * shape — so the same bar renderings (search-bar, sort-dropdown,
 * filter-panel, pagination) work over search-mode results without
 * branching on data source.
 *
 * Provider clients control the actual filter/sort/pagination semantics:
 * a Sitecore Search backend applies them server-side and returns one
 * page; the `custom` in-memory provider returns the full list and lets
 * the controller layer apply them client-side. The bar renderings
 * don't need to know which — they read state, fire setters.
 */
export function useSearchResults<TItem extends FlatItem = FlatItem>(
  config: SearchConfig | undefined,
  options?: {
    initialPageSize?: number;
    initialSort?: string;
    initialView?: "grid" | "list";
  },
): SearchControllerState<TItem> {
  const [items, setItems] = useState<TItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [facets, setFacets] = useState<SearchFacetResult[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(config));
  const [error, setError] = useState<Error | null>(null);

  const [query, setQueryState] = useState(config?.freeText ?? "");
  const [sortValue, setSortValueState] = useState(options?.initialSort ?? "");
  const [pageSize, setPageSizeState] = useState(
    options?.initialPageSize ?? config?.pagination?.resultsPerPage ?? 12,
  );
  const [currentPage, setCurrentPageState] = useState(
    config?.pagination?.page ?? 1,
  );
  const [view, setView] = useState<"grid" | "list">(
    options?.initialView ?? "grid",
  );
  const [selectedFacetValues, setSelectedFacetValues] = useState<
    Record<string, Set<string>>
  >({});
  const [selectedFacetRanges, setSelectedFacetRanges] = useState<
    Record<string, { min: number; max: number }>
  >({});
  const [location, setLocation] = useState<{
    query: string;
    lat?: number;
    lng?: number;
    radius?: number;
    unit: "mi" | "km";
  }>({
    query: config?.location?.query ?? "",
    lat: config?.location?.lat,
    lng: config?.location?.lng,
    radius: config?.location?.radius,
    unit: config?.location?.unit ?? "mi",
  });

  const [seededItems, setSeededItems] = useState<TItem[]>([]);

  const abortRef = useRef<AbortController | null>(null);

  const replaceItems = useCallback((next: FlatItem[]) => {
    setSeededItems((prev) => {
      const cast = next as TItem[];
      if (
        prev.length === cast.length &&
        prev.every((item, i) => item.id === cast[i]?.id)
      ) {
        return prev;
      }
      return cast;
    });
  }, []);

  // Re-fire the fetch on config *content* changes, not reference identity.
  // Callers commonly pass a fresh `config` object literal each render; keying
  // the effect on the serialized config (a value-equal string) instead of the
  // object avoids an abort→fetch→setState→re-render→new-object→re-fire loop.
  const configKey = config ? JSON.stringify(config) : null;

  // biome-ignore lint/correctness/useExhaustiveDependencies: keyed on `configKey` (serialized config) rather than the `config` reference, so an unstable-reference config does not re-fire the effect every render.
  useEffect(() => {
    if (!config) {
      if (seededItems.length === 0) {
        setItems([]);
        setTotalItems(0);
        setFacets([]);
        setIsLoading(false);
        setError(null);
        return;
      }
      const provider = getSearchProvider("custom");
      if (!provider) {
        setItems(seededItems);
        setTotalItems(seededItems.length);
        setFacets([]);
        setIsLoading(false);
        setError(null);
        return;
      }
      abortRef.current?.abort();
      const seedController = new AbortController();
      abortRef.current = seedController;
      const requestConfig: SearchConfig = {
        provider: "custom",
        source: "treelist",
        freeText: query.length > 0 ? query : undefined,
        sort: sortValue
          ? [{ field: sortValue, direction: "desc" }]
          : undefined,
        filters: buildFiltersFromSelections(
          selectedFacetValues,
          selectedFacetRanges,
        ),
        pagination: {
          resultsPerPage: pageSize,
          page: currentPage,
        },
        location:
          location.query || location.lat != null || location.radius != null
            ? {
                query: location.query || undefined,
                lat: location.lat,
                lng: location.lng,
                radius: location.radius,
                unit: location.unit,
              }
            : undefined,
        providerOptions: { items: seededItems },
      };
      setIsLoading(true);
      setError(null);
      provider
        .fetch(requestConfig, seedController.signal)
        .then((payload) => {
          if (seedController.signal.aborted) return;
          setItems(payload.items as TItem[]);
          setTotalItems(payload.totalItems);
          setFacets(payload.facets);
          setIsLoading(false);
        })
        .catch((err: unknown) => {
          if (seedController.signal.aborted) return;
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsLoading(false);
        });
      return () => {
        seedController.abort();
      };
    }
    const provider = getSearchProvider(config.provider);
    if (!provider) {
      setItems([]);
      setTotalItems(0);
      setFacets([]);
      setIsLoading(false);
      setError(
        new Error(
          `No search provider registered for "${config.provider}". Register one via @/lib/registry/search/registry.`,
        ),
      );
      return;
    }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const requestConfig: SearchConfig = {
      ...config,
      freeText: query.length > 0 ? query : config.freeText,
      sort: sortValue
        ? [{ field: sortValue, direction: "desc" }, ...(config.sort ?? [])]
        : config.sort,
      filters: [
        ...(config.filters ?? []),
        ...buildFiltersFromSelections(selectedFacetValues, selectedFacetRanges),
      ],
      pagination: {
        resultsPerPage: pageSize,
        page: currentPage,
      },
      location:
        location.query || location.lat != null || location.radius != null
          ? {
              query: location.query || undefined,
              lat: location.lat,
              lng: location.lng,
              radius: location.radius,
              unit: location.unit,
            }
          : config.location,
    };

    setIsLoading(true);
    setError(null);
    provider
      .fetch(requestConfig, controller.signal)
      .then((payload) => {
        if (controller.signal.aborted) return;
        setItems(payload.items as TItem[]);
        setTotalItems(payload.totalItems);
        setFacets(payload.facets);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [
    configKey,
    seededItems,
    query,
    sortValue,
    pageSize,
    currentPage,
    selectedFacetValues,
    selectedFacetRanges,
    location.query,
    location.lat,
    location.lng,
    location.radius,
    location.unit,
  ]);

  const setQuery = useCallback((value: string) => {
    setQueryState(value);
    setCurrentPageState(1);
  }, []);

  const setSortValue = useCallback((value: string) => {
    setSortValueState(value);
    setCurrentPageState(1);
  }, []);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(Math.max(1, size));
    setCurrentPageState(1);
  }, []);

  const setCurrentPage = useCallback((page: number) => {
    setCurrentPageState(Math.max(1, page));
  }, []);

  const toggleFacetValue = useCallback(
    (facetId: string, valueId: string, nextChecked?: boolean) => {
      setSelectedFacetValues((prev) => {
        const next = { ...prev };
        const current = new Set(next[facetId] ?? []);
        const shouldCheck = nextChecked ?? !current.has(valueId);
        if (shouldCheck) current.add(valueId);
        else current.delete(valueId);
        if (current.size === 0) delete next[facetId];
        else next[facetId] = current;
        return next;
      });
      setCurrentPageState(1);
    },
    [],
  );

  const setFacetRange = useCallback(
    (facetId: string, nextRange: { min: number; max: number } | null) => {
      setSelectedFacetRanges((prev) => {
        const next = { ...prev };
        if (!nextRange) delete next[facetId];
        else next[facetId] = nextRange;
        return next;
      });
      setCurrentPageState(1);
    },
    [],
  );

  const clearAllFacets = useCallback(() => {
    setSelectedFacetValues({});
    setSelectedFacetRanges({});
    setCurrentPageState(1);
  }, []);

  const setLocationQuery = useCallback((next: string) => {
    setLocation((prev) => ({
      ...prev,
      query: next,
      lat: undefined,
      lng: undefined,
    }));
    setCurrentPageState(1);
  }, []);

  const setLocationCoords = useCallback(
    (coords: { lat: number; lng: number } | null) => {
      setLocation((prev) => ({
        ...prev,
        lat: coords?.lat,
        lng: coords?.lng,
      }));
      setCurrentPageState(1);
    },
    [],
  );

  const setLocationRadius = useCallback((radius: number | null) => {
    setLocation((prev) => ({
      ...prev,
      radius: radius ?? undefined,
    }));
    setCurrentPageState(1);
  }, []);

  const setLocationUnit = useCallback((unit: "mi" | "km") => {
    setLocation((prev) => ({ ...prev, unit }));
  }, []);

  const clearLocation = useCallback(() => {
    setLocation({ query: "", unit: location.unit });
    setCurrentPageState(1);
  }, [location.unit]);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const resultRange = useMemo(() => {
    if (totalItems === 0) return { start: 0, end: 0 };
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(start + pageSize - 1, totalItems);
    return { start, end };
  }, [currentPage, pageSize, totalItems]);

  return {
    isLoading,
    error,
    pagedItems: items,
    filteredItems: items,
    totalItems,
    currentPage,
    totalPages,
    pageSize,
    setCurrentPage,
    setPageSize,
    query,
    setQuery,
    sortValue,
    setSortValue,
    facets,
    selectedFacetValues,
    selectedFacetRanges,
    toggleFacetValue,
    setFacetRange,
    clearAllFacets,
    view,
    setView,
    resultRange,
    location,
    setLocationQuery,
    setLocationCoords,
    setLocationRadius,
    setLocationUnit,
    clearLocation,
    hasSource: Boolean(config),
    replaceItems,
  };
}

function buildFiltersFromSelections(
  values: Record<string, Set<string>>,
  ranges: Record<string, { min: number; max: number }>,
) {
  const filters: Array<{
    field: string;
    op: "in" | "range";
    values?: string[];
    min?: number;
    max?: number;
  }> = [];
  for (const [field, valueSet] of Object.entries(values)) {
    if (valueSet.size === 0) continue;
    filters.push({
      field,
      op: "in",
      values: Array.from(valueSet),
    });
  }
  for (const [field, range] of Object.entries(ranges)) {
    filters.push({
      field,
      op: "range",
      min: range.min,
      max: range.max,
    });
  }
  return filters;
}
