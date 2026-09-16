"use client";

// Self-register this component's CDP events into the runtime catalog.
// See `@/lib/registry/analytics/cdp-events` for the push-based
// registration rationale.
import { registerCdpRecipe } from "@/lib/registry/analytics/cdp-events";
import heroRecipe from "@/recipes/hero.recipe";

registerCdpRecipe(heroRecipe);

import { useId } from "react";

import { VideoBlock } from "@/components/registry/blocks/video-block";
import { NextImage } from "@/components/registry/primitives/editables/image";
import {
  getImageSrc,
  getSourceText,
  isEmptySource,
} from "@/components/registry/primitives/editables/source-normalizers";
import { useSectionAnalytics } from "@/lib/registry/analytics/use-section-analytics";
import { cn } from "@/lib/registry/cn";
import { resolveEditingMode } from "@/lib/registry/editing-mode";
import type {
  HeroBlockProps,
  HeroFrameLayout,
  HeroHeadingOptions,
  HeroMediaInset,
  HeroOverlayOptions,
  HeroParams,
  HeroVariantProps,
} from "@/lib/registry/heros-and-promos/hero.types";
import {
  HeroFrame,
  heroBottomBandClass,
  parseHeroMediaInset,
} from "@/lib/registry/heros-and-promos/hero-frame";
import { HeroHeading } from "@/lib/registry/heros-and-promos/hero-heading";
import {
  backgroundColorClass,
  resolveOverlayBreachEdge,
} from "@/lib/registry/heros-and-promos/hero-overlay";
import {
  buildVideoPlaybackBehavior,
  resolveVideoPlayback,
} from "@/lib/registry/media-playback";
import {
  isEnabled,
  parseBoolParam,
  parseButtonSize,
  parseButtonVariant,
  parseColorScheme,
  parseDefaultOnCheckbox,
  parseOverlayColorScheme,
  parseOverlayMobilePosition,
  parseOverlayPosition,
  parseOverlayShape,
  parseOverlayStyle,
  parseOverlayWidth,
  parseTitleWeight,
} from "@/lib/registry/param-parsers";
import type { ComponentRendering } from "@/lib/registry/sitecore";
import { Placeholder } from "@/lib/registry/sitecore";
import { useReducedMotion } from "@/lib/registry/use-reduced-motion";

export type * from "@/lib/registry/heros-and-promos/hero.types";

/**
 * Meta payload passed to analytics callbacks for the Hero component.
 */
export interface HeroAnalyticsMeta {
  id?: string;
  instanceKey?: string;
  instanceScope?: "site" | "page";
  variant?: string;
  /** Anchor text at fire-time. Set on `*-cta-clicked`. */
  label?: string;
  /** Resolved href. Set on `*-cta-clicked`. */
  href?: string;
}

function useHeroAnalytics({
  variant,
  params,
  fields,
}: {
  variant: string;
  params: HeroBlockProps["params"];
  fields: HeroBlockProps["fields"];
}) {
  const { rootRef, onClickDelegate } = useSectionAnalytics<HeroAnalyticsMeta>({
    family: "hero",
    variant,
    id: params?.RenderingIdentifier,
    instanceKey: params?.InstanceKey || params?.RenderingIdentifier,
    instanceScope: params?.InstanceScope as "site" | "page" | undefined,
    titleSource: fields.title,
    eventsEnabled: isEnabled(params?.TrackEvents),
    isEditing: resolveEditingMode({ params }),
    // CTA clicks deferred until the anchor data-cdp-* tagging pass —
    // an empty ctas array short-circuits CTA fires while view tracking
    // still routes through the SDK pageView().
    ctas: [],
  });
  return { rootRef, onClickDelegate };
}

const toParamString = (
  value: string | boolean | number | undefined,
): string | undefined => {
  if (value === undefined) return undefined;
  if (typeof value === "string") return value;
  return String(value);
};

/**
 * Bridge from the flat `HeroVariantProps` public API to the internal
 * `{ fields, params }` envelope HeroImpl consumes.
 */
const bridgeToEnvelope = (props: HeroVariantProps): HeroBlockProps => {
  const fields = {
    eyebrow: props.eyebrow,
    title: props.title,
    subtitle: props.subtitle,
    description: props.description,
    primaryAction: props.primaryAction,
    secondaryAction: props.secondaryAction,
    media: {
      image: props.image,
      videoUrl: props.videoUrl,
      videoLabel: props.videoLabel,
      videoCaptionUrl: props.videoCaptionUrl,
    },
  };
  const params: HeroParams = {
    HeadingLayout: props.headingLayout,
    TitleSize: props.titleSize,
    TitleWeight: props.titleWeight,
    Layout: props.layout,
    EyebrowColorScheme: props.eyebrowColorScheme,
    PrimaryActionVariant: props.primaryActionVariant,
    PrimaryActionColorScheme: props.primaryActionColorScheme,
    PrimaryActionShowArrow: toParamString(props.primaryActionShowArrow),
    SecondaryActionVariant: props.secondaryActionVariant,
    SecondaryActionColorScheme: props.secondaryActionColorScheme,
    SecondaryActionShowArrow: toParamString(props.secondaryActionShowArrow),
    ActionSize: props.actionSize,
    OverlayEnabled: toParamString(props.overlayEnabled),
    OverlayStyle: props.overlayStyle,
    OverlayColorScheme: props.overlayColorScheme,
    OverlayShape: props.overlayShape,
    OverlayWidth: props.overlayWidth,
    OverlayPosition: props.overlayPosition,
    OverlayMobilePosition: props.overlayMobilePosition,
    OverlayPadding: props.overlayPadding,
    OverlayOpacity: toParamString(props.overlayOpacity),
    OverlayBreach: toParamString(props.overlayBreach),
    BackgroundColor: props.backgroundColor,
    MediaInset: props.mediaInset,
    BottomBandColorScheme: props.bottomBandColorScheme,
    BottomBandIntensity: props.bottomBandIntensity,
    MediaPlayback: props.mediaPlayback,
    MediaMuted: toParamString(props.mediaMuted),
    MediaLoop: toParamString(props.mediaLoop),
    InstanceKey: props.instanceKey,
    InstanceScope: props.instanceScope,
    TrackEvents: toParamString(props.trackEvents),
    RenderingIdentifier: props.id,
    styles: props.styles,
  } as HeroParams;
  return {
    fields,
    params,
    id: props.id,
    styles: props.styles,
    isEditing: props.isEditing,
    rendering: props.rendering,
    mediaSlot: props.mediaSlot,
  } as HeroBlockProps;
};

/**
 * Map the `Layout` text-alignment param (start / centered / end) down to
 * the internal `HeroHeadingOptions.align` vocabulary (start / center /
 * end). Unset falls back to `defaultAlign` when the caller pins one
 * (the Placeholders band centers its heading over the centered tile
 * row), else centered text on centered frames, start everywhere else.
 */
function headingAlignFromLayout(
  layout: HeroParams["Layout"],
  frameLayout: HeroFrameLayout,
  defaultAlign?: NonNullable<HeroHeadingOptions["align"]>,
): NonNullable<HeroHeadingOptions["align"]> {
  if (layout === "centered") return "center";
  if (layout === "start" || layout === "end") return layout;
  if (defaultAlign) return defaultAlign;
  return frameLayout === "centered" ? "center" : "start";
}

function resolveHeroLayout(
  params: HeroBlockProps["params"],
  frameLayout: HeroFrameLayout,
  opts?: {
    defaultHeadingAlign?: NonNullable<HeroHeadingOptions["align"]>;
    defaultOverlayWidth?: NonNullable<HeroOverlayOptions["width"]>;
  },
) {
  const heading: HeroHeadingOptions = {
    layout: params?.HeadingLayout ?? "display",
    titleSize: parseButtonSize(params?.TitleSize),
    titleWeight: parseTitleWeight(params?.TitleWeight),
    align: headingAlignFromLayout(
      params?.Layout,
      frameLayout,
      opts?.defaultHeadingAlign,
    ),
    eyebrowColorScheme: params?.EyebrowColorScheme ?? "neutral",
    // CTA treatment — a single `ActionSize` sizes both buttons; each
    // button carries its own variant + colorScheme + arrow toggle
    // (secondary defaults to the outline treatment it has always had).
    actionSize: parseButtonSize(params?.ActionSize),
    primaryActionVariant: parseButtonVariant(
      params?.PrimaryActionVariant,
      "default",
    ),
    primaryActionColorScheme: parseColorScheme(
      params?.PrimaryActionColorScheme,
      "primary",
    ),
    primaryActionShowArrow: isEnabled(params?.PrimaryActionShowArrow),
    secondaryActionVariant: parseButtonVariant(
      params?.SecondaryActionVariant,
      "outline",
    ),
    secondaryActionColorScheme: parseColorScheme(
      params?.SecondaryActionColorScheme,
      "neutral",
    ),
    secondaryActionShowArrow: isEnabled(params?.SecondaryActionShowArrow),
  };
  const overlay: HeroOverlayOptions = {
    // `default: "true"` -> unchecking emits ""; parseBoolParam would
    // hand back the `true` fallback and the overlay could never be off,
    // despite the recipe documenting `OverlayEnabled = false`.
    enabled: parseDefaultOnCheckbox(params?.OverlayEnabled),
    style: parseOverlayStyle(params?.OverlayStyle, "solid"),
    colorScheme: parseOverlayColorScheme(params?.OverlayColorScheme, "black"),
    shape: parseOverlayShape(params?.OverlayShape, "card"),
    width: parseOverlayWidth(
      params?.OverlayWidth,
      opts?.defaultOverlayWidth ?? "half",
    ),
    position: parseOverlayPosition(params?.OverlayPosition, "start"),
    mobilePosition: parseOverlayMobilePosition(
      params?.OverlayMobilePosition,
      "top",
    ),
    // `size@1` Droplink — GUIDs / empty coerce via parseButtonSize.
    padding: parseButtonSize(params?.OverlayPadding, "md"),
    opacity: Number.parseFloat(params?.OverlayOpacity ?? "45"),
    // OFF-checkbox convention: absent param = no breach.
    breach: isEnabled(params?.OverlayBreach),
  };
  const backgroundColor = params?.BackgroundColor;
  const mediaInset: HeroMediaInset = parseHeroMediaInset(params?.MediaInset);
  const bottomBandClass = heroBottomBandClass(
    params?.BottomBandColorScheme,
    params?.BottomBandIntensity,
  );
  return { heading, overlay, backgroundColor, mediaInset, bottomBandClass };
}

// True when any source-driven overlay field carries content. Extracted
// from HeroImpl so its multi-clause boolean doesn't inflate the
// component's cognitive complexity.
const hasAnyOverlayContent = (fields: HeroBlockProps["fields"]): boolean => {
  const candidates = [
    fields.eyebrow,
    fields.title,
    fields.subtitle,
    fields.description,
    fields.primaryAction,
    fields.secondaryAction,
  ];
  return candidates.some((field) => field && !isEmptySource(field));
};

// The overlay placeholder shell for the Placeholders variant. Resolves
// against a real layout-service envelope when present, else renders a
// static stub so the showcase/preview still shows visible chrome.
//
// The requested name must be CONCRETE (`hero-overlay-content-<n>`, the
// SXA convention column-splitter follows via DynamicPlaceholderId) —
// the SDK's dynamic matcher only pattern-matches a raw `{*}` key on the
// DATA side against a concrete requested name, never the reverse, so
// requesting the raw `hero-overlay-content-{*}` string can never
// resolve the concrete suffixed keys a tenant delivers. A concrete
// request matches both concrete data keys (exact) and raw `{*}` data
// keys (the SDK's pattern branch).
function HeroPlaceholderContent({
  rendering,
  dynamicPlaceholderId,
}: {
  rendering: HeroBlockProps["rendering"];
  dynamicPlaceholderId?: string;
}) {
  if (rendering) {
    return (
      <Placeholder
        name={`hero-overlay-content-${dynamicPlaceholderId ?? "1"}`}
        rendering={rendering as ComponentRendering}
      />
    );
  }
  return (
    <div className="flex min-h-[180px] w-full items-center justify-center rounded-md border border-border border-dashed bg-muted/30 text-muted-foreground">
      hero-overlay-content
    </div>
  );
}

// Builds the hero's media layer (custom slot, video, or image) from the
// resolved media fields + params. Extracted from HeroImpl to keep its
// cognitive complexity in check.
function HeroMedia({
  params,
  media,
  mediaSlot,
  isEditing,
  isFullBleed,
  reducedMotion,
  mediaLabel,
  mediaVideoUrl,
  captionTrackUrl,
}: {
  params: HeroBlockProps["params"];
  media: HeroBlockProps["fields"]["media"];
  mediaSlot: HeroBlockProps["mediaSlot"];
  isEditing: HeroBlockProps["isEditing"];
  isFullBleed: boolean;
  reducedMotion: boolean;
  mediaLabel: string;
  mediaVideoUrl: string | undefined;
  captionTrackUrl: string | undefined;
}) {
  const hasCustomMediaSlot = mediaSlot != null;
  if (hasCustomMediaSlot) return mediaSlot;
  const hasMediaImage = Boolean(media?.image && !isEmptySource(media.image));
  const hasMediaVideo = Boolean(mediaVideoUrl);
  if (!(hasMediaImage || hasMediaVideo)) return null;

  if (hasMediaVideo && mediaVideoUrl) {
    // One `video-playback@1` axis decides how the video starts.
    const playback = resolveVideoPlayback({
      playback: params?.MediaPlayback,
    });
    const behavior = buildVideoPlaybackBehavior({
      playback,
      reducedMotion,
      ambient: isFullBleed,
      muted: parseBoolParam(params?.MediaMuted, false),
      loop: parseBoolParam(params?.MediaLoop, playback === "autoplay"),
      // The authored image doubles as the video poster: click-to-play
      // shows it behind the play affordance (falling back to the
      // provider thumbnail inside VideoBlock); autoplay uses it as the
      // native loading placeholder.
      poster: getImageSrc(media?.image),
    });
    return (
      <VideoBlock
        url={mediaVideoUrl}
        label={mediaLabel}
        behaviorOptions={{
          ...behavior,
          captions: captionTrackUrl
            ? {
                trackUrl: captionTrackUrl,
                language: "en",
                label: "English captions",
              }
            : undefined,
        }}
        className="size-full object-cover"
      />
    );
  }
  if (media?.image) {
    return (
      <NextImage
        value={media.image}
        className="size-full object-cover"
        fill
        sizes="100vw"
        isEditing={isEditing}
        placeholder="Hero background"
      />
    );
  }
  return null;
}

interface HeroImplProps extends HeroBlockProps {
  variant: string;
  frameLayout: HeroFrameLayout;
  /**
   * When true, render the `hero-overlay-content-{*}` Sitecore
   * placeholder inside the overlay panel, below the source-driven
   * heading (which renders only when a heading field carries
   * content). Used by the `Placeholders` variant only — source-driven
   * variants don't paint a placeholder shell so previews stay clean.
   */
  usePlaceholderContent?: boolean;
}

/**
 * EDITING: render the breach as the normal anchored position — the
 * shifted card would push editable fields/chrome outside the frame
 * (and under sibling chrome) in Pages; authors still see the breach
 * in preview/published mode. Extracted from HeroImpl for the
 * complexity ceiling.
 */
function overlayForEditingMode(
  overlay: HeroOverlayOptions,
  isEditing: boolean | undefined,
): HeroOverlayOptions {
  return isEditing && overlay.breach ? { ...overlay, breach: false } : overlay;
}

/**
 * Diagnostic data attributes for the new inset/breach/band axes —
 * stamped only when ACTIVE so stored full-bleed placements keep
 * byte-identical markup. Extracted from HeroImpl for the complexity
 * ceiling.
 */
function resolveHeroDataAttributes({
  overlay,
  shouldRenderOverlay,
  hasMedia,
  mediaInset,
  bottomBandClass,
}: {
  overlay: HeroOverlayOptions;
  shouldRenderOverlay: boolean;
  hasMedia: boolean;
  mediaInset: HeroMediaInset;
  bottomBandClass: string;
}): {
  "data-media-inset"?: string;
  "data-overlay-breach"?: string;
  "data-bottom-band"?: string;
} {
  const breachEdge = shouldRenderOverlay
    ? resolveOverlayBreachEdge(overlay)
    : "none";
  return {
    "data-media-inset":
      hasMedia && mediaInset !== "fullBleed" ? mediaInset : undefined,
    "data-overlay-breach": breachEdge !== "none" ? breachEdge : undefined,
    "data-bottom-band": bottomBandClass !== "" ? "" : undefined,
  };
}

function HeroImpl({
  params,
  fields,
  mediaSlot,
  variant,
  isEditing,
  rendering,
  frameLayout,
  usePlaceholderContent,
}: HeroImplProps) {
  const { heading, overlay, backgroundColor, mediaInset, bottomBandClass } =
    resolveHeroLayout(
      params,
      frameLayout,
      // The Placeholders band composes a child row into the overlay
      // panel, so its defaults are band-shaped: the heading centers over
      // the centered child row (task-portal composition) and the panel
      // spans the frame — the half-width start-anchored overlay CARD is
      // never the band look, and a centered heading inside it reads as
      // badly off-center. Explicit `Layout` / `OverlayWidth` params
      // still win.
      usePlaceholderContent
        ? { defaultHeadingAlign: "center", defaultOverlayWidth: "full" }
        : undefined,
    );

  const overlayForFrame = overlayForEditingMode(overlay, isEditing);

  const reducedMotion = useReducedMotion();
  const titleId = useId();

  const media = fields.media;
  const hasMediaImage = Boolean(media?.image && !isEmptySource(media.image));
  const mediaVideoUrl = getSourceText(media?.videoUrl);
  const hasMediaVideo = Boolean(mediaVideoUrl);
  const hasCustomMediaSlot = mediaSlot != null;
  const hasMedia = hasCustomMediaSlot || hasMediaImage || hasMediaVideo;
  const mediaLabel =
    getSourceText(media?.videoLabel) ??
    getSourceText(fields.title) ??
    "Hero media";
  const captionTrackUrl = getSourceText(media?.videoCaptionUrl);

  const isFullBleed = frameLayout === "full-bleed";
  const isCentered = frameLayout === "centered";
  const isSplit = frameLayout === "split";
  const isStack = frameLayout === "stacked";

  const { rootRef, onClickDelegate } = useHeroAnalytics({
    variant,
    params,
    fields,
  });

  // Hide the overlay entirely when there's nothing meaningful to
  // render. The Placeholders variant forces it on so authors always
  // have a panel they can drop renderings into.
  const hasOverlayContent = hasAnyOverlayContent(fields);
  const shouldRenderOverlay =
    Boolean(overlay.enabled) &&
    (usePlaceholderContent || hasOverlayContent || Boolean(isEditing));

  // Source-driven heading column. Built unconditionally so the analytics
  // refs and aria-labelledby wiring stay stable; the Placeholders
  // variant only mounts it when a heading field carries content.
  const headingNode = (
    <HeroHeading
      fields={fields}
      heading={heading}
      isEditing={isEditing}
      titleId={titleId}
    />
  );

  // Placeholder needs a real layout-service envelope to resolve.
  // Falls back to a static stub when no envelope is present so the
  // Placeholders variant still has visible chrome in preview/showcase.
  const placeholderNode = usePlaceholderContent ? (
    <HeroPlaceholderContent
      rendering={rendering}
      dynamicPlaceholderId={
        (params as Record<string, string | undefined> | undefined)
          ?.DynamicPlaceholderId
      }
    />
  ) : null;

  const mediaNode = (
    <HeroMedia
      params={params}
      media={media}
      mediaSlot={mediaSlot}
      isEditing={isEditing}
      isFullBleed={isFullBleed}
      reducedMotion={reducedMotion}
      mediaLabel={mediaLabel}
      mediaVideoUrl={mediaVideoUrl}
      captionTrackUrl={captionTrackUrl}
    />
  );

  const hasTitle = Boolean(fields.title && !isEmptySource(fields.title));

  // Placeholders variant: the overlay panel renders the source-driven
  // heading column ABOVE the placeholder shell — but only when a heading
  // field actually carries content, so an all-empty datasource renders
  // the bare drop zone exactly as before (no phantom empty heading
  // stack under the slot). This is what makes the "photo band with a
  // centered heading + a floating row of utility tiles" composition
  // (Duke-Energy-style task portal) a single hero Placeholders
  // instance: Title on the hero, quick-links-tiles composed in the
  // slot. Source-driven variants render the heading column and pass
  // `null` for the placeholder slot.
  const contentNodeForFrame = usePlaceholderContent
    ? hasOverlayContent
      ? headingNode
      : null
    : headingNode;
  const placeholderNodeForFrame = placeholderNode;

  const insetDataAttributes = resolveHeroDataAttributes({
    overlay: overlayForFrame,
    shouldRenderOverlay,
    hasMedia,
    mediaInset,
    bottomBandClass,
  });

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: event delegation on wrapper — anchors inside handle keyboard activation themselves.
    <section
      ref={rootRef}
      onClick={onClickDelegate}
      className={cn(
        "component hero w-full overflow-hidden",
        // Solid background color paints the section when no image /
        // video is set; image / video always wins (rendered absolute
        // over the section). Falls back to page background otherwise.
        !hasMedia && backgroundColorClass(backgroundColor)
          ? backgroundColorClass(backgroundColor)
          : "bg-background text-foreground",
        // Mobile floor sized so a short overlay (eyebrow + 2-line
        // title + CTAs) still shows a strip of background image
        // above/below the panel — but doesn't manufacture empty
        // space when content is sparse. Desktop keeps the original
        // 540px editorial floor.
        isFullBleed &&
          "relative min-h-[320px] text-foreground md:min-h-[540px]",
        params?.styles?.trimEnd(),
      )}
      id={params?.RenderingIdentifier ?? undefined}
      aria-labelledby={hasTitle ? titleId : undefined}
      data-slot="hero"
      data-variant={variant}
      data-frame-layout={frameLayout}
      {...insetDataAttributes}
      dir="inherit"
    >
      <HeroFrame
        isFullBleed={isFullBleed}
        isCentered={isCentered}
        isSplit={isSplit}
        isStack={isStack}
        hasMedia={hasMedia}
        hasCustomMediaSlot={hasCustomMediaSlot}
        overlay={overlayForFrame}
        overlayEnabled={shouldRenderOverlay}
        mediaInset={mediaInset}
        bottomBandClass={bottomBandClass}
        mediaNode={mediaNode}
        contentNode={contentNodeForFrame}
        placeholderNode={placeholderNodeForFrame}
      />
    </section>
  );
}

/**
 * FullBleed — edge-to-edge media with an overlay panel. The flagship
 * editorial treatment and the variant most page-tops will pick.
 */
export function FullBleed(props: HeroVariantProps) {
  return (
    <HeroImpl
      {...bridgeToEnvelope(props)}
      variant="FullBleed"
      frameLayout="full-bleed"
    />
  );
}

// Split / Stacked / Centered intentionally NOT exported from this
// canonical. Hero is the overlay-design rendering — two-column /
// stacked / centered editorial treatments belong on `promo@1`. Don't
// re-add them here; surface them on Promo instead.

/**
 * Placeholders — Full-bleed shell with the overlay panel exposed as
 * the `hero-overlay-content-{*}` Sitecore placeholder. Authors drop
 * arbitrary renderings (quick-links tile rows, badge strips, stats
 * grids, subscribe forms, custom CTAs) into the panel without the
 * component learning new fields.
 *
 * The source-driven heading fields (Eyebrow / Title / Subtitle /
 * Description / Primary+SecondaryAction) render ABOVE the slot when
 * any of them carries content; leave them all empty for a bare drop
 * zone. Canonical composition: photo band + dark full-band overlay
 * (`OverlayShape: full-height`, `OverlayWidth: full`, `OverlayStyle:
 * solid`, `OverlayColorScheme: black`, `OverlayOpacity: ~45`) +
 * `Layout: centered` Title + a compact `quick-links-tiles@1` row
 * composed in the slot — the utility/task-portal "How can we help
 * you?" band.
 *
 * Lives on its own variant — not surfaced inside the source-driven
 * variants — so FullBleed previews never paint a drop-zone shell.
 */
export function Placeholders(props: HeroVariantProps) {
  return (
    <HeroImpl
      {...bridgeToEnvelope(props)}
      variant="Placeholders"
      frameLayout="full-bleed"
      usePlaceholderContent
    />
  );
}

// `Default` stays as an alias for the most common variant so existing
// datasources that reference the unnamed variant resolve to the
// FullBleed editorial treatment.
export const Default = FullBleed;
export default Default;

/**
 * `universal` opts this file into BOTH the server and client
 * component maps the SDK generates (component-map.ts +
 * component-map.client.ts).
 */
export const componentType = "universal";
