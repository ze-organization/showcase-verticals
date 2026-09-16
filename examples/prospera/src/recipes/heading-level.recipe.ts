import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration backing the `HeadingLevel` rendering parameter on
 * components that wrap their content in a SectionWrapper-style heading
 * (content-block, accordion-block, tabs-block, …). Lands at
 * `<enumerationsRoot>/Layout/Heading/HeadingLevel` per-site.
 *
 * Reference from a component recipe via `sitecore.enumHandle:
 * "heading-level@1"`. Values map to a semantic HTML tag swap — the
 * typographic scale stays driven by `heading-size@1`, so authors don't
 * pick `h1` to make a heading bigger.
 *
 * Range deliberately stops at `h4`: h5 / h6 tempt authors to misuse
 * level as size, and the registry's section-heading scale doesn't
 * meaningfully span past h4. Sections that need a deeper outline
 * should compose multiple content blocks.
 */
export const headingLevelEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "heading-level@1",
  name: "HeadingLevel",
  displayName: "Heading Level",
  description:
    "Semantic heading tag (h1–h4) for the title slot. Independent of HeadingSize.",
  location: { scope: "site", folder: ["Layout", "Heading"] },
  default: "h2",
  values: [
    { name: "h1", displayName: "H1" },
    { name: "h2", displayName: "H2" },
    { name: "h3", displayName: "H3" },
    { name: "h4", displayName: "H4" },
  ],
} satisfies EnumerationRecipe;

export default headingLevelEnumRecipe;
