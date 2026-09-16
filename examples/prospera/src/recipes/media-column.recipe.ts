import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing `MediaColumn` on two-column page-details
 * renderings (product, person, location, …). Lands at
 * `<enumerationsRoot>/Layout/MediaColumn` per-site.
 *
 * Distinct from `image-position@1` (above / below / hidden for stacked
 * editorial). Two-column shells honor start / end / hidden only.
 */
export const mediaColumnEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "media-column@1",
  name: "MediaColumn",
  displayName: "Media Column",
  description:
    "Which column the lead media occupies on a two-column details page. `start` (default) leads the copy; `end` trails it; `hidden` suppresses the media column.",
  location: { scope: "site", folder: ["Layout"] },
  default: "start",
  values: [
    { name: "start", displayName: "Start" },
    { name: "end", displayName: "End" },
    { name: "hidden", displayName: "Hidden" },
  ],
} satisfies EnumerationRecipe;

export default mediaColumnEnumRecipe;
