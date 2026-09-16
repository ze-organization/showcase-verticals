/**
 * Sitecore adapter for the media-carousel family. Unwraps Sitecore
 * field objects into the flat-prop shapes the React renderings consume.
 *
 * Two rendering targets: `MediaCarousel` and `MediaCarouselSearchExperience`.
 * Both share the same datasource template, so a single set of adapters
 * fans out to both. The media-gallery family runs a parallel adapter
 * with the same `MediaCarouselItemFields` shape.
 */

import type { ImageSource } from "@/components/registry/primitives/editables/image";
import type { TextSource } from "@/components/registry/primitives/editables/text";
import { linkedItemFields } from "@/lib/registry/placeholder-children";
import type { SearchConfig } from "@/lib/registry/search/types";
import { adaptSectionSurfaceParams } from "@/lib/registry/section-surface";
import type { Field } from "@/lib/registry/sitecore";
import type { MediaFlatItem } from "./media-carousel";

/**
 * Raw shape of a media item Sitecore item under `fields.MediaItems`.
 * Treelist items resolve to this when curated; placeholder mode bypasses
 * this entirely (children render as Sitecore placeholders).
 *
 * Matches the `media-item@1` recipe datasource (owned by media-gallery).
 */
export interface SitecoreMediaCarouselItem {
  id: string;
  displayName?: string;
  name?: string;
  url?: string;
  fields?: {
    Image?: ImageSource;
    VideoUrl?: Field<string>;
    Title?: Field<string>;
    Caption?: Field<string>;
  };
}

export interface SitecoreMediaCarouselFields {
  Title?: TextSource;
  Lead?: TextSource;
  MediaItems?: SitecoreMediaCarouselItem[];
  SearchConfig?: Field<string>;
}

export interface SitecoreMediaCarouselParams {
  /** Layout. */
  HeadingLayout?: string;
  HeadingSize?: string;
  /** `band-heading-placement@1` — heading above the slides (default) or inline in the leading column. */
  HeadingPlacement?: string;

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
  CaptionStyle?: string;
  MediaAspect?: string;
  TileAspect?: string;
  CtaPlacement?: string;

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

function getFieldText(field?: Field<string>): string | undefined {
  const raw = field?.value;
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function adaptMediaCarouselItems(
  items: SitecoreMediaCarouselItem[] | undefined,
): MediaFlatItem[] {
  if (!items?.length) return [];
  return items.map((item) => {
    // Hoist-tolerant: installed starters can deliver linked items with
    // `fields` already flattened onto the item (see linkedItemFields).
    const fields = linkedItemFields(item);
    return {
      id: item.id,
      title: getFieldText(fields?.Title) ?? item.displayName ?? item.name,
      href: item.url,
      extras: {
        image: fields?.Image,
        videoUrl: getFieldText(fields?.VideoUrl),
        titleSource: fields?.Title,
        captionSource: fields?.Caption,
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

export function adaptCarouselProps({
  fields,
  params,
}: {
  fields?: SitecoreMediaCarouselFields;
  params?: SitecoreMediaCarouselParams;
}) {
  return {
    title: fields?.Title,
    lead: fields?.Lead,
    items: adaptMediaCarouselItems(fields?.MediaItems),
    searchConfig: adaptSearchConfig(fields?.SearchConfig),
    headingLayout: params?.HeadingLayout,
    headingSize: params?.HeadingSize,
    headingPlacement: params?.HeadingPlacement,
    slideEmphasis: params?.SlideEmphasis,
    slidesPerViewLg: parseNumberOr(params?.SlidesPerViewLg, 1),
    slidesPerViewMd: parseNumberOr(params?.SlidesPerViewMd, 1),
    slidesPerViewSm: parseNumberOr(params?.SlidesPerViewSm, 1),
    spaceBetween: parseIntOr(params?.SpaceBetween, 16),
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
    captionStyle: params?.CaptionStyle,
    mediaAspect: params?.MediaAspect,
    ...adaptSectionSurfaceParams(params),
    emptyStateMessage: params?.EmptyStateMessage,
    id: params?.RenderingIdentifier,
    className: params?.styles,
  };
}

/**
 * Per-variant adapter entries. The file previously exported ONLY the
 * bare `adaptCarouselProps` helper — no PascalCase variant entries —
 * so the component map's adapter pairing missed for every variant and
 * the convention map delivered `mediaItems` instead of `items`:
 * curated media items rendered empty on all media-carousel variants.
 * Keys mirror the component's variant export names.
 */
export const Default = adaptCarouselProps;
export const FullBleed = adaptCarouselProps;
export const PreviewBelow = adaptCarouselProps;
export const FeaturedImageLeft = adaptCarouselProps;
export const FeatureSpotlight = adaptCarouselProps;
export const Peek = adaptCarouselProps;
