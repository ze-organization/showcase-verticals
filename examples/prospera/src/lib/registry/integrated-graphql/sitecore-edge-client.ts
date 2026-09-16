/**
 * Thin Sitecore Edge GraphQL client backing the IGQL query surface —
 * the ancestor walk and `link-list@1`'s ParentRef tree-reference mode.
 *
 * Server-only — the client lives behind a Next.js API route
 * (`/api/sitecore/igql`) so the contextId header isn't shipped to
 * the browser. Components consume the data via `useAncestors()` /
 * `useChildren()` hooks that POST to that route.
 *
 * Configuration via env vars:
 *
 *   - `SITECORE_EDGE_GRAPHQL_URL` (defaults to
 *     `https://edge-platform.sitecorecloud.io/api/graphql/v1`)
 *   - `NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID` — same value the SDK
 *     already uses for the Layout Service.
 *
 * If `NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID` is unset the client
 * returns `null` from every call. The consuming components fall
 * through to their curated authoring mode (curated breadcrumb Items
 * / curated link-list Items). This makes the IGQL path graceful:
 * deployments without Edge configured keep working.
 */

const DEFAULT_GRAPHQL_URL =
  "https://edge-platform.sitecorecloud.io/api/graphql/v1";

const getEdgeConfig = () => {
  const contextId = process.env.NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID;
  if (!contextId) return null;
  return {
    url: process.env.SITECORE_EDGE_GRAPHQL_URL ?? DEFAULT_GRAPHQL_URL,
    contextId,
  };
};

export interface IGQLRequest<TVariables = Record<string, unknown>> {
  query: string;
  variables: TVariables;
}

export interface IGQLResponse<TData> {
  data?: TData;
  errors?: Array<{ message: string }>;
}

/**
 * Issues a GraphQL request to Sitecore Edge. Returns the parsed
 * response, or `null` when the Edge contextId env var is missing
 * (graceful degradation — callers fall back to curated mode).
 *
 * Server-only. Don't call from a Client Component — use the
 * `useAncestors` / `useChildren` hooks, which proxy through the
 * `/api/sitecore/igql` Next route.
 */
export async function fetchSitecoreEdge<TData>(
  request: IGQLRequest,
): Promise<IGQLResponse<TData> | null> {
  const config = getEdgeConfig();
  if (!config) return null;

  try {
    const response = await fetch(config.url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        sc_apikey: config.contextId,
      },
      body: JSON.stringify(request),
      // The walked structure changes only when the page tree changes
      // — the default Next fetch cache (force-cache) is appropriate
      // here. Revalidate via deploy or a tag-based revalidation if
      // tenant-side authoring needs faster turnaround.
      cache: "force-cache",
    });
    if (!response.ok) {
      return { errors: [{ message: `Edge HTTP ${response.status}` }] };
    }
    return (await response.json()) as IGQLResponse<TData>;
  } catch (error) {
    return {
      errors: [
        {
          message: error instanceof Error ? error.message : "Edge fetch failed",
        },
      ],
    };
  }
}
