"use client";

import { useEffect, useMemo } from "react";
import { useSitecore } from "@/lib/registry/sitecore";
import { useSearchControllerContext } from "./search-controller-context";
import type { FlatItem, SearchConfig } from "./types";
import { useSearchResults } from "./use-search-results";

/**
 * True when the layout-service envelope already has placeholder
 * children under a cards / logo-wall slot. Used so leftover Treelist
 * items do not hide composed children on published pages.
 */
export function renderingHasComposedChildren(rendering: unknown): boolean {
  const placeholders = (
    rendering as { placeholders?: Record<string, unknown[] | undefined> } | undefined
  )?.placeholders;
  if (!placeholders) return false;
  return Object.entries(placeholders).some(([key, value]) => {
    if (!Array.isArray(value) || value.length === 0) return false;
    if (!/^(cards-|logo-wall-)/.test(key)) return false;
    // Empty editing chrome is not a composed child. Only a real
    // dropped rendering (componentName) should hide datasource items.
    return value.some(
      (child) =>
        child != null &&
        typeof child === "object" &&
        typeof (child as { componentName?: unknown }).componentName ===
          "string" &&
        (child as { componentName: string }).componentName.length > 0,
    );
  });
}

export interface ResolveListItemsOptions {
  /** Layout-service envelope — used to detect placeholder children. */
  rendering?: unknown;
  /** Explicit editing flag; `useSitecore().page.mode.isEditing` is the fallback. */
  isEditing?: boolean;
  /**
   * When true, a populated Treelist (`directItems`) is a first-class
   * authoring mode and renders in Pages as well as on the published
   * page. Families that dropped the Treelist field leave this unset so
   * leftover values stay published-only.
   */
  allowCurated?: boolean;
}

/**
 * Resolves which flattened items a cards-and-lists rendering should
 * display. `hasItems` at the call site means **search hits**, a
 * curated Treelist (when {@link ResolveListItemsOptions.allowCurated}
 * is set), or a read-only leftover Treelist on published pages.
 * Placeholder composition is the default authoring path otherwise.
 *
 * Precedence, highest first:
 *
 *   1. **Parent-driven search** — an ambient `SearchControllerProvider`
 *      with a real SearchConfig is mounted. Empty hits stay empty (do
 *      not degrade to Treelist).
 *   2. **Seeded wrapper** — ambient controller has no SearchConfig.
 *      Curated Treelist items are pushed into the in-memory `custom`
 *      provider so search bars still work.
 *   3. **Self-contained search** — the rendering's own `SearchConfig`.
 *      Provider error returns `[]` so the placeholder remains the
 *      authoring surface.
 *   4. **Placeholder** — return `[]` when composed children already
 *      exist. While editing, also return `[]` unless `allowCurated`
 *      is set and the Treelist is populated.
 *   5. **Curated / leftover Treelist** — `directItems`. With
 *      `allowCurated`, this is the authored Treelist (Pages + live).
 *      Without it, leftover values render on published pages only.
 */
export function useResolvedListItems<TItem extends FlatItem = FlatItem>(
  directItems: TItem[] | undefined,
  searchConfig?: SearchConfig,
  options?: ResolveListItemsOptions,
): TItem[] {
  const { page } = useSitecore() as {
    page?: { mode?: { isEditing?: boolean } };
  };
  const isEditing = options?.isEditing ?? Boolean(page?.mode?.isEditing);
  const hasComposedChildren = renderingHasComposedChildren(options?.rendering);
  const allowCurated = Boolean(options?.allowCurated);
  const ambient = useSearchControllerContext();
  const ownsQuery = ambient == null && searchConfig != null;
  const own = useSearchResults<TItem>(ownsQuery ? searchConfig : undefined);

  const seedKey = (directItems ?? []).map((item) => item.id).join("|");
  useEffect(() => {
    if (!ambient || ambient.hasSource || !allowCurated) return;
    ambient.replaceItems(directItems ?? []);
  }, [allowCurated, ambient, directItems, seedKey]);

  return useMemo(() => {
    if (ambient != null && ambient.hasSource) {
      return (ambient.pagedItems ?? []) as TItem[];
    }
    if (ambient != null && !ambient.hasSource && allowCurated) {
      const usingController =
        ambient.totalItems > 0 ||
        ambient.query.length > 0 ||
        ambient.isLoading;
      if (usingController) {
        return (ambient.pagedItems ?? []) as TItem[];
      }
    }
    if (ownsQuery) {
      return own.error ? [] : own.pagedItems;
    }
    if (hasComposedChildren) return [];
    if (allowCurated) return directItems ?? [];
    if (isEditing) return [];
    return directItems ?? [];
  }, [
    allowCurated,
    ambient,
    directItems,
    hasComposedChildren,
    isEditing,
    own.error,
    own.pagedItems,
    ownsQuery,
  ]);
}
