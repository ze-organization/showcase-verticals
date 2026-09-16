/**
 * Sitecore adapter for `quick-links-tiles`. Unwraps the Sitecore
 * `{ fields, params }` payload into the flat props the React rendering
 * consumes, and normalises the curated `Tiles` Treelist into
 * `QuickLinkTile[]` via the component's own `normalizeQuickLinkTiles`.
 *
 * The `Tiles` entries may arrive in ANY of the linked-item shapes —
 * raw nested `{id, fields: {…}}` envelopes (installed starters whose
 * regenerated map lacks `flattenLinkedItems`), hoisted PascalCase
 * fields (post-flatten or inlined by a composed design), and any of
 * the three source templates the treelist accepts (`quick-link-tile@1`,
 * `link-item@1`, or a page item carrying its `url`). The shared
 * normalizer reads them all — see `QuickLinkTileEntry` in
 * `./quick-links-tiles.tsx` for the shape catalogue and precedence.
 *
 * The same adapter fans out to every variant export (Default / Row /
 * CtaBand) so `withSitecore` applies it uniformly — mirrors the
 * pattern in `versus-list.sitecore.ts`.
 */
import type { TextSource } from "@/components/registry/primitives/editables/text";
import {
  isSurfaceTone,
  type SurfaceTone,
} from "@/lib/registry/color-scheme-classes";
import { parseSectionPaddingY } from "@/lib/registry/section-surface";
import {
  normalizeQuickLinkTiles,
  QUICK_LINK_GRID_GAP_VALUES,
  QUICK_LINK_MAX_WIDTH_VALUES,
  QUICK_LINK_TILE_ASPECT_VALUES,
  QUICK_LINK_TILE_SIZE_VALUES,
  type QuickLinkGridGap,
  type QuickLinkMaxWidth,
  type QuickLinksTilesProps,
  type QuickLinkTileAspect,
  type QuickLinkTileEntry,
  type QuickLinkTileSize,
} from "./quick-links-tiles";

interface SitecoreQuickLinksTilesFields {
  Title?: TextSource;
  Lead?: TextSource;
  Tiles?: QuickLinkTileEntry[];
}

interface SitecoreQuickLinksTilesParams {
  Columns?: string;
  TileAspect?: string;
  Gap?: string;
  TileSize?: string;
  MaxWidth?: string;
  ColorScheme?: string;
  PaddingY?: string;
  RenderingIdentifier?: string;
  styles?: string;
}

const toSurfaceTone = (value: string | undefined): SurfaceTone => {
  const raw = value?.trim().toLowerCase() ?? "";
  return isSurfaceTone(raw) ? raw : "none";
};

const toColumns = (value: string | undefined): 3 | 4 => {
  const n = Number.parseInt((value ?? "").trim(), 10);
  return n === 3 ? 3 : 4;
};

const oneOf = <T extends string>(
  value: string | undefined,
  allowed: readonly T[],
  fallback: T,
): T => {
  const normalized = value?.trim().toLowerCase() as T | undefined;
  return normalized && allowed.includes(normalized) ? normalized : fallback;
};

function adaptTiles(
  tiles: QuickLinkTileEntry[] | undefined,
): QuickLinkTileEntry[] {
  if (!tiles?.length) return [];
  // Full shape resolution lives in the component's shared normalizer
  // (hoists nested envelopes, resolves quick-link-tile / link-item /
  // page field precedence, canonicalizes IconName). Adapting here too
  // keeps the adapter output a plain tile contract for consumers that
  // read the props directly; the component re-normalizing is a no-op.
  return normalizeQuickLinkTiles(tiles).map((tile, i) => ({
    ...tile,
    id: tile.id ?? `tile-${i}`,
  }));
}

export function adaptQuickLinksTilesProps({
  fields,
  params,
}: {
  fields?: SitecoreQuickLinksTilesFields;
  params?: SitecoreQuickLinksTilesParams;
}): QuickLinksTilesProps {
  return {
    title: fields?.Title,
    lead: fields?.Lead,
    tiles: adaptTiles(fields?.Tiles),
    columns: toColumns(params?.Columns),
    tileAspect: oneOf<QuickLinkTileAspect>(
      params?.TileAspect,
      QUICK_LINK_TILE_ASPECT_VALUES,
      "auto",
    ),
    gap: oneOf<QuickLinkGridGap>(params?.Gap, QUICK_LINK_GRID_GAP_VALUES, "md"),
    tileSize: oneOf<QuickLinkTileSize>(
      params?.TileSize,
      QUICK_LINK_TILE_SIZE_VALUES,
      "default",
    ),
    maxWidth: oneOf<QuickLinkMaxWidth>(
      params?.MaxWidth,
      QUICK_LINK_MAX_WIDTH_VALUES,
      "full",
    ),
    surfaceTone: toSurfaceTone(params?.ColorScheme),
    paddingY: parseSectionPaddingY(params?.PaddingY),
    id: params?.RenderingIdentifier,
    styles: params?.styles,
  };
}

export const Default = adaptQuickLinksTilesProps;
export const Row = adaptQuickLinksTilesProps;
export const CtaBand = adaptQuickLinksTilesProps;
