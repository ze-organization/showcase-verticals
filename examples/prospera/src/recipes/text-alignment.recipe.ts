import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration backing the `Layout` (text-block alignment)
 * rendering parameter across the heros-and-promos family (promo, hero).
 * Aligns the eyebrow + title + copy + CTA column along the inline axis.
 *
 * Distinct from `alignment@1` (which spells its middle value `center`);
 * this family uses `centered` so the value vocabulary reads the same as
 * the author-facing "Centered" option. Values are direction-neutral —
 * `start` / `end` use logical-inline placement so RTL flips
 * automatically.
 */
export const textAlignmentEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "text-alignment@1",
  name: "TextAlignment",
  displayName: "Text Alignment",
  description:
    "Text-block alignment — `start`, `centered`, or `end`. Controls how the title, copy, and CTAs align along the inline axis.",
  location: { scope: "site", folder: ["Layout"] },
  default: "start",
  values: [
    { name: "start", displayName: "Start-Aligned" },
    { name: "centered", displayName: "Centered" },
    { name: "end", displayName: "End-Aligned" },
  ],
} satisfies EnumerationRecipe;

export default textAlignmentEnumRecipe;
