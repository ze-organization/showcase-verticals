import type React from "react";
import { cn } from "@/lib/registry/cn";
import {
  parseSectionColorScheme,
  resolveSectionBackgroundClass,
} from "@/lib/registry/section-surface";
import type { HeroMediaInset, HeroOverlayOptions } from "./hero.types";
import {
  type HeroOverlayBreachEdge,
  HeroOverlayPanel,
  resolveOverlayBreachEdge,
} from "./hero-overlay";

/** Normalize `MediaInset` (`promo-inset@1`). Unknown / empty → `fullBleed`. */
export function parseHeroMediaInset(value: string | undefined): HeroMediaInset {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "contained") return "contained";
  if (normalized === "card") return "card";
  return "fullBleed";
}

/**
 * `BottomBandColorScheme` (+ `BottomBandIntensity`) → shared
 * section-surface classes for the bottom band strip. Intensity
 * defaults to BOLD (the Allstate-style saturated strip — pure brand
 * fill + inverted text tokens); `subtle` opts into the soft
 * `-background` tint. `none` / `default` / unknown scheme → "" (no
 * band).
 */
export function heroBottomBandClass(
  value: string | undefined,
  intensityValue?: string,
): string {
  const scheme = parseSectionColorScheme(value);
  if (scheme === "none" || scheme === "default") return "";
  // Two-value axis (`background-intensity@1`); absent/unknown → bold
  // so stored placements and the recipe default agree.
  const intensity =
    intensityValue?.trim().toLowerCase() === "subtle" ? "subtle" : "bold";
  return resolveSectionBackgroundClass(scheme, intensity);
}

// ─── Overlay breach classes ─────────────────────────────────────────
//
// Mechanics (cribbed from the `overlap-top@1` cards-over-hero pattern):
// the media frame keeps `overflow` visible, the panel takes a negative
// margin past the edge it straddles, and the band reserves matching
// padding on the breach side so nothing clips and the band grows to
// contain the overhang.
//
// Inline breach is md+ only — the mobile overlay is full-width, so an
// inline straddle can't read; mobile falls back to the normal stacked
// position (`OverlayMobilePosition`). Bottom breach works at every
// width (the card renders below the media in flow, superseding
// `OverlayMobilePosition` — it IS the bottom placement).

/**
 * Panel shift for an INSET media frame. The overlay container zeroes
 * its inline padding on the breach side (see below), so the negative
 * margin is the full overhang past the frame edge.
 */
const INSET_BREACH_PANEL_CLASS: Record<HeroOverlayBreachEdge, string> = {
  none: "",
  start: "md:-ms-10 lg:-ms-14",
  end: "md:-me-10 lg:-me-14",
  // Inset bottom breach doesn't use a panel shift — the panel renders
  // in a flow block after the frame with a negative TOP margin.
  bottom: "",
};

/**
 * Reserved padding around the inset media frame, matching the inset
 * panel shift exactly so the card's outer edge lands on the container
 * content edge (nothing clips under the section's overflow-hidden).
 */
const INSET_BREACH_RESERVE_CLASS: Record<HeroOverlayBreachEdge, string> = {
  none: "",
  start: "md:ps-10 lg:ps-14",
  end: "md:pe-10 lg:pe-14",
  bottom: "",
};

/**
 * Panel shift for FULL-BLEED media. There is no media edge to straddle
 * — the card just hangs into the section padding (the hint on
 * `OverlayBreach` says as much) — so the overhang is capped at the
 * container gutter (1rem at md, 2rem of gutter+margin at lg) so the
 * section's overflow-hidden never clips it. Bottom breach hangs into
 * the container's own bottom padding (py-8 / md:py-20 absorbs it).
 */
const FULL_BLEED_BREACH_PANEL_CLASS: Record<HeroOverlayBreachEdge, string> = {
  none: "",
  start: "md:-ms-4 lg:-ms-8",
  end: "md:-me-4 lg:-me-8",
  bottom: "-mb-6 md:-mb-8",
};

/**
 * Wrapper class for the overlay panel. The panel itself owns its own
 * inline-axis position (start / start-padded / center / end-padded /
 * end) via auto-margin classes on the panel; the wrapper gives the
 * row a flex container.
 *
 * Full-height shape on mobile collapses to content-height + full-width
 * (the section's own `min-h` supplies the band so the image stays
 * visible above/below). On desktop the panel stretches floor-to-ceiling
 * via `items-stretch`. Card shape keeps a band min-h on mobile so the
 * floating card never sits flush against tiny viewports.
 */
function resolveOverlayWrapperClass(overlay: HeroOverlayOptions): string {
  if (overlay.shape === "lower-third") {
    // Band pinned to the bottom of the hero — the wrapper supplies the
    // band height so the image stays dominant above the copy (the
    // editorial lower-third composition). The panel itself still owns
    // its OverlayWidth cap and OverlayPosition inline placement via
    // auto margins (flex-col cross-axis), same as the other shapes.
    return "relative z-10 flex min-h-[320px] w-full flex-col justify-end md:min-h-[540px] lg:min-h-[600px]";
  }
  const isFullHeight = overlay.shape === "full-height";
  // Mobile block-axis anchor — `top` puts the panel at the start of
  // the band (image visible below), `bottom` at the end.
  const mobileJustify =
    overlay.mobilePosition === "bottom" ? "justify-end" : "justify-start";
  return cn(
    "relative z-10 flex w-full flex-col",
    mobileJustify,
    // Mobile band min-h: full-height variant lets the panel and band
    // size to content; card variant gets a modest floor so it doesn't
    // collapse to a sliver but doesn't fight the section's own min-h.
    isFullHeight
      ? // md floor matches the section's own `md:min-h-[540px]` so the
        // full-height panel fills the band at tablet widths instead of
        // stopping short (leaving a strip of image below it).
        "md:flex-row md:items-stretch md:min-h-[540px] lg:min-h-[600px]"
      : "min-h-[220px] md:flex-row md:items-end md:min-h-[420px]",
  );
}

/**
 * Wraps the hero's media node. For caller-supplied compositions
 * (`hasCustomMediaSlot`) the chrome is skipped — the node brings its own
 * framing and shouldn't sit inside an `aspect-video`/`bg-muted`/
 * `overflow-hidden` box. For plain image/video media the standard
 * rounded panel applies.
 */
function HeroMediaPanel({
  variant,
  hasCustomMediaSlot,
  children,
}: {
  variant: "split" | "stack" | "default";
  hasCustomMediaSlot: boolean;
  children: React.ReactNode;
}) {
  if (hasCustomMediaSlot) {
    return <div>{children}</div>;
  }
  const baseChrome =
    "relative aspect-video overflow-hidden rounded-(--card-radius,var(--radius-xl)) bg-muted";
  if (variant === "split") {
    return <div className={baseChrome}>{children}</div>;
  }
  if (variant === "stack") {
    return <div className={baseChrome}>{children}</div>;
  }
  return <div className={cn(baseChrome, "md:aspect-16/7")}>{children}</div>;
}

interface HeroFrameProps {
  isFullBleed: boolean;
  isCentered: boolean;
  isSplit: boolean;
  isStack: boolean;
  hasMedia: boolean;
  /**
   * Media frame inset (`promo-inset@1`): `fullBleed` (default) keeps
   * the edge-to-edge treatment byte-identical to before the param
   * landed; `contained` / `card` constrain the media to the content
   * container with the page surface framing it.
   */
  mediaInset?: HeroMediaInset;
  /**
   * Pre-resolved section-surface classes for the bottom band strip
   * (`heroBottomBandClass`). "" = no band.
   */
  bottomBandClass?: string;
  /**
   * When true, `mediaNode` is a caller-supplied composition (e.g. a
   * twisted triptych gallery) that brings its own framing — aspect
   * ratio, background, rounded corners, overflow handling. The frame
   * skips its standard `bg-muted aspect-video overflow-hidden rounded-xl`
   * wrapper so transformed/scaled tiles aren't clipped.
   */
  hasCustomMediaSlot: boolean;
  overlay: HeroOverlayOptions;
  /** Whether to render the overlay panel at all. */
  overlayEnabled: boolean;
  mediaNode: React.ReactNode;
  contentNode: React.ReactNode;
  /**
   * Optional `<Placeholder name="hero-overlay-content-{*}" ...>`
   * rendered at the bottom of the overlay panel (full-bleed) or
   * below the content node (non-full-bleed).
   */
  placeholderNode: React.ReactNode;
}

/**
 * Bottom band strip (`BottomBandColorScheme`) — a solid color band
 * attached to the hero's bottom edge (the Allstate tabs-on-band base).
 * Always spans the full bleed width (rendered at section level, even
 * when the media itself is contained/card — the framed media floats
 * over the page surface, the band anchors the whole section). Painted
 * `relative` with no z-index so the z-10 overlay wrappers (including a
 * bottom-breaching card) render ABOVE it, and `relative` beats the
 * absolute full-bleed media behind it.
 */
function HeroBottomBand({ bandClass }: { bandClass: string }) {
  return (
    <div
      aria-hidden="true"
      data-slot="hero-bottom-band"
      className={cn("relative h-12 w-full md:h-16", bandClass)}
    />
  );
}

/**
 * Inset-media hero shell (`MediaInset: contained | card`) — the media
 * frame is constrained to the content container with the page surface
 * around it. The frame itself keeps overflow VISIBLE (the card-inset
 * radius clips on the media layer only) so an `OverlayBreach` card can
 * straddle the frame edge.
 */
function InsetMediaHeroBranch({
  isCard,
  overlay,
  overlayEnabled,
  breachEdge,
  hasBottomBand,
  mediaNode,
  panelChildren,
}: {
  isCard: boolean;
  overlay: HeroOverlayOptions;
  overlayEnabled: boolean;
  breachEdge: HeroOverlayBreachEdge;
  hasBottomBand: boolean;
  mediaNode: React.ReactNode;
  panelChildren: React.ReactNode;
}) {
  const isBandOverlay =
    overlayEnabled &&
    (overlay.shape === "full-height" || overlay.shape === "lower-third");
  const isBottomBreach = breachEdge === "bottom";
  const isInlineBreach = breachEdge === "start" || breachEdge === "end";

  // Overlay container inside the frame. Inline breach zeroes the
  // breach-side padding (md+ — mobile keeps the symmetric gutter, the
  // inline breach is desktop-only) so the panel's negative margin is
  // the full overhang past the frame edge.
  const overlayContainerClass = cn(
    "relative z-10 px-4 py-8 md:px-6 md:py-12",
    breachEdge === "end" && "md:pe-0",
    breachEdge === "start" && "md:ps-0",
  );

  const frame = (
    <div
      data-slot="hero-media-frame"
      // Overflow stays visible — a breaching overlay card must be able
      // to straddle the frame edge. The card-inset radius clips the
      // MEDIA layer below, never this wrapper.
      className="relative flex min-h-[320px] w-full flex-col md:min-h-[540px]"
    >
      <div
        className={cn(
          "absolute inset-0 z-0",
          isCard && "overflow-hidden rounded-(--card-radius,var(--radius-xl))",
        )}
      >
        {mediaNode}
      </div>
      {overlayEnabled && !isBottomBreach ? (
        isBandOverlay ? (
          <div className={resolveOverlayWrapperClass(overlay)}>
            <HeroOverlayPanel overlay={overlay}>
              {panelChildren}
            </HeroOverlayPanel>
          </div>
        ) : (
          <div className={overlayContainerClass}>
            <div className={resolveOverlayWrapperClass(overlay)}>
              <HeroOverlayPanel
                overlay={overlay}
                className={
                  isInlineBreach
                    ? INSET_BREACH_PANEL_CLASS[breachEdge]
                    : undefined
                }
              >
                {panelChildren}
              </HeroOverlayPanel>
            </div>
          </div>
        )
      ) : null}
      {!overlayEnabled ? (
        <div className="relative z-10 px-4 py-8 md:px-6 md:py-12">
          {panelChildren}
        </div>
      ) : null}
    </div>
  );

  return (
    <div
      className={cn(
        "container relative z-10 py-6 md:py-10",
        // With a bottom band under a bottom-breaching card, drop the
        // container's bottom gutter so the card's overhang lands ON
        // the band instead of in the gap above it.
        hasBottomBand && isBottomBreach && "pb-0 md:pb-0",
      )}
    >
      {isInlineBreach ? (
        // Reserved padding on the breach side — the frame narrows and
        // the card overhang lands in the reserve, so the section's
        // overflow-hidden never clips it and the band contains the
        // overhang (overlap-top mechanics, rotated to the inline axis).
        <div className={INSET_BREACH_RESERVE_CLASS[breachEdge]}>{frame}</div>
      ) : (
        frame
      )}
      {overlayEnabled && isBottomBreach ? (
        // Bottom breach = overlap-top mechanics in flow: the card
        // renders AFTER the frame with a negative top margin, so its
        // top half straddles the media's bottom edge while the lower
        // half stays in normal flow — the band grows to contain the
        // overhang at every width (this supersedes
        // OverlayMobilePosition; the card IS the bottom placement).
        <div
          className={cn(
            "relative z-10 -mt-16 flex w-full flex-col md:-mt-24 md:flex-row",
            // Dip onto the bottom band when present — the band (next
            // in flow) rises behind the card's lower edge.
            hasBottomBand && "-mb-6 md:-mb-8",
          )}
        >
          <HeroOverlayPanel overlay={overlay}>{panelChildren}</HeroOverlayPanel>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Full-bleed hero branch — media + overlay panel. Also hosts the
 * `MediaInset` (contained / card) and `BottomBandColorScheme` shells;
 * with the params absent the fullBleed markup is byte-identical to the
 * pre-param output for stored placements.
 */
function FullBleedHeroBranch({
  hasMedia,
  overlay,
  overlayEnabled,
  mediaInset = "fullBleed",
  bottomBandClass = "",
  mediaNode,
  contentNode,
  placeholderNode,
}: {
  hasMedia: boolean;
  overlay: HeroOverlayOptions;
  overlayEnabled: boolean;
  mediaInset?: HeroMediaInset;
  bottomBandClass?: string;
  mediaNode: React.ReactNode;
  contentNode: React.ReactNode;
  placeholderNode: React.ReactNode;
}) {
  const panelChildren = (
    <>
      {contentNode}
      {placeholderNode}
    </>
  );
  // Full-height and lower-third are band shapes — they render flush
  // (no container gutter); card keeps the constrained container.
  const isBandOverlay =
    overlayEnabled &&
    (overlay.shape === "full-height" || overlay.shape === "lower-third");
  const breachEdge = overlayEnabled
    ? resolveOverlayBreachEdge(overlay)
    : "none";
  const hasBottomBand = bottomBandClass !== "";
  const bandNode = hasBottomBand ? (
    <HeroBottomBand bandClass={bottomBandClass} />
  ) : null;

  // Inset media shell — only meaningful when there IS media to frame;
  // a media-less hero keeps the classic band regardless of the param.
  if (hasMedia && mediaInset !== "fullBleed") {
    return (
      <>
        <InsetMediaHeroBranch
          isCard={mediaInset === "card"}
          overlay={overlay}
          overlayEnabled={overlayEnabled}
          breachEdge={breachEdge}
          hasBottomBand={hasBottomBand}
          mediaNode={mediaNode}
          panelChildren={panelChildren}
        />
        {bandNode}
      </>
    );
  }

  // Render as a fragment — the parent <section> already establishes
  // the positioning context. Background color is painted by the
  // parent section via `backgroundColorClass` in HeroImpl.
  return (
    <>
      {hasMedia ? (
        <div className="absolute inset-0 z-0">{mediaNode}</div>
      ) : null}
      {isBandOverlay ? (
        <div className={resolveOverlayWrapperClass(overlay)}>
          <HeroOverlayPanel overlay={overlay}>{panelChildren}</HeroOverlayPanel>
        </div>
      ) : overlayEnabled ? (
        <div className="container relative z-10 py-8 md:py-20">
          <div className={resolveOverlayWrapperClass(overlay)}>
            <HeroOverlayPanel
              overlay={overlay}
              className={
                breachEdge !== "none"
                  ? FULL_BLEED_BREACH_PANEL_CLASS[breachEdge]
                  : undefined
              }
            >
              {panelChildren}
            </HeroOverlayPanel>
          </div>
        </div>
      ) : (
        <div className="container relative z-10 py-8 md:py-20">
          {panelChildren}
        </div>
      )}
      {bandNode}
    </>
  );
}

/**
 * Renders the frame/layout shell for Hero, independent from heading content.
 */
export function HeroFrame({
  isFullBleed,
  isCentered,
  isSplit,
  isStack,
  hasMedia,
  hasCustomMediaSlot,
  overlay,
  overlayEnabled,
  mediaInset,
  bottomBandClass,
  mediaNode,
  contentNode,
  placeholderNode,
}: HeroFrameProps) {
  if (isFullBleed) {
    return (
      <FullBleedHeroBranch
        hasMedia={hasMedia}
        overlay={overlay}
        overlayEnabled={overlayEnabled}
        mediaInset={mediaInset}
        bottomBandClass={bottomBandClass}
        mediaNode={mediaNode}
        contentNode={contentNode}
        placeholderNode={placeholderNode}
      />
    );
  }

  return (
    <div className="container py-8 md:py-16">
      <div
        className={cn(
          isCentered ? "mx-auto max-w-4xl text-center" : "",
          isSplit
            ? "grid gap-8 md:grid-cols-2 md:items-center"
            : isStack
              ? "mx-auto flex max-w-4xl flex-col gap-8"
              : "mx-auto flex max-w-6xl flex-col gap-6",
        )}
      >
        {isSplit && hasMedia ? (
          <HeroMediaPanel
            variant="split"
            hasCustomMediaSlot={hasCustomMediaSlot}
          >
            {mediaNode}
          </HeroMediaPanel>
        ) : null}
        <div className={cn(isCentered && "mx-auto max-w-3xl")}>
          {contentNode}
          {placeholderNode}
        </div>
        {isStack && hasMedia ? (
          <HeroMediaPanel
            variant="stack"
            hasCustomMediaSlot={hasCustomMediaSlot}
          >
            {mediaNode}
          </HeroMediaPanel>
        ) : null}
        {!isSplit && !isStack && hasMedia ? (
          <HeroMediaPanel
            variant="default"
            hasCustomMediaSlot={hasCustomMediaSlot}
          >
            {mediaNode}
          </HeroMediaPanel>
        ) : null}
      </div>
    </div>
  );
}
