import {
  pageTemplateThumbnail,
  type PageTemplateRecipe,
} from "./_wireframe-thumbnail";
import { PAGE_SEO_FIELDS } from "./_page-seo-fields";

/**
 * Person page template — the insert type under `/Home/People`.
 *
 * A doctor, teammate, or guide is a Person; `Role` carries the
 * specialty or title. `author@1` stays a content item for bylines.
 *
 * Bound to `person-page@1`. Listing stays `page@1`.
 */
export const personRecipe = {
  kind: "page-template",
  schemaVersion: "1",
  handle: "person@1",
  name: "Person",
  displayName: "Person",
  thumbnail: pageTemplateThumbnail("Person_Page_Template.png", "Person"),
  description:
    "Person page template — Title / FullName / Role / Bio / Eyebrow / Image / Email / Phone plus the standard SEO field set. Insert this under People; person-page supplies the Person Details partial.",

  fields: [
    {
      name: "Title",
      shape: "text",
      sitecore: {
        section: "Content",
        hint: "Page title. Often the same as FullName; used when FullName is empty.",
        sortOrder: 100,
      },
    },
    {
      name: "FullName",
      shape: "text",
      sitecore: {
        section: "Content",
        hint: 'Full name (e.g. "Amira Hassan"). Read by person-details@1 as the heading.',
        sortOrder: 110,
      },
    },
    {
      name: "Role",
      shape: "text",
      sitecore: {
        section: "Content",
        hint: 'Job title, position, or specialty (e.g. "Cardiologist", "Engineering Manager").',
        sortOrder: 120,
      },
    },
    {
      name: "Bio",
      shape: "richText",
      sitecore: {
        section: "Content",
        type: "rich-text",
        hint: "Long-form bio. Read by person-details@1.",
        sortOrder: 130,
      },
    },
    {
      name: "Eyebrow",
      shape: "text",
      sitecore: {
        section: "Content",
        hint: 'Small label above the name (e.g. "Leadership", "Care team").',
        sortOrder: 140,
      },
    },
    {
      name: "Image",
      shape: "image",
      sitecore: {
        section: "Content",
        type: "image",
        hint: "Headshot. 3:4 recommended.",
        sortOrder: 150,
      },
    },
    {
      name: "Email",
      shape: "text",
      sitecore: {
        section: "Contact",
        hint: "Contact email (optional).",
        sortOrder: 160,
      },
    },
    {
      name: "Phone",
      shape: "text",
      sitecore: {
        section: "Contact",
        hint: "Contact phone (optional).",
        sortOrder: 170,
      },
    },
    ...PAGE_SEO_FIELDS,
  ],

  insertOptions: ["person@1"],
} satisfies PageTemplateRecipe;

export default personRecipe;
