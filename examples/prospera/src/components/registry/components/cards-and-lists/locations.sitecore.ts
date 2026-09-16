/**
 * Sitecore adapter for the `locations` cards-and-lists family.
 * Unwraps the recipe-shaped fields into the flat `LocationFlatItem`
 * shape the React renderings (`locations-list-grid`, `locations-carousel`)
 * consume. Maps a curated Treelist of `location-card@1` items into the
 * common `extras` envelope alongside the top-level FlatItem fields.
 */

import type { ImageSource } from "@/components/registry/primitives/editables/image";
import type { LinkSource } from "@/components/registry/primitives/editables/link";
import type { RichTextSource } from "@/components/registry/primitives/editables/richtext";
import type { TextSource } from "@/components/registry/primitives/editables/text";
import { linkedItemFields, resolvePlaceholderChildren } from "@/lib/registry/placeholder-children";
import type { SearchConfig } from "@/lib/registry/search/types";
import { adaptSectionSurfaceParams } from "@/lib/registry/section-surface";
import type {
  ComponentRendering,
  Field,
  ImageField,
  LinkField,
} from "@/lib/registry/sitecore";
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
import type { LocationFlatItem } from "./locations-list-grid";

export interface SitecoreLocationCardFields {
  Name?: Field<string>;
  Address1?: Field<string>;
  Address2?: Field<string>;
  City?: Field<string>;
  State?: Field<string>;
  PostalCode?: Field<string>;
  Country?: Field<string>;
  Phone?: Field<string>;
  Email?: Field<string>;
  Hours?: { value?: string };
  Image?: ImageField;
  Link?: LinkField;
  Latitude?: Field<number>;
  Longitude?: Field<number>;
}

export interface SitecoreLocationItem {
  id: string;
  displayName?: string;
  name?: string;
  url?: string;
  fields?: SitecoreLocationCardFields;
}

export interface SitecoreLocationsFields {
  Title?: TextSource;
  Lead?: TextSource;
  Locations?: SitecoreLocationItem[];
  SearchConfig?: Field<string>;
}

export interface SitecoreLocationsParams {
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

  /** Carousel (CARD_CAROUSEL_PARAMS). */
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

  /** Section surface (shared card-list base params). */
  ColorScheme?: string;
  BackgroundIntensity?: string;
  PaddingY?: string;
  MaxWidth?: string;

  /** Empty-state copy (CARD_EMPTY_STATE_PARAMS). */
  EmptyStateMessage?: string;

  RenderingIdentifier?: string;
  styles?: string;
}

const parseIntOr = (value: string | undefined, fallback: number): number => {
  const n = Number.parseInt((value ?? "").trim(), 10);
  return Number.isFinite(n) ? n : fallback;
};

const parseNumberOr = (value: string | undefined, fallback: number): number => {
  const n = Number.parseFloat((value ?? "").trim());
  return Number.isFinite(n) ? n : fallback;
};

// Preserves `undefined` so Sitecore Standard Values keep driving the
// truthy initial state on boolean params — per project memory
// `feedback_no_react_defaults_for_sitecore_bool_params`.
const parseBoolMaybe = (value?: string): boolean | undefined => {
  if (value === undefined || value === null) return undefined;
  const trimmed = value.trim().toLowerCase();
  if (trimmed === "") return undefined;
  if (trimmed === "1" || trimmed === "true") return true;
  if (trimmed === "0" || trimmed === "false") return false;
  return undefined;
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

/** Like `oneOf`, but unset/unknown stays `undefined` (no fallback). */
const oneOfOptional = <T extends string>(
  value: string | undefined,
  allowed: readonly T[],
): T | undefined => {
  const normalized = value?.trim().toLowerCase() as T | undefined;
  return normalized && allowed.includes(normalized) ? normalized : undefined;
};

const fieldNumber = (field: Field<number> | undefined): number | undefined => {
  const raw = field?.value;
  if (raw === undefined || raw === null) return undefined;
  const n = typeof raw === "number" ? raw : Number.parseFloat(String(raw));
  return Number.isFinite(n) ? n : undefined;
};

export function adaptLocationItems(
  items: SitecoreLocationItem[] | undefined,
): LocationFlatItem[] {
  if (!items?.length) return [];
  return items.map((item) => {
    // Hoist-tolerant: installed starters can deliver linked items with
    // `fields` already flattened onto the item (see linkedItemFields).
    const fields = linkedItemFields(item) ?? {};
    const imageValue = fields.Image?.value;
    const image: ImageSource | undefined = imageValue?.src
      ? {
          src: imageValue.src,
          alt: typeof imageValue.alt === "string" ? imageValue.alt : undefined,
        }
      : undefined;
    const linkValue = fields.Link?.value;
    const href = linkValue?.href ?? item.url;
    const lat = fieldNumber(fields.Latitude);
    const lng = fieldNumber(fields.Longitude);
    return {
      id: item.id,
      title: fields.Name?.value,
      image,
      href,
      extras: {
        address1: fields.Address1,
        address2: fields.Address2,
        city: fields.City,
        state: fields.State,
        postalCode: fields.PostalCode,
        country: fields.Country,
        phone: fields.Phone,
        email: fields.Email,
        hours: fields.Hours as RichTextSource | undefined,
        link: fields.Link as LinkSource | undefined,
        lat,
        lng,
      },
    } as LocationFlatItem;
  });
}

/**
 * Pin data from composed `cards-locations-*` children when the Treelist
 * / search path is empty. Each child rendering carries location-card
 * fields on the layout-service envelope.
 */
export function itemsFromComposedLocationCards(
  rendering: unknown,
  dynamicPlaceholderId?: string,
): LocationFlatItem[] {
  const { children } = resolvePlaceholderChildren<{
    uid?: string;
    id?: string;
    url?: string;
    fields?: SitecoreLocationCardFields;
  }>(
    rendering as ComponentRendering | undefined,
    "cards-locations",
    dynamicPlaceholderId,
  );
  return adaptLocationItems(
    children.map((child) => ({
      id: child.id || child.uid || "",
      url: child.url,
      fields: child.fields,
    })),
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

export function adaptListGridProps({
  fields,
  params,
}: {
  fields?: SitecoreLocationsFields;
  params?: SitecoreLocationsParams;
}) {
  return {
    title: fields?.Title,
    lead: fields?.Lead,
    items: adaptLocationItems(fields?.Locations),
    searchConfig: adaptSearchConfig(fields?.SearchConfig),
    columnsLg: parseIntOr(params?.ColumnsLg, 3),
    columnsMd: parseIntOr(params?.ColumnsMd, 2),
    columnsSm: parseIntOr(params?.ColumnsSm, 1),
    gap: oneOf(params?.Gap, GRID_GAP_VALUES, "md"),
    featuredFirst: parseFeaturedFirst(params?.FeaturedFirst),
    gridPattern: parseGridPattern(params?.GridPattern),
    headingLayout: params?.HeadingLayout,
    headingSize: params?.HeadingSize,
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
  fields?: SitecoreLocationsFields;
  params?: SitecoreLocationsParams;
}) {
  return {
    title: fields?.Title,
    lead: fields?.Lead,
    items: adaptLocationItems(fields?.Locations),
    searchConfig: adaptSearchConfig(fields?.SearchConfig),
    cardVariant: oneOf(
      params?.CardVariant,
      ["default", "compact", "inline", "pin"] as const,
      "compact",
    ),
    headingLayout: params?.HeadingLayout,
    headingSize: params?.HeadingSize,
    headingPlacement: params?.HeadingPlacement,
    compactSlideVariant: oneOfOptional(params?.CompactSlideVariant, [
      "default",
      "compact",
      "inline",
      "pin",
    ] as const),
    slideEmphasis: params?.SlideEmphasis,
    slidesPerViewLg: parseNumberOr(params?.SlidesPerViewLg, 3),
    slidesPerViewMd: parseNumberOr(params?.SlidesPerViewMd, 2),
    slidesPerViewSm: parseNumberOr(params?.SlidesPerViewSm, 1),
    spaceBetween: parseIntOr(params?.SpaceBetween, 16),
    autoplay: parseBoolMaybe(params?.Autoplay),
    autoplayDelayMs: parseIntOr(params?.AutoplayDelayMs, 6000),
    loop: parseBoolMaybe(params?.Loop),
    navigation: parseBoolMaybe(params?.Navigation),
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
