"use client";

/**
 * Hero Carousel — multi-slide, full-bleed rotating hero.
 *
 * PLACEHOLDER-COMPOSED (the visual-tabs pattern): authors drop
 * `hero@1` renderings into the `hero-carousel-{*}` placeholder and
 * **each dropped hero becomes one slide** — carrying the FULL hero
 * control surface (overlay axes, heading treatment, media playback,
 * CTAs) one hero at a time. There is no Items/Slides field in the
 * authoring surface anymore; the placeholder IS the slide list.
 *
 * EDITING: the canvas renders the raw `<Placeholder>` as a stacked
 * tray of hero sections with full Pages chrome, so authors can add /
 * select / reorder / delete slides visually. Preview / published mode
 * wraps the same children in the rotating carousel chrome.
 *
 * Carousel behavior rides on the shared Embla primitive plus the
 * official Autoplay / Fade plugins:
 *
 *   - `AutoplayInterval` — off / 4s / 6s / 8s. Pauses on hover and
 *     focus; disabled entirely under `prefers-reduced-motion` (static
 *     first slide, manual controls stay available).
 *   - `Transition` — slide (horizontal scroll) or fade (cross-fade).
 *   - `ShowArrows` / `ShowIndicators` / `Loop` — chrome + wrap.
 *   - `IndicatorPlacement` — `inside` (default; chrome overlays the
 *     slides) or `below` (dots + arrows on the page background under
 *     the band — pairs with inset `MediaInset` hero slides).
 *
 * Accessible: the Carousel primitive stamps
 * `aria-roledescription="carousel"` and arrow-key handling; each slide
 * is a labelled `role="group"` / `aria-roledescription="slide"`;
 * arrows and indicator dots are real buttons.
 */

import Autoplay from "embla-carousel-autoplay";
import Fade from "embla-carousel-fade";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/registry/primitives/core/button";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/registry/primitives/core/carousel";
import { getSourceText } from "@/components/registry/primitives/editables/source-normalizers";
import type { TextSource } from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import { parseBoolParam } from "@/lib/registry/param-parsers";
import { resolvePlaceholderChildren } from "@/lib/registry/placeholder-children";
import type { CmsProps, ComponentRendering } from "@/lib/registry/sitecore";
import { Placeholder } from "@/lib/registry/sitecore";
import { useReducedMotion } from "@/lib/registry/use-reduced-motion";

/**
 * Flat props delivered by the `hero-carousel.sitecore.ts` adapter (or
 * directly by the preview).
 *
 * The authoring model is placeholder composition — each `hero@1`
 * rendering dropped into `hero-carousel-{*}` is one slide and carries
 * its own params.
 */
export interface HeroCarouselProps extends CmsProps {
  /** Dynamic-placeholder suffix for the `hero-carousel-{*}` slot. */
  dynamicPlaceholderId?: string;

  // ─── Carousel behavior ────────────────────────────────────────────
  /** Auto-rotation cadence (`autoplay-interval@1`): off / 4s / 6s / 8s. */
  autoplayInterval?: string;
  /** Snap transition (`carousel-transition@1`): slide / fade. */
  transition?: string;
  /** Render the indicator dot rail. Default on. */
  showIndicators?: string | boolean;
  /** Render the previous / next arrow buttons. Default on. */
  showArrows?: string | boolean;
  /**
   * Where the dots + arrows sit (`indicator-placement@1`): `inside`
   * (default — overlaid on the slides) or `below` (dot rail AND arrows
   * on the page background under the band; pairs with inset slides).
   */
  indicatorPlacement?: string;
  /** Wrap from the last slide back to the first. Default on. */
  loop?: string | boolean;
}

// ─── Param resolution ─────────────────────────────────────────────────

/** `autoplay-interval@1` value → milliseconds (`null` = off). */
function parseAutoplayDelayMs(value: string | undefined): number | null {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "4s") return 4000;
  if (normalized === "6s") return 6000;
  if (normalized === "8s") return 8000;
  return null;
}

function parseTransition(value: string | undefined): "slide" | "fade" {
  return value?.trim().toLowerCase() === "fade" ? "fade" : "slide";
}

/** `indicator-placement@1` — unknown / empty → `inside`. */
function parseIndicatorPlacement(
  value: string | undefined,
): "inside" | "below" {
  return value?.trim().toLowerCase() === "below" ? "below" : "inside";
}

// ─── Indicators ───────────────────────────────────────────────────────

function HeroCarouselIndicators({
  api,
  count,
  selectedIndex,
  placement = "inside",
}: {
  api: CarouselApi | null;
  count: number;
  selectedIndex: number;
  placement?: "inside" | "below";
}) {
  const isBelow = placement === "below";
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2",
        // `inside` overlays the rail on the slides; `below` renders it
        // in flow on the page background (the wrapping chrome bar owns
        // spacing there).
        !isBelow && "absolute inset-x-0 bottom-4 z-20",
      )}
    >
      {Array.from({ length: count }, (_, index) => index).map((index) => (
        <Button
          key={`indicator-${index}`}
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => api?.scrollTo(index)}
          className={cn(
            "h-2.5 w-2.5 rounded-full p-0",
            // Over the slides the dots sit on an unknown photo — the
            // theme-white pair + shadow keeps them legible. Below the
            // band they sit on the page surface, so they follow the
            // color-role contract instead: active dot = solid primary
            // fill; idle dots = de-emphasized muted-foreground tint.
            isBelow
              ? index === selectedIndex
                ? "bg-primary hover:bg-primary-hover"
                : "bg-muted-foreground/40 hover:bg-muted-foreground/60"
              : cn(
                  "shadow-sm",
                  index === selectedIndex
                    ? "bg-theme-white"
                    : "bg-theme-white/40 hover:bg-theme-white/60",
                ),
          )}
          aria-label={`Go to slide ${index + 1}`}
          aria-current={index === selectedIndex ? "true" : undefined}
        />
      ))}
    </div>
  );
}

/**
 * Arrow + dot chrome for the carousel, split by `IndicatorPlacement`.
 * `inside` overlays the chrome on the slides (the classic treatment);
 * `below` renders dots AND prev/next arrows in a flow bar on the page
 * background under the band (the dots-below look that pairs with inset
 * hero slides). The below-bar arrows drop their default absolute
 * positioning via `static` (tailwind-merge resolves the position-class
 * conflict). Must render inside `<Carousel>` — the buttons read the
 * carousel context.
 */
function HeroCarouselChrome({
  placement,
  showArrows,
  showIndicators,
  hasMultipleSlides,
  api,
  count,
  selectedIndex,
}: {
  placement: "inside" | "below";
  showArrows: boolean;
  showIndicators: boolean;
  hasMultipleSlides: boolean;
  api: CarouselApi | null;
  count: number;
  selectedIndex: number;
}) {
  if (!hasMultipleSlides || !(showArrows || showIndicators)) return null;
  if (placement === "below") {
    return (
      <div
        data-slot="hero-carousel-below-chrome"
        className="container flex items-center justify-center gap-4 py-4"
      >
        {showArrows ? (
          <CarouselPrevious className="static translate-x-0 translate-y-0" />
        ) : null}
        {showIndicators ? (
          <HeroCarouselIndicators
            api={api}
            count={count}
            selectedIndex={selectedIndex}
            placement="below"
          />
        ) : null}
        {showArrows ? (
          <CarouselNext className="static translate-x-0 translate-y-0" />
        ) : null}
      </div>
    );
  }
  return (
    <>
      {showArrows ? (
        <>
          <CarouselPrevious className="start-4 z-20 rtl:start-auto rtl:end-4" />
          <CarouselNext className="end-4 z-20 rtl:start-4 rtl:end-auto" />
        </>
      ) : null}
      {showIndicators ? (
        <HeroCarouselIndicators
          api={api}
          count={count}
          selectedIndex={selectedIndex}
        />
      ) : null}
    </>
  );
}

/** Track Embla's selected snap for the indicator rail. */
function useSelectedSnap(api: CarouselApi | null): number {
  const [selectedIndex, setSelectedIndex] = useState(0);
  useEffect(() => {
    if (!api) return;
    const onSelect = () => setSelectedIndex(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);
  return selectedIndex;
}

// ─── Composed slides (placeholder children) ───────────────────────────

/**
 * Envelope shape of a `hero@1` rendering dropped into the
 * `hero-carousel-{*}` slot. Only the bits the carousel chrome reads —
 * the child renders itself through the SDK component map.
 */
interface HeroCarouselChildRendering {
  uid?: string;
  componentName?: string;
  fields?: { Title?: TextSource };
}

/**
 * One resolved slide for the shared carousel chrome — a
 * placeholder-composed hero rendering.
 */
interface HeroCarouselSlideEntry {
  key: string;
  /** Accessible slide label (the hero's Title when readable). */
  label: string | undefined;
  node: ReactNode;
}

/**
 * Mount ONE placeholder child as a slide. The SDK `<Placeholder>`
 * renders every child under a key, so each slide gets a sliced
 * envelope whose slot carries just its own child — the same component
 * map / adapter path a tenant runs, one hero at a time.
 */
function ComposedSlide({
  rendering,
  slotKey,
  child,
}: {
  rendering: ComponentRendering;
  slotKey: string;
  child: HeroCarouselChildRendering;
}) {
  const sliced = {
    ...rendering,
    placeholders: { [slotKey]: [child] },
  } as ComponentRendering;
  return <Placeholder name={slotKey} rendering={sliced} />;
}

// ─── Variant ──────────────────────────────────────────────────────────

/**
 * Default — full-bleed rotating hero. Slides come from the
 * `hero-carousel-{*}` placeholder (each dropped `hero@1` rendering is
 * one slide, with its own full param surface).
 * Carousel behavior (autoplay / transition / arrows / dots / loop) is
 * carousel-level.
 */
export function Default(props: HeroCarouselProps) {
  const { id, styles, isEditing, rendering } = props;
  const reducedMotion = useReducedMotion();

  const { key: slotKey, children: composedSlides } =
    resolvePlaceholderChildren<HeroCarouselChildRendering>(
      rendering,
      "hero-carousel",
      props.dynamicPlaceholderId,
    );

  const entries: HeroCarouselSlideEntry[] =
    composedSlides.length > 0 && rendering
      ? composedSlides.map((child, index) => ({
          key: child.uid ?? `slide-${index}`,
          label: getSourceText(child.fields?.Title),
          node: (
            <ComposedSlide
              rendering={rendering}
              slotKey={slotKey}
              child={child}
            />
          ),
        }))
      : [];

  const showArrows = parseBoolParam(props.showArrows, true);
  const showIndicators = parseBoolParam(props.showIndicators, true);
  const indicatorPlacement = parseIndicatorPlacement(props.indicatorPlacement);
  const loop = parseBoolParam(props.loop, true);
  const transition = parseTransition(props.transition);
  const autoplayDelayMs = parseAutoplayDelayMs(props.autoplayInterval);
  const hasMultipleSlides = entries.length > 1;
  // Autoplay pauses on hover + focus (plugin options) and is disabled
  // entirely for reduced-motion users and in Pages editing — they get
  // a static first slide with manual controls.
  const autoplayEnabled =
    autoplayDelayMs != null &&
    hasMultipleSlides &&
    !reducedMotion &&
    !isEditing;

  const [api, setApi] = useState<CarouselApi | null>(null);
  const selectedIndex = useSelectedSnap(api);

  const plugins = useMemo(() => {
    const list = [];
    if (transition === "fade") list.push(Fade());
    if (autoplayEnabled && autoplayDelayMs != null) {
      list.push(
        Autoplay({
          delay: autoplayDelayMs,
          stopOnMouseEnter: true,
          stopOnFocusIn: true,
          stopOnInteraction: false,
        }),
      );
    }
    return list;
  }, [transition, autoplayEnabled, autoplayDelayMs]);

  const sectionProps = {
    className: cn(
      "component hero-carousel w-full overflow-hidden",
      styles?.trimEnd(),
    ),
    id: id ?? undefined,
    "data-slot": "hero-carousel",
    "data-variant": "Default",
    dir: "inherit",
  } as const;

  // EDITING with a real envelope: mount the raw Placeholder as a
  // stacked tray — every dropped hero renders standalone with full
  // Pages chrome so authors add / select / reorder / delete slides
  // (the visual-tabs authoring model). The rotating presentation is
  // what preview / published mode shows.
  if (isEditing && rendering) {
    return (
      <section {...sectionProps}>
        <div className="space-y-3" data-slot="hero-carousel-editing-tray">
          <Placeholder name={slotKey} rendering={rendering} />
        </div>
      </section>
    );
  }

  if (entries.length === 0) {
    // Empty carousel — visible chrome in editing so authors see the
    // drop target; nothing on the published page.
    if (!isEditing) return null;
    return (
      <section {...sectionProps}>
        <div className="container mx-auto flex min-h-[220px] items-center justify-center rounded-md border border-border border-dashed bg-muted/30 px-4 text-muted-foreground">
          Hero carousel — drop Hero renderings into the carousel placeholder
          (each hero is one slide)
        </div>
      </section>
    );
  }

  const ariaLabel = entries[0]?.label
    ? `Hero carousel: ${entries[0].label}`
    : "Hero carousel";

  const isBelowChrome = indicatorPlacement === "below";

  return (
    <section
      {...sectionProps}
      data-transition={transition}
      data-indicator-placement={indicatorPlacement}
    >
      <Carousel
        opts={{ align: "start", loop, watchDrag: hasMultipleSlides }}
        plugins={plugins}
        setApi={setApi}
        aria-label={ariaLabel}
        className="relative"
      >
        <CarouselContent>
          {entries.map((entry, index) => (
            <CarouselItem
              key={entry.key}
              aria-label={
                entry.label ?? `Slide ${index + 1} of ${entries.length}`
              }
            >
              {entry.node}
            </CarouselItem>
          ))}
        </CarouselContent>
        <HeroCarouselChrome
          placement={isBelowChrome ? "below" : "inside"}
          showArrows={showArrows}
          showIndicators={showIndicators}
          hasMultipleSlides={hasMultipleSlides}
          api={api}
          count={entries.length}
          selectedIndex={selectedIndex}
        />
      </Carousel>
    </section>
  );
}

export default Default;

/**
 * `universal` opts this file into BOTH the server and client
 * component maps the SDK generates (component-map.ts +
 * component-map.client.ts) so Pages chrome can resolve the
 * named-export variant client-side.
 */
export const componentType = "universal";
