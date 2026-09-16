import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration backing the `ProseSize` rendering parameter —
 * body text size override for prose-containing blocks. Lands at
 * `<enumerationsRoot>/Typography/ProseSize` per-site.
 *
 * Reference from a component recipe via `sitecore.enumHandle:
 * "prose-size@1"`. Values map to Tailwind's `text-<size>` utilities
 * applied to the Prose container so paragraphs, lists, and blockquotes
 * inherit through the cascade. `default` keeps the page's inherited
 * body size.
 *
 * Distinct from `size@1` (the button/control scale, sm→xl) and from
 * `heading-size@1` (the heading typographic scale). This one is the
 * prose-body axis.
 */
export const proseSizeEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "prose-size@1",
  name: "ProseSize",
  displayName: "Prose Size",
  description:
    "Body text size. Maps to Tailwind text-* utilities; default inherits the page size.",
  location: { scope: "site", folder: ["Typography"] },
  default: "default",
  values: [
    { name: "default", displayName: "Default" },
    { name: "sm", displayName: "Small" },
    { name: "base", displayName: "Base" },
    { name: "lg", displayName: "Large" },
    { name: "xl", displayName: "Extra Large" },
  ],
} satisfies EnumerationRecipe;

export default proseSizeEnumRecipe;
