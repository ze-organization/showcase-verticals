import { cn } from "@/lib/registry/cn";
import { isEnabled } from "@/lib/registry/param-parsers";
import {
  resolveSectionSurfaceClass,
  type SectionBackgroundIntensity,
  type SectionColorScheme,
} from "@/lib/registry/section-surface";
import { type CmsProps, Placeholder } from "@/lib/registry/sitecore";

/**
 * Flat props delivered by `withSitecore`'s default convention:
 *   - `params.ColumnCount`          → `columnCount`     (`2`..`6` — the DESKTOP column count)
 *   - `params.Distribution`         → `distribution`    (preset width pattern, applies at desktop)
 *   - `params.Gap`                  → `gap`             (`gap@1` enum)
 *   - `params.Position`             → `position`        (`position@1` enum)
 *   - `params.MaxWidth`             → `maxWidth`        (`max-width@1` enum)
 *   - `params.Alignment`            → `alignment`       (`alignment@1` enum)
 *   - `params.MobileColumns` / `TabletColumns` / `LaptopColumns`
 *                                   → per-breakpoint collapse counts
 *   - `params.DynamicPlaceholderId` → `dynamicPlaceholderId`
 */
export interface ColumnSplitterProps extends CmsProps {
  /**
   * How many column slots to render — this IS the desktop (1280px+)
   * column count. There is no separate DesktopColumns axis: picking
   * 3 columns means 3 columns on desktop, and the smaller breakpoints
   * (`laptopColumns` / `tabletColumns` / `mobileColumns`) define how
   * the layout collapses below that.
   */
  columnCount?: "2" | "3" | "4" | "5" | "6" | 2 | 3 | 4 | 5 | 6;
  /**
   * Named width distribution across the columns **at desktop**. Each
   * preset is a twelfths split derived from `columnCount`:
   *
   *   even            2 → 6/6      3 → 4/4/4    4 → 3/3/3/3 …
   *   sidebar-start   2 → 3/9      3 → 2/5/5
   *   sidebar-end     2 → 9/3      3 → 5/5/2
   *   primary-start   2 → 8/4      3 → 6/3/3
   *   primary-center  2 → 6/6      3 → 3/6/3
   *   primary-end     2 → 4/8      3 → 3/3/6
   *
   * Defaults to `even`. Sidebar / primary-* presets only apply for
   * 2- or 3-column splits; 4+ columns fall back to even.
   * Below desktop the breakpoints render uniform tracks — a 3-column
   * distribution pattern has no meaning on a 2-track collapse.
   */
  distribution?:
    | "even"
    | "sidebar-start"
    | "sidebar-end"
    | "primary-start"
    | "primary-center"
    | "primary-end";
  /** Space between columns. Defaults to `md`. */
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
   * Per-placement digit suffix SXA injects when the rendering is
   * marked `IsRenderingsWithDynamicPlaceholders=true`. Concatenated
   * per-column to build `column-<n>-<id>` so the SDK's
   * `^column-<n>-\d+$` pattern matches.
   */
  dynamicPlaceholderId?: string;
  /**
   * Collapse counts for the sub-desktop breakpoints. Desktop always
   * renders `columnCount` columns (with the Distribution pattern);
   * these dial how the layout folds below 1280px. Every value is
   * clamped to `columnCount` at runtime — a 2-column splitter never
   * renders 3 empty tracks because the laptop pick says 3. An unset
   * pick falls back to the collapse chain: mobile → 1, tablet →
   * inherit mobile, laptop → `columnCount`.
   */
  /**
   * Render a hairline divider between adjacent slots — horizontal
   * rules while the layout is stacked, vertical rules while every
   * column sits on one row. Breakpoints where the grid wraps
   * (1 < tracks < ColumnCount) draw no divider: a wrapped grid has
   * no single "between" edge to rule. Checkbox-style boolean.
   */
  showDividers?: string | boolean;
  mobileColumns?: BreakpointColumns;
  tabletColumns?: BreakpointColumns;
  laptopColumns?: BreakpointColumns;
}

type BreakpointColumns = "1" | "2" | "3" | "4" | "5" | "6";

// Per-breakpoint grid-cols mappings. Statically literal so tailwind
// JIT actually emits the classes. Breakpoints: mobile <640px, tablet
// sm:640–1023px, laptop lg:1024–1279px; desktop (xl:1280px+) always
// renders the 12-col distribution grid — see the root className.
const MOBILE_COLS: Record<string, string> = {
  "1": "grid-cols-1",
  "2": "grid-cols-2",
  "3": "grid-cols-3",
  "4": "grid-cols-4",
  "5": "grid-cols-5",
  "6": "grid-cols-6",
};
const TABLET_COLS: Record<string, string> = {
  "1": "sm:grid-cols-1",
  "2": "sm:grid-cols-2",
  "3": "sm:grid-cols-3",
  "4": "sm:grid-cols-4",
  "5": "sm:grid-cols-5",
  "6": "sm:grid-cols-6",
};
const LAPTOP_COLS: Record<string, string> = {
  "1": "lg:grid-cols-1",
  "2": "lg:grid-cols-2",
  "3": "lg:grid-cols-3",
  "4": "lg:grid-cols-4",
  "5": "lg:grid-cols-5",
  "6": "lg:grid-cols-6",
};

// Background/surface resolution is delegated to the shared
// section-surface vocabulary (`resolveSectionSurfaceClass`) — the same
// mapping ListingSection and SectionWrapper use, so the shells can't
// drift.

type ColumnCount = 2 | 3 | 4 | 5 | 6;
type Distribution = NonNullable<ColumnSplitterProps["distribution"]>;

// Even-split twelfths for each supported column count. Imperfect
// divisions of 12 (5 → 2.4 each) round to the nearest integer pattern
// that still sums to 12: 5 → [3,2,2,2,3] (slightly wider ends).
// Authors who need pixel-exact splits reach for the `styles` param.
const EVEN_WIDTHS: Record<ColumnCount, readonly number[]> = {
  2: [6, 6],
  3: [4, 4, 4],
  4: [3, 3, 3, 3],
  5: [3, 2, 2, 2, 3],
  6: [2, 2, 2, 2, 2, 2],
};

const DISTRIBUTION_WIDTHS: Record<
  Distribution,
  Record<ColumnCount, readonly number[]>
> = {
  even: EVEN_WIDTHS,
  // Sidebar / primary-* presets only have opinionated splits for 2- or
  // 3-column layouts. 4+ columns fall back to the even split — the
  // sidebar/primary metaphors don't extend cleanly to wider grids.
  "sidebar-start": {
    2: [3, 9],
    3: [2, 5, 5],
    4: EVEN_WIDTHS[4],
    5: EVEN_WIDTHS[5],
    6: EVEN_WIDTHS[6],
  },
  "sidebar-end": {
    2: [9, 3],
    3: [5, 5, 2],
    4: EVEN_WIDTHS[4],
    5: EVEN_WIDTHS[5],
    6: EVEN_WIDTHS[6],
  },
  "primary-start": {
    2: [8, 4],
    3: [6, 3, 3],
    4: EVEN_WIDTHS[4],
    5: EVEN_WIDTHS[5],
    6: EVEN_WIDTHS[6],
  },
  // 2-col `primary-center` is meaningless (no middle column); cascade
  // to `even` rather than rejecting the combination.
  "primary-center": {
    2: [6, 6],
    3: [3, 6, 3],
    4: EVEN_WIDTHS[4],
    5: EVEN_WIDTHS[5],
    6: EVEN_WIDTHS[6],
  },
  "primary-end": {
    2: [4, 8],
    3: [3, 3, 6],
    4: EVEN_WIDTHS[4],
    5: EVEN_WIDTHS[5],
    6: EVEN_WIDTHS[6],
  },
};

// Distribution spans apply ONLY at desktop (xl), where the grid is
// always the 12-column track. Below xl the layout renders uniform
// `grid-cols-N` tracks, so per-child spans there would fight the
// track count: a span wider than the track count forces the child onto
// its own row. Keeping the spans xl-scoped makes that structurally
// impossible.
const DESKTOP_COL_SPAN: Record<number, string> = {
  1: "xl:col-span-1",
  2: "xl:col-span-2",
  3: "xl:col-span-3",
  4: "xl:col-span-4",
  5: "xl:col-span-5",
  6: "xl:col-span-6",
  7: "xl:col-span-7",
  8: "xl:col-span-8",
  9: "xl:col-span-9",
  10: "xl:col-span-10",
  11: "xl:col-span-11",
  12: "xl:col-span-12",
};

const GAP_CLASSES: Record<NonNullable<ColumnSplitterProps["gap"]>, string> = {
  none: "gap-0",
  sm: "gap-2 md:gap-3",
  md: "gap-6 md:gap-8",
  lg: "gap-8 md:gap-10",
  xl: "gap-10 md:gap-12",
};

// Mirrors container.tsx PADDING_Y_CLASSES.
const PADDING_Y_CLASSES: Record<
  NonNullable<ColumnSplitterProps["paddingY"]>,
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
  NonNullable<ColumnSplitterProps["position"]>,
  string
> = {
  inline: "",
  "sticky-top": "sticky top-0 z-40",
  "sticky-bottom": "sticky bottom-0 z-40",
};

const MAX_WIDTH_CLASSES: Record<
  NonNullable<ColumnSplitterProps["maxWidth"]>,
  string
> = {
  // Tailwind v4 dropped `max-w-screen-*`; use pixel caps so standard /
  // wide actually constrain. See container.tsx for the full rationale.
  narrow: "max-w-[640px]",
  standard: "max-w-[896px]",
  wide: "max-w-[1280px]",
  full: "max-w-none",
};

const ALIGNMENT_CLASSES: Record<
  NonNullable<ColumnSplitterProps["alignment"]>,
  string
> = {
  start: "me-auto",
  center: "mx-auto",
  end: "ms-auto",
};

function resolveColumnCount(
  raw: ColumnSplitterProps["columnCount"],
): ColumnCount {
  if (raw === 2 || raw === "2") return 2;
  if (raw === 3 || raw === "3") return 3;
  if (raw === 4 || raw === "4") return 4;
  if (raw === 5 || raw === "5") return 5;
  if (raw === 6 || raw === "6") return 6;
  return 2;
}

/**
 * Resolve a sub-desktop breakpoint pick to an effective track count,
 * clamped to the splitter's column count — never more tracks than
 * there are column slots (empty tracks read as broken spacing).
 * Returns `undefined` for an unset pick so the caller can apply the
 * breakpoint's own inherit rule.
 */
function clampBreakpoint(
  raw: BreakpointColumns | undefined,
  count: ColumnCount,
): number | undefined {
  if (raw == null) return undefined;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1) return undefined;
  return Math.min(n, count);
}

// ShowDividers class fragments per breakpoint. Literal strings so
// Tailwind JIT emits them; `-0` variants cancel the previous
// breakpoint's orientation when the layout changes shape. divide-x
// maps to border-inline in Tailwind v4, so vertical rules stay
// RTL-correct.
const DIVIDER_BASE: Record<"stack" | "row" | "wrap", string> = {
  stack: "divide-y divide-border",
  row: "divide-x divide-border",
  wrap: "divide-border",
};
const DIVIDER_SM: Record<"stack" | "row" | "wrap", string> = {
  stack: "sm:divide-x-0 sm:divide-y",
  row: "sm:divide-x sm:divide-y-0",
  wrap: "sm:divide-x-0 sm:divide-y-0",
};
const DIVIDER_LG: Record<"stack" | "row" | "wrap", string> = {
  stack: "lg:divide-x-0 lg:divide-y",
  row: "lg:divide-x lg:divide-y-0",
  wrap: "lg:divide-x-0 lg:divide-y-0",
};
// Desktop always renders every column on the single 12-col row.
const DIVIDER_XL = "xl:divide-x xl:divide-y-0";

function dividerShape(
  tracks: number,
  count: ColumnCount,
): "stack" | "row" | "wrap" {
  if (tracks === 1) return "stack";
  if (tracks >= count) return "row";
  return "wrap";
}

/**
 * N-column splitter exposing one permissive placeholder per column.
 *
 * **Shape.** `ColumnCount` (2–6) is the DESKTOP column count; a named
 * `Distribution` preset shapes the relative widths at that size. The
 * component derives twelfths widths and emits one
 * `<Placeholder name="column-<n>-<id>" />` per slot.
 *
 * **Responsive model.** Desktop (1280px+) always renders `ColumnCount`
 * columns on the 12-col distribution grid. The three sub-desktop
 * params define the collapse: `LaptopColumns` (1024–1279),
 * `TabletColumns` (640–1023), `MobileColumns` (<640) — each a plain
 * uniform track count, clamped to `ColumnCount`. E.g. ColumnCount 3 +
 * laptop 2 / tablet 2 / mobile 1 → 3-across desktop, 2-across from
 * tablet through laptop, stacked on phones. Gap and Distribution keep
 * working in every combination (Distribution is desktop-only by
 * design — its patterns are defined per column count).
 *
 * **Shared vocabulary.** Position, MaxWidth, Alignment, and Gap follow
 * the same shared-enum convention as Container.
 *
 * Exported as `ColumnSplitterPresentation` for unit tests and as
 * `Default` for the Sitecore component map.
 */
export function ColumnSplitterPresentation({
  id,
  styles,
  columnCount,
  distribution = "even",
  gap = "md",
  position = "inline",
  maxWidth = "full",
  alignment = "start",
  colorScheme,
  backgroundIntensity = "subtle",
  paddingY = "none",
  showDividers,
  mobileColumns,
  tabletColumns,
  laptopColumns,
  dynamicPlaceholderId,
  rendering,
}: ColumnSplitterProps) {
  // `default` and `none` both resolve to the transparent surface.
  const backgroundColor = colorScheme ?? "default";

  const count = resolveColumnCount(columnCount);
  const widths = DISTRIBUTION_WIDTHS[distribution][count];
  const phSuffix = dynamicPlaceholderId ?? "1";
  const isConstrained = maxWidth !== "full";

  // Sub-desktop collapse chain. An unset pick stacks on mobile (1),
  // inherits mobile on tablet (emits no sm: class), and shows the full
  // column count on laptop.
  const mobile = clampBreakpoint(mobileColumns, count) ?? 1;
  const tablet = clampBreakpoint(tabletColumns, count);
  const laptop = clampBreakpoint(laptopColumns, count) ?? count;

  const dividersOn = isEnabled(showDividers);
  const dividerClasses = dividersOn
    ? [
        DIVIDER_BASE[dividerShape(mobile, count)],
        // Tablet inherits mobile's shape when unset — no sm: fragment
        // needed; the base orientation carries through.
        tablet != null && DIVIDER_SM[dividerShape(tablet, count)],
        DIVIDER_LG[dividerShape(laptop, count)],
        DIVIDER_XL,
      ]
    : null;

  return (
    <div
      className={cn(
        // `items-stretch` (the grid default) keeps every column row
        // the height of the tallest sibling — load-bearing for the
        // children-stretch contract below.
        "component column-splitter grid w-full min-w-0 items-stretch",
        // Collapse chain: uniform tracks per breakpoint below desktop…
        MOBILE_COLS[String(mobile)],
        tablet != null && TABLET_COLS[String(tablet)],
        LAPTOP_COLS[String(laptop)],
        // …and the canonical 12-col distribution grid at desktop.
        // Viewport-based so the divide happens at actual screen-size
        // breakpoints regardless of how wide the splitter's own
        // container is.
        "xl:grid-cols-12",
        dividerClasses,
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
      {widths.map((span, index) => {
        const columnNum = String(index + 1);
        return (
          <div
            key={columnNum}
            className={cn(
              // `h-full` makes each column fill its grid row (whose
              // height = the tallest sibling). `flex flex-col` +
              // `*:h-full` propagates that height down to the single
              // child rendering each placeholder hosts so a pair of
              // Cards in a Column Splitter both grow to the height
              // of the taller one — without this, each card sized to
              // its own content and shorter columns left empty space
              // below their content.
              "flex h-full min-h-24 w-full min-w-0 flex-col *:h-full",
              DESKTOP_COL_SPAN[span],
            )}
          >
            {rendering ? (
              <Placeholder
                name={`column-${columnNum}-${phSuffix}`}
                rendering={rendering}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export { ColumnSplitterPresentation as Default };

/**
 * `universal` opts this file into BOTH the server and client
 * component maps the SDK generates (component-map.ts +
 * component-map.client.ts). Server-only by default would land
 * here in the server map alone, which means Sitecore Pages chrome
 * (browser-side) cannot look the component up and its named-export
 * variants fail to resolve. No runtime behaviour change: the file
 * stays a plain RSC server component; the universal marker is purely
 * a generate-map signal.
 */
export const componentType = "universal";
