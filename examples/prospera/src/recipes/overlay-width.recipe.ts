import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing a hero's `OverlayWidth` rendering parameter —
 * the fraction of the hero band the overlay panel occupies on desktop
 * (`md+`). Mobile collapses to full width regardless.
 */
export const overlayWidthEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "overlay-width@1",
  name: "OverlayWidth",
  displayName: "Overlay Width",
  description:
    "Desktop width of the hero overlay panel as a fraction of the hero band — `quarter` / `third` / `half` (default) / `two-thirds` / `three-quarters` / `full`. Mobile is always full-width.",
  location: { scope: "site", folder: ["Hero"] },
  default: "half",
  values: [
    { name: "quarter", displayName: "Quarter (1/4)" },
    { name: "third", displayName: "Third (1/3)" },
    { name: "half", displayName: "Half (1/2)" },
    { name: "two-thirds", displayName: "Two Thirds (2/3)" },
    { name: "three-quarters", displayName: "Three Quarters (3/4)" },
    { name: "full", displayName: "Full" },
  ],
} satisfies EnumerationRecipe;

export default overlayWidthEnumRecipe;
