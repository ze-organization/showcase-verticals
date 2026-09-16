import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration for the `BackgroundIntensity` rendering parameter
 * on layout-shell components (Container, SectionWrapper, RowSplitter,
 * ColumnSplitter). Lands at `<enumerationsRoot>/Layout/BackgroundIntensity`.
 *
 * Composes with `color-scheme@1` (`BackgroundColor`): the color picks
 * which token family applies; the intensity picks how saturated. `subtle`
 * maps to the weak `bg-<scheme>-background` token (light tint, default
 * historical behaviour). `bold` maps to the pure `bg-<scheme>` token and
 * pairs it with `text-<scheme>-foreground` so text inside the section
 * inverts via CSS inheritance — no new tokens, just exposing both
 * existing ones as an authoring choice.
 *
 * Two values keeps the dropdown short. Picking `bold` on `none`/`ai`
 * (which have no `-background` distinction) is a no-op; consumers
 * silently fall back to the single token both schemes share.
 */
export const backgroundIntensityEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "background-intensity@1",
  name: "BackgroundIntensity",
  displayName: "Background Intensity",
  description:
    "How saturated the section background fill is. `subtle` (default) uses the weak `-background` token; `bold` uses the pure brand color and inverts text via `text-*-foreground`.",
  location: { scope: "site", folder: ["Layout"] },
  default: "subtle",
  values: [
    { name: "subtle", displayName: "Subtle" },
    { name: "bold", displayName: "Bold" },
  ],
} satisfies EnumerationRecipe;

export default backgroundIntensityEnumRecipe;
