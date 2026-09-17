import {
  pageDesignThumbnail,
  type PageDesignRecipe,
} from "./_wireframe-thumbnail";

export const eventPageRecipe = {
  kind: "page-design",
  schemaVersion: "1",
  handle: "event-page@1",
  name: "EventPage",
  displayName: "Event Page",
  thumbnail: pageDesignThumbnail("Event_Page_Template.png", "Event Page"),
  description: "Event page design — header + Event Details partial + footer.",
  appliesTo: ["event@1"],
  partials: [
    "header-utility-bar@1",
    "event-details-partial@1",
    "footer-link-columns@1",
  ],
  layout: { placeholders: {} },
} satisfies PageDesignRecipe;

export default eventPageRecipe;
