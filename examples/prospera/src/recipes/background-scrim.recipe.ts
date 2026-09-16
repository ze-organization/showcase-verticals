import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration backing a component's `BackgroundScrim` rendering
 * parameter — the legibility scrim painted over a full-bleed
 * `BackgroundImage` behind section content. Lands at
 * `<enumerationsRoot>/Style/BackgroundScrim` per-site.
 *
 * Reference from a component recipe via `sitecore.enumHandle:
 * "background-scrim@1"`. Components map each value through the shared
 * section-background vocabulary in
 * `src/lib/registry/section-background.tsx`:
 *
 *   - `dark` (default) — black dim layer; section text flips to white
 *     and interior tokens re-tone via `surface-invert` so muted text /
 *     cards / borders stay readable over the photo.
 *   - `light` — white wash; text flips to black (pale imagery with
 *     dark copy, the editorial "frosted" look).
 *   - `none` — no scrim; the author asserts the raw image is legible
 *     and the section keeps its surface-tone text color.
 */
export const backgroundScrimEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "background-scrim@1",
  name: "BackgroundScrim",
  displayName: "Background Scrim",
  description:
    "Legibility scrim over a section's full-bleed BackgroundImage. `dark` dims the photo and flips text light; `light` washes it and keeps text dark; `none` leaves the image untreated. Used by every section component that exposes a BackgroundImage field.",
  location: { scope: "site", folder: ["Style"] },
  default: "dark",
  values: [
    { name: "dark", displayName: "Dark" },
    { name: "light", displayName: "Light" },
    { name: "none", displayName: "None" },
  ],
} satisfies EnumerationRecipe;

export default backgroundScrimEnumRecipe;
