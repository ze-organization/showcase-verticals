import type { ReactNode } from "react";
import type { ImageSource } from "@/components/registry/primitives/editables/image";
import type { LinkSource } from "@/components/registry/primitives/editables/link";
import type { RichTextSource } from "@/components/registry/primitives/editables/richtext";
import type { TextSource } from "@/components/registry/primitives/editables/text";
import type { SurfaceTone } from "@/lib/registry/color-scheme-classes";
import type {
  ButtonSizeValue,
  ButtonVariantValue,
} from "@/lib/registry/param-parsers";
import type { ComponentProps } from "@/lib/registry/sitecore-types";

/**
 * Macro layout for the Hero frame region. Each value maps to a
 * separate Sitecore rendering variant (FullBleed / Split / Stacked /
 * Centered) — the variant is the structural axis, not a param. The
 * type stays around because `HeroImpl` and `HeroFrame` need an
 * internal way to discriminate which shell to render, but it is no
 * longer surfaced as an author-facing param.
 */
export type HeroFrameLayout = "centered" | "split" | "stacked" | "full-bleed";

/**
 * Heading SCALE preset (distinct from frame layout, and NOT a
 * line-height axis despite the name): `display` = oversized title
 * ramp + kicker eyebrow; `compact` = smaller ramp + discreet eyebrow.
 * An explicit `TitleSize` overrides the title part of the preset.
 */
export type HeroHeadingLayout = "display" | "compact";

/**
 * Title scale for the hero heading (`size@1`). `default` keeps the
 * layout-driven scale (display vs compact); explicit values pin the
 * responsive text ramp.
 */
export type HeroTitleSize = "default" | "xs" | "sm" | "md" | "lg" | "xl";

/**
 * Title weight for the hero heading (`title-weight@1`). `default`
 * reads through the `--heading-weight` theme token (fallback 300 — the
 * hero's historical light display face) so a theme can re-weight
 * headings globally without params.
 */
export type HeroTitleWeight =
  | "default"
  | "light"
  | "regular"
  | "semibold"
  | "bold"
  | "heavy";

/**
 * How the hero media sits in the band (`promo-inset@1` — the shared
 * band-inset enum): `fullBleed` (default, edge-to-edge), `contained`
 * (page background frames the media with the content container
 * around it), or `card` (contained + the theme's card radius on the
 * media — the Greene-King-style inset photo).
 */
export type HeroMediaInset = "fullBleed" | "contained" | "card";

/**
 * Visual style of the overlay surface — composes with
 * `HeroOverlayColorScheme` + `HeroOverlayOptions.opacity`.
 */
export type HeroOverlayStyle = "none" | "solid" | "gradient" | "blur";

/**
 * Shape / extent of the overlay panel within the hero band.
 * `lower-third` anchors a full-width flush text band to the bottom of
 * the hero (the editorial full-bleed-image + lower-third-copy shape).
 */
export type HeroOverlayShape = "card" | "full-height" | "lower-third";

/**
 * Desktop width fraction for the overlay panel.
 */
export type HeroOverlayWidth =
  | "quarter"
  | "third"
  | "half"
  | "two-thirds"
  | "three-quarters"
  | "full";

/**
 * Inline-axis placement of the overlay panel. `*-padded` variants
 * offset by `HeroOverlayOptions.padding` from the matching edge.
 */
export type HeroOverlayPosition =
  | "start"
  | "start-padded"
  | "center"
  | "end-padded"
  | "end";

/**
 * Block-axis placement of the overlay panel on mobile widths.
 * Composes with `HeroOverlayPosition` (desktop inline axis).
 */
export type HeroOverlayMobilePosition = "top" | "bottom";

/**
 * Inline-axis gutter that offsets a `start` / `end` overlay from the edge.
 * Mirrors `size@1`; `default` = flush (no offset).
 */
export type HeroOverlayPadding = "default" | "xs" | "sm" | "md" | "lg" | "xl";

/**
 * Color scheme tokens accepted by the overlay surface — mirrors the
 * shared `color-scheme@1` set so authors get the same dropdown that
 * paints every other component.
 */
export type HeroOverlayColorScheme =
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

/**
 * Canonical Hero media fields.
 */
export interface HeroMediaFields {
  image?: ImageSource;
  videoUrl?: TextSource;
  videoLabel?: TextSource;
  videoCaptionUrl?: TextSource;
}

export interface HeroFields {
  eyebrow?: TextSource;
  title?: TextSource;
  subtitle?: RichTextSource;
  description?: RichTextSource | TextSource;
  primaryAction?: LinkSource;
  secondaryAction?: LinkSource;
  media?: HeroMediaFields;
}

/**
 * Overlay options. Each axis is independent so brand variants can
 * tweak one without re-deriving the rest.
 */
export interface HeroOverlayOptions {
  enabled?: boolean;
  style?: HeroOverlayStyle;
  colorScheme?: HeroOverlayColorScheme;
  shape?: HeroOverlayShape;
  width?: HeroOverlayWidth;
  position?: HeroOverlayPosition;
  mobilePosition?: HeroOverlayMobilePosition;
  padding?: HeroOverlayPadding;
  /** Overlay alpha, 0-100. Applied to the fill layer only — text stays at 100%. */
  opacity?: number;
  /**
   * Shift the overlay card outward to straddle the media edge it is
   * anchored to (`OverlayBreach`). Card shape only — band shapes
   * (full-height / lower-third) no-op rather than rendering a broken
   * half-scrim. The breach edge derives from `position` / `width`:
   * start/end breach that inline edge; center (and full-width cards)
   * breach the bottom edge. Disabled while editing so the overlay
   * stays fully addressable in Pages.
   */
  breach?: boolean;
}

/**
 * Heading composition axes. Inline-axis alignment for the heading
 * column, plus an optional brand-toned eyebrow.
 */
export interface HeroHeadingOptions {
  layout?: HeroHeadingLayout;
  align?: "start" | "center" | "end";
  /** Title scale (`size@1`). `default` = layout-driven ramp. */
  titleSize?: HeroTitleSize;
  /** Title weight (`title-weight@1`). `default` = `--heading-weight` token, fallback 300. */
  titleWeight?: HeroTitleWeight;
  eyebrowColorScheme?: HeroColorScheme;
  /** Primary CTA visual treatment (shared `button-variant@1`). */
  primaryActionVariant?: ButtonVariantValue;
  /** Primary CTA color scheme (shared `color-scheme@1`). */
  primaryActionColorScheme?: SurfaceTone;
  /** Primary CTA label color (shared `heading-color@1`). */
  primaryActionFontColor?: string;
  /** Append a trailing arrow (→) after the primary CTA label. */
  primaryActionShowArrow?: boolean;
  /** Secondary CTA visual treatment. Defaults to `outline`. */
  secondaryActionVariant?: ButtonVariantValue;
  /** Secondary CTA color scheme (shared `color-scheme@1`). */
  secondaryActionColorScheme?: SurfaceTone;
  /** Secondary CTA label color (shared `heading-color@1`). */
  secondaryActionFontColor?: string;
  /** Append a trailing arrow (→) after the secondary CTA label. */
  secondaryActionShowArrow?: boolean;
  /** Size applied to BOTH CTAs (shared `size@1`). */
  actionSize?: ButtonSizeValue;
}

/**
 * Semantic color scheme — a SUBSET of the shared `color-scheme@1`
 * enumeration recipe, not a match for it.
 *
 * Missing `default` and the four late gradients (`tertiary-`,
 * `accent-`, `accent-2-`, `accent-3-gradient`), which the recipe has
 * and this does not. The docstring used to claim parity, which is how
 * the hero previews' 16-value lists read as drift from the recipe when
 * they are in fact faithful to this type. The mismatch is real — an
 * author can set those five in Sitecore and Hero cannot paint them —
 * and it is a component-side gap, not a preview one.
 */
export type HeroColorScheme =
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

/**
 * Params shape for Sitecore-driven hero behavior. Every key here is
 * also declared in `hero.recipe.ts` so authors can reach it from
 * Pages.
 */
export type HeroParams = ComponentProps["params"] & {
  HeadingLayout?: HeroHeadingLayout;
  /** Title scale (shared `size@1`). */
  TitleSize?: string;
  /** Title weight (shared `title-weight@1`). */
  TitleWeight?: string;
  /** Text-block alignment (shared `text-alignment@1`, start/centered/end). */
  Layout?: "start" | "centered" | "end";
  EyebrowColorScheme?: HeroColorScheme;

  /** Primary CTA treatment (shared `button-variant@1`). */
  PrimaryActionVariant?: string;
  /** Primary CTA color scheme (shared `color-scheme@1`). */
  PrimaryActionColorScheme?: string;
  /** Primary CTA label color (shared `heading-color@1`). */
  PrimaryActionFontColor?: string;
  /** Append a trailing arrow (→) after the primary CTA label. */
  PrimaryActionShowArrow?: string;
  /** Secondary CTA treatment (shared `button-variant@1`). */
  SecondaryActionVariant?: string;
  /** Secondary CTA color scheme (shared `color-scheme@1`). */
  SecondaryActionColorScheme?: string;
  /** Secondary CTA label color (shared `heading-color@1`). */
  SecondaryActionFontColor?: string;
  /** Append a trailing arrow (→) after the secondary CTA label. */
  SecondaryActionShowArrow?: string;
  /** Size applied to BOTH CTAs (shared `size@1`). */
  ActionSize?: string;

  OverlayEnabled?: string;
  OverlayStyle?: HeroOverlayStyle;
  OverlayColorScheme?: HeroOverlayColorScheme;
  OverlayShape?: HeroOverlayShape;
  OverlayWidth?: HeroOverlayWidth;
  OverlayPosition?: HeroOverlayPosition;
  OverlayMobilePosition?: HeroOverlayMobilePosition;
  OverlayPadding?: HeroOverlayPadding;
  OverlayOpacity?: string;
  /**
   * Checkbox — shift the overlay card outward to straddle the media
   * edge (see `HeroOverlayOptions.breach`). Reads best with an inset
   * `MediaInset`.
   */
  OverlayBreach?: string;
  BackgroundColor?: HeroOverlayColorScheme;
  /**
   * Media frame inset (shared `promo-inset@1`): `fullBleed` (default) /
   * `contained` / `card`.
   */
  MediaInset?: string;
  /**
   * Solid color strip attached to the hero's bottom edge (shared
   * `color-scheme@1`). `none` (default) = no band. Renders BEHIND a
   * bottom-breaching overlay so the card straddles onto the band.
   */
  BottomBandColorScheme?: string;
  /**
   * Band fill saturation (shared `background-intensity@1`): `bold`
   * (default — pure brand color + inverted text) or `subtle` (soft
   * `-background` tint).
   */
  BottomBandIntensity?: string;

  /**
   * How the video starts (shared `video-playback@1`):
   * `click-to-play` (default — poster + play affordance, loads AND
   * plays on click) or `autoplay` (muted inline background playback).
   */
  MediaPlayback?: string;
  /** Mute click-to-play playback (autoplay is always muted). */
  MediaMuted?: string;
  MediaLoop?: string;
};

/**
 * Internal envelope shape consumed by `HeroImpl`, `HeroFrame`,
 * `HeroHeading`, and the analytics hook. Mirrors Sitecore Layout
 * Service's `{ fields, params }` payload.
 *
 * **Not the public API.** External callers (preview, experiences,
 * Sitecore's component-map) use the flat `HeroVariantProps` below;
 * the `Default` variant export bridges flat props into this envelope.
 */
export type HeroBlockProps = Omit<ComponentProps, "params"> & {
  fields: HeroFields;
  params: HeroParams;
  mediaSlot?: ReactNode;
};

/**
 * **Public API.** Flat camelCase props matching what the SDK's
 * component-map default convention produces from a Layout Service
 * payload.
 *
 * Field/param coverage mirrors `hero.recipe.ts`:
 *   - **Fields**: eyebrow, title, subtitle, description, image,
 *     videoUrl, primaryAction, secondaryAction
 *   - **Params**: layout, headingLayout, eyebrowColorScheme, overlay*,
 *     background*, media*, instance*, trackEvents
 */
export interface HeroVariantProps {
  id?: string;
  styles?: string;
  isEditing?: boolean;
  rendering?: ComponentProps["rendering"];

  // Fields
  eyebrow?: HeroFields["eyebrow"];
  title?: HeroFields["title"];
  subtitle?: HeroFields["subtitle"];
  description?: HeroFields["description"];
  image?: NonNullable<HeroFields["media"]>["image"];
  videoUrl?: NonNullable<HeroFields["media"]>["videoUrl"];
  videoLabel?: NonNullable<HeroFields["media"]>["videoLabel"];
  videoCaptionUrl?: NonNullable<HeroFields["media"]>["videoCaptionUrl"];
  primaryAction?: HeroFields["primaryAction"];
  secondaryAction?: HeroFields["secondaryAction"];

  // Params (lowercase mirror; string-booleans accepted because Sitecore
  // checkboxes serialize as "1"/"true"). Frame layout is no longer a
  // param — each variant fixes its own shell shape, so authors choose
  // layout by picking the variant in Pages.
  headingLayout?: HeroHeadingLayout;
  /** Title scale (shared `size@1`). `default` = layout-driven ramp. */
  titleSize?: string;
  /** Title weight (shared `title-weight@1`). `default` = theme token. */
  titleWeight?: string;
  /** Text-block alignment (shared with Promo). `start` / `centered` / `end`. */
  layout?: "start" | "centered" | "end";
  eyebrowColorScheme?: HeroColorScheme;
  /** Primary CTA treatment (shared `button-variant@1`). */
  primaryActionVariant?: string;
  /** Primary CTA color scheme (shared `color-scheme@1`). */
  primaryActionColorScheme?: string;
  /** Primary CTA label color (shared `heading-color@1`). */
  primaryActionFontColor?: string;
  /** Append a trailing arrow (→) after the primary CTA label. */
  primaryActionShowArrow?: string | boolean;
  /** Secondary CTA treatment (shared `button-variant@1`). Defaults `outline`. */
  secondaryActionVariant?: string;
  /** Secondary CTA color scheme (shared `color-scheme@1`). */
  secondaryActionColorScheme?: string;
  /** Secondary CTA label color (shared `heading-color@1`). */
  secondaryActionFontColor?: string;
  /** Append a trailing arrow (→) after the secondary CTA label. */
  secondaryActionShowArrow?: string | boolean;
  /** Size applied to BOTH CTAs (shared `size@1`). */
  actionSize?: string;
  overlayEnabled?: string | boolean;
  overlayStyle?: HeroOverlayStyle;
  overlayColorScheme?: HeroOverlayColorScheme;
  overlayShape?: HeroOverlayShape;
  overlayWidth?: HeroOverlayWidth;
  overlayPosition?: HeroOverlayPosition;
  overlayMobilePosition?: HeroOverlayMobilePosition;
  overlayPadding?: HeroOverlayPadding;
  overlayOpacity?: string | number;
  /** Shift the overlay card outward to straddle the media edge. */
  overlayBreach?: string | boolean;
  backgroundColor?: HeroOverlayColorScheme;
  /** Media frame inset (shared `promo-inset@1`): fullBleed / contained / card. */
  mediaInset?: string;
  /** Solid color strip attached to the hero's bottom edge (`color-scheme@1`). */
  bottomBandColorScheme?: string;
  /** Band fill saturation (`background-intensity@1`): bold (default) / subtle. */
  bottomBandIntensity?: string;
  /** How the video starts (`video-playback@1`): `click-to-play` / `autoplay`. */
  mediaPlayback?: string;
  /** Mute click-to-play playback (autoplay is always muted). */
  mediaMuted?: string | boolean;
  mediaLoop?: string | boolean;
  instanceKey?: string;
  instanceScope?: "site" | "page";
  trackEvents?: string | boolean;

  mediaSlot?: ReactNode;
}
