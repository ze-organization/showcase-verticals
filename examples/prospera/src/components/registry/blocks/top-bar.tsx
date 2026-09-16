"use client";

import type { ReactNode } from "react";
import { memo, useContext, useState } from "react";

import {
  Header,
  HeaderEnd,
  HeaderInner,
  HeaderNav,
  HeaderNavContext,
  HeaderStart,
} from "@/components/registry/primitives/core/header";
import {
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/registry/primitives/core/navigation-menu";
import { TypographyLarge } from "@/components/registry/primitives/core/typography";
import { Image } from "@/components/registry/primitives/editables/image";
import { cn } from "@/lib/registry/cn";

export interface NavDropdownItem {
  id?: string;
  label: string;
  href: string;
}
export interface NavItem {
  id?: string;
  label: string;
  href?: string;
  isActive?: boolean;
  children?: NavDropdownItem[];
}

export interface LogoConfig {
  light: string;
  dark: string;
  alt?: string;
}

export interface RightSideItem {
  id: string;
  content: ReactNode;
}

/** Main Topbar component props */
export interface TopbarProps {
  logo?: LogoConfig;
  brandName?: string;
  navigation?: NavItem[];
  rightSideItems?: RightSideItem[];
  className?: string;
  /**
   * Render every vertical nav row's child list already expanded.
   * Preview seam only — the sub-tree is state-gated and renders nothing
   * until clicked, so a static preview paints bare parent rows and the
   * nested items can never be seen or measured.
   */
  defaultTreeOpen?: boolean;
}

// Desktop nav (shared between header and mobile sheet)
const TopbarNavItems = memo(function TopbarNavItems({
  navigation,
  defaultTreeOpen,
}: {
  navigation: NavItem[];
  defaultTreeOpen?: boolean;
}) {
  const navContext = useContext(HeaderNavContext);
  const isVertical = navContext?.orientation === "vertical";

  if (isVertical) {
    return (
      <>
        {navigation.map((item) => (
          <TopbarTreeItem
            key={item.id ?? item.label}
            item={item}
            defaultOpen={defaultTreeOpen}
          />
        ))}
      </>
    );
  }

  const renderDesktopLink = (item: NavItem) => {
    const classes = cn(navigationMenuTriggerStyle(), item.isActive && "active");

    if (!item.href) {
      return (
        <span className={classes} aria-disabled="true">
          {item.label}
        </span>
      );
    }

    return (
      <NavigationMenuLink href={item.href} className={classes}>
        {item.label}
      </NavigationMenuLink>
    );
  };

  return (
    <>
      {navigation.map((item) => (
        <NavigationMenuItem key={item.id ?? item.label}>
          {item.children && item.children.length > 0 ? (
            <>
              <NavigationMenuTrigger>{item.label}</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[200px] gap-2">
                  {item.children.map((child) => (
                    <li key={child.id ?? child.label}>
                      <NavigationMenuLink href={child.href}>
                        {child.label}
                      </NavigationMenuLink>
                    </li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </>
          ) : (
            renderDesktopLink(item)
          )}
        </NavigationMenuItem>
      ))}
    </>
  );
});

function TopbarTreeItem({
  item,
  defaultOpen,
}: {
  item: NavItem;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const hasChildren = (item.children?.length ?? 0) > 0;

  if (!hasChildren) {
    return (
      <NavigationMenuItem>
        {item.href ? (
          <NavigationMenuLink
            href={item.href}
            className="rounded-md px-3 py-2 text-sm hover:bg-muted"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            {item.label}
          </NavigationMenuLink>
        ) : (
          <span
            className="rounded-md px-3 py-2 text-muted-foreground text-sm"
            aria-disabled="true"
          >
            {item.label}
          </span>
        )}
      </NavigationMenuItem>
    );
  }

  return (
    <NavigationMenuItem>
      <div className="w-full">
        <button
          type="button"
          className="flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted"
          onClick={(event) => {
            event.stopPropagation();
            setOpen((value) => !value);
          }}
          aria-expanded={open}
        >
          <span>{item.label}</span>
          <span
            className={cn(
              "inline-block text-md leading-none transition-transform",
              open && "rotate-90",
            )}
            aria-hidden
          >
            ▶
          </span>
        </button>
        {open ? (
          <ul className="ms-4 mt-1 flex flex-col border-border border-s ps-2">
            {item.children?.map((child) => (
              <li key={child.id ?? child.label}>
                <NavigationMenuLink
                  href={child.href}
                  className="rounded-md px-3 py-2 text-sm hover:bg-muted"
                  onClick={(event) => {
                    event.stopPropagation();
                  }}
                >
                  {child.label}
                </NavigationMenuLink>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </NavigationMenuItem>
  );
}

// MAIN COMPONENT
function Topbar({
  logo,
  brandName,
  navigation = [],
  rightSideItems = [],
  className,
  defaultTreeOpen,
}: TopbarProps) {
  return (
    <Header className={cn("w-full border-b bg-background", className)}>
      <HeaderInner className="px-4">
        <HeaderStart className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            {logo && (
              <span className="shrink-0">
                {/*
                  `h-8 w-auto` is load-bearing, not cosmetic. Without a
                  height these rendered 8x8 — the `p-1` padding and a
                  0x0 content box — because the shipped logo SVGs carry
                  a `viewBox` and no `width`/`height`, so they have an
                  intrinsic RATIO but no intrinsic SIZE. `w-auto` then
                  resolved against a shrink-to-fit flex item whose width
                  depends on the image: circular, resolves to zero.

                  It is not an SVG-only problem. A raster logo whose URL
                  is slow or 404s collapses the same way and then pops
                  to natural size on load, which is layout shift on
                  every page that mounts this bar. Fixing the height
                  reserves the box before any bytes arrive.

                  `object-contain`, not `object-cover`: a wordmark is
                  far wider than it is tall, and cover would crop it now
                  that the height is real.
                */}
                <Image
                  value={{ src: logo.light, alt: logo.alt ?? "Logo" }}
                  className={cn(
                    "block h-8 w-auto rounded-md object-contain object-left p-1 dark:hidden",
                  )}
                />
                <Image
                  value={{ src: logo.dark, alt: logo.alt ?? "Logo" }}
                  className={cn(
                    "hidden h-8 w-auto rounded-md object-contain object-left p-1 dark:block",
                  )}
                />
              </span>
            )}
            {brandName && (
              <TypographyLarge className="truncate">
                {brandName}
              </TypographyLarge>
            )}
          </div>
        </HeaderStart>

        <HeaderNav>
          {navigation.length > 0 ? (
            <TopbarNavItems
              navigation={navigation}
              defaultTreeOpen={defaultTreeOpen}
            />
          ) : null}
        </HeaderNav>

        <HeaderEnd className="flex items-center space-x-4 rtl:space-x-reverse">
          {rightSideItems.map((item) => (
            <div key={item.id}>{item.content}</div>
          ))}
        </HeaderEnd>
      </HeaderInner>
    </Header>
  );
}

export { Topbar };
export default Topbar;
