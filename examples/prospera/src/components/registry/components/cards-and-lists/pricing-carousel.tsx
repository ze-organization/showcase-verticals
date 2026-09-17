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
  ListingFallback,
  ListingSection,
  type ResultControlsProps,
  ensureCarouselOverflow,
  resolveNavigationLayoutParam,
  resolveSlideEmphasisParam,
} from "@/components/registry/blocks";
import { PricingCard } from "@/components/registry/components/cards-and-lists/pricing-card";
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
import { flatPricingProps, type PricingFlatItem } from "./pricing-list-grid";

/**
 * `PricingCarousel` — carousel sibling of `PricingListGrid` for the
 * pricing family. Same composed/curated/search dispatch model and
 * datasource template — marked compatible so authors can swap layout
 * without re-binding.
 */
export interface PricingCarouselProps
  extends SectionSurfaceProps,
    CuratedCardChromeProps {
  title?: TextSource;
  lead?: TextSource;
  headingLayout?: string;
  headingSize?: string;
  /** `band-heading-placement@1`: `above` (default) or `inline` (heading in the leading column, slides beside it). */
  headingPlacement?: string;

  items?: PricingFlatItem[];
  /**
   * `SearchConfig` datasource field — when populated and this
   * rendering is NOT inside a search experience, it fetches its own
   * results and they replace the curated `items`.
   */
  searchConfig?: SearchConfig;
  children?: ReactNode;
  rendering?: unknown;

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

function PricingCarouselInner({
  title,
  lead,
  headingLayout,
  headingSize,
  headingPlacement,
  items: directItems,
  searchConfig,
  children,
  rendering,
  slideEmphasis,
  elevation,
  padding,
  cardStyle,
  cardColorScheme,
  colorBand,
  titleLinkIcon,
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
}: PricingCarouselProps & {
  layoutVariant: "default" | "full-bleed" | "feature-spotlight";
}) {
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

  const renderPricing = useCallback(
    (plan: PricingFlatItem) => (
      <PricingCard {...flatPricingProps(plan)} {...leafChromeProps(chrome)} />
    ),
    [chrome],
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

  const hasItems = items.length > 0;
  const placeholderKey = "cards-pricing-{*}";

  if (layoutVariant === "feature-spotlight") {
    if (items.length > 0) {
      return (
        <FeatureSpotlightLayout
          colorScheme={colorScheme}
          backgroundIntensity={backgroundIntensity}
          paddingY={paddingY}
          maxWidth={maxWidth}
          items={items}
          getKey={(plan) => plan.id}
          renderItem={renderPricing}
          title={title}
          lead={lead}
          cta={ctaLink}
          reversed={reversed}
          hideAccentLine={hideAccentLine}
          ariaLabel="Pricing plans"
          emptyStateMessage={
            typeof emptyStateMessage === "string"
              ? emptyStateMessage
              : "Pricing plans"
          }
          className={cn(
            "component pricing pricing-carousel",
            className?.trimEnd(),
          )}
          id={id}
          dataSlot="pricing-carousel"
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
        ariaLabel="Pricing plans"
        className={cn(
          "component pricing pricing-carousel",
          className?.trimEnd(),
        )}
        id={id}
        dataSlot="pricing-carousel"
      >
        Pricing plans
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
      slot="pricing-carousel"
      entityName="pricing"
      id={id}
      className={className}
    >
      {hasItems ? (
        <ItemCarousel
          items={items}
          getKey={(plan) => plan.id}
          resultControls={resultControls}
          heading={carouselHeading}
          headingPlacement={headingPlacement}
          renderItem={renderPricing}
          ariaLabel="Pricing plans"
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
      ) : (
        <ListingFallback
          heading={carouselHeading}
          headingPlacement={headingPlacement}
          placeholderKey={placeholderKey}
          rendering={rendering}
          fallback={children}
          composedClassName="space-y-4"
          emptyStateMessage={emptyStateMessage}
          emptyClassName="flex min-h-[120px] items-center justify-center rounded-(--card-radius,var(--radius-lg)) border border-border border-dashed bg-muted/30 text-muted-foreground text-sm"
          composedOwnsHeading
          wrapComposed={(nodes) => (
            <ComposedItemCarousel
              nodes={nodes}
              ariaLabel="Pricing plans"
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
          )}
        >
          No pricing plans
        </ListingFallback>
      )}
    </ListingSection>
  );
}

export function Default(props: PricingCarouselProps) {
  return <PricingCarouselInner {...props} layoutVariant="default" />;
}

export function FullBleed(props: PricingCarouselProps) {
  return <PricingCarouselInner {...props} layoutVariant="full-bleed" />;
}

export function FeatureSpotlight(props: PricingCarouselProps) {
  return <PricingCarouselInner {...props} layoutVariant="feature-spotlight" />;
}

export default Default;

export const componentType = "universal";
