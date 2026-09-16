import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing the `AuthorStyle` rendering parameter used by
 * article-header (and any future byline-rendering surface). Controls
 * how each linked Author item is rendered alongside the article meta:
 * the literal name, the avatar image, or both.
 *
 *   - `name-only`        Author name(s) only — no avatar.
 *   - `avatar-and-name`  Avatar image + name stacked horizontally.
 *   - `avatar-only`      Avatar tile with name as accessible alt text.
 *
 * Component drives the actual layout; this enum is the
 * author-facing dropdown.
 */
export const authorStyleEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "author-style@1",
  name: "AuthorStyle",
  displayName: "Author Style",
  description:
    "How each linked Author is rendered in a byline: name only, avatar + name, or avatar only.",
  location: { scope: "site", folder: ["Article Header"] },
  default: "avatar-and-name",
  values: [
    { name: "name-only", displayName: "Name only" },
    { name: "avatar-and-name", displayName: "Avatar + name" },
    { name: "avatar-only", displayName: "Avatar only" },
  ],
} satisfies EnumerationRecipe;

export default authorStyleEnumRecipe;
