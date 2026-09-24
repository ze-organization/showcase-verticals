"use client";

import { type ReactNode, useMemo } from "react";
import { lookupEvent } from "./cdp-events";

/**
 * Module-level CDP tracker. There used to be a `<CdpAnalyticsProvider>`
 * here that exposed `track` via React context, but the context did no
 * actual React-state work — SDK init was already a module-level
 * `Promise` singleton, and the only state on the provider (`ready`)
 * was just `await initPromise` in disguise.
 *
 * Removing the context means every starter — including the Sitecore
 * Content SDK starter the orchestrator builds, whose layout chain mounts
 * `Bootstrap.tsx` inside `app/[site]/layout.tsx` rather than the root
 * `app/layout.tsx` — gets event dispatch for free, without an install-
 * time codemod to wrap the right layout file. Components import
 * `useComponentAnalytics`, call `.fire(event, meta)`, and dispatch goes
 * straight to the SDK.
 *
 * Backward compatibility:
 *   - `CdpAnalyticsProvider` still exports as a no-op passthrough so
 *     consumer starters that already installed the older file with the
 *     real provider keep building (their `<CdpAnalyticsProvider>` in
 *     the root layout simply becomes `<>{children}</>`).
 *   - `useCdpTrack()` still exports and returns the same `CdpTrack`
 *     shape so any direct callers continue to work.
 */
export type CdpTrack = (
  componentName: string,
  eventName: string,
  meta?: Record<string, unknown>,
) => void;

/**
 * SDK init singleton. `initContentSdk` registers a global core-context;
 * calling it twice (StrictMode double-effect, fast-refresh re-mount,
 * concurrent first-track races) wastes work and emits a console
 * warning. The promise collapses parallel callers onto the first init.
 *
 * On the server, SDK init is a no-op — the events plugin needs a
 * browser-side cookie + clientId so dispatching from RSC is meaningless.
 */
let initPromise: Promise<boolean> | null = null;

/**
 * Site for this visit, registered by `Bootstrap` from the `[site]`
 * route param. That is the site the request actually resolved to, so a
 * differently named site in another environment is used as-is.
 */
let registeredSiteName: string | undefined;

/**
 * Resolved by Bootstrap after its single `initContentSdk` call.
 * A second init replaces the SDK context and events then go out with
 * an empty `browser_id`, which Edge rejects.
 */
let hostSdkReady: Promise<boolean> | null = null;
let resolveHostSdk: ((ready: boolean) => void) | null = null;

function hostSdkPromise(): Promise<boolean> {
  if (!hostSdkReady) {
    hostSdkReady = new Promise((resolve) => {
      resolveHostSdk = resolve;
    });
  }
  return hostSdkReady;
}

/**
 * Remember the site Bootstrap is initializing the SDK with. Called
 * during render, before child effects fire events, so a first-track
 * init uses the same site name as the page view.
 */
export function registerCdpSiteName(siteName: string | undefined): void {
  const trimmed = siteName?.trim();
  if (trimmed) registeredSiteName = trimmed;
}

/**
 * Bootstrap finished (or skipped) SDK init. Component events and page
 * views wait on this so they share that one initialized client.
 */
export function markCdpSdkReady(ready: boolean): void {
  hostSdkPromise();
  resolveHostSdk?.(ready);
  resolveHostSdk = null;
}

/** Resolves once the host SDK init has settled. False when init was skipped. */
export function whenCdpSdkReady(): Promise<boolean> {
  if (registeredSiteName) return hostSdkPromise();
  return ensureSdkInitialized();
}

/**
 * Site id sent on every Edge event (`?siteId=`). Prefer the route site,
 * then an explicit env override, then the deployment's default site.
 * Never invent a name — a hardcoded fallback opens a second session
 * under a site this environment does not have.
 */
function readSiteName(): string | undefined {
  const fromRoute = registeredSiteName?.trim();
  if (fromRoute) return fromRoute;
  const fromEnv = (process.env.NEXT_PUBLIC_SITECORE_SITE_NAME ?? "").trim();
  if (fromEnv) return fromEnv;
  const fromDefault = (process.env.NEXT_PUBLIC_DEFAULT_SITE_NAME ?? "").trim();
  return fromDefault.length > 0 ? fromDefault : undefined;
}

/**
 * Resolve the Sitecore context id. Reads the same env vars the rest of
 * the build chain uses (see `src/lib/registry/generate-enum-manifest.mjs`)
 * — the prefixed `NEXT_PUBLIC_` form is the canonical client-side name.
 *
 * When unset we treat it as **demo mode**: no SDK init, the dispatcher
 * falls through to a `console.debug` log so the event flow stays visible
 * in dev without a real CDP tenant attached.
 */
function readContextId(): string | undefined {
  const id = (process.env.NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID ?? "").trim();
  return id.length > 0 ? id : undefined;
}

function isCdpDebugEnabled(): boolean {
  const flag = (process.env.NEXT_PUBLIC_CDP_DEBUG ?? "").trim().toLowerCase();
  return ["1", "true", "yes", "on"].includes(flag);
}

/**
 * Read browser-side context that every event should carry — the page
 * the visitor was on when the interaction happened, plus where they
 * came from. Sitecore's events plugin already auto-fills `page` with
 * the last URL segment (see `pageName()` in analytics-core); we add the
 * full `pathname`, full `href`, and `referrer` because personalization
 * rules typically need more than the last segment to scope decisions.
 *
 * Returns an empty object on the server / outside a browser so the
 * tracker stays safe to call from any rendering context.
 */
function autoEnrichBrowserContext(): Record<string, unknown> {
  if (typeof window === "undefined") return {};
  const enriched: Record<string, unknown> = {
    pathname: window.location.pathname,
    href: window.location.href,
  };
  // Skip empty referrers — those happen on direct navigation and just
  // add noise to the payload.
  if (typeof document !== "undefined" && document.referrer) {
    enriched.referrer = document.referrer;
  }
  return enriched;
}

/**
 * Initialize the Content SDK's events plugin once per browser session.
 * Returns true when the SDK is wired up and `event()` will hit the
 * real Edge Proxy; false in demo mode.
 *
 * Some starters (notably the Sitecore Content SDK app-router starter)
 * already call `initContentSdk` themselves from their own `Bootstrap.tsx`.
 * In that case our init throws an "already initialized" error which we
 * treat as success — the SDK is ready either way and `event()` will
 * dispatch correctly.
 */
async function ensureSdkInitialized(): Promise<boolean> {
  if (initPromise) return initPromise;
  if (typeof window === "undefined") {
    initPromise = Promise.resolve(false);
    return initPromise;
  }
  // Bootstrap owns init in this head app. A second initContentSdk
  // replaces the context, and events sent through the replacement
  // leave with an empty browser_id (Edge 400).
  if (registeredSiteName) {
    initPromise = hostSdkPromise();
    return initPromise;
  }
  const contextId = readContextId();
  const siteName = readSiteName();
  if (!contextId || !siteName) {
    return false;
  }
  initPromise = (async () => {
    try {
      // `initContentSdk` is re-exported from `nextjs` (the direct dep);
      // `@sitecore-content-sdk/core` is transitive and not bundleable
      // from a direct import here. `eventsPlugin` declares a hard
      // dependency on `analyticsPlugin` — init throws [IE-001] without
      // it. The browser adapter wires the cookie + clientId reads to
      // `document.cookie` / `window`.
      const [
        { initContentSdk },
        { eventsPlugin },
        { analyticsPlugin, analyticsBrowserAdapter },
      ] = await Promise.all([
        import("@sitecore-content-sdk/nextjs"),
        import("@sitecore-content-sdk/events"),
        import("@sitecore-content-sdk/analytics-core"),
      ]);
      await initContentSdk({
        config: {
          contextId,
          siteName,
        },
        plugins: [
          analyticsPlugin({
            options: {
              enableCookie: true,
              // Without `cookieDomain` the analytics plugin doesn't write the
              // `sc_analytics_session_id` cookie, the events plugin can't
              // populate `browser_id`, and Sitecore Edge rejects every event
              // with 400 "Invalid UUID string". Match the SDK starter's
              // `Bootstrap.tsx`: strip the leading `www.` so subdomains
              // share the same browser id.
              cookieDomain: window.location.hostname.replace(/^www\./, ""),
            },
            adapter: analyticsBrowserAdapter(),
          }),
          eventsPlugin(),
        ],
      });
      return true;
    } catch (error) {
      // The SDK throws when init runs a second time. Treat that as a
      // success — whichever caller initialized first wins, and `event()`
      // works the same on the global context either way.
      const message = error instanceof Error ? error.message : String(error);
      if (
        /already initialized/i.test(message) ||
        /ALREADY_INITIALIZED/i.test(message)
      ) {
        return true;
      }
      console.error("[cdp] SDK init failed; falling back to demo mode", error);
      return false;
    }
  })();
  return initPromise;
}

/**
 * Module-level loud-noop guard. The catalog-miss warning fires per
 * `(component,event)` key the first time the lookup misses, then stays
 * quiet for that key. Without the guard, a chatty placement (e.g. an
 * `<AIChat>` firing five events per turn) would spam the console with
 * the same warning over and over.
 */
const _missingEventWarned = new Set<string>();

/**
 * Fire a CDP event for `(componentName, eventName)`. Module-level so
 * it works from any client component without a provider wrapping the
 * tree. Looks up the event in the recipe-aggregated catalog (populated
 * by each component's `registerCdpRecipe(...)` call at module load),
 * lazily initializes the Sitecore Content SDK on first call, and
 * dispatches via `event()` with auto-enriched page context.
 *
 * Misspelled keys log a dev-mode warning (once per key) and are
 * silently dropped in production — runtime never throws. Initialization
 * failures and network rejections also degrade silently.
 */
export function trackCdpEvent(
  componentName: string,
  eventName: string,
  meta?: Record<string, unknown>,
): void {
  const entry = lookupEvent(componentName, eventName);
  if (!entry) {
    const key = `${componentName}.${eventName}`;
    if (
      process.env.NODE_ENV !== "production" &&
      !_missingEventWarned.has(key) &&
      typeof console !== "undefined"
    ) {
      _missingEventWarned.add(key);
      console.warn(
        `[cdp] no event registered for "${key}". Make sure the component's .tsx calls registerCdpRecipe(<recipe>) at module load — see src/lib/registry/analytics/cdp-events.ts.`,
      );
    }
    return;
  }
  if (entry.deprecated && process.env.NODE_ENV !== "production") {
    console.warn(
      `[cdp] event "${componentName}.${eventName}" (${entry.type}) is deprecated.`,
    );
  }

  // Auto-enrich every event with page context so individual components
  // don't repeat themselves. Component-supplied meta keys win on
  // conflict, so a component can always override.
  const autoMeta = autoEnrichBrowserContext();
  const enriched = { ...autoMeta, ...(meta ?? {}) };

  // Opt-in payload dump so local verification does not require
  // inspecting Edge network calls. Off unless NEXT_PUBLIC_CDP_DEBUG
  // is a truthy string (`1` / `true` / `yes` / `on`).
  if (isCdpDebugEnabled() && typeof console !== "undefined") {
    console.log("[cdp:debug]", entry.type, enriched);
  }

  // Fire-and-forget: init failures, ad-blockers, and network blips
  // must never break the UI interaction the event was tracking.
  ensureSdkInitialized()
    .then((ready) => {
      if (!ready) {
        if (process.env.NODE_ENV !== "production") {
          console.debug("[cdp:demo]", entry.type, enriched);
        }
        return;
      }
      return dispatchToSdk(componentName, entry, enriched);
    })
    .catch(() => {
      // Dynamic import / init rejected — already logged above.
    });
}

/**
 * Route a catalog-resolved fire to the right `@sitecore-content-sdk/events`
 * function. `cdpEventType` on the catalog entry picks the lane:
 *
 *   VIEW             → pageView()
 *   IDENTITY         → identity()   (meta must carry top-level email
 *                                    / phone / identifiers fields)
 *   FORM_VIEWED      → form(formId, 'VIEWED', instanceId)
 *   FORM_SUBMITTED   → form(formId, 'SUBMITTED', instanceId)
 *   everything else  → event(type, ...)  (canonical OOTB types like
 *                                         ADD / CONFIRM ride here too)
 *
 * Recipes that haven't yet declared a `cdpEventType` fall through to
 * the generic `event()` lane with the catalog entry's `type` string —
 * the same behaviour as before the migration.
 */
async function dispatchToSdk(
  componentName: string,
  entry: ReturnType<typeof lookupEvent>,
  enriched: Record<string, unknown>,
): Promise<void> {
  if (!entry) return;
  const events = await import("@sitecore-content-sdk/events");
  try {
    switch (entry.cdpEventType) {
      case "VIEW":
        await events.pageView(
          enriched as Parameters<typeof events.pageView>[0],
        );
        return;
      case "IDENTITY": {
        // The SDK's `identity()` takes one structured eventData arg
        // with top-level PII fields (email, phone, identifiers, etc)
        // and an optional `extensionData` nested inside. Callers pass
        // PII at the top level of meta; the rest goes into extensionData.
        // SitecoreAI identity rules match `identifiers.provider` (this
        // tenant uses `email`) — if a caller only sent top-level email,
        // synthesize the identifier so the profile can resolve.
        const {
          identifiers,
          email,
          phone,
          mobile,
          firstName,
          lastName,
          city,
          country,
          dob,
          gender,
          postalCode,
          state,
          street,
          ...rest
        } = enriched as {
          identifiers?: Array<{ id: string; provider: string }>;
          email?: string;
          phone?: string;
          mobile?: string;
          firstName?: string;
          lastName?: string;
          city?: string;
          country?: string;
          dob?: string;
          gender?: string;
          postalCode?: string;
          state?: string;
          street?: string[];
          [key: string]: unknown;
        };
        const resolvedIdentifiers =
          identifiers && identifiers.length > 0
            ? identifiers
            : email
              ? [{ id: email, provider: "email" }]
              : [];
        // Cloud SDK identity() does not infer channel/currency; if they
        // are omitted they never reach the payload and Edge returns
        // 400 "[channel] is a required field for IDENTITY events".
        // Official example: https://doc.sitecore.com/sdk/en/developers/latest/cloud-sdk/identity-events.html
        const language =
          typeof document !== "undefined"
            ? document.documentElement.lang
                ?.split("-")[0]
                ?.toUpperCase() || "EN"
            : "EN";
        const page =
          typeof window !== "undefined"
            ? window.location.pathname
                .split("/")
                .filter(Boolean)
                .pop() || "Home Page"
            : "Home Page";
        await events.identity({
          channel: "WEB",
          currency: "USD",
          language,
          page,
          identifiers: resolvedIdentifiers,
          ...(email ? { email } : {}),
          ...(phone ? { phone } : {}),
          ...(mobile ? { mobile } : {}),
          ...(firstName ? { firstName } : {}),
          ...(lastName ? { lastName } : {}),
          ...(city ? { city } : {}),
          ...(country ? { country } : {}),
          ...(dob ? { dob } : {}),
          ...(gender ? { gender } : {}),
          ...(postalCode ? { postalCode } : {}),
          ...(state ? { state } : {}),
          ...(street ? { street } : {}),
          extensionData: rest as Parameters<
            typeof events.identity
          >[0]["extensionData"],
        });
        return;
      }
      case "FORM_VIEWED":
      case "FORM_SUBMITTED": {
        // form() needs formId + componentInstanceId. Derive from meta
        // with sensible fallbacks: formId defaults to the catalog
        // entry type, instanceId to the component's instanceKey or id.
        const formId = (enriched.formId as string | undefined) ?? entry.type;
        const instanceId =
          (enriched.instanceKey as string | undefined) ??
          (enriched.id as string | undefined) ??
          componentName;
        const interactionType =
          entry.cdpEventType === "FORM_VIEWED" ? "VIEWED" : "SUBMITTED";
        await events.form(formId, interactionType, instanceId);
        return;
      }
      // `ADD` / `CONFIRM` / `ORDER_CHECKOUT` / `SEARCH` / `SHARE`
      // / `CUSTOM` / undefined: all ride the generic `event()` path
      // with their declared `entry.type` string.
      default:
        await events.event({
          type: entry.type,
          channel: "WEB",
          extensionData: enriched as Parameters<
            typeof events.event
          >[0]["extensionData"],
        });
        return;
    }
  } catch (err) {
    console.debug("[cdp] SDK dispatch rejected", entry.type, err);
  }
}

/**
 * Compat shim. Earlier versions of this file exposed `track` via React
 * context and required `<CdpAnalyticsProvider>` to wrap the app root.
 * The provider is now a no-op passthrough so consumer starters that
 * already installed the old file and wired the provider into their
 * layout keep building unchanged — event dispatch always goes through
 * the module-level `trackCdpEvent` regardless.
 *
 * Don't add new code that wraps with this — it's purely here so we
 * don't break consumers in the field. New surfaces should call
 * `useComponentAnalytics(<name>).fire(<event>, <meta>)` directly.
 */
export function CdpAnalyticsProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

/**
 * Returns a stable reference to `trackCdpEvent`. Lives here so the
 * `useComponentAnalytics` hook (which most components use) can keep
 * its `useMemo` dependency list intact. Memoization is per render —
 * the underlying function reference is constant.
 */
export function useCdpTrack(): CdpTrack {
  return useMemo<CdpTrack>(() => trackCdpEvent, []);
}
