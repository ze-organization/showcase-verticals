/**
 * Sitecore adapter for `status-list`. Unwraps the Sitecore
 * `{ fields, params }` payload into the flat props the React rendering
 * consumes, and normalises the curated `Statuses` Treelist (flattened
 * by the component map) into `StatusListItem[]`.
 *
 * The same adapter fans out to every variant export (Default / Grid /
 * List) so `withSitecore` applies it uniformly — mirrors the pattern in
 * `stats-list-grid.sitecore.ts`.
 */
import type { LinkSource } from "@/components/registry/primitives/editables/link";
import type { TextSource } from "@/components/registry/primitives/editables/text";
import { linkedItemFields } from "@/lib/registry/placeholder-children";
import { adaptSectionSurfaceParams } from "@/lib/registry/section-surface";
import type { Field } from "@/lib/registry/sitecore";
import {
  GRID_GAP_VALUES,
  type GridGap,
  parseFeaturedFirst,
  parseGridPattern,
} from "./_grid-classname";
import type {
  StatusListItem,
  StatusListProps,
  StatusTone,
} from "./status-list";

interface SitecoreStatusItem {
  id: string;
  url?: string;
  fields?: {
    Subject?: TextSource;
    SubjectType?: TextSource;
    Status?: TextSource;
    StatusTone?: Field<string>;
    Value?: TextSource;
    Unit?: TextSource;
    MetricLabel?: TextSource;
    Link?: LinkSource;
  };
}

interface SitecoreStatusListFields {
  Title?: TextSource;
  Lead?: TextSource;
  Statuses?: SitecoreStatusItem[];
}

interface SitecoreStatusListParams {
  /** Heading axis (shared card-list base params). */
  HeadingLayout?: string;
  HeadingSize?: string;

  ColumnsLg?: string;
  ColumnsMd?: string;
  ColumnsSm?: string;
  Gap?: string;
  /** Grid rhythm — `Grid` variant only. */
  FeaturedFirst?: string;
  GridPattern?: string;
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

const STATUS_TONES: readonly StatusTone[] = [
  "neutral",
  "info",
  "success",
  "warning",
  "destructive",
];

function toTone(field: Field<string> | undefined): StatusTone {
  const raw = field?.value?.trim().toLowerCase() as StatusTone | undefined;
  return raw && STATUS_TONES.includes(raw) ? raw : "neutral";
}

function adaptItems(items: SitecoreStatusItem[] | undefined): StatusListItem[] {
  if (!items?.length) return [];
  return items.map((item, i) => {
    // Hoist-tolerant: installed starters can deliver linked items with
    // `fields` already flattened onto the item (see linkedItemFields).
    const fields = linkedItemFields(item);
    return {
      id: item.id ?? `status-${i}`,
      subject: fields?.Subject,
      subjectType: fields?.SubjectType,
      status: fields?.Status,
      statusTone: toTone(fields?.StatusTone),
      value: fields?.Value,
      unit: fields?.Unit,
      metricLabel: fields?.MetricLabel,
      link: fields?.Link,
    };
  });
}

const parseIntOr = (value: string | undefined, fallback: number) => {
  const n = Number.parseInt((value ?? "").trim(), 10);
  return Number.isFinite(n) ? n : fallback;
};

const oneOfGap = (value: string | undefined): GridGap => {
  const v = value?.trim().toLowerCase() as GridGap | undefined;
  return v && GRID_GAP_VALUES.includes(v) ? v : "md";
};

export function adaptStatusListProps({
  fields,
  params,
}: {
  fields?: SitecoreStatusListFields;
  params?: SitecoreStatusListParams;
}): StatusListProps {
  return {
    title: fields?.Title,
    lead: fields?.Lead,
    items: adaptItems(fields?.Statuses),
    // Raw pass-through — the component parses via `resolveListingHeading`,
    // matching the sibling list-grid/carousel adapters.
    headingLayout: params?.HeadingLayout,
    headingSize: params?.HeadingSize,
    columnsLg: parseIntOr(params?.ColumnsLg, 4),
    columnsMd: parseIntOr(params?.ColumnsMd, 2),
    columnsSm: parseIntOr(params?.ColumnsSm, 1),
    gap: oneOfGap(params?.Gap),
    featuredFirst: parseFeaturedFirst(params?.FeaturedFirst),
    gridPattern: parseGridPattern(params?.GridPattern),
    ...adaptSectionSurfaceParams(params),
    emptyStateMessage: params?.EmptyStateMessage,
    id: params?.RenderingIdentifier,
    className: params?.styles,
  };
}

export const Default = adaptStatusListProps;
export const Grid = adaptStatusListProps;
export const List = adaptStatusListProps;
