"use client";

import { useMemo } from "react";
import { Button } from "@/components/registry/primitives/core/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
} from "@/components/registry/primitives/core/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/registry/primitives/core/dropdown-menu";
import { LibraryIcon } from "@/components/registry/primitives/core/library-icon";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/registry/primitives/core/tooltip";
import { TypographySmall } from "@/components/registry/primitives/core/typography";
import { cn } from "@/lib/registry/cn";

export interface ActionBarButton {
  label: string;
  icon?: string;
  onClick?: () => void;
  variant?: "default" | "outline" | "ghost";
  colorScheme?: "primary" | "neutral" | "success" | "destructive";
  ariaLabel?: string;
}

export interface ActionBarMenuItem {
  label: string;
  icon?: string;
  onClick?: () => void;
  variant?: "default" | "destructive";
}

export interface ActionBarProps {
  /** Primary actions shown as buttons (and in overflow menu on small screens). */
  actions?: {
    buttons?: ActionBarButton[];
    menuItems?: ActionBarMenuItem[];
  };
  displayOptions?: {
    selectedCount?: number;
    /** "fixed" = bottom drawer with overlay and native close; "static" = inline bar, no overlay. */
    position?: "fixed" | "static";
    align?: "left" | "center" | "right";
  };
  behaviorOptions?: {
    /** Controlled open state. When using position="fixed", the Drawer uses this. */
    isOpen?: boolean;
    /** Called when the bar should open or close (e.g. close button, escape, overlay click). */
    onOpenChange?: (open: boolean) => void;
    /** Called when the user cancels or closes the bar. */
    onCancel?: () => void;
    /**
     * Render the overflow ("More") dropdown already open. Preview seam
     * only — the menu is Radix-portalled and absent from the DOM until
     * a gesture opens it, so a static preview paints a bare trigger and
     * the menu items can never be seen or measured.
     */
    defaultOverflowOpen?: boolean;
  };
  styleOptions?: {
    className?: string;
  };
}

const DEFAULT_BUTTONS: ActionBarButton[] = [
  {
    label: "Publish",
    icon: "upload",
    variant: "outline",
    colorScheme: "neutral",
  },
  {
    label: "Unpublish",
    icon: "cloud",
    variant: "outline",
    colorScheme: "neutral",
  },
  {
    label: "Duplicate",
    icon: "clipboard",
    variant: "default",
    colorScheme: "primary",
  },
];

const DEFAULT_MENU_ITEMS: ActionBarMenuItem[] = [
  { label: "Archive", icon: "archive", variant: "default" },
  { label: "Delete", icon: "trash", variant: "destructive" },
];

/** Overflow dropdown: mobile-only action buttons plus the menu items. */
function OverflowMenu({
  overflowButtons,
  menuItems,
  defaultOpen,
}: {
  overflowButtons: ActionBarButton[];
  menuItems: ActionBarMenuItem[];
  defaultOpen?: boolean;
}) {
  return (
    <DropdownMenu defaultOpen={defaultOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-neutral-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label="More actions"
            >
              <LibraryIcon name="menu" className="size-4" aria-hidden={true} />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>More</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup className="*:data-[slot=dropdown-menu-item]:[&>svg]:text-muted-foreground">
          {overflowButtons.map((button) => (
            <DropdownMenuItem
              key={`overflow-${button.label}`}
              onClick={button.onClick}
              className="sm:hidden"
            >
              {button.icon && (
                <LibraryIcon
                  name={button.icon}
                  className="size-4"
                  aria-hidden={true}
                />
              )}
              {button.label}
            </DropdownMenuItem>
          ))}
          {overflowButtons.length > 0 && menuItems.length > 0 ? (
            <DropdownMenuSeparator className="sm:hidden" />
          ) : null}
          {menuItems.map((item) => (
            <DropdownMenuItem
              key={`menu-${item.label}`}
              variant={item.variant || "default"}
              onClick={item.onClick}
            >
              {item.icon && (
                <LibraryIcon
                  name={item.icon}
                  className="size-4"
                  aria-hidden={true}
                />
              )}
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ActionBar({
  actions,
  displayOptions,
  behaviorOptions,
  styleOptions,
}: ActionBarProps) {
  const isOpen = behaviorOptions?.isOpen ?? false;
  const resolvedOnOpenChange = behaviorOptions?.onOpenChange;
  const resolvedSelectedCount = displayOptions?.selectedCount ?? 0;
  const resolvedOnCancel = behaviorOptions?.onCancel;
  const resolvedButtons = actions?.buttons ?? DEFAULT_BUTTONS;
  const resolvedMenuItems = actions?.menuItems ?? DEFAULT_MENU_ITEMS;
  const className = styleOptions?.className;
  const align = displayOptions?.align ?? "center";
  const resolvedPosition = displayOptions?.position ?? "fixed";

  const handleCancel = () => {
    resolvedOnOpenChange?.(false);
    resolvedOnCancel?.();
  };

  const alignClasses = {
    left: "ms-4",
    center: "mx-auto",
    right: "me-4 ms-auto",
  };

  const buttonList = resolvedButtons ?? [];
  const { primaryButton, overflowButtons } = useMemo(() => {
    const list = resolvedButtons ?? [];
    const primary =
      list.find((button) => button.variant === "default") ?? list[0];
    const overflow = list.filter((button) => button !== primary);

    return {
      primaryButton: primary,
      overflowButtons: overflow,
    };
  }, [resolvedButtons]);

  const barContent = (
    <div
      className={cn(
        "flex w-full max-w-2xl flex-row flex-wrap items-center justify-between gap-3 rounded-lg border-border border-t bg-background px-4 py-3 shadow-lg",
        alignClasses[align],
      )}
    >
      <div className="flex flex-none shrink-0 items-center gap-4">
        <Tooltip>
          <TooltipTrigger asChild>
            {resolvedPosition === "fixed" ? (
              <DrawerClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Cancel"
                  className="hover:bg-neutral-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  onClick={handleCancel}
                >
                  <LibraryIcon name="x" className="size-4" aria-hidden={true} />
                </Button>
              </DrawerClose>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancel}
                aria-label="Cancel"
                className="hover:bg-neutral-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <LibraryIcon name="x" className="size-4" aria-hidden={true} />
              </Button>
            )}
          </TooltipTrigger>
          <TooltipContent>Cancel</TooltipContent>
        </Tooltip>

        <TypographySmall className="text-neutral">
          {resolvedSelectedCount} selected
        </TypographySmall>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {/* Desktop: all action buttons visible */}
        <div className="hidden items-center gap-2 sm:flex">
          {buttonList.map((button) => (
            <Button
              key={button.label}
              variant={button.variant || "outline"}
              colorScheme={button.colorScheme || "neutral"}
              onClick={button.onClick}
              className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {button.icon && (
                <LibraryIcon
                  name={button.icon}
                  className="size-4"
                  aria-hidden={true}
                />
              )}
              {button.label}
            </Button>
          ))}
        </div>

        {/* Mobile: only primary button visible */}
        <div className="flex items-center gap-2 sm:hidden">
          {primaryButton && (
            <Button
              variant={primaryButton.variant || "default"}
              colorScheme={primaryButton.colorScheme || "primary"}
              onClick={primaryButton.onClick}
              aria-label={primaryButton.ariaLabel || primaryButton.label}
              className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {primaryButton.icon && (
                <LibraryIcon
                  name={primaryButton.icon}
                  className="size-4"
                  aria-hidden={true}
                />
              )}
              {primaryButton.label}
            </Button>
          )}
        </div>

        {/* More menu */}
        {((resolvedMenuItems?.length ?? 0) > 0 ||
          overflowButtons.length > 0) && (
          <OverflowMenu
            overflowButtons={overflowButtons}
            menuItems={resolvedMenuItems ?? []}
            defaultOpen={behaviorOptions?.defaultOverflowOpen}
          />
        )}
      </div>
    </div>
  );

  if (resolvedPosition === "fixed") {
    return (
      <Drawer
        open={isOpen}
        onOpenChange={resolvedOnOpenChange}
        direction="bottom"
      >
        <DrawerContent
          className={cn(
            "mx-auto max-w-2xl border-t px-4 pt-3 pb-4 [&>div.bg-muted]:hidden",
            className,
          )}
        >
          {barContent}
        </DrawerContent>
      </Drawer>
    );
  }

  return <div className={cn("w-full px-4 pb-4", className)}>{barContent}</div>;
}
