import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing the `AutoplayInterval` rendering parameter on
 * rotating surfaces (hero-carousel and future auto-advancing bands).
 *
 *   - `off` (default) — no auto-rotation; visitors advance manually.
 *   - `4s` / `6s` / `8s` — advance to the next slide every N seconds.
 *
 * Renderers must pause autoplay on hover / focus and disable it
 * entirely under `prefers-reduced-motion` regardless of this value.
 */
export const autoplayIntervalEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "autoplay-interval@1",
  name: "AutoplayInterval",
  displayName: "Autoplay Interval",
  description:
    "Auto-rotation cadence for carousel-like surfaces. `off` (default) requires manual navigation; `4s` / `6s` / `8s` advance automatically. Autoplay pauses on hover/focus and is disabled under prefers-reduced-motion.",
  location: { scope: "site", folder: ["Layout"] },
  default: "off",
  values: [
    { name: "off", displayName: "Off" },
    { name: "4s", displayName: "Every 4 seconds" },
    { name: "6s", displayName: "Every 6 seconds" },
    { name: "8s", displayName: "Every 8 seconds" },
  ],
} satisfies EnumerationRecipe;

export default autoplayIntervalEnumRecipe;
