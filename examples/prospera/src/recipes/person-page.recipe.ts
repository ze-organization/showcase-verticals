import {
  pageDesignThumbnail,
  type PageDesignRecipe,
} from "./_wireframe-thumbnail";

/**
 * Page design for `person@1`. Three partials, same pattern as
 * `article-page@1`. Body is a **partial**, not page-design layout.
 */
export const personPageRecipe = {
  kind: "page-design",
  schemaVersion: "1",
  handle: "person-page@1",
  name: "PersonPage",
  displayName: "Person Page",
  thumbnail: pageDesignThumbnail("Person_Page_Template.png", "Person Page"),
  description:
    "Person page design — header + Person Details partial + footer. The details partial places person-details@1 on headless-main.",
  appliesTo: ["person@1"],
  partials: [
    "header-utility-bar@1",
    "person-details-partial@1",
    "footer-link-columns@1",
  ],
  layout: { placeholders: {} },
} satisfies PageDesignRecipe;

export default personPageRecipe;
