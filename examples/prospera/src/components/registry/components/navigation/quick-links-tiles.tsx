import { iconByName } from "@/components/registry/graphics/icons/named-icon/icon-vocabulary";
import { NamedIcon } from "@/components/registry/graphics/icons/named-icon/named-icon";
import {
  TypographyH2,
  TypographyMuted,
} from "@/components/registry/primitives/core/typography";
import {
  type ImageSource,
  NextImage,
} from "@/components/registry/primitives/editables/image";
import type { LinkSource } from "@/components/registry/primitives/editables/link";
import {
  getLinkHref,
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
  SURFACE_TONE_CLASS,
  type SurfaceTone,
  surfaceToneClass,
} from "@/lib/registry/color-scheme-classes";
import {
  type EnumFieldSource,
  enumFieldValue,
} from "@/lib/registry/enum-field";
import {
  getLinkedItemUrl,
  type LinkedItemUrl,
} from "@/lib/registry/linked-items";
import { hoistLinkedItemFields } from "@/lib/registry/placeholder-children";
import {
  SECTION_PADDING_Y_CLASSES,
  type SectionPaddingY,
} from "@/lib/registry/section-surface";
import type { CmsProps } from "@/lib/registry/sitecore";

/**
 * `quick-links-tiles` — a compact grid or row of task-entry tiles.
 *
 * Each tile pairs an **icon** with a short **label**, an optional
 * one-line **description**, and a **link** — the "pay bill / report
 * outage / start service" task-portal archetype utility, insurance,
 * banking, and government homepages lead with. Tiles are curated via
 * the `Tiles` Treelist from three sources, freely mixed —
 * `quick-link-tile@1` items, PAGES (`page@1`; the tile reads the
 * page's Title / MetaDescription / OgImage and links to the page's
 * URL), and `link-item@1` virtual links (page-aligned fields + an
 * explicit `Url` for external destinations). 3-8 tiles is the sweet
 * spot.
 *
 * Two rendering shapes share one content shape:
 *   - `Default` → responsive grid of upright tiles (icon above label
 *                 + description).
 *   - `Row`     → single horizontal strip of compact pills (icon
 *                 beside label; descriptions omitted), scrollable on
 *                 overflow.
 *
 * Density and width are params, not variants: `TileSize` (size@1,
 * bucketed to compact / default / large) and `MaxWidth` (max-width@1,
 * centered when constrained). `TileSize: sm` + `MaxWidth: standard` +
 * `Columns: 4` is the floating "How can we help you?" utility-card row
 * composed inside a hero Placeholders photo band.
 */

export interface QuickLinkTile {
  id?: string;
  /**
   * Named vector icon from the curated icon-name vocabulary
   * (`icon-name@1`, e.g. "bill", "outage", "sign-in"). Preferred over
   * `icon` — crisp at any size and theme-colored. Wins when both are
   * set; unknown/empty names fall back to `icon`.
   */
  iconName?: string;
  /** Image icon / pictogram fallback, used when `iconName` doesn't resolve. */
  icon?: ImageSource;
  /** Short task label ("Pay my bill"). */
  label?: TextSource;
  /** Optional one-line supporting description (Default variant only). */
  description?: TextSource;
  /** Destination the whole tile links to. */
  link?: LinkSource;
}

/**
 * One RAW `Tiles` treelist entry, in any of the shapes the layout
 * service (or an installed starter's regenerated component map) can
 * deliver. Every variant normalizes entries through
 * {@link normalizeQuickLinkTiles} before rendering, so a placement
 * renders identically from:
 *
 *   - the adapted lowercase {@link QuickLinkTile} contract,
 *   - the raw nested Treelist envelope `{id, fields: {…}}` (installed
 *     starters whose regenerated map lacks both the sibling adapter
 *     and `flattenLinkedItems` — see `hoistLinkedItemFields`),
 *   - the hoisted PascalCase shape (post-`flattenLinkedItems`, or a
 *     composed design that inlined the fields verbatim),
 *   - a `quick-link-tile@1` item (IconName / Label / Description /
 *     Link),
 *   - a `link-item@1` virtual link (Title / Description / Thumbnail /
 *     IconName / Url — external URLs welcome),
 *   - a PAGE item (`page@1` fields + the layout-service linked-item
 *     `url` the tile links to).
 */
export interface QuickLinkTileEntry extends QuickLinkTile {
  /** Item name from the linked-item envelope — last-resort label. */
  name?: string;
  /** Linked PAGE item's URL (string path or `{path, href}`). */
  url?: LinkedItemUrl;
  /** Nested Treelist envelope — hoisted before field resolution. */
  fields?: Record<string, unknown>;
  // quick-link-tile@1 field names.
  /**
   * Enum-shaped field — arrives as a plain string, `{value}`, or the
   * Droplink enumeration-value ITEM envelope (real tenants; see
   * `enumFieldValue`).
   */
  IconName?: EnumFieldSource;
  Label?: TextSource;
  Description?: TextSource;
  Link?: LinkSource;
  // link-item@1 field names (Description/IconName shared with above).
  Title?: TextSource;
  Thumbnail?: ImageSource;
  Url?: LinkSource;
  // page@1 field names (subset a tile can render).
  NavigationTitle?: TextSource;
  MetaDescription?: TextSource;
  OgDescription?: TextSource;
  OgImage?: ImageSource;
}

/**
 * Normalize an `icon-name@1` value to a key. Delegates to the shared
 * enum-field reader: real tenants deliver the field as a Droplink
 * enumeration-value ITEM envelope, not a string — reading only
 * string/`{value}` is why installed tiles rendered without icons while
 * showcase previews (plain strings) looked fine.
 */
function normalizeTileIconName(
  raw: QuickLinkTileEntry["IconName"] | undefined,
): string | undefined {
  return enumFieldValue(raw);
}

/** A link source only when it exists and carries an href. */
function nonEmptyLink(link: LinkSource | undefined): LinkSource | undefined {
  return link != null && !isEmptySource(link) ? link : undefined;
}

/**
 * Resolve one hoisted treelist entry into the tile contract. Field
 * precedence per slot (first non-empty wins):
 *
 *   label        lowercase contract → Label (tile) → NavigationTitle →
 *                Title (link-item / page) → item name
 *   description  contract → Description → MetaDescription → OgDescription
 *   icon image   contract → Thumbnail → OgImage
 *   icon name    contract → IconName
 *   link         contract → Link (tile) → Url (link-item) → the page
 *                item's own url (synthesized link)
 */
function resolveTileEntry(entry: QuickLinkTileEntry): QuickLinkTile {
  const label =
    getNonEmptySource(entry.label) ??
    getNonEmptySource(entry.Label) ??
    getNonEmptySource(entry.NavigationTitle) ??
    getNonEmptySource(entry.Title) ??
    entry.name;
  const pageHref = getLinkedItemUrl(entry.url);
  const link =
    nonEmptyLink(entry.link) ??
    nonEmptyLink(entry.Link) ??
    nonEmptyLink(entry.Url) ??
    (pageHref
      ? { value: { href: pageHref, text: getSourceText(label) ?? pageHref } }
      : undefined);
  return {
    id: entry.id,
    iconName: normalizeTileIconName(entry.iconName ?? entry.IconName),
    icon:
      getNonEmptySource(entry.icon) ??
      getNonEmptySource(entry.Thumbnail) ??
      getNonEmptySource(entry.OgImage),
    label,
    description:
      getNonEmptySource(entry.description) ??
      getNonEmptySource(entry.Description) ??
      getNonEmptySource(entry.MetaDescription) ??
      getNonEmptySource(entry.OgDescription),
    link,
  };
}

/**
 * Normalize the `Tiles` prop into the tile contract, whatever shape
 * arrived (see {@link QuickLinkTileEntry}). Nested `{id, fields}`
 * envelopes are hoisted first, then each entry resolves through the
 * per-slot precedence in {@link resolveTileEntry}. Exported for the
 * `.sitecore.ts` adapter and the showcase preview.
 */
export function normalizeQuickLinkTiles(
  tiles: readonly QuickLinkTileEntry[] | undefined,
): QuickLinkTile[] {
  return hoistLinkedItemFields<QuickLinkTileEntry>(tiles).map(resolveTileEntry);
}

export interface QuickLinksTilesProps extends CmsProps {
  title?: TextSource;
  /** Supporting copy under the title. */
  lead?: TextSource;
  /**
   * Tile entries in ANY arrival shape — every variant normalizes via
   * {@link normalizeQuickLinkTiles} before rendering.
   */
  tiles?: QuickLinkTileEntry[];
  /** Columns at the lg breakpoint (Default/grid variant only). */
  columns?: 3 | 4;
  /**
   * Tile shape (`tile-aspect@1`, Default/grid variant only). `auto`
   * (default) keeps content-height tiles; `square` / `landscape` /
   * `portrait` give every tile the aspect box with centered content —
   * bind from the measured grid signature's tileAspect.
   */
  tileAspect?: QuickLinkTileAspect;
  /** Gap between tiles (`gap@1`, Default/grid variant only). */
  gap?: QuickLinkGridGap;
  /**
   * Tile density (`size@1`, both variants). Bucketed: `xs`/`sm` →
   * compact (small icon + label only — the over-photo floating-card
   * treatment; descriptions are dropped), `default`/`md` → the natural
   * tile, `lg`/`xl` → roomier tiles for sparse task portals. Compact
   * tiles swap the fixed `shadow-sm` for the theme's `--card-shadow`
   * token so branded themes control the floating-card elevation.
   */
  tileSize?: QuickLinkTileSize;
  /**
   * Semantic width cap for the tiles block (`max-width@1`, both
   * variants). `default` spans the container; `narrow` / `standard` /
   * `wide` center a constrained block — pair with a 4-tile compact
   * grid for the centered floating row over a hero photo.
   */
  maxWidth?: QuickLinkMaxWidth;
  /**
   * `color-scheme@1` tone. Grid/Row paint it on the TILE CARDS — the
   * section stays transparent so composed placements float over hero
   * photo bands instead of slabbing a background over them. CtaBand
   * keeps painting the SECTION (the saturated band IS that variant's
   * signature). A future second scheme param may split section vs tile
   * control explicitly.
   */
  surfaceTone?: SurfaceTone;
  /** Vertical padding around the section (`padding-y@1`). */
  paddingY?: SectionPaddingY;
  className?: string;
}

/**
 * `tile-aspect@1` → tile shape. Literal classes only (Tailwind JIT).
 * A concrete aspect also centers the tile content — the classic
 * square task-portal tile reads icon-over-label, centered.
 */
const TILE_ASPECT_CLASSES = {
  auto: "",
  square: "aspect-square items-center justify-center text-center",
  landscape: "aspect-video items-center justify-center text-center",
  portrait: "aspect-[3/4] items-center justify-center text-center",
} as const;

export type QuickLinkTileAspect = keyof typeof TILE_ASPECT_CLASSES;

/** All legal `tile-aspect@1` values, for adapter `oneOf` parsing. */
export const QUICK_LINK_TILE_ASPECT_VALUES = Object.keys(
  TILE_ASPECT_CLASSES,
) as readonly QuickLinkTileAspect[];

/**
 * Full `gap@1` vocabulary scaled to the quick-links grid (natural
 * spacing `gap-4`), including the measured-bucket aliases
 * tight/normal/loose. Literal classes only (Tailwind JIT).
 */
const TILE_GAP_CLASSES = {
  none: "gap-0",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
  tight: "gap-2",
  normal: "gap-4",
  loose: "gap-6",
} as const;

export type QuickLinkGridGap = keyof typeof TILE_GAP_CLASSES;

/** All legal `gap@1` values, for adapter `oneOf` parsing. */
export const QUICK_LINK_GRID_GAP_VALUES = Object.keys(
  TILE_GAP_CLASSES,
) as readonly QuickLinkGridGap[];

/**
 * `size@1` → tile density bucket. The shared six-step scale collapses
 * to three tile treatments (same bucketing convention as Hero's
 * TitleSize): xs/sm → compact, default/md → the natural tile,
 * lg/xl → large.
 */
const TILE_SIZE_BUCKETS = {
  default: "default",
  xs: "compact",
  sm: "compact",
  md: "default",
  lg: "large",
  xl: "large",
} as const;

export type QuickLinkTileSize = keyof typeof TILE_SIZE_BUCKETS;
type TileSizeBucket = (typeof TILE_SIZE_BUCKETS)[QuickLinkTileSize];

/** All legal `size@1` values, for adapter `oneOf` parsing. */
export const QUICK_LINK_TILE_SIZE_VALUES = Object.keys(
  TILE_SIZE_BUCKETS,
) as readonly QuickLinkTileSize[];

/**
 * `max-width@1` → pixel width caps (mirrors container / column-splitter;
 * Tailwind v4 dropped `max-w-screen-*`). `full` (the recipe default)
 * leaves the block spanning its container.
 */
const MAX_WIDTH_CLASSES = {
  narrow: "max-w-[640px]",
  standard: "max-w-[896px]",
  wide: "max-w-[1280px]",
  full: "",
} as const;

export type QuickLinkMaxWidth = keyof typeof MAX_WIDTH_CLASSES;

/** All legal `max-width@1` values, for adapter `oneOf` parsing. */
export const QUICK_LINK_MAX_WIDTH_VALUES = Object.keys(
  MAX_WIDTH_CLASSES,
) as readonly QuickLinkMaxWidth[];

/**
 * Per-bucket treatment for the upright grid tile and its icon.
 * Literal classes only (Tailwind JIT). `compact` swaps the fixed
 * `shadow-sm` for the theme's `--card-shadow` token (the card
 * primitive's `theme` shadow convention) so the floating over-photo
 * card picks up branded elevation, and drops descriptions — compact
 * tiles are icon + label only.
 */
const GRID_TILE_SIZE_CLASSES: Record<
  TileSizeBucket,
  { shell: string; iconPx: number; iconClass: string; label: string }
> = {
  compact: {
    shell: "gap-2 p-4 shadow-[var(--card-shadow,none)]",
    iconPx: 24,
    iconClass: "size-6",
    label: "font-semibold text-sm",
  },
  default: {
    shell: "gap-3 p-5 shadow-sm",
    iconPx: 40,
    iconClass: "size-10",
    label: "font-semibold text-base",
  },
  large: {
    shell: "gap-4 p-6 shadow-sm",
    iconPx: 48,
    iconClass: "size-12",
    label: "font-semibold text-lg",
  },
};

/**
 * Gap between tiles for the horizontal Row pill strip.
 *
 * Separate from `TILE_GAP_CLASSES` because Row's historic gap is
 * `gap-3`, which the grid scale doesn't contain (it steps 2 → 4). `md`
 * therefore maps to `gap-3` here, keeping every existing Row placement
 * exactly where it was while the rest of the scale stays ordered around
 * it. CtaBand needs no such map: its hardcoded `gap-4` already IS the
 * grid scale's `md`.
 */
const ROW_TILE_GAP_CLASSES: Record<keyof typeof TILE_GAP_CLASSES, string> = {
  none: "gap-0",
  sm: "gap-2",
  md: "gap-3",
  lg: "gap-5",
  xl: "gap-7",
  tight: "gap-2",
  normal: "gap-3",
  loose: "gap-5",
};

/**
 * Per-bucket treatment for the CtaBand's outline panel.
 *
 * `default` reproduces the panel's historic hardcoded metrics
 * (`min-w-44 gap-3 px-8 py-6`, 40px icon, `text-lg` label) exactly, so
 * every existing band placement renders unchanged — the axis only moves
 * a band an author explicitly resizes.
 */
const BAND_TILE_SIZE_CLASSES: Record<
  TileSizeBucket,
  { shell: string; iconPx: number; iconClass: string; label: string }
> = {
  compact: {
    shell: "min-w-36 gap-2 px-5 py-4",
    iconPx: 28,
    iconClass: "size-7",
    label: "text-base",
  },
  default: {
    shell: "min-w-44 gap-3 px-8 py-6",
    iconPx: 40,
    iconClass: "size-10",
    label: "text-lg",
  },
  large: {
    shell: "min-w-56 gap-4 px-10 py-8",
    iconPx: 48,
    iconClass: "size-12",
    label: "text-xl",
  },
};

/** Per-bucket treatment for the horizontal Row pill and its icon. */
const ROW_TILE_SIZE_CLASSES: Record<
  TileSizeBucket,
  { shell: string; iconPx: number; iconClass: string; label: string }
> = {
  compact: {
    shell: "gap-2 px-3 py-2 shadow-[var(--card-shadow,none)]",
    iconPx: 20,
    iconClass: "size-5",
    label: "font-medium text-xs",
  },
  default: {
    shell: "gap-3 px-4 py-3 shadow-sm",
    iconPx: 24,
    iconClass: "size-6",
    label: "font-medium text-sm",
  },
  large: {
    shell: "gap-3 px-5 py-4 shadow-sm",
    iconPx: 32,
    iconClass: "size-8",
    label: "font-medium text-base",
  },
};

/**
 * Tile-card surface for a `color-scheme@1` pick (Grid/Row). `none` keeps
 * the theme's card tokens — the historical tile. A concrete tone reuses
 * the shared SURFACE_TONE_CLASS string so the solid tones' surface-invert
 * remap keeps interior text (descriptions, muted copy) legible on the
 * tinted card.
 */
const tileToneClasses = (tone: SurfaceTone | undefined): string =>
  !tone || tone === "none"
    ? "border-border bg-card text-card-foreground"
    : cn("border-transparent", SURFACE_TONE_CLASS[tone]);

/** Icon color on a toned tile: ride the tile's own foreground. */
const tileIconToneClass = (
  tone: SurfaceTone | undefined,
): string | undefined =>
  !tone || tone === "none" ? undefined : "text-current";

function TileIcon({
  iconName,
  icon,
  sizePx,
  sizeClass,
  iconToneClass = "text-primary",
  isEditing,
}: {
  iconName?: string;
  icon?: ImageSource;
  sizePx: number;
  sizeClass: string;
  /**
   * Color class for named vector icons. The card tiles keep the brand
   * `text-primary`; the CtaBand tiles pass `text-current` so the icon
   * reads on whatever saturated band surface the author picked.
   */
  iconToneClass?: string;
  isEditing?: boolean;
}) {
  // Named vector icon wins when it resolves; unknown/empty names fall
  // back to the image icon so scraped-content tiles keep rendering.
  if (iconName && iconByName(iconName)) {
    return (
      <NamedIcon
        name={iconName}
        size={sizePx}
        className={cn("shrink-0", iconToneClass, sizeClass)}
      />
    );
  }
  if (!icon || isEmptySource(icon)) return null;
  return (
    <NextImage
      value={icon}
      width={sizePx}
      height={sizePx}
      className={cn("shrink-0 rounded-md object-contain", sizeClass)}
      isEditing={isEditing}
    />
  );
}

/**
 * Wraps tile content in an anchor when the tile links somewhere.
 * Editing mode keeps a plain div so authors get a stable inline-edit
 * target (same policy as versus-list's Ticker entries).
 */
function TileShell({
  link,
  className,
  isEditing,
  children,
}: {
  link?: LinkSource;
  className?: string;
  isEditing?: boolean;
  children: React.ReactNode;
}) {
  const hasLink = link != null && !isEmptySource(link);
  const href = hasLink ? getLinkHref(link) : undefined;
  if (href && !isEditing) {
    return (
      <a href={href} className={className} data-slot="quick-link-tile">
        {children}
      </a>
    );
  }
  return (
    <div className={className} data-slot="quick-link-tile">
      {children}
    </div>
  );
}

function GridTile({
  tile,
  tileAspect = "auto",
  sizeBucket = "default",
  surfaceTone,
  isEditing,
}: {
  tile: QuickLinkTile;
  tileAspect?: QuickLinkTileAspect;
  sizeBucket?: TileSizeBucket;
  surfaceTone?: SurfaceTone;
  isEditing?: boolean;
}) {
  const size = GRID_TILE_SIZE_CLASSES[sizeBucket];
  // Compact tiles are icon + label only — the description is dropped
  // so the over-photo floating card stays a small square-ish target.
  const hasDescription =
    sizeBucket !== "compact" &&
    tile.description &&
    getSourceText(tile.description);
  return (
    <TileShell
      link={tile.link}
      isEditing={isEditing}
      className={cn(
        "flex flex-col items-start rounded-(--card-radius,var(--radius-xl)) border transition hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        tileToneClasses(surfaceTone),
        size.shell,
        TILE_ASPECT_CLASSES[tileAspect] || undefined,
      )}
    >
      <TileIcon
        iconName={tile.iconName}
        icon={tile.icon}
        sizePx={size.iconPx}
        sizeClass={size.iconClass}
        iconToneClass={tileIconToneClass(surfaceTone)}
        isEditing={isEditing}
      />
      <span className={size.label}>
        <Text
          value={tile.label}
          tag="span"
          isEditing={isEditing}
          placeholder="Label"
        />
      </span>
      {hasDescription ? (
        <span className="text-muted-foreground text-sm">
          <Text value={tile.description} tag="span" isEditing={isEditing} />
        </span>
      ) : null}
    </TileShell>
  );
}

function RowTile({
  tile,
  sizeBucket = "default",
  surfaceTone,
  isEditing,
}: {
  tile: QuickLinkTile;
  sizeBucket?: TileSizeBucket;
  surfaceTone?: SurfaceTone;
  isEditing?: boolean;
}) {
  const size = ROW_TILE_SIZE_CLASSES[sizeBucket];
  return (
    <TileShell
      link={tile.link}
      isEditing={isEditing}
      className={cn(
        "flex shrink-0 items-center whitespace-nowrap rounded-(--card-radius,var(--radius-xl)) border transition hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        tileToneClasses(surfaceTone),
        size.shell,
      )}
    >
      <TileIcon
        iconName={tile.iconName}
        icon={tile.icon}
        sizePx={size.iconPx}
        sizeClass={size.iconClass}
        iconToneClass={tileIconToneClass(surfaceTone)}
        isEditing={isEditing}
      />
      <span className={size.label}>
        <Text
          value={tile.label}
          tag="span"
          isEditing={isEditing}
          placeholder="Label"
        />
      </span>
    </TileShell>
  );
}

function QuickLinksSection({
  title,
  lead,
  surfaceTone = "none",
  paddingY = "auto",
  maxWidth = "full",
  id,
  styles,
  className,
  isEditing,
  layout,
  children,
}: Pick<
  QuickLinksTilesProps,
  | "title"
  | "lead"
  | "surfaceTone"
  | "paddingY"
  | "maxWidth"
  | "id"
  | "styles"
  | "className"
> & {
  isEditing?: boolean;
  layout: "grid" | "row" | "band";
  children: React.ReactNode;
}) {
  const hasHeading =
    (title && getSourceText(title)) || (lead && getSourceText(lead));
  const maxWidthClass = MAX_WIDTH_CLASSES[maxWidth ?? "default"] || "";
  const inner = (
    <>
      {hasHeading ? (
        <div
          className={cn(
            "flex flex-col gap-2",
            // The band composition centers its heading over the
            // centered tile row; grid/row keep the start-aligned
            // editorial heading.
            layout === "band" && "items-center text-center",
          )}
        >
          {title && getSourceText(title) ? (
            <TypographyH2 className="font-heading tracking-tight">
              <Text value={title} tag="span" isEditing={isEditing} />
            </TypographyH2>
          ) : null}
          {lead && getSourceText(lead) ? (
            <TypographyMuted className="max-w-2xl text-pretty text-lg">
              <Text value={lead} tag="span" isEditing={isEditing} />
            </TypographyMuted>
          ) : null}
        </div>
      ) : null}
      {children}
    </>
  );
  return (
    <section
      className={cn(
        "component quick-links-tiles w-full",
        // `auto` (recipe default) → the section's natural responsive
        // ramp; a concrete token takes over.
        paddingY === "auto"
          ? "py-10 md:py-14"
          : SECTION_PADDING_Y_CLASSES[paddingY],
        // Only the CtaBand paints the section surface (the saturated
        // band is that variant's whole point). Grid/Row sections stay
        // TRANSPARENT — their tone paints the tile cards instead — so
        // a tile row composed into a hero photo band floats over the
        // photo instead of slabbing `bg-background` across it.
        layout === "band" && surfaceToneClass(surfaceTone),
        className,
        styles?.trimEnd(),
      )}
      id={id ?? undefined}
      data-slot="quick-links-tiles"
      data-layout={layout}
    >
      <div className="container mx-auto flex flex-col gap-8 px-4">
        {/* Constrained-width block is centered; `default`/`full` keep the
            historical DOM (no extra wrapper) so existing pages are
            byte-identical. */}
        {maxWidthClass ? (
          <div
            className={cn("mx-auto flex w-full flex-col gap-8", maxWidthClass)}
          >
            {inner}
          </div>
        ) : (
          inner
        )}
      </div>
    </section>
  );
}

const GRID_COLUMNS_CLASS: Record<3 | 4, string> = {
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
};

/** Responsive grid of upright tiles — icon above label + description. */
export function Default({
  title,
  lead,
  tiles = [],
  columns = 4,
  tileAspect = "auto",
  gap = "md",
  tileSize = "default",
  maxWidth = "full",
  surfaceTone,
  paddingY,
  className,
  id,
  styles,
  isEditing,
}: QuickLinksTilesProps) {
  const sizeBucket = TILE_SIZE_BUCKETS[tileSize] ?? "default";
  const resolvedTiles = normalizeQuickLinkTiles(tiles);
  return (
    <QuickLinksSection
      title={title}
      lead={lead}
      surfaceTone={surfaceTone}
      paddingY={paddingY}
      maxWidth={maxWidth}
      id={id}
      styles={styles}
      className={className}
      isEditing={isEditing}
      layout="grid"
    >
      <div
        className={cn(
          "grid grid-cols-2 md:grid-cols-3",
          TILE_GAP_CLASSES[gap],
          GRID_COLUMNS_CLASS[columns],
        )}
      >
        {resolvedTiles.map((tile, i) => (
          <GridTile
            key={tile.id ?? `tile-${i}`}
            tile={tile}
            tileAspect={tileAspect}
            sizeBucket={sizeBucket}
            surfaceTone={surfaceTone}
            isEditing={isEditing}
          />
        ))}
      </div>
    </QuickLinksSection>
  );
}

/** Single horizontal strip of compact pills, scrollable on overflow. */
export function Row({
  title,
  lead,
  tiles = [],
  tileSize = "default",
  gap = "md",
  maxWidth = "full",
  surfaceTone,
  paddingY,
  className,
  id,
  styles,
  isEditing,
}: QuickLinksTilesProps) {
  const sizeBucket = TILE_SIZE_BUCKETS[tileSize] ?? "default";
  const resolvedTiles = normalizeQuickLinkTiles(tiles);
  return (
    <QuickLinksSection
      title={title}
      lead={lead}
      surfaceTone={surfaceTone}
      paddingY={paddingY}
      maxWidth={maxWidth}
      id={id}
      styles={styles}
      className={className}
      isEditing={isEditing}
      layout="row"
    >
      <div
        className={cn("flex overflow-x-auto pb-1", ROW_TILE_GAP_CLASSES[gap])}
      >
        {resolvedTiles.map((tile, i) => (
          <RowTile
            key={tile.id ?? `tile-${i}`}
            tile={tile}
            sizeBucket={sizeBucket}
            surfaceTone={surfaceTone}
            isEditing={isEditing}
          />
        ))}
      </div>
    </QuickLinksSection>
  );
}

/** Large translucent-outline CTA panel for the band composition. */
function BandTile({
  tile,
  isEditing,
  sizeBucket = "default",
}: {
  tile: QuickLinkTile;
  isEditing?: boolean;
  sizeBucket?: TileSizeBucket;
}) {
  const size = BAND_TILE_SIZE_CLASSES[sizeBucket];
  return (
    <TileShell
      link={tile.link}
      isEditing={isEditing}
      className={cn(
        "flex flex-col items-center rounded-(--card-radius,var(--radius-xl)) border-2 border-current/25 text-center transition hover:bg-current/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current/40",
        size.shell,
      )}
    >
      <TileIcon
        iconName={tile.iconName}
        icon={tile.icon}
        sizePx={size.iconPx}
        sizeClass={size.iconClass}
        iconToneClass="text-current"
        isEditing={isEditing}
      />
      <span className={cn("font-heading font-semibold", size.label)}>
        <Text
          value={tile.label}
          tag="span"
          isEditing={isEditing}
          placeholder="Label"
        />
      </span>
    </TileShell>
  );
}

/**
 * CtaBand — the purchase-locator / conversion band (Guinness "Pick up
 * a bottle", Ketel One "Where to buy"): centered heading over a
 * centered row of 2–4 large outline CTA panels (Find in store / Shop
 * online / Shop merch). Panels draw in the current foreground color so
 * the band works on any `SurfaceTone` — pick a saturated tone for the
 * signature look. Tile descriptions are ignored (big targets, short
 * labels).
 */
export function CtaBand({
  title,
  lead,
  tiles = [],
  maxWidth = "full",
  surfaceTone,
  paddingY,
  tileSize = "default",
  gap = "md",
  className,
  id,
  styles,
  isEditing,
}: QuickLinksTilesProps) {
  const resolvedTiles = normalizeQuickLinkTiles(tiles);
  const sizeBucket = TILE_SIZE_BUCKETS[tileSize] ?? "default";
  return (
    <QuickLinksSection
      title={title}
      lead={lead}
      surfaceTone={surfaceTone}
      paddingY={paddingY}
      maxWidth={maxWidth}
      id={id}
      styles={styles}
      className={className}
      isEditing={isEditing}
      layout="band"
    >
      <div
        className={cn("flex flex-wrap justify-center", TILE_GAP_CLASSES[gap])}
      >
        {resolvedTiles.map((tile, i) => (
          <BandTile
            key={tile.id ?? `tile-${i}`}
            tile={tile}
            isEditing={isEditing}
            sizeBucket={sizeBucket}
          />
        ))}
      </div>
    </QuickLinksSection>
  );
}

/**
 * `universal` opts this file into BOTH the server and client component
 * maps the SDK generates, so Sitecore Pages chrome (browser-side) can
 * resolve the named-export variants. Purely a generate-map signal.
 */
export const componentType = "universal";
