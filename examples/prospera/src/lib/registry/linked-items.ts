/**
 * Linked-item normalization for reference (Treelist / multilist)
 * field values.
 *
 * A reference field's entries reach a component in one of two shapes:
 *
 *   1. **Raw layout-service projection** — `{ id, name, fields }`
 *      (the SDK's Treelist serialization, including nested references
 *      inside another linked item, which `flattenLinkedItems` does not
 *      reach — it only hoists the top level).
 *   2. **Hoisted / inline** — the fields sit directly on the entry:
 *      either `flattenLinkedItems` already ran, or a composed design
 *      inlined the fields verbatim (the orchestrator's generated
 *      chrome partials emit this shape).
 *
 * Components that read nested reference structures (mega-menu groups
 * on `main-nav`, column groups on `footer`) normalize every entry through
 * {@link linkedFields} so both shapes render identically.
 */

/**
 * The `url` slot a layout-service linked item may carry. Treelist
 * entries that reference PAGE items arrive with the page's URL — a
 * plain path string in the classic Layout Service projection, or an
 * object carrying `path` / `href` / `url` from Edge GraphQL
 * projections.
 */
export type LinkedItemUrl =
  | string
  | { path?: string; href?: string; url?: string };

/** A linked-item value in either arrival shape (see module doc). */
export type LinkedEntry<TFields> =
  | (TFields & { fields?: undefined })
  | {
      id?: string;
      name?: string;
      displayName?: string;
      url?: LinkedItemUrl;
      fields: TFields;
    };

/**
 * Hoist a linked entry's `fields` onto the entry itself (keeping the
 * envelope metadata — `id`, `name`, and, for page references, `url`),
 * or pass an already-hoisted entry through untouched. Field values
 * spread LAST so a real field wins over envelope metadata on a name
 * collision.
 */
export function linkedFields<TFields extends { id?: string }>(
  entry: LinkedEntry<TFields> | undefined,
): TFields | undefined {
  if (entry == null) return undefined;
  if (entry.fields == null) return entry as TFields;
  const { fields, ...rest } = entry as { fields: TFields } & Record<
    string,
    unknown
  >;
  return { ...rest, ...fields } as unknown as TFields;
}

/**
 * Read a linked page item's URL defensively across the shapes the
 * layout service emits (see {@link LinkedItemUrl}). Returns the
 * trimmed path/href, or `undefined` when the entry carries no usable
 * URL — callers branch on that to tell page references apart from
 * plain content items.
 */
export function getLinkedItemUrl(
  url: LinkedItemUrl | undefined | null,
): string | undefined {
  if (typeof url === "string") return url.trim() || undefined;
  if (url != null && typeof url === "object") {
    const path = typeof url.path === "string" ? url.path.trim() : "";
    if (path) return path;
    const href = typeof url.href === "string" ? url.href.trim() : "";
    if (href) return href;
    const nested = typeof url.url === "string" ? url.url.trim() : "";
    if (nested) return nested;
  }
  return undefined;
}
