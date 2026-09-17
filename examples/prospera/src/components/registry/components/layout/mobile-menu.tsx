"use client";

import { registerCdpRecipe } from "@/lib/registry/analytics/cdp-events";
import mobileMenuRecipe from "@/recipes/mobile-menu.recipe";

registerCdpRecipe(mobileMenuRecipe);

import * as React from "react";
import { useCallback } from "react";
import { iconByName } from "@/components/registry/graphics/icons/named-icon/icon-vocabulary";
import { NamedIcon } from "@/components/registry/graphics/icons/named-icon/named-icon";
import { Button } from "@/components/registry/primitives/core/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/registry/primitives/core/dialog";
import {
  Drawer as DrawerPrimitive,
  DrawerContent as DrawerPrimitiveContent,
  DrawerTitle as DrawerPrimitiveTitle,
  DrawerTrigger as DrawerPrimitiveTrigger,
} from "@/components/registry/primitives/core/drawer";
import { LibraryIcon } from "@/components/registry/primitives/core/library-icon";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/registry/primitives/core/sheet";
import { VisuallyHidden } from "@/components/registry/primitives/core/visually-hidden";
import { useComponentAnalytics } from "@/lib/registry/analytics/use-component-analytics";
import { cn } from "@/lib/registry/cn";
import {
  parseSectionBackgroundIntensity,
  parseSectionColorScheme,
  resolveSectionSurfaceClass,
} from "@/lib/registry/section-surface";
import { Placeholder, type TextField } from "@/lib/registry/sitecore";
import type { ComponentProps } from "@/lib/registry/sitecore-types";

export interface MobileMenuFields {
  /**
   * Optional visible heading at the top of the menu panel. When set it
   * also names the nav region; when unset NO visible heading renders
   * (the panel is unlabeled on screen) and a generic screen-reader-only
   * name is used instead — most placements put the logo in the mobile
   * header and want no drawer title.
   */
  Title?: TextField;
  /**
   * Label for the hamburger trigger button. SR-only by default
   * (icon-only trigger); the `ShowTriggerLabel` param renders it
   * visibly beside the icon. Defaults to "Open menu".
   */
  TriggerLabel?: TextField;
}

export interface MobileMenuAnalyticsMeta {
  id?: string;
  instanceKey?: string;
  instanceScope?: "site" | "page";
  variant?: "Drawer" | "Overlay" | "BottomSheet";
}

export type MobileMenuProps = ComponentProps & {
  fields?: MobileMenuFields;
  params?: { [key: string]: string };
  /**
   * Render the panel open on mount (uncontrolled — the user can still
   * close it). Not a Sitecore param: the showcase preview uses it so
   * the drawer / overlay / bottom-sheet chrome is visible without a
   * click.
   */
  defaultOpen?: boolean;
};

function isEnabled(value: string | boolean | undefined): boolean {
  if (typeof value === "boolean") return value;
  if (!value) return false;
  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
}

/**
 * `panel-padding@1` → all-sides `p-*` inset on the panel surface.
 * `md` (= the former hard-coded `p-6`) is the recipe default;
 * unknown values fall back to it.
 */
export type MobileMenuPanelPadding = "none" | "sm" | "md" | "lg" | "xl";

const PANEL_PADDING_CLASSES: Record<MobileMenuPanelPadding, string> = {
  none: "p-0",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
  xl: "p-12",
};

function parsePanelPadding(value: string | undefined): MobileMenuPanelPadding {
  const normalized = value?.trim().toLowerCase();
  return normalized && normalized in PANEL_PADDING_CLASSES
    ? (normalized as MobileMenuPanelPadding)
    : "md";
}

/**
 * `drawer-side@1` → which edge the Drawer panel enters from. Logical
 * values map onto the Sheet primitive's own logical `side` axis, so RTL
 * flips come for free. Unknown / empty aliases to `inline-start`, the
 * edge the variant used to hardcode — so a placement that never set the
 * param renders exactly as before.
 */
export type MobileMenuDrawerSide = "inline-start" | "inline-end";

function parseDrawerSide(value: string | undefined): "start" | "end" {
  return value?.trim().toLowerCase() === "inline-end" ? "end" : "start";
}

/**
 * `breakpoint-visibility@1` → viewport gate on the whole rendering.
 * `all` (default) keeps it visible at every breakpoint; `mobile-only`
 * hides it at `lg`+ (`lg:hidden`) so a hamburger placement can sit
 * beside a desktop nav strip that appears at `lg`. Unknown/empty values
 * alias to `all`, so a placement that never set the param renders
 * byte-identically to before.
 */
export type MobileMenuVisibleAt = "all" | "mobile-only";

function parseVisibleAt(value: string | undefined): MobileMenuVisibleAt {
  return value?.trim().toLowerCase() === "mobile-only" ? "mobile-only" : "all";
}

/**
 * Generic, hidden accessible name used for the panel dialog title and
 * the nav region when no `Title` field is authored. Most placements put
 * the logo in the mobile header and want no visible drawer heading, so
 * the visible title is suppressed entirely in that case — but Radix
 * still requires an accessible dialog title, and the nav still needs a
 * region name. Authors localize the visible heading via the `Title`
 * field; this is only the fallback for the SR-only name.
 */
const MENU_A11Y_FALLBACK = "Menu";

function useMobileMenuChrome(
  props: MobileMenuProps,
  variant: MobileMenuAnalyticsMeta["variant"],
) {
  const params = props.params ?? {};
  const ph = params.DynamicPlaceholderId ?? "1";
  const id = params.RenderingIdentifier;
  const styles = params.styles;
  // The VISIBLE heading — only when a Title is authored. Unset (the
  // common case: logo lives in the mobile header) renders NO visible
  // heading, so there is never an untranslated hardcoded "Navigation"
  // on screen. `accessibleTitle` still names the dialog + nav region
  // for screen readers, falling back to a generic localizable label.
  const titleText = props.fields?.Title?.value?.trim() || undefined;
  const accessibleTitle = titleText ?? MENU_A11Y_FALLBACK;
  const triggerLabel = props.fields?.TriggerLabel?.value ?? "Open menu";
  // `VisibleAt` (breakpoint-visibility@1) gates the whole rendering by
  // viewport width — `mobile-only` hides it at `lg`+. Default `all`
  // emits no class, keeping existing placements byte-identical.
  const visibleAt = parseVisibleAt(params.VisibleAt);
  const rootClassName = cn(
    "mobile-menu",
    visibleAt === "mobile-only" && "lg:hidden",
    styles,
  );
  const triggerIcon = params.IconName;
  // ShowTriggerLabel renders the TriggerLabel VISIBLY beside the icon
  // (default off keeps the classic icon-only hamburger with the label
  // SR-only) — the labeled "Menu" trigger service/utility mastheads
  // keep on desktop.
  const showTriggerLabel = isEnabled(params.ShowTriggerLabel);
  // Panel chrome: all-sides inset (`panel-padding@1`) + the shared
  // section-surface vocabulary for the fill. `none` scheme emits no
  // class, so the primitive's own `bg-background` shows through; bold
  // fills re-tone interior text via `surface-invert`.
  const panelClassName = cn(
    PANEL_PADDING_CLASSES[parsePanelPadding(params.Padding)],
    resolveSectionSurfaceClass(
      parseSectionColorScheme(params.ColorScheme, "none"),
      parseSectionBackgroundIntensity(params.BackgroundIntensity, "subtle"),
    ),
  );
  const placeholderName = `mobile-menu-${ph}`;
  // Composed nav renderings ship desktop-first responsive classes —
  // main-nav's strip is `hidden lg:flex`, which inside THIS panel (a
  // mobile drawer/overlay/sheet) left the menu completely EMPTY below
  // the `lg` breakpoint. The panel is its own viewport-independent
  // context, so force nested nav strips visible and stack them
  // vertically. Two-class arbitrary variants outweigh the strip's
  // single-class `hidden`, no `!important` needed.
  const panelNavClassName = cn(
    "[&_.main-nav]:flex [&_.main-nav]:flex-col [&_.main-nav]:items-stretch [&_.main-nav]:gap-1",
  );
  const instanceKey = params.InstanceKey || id;
  const instanceScope =
    (params.InstanceScope as "site" | "page" | undefined) ?? "site";
  const trackEvents = isEnabled(params.TrackEvents);
  const analytics =
    useComponentAnalytics<MobileMenuAnalyticsMeta>("mobile-menu");

  // `closed` event dropped during the taxonomy migration — fires
  // only on the opened transition now.
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!trackEvents || !open) return;
      analytics.fire("opened", {
        id,
        instanceKey,
        instanceScope,
        variant,
      });
    },
    [analytics, trackEvents, id, instanceKey, instanceScope, variant],
  );

  return {
    ph,
    id,
    rootClassName,
    titleText,
    accessibleTitle,
    triggerLabel,
    triggerIcon,
    showTriggerLabel,
    panelClassName,
    panelNavClassName,
    placeholderName,
    handleOpenChange,
  };
}

/**
 * Resolve the trigger glyph for an `IconName` pick (`icon-name@1`).
 * The default hamburger stays on `LibraryIcon` so it keeps swapping
 * with the theme's icon set — `menu`, the `none` clearing sentinel,
 * empty, and unknown names all land there. Any other known vocabulary
 * name renders the lucide `NamedIcon` glyph.
 */
function triggerIconNode(iconName: string | undefined) {
  const name = iconName?.trim().toLowerCase();
  if (name && name !== "none" && name !== "menu" && iconByName(name)) {
    return <NamedIcon name={name} className="size-5" />;
  }
  return <LibraryIcon name="menu" className="size-5" aria-hidden="true" />;
}

// `asChild` on the Radix Trigger clones this element and merges its
// own props (`onClick`, `aria-expanded`, `data-state`, `ref`, …) onto
// it. Forward the remaining props + ref to the inner Button so the
// merged handlers actually reach the underlying <button>. Without this
// forward the click never fires the trigger's open-state toggle, which
// reads as "the hamburger does nothing."
//
// `showLabel` (the `ShowTriggerLabel` param) renders the trigger label
// VISIBLY beside the icon instead of SR-only — the labeled "Menu"
// trigger utility/service mastheads keep on desktop. The visible text
// IS the accessible name then, so no aria-label duplicate.
const HamburgerButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button> & {
    triggerLabel: string;
    triggerIcon?: string;
    showLabel?: boolean;
  }
>(function HamburgerButton(
  { triggerLabel, triggerIcon, showLabel, className, ...rest },
  ref,
) {
  if (showLabel) {
    return (
      <Button
        ref={ref}
        variant="ghost"
        size="sm"
        className={cn("gap-2", className)}
        data-slot="mobile-menu-labeled-trigger"
        {...rest}
      >
        {triggerIconNode(triggerIcon)}
        <span>{triggerLabel}</span>
      </Button>
    );
  }
  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      aria-label={triggerLabel}
      className={className}
      {...rest}
    >
      {triggerIconNode(triggerIcon)}
    </Button>
  );
});

/**
 * Side-drawer mobile menu. Best for sites with deep nav hierarchies
 * that need vertical scroll room.
 *
 * WHICH edge it enters from is the `DrawerSide` rendering param
 * (`drawer-side@1`), not a property of this variant — authors flip it
 * per placement across different page designs. Defaults to
 * `inline-start`, the edge this variant used to hardcode. Values are
 * logical and pass straight through to the radix Sheet primitive's own
 * logical `side` axis, so the drawer flips correctly under RTL.
 *
 * Authors compose nav content into the `mobile-menu-{ph}` placeholder
 * — typically a vertical stack of `link-list@1` renderings or a
 * dedicated mobile-nav rendering.
 */
export function Drawer(props: MobileMenuProps) {
  const {
    id,
    rootClassName,
    titleText,
    accessibleTitle,
    triggerLabel,
    triggerIcon,
    showTriggerLabel,
    panelClassName,
    panelNavClassName,
    placeholderName,
    handleOpenChange,
  } = useMobileMenuChrome(props, "Drawer");

  return (
    <div className={rootClassName} id={id ?? undefined}>
      <Sheet defaultOpen={props.defaultOpen} onOpenChange={handleOpenChange}>
        <SheetTrigger asChild>
          <HamburgerButton
            triggerLabel={triggerLabel}
            triggerIcon={triggerIcon}
            showLabel={showTriggerLabel}
          />
        </SheetTrigger>
        <SheetContent
          side={parseDrawerSide(props.params?.DrawerSide)}
          className={cn("w-80 max-w-[85vw]", panelClassName)}
        >
          {titleText ? (
            <SheetTitle className="mb-4 text-lg">{titleText}</SheetTitle>
          ) : (
            <VisuallyHidden>
              <SheetTitle>{accessibleTitle}</SheetTitle>
            </VisuallyHidden>
          )}
          <nav aria-label={accessibleTitle} className={panelNavClassName}>
            <Placeholder name={placeholderName} rendering={props.rendering} />
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}

/**
 * Full-screen overlay mobile menu — opens a centered modal that fills
 * the viewport. Best for sites that want the menu to feel like a
 * dedicated route (covers all background chrome). Wraps radix Dialog.
 *
 * Authors compose nav content into the `mobile-menu-{ph}` placeholder.
 */
export function Overlay(props: MobileMenuProps) {
  const {
    id,
    rootClassName,
    titleText,
    accessibleTitle,
    triggerLabel,
    triggerIcon,
    showTriggerLabel,
    panelClassName,
    panelNavClassName,
    placeholderName,
    handleOpenChange,
  } = useMobileMenuChrome(props, "Overlay");

  return (
    <div className={rootClassName} id={id ?? undefined}>
      <Dialog defaultOpen={props.defaultOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <HamburgerButton
            triggerLabel={triggerLabel}
            triggerIcon={triggerIcon}
            showLabel={showTriggerLabel}
          />
        </DialogTrigger>
        <DialogContent
          className={cn(
            "h-screen w-screen max-w-none rounded-none sm:max-w-none",
            panelClassName,
          )}
        >
          {titleText ? (
            <DialogTitle>{titleText}</DialogTitle>
          ) : (
            <VisuallyHidden>
              <DialogTitle>{accessibleTitle}</DialogTitle>
            </VisuallyHidden>
          )}
          <nav aria-label={accessibleTitle} className={panelNavClassName}>
            <Placeholder name={placeholderName} rendering={props.rendering} />
          </nav>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * Bottom-sheet mobile menu — slides up from the bottom with a drag
 * affordance. Best for sites that want thumb-reachable nav on
 * mobile, or that already use bottom-sheet patterns elsewhere
 * (e.g. e-commerce filter sheets). Wraps the Vaul-backed Drawer
 * primitive.
 *
 * Authors compose nav content into the `mobile-menu-{ph}` placeholder.
 */
export function Sheet_(props: MobileMenuProps) {
  const {
    id,
    rootClassName,
    titleText,
    accessibleTitle,
    triggerLabel,
    triggerIcon,
    showTriggerLabel,
    panelClassName,
    panelNavClassName,
    placeholderName,
    handleOpenChange,
  } = useMobileMenuChrome(props, "BottomSheet");

  return (
    <div className={rootClassName} id={id ?? undefined}>
      <DrawerPrimitive
        defaultOpen={props.defaultOpen}
        onOpenChange={handleOpenChange}
      >
        <DrawerPrimitiveTrigger asChild>
          <HamburgerButton
            triggerLabel={triggerLabel}
            triggerIcon={triggerIcon}
            showLabel={showTriggerLabel}
          />
        </DrawerPrimitiveTrigger>
        <DrawerPrimitiveContent className={cn("max-h-[85vh]", panelClassName)}>
          {titleText ? (
            <DrawerPrimitiveTitle className="mb-4 text-lg">
              {titleText}
            </DrawerPrimitiveTitle>
          ) : (
            <VisuallyHidden>
              <DrawerPrimitiveTitle>{accessibleTitle}</DrawerPrimitiveTitle>
            </VisuallyHidden>
          )}
          <nav aria-label={accessibleTitle} className={panelNavClassName}>
            <Placeholder name={placeholderName} rendering={props.rendering} />
          </nav>
        </DrawerPrimitiveContent>
      </DrawerPrimitive>
    </div>
  );
}

// Re-export with a Sitecore-friendly name. The variant is named
// `BottomSheet` on the Sitecore side because `Sheet` would collide
// with the React identifier exported from the primitive.
export { Sheet_ as BottomSheet };

export default Drawer;

export const componentType = "universal";
