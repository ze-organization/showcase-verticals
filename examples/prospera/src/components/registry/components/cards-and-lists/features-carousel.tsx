"use client";

import {
  type ComponentType,
  type ReactNode,
  useCallback,
  useMemo,
} from "react";
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
import {
  Default as FeatureCardDefault,
  IconTile as FeatureCardIconTile,
  MediaBanded as FeatureCardMediaBanded,
  MediaStacked as FeatureCardMediaStacked,
  NumberedTile as FeatureCardNumberedTile,
  type FeatureCardProps,
} from "@/components/registry/components/cards-and-lists/feature-card";
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
import { type FeatureFlatItem, flatFeatureProps } from "./features-list-grid";

type FeatureCardVariantName =
  | "default"
  | "numbered"
  | "media-banded"
  | "media-stacked"
  | "icon-tile";

const FEATURE_CARD_VARIANTS: Record<
  FeatureCardVariantName,
  ComponentType<FeatureCardProps>
> = {
  default: FeatureCardDefault,
  numbered: FeatureCardNumberedTile,
  "media-banded": FeatureCardMediaBanded,
  "media-stacked": FeatureCardMediaStacked,
  "icon-tile": FeatureCardIconTile,
};

/**
 * `FeaturesCarousel` — carousel sibling of `FeaturesListGrid` for the
 * features family. Same composed/curated/search dispatch model and
 * datasource template — marked compatible so authors can swap layout
 * without re-binding.
 *
 * Features are less commonly carousel'd than offers/products but the
 * shape is supported for cross-family consistency. Card variant in the
 * carousel defaults to the editorial `MediaStacked` treatment because
 * the slide format suits image-led cards better than the bare-text
 * `Default` shape.
 */
export interface FeaturesCarouselProps
  extends SectionSurfaceProps,
    CuratedCardChromeProps {
  title?: TextSource;
  lead?: TextSource;
  /** Optional kicker above the title (small-caps eyebrow). */
  eyebrow?: TextSource;
  headingLayout?: string;
  headingSize?: string;
  /** `band-heading-placement@1`: `above` (default) or `inline` (heading in the leading column, slides beside it). */
  headingPlacement?: string;

  items?: FeatureFlatItem[];
  /**
   * `SearchConfig` datasource field — when populated and this
   * rendering is NOT inside a search experience, it fetches its own
   * results and they replace the curated `items`.
   */
  searchConfig?: SearchConfig;
  children?: ReactNode;
  rendering?: unknown;

  cardVariant?: FeatureCardVariantName;
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

function FeaturesCarouselInner({
  title,
  lead,
  eyebrow,
  headingLayout,
  headingSize,
  headingPlacement,
  items: directItems,
  searchConfig,
  children,
  rendering,
  cardVariant: cardVariantProp,
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
  ctaPlacement,
  ctaIconTrailing,
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
}: FeaturesCarouselProps & {
  layoutVariant: "default" | "full-bleed" | "hero" | "feature-spotlight";
}) {
  const items: FeatureFlatItem[] = useResolvedListItems(
    directItems,
    searchConfig,
    { rendering, allowCurated: true },
  );

  const cardVariant: FeatureCardVariantName =
    cardVariantProp ??
    (layoutVariant === "hero" ? "media-banded" : "media-stacked");
  const Variant = FEATURE_CARD_VARIANTS[cardVariant];

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
      // Same omission the list-grid had: `FeatureCard` implements both,
      // the carousel never forwarded them, and because they arrive via
      // `CuratedCardChromeProps` they type-checked and were accepted in
      // silence. The two renderings share a datasource template so an
      // author swaps between them without re-binding — which makes a
      // param that works in the grid and does nothing in the carousel
      // the worst kind of inconsistency.
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

  const carouselHeading = useMemo(
    () => ({
      title,
      lead,
      eyebrow,
      layout: parseHeadingLayout(headingLayout, "start-with-section-divider"),
      headingOptions: { size: parseHeadingSize(headingSize, "default") },
    }),
    [title, lead, eyebrow, headingLayout, headingSize],
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

  const hasItems = items.length > 0;
  const placeholderKey = "cards-features-{*}";

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
          renderItem={renderFeature}
          title={title}
          lead={lead}
          eyebrow={eyebrow}
          cta={ctaLink}
          reversed={reversed}
          hideAccentLine={hideAccentLine}
          ariaLabel="Features"
          emptyStateMessage={
            typeof emptyStateMessage === "string"
              ? emptyStateMessage
              : "Features"
          }
          className={cn(
            "component features features-carousel",
            className?.trimEnd(),
          )}
          id={id}
          dataSlot="features-carousel"
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
        eyebrow={eyebrow}
        cta={ctaLink}
        reversed={reversed}
        hideAccentLine={hideAccentLine}
        ariaLabel="Features"
        className={cn(
          "component features features-carousel",
          className?.trimEnd(),
        )}
        id={id}
        dataSlot="features-carousel"
      >
        Features
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
      slot="features-carousel"
      entityName="features"
      id={id}
      className={className}
    >
      {hasItems ? (
        <ItemCarousel
          items={items}
          getKey={(item) => item.id}
          resultControls={resultControls}
          heading={carouselHeading}
          headingPlacement={headingPlacement}
          renderItem={renderFeature}
          ariaLabel="Features"
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
          composedOwnsHeading
          wrapComposed={(nodes) => (
            <ComposedItemCarousel
              nodes={nodes}
              ariaLabel="Features"
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
          Features
        </ListingFallback>
      )}
    </ListingSection>
  );
}

export function Default(props: FeaturesCarouselProps) {
  return <FeaturesCarouselInner {...props} layoutVariant="default" />;
}

export function FullBleed(props: FeaturesCarouselProps) {
  return <FeaturesCarouselInner {...props} layoutVariant="full-bleed" />;
}

export function Hero(props: FeaturesCarouselProps) {
  return <FeaturesCarouselInner {...props} layoutVariant="hero" />;
}

export function FeatureSpotlight(props: FeaturesCarouselProps) {
  return <FeaturesCarouselInner {...props} layoutVariant="feature-spotlight" />;
}

export default Default;

export const componentType = "universal";
