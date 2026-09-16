import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration backing the `BottomAlignment` rendering parameter
 * on the `section-wrapper@1` component. Controls horizontal alignment
 * of the bottom region in split-layout headings.
 *
 * Values are **logical** (`start`/`center`/`end`), not physical
 * (`left`/`right`) — the codebase enforces logical directional values
 * end-to-end so layouts mirror under RTL writing direction. See the
 * `feedback_logical_props_not_physical` memory.
 *
 * Reference from a component recipe via
 * `sitecore.enumHandle: "bottom-alignment@1"`.
 */
export const bottomAlignmentEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "bottom-alignment@1",
  name: "BottomAlignment",
  displayName: "Bottom Alignment",
  description:
    "Horizontal alignment of the optional bottom region in section-wrapped components.",
  location: { scope: "site", folder: ["Layout", "Section Wrapper"] },
  default: "center",
  values: [
    { name: "start", displayName: "Start" },
    { name: "center", displayName: "Center" },
    { name: "end", displayName: "End" },
  ],
} satisfies EnumerationRecipe;

export default bottomAlignmentEnumRecipe;
