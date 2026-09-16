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

type ResultsPerPageSurface = "plain" | "field";
type ResultsPerPageVariant = "default" | "soft" | "minimal";
type ResultsPerPageDensity = "comfortable" | "compact";

type ResultsPerPageProps = {
  /** Controlled value. When omitted, falls back to defaultItemsPerPage or first option. */
  value?: number;
  /** Uncontrolled initial value for backward compatibility. */
  defaultItemsPerPage?: number;
  options: number[];
  onChange?: (value: number) => void;
  /** Show "Results Per Page" label. When false, use for inline alignment with other controls. */
  showLabel?: boolean;
  surface?: ResultsPerPageSurface;
  variant?: ResultsPerPageVariant;
  density?: ResultsPerPageDensity;
  label?: string;
  className?: string;
};

const ResultsPerPage = ({
  value,
  defaultItemsPerPage,
  options,
  onChange,
  showLabel = true,
  surface = "plain",
  variant = "default",
  density = "comfortable",
  label = "Results Per Page",
  className,
}: ResultsPerPageProps) => {
  const triggerId = useId();
  const firstOption = options.length > 0 ? options[0] : 10;
  const fallbackValue =
    defaultItemsPerPage != null && options.includes(defaultItemsPerPage)
      ? defaultItemsPerPage
      : firstOption;
  const selectedValue =
    value != null && options.includes(value) ? value : fallbackValue;
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
        "flex items-center gap-1.5",
        surface === "field" &&
          "rounded-md border border-input bg-background px-2 py-1",
        wrapperVariantClassName,
        className,
      )}
    >
      {showLabel ? (
        <Label htmlFor={triggerId}>{label}</Label>
      ) : (
        <Label htmlFor={triggerId} className="sr-only">
          {label}
        </Label>
      )}
      <Select
        value={String(selectedValue)}
        onValueChange={(v) => {
          const next = Number(v);
          if (!Number.isNaN(next)) {
            onChange?.(next);
          }
        }}
      >
        <SelectTrigger
          id={triggerId}
          className={cn(
            "inline-flex min-w-9 cursor-pointer items-center gap-1 bg-transparent",
            isCompact ? "h-7 py-0 text-sm" : "h-8 py-0.5",
            surface === "field" ? "border-0 px-1" : "border-0 px-2",
            triggerVariantClassName,
          )}
        >
          <SelectValue placeholder="Per page" />
        </SelectTrigger>
        <SelectContent className="z-100 min-w-25 rounded-md bg-background-surface shadow-sm">
          {options.map((option) => (
            <SelectItem
              key={String(option)}
              value={String(option)}
              className="whitespace-no-wrap flex h-6 cursor-pointer select-none items-center rounded-sm px-1 text-muted-foreground leading-none hover:text-foreground data-[state=checked]:bg-background-accent data-[state=checked]:text-foreground"
            >
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export { ResultsPerPage };
export default ResultsPerPage;
