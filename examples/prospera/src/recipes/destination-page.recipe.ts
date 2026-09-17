import {
  pageDesignThumbnail,
  type PageDesignRecipe,
} from "./_wireframe-thumbnail";

/**
 * Page design for `destination@1`. Three partials, same pattern as
 * `article-page@1`. Body is a **partial**, not page-design layout.
 */
export const destinationPageRecipe = {
  kind: "page-design",
  schemaVersion: "1",
  handle: "destination-page@1",
  name: "DestinationPage",
  displayName: "Destination Page",
  thumbnail: pageDesignThumbnail("Destination_Page_Template.png", "Destination Page"),
  description:
    "Destination page design — header + Destination Details partial + footer. The details partial places destination-details@1 on headless-main.",
  appliesTo: ["destination@1"],
  partials: [
    "header-utility-bar@1",
    "destination-details-partial@1",
    "footer-link-columns@1",
  ],
  layout: { placeholders: {} },
} satisfies PageDesignRecipe;

export default destinationPageRecipe;
