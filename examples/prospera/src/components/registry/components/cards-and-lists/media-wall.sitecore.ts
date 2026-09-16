/**
 * Sitecore adapter for `media-wall@1`. Unwraps the `{fields, params}`
 * layout-service envelope into the flat `MediaWallProps` shape the React
 * variants consume. Keys mirror the variant export names so the
 * component-map applies this via `withSitecore`.
 */
import type { ImageSource } from "@/components/registry/primitives/editables/image";
import type { LinkSource } from "@/components/registry/primitives/editables/link";
import type { TextSource } from "@/components/registry/primitives/editables/text";
import { linkedItemFields } from "@/lib/registry/placeholder-children";
import type { SearchConfig } from "@/lib/registry/search/types";
import { adaptSectionSurfaceParams } from "@/lib/registry/section-surface";
import type { Field } from "@/lib/registry/sitecore";
import { GRID_GAP_VALUES } from "./_grid-classname";
import type { MediaWallItem } from "./media-wall";

interface MediaWallItemFields {
  id: string;
  url?: string;
  fields?: {
    Image?: ImageSource;
    VideoUrl?: Field<string>;
    ThumbnailUrl?: Field<string>;
    Title?: Field<string>;
    Caption?: Field<string>;
    AltText?: Field<string>;
    AuthorHandle?: Field<string>;
    PostUrl?: Field<string>;
    PostDate?: Field<string>;
  };
}

export interface SitecoreMediaWallFields {
  Title?: TextSource;
  Lead?: TextSource;
  /** Optional kicker line above the title (small-caps eyebrow). */
  Eyebrow?: TextSource;
  /** Optional heading CTA — rendered as a pill under the heading on every variant. */
  Cta?: LinkSource;
  MediaItems?: MediaWallItemFields[];
  SearchConfig?: Field<string>;
}

export interface SitecoreMediaWallParams {
  HeadingLayout?: string;
  HeadingSize?: string;
  HeadingPlacement?: string;
  Columns?: string;
  Gap?: string;
  CaptionStyle?: string;
  /** Arc only — `above` (default) or `center` (heading in the arc well). */
  ContentPlacement?: string;
  /** Arc only — how far around the fan wraps: `tight` or `wide`. */
  ArcSpread?: string;
  /** Tile click opens the modal detail view (social wall pattern). */
  Lightbox?: string;
  /** Inside the lightbox, embed the platform's own post when possible. */
  LightboxEmbedPost?: string;
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

function adaptMediaWallItems(
  items: MediaWallItemFields[] | undefined,
): MediaWallItem[] {
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
        authorHandle: fields?.AuthorHandle?.value,
        postUrl: fields?.PostUrl?.value,
        postDate: fields?.PostDate?.value,
      },
    };
  });
}

/** Sitecore string-boolean → boolean (`1`/`true`/`yes`/`on` are truthy). */
const parseBool = (value: string | undefined): boolean => {
  if (!value) return false;
  return ["1", "true", "yes", "on", "enabled"].includes(
    value.trim().toLowerCase(),
  );
};

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

/**
 * Parse the `SearchConfig` JSON blob into a {@link SearchConfig}.
 * Mirrors the identical parser every other cards-and-lists family
 * adapter ships; a blank, malformed, or incomplete blob resolves to
 * `undefined` so the rendering stays on its curated items.
 */
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

export function adaptWallProps({
  fields,
  params,
}: {
  fields?: SitecoreMediaWallFields;
  params?: SitecoreMediaWallParams;
}) {
  return {
    title: fields?.Title,
    lead: fields?.Lead,
    eyebrow: fields?.Eyebrow,
    cta: fields?.Cta,
    items: adaptMediaWallItems(fields?.MediaItems),
    searchConfig: adaptSearchConfig(fields?.SearchConfig),
    headingLayout: params?.HeadingLayout,
    headingSize: params?.HeadingSize,
    headingPlacement: params?.HeadingPlacement,
    columns: parseIntOr(params?.Columns, 4),
    gap: oneOf(params?.Gap, GRID_GAP_VALUES, "md"),
    captionStyle: params?.CaptionStyle,
    contentPlacement: oneOf(
      params?.ContentPlacement,
      ["above", "center"] as const,
      "above",
    ),
    arcSpread: oneOf(params?.ArcSpread, ["tight", "wide"] as const, "wide"),
    lightbox: parseBool(params?.Lightbox),
    lightboxEmbedPost: parseBool(params?.LightboxEmbedPost),
    ...adaptSectionSurfaceParams(params),
    emptyStateMessage: params?.EmptyStateMessage,
    id: params?.RenderingIdentifier,
    className: params?.styles,
  };
}

export const Default = adaptWallProps;
export const Mosaic = adaptWallProps;
export const Collage = adaptWallProps;
export const Arc = adaptWallProps;
