import type { ComponentProps } from "@/lib/registry/sitecore-types";

/**
 * SXA + Pages register dynamic slots as `{prefix}-*-0-{id}`, not
 * `{prefix}-{id}`. Prefer a key already on the rendering envelope
 * (including empty ones); otherwise use the SXA `*-0-{id}` form so
 * Placeholder emits the chrometype marker Pages draws.
 *
 * Shared by page-details renderings (article, product, person, …)
 * so each file does not fork the lookup.
 */
export function sxaPlaceholderName(
  rendering: ComponentProps["rendering"] | undefined,
  prefix: string,
  dynamicPlaceholderId?: string,
): string {
  const id = dynamicPlaceholderId ?? "1";
  const placeholders = (
    rendering as { placeholders?: Record<string, unknown> } | undefined
  )?.placeholders;
  const keys = placeholders ? Object.keys(placeholders) : [];
  const sxa = keys.find((key) => key.startsWith(`${prefix}-*-`));
  if (sxa) return sxa;
  if (keys.includes(`${prefix}-${id}`)) return `${prefix}-${id}`;
  if (keys.includes(`${prefix}-{*}`)) return `${prefix}-{*}`;
  return `${prefix}-*-0-${id}`;
}
