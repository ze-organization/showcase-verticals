import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration backing the `HeadingSize` rendering parameter on
 * components that wrap their content in a SectionWrapper-style heading
 * (accordion-block, content-block, tabs-block, …). Lands at
 * `<enumerationsRoot>/Layout/Heading/HeadingSize` per-site.
 *
 * Reference from a component recipe via
 * `sitecore.enumHandle: "heading-size@1"` on the heading-size param.
 *
 * Distinct from `size@1` (component-level scale) — `default` here means
 * "the natural typographic size for this heading slot", which doesn't
 * align with the broader sm→xl scale.
 */
export const headingSizeEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "heading-size@1",
  name: "HeadingSize",
  displayName: "Heading Size",
  description:
    "Shared scale for the heading slot. Values match the parser in section-heading.parsers.ts. Bind from the measured source treatment: body-sized section label → small; typical section title → default; prominent title clearly above body scale → large; strong headline block dominating the section (often paired with an eyebrow kicker) → xl; oversized hero-band statement type → text-banner. The subtitle/lead scales proportionally with the pick.",
  location: { scope: "site", folder: ["Layout", "Heading"] },
  default: "default",
  values: [
    { name: "small", displayName: "Small" },
    { name: "default", displayName: "Default" },
    { name: "large", displayName: "Large" },
    { name: "xl", displayName: "Extra Large" },
    { name: "text-banner", displayName: "Text Banner" },
  ],
} satisfies EnumerationRecipe;

export default headingSizeEnumRecipe;
