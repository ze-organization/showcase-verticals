"use client";

import type { UseEmblaCarouselType } from "embla-carousel-react";
import {
  type ReactNode,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  FeatureSpotlightLayout,
  ItemCarousel,
  type ItemCarouselBreakpoints,
  type ItemCarouselButtonShape,
  type ItemCarouselButtonStyle,
  type ItemCarouselNavigationLayoutParam,
  ListingFallback,
  ListingSection,
  MediaItemFigure,
  MediaItemThumb,
  type ResultControlsProps,
  resolveNavigationLayoutParam,
  resolveSlideEmphasisParam,
  type SectionHeadingProps,
} from "@/components/registry/blocks";
import {
  BAND_INLINE_HEADING_GRID_CLASS,
  parseBandHeadingPlacement,
} from "@/components/registry/blocks/section-heading";
import { Button } from "@/components/registry/components/ui/cta-button";
import type { ImageSource } from "@/components/registry/primitives/editables/image";
import type { LinkSource } from "@/components/registry/primitives/editables/link";
import { getSourceText } from "@/components/registry/primitives/editables/source-normalizers";
import type { TextSource } from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import { parseCaptionStyle } from "@/lib/registry/param-parsers";
import type { FlatItem, SearchConfig } from "@/lib/registry/search/types";
import { useResolvedListItems } from "@/lib/registry/search/use-resolved-list-items";
import type { SectionSurfaceProps } from "@/lib/registry/section-surface";
import { useSitecore } from "@/lib/registry/sitecore";
import {
  parseHeadingLayout,
  parseHeadingSize,
  SectionWrapper,
} from "../layout/section-wrapper";
import {
  type CardMediaAspect,
  MEDIA_ASPECT_CLASSES,
  parseCardMediaAspect,
  parseOptionalCardMediaAspect,
} from "./_media-aspect";
import { MediaGalleryTileProvider } from "./media-gallery-context";

/**
 * `MediaCarousel` — Sitecore-aware carousel rendering for the media
 * family. Composed/curated/search-driven by which datasource
 * field is populated:
 *
 *   - composed → placeholder children (media-item@1 children)
 *   - curated  → `items` populated via Sitecore Treelist
 *   - search   → `items` populated by ambient `useSearchControllerContext`
 *
 * Shares the `media-item@1` card recipe with `media-gallery-list-grid`
 * — both can be dropped into a `media-carousel-search-experience`'s
 * results placeholder.
 *
 * Flat props throughout — the Sitecore adapter unwraps fields/params
 * in `media-carousel.sitecore.ts`, so this file is runnable in
 * Storybook with plain values.
 */

/**
 * Family-specific extras carried alongside the shared FlatItem envelope.
 * The carousel uses these to render the figure (image OR video) plus
 * caption.
 */
export interface MediaExtras {
  image?: ImageSource;
  videoUrl?: string;
  titleSource?: TextSource;
  captionSource?: TextSource;
}

export type MediaFlatItem = FlatItem<MediaExtras>;

export interface MediaCarouselProps extends SectionSurfaceProps {
  /** Heading content. */
  title?: TextSource;
  lead?: TextSource;
  headingLayout?: string;
  headingSize?: string;
  /** `band-heading-placement@1`: `above` (default) or `inline` (heading in the leading column, slides beside it). */
  headingPlacement?: string;

  /** Curated/search items. */
  items?: MediaFlatItem[];
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

  /** Carousel viewport / behavior. */
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
  /** `carousel-slide-emphasis@1`: `uniform` (default) or `spotlight`. */
  slideEmphasis?: string;
  /** How each media caption renders (`caption-style@1`). */
  captionStyle?: string;
  /**
   * Media aspect ratio for each frame (`media-aspect@1`). Unset keeps
   * the 16:9 default the carousel shells were designed around.
   */
  mediaAspect?: string;

  /** Controls bar (optional, only in non-search-context placements). */
  resultControls?: ResultControlsProps;

  /** Empty-state copy. */
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

const ONE_UP_BREAKPOINTS: ItemCarouselBreakpoints = {
  0: { slidesPerView: 1, spaceBetween: 0 },
};

function MediaFrame({
  item,
  sizes,
  captionStyle,
  mediaAspect,
}: {
  item: MediaFlatItem;
  sizes: string;
  /** Raw `caption-style@1` value; parsed here so callers can forward the prop as-is. */
  captionStyle?: string;
  /** Raw `media-aspect@1` value; parsed here so callers can forward the prop as-is. */
  mediaAspect?: string;
}) {
  const aspect: CardMediaAspect = parseCardMediaAspect(mediaAspect, "16x9");
  return (
    <MediaItemFigure
      image={item.extras?.image}
      videoUrl={item.extras?.videoUrl}
      title={item.extras?.titleSource ?? item.title}
      caption={item.extras?.captionSource}
      imageSizes={sizes}
      aspectClassName={MEDIA_ASPECT_CLASSES[aspect]}
      captionStyle={parseCaptionStyle(captionStyle)}
    />
  );
}

function MediaThumb({
  item,
  isActive,
}: {
  item: MediaFlatItem;
  isActive: boolean;
}) {
  const titleText = getSourceText(item.extras?.titleSource);
  const captionText = getSourceText(item.extras?.captionSource);
  return (
    <MediaItemThumb
      image={item.extras?.image}
      videoUrl={item.extras?.videoUrl}
      label={titleText ?? captionText ?? item.title ?? "Video"}
      isActive={isActive}
    />
  );
}

// ─── Shared helpers ──────────────────────────────────────────────

const MEDIA_PLACEHOLDER_KEY = "cards-media-carousel-{*}";

const getMediaKey = (item: MediaFlatItem, index: number) =>
  item.id ?? `media-${index}`;

/**
 * Items resolver shared by every variant. Delegates to the family-wide
 * resolver: ambient controller (inside a search experience) → own
 * `SearchConfig` (self-contained search) → curated `items` prop.
 */
function useResolvedMediaItems(
  directItems: MediaFlatItem[] | undefined,
  searchConfig: SearchConfig | undefined,
  rendering?: unknown,
): MediaFlatItem[] {
  const sitecore = useSitecore() as {
    page?: { mode?: { isEditing?: boolean } };
  };
  const isEditing = Boolean(sitecore?.page?.mode?.isEditing);
  return useResolvedListItems(directItems, searchConfig, {
    rendering,
    isEditing,
    allowCurated: true,
  });
}

/** Section heading bag passed into `<ItemCarousel heading={...}>`. */
function useMediaHeading({
  title,
  lead,
  headingLayout,
  headingSize,
}: {
  title?: TextSource;
  lead?: TextSource;
  headingLayout?: string;
  headingSize?: string;
}) {
  return useMemo(
    () => ({
      title,
      lead,
      layout: parseHeadingLayout(headingLayout, "start-with-section-divider"),
      headingOptions: { size: parseHeadingSize(headingSize, "default") },
      centeredContainerClassName: "my-12",
    }),
    [title, lead, headingLayout, headingSize],
  );
}

/** Control bag for `<ItemCarousel controlOptions={...}>`. */
function useCarouselControls({
  navigation,
  navigationLayout,
  navigationButtonStyle,
  navigationButtonShape,
  slideEmphasis,
  paginationStyle,
  autoplay,
  autoplayDelayMs,
  loop,
  itemCount,
}: {
  navigation: boolean;
  navigationLayout: ItemCarouselNavigationLayoutParam;
  navigationButtonStyle: ItemCarouselButtonStyle | undefined;
  navigationButtonShape: ItemCarouselButtonShape | undefined;
  slideEmphasis: string | undefined;
  paginationStyle: "none" | "dots" | "numbers" | "progress";
  autoplay: boolean | undefined;
  autoplayDelayMs: number;
  loop: boolean | undefined;
  itemCount: number;
}) {
  return useMemo(
    () => ({
      navigation: navigation && itemCount > 1,
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
    }),
    [
      navigation,
      navigationLayout,
      navigationButtonStyle,
      navigationButtonShape,
      slideEmphasis,
      paginationStyle,
      autoplay,
      autoplayDelayMs,
      loop,
      itemCount,
    ],
  );
}

/**
 * Single point for the empty-state fork — items / composed / hint.
 * Delegates to the shared `ListingFallback` so the section heading
 * (Title / Lead) still renders in composed + empty modes. Dropped
 * media-item children wrap in the variant carousel track.
 */
function composedSlideKey(node: ReactNode, index: number): string {
  if (isValidElement(node) && node.key != null) {
    return String(node.key);
  }
  return `composed-${index}`;
}

function ComposedCarouselTrack({
  nodes,
  align = "start",
  breakpoints,
  spaceBetween,
  itemClassName,
  carouselClassName,
  contentClassName,
  navigation,
  navigationLayout,
  navigationButtonStyle,
  navigationButtonShape,
  slideEmphasis,
  paginationStyle,
  autoplay,
  autoplayDelayMs,
  loop,
  headingPlacement,
  resultControls,
  prevButtonProps,
  nextButtonProps,
}: {
  nodes: ReactNode[];
  align?: "start" | "center";
  breakpoints: ItemCarouselBreakpoints;
  spaceBetween: number;
  itemClassName?: string;
  carouselClassName?: string;
  contentClassName?: string;
  navigation: boolean;
  navigationLayout: ItemCarouselNavigationLayoutParam;
  navigationButtonStyle: ItemCarouselButtonStyle | undefined;
  navigationButtonShape: ItemCarouselButtonShape | undefined;
  slideEmphasis: string | undefined;
  paginationStyle: "none" | "dots" | "numbers" | "progress";
  autoplay: boolean | undefined;
  autoplayDelayMs: number;
  loop: boolean | undefined;
  headingPlacement?: string;
  resultControls?: ResultControlsProps;
  prevButtonProps?: { className?: string };
  nextButtonProps?: { className?: string };
}) {
  const controls = useCarouselControls({
    navigation,
    navigationLayout,
    navigationButtonStyle,
    navigationButtonShape,
    slideEmphasis,
    paginationStyle,
    autoplay,
    autoplayDelayMs,
    loop,
    itemCount: nodes.length,
  });
  return (
    <ItemCarousel
      items={nodes}
      getKey={composedSlideKey}
      renderItem={(node) => node}
      ariaLabel="Media carousel"
      headingPlacement={headingPlacement}
      resultControls={resultControls}
      opts={{ align }}
      layoutOptions={{ breakpoints, spaceBetween }}
      controlOptions={controls}
      itemClassName={itemClassName}
      carouselClassName={carouselClassName}
      contentClassName={contentClassName}
      prevButtonProps={prevButtonProps}
      nextButtonProps={nextButtonProps}
    />
  );
}

function ComposedMediaFallback({
  heading,
  headingPlacement,
  rendering,
  children,
  emptyStateMessage,
  composedClassName,
  wrapComposed,
  captionStyle,
  mediaAspect,
}: {
  heading: SectionHeadingProps | undefined;
  headingPlacement?: string;
  rendering: unknown;
  children: ReactNode | undefined;
  emptyStateMessage: TextSource | undefined;
  composedClassName?: string;
  wrapComposed?: (nodes: ReactNode[]) => ReactNode;
  captionStyle?: string;
  mediaAspect?: string;
}) {
  const sitecore = useSitecore() as {
    page?: { mode?: { isEditing?: boolean } };
  };
  const isEditing = Boolean(sitecore?.page?.mode?.isEditing);
  const tilePresentation = useMemo(() => {
    const aspect = parseOptionalCardMediaAspect(mediaAspect);
    return {
      captionStyle: parseCaptionStyle(captionStyle),
      aspectClassName: aspect ? MEDIA_ASPECT_CLASSES[aspect] : undefined,
    };
  }, [captionStyle, mediaAspect]);
  return (
    <MediaGalleryTileProvider value={tilePresentation}>
      <ListingFallback
        heading={heading}
        headingPlacement={headingPlacement}
        placeholderKey={MEDIA_PLACEHOLDER_KEY}
        rendering={rendering}
        fallback={children}
        composedClassName={composedClassName}
        emptyStateMessage={emptyStateMessage}
        isEditing={isEditing}
        wrapComposed={wrapComposed}
      >
        Media carousel
      </ListingFallback>
    </MediaGalleryTileProvider>
  );
}

function renderEmptyFallback({
  hasItems,
  heading,
  headingPlacement,
  rendering,
  children,
  emptyStateMessage,
  composedClassName,
  wrapComposed,
  captionStyle,
  mediaAspect,
}: {
  hasItems: boolean;
  heading: SectionHeadingProps | undefined;
  headingPlacement?: string;
  rendering: unknown;
  children: ReactNode | undefined;
  emptyStateMessage: TextSource | undefined;
  composedClassName?: string;
  wrapComposed?: (nodes: ReactNode[]) => ReactNode;
  captionStyle?: string;
  mediaAspect?: string;
}): ReactNode | null {
  if (hasItems) return null;
  return (
    <ComposedMediaFallback
      heading={heading}
      headingPlacement={headingPlacement}
      rendering={rendering}
      children={children}
      emptyStateMessage={emptyStateMessage}
      composedClassName={composedClassName}
      wrapComposed={wrapComposed}
      captionStyle={captionStyle}
      mediaAspect={mediaAspect}
    />
  );
}

// ─── Variants ────────────────────────────────────────────────────

/**
 * Default — standard ItemCarousel inside a constrained section.
 * Slides scale per the `slidesPerView*` axis on each breakpoint.
 */
export function Default(props: MediaCarouselProps) {
  const {
    items: directItems,
    searchConfig,
    children,
    rendering,
    slidesPerViewLg = 1,
    slidesPerViewMd = 1,
    slidesPerViewSm = 1,
    spaceBetween = 16,
    autoplay,
    autoplayDelayMs = 6000,
    loop,
    navigation = true,
    navigationLayout = "inline",
    navigationButtonStyle,
    navigationButtonShape,
    slideEmphasis,
    pagination: paginationStyle = "none",
    resultControls,
    emptyStateMessage,
    className,
    id,
  } = props;
  const items = useResolvedMediaItems(directItems, searchConfig, rendering);
  const heading = useMediaHeading(props);
  const controls = useCarouselControls({
    navigation,
    navigationLayout,
    navigationButtonStyle,
    navigationButtonShape,
    slideEmphasis,
    paginationStyle,
    autoplay,
    autoplayDelayMs,
    loop,
    itemCount: items.length,
  });
  const renderItem = useCallback(
    (item: MediaFlatItem) => (
      <MediaFrame
        item={item}
        sizes="(max-width: 768px) 100vw, 1024px"
        captionStyle={props.captionStyle}
        mediaAspect={props.mediaAspect}
      />
    ),
    [props.captionStyle, props.mediaAspect],
  );
  const hasItems = items.length > 0;
  return (
    <ListingSection
      colorScheme={props.colorScheme}
      backgroundIntensity={props.backgroundIntensity}
      paddingY={props.paddingY}
      maxWidth={props.maxWidth}
      overlapTop={props.overlapTop}
      slot="media-carousel"
      id={id}
      className={className}
      innerMaxWidth="max-w-5xl"
    >
      {hasItems ? (
        <ItemCarousel
          items={items}
          getKey={getMediaKey}
          resultControls={resultControls}
          heading={heading}
          headingPlacement={props.headingPlacement}
          renderItem={renderItem}
          ariaLabel="Media carousel"
          opts={{ align: "start" }}
          layoutOptions={{
            breakpoints: {
              0: { slidesPerView: slidesPerViewSm, spaceBetween },
              640: {
                slidesPerView: Math.min(slidesPerViewMd, 2),
                spaceBetween,
              },
              1024: { slidesPerView: slidesPerViewLg, spaceBetween },
            },
            spaceBetween,
          }}
          controlOptions={controls}
          prevButtonProps={{ className: "start-2" }}
          nextButtonProps={{ className: "end-2" }}
        />
      ) : (
        renderEmptyFallback({
          hasItems,
          heading,
          headingPlacement: props.headingPlacement,
          rendering,
          children,
          emptyStateMessage,
          composedClassName: "space-y-4",
          captionStyle: props.captionStyle,
          mediaAspect: props.mediaAspect,
          wrapComposed: (nodes) => (
            <ComposedCarouselTrack
              nodes={nodes}
              align="start"
              breakpoints={{
                0: { slidesPerView: slidesPerViewSm, spaceBetween },
                640: {
                  slidesPerView: Math.min(slidesPerViewMd, 2),
                  spaceBetween,
                },
                1024: { slidesPerView: slidesPerViewLg, spaceBetween },
              }}
              spaceBetween={spaceBetween}
              navigation={navigation}
              navigationLayout={navigationLayout}
              navigationButtonStyle={navigationButtonStyle}
              navigationButtonShape={navigationButtonShape}
              slideEmphasis={slideEmphasis}
              paginationStyle={paginationStyle}
              autoplay={autoplay}
              autoplayDelayMs={autoplayDelayMs}
              loop={loop}
              headingPlacement={props.headingPlacement}
              resultControls={resultControls}
              prevButtonProps={{ className: "start-2" }}
              nextButtonProps={{ className: "end-2" }}
            />
          ),
        })
      )}
    </ListingSection>
  );
}

/**
 * FullBleed — single slide spans the viewport edge-to-edge. Drops
 * the constrained container and inflates the inner padding so the
 * media reads as a magazine spread.
 */
export function FullBleed(props: MediaCarouselProps) {
  const {
    items: directItems,
    searchConfig,
    children,
    rendering,
    autoplay,
    autoplayDelayMs = 6000,
    loop,
    navigation = true,
    navigationLayout = "inline",
    navigationButtonStyle,
    navigationButtonShape,
    slideEmphasis,
    pagination: paginationStyle = "none",
    resultControls,
    emptyStateMessage,
    className,
    id,
  } = props;
  const items = useResolvedMediaItems(directItems, searchConfig, rendering);
  const heading = useMediaHeading(props);
  const controls = useCarouselControls({
    navigation,
    navigationLayout,
    navigationButtonStyle,
    navigationButtonShape,
    slideEmphasis,
    paginationStyle,
    autoplay,
    autoplayDelayMs,
    loop,
    itemCount: items.length,
  });
  const renderItem = useCallback(
    (item: MediaFlatItem) => (
      <MediaFrame
        item={item}
        sizes="100vw"
        captionStyle={props.captionStyle}
        mediaAspect={props.mediaAspect}
      />
    ),
    [props.captionStyle, props.mediaAspect],
  );
  const hasItems = items.length > 0;
  return (
    <ListingSection
      colorScheme={props.colorScheme}
      backgroundIntensity={props.backgroundIntensity}
      paddingY={props.paddingY}
      maxWidth={props.maxWidth}
      overlapTop={props.overlapTop}
      slot="media-carousel"
      id={id}
      className={className}
      fullBleed
    >
      {hasItems ? (
        <ItemCarousel
          items={items}
          getKey={getMediaKey}
          resultControls={resultControls}
          heading={heading}
          headingPlacement={props.headingPlacement}
          renderItem={renderItem}
          ariaLabel="Media carousel"
          opts={{ align: "center" }}
          layoutOptions={{
            breakpoints: ONE_UP_BREAKPOINTS,
            spaceBetween: 0,
          }}
          controlOptions={controls}
          carouselClassName="overflow-visible"
          contentClassName="ms-0"
          itemClassName="relative aspect-video w-full ps-0"
          prevButtonProps={{ className: "start-4" }}
          nextButtonProps={{ className: "end-4" }}
        />
      ) : (
        renderEmptyFallback({
          hasItems,
          heading,
          headingPlacement: props.headingPlacement,
          rendering,
          children,
          emptyStateMessage,
          composedClassName: "space-y-4",
          captionStyle: props.captionStyle,
          mediaAspect: props.mediaAspect,
          wrapComposed: (nodes) => (
            <ComposedCarouselTrack
              nodes={nodes}
              align="center"
              breakpoints={ONE_UP_BREAKPOINTS}
              spaceBetween={0}
              itemClassName="relative aspect-video w-full ps-0"
              carouselClassName="overflow-visible"
              contentClassName="ms-0"
              navigation={navigation}
              navigationLayout={navigationLayout}
              navigationButtonStyle={navigationButtonStyle}
              navigationButtonShape={navigationButtonShape}
              slideEmphasis={slideEmphasis}
              paginationStyle={paginationStyle}
              autoplay={autoplay}
              autoplayDelayMs={autoplayDelayMs}
              loop={loop}
              headingPlacement={props.headingPlacement}
              resultControls={resultControls}
              prevButtonProps={{ className: "start-4" }}
              nextButtonProps={{ className: "end-4" }}
            />
          ),
        })
      )}
    </ListingSection>
  );
}

/**
 * PreviewBelow — single ItemCarousel paired with a clickable
 * thumbnail strip below. Tracks the Embla API so the strip stays in
 * lockstep with the active slide.
 */
export function PreviewBelow(props: MediaCarouselProps) {
  const {
    items: directItems,
    searchConfig,
    children,
    rendering,
    spaceBetween = 16,
    autoplay,
    autoplayDelayMs = 6000,
    loop,
    navigation = true,
    navigationLayout = "inline",
    navigationButtonStyle,
    navigationButtonShape,
    slideEmphasis,
    pagination: paginationStyle = "none",
    resultControls,
    emptyStateMessage,
    className,
    id,
  } = props;
  const items = useResolvedMediaItems(directItems, searchConfig, rendering);
  const heading = useMediaHeading(props);
  const controls = useCarouselControls({
    navigation,
    navigationLayout,
    navigationButtonStyle,
    navigationButtonShape,
    slideEmphasis,
    paginationStyle,
    autoplay,
    autoplayDelayMs,
    loop,
    itemCount: items.length,
  });
  const renderItem = useCallback(
    (item: MediaFlatItem) => (
      <MediaFrame
        item={item}
        sizes="(max-width: 768px) 100vw, 1024px"
        captionStyle={props.captionStyle}
        mediaAspect={props.mediaAspect}
      />
    ),
    [props.captionStyle, props.mediaAspect],
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [carouselApi, setCarouselApi] = useState<
    UseEmblaCarouselType[1] | null
  >(null);
  const apiRef = useRef<UseEmblaCarouselType[1] | null>(null);
  const handleSetApi = useCallback((api: UseEmblaCarouselType[1] | null) => {
    apiRef.current = api;
    setCarouselApi(api);
  }, []);
  useEffect(() => {
    if (!carouselApi) return;
    const handleSelect = () => {
      setCurrentIndex(carouselApi.selectedScrollSnap());
    };
    handleSelect();
    carouselApi.on("select", handleSelect);
    carouselApi.on("reInit", handleSelect);
    return () => {
      carouselApi.off("select", handleSelect);
      carouselApi.off("reInit", handleSelect);
    };
  }, [carouselApi]);

  const hasItems = items.length > 0;
  return (
    <ListingSection
      colorScheme={props.colorScheme}
      backgroundIntensity={props.backgroundIntensity}
      paddingY={props.paddingY}
      maxWidth={props.maxWidth}
      overlapTop={props.overlapTop}
      slot="media-carousel"
      id={id}
      className={className}
      innerMaxWidth="max-w-5xl"
    >
      {hasItems ? (
        <div className="space-y-6">
          <ItemCarousel
            items={items}
            getKey={getMediaKey}
            resultControls={resultControls}
            heading={heading}
            headingPlacement={props.headingPlacement}
            renderItem={renderItem}
            ariaLabel="Media carousel"
            opts={{ align: "center" }}
            layoutOptions={{
              breakpoints: ONE_UP_BREAKPOINTS,
              spaceBetween,
            }}
            controlOptions={controls}
            prevButtonProps={{ className: "start-2" }}
            nextButtonProps={{ className: "end-2" }}
            setApi={handleSetApi}
          />
          <div className="flex flex-wrap justify-center gap-2">
            {items.map((item, i) => (
              <Button
                key={item.id ?? `thumb-${i}`}
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  setCurrentIndex(i);
                  apiRef.current?.scrollTo(i);
                }}
                className={cn(
                  "relative h-16 w-24 overflow-hidden rounded border-2 p-0 transition-opacity sm:h-20 sm:w-28",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  currentIndex === i
                    ? "border-primary opacity-100"
                    : "border-transparent opacity-60 hover:opacity-80",
                )}
                aria-label={`Go to slide ${i + 1} of ${items.length}`}
                aria-current={currentIndex === i ? "true" : undefined}
              >
                <MediaThumb item={item} isActive={currentIndex === i} />
              </Button>
            ))}
          </div>
        </div>
      ) : (
        renderEmptyFallback({
          hasItems,
          heading,
          headingPlacement: props.headingPlacement,
          rendering,
          children,
          emptyStateMessage,
          composedClassName: "space-y-4",
          captionStyle: props.captionStyle,
          mediaAspect: props.mediaAspect,
          wrapComposed: (nodes) => (
            <ComposedCarouselTrack
              nodes={nodes}
              align="center"
              breakpoints={ONE_UP_BREAKPOINTS}
              spaceBetween={spaceBetween}
              navigation={navigation}
              navigationLayout={navigationLayout}
              navigationButtonStyle={navigationButtonStyle}
              navigationButtonShape={navigationButtonShape}
              slideEmphasis={slideEmphasis}
              paginationStyle={paginationStyle}
              autoplay={autoplay}
              autoplayDelayMs={autoplayDelayMs}
              loop={loop}
              headingPlacement={props.headingPlacement}
              resultControls={resultControls}
              prevButtonProps={{ className: "start-2" }}
              nextButtonProps={{ className: "end-2" }}
            />
          ),
        })
      )}
    </ListingSection>
  );
}

/**
 * FeaturedImageLeft — hero figure on the start side, scrollable
 * carousel of remaining items on the end side. The heading sits
 * above both via the layout-section SectionWrapper convention.
 */
export function FeaturedImageLeft(props: MediaCarouselProps) {
  const {
    title,
    lead,
    headingLayout,
    headingSize,
    items: directItems,
    searchConfig,
    children,
    rendering,
    spaceBetween = 16,
    autoplay,
    autoplayDelayMs = 6000,
    loop,
    navigation = true,
    navigationLayout = "inline",
    navigationButtonStyle,
    navigationButtonShape,
    slideEmphasis,
    pagination: paginationStyle = "none",
    resultControls,
    emptyStateMessage,
    className,
    id,
  } = props;
  const items = useResolvedMediaItems(directItems, searchConfig, rendering);
  const controls = useCarouselControls({
    navigation,
    navigationLayout,
    navigationButtonStyle,
    navigationButtonShape,
    slideEmphasis,
    paginationStyle,
    autoplay,
    autoplayDelayMs,
    loop,
    itemCount: items.length,
  });
  const renderItem = useCallback(
    (item: MediaFlatItem) => (
      <MediaFrame
        item={item}
        sizes="(max-width: 767px) 100vw, (max-width: 1023px) 58vw, 65vw"
        captionStyle={props.captionStyle}
        mediaAspect={props.mediaAspect}
      />
    ),
    [props.captionStyle, props.mediaAspect],
  );
  const [featured, ...rest] = items;
  const hasItems = items.length > 0;
  const inlineHeading =
    parseBandHeadingPlacement(props.headingPlacement) === "inline";
  return (
    <ListingSection
      colorScheme={props.colorScheme}
      backgroundIntensity={props.backgroundIntensity}
      paddingY={props.paddingY}
      maxWidth={props.maxWidth}
      overlapTop={props.overlapTop}
      slot="media-carousel"
      id={id}
      className={className}
      innerMaxWidth="max-w-6xl"
    >
      <div className={inlineHeading ? BAND_INLINE_HEADING_GRID_CLASS : undefined}>
        <SectionWrapper
          title={title}
          lead={lead}
          layout={parseHeadingLayout(headingLayout, "start-with-section-divider")}
          headingOptions={{
            size: parseHeadingSize(headingSize, "default"),
            classes: { centeredContainerClassName: "my-12" },
          }}
        />
        <div className={inlineHeading ? "min-w-0" : undefined}>
      {hasItems ? (
        <div className="grid gap-6 md:grid-cols-12 md:gap-8">
          {featured && (
            <div className="md:col-span-5 lg:col-span-4">
              <MediaFrame
                item={featured}
                sizes="(max-width: 767px) 100vw, (max-width: 1023px) 42vw, 35vw"
                captionStyle={props.captionStyle}
                mediaAspect={props.mediaAspect}
              />
            </div>
          )}
          <div className="flex flex-col justify-center md:col-span-7 lg:col-span-8">
            {rest.length > 0 && (
              <ItemCarousel
                items={rest}
                getKey={getMediaKey}
                resultControls={resultControls}
                renderItem={renderItem}
                ariaLabel="Media carousel"
                layoutOptions={{
                  breakpoints: ONE_UP_BREAKPOINTS,
                  spaceBetween,
                }}
                controlOptions={controls}
                prevButtonProps={{ className: "start-0" }}
                nextButtonProps={{ className: "end-0" }}
              />
            )}
          </div>
        </div>
      ) : (
        renderEmptyFallback({
          hasItems,
          // Featured renders its heading via the standalone
          // SectionWrapper above, in every data mode — don't repeat it.
          heading: undefined,
          rendering,
          children,
          emptyStateMessage,
          captionStyle: props.captionStyle,
          mediaAspect: props.mediaAspect,
          wrapComposed: (nodes) => {
            const [featured, ...rest] = nodes;
            return (
              <div className="grid gap-6 md:grid-cols-12 md:gap-8">
                <div className="min-w-0 md:col-span-5 lg:col-span-4">
                  {featured}
                </div>
                <div className="flex min-w-0 flex-col justify-center md:col-span-7 lg:col-span-8">
                  {rest.length > 0 ? (
                    <ComposedCarouselTrack
                      nodes={rest}
                      align="start"
                      breakpoints={ONE_UP_BREAKPOINTS}
                      spaceBetween={spaceBetween}
                      navigation={navigation}
                      navigationLayout={navigationLayout}
                      navigationButtonStyle={navigationButtonStyle}
                      navigationButtonShape={navigationButtonShape}
                      slideEmphasis={slideEmphasis}
                      paginationStyle={paginationStyle}
                      autoplay={autoplay}
                      autoplayDelayMs={autoplayDelayMs}
                      loop={loop}
                      resultControls={resultControls}
                      prevButtonProps={{ className: "start-0" }}
                      nextButtonProps={{ className: "end-0" }}
                    />
                  ) : null}
                </div>
              </div>
            );
          },
        })
      )}
        </div>
      </div>
    </ListingSection>
  );
}

/**
 * FeatureSpotlight — editorial dual-carousel layout. Delegates the
 * shell to the shared `FeatureSpotlightLayout` block; this variant
 * just adapts the props and wires the family-specific render
 * callback.
 */
export function FeatureSpotlight(props: MediaCarouselProps) {
  const {
    items: directItems,
    searchConfig,
    rendering,
    title,
    lead,
    ctaLink,
    reversed,
    hideAccentLine,
    emptyStateMessage,
    className,
    id,
  } = props;
  const items = useResolvedMediaItems(directItems, searchConfig, rendering);
  const renderItem = useCallback(
    (item: MediaFlatItem) => (
      <MediaFrame
        item={item}
        sizes="(max-width: 768px) 100vw, 1024px"
        captionStyle={props.captionStyle}
        mediaAspect={props.mediaAspect}
      />
    ),
    [props.captionStyle, props.mediaAspect],
  );
  const heading = useMediaHeading(props);
  if (items.length === 0) {
    return (
      <ListingSection
        colorScheme={props.colorScheme}
        backgroundIntensity={props.backgroundIntensity}
        paddingY={props.paddingY}
        maxWidth={props.maxWidth}
        slot="media-carousel"
        id={id}
        className={className}
      >
        {renderEmptyFallback({
          hasItems: false,
          heading,
          headingPlacement: props.headingPlacement,
          rendering,
          children: props.children,
          emptyStateMessage,
          composedClassName: "space-y-4",
          captionStyle: props.captionStyle,
          mediaAspect: props.mediaAspect,
          wrapComposed: (nodes) => (
            <ComposedCarouselTrack
              nodes={nodes}
              align="start"
              breakpoints={ONE_UP_BREAKPOINTS}
              spaceBetween={16}
              navigation
              navigationLayout="inline"
              navigationButtonStyle={props.navigationButtonStyle}
              navigationButtonShape={props.navigationButtonShape}
              slideEmphasis={props.slideEmphasis}
              paginationStyle={props.pagination ?? "none"}
              autoplay={props.autoplay}
              autoplayDelayMs={props.autoplayDelayMs ?? 6000}
              loop={props.loop}
              headingPlacement={props.headingPlacement}
              resultControls={props.resultControls}
              prevButtonProps={{ className: "start-2" }}
              nextButtonProps={{ className: "end-2" }}
            />
          ),
        })}
      </ListingSection>
    );
  }
  return (
    <FeatureSpotlightLayout
      colorScheme={props.colorScheme}
      backgroundIntensity={props.backgroundIntensity}
      paddingY={props.paddingY}
      maxWidth={props.maxWidth}
      items={items}
      getKey={getMediaKey}
      renderItem={renderItem}
      title={title}
      lead={lead}
      cta={ctaLink}
      reversed={reversed}
      hideAccentLine={hideAccentLine}
      ariaLabel="Media"
      emptyStateMessage={
        typeof emptyStateMessage === "string" ? emptyStateMessage : "Media"
      }
      className={className}
      id={id}
      dataSlot="media-carousel"
    />
  );
}

/**
 * Peek — center-aligned mixed-width row. Shows roughly three full cards
 * flanked by two half-peeking cards (the guinness "Our Beers, 5-across"
 * pattern). Same ItemCarousel shell as Default, but `align: "center"`
 * plus fractional per-breakpoint `slidesPerView` defaults leave partial
 * cards bleeding off both edges so the row reads as a continuous,
 * scrollable strip rather than a paged set. The fractional defaults are
 * overridable per placement via the shared `slidesPerView*` params.
 */
export function Peek(props: MediaCarouselProps) {
  const {
    items: directItems,
    searchConfig,
    children,
    rendering,
    // Fractional defaults produce the flanking half-cards: ~3 full + 2
    // half on lg, tapering to a single dominant card with a peek on sm.
    slidesPerViewLg = 4,
    slidesPerViewMd = 2.5,
    slidesPerViewSm = 1.2,
    spaceBetween = 16,
    autoplay,
    autoplayDelayMs = 6000,
    loop,
    navigation = true,
    navigationLayout = "inline",
    navigationButtonStyle,
    navigationButtonShape,
    slideEmphasis,
    pagination: paginationStyle = "none",
    resultControls,
    emptyStateMessage,
    className,
    id,
  } = props;
  const items = useResolvedMediaItems(directItems, searchConfig, rendering);
  const heading = useMediaHeading(props);
  const controls = useCarouselControls({
    navigation,
    navigationLayout,
    navigationButtonStyle,
    navigationButtonShape,
    slideEmphasis,
    paginationStyle,
    autoplay,
    autoplayDelayMs,
    loop,
    itemCount: items.length,
  });
  const renderItem = useCallback(
    (item: MediaFlatItem) => (
      <MediaFrame
        item={item}
        sizes="(max-width: 640px) 80vw, (max-width: 1024px) 40vw, 25vw"
        captionStyle={props.captionStyle}
        mediaAspect={props.mediaAspect}
      />
    ),
    [props.captionStyle, props.mediaAspect],
  );
  const hasItems = items.length > 0;
  return (
    <ListingSection
      colorScheme={props.colorScheme}
      backgroundIntensity={props.backgroundIntensity}
      paddingY={props.paddingY}
      maxWidth={props.maxWidth}
      overlapTop={props.overlapTop}
      slot="media-carousel"
      id={id}
      className={className}
      innerMaxWidth="max-w-6xl"
    >
      {hasItems ? (
        <ItemCarousel
          items={items}
          getKey={getMediaKey}
          resultControls={resultControls}
          heading={heading}
          headingPlacement={props.headingPlacement}
          renderItem={renderItem}
          ariaLabel="Media carousel"
          opts={{ align: "center" }}
          layoutOptions={{
            breakpoints: {
              0: { slidesPerView: slidesPerViewSm, spaceBetween },
              640: { slidesPerView: slidesPerViewMd, spaceBetween },
              1024: { slidesPerView: slidesPerViewLg, spaceBetween },
            },
            spaceBetween,
          }}
          controlOptions={controls}
          prevButtonProps={{ className: "start-2" }}
          nextButtonProps={{ className: "end-2" }}
        />
      ) : (
        renderEmptyFallback({
          hasItems,
          heading,
          headingPlacement: props.headingPlacement,
          rendering,
          children,
          emptyStateMessage,
          composedClassName: "space-y-4",
          captionStyle: props.captionStyle,
          mediaAspect: props.mediaAspect,
          wrapComposed: (nodes) => (
            <ComposedCarouselTrack
              nodes={nodes}
              align="center"
              breakpoints={{
                0: { slidesPerView: slidesPerViewSm, spaceBetween },
                640: { slidesPerView: slidesPerViewMd, spaceBetween },
                1024: { slidesPerView: slidesPerViewLg, spaceBetween },
              }}
              spaceBetween={spaceBetween}
              navigation={navigation}
              navigationLayout={navigationLayout}
              navigationButtonStyle={navigationButtonStyle}
              navigationButtonShape={navigationButtonShape}
              slideEmphasis={slideEmphasis}
              paginationStyle={paginationStyle}
              autoplay={autoplay}
              autoplayDelayMs={autoplayDelayMs}
              loop={loop}
              headingPlacement={props.headingPlacement}
              resultControls={resultControls}
              prevButtonProps={{ className: "start-2" }}
              nextButtonProps={{ className: "end-2" }}
            />
          ),
        })
      )}
    </ListingSection>
  );
}

export default Default;

export const componentType = "universal";
