/**
 * Sitecore adapter for the products family. Unwraps Sitecore field
 * objects into the flat-prop shapes the React renderings consume.
 *
 * Three rendering targets: `ProductsListGrid`, `ProductsCarousel`, and
 * `ProductsSearchExperience`. All three share the same datasource
 * template, so a single set of adapters fans out to all of them.
 */

import type { ImageSource } from "@/components/registry/primitives/editables/image";
import type { TextSource } from "@/components/registry/primitives/editables/text";
import type { Product } from "@/lib/registry/models/product.model";
import { linkedItemFields } from "@/lib/registry/placeholder-children";
import type { SearchConfig } from "@/lib/registry/search/types";
import { adaptSectionSurfaceParams } from "@/lib/registry/section-surface";
import type { Field } from "@/lib/registry/sitecore";
import type { SitecoreItem } from "@/lib/registry/sitecore-types";
import {
  adaptCardChromeParams,
  adaptCardMediaAspect,
  adaptCardTitleLinkIcon,
} from "./_card-chrome-adapter";
import {
  GRID_GAP_VALUES,
  parseFeaturedFirst,
  parseGridPattern,
} from "./_grid-classname";
import type { ProductFlatItem } from "./products-list-grid";

export interface SitecoreProductsFields {
  Title?: TextSource;
  Lead?: TextSource;
  /** Treelist of product items. */
  Products?: SitecoreItem<Product>[];
  SearchConfig?: Field<string>;
}

export interface SitecoreProductsParams {
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
  MediaAspect?: string;
  TileAspect?: string;
  TitleLinkIcon?: string;
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

/**
 * Flatten the Sitecore `Product` shape into the search-controller's
 * `FlatItem<ProductExtras>` envelope. Editable-typed field objects
 * survive the trip — the card components destructure `extras.title`,
 * `extras.image1`, etc. and hand them to `<Text>`/`<Image>` editables.
 */
export function adaptProductItems(
  items: SitecoreItem<Product>[] | undefined,
): ProductFlatItem[] {
  if (!items?.length) return [];
  return (
    items
      // Hoisted envelopes carry no `fields` key — filtering on `fields`
      // directly dropped every item when an installed starter's map
      // flattened the Treelist first. linkedItemFields reads both shapes
      // and still rejects unresolved references (no field keys at all).
      .filter((item) => linkedItemFields(item) != null)
      .map((item) => {
        const fields = linkedItemFields<Product>(item);
        const image1 = fields?.Image1 as ImageSource | undefined;
        const image2 = fields?.Image2 as ImageSource | undefined;
        const imageValue =
          image1 && typeof image1 === "object" && "value" in image1
            ? (image1.value as { src?: string; alt?: string } | undefined)
            : undefined;
        return {
          id: item.id,
          title: fields?.Title?.value,
          href: item.url,
          image: imageValue?.src
            ? { src: imageValue.src, alt: imageValue.alt }
            : undefined,
          extras: {
            title: fields?.Title,
            shortDescription: fields?.ShortDescription,
            category: linkedItemFields(fields?.Category)?.CategoryName,
            price:
              typeof fields?.Price?.value === "number"
                ? fields.Price.value
                : fields?.Price?.value
                  ? Number(fields.Price.value)
                  : undefined,
            sku: fields?.Sku?.value,
            image1,
            image2,
            // Per-item CTA label ("Buy Now" / "Learn More"): forwarded so a
            // curated shop card renders a labeled action button instead of
            // the bare icon `+`. Absent → the card keeps its default.
            ctaLabel: fields?.CtaLabel,
          },
        } satisfies ProductFlatItem;
      })
  );
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
  "compact",
  "minimal",
  "horizontal-essential",
  "horizontal-detailed",
  "detail-panel",
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
  fields?: SitecoreProductsFields;
  params?: SitecoreProductsParams;
}) {
  return {
    title: fields?.Title,
    lead: fields?.Lead,
    items: adaptProductItems(fields?.Products),
    searchConfig: adaptSearchConfig(fields?.SearchConfig),
    headingLayout: params?.HeadingLayout,
    headingSize: params?.HeadingSize,
    cardVariant: oneOf(params?.CardVariant, ALLOWED_CARD_VARIANTS, "default"),
    columnsLg: parseIntOr(params?.ColumnsLg, 4),
    columnsMd: parseIntOr(params?.ColumnsMd, 2),
    columnsSm: parseIntOr(params?.ColumnsSm, 1),
    gap: oneOf(params?.Gap, GRID_GAP_VALUES, "md"),
    featuredFirst: parseFeaturedFirst(params?.FeaturedFirst),
    gridPattern: parseGridPattern(params?.GridPattern),
    ...adaptCardChromeParams(params),
    ...adaptCardTitleLinkIcon(params),
    ...adaptCardMediaAspect(params),
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
  fields?: SitecoreProductsFields;
  params?: SitecoreProductsParams;
}) {
  return {
    title: fields?.Title,
    lead: fields?.Lead,
    items: adaptProductItems(fields?.Products),
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
    slidesPerViewLg: parseNumberOr(params?.SlidesPerViewLg, 4),
    slidesPerViewMd: parseNumberOr(params?.SlidesPerViewMd, 2),
    slidesPerViewSm: parseNumberOr(params?.SlidesPerViewSm, 1),
    spaceBetween: parseIntOr(params?.SpaceBetween, 24),
    autoplay:
      params?.Autoplay === undefined ? undefined : parseBool(params.Autoplay),
    autoplayDelayMs: parseIntOr(params?.AutoplayDelayMs, 6000),
    loop: params?.Loop === undefined ? undefined : parseBool(params.Loop),
    navigation:
      params?.Navigation === undefined
        ? undefined
        : parseBool(params.Navigation),
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
    ...adaptSectionSurfaceParams(params),
    emptyStateMessage: params?.EmptyStateMessage,
    id: params?.RenderingIdentifier,
    className: params?.styles,
  };
}
