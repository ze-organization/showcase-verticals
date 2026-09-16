/**
 * Sitecore adapter for the stats family. Unwraps Sitecore field
 * objects into the flat-prop shapes the React renderings consume.
 *
 * Three rendering targets: `StatsListGrid`, `StatsCarousel`, and
 * `StatsSearchExperience`. All three share the same datasource
 * template, so a single set of adapters fans out to all of them.
 */

import type { TextSource } from "@/components/registry/primitives/editables/text";
import { linkedItemFields } from "@/lib/registry/placeholder-children";
import type { SearchConfig } from "@/lib/registry/search/types";
import { adaptSectionSurfaceParams } from "@/lib/registry/section-surface";
import type { Field } from "@/lib/registry/sitecore";
import { adaptCardChromeParams } from "./_card-chrome-adapter";
import {
  GRID_GAP_VALUES,
  parseFeaturedFirst,
  parseGridPattern,
} from "./_grid-classname";
import type { StatFlatItem } from "./stats-list-grid";

/**
 * Raw shape of a stat Sitecore item under `fields.Stats`. Treelist
 * items resolve to this when curated; placeholder mode bypasses this
 * entirely (children render as Sitecore placeholders).
 */
export interface SitecoreStatItem {
  id: string;
  displayName?: string;
  name?: string;
  url?: string;
  fields?: {
    Label?: Field<string>;
    Value?: Field<string>;
    Change?: Field<string>;
    Trend?: Field<string>;
    Context?: Field<string>;
  };
}

export interface SitecoreStatsFields {
  /** Optional kicker line above the title (small-caps eyebrow). */
  Eyebrow?: TextSource;
  Title?: TextSource;
  Lead?: TextSource;
  Stats?: SitecoreStatItem[];
  SearchConfig?: Field<string>;
}

export interface SitecoreStatsParams {
  CardAlign?: string;
  TrendDisplay?: string;
  Tone?: string;
  ValueSize?: string;
  LabelCase?: string;
  ShowLabel?: string;
  /** `stat-emphasis@1` — FlankedLabels/Milestones (value / label). */
  Emphasis?: string;
  /**
   * Milestones only — checkbox for vertical hairlines between cells
   * (divide-x pattern). Off by default via Sitecore Standard Values.
   */
  ShowDividers?: string;

  /** Curated-mode chrome pass-through (CARD_STYLING_PARAMS). */
  Elevation?: string;
  Padding?: string;
  Style?: string;
  CardColorScheme?: string;
  ColorBand?: string;
  MediaBleed?: string;
  MediaAspect?: string;
  TileAspect?: string;
  CtaPlacement?: string;

  /** Layout. */
  HeadingLayout?: string;
  HeadingSize?: string;
  /**
   * `band-heading-placement@1` — heading above the items (default) or
   * inline in the band's leading cell/column (Milestones + carousel).
   */
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

export function adaptStatItems(
  items: SitecoreStatItem[] | undefined,
): StatFlatItem[] {
  if (!items?.length) return [];
  return items.map((item) => {
    // Hoist-tolerant: installed starters can deliver linked items with
    // `fields` already flattened onto the item (see linkedItemFields).
    const fields = linkedItemFields(item);
    return {
      id: item.id,
      title: fields?.Label?.value,
      href: item.url,
      extras: {
        label: fields?.Label,
        value: fields?.Value,
        change: fields?.Change,
        trend: fields?.Trend,
        context: fields?.Context,
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

// The style enum matches `card-style@1` and the StatsCard prop; the
// "inner" flat-tile treatment is the StatsCard `Inner` variant
// (style=flat/elevation=none/padding=sm), not a style value here.
const ALLOWED_CARD_STYLES = ["flat", "outline", "filled", "elevated"] as const;
const ALLOWED_ELEVATIONS = ["theme", "none", "xs", "sm", "md", "lg"] as const;
const ALLOWED_PADDINGS = ["sm", "md", "lg"] as const;
const ALLOWED_ALIGNS = ["start", "center"] as const;
const ALLOWED_TREND_DISPLAYS = ["badge", "text", "none"] as const;
const ALLOWED_TONES = [
  "default",
  "neutral",
  "primary",
  "success",
  "warning",
] as const;
const ALLOWED_VALUE_SIZES = ["default", "large", "xlarge"] as const;
const ALLOWED_LABEL_CASES = ["default", "uppercase"] as const;
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

// Like `oneOf` but with no fallback: unset/invalid stays `undefined`.
// Used where "author explicitly picked a value" is itself a signal —
// the Milestones band draws its band-level card only on an explicit
// Style pick, and StatsCard's own effective defaults (outline/theme/md)
// cover the unset case identically.
const oneOfOptional = <T extends string>(
  value: string | undefined,
  allowed: readonly T[],
): T | undefined => {
  const normalized = value?.trim().toLowerCase() as T | undefined;
  return normalized && allowed.includes(normalized) ? normalized : undefined;
};

function adaptCardThemeOptions(params?: SitecoreStatsParams) {
  return {
    // Shared chrome params (Style/Elevation/Padding, from
    // CARD_STYLING_PARAMS) drive the StatsCard axes. `style` has no
    // adapter fallback on purpose: unset flows through as undefined
    // (StatsCard still defaults to outline) so Milestones can treat an
    // explicit pick as the band-as-card opt-in.
    style: oneOfOptional(params?.Style, ALLOWED_CARD_STYLES),
    elevation: oneOf(params?.Elevation, ALLOWED_ELEVATIONS, "theme"),
    padding: oneOf(params?.Padding, ALLOWED_PADDINGS, "md"),
    align: oneOf(params?.CardAlign, ALLOWED_ALIGNS, "start"),
    trendDisplay: oneOf(params?.TrendDisplay, ALLOWED_TREND_DISPLAYS, "badge"),
    tone: oneOf(params?.Tone, ALLOWED_TONES, "default"),
    valueSize: oneOf(params?.ValueSize, ALLOWED_VALUE_SIZES, "default"),
    labelCase: oneOf(params?.LabelCase, ALLOWED_LABEL_CASES, "default"),
    // No React-side default for boolean param — Sitecore drives the
    // initial state via Standard Values.
    showLabel:
      params?.ShowLabel === undefined ? undefined : parseBool(params.ShowLabel),
  };
}

/**
 * `stat-emphasis@1` — LIST-GRID ONLY.
 *
 * Emphasis picks which slot dominates in a flanked layout, and only the
 * grid ships one: its `FlankedLabels` / `Milestones` variants read it,
 * as does the leaf `FlankedLabel` export. The carousel renders the
 * default `StatsCard`, which has no flank to invert — so it neither
 * declares the param nor reads it here. Folding this back into
 * `adaptCardThemeOptions` would make the carousel's adapter read a
 * param no author can set on it.
 *
 * Raw string through — `parseStatEmphasis` normalizes downstream
 * (unknown/empty collapses to `value`).
 */
function adaptStatEmphasis(params?: SitecoreStatsParams) {
  return { emphasis: params?.Emphasis };
}

export function adaptListGridProps({
  fields,
  params,
}: {
  fields?: SitecoreStatsFields;
  params?: SitecoreStatsParams;
}) {
  return {
    title: fields?.Title,
    lead: fields?.Lead,
    eyebrow: fields?.Eyebrow,
    items: adaptStatItems(fields?.Stats),
    searchConfig: adaptSearchConfig(fields?.SearchConfig),
    headingLayout: params?.HeadingLayout,
    headingSize: params?.HeadingSize,
    // Milestones-only band knobs (raw pass-through; the component
    // parses via parseBandHeadingPlacement / isEnabled and the other
    // variants ignore them).
    headingPlacement: params?.HeadingPlacement,
    showDividers: params?.ShowDividers,
    ...adaptCardChromeParams(params),
    ...adaptCardThemeOptions(params),
    ...adaptStatEmphasis(params),
    columnsLg: parseIntOr(params?.ColumnsLg, 4),
    columnsMd: parseIntOr(params?.ColumnsMd, 2),
    columnsSm: parseIntOr(params?.ColumnsSm, 1),
    gap: oneOf(params?.Gap, GRID_GAP_VALUES, "md"),
    featuredFirst: parseFeaturedFirst(params?.FeaturedFirst),
    gridPattern: parseGridPattern(params?.GridPattern),
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
  fields?: SitecoreStatsFields;
  params?: SitecoreStatsParams;
}) {
  return {
    title: fields?.Title,
    lead: fields?.Lead,
    eyebrow: fields?.Eyebrow,
    items: adaptStatItems(fields?.Stats),
    searchConfig: adaptSearchConfig(fields?.SearchConfig),
    headingLayout: params?.HeadingLayout,
    headingSize: params?.HeadingSize,
    headingPlacement: params?.HeadingPlacement,
    ...adaptCardChromeParams(params),
    ...adaptCardThemeOptions(params),
    slideEmphasis: params?.SlideEmphasis,
    slidesPerViewLg: parseNumberOr(params?.SlidesPerViewLg, 4),
    slidesPerViewMd: parseNumberOr(params?.SlidesPerViewMd, 2),
    slidesPerViewSm: parseNumberOr(params?.SlidesPerViewSm, 1),
    spaceBetween: parseIntOr(params?.SpaceBetween, 16),
    // No React-side default for Sitecore boolean params — undefined
    // means "Sitecore Standard Values drives it".
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
    ...adaptSectionSurfaceParams(params),
    emptyStateMessage: params?.EmptyStateMessage,
    id: params?.RenderingIdentifier,
    className: params?.styles,
  };
}
