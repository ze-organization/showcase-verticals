import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration backing a component's `Gap` rendering parameter —
 * space between children in a grid or flex container. Lands at
 * `<enumerationsRoot>/Gap` per-site.
 *
 * Reference from a component recipe via `sitecore.enumHandle: "gap@1"`.
 * Components map each value to a Tailwind `gap-*` utility. `none`
 * explicitly closes the gap to zero.
 *
 * No literal `default` value — it eroded standard-value logic. Each
 * consuming recipe seeds its component's natural gap (typically `md`)
 * as the param's concrete standard value.
 */
export const gapEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "gap@1",
  name: "Gap",
  displayName: "Gap",
  description: "Space between children. Maps to Tailwind `gap-*` utilities.",
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

export default gapEnumRecipe;
