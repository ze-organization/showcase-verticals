import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration for the `RingColorScheme` rendering parameter on stories-rail. Deliberately narrower than color-scheme@1 - the ring only implements these four tokens.
 *
 * Reference via `sitecore.enumHandle: "ring-color@1"`. Lands at
 * `<enumerationsRoot>/Card/RingColor` per-site.
 */
export const ringColorEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "ring-color@1",
  name: "RingColor",
  displayName: "Ring Color",
  description:
    "Accent ring color around story thumbnails: primary, secondary, accent, or neutral.",
  location: { scope: "site", folder: ["Card"] },
  default: "primary",
  values: [
    { name: "primary", displayName: "Primary" },
    { name: "secondary", displayName: "Secondary" },
    { name: "accent", displayName: "Accent" },
    { name: "neutral", displayName: "Neutral" },
  ],
} satisfies EnumerationRecipe;

export default ringColorEnumRecipe;
