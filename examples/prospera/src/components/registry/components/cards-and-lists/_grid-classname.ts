import { cn } from "@/lib/registry/cn";

/**
 * Build a responsive grid className with **literal** Tailwind classes
 * so JIT picks them up. The old approach — `grid-cols-${columnsLg}`
 * inside `cn()` — produces template strings that Tailwind's source
 * scanner never sees, so the classes silently fail to generate unless
 * they happen to appear elsewhere in the codebase.
 *
 * Columns are clamped to 1–6 to match the recipe enum and the lookup
 * tables below.
 *
 * Used by every `*-list-grid.tsx`. Centralizing also avoids the per-
 * file duplication the carousel audit found.
 */

type GridCols = 1 | 2 | 3 | 4 | 5 | 6;

const BASE_COLS: Record<GridCols, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
};

const MD_COLS: Record<GridCols, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
  5: "md:grid-cols-5",
  6: "md:grid-cols-6",
};

const LG_COLS: Record<GridCols, string> = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
  6: "lg:grid-cols-6",
};

// Full `gap@1` vocabulary — the same enum backs the splitters'
// Gap param, so the card grids must accept every value the editor
// (and the AI page composer) can legally pick. `md` is the grid's
// natural spacing.
//
// `tight` / `normal` / `loose` are measured-signature aliases for
// `sm` / `md` / `lg`: the orchestrator's grid-signature measurement
// buckets the source's `gapPx` into that vocabulary, so the composer
// can bind the bucket name directly. Alias keys map to the SAME
// literal classes — no new spacing steps, fully compatible with the
// pre-existing values (the round-4 NoSpacing fix relies on every
// class below staying a literal string Tailwind's scanner can see).
const GAP_CLASSES = {
  none: "gap-0",
  sm: "gap-3",
  md: "gap-6",
  lg: "gap-8",
  xl: "gap-12",
  tight: "gap-3",
  normal: "gap-6",
  loose: "gap-8",
} as const;

export type GridGap = keyof typeof GAP_CLASSES;

/** All legal `gap@1` values, for adapter `oneOf` parsing. */
export const GRID_GAP_VALUES = Object.keys(GAP_CLASSES) as readonly GridGap[];

/**
 * `featured-first@1` — editorial "lead tile" treatment. `wide` spans
 * the first tile across two columns; `tall` spans it across two rows
 * (media-led cards stretch to fill via the `h-full` chain). Applied
 * as first-child arbitrary variants on the grid CONTAINER so it works
 * for both curated `<li>` items and composed placeholder children —
 * every class is a literal string for the Tailwind JIT scanner.
 */
export const FEATURED_FIRST_CLASSES = {
  none: "",
  wide: "md:[&>*:first-child]:col-span-2",
  tall: "md:[&>*:first-child]:row-span-2 md:[&>*:first-child>*]:h-full md:[&>*:first-child>*>*]:h-full",
} as const;

export type FeaturedFirst = keyof typeof FEATURED_FIRST_CLASSES;

/** All legal `featured-first@1` values, for adapter `oneOf` parsing. */
export const FEATURED_FIRST_VALUES = Object.keys(
  FEATURED_FIRST_CLASSES,
) as readonly FeaturedFirst[];

/**
 * Parse the raw Sitecore `FeaturedFirst` param (`featured-first@1`).
 * Unknown / empty collapses to `none` — the regular uniform grid.
 */
export function parseFeaturedFirst(value: string | undefined): FeaturedFirst {
  const normalized = value?.trim().toLowerCase() as FeaturedFirst | undefined;
  return normalized && normalized in FEATURED_FIRST_CLASSES
    ? normalized
    : "none";
}

/**
 * `grid-pattern@1` — the overall tile rhythm of the grid.
 *
 *   - `uniform` (default) — every tile is 1×1; `featured-first@1` may
 *     still promote the single first tile.
 *   - `bento` — a repeating asymmetric mosaic with period 6: tile 1 is
 *     a 2×2 hero, tile 4 spans two columns, the rest are 1×1 fillers
 *     packed by dense flow. Reads best at 3–4 columns (the emirates
 *     cabin-class / yas-island attractions "1 large + smalls" look).
 *
 * Like `FEATURED_FIRST_CLASSES`, the spans are applied as nth-child
 * arbitrary variants on the grid CONTAINER — they work for curated
 * `<li>` items and composed placeholder children alike, and every
 * class below stays a literal string for the Tailwind JIT scanner
 * (the file's core discipline — never template-interpolate these).
 * The `h-full` chains stretch media-led cards to fill spanned cells,
 * mirroring the `featured-first` tall treatment.
 *
 * `bento` supersedes `featured-first@1`: the mosaic already defines
 * the lead tile, so `buildGridClassName` ignores `featuredFirst`
 * when a non-uniform pattern is active.
 */
export const GRID_PATTERN_CLASSES = {
  uniform: "",
  bento:
    "md:grid-flow-dense " +
    "md:[&>*:nth-child(6n+1)]:col-span-2 md:[&>*:nth-child(6n+1)]:row-span-2 " +
    "md:[&>*:nth-child(6n+1)>*]:h-full md:[&>*:nth-child(6n+1)>*>*]:h-full " +
    "md:[&>*:nth-child(6n+4)]:col-span-2 " +
    "md:[&>*:nth-child(6n+4)>*]:h-full md:[&>*:nth-child(6n+4)>*>*]:h-full",
} as const;

export type GridPattern = keyof typeof GRID_PATTERN_CLASSES;

/** All legal `grid-pattern@1` values, for adapter `oneOf` parsing. */
export const GRID_PATTERN_VALUES = Object.keys(
  GRID_PATTERN_CLASSES,
) as readonly GridPattern[];

/**
 * Parse the raw Sitecore `GridPattern` param (`grid-pattern@1`).
 * Unknown / empty collapses to `uniform` — the regular grid.
 */
export function parseGridPattern(value: string | undefined): GridPattern {
  const normalized = value?.trim().toLowerCase() as GridPattern | undefined;
  return normalized && normalized in GRID_PATTERN_CLASSES
    ? normalized
    : "uniform";
}

function clampCols(value: number): GridCols {
  return Math.max(1, Math.min(6, Math.floor(value))) as GridCols;
}

export function buildGridClassName({
  columnsSm,
  columnsMd,
  columnsLg,
  gap,
  featuredFirst = "none",
  gridPattern = "uniform",
  className,
}: {
  columnsSm: number;
  columnsMd: number;
  columnsLg: number;
  gap: GridGap;
  /** `featured-first@1` lead-tile treatment. Defaults to `none`. */
  featuredFirst?: FeaturedFirst;
  /** `grid-pattern@1` tile rhythm. Defaults to `uniform`. */
  gridPattern?: GridPattern;
  className?: string;
}): string {
  const isPatterned = gridPattern !== "uniform";
  return cn(
    "grid",
    GAP_CLASSES[gap],
    BASE_COLS[clampCols(columnsSm)],
    MD_COLS[clampCols(columnsMd)],
    LG_COLS[clampCols(columnsLg)],
    // A patterned grid defines its own lead tile — featured-first would
    // double-span the first child, so the pattern wins.
    isPatterned
      ? GRID_PATTERN_CLASSES[gridPattern]
      : FEATURED_FIRST_CLASSES[featuredFirst] || undefined,
    className,
  );
}
