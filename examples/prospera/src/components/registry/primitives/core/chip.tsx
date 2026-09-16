"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { ThemeIcon } from "@/components/registry/primitives/core/theme-icon";
import { cn } from "@/lib/registry/cn";

const chipVariants = cva(
  "inline-flex items-center gap-1.5 rounded w-fit whitespace-nowrap shrink-0 leading-none [&>svg]:size-3 [&>svg]:pointer-events-none transition-[color,box-shadow] overflow-hidden wrap-break-word",
  {
    variants: {
      variant: {
        default: "font-normal bg-muted text-foreground",
        outline: "border border-border bg-transparent text-foreground",
        rounded: "rounded-full font-normal bg-muted text-foreground",
      },
      size: {
        sm: "h-5 px-2 text-xs",
        md: "h-6 px-2.5 text-sm",
        lg: "h-7 px-3 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface ChipProps
  extends Omit<React.ComponentProps<"span">, "onClick">,
    VariantProps<typeof chipVariants> {
  asChild?: boolean;
  /** When provided, a remove button is shown and this is called when it is activated. */
  onRemove?: () => void;
  /** Accessible label for the remove button. */
  removeLabel?: string;
}

function Chip({
  className,
  variant,
  size = "md",
  asChild = false,
  onRemove,
  removeLabel = "Remove",
  children,
  ...props
}: ChipProps) {
  const Comp = asChild ? Slot : "span";
  const hasRemove = onRemove != null;

  return (
    <Comp
      data-slot="chip"
      data-variant={variant ?? "default"}
      data-size={size ?? "md"}
      className={cn(
        chipVariants({ variant, size }),
        hasRemove && "pe-1",
        className,
      )}
      {...props}
    >
      {children}
      {hasRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
          className="relative inline-flex pointer-coarse:size-7 size-5 shrink-0 items-center justify-center rounded-full outline-none pointer-coarse:before:absolute pointer-coarse:before:inset-[-9px] pointer-coarse:before:content-[''] hover:bg-black/10 focus-visible:ring-2 focus-visible:ring-primary dark:hover:bg-white/10"
          aria-label={removeLabel}
        >
          <ThemeIcon name="x" className="size-3" aria-hidden />
        </button>
      )}
    </Comp>
  );
}
Chip.displayName = "Chip";

export { Chip, chipVariants };
