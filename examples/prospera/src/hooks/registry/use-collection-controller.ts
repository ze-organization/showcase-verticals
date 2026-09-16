"use client";

import { useEffect, useMemo, useState } from "react";
import type { FacetListVariant } from "@/components/registry/blocks/facet-list";
import type { QuickSearchListItem } from "@/components/registry/blocks/quick-search-list";
import type {
  ResultControlsDensity,
  ResultControlsProps,
  ResultControlsSurface,
} from "@/components/registry/blocks/result-controls";
import type {
  SearchFacet,
  SearchSortOption,
} from "@/components/registry/blocks/types";

/**
 * Selected list facet values keyed by facet id.
 */
export type CollectionFacetValueSelections = Record<string, Set<string>>;

/**
 * Selected range facet values keyed by facet id.
 */
export type CollectionFacetRangeSelections = Record<
  string,
  { min: number; max: number }
>;

/**
 * Context payload passed to facet predicate evaluation.
 */
export interface CollectionFacetPredicateContext {
  selectedFacetValues: CollectionFacetValueSelections;
  selectedFacetRanges: CollectionFacetRangeSelections;
}

/**
 * Configuration options for the generic collection controller hook.
 */
export interface UseCollectionControllerOptions<
  TItem,
  TSortValue extends string = string,
> {
  items: TItem[];
  initialQuery?: string;
  initialSortValue?: TSortValue;
  initialPage?: number;
  initialPageSize?: number;
  defaultSelectedFacetValues?: Record<string, string[]>;
  defaultSelectedFacetRanges?: CollectionFacetRangeSelections;
  searchPredicate?: (item: TItem, normalizedQuery: string) => boolean;
  facetPredicate?: (
    item: TItem,
    context: CollectionFacetPredicateContext,
  ) => boolean;
  sorters?: Partial<Record<TSortValue, (a: TItem, b: TItem) => number>>;
}

/**
 * Options used to map collection state/handlers to ResultControls props.
 */
export interface CollectionResultControlsOptions {
  surface?: ResultControlsSurface;
  density?: ResultControlsDensity;
  className?: string;
  view?: {
    enabled?: boolean;
    value?: "list" | "grid";
    defaultValue?: "list" | "grid";
    onChange?: (value: "list" | "grid") => void;
  };
  search?: {
    enabled?: boolean;
    placeholder?: string;
  };
  sort?: {
    enabled?: boolean;
    options?: SearchSortOption[];
    showLabel?: boolean;
    label?: string;
    surface?: "plain" | "field";
  };
  filters?: {
    enabled?: boolean;
    placement?: "inline" | "sidebar";
    buttonLabel?: string;
    facetListVariant?: FacetListVariant;
    facets?: SearchFacet[];
    quickSearch?: {
      enabled?: boolean;
      title?: string;
      items?: QuickSearchListItem[];
      className?: string;
    };
  };
  resultsPerPage?: {
    enabled?: boolean;
    options?: number[];
    showLabel?: boolean;
    label?: string;
    surface?: "plain" | "field";
    className?: string;
  };
  resultCount?: {
    enabled?: boolean;
    className?: string;
  };
}

/**
 * Return model for `useCollectionController`.
 */
export interface CollectionControllerState<TItem, TSortValue extends string> {
  query: string;
  setQuery: (value: string) => void;
  sortValue: TSortValue | "";
  setSortValue: (value: TSortValue) => void;
  pageSize: number;
  setPageSize: (value: number) => void;
  currentPage: number;
  setCurrentPage: (value: number) => void;
  selectedFacetValues: CollectionFacetValueSelections;
  selectedFacetRanges: CollectionFacetRangeSelections;
  toggleFacetValue: (
    facetId: string,
    valueId: string,
    nextChecked?: boolean,
  ) => void;
  setFacetRange: (
    facetId: string,
    nextRange: { min: number; max: number } | null | undefined,
  ) => void;
  clearFacet: (facetId: string) => void;
  clearAllFacets: () => void;
  resetAll: () => void;
  filteredItems: TItem[];
  pagedItems: TItem[];
  totalItems: number;
  totalPages: number;
  resultRange: {
    start: number;
    end: number;
  };
  createResultControlsProps: (
    options?: CollectionResultControlsOptions,
  ) => ResultControlsProps;
}

/**
 * Builds shared state/derived values for client-side collection experiences.
 * This hook is presentation-agnostic and can back grids, listings, and carousels.
 */
export function useCollectionController<
  TItem,
  TSortValue extends string = string,
>({
  items,
  initialQuery = "",
  initialSortValue,
  initialPage = 1,
  initialPageSize = 10,
  defaultSelectedFacetValues,
  defaultSelectedFacetRanges,
  searchPredicate,
  facetPredicate,
  sorters,
}: UseCollectionControllerOptions<
  TItem,
  TSortValue
>): CollectionControllerState<TItem, TSortValue> {
  const [query, setQueryState] = useState(initialQuery);
  const [sortValue, setSortValueState] = useState<TSortValue | "">(
    initialSortValue ?? "",
  );
  const [pageSize, setPageSizeState] = useState(Math.max(1, initialPageSize));
  const [currentPage, setCurrentPageState] = useState(Math.max(1, initialPage));
  const [selectedFacetValues, setSelectedFacetValues] =
    useState<CollectionFacetValueSelections>(() => {
      if (!defaultSelectedFacetValues) return {};
      return Object.fromEntries(
        Object.entries(defaultSelectedFacetValues).map(
          ([facetId, valueIds]) => [facetId, new Set(valueIds)],
        ),
      );
    });
  const [selectedFacetRanges, setSelectedFacetRanges] =
    useState<CollectionFacetRangeSelections>(defaultSelectedFacetRanges ?? {});

  const normalizedQuery = query.trim().toLowerCase();

  const queryFilteredItems = useMemo(() => {
    if (!searchPredicate || normalizedQuery.length === 0) return items;
    return items.filter((item) => searchPredicate(item, normalizedQuery));
  }, [items, normalizedQuery, searchPredicate]);

  const filteredItems = useMemo(() => {
    if (!facetPredicate) return queryFilteredItems;
    return queryFilteredItems.filter((item) =>
      facetPredicate(item, { selectedFacetValues, selectedFacetRanges }),
    );
  }, [
    facetPredicate,
    queryFilteredItems,
    selectedFacetRanges,
    selectedFacetValues,
  ]);

  const sortedItems = useMemo(() => {
    const comparator = sortValue ? sorters?.[sortValue] : undefined;
    if (!comparator) return filteredItems;
    return [...filteredItems].sort(comparator);
  }, [filteredItems, sorters, sortValue]);

  const totalItems = sortedItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    setCurrentPageState((previousPage) =>
      Math.min(Math.max(previousPage, 1), totalPages),
    );
  }, [totalPages]);

  const pagedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedItems.slice(startIndex, startIndex + pageSize);
  }, [currentPage, pageSize, sortedItems]);

  const resultRange = useMemo(() => {
    if (totalItems === 0) {
      return { start: 0, end: 0 };
    }
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(start + pageSize - 1, totalItems);
    return { start, end };
  }, [currentPage, pageSize, totalItems]);

  const setQuery = (value: string) => {
    setQueryState(value);
    setCurrentPageState(1);
  };

  const setSortValue = (value: TSortValue) => {
    setSortValueState(value);
    setCurrentPageState(1);
  };

  const setPageSize = (value: number) => {
    setPageSizeState(Math.max(1, value));
    setCurrentPageState(1);
  };

  const setCurrentPage = (value: number) => {
    setCurrentPageState(Math.min(Math.max(1, value), totalPages));
  };

  const toggleFacetValue = (
    facetId: string,
    valueId: string,
    nextChecked?: boolean,
  ) => {
    setSelectedFacetValues((previousSelections) => {
      const nextSelections = { ...previousSelections };
      const currentSet = new Set(nextSelections[facetId] ?? []);
      const shouldCheck = nextChecked ?? !currentSet.has(valueId);
      if (shouldCheck) currentSet.add(valueId);
      else currentSet.delete(valueId);
      if (currentSet.size === 0) delete nextSelections[facetId];
      else nextSelections[facetId] = currentSet;
      return nextSelections;
    });
    setCurrentPageState(1);
  };

  const setFacetRange = (
    facetId: string,
    nextRange: { min: number; max: number } | null | undefined,
  ) => {
    setSelectedFacetRanges((previousRanges) => {
      const nextRanges = { ...previousRanges };
      if (!nextRange) delete nextRanges[facetId];
      else nextRanges[facetId] = nextRange;
      return nextRanges;
    });
    setCurrentPageState(1);
  };

  const clearFacet = (facetId: string) => {
    setSelectedFacetValues((previousSelections) => {
      if (!(facetId in previousSelections)) return previousSelections;
      const nextSelections = { ...previousSelections };
      delete nextSelections[facetId];
      return nextSelections;
    });
    setSelectedFacetRanges((previousRanges) => {
      if (!(facetId in previousRanges)) return previousRanges;
      const nextRanges = { ...previousRanges };
      delete nextRanges[facetId];
      return nextRanges;
    });
    setCurrentPageState(1);
  };

  const clearAllFacets = () => {
    setSelectedFacetValues({});
    setSelectedFacetRanges({});
    setCurrentPageState(1);
  };

  const resetAll = () => {
    setQueryState(initialQuery);
    setSortValueState(initialSortValue ?? "");
    setPageSizeState(Math.max(1, initialPageSize));
    setCurrentPageState(Math.max(1, initialPage));
    setSelectedFacetValues(() => {
      if (!defaultSelectedFacetValues) return {};
      return Object.fromEntries(
        Object.entries(defaultSelectedFacetValues).map(
          ([facetId, valueIds]) => [facetId, new Set(valueIds)],
        ),
      );
    });
    setSelectedFacetRanges(defaultSelectedFacetRanges ?? {});
  };

  const createResultControlsProps = (
    options: CollectionResultControlsOptions = {},
  ): ResultControlsProps => ({
    view: {
      enabled: options.view?.enabled ?? false,
      value: options.view?.value,
      defaultValue: options.view?.defaultValue,
      onChange: options.view?.onChange,
    },
    surface: options.surface,
    density: options.density,
    className: options.className,
    search: {
      enabled: options.search?.enabled ?? true,
      value: query,
      placeholder: options.search?.placeholder ?? "Search",
      onChange: setQuery,
    },
    sort: {
      enabled: options.sort?.enabled ?? true,
      value: sortValue,
      options: options.sort?.options,
      onChange: (value) => setSortValue(value as TSortValue),
      showLabel: options.sort?.showLabel,
      label: options.sort?.label,
      surface: options.sort?.surface,
    },
    filters: {
      enabled: options.filters?.enabled ?? true,
      placement: options.filters?.placement ?? "inline",
      buttonLabel: options.filters?.buttonLabel,
      facetListVariant: options.filters?.facetListVariant,
      facets: options.filters?.facets,
      quickSearch: {
        enabled: options.filters?.quickSearch?.enabled ?? false,
        title: options.filters?.quickSearch?.title,
        items: options.filters?.quickSearch?.items,
        className: options.filters?.quickSearch?.className,
        selectedQuery: query,
        onSelect: (nextQuery) => setQuery(nextQuery),
      },
      selectedValues: selectedFacetValues,
      selectedRanges: selectedFacetRanges,
      onValueToggle: toggleFacetValue,
      onRangeChange: setFacetRange,
      onClear: clearAllFacets,
    },
    resultCount: {
      enabled: options.resultCount?.enabled ?? true,
      currentPage,
      itemsPerPage: pageSize,
      totalItemsReturned: pagedItems.length,
      totalItems,
      className: options.resultCount?.className,
    },
    resultsPerPage: {
      enabled: options.resultsPerPage?.enabled ?? true,
      defaultItemsPerPage: pageSize,
      options: options.resultsPerPage?.options ?? [10, 25, 50],
      onChange: setPageSize,
      showLabel: options.resultsPerPage?.showLabel,
      label: options.resultsPerPage?.label,
      surface: options.resultsPerPage?.surface,
      className: options.resultsPerPage?.className,
    },
  });

  return {
    query,
    setQuery,
    sortValue,
    setSortValue,
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    selectedFacetValues,
    selectedFacetRanges,
    toggleFacetValue,
    setFacetRange,
    clearFacet,
    clearAllFacets,
    resetAll,
    filteredItems: sortedItems,
    pagedItems,
    totalItems,
    totalPages,
    resultRange,
    createResultControlsProps,
  };
}
