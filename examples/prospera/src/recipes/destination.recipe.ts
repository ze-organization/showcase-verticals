import {
  pageTemplateThumbnail,
  type PageTemplateRecipe,
} from "./_wireframe-thumbnail";
import { PAGE_SEO_FIELDS } from "./_page-seo-fields";

/**
 * Destination page template — the insert type under `/Home/Destinations`.
 *
 * Bound to `destination-page@1`. Listing stays `page@1`.
 */
export const destinationRecipe = {
  kind: "page-template",
  schemaVersion: "1",
  handle: "destination@1",
  name: "Destination",
  displayName: "Destination",
  thumbnail: pageTemplateThumbnail("Destination_Page_Template.png", "Destination"),
  description:
    "Destination page template — Title / Eyebrow / ShortDescription / Content / Image / Country / Continent / TripDuration / StartingPrice plus the standard SEO field set. Insert this under Destinations; destination-page supplies the Destination Details partial.",

  fields: [
    {
      name: "Title",
      shape: "text",
      sitecore: {
        section: "Content",
        hint: "Destination name used in the layout's primary heading.",
        sortOrder: 100,
      },
    },
    {
      name: "Eyebrow",
      shape: "text",
      sitecore: {
        section: "Content",
        hint: 'Optional kicker above the title (e.g. "Escorted tour").',
        sortOrder: 200,
      },
    },
    {
      name: "ShortDescription",
      shape: "text",
      sitecore: {
        section: "Content",
        type: "multi-line-text",
        hint: "Dek under the title. Read by destination-details@1.",
        sortOrder: 210,
      },
    },
    {
      name: "Content",
      shape: "richText",
      sitecore: {
        section: "Content",
        type: "rich-text",
        hint: "Destination body. Read by destination-details@1.",
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
      name: "Country",
      shape: "text",
      sitecore: {
        section: "Content",
        hint: "Country the destination sits in.",
        sortOrder: 240,
      },
    },
    {
      name: "Continent",
      shape: "text",
      sitecore: {
        section: "Content",
        hint: "Continent the destination sits in.",
        sortOrder: 250,
      },
    },
    {
      name: "TripDuration",
      shape: "text",
      sitecore: {
        section: "Content",
        hint: 'Typical trip length (e.g. "7 nights").',
        sortOrder: 260,
      },
    },
    {
      name: "StartingPrice",
      shape: "text",
      sitecore: {
        section: "Content",
        hint: 'Starting-price label (e.g. "from $1,299").',
        sortOrder: 270,
      },
    },
    ...PAGE_SEO_FIELDS,
  ],

  insertOptions: ["destination@1"],
} satisfies PageTemplateRecipe;

export default destinationRecipe;
