import { cn } from "@/lib/registry/cn";
import { isEnabled } from "@/lib/registry/param-parsers";
import {
  resolveSectionSurfaceClass,
  type SectionBackgroundIntensity,
  type SectionColorScheme,
} from "@/lib/registry/section-surface";
import { type CmsProps, Placeholder } from "@/lib/registry/sitecore";

/** The number of row slots that can be enabled. SXA convention is 1..8. */
const MAX_ROWS = 8;

/**
 * Flat props delivered by `withSitecore`'s default convention:
 *   - `params.RowCount`             → `rowCount`   (`row-count@1` enum)
 *   - `params.Gap`                  → `gap`        (`gap@1` enum)
 *   - `params.Position`             → `position`   (`position@1` enum)
 *   - `params.MaxWidth`             → `maxWidth`   (`max-width@1` enum)
 *   - `params.Alignment`            → `alignment`  (`alignment@1` enum)
 *   - `params.DynamicPlaceholderId` → `dynamicPlaceholderId`
 */
export interface RowSplitterProps extends CmsProps {
  /**
   * Number of row slots to render (1..8). Renders rows 1..N
   * top-down. Backs the `RowCount` dropdown in Pages chrome —
   * mirrors the column-splitter's `ColumnCount` pattern. Defaults
   * to `2`.
   */
  rowCount?: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8";
  /**
   * Named height distribution across the rows — the vertical analogue
   * of column-splitter's Distribution:
   *
   *   flow           each row is as tall as its content (normal flow)
   *   even           every row matches the tallest row's height
   *   hero-start     first row dominant — 2× the share of the others
   *   hero-end       last row dominant
   *   compact-start  first row hugs its content; the rest share evenly
   *   compact-end    last row hugs its content; the rest share evenly
   *
   * Relative (`fr`) tracks resolve against content in an auto-height
   * grid — no fixed splitter height required: `even` stretches every
   * row to the tallest sibling, `hero-*` gives the featured row twice
   * the ratio (never smaller than its own content), `compact-*` pins a
   * utility band (breadcrumb strip, CTA bar) to its natural height.
   * Defaults to `flow`.
   */
  distribution?:
    | "flow"
    | "even"
    | "hero-start"
    | "hero-end"
    | "compact-start"
    | "compact-end";
  /** Vertical space between rows. Defaults to `md`. */
  gap?: "none" | "sm" | "md" | "lg" | "xl";
  /** See container.tsx — same vertical-placement axis. */
  position?: "inline" | "sticky-top" | "sticky-bottom";
  /** See container.tsx — same width-cap axis. */
  maxWidth?: "narrow" | "standard" | "wide" | "full";
  /** See container.tsx — same horizontal-alignment axis. */
  alignment?: "start" | "center" | "end";
  /** See container.tsx — same surface-fill axis. */
  colorScheme?: SectionColorScheme;
  /** See container.tsx — same background-intensity axis. */
  backgroundIntensity?: SectionBackgroundIntensity;
  /** See container.tsx — same vertical-padding axis. */
  paddingY?: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
  /**
   * Render a hairline divider between adjacent rows — turns a plain
   * stack into visually separated header / body / footer bands (the
   * mobile-nav composition case). Checkbox-style Sitecore boolean.
   */
  showDividers?: string | boolean;
  /**
   * Per-placement digit suffix SXA injects when the rendering is
   * marked `IsRenderingsWithDynamicPlaceholders=true`. Concatenated
   * per-row to build `row-<n>-<id>` so the SDK's `^row-<n>-\d+$`
   * pattern matches.
   */
  dynamicPlaceholderId?: string;
}

// Background/surface resolution is delegated to the shared
// section-surface vocabulary (`resolveSectionSurfaceClass`) — the same
// mapping ListingSection and SectionWrapper use, so the shells can't
// drift. This also retires the local bold map's silent fallback: bold
// now applies to every scheme (white/black/neutral/status/gradients),
// with the `surface-invert` re-toning on dark/bold fills.

const GAP_CLASSES: Record<NonNullable<RowSplitterProps["gap"]>, string> = {
  none: "gap-0",
  sm: "gap-2",
  md: "gap-6",
  lg: "gap-8",
  xl: "gap-12",
};

type RowDistribution = NonNullable<RowSplitterProps["distribution"]>;

// Row-height templates per (distribution × row count). Literal class
// strings so Tailwind JIT emits them. `flow` needs no template (grid
// auto rows size to content); `even` uses auto-rows-fr (every row =
// the tallest). hero-* / compact-* enumerate grid-template-rows per
// count — `2fr`/`1fr` tracks resolve proportionally in an auto-height
// grid but never shrink below their content, and `auto` tracks hug
// content exactly.
const HERO_START_ROWS: Record<number, string> = {
  2: "grid-rows-[2fr_1fr]",
  3: "grid-rows-[2fr_1fr_1fr]",
  4: "grid-rows-[2fr_1fr_1fr_1fr]",
  5: "grid-rows-[2fr_1fr_1fr_1fr_1fr]",
  6: "grid-rows-[2fr_1fr_1fr_1fr_1fr_1fr]",
  7: "grid-rows-[2fr_1fr_1fr_1fr_1fr_1fr_1fr]",
  8: "grid-rows-[2fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr]",
};
const HERO_END_ROWS: Record<number, string> = {
  2: "grid-rows-[1fr_2fr]",
  3: "grid-rows-[1fr_1fr_2fr]",
  4: "grid-rows-[1fr_1fr_1fr_2fr]",
  5: "grid-rows-[1fr_1fr_1fr_1fr_2fr]",
  6: "grid-rows-[1fr_1fr_1fr_1fr_1fr_2fr]",
  7: "grid-rows-[1fr_1fr_1fr_1fr_1fr_1fr_2fr]",
  8: "grid-rows-[1fr_1fr_1fr_1fr_1fr_1fr_1fr_2fr]",
};
const COMPACT_START_ROWS: Record<number, string> = {
  2: "grid-rows-[auto_1fr]",
  3: "grid-rows-[auto_1fr_1fr]",
  4: "grid-rows-[auto_1fr_1fr_1fr]",
  5: "grid-rows-[auto_1fr_1fr_1fr_1fr]",
  6: "grid-rows-[auto_1fr_1fr_1fr_1fr_1fr]",
  7: "grid-rows-[auto_1fr_1fr_1fr_1fr_1fr_1fr]",
  8: "grid-rows-[auto_1fr_1fr_1fr_1fr_1fr_1fr_1fr]",
};
const COMPACT_END_ROWS: Record<number, string> = {
  2: "grid-rows-[1fr_auto]",
  3: "grid-rows-[1fr_1fr_auto]",
  4: "grid-rows-[1fr_1fr_1fr_auto]",
  5: "grid-rows-[1fr_1fr_1fr_1fr_auto]",
  6: "grid-rows-[1fr_1fr_1fr_1fr_1fr_auto]",
  7: "grid-rows-[1fr_1fr_1fr_1fr_1fr_1fr_auto]",
  8: "grid-rows-[1fr_1fr_1fr_1fr_1fr_1fr_1fr_auto]",
};

/** Resolve the distribution's row-template class for `n` rows. */
function rowTemplateClass(
  distribution: RowDistribution,
  n: number,
): string | undefined {
  // A single row has nothing to distribute — every pattern degrades
  // to normal flow.
  if (n < 2) return undefined;
  switch (distribution) {
    case "flow":
      return undefined;
    case "even":
      return "auto-rows-fr";
    case "hero-start":
      return HERO_START_ROWS[n];
    case "hero-end":
      return HERO_END_ROWS[n];
    case "compact-start":
      return COMPACT_START_ROWS[n];
    case "compact-end":
      return COMPACT_END_ROWS[n];
  }
}

// Mirrors container.tsx PADDING_Y_CLASSES. Defaults to `none` so the
// splitter relies on the wrapping section's spacing; authors opt into
// per-splitter padding when nesting.
const PADDING_Y_CLASSES: Record<
  NonNullable<RowSplitterProps["paddingY"]>,
  string
> = {
  none: "py-0",
  sm: "py-4",
  md: "py-8",
  lg: "py-12",
  xl: "py-20",
  "2xl": "py-32",
};

const POSITION_CLASSES: Record<
  NonNullable<RowSplitterProps["position"]>,
  string
> = {
  inline: "",
  "sticky-top": "sticky top-0 z-40",
  "sticky-bottom": "sticky bottom-0 z-40",
};

const MAX_WIDTH_CLASSES: Record<
  NonNullable<RowSplitterProps["maxWidth"]>,
  string
> = {
  // Tailwind v4 dropped `max-w-screen-*`; pixel caps so standard /
  // wide actually constrain. See container.tsx.
  narrow: "max-w-[640px]",
  standard: "max-w-[896px]",
  wide: "max-w-[1280px]",
  full: "max-w-none",
};

const ALIGNMENT_CLASSES: Record<
  NonNullable<RowSplitterProps["alignment"]>,
  string
> = {
  start: "me-auto",
  center: "mx-auto",
  end: "ms-auto",
};

/**
 * Vertical splitter exposing up to 8 permissive row slots
 * (`row-1-{*}` ... `row-8-{*}`). Authors enable a subset via the
 * `EnabledPlaceholders` param (comma-separated indices); each enabled
 * row becomes a child rendering slot.
 *
 * Indices outside the 1–8 range, non-numeric entries, and duplicate
 * indices are silently skipped — the param is author-editable freeform
 * text and the splitter must degrade gracefully on bad input.
 *
 * Shares the section-shell vocabulary (Position, MaxWidth, Alignment,
 * Gap) with Container and ColumnSplitter; each axis carries the
 * component's natural setting as its default.
 */
export function RowSplitterPresentation({
  id,
  styles,
  rowCount = "2",
  distribution = "flow",
  gap = "md",
  position = "inline",
  maxWidth = "full",
  alignment = "start",
  colorScheme,
  backgroundIntensity = "subtle",
  paddingY = "none",
  showDividers,
  dynamicPlaceholderId,
  rendering,
}: RowSplitterProps) {
  // `default` and `none` both resolve to the transparent surface.
  const backgroundColor = colorScheme ?? "default";

  // `rowCount` always renders a contiguous 1..N range.
  const n = Math.max(1, Math.min(MAX_ROWS, Number(rowCount) || 2));
  const enabledRows: number[] = Array.from({ length: n }, (_, i) => i + 1);
  const phSuffix = dynamicPlaceholderId ?? "1";
  const isConstrained = maxWidth !== "full";

  return (
    <div
      className={cn(
        // Single-column grid (one track per row). Grid instead of
        // flex-col so the Distribution row templates (fr/auto tracks)
        // can shape relative row heights; `flow` emits no template and
        // renders exactly like the old flex column.
        "grid w-full grid-cols-1",
        rowTemplateClass(distribution, n),
        // Hairline between adjacent rows (divide-y skips the first
        // child) — separated header / body / footer bands, e.g. a
        // mobile-nav drawer composition.
        isEnabled(showDividers) && "divide-y divide-border",
        GAP_CLASSES[gap],
        PADDING_Y_CLASSES[paddingY],
        POSITION_CLASSES[position],
        MAX_WIDTH_CLASSES[maxWidth],
        isConstrained && ALIGNMENT_CLASSES[alignment],
        resolveSectionSurfaceClass(backgroundColor, backgroundIntensity),
        styles,
      )}
      id={id}
    >
      {enabledRows.map((row) => (
        <div key={row} className="w-full">
          {rendering ? (
            <Placeholder
              name={`row-${row}-${phSuffix}`}
              rendering={rendering}
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}

export { RowSplitterPresentation as Default };

/**
 * `universal` opts this file into BOTH the server and client
 * component maps the SDK generates (component-map.ts +
 * component-map.client.ts). Server-only by default would land
 * here in the server map alone, which means Sitecore Pages chrome
 * (browser-side) cannot look the component up and its named-export
 * variants (Headless, Media, etc.) fail to resolve. No runtime
 * behaviour change: the file stays a plain RSC server component
 * (no useState, no client-only hooks here); the universal marker
 * is purely a generate-map signal.
 */
export const componentType = "universal";
