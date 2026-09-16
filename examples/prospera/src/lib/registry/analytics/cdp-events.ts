import type { ComponentTemplateRecipe } from "@/lib/registry/sitecore-recipes";

/**
 * Runtime CDP event catalog — populated lazily by each component as
 * its module loads.
 *
 * **Why push-based.** This file is shipped via `lib-analytics-cdp-events`
 * and pulled in transitively by every component that calls
 * `useComponentAnalytics()`. The previous static-import design listed
 * every event-emitting recipe here and built the catalog at module
 * load, which meant `cdp-events.ts` carried hard build-time
 * dependencies on N component recipes — but in any starter that
 * installs only a subset of those components (e.g. the orchestrator's
 * editing-host preflight starter, which only includes ~16 components),
 * the unresolved `@/recipes/<name>.recipe` imports broke the Next.js
 * build. Each new event-emitting component added required another
 * "fix(cdp): unbreak editing-host build" round.
 *
 * Push-based registration reverses the dependency: cdp-events.ts owns
 * the catalog Map and exposes `registerCdpRecipe(recipe)`. Each
 * component's `.tsx` self-registers its own recipe at module-load time.
 * Components NOT installed in a given starter never load, never
 * register, and their absence is invisible to the build. `cdp-events.ts`
 * itself carries zero component-recipe imports.
 *
 * Registration is idempotent — calling `registerCdpRecipe` twice with
 * the same recipe is a no-op. The catalog is queried at event-fire
 * time, which always happens after the firing component has been
 * imported and registered.
 *
 * **Adding analytics to a new component.**
 *
 *   1. Author the recipe with an `events: [...]` block.
 *   2. In the component's `.tsx`, near the top imports, add:
 *
 *        import { registerCdpRecipe } from "@/lib/registry/analytics/cdp-events";
 *        import recipe from "@/recipes/<name>.recipe";
 *        registerCdpRecipe(recipe);
 *
 *   3. Call `useComponentAnalytics("<recipe-name>")` inside the
 *      component as usual.
 *
 * The `@/recipes/<name>.recipe` import path resolves in both
 * registry-source dev (via the source-side shim at
 * `src/recipes/<name>.recipe.ts`, registry-only, NOT shipped) and the
 * consumer / editing-host starter (via the shadcn-installed file at
 * the same path).
 */

export interface CdpCatalogEntry {
  /** The unique CDP event type sent to Sitecore Edge Proxy. */
  type: string;
  /** Author-facing description carried verbatim from the recipe. */
  description: string;
  /** Recipe-flagged deprecation; runtime still dispatches. */
  deprecated: boolean;
  /**
   * Wire-level CDP event type — picks which `@sitecore-content-sdk/events`
   * function the dispatcher routes the fire through. See the JSDoc
   * on `CdpWireEventType` in `sitecore-recipes.ts` for the routing
   * table. `undefined` for entries that pre-date the migration; the
   * router falls back to `event()` with the entry's `type` string.
   */
  cdpEventType?:
    | "VIEW"
    | "IDENTITY"
    | "ADD"
    | "CONFIRM"
    | "ORDER_CHECKOUT"
    | "FORM_VIEWED"
    | "FORM_SUBMITTED"
    | "SEARCH"
    | "SHARE"
    | "CUSTOM";
}

const REGISTERED_RECIPES: ComponentTemplateRecipe[] = [];
const registeredNames = new Set<string>();
const catalog = new Map<string, CdpCatalogEntry>();

/**
 * Register a component's recipe with the runtime CDP catalog. Idempotent
 * by `recipe.name` — calling twice with the same recipe is a no-op (so
 * hot reload + duplicate imports don't double-count).
 */
export function registerCdpRecipe(recipe: ComponentTemplateRecipe): void {
  if (registeredNames.has(recipe.name)) return;
  registeredNames.add(recipe.name);
  REGISTERED_RECIPES.push(recipe);
  for (const event of recipe.events ?? []) {
    const key = `${recipe.name}.${event.name}`;
    catalog.set(key, {
      type: event.type,
      description: event.description,
      deprecated: event.deprecated ?? false,
      // Forward the wire-event type so `trackCdpEvent` can route to
      // the right SDK function (pageView / identity / form / event).
      // Recipes that pre-date the migration leave this `undefined`
      // and fall back to the generic `event()` path.
      cdpEventType: event.cdpEventType,
    });
  }
}

/**
 * Resolve a `<componentName>.<eventName>` pair to its catalog entry.
 * Returns `undefined` when the event isn't registered — the provider
 * uses that to log a dev-mode warning so misspellings are loud, and
 * the same path covers "component not installed in this starter."
 */
export function lookupEvent(
  componentName: string,
  eventName: string,
): CdpCatalogEntry | undefined {
  return catalog.get(`${componentName}.${eventName}`);
}

/**
 * Enumerate every registered event. Used by the showcase's analytics
 * inspector page and by the codegen that emits the docs site's event
 * reference.
 */
export function listRegisteredEvents(): Array<{
  componentName: string;
  eventName: string;
  entry: CdpCatalogEntry;
}> {
  const rows: Array<{
    componentName: string;
    eventName: string;
    entry: CdpCatalogEntry;
  }> = [];
  for (const recipe of REGISTERED_RECIPES) {
    for (const event of recipe.events ?? []) {
      const entry = catalog.get(`${recipe.name}.${event.name}`);
      if (entry) {
        rows.push({
          componentName: recipe.name,
          eventName: event.name,
          entry,
        });
      }
    }
  }
  return rows;
}
