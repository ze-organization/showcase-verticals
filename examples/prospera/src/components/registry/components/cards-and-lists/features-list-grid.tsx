"use client";

import { type ReactNode, useCallback, useMemo } from "react";
import {
  EmptyHint,
  ItemListing,
  ListingFallback,
  ListingSection,
  type ResultControlsProps,
  wrapComposedByListVariant,
} from "@/components/registry/blocks";
import {
  Default as FeatureCardDefault,
  Horizontal as FeatureCardHorizontal,
  IconTile as FeatureCardIconTile,
  MediaBanded as FeatureCardMediaBanded,
  MediaStacked as FeatureCardMediaStacked,
  NumberedTile as FeatureCardNumberedTile,
  OverlayPanel as FeatureCardOverlayPanel,
} from "@/components/registry/components/cards-and-lists/feature-card";
import type { TextSource } from "@/components/registry/primitives/editables/text";
import type { FlatItem, SearchConfig } from "@/lib/registry/search/types";
import { useResolvedListItems } from "@/lib/registry/search/use-resolved-list-items";
import type { SectionSurfaceProps } from "@/lib/registry/section-surface";
import {
  parseHeadingLayout,
  parseHeadingSize,
} from "../layout/section-wrapper";
import {
  type CuratedCardChromeProps,
  leafChromeProps,
} from "./_card-chrome-adapter";
import {
  buildGridClassName,
  type FeaturedFirst,
  type GridGap,
  type GridPattern,
} from "./_grid-classname";

/**
 * `FeaturesListGrid` — Sitecore-aware list-or-grid rendering for the
 * features family. Composed/curated/search-driven by which datasource
 * field is populated:
 *
 *   - composed → placeholder children (feature-card@1 children)
 *   - curated  → `items` populated via Sitecore Treelist
 *   - search   → `items` populated by ambient `useSearchControllerContext`
 *
 * Marked compatible with `features-carousel@1`. Authors swap layout
 * without re-binding because both renderings share the features family's
 * datasource template.
 *
 * Flat props throughout — the Sitecore adapter unwraps fields/params
 * in `features.sitecore.ts`, so this file is runnable in Storybook with
 * plain values.
 *
 * Variants mirror the existing Features experience surface:
 *
 *   - Grid           → default cards, gap-16, 3-up at lg
 *   - NumberedGrid   → numbered tiles, tight gap-4
 *   - MediaBanded    → image-with-overlaid-title-band cards
 *   - MediaStacked   → bare image-on-top cards, 2-up at md
 *   - IconTile       → icon + title + body + outline-pill CTA
 *   - HorizontalRows → media-left horizontal cards, 2-up at lg
 *
 * Single-column / two-column stacks are not variants — set `columnsLg`
 * / `columnsMd` / `columnsSm` + `gap` on the `Grid` variant instead.
 */

/**
 * Family-specific extras carried alongside the FlatItem core fields.
 * The adapter hydrates these from Sitecore (rich text fields, image
 * jsonValue, link jsonValue) so cards can render the authored field
 * shapes directly.
 */
export type FeatureExtras = {
  titleField?: { value?: string };
  descriptionField?: { value?: string };
  imageField?: { value?: { src?: string; alt?: string } };
  /** Named vector icon (`icon-name@1`) — IconTile renders it over the image. */
  iconName?: string;
  linkField?: { value?: { href?: string; text?: string } };
  numberLabel?: string;
};

export type FeatureFlatItem = FlatItem<FeatureExtras>;

export interface FeaturesListGridProps
  extends SectionSurfaceProps,
    CuratedCardChromeProps {
  /** Heading content. */
  title?: TextSource;
  lead?: TextSource;
  /** Optional kicker above the title (small-caps eyebrow). */
  eyebrow?: TextSource;
  headingLayout?: string;
  headingSize?: string;

  /** Curated/search items (flat). */
  items?: FeatureFlatItem[];
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

  /** Controls bar (optional, only in non-search-context placements). */
  resultControls?: ResultControlsProps;

  /** Empty-state copy. */
  emptyStateMessage?: TextSource;

  className?: string;
  id?: string;
}

type LayoutVariant =
  | "grid"
  | "numbered-grid"
  | "media-banded"
  | "media-stacked"
  | "icon-tile"
  | "horizontal-rows"
  | "overlay-panel";

/**
 * Shared body — picks data source, lays out items. Variants vary by
 * which `FeatureCard` variant we render plus the grid/listing className
 * they pass in.
 */
function FeaturesListGridInner({
  title,
  lead,
  eyebrow,
  headingLayout,
  headingSize,
  items: directItems,
  searchConfig,
  children,
  rendering,
  elevation,
  padding,
  cardStyle,
  cardColorScheme,
  colorBand,
  titleLinkIcon,
  mediaBleed,
  mediaAspect,
  mediaShape,
  ctaPlacement,
  ctaIconTrailing,
  columnsLg = 3,
  columnsMd = 2,
  columnsSm = 1,
  gap = "md",
  featuredFirst = "none",
  gridPattern = "uniform",
  resultControls,
  emptyStateMessage,
  colorScheme,
  backgroundIntensity,
  paddingY,
  maxWidth,
  overlapTop,
  className,
  id,
  layoutVariant,
}: FeaturesListGridProps & { layoutVariant: LayoutVariant }) {
  const items: FeatureFlatItem[] = useResolvedListItems(
    directItems,
    searchConfig,
    { rendering, allowCurated: true },
  );

  // Curated-mode chrome forwarded to every leaf card. `cardStyle`
  // maps back to the leaf's `style` prop name in `leafChromeProps`.
  const chrome = useMemo<CuratedCardChromeProps>(
    () => ({
      elevation,
      padding,
      cardStyle,
      cardColorScheme,
      colorBand,
      titleLinkIcon,
      mediaBleed,
      mediaAspect,
      mediaShape,
      // `FeatureCard` documents this one — "Default / MediaBanded /
      // MediaStacked honor it" — but the grid never forwarded it, so an
      // author setting CtaPlacement on a features grid got nothing. The
      // cross-product audit reported it dead on every fixture, media-
      // carrying ones included, which is what separated it from
      // `mediaBleed`/`mediaAspect` (dead only where there is no media).
      ctaPlacement,
      ctaIconTrailing,
    }),
    [
      elevation,
      padding,
      cardStyle,
      cardColorScheme,
      colorBand,
      titleLinkIcon,
      mediaBleed,
      mediaAspect,
      mediaShape,
      ctaPlacement,
      ctaIconTrailing,
    ],
  );

  const Variant = useMemo(() => {
    if (layoutVariant === "numbered-grid") return FeatureCardNumberedTile;
    if (layoutVariant === "media-banded") return FeatureCardMediaBanded;
    if (layoutVariant === "media-stacked") return FeatureCardMediaStacked;
    if (layoutVariant === "icon-tile") return FeatureCardIconTile;
    if (layoutVariant === "horizontal-rows") return FeatureCardHorizontal;
    if (layoutVariant === "overlay-panel") return FeatureCardOverlayPanel;
    return FeatureCardDefault;
  }, [layoutVariant]);

  const renderFeature = useCallback(
    (item: FeatureFlatItem, index: number) => (
      <Variant
        {...flatFeatureProps(item)}
        index={index}
        {...leafChromeProps(chrome)}
      />
    ),
    [Variant, chrome],
  );

  const layoutClassName = useMemo(() => {
    return resolveGridClassName(layoutVariant, {
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
        eyebrow,
        layout: parseHeadingLayout(headingLayout, "start-with-section-divider"),
        headingOptions: { size: parseHeadingSize(headingSize, "default") },
      },
      ...(resultControls ? { resultControls } : {}),
    }),
    [title, lead, eyebrow, headingLayout, headingSize, resultControls],
  );

  const hasItems = items.length > 0;
  const placeholderKey = "cards-features-{*}";

  return (
    <ListingSection
      colorScheme={colorScheme}
      backgroundIntensity={backgroundIntensity}
      paddingY={paddingY}
      maxWidth={maxWidth}
      overlapTop={overlapTop}
      slot="features-list-grid"
      entityName="features"
      id={id}
      className={className}
    >
      {hasItems ? (
        <ItemListing
          items={items}
          getKey={(item) => item.id}
          displayOptions={{
            as: "ul",
            itemAs: "li",
            empty: <EmptyHint message={emptyStateMessage}>Features</EmptyHint>,
          }}
          behaviorOptions={listingBehaviorOptions}
          styleOptions={{
            className: layoutClassName,
            // Stretch each card to fill its (grid-stretched) cell so every
            // card in a row shares the tallest one's height — the same
            // `h-full` chain the bento/featured spans use in `_grid-classname`.
            // The `<li>` already stretches via the grid; `[&>*]:h-full` makes
            // its card child fill it. Composed mode already stretches (cards
            // are direct grid items), so this only fixes the listing path.
            itemClassName: "min-w-0 [&>*]:h-full",
          }}
          renderItem={renderFeature}
        />
      ) : (
        <ListingFallback
          heading={listingBehaviorOptions.heading}
          placeholderKey={placeholderKey}
          rendering={rendering}
          fallback={children}
          composedClassName={layoutClassName}
          wrapComposed={wrapComposedByListVariant(layoutVariant)}
          emptyStateMessage={emptyStateMessage}
        >
          Features
        </ListingFallback>
      )}
    </ListingSection>
  );
}

export function Grid(props: FeaturesListGridProps) {
  return <FeaturesListGridInner {...props} layoutVariant="grid" />;
}

export function NumberedGrid(props: FeaturesListGridProps) {
  return <FeaturesListGridInner {...props} layoutVariant="numbered-grid" />;
}

export function MediaBanded(props: FeaturesListGridProps) {
  return <FeaturesListGridInner {...props} layoutVariant="media-banded" />;
}

export function MediaStacked(props: FeaturesListGridProps) {
  return <FeaturesListGridInner {...props} layoutVariant="media-stacked" />;
}

export function IconTile(props: FeaturesListGridProps) {
  return <FeaturesListGridInner {...props} layoutVariant="icon-tile" />;
}

/**
 * HorizontalRows — media-left `FeatureCardHorizontal` rows. Defaults to
 * a 2-up grid at lg (1-up below) so each row keeps enough width for
 * the side-by-side image + copy; authors can still override via the
 * Columns params.
 */
export function HorizontalRows(props: FeaturesListGridProps) {
  return (
    <FeaturesListGridInner
      {...props}
      columnsLg={props.columnsLg ?? 2}
      columnsMd={props.columnsMd ?? 1}
      layoutVariant="horizontal-rows"
    />
  );
}

/**
 * OverlayPanel — poster tiles with a solid scheme-colored panel over
 * the lower media portion (title + pill CTA on the panel). The panel
 * scheme rides the shared ColorBand chrome param.
 */
export function OverlayPanel(props: FeaturesListGridProps) {
  return <FeaturesListGridInner {...props} layoutVariant="overlay-panel" />;
}

export const Default = Grid;
export default Grid;

/**
 * Tailwind grid class for the variant. Mirrors the existing
 * `features.tsx` `resolveGridClassName` heuristic — different variants
 * want different gaps + breakpoint columns — and falls through to a
 * caller-driven N-column build for the generic `grid` variant when the
 * author has overridden the breakpoint counts.
 */
function resolveGridClassName(
  variant: LayoutVariant,
  cols: {
    columnsLg: number;
    columnsMd: number;
    columnsSm: number;
    gap: GridGap;
    featuredFirst: FeaturedFirst;
    gridPattern: GridPattern;
  },
): string {
  if (variant === "numbered-grid") {
    // Honor the author's columnsLg/Md/Sm via buildGridClassName (viewport
    // breakpoints) like the media/overlay variants — a composer-bound 2-up or
    // 4-up is respected instead of a fixed 3-up, and a wide viewport no longer
    // stays stacked when the @container never reaches the old query threshold.
    // Signature gap-4 preserved (trailing className wins the gap).
    return buildGridClassName({ ...cols, className: "gap-4" });
  }
  // Media variants honor the author's columnsLg/Md/Sm like every other
  // list-grid (viewport breakpoints via buildGridClassName), while keeping
  // their signature wider gap-10 — the trailing className wins the gap in
  // tailwind-merge.
  if (variant === "media-banded" || variant === "media-stacked") {
    return buildGridClassName({ ...cols, className: "gap-10" });
  }
  if (variant === "icon-tile") {
    // Honor the author's columnsLg/Md/Sm (viewport breakpoints) like the other
    // variants; keeps the wider gap-6 signature. See numbered-grid above.
    return buildGridClassName({ ...cols, className: "gap-6" });
  }
  if (variant === "overlay-panel") {
    // Poster tiles read best 3-up with a moderate gutter; the author's
    // Columns params still win via buildGridClassName when set.
    return buildGridClassName({ ...cols, className: "gap-6" });
  }
  // `horizontal-rows` and the generic `grid` both honor the caller's
  // breakpoint columns directly.
  return buildGridClassName(cols);
}

/**
 * Spread a flat feature item onto the leaf card's prop shape. Bridges
 * between the search/curated `FlatItem<FeatureExtras>` world and the
 * flat-prop card variants. Falls back to the FlatItem core fields when
 * `extras` doesn't carry a populated Source.
 */
export function flatFeatureProps(item: FeatureFlatItem) {
  const extras = item.extras ?? {};
  return {
    title:
      extras.titleField ?? (item.title ? { value: item.title } : undefined),
    description:
      extras.descriptionField ??
      (item.description ? { value: item.description } : undefined),
    image:
      extras.imageField ??
      (item.image?.src
        ? { value: { src: item.image.src, alt: item.image.alt } }
        : undefined),
    link:
      extras.linkField ??
      (item.href
        ? { value: { href: item.href, text: item.title } }
        : undefined),
    iconName: extras.iconName,
    number: extras.numberLabel,
  };
}

export const componentType = "universal";
