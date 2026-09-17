import {
  pageDesignThumbnail,
  type PageDesignRecipe,
} from "./_wireframe-thumbnail";

/**
 * Page design for `landing@1`. Three partials, same pattern as
 * `article-page@1`. Body is a **partial**, not page-design layout.
 */
export const landingPageRecipe = {
  kind: "page-design",
  schemaVersion: "1",
  handle: "landing-page@1",
  name: "LandingPage",
  displayName: "Landing Page",
  thumbnail: pageDesignThumbnail("Landing_Page_Template.png", "Landing Page"),
  description:
    "Landing page design — header + Landing Details partial + footer. The details partial places landing-details@1 on headless-main.",
  appliesTo: ["landing@1"],
  partials: [
    "header-utility-bar@1",
    "landing-details-partial@1",
    "footer-link-columns@1",
  ],
  layout: { placeholders: {} },
} satisfies PageDesignRecipe;

export default landingPageRecipe;
