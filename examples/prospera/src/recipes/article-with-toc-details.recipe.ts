import type { ComponentTemplateRecipe } from "../lib/registry/sitecore-recipes";
import { componentIcons } from "./_component-icons";
import { DETAILS_STACKED_TOC_PARAMS } from "./_details-shell-params";

/**
 * Recipe for `ArticleWithTocDetails` (./article-with-toc-details.tsx) —
 * the Article Details shell plus a table of contents derived from h2 / h3
 * in the page Content field. Lead image, sticky share rail, title, dek,
 * TOC | body, then two dynamic placeholders.
 *
 * Intended to sit on `headless-main` via
 * `article-with-toc-details-partial@1`, which `article-with-toc-page@1`
 * includes. Empty datasource = current page (`article-with-toc@1`).
 */
export const articleWithTocDetailsRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "article-with-toc-details@1",
  icon: componentIcons["article-with-toc-details@1"],
  name: "article-with-toc-details",
  displayName: "Article with Table of Contents Details",
  description:
    "Full article view with a table of contents from Content h2 / h3: lead image, share rail, title, short description, TOC beside body, plus article-with-toc-details-{*} and article-with-toc-details-full-width-{*} placeholders.",

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
        hint: "Article body. h2 / h3 headings populate the table of contents.",
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

  params: [...DETAILS_STACKED_TOC_PARAMS],

  variants: [{ name: "Default" }],

  dynamicPlaceholders: true,
  // Keys are unique to this type (do not reuse article-details-{*}).
  // scai writes hashed GUIDs onto the rendering Placeholders field
  // but currently does not create the Presentation/Placeholder Settings
  // items — those were patched live. Do not re-push this recipe until
  // scai materializes them, or the rendering will point at missing IDs.
  placeholders: [
    {
      key: "article-with-toc-details-{*}",
    },
    {
      key: "article-with-toc-details-full-width-{*}",
    },
  ],

  placedIn: ["headless-main-{*}"],

  datasource: {
    autoCreate: false,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Article with TOC Details" },
      { scope: "site", subfolder: "Article with TOC Details" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default articleWithTocDetailsRecipe;
