import type { PartialDesignRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { partialDesignThumbnail } from "./_wireframe-thumbnail";

/**
 * Landing body shell — the third partial on `landing-page@1`.
 * Places `landing-details@1` on `headless-main` with an empty
 * datasource so the rendering reads the current `landing@1` page.
 */
export const landingDetailsPartialRecipe = {
  kind: "partial-design",
  schemaVersion: "1",
  handle: "landing-details-partial@1",
  name: "LandingDetails",
  displayName: "Landing Details",
  thumbnail: partialDesignThumbnail("Landing_Details_Partial.png", "Landing Details"),
  description:
    "Landing body partial — Landing Details on headless-main, with a trailing full-width placeholder. Include from landing-page via partials.",
  layout: {
    placeholders: {
      "headless-main": [
        {
          componentHandle: "landing-details@1",
          variant: "Default",
          params: { MaxWidth: "auto" },
          datasourceRef: { kind: "none" },
        },
      ],
    },
  },
} satisfies PartialDesignRecipe;

export default landingDetailsPartialRecipe;
