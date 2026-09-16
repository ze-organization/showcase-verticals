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
  Compact as LocationCardCompact,
  Default as LocationCardDefault,
  Inline as LocationCardInline,
  Pin as LocationCardPin,
} from "@/components/registry/components/cards-and-lists/location-card";
import type { SectionSurfaceProps } from "@/lib/registry/section-surface";
import { Placeholder } from "@/lib/registry/sitecore";

type LocationCardVariant = "default" | "compact" | "inline" | "pin";

// Every name used to resolve to `Compact` — "the leaf currently ships
// only the Compact cell suited to carousel use". But `CardVariant`'s
// hint promises "compact (default), default, inline, or pin", and the
// leaf exports all four, so the droplist offered three values that
// rendered identically to the fourth. A lookup whose entries are the
// same object is invisible to the drift gate — it sees `cardVariant`
// read and cannot see that the branches agree — which is why this
// survived until the render-diff probe.
const LOCATION_CARD_VARIANTS: Record<
  LocationCardVariant,
  typeof LocationCardCompact
> = {
  default: LocationCardDefault,
  compact: LocationCardCompact,
  inline: LocationCardInline,
  pin: LocationCardPin,
};

import type { LinkSource } from "@/components/registry/primitives/editables/link";
import type { RichTextSource } from "@/components/registry/primitives/editables/richtext";
import type { TextSource } from "@/components/registry/primitives/editables/text";
import { useSearchControllerContext } from "@/lib/registry/search/search-controller-context";
import type { FlatItem, SearchConfig } from "@/lib/registry/search/types";
import { useResolvedListItems } from "@/lib/registry/search/use-resolved-list-items";
import { LocationsMapProvider } from "@/lib/registry/maps/locations-map-context";
import { itemsFromComposedLocationCards } from "./locations.sitecore";
import {
  parseHeadingLayout,
  parseHeadingSize,
} from "../layout/section-wrapper";
import {
  type CuratedCardChromeProps,
  leafChromeProps,
} from "./_card-chrome-adapter";

/**
 * `LocationsCarousel` — carousel sibling of `LocationsListGrid` for the
 * locations family. Same composed/curated/search dispatch model and
 * datasource template — marked compatible so authors can swap layout
 * without re-binding.
 *
 * The `MapAbove` variant renders a full-width Sitecore `Placeholder`
 * map slot (`locations-map-<id>`) above the carousel. Authors drop a
 * map block into that slot; renderings of the locations family bind
 * to the same ambient search controller so the map and carousel stay
 * in sync.
 */

/** Extras carried per location alongside the shared FlatItem envelope. */
export interface LocationExtras {
  address1?: TextSource;
  address2?: TextSource;
  city?: TextSource;
  state?: TextSource;
  postalCode?: TextSource;
  country?: TextSource;
  phone?: TextSource;
  email?: TextSource;
  hours?: RichTextSource;
  link?: LinkSource;
  lat?: number;
  lng?: number;
  distance?: number;
  distanceUnit?: "mi" | "km";
}

export type LocationFlatItem = FlatItem<LocationExtras>;

export interface LocationsCarouselProps
  extends SectionSurfaceProps,
    CuratedCardChromeProps {
  title?: TextSource;
  lead?: TextSource;
  headingLayout?: string;
  headingSize?: string;
  /** `band-heading-placement@1`: `above` (default) or `inline` (heading in the leading column, slides beside it). */
  headingPlacement?: string;

  items?: LocationFlatItem[];
  /**
   * `SearchConfig` datasource field — when populated and this
   * rendering is NOT inside a search experience, it fetches its own
   * results and they replace the curated `items`.
   */
  searchConfig?: SearchConfig;
  children?: ReactNode;
  rendering?: unknown;

  /** Card-shape choice (datasource field). */
  cardVariant?: LocationCardVariant;
  /**
   * Spotlight mode only — card shape for the non-active compact edge
   * slides. Unset keeps `cardVariant` on every slide.
   */
  compactSlideVariant?: LocationCardVariant;
  /** `carousel-slide-emphasis@1`: `uniform` (default) or `spotlight`. */
  slideEmphasis?: string;

  /**
   * SXA dynamic-placeholder suffix. Concatenated with the `locations-map-`
   * prefix to form the per-placement slot key for the `MapAbove`
   * variant.
   */
  dynamicPlaceholderId?: string;

  /** Carousel layout knobs. */
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

function LocationsCarouselInner({
  title,
  lead,
  headingLayout,
  headingSize,
  headingPlacement,
  items: directItems,
  searchConfig,
  children,
  rendering,
  cardVariant = "compact",
  compactSlideVariant,
  slideEmphasis,
  dynamicPlaceholderId,
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
}: LocationsCarouselProps & {
  layoutVariant:
    | "default"
    | "map-above"
    | "full-bleed"
    | "with-preview"
    | "hero"
    | "feature-spotlight";
}) {
  // The items resolver hides the controller, but the distance pill needs
  // its geo state, so read the ambient controller directly. Self-contained
  // search has no ambient controller and falls back to the default unit.
  const controller = useSearchControllerContext();
  const resolvedItems: LocationFlatItem[] = useResolvedListItems(
    directItems,
    searchConfig,
    { rendering, allowCurated: true },
  );
  const composedItems = useMemo(
    () => itemsFromComposedLocationCards(rendering, dynamicPlaceholderId),
    [rendering, dynamicPlaceholderId],
  );
  const items: LocationFlatItem[] =
    resolvedItems.length > 0 ? resolvedItems : composedItems;

  // Surface the controller's chosen distance unit on each card so the
  // distance pill renders consistently in search mode without each card
  // re-reading the controller.
  const unitFromController = controller?.location?.unit;
  const itemsWithDistance = useMemo<LocationFlatItem[]>(() => {
    if (!unitFromController) return items;
    return items.map((item) => ({
      ...item,
      extras: {
        ...item.extras,
        distanceUnit: item.extras?.distanceUnit ?? unitFromController,
      },
    }));
  }, [items, unitFromController]);

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

  const renderLocation = useCallback(
    (
      item: LocationFlatItem,
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
      const Variant =
        LOCATION_CARD_VARIANTS[variantName] ?? LocationCardCompact;
      const extras = item.extras ?? {};
      return (
        <Variant
          name={item.title ?? ""}
          address1={extras.address1}
          address2={extras.address2}
          city={extras.city}
          state={extras.state}
          postalCode={extras.postalCode}
          country={extras.country}
          phone={extras.phone}
          email={extras.email}
          hours={extras.hours}
          link={
            extras.link ??
            (item.href
              ? ({ value: { href: item.href } } as LinkSource)
              : undefined)
          }
          distance={extras.distance}
          distanceUnit={extras.distanceUnit}
          {...leafChromeProps(chrome)}
        />
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

  if (layoutVariant === "feature-spotlight" && items.length > 0) {
    return (
      <LocationsMapProvider items={itemsWithDistance}>
      <FeatureSpotlightLayout
        colorScheme={colorScheme}
        backgroundIntensity={backgroundIntensity}
        paddingY={paddingY}
        maxWidth={maxWidth}
        items={itemsWithDistance}
        getKey={(loc) => loc.id}
        renderItem={renderLocation}
        title={title}
        lead={lead}
        cta={ctaLink}
        reversed={reversed}
        hideAccentLine={hideAccentLine}
        ariaLabel="Locations"
        emptyStateMessage={
          typeof emptyStateMessage === "string"
            ? emptyStateMessage
            : "Locations"
        }
        className={className}
        id={id}
        entityName="locations"
        dataSlot="locations-carousel"
      />
      </LocationsMapProvider>
    );
  }

  const hasItems = itemsWithDistance.length > 0;
  const placeholderKey = "cards-locations-{*}";

  // SXA injects the per-placement digit suffix. Mirror the same shape
  // locations-list-grid uses so a map block dropped into either rendering
  // sees the same slot naming.
  const phSuffix = dynamicPlaceholderId ?? "1";
  const mapPlaceholderKey = `locations-map-${phSuffix}`;
  const isMapAbove = layoutVariant === "map-above";

  const mapSlot = isMapAbove ? (
    <div className="w-full" data-slot="locations-carousel-map">
      {rendering ? (
        <Placeholder name={mapPlaceholderKey} rendering={rendering as never} />
      ) : (
        <div className="container mx-auto px-4 py-4">
          <div className="mx-auto flex aspect-[16/5] w-full max-w-6xl items-center justify-center rounded-(--card-radius,var(--radius-lg)) border-2 border-muted/30 border-dashed bg-muted/40 text-muted-foreground text-sm">
            <span className="is-empty-hint">Map</span>
          </div>
        </div>
      )}
    </div>
  ) : undefined;

  return (
    <LocationsMapProvider items={itemsWithDistance}>
    <ListingSection
      colorScheme={colorScheme}
      backgroundIntensity={backgroundIntensity}
      paddingY={paddingY}
      maxWidth={maxWidth}
      overlapTop={overlapTop}
      slot="locations-carousel"
      entityName="locations"
      id={id}
      className={className}
      beforeContainer={mapSlot}
    >
      {hasItems ? (
        <>
          <ItemCarousel
            setApi={showPreviewStrip ? previewStrip.setApi : undefined}
            items={itemsWithDistance}
            getKey={(loc) => loc.id}
            resultControls={resultControls}
            heading={carouselHeading}
            headingPlacement={headingPlacement}
            renderItem={renderLocation}
            ariaLabel="Locations"
            opts={{ align: "start" }}
            layoutOptions={slidesByBreakpoint}
            controlOptions={{
              navigation: navigation && itemsWithDistance.length > 1,
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
            <CarouselPreviewStrip<LocationFlatItem>
              items={items}
              getKey={(loc) => loc.id}
              getThumb={flatItemThumb}
              activeIndex={previewStrip.activeIndex}
              onSelect={previewStrip.scrollTo}
              ariaLabel="Locations"
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
          Locations
        </ListingFallback>
      )}
    </ListingSection>
    </LocationsMapProvider>
  );
}

export function Default(props: LocationsCarouselProps) {
  return <LocationsCarouselInner {...props} layoutVariant="default" />;
}

export function MapAbove(props: LocationsCarouselProps) {
  return <LocationsCarouselInner {...props} layoutVariant="map-above" />;
}

export function FullBleed(props: LocationsCarouselProps) {
  return <LocationsCarouselInner {...props} layoutVariant="full-bleed" />;
}

export function WithPreviewBelow(props: LocationsCarouselProps) {
  return <LocationsCarouselInner {...props} layoutVariant="with-preview" />;
}

export function Hero(props: LocationsCarouselProps) {
  return <LocationsCarouselInner {...props} layoutVariant="hero" />;
}

export function FeatureSpotlight(props: LocationsCarouselProps) {
  return (
    <LocationsCarouselInner {...props} layoutVariant="feature-spotlight" />
  );
}

export default Default;

export const componentType = "universal";
