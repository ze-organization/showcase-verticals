import type { PartialDesignRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { partialDesignThumbnail } from "./_wireframe-thumbnail";

export const offerDetailsPartialRecipe = {
  kind: "partial-design",
  schemaVersion: "1",
  handle: "offer-details-partial@1",
  name: "OfferDetails",
  displayName: "Offer Details",
  thumbnail: partialDesignThumbnail("Offer_Details_Partial.png", "Offer Details"),
  description: "Offer body partial — Offer Details on headless-main.",
  layout: {
    placeholders: {
      "headless-main": [
        {
          componentHandle: "offer-details@1",
          variant: "Default",
          params: { MaxWidth: "auto" },
          datasourceRef: { kind: "none" },
        },
      ],
    },
  },
} satisfies PartialDesignRecipe;

export default offerDetailsPartialRecipe;
