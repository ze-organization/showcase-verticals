import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Horizontal placement of an action row (primary + secondary CTAs)
 * within a card body. Logical values — flip correctly under RTL.
 */
export const actionPlacementEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "action-placement@1",
  name: "ActionPlacement",
  displayName: "Action Placement",
  description:
    "Alignment of the action row. `start` (default) pins actions to the inline-start edge; `end` pins them to the inline-end.",
  location: { scope: "site", folder: ["Components", "Card"] },
  default: "start",
  values: [
    { name: "start", displayName: "Start" },
    { name: "end", displayName: "End" },
  ],
} satisfies EnumerationRecipe;

export default actionPlacementEnumRecipe;
