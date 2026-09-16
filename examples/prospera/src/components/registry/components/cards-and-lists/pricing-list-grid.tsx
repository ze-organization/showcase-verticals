"use client";

import { type ReactNode, useCallback, useMemo } from "react";
import {
  EmptyHint,
  ItemListing,
  ListingFallback,
  ListingSection,
  type ResultControlsProps,
} from "@/components/registry/blocks";
import { PricingCard } from "@/components/registry/components/cards-and-lists/pricing-card";
import type { LinkSource } from "@/components/registry/primitives/editables/link";
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
 * `PricingListGrid` — Sitecore-aware list-or-grid rendering for the
 * pricing family. Composed/curated/search-driven by which datasource
 * field is populated:
 *
 *   - composed → placeholder children (pricing-card@1 children)
 *   - curated  → `items` populated via Sitecore Treelist
 *   - search   → `items` populated by ambient `useSearchControllerContext`
 *
 * Marked compatible with `pricing-carousel@1`. Authors swap layout
 * without re-binding because both renderings share the pricing family's
 * datasource template.
 *
 * Flat props throughout — the Sitecore adapter unwraps fields/params
 * in `pricing.sitecore.ts`, so this file is runnable in Storybook with
 * plain values.
 */

export type PricingExtras = {
  /** Pricing copy. */
  name?: TextSource;
  price?: TextSource;
  currency?: string;
  description?: TextSource;
  /** Multi-line Features field (or split strings from search). */
  features?: TextSource | string[];
  /** Highlight flag — undefaulted (Sitecore standard values drive truthiness). */
  highlighted?: boolean;
  highlightLabel?: TextSource;
  pricePeriod?: TextSource;
  /** Optional CTA. */
  ctaLabel?: TextSource;
  ctaLink?: LinkSource;
};

export type PricingFlatItem = FlatItem<PricingExtras>;

export interface PricingListGridProps
  extends SectionSurfaceProps,
    CuratedCardChromeProps {
  /** Heading content. */
  title?: TextSource;
  lead?: TextSource;
  headingLayout?: string;
  headingSize?: string;

  /** Curated/search items. */
  items?: PricingFlatItem[];
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

/**
 * Shared body — picks data source, lays out items. Variants vary only
 * by the grid/listing className they pass in.
 */
function PricingListGridInner({
  title,
  lead,
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
  ctaIconTrailing,
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
}: PricingListGridProps) {
  const items: PricingFlatItem[] = useResolvedListItems(
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
      // `PricingCard` declares it, destructures it and hands it to its
      // ItemCard shell; both pricing containers built their chrome object
      // without it. Same silent-acceptance path as the features fixes —
      // it arrives via `CuratedCardChromeProps`, so nothing complained.
      titleLinkIcon,
      ctaIconTrailing,
      mediaBleed,
      mediaAspect,
    }),
    [
      titleLinkIcon,
      elevation,
      padding,
      cardStyle,
      cardColorScheme,
      colorBand,
      ctaIconTrailing,
      mediaBleed,
      mediaAspect,
    ],
  );

  const renderPricing = useCallback(
    (plan: PricingFlatItem) => renderPricingCard(plan, chrome),
    [chrome],
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
  const placeholderKey = "cards-pricing-{*}";

  return (
    <ListingSection
      colorScheme={colorScheme}
      backgroundIntensity={backgroundIntensity}
      paddingY={paddingY}
      maxWidth={maxWidth}
      overlapTop={overlapTop}
      slot="pricing-list-grid"
      entityName="pricing"
      id={id}
      className={className}
    >
      {hasItems ? (
        <ItemListing
          items={items}
          getKey={(plan) => plan.id}
          displayOptions={{
            as: "ul",
            itemAs: "li",
            empty: (
              <EmptyHint message={emptyStateMessage}>
                No pricing plans
              </EmptyHint>
            ),
          }}
          behaviorOptions={listingBehaviorOptions}
          styleOptions={{
            className: layoutClassName,
            itemClassName: "min-w-0",
          }}
          renderItem={renderPricing}
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
          No pricing plans
        </ListingFallback>
      )}
    </ListingSection>
  );
}

export function Grid(props: PricingListGridProps) {
  return <PricingListGridInner {...props} />;
}

export const Default = Grid;
export default Grid;

export function flatPricingProps(plan: PricingFlatItem) {
  const extras = plan.extras ?? {};
  return {
    name: extras.name ?? (plan.title ? { value: plan.title } : undefined),
    price: extras.price,
    features: extras.features,
    highlighted: extras.highlighted,
    highlightLabel: extras.highlightLabel,
    pricePeriod: extras.pricePeriod,
    ctaLabel: extras.ctaLabel,
    ctaLink: extras.ctaLink,
  };
}

function renderPricingCard(
  plan: PricingFlatItem,
  chrome?: CuratedCardChromeProps,
) {
  return (
    <PricingCard {...flatPricingProps(plan)} {...leafChromeProps(chrome)} />
  );
}

export const componentType = "universal";
