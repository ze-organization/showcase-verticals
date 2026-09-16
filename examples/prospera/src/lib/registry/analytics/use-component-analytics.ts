import { useMemo } from "react";
import { useCdpTrack } from "./cdp-provider";

/**
 * Bound dispatcher for a single component's CDP events. The component
 * name is the same string used as `name` in the component's recipe
 * (kebab-case, e.g. `"alert-banner"`); the catalog of valid events
 * for that name is aggregated from
 * `REGISTERED_RECIPES` in `./cdp-events.ts`.
 *
 * Pass the per-component meta interface as `TMeta` so the `meta`
 * payload type-checks at the call site:
 *
 * @example
 *   const analytics = useComponentAnalytics<AlertBannerAnalyticsMeta>(
 *     "alert-banner",
 *   );
 *   analytics.fire("dismiss", { id, title });
 *
 * Event names are runtime strings (looked up in the recipe-driven
 * catalog) rather than literal types — a typo logs a `[cdp]` dev-mode
 * warning via the provider rather than a TypeScript error. The trade-off
 * favours flexibility on the install seam (where customers add new
 * components without ambient type generation).
 */
export function useComponentAnalytics<TMeta = Record<string, unknown>>(
  componentName: string,
) {
  const track = useCdpTrack();
  return useMemo(
    () => ({
      fire(eventName: string, meta?: TMeta) {
        // The provider dispatches via a structurally-typed `Record<string,
        // unknown>` slot; cast here so per-component meta interfaces (which
        // don't carry an implicit index signature) compose cleanly.
        track(componentName, eventName, meta as Record<string, unknown>);
      },
    }),
    [track, componentName],
  );
}
