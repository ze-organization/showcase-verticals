"use client";

import * as React from "react";

import HamburgerIcon from "@/components/registry/graphics/icons/hamburger-icon";
import {
  NavigationMenu,
  NavigationMenuList,
} from "@/components/registry/primitives/core/navigation-menu";
import { cn } from "@/lib/registry/cn";

/** When orientation is "vertical", Navigation block can render a compact list for the drawer. */
export const HeaderNavContext = React.createContext<
  { orientation: "horizontal" | "vertical" } | undefined
>(undefined);

/**
 * Shell for a page header bar. Use HeaderInner for the inner container
 * and HeaderStart, HeaderNav, HeaderEnd for the three zones.
 * On mobile, only HeaderStart stays in the bar; HeaderNav and HeaderEnd
 * move into a hamburger drawer.
 */
function Header({
  className,
  style,
  ...props
}: React.ComponentProps<"header">) {
  return (
    <header
      data-slot="header"
      // `w-full` is a full-bleed INVARIANT: a site header's background band
      // must always span 100% of its container so it reads edge-to-edge like
      // the hero below it — the inner `HeaderInner` / `.container` row is what
      // holds content to a max-width. Without it a block `<header>` dropped
      // into a flex / inline parent (as generated pages do) collapses to its
      // content width and the dark band cuts off mid-viewport. The band is
      // never width-constrained; the inner row owns the max-width.
      className={cn(
        "component header relative w-full bg-background",
        className,
      )}
      // Merge any caller `style` (e.g. the Header shell's exact
      // `SurfaceColor` backgroundColor) AFTER our own so it composes with
      // `--header-height` instead of clobbering it.
      style={{ "--header-height": "4rem", ...style } as React.CSSProperties}
      {...props}
    />
  );
}

function HeaderStart({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="header-start"
      className={cn(
        // Logo column is content-sized and never shrinks. `min-w-0` +
        // `flex-1` used to let this slot collapse under the nav strip,
        // so the wordmark overflowed into the first nav item. Grow on
        // small viewports only, to push the hamburger to the inline end.
        "flex shrink-0 items-center max-lg:grow",
        className,
      )}
      {...props}
    />
  );
}

function HeaderNav({
  className,
  children,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<"div"> & {
  /** Vertical for drawer/mobile menu; horizontal for desktop bar. */
  orientation?: "horizontal" | "vertical";
}) {
  const isVertical = orientation === "vertical";

  return (
    <div
      data-slot="header-nav"
      data-orientation={orientation}
      className={cn(
        // Remaining space after the logo / end cluster. A forced
        // `w-2/3` used to starve the logo column on tablet widths.
        !isVertical && "min-w-0 flex-1",
        isVertical && "w-full",
        className,
      )}
      {...props}
    >
      <NavigationMenu
        viewport={!isVertical}
        className={isVertical ? "w-full flex-col" : "w-full justify-start"}
      >
        <NavigationMenuList
          className={cn(
            isVertical
              ? "flex w-full flex-col flex-nowrap items-stretch gap-0.5"
              : "flex h-full flex-nowrap justify-start gap-5",
          )}
        >
          {children}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}

function HeaderEnd({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<"div"> & {
  /** Vertical for drawer/mobile menu; horizontal for desktop bar. */
  orientation?: "horizontal" | "vertical";
}) {
  const isVertical = orientation === "vertical";

  return (
    <div
      data-slot="header-end"
      data-orientation={orientation}
      className={cn(
        !isVertical && "flex shrink-0 items-center justify-end",
        isVertical && "flex w-full flex-row flex-wrap items-center gap-2",
        className,
      )}
      {...props}
    />
  );
}

function HeaderInner({
  className,
  children,
  drawer = true,
  ...props
}: React.ComponentProps<"div"> & {
  /**
   * Render the built-in mobile hamburger + slide-in drawer (default).
   * Pass `false` when the consumer owns its own responsive treatment —
   * e.g. the composed `header@1` shell, which exposes a dedicated
   * mobile slot for `mobile-menu@1` renderings; leaving the built-in
   * drawer on there produced a SECOND floating hamburger next to the
   * composed one, and its drawer duplicated the bar's slot content.
   * With `drawer={false}` only the container renders and children lay
   * out with their own classes — no child partitioning, no hamburger,
   * no drawer, no backdrop.
   */
  drawer?: boolean;
}) {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const childrenArray = React.Children.toArray(children);
  // Hooks stay above the drawer-less early return so their order is
  // unconditional (rules-of-hooks).
  const closeDrawer = React.useCallback(() => setIsDrawerOpen(false), []);
  const toggleDrawer = React.useCallback(() => setIsDrawerOpen((v) => !v), []);

  if (!drawer) {
    return (
      <div
        data-slot="header-inner"
        className={cn(
          "container relative mx-auto flex min-h-(--header-height,4rem) flex-nowrap items-center gap-3 px-4 lg:gap-5",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  }

  const startChild = childrenArray.find(
    (c): c is React.ReactElement =>
      React.isValidElement(c) && c.type === HeaderStart,
  );
  const navChild = childrenArray.find(
    (c): c is React.ReactElement<{ orientation?: "horizontal" | "vertical" }> =>
      React.isValidElement(c) && c.type === HeaderNav,
  );
  const endChild = childrenArray.find(
    (c): c is React.ReactElement<{ orientation?: "horizontal" | "vertical" }> =>
      React.isValidElement(c) && c.type === HeaderEnd,
  );

  return (
    <>
      <div
        data-slot="header-inner"
        className={cn(
          "container relative mx-auto flex min-h-(--header-height,4rem) flex-nowrap items-center gap-3 px-4 lg:gap-5",
          className,
        )}
        {...props}
      >
        {startChild}
        <div
          className="order-3 flex shrink-0 items-center lg:order-0 lg:hidden"
          aria-hidden
        >
          <HamburgerIcon
            isOpen={isDrawerOpen}
            onClick={toggleDrawer}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleDrawer();
              }
            }}
            aria-label={isDrawerOpen ? "Close menu" : "Open menu"}
            aria-controls="header-drawer"
            aria-expanded={isDrawerOpen}
          />
        </div>
        {navChild ? (
          <div className="max-lg:hidden lg:min-w-0 lg:flex-1">
            {navChild}
          </div>
        ) : null}
        {endChild ? (
          <div className="max-lg:order-2 max-lg:flex lg:order-0 lg:block">
            {endChild}
          </div>
        ) : null}
      </div>

      {/* Mobile drawer: slides in from start (left); nav then separator then end, all at top */}
      <nav
        id="header-drawer"
        aria-label="Navigation"
        className={cn(
          "scrollbar-end-side fixed start-0 top-0 z-50 h-full w-80 max-w-[85vw] overflow-y-auto border-border border-e bg-background shadow-lg transition-[transform] duration-200 ease-out lg:hidden",
          isDrawerOpen
            ? "translate-x-0"
            : "-translate-x-full rtl:translate-x-full",
        )}
      >
        <HeaderNavContext.Provider value={{ orientation: "vertical" }}>
          {/* biome-ignore lint/a11y/noStaticElementInteractions: drawer content panel, not a control — onClick closes the drawer when a real nav link/button inside is activated (event bubbles up), and onKeyDown provides the keyboard Escape-to-close. No semantic element models "panel that dismisses on inner activation". */}
          <div
            className="scrollbar-end-side-content flex h-full flex-col items-stretch p-4 pt-(--header-height,4rem)"
            onClick={closeDrawer}
            onKeyDown={(e) => e.key === "Escape" && closeDrawer()}
          >
            <div className="flex w-full flex-col gap-0">
              {startChild ? (
                <div
                  className="mb-4 w-full border-border border-b pb-4"
                  key="drawer-start"
                >
                  {startChild}
                </div>
              ) : null}
              {navChild
                ? React.cloneElement(navChild, {
                    key: "drawer-nav",
                    orientation: "vertical" as const,
                  })
                : null}
              {navChild && endChild ? (
                <hr className="my-4 w-full border-border border-t" />
              ) : null}
              {endChild
                ? React.cloneElement(endChild, {
                    key: "drawer-end",
                    orientation: "vertical" as const,
                  })
                : null}
            </div>
          </div>
        </HeaderNavContext.Provider>
      </nav>

      {/* Backdrop — clickable overlay that closes the drawer. Hidden from
          AT (the drawer itself owns Escape-to-close); no role/tabIndex
          needed since it never receives focus. */}
      <button
        type="button"
        className={cn(
          "fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] transition-opacity duration-200 lg:hidden",
          isDrawerOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
        aria-hidden
        tabIndex={-1}
        onClick={closeDrawer}
      />
    </>
  );
}

export { Header, HeaderEnd, HeaderInner, HeaderNav, HeaderStart };
