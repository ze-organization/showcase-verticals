"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/registry/primitives/core/button";
import { cn } from "@/lib/registry/cn";
import { CardViewSwitcher } from "./card-view-switcher";
import type { FacetListVariant } from "./facet-list";
import { FacetFilterControl } from "./facet-list";
import { QueryResultsSummary } from "./query-results-summary";
import type { QuickSearchListItem } from "./quick-search-list";
import { ResultsPerPage } from "./results-per-page";
import { SearchBar } from "./search-bar";
import { SortOrder } from "./sort-order";
import type { SearchFacet, SearchSortOption } from "./types";

export type ResultControlsSurface = "card" | "muted" | "inner" | "none";
export type ResultControlsDensity = "comfortable" | "compact";

export interface ResultControlsSearchConfig {
  enabled?: boolean;
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
}

export interface ResultControlsSortConfig {
  enabled?: boolean;
  value?: string;
  options?: SearchSortOption[];
  onChange?: (value: string) => void;
  showLabel?: boolean;
  label?: string;
  surface?: "plain" | "field";
}

export interface ResultControlsFiltersConfig {
  enabled?: boolean;
  placement?: "inline" | "sidebar";
  buttonLabel?: string;
  facetListVariant?: FacetListVariant;
  chips?: Array<{ id: string; label: string }>;
  facets?: SearchFacet[];
  selectedValues?: Record<string, Set<string>>;
  selectedRanges?: Record<string, { min: number; max: number }>;
  onValueToggle?: (
    facetId: string,
    valueId: string,
    nextChecked: boolean,
  ) => void;
  onRangeChange?: (
    facetId: string,
    nextRange: { min: number; max: number },
  ) => void;
  onOpen?: () => void;
  onRemoveChip?: (id: string) => void;
  onClear?: () => void;
  quickSearch?: {
    enabled?: boolean;
    title?: string;
    items?: QuickSearchListItem[];
    selectedQuery?: string;
    onSelect?: (query: string, item: QuickSearchListItem) => void;
    className?: string;
  };
}

export interface ResultControlsViewConfig {
  enabled?: boolean;
  value?: "list" | "grid";
  defaultValue?: "list" | "grid";
  onChange?: (value: "list" | "grid") => void;
}

export interface ResultControlsResultCountConfig {
  enabled?: boolean;
  label?: string;
  currentPage?: number;
  itemsPerPage?: number;
  totalItemsReturned?: number;
  totalItems?: number;
  className?: string;
}

export interface ResultControlsResultsPerPageConfig {
  enabled?: boolean;
  defaultItemsPerPage?: number;
  options?: number[];
  onChange?: (value: number) => void;
  showLabel?: boolean;
  label?: string;
  surface?: "plain" | "field";
  className?: string;
}

export interface ResultControlsProps {
  surface?: ResultControlsSurface;
  density?: ResultControlsDensity;
  search?: ResultControlsSearchConfig;
  sort?: ResultControlsSortConfig;
  filters?: ResultControlsFiltersConfig;
  view?: ResultControlsViewConfig;
  resultCount?: ResultControlsResultCountConfig;
  resultsPerPage?: ResultControlsResultsPerPageConfig;
  className?: string;
}

type FilterChip = { id: string; label: string };

/** Either the detailed page/total summary, or a plain results label. */
function renderResultsSummary(
  resultCount: ResultControlsResultCountConfig | undefined,
  density: ResultControlsDensity,
) {
  const hasFullCounts =
    resultCount?.currentPage != null &&
    resultCount?.itemsPerPage != null &&
    resultCount?.totalItemsReturned != null &&
    resultCount?.totalItems != null;

  if (hasFullCounts && resultCount) {
    return (
      <QueryResultsSummary
        currentPage={resultCount.currentPage as number}
        itemsPerPage={resultCount.itemsPerPage as number}
        totalItemsReturned={resultCount.totalItemsReturned as number}
        totalItems={resultCount.totalItems as number}
        tone="default"
        density={density}
        className={resultCount.className}
      />
    );
  }

  return (
    <p className={cn("text-muted-foreground text-sm", resultCount?.className)}>
      {resultCount?.label ?? "24 results"}
    </p>
  );
}

/** Resolve the container's surface/background classes. */
function resolveSurfaceClassName(surface: ResultControlsSurface): string {
  if (surface === "inner" || surface === "none") return "bg-transparent p-0";
  if (surface === "muted") return "bg-muted/30 p-3";
  return "border border-border bg-card p-3";
}

interface InlineFiltersSectionProps {
  filters: ResultControlsFiltersConfig | undefined;
  hasFacetFilters: boolean;
  activeFilterChips: FilterChip[];
  setActiveFilterChips: React.Dispatch<React.SetStateAction<FilterChip[]>>;
}

/** The inline filter control: faceted control, or a Filter button + chips. */
function InlineFiltersSection({
  filters,
  hasFacetFilters,
  activeFilterChips,
  setActiveFilterChips,
}: InlineFiltersSectionProps) {
  if (hasFacetFilters) {
    return (
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        <FacetFilterControl
          facets={filters?.facets ?? []}
          buttonLabel={filters?.buttonLabel}
          facetListVariant={filters?.facetListVariant}
          selectedValues={filters?.selectedValues}
          selectedRanges={filters?.selectedRanges}
          onValueToggle={filters?.onValueToggle}
          onRangeChange={filters?.onRangeChange}
          onOpen={filters?.onOpen}
          onRemoveChip={filters?.onRemoveChip}
          onClear={filters?.onClear}
        />
      </div>
    );
  }

  const removeChip = (chip: FilterChip) => {
    setActiveFilterChips((prev) => prev.filter((item) => item.id !== chip.id));
    filters?.onRemoveChip?.(chip.id);
  };

  const clearChips = () => {
    setActiveFilterChips([]);
    filters?.onClear?.();
  };

  return (
    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        colorScheme="neutral"
        onClick={filters?.onOpen}
      >
        {filters?.buttonLabel ?? "Filter"}
      </Button>
      {activeFilterChips.map((chip) => (
        <Button
          key={chip.id}
          type="button"
          variant="ghost"
          size="sm"
          colorScheme="neutral"
          className="h-7 rounded-full border border-border px-2 text-xs"
          onClick={() => removeChip(chip)}
        >
          {chip.label} x
        </Button>
      ))}
      {activeFilterChips.length > 0 ? (
        <Button
          type="button"
          variant="link"
          size="sm"
          colorScheme="neutral"
          onClick={clearChips}
        >
          Clear
        </Button>
      ) : null}
    </div>
  );
}

interface TrailingControlsSectionProps {
  view: ResultControlsViewConfig | undefined;
  viewEnabled: boolean;
  viewValue: "list" | "grid";
  setViewValue: React.Dispatch<React.SetStateAction<"list" | "grid">>;
  sort: ResultControlsSortConfig | undefined;
  sortEnabled: boolean;
  sortValue: string;
  setSortValue: React.Dispatch<React.SetStateAction<string>>;
  resultsPerPage: ResultControlsResultsPerPageConfig | undefined;
  resultsPerPageEnabled: boolean;
  density: ResultControlsDensity;
}

/** The right-aligned cluster: view switcher, sort, and results-per-page. */
function TrailingControlsSection({
  view,
  viewEnabled,
  viewValue,
  setViewValue,
  sort,
  sortEnabled,
  sortValue,
  setSortValue,
  resultsPerPage,
  resultsPerPageEnabled,
  density,
}: TrailingControlsSectionProps) {
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2">
      {viewEnabled ? (
        <CardViewSwitcher
          value={viewValue}
          defaultCardView={view?.defaultValue ?? "grid"}
          onToggle={(nextValue) => {
            const next = nextValue === "list" ? "list" : "grid";
            setViewValue(next);
            view?.onChange?.(next);
          }}
        />
      ) : null}

      {sortEnabled ? (
        <SortOrder
          options={sort?.options ?? []}
          selected={sortValue}
          onChange={(value) => {
            setSortValue(value);
            sort?.onChange?.(value);
          }}
          showLabel={sort?.showLabel ?? true}
          label={sort?.label ?? "Sort"}
          surface={sort?.surface ?? "plain"}
          density={density}
        />
      ) : null}

      {resultsPerPageEnabled ? (
        <ResultsPerPage
          defaultItemsPerPage={resultsPerPage?.defaultItemsPerPage}
          options={resultsPerPage?.options ?? [10, 25, 50]}
          onChange={resultsPerPage?.onChange}
          showLabel={resultsPerPage?.showLabel ?? false}
          label={resultsPerPage?.label ?? "Results per page"}
          surface={resultsPerPage?.surface ?? "plain"}
          density={density}
          className={resultsPerPage?.className}
        />
      ) : null}
    </div>
  );
}

interface SearchSectionProps {
  search: ResultControlsSearchConfig | undefined;
  searchValue: string;
  setSearchValue: React.Dispatch<React.SetStateAction<string>>;
  isCompact: boolean;
}

/** The leading search input column (only rendered when search is enabled). */
function SearchSection({
  search,
  searchValue,
  setSearchValue,
  isCompact,
}: SearchSectionProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-wrap items-center gap-2",
        "w-full",
        "@[960px]:w-auto",
      )}
    >
      <SearchBar
        variant="input-only"
        inputId="result-controls-search"
        inputName="query"
        value={searchValue}
        onQueryChange={(nextValue) => {
          setSearchValue(nextValue);
          search?.onChange?.(nextValue);
        }}
        onSubmit={() => {}}
        placeholder={search?.placeholder ?? "Search"}
        className={cn(
          "w-full",
          "@[560px]:min-w-56 @[560px]:max-w-80",
          "@[960px]:w-72",
          isCompact && "[&_input]:h-8",
        )}
      />
    </div>
  );
}

interface ControlsRowProps {
  inlineFiltersEnabled: boolean;
  filters: ResultControlsFiltersConfig | undefined;
  hasFacetFilters: boolean;
  activeFilterChips: FilterChip[];
  setActiveFilterChips: React.Dispatch<React.SetStateAction<FilterChip[]>>;
  trailing: TrailingControlsSectionProps;
  resultsSummaryNode: React.ReactNode;
}

/** Inline-filters + trailing-controls row, with an optional summary line. */
function ControlsRow({
  inlineFiltersEnabled,
  filters,
  hasFacetFilters,
  activeFilterChips,
  setActiveFilterChips,
  trailing,
  resultsSummaryNode,
}: ControlsRowProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-2",
        "@[960px]:flex-nowrap",
        "@[960px]:justify-end",
      )}
    >
      {inlineFiltersEnabled ? (
        <InlineFiltersSection
          filters={filters}
          hasFacetFilters={hasFacetFilters}
          activeFilterChips={activeFilterChips}
          setActiveFilterChips={setActiveFilterChips}
        />
      ) : null}

      <TrailingControlsSection {...trailing} />
      {resultsSummaryNode}
    </div>
  );
}

/**
 * Shared controls row for collection UIs (grid, listing, carousel) with
 * optional search, sort, filter, and result count sections.
 */
export function ResultControls({
  surface = "card",
  density = "comfortable",
  search,
  sort,
  filters,
  view,
  resultCount,
  resultsPerPage,
  className,
}: ResultControlsProps) {
  const searchEnabled = search?.enabled ?? false;
  const sortEnabled = sort?.enabled ?? false;
  const filtersEnabled = filters?.enabled ?? false;
  const filtersPlacement = filters?.placement ?? "inline";
  const inlineFiltersEnabled = filtersEnabled && filtersPlacement === "inline";
  const viewEnabled = view?.enabled ?? false;
  const countEnabled = resultCount?.enabled ?? false;
  const resultsPerPageEnabled = resultsPerPage?.enabled ?? false;
  const shouldShowResultsSummary = countEnabled && resultsPerPageEnabled;
  const resultsSummaryNode = shouldShowResultsSummary
    ? renderResultsSummary(resultCount, density)
    : null;

  const [searchValue, setSearchValue] = useState(search?.value ?? "");
  const [sortValue, setSortValue] = useState(
    sort?.value ?? sort?.options?.[0]?.value ?? "",
  );
  const [viewValue, setViewValue] = useState<"list" | "grid">(
    view?.value ?? view?.defaultValue ?? "grid",
  );
  const [activeFilterChips, setActiveFilterChips] = useState(
    filters?.chips ?? [],
  );

  useEffect(() => {
    setSearchValue(search?.value ?? "");
  }, [search?.value]);

  useEffect(() => {
    setSortValue(sort?.value ?? sort?.options?.[0]?.value ?? "");
  }, [sort?.value, sort?.options]);

  useEffect(() => {
    setViewValue(view?.value ?? view?.defaultValue ?? "grid");
  }, [view?.defaultValue, view?.value]);

  useEffect(() => {
    setActiveFilterChips(filters?.chips ?? []);
  }, [filters?.chips]);

  const hasFacetFilters = (filters?.facets?.length ?? 0) > 0;

  const anySectionEnabled =
    searchEnabled ||
    sortEnabled ||
    filtersEnabled ||
    viewEnabled ||
    countEnabled ||
    resultsPerPageEnabled;
  if (!anySectionEnabled) {
    return null;
  }

  const isCompact = density === "compact";
  const surfaceClassName = resolveSurfaceClassName(surface);
  const containerLayoutClassName = searchEnabled
    ? "flex flex-col gap-3 @[720px]:flex-row @[720px]:items-center @[720px]:justify-between"
    : "flex flex-wrap items-center gap-3";

  return (
    <div
      className={cn(
        "@container w-full",
        "rounded-lg",
        surfaceClassName,
        containerLayoutClassName,
        className,
      )}
    >
      {searchEnabled ? (
        <SearchSection
          search={search}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          isCompact={isCompact}
        />
      ) : null}

      <ControlsRow
        inlineFiltersEnabled={inlineFiltersEnabled}
        filters={filters}
        hasFacetFilters={hasFacetFilters}
        activeFilterChips={activeFilterChips}
        setActiveFilterChips={setActiveFilterChips}
        resultsSummaryNode={resultsSummaryNode}
        trailing={{
          view,
          viewEnabled,
          viewValue,
          setViewValue,
          sort,
          sortEnabled,
          sortValue,
          setSortValue,
          resultsPerPage,
          resultsPerPageEnabled,
          density,
        }}
      />
    </div>
  );
}
