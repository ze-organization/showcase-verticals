import type { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/registry/primitives/core/table";
import {
  TypographyH2,
  TypographyMuted,
} from "@/components/registry/primitives/core/typography";
import {
  type ImageSource,
  NextImage,
} from "@/components/registry/primitives/editables/image";
import {
  getSourceText,
  isEmptySource,
} from "@/components/registry/primitives/editables/source-normalizers";
import {
  Text,
  type TextSource,
} from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import {
  type SurfaceTone,
  surfaceToneClass,
} from "@/lib/registry/color-scheme-classes";
import {
  SECTION_PADDING_Y_CLASSES,
  type SectionPaddingY,
} from "@/lib/registry/section-surface";
import type { CmsProps } from "@/lib/registry/sitecore";

/**
 * `ranking-table` — a generic data table for ranked entities.
 *
 * Each row has a **rank**, an optional **movement** indicator (up /
 * down / steady + places moved), an optional **badge image** (crest,
 * logo, avatar), a **name**, an optional **secondary label** (a
 * category, group, or region), up to six **numeric stat columns**
 * (headers configured on the parent), and an emphasised **total**
 * column. It serves league standings, world rankings, leaderboards,
 * sales/branch performance tables, top-10 charts — the entity and the
 * stats are deliberately un-opinionated.
 *
 * Two rendering shapes share one body:
 *   - `Default` → the full table with every configured column.
 *   - `Compact` → rank / badge / name / total only, for sidebars.
 *
 * "Highlight zones" paint the top N and/or bottom N rows with a soft
 * semantic tone (e.g. success for a qualification zone, destructive
 * for a relegation/at-risk zone) — generic zone striping, not a
 * sports-specific concept.
 *
 * Curated items flow via the `Rows` Treelist (flattened by the
 * component map); the file stays runnable with plain values so it
 * previews without a Sitecore payload.
 */

export type RankingMovement = "up" | "down" | "steady";

/** Soft tone painted on highlight-zone rows. `none` disables the zone. */
export type RankingZoneTone =
  | "none"
  | "primary"
  | "success"
  | "info"
  | "warning"
  | "destructive";

export interface RankingRowItem {
  id?: string;
  /** Rank number, e.g. "1". */
  rank?: TextSource;
  /** Movement direction versus the previous period. */
  movement?: TextSource;
  /** Places moved, e.g. "2". Shown next to the movement arrow. */
  movementPlaces?: TextSource;
  /** Small badge / crest / logo image shown before the name. */
  badge?: ImageSource;
  /** Entity name — a team, a person, a product, a branch. */
  name?: TextSource;
  /** Optional secondary label under the name (e.g. a group or region). */
  secondaryLabel?: TextSource;
  /**
   * Numeric stat values, index-aligned with the parent's `statLabels`.
   * Only indexes whose parent label is non-empty render.
   */
  stats?: (TextSource | undefined)[];
  /** Emphasised total / points value for the last column. */
  total?: TextSource;
}

export type RankingPanelStyle = "card" | "flat";

export interface RankingTableProps extends CmsProps {
  title?: TextSource;
  lead?: TextSource;
  items?: RankingRowItem[];
  /**
   * Column headers for the numeric stat columns (up to six). A column
   * renders only when its label has text, so the parent datasource
   * controls column visibility.
   */
  statLabels?: (TextSource | undefined)[];
  /** Header for the emphasised total column. */
  totalLabel?: TextSource;
  /** Header for the name column. */
  nameLabel?: TextSource;
  /** Render the movement (up/down/steady) column. */
  showMovement?: boolean;
  /** Render the badge image column. */
  showBadge?: boolean;
  /** Render the secondary label under each name. */
  showSecondaryLabel?: boolean;
  /** Paint the first N rows with the top-zone tone. */
  highlightTopCount?: number;
  highlightTopTone?: RankingZoneTone;
  /** Paint the last N rows with the bottom-zone tone. */
  highlightBottomCount?: number;
  highlightBottomTone?: RankingZoneTone;
  /** Row density. */
  density?: "compact" | "comfortable";
  /** Background tone of the section. */
  surfaceTone?: SurfaceTone;
  /**
   * Chrome around the table (`panel-style@1`): `card` (default) wraps
   * rows in a bordered elevated panel; `flat` drops border/bg/shadow so
   * rows sit directly on the section surface.
   */
  panelStyle?: RankingPanelStyle;
  /** Vertical padding around the section (`padding-y@1`). */
  paddingY?: SectionPaddingY;
  className?: string;
}

const MOVEMENTS: readonly RankingMovement[] = ["up", "down", "steady"];

function resolveMovement(value: TextSource | undefined): RankingMovement {
  const raw = getSourceText(value)?.trim().toLowerCase() as
    | RankingMovement
    | undefined;
  return raw && MOVEMENTS.includes(raw) ? raw : "steady";
}

/**
 * Soft-surface zone classes per the color-roles contract: soft role
 * surface = `bg-<X>-background` + `text-<X>` on the accent cell.
 * Each zone carries `surface-tinted` (globals.css) so the row's muted
 * secondary labels / steady indicators re-derive from the zone color
 * instead of clashing gray-on-tint.
 */
const ZONE_ROW_CLASS: Record<RankingZoneTone, string> = {
  none: "",
  primary:
    "bg-primary-background/60 surface-tinted [--surface-tint:var(--color-primary)]",
  success:
    "bg-success-background/60 surface-tinted [--surface-tint:var(--color-success)]",
  info: "bg-info-background/60 surface-tinted [--surface-tint:var(--color-info)]",
  warning:
    "bg-warning-background/60 surface-tinted [--surface-tint:var(--color-warning)]",
  destructive:
    "bg-destructive-background/60 surface-tinted [--surface-tint:var(--color-destructive)]",
};

const ZONE_RANK_CLASS: Record<RankingZoneTone, string> = {
  none: "",
  primary: "text-primary",
  success: "text-success",
  info: "text-info",
  warning: "text-warning",
  destructive: "text-destructive",
};

const MOVEMENT_CLASS: Record<RankingMovement, string> = {
  up: "text-success",
  down: "text-destructive",
  steady: "text-muted-foreground",
};

const MOVEMENT_GLYPH: Record<RankingMovement, string> = {
  up: "▲",
  down: "▼",
  steady: "–",
};

function MovementIndicator({
  movement,
  places,
  isEditing,
}: {
  movement?: TextSource;
  places?: TextSource;
  isEditing?: boolean;
}) {
  const resolved = resolveMovement(movement);
  const placesText = getSourceText(places);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 font-medium text-xs tabular-nums",
        MOVEMENT_CLASS[resolved],
      )}
      data-movement={resolved}
    >
      <span aria-hidden="true">{MOVEMENT_GLYPH[resolved]}</span>
      {resolved !== "steady" && placesText ? (
        <Text value={places} tag="span" isEditing={isEditing} />
      ) : null}
      <span className="sr-only">
        {resolved === "up"
          ? `Up ${placesText ?? ""}`
          : resolved === "down"
            ? `Down ${placesText ?? ""}`
            : "No change"}
      </span>
    </span>
  );
}

function RowBadge({
  badge,
  isEditing,
}: {
  badge?: ImageSource;
  isEditing?: boolean;
}) {
  if (!badge || isEmptySource(badge)) return null;
  return (
    <NextImage
      value={badge}
      width={28}
      height={28}
      className="size-7 shrink-0 rounded-full object-contain"
      isEditing={isEditing}
    />
  );
}

/** Zone tone for a row by position, or `none` when outside both zones. */
function zoneForIndex(
  index: number,
  count: number,
  topCount: number,
  topTone: RankingZoneTone,
  bottomCount: number,
  bottomTone: RankingZoneTone,
): RankingZoneTone {
  if (topCount > 0 && index < topCount) return topTone;
  if (bottomCount > 0 && index >= count - bottomCount) return bottomTone;
  return "none";
}

function RankingTableSection({
  title,
  lead,
  surfaceTone = "none",
  paddingY = "auto",
  id,
  styles,
  className,
  isEditing,
  children,
}: {
  title?: TextSource;
  lead?: TextSource;
  surfaceTone?: SurfaceTone;
  paddingY?: SectionPaddingY;
  id?: string;
  styles?: string;
  className?: string;
  isEditing?: boolean;
  children: ReactNode;
}) {
  const hasHeading =
    (title && getSourceText(title)) || (lead && getSourceText(lead));
  return (
    <section
      className={cn(
        "component ranking-table w-full",
        // `auto` (recipe default) → the section's natural responsive
        // ramp; a concrete token takes over.
        paddingY === "auto"
          ? "py-12 md:py-16"
          : SECTION_PADDING_Y_CLASSES[paddingY],
        surfaceToneClass(surfaceTone),
        className,
        styles?.trimEnd(),
      )}
      id={id ?? undefined}
      data-slot="ranking-table"
    >
      <div className="container mx-auto flex flex-col gap-8 px-4">
        {hasHeading ? (
          <div className="flex flex-col gap-2">
            {title && getSourceText(title) ? (
              <TypographyH2 className="font-heading tracking-tight">
                <Text value={title} tag="span" isEditing={isEditing} />
              </TypographyH2>
            ) : null}
            {lead && getSourceText(lead) ? (
              <TypographyMuted className="max-w-2xl text-pretty text-lg">
                <Text value={lead} tag="span" isEditing={isEditing} />
              </TypographyMuted>
            ) : null}
          </div>
        ) : null}
        {children}
      </div>
    </section>
  );
}

type RankingLayout = "full" | "compact";

function RankingTableBase({
  layout,
  title,
  lead,
  items = [],
  statLabels = [],
  totalLabel,
  nameLabel,
  showMovement = true,
  showBadge = true,
  showSecondaryLabel = false,
  highlightTopCount = 0,
  highlightTopTone = "success",
  highlightBottomCount = 0,
  highlightBottomTone = "destructive",
  density = "comfortable",
  surfaceTone = "none",
  panelStyle = "card",
  paddingY,
  className,
  id,
  styles,
  isEditing,
}: RankingTableProps & { layout: RankingLayout }) {
  const compactLayout = layout === "compact";
  // Stat columns render only where the parent supplied a header label;
  // the compact layout drops them entirely (rank / name / total only).
  const visibleStatIndexes = compactLayout
    ? []
    : statLabels
        .map((label, index) => ({ label, index }))
        .filter(({ label }) => Boolean(label && getSourceText(label)))
        .map(({ index }) => index);
  const showMovementColumn = showMovement && !compactLayout;
  const cellPadding = density === "compact" ? "py-1.5" : "py-3";

  return (
    <RankingTableSection
      title={title}
      lead={lead}
      surfaceTone={surfaceTone}
      paddingY={paddingY}
      id={id}
      styles={styles}
      className={className}
      isEditing={isEditing}
    >
      <div
        className={cn(
          "overflow-hidden",
          panelStyle === "card" &&
            "rounded-(--card-radius,var(--radius-xl)) border border-border bg-card text-card-foreground shadow-sm",
        )}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center" scope="col">
                #
              </TableHead>
              {showMovementColumn ? (
                <TableHead className="w-10" scope="col">
                  <span className="sr-only">Movement</span>
                </TableHead>
              ) : null}
              <TableHead scope="col">
                {nameLabel && getSourceText(nameLabel) ? (
                  <Text value={nameLabel} tag="span" isEditing={isEditing} />
                ) : (
                  "Name"
                )}
              </TableHead>
              {visibleStatIndexes.map((statIndex) => (
                <TableHead
                  key={`stat-head-${statIndex}`}
                  className="text-center tabular-nums"
                  scope="col"
                >
                  <Text
                    value={statLabels[statIndex]}
                    tag="span"
                    isEditing={isEditing}
                  />
                </TableHead>
              ))}
              <TableHead className="text-end font-semibold" scope="col">
                {totalLabel && getSourceText(totalLabel) ? (
                  <Text value={totalLabel} tag="span" isEditing={isEditing} />
                ) : (
                  "Total"
                )}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => {
              const zone = zoneForIndex(
                index,
                items.length,
                highlightTopCount,
                highlightTopTone,
                highlightBottomCount,
                highlightBottomTone,
              );
              return (
                <TableRow
                  key={item.id ?? `rank-${index}`}
                  className={ZONE_ROW_CLASS[zone]}
                  data-zone={zone === "none" ? undefined : zone}
                >
                  <TableCell
                    className={cn(
                      "text-center font-semibold tabular-nums",
                      cellPadding,
                      ZONE_RANK_CLASS[zone],
                    )}
                  >
                    <Text value={item.rank} tag="span" isEditing={isEditing} />
                  </TableCell>
                  {showMovementColumn ? (
                    <TableCell className={cellPadding}>
                      <MovementIndicator
                        movement={item.movement}
                        places={item.movementPlaces}
                        isEditing={isEditing}
                      />
                    </TableCell>
                  ) : null}
                  <TableCell className={cn("min-w-0", cellPadding)}>
                    <span className="flex items-center gap-2.5">
                      {showBadge ? (
                        <RowBadge badge={item.badge} isEditing={isEditing} />
                      ) : null}
                      <span className="min-w-0">
                        <span className="block truncate font-medium">
                          <Text
                            value={item.name}
                            tag="span"
                            isEditing={isEditing}
                          />
                        </span>
                        {showSecondaryLabel &&
                        !compactLayout &&
                        item.secondaryLabel &&
                        getSourceText(item.secondaryLabel) ? (
                          <span className="block truncate text-muted-foreground text-xs">
                            <Text
                              value={item.secondaryLabel}
                              tag="span"
                              isEditing={isEditing}
                            />
                          </span>
                        ) : null}
                      </span>
                    </span>
                  </TableCell>
                  {visibleStatIndexes.map((statIndex) => (
                    <TableCell
                      key={`stat-${statIndex}`}
                      className={cn("text-center tabular-nums", cellPadding)}
                    >
                      <Text
                        value={item.stats?.[statIndex]}
                        tag="span"
                        isEditing={isEditing}
                      />
                    </TableCell>
                  ))}
                  <TableCell
                    className={cn(
                      "text-end font-bold tabular-nums",
                      cellPadding,
                    )}
                  >
                    <Text value={item.total} tag="span" isEditing={isEditing} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </RankingTableSection>
  );
}

/** Full table — rank, movement, badge, name, stat columns, total. */
export function Default(props: RankingTableProps) {
  return <RankingTableBase {...props} layout="full" />;
}

/** Rank / badge / name / total only — for sidebars and narrow slots. */
export function Compact(props: RankingTableProps) {
  return <RankingTableBase {...props} layout="compact" />;
}

/**
 * `universal` opts this file into BOTH the server and client component
 * maps the SDK generates. Server-only by default would land it in the
 * server map alone, and Sitecore Pages chrome (browser-side) could not
 * resolve the named-export variants. Purely a generate-map signal.
 */
export const componentType = "universal";
