import type {
  MatrixColumn,
  MatrixDisplayType,
  MatrixIconType,
  MatrixProps,
  MatrixRow,
} from "@/components/registry/components/ui/matrix";
import { asArray } from "@/lib/registry/placeholder-children";
import type { Field } from "@/lib/registry/sitecore";
import type { LinkedItem, SitecoreInput } from "@/lib/registry/with-sitecore";

export type { LinkedItem };

/**
 * Layout-service field shapes for `matrix@1` and its companion content
 * templates. Mirrors the recipes in this directory.
 *
 * Authoring model (see `matrix.recipe.ts`):
 *   - Rows (`matrix-row@1`)             carry just a label.
 *   - Columns                           three specialized templates:
 *                                       text / icon / number. Each
 *                                       owns a `Cells` Treelist of the
 *                                       matching cell template.
 *   - Cells                             three templates:
 *                                       `matrix-cell-text@1`   .Value (string)
 *                                       `matrix-cell-icon@1`   .IconType (enum)
 *                                       `matrix-cell-number@1` .Value (number)
 *
 * Identification: columns map to `MatrixDisplayType` by their item
 * template name. Sitecore's Layout Service exposes the template
 * metadata on each linked item via `LinkedItem.templateName`.
 */

export interface MatrixColumnFields {
  /** Single heading field — replaces the older Label/Title pair. */
  Heading?: Field<string>;
  Subtitle?: Field<string>;
  Description?: Field<string>;
  Badge?: Field<string>;
  // Text columns project `matrix-cell-text@1` items;
  // icon columns project `matrix-cell-icon@1` items;
  // number columns project `matrix-cell-number@1` items.
  Cells?: Array<
    LinkedItem<
      MatrixCellTextFields | MatrixCellIconFields | MatrixCellNumberFields
    >
  >;
}

export interface MatrixCellTextFields {
  Row?: LinkedItem<MatrixRowFields>;
  Value?: Field<string>;
}

export interface MatrixCellIconFields {
  Row?: LinkedItem<MatrixRowFields>;
  /** Stored as the enum value string ("check" / "cross" / "dash" /
   *  "none") by Sitecore's Droplist field type. */
  IconType?: Field<string>;
}

export interface MatrixCellNumberFields {
  Row?: LinkedItem<MatrixRowFields>;
  /** Sitecore Number field — the SDK delivers `value` as either a
   *  number or a numeric string depending on Layout-Service flavour. */
  Value?: Field<number | string>;
}

// Matrix detects per-column display type (text / icon / number) by
// peeking at the column's cell field shape. `LinkedItem.templateName`
// is NOT populated for nested items in Sitecore SXA Headless layout
// service — only `RouteData` (the top-level page) carries
// templateName, per Content SDK's Item type. Cells are the
// distinguishing surface: icon cells have an `IconType` field;
// number cells have a numeric `Value`; text cells have a string
// `Value`.

export interface MatrixRowFields {
  Label?: Field<string>;
}

export interface MatrixFields {
  Title?: Field<string>;
  Description?: Field<string>;
  AspectsLabel?: Field<string>;
  Columns?: Array<LinkedItem<MatrixColumnFields>>;
  Rows?: Array<LinkedItem<MatrixRowFields>>;
}

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const fieldString = (field: Field<string> | undefined): string | undefined => {
  if (field == null) return undefined;
  if (typeof field === "string") {
    return isNonEmptyString(field) ? field : undefined;
  }
  if (typeof field === "object" && "value" in field) {
    const v = (field as { value?: unknown }).value;
    return typeof v === "string" && isNonEmptyString(v) ? v : undefined;
  }
  return undefined;
};

/** Read a Number field. SDK may deliver either a real number or a
 *  numeric string ("42"). Returns `null` when missing / unparseable
 *  so the renderer's empty-cell branch fires. */
const fieldNumber = (
  field: Field<number | string> | undefined,
): number | null => {
  if (field == null) return null;
  if (typeof field === "number") return Number.isFinite(field) ? field : null;
  if (typeof field === "string") {
    const n = Number(field);
    return Number.isFinite(n) ? n : null;
  }
  if (typeof field === "object" && "value" in field) {
    const v = (field as { value?: unknown }).value;
    if (typeof v === "number") return Number.isFinite(v) ? v : null;
    if (typeof v === "string") {
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    }
  }
  return null;
};

/** Coerce a free-text IconType field to one of the four known values.
 *  Unknown / missing → "none" (renders as visually empty). */
const fieldIconType = (field: Field<string> | undefined): MatrixIconType => {
  const raw = fieldString(field)?.trim().toLowerCase();
  if (raw === "check" || raw === "cross" || raw === "dash" || raw === "none") {
    return raw;
  }
  return "none";
};

const itemKey = (item: LinkedItem<unknown> | undefined): string | undefined => {
  if (!item) return undefined;
  if (isNonEmptyString(item.name)) return item.name;
  if (isNonEmptyString(item.id)) return item.id;
  return undefined;
};

/**
 * Decide the column's render mode by peeking at its cells. Sitecore
 * SXA Headless layout service does not stamp `templateName` onto
 * nested Treelist items (only `RouteData` carries it), so the column
 * item's own metadata can't disambiguate text vs icon vs number. The
 * cells differ by field name, which IS preserved through layout
 * service, so they're the reliable signal:
 *
 *   matrix-cell-icon@1   → has `IconType` field
 *   matrix-cell-number@1 → has `Value` typed as number
 *   matrix-cell-text@1   → has `Value` typed as string
 *
 * Scans cells until one yields a definitive type. Empty / unparseable
 * cells get skipped — we want to keep looking. Bottoms out at `"text"`
 * for empty columns (no cells yet) so a brand-new column renders
 * without errors.
 */
/** Classify a single cell's display type, or null when the cell is
 *  empty/unparseable and the scan should keep looking. */
const detectCellDisplayType = (
  cell: LinkedItem<unknown>,
): MatrixDisplayType | null => {
  const cellFields = cell.fields as Record<string, unknown> | undefined;
  if (!cellFields) return null;
  if ("IconType" in cellFields) return "icon";
  if (!("Value" in cellFields)) return null;
  const raw = cellFields.Value;
  const value =
    raw && typeof raw === "object" && "value" in raw
      ? (raw as { value?: unknown }).value
      : raw;
  if (typeof value === "number") return "number";
  if (typeof value === "string" && value.trim() !== "") {
    // Sitecore Edge can ship Number field values as numeric
    // strings ("42"). Treat any purely-numeric string the same as
    // a real number; anything with letters or punctuation is text.
    return /^-?\d+(\.\d+)?$/.test(value.trim()) ? "number" : "text";
  }
  // Empty Value → keep looking; later cells might be populated.
  return null;
};

const detectColumnDisplayType = (
  item: LinkedItem<MatrixColumnFields>,
): MatrixDisplayType => {
  const cells = item.fields?.Cells ?? [];
  for (const cell of cells) {
    const detected = detectCellDisplayType(cell);
    if (detected) return detected;
  }
  return "text";
};

const flattenColumn = (
  item: LinkedItem<MatrixColumnFields>,
): MatrixColumn | undefined => {
  const id = itemKey(item);
  if (!id) return undefined;
  const fields = item.fields ?? {};
  const heading = fieldString(fields.Heading) ?? item.displayName ?? id;
  return {
    id,
    heading,
    subtitle: fieldString(fields.Subtitle),
    description: fieldString(fields.Description),
    badge: fieldString(fields.Badge),
    displayType: detectColumnDisplayType(item),
  };
};

const cellRowKey = (
  cell:
    | LinkedItem<MatrixCellTextFields>
    | LinkedItem<MatrixCellIconFields>
    | LinkedItem<MatrixCellNumberFields>
    | undefined,
): string | undefined => {
  if (!cell) return undefined;
  return itemKey(cell.fields?.Row);
};

/**
 * Walk one column's cells and produce a `Map<rowKey, cellValue>`
 * partial that gets stitched into `MatrixRow.values` keyed by the
 * column's id. Cell value type follows the column's display type:
 *   text   → string from `Value`
 *   icon   → MatrixIconType from `IconType`
 *   number → number from `Value`
 */
const flattenColumnCells = (
  column: LinkedItem<MatrixColumnFields>,
  displayType: MatrixDisplayType,
): Map<string, string | number | MatrixIconType | null> => {
  const out = new Map<string, string | number | MatrixIconType | null>();
  const cells = column.fields?.Cells ?? [];
  for (const cell of cells) {
    const rowKey = cellRowKey(cell);
    if (!rowKey) continue;
    if (displayType === "icon") {
      const iconCell = cell as LinkedItem<MatrixCellIconFields>;
      out.set(rowKey, fieldIconType(iconCell.fields?.IconType));
    } else if (displayType === "number") {
      const numberCell = cell as LinkedItem<MatrixCellNumberFields>;
      out.set(rowKey, fieldNumber(numberCell.fields?.Value));
    } else {
      const textCell = cell as LinkedItem<MatrixCellTextFields>;
      const value = fieldString(textCell.fields?.Value);
      out.set(rowKey, value ?? null);
    }
  }
  return out;
};

const flattenRow = (
  item: LinkedItem<MatrixRowFields>,
): MatrixRow | undefined => {
  const id = itemKey(item);
  if (!id) return undefined;
  const fields = item.fields ?? {};
  const label = fieldString(fields.Label) ?? item.displayName ?? id;
  return { id, label, values: {} };
};

const parseColumnLayout = (
  value: string | undefined,
): MatrixProps["columnLayout"] => {
  const normalized = value?.trim().toLowerCase();
  return normalized === "expand-one" ? "expand-one" : "even";
};

const COLOR_SCHEMES = [
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

const parseColorScheme = (
  value: string | undefined,
): MatrixProps["colorScheme"] => {
  const normalized = value?.trim().toLowerCase();
  if (normalized && (COLOR_SCHEMES as readonly string[]).includes(normalized)) {
    return normalized as MatrixProps["colorScheme"];
  }
  return undefined;
};

/**
 * Translate the Sitecore Layout Service input (`{fields, params}`)
 * into `MatrixProps`. Used by the consumer's component map:
 *
 *   componentMap.set(
 *     "Matrix",
 *     withSitecore<MatrixFields, MatrixProps>(Matrix, mapMatrix),
 *   );
 */
export function mapMatrix({
  fields,
  params,
  isEditing,
}: SitecoreInput<MatrixFields>): MatrixProps {
  const columns = asArray(fields?.Columns)
    .map(flattenColumn)
    .filter((c): c is MatrixColumn => c != null);

  const rows = asArray(fields?.Rows)
    .map(flattenRow)
    .filter((r): r is MatrixRow => r != null);

  // Join cells into rows. Each column's cells produce a
  // `Map<rowKey, cellValue>` keyed by row name; we then walk rows
  // and stitch the per-column lookups into `row.values[column.id]`.
  // This is O(C * R) — fine for typical matrix sizes (under 50
  // cells total).
  const valuesByColumn = new Map<
    string,
    Map<string, string | number | MatrixIconType | null>
  >();
  for (let i = 0; i < columns.length; i++) {
    const column = columns[i];
    const columnItem = fields?.Columns?.[i];
    if (!column || !columnItem) continue;
    valuesByColumn.set(
      column.id,
      flattenColumnCells(columnItem, column.displayType),
    );
  }
  for (const row of rows) {
    for (const column of columns) {
      const cellValue = valuesByColumn.get(column.id)?.get(row.id);
      if (cellValue !== undefined) {
        row.values[column.id] = cellValue;
      }
    }
  }

  return {
    title: fieldString(fields?.Title),
    description: fieldString(fields?.Description),
    aspectsLabel: fieldString(fields?.AspectsLabel),
    columns: columns.length > 0 ? columns : undefined,
    rows: rows.length > 0 ? rows : undefined,
    columnLayout: parseColumnLayout(params?.ColumnLayout),
    expandedColumnId: isNonEmptyString(params?.ExpandedColumn)
      ? params.ExpandedColumn
      : undefined,
    colorScheme: parseColorScheme(params?.ColorScheme),
    // Density + Size are plain enum strings; the React component
    // resolves them via its own allow-list (resolveDensity / resolveSize)
    // and falls through to the default when unknown.
    density: isNonEmptyString(params?.Density)
      ? (params.Density as MatrixProps["density"])
      : undefined,
    size: isNonEmptyString(params?.Size)
      ? (params.Size as MatrixProps["size"])
      : undefined,
    zebraRows: params?.ZebraRows,
    id: params?.RenderingIdentifier,
    styles: params?.styles,
    isEditing,
  };
}

export { mapMatrix as Default };
