import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing the `EyebrowStyle` rendering parameter on
 * components that render an eyebrow above the title (article-header,
 * future heros / promos).
 *
 *   - `text`  (default) — small uppercase prose line. Tinted by
 *                         `EyebrowColorScheme`, falls back to
 *                         opacity-dimmed surface foreground.
 *   - `badge`           — pill-shaped chip rendered with the
 *                         `EyebrowColorScheme`'s soft surface
 *                         (`bg-<X>-background text-<X>`).
 */
export const eyebrowStyleEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "eyebrow-style@1",
  name: "EyebrowStyle",
  displayName: "Eyebrow Style",
  description:
    "Visual treatment for the eyebrow above the title. `text` (default) is small uppercase prose; `badge` is a pill-shaped chip tinted by EyebrowColorScheme.",
  location: { scope: "site", folder: ["Layout"] },
  default: "text",
  values: [
    { name: "text", displayName: "Text" },
    { name: "badge", displayName: "Badge" },
  ],
} satisfies EnumerationRecipe;

export default eyebrowStyleEnumRecipe;
