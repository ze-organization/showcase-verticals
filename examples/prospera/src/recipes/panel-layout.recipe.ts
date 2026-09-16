import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing the `PanelLayout` rendering parameter on
 * placeholder-panel triggers (first consumer: `utility-trigger@1`).
 * Lands at `<enumerationsRoot>/Layout/PanelLayout` per-site.
 *
 * How a trigger's composed panel opens:
 *
 *   - `inline` (default) — an anchored dropdown next to the trigger
 *     (the classic account/search popover).
 *   - `full-width` — a band spanning the trigger's positioned ancestor
 *     (the header row), mirroring main-nav's MegaPanel treatment
 *     (`absolute inset-x-0`). Pick for mega-menu-class panel content.
 *   - `modal` — a centered dialog overlay. Pick for focused tasks
 *     (site-wide search, login form) that deserve the full viewport.
 *
 * Concrete default on purpose — no literal `default` value in this
 * vocabulary; consumers that want "unset" simply keep `inline`.
 */
export const panelLayoutEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "panel-layout@1",
  name: "PanelLayout",
  displayName: "Panel Layout",
  description:
    "How a trigger's composed panel opens — anchored inline dropdown, a full-width band spanning the header row, or a modal dialog overlay.",
  location: { scope: "site", folder: ["Layout"] },
  default: "inline",
  values: [
    {
      name: "inline",
      displayName: "Inline (anchored dropdown)",
      description:
        "Anchored dropdown next to the trigger — the compact account/search popover treatment.",
    },
    {
      name: "full-width",
      displayName: "Full Width (header band)",
      description:
        "Panel spans the header row's full width (main-nav MegaPanel treatment). Pick for mega-menu-class content.",
    },
    {
      name: "modal",
      displayName: "Modal (dialog overlay)",
      description:
        "Centered dialog overlay with scrim. Pick for focused tasks like site-wide search or a login form.",
    },
  ],
} satisfies EnumerationRecipe;

export default panelLayoutEnumRecipe;
