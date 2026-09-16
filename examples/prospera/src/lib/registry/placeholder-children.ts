import type { ComponentRendering } from "@/lib/registry/sitecore";

/**
 * Coerce a Sitecore multi-value field value into an array before
 * iterating it.
 *
 * The layout service delivers a multilist / treelist / tag field as an
 * ARRAY normally, but as a SINGLE OBJECT when the field holds exactly one
 * entry (and as `undefined` when empty). So the common
 * `(fields.Items ?? []).map(…)` shape throws
 * `(intermediate value).map is not a function` on a one-item list — the
 * `?? []` guard only catches null/undefined, not a lone object. This
 * surfaced as a build-time prerender crash on real pages whose curated
 * lists happened to carry a single item.
 *
 * Route every multi-value field read through this: an array passes
 * through unchanged, a lone object becomes a one-element array, and
 * `undefined` / `null` / a stray primitive become `[]`.
 */
export function asArray<T>(value: readonly T[] | T | null | undefined): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value != null && typeof value === "object") return [value as T];
  return [];
}

/**
 * Resolve a dynamic placeholder's child renderings from a rendering
 * envelope, tolerating suffix drift.
 *
 * The computed slot name is `<prefix>-<DynamicPlaceholderId ?? "1">`,
 * but the suffix SXA actually emits depends on the rendering's
 * placement index — when the `DynamicPlaceholderId` param doesn't
 * reach the component (older layout snapshots, metadata editing
 * payloads, third placement on a page), the exact-key lookup misses,
 * the caller concludes "no children", and falls back to rendering the
 * raw `<Placeholder>` — which renders each child STANDALONE. That is
 * the "each tab item stacks as its own section" failure mode.
 *
 * Resolution order:
 *   1. the exact computed key, when it exists in `placeholders`;
 *   2. otherwise the first `<prefix>-<digits>` key present (a
 *      rendering envelope only ever carries ONE slot per declared
 *      dynamic placeholder, so prefix-matching is unambiguous).
 *
 * Returns the resolved key (for mounting `<Placeholder name=…>`) and
 * the children found under it.
 */
export function resolvePlaceholderChildren<TChild>(
  rendering: ComponentRendering | undefined,
  prefix: string,
  dynamicPlaceholderId: string | undefined,
): { key: string; children: TChild[] } {
  const exactKey = `${prefix}-${dynamicPlaceholderId ?? "1"}`;
  const placeholders = (
    rendering as
      | { placeholders?: Record<string, unknown[] | unknown | undefined> }
      | undefined
  )?.placeholders;
  if (!placeholders) return { key: exactKey, children: [] };

  const fromKey = (key: string): TChild[] | undefined => {
    if (!(key in placeholders)) return undefined;
    const value = asArray(placeholders[key] as TChild | TChild[] | undefined);
    return value;
  };

  const exact = fromKey(exactKey);
  if (exact && exact.length > 0) {
    return { key: exactKey, children: exact };
  }

  const wildcardKey = `${prefix}-{*}`;
  const wildcard = fromKey(wildcardKey);
  if (wildcard && wildcard.length > 0) {
    return { key: wildcardKey, children: wildcard };
  }

  const prefixDash = `${prefix}-`;
  for (const [key, value] of Object.entries(placeholders)) {
    if (!key.startsWith(prefixDash)) continue;
    const children = asArray(value as TChild | TChild[] | undefined);
    if (children.length > 0) {
      return { key, children };
    }
  }
  return { key: exactKey, children: [] };
}

/**
 * Slot name to pass to `<Placeholder name=…>`. Dynamic `{*}` keys in
 * recipes become `<prefix>-<DynamicPlaceholderId>` at runtime; using
 * the literal `{*}` string misses Pages drop chrome.
 */
export function resolvedPlaceholderName(
  rendering: ComponentRendering | undefined,
  placeholderKey: string,
  dynamicPlaceholderId?: string,
): string {
  const prefix = placeholderKey.replace(/-\{\*\}$/, "");
  const fromEnvelope = (
    rendering as { params?: { DynamicPlaceholderId?: string } } | undefined
  )?.params?.DynamicPlaceholderId;
  return resolvePlaceholderChildren(
    rendering,
    prefix,
    dynamicPlaceholderId ?? fromEnvelope,
  ).key;
}

/**
 * Placeholder name for SXA dynamic slots in Pages.
 *
 * Recipes declare keys like `search-controls-leading-{*}`. At runtime
 * SXA/Pages register `search-controls-leading-*-0-{DynamicPlaceholderId}`
 * (and sometimes `…-{id}` or the literal `{*}` key). Passing the recipe
 * `{*}` string to `<Placeholder>` misses both drop chrome and dropped
 * children — the child then renders outside the wrapper.
 *
 * Prefer a key already on the rendering envelope (including empty
 * arrays so Pages still draws chrometype markers); otherwise emit the
 * SXA `*-0-{id}` form.
 */
export function sxaPlaceholderName(
  rendering: ComponentRendering | undefined,
  prefix: string,
  dynamicPlaceholderId?: string,
): string {
  const fromEnvelope = (
    rendering as { params?: { DynamicPlaceholderId?: string } } | undefined
  )?.params?.DynamicPlaceholderId;
  const id = dynamicPlaceholderId ?? fromEnvelope ?? "1";
  const placeholders = (
    rendering as { placeholders?: Record<string, unknown> } | undefined
  )?.placeholders;
  const keys = placeholders ? Object.keys(placeholders) : [];
  const sxa = keys.find((key) => key.startsWith(`${prefix}-*-`));
  if (sxa) return sxa;
  if (keys.includes(`${prefix}-${id}`)) return `${prefix}-${id}`;
  if (keys.includes(`${prefix}-{*}`)) return `${prefix}-{*}`;
  const existing = keys.find(
    (key) => key === prefix || key.startsWith(`${prefix}-`),
  );
  if (existing) return existing;
  return `${prefix}-*-0-${id}`;
}

/**
 * Hoist a Treelist linked item's nested `fields` onto the item itself
 * (`{id, fields: {Label}} → {id, Label}`) when the envelope hasn't
 * been through `withSitecore`'s `flattenLinkedItems`.
 *
 * The generated component map applies `flattenLinkedItems` in this
 * repo, but installed starters regenerate their map from recipes that
 * land at `src/recipes/` — NOT as component siblings — so the
 * generator's sibling-recipe Treelist discovery misses and linked
 * items arrive nested. Components must read BOTH shapes (link-list's
 * normalizer is the precedent); this helper is that normalization for
 * everyone else.
 */
export function hoistLinkedItemFields<TItem extends { id?: string }>(
  items: readonly unknown[] | undefined,
): TItem[] {
  if (!items?.length) return [];
  return items.map((item) => {
    if (item == null || typeof item !== "object") return item as TItem;
    const record = item as Record<string, unknown> & { fields?: unknown };
    if (record.fields == null || typeof record.fields !== "object") {
      return item as TItem;
    }
    const { fields, ...rest } = record;
    return { ...rest, ...(fields as Record<string, unknown>) } as TItem;
  });
}

/**
 * Inverse-tolerant accessor for a single Treelist linked item's field
 * bag: return `item.fields` when the envelope is still nested (the raw
 * layout-service shape), or the item ITSELF when the fields were
 * already hoisted (a map that ran `flattenLinkedItems` /
 * `hoistLinkedItemFields` upstream).
 *
 * Family adapters (`adaptArticleItems` & friends) read named fields off
 * each linked item (`fields.Title`, `fields.Image`, …). Reading only
 * `item.fields?.X` silently drops every field when an installed
 * starter's generated component map flattened the items first — the
 * same installed-starter shape drift `hoistLinkedItemFields` guards
 * against, in the opposite direction. Route every per-item field read
 * through this accessor so both shapes work.
 */
const LINKED_ITEM_ENVELOPE_KEYS = new Set([
  "id",
  "name",
  "displayName",
  "templateId",
  "templateName",
  "url",
  "fields",
]);

export function linkedItemFields<TFields extends object>(
  item: { fields?: TFields | null } | null | undefined,
): TFields | undefined {
  if (item == null || typeof item !== "object") return undefined;
  const record = item as { fields?: unknown };
  if (record.fields != null && typeof record.fields === "object") {
    return record.fields as TFields;
  }
  // Hoisted shape: treat the item itself as the field bag — but only
  // when it actually carries keys beyond the envelope metadata, so a
  // broken/unresolved reference (`{id, name, url}` with no fields)
  // reads as "no fields" in both shapes.
  const hasFieldKeys = Object.keys(record).some(
    (key) => !LINKED_ITEM_ENVELOPE_KEYS.has(key),
  );
  return hasFieldKeys ? (item as unknown as TFields) : undefined;
}
