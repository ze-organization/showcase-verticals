import {
  partialDesignThumbnail,
  type PartialDesignRecipe,
} from "./_wireframe-thumbnail";

/**
 * Service body shell — the third partial on `service-page@1`.
 * Places `service-details@1` on `headless-main` with an empty
 * datasource so the rendering reads the current `service@1` page.
 */
export const serviceDetailsPartialRecipe = {
  kind: "partial-design",
  schemaVersion: "1",
  handle: "service-details-partial@1",
  name: "ServiceDetails",
  displayName: "Service Details",
  thumbnail: partialDesignThumbnail("Service_Details_Partial.png", "Service Details"),
  description:
    "Service body partial — Service Details on headless-main, with in-column, related, and full-width placeholders. Include from service-page via partials.",
  layout: {
    placeholders: {
      "headless-main": [
        {
          componentHandle: "service-details@1",
          variant: "Default",
          params: { MaxWidth: "auto" },
          datasourceRef: { kind: "none" },
        },
      ],
    },
  },
} satisfies PartialDesignRecipe;

export default serviceDetailsPartialRecipe;
