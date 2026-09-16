"use client";

import { type ReactNode, useCallback, useMemo } from "react";
import {
  EmptyHint,
  ItemListing,
  itemListingLayouts,
  ListingFallback,
  ListingSection,
  type ResultControlsProps,
} from "@/components/registry/blocks";
import {
  Default as ReviewCardDefault,
  Quote as ReviewCardQuote,
} from "@/components/registry/components/cards-and-lists/review-card";
import type { ImageSource } from "@/components/registry/primitives/editables/image";
import type { RichTextSource } from "@/components/registry/primitives/editables/richtext";
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
 * `ReviewsListGrid` — Sitecore-aware list-or-grid rendering for the
 * reviews family. Composed/curated/search-driven by which datasource
 * field is populated:
 *
 *   - composed → placeholder children (review-card@1 children)
 *   - curated  → `items` populated via Sitecore Treelist
 *   - search   → `items` populated by ambient `useSearchControllerContext`
 *
 * Marked compatible with `reviews-carousel@1` — both renderings share
 * the reviews family's datasource template, so authors can swap layout
 * without re-binding.
 *
 * Flat props throughout — the Sitecore adapter unwraps fields/params
 * in `reviews.sitecore.ts`, so this file is runnable in Storybook with
 * plain values.
 */

/** Extras carried on a review flat-item beyond `FlatItem`'s base shape. */
export interface ReviewExtras {
  quote?: RichTextSource | TextSource;
  authorName?: TextSource;
  authorRole?: TextSource;
  authorImage?: ImageSource;
  rating?: number;
  source?: TextSource;
}

export type ReviewFlatItem = FlatItem<ReviewExtras>;

/** Card-shape choice surfaced at the list-grid/carousel level. */
export type ReviewsCardVariant = "card" | "quote";

export interface ReviewsListGridProps
  extends SectionSurfaceProps,
    CuratedCardChromeProps {
  /** Heading content. */
  title?: TextSource;
  lead?: TextSource;
  headingLayout?: string;
  headingSize?: string;

  /** Curated/search items. */
  items?: ReviewFlatItem[];
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

  /** Card-shape choice (datasource field). */
  cardVariant?: ReviewsCardVariant;
  /** Show avatar + review image inside `card` variant. Undefaulted: authors flip via Sitecore standard values. */
  showImages?: boolean;

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

/**
 * Shared body — picks data source, lays out items. Variants vary only
 * by the layout/grid className they pass in.
 */
function ReviewsListGridInner({
  title,
  lead,
  headingLayout,
  headingSize,
  items: directItems,
  searchConfig,
  children,
  rendering,
  cardVariant = "card",
  showImages,
  elevation,
  padding,
  cardStyle,
  cardColorScheme,
  colorBand,
  mediaBleed,
  mediaAspect,
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
}: ReviewsListGridProps & {
  layoutVariant: "grid-card" | "grid-quote" | "list-quote";
}) {
  const items: ReviewFlatItem[] = useResolvedListItems(
    directItems,
    searchConfig,
    { rendering, allowCurated: true },
  );

  // Variant locks the card shape when it implies one (quote-only variants).
  // GridCard respects the `cardVariant` prop; quote variants ignore it.
  const effectiveCardVariant: ReviewsCardVariant =
    layoutVariant === "grid-quote" || layoutVariant === "list-quote"
      ? "quote"
      : cardVariant;

  // Curated-mode chrome forwarded to every leaf card. `cardStyle`
  // maps back to the leaf's `style` prop name in `leafChromeProps`.
  const chrome = useMemo<CuratedCardChromeProps>(
    () => ({
      elevation,
      padding,
      cardStyle,
      cardColorScheme,
      colorBand,
      mediaBleed,
      mediaAspect,
    }),
    [
      elevation,
      padding,
      cardStyle,
      cardColorScheme,
      colorBand,
      mediaBleed,
      mediaAspect,
    ],
  );

  const renderReview = useCallback(
    (review: ReviewFlatItem) =>
      renderReviewCard({
        cardVariant: effectiveCardVariant,
        review,
        showImages,
        chrome,
      }),
    [effectiveCardVariant, showImages, chrome],
  );

  const layoutClassName = useMemo(() => {
    if (layoutVariant === "list-quote") return itemListingLayouts.stacked_md;
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
        layout: parseHeadingLayout(headingLayout, "start-with-section-divider"),
        headingOptions: { size: parseHeadingSize(headingSize, "default") },
      },
      ...(resultControls ? { resultControls } : {}),
    }),
    [title, lead, headingLayout, headingSize, resultControls],
  );

  const hasItems = items.length > 0;
  const placeholderKey = "cards-reviews-{*}";

  // List/quote variants are typographically denser; constrain width.
  const containerMaxWidthClass =
    layoutVariant === "list-quote" ? "max-w-4xl" : "max-w-6xl";

  return (
    <ListingSection
      colorScheme={colorScheme}
      backgroundIntensity={backgroundIntensity}
      paddingY={paddingY}
      maxWidth={maxWidth}
      overlapTop={overlapTop}
      slot="reviews-list-grid"
      entityName="reviews"
      id={id}
      className={className}
      innerMaxWidth={containerMaxWidthClass}
    >
      {hasItems ? (
        <ItemListing
          items={items}
          getKey={(review) => review.id}
          displayOptions={{
            as: "ul",
            itemAs: "li",
            empty: <EmptyHint message={emptyStateMessage}>Reviews</EmptyHint>,
          }}
          behaviorOptions={listingBehaviorOptions}
          styleOptions={{
            className: layoutClassName,
            itemClassName: "min-w-0",
          }}
          renderItem={renderReview}
        />
      ) : (
        <ListingFallback
          heading={listingBehaviorOptions.heading}
          placeholderKey={placeholderKey}
          rendering={rendering}
          fallback={children}
          composedClassName={layoutClassName}
          emptyStateMessage={emptyStateMessage}
        >
          Reviews
        </ListingFallback>
      )}
    </ListingSection>
  );
}

export function GridCard(props: ReviewsListGridProps) {
  return <ReviewsListGridInner {...props} layoutVariant="grid-card" />;
}

export function GridQuote(props: ReviewsListGridProps) {
  return <ReviewsListGridInner {...props} layoutVariant="grid-quote" />;
}

export function ListQuote(props: ReviewsListGridProps) {
  return <ReviewsListGridInner {...props} layoutVariant="list-quote" />;
}

export const Default = GridCard;
export default GridCard;

/**
 * Spread a `ReviewFlatItem` onto the leaf review card's prop shape.
 * Recipe-aligned field names — `extras.authorName` flows straight to
 * the card's `authorName` prop, etc.
 */
export function flatReviewProps(review: ReviewFlatItem) {
  const extras = review.extras ?? {};
  return {
    quote: extras.quote,
    authorName:
      extras.authorName ?? (review.title ? { value: review.title } : undefined),
    authorRole: extras.authorRole,
    authorImage: extras.authorImage,
    rating: extras.rating,
    source: extras.source,
  };
}

function renderReviewCard({
  cardVariant,
  review,
  showImages,
  chrome,
}: {
  cardVariant: ReviewsCardVariant;
  review: ReviewFlatItem;
  showImages?: boolean;
  chrome?: CuratedCardChromeProps;
}) {
  const Variant = cardVariant === "quote" ? ReviewCardQuote : ReviewCardDefault;
  return (
    <Variant
      {...flatReviewProps(review)}
      {...(showImages !== undefined ? { showImages } : {})}
      {...leafChromeProps(chrome)}
    />
  );
}

export const componentType = "universal";
