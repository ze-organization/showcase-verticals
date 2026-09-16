import type { PageTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { pageTemplateThumbnail } from "./_wireframe-thumbnail";
import { PAGE_SEO_FIELDS } from "./_page-seo-fields";

export const jobRecipe = {
  kind: "page-template",
  schemaVersion: "1",
  handle: "job@1",
  name: "Job",
  displayName: "Job",
  thumbnail: pageTemplateThumbnail("Job_Page_Template.png", "Job"),
  description:
    "Job page template — Title / Eyebrow / ShortDescription / Content / Image / Department / EmploymentType / LocationName / LocationLink plus SEO. Insert under Careers.",
  fields: [
    {
      name: "Title",
      shape: "text",
      sitecore: {
        section: "Content",
        hint: "Role title.",
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
        hint: "Job body — responsibilities, requirements.",
        sortOrder: 220,
      },
    },
    {
      name: "Image",
      shape: "image",
      sitecore: {
        section: "Content",
        type: "image",
        hint: "Optional lead image.",
        sortOrder: 230,
      },
    },
    {
      name: "Department",
      shape: "text",
      sitecore: {
        section: "Content",
        hint: "Department name.",
        sortOrder: 240,
      },
    },
    {
      name: "EmploymentType",
      shape: "text",
      sitecore: {
        section: "Content",
        hint: "Full-time, contract, etc.",
        sortOrder: 250,
      },
    },
    {
      name: "LocationName",
      shape: "text",
      sitecore: {
        section: "Content",
        hint: "Location label (city or Remote).",
        sortOrder: 260,
      },
    },
    {
      name: "LocationLink",
      shape: "link",
      sitecore: {
        section: "Content",
        type: "general-link",
        hint: "Optional link to a Location page.",
        sortOrder: 270,
      },
    },
    ...PAGE_SEO_FIELDS,
  ],
  insertOptions: ["job@1"],
} satisfies PageTemplateRecipe;

export default jobRecipe;
