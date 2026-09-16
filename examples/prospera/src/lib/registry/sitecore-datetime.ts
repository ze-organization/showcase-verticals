/**
 * Display helpers for Sitecore Date / Datetime fields.
 *
 * Layout Service documents an empty datetime as `""`, but GraphQL / Edge
 * serializes an unset .NET DateTime as `0001-01-01T00:00:00Z`
 * (`DateTime.MinValue`). Populated values arrive as ISO-8601 UTC
 * (`yyyy-MM-ddTHH:mm:ssZ`) and must be formatted before render.
 */

/** .NET DateTime.MinValue / GraphQL unset-datetime sentinel. */
const EMPTY_DATETIME_PREFIX = "0001-01-01";

const DISPLAY_DATE = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

/**
 * True when `iso` is missing, unparseable, or Sitecore's empty-datetime
 * sentinel — not a real authored date.
 *
 * @param iso - Raw Sitecore datetime string, or undefined.
 * @returns Whether the value should be treated as empty.
 */
export function isEmptySitecoreDate(iso: string | undefined): boolean {
  if (!iso) return true;
  const trimmed = iso.trim();
  if (!trimmed) return true;
  if (trimmed.startsWith(EMPTY_DATETIME_PREFIX)) return true;
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return true;
  return parsed.getUTCFullYear() <= 1;
}

/**
 * Format a Sitecore datetime ISO string for card / meta display.
 * Returns `undefined` for empty or sentinel values so callers can omit
 * the slot. Time is dropped; the calendar day is read in UTC so
 * `2026-05-12T09:00:00Z` stays 12 May regardless of the viewer's zone.
 *
 * @param iso - Raw Sitecore datetime string, or undefined.
 * @returns A short UTC display date (e.g. `May 12, 2026`), or undefined.
 */
export function formatSitecoreDate(iso: string | undefined): string | undefined {
  const trimmed = iso?.trim() ?? "";
  if (isEmptySitecoreDate(trimmed)) return undefined;
  return DISPLAY_DATE.format(new Date(trimmed));
}
