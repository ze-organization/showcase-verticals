/**
 * Sitecore adapter for the articles family. Unwraps Sitecore field
 * objects into the flat-prop shapes the React renderings consume.
 *
 * Three rendering targets: `ArticlesListGrid`, `ArticlesCarousel`,
 * and `ArticlesSearchExperience`. All three share the same datasource
 * template, so a single set of adapters fans out to all of them.
 */

import type { ImageSource } from "@/components/registry/primitives/editables/image";
import type { LinkSource } from "@/components/registry/primitives/editables/link";
import type { TextSource } from "@/components/registry/primitives/editables/text";
import { linkedItemFields } from "@/lib/registry/placeholder-children";
import type { SearchConfig } from "@/lib/registry/search/types";
import { adaptSectionSurfaceParams } from "@/lib/registry/section-surface";
import type { Field } from "@/lib/registry/sitecore";
import {
  adaptCardChromeParams,
  adaptCardCtaPlacement,
  adaptCardMediaAspect,
  adaptCardTitleLinkIcon,
} from "./_card-chrome-adapter";
import {
  GRID_GAP_VALUES,
  parseFeaturedFirst,
  parseGridPattern,
} from "./_grid-classname";
import type { ArticleFlatItem } from "./articles-list-grid";

/**
 * Raw shape of an article Sitecore item under `fields.Articles`.
 * Treelist items resolve to this when curated; placeholder mode
 * bypasses this entirely (children render as Sitecore placeholders).
 */
export interface ArticleListingItemFields {
  id: string;
  displayName?: string;
  name?: string;
  url?: string;
  fields?: {
    Title?: TextSource;
    Excerpt?: TextSource;
    Image?: ImageSource;
    Link?: LinkSource;
    Date?: TextSource;
    Eyebrow?: TextSource;
  };
}

export interface SitecoreArticlesFields {
  /** Optional kicker line above the title (small-caps eyebrow). */
  Eyebrow?: TextSource;
  Title?: TextSource;
  Lead?: TextSource;
  Articles?: ArticleListingItemFields[];
  SearchConfig?: Field<string>;
}

export interface SitecoreArticlesParams {
  /** Card-shape choice flows from datasource onto child cards. */
  CardVariant?: string;
  CompactSlideVariant?: string;

  /** Curated-mode chrome pass-through (CARD_STYLING_PARAMS). */
  Elevation?: string;
  Padding?: string;
  Style?: string;
  CardColorScheme?: string;
  ColorBand?: string;
  MediaBleed?: string;
  TitleLinkIcon?: string;
  MediaAspect?: string;
  TileAspect?: string;
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

function getTextValue(src: TextSource | undefined): string | undefined {
  if (src == null) return undefined;
  if (typeof src === "string") return src.trim() || undefined;
  if (typeof src === "object") {
    const value = (src as { value?: string }).value;
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

export function adaptArticleItems(
  items: ArticleListingItemFields[] | undefined,
): ArticleFlatItem[] {
  if (!items?.length) return [];
  return items.map((item) => {
    // Hoist-tolerant: installed starters can deliver linked items with
    // `fields` already flattened onto the item (see linkedItemFields).
    const fields =
      linkedItemFields<NonNullable<ArticleListingItemFields["fields"]>>(item);
    return {
      id: item.id,
      title: getTextValue(fields?.Title),
      description: getTextValue(fields?.Excerpt),
      href: item.url,
      extras: {
        excerpt: fields?.Excerpt,
        image: fields?.Image,
        link: fields?.Link,
        date: fields?.Date,
        eyebrow: fields?.Eyebrow,
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
// truthy initial state on boolean params. See project memory
// `feedback_no_react_defaults_for_sitecore_bool_params` — coercing
// `undefined → false` silently overrides what authors set in Standard
// Values.
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

const ALLOWED_CARD_VARIANTS = [
  "default",
  "title-only",
  "image-title-only",
  "overlay",
] as const;
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

export function adaptListGridProps({
  fields,
  params,
}: {
  fields?: SitecoreArticlesFields;
  params?: SitecoreArticlesParams;
}) {
  return {
    title: fields?.Title,
    lead: fields?.Lead,
    eyebrow: fields?.Eyebrow,
    items: adaptArticleItems(fields?.Articles),
    searchConfig: adaptSearchConfig(fields?.SearchConfig),
    headingLayout: params?.HeadingLayout,
    headingSize: params?.HeadingSize,
    cardVariant: oneOf(params?.CardVariant, ALLOWED_CARD_VARIANTS, "default"),
    columnsLg: parseIntOr(params?.ColumnsLg, 3),
    columnsMd: parseIntOr(params?.ColumnsMd, 2),
    columnsSm: parseIntOr(params?.ColumnsSm, 1),
    gap: oneOf(params?.Gap, GRID_GAP_VALUES, "md"),
    featuredFirst: parseFeaturedFirst(params?.FeaturedFirst),
    gridPattern: parseGridPattern(params?.GridPattern),
    ...adaptCardChromeParams(params),
    ...adaptCardTitleLinkIcon(params),
    ...adaptCardMediaAspect(params),
    ...adaptCardCtaPlacement(params),
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
  fields?: SitecoreArticlesFields;
  params?: SitecoreArticlesParams;
}) {
  return {
    title: fields?.Title,
    lead: fields?.Lead,
    eyebrow: fields?.Eyebrow,
    items: adaptArticleItems(fields?.Articles),
    searchConfig: adaptSearchConfig(fields?.SearchConfig),
    headingLayout: params?.HeadingLayout,
    headingSize: params?.HeadingSize,
    headingPlacement: params?.HeadingPlacement,
    cardVariant: oneOf(params?.CardVariant, ALLOWED_CARD_VARIANTS, "default"),
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
    ...adaptCardTitleLinkIcon(params),
    ...adaptCardMediaAspect(params),
    ...adaptCardCtaPlacement(params),
    ...adaptSectionSurfaceParams(params),
    emptyStateMessage: params?.EmptyStateMessage,
    id: params?.RenderingIdentifier,
    className: params?.styles,
  };
}
