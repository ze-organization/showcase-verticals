"use client";

import { usePathname } from "next/navigation";
import * as React from "react";
import { EditPlaceholder } from "@/components/registry/primitives/core/edit-placeholder";
import { LibraryIcon } from "@/components/registry/primitives/core/library-icon";
import { Link } from "@/components/registry/primitives/editables/link";
import { cn } from "@/lib/registry/cn";
import { colorSchemeTextClass } from "@/lib/registry/color-scheme-classes";
import { resolveEditingMode } from "@/lib/registry/editing-mode";
import type { LinkedEntry } from "@/lib/registry/linked-items";
import {
  hasLinkHref,
  type NavItemFields,
  type ResolvedNavTreeGroup,
  type ResolvedNavTreeItem,
  resolveNavTree,
} from "@/lib/registry/navigation/nav-menu";
import type {
  ComponentParams,
  LinkField,
  TextField,
} from "@/lib/registry/sitecore";
import type { ComponentProps } from "@/lib/registry/sitecore-types";

export interface TreeNavigationFields {
  /**
   * Label for the root level — the back row of a drill-down panel
   * reads "‹ {Title}". Defaults to "Main Menu".
   */
  Title?: TextField;
  Items?: Array<LinkedEntry<NavItemFields>> | NavItemFields[];
}

/**
 * **Public API.** Flat camelCase props matching the SDK component-map
 * default convention (the recipe's `Items` Treelist arrives as the
 * lowercased `items` prop), plus the classic JSS `{fields}` shape —
 * same dual acceptance as `main-nav`.
 */
export interface TreeNavigationVariantProps {
  id?: string;
  styles?: string;
  isEditing?: boolean;
  params?: ComponentParams;
  rendering?: ComponentProps["rendering"];
  fields?: TreeNavigationFields;
  title?: TextField;
  items?: Array<LinkedEntry<NavItemFields>> | NavItemFields[];
  /**
   * Open the drill-down panel (or accordion section) whose item Title
   * matches, on mount. Not a Sitecore param: the showcase preview uses
   * it so the sub-panel state is visible without a click.
   */
  defaultOpenTitle?: string;
}

/**
 * Default-ON param toggle: absent/empty reads as enabled; only an
 * explicit off value disables. (Sitecore checkboxes send "1"/"0", but
 * generated params may carry the word forms.)
 */
function paramEnabledDefaultOn(value: string | undefined): boolean {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) return true;
  return !["0", "false", "no", "off", "disabled"].includes(normalized);
}

/**
 * Whether a row's link points at the CURRENT page — powers the
 * active-row start bar. External URLs never match; internal hrefs
 * compare path-only (query/hash stripped, trailing slash ignored).
 */
function isActiveHref(
  pathname: string | null | undefined,
  link: LinkField | undefined,
): boolean {
  const href = link?.value?.href;
  if (!pathname || !href) return false;
  if (href.startsWith("http") || href.startsWith("//")) return false;
  const normalize = (path: string) => {
    const bare = path.split(/[?#]/, 1)[0] ?? path;
    const trimmed = bare.length > 1 ? bare.replace(/\/+$/, "") : bare;
    return trimmed.toLowerCase();
  };
  return normalize(href) === normalize(pathname);
}

interface TreeNavChrome {
  rootLabel: string;
  separators: boolean;
  showActiveMarker: boolean;
  toneClass: string;
  nodes: ResolvedNavTreeItem[];
  editing: boolean;
  pathname: string | null;
}

function useTreeNavChrome(props: TreeNavigationVariantProps): TreeNavChrome {
  const params = props.params ?? {};
  const rootLabel =
    (props.title?.value ?? props.fields?.Title?.value)?.trim() || "Main Menu";
  return {
    rootLabel,
    separators: paramEnabledDefaultOn(params.RowSeparators),
    showActiveMarker: paramEnabledDefaultOn(params.ShowActiveMarker),
    toneClass:
      colorSchemeTextClass(params.LinkColorScheme) || "text-foreground",
    nodes: resolveNavTree(
      props.items?.length ? props.items : props.fields?.Items,
    ),
    editing: resolveEditingMode({ isEditing: props.isEditing, params }),
    pathname: usePathname(),
  };
}

/** Shared row shell: full-width tap target with a trailing slot. */
function rowClass({
  separators,
  toneClass,
  active,
}: {
  separators: boolean;
  toneClass: string;
  active: boolean;
}): string {
  return cn(
    "flex w-full items-center justify-between gap-3 px-3 py-3 text-start font-medium text-sm",
    toneClass,
    separators ? "border-border border-b" : "rounded-md hover:bg-muted",
    separators && "hover:bg-muted/60",
    // Active row: colored start bar (Duke-style). The 4px border eats
    // into the inline padding so labels stay aligned with siblings.
    active && "border-s-4 border-s-accent bg-muted/40 ps-2",
  );
}

function RowChevron() {
  return (
    <LibraryIcon
      name="chevron-right"
      className="size-4 shrink-0 rtl:rotate-180"
      aria-hidden="true"
    />
  );
}

/** A navigating leaf row (editable Link keeps Pages inline editing). */
function LeafRow({
  link,
  label,
  chrome,
}: {
  link: LinkField;
  label?: string;
  chrome: TreeNavChrome;
}) {
  const active = chrome.showActiveMarker && isActiveHref(chrome.pathname, link);
  return (
    <Link
      value={link}
      aria-current={active ? "page" : undefined}
      className={rowClass({
        separators: chrome.separators,
        toneClass: chrome.toneClass,
        active,
      })}
    >
      {label ? <span>{label}</span> : null}
    </Link>
  );
}

/** One drill-down section: group heading (linked when the group has
 * its own Link) + leaf rows. */
function TreeGroupSection({
  group,
  chrome,
}: {
  group: ResolvedNavTreeGroup;
  chrome: TreeNavChrome;
}) {
  const headingText = group.Title?.value;
  return (
    <li>
      {group.Link && hasLinkHref(group.Link) ? (
        <LeafRow
          link={group.Link}
          label={headingText || undefined}
          chrome={chrome}
        />
      ) : headingText ? (
        <p className="px-3 pt-4 pb-1 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
          {headingText}
        </p>
      ) : null}
      {group.links.length > 0 ? (
        <ul className="flex flex-col">
          {group.links.map((link, index) =>
            link.Link ? (
              <li key={link.id ?? `leaf-${index}`}>
                <LeafRow
                  link={link.Link}
                  label={link.Title?.value || undefined}
                  chrome={chrome}
                />
              </li>
            ) : null,
          )}
        </ul>
      ) : null}
    </li>
  );
}

/** Root-panel row for one tree node: branch → drill button, leaf →
 * link row, label-only → plain label. */
function RootRow({
  node,
  chrome,
  onDrill,
}: {
  node: ResolvedNavTreeItem;
  chrome: TreeNavChrome;
  onDrill: (key: string) => void;
}) {
  const title = node.item.Title?.value;
  if (node.groups.length > 0) {
    return (
      <button
        type="button"
        onClick={() => onDrill(node.key)}
        aria-label={title ? `Open ${title} submenu` : "Open submenu"}
        className={rowClass({
          separators: chrome.separators,
          toneClass: chrome.toneClass,
          active: false,
        })}
      >
        {title ? <span>{title}</span> : null}
        <RowChevron />
      </button>
    );
  }
  if (hasLinkHref(node.item.Link)) {
    return (
      <LeafRow
        link={node.item.Link as LinkField}
        label={title || undefined}
        chrome={chrome}
      />
    );
  }
  if (title) {
    return (
      <span
        className={cn(
          "flex w-full items-center px-3 py-3 font-medium text-sm",
          chrome.toneClass,
          chrome.separators && "border-border border-b",
        )}
      >
        {title}
      </span>
    );
  }
  return null;
}

/** The drilled-in panel for one branch node: back row + the item's
 * own overview link + its groups as headed sections. */
function TreeItemPanel({
  node,
  chrome,
  onBack,
}: {
  node: ResolvedNavTreeItem;
  chrome: TreeNavChrome;
  onBack: () => void;
}) {
  const title = node.item.Title?.value;
  return (
    <div className="fade-in-0 slide-in-from-end-4 animate-in duration-200">
      <button
        type="button"
        onClick={onBack}
        className={cn(
          "flex w-full items-center gap-2 px-3 py-3 text-start font-semibold text-sm",
          chrome.toneClass,
          chrome.separators && "border-border border-b",
        )}
      >
        <LibraryIcon
          name="chevron-left"
          className="size-4 shrink-0 rtl:rotate-180"
          aria-hidden="true"
        />
        <span>{chrome.rootLabel}</span>
      </button>
      <ul className="flex flex-col">
        {hasLinkHref(node.item.Link) ? (
          <li>
            <LeafRow
              link={node.item.Link as LinkField}
              label={title || undefined}
              chrome={chrome}
            />
          </li>
        ) : null}
        {node.groups.map((group) => (
          <TreeGroupSection key={group.key} group={group} chrome={chrome} />
        ))}
      </ul>
    </div>
  );
}

/**
 * Editing-mode render: the whole tree expanded flat (root items each
 * followed by their group sections), so Pages authors can see and
 * select every level without driving client drill state.
 */
function ExpandedTree({ chrome }: { chrome: TreeNavChrome }) {
  return (
    <ul className="flex flex-col">
      {chrome.nodes.map((node) => (
        <li key={node.key}>
          <RootRow node={node} chrome={chrome} onDrill={() => {}} />
          {node.groups.length > 0 ? (
            <ul className="flex flex-col ps-4">
              {node.groups.map((group) => (
                <TreeGroupSection
                  key={group.key}
                  group={group}
                  chrome={chrome}
                />
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function initialOpenKey(
  nodes: ResolvedNavTreeItem[],
  defaultOpenTitle: string | undefined,
): string | null {
  if (!defaultOpenTitle) return null;
  const wanted = defaultOpenTitle.trim().toLowerCase();
  return (
    nodes.find(
      (node) =>
        node.groups.length > 0 &&
        node.item.Title?.value?.trim().toLowerCase() === wanted,
    )?.key ?? null
  );
}

/**
 * Drill-down tree navigation (the Duke-Energy mobile drawer pattern):
 * the root panel lists the top-level items; tapping a branch slides
 * to that item's panel — a "‹ Main Menu" back row, the item's own
 * overview link, then its groups as headed sections of link rows.
 * Touch-first: every level is reachable by tap, unlike the desktop
 * hover panels. Compose it inside `mobile-menu`'s placeholder — the
 * drawer/overlay owns the panel chrome (title, close X); this
 * component renders only the list content.
 */
export function Default(props: TreeNavigationVariantProps) {
  const chrome = useTreeNavChrome(props);
  const [openKey, setOpenKey] = React.useState<string | null>(() =>
    initialOpenKey(chrome.nodes, props.defaultOpenTitle),
  );
  const openNode =
    chrome.nodes.find(
      (node) => node.key === openKey && node.groups.length > 0,
    ) ?? null;

  return (
    <nav
      aria-label={chrome.rootLabel}
      className={cn("tree-navigation", props.styles?.trimEnd())}
      id={props.id ?? undefined}
    >
      {chrome.nodes.length === 0 && chrome.editing ? (
        <EditPlaceholder kind="Nav items" />
      ) : null}
      {chrome.editing ? (
        <ExpandedTree chrome={chrome} />
      ) : openNode ? (
        <TreeItemPanel
          node={openNode}
          chrome={chrome}
          onBack={() => setOpenKey(null)}
        />
      ) : (
        <ul
          key="root"
          className="fade-in-0 slide-in-from-start-4 flex animate-in flex-col duration-200"
        >
          {chrome.nodes.map((node) => (
            <li key={node.key}>
              <RootRow node={node} chrome={chrome} onDrill={setOpenKey} />
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}

export default Default;

/**
 * Accordion variant: branch items expand IN PLACE (chevron rotates,
 * group sections indent beneath the row) instead of sliding to a
 * sub-panel. Same content shape as Default. Pick when the menu is
 * shallow enough to scan expanded, or when the drawer is tall enough
 * that in-place expansion beats panel switching.
 */
export function Accordion(props: TreeNavigationVariantProps) {
  const chrome = useTreeNavChrome(props);
  const [openKeys, setOpenKeys] = React.useState<ReadonlySet<string>>(() => {
    const key = initialOpenKey(chrome.nodes, props.defaultOpenTitle);
    return key ? new Set([key]) : new Set();
  });

  const toggle = (key: string) =>
    setOpenKeys((previous) => {
      const next = new Set(previous);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });

  return (
    <nav
      aria-label={chrome.rootLabel}
      className={cn("tree-navigation", props.styles?.trimEnd())}
      id={props.id ?? undefined}
    >
      {chrome.nodes.length === 0 && chrome.editing ? (
        <EditPlaceholder kind="Nav items" />
      ) : null}
      {chrome.editing ? (
        <ExpandedTree chrome={chrome} />
      ) : (
        <ul className="flex flex-col">
          {chrome.nodes.map((node) => {
            const title = node.item.Title?.value;
            if (node.groups.length === 0) {
              return (
                <li key={node.key}>
                  <RootRow node={node} chrome={chrome} onDrill={() => {}} />
                </li>
              );
            }
            const open = openKeys.has(node.key);
            return (
              <li key={node.key}>
                <button
                  type="button"
                  onClick={() => toggle(node.key)}
                  aria-expanded={open}
                  className={rowClass({
                    separators: chrome.separators,
                    toneClass: chrome.toneClass,
                    active: false,
                  })}
                >
                  {title ? <span>{title}</span> : null}
                  <LibraryIcon
                    name="chevron-down"
                    className={cn(
                      "size-4 shrink-0 transition-transform",
                      open && "rotate-180",
                    )}
                    aria-hidden="true"
                  />
                </button>
                {open ? (
                  <ul className="fade-in-0 slide-in-from-top-2 flex animate-in flex-col ps-4 duration-200">
                    {hasLinkHref(node.item.Link) ? (
                      <li>
                        <LeafRow
                          link={node.item.Link as LinkField}
                          label={title || undefined}
                          chrome={chrome}
                        />
                      </li>
                    ) : null}
                    {node.groups.map((group) => (
                      <TreeGroupSection
                        key={group.key}
                        group={group}
                        chrome={chrome}
                      />
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </nav>
  );
}

export const componentType = "universal";
