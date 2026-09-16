import type { Field, ImageField, LinkField } from "@/lib/registry/sitecore";

/**
 * Layout Service ships type-details renderings with `dataSource: ""`
 * and no field bag. Page content lives on `route.fields`. Prefer a
 * real datasource when one is assigned; otherwise use the current page.
 */

export function unwrapField<T extends { value?: unknown }>(
  raw: unknown,
): T | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const obj = raw as { jsonValue?: unknown; value?: unknown };
  if (obj.jsonValue && typeof obj.jsonValue === "object") {
    return obj.jsonValue as T;
  }
  return raw as T;
}

export function pickText<T extends { value?: unknown }>(
  preferred: T | undefined,
  fallback: T | undefined,
): T | undefined {
  const first = unwrapField<T>(preferred);
  const next = unwrapField<T>(fallback);
  const value = first?.value;
  if (typeof value === "string" && value.trim().length > 0) return first;
  return next ?? first;
}

export function pickImage(
  preferred: ImageField | undefined,
  fallback: ImageField | undefined,
): ImageField | undefined {
  const first = unwrapField<ImageField>(preferred);
  const next = unwrapField<ImageField>(fallback);
  const src =
    first?.value && typeof first.value === "object"
      ? first.value.src
      : undefined;
  if (src) return first;
  return next ?? first;
}

export function pickLink(
  preferred: LinkField | undefined,
  fallback: LinkField | undefined,
): LinkField | undefined {
  const first = unwrapField<LinkField>(preferred);
  const next = unwrapField<LinkField>(fallback);
  const href =
    first?.value && typeof first.value === "object"
      ? first.value.href
      : undefined;
  if (typeof href === "string" && href.trim().length > 0) return first;
  return next ?? first;
}

export function pickNumber(
  preferred: Field<number> | undefined,
  fallback: Field<number> | undefined,
): Field<number> | undefined {
  const first = unwrapField<Field<number>>(preferred);
  const next = unwrapField<Field<number>>(fallback);
  const value = first?.value;
  if (typeof value === "number" && Number.isFinite(value)) return first;
  if (typeof value === "string" && value.trim().length > 0) return first;
  return next ?? first;
}
