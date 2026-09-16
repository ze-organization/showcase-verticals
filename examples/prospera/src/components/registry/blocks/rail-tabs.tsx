"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import type React from "react";
import { cn } from "@/lib/registry/cn";

/**
 * `RailTabs` — vertical-rail expanding tabs (the diageo home-page
 * pattern): a horizontal row of collapsed rails, each carrying a
 * rotated label, where selecting a rail smoothly expands its panel to
 * fill the remaining width while the previously-open panel collapses
 * back to a rail.
 *
 * Semantically this is a horizontal, always-one-open accordion — each
 * rail is a real Radix trigger (button, `aria-expanded`, arrow-key
 * navigation via `orientation="horizontal"`), so keyboard and AT
 * behaviour come from the primitive rather than a bespoke tab shim.
 *
 * The open/close animation is a `flex-grow` transition on the item:
 * every item keeps a constant flex-basis (the rail width) and the open
 * item grows into the free space. Panel content sits in an
 * `overflow-hidden` region with a fixed comfortable min-width, so it
 * is progressively revealed by the wipe instead of reflowing at every
 * animation frame. Honors `prefers-reduced-motion`.
 */

export interface RailTabItem {
  id: string;
  /** Rail label — rendered rotated in the collapsed rail. */
  label: React.ReactNode;
  /** Expanded panel content. */
  content: React.ReactNode;
}

export interface RailTabsProps {
  items: RailTabItem[];
  /** Which item starts expanded; defaults to the first. */
  defaultItemId?: string;
  className?: string;
  /** Extra classes on each rail trigger. */
  railClassName?: string;
  /** Extra classes on each expanded panel's inner wrapper. */
  panelClassName?: string;
  ariaLabel?: string;
}

export function RailTabs({
  items,
  defaultItemId,
  className,
  railClassName,
  panelClassName,
  ariaLabel,
}: RailTabsProps) {
  if (!items.length) return null;

  const resolvedDefaultId =
    (defaultItemId && items.some((item) => item.id === defaultItemId)
      ? defaultItemId
      : undefined) ?? items[0]?.id;

  return (
    <AccordionPrimitive.Root
      type="single"
      defaultValue={resolvedDefaultId}
      orientation="horizontal"
      aria-label={ariaLabel}
      data-slot="rail-tabs"
      className={cn(
        "flex w-full min-w-0 flex-row items-stretch overflow-hidden",
        className,
      )}
    >
      {items.map((item) => (
        <AccordionPrimitive.Item
          key={item.id}
          value={item.id}
          data-slot="rail-tabs-item"
          className={cn(
            // The basis MUST be a fixed rail width (matching the trigger's
            // w-12/md:w-14), never `basis-auto`: with auto, each item's flex
            // base size is its CONTENT width — and the force-mounted panel
            // keeps every item ~content-wide whether open or closed, so
            // there is no free space and the flex-grow transition moves
            // nothing (the switch degrades to a bare opacity cross-fade).
            "flex min-w-0 shrink-0 grow-0 basis-12 flex-row items-stretch md:basis-14",
            "transition-[flex-grow] duration-500 ease-in-out will-change-[flex-grow] motion-reduce:transition-none",
            "data-[state=open]:min-w-0 data-[state=open]:grow",
          )}
        >
          <AccordionPrimitive.Header className="flex shrink-0">
            <AccordionPrimitive.Trigger
              data-slot="rail-tabs-trigger"
              className={cn(
                "flex w-12 shrink-0 cursor-pointer flex-col items-center justify-start px-2 py-6 md:w-14",
                "border-border border-s text-muted-foreground outline-none transition-colors",
                "hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50",
                "data-[state=open]:border-foreground/60 data-[state=open]:border-s-2 data-[state=open]:border-dashed data-[state=open]:text-foreground",
                railClassName,
              )}
            >
              <span className="rotate-180 whitespace-nowrap font-medium text-xs uppercase tracking-[0.2em] [writing-mode:vertical-rl]">
                {item.label}
              </span>
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>

          {/*
            forceMount keeps the panel in the DOM so the flex-grow wipe
            reveals it instead of popping it in; `invisible` on the
            closed state removes it from tab order + the a11y tree the
            way Radix's default unmount would.
          */}
          <AccordionPrimitive.Content
            forceMount
            data-slot="rail-tabs-panel"
            className={cn(
              "min-w-0 flex-1 overflow-hidden",
              "transition-[opacity] duration-300 motion-reduce:transition-none",
              "data-[state=closed]:pointer-events-none data-[state=closed]:invisible data-[state=closed]:opacity-0",
              "data-[state=open]:opacity-100 data-[state=open]:delay-150",
            )}
          >
            <div
              className={cn(
                "h-full min-w-[min(36rem,calc(100vw-8rem))] px-5 py-6 md:px-8",
                panelClassName,
              )}
            >
              {item.content}
            </div>
          </AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
      ))}
    </AccordionPrimitive.Root>
  );
}
