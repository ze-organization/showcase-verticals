import type { PartialDesignRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { partialDesignThumbnail } from "./_wireframe-thumbnail";

export const jobDetailsPartialRecipe = {
  kind: "partial-design",
  schemaVersion: "1",
  handle: "job-details-partial@1",
  name: "JobDetails",
  displayName: "Job Details",
  thumbnail: partialDesignThumbnail("Job_Details_Partial.png", "Job Details"),
  description: "Job body partial — Job Details on headless-main.",
  layout: {
    placeholders: {
      "headless-main": [
        {
          componentHandle: "job-details@1",
          variant: "Default",
          params: { MaxWidth: "auto" },
          datasourceRef: { kind: "none" },
        },
      ],
    },
  },
} satisfies PartialDesignRecipe;

export default jobDetailsPartialRecipe;
