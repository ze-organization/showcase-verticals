import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing the TaglineBanner `Layout` rendering parameter.
 *
 *   - `stacked` (default) — tagline above the lead caption in a single
 *     column. `AlignX` aligns the column inside the band; `AlignY`
 *     drives column-justify within the band's min-height.
 *   - `row` — tagline + lead flow inline next to each other (natural
 *     gap, content-sized). `AlignX` controls how the row sits within
 *     the band; `AlignY` controls each item's cross-axis position.
 *   - `row-split` — full-width split: tagline takes the inline-start
 *     half, lead takes the inline-end half (50 / 50). Each half
 *     respects `AlignX` internally.
 *   - `row-spread` — tagline pinned to the inline-start edge, lead
 *     pinned to the inline-end edge with the gap pushed between them
 *     (justify-between). Use when you want the two strings to read
 *     as opposite corners of the band.
 */
export const taglineBannerLayoutEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "tagline-banner-layout@1",
  name: "TaglineBannerLayout",
  displayName: "Tagline Banner Layout",
  description:
    "Tagline + lead composition: `stacked` (column), `row` (inline flow), `row-split` (50/50), `row-spread` (justify-between).",
  location: { scope: "site", folder: ["Tagline Banner"] },
  default: "stacked",
  values: [
    { name: "stacked", displayName: "Stacked" },
    { name: "row", displayName: "Row (inline flow)" },
    { name: "row-split", displayName: "Row Split (50/50)" },
    { name: "row-spread", displayName: "Row Spread (justify-between)" },
  ],
} satisfies EnumerationRecipe;

export default taglineBannerLayoutEnumRecipe;
