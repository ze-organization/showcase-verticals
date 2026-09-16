"use client";

import * as React from "react";
import { ThemeIcon } from "@/components/registry/primitives/core/theme-icon";
import { cn } from "@/lib/registry/cn";

export interface NumberInputProps
  extends Omit<
    React.ComponentPropsWithoutRef<"input">,
    "type" | "value" | "defaultValue"
  > {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  /** Show stepper buttons. Default true. */
  showStepper?: boolean;
  onValueChange?: (value: number) => void;
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  function NumberInput(
    {
      className,
      value,
      defaultValue,
      min,
      max,
      step = 1,
      showStepper = true,
      onChange,
      onValueChange,
      disabled,
      ...props
    },
    ref,
  ) {
    const [internalValue, setInternalValue] = React.useState<string>(
      value != null
        ? String(value)
        : defaultValue != null
          ? String(defaultValue)
          : "",
    );
    const isControlled = value !== undefined;
    const numValue = isControlled ? value : Number.parseFloat(internalValue);
    const safeNum = Number.isNaN(numValue) ? undefined : numValue;

    const clamp = (n: number) => {
      let v = n;
      if (min != null) v = Math.max(min, v);
      if (max != null) v = Math.min(max, v);
      return v;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (!isControlled) setInternalValue(raw);
      onChange?.(e);
      const parsed = Number.parseFloat(raw);
      if (!Number.isNaN(parsed)) onValueChange?.(parsed);
    };

    const stepUp = () => {
      const next = clamp((safeNum ?? min ?? 0) + step);
      onValueChange?.(next);
      if (!isControlled) setInternalValue(String(next));
    };

    const stepDown = () => {
      const next = clamp((safeNum ?? max ?? 0) - step);
      onValueChange?.(next);
      if (!isControlled) setInternalValue(String(next));
    };

    const inputValue = isControlled
      ? value === undefined
        ? ""
        : value
      : internalValue;

    return (
      <div
        data-slot="number-input"
        className={cn(
          "flex h-10 items-stretch overflow-hidden rounded-(--radius-md,0.5rem) border border-(--input-border,var(--color-border)) bg-(--input-background,var(--color-background)) [border-width:var(--input-border-width,1px)]",
          "focus-within:border-primary focus-within:ring-1 focus-within:ring-primary",
          "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
          "disabled:pointer-events-none disabled:opacity-50",
        )}
      >
        <input
          ref={ref}
          type="number"
          data-slot="number-input-field"
          value={inputValue}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onChange={handleChange}
          className={cn(
            "h-full w-full min-w-0 border-0 bg-transparent px-3 py-1 text-base outline-none transition-[color] selection:bg-primary selection:text-inverse-text placeholder:text-muted-foreground md:text-sm",
            showStepper &&
              "[&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [&]:[-moz-appearance:textfield]",
            showStepper && "pe-1",
            className,
          )}
          {...props}
        />
        {showStepper && (
          <div
            data-slot="number-input-stepper"
            className="flex flex-col border-border border-s"
            aria-hidden
          >
            <button
              type="button"
              tabIndex={-1}
              onClick={stepUp}
              disabled={
                disabled || (max != null && safeNum != null && safeNum >= max)
              }
              className="flex h-1/2 min-h-0 flex-1 items-center justify-center text-muted-foreground hover:bg-muted hover:text-muted-foreground disabled:opacity-50"
              aria-label="Increase value"
            >
              <ThemeIcon name="chevron-up" className="size-4" />
            </button>
            <button
              type="button"
              tabIndex={-1}
              onClick={stepDown}
              disabled={
                disabled || (min != null && safeNum != null && safeNum <= min)
              }
              className="flex h-1/2 min-h-0 flex-1 items-center justify-center text-muted-foreground hover:bg-muted hover:text-muted-foreground disabled:opacity-50"
              aria-label="Decrease value"
            >
              <ThemeIcon name="chevron-down" className="size-4" />
            </button>
          </div>
        )}
      </div>
    );
  },
);
NumberInput.displayName = "NumberInput";

export { NumberInput };
