import type { PageTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { pageTemplateThumbnail } from "./_wireframe-thumbnail";
import { PAGE_SEO_FIELDS } from "./_page-seo-fields";

export const eventRecipe = {
  kind: "page-template",
  schemaVersion: "1",
  handle: "event@1",
  name: "Event",
  displayName: "Event",
  thumbnail: pageTemplateThumbnail("Event_Page_Template.png", "Event"),
  description:
    "Event page template — Title / Eyebrow / ShortDescription / Content / Image / StartDate / EndDate / Venue / VirtualUrl / RegistrationAction plus SEO. Insert under Events.",
  fields: [
    {
      name: "Title",
      shape: "text",
      sitecore: {
        section: "Content",
        hint: "Event name.",
        sortOrder: 100,
      },
    },
    {
      name: "Eyebrow",
      shape: "text",
      sitecore: {
        section: "Content",
        hint: "Optional kicker — workshop, summit, etc.",
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
        hint: "Event body.",
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
      name: "StartDate",
      shape: "text",
      sitecore: {
        section: "Content",
        hint: "Start date display string.",
        sortOrder: 240,
      },
    },
    {
      name: "EndDate",
      shape: "text",
      sitecore: {
        section: "Content",
        hint: "End date display string.",
        sortOrder: 250,
      },
    },
    {
      name: "Venue",
      shape: "text",
      sitecore: {
        section: "Content",
        hint: "Venue or city.",
        sortOrder: 260,
      },
    },
    {
      name: "VirtualUrl",
      shape: "text",
      sitecore: {
        section: "Content",
        hint: "Optional virtual join URL.",
        sortOrder: 270,
      },
    },
    {
      name: "RegistrationAction",
      shape: "link",
      sitecore: {
        section: "Content",
        type: "general-link",
        hint: "Register CTA.",
        sortOrder: 280,
      },
    },
    ...PAGE_SEO_FIELDS,
  ],
  insertOptions: ["event@1"],
} satisfies PageTemplateRecipe;

export default eventRecipe;
