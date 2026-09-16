"use client";

import { type ReactNode, useMemo, useState } from "react";
import {
  CtaGroup,
  EmptyHint,
  ItemListing,
  ListingFallback,
  ListingSection,
  MediaItemFigure,
  type ResultControlsProps,
  SectionHeading,
} from "@/components/registry/blocks";
import {
  MediaLightbox,
  type MediaLightboxItem,
} from "@/components/registry/blocks/media-lightbox";
import type { ImageSource } from "@/components/registry/primitives/editables/image";
import type { LinkSource } from "@/components/registry/primitives/editables/link";
import type { TextSource } from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import {
  type CaptionStyleValue,
  parseCaptionStyle,
} from "@/lib/registry/param-parsers";
import type { FlatItem, SearchConfig } from "@/lib/registry/search/types";
import { useResolvedListItems } from "@/lib/registry/search/use-resolved-list-items";
import type { SectionSurfaceProps } from "@/lib/registry/section-surface";
import { useSitecore } from "@/lib/registry/sitecore";
import {
  parseHeadingLayout,
  parseHeadingSize,
} from "../layout/section-wrapper";
import { MediaGalleryTileProvider, useMediaGalleryTilePresentation } from "./media-gallery-context";

/**
 * `MediaWall` — Sitecore-aware edge-to-edge photo-wall rendering for the
 * media family. Three variants:
 *
 *   - `Mosaic`  — a dense, tight span grid (2×2 heroes, tall + wide tiles
 *                 among 1×1 fillers) on fixed-height cells. CaptionStyle
 *                 is honored: overlay/none fill the cell; below/card keep
 *                 the photo in the remaining space and sit the caption
 *                 under it inside the cell.
 *   - `Collage` — a looser CSS-masonry wall with rotating aspect ratios
 *                 and a gentle scatter; captions can render below/overlay/
 *                 card since the columns flow by content height.
 *   - `Arc`     — a photo arch: 3–8 tiles fanned along a semicircular
 *                 arc around an (optionally) centered heading stack.
 *                 Tiles are ambient decoration (aria-hidden, no captions,
 *                 no lightbox); positions/tilt/scale come from a pure
 *                 parametric function of (index, count).
 *
 * Split out of `media-gallery-list-grid@1` so the wall layouts don't
 * inherit grid params (per-breakpoint columns, card styling) that never
 * applied to them. The shared `Columns` param IS honored by Mosaic and
 * Collage — Mosaic maps it to the desktop grid track count, Collage to
 * its CSS column count. Arc ignores it (the fan is parametric).
 *
 * Flat props throughout — the Sitecore adapter unwraps fields/params in
 * `media-wall.sitecore.ts`.
 */

export interface MediaWallExtras {
  image?: ImageSource;
  videoUrl?: string;
  thumbnailUrl?: string;
  caption?: TextSource;
  altText?: string;
  /** Social author handle for the lightbox detail panel (UGC walls). */
  authorHandle?: string;
  /** Permalink of the original post — drives the lightbox platform icon / embed. */
  postUrl?: string;
  /** Pre-formatted display date for the lightbox detail panel. */
  postDate?: string;
}

export type MediaWallItem = FlatItem<MediaWallExtras>;

// Full `gap@1` vocabulary (the same enum backs every Gap param).
// `default` = the wall's natural md spacing.
type WallGap = "none" | "sm" | "md" | "lg" | "xl";

export interface MediaWallProps extends SectionSurfaceProps {
  /** Heading content. */
  title?: TextSource;
  lead?: TextSource;
  /** Optional kicker line above the title (small-caps eyebrow). */
  eyebrow?: TextSource;
  /**
   * Optional heading CTA (general link). Rendered as a pill under the
   * heading stack on every variant (Arc's center well included).
   */
  cta?: LinkSource;
  headingLayout?: string;
  headingSize?: string;
  /** `band-heading-placement@1`: `above` (default) or `inline`. */
  headingPlacement?: string;

  /**
   * `ContentPlacement` param (`band-content-placement@1`) — Arc only.
   * `center` moves the heading + CTA into the well inside the photo
   * arch. `above` (default) keeps the family's HeadingLayout above the
   * fan. Mosaic/Collage ignore this; HeadingLayout owns their alignment.
   */
  contentPlacement?: string;
  /**
   * `ArcSpread` param (`arc-spread@1`) — Arc only. How far around the
   * fan wraps: `wide` (~180°, default) or `tight` (~120°).
   */
  arcSpread?: string;

  /** Curated/search items. */
  items?: MediaWallItem[];
  /**
   * `SearchConfig` datasource field — when populated and this
   * rendering is NOT inside a search experience, it fetches its own
   * results and they replace the curated `items`.
   */
  searchConfig?: SearchConfig;

  /** Composed-mode placeholder children. Sitecore SDK injects these. */
  children?: ReactNode;
  /** Sitecore rendering descriptor — opaque, passed to <Placeholder>. */
  rendering?: unknown;

  /**
   * Wall column count (2–6). Mosaic uses it for the desktop grid track
   * count; Collage for its CSS masonry column count. Both keep 2 columns
   * on mobile.
   */
  columns?: number;
  /** Gap between tiles. */
  gap?: WallGap;
  /** How each media caption renders (`caption-style@1`). */
  captionStyle?: string;

  /**
   * `Lightbox` param — clicking a tile greys out the page and opens
   * the post in a modal detail view with prev/next paging (the social
   * wall pattern). Author-toggled per instance, so a param rather than
   * a rendering variant.
   */
  lightbox?: boolean;
  /**
   * `LightboxEmbedPost` param — inside the lightbox, swap the media
   * half for the platform's own embed (Instagram permalinks) so the
   * actual post loads in place.
   */
  lightboxEmbedPost?: boolean;

  /** Controls bar (optional, only in non-search-context placements). */
  resultControls?: ResultControlsProps;

  /** Empty-state copy. */
  emptyStateMessage?: TextSource;

  className?: string;
  id?: string;
}

type WallVariant = "mosaic" | "collage" | "arc";

// ─── Column maps (literal Tailwind so JIT picks them up) ─────────────

const MOSAIC_MD_COLS: Record<number, string> = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
  5: "md:grid-cols-5",
  6: "md:grid-cols-6",
};

const COLLAGE_MD_COLS: Record<number, string> = {
  2: "md:columns-2",
  3: "md:columns-3",
  4: "md:columns-4",
  5: "md:columns-5",
  6: "md:columns-6",
};

function clampColumns(value: number | undefined): number {
  const n = Math.floor(value ?? 4);
  return Math.max(2, Math.min(6, Number.isFinite(n) ? n : 4));
}

const WALL_GAP: Record<WallGap, string> = {
  none: "gap-0",
  sm: "gap-2",
  md: "gap-3",
  lg: "gap-4",
  xl: "gap-6",
};

const COLLAGE_COL_GAP: Record<WallGap, string> = {
  none: "gap-x-0",
  sm: "gap-x-2",
  md: "gap-x-4",
  lg: "gap-x-6",
  xl: "gap-x-8",
};

const COLLAGE_ITEM_GAP: Record<WallGap, string> = {
  none: "mb-0",
  sm: "mb-2",
  md: "mb-4",
  lg: "mb-6",
  xl: "mb-8",
};

/**
 * Per-tile span rhythm (period 6): a 2×2 hero, a tall tile, and a wide
 * tile among 1×1 fillers. Dense flow ties the rest together. Works for
 * any column count ≥ 2.
 */
function mosaicSpanClass(index: number): string {
  const position = index % 6;
  if (position === 0) return "col-span-2 row-span-2";
  if (position === 2) return "row-span-2";
  if (position === 4) return "col-span-2";
  return "";
}

/** Rotating aspect ratios so Collage tiles pack into an organic masonry. */
const COLLAGE_ASPECTS = [
  "aspect-[3/4]",
  "aspect-[4/5]",
  "aspect-square",
  "aspect-[5/4]",
  "aspect-[4/3]",
  "aspect-[2/3]",
];

function collageAspectClass(index: number): string {
  return COLLAGE_ASPECTS[index % COLLAGE_ASPECTS.length] ?? "aspect-square";
}

/** Gentle rotating top offset so Collage tile tops stagger (desktop only). */
function collageOffsetClass(index: number): string {
  const position = index % 3;
  if (position === 1) return "sm:mt-4";
  if (position === 2) return "sm:mt-10";
  return "";
}

function mosaicGridClass(columns: number, gap: WallGap): string {
  return cn(
    "grid grid-flow-row-dense grid-cols-2 auto-rows-[9rem] md:auto-rows-[12rem]",
    MOSAIC_MD_COLS[columns],
    WALL_GAP[gap],
  );
}

function collageGridClass(columns: number, gap: WallGap): string {
  return cn(
    "list-none columns-2",
    COLLAGE_MD_COLS[columns],
    COLLAGE_COL_GAP[gap],
  );
}

function wrapComposedWall(
  variant: WallVariant,
  nodes: ReactNode[],
  columns: number,
  gap: WallGap,
  spread: ArcSpreadValue,
  centerContent?: ReactNode,
): ReactNode {
  if (variant === "arc") {
    const tiles = nodes.slice(0, ARC_MAX_TILES);
    return (
      <div className="relative aspect-[2/1] w-full overflow-hidden">
        <div className="absolute inset-0">
          {tiles.map((node, index) => {
            const t = arcTileTransform(index, tiles.length, spread, "full");
            return (
              <div
                key={index}
                className="absolute"
                style={{
                  left: `${t.leftPct}%`,
                  top: `${t.topPct}%`,
                  width: `${round2(ARC_TILE_WIDTH_PCT.full * t.scale)}%`,
                  transform: `translate(-50%, -50%) rotate(${t.rotateDeg}deg)`,
                }}
              >
                <ComposedWallTile index={index} variant={variant}>
                  {node}
                </ComposedWallTile>
              </div>
            );
          })}
        </div>
        <ArcBaseGlow />
        {centerContent ? (
          <div className="absolute inset-x-0 top-[32%] bottom-0 z-10 flex items-center justify-center px-[18%]">
            <div className="w-full">{centerContent}</div>
          </div>
        ) : null}
      </div>
    );
  }
  if (variant === "mosaic") {
    return (
      <ul className={mosaicGridClass(columns, gap)}>
        {nodes.map((node, index) => (
          <li
            key={index}
            className={cn("h-full min-w-0", mosaicSpanClass(index))}
          >
            <ComposedWallTile index={index} variant={variant}>
              {node}
            </ComposedWallTile>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <ul className={collageGridClass(columns, gap)}>
      {nodes.map((node, index) => (
        <li
          key={index}
          className={cn(
            "w-full break-inside-avoid",
            COLLAGE_ITEM_GAP[gap],
            collageOffsetClass(index),
          )}
        >
          <ComposedWallTile index={index} variant={variant}>
            {node}
          </ComposedWallTile>
        </li>
      ))}
    </ul>
  );
}

/**
 * Per-tile aspect for composed (dropped) media-items. The items path
 * sets this on WallFigure; placeholder children otherwise stay
 * `aspect-video` and Collage reads as a uniform grid.
 */
function ComposedWallTile({
  index,
  variant,
  children,
}: {
  index: number;
  variant: WallVariant;
  children: ReactNode;
}) {
  const parent = useMediaGalleryTilePresentation();
  const aspectClassName =
    variant === "collage"
      ? collageAspectClass(index)
      : variant === "mosaic"
        ? "h-full"
        : "aspect-[4/5]";
  return (
    <MediaGalleryTileProvider
      value={{
        captionStyle: parent?.captionStyle ?? "below",
        aspectClassName,
      }}
    >
      {variant === "mosaic" ? (
        <div className="h-full min-h-0">{children}</div>
      ) : (
        children
      )}
    </MediaGalleryTileProvider>
  );
}

// ─── Arc variant — parametric photo arch ─────────────────────────────

export type ArcSpreadValue = "tight" | "wide";
/** `full` = md+ arch; `flat` = the shallower mobile top-arch. */
export type ArcProfileValue = "full" | "flat";

/** Hard cap on rendered fan tiles at md+ (design sweet spot is 6–7). */
export const ARC_MAX_TILES = 8;
/** The mobile top-arch renders at most this many tiles. */
export const ARC_MAX_TILES_MOBILE = 5;

/**
 * Total angular sweep of the fan, degrees, per profile × spread.
 * `wide` wraps a near-semicircle, `tight` a ~120° crown; the `flat`
 * (mobile) profile flattens both so the arch reads as a shallow crest
 * above the content instead of a full ring.
 */
const ARC_SWEEP_DEG: Record<ArcProfileValue, Record<ArcSpreadValue, number>> = {
  full: { tight: 120, wide: 180 },
  flat: { tight: 84, wide: 110 },
};

/** Tile count at which the fan reaches its full configured sweep —
 *  fewer tiles render a proportionally shallower fan. */
const ARC_FULL_FAN_COUNT: Record<ArcProfileValue, number> = {
  full: 7,
  flat: 5,
};

/**
 * The arc ellipse, as percentages of the stage box: center (cx, cy)
 * and radii (rx, ry). The center sits at/below the stage's bottom
 * edge so the fan crests inside the box and the end tiles land at the
 * bottom corners.
 */
const ARC_ELLIPSE: Record<
  ArcProfileValue,
  { cxPct: number; cyPct: number; rxPct: number; ryPct: number }
> = {
  full: { cxPct: 50, cyPct: 90, rxPct: 42, ryPct: 70 },
  flat: { cxPct: 50, cyPct: 100, rxPct: 40, ryPct: 62 },
};

/** Fraction of the true tangent angle applied as tile tilt: end tiles
 *  tilt most, the apex stays straight, and 1.0 (fully tangent, ±90° at a
 *  semicircle's ends) would be far too much — 0.35 lands the Better.com
 *  look (~±32° at the ends of a wide fan). */
const ARC_TILT_FACTOR = 0.35;
/** Size scale at the fan's end tiles (the apex tile is 1). */
const ARC_END_SCALE = 0.82;

/** Base tile width, % of stage width, before the per-tile scale. */
const ARC_TILE_WIDTH_PCT: Record<ArcProfileValue, number> = {
  full: 15,
  flat: 19,
};

export interface ArcTileTransform {
  /** Tile-center x, % of stage width. */
  leftPct: number;
  /** Tile-center y, % of stage height. */
  topPct: number;
  /** Tangent tilt, degrees — negative left of the apex, 0 at it. */
  rotateDeg: number;
  /** Relative tile size — 1 at the apex, `ARC_END_SCALE` at the ends. */
  scale: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Pure parametric placement for arc tile `index` of `count`:
 * deterministic (no randomness, no per-item authoring), same inputs →
 * same transforms. Tiles are distributed symmetrically around the
 * apex (90°) of the profile's ellipse; rotation is a damped tangent
 * so end tiles tilt most; scale eases from 1 (apex) to
 * `ARC_END_SCALE` (ends).
 */
export function arcTileTransform(
  index: number,
  count: number,
  spread: ArcSpreadValue = "wide",
  profile: ArcProfileValue = "full",
): ArcTileTransform {
  const n = Math.max(1, Math.floor(count));
  const i = Math.min(Math.max(Math.floor(index), 0), n - 1);
  const ellipse = ARC_ELLIPSE[profile];
  const fullFan = ARC_FULL_FAN_COUNT[profile];
  const sweep =
    ARC_SWEEP_DEG[profile][spread] * Math.min(1, (n - 1) / (fullFan - 1));
  const startDeg = 90 + sweep / 2;
  const stepDeg = n > 1 ? sweep / (n - 1) : 0;
  const thetaDeg = startDeg - i * stepDeg;
  const theta = (thetaDeg * Math.PI) / 180;
  return {
    leftPct: round2(ellipse.cxPct + ellipse.rxPct * Math.cos(theta)),
    topPct: round2(ellipse.cyPct - ellipse.ryPct * Math.sin(theta)),
    rotateDeg: round2((90 - thetaDeg) * ARC_TILT_FACTOR),
    scale: round2(ARC_END_SCALE + (1 - ARC_END_SCALE) * Math.sin(theta)),
  };
}

/** Parse the `ArcSpread` param (`arc-spread@1`); default `wide`. */
export function parseArcSpread(value: string | undefined): ArcSpreadValue {
  return value?.trim().toLowerCase() === "tight" ? "tight" : "wide";
}

/**
 * Faint mirrored shapes anchored at the stage's bottom corners —
 * subtle ambient glows echoing the fan's end tiles.
 */
function ArcBaseGlow() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-10 -left-10 size-32 rounded-full bg-foreground/5 blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -bottom-10 size-32 rounded-full bg-foreground/5 blur-2xl"
      />
    </>
  );
}

/**
 * The absolutely-positioned tile fan for one profile. The whole list
 * is `aria-hidden` — arc tiles are ambient decoration, not content
 * (stricter than the other variants' captioned figures), so they're
 * removed from the accessibility tree wholesale and made inert.
 */
function ArcTiles({
  items,
  spread,
  profile,
}: {
  items: MediaWallItem[];
  spread: ArcSpreadValue;
  profile: ArcProfileValue;
}) {
  return (
    <ul
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 m-0 list-none p-0"
    >
      {items.map((item, index) => {
        const t = arcTileTransform(index, items.length, spread, profile);
        return (
          <li
            key={item.id}
            className="absolute"
            style={{
              left: `${t.leftPct}%`,
              top: `${t.topPct}%`,
              width: `${round2(ARC_TILE_WIDTH_PCT[profile] * t.scale)}%`,
              transform: `translate(-50%, -50%) rotate(${t.rotateDeg}deg)`,
            }}
          >
            <MediaItemFigure
              image={item.extras?.image}
              videoUrl={item.extras?.videoUrl}
              thumbnailUrl={item.extras?.thumbnailUrl}
              imageSizes="(max-width: 768px) 20vw, 12vw"
              aspectClassName="aspect-[4/5]"
              className="overflow-hidden rounded-(--card-radius,var(--radius-lg)) shadow-md"
              captionStyle="none"
            />
          </li>
        );
      })}
    </ul>
  );
}

/**
 * `Arc` layout body. Two stages:
 *
 *   - md+ — the full arch (up to `ARC_MAX_TILES` tiles) on the `full`
 *     profile; when `centerContent` is set it sits in the well under
 *     the apex.
 *   - < md — the fan collapses to a shallow top-arch of the first
 *     `ARC_MAX_TILES_MOBILE` tiles on the `flat` profile (same
 *     parametric function, flatter ellipse — NOT a grid fallback);
 *     `centerContent` flows below the band.
 */
function ArcFan({
  items,
  spread,
  centerContent,
}: {
  items: MediaWallItem[];
  spread: ArcSpreadValue;
  centerContent?: ReactNode;
}) {
  const desktopItems = items.slice(0, ARC_MAX_TILES);
  const mobileItems = items.slice(0, ARC_MAX_TILES_MOBILE);
  return (
    <div data-arc-fan="">
      <div
        data-arc-stage="full"
        className="relative hidden aspect-[2/1] w-full overflow-hidden md:block"
      >
        <ArcTiles items={desktopItems} spread={spread} profile="full" />
        <ArcBaseGlow />
        {centerContent ? (
          <div className="absolute inset-x-0 top-[32%] bottom-0 z-10 flex items-center justify-center px-[18%]">
            <div className="w-full">{centerContent}</div>
          </div>
        ) : null}
      </div>
      <div data-arc-stage="flat" className="md:hidden">
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <ArcTiles items={mobileItems} spread={spread} profile="flat" />
          <ArcBaseGlow />
        </div>
        {centerContent ? <div className="mt-6">{centerContent}</div> : null}
      </div>
    </div>
  );
}

function WallFigure({
  item,
  figureClassName,
  aspectClassName,
  imageSizes,
  captionStyle,
}: {
  item: MediaWallItem;
  figureClassName: string;
  aspectClassName: string;
  imageSizes: string;
  captionStyle: CaptionStyleValue;
}) {
  return (
    <MediaItemFigure
      image={item.extras?.image}
      videoUrl={item.extras?.videoUrl}
      thumbnailUrl={item.extras?.thumbnailUrl}
      title={item.title}
      caption={item.extras?.caption}
      imageSizes={imageSizes}
      aspectClassName={aspectClassName}
      className={figureClassName}
      captionClassName="text-muted-foreground text-sm"
      captionStyle={captionStyle}
    />
  );
}

/**
 * Optionally wrap a tile in a lightbox-opening button. The button gets
 * the tile's title/caption as its accessible name via the figure's own
 * content; keyboard focus lands on the whole tile.
 */
function WallTileAction({
  onClick,
  children,
}: {
  onClick?: () => void;
  children: ReactNode;
}) {
  if (!onClick) return <>{children}</>;
  return (
    <button
      type="button"
      onClick={onClick}
      className="block h-full w-full cursor-pointer text-start outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      {children}
    </button>
  );
}

function MosaicGrid({
  items,
  columns,
  gap,
  captionStyle,
  onItemClick,
}: {
  items: MediaWallItem[];
  columns: number;
  gap: WallGap;
  captionStyle: CaptionStyleValue;
  onItemClick?: (index: number) => void;
}) {
  return (
    <ul className={mosaicGridClass(columns, gap)}>
      {items.map((item, index) => (
        <li
          key={item.id}
          className={cn("h-full min-h-0 min-w-0", mosaicSpanClass(index))}
        >
          <WallTileAction
            onClick={onItemClick ? () => onItemClick(index) : undefined}
          >
            <WallFigure
              item={item}
              figureClassName="h-full min-h-0 overflow-hidden rounded-(--card-radius,var(--radius-lg))"
              aspectClassName="h-full"
              imageSizes="(max-width: 640px) 50vw, 25vw"
              captionStyle={captionStyle}
            />
          </WallTileAction>
        </li>
      ))}
    </ul>
  );
}

function CollageGrid({
  items,
  columns,
  gap,
  captionStyle,
  onItemClick,
}: {
  items: MediaWallItem[];
  columns: number;
  gap: WallGap;
  captionStyle: CaptionStyleValue;
  onItemClick?: (index: number) => void;
}) {
  return (
    <ul className={collageGridClass(columns, gap)}>
      {items.map((item, index) => (
        <li
          key={item.id}
          className={cn(
            "break-inside-avoid",
            COLLAGE_ITEM_GAP[gap],
            collageOffsetClass(index),
          )}
        >
          <WallTileAction
            onClick={onItemClick ? () => onItemClick(index) : undefined}
          >
            <WallFigure
              item={item}
              figureClassName="rounded-(--card-radius,var(--radius-lg))"
              aspectClassName={collageAspectClass(index)}
              imageSizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              captionStyle={captionStyle}
            />
          </WallTileAction>
        </li>
      ))}
    </ul>
  );
}

function MediaWallInner({
  title,
  lead,
  eyebrow,
  cta,
  headingLayout,
  headingSize,
  headingPlacement,
  contentPlacement,
  arcSpread,
  items: directItems,
  searchConfig,
  children,
  rendering,
  columns: columnsRaw,
  gap = "md",
  captionStyle: captionStyleRaw,
  lightbox = false,
  lightboxEmbedPost = false,
  resultControls,
  emptyStateMessage,
  colorScheme,
  backgroundIntensity,
  paddingY,
  maxWidth,
  overlapTop,
  className,
  id,
  variant,
}: MediaWallProps & { variant: WallVariant }) {
  const sitecore = useSitecore() as {
    page?: { mode?: { isEditing?: boolean } };
  };
  const isEditing = Boolean(sitecore?.page?.mode?.isEditing);
  const items: MediaWallItem[] = useResolvedListItems(
    directItems,
    searchConfig,
    { rendering, isEditing, allowCurated: true },
  );

  const columns = clampColumns(columnsRaw);
  const captionStyle = parseCaptionStyle(captionStyleRaw);
  const hasItems = items.length > 0;
  // Arc tiles are ambient decoration — captions stay off. Mosaic and
  // Collage both honor the CaptionStyle param (below / overlay / card /
  // none) so the styling panel matches what authors see on the canvas.
  const tileCaptionStyle: CaptionStyleValue =
    variant === "arc" ? "none" : captionStyle;

  const isArc = variant === "arc";
  const spread = parseArcSpread(arcSpread);
  // Arc only — Mosaic/Collage leave heading placement to HeadingLayout.
  const centerInArc =
    isArc && contentPlacement?.trim().toLowerCase() === "center";
  // Arc tiles are ambient decoration — never lightbox targets.
  const wantsLightbox = lightbox && !isArc;

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const lightboxItems = useMemo<MediaLightboxItem[]>(
    () =>
      wantsLightbox
        ? items.map((item) => ({
            id: item.id,
            image: item.extras?.image,
            videoUrl: item.extras?.videoUrl,
            thumbnailUrl: item.extras?.thumbnailUrl,
            title: item.title,
            caption: item.extras?.caption,
            authorHandle: item.extras?.authorHandle,
            postUrl: item.extras?.postUrl,
            postDate: item.extras?.postDate,
          }))
        : [],
    [wantsLightbox, items],
  );
  const onItemClick = wantsLightbox
    ? (index: number) => setLightboxIndex(index)
    : undefined;

  const headingSizeOption = parseHeadingSize(headingSize, "default");
  const headingLayoutOption = parseHeadingLayout(
    headingLayout,
    "start-with-section-divider",
  );
  const headingCentered = headingLayoutOption.startsWith("center");
  // CtaGroup keeps an empty slot in Pages and hides it when unpublished
  // and blank — same heading CTA on Mosaic, Collage, and Arc.
  const headingCta =
    cta != null ? (
      <CtaGroup
        primary={cta}
        primaryVariant="default"
        justify={centerInArc || headingCentered ? "center" : "start"}
        isEditing={isEditing}
      />
    ) : null;

  const wallHeading = useMemo(
    () => ({
      title,
      lead,
      eyebrow,
      layout: headingLayoutOption,
      headingOptions: { size: headingSizeOption },
      ...(headingCta ? { footer: headingCta } : {}),
    }),
    [title, lead, eyebrow, headingLayoutOption, headingSizeOption, headingCta],
  );

  // Arc `center` moves the heading into the well — listing is
  // headingless. Mosaic/Collage always keep HeadingLayout above the
  // wall. `inline` HeadingPlacement sits the heading in the leading
  // column beside the wall.
  const listingBehaviorOptions = useMemo(
    () => ({
      heading: centerInArc ? undefined : wallHeading,
      headingPlacement: centerInArc ? undefined : headingPlacement,
      ...(resultControls ? { resultControls } : {}),
    }),
    [wallHeading, centerInArc, headingPlacement, resultControls],
  );

  const arcCenterHeading = centerInArc ? (
    <SectionHeading
      eyebrow={eyebrow}
      title={title}
      lead={lead}
      layout="center"
      headingOptions={{ size: headingSizeOption }}
      footer={headingCta}
    />
  ) : undefined;

  return (
    <ListingSection
      colorScheme={colorScheme}
      backgroundIntensity={backgroundIntensity}
      paddingY={paddingY}
      maxWidth={maxWidth}
      overlapTop={overlapTop}
      slot="media-wall"
      entityName="media-wall"
      id={id}
      className={className}
      innerMaxWidth="max-w-6xl"
    >
      <MediaGalleryTileProvider value={{ captionStyle: tileCaptionStyle }}>
      {hasItems ? (
        <ItemListing
          items={[null]}
          getKey={() => "media-wall"}
          displayOptions={{
            as: "div",
            itemAs: "div",
            empty: (
              <EmptyHint message={emptyStateMessage}>Media wall</EmptyHint>
            ),
          }}
          behaviorOptions={listingBehaviorOptions}
          styleOptions={{ className: "", itemClassName: "" }}
          renderItem={() =>
            variant === "arc" ? (
              <ArcFan
                items={items}
                spread={spread}
                centerContent={arcCenterHeading}
              />
            ) : variant === "mosaic" ? (
              <MosaicGrid
                items={items}
                columns={columns}
                gap={gap}
                captionStyle={captionStyle}
                onItemClick={onItemClick}
              />
            ) : (
              <CollageGrid
                items={items}
                columns={columns}
                gap={gap}
                captionStyle={captionStyle}
                onItemClick={onItemClick}
              />
            )
          }
        />
      ) : (
        <ListingFallback
          heading={listingBehaviorOptions.heading}
          headingPlacement={headingPlacement}
          placeholderKey="cards-media-wall-{*}"
          rendering={rendering}
          fallback={children}
          composedClassName={
            variant === "arc"
              ? cn("flex flex-wrap justify-center", WALL_GAP[gap])
              : variant === "mosaic"
                ? mosaicGridClass(columns, gap)
                : collageGridClass(columns, gap)
          }
          emptyStateMessage={emptyStateMessage}
          isEditing={isEditing}
          wrapComposed={(nodes) =>
            wrapComposedWall(
              variant,
              nodes,
              columns,
              gap,
              spread,
              arcCenterHeading,
            )
          }
        >
          Media wall
        </ListingFallback>
      )}

      {lightbox && lightboxItems.length > 0 ? (
        <MediaLightbox
          items={lightboxItems}
          openIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          embedSocialPost={lightboxEmbedPost}
          ariaLabel="Media detail"
        />
      ) : null}
      </MediaGalleryTileProvider>
    </ListingSection>
  );
}

/** Mosaic — dense tight span grid; CaptionStyle applies per tile. */
export function Mosaic(props: MediaWallProps) {
  return <MediaWallInner {...props} variant="mosaic" />;
}

/** Collage — loose CSS-masonry wall; honors the full caption style. */
export function Collage(props: MediaWallProps) {
  return <MediaWallInner {...props} variant="collage" />;
}

/**
 * Arc — photo arch: tiles fanned along a semicircular arc around the
 * heading stack (Better.com treatment). Tiles are decorative
 * (aria-hidden, captionless, never lightboxed); `ContentPlacement:
 * center` moves the heading + pill CTA into the well inside the arc.
 */
export function Arc(props: MediaWallProps) {
  return <MediaWallInner {...props} variant="arc" />;
}

export const Default = Mosaic;

export const componentType = "universal";
