"use client";

import { EditPlaceholder } from "@/components/registry/primitives/core/edit-placeholder";
import { LibraryIcon } from "@/components/registry/primitives/core/library-icon";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/registry/primitives/core/popover";
import { Link } from "@/components/registry/primitives/editables/link";
import { cn } from "@/lib/registry/cn";
import { resolveEditingMode } from "@/lib/registry/editing-mode";
import type { LinkedEntry } from "@/lib/registry/linked-items";
import {
  FieldNavItem,
  hasLinkHref,
  type NavItemFields,
  type NavPanelMode,
  resolveNavGroups,
  resolveNavItems,
  resolveNavPromo,
} from "@/lib/registry/navigation/nav-menu";
import { isEnabled } from "@/lib/registry/param-parsers";
import { resolvePlaceholderChildren } from "@/lib/registry/placeholder-children";
import { type ComponentParams, Placeholder } from "@/lib/registry/sitecore";
import type { ComponentProps } from "@/lib/registry/sitecore-types";

/**
 * The shared field-driven nav-item vocabulary lives in
 * `lib/registry/navigation/nav-menu` (used by both this component and
 * the `header` shell's field-driven variants). Re-exported here so
 * registry consumers that installed `main-nav` keep their import path.
 */
export type {
  NavItemFields,
  NavItemGroupFields,
  NavItemGroupLinkFields,
} from "@/lib/registry/navigation/nav-menu";

export interface MainNavFields {
  Items?: Array<LinkedEntry<NavItemFields>> | NavItemFields[];
}

/**
 * **Public API.** Flat camelCase props matching the SDK component-map
 * default convention. The recipe's `Items` Treelist arrives as the
 * lowercased `items` prop here.
 *
 * The entries arrive in one of THREE shapes, all accepted:
 *
 *   1. hoisted fields (`{Title, Link, …}`) — this repo's generated
 *      component map runs `flattenLinkedItems` before the component;
 *   2. the raw layout-service envelope (`{id, fields: {Title, …}}`) —
 *      installed starters regenerate their map WITHOUT the sibling
 *      recipe the Treelist discovery needs, so nothing flattens;
 *   3. a page item (`{id, name, url, fields}`) — a page selected
 *      directly in the Items treelist; label/href derive from the
 *      page's Title/url.
 *
 * `resolveNavItems` normalizes all three (shape 2 was the
 * "main nav renders nothing on the tenant" bug — every field read
 * missed, every item hit the nothing-to-render guard).
 */
export interface MainNavVariantProps {
  id?: string;
  styles?: string;
  isEditing?: boolean;
  params?: ComponentParams;
  rendering?: ComponentProps["rendering"];
  fields?: MainNavFields;
  items?: Array<LinkedEntry<NavItemFields>> | NavItemFields[];
  /**
   * Index of the nav item whose panel renders already open. The mega
   * panel is an uncontrolled Radix popover, so its whole interior — the
   * link groups and their images — is absent from the page until a
   * pointer opens it. That made the panel invisible to the showcase
   * preview and to every automated check over it; the paint sweep only
   * noticed because the closed panel's two images measured 0x0.
   * Unset (the default) keeps every panel closed, as in production.
   */
  defaultOpenIndex?: number;
}

function NavItem({
  item,
  index,
  rendering,
  panelMode,
  defaultOpen = false,
  isEditing = false,
}: {
  item: NavItemFields;
  index: number;
  defaultOpen?: boolean;
  rendering: ComponentProps["rendering"] | undefined;
  panelMode: NavPanelMode;
  isEditing?: boolean;
}) {
  const hasPanelFlag = isEnabled(item.HasPanel);
  const panelChildren = resolvePlaceholderChildren(
    rendering,
    "nav-item-panel",
    String(index),
  ).children;
  // HasPanel with an empty placeholder is a leftover checkbox (live
  // Destinations still ships this way). Published: treat as a plain
  // field-driven link so empty popovers do not ship. Pages: keep the
  // drop zone when the author turned HasPanel on on purpose.
  const hasPanel =
    hasPanelFlag && (panelChildren.length > 0 || isEditing);
  const hasLink = hasLinkHref(item.Link);
  const title = item.Title?.value;
  const groups = resolveNavGroups(item.Groups);
  const promo = resolveNavPromo(item);
  const hasGroups = groups.length > 0 || promo !== null;

  // Defensive: skip items with nothing to render.
  if (!hasLink && !hasPanel && !hasGroups) return null;

  // Field-driven mega-menu: inline Groups / Promo* fields render as a
  // hover/focus panel — no placeholder composition required.
  // `HasPanel` (placeholder mode) wins when both are set.
  if (!hasPanel && (hasGroups || hasLink)) {
    // The field-driven panel is revealed by CSS (`group-hover` /
    // `group-focus-within`), not by the Popover below — so the open
    // request has to reach it as a class override, not as `defaultOpen`.
    return (
      <FieldNavItem item={item} mode={panelMode} forceVisible={defaultOpen} />
    );
  }

  // Trigger with panel. When a link is also present, the title is the link
  // (clicking it navigates) and only the chevron toggles the panel.
  // Placeholder key is per-item-index; the SDK regex requires a digit
  // segment after the prefix, so we use the array index (always digit)
  // rather than the item's Sitecore GUID. Two main-nav placements on
  // one page would collide — single-placement is the realistic case.
  const placeholderName = `nav-item-panel-${index}`;

  return (
    <Popover defaultOpen={defaultOpen}>
      <div className="inline-flex items-center">
        {hasLink ? (
          <Link
            value={item.Link}
            className="py-2 ps-3 text-foreground text-sm hover:underline"
          />
        ) : null}
        <PopoverTrigger
          className={cn(
            "inline-flex items-center gap-1 py-2 text-foreground text-sm hover:underline",
            hasLink ? "pe-3" : "px-3",
          )}
          // Radix sets `aria-expanded` + `aria-controls` automatically,
          // but doesn't infer `aria-haspopup` — the popover hosts a
          // sub-navigation menu, so the trigger needs to signal that
          // to AT users explicitly.
          aria-haspopup="menu"
          aria-label={
            hasLink && title
              ? `Open ${title} menu`
              : title
                ? title
                : "Open menu"
          }
        >
          {!hasLink && title ? <span>{title}</span> : null}
          <LibraryIcon
            name="chevron-down"
            className="size-4"
            aria-hidden="true"
          />
        </PopoverTrigger>
      </div>
      <PopoverContent
        align="start"
        sideOffset={8}
        className="z-50 w-screen max-w-4xl border-border bg-background p-6 shadow-lg"
      >
        {rendering ? (
          <Placeholder name={placeholderName} rendering={rendering} />
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

/**
 * `nav-max-items@1` — how many top-level links stay inline before the
 * remainder collapse into "More".
 *
 * `auto` / empty / unparseable → `undefined`, i.e. no cap and the exact
 * pre-existing render. A generated header that inlines every discovered
 * link is the `header-overflow` defect: the 2026-08-04 benchmark had uwa
 * cramming its whole sitemap into one horizontal row, with heart,
 * helsinkifestival and oneok doing the same, while the sources cap at
 * roughly five to seven and push the rest into a menu.
 */
function parseNavMaxItems(value: string | undefined): number | undefined {
  const parsed = Number.parseInt(value?.trim() ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

/**
 * Overflow menu for the items past the cap. Deliberately a Popover —
 * the same primitive the per-item dropdowns already use, so keyboard
 * and ARIA behaviour match the rest of the strip rather than
 * introducing a second interaction model in the same bar.
 */
function NavOverflow({ items }: { items: NavItemFields[] }) {
  return (
    <Popover>
      <PopoverTrigger
        aria-label={`More navigation (${items.length})`}
        className="main-nav-item inline-flex items-center gap-1 px-3 py-2 text-sm"
      >
        More
        <LibraryIcon aria-hidden name="chevron-down" className="size-4" />
      </PopoverTrigger>
      <PopoverContent className="flex min-w-48 flex-col gap-1 p-2">
        {items.map((item, index) =>
          // The Link primitive renders its own label from the field,
          // exactly as NavItem does. An item with no link href has
          // nothing to show here — its panel does not survive the move
          // into the menu — so it is skipped rather than rendered blank.
          hasLinkHref(item.Link) ? (
            <Link
              key={item.Id ?? `nav-overflow-${index}`}
              value={item.Link}
              className="rounded px-2 py-1.5 text-foreground text-sm hover:bg-muted"
            />
          ) : null,
        )}
      </PopoverContent>
    </Popover>
  );
}

/** Shared strip body for the Default / MegaPanel exports. */
function MainNavStrip({
  id,
  styles,
  items,
  fields,
  params,
  isEditing,
  rendering,
  panelMode,
  defaultOpenIndex,
}: MainNavVariantProps & { panelMode: NavPanelMode }) {
  // Normalize hoisted / raw-envelope / page-item entries. The flat
  // `items` prop wins (the SDK adapter's lowerFirst convention);
  // `fields.Items` covers starters that pass the classic JSS
  // `{fields}` prop shape instead.
  const allItems = resolveNavItems(items?.length ? items : fields?.Items);
  const editing = resolveEditingMode({ isEditing, params });
  // Cap the inline strip; anything past it goes to the "More" menu.
  // `undefined` (the `auto` default) keeps every item inline, so an
  // unset param renders byte-identically to before. Never collapse a
  // single trailing item — "More" wrapping one link is worse chrome
  // than the link itself.
  const maxItems = parseNavMaxItems(params?.MaxItems as string | undefined);
  const overflows = maxItems !== undefined && allItems.length > maxItems + 1;
  const resolvedItems = overflows ? allItems.slice(0, maxItems) : allItems;
  const overflowItems = overflows ? allItems.slice(maxItems) : [];
  return (
    <nav
      aria-label="Main"
      className={cn(
        "main-nav hidden items-center lg:flex",
        // Mega panels span the strip: the nav is the positioning
        // context their `absolute inset-x-0` resolves against.
        panelMode === "mega" && "relative",
        styles?.trimEnd(),
      )}
      id={id ?? undefined}
    >
      {resolvedItems.length === 0 && editing ? (
        // Editing-mode hint: an empty strip is invisible chrome, which
        // reads as "broken" in Pages. Show authors where to add items.
        <EditPlaceholder kind="Nav items" />
      ) : null}
      {resolvedItems.map((item, index) => (
        <NavItem
          key={item.Id ?? `nav-item-${index}`}
          item={item}
          index={index}
          rendering={rendering}
          panelMode={panelMode}
          defaultOpen={index === defaultOpenIndex}
          isEditing={editing}
        />
      ))}
      {overflowItems.length > 0 ? <NavOverflow items={overflowItems} /> : null}
    </nav>
  );
}

/**
 * Desktop main navigation strip. Renders an ordered list of top-level
 * items with two mega-menu modes per item:
 *
 *   - **Field-driven** (`Groups` + optional `Promo*` fields): a
 *     hover/focus dropdown renders one column per referenced Link
 *     List (optional per-group image, 2-4 column adaptive grid) plus
 *     an optional promo card — no placeholder composition required,
 *     so flat partial designs (including generated chrome) can
 *     express mega-menus with inline fields alone.
 *   - **Placeholder-driven** (`HasPanel`): the item exposes a dynamic
 *     `nav-item-panel-{index}` placeholder that authors fill with
 *     arbitrary renderings (RichText, LinkLists, MegaMenu, Buttons).
 *     Wins over `Groups` when both are set.
 *
 * Hidden below `lg` breakpoint (`hidden lg:flex`); the Header shell
 * surfaces a mobile-only slot for mobile-menu renderings instead.
 * Mobile-menu patterns are a separate rendering family — this
 * component intentionally does not collapse to a hamburger.
 */
export function Default(props: MainNavVariantProps) {
  return <MainNavStrip {...props} panelMode="dropdown" />;
}

export default Default;

/**
 * MegaPanel variant: same content shape as Default, but each item's
 * field-driven `Groups` panel opens as a FULL-WIDTH panel spanning
 * the whole nav strip (`absolute inset-x-0` against the strip) — the
 * fifa/emirates-class mega-menu — instead of an anchored dropdown.
 * Column count adapts to the rendered columns (2-4 groups + promo).
 *
 * Pick MegaPanel when dropdown content is deep (3+ columns per item,
 * group imagery, promo cards); pick Default for compact per-item
 * dropdowns. Placeholder-mode items (`HasPanel`) keep the same
 * Popover path in both variants. Hover/keyboard-focus reveal and all
 * ARIA affordances are identical to Default.
 *
 * Best placed as its own flat placement (the panel spans the strip's
 * width, which in a flat `headless-header` stack is the full row).
 */
export function MegaPanel(props: MainNavVariantProps) {
  return <MainNavStrip {...props} panelMode="mega" />;
}

export const componentType = "universal";
