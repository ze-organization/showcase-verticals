"use client";

import type { ReactNode } from "react";
import * as React from "react";
import { cn } from "@/lib/registry/cn";

export interface StackNavigationItem {
  id?: string;
  name: string;
  path: string;
  icon: ReactNode;
  badge?: ReactNode;
  className?: string;
}

export interface StackNavigationDivider {
  type: "divider";
  id?: string;
  className?: string;
}

export type StackNavigationElement =
  | StackNavigationItem
  | StackNavigationDivider;

export interface StackNavigationProps {
  items: StackNavigationElement[];
  renderItem?: (item: StackNavigationItem) => ReactNode;
  renderDivider?: (divider: StackNavigationDivider, index: number) => ReactNode;
  className?: string;
  navClassName?: string;
  width?: string;
  header?: ReactNode;
  footer?: ReactNode;
  orientation?: "vertical" | "horizontal";
  /**
   * For framework-specific routers, user can pass the pathname from their hooks:
   * - TanStack Router: `useLocation().pathname`
   * - React Router: `useLocation().pathname`
   * - Next.js: `usePathname()`
   */
  pathname?: string;

  onItemClick?: (
    item: StackNavigationItem,
    event: React.MouseEvent<HTMLAnchorElement>,
  ) => boolean | undefined;
}

function DefaultNavItem({
  item,
  orientation = "vertical",
  pathname,
  onItemClick,
}: {
  item: StackNavigationItem;
  orientation?: "vertical" | "horizontal";
  pathname: string;
  onItemClick?: (
    item: StackNavigationItem,
    event: React.MouseEvent<HTMLAnchorElement>,
  ) => boolean | undefined;
}) {
  const isActive = pathname === item.path;

  const isHorizontal = orientation === "horizontal";

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onItemClick) {
      const result = onItemClick(item, e);
      if (result === false) {
        e.preventDefault();
      }
    }
  };

  return (
    <a
      href={item.path}
      onClick={handleClick}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        // ---------VERTICAL--------------
        !isHorizontal &&
          cn(
            "flex",
            "min-h-14",
            "h-14",
            "min-w-14",
            "flex-col",
            "items-center",
            "justify-center",
            "gap-1",
            "overflow-hidden",
            "p-1.5",
            "rounded-md",
            "font-medium",
            "text-[10px]",
            "text-sidebar-foreground",
            "transition-colors",
            "relative",
            "cursor-pointer",
            "opacity-100",
            "no-underline",
            "hover:bg-sidebar-accent",
            "hover:text-sidebar-accent-foreground",
            isActive &&
              cn(
                "bg-sidebar-primary",
                "text-sidebar-primary-foreground",
                "font-medium",
              ),
            item.className,
          ),

        // --------- HORIZONTAL ---------
        isHorizontal &&
          cn(
            "flex",
            "h-14",
            "min-w-14",
            "w-fit",
            "flex-col",
            "items-center",
            "justify-center",
            "gap-1",
            "overflow-hidden",
            "rounded-md",
            "p-1.5",
            "font-medium",
            "text-sidebar-foreground",
            "transition-colors",
            "cursor-pointer",
            "no-underline",
            "hover:bg-sidebar-accent",
            "hover:text-sidebar-accent-foreground",
            isActive &&
              cn(
                "bg-sidebar-primary",
                "text-sidebar-primary-foreground",
                "font-medium",
              ),
            item.className,
          ),
      )}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Icon */}
      <div
        aria-hidden="true"
        className={cn(
          "flex",
          "h-[22px]",
          "w-[22px]",
          "shrink-0",
          "items-center",
          "justify-center",
        )}
      >
        {item.icon}
      </div>

      {/* Text below icon */}
      <span
        className={cn(
          !isHorizontal &&
            cn(
              "block",
              "w-full",
              "overflow-hidden",
              "text-ellipsis",
              "whitespace-nowrap",
              "text-center",
              "text-[10px]",
              "leading-[150%]",
              "tracking-normal",
            ),
          isHorizontal &&
            cn(
              "whitespace-nowrap",
              "text-center",
              "text-[10px]",
              "leading-tight",
            ),
        )}
        title={item.name}
      >
        {item.name}
      </span>

      {!isHorizontal && item.badge && (
        <div className="absolute end-1 top-1">{item.badge}</div>
      )}
    </a>
  );
}

function DefaultDivider({
  divider,
  orientation = "vertical",
}: {
  divider: StackNavigationDivider;
  orientation?: "vertical" | "horizontal";
}) {
  if (orientation === "horizontal") {
    return (
      <div
        className={cn(
          "h-6",
          "w-px",
          "bg-border",
          "opacity-100",
          divider.className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "h-px",
        "w-14",
        "bg-border",
        "opacity-100",
        divider.className,
      )}
    />
  );
}

export function StackNavigation({
  items,
  renderItem,
  renderDivider,
  className,
  navClassName,
  width = "w-[72px]",
  header,
  footer,
  orientation = "vertical",
  pathname: providedPathname,
  onItemClick,
}: StackNavigationProps) {
  // Use provided pathname or fall back to window.location.pathname
  const [clientPathname, setClientPathname] = React.useState("");

  React.useEffect(() => {
    // Only set pathname on client side to avoid hydration mismatch
    if (typeof window !== "undefined" && !providedPathname) {
      setClientPathname(window.location.pathname);
    }
  }, [providedPathname]);

  const pathname = providedPathname ?? clientPathname;
  const isHorizontal = orientation === "horizontal";
  const hasShadowNone = className?.includes("shadow-none");
  const shadowClass = hasShadowNone ? "" : "shadow-base";
  const renderedItems = React.useMemo(
    () =>
      items.map((item, index) => {
        if ("type" in item && item.type === "divider") {
          const dividerKey = item.id ?? item.className ?? "divider";
          return renderDivider ? (
            <div key={dividerKey}>{renderDivider(item, index)}</div>
          ) : (
            <DefaultDivider
              key={dividerKey}
              divider={item}
              orientation={orientation}
            />
          );
        }

        const navItem = item as StackNavigationItem;
        const navKey = navItem.id ?? navItem.path ?? navItem.name;
        return (
          <div key={navKey}>
            {renderItem ? (
              renderItem(navItem)
            ) : (
              <DefaultNavItem
                item={navItem}
                orientation={orientation}
                pathname={pathname}
                onItemClick={onItemClick}
              />
            )}
          </div>
        );
      }),
    [items, renderDivider, renderItem, orientation, pathname, onItemClick],
  );

  return (
    <aside
      className={cn(
        !isHorizontal &&
          cn(
            width,
            "flex",
            "min-h-full",
            "flex-col",
            "bg-sidebar",
            "p-1.5",
            "text-sidebar-foreground",
            "opacity-100",
            shadowClass,
            className,
          ),
        isHorizontal &&
          cn(
            "flex",
            "w-full",
            "flex-row",
            "items-center",
            "overflow-x-auto",
            "bg-sidebar",
            "p-1.5",
            "text-sidebar-foreground",
            shadowClass,
            className,
          ),
      )}
    >
      {/* HEADER */}
      {!isHorizontal && header && (
        <div className={cn("flex", "w-full", "shrink-0", "justify-center")}>
          {header}
        </div>
      )}

      <div
        className={cn(
          !isHorizontal && cn("flex-1", "overflow-auto"),
          isHorizontal && cn("flex-1", "overflow-x-auto"),
        )}
      >
        <nav
          className={cn(
            !isHorizontal && cn("flex", "flex-col", "gap-1"),
            isHorizontal &&
              cn(
                "flex",
                "h-full",
                "flex-row",
                "items-center",
                "justify-center",
                "gap-1",
              ),
            navClassName,
          )}
        >
          {renderedItems}
        </nav>
      </div>

      {/* Footer only for vertical */}
      {!isHorizontal && footer && (
        <div
          className={cn(
            "mx-2",
            "flex",
            "shrink-0",
            "justify-center",
            "overflow-hidden",
            "py-1.5",
            "text-[10px]",
            "text-sidebar-foreground/70",
          )}
        >
          {footer}
        </div>
      )}
    </aside>
  );
}
