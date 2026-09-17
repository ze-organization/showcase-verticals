import {
  pageTemplateThumbnail,
  type PageTemplateRecipe,
} from "./_wireframe-thumbnail";
import { PAGE_SEO_FIELDS } from "./_page-seo-fields";

/**
 * Blank Landing page template — the free-compose insert type under
 * `/Home/Landing-Pages`, next to the fixed-shape `landing@1`.
 *
 * Same SEO set as other showcase types. No campaign body fields: the
 * page design puts a Container on `headless-main` so authors drop
 * heroes, grids, and CTAs themselves. Bound to `blank-landing-page@1`.
 */
export const blankLandingRecipe = {
  kind: "page-template",
  schemaVersion: "1",
  handle: "blank-landing@1",
  name: "BlankLanding",
  displayName: "Blank Landing",
  thumbnail: pageTemplateThumbnail("Blank_Landing_Page_Template.png", "Blank Landing"),
  description:
    "Blank landing page template — Title / Eyebrow plus the standard SEO field set. Insert this under Landing Pages for a header + footer shell with an empty main Container; blank-landing-page supplies that body partial.",

  fields: [
    {
      name: "Title",
      shape: "text",
      sitecore: {
        section: "Content",
        hint: "Page title used in the layout's primary heading. Distinct from Meta Title (which targets `<title>`).",
        sortOrder: 100,
      },
    },
    {
      name: "Eyebrow",
      shape: "text",
      sitecore: {
        section: "Content",
        hint: "Optional small label above the title — campaign name, audience, etc.",
        sortOrder: 200,
      },
    },
    ...PAGE_SEO_FIELDS,
  ],

  insertOptions: ["blank-landing@1"],
} satisfies PageTemplateRecipe;

export default blankLandingRecipe;
