"use client";

import { useId } from "react";
import { Label } from "@/components/registry/primitives/core/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/registry/primitives/core/select";
import { cn } from "@/lib/registry/cn";
import type { SearchSortOption } from "./types";

type SortOrderSurface = "plain" | "field";
type SortOrderVariant = "default" | "soft" | "minimal";
type SortOrderDensity = "comfortable" | "compact";

type SortOrderProps = {
  options: Array<SearchSortOption>;
  selected: string;
  onChange?: (value: string) => void;
  showLabel?: boolean;
  label?: string;
  surface?: SortOrderSurface;
  variant?: SortOrderVariant;
  density?: SortOrderDensity;
  className?: string;
};
const SortOrder = ({
  options,
  selected,
  onChange,
  showLabel = false,
  label = "Sort results",
  surface = "plain",
  variant = "default",
  density = "comfortable",
  className,
}: SortOrderProps) => {
  const selectedSortIndex = options.findIndex((s) => s.value === selected);
  const triggerId = useId();
  const isCompact = density === "compact";
  const wrapperVariantClassName =
    variant === "soft"
      ? "rounded-md bg-muted/40 px-2"
      : variant === "minimal"
        ? "px-0"
        : undefined;
  const triggerVariantClassName =
    variant === "soft"
      ? "rounded-sm hover:bg-background/70"
      : variant === "minimal"
        ? "hover:bg-transparent"
        : "hover:bg-muted/40";
  return (
    <div
      className={cn(
        "flex items-center gap-2",
        surface === "field" &&
          "rounded-md border border-input bg-background px-2",
        wrapperVariantClassName,
        className,
      )}
    >
      {showLabel ? (
        <Label htmlFor={triggerId} className="text-muted-foreground text-sm">
          {label}
        </Label>
      ) : (
        <Label htmlFor={triggerId} className="sr-only">
          {label}
        </Label>
      )}
      <Select value={selected} onValueChange={(value) => onChange?.(value)}>
        <SelectTrigger
          id={triggerId}
          className={cn(
            "inline-flex cursor-pointer items-center gap-1 border-0 bg-transparent",
            isCompact ? "h-8 py-0.5 text-sm" : "h-10 py-1",
            surface === "field"
              ? "border-0 bg-transparent px-1"
              : "border-0 bg-transparent",
            triggerVariantClassName,
          )}
        >
          <SelectValue>
            {selectedSortIndex > -1
              ? (options[selectedSortIndex]?.label ?? "")
              : ""}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="absolute top-8 z-100 min-w-37.5 rounded-md bg-background shadow-sm">
          {options.map((option) => (
            <SelectItem
              value={option.value}
              key={option.value}
              className="whitespace-no-wrap flex h-6 cursor-pointer select-none items-center rounded-sm px-1 text-muted-foreground leading-none hover:text-foreground data-[state=checked]:bg-background-accent data-[state=checked]:text-foreground"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export { SortOrder };
export default SortOrder;
