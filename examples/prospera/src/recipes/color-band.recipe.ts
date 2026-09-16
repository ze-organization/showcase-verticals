import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Color treatment for the optional band at the top of a card. When a
 * real scheme is picked, the title moves into the band and renders
 * with the scheme's saturated background + foreground tokens. `none`
 * keeps the standard header rendering.
 *
 * Distinct from `color-scheme@1` because the surface is opt-in: this
 * enum carries an explicit `"none"` value so authors can say "no band"
 * directly, rather than reusing `neutral` for that purpose (which
 * would clash with anyone wanting an actual neutral-tinted band).
 */
export const colorBandEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "color-band@1",
  name: "ColorBand",
  displayName: "Color Band",
  description:
    "Optional color band at the top of the card; the title moves into the band and uses the scheme's saturated colors.",
  location: { scope: "site", folder: ["Components", "Card"] },
  default: "none",
  values: [
    { name: "none", displayName: "None" },
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

export default colorBandEnumRecipe;
