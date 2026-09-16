import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration backing a component's `BackgroundPosition`
 * rendering parameter — the crop anchor for a full-bleed
 * `BackgroundImage` behind section content (CSS `object-position`).
 * Lands at `<enumerationsRoot>/Style/BackgroundPosition` per-site.
 *
 * Reference from a component recipe via `sitecore.enumHandle:
 * "background-position@1"`. Components map each value to an
 * `object-*` utility via the shared section-background vocabulary in
 * `src/lib/registry/section-background.tsx` — `center` (default) for
 * balanced crops, `top` to keep skylines / faces at the top edge,
 * `bottom` to keep foreground subjects at the bottom edge.
 */
export const backgroundPositionEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "background-position@1",
  name: "BackgroundPosition",
  displayName: "Background Position",
  description:
    "Crop anchor for a section's full-bleed BackgroundImage (`object-position`): center / top / bottom. Used by every section component that exposes a BackgroundImage field.",
  location: { scope: "site", folder: ["Style"] },
  default: "center",
  values: [
    { name: "center", displayName: "Center" },
    { name: "top", displayName: "Top" },
    { name: "bottom", displayName: "Bottom" },
  ],
} satisfies EnumerationRecipe;

export default backgroundPositionEnumRecipe;
