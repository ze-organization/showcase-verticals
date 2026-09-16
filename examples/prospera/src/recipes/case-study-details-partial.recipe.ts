import type { PartialDesignRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { partialDesignThumbnail } from "./_wireframe-thumbnail";

/**
 * Case Study body shell — the third partial on `case-study-page@1`.
 * Places `case-study-details@1` on `headless-main` with an empty
 * datasource so the rendering reads the current `case-study@1` page.
 */
export const caseStudyDetailsPartialRecipe = {
  kind: "partial-design",
  schemaVersion: "1",
  handle: "case-study-details-partial@1",
  name: "CaseStudyDetails",
  displayName: "Case Study Details",
  thumbnail: partialDesignThumbnail("Case_Study_Details_Partial.png", "Case Study Details"),
  description:
    "Case Study body partial — Case Study Details on headless-main, with in-column, aside, related, and full-width placeholders. Include from case-study-page via partials.",
  layout: {
    placeholders: {
      "headless-main": [
        {
          componentHandle: "case-study-details@1",
          variant: "Default",
          params: { MaxWidth: "auto" },
          datasourceRef: { kind: "none" },
        },
      ],
    },
  },
} satisfies PartialDesignRecipe;

export default caseStudyDetailsPartialRecipe;
