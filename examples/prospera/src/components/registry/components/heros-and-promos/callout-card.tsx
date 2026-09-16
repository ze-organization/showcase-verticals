"use client";

/**
 * Callout Card banner — title, description, CTA in a contained callout panel.
 */
import { registerCdpRecipe } from "@/lib/registry/analytics/cdp-events";
import calloutCardRecipe from "@/recipes/callout-card.recipe";

registerCdpRecipe(calloutCardRecipe);

import { useId } from "react";
import { CtaGroup } from "@/components/registry/blocks/cta-group";
import {
  type HeadingSize,
  parseHeadingSize,
} from "@/components/registry/blocks/section-heading.parsers";
import { TextOrRichText } from "@/components/registry/blocks/text-or-rich-text";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/registry/primitives/core/card";
import {
  type ImageSource,
  NextImage,
} from "@/components/registry/primitives/editables/image";
import type { LinkSource } from "@/components/registry/primitives/editables/link";
import type { RichTextSource } from "@/components/registry/primitives/editables/richtext";
import { isEmptySource } from "@/components/registry/primitives/editables/source-normalizers";
import {
  Text,
  type TextSource,
} from "@/components/registry/primitives/editables/text";
import { useSectionAnalytics } from "@/lib/registry/analytics/use-section-analytics";
import { cn } from "@/lib/registry/cn";
import {
  isEnabled,
  parseButtonSize,
  parseButtonVariant,
} from "@/lib/registry/param-parsers";
import { SectionBackground } from "@/lib/registry/section-background";
import { resolveSectionSurfaceClass } from "@/lib/registry/section-surface";
import type { CmsProps } from "@/lib/registry/sitecore";

/** Meta for CalloutCard analytics events. */
export interface CalloutCardAnalyticsMeta {
  id?: string;
  instanceKey?: string;
  instanceScope?: "site" | "page";
  variant?: string;
  label?: string;
  href?: string;
}

type CalloutColorScheme =
  | "none"
  | "white"
  | "black"
  | "neutral"
  | "primary"
  | "primary-gradient"
  | "secondary"
  | "secondary-gradient"
  | "tertiary"
  | "accent"
  | "accent-2"
  | "accent-3"
  | "info"
  | "success"
  | "warning"
  | "destructive";

type CalloutHeaderStyle = "start" | "centered" | "centered-accent";

type CalloutButtonAlignment = "start" | "center" | "end";

/** Card surface treatment — mirrors the Card primitive's `style` axis
 * (`card-style@1`, same enum the regular UI Card uses). */
type CalloutCardStyle = "filled" | "flat" | "outline";

/** How saturated the `filled` surface is (`background-intensity@1`) —
 * `subtle` = soft `-background` tint, `bold` = solid role fill with
 * inverted text. No-op on `flat` / `outline` (no fill to intensify). */
type CalloutBackgroundIntensity = "subtle" | "bold";

/** Shadow depth (`card-elevation@1`). */
type CalloutElevation = "theme" | "none" | "xs" | "sm" | "md" | "lg";

/**
 * Flat props delivered by `withSitecore`'s default convention.
 *   - `fields.Title`       → `title`
 *   - `fields.Description` → `description`
 *   - `fields.Image`       → `image`
 *   - `fields.Link`        → `link`
 *   - `params.OverlayOpacity` → `overlayOpacity`
 *   - `params.InstanceKey` / `InstanceScope` / `TrackEvents` → camelCased
 *   - `params.RenderingIdentifier` → `id` (from CmsProps)
 *   - `params.styles`              → `styles` (from CmsProps)
 */
export interface CalloutCardProps extends CmsProps {
  title?: TextSource;
  description?: RichTextSource | TextSource;
  image?: ImageSource;
  link?: LinkSource;
  /** 0–100 opacity for the optional background-image dim overlay. */
  overlayOpacity?: string | number;
  /** Brand tone applied to band, button, and (when no image) card surface. */
  colorScheme?: string;
  /** Card surface style: filled (default), flat, or outline. */
  cardStyle?: string;
  /** Fill saturation for the filled style: subtle tint or bold solid. */
  backgroundIntensity?: string;
  /** Shadow depth. `theme` defers to the theme's `--card-shadow` token. */
  elevation?: string;
  /** Typographic scale for the title (heading-size@1 vocabulary). */
  headingSize?: string;
  /** Render the slim accent band along the top edge of the card. */
  showBand?: string | boolean;
  /** Title treatment: start-aligned, centered, or centered with accent bar. */
  headerStyle?: string;
  /** Visual style of the primary CTA. */
  buttonVariant?: string;
  /** Size token for the primary CTA. */
  buttonSize?: string;
  /** Append a trailing arrow (→) after the primary CTA label. */
  showArrow?: string | boolean;
  /** Inline-axis alignment of the CTA within the card. */
  buttonAlignment?: string;
  instanceKey?: string;
  instanceScope?: "site" | "page";
  /** Sitecore string-boolean for the analytics gate. */
  trackEvents?: string | boolean;
}

const COLOR_SCHEME_VALUES: ReadonlySet<CalloutColorScheme> = new Set([
  "none",
  "white",
  "black",
  "neutral",
  "primary",
  "primary-gradient",
  "secondary",
  "secondary-gradient",
  "tertiary",
  "accent",
  "accent-2",
  "accent-3",
  "info",
  "success",
  "warning",
  "destructive",
]);

const parseColorScheme = (value: string | undefined): CalloutColorScheme => {
  if (!value) return "primary";
  const normalized = value.trim().toLowerCase();
  return COLOR_SCHEME_VALUES.has(normalized as CalloutColorScheme)
    ? (normalized as CalloutColorScheme)
    : "primary";
};

const HEADER_STYLE_VALUES: ReadonlySet<CalloutHeaderStyle> = new Set([
  "start",
  "centered",
  "centered-accent",
]);

const parseHeaderStyle = (value: string | undefined): CalloutHeaderStyle => {
  const normalized = value?.trim().toLowerCase();
  return normalized && HEADER_STYLE_VALUES.has(normalized as CalloutHeaderStyle)
    ? (normalized as CalloutHeaderStyle)
    : "start";
};

const BUTTON_ALIGNMENT_VALUES: ReadonlySet<CalloutButtonAlignment> = new Set([
  "start",
  "center",
  "end",
]);

const parseButtonAlignment = (
  value: string | undefined,
): CalloutButtonAlignment => {
  const normalized = value?.trim().toLowerCase();
  if (
    !normalized ||
    !BUTTON_ALIGNMENT_VALUES.has(normalized as CalloutButtonAlignment)
  ) {
    return "start";
  }
  return normalized as CalloutButtonAlignment;
};

// `parseButtonVariant` / `parseButtonSize` now come from the shared
// `@/lib/registry/param-parsers` module — see imports above.

const CARD_STYLE_VALUES: ReadonlySet<CalloutCardStyle> = new Set([
  "filled",
  "flat",
  "outline",
]);

// `filled` is the concrete default: the callout historically always
// painted the scheme's soft `-background` tint, which is exactly the
// Card primitive's `filled` treatment.
const parseCardStyle = (value: string | undefined): CalloutCardStyle => {
  const normalized = value?.trim().toLowerCase();
  return normalized && CARD_STYLE_VALUES.has(normalized as CalloutCardStyle)
    ? (normalized as CalloutCardStyle)
    : "filled";
};

const parseBackgroundIntensity = (
  value: string | undefined,
): CalloutBackgroundIntensity =>
  value?.trim().toLowerCase() === "bold" ? "bold" : "subtle";

const ELEVATION_VALUES: ReadonlySet<CalloutElevation> = new Set([
  "theme",
  "none",
  "xs",
  "sm",
  "md",
  "lg",
]);

const parseElevation = (value: string | undefined): CalloutElevation => {
  const normalized = value?.trim().toLowerCase();
  return normalized && ELEVATION_VALUES.has(normalized as CalloutElevation)
    ? (normalized as CalloutElevation)
    : "theme";
};

// Card surface color now rides on the Card primitive's own
// `style` × `colorScheme` compound classes (filled = soft tint +
// `surface-tinted` remap, flat = title tint, outline = scheme border)
// so the callout reads exactly like the regular UI Card. Only two
// callout-specific maps remain:
//
// 1. `filled` + `bold` — the primitive has no intensity axis, so the
//    solid fill reuses the section-surface bold vocabulary
//    (`bg-<X> text-<X>-foreground` + `surface-invert`), the same
//    mapping section-wrapper's BackgroundIntensity uses.
//    See `resolveSectionSurfaceClass(scheme, "bold")` at the call site.
//
// 2. `outline` — the primitive tints only the border for outline
//    cards; the callout (per design-owner direction) also tints the
//    title, mirroring the primitive's `flat` title-tint compounds
//    verbatim. Schemes absent here (none / white / black / neutral)
//    keep the untinted title, matching the primitive's flat behavior.
const OUTLINE_TITLE_TINT_BY_SCHEME: Partial<
  Record<CalloutColorScheme, string>
> = {
  primary: "[&_[data-slot=card-title]]:text-primary",
  "primary-gradient": "[&_[data-slot=card-title]]:text-primary",
  secondary: "[&_[data-slot=card-title]]:text-secondary",
  "secondary-gradient": "[&_[data-slot=card-title]]:text-secondary",
  tertiary: "[&_[data-slot=card-title]]:text-tertiary",
  accent: "[&_[data-slot=card-title]]:text-accent",
  "accent-2": "[&_[data-slot=card-title]]:text-accent-2",
  "accent-3": "[&_[data-slot=card-title]]:text-accent-3",
  info: "[&_[data-slot=card-title]]:text-info",
  success: "[&_[data-slot=card-title]]:text-success",
  warning: "[&_[data-slot=card-title]]:text-warning",
  destructive: "[&_[data-slot=card-title]]:text-destructive",
};

/**
 * Resolve the Card primitive's `colorScheme` prop plus the callout's
 * extra surface classes for the style × scheme × intensity × image
 * matrix. The primitive's own style/colorScheme compounds carry the
 * subtle treatments; this helper layers the two cases the primitive
 * doesn't know about:
 *
 *   - bold filled  → section-surface solid fill (`bg-<X>` +
 *     `text-<X>-foreground` + `surface-invert`). The scheme is
 *     suppressed to `neutral` on the primitive so the filled
 *     compound's `surface-tinted` remap can't stack under the
 *     `surface-invert` remap.
 *   - background image → frosted glass over the photo, which also
 *     suppresses a filled scheme (tinted text would fight the image
 *     treatment). Outline keeps its scheme border over the glass.
 */
function resolveCardSurface(
  scheme: CalloutColorScheme,
  cardStyle: CalloutCardStyle,
  intensity: CalloutBackgroundIntensity,
  hasBackgroundImage: boolean,
): { colorScheme: CalloutColorScheme; surfaceClass: string } {
  // Bold solid fill only exists on the `filled` style. Schemes with no
  // bold form (`none`) come back empty and fall through to the
  // primitive's subtle filled compound — the enum-documented no-op.
  const boldSurfaceClass =
    cardStyle === "filled" && intensity === "bold"
      ? resolveSectionSurfaceClass(scheme, "bold")
      : "";
  const isBoldFill = boldSurfaceClass !== "";
  const suppressScheme =
    isBoldFill || (hasBackgroundImage && cardStyle === "filled");
  return {
    colorScheme: suppressScheme ? "neutral" : scheme,
    surfaceClass: cn(
      // Image always overrides the scheme fill — frosted glass so copy
      // stays readable over the photo.
      hasBackgroundImage && "bg-background/90 backdrop-blur-md",
      !hasBackgroundImage && isBoldFill && boldSurfaceClass,
      // Outline cards tint the title alongside the border — mirrors
      // the primitive's flat title-tint compounds.
      cardStyle === "outline" && OUTLINE_TITLE_TINT_BY_SCHEME[scheme],
    ),
  };
}

// Background overlay opacity — coerce the param string to a clamped
// 0–1 alpha value. Defaults to 0.35.
const parseOverlayOpacity = (value: string | number | undefined): number => {
  if (value === undefined || value === "") return 0.35;
  const raw = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(raw)) return 0.35;
  const pct = raw > 1 ? raw / 100 : raw;
  return Math.min(1, Math.max(0, pct));
};

// Title scale per `heading-size@1`. `large` is the recipe default and
// carries the callout's historical classes byte-for-byte (the callout
// headline has always sat a step above the house section-heading
// default); the other entries reuse the house scale from
// section-heading.helpers' `headingSizeClassFor` (weight travels with
// the size — `xl` deliberately declares none so the theme's
// `--heading-weight` token stays in charge; `tracking-tight` lives on
// the base h2 classes).
const HEADING_SIZE_CLASSES: Record<HeadingSize, string> = {
  small: "font-semibold text-lg md:text-xl",
  default: "font-semibold text-2xl md:text-3xl",
  large:
    "font-semibold text-2xl leading-tight md:text-3xl md:leading-[1.15] lg:text-4xl",
  xl: "text-4xl md:text-5xl",
  "text-banner": "font-normal text-4xl md:text-5xl lg:text-6xl",
};

// Solid band fill — uses the role's saturated token. Gradients reuse
// the soft-surface gradient since a 1.5px stripe is too thin to show
// a multi-stop gradient meaningfully.
const BAND_BG_BY_SCHEME: Record<CalloutColorScheme, string> = {
  none: "bg-border",
  white: "bg-theme-white",
  black: "bg-theme-black",
  neutral: "bg-neutral",
  primary: "bg-primary",
  "primary-gradient":
    "ltr:bg-gradient-to-r rtl:bg-gradient-to-l from-primary to-secondary",
  secondary: "bg-secondary",
  "secondary-gradient":
    "ltr:bg-gradient-to-r rtl:bg-gradient-to-l from-secondary to-accent",
  tertiary: "bg-tertiary",
  accent: "bg-accent",
  "accent-2": "bg-accent-2",
  "accent-3": "bg-accent-3",
  info: "bg-info",
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
};

/** CalloutCard: title, description, CTA in a contained callout panel. */
export function Default({
  title,
  description: descriptionRaw,
  image,
  link: linkRaw,
  overlayOpacity: overlayOpacityRaw,
  colorScheme: colorSchemeRaw,
  cardStyle: cardStyleRaw,
  backgroundIntensity: backgroundIntensityRaw,
  elevation: elevationRaw,
  headingSize: headingSizeRaw,
  showBand: showBandRaw,
  headerStyle: headerStyleRaw,
  buttonVariant: buttonVariantRaw,
  buttonSize: buttonSizeRaw,
  showArrow: showArrowRaw,
  buttonAlignment: buttonAlignmentRaw,
  instanceKey,
  instanceScope = "site",
  trackEvents,
  styles,
  id,
  isEditing,
}: CalloutCardProps) {
  // Background image — present only when the field carries an actual
  // image. `hasBackgroundImage` gates the surface treatment (frosted-
  // glass card vs scheme-tinted card). Image always overrides the
  // ColorScheme-driven fill.
  const backgroundImage =
    image != null && !isEmptySource(image) ? image : undefined;
  const hasBackgroundImage = Boolean(backgroundImage);
  const overlayOpacity = parseOverlayOpacity(overlayOpacityRaw);
  const link = linkRaw != null && !isEmptySource(linkRaw) ? linkRaw : undefined;
  const description =
    descriptionRaw != null && !isEmptySource(descriptionRaw)
      ? descriptionRaw
      : undefined;

  const scheme = parseColorScheme(colorSchemeRaw);
  const cardStyle = parseCardStyle(cardStyleRaw);
  const backgroundIntensity = parseBackgroundIntensity(backgroundIntensityRaw);
  const elevation = parseElevation(elevationRaw);
  const headingSize = parseHeadingSize(headingSizeRaw, "large");
  const showBand = isEnabled(showBandRaw);
  const headerStyle = parseHeaderStyle(headerStyleRaw);
  const { colorScheme: cardColorScheme, surfaceClass } = resolveCardSurface(
    scheme,
    cardStyle,
    backgroundIntensity,
    hasBackgroundImage,
  );
  const buttonVariant = parseButtonVariant(buttonVariantRaw);
  const buttonSize = parseButtonSize(buttonSizeRaw);
  const showArrow = isEnabled(showArrowRaw);
  const buttonAlignment = parseButtonAlignment(buttonAlignmentRaw);

  const isCenteredHeader =
    headerStyle === "centered" || headerStyle === "centered-accent";

  const { rootRef, onClickDelegate } =
    useSectionAnalytics<CalloutCardAnalyticsMeta>({
      family: "callout-card",
      variant: "Default",
      id,
      instanceKey,
      instanceScope,
      titleSource: title,
      eventsEnabled: isEnabled(trackEvents),
      isEditing,
      // CTA clicks deferred until the anchor data-cdp-* tagging pass.
      ctas: [],
    });

  const titleId = useId();

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: event delegation on wrapper — anchors inside handle keyboard activation themselves.
    <section
      ref={rootRef}
      onClick={onClickDelegate}
      className={cn(
        "component banner banner-callout-card relative w-full overflow-hidden py-10",
        "md:py-16",
        hasBackgroundImage ? "bg-transparent" : "bg-muted/30",
        styles?.trimEnd(),
      )}
      id={id ?? undefined}
      dir="inherit"
      data-slot="banner"
      data-color-scheme={scheme}
      aria-labelledby={titleId}
    >
      <SectionBackground
        image={backgroundImage}
        scrim="dark"
        scrimOpacity={overlayOpacity}
      />
      {/*
        Hidden-but-isEditing-aware NextImage so Pages chrome wraps the
        Image field markers (SectionBackground paints the same field as a
        CSS background and is invisible to the chrome). Visually opaque-0
        + pointer-events-none so the CSS-bg version remains the visible
        layer; the chrome overlay still mounts on field-empty/edit.
      */}
      <NextImage
        value={image}
        fill
        sizes="100vw"
        className="pointer-events-none absolute inset-0 z-0 object-cover opacity-0"
        isEditing={isEditing}
        placeholder="Callout background"
      />
      <div className="container relative z-10 mx-auto px-4">
        <Card
          padding="sm"
          style={cardStyle}
          colorScheme={cardColorScheme}
          elevation={elevation}
          className={cn(
            "mx-auto w-full max-w-5xl overflow-hidden rounded-(--card-radius,var(--radius-2xl)) p-0",
            surfaceClass,
          )}
        >
          {showBand && (
            <div
              className={cn("h-1.5 w-full", BAND_BG_BY_SCHEME[scheme])}
              aria-hidden
            />
          )}
          <CardHeader
            className={cn(
              "border-0 px-6 pt-6 pb-2 md:px-10 md:pt-8",
              isCenteredHeader && "items-center text-center",
            )}
          >
            {headerStyle === "centered-accent" && (
              <div
                className={cn(
                  "mb-3 h-1 w-12 rounded-full",
                  isCenteredHeader && "mx-auto",
                  BAND_BG_BY_SCHEME[scheme],
                )}
                aria-hidden
              />
            )}
            <h2
              id={titleId}
              data-slot="card-title"
              className={cn(
                "wrap-break-word max-w-[28ch] text-balance font-heading tracking-tight",
                HEADING_SIZE_CLASSES[headingSize],
                isCenteredHeader && "mx-auto",
              )}
            >
              <Text
                value={title}
                tag="span"
                isEditing={isEditing}
                placeholder="Title"
              />
            </h2>
          </CardHeader>
          <CardContent
            className={cn(
              "px-6 pb-6 md:px-10 md:pb-8",
              isCenteredHeader && "text-center",
            )}
          >
            {description && (
              <div
                className={cn(
                  "wrap-break-word max-w-[70ch] text-pretty [&_p]:mb-2 [&_p]:leading-relaxed",
                  isCenteredHeader && "mx-auto",
                )}
              >
                <TextOrRichText value={description} />
              </div>
            )}
            <CtaGroup
              primary={link}
              className="mt-6"
              justify={buttonAlignment}
              primaryVariant={buttonVariant}
              primarySize={buttonSize}
              primaryColorScheme={scheme}
              primaryShowArrow={showArrow}
            />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

/**
 * `universal` opts this file into BOTH the server and client
 * component maps the SDK generates (component-map.ts +
 * component-map.client.ts).
 */
export const componentType = "universal";

export default Default;
