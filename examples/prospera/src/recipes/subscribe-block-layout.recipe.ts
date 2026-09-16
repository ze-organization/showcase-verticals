import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Form-layout enum backing the `Layout` rendering parameter on
 * `subscribe-section`. Drives the SubscribeBlock primitive's internal
 * arrangement of email input + submit button (+ optional name +
 * consent).
 *
 *   - `overlay` — submit button overlays the input pill (default;
 *     compact, marketing-flavored).
 *   - `stacked` — full-width input on top, full-width submit below.
 *     Right for narrow surfaces (sidebar, drawer) and consent flows.
 *   - `row` — input + submit side-by-side from tablet up. Right for
 *     hero-strip placements.
 *
 * Reference via `sitecore.enumHandle: "subscribe-block-layout@1"`.
 * Lands at `<enumerationsRoot>/Subscribe Block Layout` per-site.
 */
export const subscribeBlockLayoutEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "subscribe-block-layout@1",
  name: "Subscribe Block Layout",
  displayName: "Subscribe Block Layout",
  description: "Layout for the subscribe form's email input + submit button.",
  location: { scope: "site", folder: ["Forms"] },
  default: "overlay",
  values: [
    { name: "overlay", displayName: "Overlay" },
    { name: "stacked", displayName: "Stacked" },
    { name: "row", displayName: "Row" },
  ],
} satisfies EnumerationRecipe;

export default subscribeBlockLayoutEnumRecipe;
