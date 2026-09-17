"use client";

import { type ReactNode, useCallback, useMemo } from "react";
import {
  ComposedItemCarousel,
  ComposedSpotlightFallback,
  FeatureSpotlightLayout,
  ItemCarousel,
  type ItemCarouselButtonShape,
  type ItemCarouselButtonStyle,
  type ItemCarouselLayoutOptions,
  type ItemCarouselNavigationLayoutParam,
  type ItemCarouselSlideState,
  ListingFallback,
  ListingSection,
  type ResultControlsProps,
  ensureCarouselOverflow,
  resolveNavigationLayoutParam,
  resolveSlideEmphasisParam,
} from "@/components/registry/blocks";
import {
  Default as ReviewCardDefault,
  Quote as ReviewCardQuote,
} from "@/components/registry/components/cards-and-lists/review-card";
import type { LinkSource } from "@/components/registry/primitives/editables/link";
import type { TextSource } from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import type { SearchConfig } from "@/lib/registry/search/types";
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
  flatReviewProps,
  type ReviewFlatItem,
  type ReviewsCardVariant,
} from "./reviews-list-grid";

/**
 * `ReviewsCarousel` — carousel sibling of `ReviewsListGrid` for the
 * reviews family. Same composed/curated/search dispatch model and
 * datasource template — marked compatible so authors can swap layout
 * without re-binding.
 */
export interface ReviewsCarouselProps
  extends SectionSurfaceProps,
    CuratedCardChromeProps {
  title?: TextSource;
  lead?: TextSource;
  headingLayout?: string;
  headingSize?: string;
  /** `band-heading-placement@1`: `above` (default) or `inline` (heading in the leading column, slides beside it). */
  headingPlacement?: string;

  items?: ReviewFlatItem[];
  /**
   * `SearchConfig` datasource field — when populated and this
   * rendering is NOT inside a search experience, it fetches its own
   * results and they replace the curated `items`.
   */
  searchConfig?: SearchConfig;
  children?: ReactNode;
  rendering?: unknown;

  cardVariant?: ReviewsCardVariant;
  /**
   * Spotlight mode only — card shape for the non-active compact edge
   * slides. Unset keeps `cardVariant` on every slide.
   */
  compactSlideVariant?: ReviewsCardVariant;
  /** `carousel-slide-emphasis@1`: `uniform` (default) or `spotlight`. */
  slideEmphasis?: string;
  /** Show avatar + review image inside `card` variant. Undefaulted so Sitecore standard values drive the truthy state. */
  showImages?: boolean;

  slidesPerViewLg?: number;
  slidesPerViewMd?: number;
  slidesPerViewSm?: number;
  spaceBetween?: number;
  autoplay?: boolean;
  autoplayDelayMs?: number;
  loop?: boolean;
  navigation?: boolean;
  navigationLayout?: ItemCarouselNavigationLayoutParam;
  /** Navigation-button chrome preset (outline / solid / ghost). */
  navigationButtonStyle?: ItemCarouselButtonStyle;
  /** Navigation-button corner shape (pill default / square). */
  navigationButtonShape?: ItemCarouselButtonShape;
  pagination?: "none" | "dots" | "numbers" | "progress";

  resultControls?: ResultControlsProps;
  emptyStateMessage?: TextSource;

  /** FeatureSpotlight CTA — shown under the editorial lead in the spotlight panel. */
  ctaLink?: LinkSource;
  /** FeatureSpotlight only — flip the text panel to the end side. */
  reversed?: boolean;
  /** FeatureSpotlight only — hide the accent rule under the title. */
  hideAccentLine?: boolean;

  className?: string;
  id?: string;
}

function ReviewsCarouselInner({
  title,
  lead,
  headingLayout,
  headingSize,
  headingPlacement,
  items: directItems,
  searchConfig,
  children,
  rendering,
  cardVariant = "card",
  compactSlideVariant,
  slideEmphasis,
  showImages,
  elevation,
  padding,
  cardStyle,
  cardColorScheme,
  colorBand,
  mediaBleed,
  mediaAspect,
  slidesPerViewLg = 3,
  slidesPerViewMd = 2,
  slidesPerViewSm = 1,
  spaceBetween = 16,
  autoplay,
  autoplayDelayMs = 6000,
  loop,
  navigation,
  navigationLayout = "inline",
  navigationButtonStyle,
  navigationButtonShape,
  pagination: paginationStyle = "none",
  resultControls,
  emptyStateMessage,
  ctaLink,
  reversed,
  hideAccentLine,
  colorScheme,
  backgroundIntensity,
  paddingY,
  maxWidth,
  overlapTop,
  className,
  id,
  layoutVariant,
}: ReviewsCarouselProps & {
  layoutVariant:
    | "carousel-card"
    | "carousel-quote"
    | "full-bleed"
    | "hero"
    | "feature-spotlight";
}) {
  const items: ReviewFlatItem[] = useResolvedListItems(
    directItems,
    searchConfig,
    { rendering, allowCurated: true },
  );

  // CarouselQuote / Hero lock card-variant to "quote"; CarouselCard /
  // FullBleed default to the prop. The Quote variant is the canonical
  // testimonial-carousel shape.
  const effectiveCardVariant: ReviewsCardVariant =
    layoutVariant === "carousel-quote" || layoutVariant === "hero"
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
    (
      review: ReviewFlatItem,
      _index?: number,
      slideState?: ItemCarouselSlideState,
    ) => {
      // Spotlight compacts swap to the lighter CompactSlideVariant shape.
      const variantName =
        slideState?.emphasis === "spotlight" &&
        !slideState.isSpotlightActive &&
        compactSlideVariant
          ? compactSlideVariant
          : effectiveCardVariant;
      const Variant =
        variantName === "quote" ? ReviewCardQuote : ReviewCardDefault;
      return (
        <Variant
          {...flatReviewProps(review)}
          {...(showImages !== undefined ? { showImages } : {})}
          {...leafChromeProps(chrome)}
        />
      );
    },
    [effectiveCardVariant, compactSlideVariant, showImages, chrome],
  );

  const carouselHeading = useMemo(
    () => ({
      title,
      lead,
      layout: parseHeadingLayout(headingLayout, "start-with-section-divider"),
      headingOptions: { size: parseHeadingSize(headingSize, "default") },
    }),
    [title, lead, headingLayout, headingSize],
  );

  const hasItems = items.length > 0;
  const placeholderKey = "cards-reviews-{*}";

  const slidesByBreakpoint = useMemo((): ItemCarouselLayoutOptions => {
    if (layoutVariant === "full-bleed") {
      return {
        slidesPerView: 1.1,
        spaceBetween,
        breakpoints: {
          768: { slidesPerView: 1.2, spaceBetween },
          1024: { slidesPerView: 1.4, spaceBetween },
        },
      };
    }
    if (layoutVariant === "hero") {
      return {
        slidesPerView: 1,
        spaceBetween,
        breakpoints: {
          1024: { slidesPerView: 1.05, spaceBetween },
        },
      };
    }
    if (layoutVariant === "carousel-quote") {
      // Testimonial carousels favour a single roomy slide.
      return {
        slidesPerView: 1,
        spaceBetween,
        breakpoints: {
          1024: { slidesPerView: 1, spaceBetween },
        },
      };
    }
    return {
      slidesPerView: slidesPerViewSm,
      spaceBetween,
      breakpoints: {
        768: { slidesPerView: slidesPerViewMd, spaceBetween },
        1024: { slidesPerView: slidesPerViewLg, spaceBetween },
      },
    };
  }, [
    layoutVariant,
    slidesPerViewLg,
    slidesPerViewMd,
    slidesPerViewSm,
    spaceBetween,
  ]);

  if (layoutVariant === "feature-spotlight") {
    if (items.length > 0) {
      return (
        <FeatureSpotlightLayout
          colorScheme={colorScheme}
          backgroundIntensity={backgroundIntensity}
          paddingY={paddingY}
          maxWidth={maxWidth}
          items={items}
          getKey={(review) => review.id}
          renderItem={renderReview}
          title={title}
          lead={lead}
          cta={ctaLink}
          reversed={reversed}
          hideAccentLine={hideAccentLine}
          ariaLabel="Reviews"
          emptyStateMessage={
            typeof emptyStateMessage === "string" ? emptyStateMessage : "Reviews"
          }
          className={cn(
            "component reviews reviews-carousel",
            className?.trimEnd(),
          )}
          id={id}
          dataSlot="reviews-carousel"
        />
      );
    }
    return (
      <ComposedSpotlightFallback
        placeholderKey={placeholderKey}
        rendering={rendering}
        fallback={children}
        emptyStateMessage={emptyStateMessage}
        colorScheme={colorScheme}
        backgroundIntensity={backgroundIntensity}
        paddingY={paddingY}
        maxWidth={maxWidth}
        title={title}
        lead={lead}
        cta={ctaLink}
        reversed={reversed}
        hideAccentLine={hideAccentLine}
        ariaLabel="Reviews"
        className={cn(
          "component reviews reviews-carousel",
          className?.trimEnd(),
        )}
        id={id}
        dataSlot="reviews-carousel"
      >
        Reviews
      </ComposedSpotlightFallback>
    );
  }

  const containerMaxWidthClass =
    layoutVariant === "carousel-quote" || layoutVariant === "hero"
      ? "max-w-4xl"
      : "max-w-6xl";

  return (
    <ListingSection
      colorScheme={colorScheme}
      backgroundIntensity={backgroundIntensity}
      paddingY={paddingY}
      maxWidth={maxWidth}
      overlapTop={overlapTop}
      slot="reviews-carousel"
      entityName="reviews"
      id={id}
      className={className}
      innerMaxWidth={containerMaxWidthClass}
    >
      {hasItems ? (
        <ItemCarousel
          items={items}
          getKey={(review) => review.id}
          resultControls={resultControls}
          heading={carouselHeading}
          headingPlacement={headingPlacement}
          renderItem={renderReview}
          ariaLabel="Reviews"
          opts={{ align: "start" }}
          layoutOptions={slidesByBreakpoint}
          controlOptions={{
            navigation: navigation && items.length > 1,
            buttonPlacement: "outer",
            navigationLayout: resolveNavigationLayoutParam(navigationLayout),
            buttonStyle: navigationButtonStyle,
            buttonShape: navigationButtonShape,
            slideEmphasis: resolveSlideEmphasisParam(slideEmphasis),
            pagination: paginationStyle !== "none",
            autoplay: {
              enabled: autoplay,
              delay: Math.max(1000, autoplayDelayMs),
              loop,
            },
          }}
          itemInnerClassName="px-2"
        />
      ) : (
        <ListingFallback
          heading={carouselHeading}
          headingPlacement={headingPlacement}
          placeholderKey={placeholderKey}
          rendering={rendering}
          fallback={children}
          composedClassName="space-y-4"
          emptyStateMessage={emptyStateMessage}
          composedOwnsHeading
          wrapComposed={(nodes) => (
            <ComposedItemCarousel
              nodes={nodes}
              ariaLabel="Reviews"
              heading={carouselHeading}
              headingPlacement={headingPlacement}
              resultControls={resultControls}
              opts={{ align: "start" }}
              layoutOptions={ensureCarouselOverflow(
                slidesByBreakpoint,
                nodes.length,
              )}
              controlOptions={{
                navigation: navigation && nodes.length > 1,
                buttonPlacement: "outer",
                navigationLayout:
                  resolveNavigationLayoutParam(navigationLayout),
                buttonStyle: navigationButtonStyle,
                buttonShape: navigationButtonShape,
                slideEmphasis: resolveSlideEmphasisParam(slideEmphasis),
                pagination: paginationStyle !== "none",
                autoplay: {
                  enabled: autoplay,
                  delay: Math.max(1000, autoplayDelayMs),
                  loop,
                },
              }}
              itemInnerClassName="px-2"
            />
          )}
        >
          Reviews
        </ListingFallback>
      )}
    </ListingSection>
  );
}

export function CarouselCard(props: ReviewsCarouselProps) {
  return <ReviewsCarouselInner {...props} layoutVariant="carousel-card" />;
}

export function CarouselQuote(props: ReviewsCarouselProps) {
  return <ReviewsCarouselInner {...props} layoutVariant="carousel-quote" />;
}

export function FullBleed(props: ReviewsCarouselProps) {
  return <ReviewsCarouselInner {...props} layoutVariant="full-bleed" />;
}

export function Hero(props: ReviewsCarouselProps) {
  return <ReviewsCarouselInner {...props} layoutVariant="hero" />;
}

export function FeatureSpotlight(props: ReviewsCarouselProps) {
  return <ReviewsCarouselInner {...props} layoutVariant="feature-spotlight" />;
}

export const Default = CarouselCard;
export default CarouselCard;

export const componentType = "universal";
