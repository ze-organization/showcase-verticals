import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration backing every component's `ColorScheme` rendering
 * parameter. Lands at `<enumerationsRoot>/ColorScheme` per-site with one
 * child item per value.
 *
 * Reference from a component recipe via `sitecore.enumHandle:
 * "color-scheme@1"` on any enum-shaped field/param. Adding a value here
 * and re-pushing surfaces it in every consumer's dropdown automatically
 * (the Droplink Source resolves by location at editor time, so existing
 * field-definitions don't need to change).
 */
export const colorSchemeEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "color-scheme@1",
  name: "ColorScheme",
  displayName: "Color Scheme",
  description:
    "Semantic color scheme tokens. Used by every component that exposes a colorScheme rendering parameter.",
  location: { scope: "site", folder: ["Theme"] },
  default: "primary",
  values: [
    // `default` = inherit the parent surface (no class emitted). Distinct
    // from `none`, which is an explicit transparent surface. Section
    // shells (section-wrapper, container, splitters) and form params
    // default their BackgroundColor/ColorScheme axes to this value.
    { name: "default", displayName: "Default" },
    // `none` = transparent surface, default text. Per-component opt-in;
    // most components treat `none` as a no-op fallback to neutral text
    // on the parent surface.
    { name: "none", displayName: "None" },
    { name: "white", displayName: "White" },
    { name: "black", displayName: "Black" },
    { name: "neutral", displayName: "Neutral" },
    { name: "primary", displayName: "Primary" },
    { name: "primary-gradient", displayName: "Primary Gradient" },
    { name: "secondary", displayName: "Secondary" },
    { name: "secondary-gradient", displayName: "Secondary Gradient" },
    { name: "tertiary", displayName: "Tertiary" },
    // Neighbouring-role gradient pairings for decorative chrome that
    // wants several RELATED hues across sibling placements (the
    // Duke-Energy-style utility-card grid alternates them on its
    // AccentBar strips). Consumers that don't map a gradient value
    // fail open to their fallback, same as any unknown scheme.
    { name: "tertiary-gradient", displayName: "Tertiary Gradient" },
    { name: "accent", displayName: "Brand Accent 1" },
    { name: "accent-gradient", displayName: "Brand Accent 1 Gradient" },
    { name: "accent-2", displayName: "Brand Accent 2" },
    { name: "accent-2-gradient", displayName: "Brand Accent 2 Gradient" },
    { name: "accent-3", displayName: "Brand Accent 3" },
    { name: "accent-3-gradient", displayName: "Brand Accent 3 Gradient" },
    { name: "info", displayName: "Info" },
    { name: "success", displayName: "Success" },
    { name: "warning", displayName: "Warning" },
    { name: "destructive", displayName: "Destructive" },
    // Bold/strong-saturated treatment is exposed via the separate
    // `background-intensity@1` param (subtle | bold), not by duplicating
    // each scheme here as `*-bold`. The intensity param composes with
    // the chosen scheme so the same color list serves both treatments.
  ],
} satisfies EnumerationRecipe;

export default colorSchemeEnumRecipe;
