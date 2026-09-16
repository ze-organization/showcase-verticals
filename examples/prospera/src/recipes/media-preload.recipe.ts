import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing the `MediaPreload` rendering parameter — the
 * native `<video>` preload strategy. Mirrors the HTML `preload`
 * attribute values.
 */
export const mediaPreloadEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "media-preload@1",
  name: "MediaPreload",
  displayName: "Media Preload",
  description:
    "Native video preload strategy — `none`, `metadata` (default), or `auto`.",
  location: { scope: "site", folder: ["Media"] },
  default: "metadata",
  values: [
    { name: "none", displayName: "None" },
    { name: "metadata", displayName: "Metadata" },
    { name: "auto", displayName: "Auto" },
  ],
} satisfies EnumerationRecipe;

export default mediaPreloadEnumRecipe;
