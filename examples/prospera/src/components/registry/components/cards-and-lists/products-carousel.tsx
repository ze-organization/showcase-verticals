"use client";

import {
  type ComponentType,
  type ReactNode,
  useCallback,
  useMemo,
} from "react";
import {
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
  resolveNavigationLayoutParam,
  resolveSlideEmphasisParam,
} from "@/components/registry/blocks";
import {
  CarouselPreviewStrip,
  flatItemThumb,
  useCarouselPreviewStrip,
} from "@/components/registry/blocks/carousel-preview-strip";
import {
  Compact as ProductCardCompact,
  Default as ProductCardDefault,
  DetailPanel as ProductCardDetailPanel,
  HorizontalDetailed as ProductCardHorizontalDetailed,
  HorizontalEssential as ProductCardHorizontalEssential,
  Minimal as ProductCardMinimal,
  type ProductCardProps,
} from "@/components/registry/components/cards-and-lists/product-card";
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
  flatProductProps,
  type ProductCardVariant,
  type ProductFlatItem,
} from "./products-list-grid";

const PRODUCT_CARD_VARIANTS: Record<
  ProductCardVariant,
  ComponentType<ProductCardProps>
> = {
  default: ProductCardDefault,
  compact: ProductCardCompact,
  minimal: ProductCardMinimal,
  "horizontal-essential": ProductCardHorizontalEssential,
  "horizontal-detailed": ProductCardHorizontalDetailed,
  "detail-panel": ProductCardDetailPanel,
};

/**
 * `ProductsCarousel` — carousel sibling of `ProductsListGrid` for the
 * products family. Same composed/curated/search dispatch model and
 * datasource template — marked compatible so authors can swap layout
 * without re-binding.
 */
export interface ProductsCarouselProps
  extends SectionSurfaceProps,
    CuratedCardChromeProps {
  title?: TextSource;
  lead?: TextSource;
  headingLayout?: string;
  headingSize?: string;
  /** `band-heading-placement@1`: `above` (default) or `inline` (heading in the leading column, slides beside it). */
  headingPlacement?: string;

  items?: ProductFlatItem[];
  /**
   * `SearchConfig` datasource field — when populated and this
   * rendering is NOT inside a search experience, it fetches its own
   * results and they replace the curated `items`.
   */
  searchConfig?: SearchConfig;
  children?: ReactNode;
  rendering?: unknown;

  cardVariant?: ProductCardVariant;
  /**
   * Spotlight mode only — card shape for the non-active compact edge
   * slides. Unset keeps `cardVariant` on every slide.
   */
  compactSlideVariant?: ProductCardVariant;
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

function ProductsCarouselInner({
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
  slidesPerViewLg = 4,
  slidesPerViewMd = 2,
  slidesPerViewSm = 1,
  spaceBetween = 24,
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
}: ProductsCarouselProps & {
  layoutVariant:
    | "default"
    | "full-bleed"
    | "with-preview"
    | "hero"
    | "feature-spotlight";
}) {
  const items: ProductFlatItem[] = useResolvedListItems(
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

  const renderProduct = useCallback(
    (
      product: ProductFlatItem,
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
      const Variant = PRODUCT_CARD_VARIANTS[variantName] ?? ProductCardDefault;
      return (
        <Variant {...flatProductProps(product)} {...leafChromeProps(chrome)} />
      );
    },
    [cardVariant, compactSlideVariant, chrome],
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
  const placeholderKey = "cards-products-{*}";

  if (layoutVariant === "feature-spotlight" && items.length > 0) {
    return (
      <FeatureSpotlightLayout
        colorScheme={colorScheme}
        backgroundIntensity={backgroundIntensity}
        paddingY={paddingY}
        maxWidth={maxWidth}
        items={items}
        getKey={(product) => product.id}
        renderItem={renderProduct}
        title={title}
        lead={lead}
        cta={ctaLink}
        reversed={reversed}
        hideAccentLine={hideAccentLine}
        ariaLabel="Products"
        emptyStateMessage={
          typeof emptyStateMessage === "string" ? emptyStateMessage : "Products"
        }
        className={cn(
          "component products products-carousel",
          className?.trimEnd(),
        )}
        id={id}
        dataSlot="products-carousel"
      />
    );
  }

  return (
    <ListingSection
      colorScheme={colorScheme}
      backgroundIntensity={backgroundIntensity}
      paddingY={paddingY}
      maxWidth={maxWidth}
      overlapTop={overlapTop}
      slot="products-carousel"
      entityName="products"
      id={id}
      className={className}
    >
      {hasItems ? (
        <>
          <ItemCarousel
            setApi={showPreviewStrip ? previewStrip.setApi : undefined}
            items={items}
            getKey={(product) => product.id}
            resultControls={resultControls}
            heading={carouselHeading}
            headingPlacement={headingPlacement}
            renderItem={renderProduct}
            ariaLabel="Products"
            opts={{ align: "start" }}
            layoutOptions={slidesByBreakpoint}
            controlOptions={{
              navigation: (navigation ?? true) && items.length > 1,
              buttonPlacement: "outer",
              navigationLayout: resolveNavigationLayoutParam(navigationLayout),
              buttonStyle: navigationButtonStyle,
              buttonShape: navigationButtonShape,
              slideEmphasis: resolveSlideEmphasisParam(slideEmphasis),
              pagination: paginationStyle !== "none",
              autoplay: {
                enabled: Boolean(autoplay),
                delay: Math.max(1000, autoplayDelayMs),
                loop: Boolean(loop),
              },
            }}
          />
          {showPreviewStrip ? (
            <CarouselPreviewStrip<ProductFlatItem>
              items={items}
              getKey={(product) => product.id}
              getThumb={flatItemThumb}
              activeIndex={previewStrip.activeIndex}
              onSelect={previewStrip.scrollTo}
              ariaLabel="Products"
            />
          ) : null}
        </>
      ) : (
        <ListingFallback
          heading={carouselHeading}
          placeholderKey={placeholderKey}
          rendering={rendering}
          fallback={children}
          composedClassName="space-y-4"
          emptyStateMessage={emptyStateMessage}
        >
          Products
        </ListingFallback>
      )}
    </ListingSection>
  );
}

export function Default(props: ProductsCarouselProps) {
  return <ProductsCarouselInner {...props} layoutVariant="default" />;
}

export function FullBleed(props: ProductsCarouselProps) {
  return <ProductsCarouselInner {...props} layoutVariant="full-bleed" />;
}

export function WithPreviewBelow(props: ProductsCarouselProps) {
  return <ProductsCarouselInner {...props} layoutVariant="with-preview" />;
}

export function Hero(props: ProductsCarouselProps) {
  return <ProductsCarouselInner {...props} layoutVariant="hero" />;
}

export function FeatureSpotlight(props: ProductsCarouselProps) {
  return <ProductsCarouselInner {...props} layoutVariant="feature-spotlight" />;
}

export default Default;

export const componentType = "universal";
