"use client";

import { type ReactNode, useCallback, useMemo } from "react";
import {
  EmptyHint,
  ItemListing,
  ListingFallback,
  ListingSection,
  type ResultControlsProps,
} from "@/components/registry/blocks";
import {
  type OfferCardAction,
  Complex as OfferCardComplex,
  Deal as OfferCardDeal,
  Simple as OfferCardSimple,
  type OfferCardVariant,
} from "@/components/registry/components/cards-and-lists/offer-card";
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
 * `OffersListGrid` — Sitecore-aware list-or-grid rendering for the
 * offers family. Composed/curated/search-driven by which datasource
 * field is populated:
 *
 *   - composed → placeholder children (offer-card@1 children)
 *   - curated  → `items` populated via Sitecore Treelist
 *   - search   → `items` populated by ambient `useSearchControllerContext`
 *
 * Marked compatible with `offers-carousel@1`. Authors swap layout
 * without re-binding because both renderings share the offers family's
 * datasource template.
 *
 * Flat props throughout — the Sitecore adapter unwraps fields/params
 * in `offers.sitecore.ts`, so this file is runnable in Storybook with
 * plain values.
 */

export type OfferFlatItem = FlatItem<{
  text?: TextSource;
  discountToken?: string;
}>;

export interface OffersListGridProps
  extends SectionSurfaceProps,
    CuratedCardChromeProps {
  /** Heading content. */
  title?: TextSource;
  lead?: TextSource;
  headingLayout?: string;
  headingSize?: string;

  /** Curated/search items. */
  items?: OfferFlatItem[];
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

  /** Card-shape choices (datasource fields). */
  cardVariant?: OfferCardVariant;
  action?: OfferCardAction;

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
 * by the grid/listing className they pass in.
 */
function OffersListGridInner({
  title,
  lead,
  headingLayout,
  headingSize,
  items: directItems,
  searchConfig,
  children,
  rendering,
  cardVariant = "simple",
  action = "auto",
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
}: OffersListGridProps) {
  const items: OfferFlatItem[] = useResolvedListItems(
    directItems,
    searchConfig,
    { rendering, allowCurated: true },
  );

  // Curated-mode chrome forwarded to every leaf card. `cardStyle` maps
  // back to the leaf's `style` prop name in `leafChromeProps`.
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

  const renderOffer = useCallback(
    (offer: OfferFlatItem) =>
      renderOfferCard({
        variant: cardVariant,
        offer,
        action,
        chrome,
      }),
    [action, cardVariant, chrome],
  );

  const layoutClassName = useMemo(
    () =>
      buildGridClassName({
        columnsLg,
        columnsMd,
        columnsSm,
        gap,
        featuredFirst,
        gridPattern,
      }),
    [columnsLg, columnsMd, columnsSm, gap, featuredFirst, gridPattern],
  );

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
  const placeholderKey = "cards-offers-{*}";

  return (
    <ListingSection
      colorScheme={colorScheme}
      backgroundIntensity={backgroundIntensity}
      paddingY={paddingY}
      maxWidth={maxWidth}
      overlapTop={overlapTop}
      slot="offers-list-grid"
      entityName="offers"
      id={id}
      className={className}
    >
      {hasItems ? (
        <ItemListing
          items={items}
          getKey={(offer) => offer.id}
          displayOptions={{
            as: "ul",
            itemAs: "li",
            empty: <EmptyHint message={emptyStateMessage}>Offers</EmptyHint>,
          }}
          behaviorOptions={listingBehaviorOptions}
          styleOptions={{
            className: layoutClassName,
            itemClassName: "min-w-0",
          }}
          renderItem={renderOffer}
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
          Offers
        </ListingFallback>
      )}
    </ListingSection>
  );
}

export function Grid(props: OffersListGridProps) {
  return <OffersListGridInner {...props} />;
}

export const Default = Grid;
export default Grid;

function renderOfferCard({
  variant,
  offer,
  action,
  chrome,
}: {
  variant: OfferCardVariant;
  offer: OfferFlatItem;
  action: OfferCardAction;
  chrome?: CuratedCardChromeProps;
}) {
  const text = offer.extras?.text ?? offer.title ?? "";
  const token = offer.extras?.discountToken;
  const chromeProps = leafChromeProps(chrome);
  if (variant === "complex") {
    return (
      <OfferCardComplex
        text={text}
        href={offer.href}
        token={token}
        action={action}
        elevation="none"
        style="filled"
        padding="md"
        {...chromeProps}
      />
    );
  }
  if (variant === "deal") {
    return (
      <OfferCardDeal
        text={text}
        href={offer.href}
        token={token}
        action={action}
        elevation="sm"
        style="outline"
        padding="sm"
        className="border-2 border-accent-background"
        textClassName="font-semibold"
        {...chromeProps}
      />
    );
  }
  return (
    <OfferCardSimple
      text={text}
      href={offer.href}
      token={token}
      action={action}
      elevation="none"
      style="filled"
      padding="md"
      {...chromeProps}
    />
  );
}

export const componentType = "universal";
