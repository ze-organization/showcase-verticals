/**
 * Sitecore adapter for the reviews family. Unwraps Sitecore field
 * objects into the flat-prop shapes the React renderings consume.
 *
 * Three rendering targets: `ReviewsListGrid`, `ReviewsCarousel`, and
 * `ReviewsSearchExperience`. All three share the same datasource
 * template, so a single set of adapters fans out to all of them.
 */

import type { ImageSource } from "@/components/registry/primitives/editables/image";
import type { RichTextSource } from "@/components/registry/primitives/editables/richtext";
import type { TextSource } from "@/components/registry/primitives/editables/text";
import { linkedItemFields } from "@/lib/registry/placeholder-children";
import type { SearchConfig } from "@/lib/registry/search/types";
import { adaptSectionSurfaceParams } from "@/lib/registry/section-surface";
import type { Field, ImageField } from "@/lib/registry/sitecore";
import { adaptCardChromeParams } from "./_card-chrome-adapter";
import {
  GRID_GAP_VALUES,
  parseFeaturedFirst,
  parseGridPattern,
} from "./_grid-classname";
import type { ReviewFlatItem } from "./reviews-list-grid";

/**
 * Raw shape of a review Sitecore item under `fields.Reviews`. Treelist
 * items resolve to this when curated; placeholder mode bypasses this
 * entirely (children render as Sitecore placeholders).
 *
 * Field naming matches the review-card@1 datasource template
 * (Quote / AuthorName / AuthorImage / Rating / Source).
 */
export interface SitecoreReviewItem {
  id: string;
  displayName?: string;
  name?: string;
  url?: string;
  fields?: {
    Quote?: Field<string>;
    AuthorName?: Field<string>;
    AuthorRole?: Field<string>;
    AuthorImage?: ImageField;
    Rating?: Field<number | string>;
    Source?: Field<string>;
    ReviewImage?: ImageField;
  };
}

export interface SitecoreReviewsFields {
  Title?: TextSource;
  Lead?: TextSource;
  Reviews?: SitecoreReviewItem[];
  SearchConfig?: Field<string>;
}

export interface SitecoreReviewsParams {
  /** Card-shape choice flows from datasource onto child cards. */
  CardVariant?: string;
  CompactSlideVariant?: string;
  ShowImages?: string;

  /** Curated-mode chrome pass-through (CARD_STYLING_PARAMS). */
  Elevation?: string;
  Padding?: string;
  Style?: string;
  CardColorScheme?: string;
  ColorBand?: string;
  MediaBleed?: string;
  CtaPlacement?: string;

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

export function adaptReviewItems(
  items: SitecoreReviewItem[] | undefined,
): ReviewFlatItem[] {
  if (!items?.length) return [];
  return items.map((item) => {
    // Hoist-tolerant: installed starters can deliver linked items with
    // `fields` already flattened onto the item (see linkedItemFields).
    const fields = linkedItemFields(item);
    const quote = fields?.Quote as RichTextSource | undefined;
    const authorName = fields?.AuthorName;
    const authorRole = fields?.AuthorRole;
    const authorImage = fields?.AuthorImage as ImageSource | undefined;
    const source = fields?.Source;
    const ratingRaw = fields?.Rating?.value;
    const ratingNum =
      typeof ratingRaw === "number"
        ? ratingRaw
        : typeof ratingRaw === "string"
          ? Number.parseFloat(ratingRaw)
          : undefined;
    return {
      id: item.id,
      title: authorName?.value,
      href: item.url,
      extras: {
        quote,
        authorName,
        authorRole,
        authorImage,
        rating: Number.isFinite(ratingNum) ? (ratingNum as number) : undefined,
        source,
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

const _parseBool = (value?: string) => value === "1" || value === "true";

const parseIntOr = (value: string | undefined, fallback: number) => {
  const n = Number.parseInt((value ?? "").trim(), 10);
  return Number.isFinite(n) ? n : fallback;
};

const parseNumberOr = (value: string | undefined, fallback: number) => {
  const n = Number.parseFloat((value ?? "").trim());
  return Number.isFinite(n) ? n : fallback;
};

const ALLOWED_CARD_VARIANTS = ["card", "quote"] as const;
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

/** Like `oneOf`, but unset/unknown stays `undefined` (no fallback). */
const oneOfOptional = <T extends string>(
  value: string | undefined,
  allowed: readonly T[],
): T | undefined => {
  const normalized = value?.trim().toLowerCase() as T | undefined;
  return normalized && allowed.includes(normalized) ? normalized : undefined;
};

/**
 * Optional boolean from a Sitecore string param. Returns `undefined`
 * when the author hasn't set the value — React then leaves the prop
 * undefaulted so Sitecore standard values drive the truthy state
 * (see [[feedback-no-react-defaults-for-sitecore-bool-params]]).
 */
const optionalBool = (value: string | undefined): boolean | undefined => {
  if (value == null) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (trimmed === "1" || trimmed.toLowerCase() === "true") return true;
  if (trimmed === "0" || trimmed.toLowerCase() === "false") return false;
  return undefined;
};

export function adaptListGridProps({
  fields,
  params,
}: {
  fields?: SitecoreReviewsFields;
  params?: SitecoreReviewsParams;
}) {
  return {
    title: fields?.Title,
    lead: fields?.Lead,
    items: adaptReviewItems(fields?.Reviews),
    searchConfig: adaptSearchConfig(fields?.SearchConfig),
    headingLayout: params?.HeadingLayout,
    headingSize: params?.HeadingSize,
    cardVariant: oneOf(params?.CardVariant, ALLOWED_CARD_VARIANTS, "card"),
    showImages: optionalBool(params?.ShowImages),
    columnsLg: parseIntOr(params?.ColumnsLg, 3),
    columnsMd: parseIntOr(params?.ColumnsMd, 2),
    columnsSm: parseIntOr(params?.ColumnsSm, 1),
    gap: oneOf(params?.Gap, GRID_GAP_VALUES, "md"),
    featuredFirst: parseFeaturedFirst(params?.FeaturedFirst),
    gridPattern: parseGridPattern(params?.GridPattern),
    ...adaptCardChromeParams(params),
    // `adaptCardMediaAspect` deliberately NOT spread. This family's card
    // has no `mediaAspect` in its source, so the recipe no longer offers
    // MediaAspect/TileAspect and nothing should be adapted for them.
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
  fields?: SitecoreReviewsFields;
  params?: SitecoreReviewsParams;
}) {
  return {
    title: fields?.Title,
    lead: fields?.Lead,
    items: adaptReviewItems(fields?.Reviews),
    searchConfig: adaptSearchConfig(fields?.SearchConfig),
    headingLayout: params?.HeadingLayout,
    headingSize: params?.HeadingSize,
    headingPlacement: params?.HeadingPlacement,
    cardVariant: oneOf(params?.CardVariant, ALLOWED_CARD_VARIANTS, "card"),
    showImages: optionalBool(params?.ShowImages),
    compactSlideVariant: oneOfOptional(
      params?.CompactSlideVariant,
      ALLOWED_CARD_VARIANTS,
    ),
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
    // `adaptCardMediaAspect` deliberately NOT spread. This family's card
    // has no `mediaAspect` in its source, so the recipe no longer offers
    // MediaAspect/TileAspect and nothing should be adapted for them.
    ...adaptSectionSurfaceParams(params),
    emptyStateMessage: params?.EmptyStateMessage,
    id: params?.RenderingIdentifier,
    className: params?.styles,
  };
}
