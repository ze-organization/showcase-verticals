import {
  pageTemplateThumbnail,
  type PageTemplateRecipe,
} from "./_wireframe-thumbnail";
import { PAGE_SEO_FIELDS } from "./_page-seo-fields";

/**
 * Location page template — the insert type under `/Home/Locations/{region}`.
 *
 * Bound to `location-page@1`. Listing stays `page@1`.
 */
export const locationRecipe = {
  kind: "page-template",
  schemaVersion: "1",
  handle: "location@1",
  name: "Location",
  displayName: "Location",
  thumbnail: pageTemplateThumbnail("Location_Page_Template.png", "Location"),
  description:
    "Location page template — Title / address / hours / geo plus the standard SEO field set. Insert this under a region listing; location-page supplies the Location Details partial.",

  fields: [
    {
      name: "Title",
      shape: "text",
      sitecore: {
        section: "Content",
        hint: "Location name used in the layout's primary heading.",
        sortOrder: 100,
      },
    },
    {
      name: "Eyebrow",
      shape: "text",
      sitecore: {
        section: "Content",
        hint: 'Optional kicker above the title (e.g. "Flagship").',
        sortOrder: 200,
      },
    },
    {
      name: "Region",
      shape: "text",
      sitecore: {
        section: "Content",
        hint: "Region label (North America, EMEA, APJ). Text, not a taxonomy.",
        sortOrder: 205,
      },
    },
    {
      name: "ShortDescription",
      shape: "text",
      sitecore: {
        section: "Content",
        type: "multi-line-text",
        hint: "Dek under the title. Read by location-details@1.",
        sortOrder: 210,
      },
    },
    {
      name: "Content",
      shape: "richText",
      sitecore: {
        section: "Content",
        type: "rich-text",
        hint: "Location body. Read by location-details@1.",
        sortOrder: 220,
      },
    },
    {
      name: "Image",
      shape: "image",
      sitecore: {
        section: "Content",
        type: "image",
        hint: "Exterior / interior photo. 4:5 or 16:9 recommended.",
        sortOrder: 230,
      },
    },
    {
      name: "Address1",
      shape: "text",
      sitecore: {
        section: "Content",
        hint: "Street address, line 1.",
        sortOrder: 240,
      },
    },
    {
      name: "Address2",
      shape: "text",
      sitecore: {
        section: "Content",
        hint: "Street address, line 2 (suite, floor).",
        sortOrder: 250,
      },
    },
    {
      name: "City",
      shape: "text",
      sitecore: {
        section: "Content",
        hint: "City / locality.",
        sortOrder: 260,
      },
    },
    {
      name: "State",
      shape: "text",
      sitecore: {
        section: "Content",
        hint: "State / region.",
        sortOrder: 270,
      },
    },
    {
      name: "PostalCode",
      shape: "text",
      sitecore: {
        section: "Content",
        hint: "Postal / ZIP code.",
        sortOrder: 280,
      },
    },
    {
      name: "Country",
      shape: "text",
      sitecore: {
        section: "Content",
        hint: "Country.",
        sortOrder: 285,
      },
    },
    {
      name: "Phone",
      shape: "text",
      sitecore: {
        section: "Contact",
        hint: "Phone number.",
        sortOrder: 100,
      },
    },
    {
      name: "Email",
      shape: "text",
      sitecore: {
        section: "Contact",
        hint: "Email address.",
        sortOrder: 200,
      },
    },
    {
      name: "Hours",
      shape: "richText",
      sitecore: {
        section: "Content",
        type: "rich-text",
        hint: "Opening hours. Rich text supports per-day rows.",
        sortOrder: 290,
      },
    },
    {
      name: "Latitude",
      shape: "number",
      sitecore: {
        section: "Geo",
        type: "number",
        hint: "Decimal latitude for the built-in map pin.",
        sortOrder: 100,
      },
    },
    {
      name: "Longitude",
      shape: "number",
      sitecore: {
        section: "Geo",
        type: "number",
        hint: "Decimal longitude for the built-in map pin.",
        sortOrder: 200,
      },
    },
    ...PAGE_SEO_FIELDS,
  ],

  insertOptions: ["location@1"],
} satisfies PageTemplateRecipe;

export default locationRecipe;
