import type { PartialDesignRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { partialDesignThumbnail } from "./_wireframe-thumbnail";

/**
 * Destination body shell — the third partial on `destination-page@1`.
 * Places `destination-details@1` on `headless-main` with an empty
 * datasource so the rendering reads the current `destination@1` page.
 */
export const destinationDetailsPartialRecipe = {
  kind: "partial-design",
  schemaVersion: "1",
  handle: "destination-details-partial@1",
  name: "DestinationDetails",
  displayName: "Destination Details",
  thumbnail: partialDesignThumbnail("Destination_Details_Partial.png", "Destination Details"),
  description:
    "Destination body partial — Destination Details on headless-main, with in-column, aside, related, and full-width placeholders. Include from destination-page via partials.",
  layout: {
    placeholders: {
      "headless-main": [
        {
          componentHandle: "destination-details@1",
          variant: "Default",
          params: { MaxWidth: "auto" },
          datasourceRef: { kind: "none" },
        },
      ],
    },
  },
} satisfies PartialDesignRecipe;

export default destinationDetailsPartialRecipe;
