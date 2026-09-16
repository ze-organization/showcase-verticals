import type { PartialDesignRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { partialDesignThumbnail } from "./_wireframe-thumbnail";

/**
 * Person body shell — the third partial on `person-page@1`.
 * Places `person-details@1` on `headless-main` with an empty
 * datasource so the rendering reads the current `person@1` page.
 */
export const personDetailsPartialRecipe = {
  kind: "partial-design",
  schemaVersion: "1",
  handle: "person-details-partial@1",
  name: "PersonDetails",
  displayName: "Person Details",
  thumbnail: partialDesignThumbnail("Person_Details_Partial.png", "Person Details"),
  description:
    "Person body partial — Person Details on headless-main, with in-column, aside, related, and full-width placeholders. Include from person-page via partials.",
  layout: {
    placeholders: {
      "headless-main": [
        {
          componentHandle: "person-details@1",
          variant: "Default",
          params: { MaxWidth: "auto" },
          datasourceRef: { kind: "none" },
        },
      ],
    },
  },
} satisfies PartialDesignRecipe;

export default personDetailsPartialRecipe;
