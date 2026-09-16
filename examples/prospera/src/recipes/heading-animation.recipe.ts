import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration backing the `HeadingAnimation` rendering parameter
 * on components that wrap their content in a SectionWrapper-style
 * heading (accordion-block, content-block, tabs-block, …). Lands at
 * `<enumerationsRoot>/Layout/Heading/HeadingAnimation` per-site.
 *
 * Reference from a component recipe via
 * `sitecore.enumHandle: "heading-animation@1"` on the heading-animation
 * param.
 */
export const headingAnimationEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "heading-animation@1",
  name: "HeadingAnimation",
  displayName: "Heading Animation",
  description:
    "Entrance animation for the heading slot. Values match the parser in section-heading.parsers.ts; `none` disables the animation entirely.",
  location: { scope: "site", folder: ["Layout", "Heading"] },
  default: "none",
  values: [
    { name: "none", displayName: "None" },
    { name: "banner-start", displayName: "Slide from Start" },
    { name: "banner-end", displayName: "Slide from End" },
    { name: "banner-center", displayName: "Fade Up" },
  ],
} satisfies EnumerationRecipe;

export default headingAnimationEnumRecipe;
