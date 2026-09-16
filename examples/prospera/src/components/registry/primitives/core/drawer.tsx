"use client";

import type * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { useDirection } from "@/hooks/registry/use-direction";

import { cn } from "@/lib/registry/cn";

type DrawerDirection = "top" | "bottom" | "start" | "end";

/**
 * Vaul's `direction` prop only accepts physical `"left"|"right"|"top"|
 * "bottom"` values — it has no concept of inline-start / inline-end —
 * so the public `direction` here is logical (start/end) and we translate
 * to Vaul's physical model at the prop boundary. The internal CSS
 * (DrawerContent below) stays keyed off Vaul's `data-vaul-drawer-direction`
 * physical attribute for the same reason: using Tailwind logical
 * utilities there would double-flip in RTL against Vaul's already-
 * physical animation. Authors only see start/end; the physical-side
 * mechanics are an implementation detail of the Vaul integration.
 */
function Drawer({
  direction,
  ...props
}: Omit<React.ComponentProps<typeof DrawerPrimitive.Root>, "direction"> & {
  direction?: DrawerDirection;
}) {
  const textDirection = useDirection();
  const resolvedDirection =
    direction === "start"
      ? textDirection === "rtl"
        ? "right"
        : "left"
      : direction === "end"
        ? textDirection === "rtl"
          ? "left"
          : "right"
        : direction;

  return (
    <DrawerPrimitive.Root
      data-slot="drawer"
      direction={resolvedDirection}
      {...(props as React.ComponentProps<typeof DrawerPrimitive.Root>)}
    />
  );
}

function DrawerTrigger({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

function DrawerPortal({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
}

function DrawerClose({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn(
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-(--color-overlay,rgba(0,0,0,0.5)) data-[state=closed]:animate-out data-[state=open]:animate-in",
        className,
      )}
      {...props}
    />
  );
}

function DrawerContent({
  className,
  children,
  siblingMode = false,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content> & {
  siblingMode?: boolean;
}) {
  const content = (
    <DrawerPrimitive.Content
      data-slot="drawer-content"
      className={cn(
        "group/drawer-content fixed z-50 flex h-auto flex-col bg-(--drawer-background,var(--color-background))",
        "data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-lg data-[vaul-drawer-direction=top]:border-b",
        "data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-t-lg data-[vaul-drawer-direction=bottom]:border-t",
        "data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=right]:sm:max-w-sm",
        "data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=left]:sm:max-w-sm",
        // Sibling mode animation overrides
        "data-[sibling-mode=true]:transition-all data-[sibling-mode=true]:duration-300 data-[sibling-mode=true]:ease-in-out",
        "data-[sibling-mode=true][data-state=closed]:data-[vaul-drawer-direction=top]:-translate-y-full data-[sibling-mode=true][data-state=open]:data-[vaul-drawer-direction=top]:translate-y-0",
        "data-[sibling-mode=true][data-state=closed]:data-[vaul-drawer-direction=bottom]:translate-y-full data-[sibling-mode=true][data-state=open]:data-[vaul-drawer-direction=bottom]:translate-y-0",
        "data-[sibling-mode=true][data-state=closed]:data-[vaul-drawer-direction=left]:-translate-x-full data-[sibling-mode=true][data-state=open]:data-[vaul-drawer-direction=left]:translate-x-0",
        "data-[sibling-mode=true][data-state=closed]:data-[vaul-drawer-direction=right]:translate-x-full data-[sibling-mode=true][data-state=open]:data-[vaul-drawer-direction=right]:translate-x-0",
        className,
      )}
      data-sibling-mode={siblingMode}
      {...props}
    >
      <div className="mx-auto mt-4 hidden h-1.5 w-12 shrink-0 rounded-full bg-muted group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
      {children}
    </DrawerPrimitive.Content>
  );

  if (siblingMode) {
    return content;
  }

  return (
    <DrawerPortal data-slot="drawer-portal">
      <DrawerOverlay />
      {content}
    </DrawerPortal>
  );
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  );
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("flex gap-2 p-4", className)}
      {...props}
    />
  );
}

function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn("font-semibold text-foreground", className)}
      {...props}
    />
  );
}

function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
};
