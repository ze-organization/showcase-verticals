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
  ImageLed as PersonCardImageLed,
  Overlay as PersonCardOverlay,
  Standard as PersonCardStandard,
} from "@/components/registry/components/cards-and-lists/person-card";
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
  flatPersonProps,
  type PersonCardVariant,
  type PersonFlatItem,
} from "./person-list-grid";

/**
 * `PersonCarousel` — carousel sibling of `PersonListGrid` for the
 * persons family. Same composed/curated/search dispatch model and
 * datasource template — marked compatible so authors can swap layout
 * without re-binding.
 */
export interface PersonCarouselProps
  extends SectionSurfaceProps,
    CuratedCardChromeProps {
  title?: TextSource;
  lead?: TextSource;
  headingLayout?: string;
  headingSize?: string;
  /** `band-heading-placement@1`: `above` (default) or `inline` (heading in the leading column, slides beside it). */
  headingPlacement?: string;

  items?: PersonFlatItem[];
  /**
   * `SearchConfig` datasource field — when populated and this
   * rendering is NOT inside a search experience, it fetches its own
   * results and they replace the curated `items`.
   */
  searchConfig?: SearchConfig;
  children?: ReactNode;
  rendering?: unknown;

  cardVariant?: PersonCardVariant;
  /**
   * Spotlight mode only — card shape for the non-active compact edge
   * slides. Unset keeps `cardVariant` on every slide.
   */
  compactSlideVariant?: PersonCardVariant;
  /** `carousel-slide-emphasis@1`: `uniform` (default) or `spotlight`. */
  slideEmphasis?: string;

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

function PersonCarouselInner({
  title,
  lead,
  headingLayout,
  headingSize,
  headingPlacement,
  items: directItems,
  searchConfig,
  children,
  rendering,
  cardVariant = "default",
  compactSlideVariant,
  slideEmphasis,
  elevation,
  padding,
  cardStyle,
  cardColorScheme,
  colorBand,
  titleLinkIcon,
  mediaBleed,
  mediaAspect,
  mediaShape,
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
}: PersonCarouselProps & {
  layoutVariant:
    | "default"
    | "full-bleed"
    | "with-preview"
    | "hero"
    | "feature-spotlight";
}) {
  const items: PersonFlatItem[] = useResolvedListItems(
    directItems,
    searchConfig,
    { rendering, allowCurated: true },
  );

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
    ],
  );

  const renderPerson = useCallback(
    (
      item: PersonFlatItem,
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
      const props = flatPersonProps(item);
      if (variantName === "overlay") {
        return <PersonCardOverlay {...props} mediaAspect={mediaAspect} />;
      }
      const chromeProps = leafChromeProps(chrome);
      if (variantName === "title-only" || variantName === "image-title-only") {
        return <PersonCardImageLed {...props} {...chromeProps} />;
      }
      return <PersonCardStandard {...props} {...chromeProps} />;
    },
    [cardVariant, compactSlideVariant, chrome, mediaAspect],
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

  // WithPreviewBelow: the thumbnail strip needs the Embla API, and hooks
  // cannot run conditionally, so the bookkeeping is always mounted and
  // only the strip's rendering is gated.
  const previewStrip = useCarouselPreviewStrip();
  const showPreviewStrip = layoutVariant === "with-preview";

  const hasItems = items.length > 0;
  const placeholderKey = "cards-persons-{*}";

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

  if (layoutVariant === "feature-spotlight") {
    if (items.length > 0) {
      return (
        <FeatureSpotlightLayout
          colorScheme={colorScheme}
          backgroundIntensity={backgroundIntensity}
          paddingY={paddingY}
          maxWidth={maxWidth}
          items={items}
          getKey={(item) => item.id}
          renderItem={renderPerson}
          title={title}
          lead={lead}
          cta={ctaLink}
          reversed={reversed}
          hideAccentLine={hideAccentLine}
          ariaLabel="People"
          emptyStateMessage={
            typeof emptyStateMessage === "string" ? emptyStateMessage : "People"
          }
          className={cn(
            "component persons person-carousel",
            className?.trimEnd(),
          )}
          id={id}
          dataSlot="person-carousel"
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
        ariaLabel="People"
        className={cn(
          "component persons person-carousel",
          className?.trimEnd(),
        )}
        id={id}
        dataSlot="person-carousel"
      >
        People
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
      slot="person-carousel"
      entityName="persons"
      id={id}
      className={className}
    >
      {hasItems ? (
        <>
          <ItemCarousel
            setApi={showPreviewStrip ? previewStrip.setApi : undefined}
            items={items}
            getKey={(item) => item.id}
            resultControls={resultControls}
            heading={carouselHeading}
            headingPlacement={headingPlacement}
            renderItem={renderPerson}
            ariaLabel="People"
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
            <CarouselPreviewStrip<PersonFlatItem>
              items={items}
              getKey={(item) => item.id}
              getThumb={flatItemThumb}
              activeIndex={previewStrip.activeIndex}
              onSelect={previewStrip.scrollTo}
              ariaLabel="People"
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
                ariaLabel="People"
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
                  ariaLabel="People"
                />
              ) : null}
            </>
          )}
        >
          People
        </ListingFallback>
      )}
    </ListingSection>
  );
}

export function Default(props: PersonCarouselProps) {
  return <PersonCarouselInner {...props} layoutVariant="default" />;
}

export function FullBleed(props: PersonCarouselProps) {
  return <PersonCarouselInner {...props} layoutVariant="full-bleed" />;
}

export function WithPreviewBelow(props: PersonCarouselProps) {
  return <PersonCarouselInner {...props} layoutVariant="with-preview" />;
}

export function Hero(props: PersonCarouselProps) {
  return <PersonCarouselInner {...props} layoutVariant="hero" />;
}

export function FeatureSpotlight(props: PersonCarouselProps) {
  return <PersonCarouselInner {...props} layoutVariant="feature-spotlight" />;
}

export default Default;

export const componentType = "universal";
