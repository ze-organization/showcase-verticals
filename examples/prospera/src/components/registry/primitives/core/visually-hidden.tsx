import type * as React from "react";
import { cn } from "@/lib/registry/cn";

/**
 * Renders children for screen readers only (visually hidden).
 * Use for accessible labels on icon-only buttons, "Close", "Next slide", etc.
 */
function VisuallyHidden({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="visually-hidden"
      className={cn(
        "absolute size-px overflow-hidden whitespace-nowrap border-0 p-0",
        "clip-[rect(0,0,0,0)] clip-path-[inset(50%)]",
        "-m-px",
        className,
      )}
      {...props}
    />
  );
}
VisuallyHidden.displayName = "VisuallyHidden";

/** Alias for VisuallyHidden when you prefer the sr-only naming. */
const SrOnly = VisuallyHidden;
SrOnly.displayName = "SrOnly";

export { SrOnly, VisuallyHidden };
