"use client";

import { type ReactNode, useCallback, useMemo } from "react";
import {
  FeatureSpotlightLayout,
  ItemCarousel,
  type ItemCarouselButtonShape,
  type ItemCarouselButtonStyle,
  type ItemCarouselLayoutOptions,
  type ItemCarouselNavigationLayoutParam,
  ListingFallback,
  ListingSection,
  type ResultControlsProps,
  resolveNavigationLayoutParam,
  resolveSlideEmphasisParam,
} from "@/components/registry/blocks";
import type {
  ItemCardColorBand,
  ItemCardMediaBleed,
  ItemCardProps,
} from "@/components/registry/blocks/item-card";
import { StatsCard } from "@/components/registry/components/cards-and-lists/stats-card";
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
import type { StatFlatItem } from "./stats-list-grid";

/**
 * `StatsCarousel` — carousel sibling of `StatsListGrid` for the
 * stats family. Same composed/curated/search dispatch model and
 * datasource template — marked compatible so authors can swap layout
 * without re-binding.
 */
export interface StatsCarouselProps extends SectionSurfaceProps {
  title?: TextSource;
  lead?: TextSource;
  /** Optional kicker above the title (small-caps eyebrow). */
  eyebrow?: TextSource;
  headingLayout?: string;
  headingSize?: string;
  /** `band-heading-placement@1`: `above` (default) or `inline` (heading in the leading column, slides beside it). */
  headingPlacement?: string;

  items?: StatFlatItem[];
  /**
   * `SearchConfig` datasource field — when populated and this
   * rendering is NOT inside a search experience, it fetches its own
   * results and they replace the curated `items`.
   */
  searchConfig?: SearchConfig;
  children?: ReactNode;
  rendering?: unknown;

  style?: "flat" | "outline" | "filled" | "elevated";
  elevation?: "theme" | "none" | "xs" | "sm" | "base" | "md" | "lg";
  padding?: "sm" | "md" | "lg";
  cardColorScheme?: ItemCardProps["colorScheme"];
  colorBand?: ItemCardColorBand;
  mediaBleed?: ItemCardMediaBleed;
  align?: "start" | "center";
  trendDisplay?: "badge" | "text" | "none";
  tone?: "default" | "neutral" | "primary" | "success" | "warning";
  valueSize?: "default" | "large" | "xlarge";
  labelCase?: "default" | "uppercase";
  showLabel?: boolean;
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

function StatsCarouselInner({
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
  style = "outline",
  elevation = "theme",
  padding = "md",
  cardColorScheme,
  colorBand,
  mediaBleed,
  align = "start",
  trendDisplay = "badge",
  tone = "default",
  valueSize = "default",
  labelCase = "default",
  showLabel,
  slideEmphasis,
  slidesPerViewLg = 4,
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
}: StatsCarouselProps & {
  layoutVariant: "default" | "full-bleed" | "feature-spotlight";
}) {
  const items: StatFlatItem[] = useResolvedListItems(directItems, searchConfig, { rendering, allowCurated: true });

  const renderStat = useCallback(
    (stat: StatFlatItem) => (
      <StatsCard
        label={stat.extras?.label ?? stat.title}
        value={stat.extras?.value}
        change={stat.extras?.change}
        trend={stat.extras?.trend}
        context={stat.extras?.context}
        style={style}
        elevation={elevation}
        padding={padding}
        cardColorScheme={cardColorScheme}
        colorBand={colorBand}
        mediaBleed={mediaBleed}
        align={align}
        trendDisplay={trendDisplay}
        tone={tone}
        valueSize={valueSize}
        labelCase={labelCase}
        showLabel={showLabel}
      />
    ),
    [
      style,
      elevation,
      padding,
      cardColorScheme,
      colorBand,
      mediaBleed,
      align,
      trendDisplay,
      tone,
      valueSize,
      labelCase,
      showLabel,
    ],
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
  const placeholderKey = "cards-stats-{*}";

  if (layoutVariant === "feature-spotlight" && items.length > 0) {
    return (
      <FeatureSpotlightLayout
        colorScheme={colorScheme}
        backgroundIntensity={backgroundIntensity}
        paddingY={paddingY}
        maxWidth={maxWidth}
        items={items}
        getKey={(stat) => stat.id}
        renderItem={renderStat}
        title={title}
        lead={lead}
        eyebrow={eyebrow}
        cta={ctaLink}
        reversed={reversed}
        hideAccentLine={hideAccentLine}
        ariaLabel="Stats"
        emptyStateMessage={
          typeof emptyStateMessage === "string" ? emptyStateMessage : "Stats"
        }
        className={cn("component stats stats-carousel", className?.trimEnd())}
        id={id}
        dataSlot="stats-carousel"
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
      slot="stats-carousel"
      entityName="stats"
      id={id}
      className={className}
    >
      {hasItems ? (
        <ItemCarousel
          items={items}
          getKey={(stat) => stat.id}
          resultControls={resultControls}
          heading={carouselHeading}
          headingPlacement={headingPlacement}
          renderItem={renderStat}
          ariaLabel="Stats"
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
          placeholderKey={placeholderKey}
          rendering={rendering}
          fallback={children}
          composedClassName="space-y-4"
          emptyStateMessage={emptyStateMessage}
        >
          Stats
        </ListingFallback>
      )}
    </ListingSection>
  );
}

export function Default(props: StatsCarouselProps) {
  return <StatsCarouselInner {...props} layoutVariant="default" />;
}

export function FullBleed(props: StatsCarouselProps) {
  return <StatsCarouselInner {...props} layoutVariant="full-bleed" />;
}

export function FeatureSpotlight(props: StatsCarouselProps) {
  return <StatsCarouselInner {...props} layoutVariant="feature-spotlight" />;
}

export default Default;

export const componentType = "universal";
