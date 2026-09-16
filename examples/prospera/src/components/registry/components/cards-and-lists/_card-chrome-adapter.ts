/**
 * Curated-mode chrome pass-through for the cards-and-lists grids and
 * carousels.
 *
 * In composed mode each leaf card reads its own chrome params
 * (`_card-chrome-params.ts` on the card recipe). In curated mode the
 * cards are rendered by the grid/carousel from a Treelist, so the
 * grid-level chrome params must flow through the adapter onto every
 * leaf card. This module owns that mapping so each family adapter
 * composes helpers instead of re-parsing a dozen enums.
 *
 * Two tiers, because families differ in what their cards can render:
 *
 *   `adaptCardChromeParams`  the universal core (Elevation / Padding /
 *                            Style / CardColorScheme / ColorBand /
 *                            MediaBleed) — every family implements it.
 *   `adaptCard<Axis>`        one opt-in helper per remaining axis. A
 *                            family adapter spreads only the axes its
 *                            leaf card actually renders.
 *
 * Keeping the opt-ins separate is what makes the recipe-drift gate
 * useful here: it pairs `param-unread` (recipe declares, adapter
 * ignores) with `param-phantom` (adapter reads, recipe never declares),
 * so an axis added on one side without the other fails the build. When
 * this module exposed one do-everything helper, every family looked
 * like it read every axis and both rules went blind — which is how 52
 * dead author knobs accumulated across the sixteen renderings.
 *
 * `Style` maps to the flat prop `cardStyle` (the leaf cards call the
 * prop `style`, which the grid renames on the way down to avoid
 * colliding with the React DOM `style` attribute at the grid level).
 */

import type {
  ItemCardColorBand,
  ItemCardMediaBleed,
  ItemCardProps,
  ItemCardTitleLinkIcon,
} from "@/components/registry/blocks/item-card";
import { type CardCtaPlacement, CTA_PLACEMENTS } from "./_cta-placement";
import { parseCtaIconTrailing } from "./_cta-shape";
import {
  type CardMediaAspect,
  type MediaShape,
  parseOptionalMediaShape,
  tileAspectToCardMediaAspect,
} from "./_media-aspect";

type ItemCardElevation = NonNullable<ItemCardProps["elevation"]>;
type ItemCardPadding = NonNullable<ItemCardProps["padding"]>;
type ItemCardStyle = NonNullable<ItemCardProps["style"]>;
type ItemCardColorScheme = NonNullable<ItemCardProps["colorScheme"]>;

/**
 * Raw grid-level chrome params as Sitecore delivers them.
 *
 * Only the axes every cards-and-lists family implements. The opt-in
 * axes live in `CuratedCardChromeExtraParams` so a family adapter that
 * doesn't implement one never reads it — the recipe-drift gate's
 * `param-phantom` rule fails the build when an adapter reads a param
 * its recipe doesn't declare, which is what keeps the two in step.
 */
export interface CuratedCardChromeParams {
  Elevation?: string;
  Padding?: string;
  Style?: string;
  CardColorScheme?: string;
  ColorBand?: string;
  MediaBleed?: string;
}

/**
 * Opt-in chrome params. A family adapter picks the ones its leaf card
 * renders and passes them through the matching `adapt*` helper below;
 * its recipe opts into the same axes from
 * `@/lib/registry/card-list-shared-params`.
 */
export interface CuratedCardChromeExtraParams {
  /** `title-link-icon@1` — trailing chevron / arrow beside the title. */
  TitleLinkIcon?: string;
  /** `media-shape@1` — circle / rounded framing of the media box. */
  MediaShape?: string;
  MediaAspect?: string;
  /**
   * `tile-aspect@1` — measured-signature vocabulary (auto / square /
   * landscape / portrait). Maps onto the same `mediaAspect` channel as
   * `MediaAspect`; an explicit MediaAspect wins when both are set.
   */
  TileAspect?: string;
  /** `cta-placement@1` — inline (in the copy flow) vs footer (actions row). */
  CtaPlacement?: string;
  /** Append a trailing arrow adornment to button-style CTAs. */
  CtaIconTrailing?: string;
}

/**
 * Flat chrome props a grid/carousel forwards to its leaf cards in
 * curated mode. All optional — `undefined` keeps the leaf card's own
 * per-variant default so Sitecore Standard Values stay authoritative.
 */
export interface CuratedCardChromeProps {
  elevation?: ItemCardElevation;
  padding?: ItemCardPadding;
  cardStyle?: ItemCardStyle;
  cardColorScheme?: ItemCardColorScheme;
  colorBand?: ItemCardColorBand;
  titleLinkIcon?: ItemCardTitleLinkIcon;
  mediaBleed?: ItemCardMediaBleed;
  mediaShape?: MediaShape;
  mediaAspect?: CardMediaAspect;
  ctaPlacement?: CardCtaPlacement;
  ctaIconTrailing?: boolean;
}

const ELEVATIONS: readonly ItemCardElevation[] = [
  "theme",
  "none",
  "xs",
  "sm",
  "md",
  "lg",
];
const PADDINGS: readonly ItemCardPadding[] = ["sm", "md", "lg"];
const STYLES: readonly ItemCardStyle[] = [
  "flat",
  "outline",
  "filled",
  "elevated",
  "bare",
];
const COLOR_SCHEMES: readonly ItemCardColorScheme[] = [
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
];
const COLOR_BANDS: readonly ItemCardColorBand[] = [
  "none",
  "neutral",
  "primary",
  "secondary",
  "tertiary",
  "accent",
  "accent-2",
  "accent-3",
  "info",
  "success",
  "warning",
  "destructive",
];
const TITLE_LINK_ICONS: readonly ItemCardTitleLinkIcon[] = [
  "none",
  "chevron",
  "arrow",
];
const MEDIA_BLEEDS: readonly ItemCardMediaBleed[] = [
  "none",
  "fullbleed",
  "icon",
];
const MEDIA_ASPECTS: readonly CardMediaAspect[] = ["16x9", "4x5", "3x4", "1x1"];

/**
 * Parse-or-undefined: empty / unknown values collapse to `undefined`
 * so the leaf card's own default (and Sitecore Standard Values on the
 * card itself) keeps driving when the grid author hasn't picked.
 */
const oneOfOrUndefined = <T extends string>(
  value: string | undefined,
  allowed: readonly T[],
): T | undefined => {
  const normalized = value?.trim().toLowerCase() as T | undefined;
  return normalized && allowed.includes(normalized) ? normalized : undefined;
};

/**
 * Map the universal grid-level chrome params to flat leaf-card props.
 *
 * Family adapters spread the result and add the opt-in axes they
 * implement, e.g.
 *
 *   ...adaptCardChromeParams(params),
 *   ...adaptCardTitleLinkIcon(params),
 */
export function adaptCardChromeParams(
  params: CuratedCardChromeParams | undefined,
): CuratedCardChromeProps {
  return {
    elevation: oneOfOrUndefined(params?.Elevation, ELEVATIONS),
    padding: oneOfOrUndefined(params?.Padding, PADDINGS),
    cardStyle: oneOfOrUndefined(params?.Style, STYLES),
    cardColorScheme: oneOfOrUndefined(params?.CardColorScheme, COLOR_SCHEMES),
    colorBand: oneOfOrUndefined(params?.ColorBand, COLOR_BANDS),
    mediaBleed: oneOfOrUndefined(params?.MediaBleed, MEDIA_BLEEDS),
  };
}

/** Opt-in: `title-link-icon@1`. */
export function adaptCardTitleLinkIcon(
  params: Pick<CuratedCardChromeExtraParams, "TitleLinkIcon"> | undefined,
): Pick<CuratedCardChromeProps, "titleLinkIcon"> {
  return {
    titleLinkIcon: oneOfOrUndefined(params?.TitleLinkIcon, TITLE_LINK_ICONS),
  };
}

/** Opt-in: `media-shape@1`. */
export function adaptCardMediaShape(
  params: Pick<CuratedCardChromeExtraParams, "MediaShape"> | undefined,
): Pick<CuratedCardChromeProps, "mediaShape"> {
  return { mediaShape: parseOptionalMediaShape(params?.MediaShape) };
}

/**
 * Opt-in: `media-aspect@1` + `tile-aspect@1`.
 *
 * Explicit MediaAspect (design vocabulary) wins over TileAspect (the
 * measured-signature bucket) when both are set; either way the result
 * rides the single `mediaAspect` channel to the leaf.
 */
export function adaptCardMediaAspect(
  params:
    | Pick<CuratedCardChromeExtraParams, "MediaAspect" | "TileAspect">
    | undefined,
): Pick<CuratedCardChromeProps, "mediaAspect"> {
  return {
    mediaAspect:
      oneOfOrUndefined(params?.MediaAspect, MEDIA_ASPECTS) ??
      tileAspectToCardMediaAspect(params?.TileAspect),
  };
}

/** Opt-in: `cta-placement@1`. */
export function adaptCardCtaPlacement(
  params: Pick<CuratedCardChromeExtraParams, "CtaPlacement"> | undefined,
): Pick<CuratedCardChromeProps, "ctaPlacement"> {
  return {
    ctaPlacement: oneOfOrUndefined(params?.CtaPlacement, CTA_PLACEMENTS),
  };
}

/** Opt-in: trailing-arrow adornment on button-style CTAs. */
export function adaptCardCtaIconTrailing(
  params: Pick<CuratedCardChromeExtraParams, "CtaIconTrailing"> | undefined,
): Pick<CuratedCardChromeProps, "ctaIconTrailing"> {
  return { ctaIconTrailing: parseCtaIconTrailing(params?.CtaIconTrailing) };
}

/**
 * Rename the grid-level `cardStyle` chrome prop back to the leaf
 * card's `style` prop at the leaf boundary.
 *
 * Undefined-valued keys are DROPPED (not passed as explicit
 * `undefined`): grids spread this object after each variant's explicit
 * axis defaults (`style="outline" {...leafChromeProps(chrome)}`), and a
 * present-but-undefined key would clobber that default back to the leaf.
 * Dropping the key keeps "author param wins when set, variant default
 * wins when unset".
 */
export function leafChromeProps(chrome: CuratedCardChromeProps | undefined) {
  const { cardStyle, ...rest } = chrome ?? {};
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(rest)) {
    if (value !== undefined) out[key] = value;
  }
  if (cardStyle !== undefined) out.style = cardStyle;
  return out as Omit<CuratedCardChromeProps, "cardStyle"> & {
    style?: CuratedCardChromeProps["cardStyle"];
  };
}
