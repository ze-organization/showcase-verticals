import { Fragment, type ReactNode } from "react";
import {
  AppBadgeShape,
  getAppBadgeKind,
} from "@/components/registry/graphics/badges/app-store-badge";
import { NamedIcon } from "@/components/registry/graphics/icons/named-icon/named-icon";
import { resolveSocialIcon } from "@/components/registry/graphics/icons/social/resolve";
import { Card, CardHeader } from "@/components/registry/primitives/core/card";
import { LibraryIcon } from "@/components/registry/primitives/core/library-icon";
import {
  TypographyH2,
  TypographyH4,
} from "@/components/registry/primitives/core/typography";
import { ArrowLink } from "@/components/registry/primitives/editables/arrow-link";
import {
  Image,
  type ImageSource,
} from "@/components/registry/primitives/editables/image";
import {
  Link,
  type LinkSource,
} from "@/components/registry/primitives/editables/link";
import {
  getLinkText,
  getNonEmptySource,
  getSourceText,
  isEmptySource,
} from "@/components/registry/primitives/editables/source-normalizers";
import {
  Text,
  type TextSource,
} from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import {
  colorSchemeAnchorTextClass,
  colorSchemeTextClass,
} from "@/lib/registry/color-scheme-classes";
import { resolveEditingMode } from "@/lib/registry/editing-mode";
import {
  type EnumFieldSource,
  enumFieldValue,
} from "@/lib/registry/enum-field";
import {
  CHILDREN_QUERY,
  type IGQLItem,
} from "@/lib/registry/integrated-graphql/queries";
import { fetchSitecoreEdge } from "@/lib/registry/integrated-graphql/sitecore-edge-client";
import {
  getLinkedItemUrl,
  type LinkedEntry,
  type LinkedItemUrl,
  linkedFields,
} from "@/lib/registry/linked-items";
import {
  headingColorClass,
  parseHeadingColor,
} from "@/lib/registry/param-parsers";
import { hoistLinkedItemFields } from "@/lib/registry/placeholder-children";
import type {
  ComponentRendering,
  LayoutServiceData,
} from "@/lib/registry/sitecore";
import type { ComponentProps } from "@/lib/registry/sitecore-types";

/** Single link/topic item (normalized). Link only = link list; Title + optional Link = topic. */
export interface LinkListItemFields {
  id?: string;
  /** Optional label/title (topic listing style); when set with Link, link wraps this. */
  Title?: TextSource;
  Link?: LinkSource;
  /**
   * Named vector icon from the curated `icon-name@1` vocabulary
   * (e.g. "bill", "globe", "sign-in"). Rendered by the `IconLed`
   * variant as the row's leading icon; other variants ignore it.
   * Enum-shaped field — arrives as a plain string (inline design
   * fields), `{ value }`, or the Droplink enumeration-value ITEM
   * envelope real tenants deliver (see `enumFieldValue`).
   */
  IconName?: EnumFieldSource;
  /**
   * Optional one-line supporting description. Rendered by the
   * `IconLed` variant under the row label; other variants ignore it.
   */
  Description?: TextSource;
}

/**
 * One nested column group for the `MultiColumn` variant — a
 * `link-list-content@1` entry referenced from another link list's
 * `Items` Treelist (optional heading + its own link entries). This is
 * how footer-style column groups are expressed outside the footer.
 */
export interface LinkListGroupFields {
  id?: string;
  Title?: TextSource;
  Image?: ImageSource;
  Items?: Array<LinkedEntry<LinkListItemFields>>;
}

/**
 * One pre-walked item from the ParentRef tree-reference mode. Each
 * entry stands in for a child page of the referenced parent — the
 * SitecoreAI IGQL resolver that owns the walk produces this shape
 * (label = page title, href = page URL). The walk itself lives
 * outside this component; React just renders what arrives.
 *
 * `LinkListItemFields` covers the curated authoring case (the
 * Treelist of link-list-item@1 entries); this covers the
 * tree-reference case (an SDK-resolved child list).
 */
export interface LinkListResolvedChild {
  id?: string;
  label: string;
  href?: string;
}

/**
 * Droplink reference to a parent item — the runtime walker hook
 * (useChildren) fetches that parent's child pages via IGQL and
 * surfaces them via {@link LinkListFields.ParentChildren}. Layout
 * Service serializes a droplink as `{ id }` (or a string GUID); the
 * walker hook accepts either.
 */
export interface LinkListParentRef {
  id?: string;
  value?: string;
}

/** Normalized link list fields. */
export interface LinkListFields {
  Title?: TextSource;
  /**
   * Optional group image. Rendered by the `IconLed` variant as the
   * panel image above the heading (same treatment as a nav mega-menu
   * column); the other variants ignore it.
   */
  Image?: ImageSource;
  /** Normalized list of link items (curated mode — wins over ParentRef). */
  Items?: LinkListItemFields[];
  /**
   * Tree-reference authoring mode — droplink to a parent item. When
   * set, the IGQL walker hook (useChildren) fetches the parent's
   * direct children at render time and exposes them via
   * `ParentChildren`. Curated `Items` wins when both are set.
   */
  ParentRef?: LinkListParentRef | string;
  /**
   * Pre-walked children of `ParentRef` — populated by the runtime
   * `useChildren` hook once the IGQL fetch resolves, or by a Phase
   * 2 SDK data resolver that walks server-side. When the IGQL
   * pipeline isn't configured (no Edge contextId env var) this
   * stays undefined and the component falls through to curated
   * Items.
   */
  ParentChildren?: LinkListResolvedChild[];
}

export interface LinkListBlockProps extends ComponentProps {
  fields: LinkListFields;
  /**
   * Programmatic link items for server-safe rendering.
   * If an item has no href, it renders as static text.
   *
   * NOTE: through the SDK component map's default adapter, the
   * datasource's `Items` FIELD also arrives on this prop (lowerFirst
   * convention) carrying flattened linked items instead of
   * `{label, href}` — `normalizeLinkListInput` routes that shape back
   * to the fields path.
   */
  items?: Array<{
    label: string;
    href?: string;
    /** `icon-name@1` vocabulary name — leading icon in the `IconLed` variant. */
    iconName?: string;
    /** One-line supporting copy — rendered by the `IconLed` variant. */
    description?: string;
  }>;
  /**
   * Title when using programmatic items (overrides fields title).
   * Via the SDK default adapter this may arrive as the `Title` FIELD's
   * `TextSource` — normalized back to `fields.Title`.
   */
  title?: string | TextSource;
  displayOptions?: LinkListDisplayOptions;
  behaviorOptions?: LinkListBehaviorOptions;
  styleOptions?: LinkListStyleOptions;
}

export interface LinkListDisplayOptions {
  orientation?: "vertical" | "horizontal";
  showTitle?: boolean;
  title?: string;
  /**
   * Where the title sits relative to the link row. `"above"` (default)
   * stacks the title on its own line; `"inline-start"` lays it out
   * inline with the links — the "label + nav strip" pattern (e.g.
   * northwind.com's Quick Access bar).
   *
   * Only honored by the `Horizontal` variant; `Default`/`Cards`/`Compact`
   * always stack the title above.
   */
  titleLayout?: "above" | "inline-start";
  /**
   * Visual treatment for individual links.
   *
   *   default                  — plain underline-on-hover link
   *   arrow-button             — `ArrowLink` editorial CTA chrome
   *                              (accent arrow + bottom border, e.g.
   *                              northwind.com's Quick Access entries)
   *   social-icon              — icon-only link (icon resolved from the
   *                              link's URL host via the social-icon
   *                              registry). The link text becomes an
   *                              `aria-label` so screen readers still
   *                              announce the platform name.
   *   social-icon-with-label   — icon + visible label side-by-side; same
   *                              icon-resolution rules as `social-icon`.
   *   app-badge                — App Store / Google Play download badge,
   *                              resolved from the link's URL host via
   *                              `getAppBadgeKind`. Links whose host is
   *                              not a known store keep the plain text
   *                              link, same degrade policy as
   *                              `social-icon`.
   *
   * The two `social-icon*` styles are how Social Follow is composed —
   * use them on any `LinkList` whose items point at social URLs.
   * `app-badge` is the equivalent for an app-download row.
   */
  itemStyle?:
    | "default"
    | "arrow-button"
    | "social-icon"
    | "social-icon-with-label"
    | "app-badge";
  /**
   * Column count for the three variants that lay entries out in tracks
   * (or the `Columns` rendering param, whose `auto` value means "leave
   * the variant's own layout alone"):
   *
   *   `Horizontal`   a fixed-column grid instead of the flex-wrap row —
   *                  dense link panels (e.g. northwind.com's 25-item
   *                  products & services explorer). Resolved to a
   *                  responsive grid: 1 col on mobile, 2 at sm,
   *                  `columns` at md+.
   *   `MultiColumn`  how flat items distribute; defaults to 3.
   *   `Cards`        the card grid; defaults to 2-up/3-up.
   *
   * The single-column row stacks and single-line strips have no tracks
   * to count and ignore it.
   */
  columns?: 2 | 3 | 4;
  /**
   * Separator glyph between entries on the four variants that flow them
   * along one line — `InlineSeparated`, `Horizontal`, `UtilityBar` and
   * `Pills` (or the `SeparatorGlyph` rendering param): `none` (nothing
   * between entries), `dot` (·), `pipe` (|), `slash` (/).
   *
   * Unset means different things per variant, deliberately:
   * `InlineSeparated` is built around the glyph and falls back to
   * `dot`; the other three have never drawn one and fall back to
   * `none`. The vertical stacks ignore it entirely — a rule between
   * stacked rows is `RowSeparators`' job.
   */
  separatorGlyph?: "none" | "dot" | "pipe" | "slash";
  /**
   * Item marker for the vertical link variants (or the `ListMarker`
   * rendering param). `none` (default) keeps the markerless stack;
   * `bulleted` renders real `list-disc` markers whose color follows
   * the row's text token. Honored by the plain-text vertical layouts —
   * `Default` (vertical orientation), `Compact`, and each `MultiColumn`
   * column. Horizontal/inline/pill/icon-led/chevron layouts ignore it
   * (a disc is meaningless on a row or beside a leading icon/glyph).
   */
  listMarker?: "none" | "bulleted";
}

export interface LinkListBehaviorOptions {
  hideWhenEmpty?: boolean;
}

export interface LinkListStyleOptions {
  className?: string;
  /**
   * Wraps the `Horizontal` variant in a "nav strip" surface — top + bottom
   * borders, muted background, vertical padding, container constraints —
   * suitable for utility nav bars (e.g. northwind.com's Quick Access bar).
   * `"default"` renders the bare list with no surrounding chrome.
   */
  surface?: "default" | "bordered";
}

function isEmptyLink(value: LinkSource | undefined): boolean {
  if (value == null) return true;
  if (typeof value === "object" && "value" in value) {
    const v = (value as { value?: { href?: string } }).value;
    return !v?.href;
  }
  return false;
}

function getLinkHref(value: LinkSource | undefined): string | undefined {
  if (value == null) return undefined;
  if (typeof value === "string") return value;
  if (typeof value === "object" && "value" in value) {
    const v = value.value as { href?: string } | undefined;
    if (typeof v?.href === "string") return v.href;
  }
  if (typeof value === "object" && "href" in value) {
    return typeof value.href === "string" ? value.href : undefined;
  }
  return undefined;
}

type SocialIconItemStyle = "social-icon" | "social-icon-with-label";

function isSocialIconStyle(
  itemStyle: string | undefined,
): itemStyle is SocialIconItemStyle {
  return itemStyle === "social-icon" || itemStyle === "social-icon-with-label";
}

/**
 * Renders a social-platform icon link. When the host doesn't resolve to
 * a known platform, falls back to a plain text link so the item still
 * appears in editing/preview without breaking the list.
 */
function SocialIconLink({
  href,
  label,
  value,
  withLabel,
}: {
  href: string | undefined;
  label: string | undefined;
  value: LinkSource | undefined;
  withLabel: boolean;
}) {
  const Icon = resolveSocialIcon(href);
  if (!Icon) {
    return <Link value={value} className="hover:underline" />;
  }
  if (withLabel) {
    return (
      <Link
        value={value}
        className="inline-flex items-center gap-2 text-foreground hover:underline [&_svg]:size-5"
      >
        <Icon />
        {label ? <span>{label}</span> : null}
      </Link>
    );
  }
  return (
    <Link
      value={value}
      aria-label={label}
      className="inline-flex text-foreground [&_svg]:size-5"
    >
      <Icon />
    </Link>
  );
}

/**
 * Renders an app-store download badge link. Store resolved from the URL
 * host; an unrecognized host falls back to a plain text link rather
 * than a broken badge — same degrade policy as {@link SocialIconLink}.
 *
 * Unlike SocialIconLink this sets NO `aria-label`. That is deliberate:
 * a social icon carries no visible text, so an aria-label is its only
 * accessible name; the badge shape renders its own VISIBLE wording
 * ("Download on the / App Store"), so an aria-label would override it.
 * When an author's link text differs from that wording — Title "Get our
 * app" on an App Store URL — the accessible name would no longer
 * contain the visible label, failing WCAG 2.5.3 (Label in Name) and
 * leaving speech-input users unable to activate the link by saying what
 * they see. Letting the badge text be the accessible name satisfies
 * 2.5.3 by construction, and matches what Apple's and Google's own
 * badge guidelines produce.
 */
function AppBadgeLink({
  href,
  value,
}: {
  href: string | undefined;
  value: LinkSource | undefined;
}) {
  const kind = getAppBadgeKind(href);
  if (!kind) {
    return <Link value={value} className="hover:underline" />;
  }
  return (
    <Link value={value} className="inline-flex">
      <AppBadgeShape kind={kind} />
    </Link>
  );
}

/**
 * One raw `Items` treelist entry across every source the curated
 * filter accepts, plus the envelope metadata a page reference carries.
 * Beyond the classic `link-list-item@1` fields
 * ({@link LinkListItemFields}) an entry may be:
 *
 *   - a `link-item@1` virtual link — page-aligned Title / Description /
 *     IconName plus an explicit `Url` general-link (external URLs);
 *   - a PAGE item (`page@1`) — shared page fields plus the
 *     layout-service linked-item `url` the row links to.
 */
interface LinkTargetEntryFields extends LinkListItemFields {
  /** Item name from the linked-item envelope — last-resort label. */
  name?: string;
  /** Linked PAGE item's resolved URL (string path or `{path, href}`). */
  url?: LinkedItemUrl;
  /** `link-item@1`'s destination — resolved onto `Link`. */
  Url?: LinkSource;
  /** page@1 shared fields a link row can render. */
  NavigationTitle?: TextSource;
  MetaDescription?: TextSource;
}

/** Clone a link source, adding `text` when it has no authored label. */
function ensureLinkText(
  link: LinkSource,
  text: string | undefined,
): LinkSource {
  if (!text || getLinkText(link) || typeof link !== "object" || link == null) {
    return link;
  }
  if ("value" in link) {
    const value = (link as { value?: Record<string, unknown> }).value;
    return {
      ...(link as object),
      value: { ...(value ?? {}), text },
    } as LinkSource;
  }
  return { ...(link as object), text } as LinkSource;
}

/**
 * Resolve one hoisted `Items` entry into the canonical
 * `{Title, Link, IconName, Description}` row contract, whatever
 * source template it came from:
 *
 *   link-list-item@1  already carries `Link` — passed through as-is.
 *   link-item@1       `Url` becomes `Link` (label from Title when the
 *                     link has no authored text); Title / IconName /
 *                     Description flow through (IconName renders in
 *                     the IconLed variant, like every other entry).
 *   page@1            a Link is synthesized from the item's own `url`
 *                     (title = NavigationTitle ?? Title ?? item name,
 *                     description = Description ?? MetaDescription).
 *
 * Entries with none of those destinations pass through untouched so
 * static topic labels (Title without Link) keep working.
 */
function resolveLinkTargetEntry(item: LinkListItemFields): LinkListItemFields {
  const entry = item as LinkTargetEntryFields;
  if (entry == null) return item;
  // Classic curated entry — already the canonical contract.
  if (entry.Link && !isEmptyLink(entry.Link)) return item;
  // link-item@1 virtual link.
  if (entry.Url && !isEmptyLink(entry.Url)) {
    const title = getNonEmptySource(entry.Title);
    return {
      id: entry.id,
      Title: title,
      Link: ensureLinkText(entry.Url, getSourceText(title)),
      IconName: entry.IconName,
      Description: entry.Description,
    };
  }
  // Page reference — the envelope carries the page's resolved URL.
  const pageHref = getLinkedItemUrl(entry.url);
  if (pageHref) {
    const title =
      getNonEmptySource(entry.NavigationTitle) ??
      getNonEmptySource(entry.Title) ??
      entry.name;
    return {
      id: entry.id,
      Title: title,
      Link: {
        value: { href: pageHref, text: getSourceText(title) ?? pageHref },
      },
      IconName: entry.IconName,
      Description:
        getNonEmptySource(entry.Description) ??
        getNonEmptySource(entry.MetaDescription),
    };
  }
  return item;
}

/** Items that have Title or Link (for Cards/Compact variants). */
function getItemsForTopicStyle(fields: LinkListFields): LinkListItemFields[] {
  // Hoist nested envelopes and resolve page / link-item sources first,
  // same as getTitleAndItemsFromFields — Cards/Compact previously read
  // fields.Items raw and dropped every nested-envelope entry.
  const items = hoistLinkedItemFields<LinkListItemFields>(fields?.Items).map(
    resolveLinkTargetEntry,
  );
  return items.filter(
    (item) =>
      (item?.Title && !isEmptySource(item.Title)) ||
      (item?.Link && !isEmptyLink(item.Link)),
  );
}

function getTitleAndItemsFromFields(fields: LinkListFields): {
  title: TextSource | undefined;
  items: LinkListItemFields[];
} {
  // Hoist nested `{id, fields: {…}}` linked items FIRST. The showcase's
  // generated map flattens Items before the component sees them, but
  // installed starters regenerate their map without the sibling recipe
  // the Treelist discovery needs — items arrive nested there, `i.Link`
  // reads undefined, the curated filter drops EVERY item, and the
  // component (hideWhenEmpty default) rendered NOTHING on the tenant no
  // matter what the author added. Same fix as tabs/accordion resolveItems.
  // Then resolve each entry's source template — a PAGE reference or a
  // link-item@1 virtual link becomes the canonical {Title, Link} row.
  const hoisted = hoistLinkedItemFields<LinkListItemFields>(fields?.Items).map(
    resolveLinkTargetEntry,
  );
  const curated = hoisted.filter((i) => i?.Link && !isEmptyLink(i.Link));
  // Curated wins. ParentChildren only contributes when Items is
  // empty — that's the tree-reference (Phase 2 / IGQL) fallback.
  if (curated.length > 0) {
    return { title: fields?.Title, items: curated };
  }
  const treeRef = fields?.ParentChildren ?? [];
  if (treeRef.length > 0) {
    const items: LinkListItemFields[] = treeRef.map((child) => ({
      id: child.id,
      Title: child.label,
      Link: child.href ? { value: { href: child.href } } : undefined,
    }));
    return { title: fields?.Title, items };
  }
  return { title: fields?.Title, items: curated };
}

type ProgrammaticLinkItem = {
  label: string;
  href?: string;
  iconName?: string;
  description?: string;
};

type NormalizedLinkListInput = {
  fields: LinkListFields;
  programmaticItems?: ProgrammaticLinkItem[];
  programmaticTitle?: string;
};

/**
 * Disambiguate the two shapes the `items`/`title` props can carry.
 *
 * The SDK component map's default adapter spreads lowerFirst'd FIELDS as
 * flat props, so a layout-service datasource arrives as `items`/`title` —
 * the same prop names the programmatic React API uses, but carrying
 * Sitecore shapes (flattened linked items + `TextSource`) instead of
 * `{label, href}` / string. Untreated, the programmatic branch rendered
 * those as empty links and crashed SSR on the title (`{value}` object as
 * a React child — the page-render 500 for design-composed footers).
 *
 * An item is programmatic iff it has a string `label`; a flattened linked
 * item ({@link LinkListItemFields}) never does. Non-programmatic input is
 * folded back into the fields path, where every variant already handles
 * the Sitecore shapes.
 */
function normalizeLinkListInput({
  fields,
  items,
  title,
}: Pick<
  LinkListBlockProps,
  "fields" | "items" | "title"
>): NormalizedLinkListInput {
  const isProgrammatic =
    Boolean(items?.length) &&
    (items ?? []).every(
      (item) => typeof (item as { label?: unknown })?.label === "string",
    );
  if (isProgrammatic) {
    return {
      fields: fields ?? {},
      programmaticItems: items as ProgrammaticLinkItem[],
      programmaticTitle: typeof title === "string" ? title : undefined,
    };
  }
  const merged: LinkListFields = { ...(fields ?? {}) };
  // Prefer the flat `items` prop over `fields.Items`: through the SDK
  // adapter they carry the same datasource, but only the flat prop has
  // been through `flattenLinkedItems` (fields keep the raw
  // `{id, fields: {...}}` linked-item nesting, which the curated-items
  // filter can't read).
  if (items?.length) {
    merged.Items = items as unknown as LinkListItemFields[];
  }
  if (title != null && merged.Title == null) {
    merged.Title = title as TextSource;
  }
  return { fields: merged };
}

const listClassVertical = "flex flex-col gap-2";
const listClassHorizontal = "flex flex-row flex-wrap gap-4";
/**
 * Bulleted vertical list — real `list-disc` markers (the `ListMarker:
 * bulleted` treatment), never a hand-drawn glyph. `list-inside` keeps
 * the disc within the content box so no padding gutter is needed;
 * `marker:text-current` ties the disc color to the row's text token so
 * it inherits whatever `text-*` the links use. Note: CSS markers only
 * render on `display: list-item` children, so this MUST be a block list
 * — a `flex` container would demote the `<li>`s to flex items and
 * suppress every marker. `space-y-2` matches the markerless row rhythm.
 */
const listClassVerticalBulleted =
  "list-disc list-inside space-y-2 marker:text-current";

type ListMarker = "none" | "bulleted";

/**
 * `list-marker@1` — the `ListMarker` rendering param (or
 * `displayOptions.listMarker`). `none` (default) keeps the current
 * markerless stack byte-for-byte; `bulleted` switches the vertical
 * text-link variants to a real disc-bulleted list. Unknown values
 * collapse to `none`, mirroring the other param resolvers.
 */
function resolveListMarker(
  paramValue: string | undefined,
  optionValue: ListMarker | undefined,
): ListMarker {
  const raw = (paramValue ?? optionValue ?? "").trim().toLowerCase();
  return raw === "bulleted" ? "bulleted" : "none";
}

/**
 * Whether the `Default` variant's list should render disc markers.
 * Bullets only make sense on a vertical stack of plain text links —
 * never on a horizontal row or beside social icons.
 */
function isVerticalBulleted(
  orientation: "vertical" | "horizontal",
  socialStyle: SocialIconItemStyle | undefined,
  paramValue: string | undefined,
  optionValue: ListMarker | undefined,
): boolean {
  if (orientation === "horizontal" || socialStyle) return false;
  return resolveListMarker(paramValue, optionValue) === "bulleted";
}

const DEFAULT_PROGRAMMATIC_ITEM_CLASS =
  "inline-flex h-auto w-full justify-start rounded-md px-2 py-2 text-muted-foreground text-sm hover:bg-background hover:text-foreground";
// The full-width hover pill fights `list-inside` markers (a `w-full`
// inline-flex wraps below the disc), so bulleted rows use a plain
// inline text link instead.
const DEFAULT_PROGRAMMATIC_BULLETED_ITEM_CLASS =
  "text-muted-foreground text-sm hover:text-foreground hover:underline";

/** Vertical `Default`/topic list class — bulleted swaps to a block
 * `list-disc` list (markers can't render on a flex container). */
function resolveVerticalListClass(bulleted: boolean): string {
  return bulleted ? listClassVerticalBulleted : listClassVertical;
}

/** Per-row link class for the `Default` variant's programmatic items. */
function resolveDefaultProgrammaticItemClass(bulleted: boolean): string {
  return bulleted
    ? DEFAULT_PROGRAMMATIC_BULLETED_ITEM_CLASS
    : DEFAULT_PROGRAMMATIC_ITEM_CLASS;
}

// ─── row density (`RowSize`) ────────────────────────────────────────

/**
 * `size@1` → row density for EVERY row-based variant, not just NavList.
 *
 * Two facets because the variants build rows two different ways.
 * PADDED rows (NavList, IconLed, and icon-led MultiColumn rows) carry
 * their own `py-*`; GAPPED stacks (Default, Compact, plain MultiColumn
 * columns) space their rows with the list's `gap-*`. "Denser" means
 * less padding on the first and less gap on the second — different
 * mechanics, one axis as far as an author is concerned, which is why
 * it is one param rather than two.
 *
 * The `default` bucket resolves to "" in both helpers below rather than
 * to its row string. That is deliberate: an unset `RowSize` must leave
 * each variant's own historic metrics untouched (Default has no row
 * padding at all, IconLed's rows are `py-2.5`, MultiColumn's columns
 * are `gap-2`), and emitting the NavList numbers as a "default" would
 * silently restyle four variants the moment this param started
 * reaching them. Only a non-default bucket overrides anything.
 */
const ROW_SIZE_CLASSES = {
  compact: { row: "py-2 text-sm", gap: "gap-1.5", space: "space-y-1.5" },
  default: { row: "py-3 text-sm", gap: "gap-2", space: "space-y-2" },
  large: { row: "py-3.5 text-base", gap: "gap-3", space: "space-y-3" },
  xlarge: { row: "py-4 text-lg", gap: "gap-4", space: "space-y-4" },
} as const;

type RowSizeBucket = keyof typeof ROW_SIZE_CLASSES;

/** `size@1` token → bucket: xs/sm → compact, lg → large, xl → xlarge. */
function rowSizeBucket(value: string | undefined): RowSizeBucket {
  const normalized = (value ?? "").trim().toLowerCase();
  if (normalized === "xs" || normalized === "sm") return "compact";
  if (normalized === "lg") return "large";
  if (normalized === "xl") return "xlarge";
  return "default";
}

/**
 * Row-metrics override for PADDED rows, appended after the row's own
 * classes so twMerge lets it win. Empty at the `default` bucket — see
 * the note on `ROW_SIZE_CLASSES`.
 */
function rowSizeRowClass(bucket: RowSizeBucket): string {
  return bucket === "default" ? "" : ROW_SIZE_CLASSES[bucket].row;
}

/**
 * Hairline rule between rows, for the four row variants whose OWN
 * default is plain — Default, Compact, MultiColumn and IconLed. Empty
 * unless the author opted in via `RowSeparators`, so these stacks
 * render byte-identically to before the axis reached them.
 *
 * Applied to the `<li>`, not the row: it has to sit outside the row's
 * own padding to span the full width, and one class then covers both
 * the icon-led rows and the plain links each variant can render.
 *
 * `last:` resets keep the list from ending on a dangling rule. NavList
 * is deliberately NOT routed through here — its rule sits on the row
 * itself (`navListRowClass`), under the final row too, and that is its
 * historic look.
 */
function separatedRowClass(separated: boolean): string {
  return separated
    ? "border-border border-b pb-2 last:border-b-0 last:pb-0"
    : "";
}

/**
 * Row-metrics override for GAPPED stacks. Bulleted lists are block
 * `list-disc` lists, where `gap-*` does nothing and the rhythm comes
 * from `space-y-*`; flex stacks are the reverse. Empty at the `default`
 * bucket.
 */
function rowSizeStackClass(bucket: RowSizeBucket, bulleted: boolean): string {
  if (bucket === "default") return "";
  const size = ROW_SIZE_CLASSES[bucket];
  return bulleted ? size.space : size.gap;
}

/**
 * Default variant: vertical list of links (stacked).
 */
export function Default({
  params = {},
  fields: rawFields,
  items: rawItems,
  title: rawTitle,
  displayOptions,
  behaviorOptions,
  styleOptions,
}: LinkListBlockProps) {
  const { fields, programmaticItems, programmaticTitle } =
    normalizeLinkListInput({
      fields: rawFields,
      items: rawItems,
      title: rawTitle,
    });
  const { styles, RenderingIdentifier: id } = params;
  const baseClass = cn(
    "component link-list",
    // `LinkColorScheme` (color-scheme@1) recolors this variant's
    // links. Descendant form, because each variant bakes its own
    // colour into the anchor and a plain text-* on the wrapper
    // would lose to it.
    colorSchemeAnchorTextClass(params.LinkColorScheme),
    styleOptions?.className,
    styles?.trimEnd(),
  );
  const { title, items: fieldItems } = getTitleAndItemsFromFields(fields ?? {});
  const showTitle = displayOptions?.showTitle ?? true;
  const orientation = displayOptions?.orientation ?? "vertical";
  const itemStyle = displayOptions?.itemStyle ?? "default";
  const socialStyle = isSocialIconStyle(itemStyle) ? itemStyle : undefined;
  // `item-style@1: icon-led` — the shared IconLedRow treatment, same as
  // NavList/MultiColumn/Compact. Only meaningful on a vertical stack of
  // ordinary links: a horizontal row has no room for icon + description,
  // and the social-icon styles already lead every row with a glyph.
  const iconLed =
    orientation !== "horizontal" &&
    !socialStyle &&
    resolveItemStyleParam(params.ItemStyle) === "icon-led";
  const bulleted =
    !iconLed &&
    isVerticalBulleted(
      orientation,
      socialStyle,
      params.ListMarker,
      displayOptions?.listMarker,
    );
  const sizeBucket = rowSizeBucket(params.RowSize);
  // Own default is plain — these rows never carried rules. Vertical
  // only: horizontal Default is a strip, not a row stack, and the
  // social-icon branch is a glyph row rather than a link row.
  const rowSeparators =
    orientation !== "horizontal" &&
    resolveRowSeparators(params.RowSeparators, false);
  const listClass = cn(
    orientation === "horizontal"
      ? listClassHorizontal
      : iconLed
        ? "flex flex-col gap-0.5"
        : resolveVerticalListClass(bulleted),
    // Icon rows carry density as row padding, so the list gap stays put.
    iconLed ? undefined : rowSizeStackClass(sizeBucket, bulleted),
  );
  const hideWhenEmpty = behaviorOptions?.hideWhenEmpty ?? true;
  const isEditing = resolveEditingMode({ params });

  if (programmaticItems?.length) {
    const displayTitle = displayOptions?.title ?? programmaticTitle ?? "Links";
    const itemClass = resolveDefaultProgrammaticItemClass(bulleted);
    return (
      <div className={baseClass} id={id}>
        {showTitle ? (
          <TypographyH4 className="mb-2 block ps-1 text-lg">
            {displayTitle}
          </TypographyH4>
        ) : null}
        <ul className={listClass}>
          {programmaticItems.map((item, index) => {
            const key = `${item.label}-${index}`;
            if (item.href !== undefined && item.href !== "") {
              if (socialStyle) {
                return (
                  <li key={key}>
                    <SocialIconLink
                      href={item.href}
                      label={item.label}
                      value={{ value: { href: item.href, text: item.label } }}
                      withLabel={socialStyle === "social-icon-with-label"}
                    />
                  </li>
                );
              }
              return (
                <li key={key} className={separatedRowClass(rowSeparators)}>
                  <Link
                    value={{ value: { href: item.href, text: item.label } }}
                    className={itemClass}
                  />
                </li>
              );
            }
            return (
              <li key={key} className={separatedRowClass(rowSeparators)}>
                <span className={itemClass}>{item.label}</span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  if (!fieldItems.length) {
    const hasTitle = title != null && !isEmptySource(title);
    const hasParentRef = fields?.ParentRef != null;
    // An authored title must still render even while the list is empty
    // (or while a ParentRef resolves server-side) — hiding the whole
    // component made an items-less-but-titled placement look broken.
    if (hideWhenEmpty && !isEditing && !hasTitle) return null;
    return (
      <div className={baseClass} id={id}>
        {showTitle && hasTitle ? (
          <Text
            tag="h3"
            value={title}
            className={cn(
              "mb-4.5 text-accent text-lg",
              linkListHeadingTone(params),
            )}
          />
        ) : null}
        {isEditing || !hideWhenEmpty ? (
          <span className="is-empty-hint text-muted-foreground text-sm">
            {hasParentRef
              ? "Link list — children of the referenced parent resolve at render time"
              : "Link list"}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div className={baseClass} id={id}>
      {showTitle && title && (
        <Text
          tag="h3"
          value={title}
          className={cn(
            "mb-4.5 text-accent text-lg",
            linkListHeadingTone(params),
          )}
        />
      )}
      <ul className={listClass}>
        {fieldItems.map((item) => {
          const itemHref = getLinkHref(item.Link);
          const itemKey =
            item.id ?? `${itemHref ?? "item"}-${getLinkText(item.Link)}`;
          if (socialStyle) {
            return (
              <li key={itemKey}>
                <SocialIconLink
                  href={itemHref}
                  label={getLinkText(item.Link)}
                  value={item.Link}
                  withLabel={socialStyle === "social-icon-with-label"}
                />
              </li>
            );
          }
          if (iconLed) {
            return (
              <li key={itemKey} className={separatedRowClass(rowSeparators)}>
                <IconLedRow
                  value={item.Link}
                  iconName={getItemIconName(item)}
                  label={getLinkText(item.Link)}
                  labelSource={item.Title}
                  description={item.Description}
                  isEditing={isEditing}
                  className={rowSizeRowClass(sizeBucket)}
                />
              </li>
            );
          }
          return (
            <li key={itemKey} className={separatedRowClass(rowSeparators)}>
              <Link value={item.Link} className="hover:underline" />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Alias for Default (vertical link list); used by preview-search and other consumers. */
export const LinkList = Default;

/**
 * Resolves the list element's Tailwind classes for the Horizontal
 * variant. `columns` (when provided) wins and produces a responsive
 * grid; otherwise the list flows horizontally with wrap.
 */
function resolveHorizontalListClass(
  orientation: "vertical" | "horizontal",
  columns: 2 | 3 | 4 | undefined,
): string {
  if (orientation === "vertical") return listClassVertical;
  if (columns === 2) {
    return "grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2";
  }
  if (columns === 3) {
    return "grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3";
  }
  if (columns === 4) {
    return "grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 md:grid-cols-4";
  }
  return listClassHorizontal;
}

/**
 * Resolve a column count from the `Columns` param (`column-count@1`),
 * falling back to `displayOptions.columns`. Shared by the two variants
 * that lay entries out in tracks: Horizontal's optional grid and the
 * Cards grid.
 *
 * `auto` — the param's default — returns `undefined`, meaning "the
 * variant's own layout": Horizontal's wrapping row, Cards' historic
 * 2-up/3-up. That value is the whole reason either variant can read the
 * param at all. `column-count@1` is shared with MultiColumn (and the
 * splitters), so its Standard Value is one string for every consumer;
 * while that string was the numeric `3`, connecting a new reader would
 * have re-laid-out every placement already out there. Values above 4
 * clamp to 4, matching MultiColumn.
 */
function resolveGridColumns(
  paramValue: string | undefined,
  optionValue: 2 | 3 | 4 | undefined,
): 2 | 3 | 4 | undefined {
  const parsed = Number.parseInt((paramValue ?? "").trim(), 10);
  if (Number.isNaN(parsed)) return optionValue;
  if (parsed <= 2) return 2;
  if (parsed >= 4) return 4;
  return 3;
}

/**
 * Tailwind class for an individual link in the Horizontal variant,
 * based on `itemStyle`. `default` is a muted underline-on-hover link;
 * `arrow-button` delegates to the `ArrowLink` primitive (rendered
 * directly, so no className applies here).
 */
function resolveHorizontalItemClass(
  itemStyle: Exclude<HorizontalItemStyle, SocialIconItemStyle | "app-badge">,
): string {
  if (itemStyle === "arrow-button") return "";
  return "inline-flex rounded-md px-2 py-2 text-muted-foreground text-sm hover:bg-background hover:text-foreground";
}

/**
 * Title-class lookup for the Horizontal variant. `inline-start` is the
 * compact uppercase muted label used in nav strips; `above` defaults to
 * either the programmatic `TypographyH4` or the fields-mode accent
 * heading depending on the source.
 */
const HORIZONTAL_INLINE_TITLE_CLASS =
  "font-semibold text-muted-foreground text-sm uppercase tracking-wider";
const HORIZONTAL_STACKED_TITLE_CLASS = "mb-2 block ps-1 text-lg";
const HORIZONTAL_FIELDS_TITLE_CLASS = "mb-4.5 text-accent text-lg";
const HORIZONTAL_INLINE_WRAPPER_CLASS =
  "flex flex-col items-start gap-3 md:flex-row md:items-center md:gap-10";

type HorizontalItemStyle =
  | "default"
  | "arrow-button"
  | "social-icon"
  | "social-icon-with-label"
  | "app-badge";
type HorizontalTitleLayout = "above" | "inline-start";

function HorizontalProgrammaticLink({
  item,
  itemStyle,
}: {
  item: { label: string; href?: string };
  itemStyle: HorizontalItemStyle;
}) {
  if (isSocialIconStyle(itemStyle)) {
    if (item.href === undefined || item.href === "") {
      return <span>{item.label}</span>;
    }
    return (
      <SocialIconLink
        href={item.href}
        label={item.label}
        value={{ value: { href: item.href, text: item.label } }}
        withLabel={itemStyle === "social-icon-with-label"}
      />
    );
  }
  if (itemStyle === "app-badge") {
    if (item.href === undefined || item.href === "") {
      return <span>{item.label}</span>;
    }
    return (
      <AppBadgeLink
        href={item.href}
        value={{ value: { href: item.href, text: item.label } }}
      />
    );
  }
  const itemClass = resolveHorizontalItemClass(itemStyle);
  if (item.href === undefined || item.href === "") {
    return <span className={itemClass}>{item.label}</span>;
  }
  const linkValue = { value: { href: item.href, text: item.label } };
  if (itemStyle === "arrow-button") {
    return <ArrowLink value={linkValue} />;
  }
  return <Link value={linkValue} className={itemClass} />;
}

function HorizontalFieldLink({
  item,
  itemStyle,
}: {
  item: LinkListItemFields;
  itemStyle: HorizontalItemStyle;
}) {
  if (isSocialIconStyle(itemStyle)) {
    return (
      <SocialIconLink
        href={getLinkHref(item.Link)}
        label={getLinkText(item.Link)}
        value={item.Link}
        withLabel={itemStyle === "social-icon-with-label"}
      />
    );
  }
  if (itemStyle === "app-badge") {
    return <AppBadgeLink href={getLinkHref(item.Link)} value={item.Link} />;
  }
  if (itemStyle === "arrow-button") {
    return <ArrowLink value={item.Link} />;
  }
  return <Link value={item.Link} className="hover:underline" />;
}

function HorizontalTitle({
  text,
  titleLayout,
  source,
  headingTone,
}: {
  text: string | TextSource;
  titleLayout: HorizontalTitleLayout;
  source: "programmatic" | "fields";
  /**
   * Resolved `HeadingColor` class, "" for `default`. Passed in rather
   * than read here because this helper's classes are module constants —
   * appending keeps the inline micro-label quiet and the stacked/fields
   * headings on accent until an author picks a colour.
   */
  headingTone: string;
}) {
  if (titleLayout === "inline-start") {
    if (typeof text === "string") {
      return (
        <span className={cn(HORIZONTAL_INLINE_TITLE_CLASS, headingTone)}>
          {text}
        </span>
      );
    }
    return (
      <Text
        tag="span"
        value={text}
        className={cn(HORIZONTAL_INLINE_TITLE_CLASS, headingTone)}
      />
    );
  }
  if (source === "programmatic" && typeof text === "string") {
    return (
      <TypographyH4 className={cn(HORIZONTAL_STACKED_TITLE_CLASS, headingTone)}>
        {text}
      </TypographyH4>
    );
  }
  if (typeof text === "string") {
    return (
      <Text
        tag="h3"
        value={{ value: text }}
        className={cn(HORIZONTAL_FIELDS_TITLE_CLASS, headingTone)}
      />
    );
  }
  return (
    <Text
      tag="h3"
      value={text}
      className={cn(HORIZONTAL_FIELDS_TITLE_CLASS, headingTone)}
    />
  );
}

function HorizontalListBody<TItem>({
  items,
  listClass,
  isInlineStart,
  titleNode,
  getKey,
  renderItem,
  separator = null,
}: {
  items: TItem[];
  listClass: string;
  isInlineStart: boolean;
  titleNode: React.ReactNode;
  getKey: (item: TItem, index: number) => string;
  renderItem: (item: TItem) => React.ReactNode;
  /**
   * `separator-glyph@1` node placed BETWEEN items. Null at the variant
   * default (`none`), which is every placement authored before the axis
   * reached this strip — so the row renders exactly as it always has
   * until an author picks a glyph.
   */
  separator?: React.ReactNode;
}) {
  if (isInlineStart) {
    return (
      <div className={HORIZONTAL_INLINE_WRAPPER_CLASS}>
        {titleNode}
        <nav className={listClass}>
          {items.map((item, index) => (
            <Fragment key={getKey(item, index)}>
              {index > 0 ? separator : null}
              <span>{renderItem(item)}</span>
            </Fragment>
          ))}
        </nav>
      </div>
    );
  }
  return (
    <>
      {titleNode}
      <ul className={listClass}>
        {items.map((item, index) => (
          <Fragment key={getKey(item, index)}>
            {index > 0 ? separator : null}
            <li>{renderItem(item)}</li>
          </Fragment>
        ))}
      </ul>
    </>
  );
}

/**
 * Horizontal variant: links in a row with wrap (like the old link list
 * when not list-vertical). Supports an inline-start title layout, an
 * arrow-button item style, a responsive column grid, and a bordered
 * "nav strip" surface — covers utility nav bars (e.g. northwind.com's
 * Quick Access) and dense product-link grids (northwind.com's products
 * & services explorer footer).
 */
export function Horizontal({
  params = {},
  fields: rawFields,
  items: rawItems,
  title: rawTitle,
  displayOptions,
  behaviorOptions,
  styleOptions,
}: LinkListBlockProps) {
  const { fields, programmaticItems, programmaticTitle } =
    normalizeLinkListInput({
      fields: rawFields,
      items: rawItems,
      title: rawTitle,
    });
  const { styles, RenderingIdentifier: id } = params;
  const titleLayout: HorizontalTitleLayout =
    displayOptions?.titleLayout ?? "above";
  const itemStyle: HorizontalItemStyle = displayOptions?.itemStyle ?? "default";
  const columns = resolveGridColumns(params.Columns, displayOptions?.columns);
  // Falls back to `none`: this row has never drawn a separator, so a
  // glyph appears only when an author asks for one.
  const glyph = resolveSeparatorGlyph(
    params.SeparatorGlyph,
    displayOptions?.separatorGlyph,
    "none",
  );
  const surface = styleOptions?.surface ?? "default";
  const isInlineStart = titleLayout === "inline-start";
  const isBordered = surface === "bordered";
  const showTitle = displayOptions?.showTitle ?? true;
  const orientation = displayOptions?.orientation ?? "horizontal";
  const listClass = resolveHorizontalListClass(orientation, columns);
  const hideWhenEmpty = behaviorOptions?.hideWhenEmpty ?? true;
  const isEditing = resolveEditingMode({ params });

  const baseClass = cn(
    "component link-list",
    // `LinkColorScheme` (color-scheme@1) recolors this variant's
    // links. Descendant form, because each variant bakes its own
    // colour into the anchor and a plain text-* on the wrapper
    // would lose to it.
    colorSchemeAnchorTextClass(params.LinkColorScheme),
    isBordered && "w-full border-y bg-background py-6 text-foreground",
    styleOptions?.className,
    styles?.trimEnd(),
  );
  const wrapWithSurface = (node: React.ReactNode) =>
    isBordered ? (
      <div className="container mx-auto max-w-6xl px-4">{node}</div>
    ) : (
      node
    );

  if (programmaticItems?.length) {
    const displayTitle = displayOptions?.title ?? programmaticTitle ?? "Links";
    return (
      <div className={baseClass} id={id}>
        {wrapWithSurface(
          <HorizontalListBody
            items={programmaticItems}
            listClass={listClass}
            isInlineStart={isInlineStart}
            titleNode={
              showTitle ? (
                <HorizontalTitle
                  text={displayTitle}
                  titleLayout={titleLayout}
                  source="programmatic"
                  headingTone={linkListHeadingTone(params)}
                />
              ) : null
            }
            getKey={(item, index) => `${item.label}-${index}`}
            renderItem={(item) => (
              <HorizontalProgrammaticLink item={item} itemStyle={itemStyle} />
            )}
            separator={separatorGlyphNode(glyph)}
          />,
        )}
      </div>
    );
  }

  const { title, items: fieldItems } = getTitleAndItemsFromFields(fields ?? {});
  if (!fieldItems.length) {
    if (hideWhenEmpty && !isEditing) return null;
    return (
      <div className={baseClass} id={id}>
        {wrapWithSurface(
          <span className="is-empty-hint text-muted-foreground text-sm">
            Link list
          </span>,
        )}
      </div>
    );
  }

  return (
    <div className={baseClass} id={id}>
      {wrapWithSurface(
        <HorizontalListBody
          items={fieldItems}
          listClass={listClass}
          isInlineStart={isInlineStart}
          titleNode={
            showTitle && title ? (
              <HorizontalTitle
                text={title}
                titleLayout={titleLayout}
                source="fields"
                headingTone={linkListHeadingTone(params)}
              />
            ) : null
          }
          getKey={(item, index) =>
            `${getLinkHref(item.Link) ?? "item"}-${index}`
          }
          renderItem={(item) => (
            <HorizontalFieldLink item={item} itemStyle={itemStyle} />
          )}
          separator={separatorGlyphNode(glyph)}
        />,
      )}
    </div>
  );
}

/** Item classes for the UtilityBar variant — quiet strip links. */
const UTILITY_BAR_ITEM_CLASS =
  "inline-flex items-center gap-1.5 text-muted-foreground text-xs transition-colors hover:text-foreground";

function UtilityBarItem({
  label,
  href,
  value,
  itemStyle,
}: {
  label: string | undefined;
  href: string | undefined;
  value: LinkSource | undefined;
  itemStyle: HorizontalItemStyle;
}) {
  if (isSocialIconStyle(itemStyle)) {
    return (
      <SocialIconLink
        href={href}
        label={label}
        value={value}
        withLabel={itemStyle === "social-icon-with-label"}
      />
    );
  }
  if (href === undefined || href === "") {
    return <span className={UTILITY_BAR_ITEM_CLASS}>{label}</span>;
  }
  return <Link value={value} className={UTILITY_BAR_ITEM_CLASS} />;
}

/**
 * UtilityBar variant: the thin utility strip above a site header —
 * locale/language entry points, sign-in, support and other secondary
 * links in a single quiet row. Same content shape as every other
 * link-list variant, so a generated header partial can express the
 * fifa/emirates-style top strip by placing ONE flat rendering with
 * inline fields (no header-shell slot composition needed).
 *
 * Layout: full-width quiet surface (`bg-muted`), bottom border, and a
 * container row — optional Title inline at the start (uppercase
 * micro-label), links right-aligned. Honors `itemStyle:
 * "social-icon"` / `"social-icon-with-label"` for icon entries.
 */
export function UtilityBar({
  params = {},
  fields: rawFields,
  items: rawItems,
  title: rawTitle,
  displayOptions,
  behaviorOptions,
  styleOptions,
}: LinkListBlockProps) {
  const { fields, programmaticItems, programmaticTitle } =
    normalizeLinkListInput({
      fields: rawFields,
      items: rawItems,
      title: rawTitle,
    });
  const { styles, RenderingIdentifier: id } = params;
  const itemStyle: HorizontalItemStyle = displayOptions?.itemStyle ?? "default";
  // Falls back to `none`: this strip has never drawn a separator, so a
  // glyph appears only when an author asks for one.
  const glyph = resolveSeparatorGlyph(
    params.SeparatorGlyph,
    displayOptions?.separatorGlyph,
    "none",
  );
  const showTitle = displayOptions?.showTitle ?? true;
  const hideWhenEmpty = behaviorOptions?.hideWhenEmpty ?? true;
  const isEditing = resolveEditingMode({ params });

  const baseClass = cn(
    "component link-list utility-bar w-full border-border border-b bg-muted",
    // `LinkColorScheme` (color-scheme@1) recolors this variant's
    // links. Descendant form, because each variant bakes its own
    // colour into the anchor and a plain text-* on the wrapper
    // would lose to it.
    colorSchemeAnchorTextClass(params.LinkColorScheme),
    styleOptions?.className,
    styles?.trimEnd(),
  );

  const { title, items: fieldItems } = getTitleAndItemsFromFields(fields ?? {});
  const usingProgrammatic = Boolean(programmaticItems?.length);
  const items: Array<{
    key: string;
    label: string | undefined;
    href: string | undefined;
    value: LinkSource | undefined;
  }> = usingProgrammatic
    ? (programmaticItems ?? []).map((item, index) => ({
        key: `${item.label}-${index}`,
        label: item.label,
        href: item.href,
        value:
          item.href !== undefined && item.href !== ""
            ? { value: { href: item.href, text: item.label } }
            : undefined,
      }))
    : fieldItems.map((item, index) => ({
        key: item.id ?? `${getLinkHref(item.Link) ?? "item"}-${index}`,
        label: getLinkText(item.Link),
        href: getLinkHref(item.Link),
        value: item.Link,
      }));

  if (!items.length) {
    if (hideWhenEmpty && !isEditing) return null;
    return (
      <div className={baseClass} id={id}>
        <div className="container mx-auto px-4 py-1.5">
          <span className="is-empty-hint text-muted-foreground text-xs">
            Utility bar
          </span>
        </div>
      </div>
    );
  }

  const titleText = usingProgrammatic
    ? (displayOptions?.title ?? programmaticTitle)
    : undefined;

  return (
    <div className={baseClass} id={id}>
      <div className="container mx-auto flex min-h-9 flex-wrap items-center justify-between gap-x-8 gap-y-1 px-4 py-1.5">
        {showTitle && (titleText || title) ? (
          titleText ? (
            <span
              className={cn(
                "font-semibold text-muted-foreground text-xs uppercase tracking-wider",
                linkListHeadingTone(params),
              )}
            >
              {titleText}
            </span>
          ) : (
            <Text
              tag="span"
              value={title}
              className={cn(
                "font-semibold text-muted-foreground text-xs uppercase tracking-wider",
                linkListHeadingTone(params),
              )}
            />
          )
        ) : null}
        <nav
          aria-label="Utility"
          className="ms-auto flex flex-wrap items-center gap-x-5 gap-y-1"
        >
          {items.map((item, index) => (
            <Fragment key={item.key}>
              {index > 0 ? separatorGlyphNode(glyph) : null}
              <UtilityBarItem
                label={item.label}
                href={item.href}
                value={item.value}
                itemStyle={itemStyle}
              />
            </Fragment>
          ))}
        </nav>
      </div>
    </div>
  );
}

/**
 * Card-grid classes per resolved column count. `undefined` (the
 * `Columns` param's `auto`) is the historic 2-up/3-up grid — spelled
 * out rather than derived so the default placement's markup is
 * literally unchanged.
 */
const CARDS_GRID_CLASS: Record<"auto" | 2 | 3 | 4, string> = {
  auto: "grid gap-6 sm:grid-cols-2 lg:grid-cols-3",
  2: "grid gap-6 sm:grid-cols-2",
  3: "grid gap-6 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid gap-6 sm:grid-cols-2 lg:grid-cols-4",
};

/**
 * Cards variant: section title + grid of cards (each item has Title and optional Link).
 * Use when items have Title (topic-listing style).
 */
export function Cards({
  params = {},
  fields: rawFields,
  items: rawItems,
  title: rawTitle,
  displayOptions,
  behaviorOptions,
  styleOptions,
}: LinkListBlockProps) {
  const { fields } = normalizeLinkListInput({
    fields: rawFields,
    items: rawItems,
    title: rawTitle,
  });
  const { styles, RenderingIdentifier: id } = params;
  const title =
    fields?.Title && !isEmptySource(fields.Title) ? fields.Title : undefined;
  const items = getItemsForTopicStyle(fields ?? {});
  const showTitle = displayOptions?.showTitle ?? true;
  const hideWhenEmpty = behaviorOptions?.hideWhenEmpty ?? true;
  const isEditing = resolveEditingMode({ params });
  // This grid is exactly what `Columns` names, so it reads it. `auto`
  // (the default) keeps the historic 2-up/3-up.
  const gridClass =
    CARDS_GRID_CLASS[
      resolveGridColumns(params.Columns, displayOptions?.columns) ?? "auto"
    ];

  if (hideWhenEmpty && !items.length && !isEditing) {
    return null;
  }

  return (
    <section
      className={cn(
        "component link-list topic-listing w-full bg-background text-foreground",
        // `LinkColorScheme` (color-scheme@1) recolors this variant's
        // links. Descendant form, because each variant bakes its own
        // colour into the anchor and a plain text-* on the wrapper
        // would lose to it.
        colorSchemeAnchorTextClass(params.LinkColorScheme),
        styleOptions?.className,
        styles?.trimEnd(),
      )}
      id={id ?? undefined}
      dir="inherit"
      data-slot="link-list"
    >
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="mx-auto max-w-6xl">
          {showTitle && title && (
            <TypographyH2
              className={cn(
                "mb-8 font-heading font-semibold text-2xl md:text-3xl",
                linkListHeadingTone(params),
              )}
            >
              <Text value={title} tag="span" />
            </TypographyH2>
          )}
          <div className={gridClass}>
            {items.length
              ? items.map((item, i) => {
                  const itemTitle = item.Title;
                  return (
                    <Card
                      key={item.id ?? `item-${i}`}
                      className="h-full border-border bg-card"
                    >
                      <CardHeader>
                        <span className="font-heading font-medium text-lg">
                          {item.Link && !isEmptySource(item.Link) ? (
                            <Link
                              value={item.Link}
                              className="text-foreground hover:text-accent"
                            />
                          ) : (
                            itemTitle && <Text value={itemTitle} tag="span" />
                          )}
                        </span>
                      </CardHeader>
                    </Card>
                  );
                })
              : isEditing && (
                  <span className="is-empty-hint text-muted-foreground text-sm">
                    Link list
                  </span>
                )}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Pill-chip link classes for the Pills variant. */
const PILL_ITEM_CLASS =
  "inline-flex items-center rounded-full border border-border bg-muted px-4 py-1.5 font-medium text-foreground text-sm transition-colors hover:bg-muted-hover";

/**
 * Pills variant: an inline row of pill/chip-styled links with wrap —
 * category shortcuts, tag clouds, and "browse by" strips (e.g. a
 * retailer's popular-searches row). Use instead of `Horizontal` when
 * the source shows links as rounded chips rather than plain text.
 */
export function Pills({
  params = {},
  fields: rawFields,
  items: rawItems,
  title: rawTitle,
  displayOptions,
  behaviorOptions,
  styleOptions,
}: LinkListBlockProps) {
  const { fields, programmaticItems, programmaticTitle } =
    normalizeLinkListInput({
      fields: rawFields,
      items: rawItems,
      title: rawTitle,
    });
  const { styles, RenderingIdentifier: id } = params;
  const showTitle = displayOptions?.showTitle ?? true;
  const hideWhenEmpty = behaviorOptions?.hideWhenEmpty ?? true;
  const isEditing = resolveEditingMode({ params });
  // Falls back to `none`: a chip carries its own border, so this row has
  // never drawn a glyph and only does so when an author asks. Rendered
  // as its own `<li>` — a bare `<span>` child of `<ul>` is invalid — and
  // omitted entirely at `none`, so the default markup is unchanged.
  const separator = separatorGlyphNode(
    resolveSeparatorGlyph(
      params.SeparatorGlyph,
      displayOptions?.separatorGlyph,
      "none",
    ),
  );

  const baseClass = cn(
    "component link-list link-list-pills",
    // `LinkColorScheme` (color-scheme@1) recolors this variant's
    // links. Descendant form, because each variant bakes its own
    // colour into the anchor and a plain text-* on the wrapper
    // would lose to it.
    colorSchemeAnchorTextClass(params.LinkColorScheme),
    styleOptions?.className,
    styles?.trimEnd(),
  );

  const { title, items: fieldItems } = getTitleAndItemsFromFields(fields ?? {});
  const usingProgrammatic = Boolean(programmaticItems?.length);
  const items: Array<{
    key: string;
    label: string | undefined;
    value: LinkSource | undefined;
  }> = usingProgrammatic
    ? (programmaticItems ?? []).map((item, index) => ({
        key: `${item.label}-${index}`,
        label: item.label,
        value: { value: { href: item.href || "#", text: item.label } },
      }))
    : fieldItems.map((item, index) => ({
        key: item.id ?? `${getLinkHref(item.Link) ?? "item"}-${index}`,
        label: getLinkText(item.Link),
        value: item.Link,
      }));

  if (!items.length) {
    if (hideWhenEmpty && !isEditing) return null;
    return (
      <div className={baseClass} id={id}>
        <span className="is-empty-hint text-muted-foreground text-sm">
          Link list
        </span>
      </div>
    );
  }

  const titleText = usingProgrammatic
    ? (displayOptions?.title ?? programmaticTitle)
    : undefined;

  return (
    <div className={baseClass} id={id}>
      {showTitle && (titleText || title) ? (
        titleText ? (
          <TypographyH4 className="mb-3 text-lg">{titleText}</TypographyH4>
        ) : (
          <Text
            tag="h3"
            value={title}
            className={cn(
              "mb-3 text-accent text-lg",
              linkListHeadingTone(params),
            )}
          />
        )
      ) : null}
      <ul className="flex flex-row flex-wrap items-center gap-2.5">
        {items.map((item, index) => (
          <Fragment key={item.key}>
            {index > 0 && separator ? <li>{separator}</li> : null}
            <li>
              <Link value={item.value} className={PILL_ITEM_CLASS} />
            </li>
          </Fragment>
        ))}
      </ul>
    </div>
  );
}

/** Row classes for the NavList variant — chevron-led nav rows. */
/**
 * `item-style@1` — how each link row renders its content (`ItemStyle`
 * rendering param). `text` (default) keeps the plain text-link row;
 * `icon-led` renders each entry's IconName (icon-name@1) as a leading
 * vector icon plus the optional per-item Description, via the same
 * `IconLedRow` the IconLed variant draws. Honored by `NavList` and
 * `MultiColumn`; rows without an icon degrade to text-only. Variants
 * where icons don't fit (UtilityBar, InlineSeparated, Pills) and the
 * inherently-iconed `IconLed` ignore the param.
 */
type LinkItemStyle = "text" | "icon-led";

function resolveItemStyleParam(value: string | undefined): LinkItemStyle {
  return (value ?? "").trim().toLowerCase() === "icon-led"
    ? "icon-led"
    : "text";
}

/**
 * Resolve `RowSeparators` (`row-separators@1`) to "does this row draw a
 * hairline rule?", for one variant.
 *
 * The param was a checkbox until 2026-08 and became a droplist so it
 * could reach past NavList. A checkbox couldn't: its single Standard
 * Value is shared by every variant, so the checked default that gives
 * NavList its historic hairlines would have given the four plain row
 * stacks hairlines too, the moment they started reading it — a visual
 * change to every placement already out there.
 *
 * `variantDefault` is what makes that safe: it is this variant's own
 * treatment (NavList separated, the plain stacks not), and both the
 * `default` value and every legacy CHECKED placement resolve to it. So
 * the migration renders identically to the checkbox everywhere:
 *
 *   `"1"` / `"true"`      legacy checked — the Standard Value nearly
 *                         every placement carries. Reads as
 *                         `variantDefault`, NOT as `separated`: on
 *                         NavList that is separated (unchanged), and on
 *                         the others it is plain (also unchanged, since
 *                         they ignored the param entirely).
 *   `""` / `"0"` / …      legacy unchecked. The one case where an author
 *                         expressed intent, so it stays honoured: plain.
 *                         Unambiguous because a post-migration placement
 *                         always carries the droplist's own SV.
 *   `"default"`           defer to the variant. The new SV.
 *   `"separated"`         rules between rows, on any row-based variant.
 *   `"plain"`             no rules.
 *   absent                never delivered (older placement, preview,
 *                         test) — defer to the variant.
 */
function resolveRowSeparators(
  value: string | undefined,
  variantDefault: boolean,
): boolean {
  if (value === undefined || value === null) return variantDefault;
  const normalized = value.trim().toLowerCase();

  if (normalized === "separated") return true;
  if (normalized === "plain") return false;
  if (normalized === "default") return variantDefault;

  // Legacy checkbox encodings. Empty string is the unchecked box —
  // distinct from absent, which is the distinction that made unchecking
  // a no-op before it was fixed.
  if (!normalized) return false;
  if (["0", "false", "no", "off", "disabled"].includes(normalized))
    return false;
  // Anything else truthy is the checked box: defer to the variant.
  return variantDefault;
}

/**
 * True when a row's href leaves the site — absolute http(s) or
 * protocol-relative, mirroring the Link primitive's `isInternalHref`
 * complement (layout-service internal links arrive path-relative).
 * NavList swaps the trailing chevron for the external-link glyph on
 * these rows.
 */
function isExternalRowHref(value: LinkSource | undefined): boolean {
  const href = value ? getLinkHref(value) : undefined;
  return Boolean(href && (href.startsWith("http") || href.startsWith("//")));
}

/**
 * The list TITLE's colour from `HeadingColor` (heading-color@1),
 * separate from `LinkColorScheme` which recolors the rows. Returns ""
 * for `default`, so `cn("… text-accent …", tone)` keeps each variant's
 * historic heading colour until an author overrides it (twMerge lets
 * the later class win).
 */
function linkListHeadingTone(params: { [key: string]: string }): string {
  return headingColorClass(parseHeadingColor(params.HeadingColor));
}

/**
 * NavList row classes. `separators` keeps the historic hairline-row
 * identity (border-b + text-color hover); without separators the rows
 * take the tinted-hover pill treatment (the utility-card link stack —
 * same bleed-gutter pattern as IconLedRow). `toneClass` recolors the
 * label from `color-scheme@1` (`text-primary` = the classic blue link
 * rows); empty keeps the historic page foreground.
 */
function navListRowClass(opts: {
  separators: boolean;
  sizeBucket: RowSizeBucket;
  toneClass: string;
}): string {
  return cn(
    "group flex w-full items-center justify-between gap-3 transition-colors",
    // NavList is where this scale came from, so it takes the bucket
    // string directly — including at `default`, whose py-3/text-sm IS
    // its historic row. Every other variant goes through
    // `rowSizeRowClass`, which is empty at `default`.
    ROW_SIZE_CLASSES[opts.sizeBucket].row,
    opts.toneClass || "text-foreground",
    opts.separators
      ? "border-border border-b hover:text-accent"
      : "-mx-2 rounded-md px-2 hover:bg-muted",
  );
}

/**
 * Trailing row affordance: the classic chevron for on-site rows, the
 * external-link glyph for rows that leave the site (the utility-card
 * convention — "Find a trusted contractor ↗"). Rides the Link
 * primitive's `after` slot; see the children-drop note at the render
 * site.
 *
 * Colored with `text-current`, NOT a fixed `text-muted-foreground`:
 * the glyph has to follow whatever `LinkColorScheme` put on the row,
 * otherwise a `primary` blue link row keeps a grey arrow. `opacity-70`
 * preserves the quieter-than-label weight the muted token gave it,
 * while still tracking the row tone (and its hover shift).
 */
function navListRowAffordance(value: LinkSource | undefined) {
  if (isExternalRowHref(value)) {
    return (
      <NamedIcon
        name="external-link"
        aria-hidden="true"
        className="size-4 shrink-0 self-center text-current opacity-70"
      />
    );
  }
  return (
    <LibraryIcon
      name="chevron-right"
      aria-hidden="true"
      className="size-4 shrink-0 self-center text-current opacity-70 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
    />
  );
}

/**
 * NavList variant: a vertical list of navigation rows separated by
 * hairline borders, each with the label at the start and a chevron at
 * the END of the row (trailing edge; flips under RTL) — "more for
 * customers" link stacks, in-page section navs, and utility-page link
 * columns. Use instead of `Default` when the source shows
 * arrow-terminated rows rather than plain underlined links. For a card
 * with a heading + chevron rows, compose this inside `card-block@1`
 * Placeholders' `card-body-{*}` slot.
 */
export function NavList({
  params = {},
  fields: rawFields,
  items: rawItems,
  title: rawTitle,
  displayOptions,
  behaviorOptions,
  styleOptions,
}: LinkListBlockProps) {
  const { fields, programmaticItems, programmaticTitle } =
    normalizeLinkListInput({
      fields: rawFields,
      items: rawItems,
      title: rawTitle,
    });
  const { styles, RenderingIdentifier: id } = params;
  const showTitle = displayOptions?.showTitle ?? true;
  const hideWhenEmpty = behaviorOptions?.hideWhenEmpty ?? true;
  const isEditing = resolveEditingMode({ params });
  // `item-style@1`: icon-led rows lead with each entry's IconName +
  // optional Description (IconLedRow), keeping the NavList hairline
  // separators and end-of-row chevron.
  const iconLed = resolveItemStyleParam(params.ItemStyle) === "icon-led";
  // Row chrome axes. NavList is the variant whose OWN default is
  // separated — the historic hairline rows — so `default` and every
  // legacy checked placement land there; `plain` swaps to the
  // tinted-hover pill rows of the utility-card link stack.
  // LinkColorScheme recolors labels (`primary` = classic blue link
  // rows); RowSize buckets the density.
  const rowSeparators = resolveRowSeparators(params.RowSeparators, true);
  const rowToneClass = colorSchemeTextClass(params.LinkColorScheme);
  const sizeBucket = rowSizeBucket(params.RowSize);
  const rowClass = navListRowClass({
    separators: rowSeparators,
    sizeBucket,
    toneClass: rowToneClass,
  });

  const baseClass = cn(
    "component link-list link-list-nav",
    styleOptions?.className,
    styles?.trimEnd(),
  );

  const { title, items: fieldItems } = getTitleAndItemsFromFields(fields ?? {});
  const usingProgrammatic = Boolean(programmaticItems?.length);
  const items: Array<{
    key: string;
    label: string | undefined;
    value: LinkSource | undefined;
    iconName: string | undefined;
    labelSource: TextSource | undefined;
    description: TextSource | undefined;
  }> = usingProgrammatic
    ? (programmaticItems ?? []).map((item, index) => ({
        key: `${item.label}-${index}`,
        label: item.label,
        value: { value: { href: item.href || "#", text: item.label } },
        iconName: item.iconName?.trim().toLowerCase() || undefined,
        labelSource: undefined,
        description: item.description ? { value: item.description } : undefined,
      }))
    : fieldItems.map((item, index) => ({
        key: item.id ?? `${getLinkHref(item.Link) ?? "item"}-${index}`,
        label: getLinkText(item.Link),
        value: item.Link,
        iconName: getItemIconName(item),
        labelSource: item.Title,
        description: item.Description,
      }));

  if (!items.length) {
    if (hideWhenEmpty && !isEditing) return null;
    return (
      <div className={baseClass} id={id}>
        <span className="is-empty-hint text-muted-foreground text-sm">
          Link list
        </span>
      </div>
    );
  }

  const titleText = usingProgrammatic
    ? (displayOptions?.title ?? programmaticTitle)
    : undefined;

  return (
    <nav className={baseClass} id={id} aria-label={titleText || undefined}>
      {showTitle && (titleText || title) ? (
        titleText ? (
          <TypographyH4 className="mb-2 text-lg">{titleText}</TypographyH4>
        ) : (
          <Text
            tag="h3"
            value={title}
            className={cn(
              "mb-2 text-accent text-lg",
              linkListHeadingTone(params),
            )}
          />
        )
      ) : null}
      <ul className="flex flex-col">
        {items.map((item) => (
          <li key={item.key}>
            {/* The chevron rides the Link primitive's `after` slot —
                NOT `children` — because authored link text wins over
                children (`content = text ?? children`), which silently
                dropped a children-borne chevron on every row with a
                text-carrying link value. `after` is the documented
                trailing-adornment seam that survives authored text. */}
            {iconLed ? (
              <IconLedRow
                value={item.value}
                iconName={item.iconName}
                label={item.label}
                labelSource={item.labelSource}
                description={item.description}
                isEditing={isEditing}
                // With separators the row keeps NavList's hairline
                // identity (strip the icon-led hover pill + rounding);
                // without them it keeps IconLedRow's own tinted-hover
                // pill, matching the text rows' treatment.
                // RowSize goes LAST so it wins over the separator
                // treatment's own `py-3` — without that, an icon-led
                // NavList silently ignored the density param whenever
                // separators were on (i.e. by default).
                className={cn(
                  rowSeparators &&
                    "mx-0 rounded-none border-border border-b px-0 py-3 hover:bg-transparent",
                  rowSizeRowClass(sizeBucket),
                )}
                after={navListRowAffordance(item.value)}
              />
            ) : (
              <Link
                value={item.value}
                className={rowClass}
                after={navListRowAffordance(item.value)}
              >
                <span>{item.label}</span>
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

// ─── MultiColumn ────────────────────────────────────────────────────

/** One resolved MultiColumn column: optional heading + link rows. */
interface ResolvedLinkColumn {
  key: string;
  Title?: TextSource;
  items: LinkListItemFields[];
}

/** Responsive grid classes per resolved column count (2-4). */
const MULTI_COLUMN_GRID_CLASS: Record<2 | 3 | 4, string> = {
  2: "grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2",
  3: "grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2 md:grid-cols-3",
  4: "grid grid-cols-2 gap-x-10 gap-y-8 sm:grid-cols-3 md:grid-cols-4",
};

/** Clamp a Columns param / displayOptions value into the 2-4 range. */
function resolveMultiColumnCount(
  paramValue: string | undefined,
  optionValue: 2 | 3 | 4 | undefined,
): 2 | 3 | 4 {
  const parsed = Number.parseInt((paramValue ?? "").trim(), 10);
  const raw = Number.isNaN(parsed) ? (optionValue ?? 3) : parsed;
  if (raw <= 2) return 2;
  if (raw >= 4) return 4;
  return 3;
}

/**
 * Split the `Items` Treelist into resolved columns. Entries that are
 * themselves link lists (`link-list-content@1` refs — they carry
 * their own `Items`) become headed column groups, footer-style;
 * loose `link-list-item@1` entries are collected into one unheaded
 * leading column. When NO group entries exist the caller falls back
 * to distributing the flat items evenly instead.
 */
function resolveMultiColumnGroups(fields: LinkListFields): {
  columns: ResolvedLinkColumn[];
  hasGroups: boolean;
} {
  const entries = (fields?.Items ?? []) as Array<
    LinkedEntry<LinkListItemFields & Partial<LinkListGroupFields>>
  >;
  const groupColumns: ResolvedLinkColumn[] = [];
  const looseItems: LinkListItemFields[] = [];
  for (const [index, entry] of entries.entries()) {
    const hoisted = linkedFields(entry);
    if (!hoisted) continue;
    if (Array.isArray(hoisted.Items)) {
      const links = hoisted.Items.map((item) => {
        const inner = linkedFields(item);
        return inner ? resolveLinkTargetEntry(inner) : inner;
      }).filter((item): item is LinkListItemFields =>
        Boolean(item && getLinkHref(item.Link)),
      );
      const hasHeading = hoisted.Title != null && !isEmptySource(hoisted.Title);
      if (!hasHeading && links.length === 0) continue;
      groupColumns.push({
        key: hoisted.id ?? `group-${index}`,
        Title: hasHeading ? hoisted.Title : undefined,
        items: links,
      });
      continue;
    }
    // Loose (non-group) entries resolve page / link-item sources too.
    const resolved = resolveLinkTargetEntry(hoisted);
    if (getLinkHref(resolved.Link)) looseItems.push(resolved);
  }
  if (groupColumns.length === 0) {
    return { columns: [], hasGroups: false };
  }
  const columns =
    looseItems.length > 0
      ? [{ key: "loose", items: looseItems }, ...groupColumns]
      : groupColumns;
  return { columns, hasGroups: true };
}

/**
 * Chunk flat items into `count` balanced sequential columns (reading
 * order preserved; leading columns absorb the remainder — 6 items
 * over 4 columns yields 2/2/1/1).
 */
function distributeItems(
  items: LinkListItemFields[],
  count: 2 | 3 | 4,
): ResolvedLinkColumn[] {
  const columns: ResolvedLinkColumn[] = [];
  const base = Math.floor(items.length / count);
  let remainder = items.length % count;
  let index = 0;
  for (let column = 0; column < count && index < items.length; column += 1) {
    const size = base + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder -= 1;
    columns.push({
      key: `column-${column}`,
      items: items.slice(index, index + size),
    });
    index += size;
  }
  return columns;
}

/**
 * Resolve the variant's columns from whichever source arrived:
 * programmatic items and flat field items distribute across `count`;
 * nested group entries render one column per group (`usingGroups`
 * tells the grid to size to the rendered columns instead).
 */
function resolveMultiColumnColumns(
  fields: LinkListFields,
  programmaticItems: ProgrammaticLinkItem[] | undefined,
  count: 2 | 3 | 4,
): { columns: ResolvedLinkColumn[]; usingGroups: boolean } {
  if (programmaticItems?.length) {
    const items = programmaticItems.map((item, index) => ({
      id: `item-${index}`,
      Title: item.label,
      Link: { value: { href: item.href || "#", text: item.label } },
      // Carried for the icon-led item style — ignored by text rows.
      IconName: item.iconName,
      Description: item.description
        ? ({ value: item.description } as TextSource)
        : undefined,
    }));
    return { columns: distributeItems(items, count), usingGroups: false };
  }
  const grouped = resolveMultiColumnGroups(fields);
  if (grouped.hasGroups) {
    return { columns: grouped.columns, usingGroups: true };
  }
  const { items: flatItems } = getTitleAndItemsFromFields(fields);
  return {
    columns: flatItems.length > 0 ? distributeItems(flatItems, count) : [],
    usingGroups: false,
  };
}

/**
 * One MultiColumn column: optional heading + quiet link stack. When
 * `itemStyle` is `icon-led` (`item-style@1`), each row renders through
 * the shared `IconLedRow` — leading IconName icon + label + optional
 * Description — the product-matrix treatment (Allstate's headed
 * insurance columns with icon rows).
 */
function MultiColumnColumn({
  column,
  itemStyle = "text",
  isEditing = false,
  bulleted = false,
  sizeBucket = "default",
  separators = false,
}: {
  column: ResolvedLinkColumn;
  itemStyle?: LinkItemStyle;
  isEditing?: boolean;
  /**
   * `ListMarker: bulleted` — render disc markers on this column's link
   * stack. Ignored under the icon-led item style (a leading icon +
   * disc reads as two competing markers).
   */
  bulleted?: boolean;
  /**
   * `RowSize` — density for this column's rows. Icon-led columns are
   * padded rows so it lands on each row; text columns are a gapped
   * stack so it lands on the list.
   */
  sizeBucket?: RowSizeBucket;
  /**
   * `RowSeparators: separated` — hairline rule between this column's
   * rows. The column's own default is plain, so this is opt-in.
   */
  separators?: boolean;
}) {
  const iconLed = itemStyle === "icon-led";
  return (
    <div className="flex min-w-0 flex-col gap-3">
      {column.Title ? (
        <Text
          tag="h3"
          value={column.Title}
          className="font-semibold text-foreground text-sm"
        />
      ) : null}
      <ul
        className={cn(
          bulleted && !iconLed
            ? listClassVerticalBulleted
            : cn("flex flex-col", iconLed ? "gap-0.5" : "gap-2"),
          // Icon-led columns keep their tight `gap-0.5` — the density
          // shows up as row padding below, not as list gap.
          iconLed ? undefined : rowSizeStackClass(sizeBucket, bulleted),
        )}
      >
        {column.items.map((item, index) => (
          <li
            key={item.id ?? `${getLinkHref(item.Link) ?? "item"}-${index}`}
            className={separatedRowClass(separators)}
          >
            {iconLed ? (
              <IconLedRow
                value={item.Link}
                iconName={getItemIconName(item)}
                label={getLinkText(item.Link)}
                labelSource={item.Title}
                description={item.Description}
                isEditing={isEditing}
                className={rowSizeRowClass(sizeBucket)}
              />
            ) : (
              <Link
                value={item.Link}
                className="text-muted-foreground text-sm transition-colors hover:text-foreground"
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * MultiColumn variant: a 2-4 column link panel with optional
 * per-group headings — the footer-style column-group treatment
 * outside the footer (sitemap sections, "explore" panels, directory
 * pages). Two content modes, same `link-list-content@1` datasource:
 *
 *   Grouped  — `Items` entries that are themselves Link Lists
 *              (`link-list-content@1` refs) each render as one headed
 *              column (Title heading + Items links); loose link
 *              entries collect into an unheaded leading column.
 *   Flat     — when no group entries exist, the flat link items are
 *              distributed evenly across the `Columns` param
 *              (2-4, default 3) in reading order.
 *
 * The list's own Title renders above the grid. Use the footer for
 * page chrome; use MultiColumn for an in-page link panel.
 */
export function MultiColumn({
  params = {},
  fields: rawFields,
  items: rawItems,
  title: rawTitle,
  displayOptions,
  behaviorOptions,
  styleOptions,
}: LinkListBlockProps) {
  const { fields, programmaticItems, programmaticTitle } =
    normalizeLinkListInput({
      fields: rawFields,
      items: rawItems,
      title: rawTitle,
    });
  const { styles, RenderingIdentifier: id } = params;
  const showTitle = displayOptions?.showTitle ?? true;
  const hideWhenEmpty = behaviorOptions?.hideWhenEmpty ?? true;
  const isEditing = resolveEditingMode({ params });
  const count = resolveMultiColumnCount(
    params.Columns,
    displayOptions?.columns,
  );
  // `item-style@1`: icon-led rows inside every column — the headed
  // product-matrix read (nested Link Lists as columns + icon rows).
  const itemStyle = resolveItemStyleParam(params.ItemStyle);
  // `list-marker@1`: disc markers on each column's link stack — the
  // Södra-style bulleted footer/body columns. Suppressed under
  // icon-led (leading icon already marks the row).
  const bulleted =
    itemStyle !== "icon-led" &&
    resolveListMarker(params.ListMarker, displayOptions?.listMarker) ===
      "bulleted";

  const baseClass = cn(
    "component link-list link-list-multi-column",
    // `LinkColorScheme` (color-scheme@1) recolors this variant's
    // links. Descendant form, because each variant bakes its own
    // colour into the anchor and a plain text-* on the wrapper
    // would lose to it.
    colorSchemeAnchorTextClass(params.LinkColorScheme),
    styleOptions?.className,
    styles?.trimEnd(),
  );

  const usingProgrammatic = Boolean(programmaticItems?.length);
  const { columns, usingGroups } = resolveMultiColumnColumns(
    fields ?? {},
    programmaticItems,
    count,
  );

  if (columns.length === 0) {
    if (hideWhenEmpty && !isEditing) return null;
    return (
      <div className={baseClass} id={id}>
        <span className="is-empty-hint text-muted-foreground text-sm">
          Link list
        </span>
      </div>
    );
  }

  const titleText = usingProgrammatic
    ? (displayOptions?.title ?? programmaticTitle)
    : undefined;
  const fieldsTitle = fields?.Title;
  // Grouped mode sizes the grid to the rendered columns; flat modes
  // honor the requested count (distribution already matches it).
  const gridCount = usingGroups
    ? (Math.min(Math.max(columns.length, 2), 4) as 2 | 3 | 4)
    : count;

  return (
    <div className={baseClass} id={id}>
      {showTitle && (titleText || fieldsTitle) ? (
        titleText ? (
          <TypographyH4 className="mb-4 text-lg">{titleText}</TypographyH4>
        ) : (
          <Text
            tag="h3"
            value={fieldsTitle}
            className={cn(
              "mb-4 text-accent text-lg",
              linkListHeadingTone(params),
            )}
          />
        )
      ) : null}
      <div className={MULTI_COLUMN_GRID_CLASS[gridCount]}>
        {columns.map((column) => (
          <MultiColumnColumn
            key={column.key}
            column={column}
            itemStyle={itemStyle}
            isEditing={isEditing}
            bulleted={bulleted}
            sizeBucket={rowSizeBucket(params.RowSize)}
            separators={resolveRowSeparators(params.RowSeparators, false)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── InlineSeparated ────────────────────────────────────────────────

type SeparatorGlyph = "none" | "dot" | "pipe" | "slash";

const SEPARATOR_GLYPH_CHAR: Record<Exclude<SeparatorGlyph, "none">, string> = {
  dot: "·",
  pipe: "|",
  slash: "/",
};

/**
 * Parse the `SeparatorGlyph` param / displayOptions value.
 *
 * `fallback` is the caller's own default, because the variants disagree
 * about what "unset" means. InlineSeparated is BUILT around the glyph —
 * a separator row with nothing between the entries is just an inline row
 * — so it falls back to `dot`. Horizontal and UtilityBar have never
 * drawn one, so they fall back to `none` and only render a glyph when an
 * author asks for it. Same reason `row-separators@1` needed a `default`
 * value: one Standard Value, several variants, different right answers.
 */
function resolveSeparatorGlyph(
  paramValue: string | undefined,
  optionValue: SeparatorGlyph | undefined,
  fallback: SeparatorGlyph = "dot",
): SeparatorGlyph {
  const raw = (paramValue ?? optionValue ?? "").trim().toLowerCase();
  if (raw === "pipe" || raw === "slash" || raw === "dot" || raw === "none")
    return raw;
  return fallback;
}

/**
 * The separator node, or null at `none`. Markup is InlineSeparated's
 * historic span verbatim, so routing that variant through here changes
 * nothing and the strips inherit the identical treatment.
 */
function separatorGlyphNode(glyph: SeparatorGlyph) {
  if (glyph === "none") return null;
  return (
    <span
      aria-hidden="true"
      className="mx-2.5 select-none text-muted-foreground/60"
    >
      {SEPARATOR_GLYPH_CHAR[glyph]}
    </span>
  );
}

/**
 * InlineSeparated variant: a single-line inline list with a separator
 * glyph between entries — the legal-links row treatment (Privacy ·
 * Terms · Cookies) and other compact utility rows. The glyph comes
 * from the `SeparatorGlyph` param (`separator-glyph@1`: dot / pipe /
 * slash, default dot) and renders `aria-hidden` between links (never
 * trailing). An optional Title renders as an inline uppercase
 * micro-label at the start. Wraps gracefully on narrow viewports.
 */
export function InlineSeparated({
  params = {},
  fields: rawFields,
  items: rawItems,
  title: rawTitle,
  displayOptions,
  behaviorOptions,
  styleOptions,
}: LinkListBlockProps) {
  const { fields, programmaticItems, programmaticTitle } =
    normalizeLinkListInput({
      fields: rawFields,
      items: rawItems,
      title: rawTitle,
    });
  const { styles, RenderingIdentifier: id } = params;
  const glyph = resolveSeparatorGlyph(
    params.SeparatorGlyph,
    displayOptions?.separatorGlyph,
  );
  const showTitle = displayOptions?.showTitle ?? true;
  const hideWhenEmpty = behaviorOptions?.hideWhenEmpty ?? true;
  const isEditing = resolveEditingMode({ params });

  const baseClass = cn(
    // `items-center` on the inner <nav> only aligns the links against
    // EACH OTHER inside their flex line — it can't move the row within a
    // taller parent, so an inline row dropped into a stretched footer
    // column or grid cell pinned itself to the top. A single-line
    // separator row has no reason to sit high in its container: make the
    // wrapper a full-height flex box so the row centres on the block
    // axis. Collapses to a no-op when the parent is content-height.
    "component link-list link-list-inline-separated flex h-full items-center",
    // `LinkColorScheme` (color-scheme@1) recolors this variant's
    // links. Descendant form, because each variant bakes its own
    // colour into the anchor and a plain text-* on the wrapper
    // would lose to it.
    colorSchemeAnchorTextClass(params.LinkColorScheme),
    styleOptions?.className,
    styles?.trimEnd(),
  );

  const { title, items: fieldItems } = getTitleAndItemsFromFields(fields ?? {});
  const usingProgrammatic = Boolean(programmaticItems?.length);
  const items: Array<{
    key: string;
    value: LinkSource | undefined;
  }> = usingProgrammatic
    ? (programmaticItems ?? []).map((item, index) => ({
        key: `${item.label}-${index}`,
        value: { value: { href: item.href || "#", text: item.label } },
      }))
    : fieldItems.map((item, index) => ({
        key: item.id ?? `${getLinkHref(item.Link) ?? "item"}-${index}`,
        value: item.Link,
      }));

  if (!items.length) {
    if (hideWhenEmpty && !isEditing) return null;
    return (
      <div className={baseClass} id={id}>
        <span className="is-empty-hint text-muted-foreground text-sm">
          Link list
        </span>
      </div>
    );
  }

  const titleText = usingProgrammatic
    ? (displayOptions?.title ?? programmaticTitle)
    : undefined;

  return (
    <div className={baseClass} id={id}>
      <nav
        aria-label={titleText || undefined}
        className="flex flex-wrap items-center gap-y-1 text-sm"
      >
        {showTitle && (titleText || title) ? (
          <span
            className={cn(
              "me-4 font-semibold text-muted-foreground text-xs uppercase tracking-wider",
              linkListHeadingTone(params),
            )}
          >
            {titleText ? titleText : <Text tag="span" value={title} />}
          </span>
        ) : null}
        {items.map((item, index) => (
          <Fragment key={item.key}>
            {index > 0 ? separatorGlyphNode(glyph) : null}
            <Link
              value={item.value}
              className="text-muted-foreground transition-colors hover:text-foreground"
            />
          </Fragment>
        ))}
      </nav>
    </div>
  );
}

// ─── IconLed ────────────────────────────────────────────────────────

/**
 * Normalize an item's IconName field to a key. Delegates to the shared
 * enum-field reader — real tenants deliver the field as a Droplink
 * enumeration-value ITEM envelope, which the old string/`{value}`-only
 * read silently dropped (icon-led rows rendered without icons).
 */
function getItemIconName(item: LinkListItemFields): string | undefined {
  return enumFieldValue(item.IconName);
}

/** One IconLed row: leading icon + label + optional description. */
/**
 * Clone a link source without its authored `text`/`title` so the Link
 * primitive falls back to `children` — IconLed rows render the label
 * inside their own icon+column markup, and authored text winning over
 * `children` would silently drop the icon and description (the same
 * children-drop contract NavList hit; its chevron rides `after`, but a
 * LEADING icon + stacked description need the full custom column).
 * The label itself is not lost: rows render `labelSource`/`label`,
 * which mirror the authored text.
 */
function withoutAuthoredText(
  value: LinkSource | undefined,
): LinkSource | undefined {
  if (value == null || typeof value !== "object") return value;
  const source = value as Record<string, unknown>;
  const out: Record<string, unknown> = { ...source };
  delete out.text;
  delete out.title;
  if (source.value && typeof source.value === "object") {
    const inner: Record<string, unknown> = {
      ...(source.value as Record<string, unknown>),
    };
    delete inner.text;
    delete inner.title;
    out.value = inner;
  }
  return out as LinkSource;
}

function IconLedRow({
  value,
  iconName,
  label,
  labelSource,
  description,
  isEditing,
  className,
  after,
}: {
  value: LinkSource | undefined;
  iconName: string | undefined;
  label: string | undefined;
  labelSource: TextSource | undefined;
  description: TextSource | undefined;
  isEditing: boolean;
  /**
   * Row-chrome override merged after the base classes — lets the
   * `ItemStyle: icon-led` hosts (NavList) restyle the row (hairline
   * separators, no rounding) without duplicating the row markup.
   */
  className?: string;
  /**
   * Optional trailing adornment (NavList's end-of-row chevron). Rides
   * the Link primitive's `after` slot so it survives authored link
   * text; the text column stretches so the adornment lands at the
   * row's trailing edge.
   */
  after?: ReactNode;
}) {
  const hasDescription = description != null && !isEmptySource(description);
  return (
    <Link
      // Editing keeps the authored value intact so Pages' link-field
      // metadata + inline editing behave exactly as before.
      value={isEditing ? value : withoutAuthoredText(value)}
      className={cn(
        "group -mx-2 flex items-start gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-muted",
        className,
      )}
      after={after}
    >
      {/* NamedIcon renders nothing for unknown/empty names — the row
          degrades to label + description, never a broken glyph. */}
      <NamedIcon
        name={iconName}
        className="mt-0.5 size-5 shrink-0 text-primary"
      />
      <span className={cn("flex min-w-0 flex-col", after != null && "flex-1")}>
        <span className="font-medium text-foreground text-sm">
          {labelSource != null && !isEmptySource(labelSource) ? (
            <Text tag="span" value={labelSource} />
          ) : (
            label
          )}
        </span>
        {hasDescription ? (
          <Text
            tag="span"
            value={description}
            className="text-muted-foreground text-sm"
          />
        ) : null}
      </span>
    </Link>
  );
}

/**
 * IconLed variant: vertical rows led by a named vector icon
 * (`icon-name@1` vocabulary) with a label and an optional one-line
 * description — "browse by" panels, service directories, and support
 * hub link stacks. The list-level `Image` field (when set) renders
 * as a panel image above the heading, the same treatment a nav
 * mega-menu column gives it, so brand-led panels keep their visual.
 * Rows with unknown/empty icon names degrade to text-only rows.
 */
export function IconLed({
  params = {},
  fields: rawFields,
  items: rawItems,
  title: rawTitle,
  displayOptions,
  behaviorOptions,
  styleOptions,
}: LinkListBlockProps) {
  const { fields, programmaticItems, programmaticTitle } =
    normalizeLinkListInput({
      fields: rawFields,
      items: rawItems,
      title: rawTitle,
    });
  const { styles, RenderingIdentifier: id } = params;
  const showTitle = displayOptions?.showTitle ?? true;
  const hideWhenEmpty = behaviorOptions?.hideWhenEmpty ?? true;
  const isEditing = resolveEditingMode({ params });
  const sizeBucket = rowSizeBucket(params.RowSize);
  // Own default is plain — these rows never carried rules.
  const rowSeparators = resolveRowSeparators(params.RowSeparators, false);

  const baseClass = cn(
    "component link-list link-list-icon-led",
    // `LinkColorScheme` (color-scheme@1) recolors this variant's
    // links. Descendant form, because each variant bakes its own
    // colour into the anchor and a plain text-* on the wrapper
    // would lose to it.
    colorSchemeAnchorTextClass(params.LinkColorScheme),
    styleOptions?.className,
    styles?.trimEnd(),
  );

  const { title, items: fieldItems } = getTitleAndItemsFromFields(fields ?? {});
  const usingProgrammatic = Boolean(programmaticItems?.length);
  const rows: Array<{
    key: string;
    value: LinkSource | undefined;
    iconName: string | undefined;
    label: string | undefined;
    labelSource: TextSource | undefined;
    description: TextSource | undefined;
  }> = usingProgrammatic
    ? (programmaticItems ?? []).map((item, index) => ({
        key: `${item.label}-${index}`,
        value: { value: { href: item.href || "#", text: item.label } },
        iconName: item.iconName?.trim().toLowerCase() || undefined,
        label: item.label,
        labelSource: undefined,
        description: item.description ? { value: item.description } : undefined,
      }))
    : fieldItems.map((item, index) => ({
        key: item.id ?? `${getLinkHref(item.Link) ?? "item"}-${index}`,
        value: item.Link,
        iconName: getItemIconName(item),
        label: getLinkText(item.Link),
        labelSource: item.Title,
        description: item.Description,
      }));

  if (!rows.length) {
    if (hideWhenEmpty && !isEditing) return null;
    return (
      <div className={baseClass} id={id}>
        <span className="is-empty-hint text-muted-foreground text-sm">
          Link list
        </span>
      </div>
    );
  }

  const titleText = usingProgrammatic
    ? (displayOptions?.title ?? programmaticTitle)
    : undefined;
  const panelImage =
    !usingProgrammatic && fields?.Image != null && !isEmptySource(fields.Image)
      ? fields.Image
      : undefined;

  return (
    <nav className={baseClass} id={id} aria-label={titleText || undefined}>
      {panelImage ? (
        <Image
          value={panelImage}
          className="mb-4 aspect-video w-full rounded-md object-cover"
        />
      ) : null}
      {showTitle && (titleText || title) ? (
        titleText ? (
          <TypographyH4 className="mb-2 text-lg">{titleText}</TypographyH4>
        ) : (
          <Text
            tag="h3"
            value={title}
            className={cn(
              "mb-2 text-accent text-lg",
              linkListHeadingTone(params),
            )}
          />
        )
      ) : null}
      <ul className="flex flex-col gap-0.5">
        {rows.map((row) => (
          <li key={row.key} className={separatedRowClass(rowSeparators)}>
            <IconLedRow
              value={row.value}
              iconName={row.iconName}
              label={row.label}
              labelSource={row.labelSource}
              description={row.description}
              isEditing={isEditing}
              // Icon rows are PADDED rows, so density lands on the row
              // itself rather than on the list gap.
              className={rowSizeRowClass(sizeBucket)}
            />
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * Compact variant: section title + vertical list (each item has Title and optional Link).
 * Use when items have Title (topic-listing style, list not cards).
 */
export function Compact({
  params = {},
  fields: rawFields,
  items: rawItems,
  title: rawTitle,
  displayOptions,
  behaviorOptions,
  styleOptions,
}: LinkListBlockProps) {
  const { fields } = normalizeLinkListInput({
    fields: rawFields,
    items: rawItems,
    title: rawTitle,
  });
  const { styles, RenderingIdentifier: id } = params;
  const title =
    fields?.Title && !isEmptySource(fields.Title) ? fields.Title : undefined;
  const items = getItemsForTopicStyle(fields ?? {});
  const showTitle = displayOptions?.showTitle ?? true;
  const hideWhenEmpty = behaviorOptions?.hideWhenEmpty ?? true;
  const isEditing = resolveEditingMode({ params });
  // `item-style@1`: icon-led swaps each topic row for the shared
  // IconLedRow (leading IconName + optional Description) — the same
  // treatment NavList and MultiColumn give it. Suppresses bullets,
  // since a leading icon and a disc read as two competing markers.
  const iconLed = resolveItemStyleParam(params.ItemStyle) === "icon-led";
  const bulleted =
    !iconLed &&
    resolveListMarker(params.ListMarker, displayOptions?.listMarker) ===
      "bulleted";
  const sizeBucket = rowSizeBucket(params.RowSize);
  // Own default is plain — these rows never carried rules.
  const rowSeparators = resolveRowSeparators(params.RowSeparators, false);
  const rowStackClass = iconLed
    ? undefined
    : rowSizeStackClass(sizeBucket, bulleted);

  if (hideWhenEmpty && !items.length && !isEditing) {
    return null;
  }

  return (
    <section
      className={cn(
        "component link-list topic-listing w-full bg-background text-foreground",
        // `LinkColorScheme` (color-scheme@1) recolors this variant's
        // links. Descendant form, because each variant bakes its own
        // colour into the anchor and a plain text-* on the wrapper
        // would lose to it.
        colorSchemeAnchorTextClass(params.LinkColorScheme),
        styleOptions?.className,
        styles?.trimEnd(),
      )}
      id={id ?? undefined}
      dir="inherit"
      data-slot="link-list"
    >
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mx-auto max-w-4xl">
          {showTitle && title && (
            <TypographyH2
              className={cn(
                "mb-6 font-heading font-semibold text-xl md:text-2xl",
                linkListHeadingTone(params),
              )}
            >
              <Text value={title} tag="span" />
            </TypographyH2>
          )}
          <ul
            className={cn(
              iconLed
                ? "flex flex-col gap-0.5"
                : resolveVerticalListClass(bulleted),
              rowStackClass,
            )}
          >
            {items.length
              ? items.map((item, i) => {
                  const itemTitle = item.Title;
                  if (iconLed) {
                    return (
                      <li
                        key={item.id ?? `item-${i}`}
                        className={separatedRowClass(rowSeparators)}
                      >
                        <IconLedRow
                          value={item.Link}
                          iconName={getItemIconName(item)}
                          label={getLinkText(item.Link)}
                          labelSource={itemTitle}
                          description={item.Description}
                          isEditing={isEditing}
                          className={rowSizeRowClass(sizeBucket)}
                        />
                      </li>
                    );
                  }
                  return (
                    <li
                      key={item.id ?? `item-${i}`}
                      className={separatedRowClass(rowSeparators)}
                    >
                      {item.Link && !isEmptySource(item.Link) ? (
                        <Link
                          value={item.Link}
                          className="text-foreground hover:text-accent hover:underline"
                        />
                      ) : (
                        itemTitle && (
                          <Text
                            value={itemTitle}
                            tag="span"
                            className="text-foreground"
                          />
                        )
                      )}
                    </li>
                  );
                })
              : isEditing && (
                  <li>
                    <span className="is-empty-hint text-muted-foreground text-sm">
                      Link list
                    </span>
                  </li>
                )}
          </ul>
        </div>
      </div>
    </section>
  );
}

/**
 * `universal` opts this file into BOTH the server and client
 * component maps the SDK generates (component-map.ts +
 * component-map.client.ts). Server-only by default would land
 * here in the server map alone, which means Sitecore Pages chrome
 * (browser-side) cannot look the component up and its named-export
 * variants (Headless, Media, etc.) fail to resolve. No runtime
 * behaviour change: the file stays a plain RSC server component
 * (no useState, no client-only hooks here); the universal marker
 * is purely a generate-map signal.
 */
export const componentType = "universal";

interface ChildrenResponse {
  item?: IGQLItem & { children?: { results?: IGQLItem[] } };
}

const labelForChild = (item: IGQLItem | undefined): string => {
  if (!item) return "";
  return item.navigationTitle?.value ?? item.title?.value ?? item.name ?? "";
};

/**
 * Per-component server-side data fetcher. The Sitecore Content SDK's
 * `ComponentPropsService.fetchComponentProps` discovers this export
 * during layout-service resolution and calls it with the rendering,
 * layout data, and Next.js context. The returned data is merged
 * into the rendering's `fields` before render.
 *
 * Reads the `ParentRef` droplink off the rendering's datasource
 * fields, runs CHILDREN_QUERY against Sitecore Edge, and surfaces
 * the walked children as `fields.ParentChildren`. The existing
 * `getTitleAndItemsFromFields` helper already knows to read
 * ParentChildren when curated `Items` is empty.
 *
 * If `ParentRef` is unset OR the Edge contextId env var is missing
 * (no IGQL configured), the fetcher returns `{ fields: {
 * ParentChildren: [] } }` so the component falls through to
 * curated mode.
 */
export async function getComponentServerProps(
  rendering: ComponentRendering,
  _layoutData: LayoutServiceData,
) {
  const fields = (rendering as { fields?: LinkListFields }).fields ?? {};
  const parentRef = fields.ParentRef;
  const parentId =
    typeof parentRef === "string"
      ? parentRef
      : (parentRef?.id ?? parentRef?.value);

  if (!parentId) {
    return { fields: { ParentChildren: [] satisfies LinkListResolvedChild[] } };
  }

  const result = await fetchSitecoreEdge<ChildrenResponse>({
    query: CHILDREN_QUERY,
    variables: { itemId: parentId, language: "en" },
  });

  const walked = (result?.data?.item?.children?.results ?? []).map(
    (item): LinkListResolvedChild => ({
      id: item.id,
      label: labelForChild(item),
      href: item.url?.path,
    }),
  );

  return { fields: { ParentChildren: walked } };
}
