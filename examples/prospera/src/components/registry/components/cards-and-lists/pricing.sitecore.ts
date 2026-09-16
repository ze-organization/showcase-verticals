/**
 * Sitecore adapter for the pricing family. Unwraps Sitecore field
 * objects into the flat-prop shapes the React renderings consume.
 *
 * Three rendering targets: `PricingListGrid`, `PricingCarousel`, and
 * `PricingSearchExperience`. All three share the same datasource
 * template, so a single set of adapters fans out to all of them.
 */

import type { TextSource } from "@/components/registry/primitives/editables/text";
import { linkedItemFields } from "@/lib/registry/placeholder-children";
import type { SearchConfig } from "@/lib/registry/search/types";
import { adaptSectionSurfaceParams } from "@/lib/registry/section-surface";
import type { Field, LinkField } from "@/lib/registry/sitecore";
import {
  adaptCardChromeParams,
  adaptCardCtaIconTrailing,
  adaptCardMediaAspect,
} from "./_card-chrome-adapter";
import {
  GRID_GAP_VALUES,
  parseFeaturedFirst,
  parseGridPattern,
} from "./_grid-classname";
import type { PricingFlatItem } from "./pricing-list-grid";

/**
 * Raw shape of a pricing-card Sitecore item under `fields.Plans`.
 * Treelist items resolve to this when curated; placeholder mode
 * bypasses this entirely (children render as Sitecore placeholders).
 */
export interface SitecorePricingItem {
  id: string;
  displayName?: string;
  name?: string;
  url?: string;
  fields?: PricingItemFields;
}

/**
 * Standalone pricing-card datasource fields. Shared between curated
 * treelist items (above) and direct pricing-card@1 placements.
 */
export interface PricingItemFields {
  Name?: Field<string>;
  Price?: Field<string>;
  Currency?: Field<string>;
  /** Multi-line text — one feature per line. */
  Features?: Field<string>;
  Highlighted?: Field<boolean>;
  HighlightLabel?: Field<string>;
  PricePeriod?: Field<string>;
  CtaLabel?: Field<string>;
  CtaLink?: LinkField;
}

export interface SitecorePricingFields {
  Title?: TextSource;
  Lead?: TextSource;
  Plans?: SitecorePricingItem[];
  SearchConfig?: Field<string>;
}

export interface SitecorePricingParams {
  /** Curated-mode chrome pass-through (CARD_STYLING_PARAMS). */
  Elevation?: string;
  Padding?: string;
  Style?: string;
  CardColorScheme?: string;
  ColorBand?: string;
  MediaBleed?: string;
  MediaAspect?: string;
  TileAspect?: string;
  CtaPlacement?: string;
  CtaIconTrailing?: string;

  /** Layout. */
  HeadingLayout?: string;
  HeadingSize?: string;
  /** `band-heading-placement@1` — heading above the slides (default) or inline in the leading column. */
  HeadingPlacement?: string;
  ColumnsLg?: string;
  ColumnsMd?: string;
  ColumnsSm?: string;
  Gap?: string;
  FeaturedFirst?: string;
  GridPattern?: string;

  /** Carousel. */
  SlidesPerViewLg?: string;
  SlidesPerViewMd?: string;
  SlidesPerViewSm?: string;
  SpaceBetween?: string;
  Autoplay?: string;
  AutoplayDelayMs?: string;
  Loop?: string;
  Navigation?: string;
  NavigationLayout?: string;
  SlideEmphasis?: string;
  NavigationButtonStyle?: string;
  NavigationButtonShape?: string;
  Pagination?: string;

  /** Search-experience. */
  FacetPlacement?: string;
  StickyControls?: string;
  DefaultView?: string;
  ResultsPerPage?: string;
  InitialSort?: string;
  ShowResultsSummary?: string;

  /** Section surface (shared card-list base params). */
  ColorScheme?: string;
  BackgroundIntensity?: string;
  PaddingY?: string;
  MaxWidth?: string;

  /** Empty-state copy (CARD_EMPTY_STATE_PARAMS). */
  EmptyStateMessage?: string;

  /** Standard. */
  RenderingIdentifier?: string;
  styles?: string;
}

/**
 * Split a multi-line Sitecore text field into trimmed, non-empty
 * feature rows. Kept for search/string consumers; the pricing-card
 * render path now passes the field object through so Pages can bind it.
 */
export function adaptFeatures(field: Field<string> | undefined): string[] {
  const raw = field?.value;
  if (!raw) return [];
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

export function adaptPricingItems(
  items: SitecorePricingItem[] | undefined,
): PricingFlatItem[] {
  if (!items?.length) return [];
  return items.map((item) => {
    // Hoist-tolerant: installed starters can deliver linked items with
    // `fields` already flattened onto the item (see linkedItemFields).
    const fields = linkedItemFields(item);
    return {
      id: item.id,
      title: fields?.Name?.value,
      href: fields?.CtaLink?.value?.href ?? item.url,
      extras: {
        name: fields?.Name,
        price: fields?.Price,
        currency: fields?.Currency?.value,
        features: fields?.Features,
        highlightLabel: fields?.HighlightLabel,
        pricePeriod: fields?.PricePeriod,
        // No React-side default — Sitecore Standard Values seeds truthiness.
        highlighted:
          typeof fields?.Highlighted?.value === "boolean"
            ? fields.Highlighted.value
            : fields?.Highlighted?.value === "1" ||
              fields?.Highlighted?.value === "true",
        ctaLabel: fields?.CtaLabel,
        ctaLink: fields?.CtaLink,
      },
    };
  });
}

export function adaptSearchConfig(
  field: Field<string> | undefined,
): SearchConfig | undefined {
  const raw = field?.value?.trim();
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as SearchConfig;
    if (!parsed.provider || !parsed.source) return undefined;
    return parsed;
  } catch {
    return undefined;
  }
}

const parseBool = (value?: string) => value === "1" || value === "true";

// Preserves `undefined` so Sitecore Standard Values keep driving the
// truthy initial state on boolean params — per project memory
// `feedback_no_react_defaults_for_sitecore_bool_params`.
const optionalBool = (value?: string): boolean | undefined =>
  value === undefined || value.trim() === "" ? undefined : parseBool(value);

const parseIntOr = (value: string | undefined, fallback: number) => {
  const n = Number.parseInt((value ?? "").trim(), 10);
  return Number.isFinite(n) ? n : fallback;
};

const parseNumberOr = (value: string | undefined, fallback: number) => {
  const n = Number.parseFloat((value ?? "").trim());
  return Number.isFinite(n) ? n : fallback;
};

const ALLOWED_NAV_LAYOUTS = [
  "inline",
  "overlay",
  "below",
  "header",
  "center-flank",
  "edge-stacked",
] as const;
const ALLOWED_NAV_BUTTON_STYLES = [
  "default",
  "outline",
  "solid",
  "ghost",
] as const;
const ALLOWED_NAV_BUTTON_SHAPES = ["default", "square"] as const;
const ALLOWED_PAGINATIONS = ["none", "dots", "numbers", "progress"] as const;

const oneOf = <T extends string>(
  value: string | undefined,
  allowed: readonly T[],
  fallback: T,
): T => {
  const normalized = value?.trim().toLowerCase() as T | undefined;
  return normalized && allowed.includes(normalized) ? normalized : fallback;
};

export function adaptListGridProps({
  fields,
  params,
}: {
  fields?: SitecorePricingFields;
  params?: SitecorePricingParams;
}) {
  return {
    title: fields?.Title,
    lead: fields?.Lead,
    items: adaptPricingItems(fields?.Plans),
    searchConfig: adaptSearchConfig(fields?.SearchConfig),
    headingLayout: params?.HeadingLayout,
    headingSize: params?.HeadingSize,
    columnsLg: parseIntOr(params?.ColumnsLg, 3),
    columnsMd: parseIntOr(params?.ColumnsMd, 2),
    columnsSm: parseIntOr(params?.ColumnsSm, 1),
    gap: oneOf(params?.Gap, GRID_GAP_VALUES, "md"),
    featuredFirst: parseFeaturedFirst(params?.FeaturedFirst),
    gridPattern: parseGridPattern(params?.GridPattern),
    ...adaptCardChromeParams(params),
    ...adaptCardMediaAspect(params),
    ...adaptCardCtaIconTrailing(params),
    ...adaptSectionSurfaceParams(params),
    emptyStateMessage: params?.EmptyStateMessage,
    id: params?.RenderingIdentifier,
    className: params?.styles,
  };
}

export function adaptCarouselProps({
  fields,
  params,
}: {
  fields?: SitecorePricingFields;
  params?: SitecorePricingParams;
}) {
  return {
    title: fields?.Title,
    lead: fields?.Lead,
    items: adaptPricingItems(fields?.Plans),
    searchConfig: adaptSearchConfig(fields?.SearchConfig),
    headingLayout: params?.HeadingLayout,
    headingSize: params?.HeadingSize,
    headingPlacement: params?.HeadingPlacement,
    slideEmphasis: params?.SlideEmphasis,
    slidesPerViewLg: parseNumberOr(params?.SlidesPerViewLg, 3),
    slidesPerViewMd: parseNumberOr(params?.SlidesPerViewMd, 2),
    slidesPerViewSm: parseNumberOr(params?.SlidesPerViewSm, 1),
    spaceBetween: parseIntOr(params?.SpaceBetween, 16),
    autoplay: optionalBool(params?.Autoplay),
    autoplayDelayMs: parseIntOr(params?.AutoplayDelayMs, 6000),
    loop: optionalBool(params?.Loop),
    navigation: optionalBool(params?.Navigation),
    navigationLayout: oneOf(
      params?.NavigationLayout,
      ALLOWED_NAV_LAYOUTS,
      "inline",
    ),
    navigationButtonStyle: oneOf(
      params?.NavigationButtonStyle,
      ALLOWED_NAV_BUTTON_STYLES,
      "default",
    ),
    navigationButtonShape: oneOf(
      params?.NavigationButtonShape,
      ALLOWED_NAV_BUTTON_SHAPES,
      "default",
    ),
    pagination: oneOf(params?.Pagination, ALLOWED_PAGINATIONS, "none"),
    ...adaptCardChromeParams(params),
    ...adaptCardMediaAspect(params),
    ...adaptSectionSurfaceParams(params),
    emptyStateMessage: params?.EmptyStateMessage,
    id: params?.RenderingIdentifier,
    className: params?.styles,
  };
}
