"use client";

import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { Button } from "@/components/registry/primitives/core/button";
import { Input } from "@/components/registry/primitives/core/input";
import { Textarea } from "@/components/registry/primitives/core/textarea";
import { cn } from "@/lib/registry/cn";

function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: role="group" clusters the control + addons as one ARIA group; <fieldset> would impose form-field-set semantics and break the flex shell layout.
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        "group/input-group relative flex w-full items-center rounded-md border border-input shadow-xs outline-none transition-[color,box-shadow] dark:bg-input/30",
        "h-9 min-w-0 has-[>textarea]:h-auto",

        // Variants based on alignment. Use logical ps/pe so padding mirrors in RTL. Target control (input/textarea) by slot.
        "has-[>[data-align=inline-start]]:*:data-[slot=input-group-control]:ps-2",
        "has-[>[data-align=inline-end]]:*:data-[slot=input-group-control]:pe-2",
        "has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-start]]:*:data-[slot=input-group-control]:pb-3",
        "has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-end]]:*:data-[slot=input-group-control]:pt-3",

        // Focus state (matches input primary focus style).
        "has-[[data-slot=input-group-control]:focus-visible]:border-primary has-[[data-slot=input-group-control]:focus-visible]:ring-1 has-[[data-slot=input-group-control]:focus-visible]:ring-primary/50",
        // Focus state for buttons inside input group (dropdown triggers, etc.)
        "has-[button:focus-visible]:border-primary has-[button:focus-visible]:ring-1 has-[button:focus-visible]:ring-primary/50",

        // Error state.
        "has-[[data-slot][aria-invalid=true]]:border-destructive has-[[data-slot][aria-invalid=true]]:ring-destructive/20 dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40",

        className,
      )}
      {...props}
    />
  );
}

const inputGroupAddonVariants = cva(
  "text-muted-foreground flex h-auto cursor-text items-center justify-center gap-2 py-1.5 text-sm font-medium select-none [&>svg:not([class*='size-'])]:size-4 [&>kbd]:rounded-[var(--radius-sm)] group-data-[disabled=true]/input-group:opacity-50",
  {
    variants: {
      align: {
        // Padding: ps/pe on both sides so addon has consistent space from outer edge (ps/pe) and from input (pe/ps). RTL mirrors via logical properties.
        "inline-start":
          "order-first ps-3 pe-3 has-[>button]:ms-[-0.45rem] has-[>kbd]:ms-[-0.35rem] rtl:has-[>button]:ms-0 rtl:has-[>button]:me-[-0.45rem] rtl:has-[>kbd]:ms-0 rtl:has-[>kbd]:me-[-0.35rem]",
        "inline-end":
          "order-last ps-3 pe-3 has-[>button]:me-[-0.45rem] has-[>kbd]:me-[-0.35rem] rtl:has-[>button]:me-0 rtl:has-[>button]:ms-[-0.45rem] rtl:has-[>kbd]:me-0 rtl:has-[>kbd]:ms-[-0.35rem]",
        "block-start":
          "order-first w-full justify-start ps-3 pe-3 pt-3 [.border-b]:pb-3 group-has-[>input]/input-group:pt-2.5",
        "block-end":
          "order-last w-full justify-start ps-3 pe-3 pb-3 [.border-t]:pt-3 group-has-[>input]/input-group:pb-2.5",
      },
    },
    defaultVariants: {
      align: "inline-start",
    },
  },
);

function InputGroupAddon({
  className,
  align = "inline-start",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: pointer-only convenience that forwards clicks on the addon chrome to focus the input; keyboard users reach the input directly via Tab, so no keyboard handler is needed.
    // biome-ignore lint/a11y/noStaticElementInteractions: the addon is presentational chrome (icons/text/buttons) whose only handler is the pointer-only focus delegation above; a semantic role would mislead AT.
    <div
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) {
          return;
        }
        const input = e.currentTarget.parentElement?.querySelector("input");
        if (!input || input.disabled) {
          return;
        }
        input.focus();
        input.click();
      }}
      {...props}
    />
  );
}

const inputGroupButtonVariants = cva(
  "text-sm shadow-none flex gap-2 items-center",
  {
    variants: {
      size: {
        xs: "h-6 gap-1 ps-2 pe-2 rounded-full [&>svg:not([class*='size-'])]:size-3.5 has-[>svg]:ps-2 has-[>svg]:pe-2",
        sm: "h-8 ps-2.5 pe-2.5 gap-1.5 rounded-full has-[>svg]:ps-2.5 has-[>svg]:pe-2.5",
        "icon-xs": "size-6 rounded-full p-0 has-[>svg]:p-0",
        "icon-sm": "size-8 rounded-full p-0 has-[>svg]:p-0",
      },
    },
    defaultVariants: {
      size: "xs",
    },
  },
);

function InputGroupButton({
  className,
  type = "button",
  variant = "ghost",
  size = "xs",
  ...props
}: Omit<React.ComponentProps<typeof Button>, "size"> &
  VariantProps<typeof inputGroupButtonVariants>) {
  return (
    <Button
      type={type}
      data-size={size}
      variant={variant}
      className={cn(inputGroupButtonVariants({ size }), className)}
      {...props}
    />
  );
}

function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "flex items-center gap-2 text-muted-foreground text-sm [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none",
        className,
      )}
      {...props}
    />
  );
}

function InputGroupInput({
  className,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <Input
      data-slot="input-group-control"
      className={cn(
        "flex-1 rounded-none border-none bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent",
        className,
      )}
      {...props}
    />
  );
}

function InputGroupTextarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <Textarea
      data-slot="input-group-control"
      className={cn(
        "flex-1 resize-none rounded-none border-none bg-transparent py-3 shadow-none focus-visible:ring-0 dark:bg-transparent",
        className,
      )}
      {...props}
    />
  );
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
};
