import { NextResponse } from "next/server";
import {
  ANCESTORS_QUERY,
  CHILDREN_QUERY,
} from "@/lib/registry/integrated-graphql/queries";
import { fetchSitecoreEdge } from "@/lib/registry/integrated-graphql/sitecore-edge-client";
import { WILDCARD_ITEM_QUERY } from "@/lib/registry/wildcard/queries";

/**
 * Server-only proxy for the registry's Integrated GraphQL (IGQL)
 * queries against Sitecore Edge. Client hooks (`useWildcardItem`)
 * POST here so the Edge context id
 * (`NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID`, read server-side by
 * `fetchSitecoreEdge`) is never exposed to the browser.
 *
 * Security model: the route executes only **whitelisted, named
 * queries** — the client sends a query *name*, never GraphQL text, so
 * this can't be used as an arbitrary-query proxy into the tenant.
 * Variables are restricted to scalar strings.
 *
 * Response contract (always 200 for resolvable requests):
 *
 *   { "data": <query data> | null, "configured": boolean }
 *
 * `data: null` + `configured: false` means Edge isn't configured —
 * callers degrade to their authored/curated fallback content.
 */

const QUERIES: Record<string, string> = {
  ancestors: ANCESTORS_QUERY,
  children: CHILDREN_QUERY,
  "wildcard-item": WILDCARD_ITEM_QUERY,
};

const MAX_VARIABLE_LENGTH = 1024;

const sanitizeVariables = (
  variables: unknown,
): Record<string, string> | null => {
  if (variables == null || typeof variables !== "object") return null;
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(
    variables as Record<string, unknown>,
  )) {
    if (typeof value !== "string" || value.length > MAX_VARIABLE_LENGTH) {
      return null;
    }
    out[key] = value;
  }
  return out;
};

export async function POST(request: Request) {
  let body: { query?: unknown; variables?: unknown };
  try {
    body = (await request.json()) as { query?: unknown; variables?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const queryName = typeof body.query === "string" ? body.query : "";
  const query = QUERIES[queryName];
  if (!query) {
    return NextResponse.json(
      { error: `Unknown query "${queryName}".` },
      { status: 400 },
    );
  }

  const variables = sanitizeVariables(body.variables);
  if (!variables) {
    return NextResponse.json(
      { error: "Variables must be an object of short string values." },
      { status: 400 },
    );
  }

  const result = await fetchSitecoreEdge<Record<string, unknown>>({
    query,
    variables,
  });

  // Edge context id not configured — graceful degradation signal.
  if (!result) {
    return NextResponse.json({ data: null, configured: false });
  }

  return NextResponse.json({
    data: result.data ?? null,
    configured: true,
    ...(result.errors?.length
      ? { errors: result.errors.map((e) => ({ message: e.message })) }
      : {}),
  });
}
