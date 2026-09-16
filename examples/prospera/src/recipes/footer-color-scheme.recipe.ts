import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Color treatment for a card's footer region, independent of the card
 * body surface. When a real scheme is picked the footer renders as a
 * full-width tinted band under the card content (the "Södra card"
 * treatment — a muted/branded footer band in a different color from the
 * body). `none` (default) keeps the footer inheriting the card surface.
 *
 * Distinct from `color-scheme@1` because the surface is opt-in (carries
 * an explicit `none`) and from `color-band@1` because it adds the
 * shadcn quiet-surface `muted` role — the canonical muted footer band.
 * Saturated roles resolve to their soft-tint surface tokens
 * (`bg-<role>-background` + `text-<role>`), so the band re-themes with
 * the brand and never hardcodes a hex.
 */
export const footerColorSchemeEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "footer-color-scheme@1",
  name: "FooterColorScheme",
  displayName: "Footer Color Scheme",
  description:
    "Optional tint for the card footer band, independent of the card body surface. `none` inherits the body surface; `muted` is the quiet shadcn surface; the role values render a soft-tint band.",
  location: { scope: "site", folder: ["Components", "Card"] },
  default: "none",
  values: [
    { name: "none", displayName: "None" },
    { name: "muted", displayName: "Muted" },
    { name: "neutral", displayName: "Neutral" },
    { name: "primary", displayName: "Primary" },
    { name: "secondary", displayName: "Secondary" },
    { name: "tertiary", displayName: "Tertiary" },
    { name: "accent", displayName: "Brand Accent 1" },
    { name: "accent-2", displayName: "Brand Accent 2" },
    { name: "accent-3", displayName: "Brand Accent 3" },
    { name: "info", displayName: "Info" },
    { name: "success", displayName: "Success" },
    { name: "warning", displayName: "Warning" },
    { name: "destructive", displayName: "Destructive" },
  ],
} satisfies EnumerationRecipe;

export default footerColorSchemeEnumRecipe;
