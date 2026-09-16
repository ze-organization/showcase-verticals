/**
 * Shared `CtaPlacement` axis (`cta-placement@1`) for card variants that
 * render a CTA — where the call-to-action sits inside the card.
 *
 *   - `inline` — the CTA flows at the end of the copy block, directly
 *     under the excerpt/description (editorial "read more" pattern).
 *   - `footer` — the CTA sits in the card's actions row, pinned after
 *     the content so CTAs align across a row of unequal-height cards.
 *
 * Per-variant defaults differ by family (article cards default
 * `inline`, feature cards default `footer`) — the shared parser
 * collapses empty/unknown to `undefined` so each variant's own default
 * keeps driving when the author (or the composer) hasn't picked.
 */

export const CTA_PLACEMENTS = ["inline", "footer"] as const;

export type CardCtaPlacement = (typeof CTA_PLACEMENTS)[number];

/** Parse-or-undefined: empty / unknown keeps the variant default. */
export function parseCardCtaPlacement(
  value: string | undefined,
): CardCtaPlacement | undefined {
  const normalized = value?.trim().toLowerCase() as
    | CardCtaPlacement
    | undefined;
  return normalized && CTA_PLACEMENTS.includes(normalized)
    ? normalized
    : undefined;
}
