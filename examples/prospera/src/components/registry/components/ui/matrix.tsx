import { Badge } from "@/components/registry/primitives/core/badge";
import { Card } from "@/components/registry/primitives/core/card";
import { LibraryIcon } from "@/components/registry/primitives/core/library-icon";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/registry/primitives/core/table";
import {
  TypographyH3,
  TypographyMuted,
  TypographySmall,
} from "@/components/registry/primitives/core/typography";
import {
  Text,
  type TextSource,
} from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import type { CmsProps } from "@/lib/registry/sitecore";

/**
 * How a column renders its cells. Set per-column based on the column
 * template the author chose (`matrix-column-text@1` → `text`,
 * `matrix-column-icon@1` → `icon`, `matrix-column-number@1` → `number`).
 */
export type MatrixDisplayType = "text" | "icon" | "number";

/**
 * For icon-typed columns, the per-cell icon choice.
 *   - `check`   ✓ rendered in success color
 *   - `cross`   ✗ rendered in destructive color
 *   - `dash`    — muted neutral
 *   - `none`    nothing rendered (visual absence)
 */
export type MatrixIconType = "check" | "cross" | "dash" | "none";

export type MatrixColumn = {
  id: string;
  /** Column heading shown at the top of the column. */
  heading: TextSource;
  /** Optional secondary heading text under the heading. */
  subtitle?: TextSource;
  /** Optional badge label shown in the column heading. */
  badge?: TextSource;
  description?: TextSource;
  /**
   * Cell render mode for every row in this column.
   *   - `text`   string
   *   - `icon`   MatrixIconType
   *   - `number` number (locale-formatted at render)
   */
  displayType: MatrixDisplayType;
};

export type MatrixRow = {
  id: string;
  label: TextSource;
  /**
   * Cell values keyed by `MatrixColumn.id`. Type varies by the
   * owning column's `displayType`:
   *   - `text`   string
   *   - `icon`   `MatrixIconType` ("check" / "cross" / "dash" / "none")
   *   - `number` number
   */
  values: Record<string, string | number | MatrixIconType | null | undefined>;
};

const COLOR_SCHEMES = [
  // `none` = unbranded surface: transparent header band, plain
  // foreground badge. Lets authors pin a data-density treatment to
  // pages that already drive their own accent palette.
  "none",
  "neutral",
  "primary",
  "secondary",
  "tertiary",
  "accent",
  "accent-2",
  "accent-3",
  "success",
  "warning",
  "destructive",
] as const;
type ColorScheme = (typeof COLOR_SCHEMES)[number];

const DENSITIES = ["compact", "default", "comfortable", "spacious"] as const;
type Density = (typeof DENSITIES)[number];

const SIZES = ["sm", "md", "lg"] as const;
type Size = (typeof SIZES)[number];

export interface MatrixProps extends CmsProps {
  title?: TextSource;
  description?: TextSource;
  /**
   * Heading shown above the leftmost column (the column that lists
   * row labels). Recipe default `"Aspects"`; per-instance override
   * via the matrix datasource.
   */
  aspectsLabel?: TextSource;
  columns?: MatrixColumn[];
  rows?: MatrixRow[];
  /** Even widths or one column twice as wide. */
  columnLayout?: "even" | "expand-one";
  /** Column id to expand when columnLayout is "expand-one". */
  expandedColumnId?: string;
  /**
   * Vertical padding density on cells + header. Tighter = more rows
   * visible at once; spacious = easier scan.
   */
  density?: Density;
  /** Overall typography + minimum table width. */
  size?: Size;
  /**
   * Accent color scheme for the header band AND the heading badge.
   * Both move together so the badge reads as part of the band.
   */
  colorScheme?: ColorScheme;
  /**
   * Alternate-row background for readability on wide matrices.
   * Accepts Sitecore string booleans.
   */
  zebraRows?: string | boolean;
}

function isEnabled(value: string | boolean | undefined): boolean {
  if (typeof value === "boolean") return value;
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return ["1", "true", "yes", "on", "enabled"].includes(normalized);
}

const HEADER_BG_BY_SCHEME: Record<ColorScheme, string> = {
  none: "",
  neutral: "bg-muted",
  primary: "bg-primary-background",
  secondary: "bg-secondary-background",
  tertiary: "bg-tertiary-background",
  accent: "bg-accent-background",
  "accent-2": "bg-accent-2-background",
  "accent-3": "bg-accent-3-background",
  success: "bg-success-background",
  warning: "bg-warning-background",
  destructive: "bg-destructive-background",
};

/**
 * Badge color per scheme. Picks a tint that reads against the header
 * band rather than the page background, so the badge feels integral
 * to the heading row.
 */
const BADGE_CLASS_BY_SCHEME: Record<ColorScheme, string> = {
  none: "border-foreground/20 bg-transparent text-foreground",
  neutral: "border-foreground/20 bg-background/70 text-foreground",
  primary: "border-primary/40 bg-primary text-primary-foreground",
  secondary: "border-secondary/40 bg-secondary text-secondary-foreground",
  tertiary: "border-tertiary/40 bg-tertiary text-tertiary-foreground",
  accent: "border-accent/40 bg-accent text-accent-foreground",
  "accent-2": "border-accent-2/40 bg-accent-2 text-accent-2-foreground",
  "accent-3": "border-accent-3/40 bg-accent-3 text-accent-3-foreground",
  success: "border-success/40 bg-success text-success-foreground",
  warning: "border-warning/40 bg-warning text-warning-foreground",
  destructive:
    "border-destructive/40 bg-destructive text-destructive-foreground",
};

const resolveColorScheme = (scheme: string | undefined): ColorScheme => {
  if (scheme && (COLOR_SCHEMES as readonly string[]).includes(scheme)) {
    return scheme as ColorScheme;
  }
  return "neutral";
};

const resolveDensity = (value: string | undefined): Density => {
  if (value && (DENSITIES as readonly string[]).includes(value)) {
    return value as Density;
  }
  return "default";
};

const resolveSize = (value: string | undefined): Size => {
  if (value && (SIZES as readonly string[]).includes(value)) {
    return value as Size;
  }
  return "md";
};

/**
 * Cell + header padding tokens keyed on density. Header is always one
 * notch denser than the body so the heading band stays distinct.
 */
const DENSITY_CELL_CLASS: Record<Density, string> = {
  compact: "px-2 py-1.5",
  default: "px-3 py-2.5",
  comfortable: "px-4 py-3.5",
  spacious: "px-5 py-5",
};
const DENSITY_HEAD_CLASS: Record<Density, string> = {
  compact: "px-2 py-2",
  default: "px-3 py-3",
  comfortable: "px-4 py-4",
  spacious: "px-5 py-6",
};

/**
 * Size tokens. Drive the table's min-width (so wide matrices keep
 * their layout on phones) AND the body text size. Heading still uses
 * the section h3 token — only body/cell text scales.
 */
const SIZE_TABLE_CLASS: Record<Size, string> = {
  sm: "min-w-[480px] text-xs",
  md: "min-w-[640px] text-sm",
  lg: "min-w-[800px] text-base",
};
const SIZE_TITLE_CLASS: Record<Size, string> = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
};

const defaultColumns: MatrixColumn[] = [
  {
    id: "baseline",
    heading: "Baseline",
    subtitle: "Core setup",
    displayType: "text",
  },
  {
    id: "recommended",
    heading: "Recommended",
    subtitle: "Most teams",
    badge: "Popular",
    displayType: "text",
  },
  {
    id: "advanced",
    heading: "Advanced",
    subtitle: "Scaled orgs",
    displayType: "icon",
  },
];

const defaultRows: MatrixRow[] = [
  {
    id: "ownership",
    label: "Ownership model",
    values: {
      baseline: "Single team",
      recommended: "Cross-functional",
      advanced: "check",
    },
  },
  {
    id: "automation",
    label: "Automation",
    values: {
      baseline: "Manual",
      recommended: "Scheduled",
      advanced: "check",
    },
  },
  {
    id: "review-cycle",
    label: "Review cycle",
    values: {
      baseline: "Quarterly",
      recommended: "Monthly",
      advanced: "check",
    },
  },
];

const ICON_SPEC: Record<
  Exclude<MatrixIconType, "none">,
  { name: string; color: string; srLabel: string }
> = {
  check: { name: "check", color: "text-success", srLabel: "Yes" },
  cross: { name: "x", color: "text-destructive", srLabel: "No" },
  dash: { name: "minus", color: "text-muted-foreground", srLabel: "N/A" },
};

const renderCellValue = (
  displayType: MatrixDisplayType,
  value: MatrixRow["values"][string],
  iconSize: number,
) => {
  if (displayType === "icon") {
    if (value == null || value === "none") return null;
    const iconType = value as MatrixIconType;
    const spec = ICON_SPEC[iconType as Exclude<MatrixIconType, "none">];
    if (!spec) return null;
    return (
      <span className="inline-flex items-center justify-center">
        <LibraryIcon
          name={spec.name}
          size={iconSize}
          className={spec.color}
          aria-hidden
        />
        <span className="sr-only">{spec.srLabel}</span>
      </span>
    );
  }
  if (displayType === "number") {
    if (value == null || value === "") {
      return <span className="text-muted-foreground">-</span>;
    }
    const num = typeof value === "number" ? value : Number(value);
    if (Number.isNaN(num)) return String(value);
    return num.toLocaleString();
  }
  // text
  if (value == null || value === "") {
    return <span className="text-muted-foreground">-</span>;
  }
  // Sitecore-shaped text cell — the adapter projects the field value
  // out as a plain string already (see matrix.sitecore.ts), so simple
  // String() rendering is fine here. Editability for the *cell value*
  // is the matrix-editor's job, not this component's.
  return String(value);
};

const ICON_PX_BY_SIZE: Record<Size, number> = { sm: 16, md: 20, lg: 24 };

/**
 * Generic non-commerce matrix for comparing options, approaches, or capabilities.
 */
export const Matrix = ({
  title = "Comparison matrix",
  description = "Compare approaches across common aspects.",
  aspectsLabel = "Aspects",
  columns = defaultColumns,
  rows = defaultRows,
  columnLayout = "even",
  expandedColumnId,
  density,
  size,
  colorScheme,
  zebraRows,
  id,
  styles,
  isEditing,
}: MatrixProps) => {
  const scheme = resolveColorScheme(colorScheme);
  const headerBg = HEADER_BG_BY_SCHEME[scheme];
  const badgeClass = BADGE_CLASS_BY_SCHEME[scheme];
  const densityValue = resolveDensity(
    typeof density === "string" ? density : undefined,
  );
  const sizeValue = resolveSize(typeof size === "string" ? size : undefined);
  const zebraEnabled = isEnabled(zebraRows);
  const cellPad = DENSITY_CELL_CLASS[densityValue];
  const headPad = DENSITY_HEAD_CLASS[densityValue];
  const tableClass = SIZE_TABLE_CLASS[sizeValue];
  const titleClass = SIZE_TITLE_CLASS[sizeValue];
  const iconPx = ICON_PX_BY_SIZE[sizeValue];

  // Compute column widths once. Using <colgroup> so the table-fixed
  // layout has authoritative widths to enforce — inline width on <th>
  // alone gets overridden in some browsers when content is wider than
  // the declared percentage.
  const aspectsUnits = 1;
  const columnUnits = columns.map((column) =>
    columnLayout === "expand-one" && expandedColumnId === column.id ? 2 : 1,
  );
  const totalUnits =
    aspectsUnits + columnUnits.reduce((sum, unit) => sum + unit, 0);
  const aspectsWidth = `${(aspectsUnits / totalUnits) * 100}%`;
  const columnWidths = columnUnits.map(
    (unit) => `${(unit / totalUnits) * 100}%`,
  );

  return (
    <Card
      id={id}
      padding="md"
      className={cn(
        // Transparent shell — matrix lives inside section/page chrome
        // that already provides the background.
        "gap-6 border-transparent bg-transparent shadow-none",
        styles?.trimEnd(),
      )}
    >
      <div className="space-y-2">
        <TypographyH3 className={titleClass}>
          <Text
            tag="span"
            value={title}
            placeholder="Matrix title"
            isEditing={isEditing}
          />
        </TypographyH3>
        <TypographyMuted className="text-sm">
          <Text
            tag="span"
            value={description}
            placeholder="Short subhead under the title"
            isEditing={isEditing}
          />
        </TypographyMuted>
      </div>

      <div className="overflow-x-auto">
        <Table className={cn(tableClass, "table-fixed")}>
          <caption className="sr-only">
            <Text tag="span" value={title} isEditing={false} />
          </caption>
          <colgroup>
            <col style={{ width: aspectsWidth }} />
            {columns.map((column, idx) => (
              <col
                key={column.id}
                style={{ width: columnWidths[idx] ?? `${100 / totalUnits}%` }}
              />
            ))}
          </colgroup>
          <TableHeader>
            <TableRow className={headerBg}>
              <TableHead className={cn(headPad, "align-top")}>
                <Text
                  tag="span"
                  value={aspectsLabel}
                  placeholder="Aspects column heading"
                  isEditing={isEditing}
                />
              </TableHead>
              {columns.map((column) => (
                <TableHead key={column.id} className={cn(headPad, "align-top")}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 space-y-1">
                      <TypographySmall className="font-semibold">
                        <Text
                          tag="span"
                          value={column.heading}
                          placeholder="Column heading"
                          isEditing={isEditing}
                        />
                      </TypographySmall>
                      {column.subtitle ? (
                        <TypographyMuted className="text-xs">
                          <Text
                            tag="span"
                            value={column.subtitle}
                            isEditing={isEditing}
                          />
                        </TypographyMuted>
                      ) : column.description ? (
                        <TypographyMuted className="text-xs">
                          <Text
                            tag="span"
                            value={column.description}
                            isEditing={isEditing}
                          />
                        </TypographyMuted>
                      ) : null}
                    </div>
                    {column.badge ? (
                      <Badge
                        variant="outline"
                        className={cn("shrink-0 text-xs", badgeClass)}
                      >
                        <Text
                          tag="span"
                          value={column.badge}
                          isEditing={isEditing}
                        />
                      </Badge>
                    ) : null}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow
                key={row.id}
                className={cn(
                  zebraEnabled && rowIndex % 2 === 1 && "bg-muted/40",
                )}
              >
                <TableCell className={cn(cellPad, "font-medium")}>
                  <Text
                    tag="span"
                    value={row.label}
                    placeholder="Row label"
                    isEditing={isEditing}
                  />
                </TableCell>
                {columns.map((column) => (
                  <TableCell
                    key={`${row.id}-${column.id}`}
                    className={cn(
                      cellPad,
                      column.displayType === "icon" && "text-center",
                      column.displayType === "number" &&
                        "text-end tabular-nums",
                    )}
                  >
                    {renderCellValue(
                      column.displayType,
                      row.values[column.id],
                      iconPx,
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default Matrix;

/**
 * Sitecore default variant. Aliases `Matrix` so the SDK's variant
 * lookup (`componentMap.get("matrix").Default`) resolves — recipe
 * declares `variants: [{ name: "Default" }]`.
 */
export const Default = Matrix;

export const componentType = "universal";
