/**
 * Sitecore adapter for `versus-list`. Unwraps the Sitecore
 * `{ fields, params }` payload into the flat props the React rendering
 * consumes, and normalises the curated `Items` Treelist (flattened by
 * the component map) into `VersusListItem[]`.
 *
 * The same adapter fans out to every variant export (Default / Cards /
 * Ticker) so `withSitecore` applies it uniformly — mirrors the pattern
 * in `status-list.sitecore.ts`.
 */
import type { ImageSource } from "@/components/registry/primitives/editables/image";
import type { LinkSource } from "@/components/registry/primitives/editables/link";
import type { TextSource } from "@/components/registry/primitives/editables/text";
import {
  isSurfaceTone,
  type SurfaceTone,
} from "@/lib/registry/color-scheme-classes";
import { linkedItemFields } from "@/lib/registry/placeholder-children";
import { parseSectionPaddingY } from "@/lib/registry/section-surface";
import type { Field } from "@/lib/registry/sitecore";
import type {
  VersusListItem,
  VersusListProps,
  VersusPanelStyle,
  VersusStatus,
} from "./versus-list";

interface SitecoreVersusItem {
  id: string;
  url?: string;
  fields?: {
    PartyAName?: TextSource;
    PartyABadge?: ImageSource;
    PartyBName?: TextSource;
    PartyBBadge?: ImageSource;
    CenterValue?: TextSource;
    Status?: Field<string>;
    StatusLabel?: TextSource;
    Meta?: TextSource;
    DateLabel?: TextSource;
    Link?: LinkSource;
  };
}

interface SitecoreVersusListFields {
  Title?: TextSource;
  Lead?: TextSource;
  Items?: SitecoreVersusItem[];
}

interface SitecoreVersusListParams {
  GroupByDate?: string;
  Columns?: string;
  ColorScheme?: string;
  PanelStyle?: string;
  PaddingY?: string;
  RenderingIdentifier?: string;
  styles?: string;
}

const STATUSES: readonly VersusStatus[] = ["upcoming", "live", "finished"];

function toStatus(field: Field<string> | undefined): VersusStatus {
  const raw = field?.value?.trim().toLowerCase() as VersusStatus | undefined;
  return raw && STATUSES.includes(raw) ? raw : "upcoming";
}

const toSurfaceTone = (value: string | undefined): SurfaceTone => {
  const raw = value?.trim().toLowerCase() ?? "";
  return isSurfaceTone(raw) ? raw : "none";
};

const toPanelStyle = (value: string | undefined): VersusPanelStyle =>
  value?.trim().toLowerCase() === "flat" ? "flat" : "card";

const parseBool = (value?: string) => value === "1" || value === "true";

const toColumns = (value: string | undefined): 2 | 3 | 4 => {
  const n = Number.parseInt((value ?? "").trim(), 10);
  return n === 2 || n === 4 ? n : 3;
};

function adaptItems(items: SitecoreVersusItem[] | undefined): VersusListItem[] {
  if (!items?.length) return [];
  return items.map((item, i) => {
    // Hoist-tolerant: installed starters can deliver linked items with
    // `fields` already flattened onto the item (see linkedItemFields).
    const fields = linkedItemFields(item);
    return {
      id: item.id ?? `versus-${i}`,
      partyAName: fields?.PartyAName,
      partyABadge: fields?.PartyABadge,
      partyBName: fields?.PartyBName,
      partyBBadge: fields?.PartyBBadge,
      centerValue: fields?.CenterValue,
      status: toStatus(fields?.Status),
      statusLabel: fields?.StatusLabel,
      meta: fields?.Meta,
      dateLabel: fields?.DateLabel,
      link: fields?.Link,
    };
  });
}

export function adaptVersusListProps({
  fields,
  params,
}: {
  fields?: SitecoreVersusListFields;
  params?: SitecoreVersusListParams;
}): VersusListProps {
  return {
    title: fields?.Title,
    lead: fields?.Lead,
    items: adaptItems(fields?.Items),
    // No React-side default for boolean params — undefined means
    // "Sitecore Standard Values drives it"; the component defaults.
    groupByDate:
      params?.GroupByDate === undefined
        ? undefined
        : parseBool(params.GroupByDate),
    columns: toColumns(params?.Columns),
    surfaceTone: toSurfaceTone(params?.ColorScheme),
    panelStyle: toPanelStyle(params?.PanelStyle),
    paddingY: parseSectionPaddingY(params?.PaddingY),
    id: params?.RenderingIdentifier,
    styles: params?.styles,
  };
}

export const Default = adaptVersusListProps;
export const Cards = adaptVersusListProps;
export const Ticker = adaptVersusListProps;
