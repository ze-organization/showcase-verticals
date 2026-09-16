import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing the CalloutCard `HeaderStyle` rendering parameter.
 *
 * Three flavours covering the common editorial shapes:
 *   - `start`           — title (and CTA) flow start-aligned in the card.
 *   - `centered`        — title centered, no decoration above.
 *   - `centered-accent` — title centered with a short accent bar above
 *     (uses the active `ColorScheme` so the bar matches the band/CTA).
 */
export const calloutHeaderStyleEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "callout-header-style@1",
  name: "CalloutHeaderStyle",
  displayName: "Callout Header Style",
  description:
    "Title treatment inside a CalloutCard: start-aligned, centered, or centered with an accent bar above.",
  location: { scope: "site", folder: ["Callout Card"] },
  default: "start",
  values: [
    { name: "start", displayName: "Start Aligned" },
    { name: "centered", displayName: "Centered" },
    { name: "centered-accent", displayName: "Centered with Accent" },
  ],
} satisfies EnumerationRecipe;

export default calloutHeaderStyleEnumRecipe;
