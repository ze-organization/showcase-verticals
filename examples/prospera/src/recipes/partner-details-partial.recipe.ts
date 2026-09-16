import type { PartialDesignRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { partialDesignThumbnail } from "./_wireframe-thumbnail";

export const partnerDetailsPartialRecipe = {
  kind: "partial-design",
  schemaVersion: "1",
  handle: "partner-details-partial@1",
  name: "PartnerDetails",
  displayName: "Partner Details",
  thumbnail: partialDesignThumbnail("Partner_Details_Partial.png", "Partner Details"),
  description: "Partner body partial — Partner Details on headless-main.",
  layout: {
    placeholders: {
      "headless-main": [
        {
          componentHandle: "partner-details@1",
          variant: "Default",
          params: { MaxWidth: "auto" },
          datasourceRef: { kind: "none" },
        },
      ],
    },
  },
} satisfies PartialDesignRecipe;

export default partnerDetailsPartialRecipe;
