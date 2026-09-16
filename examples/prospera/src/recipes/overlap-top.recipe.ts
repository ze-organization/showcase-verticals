import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration for the `OverlapTop` rendering parameter on the
 * cards-and-lists section shells (`card-list-grid-params@1` /
 * `card-carousel-params@1`). Lands at
 * `<enumerationsRoot>/Layout/OverlapTop`.
 *
 * `half` pulls the section's card row up over the bottom edge of
 * whatever section precedes it — the "floating cards over the hero"
 * pattern (emirates / ketelone style). Implemented as a negative top
 * margin + `relative z-10` on the section's inner content wrapper, so
 * it is safe regardless of what the previous section is: nothing
 * couples to the hero component, and when the previous section is a
 * plain band the cards simply overlap that band instead.
 *
 * `quarter` and `full` landed 2026-07 with the 20-brand agentic
 * assessment: brand sources routinely show shallower edge-clip
 * overlaps (quarter) and deeper "cards mostly over the hero" placements
 * (full — the diageo careers pattern), which `half` alone couldn't
 * reproduce.
 */
export const overlapTopEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "overlap-top@1",
  name: "OverlapTop",
  displayName: "Overlap Top",
  description:
    "How far the card row floats up over the previous section. `none` (default) keeps the section in normal flow; `quarter` just clips the previous section's bottom edge; `half` pulls the cards halfway up over it — use when the source shows cards overlapping the hero's bottom edge; `full` floats the row a full card-height up so the cards sit mostly over the section above.",
  location: { scope: "site", folder: ["Layout"] },
  default: "none",
  values: [
    { name: "none", displayName: "None" },
    { name: "quarter", displayName: "Quarter (clip previous section edge)" },
    { name: "half", displayName: "Half (float over previous section)" },
    { name: "full", displayName: "Full (sit mostly over previous section)" },
  ],
} satisfies EnumerationRecipe;

export default overlapTopEnumRecipe;
