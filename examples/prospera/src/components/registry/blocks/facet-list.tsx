"use client";

import { useId, useMemo, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/registry/primitives/core/accordion";
import { Badge } from "@/components/registry/primitives/core/badge";
import { Button } from "@/components/registry/primitives/core/button";
import { Checkbox } from "@/components/registry/primitives/core/checkbox";
import { Input } from "@/components/registry/primitives/core/input";
import { Label } from "@/components/registry/primitives/core/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/registry/primitives/core/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/registry/primitives/core/select";
import { Slider } from "@/components/registry/primitives/core/slider";
import { cn } from "@/lib/registry/cn";
import type { SearchFacet } from "./types";

export type FacetListVariant =
  | "default"
  | "compact"
  | "products-pills-select"
  | "search-facets-card"
  | "search-facets-muted"
  | "search-facets-facets"
  | "search-facets-panel";

export interface FacetListProps {
  facets: SearchFacet[];
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
  variant?: FacetListVariant;
  showFacetLabels?: boolean;
  defaultOpenFacetIds?: string[];
  className?: string;
}

export interface FacetFilterControlProps {
  facets: SearchFacet[];
  buttonLabel?: string;
  facetListVariant?: FacetListVariant;
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
  /**
   * Render the facet popover already open. Preview seam only — the
   * interior is Radix-portalled and absent from the DOM until a gesture
   * opens it, so a static preview paints a bare trigger and the facet
   * options can never be seen or measured.
   */
  defaultOpen?: boolean;
  onRemoveChip?: (id: string) => void;
  onClear?: () => void;
  className?: string;
  popoverClassName?: string;
}

const getFacetBounds = (facet: SearchFacet): { min: number; max: number } => {
  const mins = facet.values
    .map((value) => value.min)
    .filter((value): value is number => typeof value === "number");
  const maxes = facet.values
    .map((value) => value.max)
    .filter((value): value is number => typeof value === "number");

  const min = mins.length ? Math.min(...mins) : 0;
  const max = maxes.length ? Math.max(...maxes) : 100;
  return { min, max: Math.max(max, min) };
};

const clampRange = (
  nextRange: { min: number; max: number },
  bounds: { min: number; max: number },
) => {
  const clampedMin = Math.min(Math.max(nextRange.min, bounds.min), bounds.max);
  const clampedMax = Math.min(Math.max(nextRange.max, bounds.min), bounds.max);
  return {
    min: Math.min(clampedMin, clampedMax),
    max: Math.max(clampedMin, clampedMax),
  };
};

const COLOR_NAME_TO_HEX: Record<string, string> = {
  black: "#111111",
  white: "#ffffff",
  gray: "#6b7280",
  grey: "#6b7280",
  red: "#dc2626",
  orange: "#ea580c",
  yellow: "#ca8a04",
  green: "#16a34a",
  blue: "#2563eb",
  indigo: "#4f46e5",
  purple: "#7c3aed",
  pink: "#db2777",
  brown: "#7c4a2d",
  silver: "#9ca3af",
  gold: "#ca8a04",
};

const inferSwatch = (text: string): string | undefined => {
  const value = text.trim().toLowerCase();
  if (/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)) return value;
  if (value.startsWith("rgb(") || value.startsWith("rgba(")) return value;
  if (value.startsWith("hsl(") || value.startsWith("hsla(")) return value;
  return COLOR_NAME_TO_HEX[value];
};

type FacetChip =
  | {
      id: string;
      label: string;
      facetId: string;
      valueId: string;
      kind: "value";
      swatch?: string;
    }
  | { id: string; label: string; facetId: string; kind: "range" };

const buildValueChips = (
  facets: SearchFacet[],
  selectedValues: Record<string, Set<string>>,
): FacetChip[] => {
  const chips: FacetChip[] = [];
  for (const facet of facets) {
    const selectedSet = selectedValues[facet.id];
    if (!selectedSet || selectedSet.size === 0) continue;
    for (const value of facet.values) {
      if (!selectedSet.has(value.id)) continue;
      const swatch = value.swatch ?? inferSwatch(value.text);
      chips.push({
        id: `${facet.id}:${value.id}`,
        label: `${facet.label}: ${value.text}`,
        facetId: facet.id,
        valueId: value.id,
        kind: "value",
        ...(swatch !== undefined ? { swatch } : {}),
      });
    }
  }
  return chips;
};

const buildRangeChips = (
  facets: SearchFacet[],
  selectedRanges: Record<string, { min: number; max: number }>,
): FacetChip[] => {
  const chips: FacetChip[] = [];
  for (const facet of facets) {
    if (facet.type !== "range") continue;
    const current = selectedRanges[facet.id];
    if (!current) continue;
    const bounds = getFacetBounds(facet);
    if (current.min === bounds.min && current.max === bounds.max) continue;
    chips.push({
      id: `${facet.id}:range`,
      label: `${facet.label}: ${current.min} - ${current.max}`,
      facetId: facet.id,
      kind: "range",
    });
  }
  return chips;
};

type ValueToggle = (facetId: string, valueId: string, checked: boolean) => void;

function ProductsPillsSelectBody({
  facet,
  idBase: _idBase,
  selectedValues,
  onValueToggle,
}: {
  facet: SearchFacet;
  idBase: string;
  selectedValues?: Record<string, Set<string>>;
  onValueToggle?: ValueToggle;
}) {
  const selectedSet = selectedValues?.[facet.id] ?? new Set<string>();
  const selectedValueId = Array.from(selectedSet)[0] ?? "__all__";
  const optionValues = [
    { id: "__all__", text: "All", count: undefined as number | undefined },
    ...facet.values,
  ];
  const selectOne = (nextValue: string) => {
    for (const valueId of selectedSet) {
      onValueToggle?.(facet.id, valueId, false);
    }
    if (nextValue !== "__all__") {
      onValueToggle?.(facet.id, nextValue, true);
    }
  };

  return (
    <div className="mx-auto w-fit max-w-full">
      <div className={cn("block w-fit", "@[768px]:hidden")}>
        <Select value={selectedValueId} onValueChange={selectOne}>
          <SelectTrigger
            className={cn(
              "flex w-[220px] items-center gap-2 bg-background",
              "@[640px]:w-[260px]",
            )}
          >
            <SelectValue placeholder={`Select ${facet.label}`} />
          </SelectTrigger>
          <SelectContent>
            {optionValues.map((value) => (
              <SelectItem key={value.id} value={value.id}>
                {value.text}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="@[768px]:flex hidden flex-wrap justify-center rounded-full bg-border p-1 text-lg leading-8">
        {optionValues.map((value) => {
          const isActive =
            value.id === "__all__"
              ? selectedSet.size === 0
              : selectedSet.has(value.id);
          return (
            <Button
              key={value.id}
              type="button"
              variant="ghost"
              className={cn(
                "cursor-pointer rounded-full px-8 py-2 text-base text-foreground transition-colors",
                "@[400px]:text-lg",
                isActive ? "bg-background shadow-sm" : "hover:bg-background/50",
              )}
              onClick={() => selectOne(value.id)}
            >
              <span>{value.text}</span>
              {value.count != null ? (
                <span className="ms-1 text-muted-foreground text-xs">
                  ({value.count})
                </span>
              ) : null}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

function SizeInlineBody({
  facet,
  idBase,
  selectedValues,
  onValueToggle,
}: {
  facet: SearchFacet;
  idBase: string;
  selectedValues?: Record<string, Set<string>>;
  onValueToggle?: ValueToggle;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {facet.values.map((value) => {
        const isChecked = selectedValues?.[facet.id]?.has(value.id) ?? false;
        const checkboxId = `${idBase}-${facet.id}-${value.id}`;
        return (
          <Label
            key={value.id}
            htmlFor={checkboxId}
            className={cn(
              "inline-flex h-8 min-w-9 cursor-pointer items-center justify-center rounded-md border px-2 font-medium text-xs transition-colors",
              isChecked
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border bg-background text-muted-foreground hover:bg-muted/50",
            )}
          >
            <Checkbox
              id={checkboxId}
              className="sr-only"
              checked={isChecked}
              onCheckedChange={(checked) =>
                onValueToggle?.(facet.id, value.id, Boolean(checked))
              }
            />
            <span>{value.text}</span>
          </Label>
        );
      })}
    </div>
  );
}

function ColorCirclesBody({
  facet,
  idBase,
  selectedValues,
  onValueToggle,
}: {
  facet: SearchFacet;
  idBase: string;
  selectedValues?: Record<string, Set<string>>;
  onValueToggle?: ValueToggle;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {facet.values.map((value) => {
        const isChecked = selectedValues?.[facet.id]?.has(value.id) ?? false;
        const checkboxId = `${idBase}-${facet.id}-${value.id}`;
        const swatch = value.swatch ?? inferSwatch(value.text) ?? "#9ca3af";
        return (
          <Label
            key={value.id}
            htmlFor={checkboxId}
            className={cn(
              "inline-flex cursor-pointer items-center rounded-full border p-1.5 transition-colors",
              isChecked
                ? "border-primary ring-2 ring-primary/25"
                : "border-border hover:border-border/80",
            )}
            title={value.text}
          >
            <Checkbox
              id={checkboxId}
              className="sr-only"
              checked={isChecked}
              onCheckedChange={(checked) =>
                onValueToggle?.(facet.id, value.id, Boolean(checked))
              }
            />
            <span
              aria-hidden="true"
              className="inline-block size-4 rounded-full border border-border/60"
              style={{ backgroundColor: swatch }}
            />
          </Label>
        );
      })}
    </div>
  );
}

function DefaultListBody({
  facet,
  idBase,
  selectedValues,
  onValueToggle,
  isCompact,
  isSearchFacetsPanelVariant,
  isSearchFacetsVariant,
}: {
  facet: SearchFacet;
  idBase: string;
  selectedValues?: Record<string, Set<string>>;
  onValueToggle?: ValueToggle;
  isCompact: boolean;
  isSearchFacetsPanelVariant: boolean;
  isSearchFacetsVariant: boolean;
}) {
  return (
    <div className={cn("space-y-1", !isCompact && "md:space-y-1.5")}>
      {facet.values.map((value) => {
        const isChecked = selectedValues?.[facet.id]?.has(value.id) ?? false;
        const checkboxId = `${idBase}-${facet.id}-${value.id}`;

        return (
          <Label
            key={value.id}
            htmlFor={checkboxId}
            className={cn(
              "flex cursor-pointer items-center justify-between gap-2 rounded-sm text-sm",
              isSearchFacetsPanelVariant
                ? "py-0.5"
                : isSearchFacetsVariant || isCompact
                  ? "px-1 py-0.5 hover:bg-muted/50"
                  : "",
            )}
          >
            <span className="flex items-center gap-2">
              <Checkbox
                id={checkboxId}
                checked={isChecked}
                onCheckedChange={(checked) =>
                  onValueToggle?.(facet.id, value.id, Boolean(checked))
                }
              />
              <span className="text-sm">{value.text}</span>
            </span>
            {value.count != null ? (
              isSearchFacetsPanelVariant ? (
                <Badge variant="outline" className="font-normal">
                  {value.count}
                </Badge>
              ) : (
                <span className="text-muted-foreground text-xs">
                  {value.count}
                </span>
              )
            ) : null}
          </Label>
        );
      })}
    </div>
  );
}

/**
 * Shared facet list UI for rendering list-type facet values with checkboxes.
 */
export function FacetList({
  facets,
  selectedValues,
  selectedRanges,
  onValueToggle,
  onRangeChange,
  variant = "default",
  showFacetLabels = true,
  defaultOpenFacetIds,
  className,
}: FacetListProps) {
  const idBase = useId();
  const isCompact = variant === "compact";
  const isSearchFacetsFacetsVariant =
    variant === "search-facets-facets" || variant === "search-facets-card";
  const isSearchFacetsPanelVariant =
    variant === "search-facets-panel" || variant === "search-facets-muted";
  const isProductsPillsSelectVariant = variant === "products-pills-select";
  const isSearchFacetsMutedVariant =
    variant === "search-facets-panel" || variant === "search-facets-muted";
  const isSearchFacetsVariant =
    isSearchFacetsFacetsVariant || isSearchFacetsPanelVariant;
  const [localRanges, setLocalRanges] = useState<
    Record<string, { min: number; max: number }>
  >({});

  const getCurrentRange = (facet: SearchFacet) => {
    const bounds = getFacetBounds(facet);
    return selectedRanges?.[facet.id] ?? localRanges[facet.id] ?? bounds;
  };

  const updateRange = (
    facet: SearchFacet,
    nextRange: { min: number; max: number },
  ) => {
    const bounds = getFacetBounds(facet);
    const normalizedRange = clampRange(nextRange, bounds);
    setLocalRanges((prev) => ({
      ...prev,
      [facet.id]: normalizedRange,
    }));
    onRangeChange?.(facet.id, normalizedRange);
  };

  const renderFacetBody = (facet: SearchFacet) => {
    if (facet.type === "range") {
      const bounds = getFacetBounds(facet);
      const currentRange = getCurrentRange(facet);
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor={`${idBase}-${facet.id}-min`} className="text-xs">
                Min
              </Label>
              <Input
                id={`${idBase}-${facet.id}-min`}
                type="number"
                className={
                  isCompact && !isSearchFacetsPanelVariant ? "h-8" : "h-9"
                }
                value={String(currentRange.min)}
                onChange={(event) => {
                  const nextMin = Number(event.target.value);
                  if (Number.isNaN(nextMin)) return;
                  updateRange(facet, {
                    min: nextMin,
                    max: currentRange.max,
                  });
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${idBase}-${facet.id}-max`} className="text-xs">
                Max
              </Label>
              <Input
                id={`${idBase}-${facet.id}-max`}
                type="number"
                className={
                  isCompact && !isSearchFacetsPanelVariant ? "h-8" : "h-9"
                }
                value={String(currentRange.max)}
                onChange={(event) => {
                  const nextMax = Number(event.target.value);
                  if (Number.isNaN(nextMax)) return;
                  updateRange(facet, {
                    min: currentRange.min,
                    max: nextMax,
                  });
                }}
              />
            </div>
          </div>
          <Slider
            min={bounds.min}
            max={bounds.max}
            value={[currentRange.min, currentRange.max]}
            onValueChange={(nextValue) => {
              updateRange(facet, {
                min: nextValue[0] ?? bounds.min,
                max: nextValue[1] ?? bounds.max,
              });
            }}
          />
        </div>
      );
    }

    const displayMode =
      facet.display ??
      (facet.values.some((value) => value.swatch || inferSwatch(value.text))
        ? "color-circles"
        : "default");

    if (isProductsPillsSelectVariant) {
      return (
        <ProductsPillsSelectBody
          facet={facet}
          idBase={idBase}
          selectedValues={selectedValues}
          onValueToggle={onValueToggle}
        />
      );
    }

    if (displayMode === "size-inline") {
      return (
        <SizeInlineBody
          facet={facet}
          idBase={idBase}
          selectedValues={selectedValues}
          onValueToggle={onValueToggle}
        />
      );
    }

    if (displayMode === "color-circles") {
      return (
        <ColorCirclesBody
          facet={facet}
          idBase={idBase}
          selectedValues={selectedValues}
          onValueToggle={onValueToggle}
        />
      );
    }

    return (
      <DefaultListBody
        facet={facet}
        idBase={idBase}
        selectedValues={selectedValues}
        onValueToggle={onValueToggle}
        isCompact={isCompact}
        isSearchFacetsPanelVariant={isSearchFacetsPanelVariant}
        isSearchFacetsVariant={isSearchFacetsVariant}
      />
    );
  };

  if (isSearchFacetsVariant) {
    return (
      <Accordion
        type="multiple"
        defaultValue={defaultOpenFacetIds}
        className={cn("w-full", className)}
      >
        {facets.map((facet) => (
          <AccordionItem
            key={facet.id}
            value={facet.id}
            className={cn(
              "mb-2 block rounded-lg p-2 shadow-sm last:border-b md:mb-4 md:p-4",
              isSearchFacetsMutedVariant
                ? "border border-border/70 bg-muted/20 last:border-border/70"
                : "border border-border bg-background last:border-border",
            )}
          >
            <AccordionTrigger className="py-1.5 font-semibold text-sm md:py-4 md:text-base">
              {facet.label}
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-2 md:pt-4 md:pb-4">
              <div className="mt-1 md:mt-2">{renderFacetBody(facet)}</div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {facets.map((facet) => (
        <div
          key={facet.id}
          className={cn("space-y-1.5", !showFacetLabels && "space-y-2")}
        >
          {showFacetLabels ? (
            <p
              className={cn(
                "font-medium text-foreground",
                isCompact ? "text-sm" : "text-sm md:text-base",
              )}
            >
              {facet.label}
            </p>
          ) : null}
          {renderFacetBody(facet)}
        </div>
      ))}
    </div>
  );
}

/**
 * Interactive facet filter control with trigger button, popover, chips, and clear actions.
 */
export function FacetFilterControl({
  facets,
  buttonLabel = "Filter",
  facetListVariant = "compact",
  selectedValues: controlledSelectedValues,
  selectedRanges: controlledSelectedRanges,
  onValueToggle,
  onRangeChange,
  onOpen,
  defaultOpen,
  onRemoveChip,
  onClear,
  className,
  popoverClassName,
}: FacetFilterControlProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen ?? false);
  const [selectedValuesState, setSelectedValuesState] = useState<
    Record<string, Set<string>>
  >({});
  const [selectedRangesState, setSelectedRangesState] = useState<
    Record<string, { min: number; max: number }>
  >({});

  const resolvedSelectedValues =
    controlledSelectedValues ?? selectedValuesState;
  const resolvedSelectedRanges =
    controlledSelectedRanges ?? selectedRangesState;
  const isControlled = Boolean(
    controlledSelectedValues || controlledSelectedRanges,
  );

  const chips = useMemo(
    () => [
      ...buildValueChips(facets, resolvedSelectedValues),
      ...buildRangeChips(facets, resolvedSelectedRanges),
    ],
    [facets, resolvedSelectedRanges, resolvedSelectedValues],
  );

  const updateFacetValue = (
    facetId: string,
    valueId: string,
    nextChecked: boolean,
  ) => {
    if (isControlled) {
      onValueToggle?.(facetId, valueId, nextChecked);
      return;
    }

    setSelectedValuesState((prev) => {
      const next = { ...prev };
      const set = new Set(next[facetId] ?? []);
      if (nextChecked) {
        set.add(valueId);
      } else {
        set.delete(valueId);
      }
      if (set.size === 0) {
        delete next[facetId];
      } else {
        next[facetId] = set;
      }
      return next;
    });
  };

  const removeChip = (facetId: string, valueId: string, chipId: string) => {
    if (isControlled) {
      if (valueId === "__range__") {
        const facet = facets.find((entry) => entry.id === facetId);
        const bounds = facet ? getFacetBounds(facet) : { min: 0, max: 0 };
        onRangeChange?.(facetId, bounds);
      } else {
        onValueToggle?.(facetId, valueId, false);
      }
      onRemoveChip?.(chipId);
      return;
    }

    if (valueId === "__range__") {
      setSelectedRangesState((prev) => {
        const next = { ...prev };
        delete next[facetId];
        return next;
      });
    } else {
      setSelectedValuesState((prev) => {
        const next = { ...prev };
        const set = new Set(next[facetId] ?? []);
        set.delete(valueId);
        if (set.size === 0) {
          delete next[facetId];
        } else {
          next[facetId] = set;
        }
        return next;
      });
    }
    onRemoveChip?.(chipId);
  };

  const clearAll = () => {
    if (isControlled) {
      onClear?.();
      return;
    }
    setSelectedValuesState({});
    setSelectedRangesState({});
    onClear?.();
  };

  return (
    <div className={cn("flex min-w-0 flex-wrap items-center gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            colorScheme="neutral"
            onClick={onOpen}
          >
            {buttonLabel}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className={cn("w-80 space-y-3 p-3", popoverClassName)}
        >
          <FacetList
            facets={facets}
            selectedValues={resolvedSelectedValues}
            selectedRanges={resolvedSelectedRanges}
            onValueToggle={updateFacetValue}
            onRangeChange={(facetId, nextRange) => {
              if (isControlled) {
                onRangeChange?.(facetId, nextRange);
                return;
              }
              setSelectedRangesState((prev) => ({
                ...prev,
                [facetId]: nextRange,
              }));
            }}
            variant={facetListVariant}
            showFacetLabels
          />
          <div className="flex items-center justify-between gap-2 border-border/60 border-t pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              colorScheme="neutral"
              onClick={clearAll}
            >
              Clear all
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              colorScheme="neutral"
              onClick={() => setIsOpen(false)}
            >
              Done
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {chips.map((chip) => (
        <Button
          key={chip.id}
          type="button"
          variant="ghost"
          size="sm"
          colorScheme="neutral"
          className="h-7 rounded-full border border-border px-2 text-xs"
          onClick={() =>
            removeChip(
              chip.facetId,
              chip.kind === "range" ? "__range__" : chip.valueId,
              chip.id,
            )
          }
        >
          {chip.kind === "value" && chip.swatch ? (
            <span
              aria-hidden="true"
              className="inline-block size-2.5 rounded-full border border-border/60"
              style={{ backgroundColor: chip.swatch }}
            />
          ) : null}
          <span>{chip.label}</span>
          <span>x</span>
        </Button>
      ))}

      {chips.length > 0 ? (
        <Button
          type="button"
          variant="link"
          size="sm"
          colorScheme="neutral"
          onClick={clearAll}
        >
          Clear
        </Button>
      ) : null}
    </div>
  );
}

export default FacetList;
