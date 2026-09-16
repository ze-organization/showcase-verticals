/**
 * Sitecore adapter for `search-booking-bar`. Unwraps the Sitecore
 * `{ fields, params }` payload into the flat props the React rendering
 * consumes, and normalises the curated `Segments` Treelist (flattened
 * by the component map) into `SearchBookingSegment[]`.
 *
 * The same adapter fans out to every variant export (Default /
 * Compact) so `withSitecore` applies it uniformly — mirrors the
 * pattern in `versus-list.sitecore.ts`.
 */
import type { LinkSource } from "@/components/registry/primitives/editables/link";
import type { TextSource } from "@/components/registry/primitives/editables/text";
import {
  isSurfaceTone,
  type SurfaceTone,
} from "@/lib/registry/color-scheme-classes";
import { parseSectionPaddingY } from "@/lib/registry/section-surface";
import type { Field } from "@/lib/registry/sitecore";
import type {
  BookingSegmentType,
  SearchBookingBarProps,
  SearchBookingMode,
  SearchBookingSegment,
} from "./search-booking-bar";

interface SitecoreBookingSegment {
  id: string;
  url?: string;
  fields?: {
    Label?: TextSource;
    Placeholder?: TextSource;
    SegmentType?: Field<string>;
  };
}

interface SitecoreBookingMode {
  id: string;
  url?: string;
  fields?: {
    Label?: TextSource;
    Segments?: SitecoreBookingSegment[];
    ActionLabel?: TextSource;
    ActionLink?: LinkSource;
  };
}

interface SitecoreSearchBookingBarFields {
  Title?: TextSource;
  Segments?: SitecoreBookingSegment[];
  /** MultiMode — one search-booking-mode item per tab. */
  Modes?: SitecoreBookingMode[];
  ActionLabel?: TextSource;
  ActionLink?: LinkSource;
}

interface SitecoreSearchBookingBarParams {
  ColorScheme?: string;
  PaddingY?: string;
  RenderingIdentifier?: string;
  styles?: string;
}

const SEGMENT_TYPES: readonly BookingSegmentType[] = ["text", "select", "date"];

function toSegmentType(field: Field<string> | undefined): BookingSegmentType {
  const raw = field?.value?.trim().toLowerCase() as
    | BookingSegmentType
    | undefined;
  return raw && SEGMENT_TYPES.includes(raw) ? raw : "text";
}

const toSurfaceTone = (value: string | undefined): SurfaceTone => {
  const raw = value?.trim().toLowerCase() ?? "";
  return isSurfaceTone(raw) ? raw : "none";
};

function adaptSegments(
  segments: SitecoreBookingSegment[] | undefined,
): SearchBookingSegment[] {
  if (!segments?.length) return [];
  return segments.map((segment, i) => ({
    id: segment.id ?? `segment-${i}`,
    label: segment.fields?.Label,
    placeholder: segment.fields?.Placeholder,
    segmentType: toSegmentType(segment.fields?.SegmentType),
  }));
}

function adaptModes(
  modes: SitecoreBookingMode[] | undefined,
): SearchBookingMode[] {
  if (!modes?.length) return [];
  return modes.map((mode, i) => ({
    id: mode.id ?? `mode-${i}`,
    label: mode.fields?.Label,
    segments: adaptSegments(mode.fields?.Segments),
    actionLabel: mode.fields?.ActionLabel,
    actionLink: mode.fields?.ActionLink,
  }));
}

export function adaptSearchBookingBarProps({
  fields,
  params,
}: {
  fields?: SitecoreSearchBookingBarFields;
  params?: SitecoreSearchBookingBarParams;
}): SearchBookingBarProps {
  return {
    title: fields?.Title,
    segments: adaptSegments(fields?.Segments),
    modes: adaptModes(fields?.Modes),
    actionLabel: fields?.ActionLabel,
    actionLink: fields?.ActionLink,
    surfaceTone: toSurfaceTone(params?.ColorScheme),
    paddingY: parseSectionPaddingY(params?.PaddingY),
    id: params?.RenderingIdentifier,
    styles: params?.styles,
  };
}

export const Default = adaptSearchBookingBarProps;
export const Compact = adaptSearchBookingBarProps;
export const MultiMode = adaptSearchBookingBarProps;
