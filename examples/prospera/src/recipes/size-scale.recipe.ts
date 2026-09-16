import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration for three-step size params (logo-wall Size, stories-rail ThumbSize).
 *
 * Reference via `sitecore.enumHandle: "size-scale@1"`. Lands at
 * `<enumerationsRoot>/Layout/SizeScale` per-site.
 */
export const sizeScaleEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "size-scale@1",
  name: "SizeScale",
  displayName: "Size Scale",
  description:
    "Plain three-step size scale: sm, md, lg. Unlike size@1 there is no default/xs/xl - use this when the component only implements three steps.",
  location: { scope: "site", folder: ["Layout"] },
  default: "md",
  values: [
    { name: "sm", displayName: "Small" },
    { name: "md", displayName: "Medium" },
    { name: "lg", displayName: "Large" },
  ],
} satisfies EnumerationRecipe;

export default sizeScaleEnumRecipe;
