"use client";

import { type ReactNode, useCallback, useMemo } from "react";
import {
  EmptyHint,
  ItemListing,
  itemListingLayouts,
  ListingFallback,
  ListingSection,
  MediaItemFigure,
  type ResultControlsProps,
} from "@/components/registry/blocks";
import type { ImageSource } from "@/components/registry/primitives/editables/image";
import type { TextSource } from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import {
  type CaptionStyleValue,
  parseCaptionStyle,
} from "@/lib/registry/param-parsers";
import type { FlatItem, SearchConfig } from "@/lib/registry/search/types";
import {
  useResolvedListItems,
} from "@/lib/registry/search/use-resolved-list-items";
import type { SectionSurfaceProps } from "@/lib/registry/section-surface";
import {
  parseHeadingLayout,
  parseHeadingSize,
} from "../layout/section-wrapper";
import {
  buildGridClassName,
  type FeaturedFirst,
  type GridGap,
  type GridPattern,
} from "./_grid-classname";
import { type CardMediaAspect, MEDIA_ASPECT_CLASSES } from "./_media-aspect";
import { MediaGalleryTileProvider } from "./media-gallery-context";

/**
 * `MediaGalleryListGrid` — Sitecore-aware list-or-grid rendering for the
 * media-gallery family. Composed/curated/search-driven by which datasource
 * field is populated:
 *
 *   - composed → placeholder children (media-item@1 children)
 *   - curated  → `items` populated via Sitecore Treelist
 *   - search   → `items` populated by ambient `useSearchControllerContext`
 *
 * Unlike the offers family, the media-gallery family has no carousel
 * sibling — layout swaps stay within this rendering via the layout
 * variants. The search-results placeholder still composes a single
 * media-gallery-list-grid (with no cross-rendering swap target).
 *
 * Flat props throughout — the Sitecore adapter unwraps fields/params
 * in `media-gallery.sitecore.ts`, so this file is runnable in Storybook
 * with plain values.
 */

export interface MediaExtras {
  image?: ImageSource;
  videoUrl?: string;
  thumbnailUrl?: string;
  caption?: TextSource;
  altText?: string;
}

export type MediaFlatItem = FlatItem<MediaExtras>;

export interface MediaGalleryListGridProps extends SectionSurfaceProps {
  /** True in Pages so the fallback slot is a drop tray, not a grid. */
  isEditing?: boolean;
  /** Heading content. */
  title?: TextSource;
  lead?: TextSource;
  headingLayout?: string;
  headingSize?: string;
  /** `band-heading-placement@1`: `above` (default) or `inline`. */
  headingPlacement?: string;

  /** Curated/search items. */
  items?: MediaFlatItem[];
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

  /** Layout params. */
  columnsLg?: number;
  columnsMd?: number;
  columnsSm?: number;
  gap?: GridGap;
  /**
   * `featured-first@1` — lead-tile treatment: `wide` spans the first
   * tile across 2 columns, `tall` across 2 rows. `none` (default)
   * keeps the uniform grid.
   */
  featuredFirst?: FeaturedFirst;
  /**
   * `grid-pattern@1` tile rhythm — `bento` renders the repeating
   * hero + fillers mosaic; `uniform` (default) keeps 1×1 tiles.
   * Supersedes `featuredFirst`.
   */
  gridPattern?: GridPattern;
  /** How each media caption renders (`caption-style@1`). */
  captionStyle?: string;
  /**
   * Media aspect ratio override for the tiles (`media-aspect@1`).
   * Unset keeps each layout variant's own aspect preset.
   */
  mediaAspect?: string;

  /** Controls bar (optional, only in non-search-context placements). */
  resultControls?: ResultControlsProps;

  /** Empty-state copy. */
  emptyStateMessage?: TextSource;

  className?: string;
  id?: string;
}

type LayoutVariant =
  | "grid"
  | "no-spacing"
  | "fifty-fifty"
  | "featured"
  | "twisted-mixed-media"
  | "list";

interface CustomItemsLayoutProps {
  items: MediaFlatItem[];
  title?: TextSource;
  lead?: TextSource;
  headingLayout?: string;
  headingSize?: string;
  headingPlacement?: string;
  resultControls?: ResultControlsProps;
  emptyStateMessage?: TextSource;
  gap: GridGap;
  captionStyle?: CaptionStyleValue;
  mediaAspect?: CardMediaAspect;
  isEditing?: boolean;
}

/**
 * Layout variants that own their whole structure (heading + a bespoke
 * grid) rather than feeding tiles through the shared `ItemListing` body.
 * Returns `null` for the plain grid/list variants so the caller falls
 * back to `ItemListing`.
 */
function renderCustomItemsLayout(
  layoutVariant: LayoutVariant,
  props: CustomItemsLayoutProps,
): ReactNode {
  if (layoutVariant === "featured") {
    return (
      <FeaturedLayout
        items={props.items}
        title={props.title}
        lead={props.lead}
        headingLayout={props.headingLayout}
        headingSize={props.headingSize}
        headingPlacement={props.headingPlacement}
        emptyStateMessage={props.emptyStateMessage}
        captionStyle={props.captionStyle}
        mediaAspect={props.mediaAspect}
        isEditing={props.isEditing}
      />
    );
  }
  return null;
}

/**
 * Shared body — picks data source, lays out items. Variants vary by the
 * layout className they pass in and (for `featured` and
 * `twisted-mixed-media`) by structural composition that the standard
 * `ItemListing` body wraps.
 */
function MediaGalleryListGridInner({
  title,
  lead,
  headingLayout,
  headingSize,
  headingPlacement,
  items: directItems,
  searchConfig,
  children,
  rendering,
  columnsLg = 3,
  columnsMd = 2,
  columnsSm = 1,
  gap = "md",
  featuredFirst = "none",
  gridPattern = "uniform",
  captionStyle: captionStyleRaw,
  mediaAspect: mediaAspectRaw,
  resultControls,
  emptyStateMessage,
  colorScheme,
  backgroundIntensity,
  paddingY,
  maxWidth,
  overlapTop,
  className,
  id,
  isEditing,
  layoutVariant,
}: MediaGalleryListGridProps & {
  layoutVariant: LayoutVariant;
}) {
  const captionStyle = parseCaptionStyle(captionStyleRaw);
  // Undefined (or an unknown value) keeps each layout variant's own
  // aspect preset — only a valid author pick overrides.
  const normalizedAspect = mediaAspectRaw?.trim().toLowerCase();
  const mediaAspect: CardMediaAspect | undefined =
    normalizedAspect && normalizedAspect in MEDIA_ASPECT_CLASSES
      ? (normalizedAspect as CardMediaAspect)
      : undefined;
  const items: MediaFlatItem[] = useResolvedListItems(
    directItems,
    searchConfig,
    { rendering, isEditing, allowCurated: true },
  );

  const layoutClassName = useMemo(() => {
    if (layoutVariant === "list") return itemListingLayouts.stacked_md;
    if (layoutVariant === "no-spacing") {
      // `gap-0` className overrides the helper's `GAP_CLASSES.md` via
      // tailwind-merge (className appended last).
      return buildGridClassName({
        columnsSm,
        columnsMd,
        columnsLg,
        gap: "md",
        featuredFirst,
        className: "gap-0",
      });
    }
    if (layoutVariant === "fifty-fifty") {
      return "grid grid-cols-1 gap-6 md:grid-cols-2";
    }
    if (layoutVariant === "featured") {
      return "grid grid-cols-1 gap-6 md:grid-cols-3 [&>*:first-child]:md:col-span-2";
    }
    if (layoutVariant === "twisted-mixed-media") {
      return cn(
        "mx-auto grid max-w-3xl grid-cols-1 items-center gap-4 sm:grid-cols-3 sm:gap-0",
        "[&>*:nth-child(1)]:-rotate-4 [&>*:nth-child(1)]:sm:translate-x-6",
        "[&>*:nth-child(2)]:sm:z-10 [&>*:nth-child(2)]:sm:scale-125",
        "[&>*:nth-child(3)]:rotate-4 [&>*:nth-child(3)]:sm:-translate-x-6",
      );
    }
    return buildGridClassName({
      columnsLg,
      columnsMd,
      columnsSm,
      gap,
      featuredFirst,
      gridPattern,
    });
  }, [
    layoutVariant,
    columnsLg,
    columnsMd,
    columnsSm,
    gap,
    featuredFirst,
    gridPattern,
  ]);

  const listingBehaviorOptions = useMemo(
    () => ({
      heading: {
        title,
        lead,
        layout: parseHeadingLayout(
          headingLayout,
          layoutVariant === "twisted-mixed-media"
            ? "center"
            : "start-with-section-divider",
        ),
        headingOptions: { size: parseHeadingSize(headingSize, "default") },
      },
      headingPlacement,
      ...(resultControls ? { resultControls } : {}),
    }),
    [
      title,
      lead,
      headingLayout,
      headingSize,
      headingPlacement,
      resultControls,
      layoutVariant,
    ],
  );

  const hasItems = items.length > 0;
  const placeholderKey = "cards-media-gallery-{*}";

  const renderItem = useCallback(
    (item: MediaFlatItem, index: number) =>
      renderMediaTile({
        item,
        index,
        layoutVariant,
        captionStyle,
        mediaAspect,
        isEditing,
      }),
    [layoutVariant, captionStyle, mediaAspect, isEditing],
  );

  const tilePresentation = useMemo(
    () => ({
      captionStyle:
        layoutVariant === "twisted-mixed-media"
          ? ("none" as const)
          : captionStyle,
      aspectClassName: mediaAspect
        ? MEDIA_ASPECT_CLASSES[mediaAspect]
        : undefined,
    }),
    [layoutVariant, captionStyle, mediaAspect],
  );

  const isTwist = layoutVariant === "twisted-mixed-media";

  // Featured owns its whole structure; the rest feed
  // tiles through the shared `ItemListing` body below.
  const customItemsLayout = hasItems
    ? renderCustomItemsLayout(layoutVariant, {
        items,
        title,
        lead,
        headingLayout,
        headingSize,
        headingPlacement,
        resultControls,
        emptyStateMessage,
        gap,
        captionStyle,
        mediaAspect,
        isEditing,
      })
    : null;

  return (
    <ListingSection
      colorScheme={colorScheme}
      backgroundIntensity={backgroundIntensity}
      paddingY={paddingY}
      maxWidth={maxWidth}
      overlapTop={overlapTop}
      slot="media-gallery-list-grid"
      entityName="media-gallery"
      id={id}
      className={cn(isTwist && "media-gallery--twist-triptych", className)}
      innerMaxWidth={layoutVariant === "list" ? "max-w-4xl" : "max-w-6xl"}
    >
      <MediaGalleryTileProvider value={tilePresentation}>
        {hasItems ? (
          (customItemsLayout ?? (
            <ItemListing
              items={
                layoutVariant === "fifty-fifty"
                  ? items.slice(0, 2)
                  : layoutVariant === "twisted-mixed-media"
                    ? items.slice(0, 3)
                    : items
              }
              getKey={(item) => item.id}
              displayOptions={{
                as: "ul",
                itemAs: "li",
                empty: (
                  <EmptyHint message={emptyStateMessage}>
                    Media gallery
                  </EmptyHint>
                ),
              }}
              behaviorOptions={listingBehaviorOptions}
              styleOptions={{
                className: layoutClassName,
                itemClassName: "min-w-0",
              }}
              renderItem={renderItem}
            />
          ))
        ) : (
          <ListingFallback
            heading={listingBehaviorOptions.heading}
            headingPlacement={headingPlacement}
            placeholderKey={placeholderKey}
            rendering={rendering}
            fallback={children}
            composedClassName={layoutClassName}
            emptyStateMessage={emptyStateMessage}
            isEditing={isEditing}
            wrapComposed={(nodes) =>
              wrapComposedGallery(layoutVariant, nodes, layoutClassName)
            }
          >
            Media gallery
          </ListingFallback>
        )}
      </MediaGalleryTileProvider>
    </ListingSection>
  );
}

export function Grid(props: MediaGalleryListGridProps) {
  return <MediaGalleryListGridInner {...props} layoutVariant="grid" />;
}

export function NoSpacing(props: MediaGalleryListGridProps) {
  return <MediaGalleryListGridInner {...props} layoutVariant="no-spacing" />;
}

export function FiftyFifty(props: MediaGalleryListGridProps) {
  return <MediaGalleryListGridInner {...props} layoutVariant="fifty-fifty" />;
}

export function Featured(props: MediaGalleryListGridProps) {
  return <MediaGalleryListGridInner {...props} layoutVariant="featured" />;
}

export function TwistedMixedMedia(props: MediaGalleryListGridProps) {
  return (
    <MediaGalleryListGridInner {...props} layoutVariant="twisted-mixed-media" />
  );
}

export function List(props: MediaGalleryListGridProps) {
  return <MediaGalleryListGridInner {...props} layoutVariant="list" />;
}

export const Default = Grid;
export default Grid;

function tileAspectClass(layoutVariant: LayoutVariant): string {
  if (layoutVariant === "fifty-fifty" || layoutVariant === "list") {
    return "aspect-video";
  }
  if (layoutVariant === "twisted-mixed-media") return "aspect-4/5";
  return "aspect-square";
}

function tileFigureClass(layoutVariant: LayoutVariant): string {
  // Overflow clipping lives on the media box inside MediaItemFigure so
  // a below-image caption is not cut off.
  if (layoutVariant === "no-spacing") return "";
  if (layoutVariant === "list") {
    return "rounded-[var(--card-radius,var(--radius-lg,0.75rem))] border border-border/70 p-2";
  }
  if (layoutVariant === "twisted-mixed-media") {
    return "relative z-0 mx-auto w-[72%] max-w-[220px] rounded-[var(--card-radius,var(--radius-lg,0.75rem))] shadow-xl transition-transform duration-300 ease-out will-change-transform hover:z-10 sm:w-[90%] sm:max-w-[240px]";
  }
  return "rounded-[var(--card-radius,var(--radius-lg,0.75rem))]";
}

function tileCaptionClass(layoutVariant: LayoutVariant): string {
  if (layoutVariant === "no-spacing") return "p-2";
  if (layoutVariant === "list") return "mt-3";
  return "mt-2";
}

function tileSizes(layoutVariant: LayoutVariant): string {
  if (layoutVariant === "list") return "(max-width: 768px) 100vw, 960px";
  if (layoutVariant === "fifty-fifty") {
    return "(max-width: 768px) 100vw, 50vw";
  }
  if (layoutVariant === "twisted-mixed-media") {
    return "(max-width: 640px) 100vw, 33vw";
  }
  return "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";
}

function twistRotationClass(
  layoutVariant: LayoutVariant,
  index: number,
): string | undefined {
  if (layoutVariant !== "twisted-mixed-media") return undefined;
  if (index === 0) {
    return "-rotate-4 sm:translate-x-6 hover:rotate-4 sm:hover:translate-x-8";
  }
  if (index === 1) return "rotate-0 sm:scale-125 hover:rotate-2 sm:z-10";
  return "rotate-4 sm:-translate-x-6 hover:-rotate-4 sm:hover:-translate-x-8";
}

function wrapComposedGallery(
  layoutVariant: LayoutVariant,
  nodes: ReactNode[],
  layoutClassName: string,
): ReactNode {
  if (layoutVariant === "featured") {
    const [featured, ...rest] = nodes;
    return (
      <div className="grid gap-6 md:grid-cols-3">
        <div className="min-w-0 md:col-span-2">{featured}</div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-1">
          {rest.slice(0, 3)}
        </div>
      </div>
    );
  }
  if (layoutVariant === "twisted-mixed-media") {
    return (
      <div className="mx-auto grid max-w-3xl grid-cols-1 items-center gap-4 sm:grid-cols-3 sm:gap-0">
        {nodes.slice(0, 3).map((node, index) => (
          <div
            key={index}
            className={twistRotationClass("twisted-mixed-media", index)}
          >
            {node}
          </div>
        ))}
      </div>
    );
  }
  return <div className={layoutClassName}>{nodes}</div>;
}

function renderMediaTile({
  item,
  index,
  layoutVariant,
  captionStyle,
  mediaAspect,
  isEditing,
}: {
  item: MediaFlatItem;
  index: number;
  layoutVariant: LayoutVariant;
  captionStyle?: CaptionStyleValue;
  mediaAspect?: CardMediaAspect;
  isEditing?: boolean;
}) {
  return (
    <GalleryFigure
      item={item}
      figureClassName={cn(
        tileFigureClass(layoutVariant),
        twistRotationClass(layoutVariant, index),
      )}
      aspectClassName={
        mediaAspect
          ? MEDIA_ASPECT_CLASSES[mediaAspect]
          : tileAspectClass(layoutVariant)
      }
      captionClassName={tileCaptionClass(layoutVariant)}
      imageSizes={tileSizes(layoutVariant)}
      // Twisted-mixed-media is a rotated triptych — its captions always
      // stay hidden regardless of the CaptionStyle param.
      captionStyle={
        layoutVariant === "twisted-mixed-media" ? "none" : captionStyle
      }
      isEditing={isEditing}
    />
  );
}

function GalleryFigure({
  item,
  aspectClassName,
  figureClassName,
  captionClassName,
  imageSizes,
  captionStyle,
  isEditing,
}: {
  item: MediaFlatItem;
  aspectClassName: string;
  figureClassName?: string;
  captionClassName?: string;
  imageSizes: string;
  captionStyle?: CaptionStyleValue;
  isEditing?: boolean;
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
      captionClassName={cn("text-muted-foreground text-sm", captionClassName)}
      captionStyle={captionStyle}
      isEditing={isEditing}
    />
  );
}

function FeaturedLayout({
  items,
  title,
  lead,
  headingLayout,
  headingSize,
  headingPlacement,
  resultControls,
  emptyStateMessage,
  captionStyle,
  mediaAspect,
  isEditing,
}: {
  items: MediaFlatItem[];
  title?: TextSource;
  lead?: TextSource;
  headingLayout?: string;
  headingSize?: string;
  headingPlacement?: string;
  resultControls?: ResultControlsProps;
  emptyStateMessage?: TextSource;
  captionStyle?: CaptionStyleValue;
  mediaAspect?: CardMediaAspect;
  isEditing?: boolean;
}) {
  const [featured, ...rest] = items;
  const listingBehaviorOptions = useMemo(
    () => ({
      heading: {
        title,
        lead,
        layout: parseHeadingLayout(headingLayout, "start-with-section-divider"),
        headingOptions: { size: parseHeadingSize(headingSize, "default") },
      },
      headingPlacement,
      ...(resultControls ? { resultControls } : {}),
    }),
    [title, lead, headingLayout, headingSize, headingPlacement, resultControls],
  );
  const aspectClassName = mediaAspect
    ? MEDIA_ASPECT_CLASSES[mediaAspect]
    : "aspect-video";

  return (
    <ItemListing
      items={[null]}
      getKey={() => "featured-layout"}
      displayOptions={{
        as: "div",
        itemAs: "div",
        empty: <EmptyHint message={emptyStateMessage}>Media gallery</EmptyHint>,
      }}
      behaviorOptions={listingBehaviorOptions}
      styleOptions={{ className: "", itemClassName: "" }}
      renderItem={() => (
        <div className="grid gap-6 md:grid-cols-3">
          {featured ? (
            <GalleryFigure
              item={featured}
              figureClassName="rounded-[var(--card-radius,var(--radius-lg,0.75rem))] md:col-span-2"
              aspectClassName={aspectClassName}
              imageSizes="(max-width: 1024px) 100vw, 66vw"
              captionStyle={captionStyle}
              isEditing={isEditing}
            />
          ) : null}
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-1">
            {rest.slice(0, 3).map((item) => (
              <li key={item.id} className="min-w-0">
                <GalleryFigure
                  item={item}
                  figureClassName="rounded-[var(--card-radius,var(--radius-lg,0.75rem))]"
                  aspectClassName={aspectClassName}
                  imageSizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                  captionStyle={captionStyle}
                  isEditing={isEditing}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    />
  );
}

export const componentType = "universal";
