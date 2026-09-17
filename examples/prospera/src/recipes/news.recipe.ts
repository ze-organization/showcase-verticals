import {
  pageTemplateThumbnail,
  type PageTemplateRecipe,
} from "./_wireframe-thumbnail";
import { PAGE_SEO_FIELDS } from "./_page-seo-fields";

/**
 * News page template — insert type under `/Home/News`. Same body
 * fields as Article plus Source / DisplayDate. Bound to `news-page@1`.
 */
export const newsRecipe = {
  kind: "page-template",
  schemaVersion: "1",
  handle: "news@1",
  name: "News",
  displayName: "News",
  thumbnail: pageTemplateThumbnail("News_Page_Template.png", "News"),
  description:
    "News page template — Title / Eyebrow / ShortDescription / Content / Image / Source / DisplayDate plus SEO. Insert under News; news-page supplies News Details.",
  fields: [
    {
      name: "Title",
      shape: "text",
      sitecore: {
        section: "Content",
        hint: "Headline used in the layout's primary heading.",
        sortOrder: 100,
      },
    },
    {
      name: "Eyebrow",
      shape: "text",
      sitecore: {
        section: "Content",
        hint: "Optional kicker — desk, beat, etc.",
        sortOrder: 200,
      },
    },
    {
      name: "ShortDescription",
      shape: "text",
      sitecore: {
        section: "Content",
        type: "multi-line-text",
        hint: "Dek under the title. Read by news-details@1.",
        sortOrder: 210,
      },
    },
    {
      name: "Content",
      shape: "richText",
      sitecore: {
        section: "Content",
        type: "rich-text",
        hint: "News body. Read by news-details@1.",
        sortOrder: 220,
      },
    },
    {
      name: "Image",
      shape: "image",
      sitecore: {
        section: "Content",
        type: "image",
        hint: "Lead image. 16:9 recommended.",
        sortOrder: 230,
      },
    },
    {
      name: "Source",
      shape: "text",
      sitecore: {
        section: "Content",
        hint: "Wire or desk attribution (e.g. Showcase Desk).",
        sortOrder: 240,
      },
    },
    {
      name: "DisplayDate",
      shape: "text",
      sitecore: {
        section: "Content",
        hint: "Display date (ISO or authored string).",
        sortOrder: 250,
      },
    },
    ...PAGE_SEO_FIELDS.map((field) =>
      field.name === "OgType" ? { ...field, default: "article" } : field,
    ),
  ],
  insertOptions: ["news@1"],
} satisfies PageTemplateRecipe;

export default newsRecipe;
