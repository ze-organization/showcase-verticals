import type { PageTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { pageTemplateThumbnail } from "./_wireframe-thumbnail";
import { PAGE_SEO_FIELDS } from "./_page-seo-fields";

/**
 * Service page template — the insert type under `/Home/Services`.
 *
 * IconName lives on listing `feature-card@1` items, not on this page
 * (PageTemplateRecipe has no `enumHandle`). Bound to `service-page@1`.
 */
export const serviceRecipe = {
  kind: "page-template",
  schemaVersion: "1",
  handle: "service@1",
  name: "Service",
  displayName: "Service",
  thumbnail: pageTemplateThumbnail("Service_Page_Template.png", "Service"),
  description:
    "Service page template — Title / Eyebrow / ShortDescription / Content / Image plus the standard SEO field set. Insert this under Services; service-page supplies the Service Details partial.",

  fields: [
    {
      name: "Title",
      shape: "text",
      sitecore: {
        section: "Content",
        hint: "Service name used in the layout's primary heading.",
        sortOrder: 100,
      },
    },
    {
      name: "Eyebrow",
      shape: "text",
      sitecore: {
        section: "Content",
        hint: "Optional small label above the title — practice area, etc.",
        sortOrder: 200,
      },
    },
    {
      name: "ShortDescription",
      shape: "text",
      sitecore: {
        section: "Content",
        type: "multi-line-text",
        hint: "Dek under the title. Read by service-details@1.",
        sortOrder: 210,
      },
    },
    {
      name: "Content",
      shape: "richText",
      sitecore: {
        section: "Content",
        type: "rich-text",
        hint: "Service body. Read by service-details@1.",
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
    ...PAGE_SEO_FIELDS,
  ],

  insertOptions: ["service@1"],
} satisfies PageTemplateRecipe;

export default serviceRecipe;
