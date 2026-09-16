"use client";

import { useMemo } from "react";
import {
  ResultControls,
  type ResultControlsProps,
} from "@/components/registry/blocks/result-controls";
import { getSourceText } from "@/components/registry/primitives/editables/source-normalizers";
import type { TextSource } from "@/components/registry/primitives/editables/text";
import { parseDefaultOnCheckbox } from "@/lib/registry/param-parsers";
import { useSearchControllerContext } from "@/lib/registry/search/search-controller-context";

/**
 * `SearchControlsBar` — the bundled horizontal controls row for the
 * search-experience wrapper. One drop wraps the existing
 * `ResultControls` block (search input + sort dropdown + filter chips
 * + view toggle + result-count summary + results-per-page selector),
 * each sub-bar gated by an `show*` param so authors hide what they
 * don't need.
 *
 * Sits in the search-experience's `search-controls-leading-{*}`
 * placeholder for the common "stick a search row above the results"
 * pattern. For sidebar facets — a vertically-stacked column of facet
 * groups — keep using the granular `filter-panel@1` with the Sidebar
 * variant; that's structurally different from a horizontal bar.
 *
 * Reads everything off `useSearchControllerContext` — query, sort,
 * facets, view, pagination state — so the bundled bar is a true
 * controller surface. Standalone placements (no wrapper context)
 * render an empty-state hint.
 */
export interface SearchControlsBarProps {
  showSearch?: boolean | string;
  showSort?: boolean | string;
  showFilter?: boolean | string;
  showView?: boolean | string;
  showCount?: boolean | string;
  showPerPage?: boolean | string;

  /** Visual surface — card / muted / inner / none. Default `card`. */
  surface?: "card" | "muted" | "inner" | "none" | string;
  /** Density — comfortable / compact. Default `comfortable`. */
  density?: "comfortable" | "compact" | string;

  /** Sort options (label / value pairs). Each option becomes a dropdown entry. */
  sortOptions?: Array<{ value: string; label: string }>;
  /** Results-per-page choices. Default `[10, 25, 50]`. */
  resultsPerPageOptions?: number[];
  /** Placeholder shown in the search input. */
  searchPlaceholder?: TextSource;
  /** Label shown on the sort dropdown trigger. */
  sortLabel?: TextSource;
  /** Label / button text for the filter chip row. */
  filtersButtonLabel?: TextSource;
  /** Where the filter UI surfaces — inline chips or sidebar. Default `inline`. */
  filtersPlacement?: "inline" | "sidebar" | string;

  className?: string;
}

const SURFACES = ["card", "muted", "inner", "none"] as const;
const DENSITIES = ["comfortable", "compact"] as const;
const PLACEMENTS = ["inline", "sidebar"] as const;

const oneOf = <T extends string>(
  value: string | undefined,
  allowed: readonly T[],
  fallback: T,
): T => {
  const normalized = value?.trim().toLowerCase() as T | undefined;
  return normalized && allowed.includes(normalized) ? normalized : fallback;
};

const noop = () => {
  /* intentional */
};

export function Default({
  showSearch,
  showSort,
  showFilter,
  showView,
  showCount,
  showPerPage,
  surface,
  density,
  sortOptions,
  resultsPerPageOptions,
  searchPlaceholder,
  sortLabel,
  filtersButtonLabel,
  filtersPlacement,
  className,
}: SearchControlsBarProps) {
  const controller = useSearchControllerContext();
  const searchOn = parseDefaultOnCheckbox(showSearch, true);
  const sortOn = parseDefaultOnCheckbox(showSort, true);
  const filterOn = parseDefaultOnCheckbox(showFilter, true);
  const viewOn = parseDefaultOnCheckbox(showView, false);
  const countOn = parseDefaultOnCheckbox(showCount, true);
  const perPageOn = parseDefaultOnCheckbox(showPerPage, true);
  const resolvedSurface = oneOf(surface, SURFACES, "card");
  const resolvedDensity = oneOf(density, DENSITIES, "comfortable");
  const resolvedPlacement = oneOf(filtersPlacement, PLACEMENTS, "inline");
  const resolvedPlaceholder = getSourceText(searchPlaceholder) ?? "Search";
  const resolvedSortLabel = getSourceText(sortLabel) ?? "Sort by";
  const resolvedFiltersLabel = getSourceText(filtersButtonLabel) ?? "Filters";

  const resolvedSortOptions = useMemo(
    () =>
      Array.isArray(sortOptions)
        ? sortOptions.map((option) => ({
            value: option.value,
            label: option.label,
          }))
        : [
            { value: "featured", label: "Featured" },
            { value: "title_asc", label: "Title (A-Z)" },
            { value: "title_desc", label: "Title (Z-A)" },
          ],
    [sortOptions],
  );

  const resolvedPerPageOptions = useMemo(
    () => resultsPerPageOptions ?? [10, 25, 50],
    [resultsPerPageOptions],
  );

  if (!controller) {
    return (
      <div className="py-4 text-center text-muted-foreground text-sm">
        <span className="is-empty-hint">Search controls</span>
      </div>
    );
  }

  const props: ResultControlsProps = {
    surface: resolvedSurface,
    density: resolvedDensity,
    className,
    search: {
      enabled: searchOn,
      value: controller.query,
      placeholder: resolvedPlaceholder,
      onChange: controller.setQuery,
    },
    sort: {
      enabled: sortOn,
      value: controller.sortValue || resolvedSortOptions[0]?.value || "",
      options: resolvedSortOptions,
      label: resolvedSortLabel,
      showLabel: true,
      onChange: controller.setSortValue,
    },
    filters: {
      enabled: filterOn && (controller.facets?.length ?? 0) > 0,
      placement: resolvedPlacement,
      buttonLabel: resolvedFiltersLabel,
      facets: (controller.facets ?? []).map((facet) => ({
        id: facet.id,
        label: facet.label,
        type: facet.type,
        values:
          facet.values?.map((v) => ({
            id: v.id,
            text: v.label,
            count: v.count,
          })) ?? [],
      })),
      selectedValues: controller.selectedFacetValues,
      selectedRanges: controller.selectedFacetRanges,
      onValueToggle: controller.toggleFacetValue,
      onRangeChange: (facetId, nextRange) =>
        controller.setFacetRange(facetId, nextRange ?? null),
      onClear: controller.clearAllFacets,
    },
    view: {
      enabled: viewOn,
      value: controller.view,
      defaultValue: controller.view,
      onChange: controller.setView,
    },
    resultCount: {
      enabled: countOn,
      label: `${controller.totalItems} results`,
      currentPage: controller.currentPage,
      itemsPerPage: controller.pageSize,
      totalItemsReturned: controller.pagedItems?.length ?? 0,
      totalItems: controller.totalItems,
    },
    resultsPerPage: {
      enabled: perPageOn,
      defaultItemsPerPage: controller.pageSize,
      options: resolvedPerPageOptions,
      onChange: controller.setPageSize,
      showLabel: true,
    },
  };

  return <ResultControls {...props} />;
}

export function Minimal(props: SearchControlsBarProps) {
  return (
    <Default
      showSearch
      showSort
      showFilter={false}
      showView={false}
      showCount={false}
      showPerPage={false}
      {...props}
    />
  );
}

export function Compact(props: SearchControlsBarProps) {
  return <Default density="compact" {...props} />;
}

void noop;
export const SearchControlsBar = Default;
export default Default;

export const componentType = "universal";
