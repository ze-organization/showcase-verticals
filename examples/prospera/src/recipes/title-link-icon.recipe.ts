import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Optional trailing link-icon glyph rendered inline after a card title.
 * Signals that the whole card is a link / expandable target (the
 * "Södra card" treatment — a chevron/arrow tucked beside the heading).
 *
 * `none` (default) keeps the title rendering unchanged. `chevron`
 * appends a right-chevron; `arrow` appends a right-arrow. Both glyphs
 * are decorative (aria-hidden) — the title text carries the meaning.
 */
export const titleLinkIconEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "title-link-icon@1",
  name: "TitleLinkIcon",
  displayName: "Title Link Icon",
  description:
    "Optional trailing chevron/arrow glyph beside a card title, signalling the card is a link or expandable. `none` keeps the plain title.",
  location: { scope: "site", folder: ["Components", "Card"] },
  default: "none",
  values: [
    { name: "none", displayName: "None" },
    { name: "chevron", displayName: "Chevron" },
    { name: "arrow", displayName: "Arrow" },
  ],
} satisfies EnumerationRecipe;

export default titleLinkIconEnumRecipe;
