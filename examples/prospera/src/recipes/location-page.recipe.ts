import {
  pageDesignThumbnail,
  type PageDesignRecipe,
} from "./_wireframe-thumbnail";

/**
 * Page design for `location@1`. Three partials, same pattern as
 * `article-page@1`. Body is a **partial**, not page-design layout.
 */
export const locationPageRecipe = {
  kind: "page-design",
  schemaVersion: "1",
  handle: "location-page@1",
  name: "LocationPage",
  displayName: "Location Page",
  thumbnail: pageDesignThumbnail("Location_Page_Template.png", "Location Page"),
  description:
    "Location page design — header + Location Details partial + footer. The details partial places location-details@1 on headless-main.",
  appliesTo: ["location@1"],
  partials: [
    "header-utility-bar@1",
    "location-details-partial@1",
    "footer-link-columns@1",
  ],
  layout: { placeholders: {} },
} satisfies PageDesignRecipe;

export default locationPageRecipe;
