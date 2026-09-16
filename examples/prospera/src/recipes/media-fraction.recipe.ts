import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing the Promo `MediaFraction` rendering parameter —
 * the split ratio when `ImagePosition` is `start` / `end` (two-column
 * split). Lands at `<enumerationsRoot>/Layout/MediaFraction` per-site.
 *
 * Bind from the source's measured proportions: a media column roughly
 * a third of the band wide → `third`; a dominant media side (product
 * shot, packshot band) → `twoThirds`; the classic even editorial
 * split → `half` (default). Inert on stacked / background / hidden
 * ImagePositions.
 */
export const mediaFractionEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "media-fraction@1",
  name: "MediaFraction",
  displayName: "Media Fraction",
  description:
    "Split ratio for side-by-side promos (ImagePosition start/end): `half` 1/2:1/2 (default), `third` media 1/3 + copy 2/3, `twoThirds` media 2/3 + copy 1/3. Pick from the source's measured column proportions.",
  location: { scope: "site", folder: ["Layout"] },
  default: "half",
  values: [
    { name: "half", displayName: "Half (50 / 50)" },
    { name: "third", displayName: "Third (media 1/3, copy 2/3)" },
    { name: "twoThirds", displayName: "Two thirds (media 2/3, copy 1/3)" },
  ],
} satisfies EnumerationRecipe;

export default mediaFractionEnumRecipe;
