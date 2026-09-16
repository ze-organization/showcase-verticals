"use client";

import { useState } from "react";
import { FacetList } from "@/components/registry/blocks/facet-list";
import { Button } from "@/components/registry/primitives/core/button";
import { Card, CardContent } from "@/components/registry/primitives/core/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/registry/primitives/core/sheet";
import {
  TypographyH3,
  TypographyMuted,
} from "@/components/registry/primitives/core/typography";
import { getSourceText } from "@/components/registry/primitives/editables/source-normalizers";
import type { TextSource } from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import { parseDefaultOnCheckbox } from "@/lib/registry/param-parsers";
import { useSearchControllerContext } from "@/lib/registry/search/search-controller-context";
import type { SearchFacetResult } from "@/lib/registry/search/types";

/**
 * Sitecore-aware `FilterPanel` rendering.
 *
 * Reads facets + selections from the ambient search-experience wrapper
 * context. Three variants:
 *
 *  - `Sidebar` (default) — vertical card with facet groups
 *  - `HorizontalChips` — horizontal row of selected-value chips with
 *    a "Filters" button that opens a drawer
 *  - `Drawer` — off-canvas sheet with the full facet panel
 *
 * Must be nested inside a search-experience wrapper. Standalone
 * placements render an empty-state hint.
 */
export interface FilterPanelProps {
  title?: TextSource;
  triggerLabel?: TextSource;
  clearLabel?: TextSource;
  showCounts?: boolean;
  collapsible?: boolean;
  /**
   * `Drawer` only — render the sheet already open. The drawer keeps its
   * own open state, so everything inside `SheetContent` (the facet list,
   * its counts and collapse behaviour, the clear-all action) is absent
   * from the DOM until someone clicks the trigger. That made the whole
   * variant interior invisible to the showcase preview and to every
   * automated check over it: the axes measured as "does nothing" when
   * the truth was "was never rendered". Ignored by the other layouts.
   */
  defaultOpen?: boolean;
  className?: string;
}

interface FilterPanelInternalProps extends FilterPanelProps {
  layout: "sidebar" | "chips" | "drawer";
}

function FilterPanelFacets({
  facets,
  showCounts,
  collapsible,
}: {
  facets: SearchFacetResult[];
  showCounts?: boolean;
  collapsible?: boolean;
}) {
  const controller = useSearchControllerContext();
  if (!controller) return null;

  const mapped = facets.map((facet) => ({
    id: facet.id,
    label: facet.label,
    type: facet.type,
    values:
      facet.values?.map((v) => ({
        id: v.id,
        text: v.label,
        ...(showCounts && v.count != null ? { count: v.count } : {}),
      })) ?? [],
  }));

  return (
    <FacetList
      facets={mapped}
      selectedValues={controller.selectedFacetValues}
      selectedRanges={controller.selectedFacetRanges}
      onValueToggle={controller.toggleFacetValue}
      onRangeChange={(facetId, nextRange) =>
        controller.setFacetRange(facetId, nextRange)
      }
      variant={collapsible ? "search-facets-muted" : "search-facets-card"}
    />
  );
}

function FilterPanelInner({
  title,
  clearLabel,
  showCounts,
  collapsible,
  defaultOpen,
  className,
  layout,
}: FilterPanelInternalProps) {
  const controller = useSearchControllerContext();
  const resolvedTitle = getSourceText(title) ?? "Filters";
  const resolvedClearLabel = getSourceText(clearLabel) ?? "Clear all";
  const countsOn = parseDefaultOnCheckbox(showCounts, false);
  const collapseOn = parseDefaultOnCheckbox(collapsible, false);

  if (!controller) {
    return (
      <div className="py-4 text-center text-muted-foreground text-sm">
        <span className="is-empty-hint">Filter panel</span>
      </div>
    );
  }
  if ((controller.facets?.length ?? 0) === 0) {
    return (
      <div className="py-4 text-center text-muted-foreground text-sm">
        <span className="is-empty-hint">Filters</span>
      </div>
    );
  }

  if (layout === "sidebar") {
    return (
      <Card
        elevation="sm"
        padding="md"
        // Radius stays with the Card primitive's `--card-radius` token.
        className={cn("w-full max-w-sm gap-4", className)}
      >
        <CardContent className="p-0">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <TypographyH3 className="text-lg">{resolvedTitle}</TypographyH3>
                <TypographyMuted className="text-sm">
                  Refine your results.
                </TypographyMuted>
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={controller.clearAllFacets}
              >
                {resolvedClearLabel}
              </Button>
            </div>
            <FilterPanelFacets
              facets={controller.facets}
              showCounts={countsOn}
              collapsible={collapseOn}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (layout === "chips") {
    // facetId → (valueId → label) lookup so chips render the human-
    // readable label instead of the raw provider value id (e.g. "Under
    // $100" instead of "price_range_0-100").
    const valueLabelByFacet = new Map<string, Map<string, string>>();
    for (const facet of controller.facets ?? []) {
      const valueMap = new Map<string, string>();
      for (const v of facet.values ?? []) valueMap.set(v.id, v.label);
      valueLabelByFacet.set(facet.id, valueMap);
    }
    const chips = Array.from(Object.entries(controller.selectedFacetValues))
      .flatMap(([facetId, values]) =>
        Array.from(values).map((valueId) => ({ facetId, valueId })),
      )
      .slice(0, 12);
    return (
      <div className={cn("flex flex-wrap items-center gap-2", className)}>
        {chips.map(({ facetId, valueId }) => {
          const label = valueLabelByFacet.get(facetId)?.get(valueId) ?? valueId;
          return (
            <button
              key={`${facetId}:${valueId}`}
              type="button"
              className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-foreground text-xs"
              onClick={() =>
                controller.toggleFacetValue(facetId, valueId, false)
              }
              aria-label={`Remove ${label} filter`}
            >
              {label}
              <span aria-hidden="true">×</span>
            </button>
          );
        })}
        {chips.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={controller.clearAllFacets}
          >
            {resolvedClearLabel}
          </Button>
        )}
      </div>
    );
  }

  // drawer
  return (
    <FilterPanelDrawer
      title={title}
      clearLabel={clearLabel}
      showCounts={countsOn}
      collapsible={collapseOn}
      defaultOpen={defaultOpen}
      triggerLabel={resolvedTitle}
      className={className}
    />
  );
}

function FilterPanelDrawer({
  title,
  clearLabel,
  showCounts,
  collapsible,
  triggerLabel,
  defaultOpen = false,
  className,
}: FilterPanelProps & { triggerLabel: string }) {
  const controller = useSearchControllerContext();
  const [open, setOpen] = useState(defaultOpen);
  const resolvedTitle = getSourceText(title) ?? "Filters";
  const resolvedClearLabel = getSourceText(clearLabel) ?? "Clear all";

  if (!controller) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          {triggerLabel}
        </Button>
      </SheetTrigger>
      <SheetContent side="end" className="w-full max-w-sm">
        <SheetHeader>
          <SheetTitle>{resolvedTitle}</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={controller.clearAllFacets}
          >
            {resolvedClearLabel}
          </Button>
          <FilterPanelFacets
            facets={controller.facets}
            showCounts={parseDefaultOnCheckbox(showCounts, false)}
            collapsible={parseDefaultOnCheckbox(collapsible, false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function Sidebar(props: FilterPanelProps) {
  return <FilterPanelInner {...props} layout="sidebar" />;
}

export function HorizontalChips(props: FilterPanelProps) {
  return <FilterPanelInner {...props} layout="chips" />;
}

export function Drawer(props: FilterPanelProps) {
  return <FilterPanelInner {...props} layout="drawer" />;
}

export const FilterPanel = Sidebar;
export default Sidebar;

export const componentType = "universal";
