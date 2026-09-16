import type { PageTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { pageTemplateThumbnail } from "./_wireframe-thumbnail";
import { PAGE_SEO_FIELDS } from "./_page-seo-fields";

/**
 * Case Study page template — the insert type under `/Home/Case-Studies`.
 *
 * Bound to `case-study-page@1`. Listing stays `page@1`.
 */
export const caseStudyRecipe = {
  kind: "page-template",
  schemaVersion: "1",
  handle: "case-study@1",
  name: "CaseStudy",
  displayName: "Case Study",
  thumbnail: pageTemplateThumbnail("Case_Study_Page_Template.png", "Case Study"),
  description:
    "Case Study page template — Title / Eyebrow / ShortDescription / Client / Category / Problem / Solution / Image plus the standard SEO field set. Insert this under Case Studies; case-study-page supplies the Case Study Details partial.",

  fields: [
    {
      name: "Title",
      shape: "text",
      sitecore: {
        section: "Content",
        hint: "Case study headline used in the layout's primary heading.",
        sortOrder: 100,
      },
    },
    {
      name: "Eyebrow",
      shape: "text",
      sitecore: {
        section: "Content",
        hint: "Optional kicker above the title — industry, year, etc.",
        sortOrder: 200,
      },
    },
    {
      name: "ShortDescription",
      shape: "text",
      sitecore: {
        section: "Content",
        type: "multi-line-text",
        hint: "Abstract under the title. Read by case-study-details@1.",
        sortOrder: 210,
      },
    },
    {
      name: "Client",
      shape: "text",
      sitecore: {
        section: "Content",
        hint: "Client or organization name.",
        sortOrder: 220,
      },
    },
    {
      name: "Category",
      shape: "text",
      sitecore: {
        section: "Content",
        hint: "Practice area or industry label.",
        sortOrder: 230,
      },
    },
    {
      name: "Problem",
      shape: "richText",
      sitecore: {
        section: "Content",
        type: "rich-text",
        hint: "The challenge the client brought. Read by case-study-details@1.",
        sortOrder: 240,
      },
    },
    {
      name: "Solution",
      shape: "richText",
      sitecore: {
        section: "Content",
        type: "rich-text",
        hint: "What shipped and what changed. Read by case-study-details@1.",
        sortOrder: 250,
      },
    },
    {
      name: "Image",
      shape: "image",
      sitecore: {
        section: "Content",
        type: "image",
        hint: "Cover image. 16:9 recommended.",
        sortOrder: 260,
      },
    },
    ...PAGE_SEO_FIELDS,
  ],

  insertOptions: ["case-study@1"],
} satisfies PageTemplateRecipe;

export default caseStudyRecipe;
