import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration backing a `Padding` rendering parameter on
 * overlay-panel components (first consumer: `mobile-menu@1`). Inner
 * inset of the panel surface, applied on ALL sides as a `p-*` token —
 * distinct from `padding-y@1` (vertical-only section rhythm) and from
 * `card-padding@1` (deliberately narrowed to the Card primitive's
 * `sm | md | lg` prop). Panels need the wider range: `none` for
 * edge-to-edge composed content and `xl` for airy full-screen
 * overlays.
 *
 * Lands at `<enumerationsRoot>/Layout/PanelPadding` per-site.
 * Per the 2026-07 enum convention there is no literal `default`
 * value — consumers declare a concrete natural value (`md` = the
 * former hard-coded `p-6`).
 */
export const panelPaddingEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "panel-padding@1",
  name: "PanelPadding",
  displayName: "Panel Padding",
  description:
    "Inner inset of an overlay panel surface (drawer, full-screen overlay, bottom sheet), applied on all sides as a `p-*` token.",
  location: { scope: "site", folder: ["Layout"] },
  default: "md",
  values: [
    { name: "none", displayName: "None" },
    { name: "sm", displayName: "Small" },
    { name: "md", displayName: "Medium" },
    { name: "lg", displayName: "Large" },
    { name: "xl", displayName: "Extra Large" },
  ],
} satisfies EnumerationRecipe;

export default panelPaddingEnumRecipe;
