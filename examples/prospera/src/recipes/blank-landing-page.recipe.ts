import {
  pageDesignThumbnail,
  type PageDesignRecipe,
} from "./_wireframe-thumbnail";

/**
 * Page design for `blank-landing@1`. Three partials, same chrome as
 * `landing-page@1`, but the body is an empty Container instead of
 * Landing Details:
 *
 *   headless-header  ← header-utility-bar@1
 *   headless-main    ← blank-landing-main-partial@1  (Container)
 *   headless-footer  ← footer-link-columns@1
 *
 * Body is a **partial**, not page-design layout. Insert → Blank Landing
 * therefore always gets header, footer, and a main drop zone.
 */
export const blankLandingPageRecipe = {
  kind: "page-design",
  schemaVersion: "1",
  handle: "blank-landing-page@1",
  name: "BlankLandingPage",
  displayName: "Blank Landing Page",
  thumbnail: pageDesignThumbnail("Blank_Landing_Page_Template.png", "Blank Landing Page"),
  description:
    "Blank Landing page design — header + empty Container partial + footer. Authors compose the campaign in container-{*}; FullBleed Container variant for page-top heroes.",
  appliesTo: ["blank-landing@1"],
  partials: [
    "header-utility-bar@1",
    "blank-landing-main-partial@1",
    "footer-link-columns@1",
  ],
  layout: { placeholders: {} },
} satisfies PageDesignRecipe;

export default blankLandingPageRecipe;
