import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration backing the `HeadingLayout` rendering parameter on
 * components that wrap their content in a SectionWrapper-style heading
 * (accordion-block, content-block, tabs-block, …). Lands at
 * `<enumerationsRoot>/Layout/Heading/HeadingLayout` per-site.
 *
 * Reference from a component recipe via
 * `sitecore.enumHandle: "heading-layout@1"` on the heading-layout param.
 */
export const headingLayoutEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "heading-layout@1",
  name: "HeadingLayout",
  displayName: "Heading Layout",
  description:
    "Heading layout for section-wrapped components. Two alignment axes (start / center, logical & RTL-safe) crossed with three treatments: plain, accent (the brand scribble under the title), and section-divider (a full-width hairline rule under the heading block). Start-aligned source headers → start or start-with-section-divider; centered title+subtitle stacks (incl. centered small-caps kicker + large title — pair with Eyebrow + HeadingSize) → center; decorative underlined centerpiece → center-with-accent.",
  location: { scope: "site", folder: ["Layout", "Heading"] },
  default: "start-with-section-divider",
  values: [
    { name: "start", displayName: "Start-Aligned" },
    { name: "start-with-accent", displayName: "Start-Aligned with Accent" },
    {
      name: "start-with-section-divider",
      displayName: "Start-Aligned with Section Divider",
    },
    { name: "center", displayName: "Centered" },
    { name: "center-with-accent", displayName: "Centered with Accent" },
    {
      name: "center-with-section-divider",
      displayName: "Centered with Section Divider",
    },
  ],
} satisfies EnumerationRecipe;

export default headingLayoutEnumRecipe;
