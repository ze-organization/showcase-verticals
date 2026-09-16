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
  Compact as DestinationCardCompact,
  Essential as DestinationCardEssential,
  Full as DestinationCardFull,
  Hero as DestinationCardHero,
  Highlight as DestinationCardHighlight,
  ListingHorizontalComprehensive as DestinationCardListingComprehensive,
  ListingHorizontal as DestinationCardListingHorizontal,
  type DestinationCardProps,
  Tile as DestinationCardTile,
  type DestinationCardVariant,
  type DestinationPriceTreatment,
} from "@/components/registry/components/cards-and-lists/destination-card";
import type { ImageSource } from "@/components/registry/primitives/editables/image";
import type { LinkSource } from "@/components/registry/primitives/editables/link";
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
 * `DestinationsListGrid` — Sitecore-aware list-or-grid rendering for
 * the destinations family. Composed/curated/search-driven by which
 * datasource field is populated:
 *
 *   - composed → placeholder children (destination-card@1 children)
 *   - curated  → `items` populated via Sitecore Treelist
 *   - search   → `items` populated by ambient `useSearchControllerContext`
 *
 * Marked compatible with `destinations-carousel@1` — both share the
 * destinations family datasource template so authors can swap layout
 * without re-binding.
 *
 * Flat props throughout — the Sitecore adapter unwraps fields/params
 * in `destinations.sitecore.ts`, including nested Activities and
 * Highlights (preserved in `extras` so search-mode faceting still works).
 */

export interface DestinationExtras {
  eyebrow?: TextSource;
  // Rich-text field (`destination-card@1` Description) — rendered via
  // RichText downstream, so it carries the rich source, not plain text.
  description?: RichTextSource;
  image?: ImageSource;
  link?: LinkSource;
  startingPrice?: TextSource;
  country?: TextSource;
  tripDuration?: TextSource;
  tripPeriods?: TextSource;
  temperatures?: TextSource;
  continent?: TextSource;
  rating?: number;
  reviewCount?: number;
  /** Preserved for faceting (search mode). */
  activities?: string[];
  /** Preserved for faceting (search mode). */
  highlights?: string[];
}

export type DestinationFlatItem = FlatItem<DestinationExtras>;

export interface DestinationsListGridProps
  extends SectionSurfaceProps,
    CuratedCardChromeProps {
  /** Heading content. */
  title?: TextSource;
  lead?: TextSource;
  /** Optional kicker above the title (small-caps eyebrow). */
  eyebrow?: TextSource;
  headingLayout?: string;
  headingSize?: string;

  /** Curated/search items. */
  items?: DestinationFlatItem[];
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
  cardVariant?: DestinationCardVariant;
  /** Card styling choice — `standard` vs `with-price` (StartingPrice badge). */
  priceTreatment?: DestinationPriceTreatment;

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
  | "stacked"
  | "split"
  | "inline"
  | "featured"
  | "fifty-fifty";

function DestinationsListGridInner({
  title,
  lead,
  eyebrow,
  headingLayout,
  headingSize,
  items: directItems,
  searchConfig,
  children,
  rendering,
  cardVariant = "tile",
  priceTreatment = "standard",
  elevation,
  padding,
  cardStyle,
  cardColorScheme,
  colorBand,
  titleLinkIcon,
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
}: DestinationsListGridProps & {
  layoutVariant: LayoutVariant;
}) {
  const items: DestinationFlatItem[] = useResolvedListItems(
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
    ],
  );

  const effectiveVariant = useMemo<DestinationCardVariant>(() => {
    if (layoutVariant === "stacked" || layoutVariant === "inline") {
      return cardVariant === "listing-horizontal-comprehensive"
        ? "listing-horizontal-comprehensive"
        : "listing-horizontal";
    }
    if (layoutVariant === "fifty-fifty") {
      return cardVariant === "hero" ? "hero" : "highlight";
    }
    return cardVariant;
  }, [layoutVariant, cardVariant]);

  const renderDestination = useCallback(
    (destination: DestinationFlatItem) =>
      renderDestinationCard({
        variant: effectiveVariant,
        priceTreatment,
        destination,
        chrome,
      }),
    [effectiveVariant, priceTreatment, chrome],
  );

  const layoutClassName = useMemo(() => {
    if (layoutVariant === "stacked") return itemListingLayouts.stacked_md;
    if (layoutVariant === "split") {
      return "grid gap-6 md:grid-cols-2";
    }
    if (layoutVariant === "fifty-fifty") {
      return "grid grid-cols-1 gap-6 md:grid-cols-2";
    }
    if (layoutVariant === "inline") return itemListingLayouts.stacked_sm;
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
        eyebrow,
        layout: parseHeadingLayout(headingLayout, "start-with-section-divider"),
        headingOptions: { size: parseHeadingSize(headingSize, "default") },
      },
      ...(resultControls ? { resultControls } : {}),
    }),
    [title, lead, eyebrow, headingLayout, headingSize, resultControls],
  );

  const hasItems = items.length > 0;
  const placeholderKey = "cards-destinations-{*}";

  return (
    <ListingSection
      colorScheme={colorScheme}
      backgroundIntensity={backgroundIntensity}
      paddingY={paddingY}
      maxWidth={maxWidth}
      overlapTop={overlapTop}
      slot="destinations-list-grid"
      entityName="destinations"
      id={id}
      className={className}
    >
      {hasItems ? (
        layoutVariant === "featured" ? (
          <FeaturedLayout
            items={items}
            priceTreatment={priceTreatment}
            chrome={chrome}
            title={title}
            lead={lead}
            eyebrow={eyebrow}
            headingLayout={headingLayout}
            resultControls={resultControls}
            emptyStateMessage={emptyStateMessage}
          />
        ) : (
          <ItemListing
            items={layoutVariant === "fifty-fifty" ? items.slice(0, 2) : items}
            getKey={(destination) => destination.id}
            displayOptions={{
              as: "ul",
              itemAs: "li",
              empty: (
                <EmptyHint message={emptyStateMessage}>Destinations</EmptyHint>
              ),
            }}
            behaviorOptions={listingBehaviorOptions}
            styleOptions={{
              className: layoutClassName,
              itemClassName: "min-w-0",
            }}
            renderItem={renderDestination}
          />
        )
      ) : (
        <ListingFallback
          heading={listingBehaviorOptions.heading}
          placeholderKey={placeholderKey}
          rendering={rendering}
          fallback={children}
          composedClassName={layoutClassName}
          emptyStateMessage={emptyStateMessage}
        >
          Destinations
        </ListingFallback>
      )}
    </ListingSection>
  );
}

export function Grid(props: DestinationsListGridProps) {
  return <DestinationsListGridInner {...props} layoutVariant="grid" />;
}

export function Stacked(props: DestinationsListGridProps) {
  return <DestinationsListGridInner {...props} layoutVariant="stacked" />;
}

export function Split(props: DestinationsListGridProps) {
  return <DestinationsListGridInner {...props} layoutVariant="split" />;
}

export function Inline(props: DestinationsListGridProps) {
  return <DestinationsListGridInner {...props} layoutVariant="inline" />;
}

export function Featured(props: DestinationsListGridProps) {
  return <DestinationsListGridInner {...props} layoutVariant="featured" />;
}

export function FiftyFifty(props: DestinationsListGridProps) {
  return <DestinationsListGridInner {...props} layoutVariant="fifty-fifty" />;
}

export const Default = Grid;
export default Grid;

function destinationToCardProps(
  destination: DestinationFlatItem,
): DestinationCardProps {
  const extras = destination.extras ?? {};
  return {
    title: destination.title,
    eyebrow: extras.eyebrow,
    description: extras.description,
    image:
      extras.image ??
      (destination.image
        ? {
            src: destination.image.src,
            alt: destination.image.alt ?? destination.title ?? "Destination",
          }
        : undefined),
    link:
      extras.link ??
      (destination.href ? { href: destination.href } : undefined),
    startingPrice: extras.startingPrice,
    activities: extras.activities,
    highlights: extras.highlights,
    country: extras.country,
    tripDuration: extras.tripDuration,
    tripPeriods: extras.tripPeriods,
    temperatures: extras.temperatures,
    continent: extras.continent,
    rating: extras.rating,
    reviewCount: extras.reviewCount,
  };
}

function renderDestinationCard({
  variant,
  priceTreatment,
  destination,
  chrome,
}: {
  variant: DestinationCardVariant;
  priceTreatment: DestinationPriceTreatment;
  destination: DestinationFlatItem;
  chrome?: CuratedCardChromeProps;
}) {
  const cardProps: DestinationCardProps = {
    ...destinationToCardProps(destination),
    priceTreatment,
    ...leafChromeProps(chrome),
  };
  switch (variant) {
    case "compact":
      return <DestinationCardCompact {...cardProps} />;
    case "essential":
      return <DestinationCardEssential {...cardProps} />;
    case "hero":
      return <DestinationCardHero {...cardProps} />;
    case "highlight":
      return <DestinationCardHighlight {...cardProps} />;
    case "tile":
      return <DestinationCardTile {...cardProps} />;
    case "listing-horizontal":
      return <DestinationCardListingHorizontal {...cardProps} />;
    case "listing-horizontal-comprehensive":
      return <DestinationCardListingComprehensive {...cardProps} />;
    default:
      return <DestinationCardFull {...cardProps} />;
  }
}

function FeaturedLayout({
  items,
  priceTreatment,
  chrome,
  title,
  lead,
  eyebrow,
  headingLayout,
  headingSize,
  resultControls,
  emptyStateMessage,
}: {
  items: DestinationFlatItem[];
  priceTreatment: DestinationPriceTreatment;
  chrome?: CuratedCardChromeProps;
  title?: TextSource;
  lead?: TextSource;
  /** Optional kicker above the title (small-caps eyebrow). */
  eyebrow?: TextSource;
  headingLayout?: string;
  headingSize?: string;
  resultControls?: ResultControlsProps;
  emptyStateMessage?: TextSource;
}) {
  const [featured, ...rest] = items;
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

  return (
    <ItemListing
      items={[null]}
      getKey={() => "featured-layout"}
      displayOptions={{
        as: "div",
        itemAs: "div",
        empty: <EmptyHint message={emptyStateMessage}>Destinations</EmptyHint>,
      }}
      behaviorOptions={listingBehaviorOptions}
      styleOptions={{ className: "", itemClassName: "" }}
      renderItem={() => (
        <div className="grid gap-6 lg:grid-cols-3">
          {featured ? (
            <div className="min-w-0 lg:col-span-2">
              {renderDestinationCard({
                variant: "hero",
                priceTreatment,
                destination: featured,
                chrome,
              })}
            </div>
          ) : null}
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {rest.slice(0, 3).map((destination) => (
              <li key={destination.id} className="min-w-0">
                {renderDestinationCard({
                  variant: "listing-horizontal",
                  priceTreatment,
                  destination,
                  chrome,
                })}
              </li>
            ))}
          </ul>
        </div>
      )}
    />
  );
}

export const componentType = "universal";
