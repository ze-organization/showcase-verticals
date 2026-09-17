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
  CarouselPreviewStrip,
  ComposedCarouselPreviewStrip,
  flatItemThumb,
  useCarouselPreviewStrip,
} from "@/components/registry/blocks/carousel-preview-strip";
import {
  type OfferCardAction,
  Complex as OfferCardComplex,
  Deal as OfferCardDeal,
  Simple as OfferCardSimple,
  type OfferCardVariant,
} from "@/components/registry/components/cards-and-lists/offer-card";
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
import type { OfferFlatItem } from "./offers-list-grid";

/**
 * `OffersCarousel` — carousel sibling of `OffersListGrid` for the
 * offers family. Same composed/curated/search dispatch model and
 * datasource template — marked compatible so authors can swap layout
 * without re-binding.
 */
export interface OffersCarouselProps
  extends SectionSurfaceProps,
    CuratedCardChromeProps {
  title?: TextSource;
  lead?: TextSource;
  headingLayout?: string;
  headingSize?: string;
  /** `band-heading-placement@1`: `above` (default) or `inline` (heading in the leading column, slides beside it). */
  headingPlacement?: string;

  items?: OfferFlatItem[];
  /**
   * `SearchConfig` datasource field — when populated and this
   * rendering is NOT inside a search experience, it fetches its own
   * results and they replace the curated `items`.
   */
  searchConfig?: SearchConfig;
  children?: ReactNode;
  rendering?: unknown;

  cardVariant?: OfferCardVariant;
  /**
   * Spotlight mode only — card shape for the non-active compact edge
   * slides. Unset keeps `cardVariant` on every slide.
   */
  compactSlideVariant?: OfferCardVariant;
  /** `carousel-slide-emphasis@1`: `uniform` (default) or `spotlight`. */
  slideEmphasis?: string;
  action?: OfferCardAction;

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

function OffersCarouselInner({
  title,
  lead,
  headingLayout,
  headingSize,
  headingPlacement,
  items: directItems,
  searchConfig,
  children,
  rendering,
  cardVariant = "simple",
  compactSlideVariant,
  slideEmphasis,
  action = "auto",
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
  autoplay = false,
  autoplayDelayMs = 6000,
  loop = true,
  navigation = true,
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
}: OffersCarouselProps & {
  layoutVariant:
    | "default"
    | "full-bleed"
    | "with-preview"
    | "hero"
    | "feature-spotlight";
}) {
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
    (
      offer: OfferFlatItem,
      _index?: number,
      slideState?: ItemCarouselSlideState,
    ) => {
      // Spotlight compacts swap to the lighter CompactSlideVariant shape.
      const variantName =
        slideState?.emphasis === "spotlight" &&
        !slideState.isSpotlightActive &&
        compactSlideVariant
          ? compactSlideVariant
          : cardVariant;
      const text = offer.extras?.text ?? offer.title ?? "";
      const token = offer.extras?.discountToken;
      const chromeProps = leafChromeProps(chrome);
      if (variantName === "complex") {
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
      if (variantName === "deal") {
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
    },
    [action, cardVariant, compactSlideVariant, chrome],
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

  // WithPreviewBelow: the thumbnail strip needs the Embla API, and hooks
  // cannot run conditionally, so the bookkeeping is always mounted and
  // only the strip's rendering is gated.
  const previewStrip = useCarouselPreviewStrip();
  const showPreviewStrip = layoutVariant === "with-preview";

  const hasItems = items.length > 0;
  const placeholderKey = "cards-offers-{*}";

  if (layoutVariant === "feature-spotlight") {
    if (items.length > 0) {
      return (
        <FeatureSpotlightLayout
          colorScheme={colorScheme}
          backgroundIntensity={backgroundIntensity}
          paddingY={paddingY}
          maxWidth={maxWidth}
          items={items}
          getKey={(offer) => offer.id}
          renderItem={renderOffer}
          title={title}
          lead={lead}
          cta={ctaLink}
          reversed={reversed}
          hideAccentLine={hideAccentLine}
          ariaLabel="Offers"
          emptyStateMessage={
            typeof emptyStateMessage === "string" ? emptyStateMessage : "Offers"
          }
          className={cn(
            "component offers offers-carousel",
            className?.trimEnd(),
          )}
          id={id}
          dataSlot="offers-carousel"
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
        ariaLabel="Offers"
        className={cn("component offers offers-carousel", className?.trimEnd())}
        id={id}
        dataSlot="offers-carousel"
      >
        Offers
      </ComposedSpotlightFallback>
    );
  }

  return (
    <ListingSection
      colorScheme={colorScheme}
      backgroundIntensity={backgroundIntensity}
      paddingY={paddingY}
      maxWidth={maxWidth}
      overlapTop={overlapTop}
      slot="offers-carousel"
      entityName="offers"
      id={id}
      className={className}
    >
      {hasItems ? (
        <>
          <ItemCarousel
            setApi={showPreviewStrip ? previewStrip.setApi : undefined}
            items={items}
            getKey={(offer) => offer.id}
            resultControls={resultControls}
            heading={carouselHeading}
            headingPlacement={headingPlacement}
            renderItem={renderOffer}
            ariaLabel="Offers"
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
          />
          {showPreviewStrip ? (
            <CarouselPreviewStrip<OfferFlatItem>
              items={items}
              getKey={(offer) => offer.id}
              getThumb={flatItemThumb}
              activeIndex={previewStrip.activeIndex}
              onSelect={previewStrip.scrollTo}
              ariaLabel="Offers"
            />
          ) : null}
        </>
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
            <>
              <ComposedItemCarousel
                setApi={showPreviewStrip ? previewStrip.setApi : undefined}
                nodes={nodes}
                ariaLabel="Offers"
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
              />
              {showPreviewStrip ? (
                <ComposedCarouselPreviewStrip
                  nodes={nodes}
                  activeIndex={previewStrip.activeIndex}
                  onSelect={previewStrip.scrollTo}
                  ariaLabel="Offers"
                />
              ) : null}
            </>
          )}
        >
          Offers
        </ListingFallback>
      )}
    </ListingSection>
  );
}

export function Default(props: OffersCarouselProps) {
  return <OffersCarouselInner {...props} layoutVariant="default" />;
}

export function FullBleed(props: OffersCarouselProps) {
  return <OffersCarouselInner {...props} layoutVariant="full-bleed" />;
}

export function WithPreviewBelow(props: OffersCarouselProps) {
  return <OffersCarouselInner {...props} layoutVariant="with-preview" />;
}

export function Hero(props: OffersCarouselProps) {
  return <OffersCarouselInner {...props} layoutVariant="hero" />;
}

export function FeatureSpotlight(props: OffersCarouselProps) {
  return <OffersCarouselInner {...props} layoutVariant="feature-spotlight" />;
}

export default Default;

export const componentType = "universal";
