import type { PageTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { pageTemplateThumbnail } from "./_wireframe-thumbnail";
import { PAGE_SEO_FIELDS } from "./_page-seo-fields";

export const partnerRecipe = {
  kind: "page-template",
  schemaVersion: "1",
  handle: "partner@1",
  name: "Partner",
  displayName: "Partner",
  thumbnail: pageTemplateThumbnail("Partner_Page_Template.png", "Partner"),
  description:
    "Partner page template — Title / Eyebrow / ShortDescription / Content / Image / Logo / Website / PartnerType plus SEO. Insert under Partners.",
  fields: [
    {
      name: "Title",
      shape: "text",
      sitecore: {
        section: "Content",
        hint: "Partner name.",
        sortOrder: 100,
      },
    },
    {
      name: "Eyebrow",
      shape: "text",
      sitecore: {
        section: "Content",
        hint: "Optional kicker.",
        sortOrder: 200,
      },
    },
    {
      name: "ShortDescription",
      shape: "text",
      sitecore: {
        section: "Content",
        type: "multi-line-text",
        hint: "Dek under the title.",
        sortOrder: 210,
      },
    },
    {
      name: "Content",
      shape: "richText",
      sitecore: {
        section: "Content",
        type: "rich-text",
        hint: "Partner body.",
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
      name: "Logo",
      shape: "image",
      sitecore: {
        section: "Content",
        type: "image",
        hint: "Partner logo. Square recommended.",
        sortOrder: 240,
      },
    },
    {
      name: "Website",
      shape: "link",
      sitecore: {
        section: "Content",
        type: "general-link",
        hint: "Partner website.",
        sortOrder: 250,
      },
    },
    {
      name: "PartnerType",
      shape: "text",
      sitecore: {
        section: "Content",
        hint: "Technology, Channel, or similar label.",
        sortOrder: 260,
      },
    },
    ...PAGE_SEO_FIELDS,
  ],
  insertOptions: ["partner@1"],
} satisfies PageTemplateRecipe;

export default partnerRecipe;
