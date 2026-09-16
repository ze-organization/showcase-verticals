"use client";

import { type ReactNode, useCallback, useMemo } from "react";
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
  ImageLed as ArticleCardImageLed,
  Overlay as ArticleCardOverlay,
  Standard as ArticleCardStandard,
} from "@/components/registry/components/cards-and-lists/article-card";
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
  type ArticleCardVariant,
  type ArticleFlatItem,
  flatArticleProps,
} from "./articles-list-grid";

/**
 * `ArticlesCarousel` — carousel sibling of `ArticlesListGrid` for the
 * articles family. Same composed/curated/search dispatch model and
 * datasource template — marked compatible so authors can swap layout
 * without re-binding.
 */
export interface ArticlesCarouselProps
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

  items?: ArticleFlatItem[];
  /**
   * `SearchConfig` datasource field — when populated and this
   * rendering is NOT inside a search experience, it fetches its own
   * results and they replace the curated `items`.
   */
  searchConfig?: SearchConfig;
  children?: ReactNode;
  rendering?: unknown;

  cardVariant?: ArticleCardVariant;
  /**
   * Spotlight mode only — card shape for the non-active compact edge
   * slides. Unset keeps `cardVariant` on every slide.
   */
  compactSlideVariant?: ArticleCardVariant;
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

function ArticlesCarouselInner({
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
  ctaPlacement,
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
}: ArticlesCarouselProps & {
  layoutVariant:
    | "default"
    | "full-bleed"
    | "with-preview"
    | "hero"
    | "feature-spotlight"
    | "vertical-split";
}) {
  const items: ArticleFlatItem[] = useResolvedListItems(
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
      ctaPlacement,
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
    ],
  );

  const renderArticle = useCallback(
    (
      item: ArticleFlatItem,
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
      const props = flatArticleProps(item);
      if (variantName === "overlay") {
        return <ArticleCardOverlay {...props} mediaAspect={mediaAspect} />;
      }
      const chromeProps = leafChromeProps(chrome);
      if (variantName === "title-only" || variantName === "image-title-only") {
        return <ArticleCardImageLed {...props} {...chromeProps} />;
      }
      return <ArticleCardStandard {...props} {...chromeProps} />;
    },
    [cardVariant, compactSlideVariant, chrome, mediaAspect],
  );

  // VerticalSplit defaults the heading to the split arrangement so the
  // editorial panel holds the start half of the row and the vertical
  // list scrolls in the end half — the "half aligned on the page"
  // pattern (ketelone "Garnished with Good"). Authors can still pick
  // any HeadingLayout explicitly.
  const carouselHeading = useMemo(
    () => ({
      title,
      lead,
      eyebrow,
      layout: parseHeadingLayout(
        headingLayout,
        layoutVariant === "vertical-split"
          ? "split-start"
          : "start-with-section-divider",
      ),
      headingOptions: { size: parseHeadingSize(headingSize, "default") },
    }),
    [title, lead, eyebrow, headingLayout, headingSize, layoutVariant],
  );

  // WithPreviewBelow: the thumbnail strip needs the Embla API, and hooks
  // cannot run conditionally, so the bookkeeping is always mounted and
  // only the strip's rendering is gated.
  const previewStrip = useCarouselPreviewStrip();
  const showPreviewStrip = layoutVariant === "with-preview";

  const hasItems = items.length > 0;
  const placeholderKey = "cards-articles-{*}";

  // Hooks must run before any early return below (Rules of Hooks); this only
  // reads props so computing it unconditionally is free.
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
    if (layoutVariant === "vertical-split") {
      // Vertical column: two stories visible in a fixed-height
      // viewport, no breakpoint switching (the column width is
      // governed by the split heading's grid, not slide count).
      return {
        slidesPerView: 2,
        spaceBetween: Math.max(spaceBetween, 24),
        breakpoints: {},
        verticalViewportHeight: 560,
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

  if (layoutVariant === "feature-spotlight" && items.length > 0) {
    return (
      <FeatureSpotlightLayout
        colorScheme={colorScheme}
        backgroundIntensity={backgroundIntensity}
        paddingY={paddingY}
        maxWidth={maxWidth}
        items={items}
        getKey={(item) => item.id}
        renderItem={renderArticle}
        title={title}
        lead={lead}
        eyebrow={eyebrow}
        cta={ctaLink}
        reversed={reversed}
        hideAccentLine={hideAccentLine}
        ariaLabel="Articles"
        emptyStateMessage={
          typeof emptyStateMessage === "string" ? emptyStateMessage : "Articles"
        }
        className={cn(
          "component articles articles-carousel",
          className?.trimEnd(),
        )}
        id={id}
        dataSlot="articles-carousel"
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
      slot="articles-carousel"
      entityName="articles"
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
            renderItem={renderArticle}
            ariaLabel="Articles"
            orientation={
              layoutVariant === "vertical-split" ? "vertical" : "horizontal"
            }
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
            <CarouselPreviewStrip<ArticleFlatItem>
              items={items}
              getKey={(item) => item.id}
              getThumb={flatItemThumb}
              activeIndex={previewStrip.activeIndex}
              onSelect={previewStrip.scrollTo}
              ariaLabel="Articles"
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
          Articles
        </ListingFallback>
      )}
    </ListingSection>
  );
}

export function Default(props: ArticlesCarouselProps) {
  return <ArticlesCarouselInner {...props} layoutVariant="default" />;
}

export function FullBleed(props: ArticlesCarouselProps) {
  return <ArticlesCarouselInner {...props} layoutVariant="full-bleed" />;
}

export function WithPreviewBelow(props: ArticlesCarouselProps) {
  return <ArticlesCarouselInner {...props} layoutVariant="with-preview" />;
}

export function Hero(props: ArticlesCarouselProps) {
  return <ArticlesCarouselInner {...props} layoutVariant="hero" />;
}

export function FeatureSpotlight(props: ArticlesCarouselProps) {
  return <ArticlesCarouselInner {...props} layoutVariant="feature-spotlight" />;
}

/**
 * Vertical story list in a split row: editorial heading/lead hold the
 * start half, the articles scroll vertically in the end half with a
 * stacked up/down control column (inline navigation). The ketelone
 * "Garnished with Good" pattern.
 */
export function VerticalSplit(props: ArticlesCarouselProps) {
  return <ArticlesCarouselInner {...props} layoutVariant="vertical-split" />;
}

export default Default;

export const componentType = "universal";
