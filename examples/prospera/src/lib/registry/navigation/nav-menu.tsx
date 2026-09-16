import { LibraryIcon } from "@/components/registry/primitives/core/library-icon";
import {
  Image,
  type ImageSource,
} from "@/components/registry/primitives/editables/image";
import { Link } from "@/components/registry/primitives/editables/link";
import {
  getImageSrc,
  getLinkHref,
  isEmptySource,
} from "@/components/registry/primitives/editables/source-normalizers";
import { Text } from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import { type LinkedEntry, linkedFields } from "@/lib/registry/linked-items";
import type { SitecoreBoolInput } from "@/lib/registry/param-parsers";
import type { LinkField, TextField } from "@/lib/registry/sitecore";

/**
 * Shared field-driven navigation-menu pieces — the `nav-item@1` render
 * vocabulary used by every header-family chrome component (`main-nav`'s
 * Default/MegaPanel variants and the `header` shell's field-driven
 * TwoTier / CenteredLogo / TransparentOverlay variants).
 *
 * Lives in `lib/registry/<family>/` (the sanctioned cross-component
 * seam — see `lib/registry/heros-and-promos/`) because `components/`
 * must not import peer components: `header` and `main-nav` both render
 * the same nav-item contract, so the contract lives below both.
 *
 * Everything here is presentational and CSS-driven (hover/focus via
 * `group-*` classes — no client state), so it renders identically from
 * inline design fields with no placeholder composition: the flat shape
 * the orchestrator's chrome generator emits.
 */

/**
 * One entry inside a mega-menu group — mirrors `link-list-item@1`
 * (Title + Link). Arrives either as a raw linked item (`{id, fields}`)
 * or with its fields hoisted (inline design fields / flattened
 * treelist), so consumers go through {@link linkedFields}.
 */
export interface NavItemGroupLinkFields {
  id?: string;
  Title?: TextField;
  Link?: LinkField;
}

/**
 * One mega-menu column — mirrors `link-list-content@1` (optional
 * heading + optional image + link entries). Same dual raw/hoisted
 * arrival shape as {@link NavItemGroupLinkFields}.
 */
export interface NavItemGroupFields {
  id?: string;
  /** Optional column heading. */
  Title?: TextField;
  /**
   * Optional link for the group itself — makes the group heading
   * navigable where the consumer supports it (tree-navigation renders
   * a linked heading row). The desktop mega-menu columns and link-list
   * variants ignore it.
   */
  Link?: LinkField;
  /** Optional column image, rendered above the heading. */
  Image?: ImageSource;
  /** Link entries, in render order. */
  Items?: Array<LinkedEntry<NavItemGroupLinkFields>>;
}

export interface NavItemFields {
  /** Stable id used to scope the per-item panel placeholder name. */
  Id?: string;
  Title?: TextField;
  /** When present, item navigates. When absent (and HasPanel is on), item is panel-only. */
  Link?: LinkField;
  /**
   * Opt-in for a per-item mega-menu panel placeholder (`main-nav`'s
   * placeholder mode — see `NavItem` in `main-nav.tsx`). The shared
   * field-driven renderers here never read it; it's part of the
   * shared field shape so both modes share one content type.
   *
   * As a datasource field it arrives in the JSS checkbox wrapper
   * (`{ value: boolean }`) — `isEnabled` unwraps every accepted shape.
   */
  HasPanel?: SitecoreBoolInput;
  /**
   * Field-driven mega-menu columns (`link-list-content@1` refs) — the
   * flat-composable alternative to `HasPanel`. When any group carries
   * a heading, image, or link, the item renders a hover/focus panel
   * with one column per group — no placeholder composition required,
   * so generated partial designs can express mega-menus with inline
   * fields alone.
   */
  Groups?: Array<LinkedEntry<NavItemGroupFields>>;
  /** Optional promo card title shown beside the Groups columns. */
  PromoTitle?: TextField;
  /** Optional promo card supporting copy. */
  PromoText?: TextField;
  /** Optional promo card link (rendered as the card's CTA). */
  PromoLink?: LinkField;
  /** Optional promo card image (rendered above the promo title). */
  PromoImage?: ImageSource;
}

/** A group with hoisted fields and only renderable link entries. */
export interface ResolvedNavGroup {
  key: string;
  Title?: TextField;
  Image?: ImageSource;
  links: NavItemGroupLinkFields[];
}

export function hasLinkHref(link: LinkField | undefined): boolean {
  return Boolean(link?.value?.href);
}

/**
 * The extra envelope keys a layout-service Treelist entry can carry
 * when the referenced item is a PAGE rather than a virtual
 * `nav-item@1`: the SDK serializes linked items as
 * `{ id, name, displayName, url, fields }`, where `url` is either the
 * resolved path string or an `{ href/path/url }` object depending on
 * the transport (REST layout service vs Edge GraphQL projection).
 */
interface NavItemEntryEnvelope {
  id?: string;
  name?: string;
  displayName?: string;
  url?: string | { href?: string; path?: string; url?: string };
}

/** Resolve the href out of a linked entry's `url` envelope key. */
function entryUrlHref(url: NavItemEntryEnvelope["url"]): string | undefined {
  if (typeof url === "string") return url || undefined;
  if (url != null && typeof url === "object") {
    return url.href ?? url.path ?? url.url ?? undefined;
  }
  return undefined;
}

/**
 * Hoist a nav treelist (`nav-item@1` refs) down to renderable item
 * fields — accepts both the raw `{id, fields}` linked shape and the
 * hoisted/inline shape (see {@link linkedFields}).
 *
 * Also tolerates PAGE items selected in the Items treelist: when the
 * hoisted fields carry no `Link` href but the entry envelope carries a
 * resolvable `url`, a Link is synthesized from the page URL and the
 * label falls back Title → displayName → name. That makes "point a
 * nav item at a page" work without a virtual nav-item wrapper.
 */
export function resolveNavItems(
  items: Array<LinkedEntry<NavItemFields>> | NavItemFields[] | undefined,
): NavItemFields[] {
  return (items ?? [])
    .map((entry) => {
      // `linkedFields` constrains to `{id?}` (lower-case) which the
      // nav-item shape doesn't carry — widen for the call, the result
      // is still the hoisted NavItemFields either way.
      const hoisted = linkedFields(
        entry as LinkedEntry<NavItemFields & { id?: string }>,
      );
      if (hoisted == null) return undefined;
      if (hasLinkHref(hoisted.Link)) return hoisted;
      const envelope = entry as NavItemEntryEnvelope;
      const href = entryUrlHref(envelope?.url);
      if (!href) return hoisted;
      const titleText = hoisted.Title?.value;
      const label =
        titleText != null && titleText !== ""
          ? titleText
          : (envelope.displayName ?? envelope.name);
      return {
        ...hoisted,
        Title: label != null ? { value: label } : hoisted.Title,
        Link: { value: { href, ...(label != null ? { text: label } : {}) } },
      };
    })
    .filter((item): item is NavItemFields & { id?: string } => item != null);
}

/**
 * Hoist + filter an item's `Groups` down to the renderable ones: a
 * group earns a column when it has a heading, an image, or at least
 * one link entry with an href.
 */
export function resolveNavGroups(
  groups: NavItemFields["Groups"] | undefined,
): ResolvedNavGroup[] {
  const resolved: ResolvedNavGroup[] = [];
  for (const [index, entry] of (groups ?? []).entries()) {
    const group = linkedFields(entry);
    if (!group) continue;
    const links = (group.Items ?? [])
      .map((item) => linkedFields(item))
      .filter((item): item is NavItemGroupLinkFields =>
        hasLinkHref(item?.Link),
      );
    const hasHeading = group.Title != null && !isEmptySource(group.Title);
    const hasImage = group.Image != null && !isEmptySource(group.Image);
    if (!hasHeading && !hasImage && links.length === 0) continue;
    resolved.push({
      key: group.id ?? `group-${index}`,
      Title: hasHeading ? group.Title : undefined,
      Image: hasImage ? group.Image : undefined,
      links,
    });
  }
  return resolved;
}

/**
 * One drill-down section of a tree-navigation item panel: the group's
 * heading (optionally navigable via the group's own `Link`) plus its
 * leaf link rows. Unlike {@link ResolvedNavGroup} (the desktop
 * mega-menu column), the group's `Link` is preserved so touch UIs can
 * render the heading as a link row.
 */
export interface ResolvedNavTreeGroup {
  key: string;
  Title?: TextField;
  Link?: LinkField;
  links: NavItemGroupLinkFields[];
}

/**
 * One top-level node of the navigation tree: the hoisted nav-item
 * fields plus its renderable groups. A node with `groups.length > 0`
 * is a branch (drill-down target); otherwise it's a leaf whose `Link`
 * (if any) navigates directly.
 */
export interface ResolvedNavTreeItem {
  key: string;
  item: NavItemFields;
  groups: ResolvedNavTreeGroup[];
}

/**
 * Hoist + filter an item's `Groups` for tree/drill-down rendering: a
 * group earns a section when it has a heading, its own link, or at
 * least one link entry with an href. Group images are ignored — the
 * drawer rows are text-only.
 */
export function resolveNavTreeGroups(
  groups: NavItemFields["Groups"] | undefined,
): ResolvedNavTreeGroup[] {
  const resolved: ResolvedNavTreeGroup[] = [];
  for (const [index, entry] of (groups ?? []).entries()) {
    const group = linkedFields(entry);
    if (!group) continue;
    const links = (group.Items ?? [])
      .map((item) => linkedFields(item))
      .filter((item): item is NavItemGroupLinkFields =>
        hasLinkHref(item?.Link),
      );
    const hasHeading = group.Title != null && !isEmptySource(group.Title);
    const hasOwnLink = hasLinkHref(group.Link);
    if (!hasHeading && !hasOwnLink && links.length === 0) continue;
    resolved.push({
      key: group.id ?? `group-${index}`,
      Title: hasHeading ? group.Title : undefined,
      Link: hasOwnLink ? group.Link : undefined,
      links,
    });
  }
  return resolved;
}

/**
 * Resolve a nav treelist into drill-down tree nodes: every renderable
 * top-level item (same normalization as {@link resolveNavItems},
 * including page-item URL synthesis) with its groups resolved for
 * touch rendering. Branch nodes (groups) are KEPT — unlike the
 * desktop resolvers, which only surface groups inside hover panels.
 */
export function resolveNavTree(
  items: Array<LinkedEntry<NavItemFields>> | NavItemFields[] | undefined,
): ResolvedNavTreeItem[] {
  return resolveNavItems(items).map((item, index) => ({
    key: item.Id ?? `item-${index}`,
    item,
    groups: resolveNavTreeGroups(item.Groups),
  }));
}

/** Promo-card fields hoisted off a nav item; null when nothing renders. */
export interface ResolvedNavPromo {
  title?: TextField;
  text?: TextField;
  link?: LinkField;
  image?: ImageSource;
}

export function resolveNavPromo(item: NavItemFields): ResolvedNavPromo | null {
  const title =
    item.PromoTitle != null && !isEmptySource(item.PromoTitle)
      ? item.PromoTitle
      : undefined;
  const text =
    item.PromoText != null && !isEmptySource(item.PromoText)
      ? item.PromoText
      : undefined;
  // Leftover Promo* cells must not allocate the promo column
  // (`grid-cols-2` + `border-s`) — that rule is the divider through
  // "EXPLORE". Empty image fields arrive as `{ value: {} }`, which
  // `isEmptySource` used to treat as present; require a real src/href.
  const promoHref = getLinkHref(item.PromoLink, "");
  const link = promoHref ? item.PromoLink : undefined;
  const image = getImageSrc(item.PromoImage) ? item.PromoImage : undefined;
  if (!title && !text && !link && !image) return null;
  return { title, text, link, image };
}

/**
 * Text tone for nav triggers/links. `default` renders on the page
 * surface; `inverse` renders light-on-dark for transparent-overlay
 * headers (page-level `theme-white` token — legal anywhere as text,
 * see the color-roles contract). Panels always open on a solid
 * `bg-background` surface, so panel interiors ignore the tone.
 */
export type NavTone = "default" | "inverse";

/**
 * How a nav item's field-driven panel opens:
 *
 *   dropdown — an anchored panel under the item (auto width, capped),
 *              the classic desktop dropdown.
 *   mega     — a full-width panel spanning the whole nav strip
 *              (`absolute inset-x-0` against the nav's positioning
 *              context) — the fifa/emirates-class mega panel. The
 *              hosting nav must be `relative` and block-level.
 */
export type NavPanelMode = "dropdown" | "mega";

/**
 * Grid column classes adapted to the rendered column count (groups +
 * optional promo). 2-4 group panels widen with content instead of
 * wrapping into ragged rows.
 */
function panelGridClass(columnCount: number): string {
  if (columnCount <= 1) return "grid-cols-1";
  if (columnCount === 2) return "grid-cols-2";
  if (columnCount === 3) return "grid-cols-3";
  return "grid-cols-4";
}

/** One panel column: optional image, heading, link stack. */
function NavGroupColumn({
  group,
  shrink = true,
}: {
  group: ResolvedNavGroup;
  /**
   * Multi-column grids need `min-w-0` so `1fr` tracks can shrink.
   * A one-column dropdown must NOT shrink: the panel is absolutely
   * positioned against the trigger, and shrink-to-fit would clamp it
   * to the trigger width — labels then overflow the bordered box.
   */
  shrink?: boolean;
}) {
  return (
    <div className={shrink ? "min-w-0" : "w-max"}>
      {group.Image ? (
        <Image
          value={group.Image}
          className="mb-3 aspect-video w-full rounded-md object-cover"
        />
      ) : null}
      {group.Title ? (
        <Text
          tag="p"
          value={group.Title}
          className="mb-3 whitespace-nowrap font-semibold text-muted-foreground text-xs uppercase tracking-wide"
        />
      ) : null}
      <ul className="flex flex-col gap-2">
        {group.links.map((link, linkIndex) => (
          <li key={link.id ?? `link-${linkIndex}`}>
            <Link
              value={link.Link}
              className="whitespace-nowrap text-foreground text-sm hover:underline"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The promo card rendered after the group columns. */
function NavPromoCard({ promo }: { promo: ResolvedNavPromo }) {
  return (
    <div className="min-w-0 border-border border-s ps-8">
      {promo.image ? (
        <Image
          value={promo.image}
          className="mb-3 aspect-video w-full rounded-md object-cover"
        />
      ) : null}
      {promo.title ? (
        <Text
          tag="p"
          value={promo.title}
          className="mb-1 font-semibold text-foreground text-sm"
        />
      ) : null}
      {promo.text ? (
        <Text
          tag="p"
          value={promo.text}
          className="mb-2 text-muted-foreground text-sm"
        />
      ) : null}
      {promo.link ? (
        <Link
          value={promo.link}
          className="text-accent text-sm hover:underline"
        />
      ) : null}
    </div>
  );
}

/** Shared open-on-hover/focus visibility classes for both panel modes. */
/** `PANEL_REVEAL_CLASS` minus the hiding — same box, always shown. */
const PANEL_VISIBLE_CLASS = "absolute top-full z-50";

const PANEL_REVEAL_CLASS = cn(
  "invisible absolute top-full z-50 opacity-0",
  "transition-[opacity,visibility] duration-150",
  "group-focus-within/nav-item:visible group-focus-within/nav-item:opacity-100",
  "group-hover/nav-item:visible group-hover/nav-item:opacity-100",
);

/**
 * Field-driven panel: one column per resolved group plus an optional
 * promo card. Opens on hover and keyboard focus via the parent's
 * `group/nav-item` (CSS only — no client state), so it renders
 * correctly from inline design fields with no placeholder composition
 * and no Popover wiring. Column count adapts to the rendered columns
 * (2-4 groups + promo).
 */
export function NavItemGroupsPanel({
  groups,
  promo,
  mode = "dropdown",
  forceVisible = false,
}: {
  groups: ResolvedNavGroup[];
  promo: ResolvedNavPromo | null;
  mode?: NavPanelMode;
  /**
   * Render the panel already revealed. It is normally hidden with
   * `invisible opacity-0` and shown by `group-hover` / `group-focus-
   * within` — CSS only, no state — so its columns and images sit in the
   * DOM permanently but never laid out. The showcase preview could not
   * show the panel at all, and the paint sweep saw only the symptom:
   * two panel images measuring 0x0.
   */
  forceVisible?: boolean;
}) {
  const columnCount = groups.length + (promo ? 1 : 0);
  const isCompactDropdown = mode === "dropdown" && columnCount <= 1;
  const body = (
    <div
      className={cn(
        "grid gap-x-12 gap-y-8",
        panelGridClass(columnCount),
        mode === "dropdown" && "w-max max-w-[min(56rem,90vw)]",
      )}
    >
      {groups.map((group) => (
        <NavGroupColumn
          key={group.key}
          group={group}
          shrink={!isCompactDropdown}
        />
      ))}
      {promo ? <NavPromoCard promo={promo} /> : null}
    </div>
  );

  if (mode === "mega") {
    return (
      <div
        className={cn(
          forceVisible ? PANEL_VISIBLE_CLASS : PANEL_REVEAL_CLASS,
          "inset-x-0 pt-2",
        )}
        data-slot="nav-item-mega-panel"
      >
        <div className="border-border border-y bg-background text-foreground shadow-lg">
          <div className="container py-8">{body}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        forceVisible ? PANEL_VISIBLE_CLASS : PANEL_REVEAL_CLASS,
        // `w-max` beats shrink-to-fit against the trigger's width so
        // the panel grows to the longest label instead of clipping it.
        "start-0 w-max pt-2",
      )}
      data-slot="nav-item-groups-panel"
    >
      <div className="w-max min-w-48 rounded-md border border-border bg-background p-6 text-foreground shadow-lg">
        {body}
      </div>
    </div>
  );
}

const NAV_TRIGGER_TONE_CLASS: Record<NavTone, string> = {
  default: "text-foreground",
  inverse: "text-theme-white",
};

function navTriggerClass(tone: NavTone): string {
  return cn(
    "inline-flex items-center gap-1 px-3 py-2 text-sm hover:underline",
    NAV_TRIGGER_TONE_CLASS[tone],
  );
}

function NavGroupsChevron() {
  return (
    <LibraryIcon
      name="chevron-down"
      className="size-4 transition-transform group-hover/nav-item:rotate-180"
      aria-hidden="true"
    />
  );
}

/**
 * Field-driven mega-menu item: trigger (navigating link or plain
 * button) + the hover/focus panel. Placeholder mode (`HasPanel`)
 * never reaches here — `main-nav`'s NavItem routes those items to
 * its Popover path.
 *
 * In `mega` mode the panel is positioned against the nearest
 * `relative` ancestor (the nav strip), so the item wrapper drops its
 * own `relative`.
 */
export function NavItemWithGroups({
  item,
  groups,
  forceVisible = false,
  promo,
  mode = "dropdown",
  tone = "default",
}: {
  item: NavItemFields;
  groups: ResolvedNavGroup[];
  promo: ResolvedNavPromo | null;
  mode?: NavPanelMode;
  tone?: NavTone;
  /** Render the groups panel already revealed. */
  forceVisible?: boolean;
}) {
  const title = item.Title?.value;
  const hasLink = hasLinkHref(item.Link);
  const triggerClass = navTriggerClass(tone);
  return (
    <div
      className={cn(
        "group/nav-item inline-flex items-center overflow-visible",
        mode === "dropdown" && "relative",
      )}
    >
      {hasLink ? (
        <Link value={item.Link} className={triggerClass}>
          {title ? <span>{title}</span> : null}
          <NavGroupsChevron />
        </Link>
      ) : (
        <button
          type="button"
          className={triggerClass}
          aria-haspopup="menu"
          aria-label={title ? `Open ${title} menu` : "Open menu"}
        >
          {title ? <span>{title}</span> : null}
          <NavGroupsChevron />
        </button>
      )}
      <NavItemGroupsPanel
        groups={groups}
        promo={promo}
        mode={mode}
        forceVisible={forceVisible}
      />
    </div>
  );
}

/**
 * One field-driven nav item: a groups-panel item when it carries
 * renderable groups/promo, a plain link when it has an href, or a
 * plain (non-interactive) nav label when it has only a Title — the
 * toggle-only triggers the chrome extractor emits for client-rendered
 * dropdowns that aren't in the raw HTML (e.g. greeneking's 5 label
 * triggers). Rendering the label keeps the nav visually complete
 * instead of silently dropping those items. Only items with neither a
 * link, panel content, nor a title render nothing (defensive).
 *
 * This is the whole per-item render path for field-only consumers
 * (the header shell's field-driven variants and `main-nav`'s
 * MegaPanel). `main-nav`'s Default keeps its own NavItem wrapper on
 * top of this for the `HasPanel` placeholder mode.
 */
export function FieldNavItem({
  item,
  mode = "dropdown",
  tone = "default",
  forceVisible = false,
}: {
  item: NavItemFields;
  mode?: NavPanelMode;
  tone?: NavTone;
  /** Render this item's groups panel already revealed. */
  forceVisible?: boolean;
}) {
  const groups = resolveNavGroups(item.Groups);
  const promo = resolveNavPromo(item);
  const hasGroups = groups.length > 0 || promo !== null;
  const hasLink = hasLinkHref(item.Link);

  if (hasGroups) {
    return (
      <NavItemWithGroups
        item={item}
        forceVisible={forceVisible}
        groups={groups}
        promo={promo}
        mode={mode}
        tone={tone}
      />
    );
  }
  if (hasLink) {
    return (
      <Link
        value={item.Link}
        className={cn(
          "px-3 py-2 text-sm hover:underline",
          NAV_TRIGGER_TONE_CLASS[tone],
        )}
      />
    );
  }
  const title = item.Title?.value;
  if (title) {
    // Label-only item: a Title with no Link and no panel content. Render
    // it as a plain, non-interactive nav label matching the linked
    // items' typography/spacing (no `hover:underline` — there is nothing
    // to navigate to). Keeps toggle-only nav triggers visible.
    return (
      <span className={cn("px-3 py-2 text-sm", NAV_TRIGGER_TONE_CLASS[tone])}>
        {title}
      </span>
    );
  }
  return null;
}
