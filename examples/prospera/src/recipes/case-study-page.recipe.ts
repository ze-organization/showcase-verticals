import type { PageDesignRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { pageDesignThumbnail } from "./_wireframe-thumbnail";

/**
 * Page design for `case-study@1`. Three partials, same pattern as
 * `article-page@1`. Body is a **partial**, not page-design layout.
 */
export const caseStudyPageRecipe = {
  kind: "page-design",
  schemaVersion: "1",
  handle: "case-study-page@1",
  name: "CaseStudyPage",
  displayName: "Case Study Page",
  thumbnail: pageDesignThumbnail("Case_Study_Page_Template.png", "Case Study Page"),
  description:
    "Case Study page design — header + Case Study Details partial + footer. The details partial places case-study-details@1 on headless-main.",
  appliesTo: ["case-study@1"],
  partials: [
    "header-utility-bar@1",
    "case-study-details-partial@1",
    "footer-link-columns@1",
  ],
  layout: { placeholders: {} },
} satisfies PageDesignRecipe;

export default caseStudyPageRecipe;
