"use client";

import type { UseEmblaCarouselType } from "embla-carousel-react";
import type React from "react";
import {
  type CSSProperties,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ResultControls,
  type ResultControlsProps,
} from "@/components/registry/blocks/result-controls";
import {
  type BandHeadingPlacement,
  BAND_INLINE_HEADING_GRID_CLASS,
  parseBandHeadingPlacement,
  SectionHeading,
  type SectionHeadingProps,
} from "@/components/registry/blocks/section-heading";
import { Button } from "@/components/registry/primitives/core/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/registry/primitives/core/carousel";
import type {
  CollectionControllerState,
  CollectionResultControlsOptions,
} from "@/hooks/registry/use-collection-controller";
import { cn } from "@/lib/registry/cn";

type CarouselLayoutConfig = {
  slidesPerView: number;
  spaceBetween: number;
};

export type ItemCarouselBreakpoints = Record<
  number,
  { slidesPerView: number; spaceBetween?: number }
>;

export type ItemCarouselNavigationLayout =
  | "overlay"
  | "inline"
  | "header"
  | "center-flank"
  | "edge-stacked";
export type ItemCarouselButtonPlacement = "inner" | "outer" | "edge";

/**
 * Param-level navigation-layout value as the Sitecore `NavigationLayout`
 * rendering parameter delivers it. Superset of the block-level layout:
 * `below` is an authorable alias that folds onto `inline`. Family
 * carousels accept this type on their public props and fold it via
 * `resolveNavigationLayoutParam` before handing `controlOptions` to
 * `ItemCarousel`.
 */
export type ItemCarouselNavigationLayoutParam =
  | ItemCarouselNavigationLayout
  | "below";

const NAVIGATION_LAYOUTS: readonly ItemCarouselNavigationLayout[] = [
  "overlay",
  "inline",
  "header",
  "center-flank",
  "edge-stacked",
];

/** Fold the Sitecore param value onto a block-level navigation layout. */
export function resolveNavigationLayoutParam(
  value: ItemCarouselNavigationLayoutParam | undefined,
  fallback: ItemCarouselNavigationLayout = "inline",
): ItemCarouselNavigationLayout {
  if (value === "below") return "inline";
  if (!value) return fallback;
  return NAVIGATION_LAYOUTS.includes(value) ? value : fallback;
}

/**
 * `carousel-slide-emphasis@1` — how slides share visual weight.
 * `uniform` (default) keeps every slide the same size; `spotlight`
 * center-aligns the snaps and renders the selected slide full-size with
 * its neighbours scaled down and dimmed at the edges (the Guinness
 * spotlight-slider read). Compact slides carry a full-bleed "go to
 * slide" button, so clicking one advances it into the spotlight.
 */
export type ItemCarouselSlideEmphasis = "uniform" | "spotlight";

const SLIDE_EMPHASES: readonly ItemCarouselSlideEmphasis[] = [
  "uniform",
  "spotlight",
];

/** Fold the Sitecore `SlideEmphasis` param value onto a block value. */
export function resolveSlideEmphasisParam(
  value: string | undefined,
  fallback: ItemCarouselSlideEmphasis = "uniform",
): ItemCarouselSlideEmphasis {
  const normalized = value?.trim().toLowerCase() as
    | ItemCarouselSlideEmphasis
    | undefined;
  return normalized && SLIDE_EMPHASES.includes(normalized)
    ? normalized
    : fallback;
}

/**
 * Per-slide render state handed to `renderItem` as its (optional) third
 * argument. In spotlight mode families can swap the compact slides to a
 * lighter card shape (`CompactSlideVariant`) or let the active slide
 * grow a panel that breaches its bottom edge — the carousel viewport is
 * `overflow-y-visible`, and the same reserved-padding + negative-margin
 * mechanics as the hero's OverlayBreach apply inside the slide.
 */
export type ItemCarouselSlideState = {
  emphasis: ItemCarouselSlideEmphasis;
  /**
   * In spotlight mode: this slide is the selected (centered) snap.
   * Always `true` in uniform mode — every slide has full emphasis.
   */
  isSpotlightActive: boolean;
};

/**
 * Navigation-button chrome presets. These override the
 * `--carousel-button-*` CSS variables the carousel primitive's buttons
 * consume, so a theme's own variable overrides still win at the theme
 * layer while authors get per-placement control:
 *
 *   - `default` — the theme's stock treatment (soft shadow pill).
 *   - `outline` — transparent fill + 1px currentColor border (the
 *     boxed-arrow treatment, e.g. ketelone's square outlined arrows).
 *   - `solid` — primary fill + primary foreground arrow.
 *   - `ghost` — no fill, no shadow; bare arrow glyph.
 */
export type ItemCarouselButtonStyle = "default" | "outline" | "solid" | "ghost";
/** `square` swaps the pill radius for the theme's small radius token. */
export type ItemCarouselButtonShape = "default" | "square";

const CAROUSEL_BUTTON_STYLE_CLASSES: Record<ItemCarouselButtonStyle, string> = {
  default: "",
  outline:
    "[--carousel-button-bg:transparent] [--carousel-button-border-color:currentColor] [--carousel-button-border-width:1px] [--carousel-button-shadow:none] [--carousel-button-shadow-hover:none]",
  solid:
    "[--carousel-button-bg:var(--color-primary)] [--carousel-button-color:var(--color-primary-foreground)] [--carousel-button-shadow:none] [--carousel-button-shadow-hover:var(--shadow-md)]",
  ghost:
    "[--carousel-button-bg:transparent] [--carousel-button-shadow:none] [--carousel-button-shadow-hover:none]",
};

const CAROUSEL_BUTTON_SHAPE_CLASSES: Record<ItemCarouselButtonShape, string> = {
  default: "",
  square: "[--carousel-button-radius:var(--radius-sm)]",
};

export interface ItemCarouselLayoutOptions {
  slidesPerView?: number;
  spaceBetween?: number;
  breakpoints?: ItemCarouselBreakpoints;
  /**
   * Vertical orientation only — the fixed viewport height (px) the
   * column of slides scrolls within. Embla's vertical axis needs a
   * definite container height; slide heights derive from it via the
   * same `--ic-basis-eff` fraction the horizontal axis uses for
   * widths. Ignored for horizontal carousels.
   */
  verticalViewportHeight?: number;
}

export interface ItemCarouselControlOptions {
  navigation?: boolean;
  pagination?: boolean;
  navigationLayout?: ItemCarouselNavigationLayout;
  buttonPlacement?: ItemCarouselButtonPlacement;
  /** Navigation-button chrome preset (CSS-var override, theme-safe). */
  buttonStyle?: ItemCarouselButtonStyle;
  /** Navigation-button corner shape (pill by default, `square` token). */
  buttonShape?: ItemCarouselButtonShape;
  /**
   * `uniform` (default) or `spotlight` — see `ItemCarouselSlideEmphasis`.
   * Spotlight forces center snap alignment and is horizontal-only
   * (vertical carousels ignore it).
   */
  slideEmphasis?: ItemCarouselSlideEmphasis;
  autoplay?: {
    enabled?: boolean;
    delay?: number;
    loop?: boolean;
  };
}

/**
 * Keep at least a sliver of the next slide in view whenever the item
 * count would otherwise fill the viewport exactly (N cards at
 * `SlidesPerView=N` reads as a static grid).
 */
export function ensureCarouselOverflow(
  layout: ItemCarouselLayoutOptions,
  count: number,
): ItemCarouselLayoutOptions {
  if (count < 2) return layout;
  const maxVisible = count - 0.4;
  const capSlides = (slides: number) => Math.min(slides, maxVisible);
  const slidesPerView =
    typeof layout.slidesPerView === "number"
      ? capSlides(layout.slidesPerView)
      : layout.slidesPerView;
  if (!layout.breakpoints) {
    return { ...layout, slidesPerView };
  }
  return {
    ...layout,
    slidesPerView,
    breakpoints: Object.fromEntries(
      Object.entries(layout.breakpoints).map(([width, cfg]) => [
        width,
        { ...cfg, slidesPerView: capSlides(cfg.slidesPerView) },
      ]),
    ),
  };
}

function composedCarouselKey(node: React.ReactNode, index: number): string {
  if (isValidElement(node) && node.key != null) {
    return String(node.key);
  }
  return `composed-${index}`;
}

export interface ItemCarouselProps<TItem> {
  items: TItem[];
  /**
   * Slide renderer. The optional third argument carries per-slide
   * emphasis state (spotlight mode) — two-argument renderers keep
   * working unchanged.
   */
  renderItem: (
    item: TItem,
    index: number,
    slideState?: ItemCarouselSlideState,
  ) => React.ReactNode;
  /**
   * Stable key for each item. Required to avoid index keys in carousels.
   */
  getKey: (item: TItem, index: number) => string;

  /** Optional standardized heading (SectionHeading mode). */
  heading?: SectionHeadingProps;
  /**
   * `band-heading-placement@1` — where the heading sits relative to the
   * slides. `above` (default) keeps today's stacked arrangement;
   * `inline` puts the heading block in the band's LEADING column with
   * the slides flowing beside it (the Allstate resources-slider read).
   * Accepts the raw Sitecore param string; unknown/empty parses to
   * `above`. The `header` navigation layout and the programmatic
   * `split-*` heading layouts already place the heading themselves, so
   * they win over `inline`.
   */
  headingPlacement?: BandHeadingPlacement | string;
  /** Optional collection-level controls (search/sort/filter/count). */
  resultControls?: ResultControlsProps;
  collectionController?: {
    state: CollectionControllerState<TItem, string>;
    resultControlsOptions?: CollectionResultControlsOptions;
  };

  ariaLabel?: string;

  /**
   * Scroll axis. `vertical` renders the slides as a column inside a
   * fixed-height viewport (`layoutOptions.verticalViewportHeight`) with
   * up/down controls — the vertically-scrolling story list pattern
   * (ketelone "Garnished with Good"). Defaults to `horizontal`.
   * `center-flank` navigation is horizontal-only and falls back to the
   * primitive's stock vertical arrows.
   */
  orientation?: "horizontal" | "vertical";

  /** Embla options passed to the underlying carousel primitive. */
  opts?: React.ComponentProps<typeof Carousel>["opts"];

  /** Allows parent variants (e.g. thumbs) to access the Embla API. */
  setApi?: React.ComponentProps<typeof Carousel>["setApi"];

  /** Composed layout controls for CMS-friendly configuration. */
  layoutOptions?: ItemCarouselLayoutOptions;
  /** Composed behavior controls for CMS-friendly configuration. */
  controlOptions?: ItemCarouselControlOptions;
  /** Wrapper + internal className controls. */
  className?: string;
  carouselClassName?: string;
  contentClassName?: string;
  itemClassName?: string;
  itemInnerClassName?: string;

  navButtonProps?: Omit<
    React.ComponentProps<typeof CarouselPrevious>,
    "children" | "onClick"
  >;
  prevButtonProps?: Omit<
    React.ComponentProps<typeof CarouselPrevious>,
    "children" | "onClick"
  >;
  nextButtonProps?: Omit<
    React.ComponentProps<typeof CarouselNext>,
    "children" | "onClick"
  >;
}

const DEFAULT_BREAKPOINTS: ItemCarouselBreakpoints = {
  768: { slidesPerView: 2 },
  1024: { slidesPerView: 3 },
  1280: { slidesPerView: 4 },
};

function resolveCarouselConfig(
  width: number,
  baseSlides: number,
  baseSpaceBetween: number,
  sortedBreakpoints: Array<
    readonly [number, { slidesPerView: number; spaceBetween?: number }]
  >,
): CarouselLayoutConfig {
  let nextConfig: CarouselLayoutConfig = {
    slidesPerView: baseSlides,
    spaceBetween: baseSpaceBetween,
  };

  for (const [breakpoint, config] of sortedBreakpoints) {
    if (width < breakpoint) continue;
    nextConfig = {
      slidesPerView: config.slidesPerView,
      spaceBetween:
        typeof config.spaceBetween === "number"
          ? config.spaceBetween
          : baseSpaceBetween,
    };
  }

  return nextConfig;
}

/**
 * Tailwind's responsive breakpoints, matched to the widths at which the
 * server-rendered slide-basis variables switch over. The carousel's
 * `breakpoints` option keys are arbitrary pixel widths; each is folded
 * onto the nearest Tailwind step at or below it by evaluating
 * `resolveCarouselConfig` at these exact widths.
 */
const TAILWIND_BREAKPOINT_WIDTHS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

type SlideBasisVars = CSSProperties & Record<`--ic-${string}`, string>;

function slideBasisExpression(config: CarouselLayoutConfig): string {
  const slides = Math.max(1, config.slidesPerView);
  const totalSpace = (slides - 1) * Math.max(0, config.spaceBetween);
  return `calc((100% - ${totalSpace}px) / ${slides})`;
}

/**
 * Server-renderable responsive layout: the per-breakpoint slide basis and
 * gap are emitted as CSS custom properties on the carousel root, consumed
 * by static Tailwind classes (`basis-(--ic-basis-eff)` etc.) below. This
 * replaces the old client-only `window.innerWidth` listener, which left
 * every slide at the primitive's `basis-full` during SSR and before
 * hydration — card carousels rendered one full-width card per row in any
 * JS-less or pre-hydration frame (the benchmark screenshots caught this).
 */
function buildSlideBasisVars(
  baseSlides: number,
  baseSpaceBetween: number,
  breakpoints: ItemCarouselBreakpoints,
): SlideBasisVars {
  const sortedBreakpoints = Object.entries(breakpoints)
    .map(([key, value]) => [Number(key), value] as const)
    .filter(([key]) => !Number.isNaN(key))
    .sort((a, b) => a[0] - b[0]);
  const at = (width: number) =>
    resolveCarouselConfig(
      width,
      baseSlides,
      baseSpaceBetween,
      sortedBreakpoints,
    );

  const vars: SlideBasisVars = {};
  const base = at(0);
  vars["--ic-basis"] = slideBasisExpression(base);
  vars["--ic-gap"] = `${Math.max(0, base.spaceBetween)}px`;
  for (const [name, width] of Object.entries(TAILWIND_BREAKPOINT_WIDTHS)) {
    const config = at(width);
    vars[`--ic-basis-${name}`] = slideBasisExpression(config);
    vars[`--ic-gap-${name}`] = `${Math.max(0, config.spaceBetween)}px`;
  }
  return vars;
}

/**
 * Static class strings (Tailwind JIT-visible) that pick the effective
 * basis/gap variable per breakpoint. Values live in the CSS variables
 * above; the class list never changes, so the scanner always generates it.
 */
const SLIDE_BASIS_EFF_CLASSES =
  "[--ic-basis-eff:var(--ic-basis)] sm:[--ic-basis-eff:var(--ic-basis-sm)] md:[--ic-basis-eff:var(--ic-basis-md)] lg:[--ic-basis-eff:var(--ic-basis-lg)] xl:[--ic-basis-eff:var(--ic-basis-xl)]";
const SLIDE_GAP_EFF_CLASSES =
  "[--ic-gap-eff:var(--ic-gap)] sm:[--ic-gap-eff:var(--ic-gap-sm)] md:[--ic-gap-eff:var(--ic-gap-md)] lg:[--ic-gap-eff:var(--ic-gap-lg)] xl:[--ic-gap-eff:var(--ic-gap-xl)]";

function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
    updatePreference();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updatePreference);
      return () => mediaQuery.removeEventListener("change", updatePreference);
    }

    mediaQuery.addListener(updatePreference);
    return () => mediaQuery.removeListener(updatePreference);
  }, []);

  return prefersReducedMotion;
}

function useCarouselSnapState(
  api: UseEmblaCarouselType[1] | null,
  shouldUseApi: boolean,
) {
  const [snapCount, setSnapCount] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!shouldUseApi || !api) return;
    const onApiSelect = () => {
      const nextSnapCount = api.scrollSnapList().length;
      const nextSelectedIndex = api.selectedScrollSnap();
      setSnapCount((prev) => (prev === nextSnapCount ? prev : nextSnapCount));
      setSelectedIndex((prev) =>
        prev === nextSelectedIndex ? prev : nextSelectedIndex,
      );
    };
    onApiSelect();
    api.on("select", onApiSelect);
    api.on("reInit", onApiSelect);
    return () => {
      api.off("select", onApiSelect);
      api.off("reInit", onApiSelect);
    };
  }, [api, shouldUseApi]);

  return { snapCount, selectedIndex };
}

/**
 * Overlay positions for the center-flank layout: each arrow sits on the
 * boundary of the centered slide slot (`--ic-basis-eff` wide), i.e.
 * between the middle card and its neighbours in a 3-up layout — the
 * "controls around the center item" pattern (ketelone products). Uses
 * logical `start`/`end` so RTL mirrors for free; only the centering
 * translate needs the explicit rtl flip.
 */
const CENTER_FLANK_PREV_CLASSES =
  "start-[calc((100%-var(--ic-basis-eff))/2)] -translate-x-1/2 rtl:translate-x-1/2";
const CENTER_FLANK_NEXT_CLASSES =
  "end-[calc((100%-var(--ic-basis-eff))/2)] translate-x-1/2 rtl:-translate-x-1/2";

const OVERLAY_PREV_PLACEMENT_CLASSES: Record<
  ItemCarouselButtonPlacement,
  string
> = {
  inner: "start-6 rtl:start-auto rtl:end-6",
  outer: "-start-6 rtl:-end-6 rtl:start-auto",
  edge: "start-0 rtl:start-auto rtl:end-0",
};
const OVERLAY_NEXT_PLACEMENT_CLASSES: Record<
  ItemCarouselButtonPlacement,
  string
> = {
  inner: "end-6 rtl:start-6 rtl:end-auto",
  outer: "-end-6 rtl:-start-6 rtl:end-auto",
  edge: "end-0 rtl:start-0 rtl:end-auto",
};

/**
 * Overlay position for one arrow. Vertical carousels keep the
 * primitive's own stock positions (arrows centered above / below the
 * viewport, rotated to up/down) — the horizontal placement offsets and
 * the center-flank calc are both inline-axis concepts.
 */
function resolveOverlayButtonClassName(
  side: "prev" | "next",
  buttonPlacement: ItemCarouselButtonPlacement,
  flankCenter: boolean,
  isVertical: boolean,
): string {
  if (isVertical) return "";
  if (flankCenter) {
    return side === "prev"
      ? CENTER_FLANK_PREV_CLASSES
      : CENTER_FLANK_NEXT_CLASSES;
  }
  return side === "prev"
    ? OVERLAY_PREV_PLACEMENT_CLASSES[buttonPlacement]
    : OVERLAY_NEXT_PLACEMENT_CLASSES[buttonPlacement];
}

function CarouselNavigationButtons({
  buttonPlacement,
  flankCenter = false,
  orientation = "horizontal",
  navButtonProps,
  prevButtonProps,
  nextButtonProps,
}: {
  buttonPlacement: ItemCarouselButtonPlacement;
  /** Position the arrows flanking the centered slide slot instead. */
  flankCenter?: boolean;
  orientation?: "horizontal" | "vertical";
  navButtonProps?: Omit<
    React.ComponentProps<typeof CarouselPrevious>,
    "children" | "onClick"
  >;
  prevButtonProps?: Omit<
    React.ComponentProps<typeof CarouselPrevious>,
    "children" | "onClick"
  >;
  nextButtonProps?: Omit<
    React.ComponentProps<typeof CarouselNext>,
    "children" | "onClick"
  >;
}) {
  const isVertical = orientation === "vertical";
  const overlayPrevClassName = resolveOverlayButtonClassName(
    "prev",
    buttonPlacement,
    flankCenter,
    isVertical,
  );
  const overlayNextClassName = resolveOverlayButtonClassName(
    "next",
    buttonPlacement,
    flankCenter,
    isVertical,
  );

  const { className: navClassName, ...navRest } = navButtonProps ?? {};
  const { className: prevClassName, ...prevRest } = prevButtonProps ?? {};
  const { className: nextClassName, ...nextRest } = nextButtonProps ?? {};

  const mergedPrevClassName = cn(
    overlayPrevClassName,
    navClassName,
    prevClassName,
  );
  const mergedNextClassName = cn(
    overlayNextClassName,
    navClassName,
    nextClassName,
  );

  return (
    <>
      <CarouselPrevious
        className={mergedPrevClassName}
        {...navRest}
        {...prevRest}
      />
      <CarouselNext
        className={mergedNextClassName}
        {...navRest}
        {...nextRest}
      />
    </>
  );
}

/**
 * Drive autoplay by ticking the Embla API on an interval. Wrapping or
 * resetting to the start at the end is governed by `loop`. A no-op when
 * `enabled` is false or no API is attached yet.
 */
function useCarouselAutoplay({
  api,
  enabled,
  loop,
  delay,
}: {
  api: UseEmblaCarouselType[1] | null;
  enabled: boolean;
  loop: boolean;
  delay: number;
}) {
  useEffect(() => {
    if (!api || !enabled) return;
    const interval = setInterval(() => {
      if (loop || api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0);
      }
    }, delay);
    return () => clearInterval(interval);
  }, [api, delay, loop, enabled]);
}

type ResolvedCarouselOptions = {
  showNavigation: boolean;
  showPagination: boolean;
  navigationLayout: ItemCarouselNavigationLayout;
  buttonPlacement: ItemCarouselButtonPlacement;
  buttonStyle: ItemCarouselButtonStyle;
  buttonShape: ItemCarouselButtonShape;
  slideEmphasis: ItemCarouselSlideEmphasis;
  autoPlay: boolean;
  loop: boolean;
  delay: number;
  baseSlides: number;
  baseSpaceBetween: number;
  breakpoints: ItemCarouselBreakpoints;
};

/** Fold the optional layout/control option bags into fully-defaulted values. */
function resolveCarouselOptions(
  layoutOptions: ItemCarouselLayoutOptions | undefined,
  controlOptions: ItemCarouselControlOptions | undefined,
): ResolvedCarouselOptions {
  return {
    showNavigation: controlOptions?.navigation ?? true,
    showPagination: controlOptions?.pagination ?? false,
    navigationLayout: controlOptions?.navigationLayout ?? "overlay",
    buttonPlacement: controlOptions?.buttonPlacement ?? "inner",
    buttonStyle: controlOptions?.buttonStyle ?? "default",
    buttonShape: controlOptions?.buttonShape ?? "default",
    slideEmphasis: controlOptions?.slideEmphasis ?? "uniform",
    autoPlay: controlOptions?.autoplay?.enabled ?? false,
    loop: controlOptions?.autoplay?.loop ?? false,
    delay:
      typeof controlOptions?.autoplay?.delay === "number"
        ? controlOptions.autoplay.delay
        : 4500,
    baseSlides: layoutOptions?.slidesPerView ?? 1,
    baseSpaceBetween:
      typeof layoutOptions?.spaceBetween === "number"
        ? layoutOptions.spaceBetween
        : 16,
    breakpoints: layoutOptions?.breakpoints ?? DEFAULT_BREAKPOINTS,
  };
}

/**
 * Static (non-absolute) prev/next pair for the header layout — the
 * arrows sit in the heading row's top-end corner above the slides
 * (the ketelone "controls in the corner" pattern).
 */
function HeaderNavButtons({
  navButtonProps,
  prevButtonProps,
  nextButtonProps,
}: {
  navButtonProps?: ItemCarouselProps<unknown>["navButtonProps"];
  prevButtonProps?: ItemCarouselProps<unknown>["prevButtonProps"];
  nextButtonProps?: ItemCarouselProps<unknown>["nextButtonProps"];
}) {
  const { className: navClassName, ...navRest } = navButtonProps ?? {};
  const { className: prevClassName, ...prevRest } = prevButtonProps ?? {};
  const { className: nextClassName, ...nextRest } = nextButtonProps ?? {};
  return (
    <div className="flex shrink-0 items-center gap-2 rtl:flex-row-reverse">
      <CarouselPrevious
        className={cn(
          "static shrink-0 translate-x-0 translate-y-0",
          navClassName,
          prevClassName,
        )}
        {...navRest}
        {...prevRest}
      />
      <CarouselNext
        className={cn(
          "static shrink-0 translate-x-0 translate-y-0",
          navClassName,
          nextClassName,
        )}
        {...navRest}
        {...nextRest}
      />
    </div>
  );
}

/**
 * `edge-stacked` navigation: prev over next in a single column pinned
 * to the strip's end edge, vertically centered — the arrows ride above
 * the compact slide stack in a spotlight carousel (Guinness pattern).
 * Horizontal-only; vertical carousels fall back to the stock overlay.
 */
function EdgeStackedNavButtons({
  navButtonProps,
  prevButtonProps,
  nextButtonProps,
}: {
  navButtonProps?: ItemCarouselProps<unknown>["navButtonProps"];
  prevButtonProps?: ItemCarouselProps<unknown>["prevButtonProps"];
  nextButtonProps?: ItemCarouselProps<unknown>["nextButtonProps"];
}) {
  const { className: navClassName, ...navRest } = navButtonProps ?? {};
  const { className: prevClassName, ...prevRest } = prevButtonProps ?? {};
  const { className: nextClassName, ...nextRest } = nextButtonProps ?? {};
  return (
    <div className="absolute end-3 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-2">
      <CarouselPrevious
        className={cn(
          "static shrink-0 translate-x-0 translate-y-0",
          navClassName,
          prevClassName,
        )}
        {...navRest}
        {...prevRest}
      />
      <CarouselNext
        className={cn(
          "static shrink-0 translate-x-0 translate-y-0",
          navClassName,
          nextClassName,
        )}
        {...navRest}
        {...nextRest}
      />
    </div>
  );
}

function CarouselPaginationDots({
  api,
  snapPoints,
  selectedIndex,
}: {
  api: UseEmblaCarouselType[1] | null;
  snapPoints: number[];
  selectedIndex: number;
}) {
  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      {snapPoints.map((snapPoint, index) => (
        <Button
          key={snapPoint}
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => api?.scrollTo(index)}
          className={cn(
            "h-2 w-2 rounded-full p-0",
            index === selectedIndex ? "bg-foreground/60" : "bg-border",
          )}
          aria-label={`Go to slide ${index + 1}`}
          aria-current={index === selectedIndex ? "true" : undefined}
        />
      ))}
    </div>
  );
}

function InlineNavCarouselContent({
  content,
  orientation = "horizontal",
  navButtonProps,
  prevButtonProps,
  nextButtonProps,
}: {
  content: React.ReactNode;
  orientation?: "horizontal" | "vertical";
  navButtonProps?: ItemCarouselProps<unknown>["navButtonProps"];
  prevButtonProps?: ItemCarouselProps<unknown>["prevButtonProps"];
  nextButtonProps?: ItemCarouselProps<unknown>["nextButtonProps"];
}) {
  const { className: navClassName, ...navRest } = navButtonProps ?? {};
  const { className: prevClassName, ...prevRest } = prevButtonProps ?? {};
  const { className: nextClassName, ...nextRest } = nextButtonProps ?? {};

  if (orientation === "vertical") {
    // Vertical inline nav: up/down arrows stacked in a column beside
    // the scrolling list (ketelone's boxed up/down arrows). The
    // primitive's vertical branch already contributes `rotate-90` so
    // the arrow glyphs read as up/down; only its absolute positioning
    // and centering translate need cancelling here.
    return (
      <div className="flex items-center gap-4">
        <div className="flex shrink-0 flex-col gap-3">
          <CarouselPrevious
            className={cn(
              "static shrink-0 translate-x-0 translate-y-0",
              navClassName,
              prevClassName,
            )}
            {...navRest}
            {...prevRest}
          />
          <CarouselNext
            className={cn(
              "static shrink-0 translate-x-0 translate-y-0",
              navClassName,
              nextClassName,
            )}
            {...navRest}
            {...nextRest}
          />
        </div>
        <div className="min-w-0 flex-1">{content}</div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rtl:flex-row-reverse">
      <CarouselPrevious
        className={cn(
          "static shrink-0 translate-y-0",
          navClassName,
          prevClassName,
        )}
        {...navRest}
        {...prevRest}
      />
      <div className="min-w-0 flex-1">{content}</div>
      <CarouselNext
        className={cn(
          "static shrink-0 translate-y-0",
          navClassName,
          nextClassName,
        )}
        {...navRest}
        {...nextRest}
      />
    </div>
  );
}

/**
 * Everything rendered inside the `<Carousel>` shell: the header-layout
 * heading row (title start, arrows in the top-end corner), the slides
 * (wrapped by the inline arrow pair when `inline`), and the overlay /
 * center-flank floating arrows. Lives inside the Carousel context so
 * every arrow variant can reach the Embla API.
 */
function CarouselChrome({
  navigationLayout,
  showNavigation,
  buttonPlacement,
  orientation,
  heading,
  content,
  navButtonProps,
  prevButtonProps,
  nextButtonProps,
}: {
  navigationLayout: ItemCarouselNavigationLayout;
  showNavigation: boolean;
  buttonPlacement: ItemCarouselButtonPlacement;
  orientation: "horizontal" | "vertical";
  heading: SectionHeadingProps | undefined;
  content: React.ReactNode;
  navButtonProps?: ItemCarouselProps<unknown>["navButtonProps"];
  prevButtonProps?: ItemCarouselProps<unknown>["prevButtonProps"];
  nextButtonProps?: ItemCarouselProps<unknown>["nextButtonProps"];
}) {
  const isHeaderNavLayout = navigationLayout === "header";
  // Edge-stacked is an inline-axis concept — vertical carousels fold it
  // onto the stock overlay arrows (same fallback as center-flank).
  const isEdgeStacked =
    navigationLayout === "edge-stacked" && orientation === "horizontal";
  const isOverlayNav =
    navigationLayout === "overlay" ||
    navigationLayout === "center-flank" ||
    (navigationLayout === "edge-stacked" && orientation === "vertical");
  return (
    <>
      {isHeaderNavLayout && (heading || showNavigation) ? (
        <div className="mb-6 flex items-end justify-between gap-4">
          <div className="min-w-0 flex-1">
            {heading ? <SectionHeading {...heading} /> : null}
          </div>
          {showNavigation ? (
            <HeaderNavButtons
              navButtonProps={navButtonProps}
              prevButtonProps={prevButtonProps}
              nextButtonProps={nextButtonProps}
            />
          ) : null}
        </div>
      ) : null}

      {navigationLayout === "inline" && showNavigation ? (
        <InlineNavCarouselContent
          content={content}
          orientation={orientation}
          navButtonProps={navButtonProps}
          prevButtonProps={prevButtonProps}
          nextButtonProps={nextButtonProps}
        />
      ) : (
        content
      )}

      {isOverlayNav && showNavigation ? (
        <CarouselNavigationButtons
          buttonPlacement={buttonPlacement}
          flankCenter={navigationLayout === "center-flank"}
          orientation={orientation}
          navButtonProps={navButtonProps}
          prevButtonProps={prevButtonProps}
          nextButtonProps={nextButtonProps}
        />
      ) : null}

      {isEdgeStacked && showNavigation ? (
        <EdgeStackedNavButtons
          navButtonProps={navButtonProps}
          prevButtonProps={prevButtonProps}
          nextButtonProps={nextButtonProps}
        />
      ) : null}
    </>
  );
}

const INLINE_HEADING_GRID_CLASS = BAND_INLINE_HEADING_GRID_CLASS;

function SplitHeadingLayout({
  headingLayout,
  heading,
  resultControls,
  gridClassName,
  children,
}: {
  headingLayout: SectionHeadingProps["layout"];
  heading: SectionHeadingProps;
  resultControls: ResultControlsProps | undefined;
  /** Override the 1:1 split grid (used by the inline heading placement). */
  gridClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={
        gridClassName ?? "grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-10"
      }
    >
      <div
        className={cn(
          "lg:order-1",
          headingLayout === "split-end" && "lg:order-2",
        )}
      >
        <SectionHeading {...heading} />
      </div>
      <div
        className={cn(
          "min-w-0 lg:order-2",
          headingLayout === "split-end" && "lg:order-1",
        )}
      >
        {resultControls ? (
          <ResultControls {...resultControls} className="mb-4" />
        ) : null}
        {children}
      </div>
    </div>
  );
}

/**
 * Per-slide emphasis wrapper. Uniform slides render bare (plus the
 * optional inner-className div). Spotlight slides get the scale/dim
 * treatment, and compact (non-active) ones a full-bleed advance
 * affordance: clicking a compact slide scrolls it into the spotlight.
 * The overlay sits above the slide's own links, which become clickable
 * once the slide is active and the overlay unmounts.
 */
function SlideEmphasisShell({
  slideState,
  index,
  api,
  itemInnerClassName,
  children,
}: {
  slideState: ItemCarouselSlideState;
  index: number;
  api: UseEmblaCarouselType[1] | null;
  itemInnerClassName?: string;
  children: React.ReactNode;
}) {
  const inner = itemInnerClassName ? (
    <div className={itemInnerClassName}>{children}</div>
  ) : (
    children
  );
  if (slideState.emphasis !== "spotlight") return inner;
  return (
    <div
      className={cn(
        "relative h-full origin-center motion-safe:transition-[transform,opacity] motion-safe:duration-300 motion-safe:ease-out",
        !slideState.isSpotlightActive && "scale-[0.8] opacity-70",
      )}
    >
      {inner}
      {!slideState.isSpotlightActive ? (
        <button
          type="button"
          aria-label={`Go to slide ${index + 1}`}
          onClick={() => api?.scrollTo(index)}
          className="absolute inset-0 z-10 cursor-pointer"
        />
      ) : null}
    </div>
  );
}

/**
 * Spotlight emphasis needs the live selected snap (to grant the
 * centered slide full emphasis) and center alignment; it's an
 * inline-axis concept, so vertical carousels stay uniform, and a
 * single-slide strip has nothing to spotlight.
 */
function spotlightEnabled(
  slideEmphasis: ItemCarouselSlideEmphasis,
  isVertical: boolean,
  itemCount: number,
): boolean {
  return slideEmphasis === "spotlight" && !isVertical && itemCount > 1;
}

/**
 * Button chrome presets ride the same className channel callers use,
 * ahead of caller classes so explicit `navButtonProps` still win.
 */
function mergeButtonChromeProps(
  buttonStyle: ItemCarouselButtonStyle,
  buttonShape: ItemCarouselButtonShape,
  navButtonProps: ItemCarouselProps<unknown>["navButtonProps"],
): ItemCarouselProps<unknown>["navButtonProps"] {
  const buttonChromeClassName = cn(
    CAROUSEL_BUTTON_STYLE_CLASSES[buttonStyle],
    CAROUSEL_BUTTON_SHAPE_CLASSES[buttonShape],
  );
  return buttonChromeClassName
    ? {
        ...navButtonProps,
        className: cn(buttonChromeClassName, navButtonProps?.className),
      }
    : navButtonProps;
}

/** `buildSlideBasisVars` plus the vertical viewport-height variable. */
function buildSlideBasisVarsForOrientation({
  baseSlides,
  baseSpaceBetween,
  breakpoints,
  isVertical,
  verticalViewportHeight,
}: {
  baseSlides: number;
  baseSpaceBetween: number;
  breakpoints: ItemCarouselBreakpoints;
  isVertical: boolean;
  verticalViewportHeight: number;
}): SlideBasisVars {
  const vars = buildSlideBasisVars(baseSlides, baseSpaceBetween, breakpoints);
  if (isVertical) {
    vars["--ic-vvh"] = `${verticalViewportHeight}px`;
  }
  return vars;
}

/**
 * Which of the three heading arrangements applies. The `header`
 * navigation layout consumes the heading inside the carousel shell
 * (title start, arrows end — the "controls in the top corner"
 * pattern), so it supersedes both the programmatic split layouts and
 * the `band-heading-placement@1: inline` leading-column placement;
 * split beats inline when both could apply.
 */
function resolveHeadingArrangement(
  heading: SectionHeadingProps | undefined,
  headingPlacement: BandHeadingPlacement | string | undefined,
  navigationLayout: ItemCarouselNavigationLayout,
): {
  isHeaderNavLayout: boolean;
  isSplitLayout: boolean;
  isInlineHeading: boolean;
} {
  const headingLayout = heading?.layout;
  const isHeaderNavLayout = navigationLayout === "header";
  const isSplitLayout =
    !isHeaderNavLayout &&
    (headingLayout === "split-start" || headingLayout === "split-end");
  const isInlineHeading =
    !isHeaderNavLayout &&
    !isSplitLayout &&
    Boolean(heading) &&
    parseBandHeadingPlacement(headingPlacement) === "inline";
  return { isHeaderNavLayout, isSplitLayout, isInlineHeading };
}

/**
 * The slide strip: one CarouselItem per resolved item, each wrapped in
 * the emphasis shell. Extracted from `ItemCarousel` so the per-slide
 * branching (spotlight state, inner-className wrapping, vertical
 * sizing) lives in one place.
 */
function ItemCarouselSlides<TItem>({
  items,
  renderItem,
  getKey,
  isSpotlight,
  selectedIndex,
  api,
  isVertical,
  contentClassName,
  itemClassName,
  itemInnerClassName,
}: {
  items: TItem[];
  renderItem: ItemCarouselProps<TItem>["renderItem"];
  getKey: ItemCarouselProps<TItem>["getKey"];
  isSpotlight: boolean;
  selectedIndex: number;
  api: UseEmblaCarouselType[1] | null;
  isVertical: boolean;
  contentClassName?: string;
  itemClassName?: string;
  itemInnerClassName?: string;
}) {
  return (
    <CarouselContent
      className={cn(
        isVertical
          ? "h-(--ic-vvh) gap-y-(--ic-gap-eff)"
          : "gap-x-(--ic-gap-eff)",
        contentClassName,
      )}
    >
      {items.map((item, index) => {
        const isSpotlightActive = !isSpotlight || index === selectedIndex;
        const slideState: ItemCarouselSlideState = {
          emphasis: isSpotlight ? "spotlight" : "uniform",
          isSpotlightActive,
        };
        return (
          <CarouselItem
            key={getKey(item, index)}
            data-spotlight-active={
              isSpotlight ? String(isSpotlightActive) : undefined
            }
            className={cn(
              "min-w-0 basis-(--ic-basis-eff) ps-0",
              isVertical && "min-h-0 pt-0",
              itemClassName,
            )}
          >
            <SlideEmphasisShell
              slideState={slideState}
              index={index}
              api={api}
              itemInnerClassName={itemInnerClassName}
            >
              {renderItem(item, index, slideState)}
            </SlideEmphasisShell>
          </CarouselItem>
        );
      })}
    </CarouselContent>
  );
}

export function ItemCarousel<TItem>({
  items,
  renderItem,
  getKey,
  heading,
  headingPlacement,
  resultControls,
  collectionController,
  ariaLabel,
  orientation = "horizontal",
  opts,
  setApi,
  layoutOptions,
  controlOptions,
  className,
  carouselClassName,
  contentClassName,
  itemClassName,
  itemInnerClassName,
  navButtonProps,
  prevButtonProps,
  nextButtonProps,
}: ItemCarouselProps<TItem>) {
  const controller = collectionController?.state;
  const resolvedItems = controller ? controller.filteredItems : items;
  const resolvedResultControls =
    resultControls ??
    (controller
      ? controller.createResultControlsProps(
          collectionController?.resultControlsOptions,
        )
      : undefined);
  const carouselHostRef = useRef<HTMLDivElement>(null);

  const prefersReducedMotion = usePrefersReducedMotion();

  const {
    showNavigation: resolvedShowNavigation,
    showPagination: resolvedShowPagination,
    navigationLayout: resolvedNavigationLayout,
    buttonPlacement: resolvedButtonPlacement,
    buttonStyle: resolvedButtonStyle,
    buttonShape: resolvedButtonShape,
    slideEmphasis: resolvedSlideEmphasis,
    autoPlay: resolvedAutoPlay,
    loop: resolvedLoop,
    delay,
    baseSlides,
    baseSpaceBetween,
    breakpoints: resolvedBreakpoints,
  } = resolveCarouselOptions(layoutOptions, controlOptions);

  const resolvedNavButtonProps = mergeButtonChromeProps(
    resolvedButtonStyle,
    resolvedButtonShape,
    navButtonProps,
  );

  const [api, setInternalApi] = useState<UseEmblaCarouselType[1] | null>(null);
  const isVertical = orientation === "vertical";
  const verticalViewportHeight = Math.max(
    120,
    layoutOptions?.verticalViewportHeight ?? 480,
  );
  const slideBasisVars = useMemo(
    () =>
      buildSlideBasisVarsForOrientation({
        baseSlides,
        baseSpaceBetween,
        breakpoints: resolvedBreakpoints,
        isVertical,
        verticalViewportHeight,
      }),
    [
      baseSlides,
      baseSpaceBetween,
      resolvedBreakpoints,
      isVertical,
      verticalViewportHeight,
    ],
  );

  const isSpotlight = spotlightEnabled(
    resolvedSlideEmphasis,
    isVertical,
    resolvedItems.length,
  );

  const shouldAutoPlay =
    resolvedAutoPlay && !prefersReducedMotion && resolvedItems.length > 1;
  const shouldUseApi = shouldAutoPlay || resolvedShowPagination || isSpotlight;
  const { snapCount, selectedIndex } = useCarouselSnapState(api, shouldUseApi);

  useCarouselAutoplay({
    api,
    enabled: shouldAutoPlay,
    loop: resolvedLoop,
    delay,
  });

  const content = (
    <ItemCarouselSlides
      items={resolvedItems}
      renderItem={renderItem}
      getKey={getKey}
      isSpotlight={isSpotlight}
      selectedIndex={selectedIndex}
      api={api}
      isVertical={isVertical}
      contentClassName={contentClassName}
      itemClassName={itemClassName}
      itemInnerClassName={itemInnerClassName}
    />
  );

  const headingLayout = heading?.layout;
  const { isHeaderNavLayout, isSplitLayout, isInlineHeading } =
    resolveHeadingArrangement(
      heading,
      headingPlacement,
      resolvedNavigationLayout,
    );

  const carouselBlock = (
    <Carousel
      orientation={orientation}
      // Spotlight emphasis requires center-aligned snaps — the selected
      // slide must sit mid-strip with compacts peeking at both edges —
      // so it wins over caller `opts.align` (families hardcode "start").
      opts={{
        align: "start",
        loop: resolvedLoop,
        ...opts,
        ...(isSpotlight ? { align: "center" as const } : {}),
      }}
      className={cn(
        "w-full",
        SLIDE_BASIS_EFF_CLASSES,
        SLIDE_GAP_EFF_CLASSES,
        isVertical
          ? "pt-(--ic-gap-eff) pb-(--ic-gap-eff)"
          : "ps-(--ic-gap-eff) pe-(--ic-gap-eff)",
        carouselClassName,
      )}
      aria-label={ariaLabel}
      setApi={(nextApi) => {
        setInternalApi(nextApi ?? null);
        setApi?.(nextApi);
      }}
      style={slideBasisVars}
    >
      <CarouselChrome
        navigationLayout={resolvedNavigationLayout}
        showNavigation={resolvedShowNavigation}
        buttonPlacement={resolvedButtonPlacement}
        orientation={orientation}
        heading={heading}
        content={content}
        navButtonProps={resolvedNavButtonProps}
        prevButtonProps={prevButtonProps}
        nextButtonProps={nextButtonProps}
      />
    </Carousel>
  );
  const carouselBlockWithHost = (
    <div ref={carouselHostRef} className="min-w-0">
      {carouselBlock}
    </div>
  );

  return (
    <div className={className}>
      {heading && (isSplitLayout || isInlineHeading) ? (
        <SplitHeadingLayout
          headingLayout={headingLayout}
          heading={heading}
          resultControls={resolvedResultControls}
          gridClassName={
            isInlineHeading ? INLINE_HEADING_GRID_CLASS : undefined
          }
        >
          {carouselBlockWithHost}
        </SplitHeadingLayout>
      ) : (
        <>
          {heading && !isHeaderNavLayout ? (
            <SectionHeading {...heading} />
          ) : null}
          {resolvedResultControls ? (
            <ResultControls {...resolvedResultControls} className="mb-4" />
          ) : null}
          {carouselBlockWithHost}
        </>
      )}

      {resolvedShowPagination && snapCount > 1 ? (
        <CarouselPaginationDots
          api={api}
          snapPoints={[...Array.from({ length: snapCount }).keys()]}
          selectedIndex={selectedIndex}
        />
      ) : null}
    </div>
  );
}

/**
 * Wrap composed placeholder children as carousel slides. Pass as
 * ListingFallback `wrapComposed` so dropped cards still ride Embla
 * instead of stacking.
 */
export function ComposedItemCarousel({
  nodes,
  ...props
}: {
  nodes: React.ReactNode[];
} & Omit<ItemCarouselProps<React.ReactNode>, "items" | "getKey" | "renderItem">) {
  return (
    <ItemCarousel
      items={nodes}
      getKey={composedCarouselKey}
      renderItem={(node) => node}
      {...props}
    />
  );
}
