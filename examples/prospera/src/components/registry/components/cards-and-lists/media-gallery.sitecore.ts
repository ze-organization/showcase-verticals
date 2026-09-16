/**
 * Sitecore adapter for the media-gallery family. Unwraps Sitecore field
 * objects into the flat-prop shapes the React renderings consume.
 *
 * Two rendering targets: `MediaGalleryListGrid` and
 * `MediaGallerySearchExperience`. Both share the same datasource
 * template, so a single set of adapters fans out to both. There is no
 * carousel rendering in this family — the layout swaps stay inside
 * `MediaGalleryListGrid` (Grid/NoSpacing/FiftyFifty/Featured/
 * TwistedMixedMedia/Mosaic/Collage/List).
 */

import type { ImageSource } from "@/components/registry/primitives/editables/image";
import type { TextSource } from "@/components/registry/primitives/editables/text";
import { linkedItemFields } from "@/lib/registry/placeholder-children";
import type { SearchConfig } from "@/lib/registry/search/types";
import { adaptSectionSurfaceParams } from "@/lib/registry/section-surface";
import type { Field } from "@/lib/registry/sitecore";
import {
  GRID_GAP_VALUES,
  parseFeaturedFirst,
  parseGridPattern,
} from "./_grid-classname";
import type { MediaFlatItem } from "./media-gallery-list-grid";

/**
 * Raw shape of a media item Sitecore datasource under
 * `fields.MediaItems`. Treelist items resolve to this when curated;
 * placeholder mode bypasses this entirely (children render via Sitecore
 * placeholders).
 */
export interface MediaGalleryItemFields {
  id: string;
  displayName?: string;
  name?: string;
  url?: string;
  fields?: {
    Image?: ImageSource;
    VideoUrl?: Field<string>;
    ThumbnailUrl?: Field<string>;
    Title?: Field<string>;
    Caption?: Field<string>;
    AltText?: Field<string>;
  };
}

export interface SitecoreMediaGalleryFields {
  Title?: TextSource;
  Lead?: TextSource;
  MediaItems?: MediaGalleryItemFields[];
  SearchConfig?: Field<string>;
}

export interface SitecoreMediaGalleryParams {
  /** Layout. */
  HeadingLayout?: string;
  HeadingSize?: string;
  HeadingPlacement?: string;
  ColumnsLg?: string;
  ColumnsMd?: string;
  ColumnsSm?: string;
  Gap?: string;
  FeaturedFirst?: string;
  GridPattern?: string;
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

export function adaptMediaItems(
  items: MediaGalleryItemFields[] | undefined,
): MediaFlatItem[] {
  if (!items?.length) return [];
  return items.map((item) => {
    // Hoist-tolerant: installed starters can deliver linked items with
    // `fields` already flattened onto the item (see linkedItemFields).
    const fields = linkedItemFields(item);
    return {
      id: item.id,
      title: fields?.Title?.value,
      href: item.url,
      extras: {
        image: fields?.Image,
        videoUrl: fields?.VideoUrl?.value,
        thumbnailUrl: fields?.ThumbnailUrl?.value,
        caption: fields?.Caption,
        altText: fields?.AltText?.value,
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
  fields?: SitecoreMediaGalleryFields;
  params?: SitecoreMediaGalleryParams;
}) {
  return {
    title: fields?.Title,
    lead: fields?.Lead,
    items: adaptMediaItems(fields?.MediaItems),
    searchConfig: adaptSearchConfig(fields?.SearchConfig),
    headingLayout: params?.HeadingLayout,
    headingSize: params?.HeadingSize,
    headingPlacement: params?.HeadingPlacement,
    columnsLg: parseIntOr(params?.ColumnsLg, 3),
    columnsMd: parseIntOr(params?.ColumnsMd, 2),
    columnsSm: parseIntOr(params?.ColumnsSm, 1),
    gap: oneOf(params?.Gap, GRID_GAP_VALUES, "md"),
    featuredFirst: parseFeaturedFirst(params?.FeaturedFirst),
    gridPattern: parseGridPattern(params?.GridPattern),
    captionStyle: params?.CaptionStyle,
    mediaAspect: params?.MediaAspect,
    ...adaptSectionSurfaceParams(params),
    emptyStateMessage: params?.EmptyStateMessage,
    id: params?.RenderingIdentifier,
    className: params?.styles,
  };
}
