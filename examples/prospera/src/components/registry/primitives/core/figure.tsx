import type * as React from "react";

import { cn } from "@/lib/registry/cn";

/**
 * Semantic wrapper for media (image, video) with optional caption.
 * Use FigureMedia for the asset and FigureCaption for the caption.
 */
function Figure({ className, ...props }: React.ComponentProps<"figure">) {
  return (
    <figure
      data-slot="figure"
      className={cn("flex w-full flex-col gap-1", className)}
      {...props}
    />
  );
}

function FigureMedia({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="figure-media"
      className={cn("overflow-hidden", className)}
      {...props}
    />
  );
}

function FigureCaption({
  className,
  ...props
}: React.ComponentProps<"figcaption">) {
  return (
    <figcaption
      data-slot="figure-caption"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export { Figure, FigureCaption, FigureMedia };
