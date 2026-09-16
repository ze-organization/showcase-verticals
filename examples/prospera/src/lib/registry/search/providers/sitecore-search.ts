import { registerSearchProvider } from "../registry";
import type { FlatItem, SearchProvider } from "../types";

/**
 * `sitecore-search` provider — calls the Sitecore Search REST API.
 *
 * Current implementation is a stub: the registry is a frontend-only
 * showcase and doesn't carry a Sitecore Search tenant. Wire-up happens
 * at deploy time — the orchestrator injects the index endpoint and
 * credentials via env, and the provider's `fetch` calls the configured
 * endpoint with the translated `SearchConfig` payload.
 *
 * Until wired, the provider throws a clear "not configured" error so
 * authors testing search-mode in dev see why nothing's coming back.
 */
const sitecoreSearchProvider: SearchProvider<FlatItem> = {
  key: "sitecore-search",
  async fetch(config) {
    const endpoint = process.env.NEXT_PUBLIC_SITECORE_SEARCH_ENDPOINT;
    if (!endpoint) {
      throw new Error(
        `sitecore-search provider not configured: set NEXT_PUBLIC_SITECORE_SEARCH_ENDPOINT to a Sitecore Search REST endpoint to use search-mode renderings with source="${config.source}".`,
      );
    }
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        source: config.source,
        keyphrase: config.freeText,
        filters: config.filters,
        sort: config.sort,
        pagination: config.pagination,
        personalization: config.personalization,
        ...config.providerOptions,
      }),
    });
    if (!response.ok) {
      throw new Error(
        `sitecore-search request failed: ${response.status} ${response.statusText}`,
      );
    }
    const payload = (await response.json()) as {
      items: FlatItem[];
      totalItems?: number;
      facets?: Array<{
        id: string;
        label: string;
        type: "list" | "range";
        values?: Array<{ id: string; label: string; count?: number }>;
        range?: { min: number; max: number };
      }>;
    };
    return {
      items: payload.items ?? [],
      totalItems: payload.totalItems ?? payload.items?.length ?? 0,
      facets: payload.facets ?? [],
    };
  },
};

registerSearchProvider("sitecore-search", sitecoreSearchProvider);
