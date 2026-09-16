/**
 * Sitecore adapter for `ranking-table`. Unwraps the Sitecore
 * `{ fields, params }` payload into the flat props the React rendering
 * consumes, and normalises the curated `Rows` Treelist (flattened by
 * the component map) into `RankingRowItem[]`.
 *
 * The same adapter fans out to both variant exports (Default /
 * Compact) so `withSitecore` applies it uniformly — mirrors the
 * pattern in `status-list.sitecore.ts`.
 */
import type { ImageSource } from "@/components/registry/primitives/editables/image";
import type { TextSource } from "@/components/registry/primitives/editables/text";
import {
  isSurfaceTone,
  type SurfaceTone,
} from "@/lib/registry/color-scheme-classes";
import { linkedItemFields } from "@/lib/registry/placeholder-children";
import { parseSectionPaddingY } from "@/lib/registry/section-surface";
import type {
  RankingPanelStyle,
  RankingRowItem,
  RankingTableProps,
  RankingZoneTone,
} from "./ranking-table";

interface SitecoreRankingRowItem {
  id: string;
  url?: string;
  fields?: {
    Rank?: TextSource;
    Movement?: TextSource;
    MovementPlaces?: TextSource;
    Badge?: ImageSource;
    Name?: TextSource;
    SecondaryLabel?: TextSource;
    Stat1?: TextSource;
    Stat2?: TextSource;
    Stat3?: TextSource;
    Stat4?: TextSource;
    Stat5?: TextSource;
    Stat6?: TextSource;
    Total?: TextSource;
  };
}

interface SitecoreRankingTableFields {
  Title?: TextSource;
  Lead?: TextSource;
  Rows?: SitecoreRankingRowItem[];
  NameLabel?: TextSource;
  Stat1Label?: TextSource;
  Stat2Label?: TextSource;
  Stat3Label?: TextSource;
  Stat4Label?: TextSource;
  Stat5Label?: TextSource;
  Stat6Label?: TextSource;
  TotalLabel?: TextSource;
}

interface SitecoreRankingTableParams {
  ShowMovement?: string;
  ShowBadge?: string;
  ShowSecondaryLabel?: string;
  HighlightTopCount?: string;
  HighlightTopTone?: string;
  HighlightBottomCount?: string;
  HighlightBottomTone?: string;
  Density?: string;
  ColorScheme?: string;
  PanelStyle?: string;
  PaddingY?: string;
  RenderingIdentifier?: string;
  styles?: string;
}

const ZONE_TONES: readonly RankingZoneTone[] = [
  "none",
  "primary",
  "success",
  "info",
  "warning",
  "destructive",
];

const toZoneTone = (
  value: string | undefined,
  fallback: RankingZoneTone,
): RankingZoneTone => {
  const raw = value?.trim().toLowerCase() as RankingZoneTone | undefined;
  return raw && ZONE_TONES.includes(raw) ? raw : fallback;
};

const toSurfaceTone = (value: string | undefined): SurfaceTone => {
  const raw = value?.trim().toLowerCase() ?? "";
  return isSurfaceTone(raw) ? raw : "none";
};

const toPanelStyle = (value: string | undefined): RankingPanelStyle =>
  value?.trim().toLowerCase() === "flat" ? "flat" : "card";

const parseBool = (value?: string) => value === "1" || value === "true";

const parseIntOr = (value: string | undefined, fallback: number) => {
  const n = Number.parseInt((value ?? "").trim(), 10);
  return Number.isFinite(n) ? n : fallback;
};

function adaptRows(
  items: SitecoreRankingRowItem[] | undefined,
): RankingRowItem[] {
  if (!items?.length) return [];
  return items.map((item, i) => {
    // Hoist-tolerant: installed starters can deliver linked items with
    // `fields` already flattened onto the item (see linkedItemFields).
    const fields = linkedItemFields(item);
    return {
      id: item.id ?? `rank-${i}`,
      rank: fields?.Rank,
      movement: fields?.Movement,
      movementPlaces: fields?.MovementPlaces,
      badge: fields?.Badge,
      name: fields?.Name,
      secondaryLabel: fields?.SecondaryLabel,
      stats: [
        fields?.Stat1,
        fields?.Stat2,
        fields?.Stat3,
        fields?.Stat4,
        fields?.Stat5,
        fields?.Stat6,
      ],
      total: fields?.Total,
    };
  });
}

export function adaptRankingTableProps({
  fields,
  params,
}: {
  fields?: SitecoreRankingTableFields;
  params?: SitecoreRankingTableParams;
}): RankingTableProps {
  return {
    title: fields?.Title,
    lead: fields?.Lead,
    items: adaptRows(fields?.Rows),
    nameLabel: fields?.NameLabel,
    statLabels: [
      fields?.Stat1Label,
      fields?.Stat2Label,
      fields?.Stat3Label,
      fields?.Stat4Label,
      fields?.Stat5Label,
      fields?.Stat6Label,
    ],
    totalLabel: fields?.TotalLabel,
    // No React-side default for boolean params — undefined means
    // "Sitecore Standard Values drives it"; the component defaults.
    showMovement:
      params?.ShowMovement === undefined
        ? undefined
        : parseBool(params.ShowMovement),
    showBadge:
      params?.ShowBadge === undefined ? undefined : parseBool(params.ShowBadge),
    showSecondaryLabel:
      params?.ShowSecondaryLabel === undefined
        ? undefined
        : parseBool(params.ShowSecondaryLabel),
    highlightTopCount: parseIntOr(params?.HighlightTopCount, 0),
    highlightTopTone: toZoneTone(params?.HighlightTopTone, "success"),
    highlightBottomCount: parseIntOr(params?.HighlightBottomCount, 0),
    highlightBottomTone: toZoneTone(params?.HighlightBottomTone, "destructive"),
    density:
      params?.Density?.trim().toLowerCase() === "compact"
        ? "compact"
        : "comfortable",
    surfaceTone: toSurfaceTone(params?.ColorScheme),
    panelStyle: toPanelStyle(params?.PanelStyle),
    paddingY: parseSectionPaddingY(params?.PaddingY),
    id: params?.RenderingIdentifier,
    styles: params?.styles,
  };
}

export const Default = adaptRankingTableProps;
export const Compact = adaptRankingTableProps;
