"use client";

/**
 * `useAncestorTitles` — client hook that resolves the AUTHORED titles
 * for the current route's ancestor chain, so a breadcrumb can show
 * real page titles instead of labels guessed from URL slugs.
 *
 * Without it, `breadcrumb@1` humanizes each path segment
 * (`alpine-tent_2024` → "Alpine Tent 2024"), which is right often
 * enough to ship but wrong whenever the authored title differs from
 * the slug ("about-us" → "About Us", authored "Who We Are").
 *
 * Goes through the same server-only Edge GraphQL proxy the other IGQL
 * consumers use (`/api/sitecore/igql`) so the Edge context id never
 * reaches the browser. The proxy whitelists queries by name; this hook
 * requests `"ancestors"`.
 *
 * Graceful degradation — every failure path returns an EMPTY map, and
 * the caller keeps its slug-derived labels:
 *
 *   - no item path, or the hook is disabled  → no fetch at all
 *   - Edge not configured (`configured: false`) → empty
 *   - network error, aborted, or no item      → empty
 *
 * Labels prefer `NavigationTitle` over `Title` (the OOTB SXA
 * convention: navigation contexts get the short form), then fall back
 * to the item name.
 */

import { useEffect, useState } from "react";

/** One node of the ancestor chain as the Edge projection returns it. */
interface AncestorNode {
  id?: string;
  name?: string;
  title?: { value?: string } | null;
  navigationTitle?: { value?: string } | null;
  url?: { path?: string } | null;
}

interface AncestorsResponse {
  item?: (AncestorNode & { ancestors?: AncestorNode[] | null }) | null;
}

export interface UseAncestorTitlesOptions {
  /**
   * Route path of the CURRENT item (e.g. `/products/tents`). Empty or
   * undefined disables resolution.
   */
  itemPath?: string;
  /** Item language for the Edge query. Defaults to `"en"`. */
  language?: string;
  /**
   * Opt-in switch. `false` skips the fetch entirely — the breadcrumb
   * is a zero-network rendering by default, and authored titles are a
   * deliberate upgrade rather than a cost every placement pays.
   */
  enabled?: boolean;
}

/**
 * Normalize a route path for map lookups: strip a trailing slash and
 * lowercase. Sitecore and `usePathname()` agree on structure but not
 * reliably on case or trailing slash.
 */
export function normalizeRoutePath(path: string): string {
  const trimmed = path.trim().replace(/\/+$/, "");
  return (trimmed || "/").toLowerCase();
}

/** Best authored label for a node: NavigationTitle → Title → name. */
function nodeLabel(node: AncestorNode): string | undefined {
  const nav = node.navigationTitle?.value?.trim();
  if (nav) return nav;
  const title = node.title?.value?.trim();
  if (title) return title;
  const name = node.name?.trim();
  return name || undefined;
}

/**
 * Build the `normalizedPath → authored label` map from a response.
 * Exported for testing: the mapping (not the fetch) is the part with
 * real edge cases.
 */
export function buildAncestorTitleMap(
  data: AncestorsResponse | null | undefined,
): Map<string, string> {
  const map = new Map<string, string>();
  const item = data?.item;
  if (!item) return map;
  // The current item is returned alongside its ancestors; include it so
  // the leaf crumb can be upgraded too.
  for (const node of [...(item.ancestors ?? []), item]) {
    const path = node.url?.path?.trim();
    const label = nodeLabel(node);
    if (!path || !label) continue;
    map.set(normalizeRoutePath(path), label);
  }
  return map;
}

const EMPTY = new Map<string, string>();

export function useAncestorTitles({
  itemPath,
  language,
  enabled = false,
}: UseAncestorTitlesOptions): Map<string, string> {
  const [titles, setTitles] = useState<Map<string, string>>(EMPTY);

  const path = enabled ? itemPath?.trim() || undefined : undefined;
  const resolvedLanguage = language?.trim() || "en";

  useEffect(() => {
    if (!path) {
      setTitles(EMPTY);
      return;
    }

    const controller = new AbortController();

    (async () => {
      try {
        const response = await fetch("/api/sitecore/igql", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            query: "ancestors",
            variables: { itemId: path, language: resolvedLanguage },
          }),
          signal: controller.signal,
        });
        if (!response.ok) {
          setTitles(EMPTY);
          return;
        }
        const payload = (await response.json()) as {
          data?: AncestorsResponse | null;
          configured?: boolean;
        };
        // `configured: false` is the proxy's "Edge isn't set up" signal,
        // not an error — degrade silently to the slug labels.
        if (payload.configured === false) {
          setTitles(EMPTY);
          return;
        }
        setTitles(buildAncestorTitleMap(payload.data));
      } catch (error) {
        if (controller.signal.aborted) return;
        // Keep the slug-derived trail; surface the cause for debugging
        // without breaking navigation.
        console.warn("[useAncestorTitles] resolution failed:", error);
        setTitles(EMPTY);
      }
    })();

    return () => controller.abort();
  }, [path, resolvedLanguage]);

  return titles;
}
