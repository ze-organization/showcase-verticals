import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing band-level `Inset` rendering parameters — whether
 * a band's media/surface paints full width or contained. Lands at
 * `<enumerationsRoot>/Layout/Inset` per-site.
 *
 * Consumers: Promo's `Inset` (band surface) and Hero's `MediaInset`
 * (media frame). The handle keeps its historical `promo-inset@1` name —
 * handles are load-bearing forever (stored placements and pushed
 * tenants reference it) — but the vocabulary is band-generic:
 *
 *   - `fullBleed` (default) — the band/media spans the full page
 *     width (classic edge-to-edge treatment).
 *   - `contained` — constrained to the content container; the page
 *     surface shows around it.
 *   - `card` — contained plus the theme's `--card-radius` rounding, so
 *     the band/media reads as a large card (split-panel offer tiles,
 *     Ketel-One-style color panels, Greene-King-style inset hero
 *     photos).
 */
export const promoInsetEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "promo-inset@1",
  name: "Inset",
  displayName: "Inset",
  description:
    "Band inset: `fullBleed` (default) spans the page edge-to-edge; `contained` constrains the band or media to the content container; `card` adds the theme's card radius so it reads as a large rounded panel. Backs Promo's `Inset` (band surface) and Hero's `MediaInset` (media frame). Pick `card` when the source shows a rounded, inset panel or photo rather than a full-width treatment.",
  location: { scope: "site", folder: ["Layout"] },
  default: "fullBleed",
  values: [
    { name: "fullBleed", displayName: "Full bleed (edge-to-edge band)" },
    { name: "contained", displayName: "Contained (inside the container)" },
    { name: "card", displayName: "Card (contained + card radius)" },
  ],
} satisfies EnumerationRecipe;

export default promoInsetEnumRecipe;
