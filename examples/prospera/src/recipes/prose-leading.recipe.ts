import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration backing the `ProseLeading` rendering parameter —
 * line-height for the prose body. Lands at
 * `<enumerationsRoot>/Typography/ProseLeading` per-site.
 *
 * Reference from a component recipe via `sitecore.enumHandle:
 * "prose-leading@1"`. Values map directly to Tailwind's
 * `leading-<token>` utilities, applied to the Prose container so
 * paragraphs and lists inherit through the cascade. `default` keeps
 * the inherited line-height from the Prose primitive.
 */
export const proseLeadingEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "prose-leading@1",
  name: "ProseLeading",
  displayName: "Prose Leading",
  description:
    "Body line-height. Maps to Tailwind leading-* utilities; default inherits from the Prose primitive.",
  location: { scope: "site", folder: ["Typography"] },
  default: "default",
  values: [
    { name: "default", displayName: "Default" },
    { name: "tight", displayName: "Tight" },
    { name: "snug", displayName: "Snug" },
    { name: "normal", displayName: "Normal" },
    { name: "relaxed", displayName: "Relaxed" },
    { name: "loose", displayName: "Loose" },
  ],
} satisfies EnumerationRecipe;

export default proseLeadingEnumRecipe;
