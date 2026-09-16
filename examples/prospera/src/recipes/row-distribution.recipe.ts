import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration backing `row-splitter@1`'s `Distribution`
 * rendering parameter — the vertical analogue of
 * `column-distribution@1`. Lands at `<enumerationsRoot>/Layout/RowDistribution`.
 *
 * Values map to grid row templates in row-splitter.tsx:
 *
 *   flow           rows size to their content (normal document flow)
 *   even           every row stretches to the tallest row's height
 *   hero-start     first row dominant — twice the share of the others
 *   hero-end       last row dominant
 *   compact-start  first row hugs its content; the rest share evenly
 *   compact-end    last row hugs its content; the rest share evenly
 *
 * Relative (`fr`) tracks resolve against content in an auto-height
 * grid, so no fixed splitter height is required — a track never
 * shrinks below its own content; ratios apply on top. No literal
 * `default` value (standard-value logic); `flow` is the concrete
 * default and reproduces the pre-Distribution behavior exactly.
 */
export const rowDistributionEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "row-distribution@1",
  name: "RowDistribution",
  displayName: "Row Distribution",
  description:
    "Named height pattern across the splitter's rows. `flow` sizes each row to its content; `even` equalizes heights; `hero-*` makes the first/last row dominant; `compact-*` pins the first/last row to its content height.",
  location: { scope: "site", folder: ["Layout"] },
  default: "flow",
  values: [
    { name: "flow", displayName: "Flow (content height)" },
    { name: "even", displayName: "Even" },
    { name: "hero-start", displayName: "Hero First Row" },
    { name: "hero-end", displayName: "Hero Last Row" },
    { name: "compact-start", displayName: "Compact First Row" },
    { name: "compact-end", displayName: "Compact Last Row" },
  ],
} satisfies EnumerationRecipe;

export default rowDistributionEnumRecipe;
