/**
 * Reader for ENUM-SHAPED ITEM FIELDS (`shape: "enum"` in a recipe,
 * e.g. `quick-link-tile@1`'s IconName). Distinct from enum RENDERING
 * PARAMS, which always arrive as plain strings (see param-parsers.ts).
 *
 * scai compiles an enum field as a **Droplink to an enumeration VALUE
 * item** (the SXA convention — see the CLI's enumeration compiler), so
 * the layout service delivers the PICKED ITEM as an envelope, not a
 * string. Readers that only handled `string | { value }` rendered
 * nothing from real tenant content while showcase previews (plain
 * strings in variant JSON) looked fine — the missing-quick-tile-icons
 * bug.
 */

/** Every arrival shape an enum-shaped item field can take. */
export type EnumFieldSource =
  /** Inline design fields / preview JSON. */
  | string
  /** Text/droplist serialization. */
  | { value?: string }
  /**
   * Droplink item envelope: the enumeration value item, whose `Value`
   * field carries the canonical key and whose item `name` IS the key
   * (the compiler writes `value.name` to both).
   */
  | {
      name?: string;
      displayName?: string;
      fields?: { Value?: { value?: string } };
    };

/**
 * Resolve an enum-shaped item field to its trimmed, lowercased key —
 * `"bill"`, `"outage"`, … — whatever shape arrived. Returns `undefined`
 * for empty/unreadable values. The `none` clearing sentinel passes
 * through as-is; vocabularies treat it as unset downstream.
 */
export function enumFieldValue(
  raw: EnumFieldSource | undefined | null,
): string | undefined {
  if (raw == null) return undefined;
  let candidate: unknown;
  if (typeof raw === "string") {
    candidate = raw;
  } else {
    const envelope = raw as {
      value?: unknown;
      name?: unknown;
      fields?: { Value?: { value?: unknown } };
    };
    const nested = envelope.fields?.Value?.value;
    candidate =
      typeof envelope.value === "string" && envelope.value.trim()
        ? envelope.value
        : typeof nested === "string" && nested.trim()
          ? nested
          : envelope.name;
  }
  if (typeof candidate !== "string") return undefined;
  const normalized = candidate.trim().toLowerCase();
  return normalized || undefined;
}
