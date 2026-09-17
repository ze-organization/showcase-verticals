import {
  partialDesignThumbnail,
  type PartialDesignRecipe,
} from "./_wireframe-thumbnail";

export const eventDetailsPartialRecipe = {
  kind: "partial-design",
  schemaVersion: "1",
  handle: "event-details-partial@1",
  name: "EventDetails",
  displayName: "Event Details",
  thumbnail: partialDesignThumbnail("Event_Details_Partial.png", "Event Details"),
  description: "Event body partial — Event Details on headless-main.",
  layout: {
    placeholders: {
      "headless-main": [
        {
          componentHandle: "event-details@1",
          variant: "Default",
          params: { MaxWidth: "auto" },
          datasourceRef: { kind: "none" },
        },
      ],
    },
  },
} satisfies PartialDesignRecipe;

export default eventDetailsPartialRecipe;
