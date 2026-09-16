import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing the `Style` rendering parameter on
 * `badge-block@1` — the badge's macro treatment axis. Lands at
 * `<enumerationsRoot>/Components/Badge/BadgeStyle` per-site.
 *
 *   - `pill`    (default) — the classic filled badge chip: colorScheme
 *               surface fill, `--badge-radius` corners.
 *   - `eyebrow` — the editorial eyebrow treatment: small uppercase
 *               tracked label, no background, tinted by colorScheme.
 *               Renders IDENTICALLY to the shared `blocks/eyebrow.tsx`
 *               text mode (promo / article-header eyebrows) so one
 *               badge covers the scattered eyebrow implementations —
 *               candidates for later consolidation onto this axis.
 *
 * Distinct from `eyebrow-style@1` (which styles a component's own
 * Eyebrow FIELD as text-vs-badge); this axis styles the badge
 * COMPONENT itself.
 */
export const badgeStyleEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "badge-style@1",
  name: "BadgeStyle",
  displayName: "Badge Style",
  description:
    "Macro treatment of the badge. `pill` (default) is the filled chip; `eyebrow` is the editorial text-only uppercase tracked label tinted by ColorScheme.",
  location: { scope: "site", folder: ["Components", "Badge"] },
  default: "pill",
  values: [
    { name: "pill", displayName: "Pill" },
    { name: "eyebrow", displayName: "Eyebrow" },
  ],
} satisfies EnumerationRecipe;

export default badgeStyleEnumRecipe;
