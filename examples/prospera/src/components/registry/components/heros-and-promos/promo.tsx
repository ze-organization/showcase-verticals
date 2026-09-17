"use client";

/**
 * Promo / banner block — text + media + CTA.
 *
 * A single source-driven `Default` variant plus `Media` /
 * `Placeholders` shells. Two orthogonal axes drive the composition:
 *
 *   - `Layout` — text-block alignment only: `start` / `centered` / `end`.
 *   - `ImagePosition` — where the media sits relative to the text:
 *       `start` / `end` (two-column split), `above` / `below` (stacked),
 *       `hidden` (text only), `background` (media painted full-bleed
 *       behind the text). `background` falls back to the `SurfaceTone`
 *       band when no image is set, so it doubles as the classic
 *       text-led promo.
 *
 * On the two-column splits a non-`none` `SecondarySurfaceTone` flips
 * the band into the flush two-tone panel read (copy half on
 * `SurfaceTone`, media half on `SecondarySurfaceTone`) — the layout
 * the two-tone split promo needs.
 *
 * Subscription and Callout Card variants still live in sibling files
 * (subscription-banner.tsx, callout-card.tsx).
 */
import { registerCdpRecipe } from "@/lib/registry/analytics/cdp-events";
import promoRecipe from "@/recipes/promo.recipe";

registerCdpRecipe(promoRecipe);

import { type ReactNode, useId } from "react";
import { CtaGroup } from "@/components/registry/blocks/cta-group";
import { Eyebrow } from "@/components/registry/blocks/eyebrow";
import { TextOrRichText } from "@/components/registry/blocks/text-or-rich-text";
import { VideoBlock } from "@/components/registry/blocks/video-block";
import { AnimatedSection } from "@/components/registry/primitives/animations/animated-section";
import { TypographyH2 } from "@/components/registry/primitives/core/typography";
import type { ImageSource } from "@/components/registry/primitives/editables/image";
import { NextImage } from "@/components/registry/primitives/editables/image";
import type { LinkSource } from "@/components/registry/primitives/editables/link";
import type { RichTextSource } from "@/components/registry/primitives/editables/richtext";
import {
  getImageSrc,
  getNonEmptySource,
  getSourceText,
} from "@/components/registry/primitives/editables/source-normalizers";
import type { TextSource } from "@/components/registry/primitives/editables/text";
import { Text } from "@/components/registry/primitives/editables/text";
import { useSectionAnalytics } from "@/lib/registry/analytics/use-section-analytics";
import { cn } from "@/lib/registry/cn";
import {
  buttonColorScheme,
  type SurfaceTone,
  surfaceToneClass,
} from "@/lib/registry/color-scheme-classes";
import { isEmptySource } from "@/lib/registry/heros-and-promos/banner-types";
import {
  type MediaShape,
  parseOptionalMediaShape,
} from "@/lib/registry/media-shape";
import {
  type ButtonSizeValue,
  type ButtonVariantValue,
  isEnabled,
  parseActionTokens,
  parseBoolParam,
  parseButtonSize,
  parseButtonVariant,
  parseColorScheme,
} from "@/lib/registry/param-parsers";
import {
  parseSectionBackgroundPosition,
  parseSectionBackgroundScrim,
  SectionBackground,
  type SectionBackgroundPosition,
  type SectionBackgroundScrim,
  sectionBackgroundScrimFillClass,
  sectionBackgroundToneClass,
} from "@/lib/registry/section-background";
import {
  parseSectionPaddingY,
  SECTION_PADDING_Y_CLASSES,
  type SectionPaddingY,
} from "@/lib/registry/section-surface";
import type { CmsProps } from "@/lib/registry/sitecore";
import { Placeholder } from "@/lib/registry/sitecore";
import { useReducedMotion } from "@/lib/registry/use-reduced-motion";

/**
 * Promo color scheme set is the shared `SurfaceTone` (the
 * `color-scheme@1` axis) — kept as a local alias only for callers
 * that already import this name.
 */
export type PromoColorScheme = SurfaceTone;

/**
 * Flat props delivered by `withSitecore`'s default convention. Every
 * Promo variant accepts this shape — `title`, `description`, `image`,
 * `link`, plus the two layout axes (`layout` = text alignment,
 * `imagePosition` = media placement).
 */
export interface BannerVariantProps extends CmsProps {
  title?: TextSource;
  /** Alias for title (text-banner compatibility). */
  heading?: TextSource;
  description?: RichTextSource | TextSource;
  image?: ImageSource;
  /**
   * Optional video URL (YouTube / Vimeo / direct file). When populated
   * on the Default variant it takes over the media slot in EVERY
   * ImagePosition: `background` paints it full-bleed behind the text
   * with the standard dim treatment; `start` / `end` / `above` /
   * `below` render it in the media column; `hidden` still suppresses
   * all media. The `image` field always becomes the video's poster /
   * click-to-play thumbnail.
   */
  videoUrl?: TextSource;
  /**
   * Accessible name for the video — screen readers, the embed iframe
   * `title`, and the click-to-play button's label. NOT rendered as
   * visible text. Falls back to the title.
   */
  videoLabel?: TextSource;
  /**
   * Optional WebVTT captions track URL for direct-file videos — shown
   * via the player's CC control during playback. Ignored for
   * YouTube / Vimeo embeds (their captions come from the provider).
   */
  videoCaptionUrl?: TextSource;
  /**
   * `video-playback@1` — how the video starts. `click-to-play`
   * (default) shows the `image` field as a poster with a play button
   * and defers loading until click; `autoplay` starts it inline
   * immediately (always muted — browsers block unmuted autoplay — and
   * looped by default). Unset falls back to the position rule
   * (`background` → `autoplay`, everything else → `click-to-play`).
   * Reduced-motion users always get click-to-play.
   */
  videoPlayback?: string;
  /**
   * Mute the video. Composes with both playback modes; forced ON under
   * `autoplay` (browsers block unmuted autoplay).
   */
  mediaMuted?: string | boolean;
  /**
   * Loop the video. Composes with both playback modes; unset defaults
   * on for `autoplay` (ambient band) and off for `click-to-play`.
   */
  mediaLoop?: string | boolean;
  /** Optional eyebrow text above the title. */
  eyebrow?: TextSource;
  link?: LinkSource;
  /** Optional secondary CTA link source. Renders when populated. */
  secondaryAction?: LinkSource;
  /** Subscription / cta variants' alternate CTA field. */
  buttonLink?: LinkSource;
  // Overlay axis (banner-shared)
  overlayEnabled?: string;
  overlayPlacement?: string;
  overlaySurface?: string;
  overlayAlign?: string;
  overlayCoverage?: string;
  overlayForegroundTone?: string;
  overlayBackgroundTone?: string;
  overlayOpacity?: string;
  /**
   * Text-block alignment — `start` / `centered` / `end`. Controls only
   * how the title, copy, and CTAs align; media placement is the
   * separate `imagePosition` axis.
   */
  layout?: "start" | "centered" | "end";
  /**
   * Background tone + foreground text color. Aligned to the shared
   * color-scheme set. Paints the band on every `imagePosition` except
   * `background` when an image is present (the image then takes the
   * surface). `none` (default) leaves the page's neutral surface.
   */
  surfaceTone?: PromoColorScheme;
  /** Title scale token from `heading-size@1`. */
  titleSize?: string;
  /** Vertical padding around the band (`padding-y@1`). `default` keeps the standard promo padding. */
  paddingY?: string;
  /**
   * Where the image renders relative to the text. `start` / `end`
   * place it in a two-column split; `above` / `below` stack it;
   * `hidden` suppresses it even when populated; `background` (default)
   * paints it full-bleed behind the text, falling back to the
   * SurfaceTone band when unset.
   */
  imagePosition?: string;
  /**
   * Split ratio for the two-column ImagePositions (`media-fraction@1`):
   * `half` (default 1/2 : 1/2), `third` (media 1/3, copy 2/3), or
   * `twoThirds` (media 2/3, copy 1/3). Inert on stacked / background /
   * hidden positions.
   */
  mediaFraction?: string;
  /**
   * Framing of the media box on the split / stacked ImagePositions
   * (`media-shape@1`): `default`/unset keeps the stock chrome (theme
   * card radius), `rounded` steps up to an explicitly larger radius,
   * `circle` clips the media to a full circle in a constrained square
   * box — the resmed "circular photo beside copy" promo. Inert on
   * background / hidden positions.
   */
  mediaShape?: string;
  /**
   * Copy-block horizontal alignment override (`alignment@1`). When set
   * (`start` / `center` / `end`) it wins over the `layout` axis;
   * `default`/unset defers to `layout`.
   */
  contentAlign?: string;
  /**
   * Fill behind the MEDIA side (`color-scheme@1`). A non-`none` value
   * on the `start` / `end` splits flips the band into the flush
   * two-tone panel read: the copy half
   * rides `surfaceTone`, the media half paints this tone behind a
   * contained media shot. `none` (default) keeps the classic
   * single-surface split. Inert on stacked / background / hidden
   * positions.
   */
  secondarySurfaceTone?: PromoColorScheme;
  /**
   * Vertical alignment of the copy block in the two-column splits
   * (`content-valign@1`): `top` / `center` (default) / `bottom`.
   * Inert on stacked / background / hidden positions.
   */
  contentVAlign?: string;
  /**
   * Band inset (`promo-inset@1`): `fullBleed` (default — the band
   * spans the full page width), `contained` (band constrained to the
   * content container; page surface shows around it), or `card`
   * (contained + `--card-radius` rounding, promo-as-card). A
   * `SurfaceTone: none` inset band falls back to the neutral tint —
   * a fill-less contained band would be indistinguishable from
   * fullBleed.
   */
  inset?: string;
  /**
   * Scrim over the full-bleed background media (image or video) when
   * `imagePosition === "background"` — `dark` (default) dims it and
   * flips the text light, `light` washes it and keeps text dark,
   * `none` leaves it untreated. Inert on every other ImagePosition
   * (and on the Media / Placeholders variants, which coerce
   * `background` to a stacked layout).
   */
  backgroundScrim?: string;
  /**
   * Per-placement digit suffix SXA injects for dynamic placeholders
   * (`IsRenderingsWithDynamicPlaceholders`). The Media / Placeholders
   * variants request `promo-media-<n>` / `promo-content-<n>` with it —
   * see the note on `PromoSlotPlaceholder`.
   */
  dynamicPlaceholderId?: string;
  /**
   * Crop anchor of the background image (`object-position`) —
   * `center` / `top` / `bottom`. Same scoping as `backgroundScrim`.
   */
  backgroundPosition?: string;
  /** Title entrance animation token from `heading-animation@1`. */
  headingAnimation?: string;
  /** Brand color of the eyebrow above the title. */
  eyebrowColorScheme?: string;
  /** Visual treatment for the eyebrow (`text` or `badge`). */
  eyebrowStyle?: string;
  /** Visual variant for the primary CTA button. */
  primaryActionVariant?: string;
  /**
   * Color scheme of the primary CTA button. Independent from
   * `surfaceTone`. Defaults to `primary`.
   */
  primaryActionColorScheme?: PromoColorScheme;
  /** Primary CTA label color (`heading-color@1`). */
  primaryActionFontColor?: string;
  /** Append a trailing arrow (→) after the primary CTA label. */
  primaryActionShowArrow?: string | boolean;
  /** Visual variant for the secondary CTA button. */
  secondaryActionVariant?: string;
  /** Color scheme of the secondary CTA button. */
  secondaryActionColorScheme?: PromoColorScheme;
  /** Secondary CTA label color (`heading-color@1`). */
  secondaryActionFontColor?: string;
  /** Append a trailing arrow (→) after the secondary CTA label. */
  secondaryActionShowArrow?: string | boolean;
  /** Size token shared by BOTH CTA buttons (`size@1`). */
  actionSize?: string;
  // `rendering` is inherited from CmsProps; the Media / Placeholders
  // variants hand it to `<Placeholder>` so the SDK can resolve nested
  // renderings.
  // Analytics
  instanceKey?: string;
  instanceScope?: "site" | "page";
  trackEvents?: string | boolean;
}

// `heading-animation@1` → AnimatedSection direction. Mirrors the
// section-heading mapping so authors get the same vocabulary across
// every animated heading surface (`banner-end` slides toward
// inline-start; `banner-start` toward inline-end; `banner-center`
// rises from below).
function titleAnimationDirection(
  value: string | undefined,
): "start" | "end" | "up" {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "banner-end") return "start";
  if (normalized === "banner-center") return "up";
  return "end";
}

function isAnimationEnabled(value: string | undefined): boolean {
  const normalized = value?.trim().toLowerCase();
  return Boolean(normalized && normalized !== "none");
}

function titleSizeClass(value: string | undefined): string {
  const normalized = value?.trim().toLowerCase();
  // Mobile-first sizing — keep the small-viewport scale conservative so
  // a long single word doesn't blow out a 375px column. Larger scales
  // unlock at `md:` and `lg:`.
  if (normalized === "text-banner")
    return "font-normal text-3xl tracking-tight md:text-5xl lg:text-6xl";
  // `xl` — the "strong headline block" scale. No font-weight utility so
  // the TypographyH2 base's `font-(--heading-weight,600)` token governs.
  if (normalized === "xl") return "text-3xl tracking-tight md:text-5xl";
  if (normalized === "large") return "font-semibold text-2xl md:text-4xl";
  if (normalized === "small") return "font-semibold text-lg md:text-xl";
  return "font-semibold text-xl md:text-3xl";
}

/** Meta payload passed to Banner analytics events. */
export interface BannerAnalyticsMeta {
  id?: string;
  instanceKey?: string;
  instanceScope?: "site" | "page";
  variant?: string;
  label?: string;
  href?: string;
}

// ─── Layout axes ─────────────────────────────────────────────────────

type TextAlign = "start" | "center" | "end";

/**
 * Map the `Layout` enum (`start` / `centered` / `end`) to a text
 * align. An explicit `ContentAlign` (`alignment@1` — `start` /
 * `center` / `end`) wins; `auto` (the recipe default) and unset both
 * defer to `layout` (any value that isn't a concrete alignment falls
 * through to the layout-derived pick).
 */
function parseTextAlign(
  layout: BannerVariantProps["layout"],
  contentAlign?: string,
): TextAlign {
  const override = contentAlign?.trim().toLowerCase();
  if (override === "start" || override === "center" || override === "end") {
    return override;
  }
  if (layout === "centered") return "center";
  if (layout === "end") return "end";
  return "start";
}

const TEXT_ALIGN_CLASS: Record<TextAlign, string> = {
  start: "text-start",
  center: "text-center",
  end: "text-end",
};

type ImagePosition =
  | "start"
  | "end"
  | "above"
  | "below"
  | "hidden"
  | "background";

/**
 * `media-fraction@1` — split ratio for the two-column ImagePositions.
 * All classes below are literal strings for the Tailwind JIT scanner
 * (never build `grid-cols-${n}` templates — the classes silently fail
 * to generate).
 */
type MediaFraction = "half" | "third" | "twoThirds";

const SPLIT_GRID_CLASS: Record<MediaFraction, string> = {
  half: "md:grid-cols-2",
  third: "md:grid-cols-3",
  twoThirds: "md:grid-cols-3",
};

const SPLIT_MEDIA_SPAN_CLASS: Record<MediaFraction, string> = {
  half: "",
  third: "md:col-span-1",
  twoThirds: "md:col-span-2",
};

const SPLIT_CONTENT_SPAN_CLASS: Record<MediaFraction, string> = {
  half: "",
  third: "md:col-span-2",
  twoThirds: "md:col-span-1",
};

/** Normalize `MediaFraction`. Unknown / empty → `half` (the classic 50/50). */
function parseMediaFraction(value: string | undefined): MediaFraction {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "third") return "third";
  if (normalized === "twothirds" || normalized === "two-thirds") {
    return "twoThirds";
  }
  return "half";
}

/**
 * `content-valign@1` — vertical alignment of the copy block within the
 * two-column splits.
 */
type ContentVAlign = "top" | "center" | "bottom";

const CONTENT_VALIGN_CLASS: Record<ContentVAlign, string> = {
  top: "justify-start",
  center: "justify-center",
  bottom: "justify-end",
};

/** Normalize `ContentVAlign`. Unknown / empty → `center` (the classic middle). */
function parseContentVAlign(value: string | undefined): ContentVAlign {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "top") return "top";
  if (normalized === "bottom") return "bottom";
  return "center";
}

/**
 * `promo-inset@1` — whether the band spans the full page width
 * (`fullBleed`, default), sits contained inside the content container
 * (`contained`), or renders as a contained card with `--card-radius`
 * rounding (`card`).
 */
type PromoInset = "fullBleed" | "contained" | "card";

/** Normalize `PromoInset`. Unknown / empty → `fullBleed`. */
function parsePromoInset(value: string | undefined): PromoInset {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "contained") return "contained";
  if (normalized === "card") return "card";
  return "fullBleed";
}

/**
 * Promo-local `media-shape@1` classes. The SHARED map's `rounded`
 * applies the theme card radius — but promo's stock media chrome
 * ALREADY carries the card radius, so `rounded` and `default`
 * rendered pixel-identically here. Promo therefore maps `rounded` to
 * an explicitly larger radius, and constrains the `circle` box
 * (`max-w-md mx-auto` on top of the shared square + full-round clip)
 * so the circle doesn't balloon to the full column width. Literal
 * strings only — Tailwind's scanner must see every class.
 */
const PROMO_MEDIA_SHAPE_CLASSES: Record<MediaShape, string> = {
  default: "",
  rounded: "overflow-hidden rounded-3xl",
  circle: "mx-auto aspect-square w-full max-w-md overflow-hidden rounded-full",
};

/** `video-playback@1` — the ONE axis for how an authored video starts. */
type VideoPlayback = "click-to-play" | "autoplay";

/**
 * Resolve the `VideoPlayback` axis. An explicit enum value wins; unset
 * falls back to the position rule (`background` bands autoplay, media
 * columns wait for the user).
 */
function parseVideoPlayback(
  props: BannerVariantProps,
  isBackground: boolean,
): VideoPlayback {
  const normalized = props.videoPlayback?.trim().toLowerCase();
  if (normalized === "autoplay") return "autoplay";
  if (normalized === "click-to-play" || normalized === "clicktoplay") {
    return "click-to-play";
  }
  return isBackground ? "autoplay" : "click-to-play";
}

/**
 * Normalize the `ImagePosition` enum. Unknown / empty falls back to
 * `background` — the graceful default that shows a clean SurfaceTone
 * band when no image is set and a full-bleed image when one is.
 */
function parseImagePosition(value: string | undefined): ImagePosition {
  const normalized = value?.trim().toLowerCase();
  if (
    normalized === "start" ||
    normalized === "end" ||
    normalized === "above" ||
    normalized === "below" ||
    normalized === "hidden" ||
    normalized === "background"
  )
    return normalized;
  return "background";
}

// ─── Shared shell ────────────────────────────────────────────────────

interface PromoShellProps {
  imagePosition: ImagePosition;
  textAlign: TextAlign;
  surfaceTone: PromoColorScheme;
  /**
   * Fill behind the media side (`color-scheme@1`). A non-`none` value
   * on a two-column split flips the shell into the flush two-tone
   * panel layout: copy panel on `surfaceTone`, media panel on this
   * tone, no gap, panels running full height (the two-tone split
   * read). Ignored on stacked / background / hidden positions.
   */
  secondaryTone?: PromoColorScheme;
  titleClass: string;
  /** Split ratio for the two-column ImagePositions (`media-fraction@1`). */
  mediaFraction?: MediaFraction;
  /** Copy-block vertical alignment in two-column splits (`content-valign@1`). */
  contentVAlign?: ContentVAlign;
  /** Band inset — full-bleed band / contained / card (`promo-inset@1`). */
  inset?: PromoInset;
  /** Vertical padding around the band (`padding-y@1`). */
  paddingY?: SectionPaddingY;
  headingAnimation?: string;
  eyebrow?: TextSource;
  eyebrowColorScheme?: string;
  eyebrowStyle?: string;
  actionSize: ButtonSizeValue;
  primaryVariant: ButtonVariantValue;
  primaryColorScheme: PromoColorScheme;
  primaryFontColor?: string;
  primaryShowArrow?: boolean;
  secondaryVariant: ButtonVariantValue;
  secondaryColorScheme: PromoColorScheme;
  secondaryFontColor?: string;
  secondaryShowArrow?: boolean;
  id?: string;
  styles?: string;
  title?: TextSource;
  description?: RichTextSource | TextSource;
  link?: LinkSource;
  secondaryLink?: LinkSource;
  /** Rendered media (image / video / placeholder). Ignored when hidden/background. */
  mediaSlot?: ReactNode;
  /** Painted full-bleed behind the text when `imagePosition === "background"`. */
  backgroundImage?: ImageSource;
  /** Scrim tone over the background media (shared section-background axis). */
  backgroundScrim: SectionBackgroundScrim;
  /** Crop anchor of the background image (shared section-background axis). */
  backgroundPosition: SectionBackgroundPosition;
  /**
   * Full-bleed video layer painted behind the text when
   * `imagePosition === "background"`. Takes precedence over
   * `backgroundImage` (which then acts as the video poster).
   */
  backgroundVideoSlot?: ReactNode;
  /**
   * Extra region appended BELOW the source-driven copy block
   * (Placeholders variant's `promo-content-{*}` slot) — eyebrow,
   * title, description, and CTAs keep rendering above it.
   */
  contentExtra?: ReactNode;
  variantName: string;
  isEditing?: boolean;
  instanceKey?: string;
  instanceScope?: "site" | "page";
  trackEvents?: string | boolean;
}

/**
 * Resolve which full-bleed background layer (video / image / none) the
 * shell paints for `imagePosition === "background"`. Video wins over
 * image (the image then serves as the video poster). Extracted from
 * PromoShell to keep its cognitive complexity in check.
 */
function resolveBackgroundMedia({
  imagePosition,
  backgroundImage,
  backgroundVideoSlot,
}: Pick<
  PromoShellProps,
  "imagePosition" | "backgroundImage" | "backgroundVideoSlot"
>): {
  hasBackgroundVideo: boolean;
  hasBackgroundImage: boolean;
  hasBackgroundMedia: boolean;
} {
  const isBackground = imagePosition === "background";
  const hasBackgroundVideo = isBackground && backgroundVideoSlot != null;
  const hasBackgroundImage =
    isBackground &&
    !hasBackgroundVideo &&
    backgroundImage != null &&
    !isEmptySource(backgroundImage);
  return {
    hasBackgroundVideo,
    hasBackgroundImage,
    hasBackgroundMedia: hasBackgroundImage || hasBackgroundVideo,
  };
}

/**
 * `padding-y@1` → section padding. `auto` (the recipe default) keeps
 * the promo's standard responsive band padding, which no single `py-*`
 * token reproduces. Extracted from PromoShell to keep its cognitive
 * complexity under the lint ceiling.
 */
function promoPaddingClass(paddingY: SectionPaddingY): string {
  return paddingY === "auto"
    ? "py-12 md:py-16 lg:py-24"
    : SECTION_PADDING_Y_CLASSES[paddingY];
}

/**
 * Section-root surface classes. With full-bleed background media the
 * band goes transparent and the scrim decides the text tone (`none`
 * keeps the page foreground — the author asserts the raw media is
 * legible); otherwise the SurfaceTone axis paints the band. Extracted
 * from PromoShell to keep its cognitive complexity under the ceiling.
 */
function promoSurfaceClass(
  hasBackgroundMedia: boolean,
  backgroundScrim: SectionBackgroundScrim,
  surfaceTone: PromoColorScheme,
): string {
  if (!hasBackgroundMedia) return surfaceToneClass(surfaceTone);
  return cn(
    "bg-transparent",
    sectionBackgroundToneClass(backgroundScrim) || "text-foreground",
  );
}

/**
 * Layout classes for the shell's content grid — split template +
 * vertical alignment from the MediaFraction / ContentVAlign axes.
 * Extracted from PromoShell to keep its cognitive complexity under
 * the lint ceiling.
 */
function promoContentGridClass({
  isInsetBand,
  isTwoColumn,
  isTwoTone,
  mediaFraction,
  contentVAlign,
  textAlign,
}: {
  isInsetBand: boolean;
  isTwoColumn: boolean;
  isTwoTone: boolean;
  mediaFraction: MediaFraction;
  contentVAlign: ContentVAlign;
  textAlign: TextAlign;
}): string {
  if (isTwoTone) {
    // Flush two-tone panels — no gap, no container gutter; the halves
    // carry their own padding + fills and stretch to equal height.
    return cn(
      "relative z-10 grid w-full md:items-stretch",
      SPLIT_GRID_CLASS[mediaFraction],
    );
  }
  return cn(
    isInsetBand
      ? "relative z-10 gap-8 px-6 md:px-10"
      : "container mx-auto px-4 relative z-10 gap-8",
    isTwoColumn
      ? cn(
          "grid",
          SPLIT_GRID_CLASS[mediaFraction],
          // Vertical centering only when the copy sits centered —
          // `top` / `bottom` need stretched cells for the copy
          // block's own justify-* to bite.
          contentVAlign === "center" ? "md:items-center" : "md:items-stretch",
        )
      : "flex flex-col",
    // Center the single content column when the text is centered.
    !isTwoColumn && textAlign === "center" && "mx-auto md:max-w-3xl",
  );
}

/**
 * Source-driven copy block (eyebrow + animated title + description +
 * CTAs) shared by the shell's non-contentSlot path. Extracted from
 * PromoShell to keep its cognitive complexity under the lint ceiling.
 */
function PromoCopyBlock({
  textAlign,
  isTwoColumn,
  contentVAlign,
  contentSpanClass,
  titleClass,
  titleId,
  headingAnimation,
  eyebrow,
  eyebrowColorScheme,
  eyebrowStyle,
  actionSize,
  primaryVariant,
  primaryColorScheme,
  primaryFontColor,
  primaryShowArrow,
  secondaryVariant,
  secondaryColorScheme,
  secondaryFontColor,
  secondaryShowArrow,
  title,
  description,
  link,
  secondaryLink,
  isEditing,
}: Pick<
  PromoShellProps,
  | "textAlign"
  | "titleClass"
  | "headingAnimation"
  | "eyebrow"
  | "eyebrowColorScheme"
  | "eyebrowStyle"
  | "actionSize"
  | "primaryVariant"
  | "primaryColorScheme"
  | "primaryFontColor"
  | "primaryShowArrow"
  | "secondaryVariant"
  | "secondaryColorScheme"
  | "secondaryFontColor"
  | "secondaryShowArrow"
  | "title"
  | "link"
  | "secondaryLink"
  | "isEditing"
> & {
  isTwoColumn: boolean;
  contentVAlign: ContentVAlign;
  contentSpanClass: string;
  titleId: string;
  description?: RichTextSource | TextSource;
}) {
  const animationEnabled = isAnimationEnabled(headingAnimation);
  const reducedMotion = useReducedMotion();
  const animationDirection = titleAnimationDirection(headingAnimation);
  return (
    <div
      className={cn(
        // No `items-*` — `align-items` on a flex-col collapses children
        // to content width, which makes `wrap-break-word` titles wrap
        // char-by-char at narrow widths. Align with `text-*` only.
        "flex flex-col gap-4",
        isTwoColumn && CONTENT_VALIGN_CLASS[contentVAlign],
        contentSpanClass || undefined,
        TEXT_ALIGN_CLASS[textAlign],
      )}
    >
      <Eyebrow
        value={eyebrow}
        colorScheme={eyebrowColorScheme}
        style={eyebrowStyle}
        align={textAlign}
        isEditing={isEditing}
      />
      <AnimatedSection
        direction={animationDirection}
        distanceInRem={12}
        delay={0}
        duration={1000}
        reducedMotion={reducedMotion || !animationEnabled}
      >
        <TypographyH2
          id={titleId}
          className={cn(
            "wrap-break-word text-balance border-0 pb-0 font-heading tracking-tight",
            titleClass,
          )}
        >
          <Text
            value={title}
            tag="span"
            isEditing={isEditing}
            placeholder="Title"
          />
        </TypographyH2>
      </AnimatedSection>
      {description && (
        <div
          className={cn(
            "wrap-break-word text-base leading-relaxed md:max-w-[60ch] md:text-lg",
            textAlign === "center" && "mx-auto",
            textAlign === "end" && "ms-auto",
          )}
        >
          <TextOrRichText value={description} textClassName="text-inherit" />
        </div>
      )}
      <CtaGroup
        primary={link}
        secondary={secondaryLink}
        justify={textAlign}
        primaryVariant={primaryVariant}
        primarySize={actionSize}
        primaryColorScheme={buttonColorScheme(primaryColorScheme)}
        primaryFontColor={primaryFontColor}
        primaryShowArrow={primaryShowArrow}
        secondaryVariant={secondaryVariant}
        secondarySize={actionSize}
        secondaryColorScheme={buttonColorScheme(secondaryColorScheme)}
        secondaryFontColor={secondaryFontColor}
        secondaryShowArrow={secondaryShowArrow}
      />
    </div>
  );
}

/**
 * Compose the shell's content column: the copy block, optionally with
 * the `contentExtra` region (Placeholders' `promo-content-{*}` slot)
 * appended BELOW it, optionally wrapped in the two-tone copy panel
 * (which then carries the SurfaceTone fill + padding + grid span).
 * Extracted from PromoShell for the complexity ceiling.
 */
function composePromoContentNode({
  copyBlock,
  contentExtra,
  isTwoTone,
  contentSpanClass,
  contentVAlign,
  surfaceTone,
}: {
  copyBlock: ReactNode;
  contentExtra: ReactNode | undefined;
  isTwoTone: boolean;
  contentSpanClass: string;
  contentVAlign: ContentVAlign;
  surfaceTone: PromoColorScheme;
}): ReactNode {
  const composedCopy =
    contentExtra != null ? (
      <div
        className={cn(
          "flex min-w-0 flex-col gap-6",
          !isTwoTone && contentSpanClass ? contentSpanClass : undefined,
        )}
      >
        {copyBlock}
        {contentExtra}
      </div>
    ) : (
      copyBlock
    );
  if (!isTwoTone) return composedCopy;
  return (
    <div
      className={cn(
        "flex flex-col px-6 py-12 md:px-10 lg:px-14 lg:py-16",
        CONTENT_VALIGN_CLASS[contentVAlign],
        surfaceToneClass(surfaceTone),
        contentSpanClass || undefined,
      )}
    >
      {composedCopy}
    </div>
  );
}

/**
 * Compose the shell's media column: bare span wrapper normally, or the
 * SecondarySurfaceTone panel (contained media shot on a color field,
 * full panel height) in two-tone mode. Extracted from PromoShell for
 * the complexity ceiling.
 */
function composePromoMediaNode({
  mediaSlot,
  showMedia,
  isTwoTone,
  mediaSpanClass,
  secondaryTone,
}: {
  mediaSlot: ReactNode;
  showMedia: boolean;
  isTwoTone: boolean;
  mediaSpanClass: string;
  secondaryTone: PromoColorScheme;
}): ReactNode | null {
  if (!showMedia) return null;
  if (isTwoTone) {
    return (
      <div
        className={cn(
          "relative flex min-h-72 items-center justify-center p-8 md:min-h-full md:p-10",
          surfaceToneClass(secondaryTone),
          mediaSpanClass || undefined,
        )}
      >
        {mediaSlot}
      </div>
    );
  }
  return (
    <div className={cn("relative w-full", mediaSpanClass || undefined)}>
      {mediaSlot}
    </div>
  );
}

/**
 * Resolve the tone the band actually paints. An inset band with no
 * fill of its own (SurfaceTone `none`, no background media) would be
 * indistinguishable from fullBleed, so it falls back to the neutral
 * tint; `data-surface-tone` keeps the authored value. Extracted from
 * PromoShell for the complexity ceiling.
 */
function promoBandTone({
  surfaceTone,
  isInsetBand,
  hasBackgroundMedia,
  isTwoTone,
}: {
  surfaceTone: PromoColorScheme;
  isInsetBand: boolean;
  hasBackgroundMedia: boolean;
  isTwoTone: boolean;
}): PromoColorScheme {
  return isInsetBand &&
    !hasBackgroundMedia &&
    !isTwoTone &&
    surfaceTone === "none"
    ? "neutral"
    : surfaceTone;
}

/**
 * Section-root vertical padding. Inset bands keep a slim frame gap;
 * two-tone panels are flush edge-to-edge (the halves pad themselves);
 * classic bands take the `padding-y@1` axis. Extracted from PromoShell
 * for the complexity ceiling.
 */
function promoSectionPaddingClass({
  isInsetBand,
  isTwoTone,
  paddingY,
}: {
  isInsetBand: boolean;
  isTwoTone: boolean;
  paddingY: SectionPaddingY;
}): string | undefined {
  if (isInsetBand) return "py-6 md:py-8";
  if (isTwoTone) return undefined;
  return promoPaddingClass(paddingY);
}

/**
 * Single shell shared by every Promo variant. `imagePosition` decides
 * the structural shape (two-column split / stacked / text-only /
 * background), `textAlign` decides how the text block aligns inside it.
 */
function PromoShell({
  imagePosition,
  textAlign,
  surfaceTone,
  secondaryTone = "none",
  titleClass,
  mediaFraction = "half",
  contentVAlign = "center",
  inset = "fullBleed",
  paddingY = "auto",
  headingAnimation,
  eyebrow,
  eyebrowColorScheme,
  eyebrowStyle,
  actionSize,
  primaryVariant,
  primaryColorScheme,
  primaryFontColor,
  primaryShowArrow,
  secondaryVariant,
  secondaryColorScheme,
  secondaryFontColor,
  secondaryShowArrow,
  id,
  styles,
  title,
  description: descriptionRaw,
  link,
  secondaryLink,
  mediaSlot,
  backgroundImage,
  backgroundScrim,
  backgroundPosition,
  backgroundVideoSlot,
  contentExtra,
  variantName,
  isEditing,
  instanceKey,
  instanceScope = "site",
  trackEvents,
}: PromoShellProps) {
  const description = getNonEmptySource(descriptionRaw);
  const isBackground = imagePosition === "background";
  const { hasBackgroundVideo, hasBackgroundImage, hasBackgroundMedia } =
    resolveBackgroundMedia({
      imagePosition,
      backgroundImage,
      backgroundVideoSlot,
    });
  const isTwoColumn = imagePosition === "start" || imagePosition === "end";
  // Two-tone panel mode — a concrete SecondarySurfaceTone on a split
  // flips the shell into the flush two-panel layout: copy panel on
  // surfaceTone, media panel on secondaryTone, both carrying their own
  // padding.
  const isTwoTone = isTwoColumn && secondaryTone !== "none";
  const showMedia = !isBackground && imagePosition !== "hidden";
  // Media leads on `start` (inline-start) and `above` (on top); trails
  // on `end` (inline-end) and `below` (underneath).
  const mediaFirst = imagePosition === "start" || imagePosition === "above";

  const { rootRef, onClickDelegate } = useSectionAnalytics<BannerAnalyticsMeta>(
    {
      family: "promo",
      variant: variantName,
      id,
      instanceKey,
      instanceScope,
      titleSource: title,
      eventsEnabled: isEnabled(trackEvents),
      isEditing: Boolean(isEditing),
      // CTA clicks deferred until the anchor data-cdp-* tagging pass.
      ctas: [],
    },
  );
  const titleId = useId();
  const hasTitle = title != null && !isEmptySource(title);

  // Two-column split shaping — grid template + per-column spans from
  // the `media-fraction@1` axis, copy-block vertical alignment from
  // `content-valign@1`. Empty strings collapse in `cn`.
  const contentSpanClass = isTwoColumn
    ? SPLIT_CONTENT_SPAN_CLASS[mediaFraction]
    : "";
  const mediaSpanClass = isTwoColumn
    ? SPLIT_MEDIA_SPAN_CLASS[mediaFraction]
    : "";

  // The copy block carries the grid-span class itself UNLESS a wrapper
  // (two-tone panel / contentExtra column) takes it over.
  const copyOwnsSpan = !isTwoTone && contentExtra == null;
  const copyBlock = (
    <PromoCopyBlock
      textAlign={textAlign}
      isTwoColumn={isTwoColumn}
      contentVAlign={contentVAlign}
      contentSpanClass={copyOwnsSpan ? contentSpanClass : ""}
      titleClass={titleClass}
      titleId={titleId}
      headingAnimation={headingAnimation}
      eyebrow={eyebrow}
      eyebrowColorScheme={eyebrowColorScheme}
      eyebrowStyle={eyebrowStyle}
      actionSize={actionSize}
      primaryVariant={primaryVariant}
      primaryColorScheme={primaryColorScheme}
      primaryFontColor={primaryFontColor}
      primaryShowArrow={primaryShowArrow}
      secondaryVariant={secondaryVariant}
      secondaryColorScheme={secondaryColorScheme}
      secondaryFontColor={secondaryFontColor}
      secondaryShowArrow={secondaryShowArrow}
      title={title}
      description={description}
      link={link}
      secondaryLink={secondaryLink}
      isEditing={isEditing}
    />
  );

  // Placeholders variant: the `promo-content-{*}` slot renders BELOW
  // the authored copy — heading, description, and CTAs stay visible.
  // Two-tone mode wraps the columns in padded, toned panels.
  const contentNode = composePromoContentNode({
    copyBlock,
    contentExtra,
    isTwoTone,
    contentSpanClass,
    contentVAlign,
    surfaceTone,
  });

  const mediaNode = composePromoMediaNode({
    mediaSlot,
    showMedia,
    isTwoTone,
    mediaSpanClass,
    secondaryTone,
  });

  // `contained` / `card` wrap the band (surface + background layers +
  // content) inside the page container so the page surface shows
  // around it; `fullBleed` (default) keeps the classic full-width band.
  const isInsetBand = inset !== "fullBleed";
  const bandTone = promoBandTone({
    surfaceTone,
    isInsetBand,
    hasBackgroundMedia,
    isTwoTone,
  });
  // In two-tone mode the panels own their fills; the band stays bare.
  const surfaceClass = isTwoTone
    ? ""
    : promoSurfaceClass(hasBackgroundMedia, backgroundScrim, bandTone);

  const backgroundLayers = (
    <>
      {hasBackgroundVideo && backgroundVideoSlot}
      {hasBackgroundImage && (
        <SectionBackground
          image={backgroundImage}
          scrim={backgroundScrim}
          position={backgroundPosition}
          scrimOpacity={0.45}
        />
      )}
    </>
  );

  const contentGrid = (
    <div
      className={promoContentGridClass({
        isInsetBand,
        isTwoColumn,
        isTwoTone,
        mediaFraction,
        contentVAlign,
        textAlign,
      })}
    >
      {mediaFirst ? (
        <>
          {mediaNode}
          {contentNode}
        </>
      ) : (
        <>
          {contentNode}
          {mediaNode}
        </>
      )}
    </div>
  );

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: event delegation on wrapper — anchors inside handle keyboard activation themselves.
    <section
      ref={rootRef}
      onClick={onClickDelegate}
      className={cn(
        "component promo relative w-full overflow-hidden",
        promoSectionPaddingClass({ isInsetBand, isTwoTone, paddingY }),
        isTwoColumn && "promo--two-column",
        !isInsetBand && surfaceClass,
        styles?.trimEnd(),
      )}
      id={id ?? undefined}
      aria-labelledby={hasTitle ? titleId : undefined}
      dir="inherit"
      data-slot="promo"
      data-variant={variantName}
      data-layout={textAlign}
      data-image-position={imagePosition}
      data-surface-tone={surfaceTone}
      data-secondary-surface-tone={secondaryTone}
      data-inset={inset}
    >
      {isInsetBand ? (
        <div className="container mx-auto px-4">
          <div
            className={cn(
              "relative w-full overflow-hidden",
              // Two-tone panels pad themselves; other bands pad here.
              !isTwoTone && promoPaddingClass(paddingY),
              surfaceClass,
              // `card` consumes the theme's card radius so the promo
              // reads as a card rather than a squared band.
              inset === "card" && "rounded-(--card-radius,var(--radius-lg))",
            )}
          >
            {backgroundLayers}
            {contentGrid}
          </div>
        </div>
      ) : (
        <>
          {backgroundLayers}
          {contentGrid}
        </>
      )}
    </section>
  );
}

/**
 * Resolve the shared style / action knobs from raw BannerVariantProps
 * so every variant shares one wiring.
 */
function resolveMediaVariantStyle(props: BannerVariantProps) {
  const actionTokens = parseActionTokens(props);
  return {
    tone: parseColorScheme(props.surfaceTone, "none"),
    titleClass: titleSizeClass(props.titleSize),
    textAlign: parseTextAlign(props.layout, props.contentAlign),
    actionSize: parseButtonSize(props.actionSize),
    primaryVariant: parseButtonVariant(props.primaryActionVariant, "default"),
    primaryScheme: actionTokens.primaryActionColorScheme,
    primaryFontColor: actionTokens.primaryActionFontColor,
    primaryShowArrow: isEnabled(props.primaryActionShowArrow),
    secondaryVariant: parseButtonVariant(
      props.secondaryActionVariant,
      "outline",
    ),
    secondaryScheme: actionTokens.secondaryActionColorScheme,
    secondaryFontColor: actionTokens.secondaryActionFontColor,
    secondaryShowArrow: isEnabled(props.secondaryActionShowArrow),
    secondaryLink:
      props.secondaryAction != null && !isEmptySource(props.secondaryAction)
        ? props.secondaryAction
        : undefined,
  };
}

/** Build the PromoShell props every variant shares. */
function commonShellProps(
  props: BannerVariantProps,
  style: ReturnType<typeof resolveMediaVariantStyle>,
  imagePosition: ImagePosition,
) {
  return {
    imagePosition,
    textAlign: style.textAlign,
    surfaceTone: style.tone,
    secondaryTone: parseColorScheme(props.secondarySurfaceTone, "none"),
    titleClass: style.titleClass,
    mediaFraction: parseMediaFraction(props.mediaFraction),
    contentVAlign: parseContentVAlign(props.contentVAlign),
    inset: parsePromoInset(props.inset),
    paddingY: parseSectionPaddingY(props.paddingY),
    headingAnimation: props.headingAnimation,
    eyebrow: props.eyebrow,
    eyebrowColorScheme: props.eyebrowColorScheme,
    eyebrowStyle: props.eyebrowStyle,
    actionSize: style.actionSize,
    primaryVariant: style.primaryVariant,
    primaryColorScheme: style.primaryScheme,
    primaryFontColor: style.primaryFontColor,
    primaryShowArrow: style.primaryShowArrow,
    secondaryVariant: style.secondaryVariant,
    secondaryColorScheme: style.secondaryScheme,
    secondaryFontColor: style.secondaryFontColor,
    secondaryShowArrow: style.secondaryShowArrow,
    backgroundScrim: parseSectionBackgroundScrim(props.backgroundScrim),
    backgroundPosition: parseSectionBackgroundPosition(
      props.backgroundPosition,
    ),
    id: props.id,
    styles: props.styles,
    title: props.title ?? props.heading,
    description: props.description,
    link:
      props.link != null && !isEmptySource(props.link) ? props.link : undefined,
    secondaryLink: style.secondaryLink,
    isEditing: props.isEditing,
    instanceKey: props.instanceKey,
    instanceScope: props.instanceScope,
    trackEvents: props.trackEvents,
  };
}

/**
 * Builds the `VideoBlock` for the Default variant's media slot,
 * driven by the `VideoPlayback` axis:
 *
 *   - `click-to-play` (default) — the `image` field renders as the
 *     poster / thumbnail with a play button; the video loads AND
 *     starts on the click (a user gesture, so sound is allowed).
 *   - `autoplay` — starts inline immediately, ALWAYS muted (browsers
 *     block unmuted autoplay), looped by default; the ambient
 *     background-band treatment. Controls stay visible outside the
 *     `background` position so users can pause.
 *
 * Reduced-motion users always get the click-to-play gate. The Muted /
 * Loop checkboxes compose with both modes (muted is forced on under
 * autoplay).
 */
function PromoVideo({
  props,
  videoUrl,
  isBackground,
  reducedMotion,
}: {
  props: BannerVariantProps;
  videoUrl: string;
  isBackground: boolean;
  reducedMotion: boolean;
}) {
  const label =
    getSourceText(props.videoLabel) ??
    getSourceText(props.title ?? props.heading) ??
    "Promo video";
  const captionTrackUrl = getSourceText(props.videoCaptionUrl);
  const requested = parseVideoPlayback(props, isBackground);
  // Reduced-motion users never get ambient autoplay — coerce to the
  // click-to-play gate (poster + explicit start).
  const playback: VideoPlayback = reducedMotion ? "click-to-play" : requested;
  const isAutoplay = playback === "autoplay";
  // Autoplay REQUIRES muted (browser policy); the Muted checkbox can
  // add muting to click-to-play but cannot unmute an autoplaying band.
  const muted = isAutoplay || isEnabled(props.mediaMuted);
  return (
    <VideoBlock
      url={videoUrl}
      label={label}
      behaviorOptions={{
        // Click-to-play defers the video behind the poster + play
        // button. `isLoaded` is deliberately NOT passed — the old
        // controlled `isLoaded: false` wiring pinned the gate shut
        // forever; VideoBlock's internal state flips it on click.
        load: { enabled: !isAutoplay, label: "Play video" },
        playback: {
          // Ambient background autoplay hides controls; every other
          // combination keeps them so users can pause / seek.
          controls: !(isAutoplay && isBackground),
          // Click-to-play mounts the player only after the gate click,
          // so `autoPlay` there means "start on that click".
          autoPlay: true,
          muted,
          // Loop composes with both modes: ambient autoplay loops by
          // default, click-to-play plays once by default.
          loop: parseBoolParam(props.mediaLoop, isAutoplay),
          playsInline: true,
          preload: isAutoplay ? "auto" : "metadata",
          // The Image field is the poster / click-to-play thumbnail.
          poster: getImageSrc(props.image),
        },
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

/**
 * Default — source-driven promo. `ImagePosition` drives the shape:
 * `background` (default) paints the `Image` field full-bleed (or a
 * clean `SurfaceTone` band when unset); `start` / `end` split into two
 * columns; `above` / `below` stack; `hidden` drops the media. `Layout`
 * aligns the text block; the primary + secondary CTAs render whenever
 * their Link fields are populated. A populated `videoUrl` takes over
 * the media slot in EVERY position (full-bleed background band or
 * media-column player); `image` then serves as the poster /
 * click-to-play thumbnail, per the `VideoPlayback` axis. A concrete
 * `SecondarySurfaceTone` on the splits flips the band into the flush
 * two-tone panel read.
 */
export function Default(props: BannerVariantProps) {
  const style = resolveMediaVariantStyle(props);
  const imagePosition = parseImagePosition(props.imagePosition);
  const reducedMotion = useReducedMotion();
  const isBackground = imagePosition === "background";
  const image =
    props.image != null && !isEmptySource(props.image)
      ? props.image
      : undefined;
  const videoUrl = getSourceText(props.videoUrl);
  const videoNode = videoUrl ? (
    <PromoVideo
      props={props}
      videoUrl={videoUrl}
      isBackground={isBackground}
      reducedMotion={reducedMotion}
    />
  ) : null;
  // Two-tone panel mode — a concrete SecondarySurfaceTone on a split
  // (the two-tone read). The media then renders as a
  // contained shot floating on the panel fill instead of a cropped
  // aspect-video box.
  const secondaryTone = parseColorScheme(props.secondarySurfaceTone, "none");
  const isTwoTonePanel =
    (imagePosition === "start" || imagePosition === "end") &&
    secondaryTone !== "none";
  // `media-shape@1` — placed after the stock chrome in cn() so the
  // circle's aspect-square / rounded-full win via tailwind-merge (the
  // resmed circular split-promo image).
  const mediaShape = parseOptionalMediaShape(props.mediaShape);
  const mediaSlot = (
    <div
      className={cn(
        isTwoTonePanel
          ? "relative min-h-56 w-full md:min-h-72"
          : "relative aspect-video w-full overflow-hidden rounded-(--card-radius,var(--radius-lg))",
        mediaShape && PROMO_MEDIA_SHAPE_CLASSES[mediaShape],
      )}
    >
      {videoNode ?? (
        <NextImage
          value={props.image}
          fill
          // The two-tone panel floats a contained (often cut-out) shot
          // on the color field; circle keeps cover so the clip fills.
          className={
            isTwoTonePanel && mediaShape !== "circle"
              ? "object-contain"
              : "object-cover"
          }
          sizes="(max-width: 768px) 100vw, 50vw"
          isEditing={props.isEditing}
          placeholder="Promo image"
        />
      )}
    </div>
  );
  // Full-bleed video band (Ketel One style) — same scrim treatment the
  // background image path applies via SectionBackground.
  const backgroundVideoScrim = parseSectionBackgroundScrim(
    props.backgroundScrim,
  );
  const backgroundVideoSlot = videoNode ? (
    <div className="absolute inset-0">
      {videoNode}
      {/* Purely visual scrim layer — pointer-events-none keeps the
          video's controls (reduced-motion) and click-to-load button
          reachable. `none` drops the layer entirely. */}
      {backgroundVideoScrim !== "none" ? (
        <div
          className={cn(
            "pointer-events-none absolute inset-0",
            sectionBackgroundScrimFillClass(backgroundVideoScrim),
          )}
          style={{ opacity: 0.45 }}
          aria-hidden
        />
      ) : null}
    </div>
  ) : undefined;
  return (
    <PromoShell
      {...commonShellProps(props, style, imagePosition)}
      mediaSlot={mediaSlot}
      backgroundImage={image}
      backgroundVideoSlot={backgroundVideoSlot}
      variantName="Default"
    />
  );
}

/**
 * Concrete slot name for the promo's dynamic placeholders. Same
 * rationale as `HeroPlaceholderContent` (hero.tsx) and column-splitter:
 * the SDK only pattern-matches a raw `{*}` key on the DATA side against
 * a concrete requested name — requesting the raw `promo-media-{*}`
 * string can never resolve the concrete suffixed keys a tenant
 * delivers, so the request must be `promo-media-<DynamicPlaceholderId>`.
 */
const promoSlotName = (base: string, props: BannerVariantProps): string =>
  `${base}-${props.dynamicPlaceholderId ?? "1"}`;

/**
 * Media — same shell as Default, but the media side reads the
 * `promo-media-{*}` placeholder so authors can drop arbitrary media
 * renderings in. `background` is not meaningful for a placeholder, so
 * it falls back to a stacked `above`.
 */
export function Media(props: BannerVariantProps) {
  const style = resolveMediaVariantStyle(props);
  const raw = parseImagePosition(props.imagePosition);
  const imagePosition = raw === "background" ? "above" : raw;
  const mediaSlot = props.rendering ? (
    <Placeholder
      name={promoSlotName("promo-media", props)}
      rendering={props.rendering as never}
    />
  ) : (
    <div className="relative aspect-video w-full overflow-hidden rounded-(--card-radius,var(--radius-lg)) bg-muted" />
  );
  return (
    <PromoShell
      {...commonShellProps(props, style, imagePosition)}
      mediaSlot={mediaSlot}
      variantName="Media"
    />
  );
}

/**
 * Placeholders — same shell as Default, with the media side reading
 * the `promo-media-{*}` placeholder (exactly like the Media variant)
 * and the TEXT side keeping the authored copy: eyebrow, title,
 * description, and CTAs render first, then the `promo-content-{*}`
 * placeholder region BELOW them, so authors can extend the copy
 * column with arbitrary renderings without losing the source-driven
 * fields. `background` falls back to a stacked `above`.
 */
export function Placeholders(props: BannerVariantProps) {
  const style = resolveMediaVariantStyle(props);
  const raw = parseImagePosition(props.imagePosition);
  const imagePosition = raw === "background" ? "above" : raw;
  const mediaSlot = props.rendering ? (
    <Placeholder
      name={promoSlotName("promo-media", props)}
      rendering={props.rendering as never}
    />
  ) : (
    <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-(--card-radius,var(--radius-lg)) border border-border border-dashed bg-muted/30 text-muted-foreground">
      promo-media
    </div>
  );
  // Rendered by the shell BELOW the authored copy block.
  const contentExtra = props.rendering ? (
    <Placeholder
      name={promoSlotName("promo-content", props)}
      rendering={props.rendering as never}
    />
  ) : (
    <div className="flex min-h-[180px] w-full items-center justify-center rounded-md border border-border border-dashed bg-muted/30 text-muted-foreground">
      promo-content
    </div>
  );
  return (
    <PromoShell
      {...commonShellProps(props, style, imagePosition)}
      mediaSlot={mediaSlot}
      contentExtra={contentExtra}
      variantName="Placeholders"
    />
  );
}

/**
 * `universal` opts this file into BOTH the server and client
 * component maps the SDK generates (component-map.ts +
 * component-map.client.ts). Server-only by default would land
 * here in the server map alone, which means Sitecore Pages chrome
 * (browser-side) cannot look the component up and its named-export
 * variants fail to resolve. No runtime behaviour change: the file
 * stays a plain RSC server component (no useState, no client-only
 * hooks here); the universal marker is purely a generate-map signal.
 */
export const componentType = "universal";
