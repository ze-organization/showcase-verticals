import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  type LanguageModel,
  streamText,
  type UIMessage,
} from "ai";

/**
 * BFF streaming endpoint that backs the `AIChat` component. Accepts the
 * Vercel AI SDK `useChat` request body and proxies it to the active LLM
 * provider via `streamText`, returning a UI-message-stream response that
 * the client consumes with `useChat`.
 *
 * **Provider selection.** The two providers are interchangeable.
 * Resolution at request time:
 *   1. If `ANTHROPIC_API_KEY` is set → Anthropic (Claude Sonnet by default).
 *   2. Else if `OPENAI_API_KEY` is set → OpenAI (gpt-4o-mini by default).
 *   3. Else → deterministic mock stream tagged `[ai-chat:demo]`.
 *
 * Customers configure either key in the registry app's Settings page;
 * the install pipeline writes whichever the org has stored into the
 * customer's `.env` so their installed AI Chat keeps the same provider.
 *
 * **Abort.** `useChat`'s `stop()` aborts the underlying request; we
 * thread the request's `AbortSignal` into both the LLM call and the
 * demo loop so cancelled responses stop emitting tokens immediately.
 */
export const runtime = "nodejs";

interface AIChatRequestBody {
  messages?: UIMessage[];
  system?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  /**
   * Sitecore Search source id (from the picker app). When present, the
   * BFF runs a retrieval query against this source on every turn and
   * prepends the matches as a `## Knowledge` section on the system
   * prompt before forwarding to `streamText`.
   */
  searchSourceId?: string;
  searchTopK?: number;
}

const DEMO_TAG = "[ai-chat:demo]";
const DEMO_CHUNK_DELAY_MS = 40;
const DEFAULT_SEARCH_TOP_K = 5;
const MAX_SEARCH_TOP_K = 25;
const DEFAULT_SEARCH_ENDPOINT = "https://edge-platform.sitecorecloud.io/search";

// ─────────────────────────────────────────────────────────────────────
// Cost guards
//
// Three layers protect the provider quota from runaway bills:
//
//   1. **BFF input clamps** (constants below): cap incoming body size,
//      message count + per-message length, system-prompt length, and
//      maxOutputTokens. Force `model` through an allowlist so a client
//      can't upgrade itself from gpt-4o-mini to gpt-4o or claude-opus
//      mid-flight.
//
//   2. **Per-IP rate limit** (checkIpRateLimit): 20 requests / 60s, keyed
//      on the forwarded client IP. Two backends, chosen once at module
//      load by env-var presence:
//        - **KV-backed sliding window** (@upstash/ratelimit + @upstash/redis)
//          when KV_REST_API_URL/KV_REST_API_TOKEN (Vercel KV) or
//          UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN are present. This
//          makes the cap GLOBAL across regions/instances and survives
//          deploys + cold starts — the production posture.
//        - **In-memory fixed window** (rateLimitForIp) otherwise. Fine for a
//          single-region deploy and required for local dev / tests / any
//          deploy without KV provisioned — warm instances share the Map
//          across requests; cold starts reset, acceptable noise at this rate.
//      Activation is decided by env presence at load (kvRatelimit); a missing
//      KV config never throws — it transparently falls back to the Map.
//
//   3. **Per-visitor daily turn cap** (visitor cookie): HMAC-signed
//      cookie carries `{ visitorId, count, day }`. Refuses turns beyond
//      `MAX_TURNS_PER_VISITOR_PER_DAY` until the day rolls over. Also
//      survives a deploy because state lives client-side.
//
// All three return descriptive JSON errors so the chat UI shows the
// reason rather than a generic streaming failure.

/** Max raw request-body bytes. 2 MB covers a multi-turn conversation
 * with several large text attachments composed into the system prompt;
 * reject anything bigger as an obvious over-stuff attack. */
const MAX_REQUEST_BODY_BYTES = 2_000_000;
/** Keep at most this many trailing messages. Older history is dropped
 * silently — beyond this, the LLM has forgotten the early turns anyway. */
const MAX_MESSAGES = 30;
/** Per-message body cap. Most chat messages are < 1 KB; 8 KB tolerates
 * a copy-pasted snippet without enabling 100 KB single-shot flooding. */
const MAX_MESSAGE_LENGTH = 8_000;
/** System prompt cap. Page context + SystemPrompt field + Skills +
 * Context items + attachments compose to ~10s of KB normally; 400 KB
 * (~100K tokens) leaves room for sizeable text attachments without
 * enabling multi-MB system-prompt floods. */
const MAX_SYSTEM_LENGTH = 400_000;
/** Hard ceiling on output tokens regardless of what the client asks for. */
const MAX_OUTPUT_TOKENS = 2_048;
/** Sampling-temperature clamp window. */
const MIN_TEMPERATURE = 0;
const MAX_TEMPERATURE = 2;

/** Provider-specific model allowlists. A client-supplied model id has
 * to appear in the matching set or it falls back to the provider's
 * default — same outcome as a cross-provider id, just enforced
 * explicitly so a malicious caller can't slip "claude-opus" past us. */
const ALLOWED_OPENAI_MODELS = new Set<string>([
  "gpt-4o-mini",
  "gpt-4o",
  "gpt-4.1-mini",
]);
const ALLOWED_ANTHROPIC_MODELS = new Set<string>([
  "claude-sonnet-4-6",
  "claude-3-5-haiku-latest",
  "claude-3-5-sonnet-latest",
]);

/** Per-IP sliding-window rate limit. 20 requests per 60s ≈ 1 request
 * every 3 seconds sustained — generous for a real conversation, well
 * below what a bot would push. */
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;

/** Per-visitor daily turn cap. 50 turns ≈ ~5 long conversations a day
 * before the visitor has to wait until midnight UTC. */
const MAX_TURNS_PER_VISITOR_PER_DAY = 50;
const VISITOR_COOKIE_NAME = "ai_chat_visitor";
const VISITOR_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days
const VISITOR_COOKIE_SECRET = (
  process.env.AI_CHAT_VISITOR_SECRET ?? "dev-only-secret-rotate-me"
).trim();

interface RateLimitBucket {
  count: number;
  resetAt: number;
}
const rateLimitBuckets = new Map<string, RateLimitBucket>();
let lastRateLimitSweep = Date.now();

/** Periodically evict expired buckets so the Map can't grow unboundedly
 * over the life of a warm instance. Runs at most once per minute. */
function sweepRateLimitBuckets(now: number) {
  if (now - lastRateLimitSweep < RATE_LIMIT_WINDOW_MS) return;
  lastRateLimitSweep = now;
  for (const [ip, bucket] of rateLimitBuckets) {
    if (bucket.resetAt <= now) rateLimitBuckets.delete(ip);
  }
}

/** Resolve the client IP from the proxy chain. Vercel populates
 * `x-forwarded-for` (comma-joined chain) and `x-real-ip` (single value);
 * the first entry of `x-forwarded-for` is the client. Falls back to
 * "unknown" — better to share one bucket between unidentifiable callers
 * than to silently disable the limit. */
function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = request.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

/** Sliding-window rate-limit check. Returns `{ allowed: true }` and
 * decrements the bucket on success; `{ allowed: false, retryAfter }`
 * when the bucket is empty so the caller can return 429. */
function rateLimitForIp(ip: string): {
  allowed: boolean;
  retryAfterSeconds: number;
} {
  const now = Date.now();
  sweepRateLimitBuckets(now);
  let bucket = rateLimitBuckets.get(ip);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
    rateLimitBuckets.set(ip, bucket);
  }
  if (bucket.count >= RATE_LIMIT_MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }
  bucket.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

/** Resolve the KV REST credentials from either the Vercel KV
 * (`KV_REST_API_URL`/`KV_REST_API_TOKEN`) or raw Upstash
 * (`UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN`) env naming. Returns
 * `null` when neither pair is fully present — the signal to fall back to the
 * in-memory limiter. Decided once at module load (see `kvRatelimit`). */
function resolveKvCredentials(): { url: string; token: string } | null {
  const url = (
    process.env.KV_REST_API_URL ??
    process.env.UPSTASH_REDIS_REST_URL ??
    ""
  ).trim();
  const token = (
    process.env.KV_REST_API_TOKEN ??
    process.env.UPSTASH_REDIS_REST_TOKEN ??
    ""
  ).trim();
  if (!url || !token) return null;
  return { url, token };
}

/** Distributed sliding-window limiter, constructed once at module load when
 * KV env vars are present. `null` → in-memory fallback. Building the client
 * never reaches the network, so a misconfigured-but-present env can't crash
 * the route at import time; a failed `limit()` call is caught per-request and
 * also falls back. */
const kvRatelimit: Ratelimit | null = (() => {
  const creds = resolveKvCredentials();
  if (!creds) return null;
  try {
    const redis = new Redis({ url: creds.url, token: creds.token });
    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(RATE_LIMIT_MAX_REQUESTS, "60 s"),
      analytics: true,
      prefix: "ai-chat:ratelimit",
    });
  } catch {
    // Construction failed (e.g. malformed URL) — degrade to the in-memory
    // limiter rather than 500-ing every request.
    return null;
  }
})();

/** Per-IP rate-limit check. Uses the KV-backed sliding window when
 * configured (global across regions, survives deploys), otherwise the
 * in-memory fixed window. A KV transport error falls back to the in-memory
 * limiter for that request so a transient KV outage doesn't open the gate
 * unbounded. */
async function checkIpRateLimit(
  ip: string,
): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  if (kvRatelimit) {
    try {
      const { success, reset } = await kvRatelimit.limit(ip);
      if (success) return { allowed: true, retryAfterSeconds: 0 };
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((reset - Date.now()) / 1000),
      );
      return { allowed: false, retryAfterSeconds };
    } catch {
      // KV unreachable mid-request — fall through to the in-memory limiter
      // so we still apply *some* cap rather than failing open.
      return rateLimitForIp(ip);
    }
  }
  return rateLimitForIp(ip);
}

interface VisitorPayload {
  /** Opaque per-visitor handle so audit logs can correlate without
   * exposing IPs in the cookie. */
  visitorId: string;
  /** Turns consumed during `day`. Reset when day rolls over. */
  count: number;
  /** UTC date in YYYY-MM-DD form. Matches Edge-side daily quota windows. */
  day: string;
}

function todayUtcKey(): string {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** HMAC-sign the visitor payload. The signature defends against a
 * client editing the count to bypass the cap; without the secret a
 * forged cookie fails `verifyVisitorCookie`. */
function encodeVisitorCookie(payload: VisitorPayload): string {
  const json = JSON.stringify(payload);
  const body = Buffer.from(json, "utf8").toString("base64url");
  const sig = createHmac("sha256", VISITOR_COOKIE_SECRET)
    .update(body)
    .digest("base64url");
  return `${body}.${sig}`;
}

function decodeVisitorCookie(raw: string | undefined): VisitorPayload | null {
  if (!raw) return null;
  const dot = raw.indexOf(".");
  if (dot <= 0) return null;
  const body = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);
  const expected = createHmac("sha256", VISITOR_COOKIE_SECRET)
    .update(body)
    .digest("base64url");
  // Constant-time compare so the signature check doesn't leak length
  // information through response timing.
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length) return null;
  if (!timingSafeEqual(sigBuf, expBuf)) return null;
  try {
    const json = Buffer.from(body, "base64url").toString("utf8");
    const parsed = JSON.parse(json) as Partial<VisitorPayload>;
    if (
      typeof parsed.visitorId !== "string" ||
      typeof parsed.count !== "number" ||
      typeof parsed.day !== "string"
    ) {
      return null;
    }
    return {
      visitorId: parsed.visitorId,
      count: parsed.count,
      day: parsed.day,
    };
  } catch {
    return null;
  }
}

/** Read the visitor cookie off `Cookie`. Returns the parsed payload or
 * a fresh empty one when missing / forged / from a different day. */
function readVisitorState(request: Request): VisitorPayload {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const today = todayUtcKey();
  for (const part of cookieHeader.split(/;\s*/)) {
    const eq = part.indexOf("=");
    if (eq < 0) continue;
    if (part.slice(0, eq) !== VISITOR_COOKIE_NAME) continue;
    const decoded = decodeVisitorCookie(part.slice(eq + 1));
    if (!decoded) break;
    if (decoded.day !== today) {
      return { visitorId: decoded.visitorId, count: 0, day: today };
    }
    return decoded;
  }
  return { visitorId: randomUUID(), count: 0, day: today };
}

/** Build the `Set-Cookie` header for the updated visitor state. */
function visitorCookieHeader(payload: VisitorPayload): string {
  const value = encodeVisitorCookie(payload);
  return `${VISITOR_COOKIE_NAME}=${value}; Path=/; Max-Age=${VISITOR_COOKIE_MAX_AGE_SECONDS}; HttpOnly; SameSite=Lax`;
}

function clampToRange(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

/** Per-message + per-conversation size enforcement. Returns a short
 * error message when the request should be rejected, or `null` when
 * the messages are within budget. Trims `messages` in-place to the
 * trailing N turns so older history is dropped silently rather than
 * 4xx-ing a normal long chat. */
function validateMessages(messages: UIMessage[]): string | null {
  if (messages.length > MAX_MESSAGES) {
    messages.splice(0, messages.length - MAX_MESSAGES);
  }
  for (const message of messages) {
    let total = 0;
    for (const part of message.parts ?? []) {
      if (part.type === "text") total += part.text.length;
    }
    if (total > MAX_MESSAGE_LENGTH) {
      return `A message exceeds ${MAX_MESSAGE_LENGTH} characters. Shorten it and try again.`;
    }
  }
  return null;
}

function jsonError(
  status: number,
  message: string,
  extraHeaders: HeadersInit = {},
): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "content-type": "application/json", ...extraHeaders },
  });
}

/**
 * Sitecore Search runtime hit. Shape mirrors the
 * `SearchRuntimeResponse.content[]` documented in the reference
 * search-configuration app. Fields beyond the ones we read are
 * deliberately permissive — the schema varies by source.
 */
interface SearchRuntimeHit {
  id?: string;
  url?: string;
  name?: string;
  title?: string;
  description?: string;
  summary?: string;
  content?: string;
  body?: string;
  [key: string]: unknown;
}

interface SearchRuntimeResponse {
  content?: SearchRuntimeHit[];
}

function clampTopK(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return DEFAULT_SEARCH_TOP_K;
  }
  const rounded = Math.floor(value);
  if (rounded <= 0) return DEFAULT_SEARCH_TOP_K;
  return Math.min(rounded, MAX_SEARCH_TOP_K);
}

function pickHitText(hit: SearchRuntimeHit): string {
  // Try the conventional text-bearing fields in order. Sources vary —
  // a "content" source typically has body/content; a "site" source
  // (web crawl) often has only description + url.
  const text =
    hit.summary ??
    hit.description ??
    hit.body ??
    hit.content ??
    hit.title ??
    hit.name;
  if (typeof text === "string") return text.trim();
  return "";
}

function pickHitLabel(hit: SearchRuntimeHit, index: number): string {
  const label = hit.title ?? hit.name ?? hit.id;
  return typeof label === "string" && label.trim().length > 0
    ? label.trim()
    : `Result ${index + 1}`;
}

/**
 * Fire a Sitecore Search runtime query for the latest user message and
 * format the top-N hits as a Markdown block. Returns `undefined` when
 * retrieval is disabled or the call fails — failure must be soft so
 * a missing context id (preview without env wiring) doesn't break the
 * chat. Mirrors the request contract from
 * `~/Downloads/sitecore.xmapps.searchconfiguration-master/src/lib/search-indexing/hooks/use-get-search-runtime.ts`.
 */
async function fetchSearchContext({
  query,
  configId,
  topK,
  signal,
}: {
  query: string;
  configId: string;
  topK: number;
  signal: AbortSignal;
}): Promise<string | undefined> {
  const contextId = (
    process.env.SITECORE_EDGE_CONTEXT_ID ??
    process.env.NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID ??
    ""
  ).trim();
  if (!contextId) return undefined;
  const endpoint = (
    process.env.SITECORE_EDGE_SEARCH_URL ?? DEFAULT_SEARCH_ENDPOINT
  ).trim();
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      signal,
      headers: {
        "content-type": "application/json",
        "x-sitecore-contextid": contextId,
      },
      body: JSON.stringify({
        config: { id: configId },
        query: { keyphrase: query },
        limit: topK,
      }),
    });
    if (!response.ok) return undefined;
    const payload = (await response.json()) as SearchRuntimeResponse;
    const hits = Array.isArray(payload.content) ? payload.content : [];
    if (hits.length === 0) return undefined;
    const blocks: string[] = [];
    for (let index = 0; index < hits.length; index += 1) {
      const hit = hits[index] ?? {};
      const text = pickHitText(hit);
      if (!text) continue;
      const label = pickHitLabel(hit, index);
      const url =
        typeof hit.url === "string" && hit.url.trim().length > 0
          ? ` (${hit.url.trim()})`
          : "";
      blocks.push(`### ${label}${url}\n${text}`);
    }
    if (blocks.length === 0) return undefined;
    return [
      "## Knowledge",
      "Use the following search results from the configured Sitecore Search source to ground your answer. Quote the source label when you cite a fact. If the results don't cover the question, say so plainly.",
      "",
      blocks.join("\n\n"),
    ].join("\n");
  } catch {
    // Network error, abort, malformed JSON — silently fall back to
    // ungrounded chat. The caller already has a non-retrieval system
    // prompt to work with.
    return undefined;
  }
}

type ResolvedProvider = {
  name: "anthropic" | "openai";
  /** Default model id when the request body omits one. */
  defaultModel: string;
  /** Builds the language-model handle for `streamText`. */
  resolveModel: (modelId: string) => LanguageModel;
};

/**
 * Resolve which provider to use for this request. Anthropic wins ties;
 * the deploy's env vars are the source of truth — there's no per-request
 * org-scoped lookup on this route (the showcase preview uses the
 * platform's deploy-time key; customer installed repos get their org's
 * key written into `.env` at install time).
 */
function resolveActiveProvider(): ResolvedProvider | null {
  const anthropicKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (anthropicKey) {
    const baseURL = process.env.ANTHROPIC_BASE_URL?.trim();
    const provider = createAnthropic({
      apiKey: anthropicKey,
      ...(baseURL ? { baseURL } : {}),
    });
    return {
      name: "anthropic",
      defaultModel: "claude-sonnet-4-6",
      resolveModel: (modelId) => provider(modelId),
    };
  }
  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  if (openaiKey) {
    const baseURL = process.env.OPENAI_BASE_URL?.trim();
    const provider = createOpenAI({
      apiKey: openaiKey,
      ...(baseURL ? { baseURL } : {}),
    });
    return {
      name: "openai",
      defaultModel: "gpt-4o-mini",
      resolveModel: (modelId) => provider(modelId),
    };
  }
  return null;
}

function pickMockReply(userInput: string): string {
  const normalized = userInput.toLowerCase();
  if (normalized.includes("price") || normalized.includes("cost")) {
    return `${DEMO_TAG} I can help compare pricing. Tell me your budget range and preferred features and I'll suggest a shortlist.`;
  }
  if (normalized.includes("destination") || normalized.includes("travel")) {
    return `${DEMO_TAG} Great idea. Share your season and travel style and I'll suggest destinations with activities, weather, and planning tips.`;
  }
  if (normalized.includes("product") || normalized.includes("compare")) {
    return `${DEMO_TAG} Sure. Share product names or requirements and I can break down the key differences side by side.`;
  }
  return `${DEMO_TAG} Set ANTHROPIC_API_KEY or OPENAI_API_KEY to enable real responses. In the meantime I'm a deterministic mock that streams a stock reply word-by-word.`;
}

function lastUserText(messages: UIMessage[]): string {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message?.role !== "user") continue;
    for (const part of message.parts ?? []) {
      if (part.type === "text") return part.text;
    }
  }
  return "";
}

function demoStreamResponse(
  messages: UIMessage[],
  signal: AbortSignal,
): Response {
  const reply = pickMockReply(lastUserText(messages));
  const tokens = reply.split(" ");
  const textId = `demo-text-${Date.now()}`;

  const stream = createUIMessageStream({
    async execute({ writer }) {
      writer.write({ type: "start" });
      writer.write({ type: "text-start", id: textId });
      for (let index = 0; index < tokens.length; index += 1) {
        if (signal.aborted) break;
        const token = tokens[index] ?? "";
        const delta = index === 0 ? token : ` ${token}`;
        writer.write({ type: "text-delta", id: textId, delta });
        await new Promise<void>((resolve) =>
          setTimeout(resolve, DEMO_CHUNK_DELAY_MS),
        );
      }
      writer.write({ type: "text-end", id: textId });
      writer.write({ type: "finish" });
    },
  });

  return createUIMessageStreamResponse({ stream });
}

/** Layers 2 + 3: per-IP rate limit (KV-backed when configured, in-memory
 * otherwise) and per-visitor daily cap. Returns a 429 `Response` when either
 * gate trips, otherwise the parsed visitor state for the caller to
 * increment. Async because the KV limiter does a network round-trip. */
async function checkRequestQuotas(
  request: Request,
): Promise<{ error: Response } | { visitor: VisitorPayload }> {
  const limit = await checkIpRateLimit(getClientIp(request));
  if (!limit.allowed) {
    return {
      error: jsonError(
        429,
        `Too many requests. Try again in ${limit.retryAfterSeconds} seconds.`,
        { "retry-after": String(limit.retryAfterSeconds) },
      ),
    };
  }

  const visitor = readVisitorState(request);
  if (visitor.count >= MAX_TURNS_PER_VISITOR_PER_DAY) {
    return {
      error: jsonError(
        429,
        `Daily message limit reached (${MAX_TURNS_PER_VISITOR_PER_DAY} per day). Try again tomorrow.`,
      ),
    };
  }
  return { visitor };
}

/** Layers 1a + 1b: read + size-cap the raw body, parse it, and validate
 * the message list (trimming history in-place). Returns an error
 * `Response` on rejection, otherwise the validated body + messages. */
async function readAndValidateBody(
  request: Request,
): Promise<
  { error: Response } | { body: AIChatRequestBody; messages: UIMessage[] }
> {
  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return { error: jsonError(400, "Failed to read request body.") };
  }
  if (raw.length > MAX_REQUEST_BODY_BYTES) {
    return {
      error: jsonError(
        413,
        `Request body exceeds ${MAX_REQUEST_BODY_BYTES} bytes.`,
      ),
    };
  }

  let body: AIChatRequestBody;
  try {
    body = JSON.parse(raw) as AIChatRequestBody;
  } catch {
    return { error: jsonError(400, "Invalid JSON body.") };
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0) {
    return { error: jsonError(400, "messages is required.") };
  }

  const messagesError = validateMessages(messages);
  if (messagesError) {
    return { error: jsonError(413, messagesError) };
  }
  return { body, messages };
}

/** Layer 1c: clamp the client-supplied system prompt, then append a
 * Sitecore Search `## Knowledge` block when a search source is wired. */
async function composeSystemPrompt(
  body: AIChatRequestBody,
  messages: UIMessage[],
  signal: AbortSignal,
): Promise<string | undefined> {
  const rawClientSystem =
    typeof body.system === "string" && body.system.trim().length > 0
      ? body.system
      : undefined;
  const clientSystem =
    rawClientSystem && rawClientSystem.length > MAX_SYSTEM_LENGTH
      ? rawClientSystem.slice(0, MAX_SYSTEM_LENGTH)
      : rawClientSystem;

  const searchSourceId =
    typeof body.searchSourceId === "string" && body.searchSourceId.trim()
      ? body.searchSourceId.trim()
      : undefined;
  const userQuery = searchSourceId ? lastUserText(messages) : "";
  const searchContext =
    searchSourceId && userQuery
      ? await fetchSearchContext({
          query: userQuery,
          configId: searchSourceId,
          topK: clampTopK(body.searchTopK),
          signal,
        })
      : undefined;

  return clientSystem && searchContext
    ? `${clientSystem}\n\n${searchContext}`
    : (searchContext ?? clientSystem);
}

/** Layers 1d + 1e: resolve the model id off the provider allowlist and
 * clamp temperature + maxOutputTokens into the server-safe window. */
function resolveModelAndSampling(
  body: AIChatRequestBody,
  provider: ResolvedProvider,
): {
  modelId: string;
  temperature: number | undefined;
  maxOutputTokens: number;
} {
  const requestedModel =
    typeof body.model === "string" && body.model.trim().length > 0
      ? body.model.trim()
      : undefined;
  const allowlist =
    provider.name === "anthropic"
      ? ALLOWED_ANTHROPIC_MODELS
      : ALLOWED_OPENAI_MODELS;
  const modelId =
    requestedModel && allowlist.has(requestedModel)
      ? requestedModel
      : provider.defaultModel;

  const temperature =
    typeof body.temperature === "number"
      ? clampToRange(body.temperature, MIN_TEMPERATURE, MAX_TEMPERATURE)
      : undefined;
  const maxOutputTokens =
    typeof body.maxTokens === "number"
      ? Math.floor(clampToRange(body.maxTokens, 1, MAX_OUTPUT_TOKENS))
      : MAX_OUTPUT_TOKENS;

  return { modelId, temperature, maxOutputTokens };
}

export async function POST(request: Request) {
  // ─── Layers 2 + 3: per-IP rate limit + per-visitor daily turn cap ──
  const quota = await checkRequestQuotas(request);
  if ("error" in quota) return quota.error;
  const { visitor } = quota;

  // ─── Layers 1a + 1b: read, size-cap, parse, validate the body ─────
  const parsed = await readAndValidateBody(request);
  if ("error" in parsed) return parsed.error;
  const { body, messages } = parsed;

  // Set-Cookie carries the incremented visitor state back to the
  // client on every successful response. Increment AFTER all hard
  // rejects so a request that 4xx'd doesn't consume the daily budget.
  const visitorCookie = visitorCookieHeader({
    ...visitor,
    count: visitor.count + 1,
  });

  // No provider key configured → deterministic mock so the showcase
  // renders end-to-end without paid credentials. The demo path still
  // consumes a visitor turn so the cap exercises the same in dev.
  const provider = resolveActiveProvider();
  if (!provider) {
    const response = demoStreamResponse(messages, request.signal);
    response.headers.append("set-cookie", visitorCookie);
    return response;
  }

  const system = await composeSystemPrompt(body, messages, request.signal);
  const { modelId, temperature, maxOutputTokens } = resolveModelAndSampling(
    body,
    provider,
  );

  const result = streamText({
    model: provider.resolveModel(modelId),
    system,
    messages: await convertToModelMessages(messages),
    temperature,
    maxOutputTokens,
    abortSignal: request.signal,
  });

  const response = result.toUIMessageStreamResponse();
  // Stamp the updated visitor cookie on the streaming response so the
  // next turn sees the incremented count.
  response.headers.append("set-cookie", visitorCookie);
  return response;
}
