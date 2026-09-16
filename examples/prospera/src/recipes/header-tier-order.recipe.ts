import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration for the `TierOrder` rendering parameter on the
 * `header@1` shell's TwoTier arrangement. Lands at
 * `<enumerationsRoot>/Layout/HeaderTierOrder`.
 *
 * TwoTier stacks two rows: the utility strip (`header-utility-start` /
 * `-end` — language pickers, quick links, search) and the primary bar
 * (brand + nav + actions). Which one sits ON TOP is genuinely
 * brand-specific — plenty of mastheads lead with the primary bar and
 * hang the utility strip beneath it — and it is a per-placement choice,
 * not a reason to fork the arrangement into a second variant.
 *
 *   utility-first  utility strip on top, primary bar below (the
 *                  historical order, so it is the default and stored
 *                  placements are unchanged).
 *   nav-first      primary bar on top, utility strip below.
 *
 * Only the TwoTier arrangement reads it. Standard renders its utility
 * row as an optional strip above a single bar and CenteredStack /
 * CenteredInline / Overlay have no second tier to reorder, so all four
 * ignore it.
 */
export const headerTierOrderEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "header-tier-order@1",
  name: "HeaderTierOrder",
  displayName: "Tier Order",
  description:
    "Which row sits on top in the header's TwoTier arrangement. `utility-first` (default) puts the utility strip above the primary brand + nav bar — the historical order; `nav-first` swaps them. TwoTier only; the other arrangements ignore it.",
  location: { scope: "site", folder: ["Layout"] },
  default: "utility-first",
  values: [
    { name: "utility-first", displayName: "Utility First" },
    { name: "nav-first", displayName: "Nav First" },
  ],
} satisfies EnumerationRecipe;

export default headerTierOrderEnumRecipe;
