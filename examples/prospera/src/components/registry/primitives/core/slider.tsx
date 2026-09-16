"use client";

import * as SliderPrimitive from "@radix-ui/react-slider";
import * as React from "react";

import { cn } from "@/lib/registry/cn";

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max],
  );

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none select-none items-center data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "relative grow overflow-hidden rounded-full bg-muted data-[orientation=horizontal]:h-1.5 data-[orientation=vertical]:h-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-1.5",
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "absolute bg-primary data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full",
          )}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          // Position-stable key — DO NOT key by `_values[index]`. The
          // value changes on every drag tick, so a value-keyed thumb
          // gets unmounted + remounted mid-gesture, which kills the
          // pointermove subscription Radix sets up on pointerdown.
          // Result: the thumb only updates on discrete clicks because
          // each click is a fresh pointerdown → pointermove → pointerup
          // cycle. Position-keyed (`index`) thumbs stay mounted and
          // the drag gesture works as intended.
          // biome-ignore lint/suspicious/noArrayIndexKey: stable thumb position is the intentional key.
          key={index}
          aria-label={`Slider thumb ${index + 1} of ${_values.length}, value ${_values[index]}`}
          aria-valuenow={_values[index]}
          aria-valuemin={min}
          aria-valuemax={max}
          className="block size-4 shrink-0 rounded-full border border-primary bg-background shadow-sm ring-primary transition-[color,box-shadow] hover:ring-2 focus-visible:outline-hidden focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };
