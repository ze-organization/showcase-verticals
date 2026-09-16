"use client";

import { useCallback, useMemo, useState } from "react";
import { FacetList } from "@/components/registry/blocks/facet-list";
import { FormBlock } from "@/components/registry/blocks/form-block";
import type { SearchFacet } from "@/components/registry/blocks/types";
import { Button } from "@/components/registry/components/ui/cta-button";
import { Card, CardContent } from "@/components/registry/primitives/core/card";
import { Separator } from "@/components/registry/primitives/core/separator";
import {
  TypographyH3,
  TypographyMuted,
} from "@/components/registry/primitives/core/typography";
import { cn } from "@/lib/registry/cn";

type SearchFacetsVariant = "facets" | "filters-panel";

type SearchFacetsFacetProps = {
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
  /** Facet ids to have open by default (e.g. for docsite preview). */
  defaultOpenFacetIds?: string[];
};

type FilterOption = {
  id: string;
  label: string;
  count?: number;
  defaultChecked?: boolean;
};

const defaultCategoryOptions: FilterOption[] = [
  { id: "shoes", label: "Shoes", count: 12, defaultChecked: true },
  { id: "apparel", label: "Apparel", count: 8 },
  { id: "accessories", label: "Accessories", count: 16 },
  { id: "gear", label: "Gear", count: 6 },
];

const defaultRatingOptions: FilterOption[] = [
  { id: "4-up", label: "4 stars & up", count: 18, defaultChecked: true },
  { id: "3-up", label: "3 stars & up", count: 24 },
  { id: "2-up", label: "2 stars & up", count: 30 },
];

const defaultFeatureOptions: FilterOption[] = [
  { id: "free-returns", label: "Free returns" },
  { id: "new-arrivals", label: "New arrivals", defaultChecked: true },
  { id: "in-stock", label: "In stock" },
  { id: "sustainable", label: "Sustainable" },
];

export interface SearchFacetsPanelValue {
  categories: string[];
  ratings: string[];
  features: string[];
  minPrice: string;
  maxPrice: string;
}

export interface SearchFacetsPanelProps {
  displayOptions?: {
    variant?: SearchFacetsVariant;
    defaultOpenFacetIds?: string[];
    className?: string;
  };
  behaviorOptions?: {
    categoryOptions?: FilterOption[];
    ratingOptions?: FilterOption[];
    featureOptions?: FilterOption[];
    onApplyFilters?: (value: SearchFacetsPanelValue) => void;
    onResetFilters?: (value: SearchFacetsPanelValue) => void;
  };
}

export type SearchFacetsProps = SearchFacetsFacetProps & SearchFacetsPanelProps;

const getDefaultCheckedIds = (options: FilterOption[]) =>
  options.filter((option) => option.defaultChecked).map((option) => option.id);

const toggleOption = (previous: string[], optionId: string, next: boolean) => {
  if (next) {
    return previous.includes(optionId) ? previous : [...previous, optionId];
  }
  return previous.filter((id) => id !== optionId);
};

const FACET_IDS = {
  categories: "categories",
  price: "price",
  ratings: "ratings",
  features: "features",
} as const;

const toSetMap = (entries: Array<{ id: string; values: string[] }>) =>
  Object.fromEntries(
    entries.map((entry) => [entry.id, new Set(entry.values)]),
  ) as Record<string, Set<string>>;

const mapOptionsToFacetValues = (options: FilterOption[]) =>
  options.map((option) => ({
    id: option.id,
    text: option.label,
    ...(option.count !== undefined ? { count: option.count } : {}),
  }));

export const FiltersPanelVariant = ({
  displayOptions,
  behaviorOptions,
}: SearchFacetsPanelProps) => {
  const resolvedClassName = displayOptions?.className;
  const resolvedCategoryOptions =
    behaviorOptions?.categoryOptions ?? defaultCategoryOptions;
  const resolvedRatingOptions =
    behaviorOptions?.ratingOptions ?? defaultRatingOptions;
  const resolvedFeatureOptions =
    behaviorOptions?.featureOptions ?? defaultFeatureOptions;
  const resolvedOnApplyFilters = behaviorOptions?.onApplyFilters;
  const resolvedOnResetFilters = behaviorOptions?.onResetFilters;
  const defaultValue = useMemo<SearchFacetsPanelValue>(
    () => ({
      categories: getDefaultCheckedIds(resolvedCategoryOptions),
      ratings: getDefaultCheckedIds(resolvedRatingOptions),
      features: getDefaultCheckedIds(resolvedFeatureOptions),
      minPrice: "",
      maxPrice: "",
    }),
    [resolvedCategoryOptions, resolvedRatingOptions, resolvedFeatureOptions],
  );
  const [selectedValues, setSelectedValues] = useState<
    Record<string, Set<string>>
  >(
    toSetMap([
      { id: FACET_IDS.categories, values: defaultValue.categories },
      { id: FACET_IDS.ratings, values: defaultValue.ratings },
      { id: FACET_IDS.features, values: defaultValue.features },
    ]),
  );
  const [selectedRanges, setSelectedRanges] = useState<
    Record<string, { min: number; max: number }>
  >({});

  const panelFacets = useMemo<SearchFacet[]>(
    () => [
      {
        id: FACET_IDS.categories,
        label: "Category",
        type: "list",
        values: mapOptionsToFacetValues(resolvedCategoryOptions),
      },
      {
        id: FACET_IDS.price,
        label: "Price range",
        type: "range",
        values: [{ id: "price-range", text: "Price", min: 0, max: 5000 }],
      },
      {
        id: FACET_IDS.ratings,
        label: "Rating",
        type: "list",
        values: mapOptionsToFacetValues(resolvedRatingOptions),
      },
      {
        id: FACET_IDS.features,
        label: "Features",
        type: "list",
        values: mapOptionsToFacetValues(resolvedFeatureOptions),
      },
    ],
    [resolvedCategoryOptions, resolvedFeatureOptions, resolvedRatingOptions],
  );

  const toPanelValue = useCallback((): SearchFacetsPanelValue => {
    const range = selectedRanges[FACET_IDS.price];
    return {
      categories: Array.from(selectedValues[FACET_IDS.categories] ?? []),
      ratings: Array.from(selectedValues[FACET_IDS.ratings] ?? []),
      features: Array.from(selectedValues[FACET_IDS.features] ?? []),
      minPrice: range ? String(range.min) : "",
      maxPrice: range ? String(range.max) : "",
    };
  }, [selectedRanges, selectedValues]);

  const resetFilters = useCallback(() => {
    setSelectedValues(
      toSetMap([
        { id: FACET_IDS.categories, values: defaultValue.categories },
        { id: FACET_IDS.ratings, values: defaultValue.ratings },
        { id: FACET_IDS.features, values: defaultValue.features },
      ]),
    );
    setSelectedRanges({});
    resolvedOnResetFilters?.(defaultValue);
  }, [defaultValue, resolvedOnResetFilters]);
  const handleValueToggle = useCallback(
    (facetId: string, valueId: string, nextChecked: boolean) => {
      setSelectedValues((previous) => {
        const previousValues = Array.from(previous[facetId] ?? []);
        return {
          ...previous,
          [facetId]: new Set(
            toggleOption(previousValues, valueId, nextChecked),
          ),
        };
      });
    },
    [],
  );
  const handleRangeChange = useCallback(
    (facetId: string, nextRange: { min: number; max: number }) => {
      setSelectedRanges((previous) => ({
        ...previous,
        [facetId]: nextRange,
      }));
    },
    [],
  );

  return (
    <Card
      elevation="sm"
      padding="md"
      // Radius stays with the Card primitive's `--card-radius` token.
      className={cn("w-full max-w-sm gap-4", resolvedClassName)}
    >
      <CardContent className="p-0">
        <FormBlock
          className="space-y-6"
          onSubmit={(event) => {
            event.preventDefault();
            resolvedOnApplyFilters?.(toPanelValue());
          }}
          aria-label="Filters and facets"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <TypographyH3 className="text-lg">Filters</TypographyH3>
              <TypographyMuted className="text-sm">
                Refine by category, price, and availability.
              </TypographyMuted>
            </div>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={resetFilters}
            >
              Reset
            </Button>
          </div>

          <Separator />

          <div className="space-y-6">
            <FacetList
              facets={panelFacets}
              selectedValues={selectedValues}
              selectedRanges={selectedRanges}
              onValueToggle={handleValueToggle}
              onRangeChange={handleRangeChange}
              variant="search-facets-muted"
              defaultOpenFacetIds={displayOptions?.defaultOpenFacetIds}
            />
            <Button type="submit" className="w-full">
              Apply filters
            </Button>
          </div>
        </FormBlock>
      </CardContent>
    </Card>
  );
};

export const SearchFacets = ({
  displayOptions,
  behaviorOptions,
  facets,
  selectedValues,
  selectedRanges,
  onValueToggle,
  onRangeChange,
}: SearchFacetsProps) => {
  const resolvedFacets = facets ?? [];
  const resolvedVariant = displayOptions?.variant ?? "facets";
  const resolvedDefaultOpenFacetIds = displayOptions?.defaultOpenFacetIds;

  if (resolvedVariant === "filters-panel") {
    return (
      <FiltersPanelVariant
        displayOptions={{ className: displayOptions?.className }}
        behaviorOptions={behaviorOptions}
      />
    );
  }

  if (!resolvedFacets.length) {
    return (
      <div className="py-4 text-center text-muted-foreground text-sm">
        <span className="is-empty-hint">Facets</span>
      </div>
    );
  }
  return (
    <FacetList
      facets={resolvedFacets}
      selectedValues={selectedValues}
      selectedRanges={selectedRanges}
      onValueToggle={onValueToggle}
      onRangeChange={onRangeChange}
      showFacetLabels={false}
      variant="search-facets-card"
      defaultOpenFacetIds={resolvedDefaultOpenFacetIds}
    />
  );
};

export default SearchFacets;
