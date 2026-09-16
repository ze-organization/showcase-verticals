import type { PartialDesignRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { partialDesignThumbnail } from "./_wireframe-thumbnail";

/**
 * Location body shell — the third partial on `location-page@1`.
 * Places `location-details@1` on `headless-main` with an empty
 * datasource so the rendering reads the current `location@1` page.
 */
export const locationDetailsPartialRecipe = {
  kind: "partial-design",
  schemaVersion: "1",
  handle: "location-details-partial@1",
  name: "LocationDetails",
  displayName: "Location Details",
  thumbnail: partialDesignThumbnail("Location_Details_Partial.png", "Location Details"),
  description:
    "Location body partial — Location Details on headless-main, with in-column, aside, related, and full-width placeholders. Include from location-page via partials.",
  layout: {
    placeholders: {
      "headless-main": [
        {
          componentHandle: "location-details@1",
          variant: "Default",
          params: { MaxWidth: "auto" },
          datasourceRef: { kind: "none" },
        },
      ],
    },
  },
} satisfies PartialDesignRecipe;

export default locationDetailsPartialRecipe;
