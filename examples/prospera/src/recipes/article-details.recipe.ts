import type { ComponentTemplateRecipe } from "../lib/registry/sitecore-recipes";
import { componentIcons } from "./_component-icons";
import { DETAILS_STACKED_EDITORIAL_PARAMS } from "./_details-shell-params";

/**
 * Recipe for `ArticleDetails` (./article-details.tsx) — the full article
 * view from the showcase Article Details component: lead image, sticky
 * share rail, title, short description, body, then two dynamic
 * placeholders (`article-details-{*}` in the column, `article-details-full-width-{*}`
 * below the grid).
 *
 * Intended to sit on `headless-main` via the `article-details-partial@1`
 * partial, which `article-page@1` includes. Empty datasource = current
 * page (`article@1` Title / ShortDescription / Content / Image).
 */
export const articleDetailsRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "article-details@1",
  icon: componentIcons["article-details@1"],
  name: "article-details",
  displayName: "Article Details",
  description:
    "Full article view: lead image, share rail, title, short description, body, plus article-details-{*} and article-details-full-width-{*} placeholders.",

  section: { handle: "page-details-section@1" },

  fields: [
    {
      name: "Title",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "Article headline.",
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "ShortDescription",
      shape: "text",
      sitecore: {
        type: "multi-line-text",
        hint: "Dek / standfirst under the title.",
        section: "Content",
        sortOrder: 200,
      },
    },
    {
      name: "Content",
      shape: "richText",
      sitecore: {
        type: "rich-text",
        hint: "Article body.",
        section: "Content",
        sortOrder: 300,
      },
    },
    {
      name: "Image",
      shape: "image",
      role: "hero",
      sitecore: {
        type: "image",
        hint: "Lead image. 16:9 recommended.",
        section: "Content",
        sortOrder: 400,
      },
    },
  ],

  params: [...DETAILS_STACKED_EDITORIAL_PARAMS],

  variants: [{ name: "Default" }],

  dynamicPlaceholders: true,
  // Live drop zones are Placeholder Settings items under
  // Presentation/Placeholder Settings whose Placeholder Key matches
  // these entries. Empty Allowed Controls (any rendering).
  placeholders: [
    {
      key: "article-details-{*}",
    },
    {
      key: "article-details-full-width-{*}",
    },
  ],

  placedIn: ["headless-main-{*}"],

  datasource: {
    autoCreate: false,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Article Details" },
      { scope: "site", subfolder: "Article Details" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default articleDetailsRecipe;
