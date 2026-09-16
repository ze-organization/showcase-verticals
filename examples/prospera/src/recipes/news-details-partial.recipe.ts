import type { PartialDesignRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { partialDesignThumbnail } from "./_wireframe-thumbnail";

export const newsDetailsPartialRecipe = {
  kind: "partial-design",
  schemaVersion: "1",
  handle: "news-details-partial@1",
  name: "NewsDetails",
  displayName: "News Details",
  thumbnail: partialDesignThumbnail("News_Details_Partial.png", "News Details"),
  description:
    "News body partial — News Details on headless-main. Include from news-page via partials.",
  layout: {
    placeholders: {
      "headless-main": [
        {
          componentHandle: "news-details@1",
          variant: "Default",
          params: { MaxWidth: "auto" },
          datasourceRef: { kind: "none" },
        },
      ],
    },
  },
} satisfies PartialDesignRecipe;

export default newsDetailsPartialRecipe;
