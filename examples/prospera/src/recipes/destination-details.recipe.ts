import type { ComponentTemplateRecipe } from "../lib/registry/sitecore-recipes";
import { componentIcons } from "./_component-icons";
import { DETAILS_SPLIT_SHARE_PARAMS } from "./_details-shell-params";

/**
 * Recipe for `DestinationDetails` — lead image, title, facts, body,
 * plus in-column / aside / related / full-width placeholders.
 *
 * Intended to sit on `headless-main` via `destination-details-partial@1`.
 * Empty datasource = current `destination@1` page.
 */
export const destinationDetailsRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "destination-details@1",
  icon: componentIcons["destination-details@1"],
  name: "destination-details",
  displayName: "Destination Details",
  description:
    "Full destination view: lead image, title, facts, body, plus destination-details-{*}, destination-details-aside-{*}, destination-details-related-{*}, and destination-details-full-width-{*} placeholders.",

  section: { handle: "page-details-section@1" },

  fields: [
    {
      name: "Title",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "Destination name.",
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "Eyebrow",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Optional kicker above the title.",
        section: "Content",
        sortOrder: 110,
      },
    },
    {
      name: "ShortDescription",
      shape: "text",
      sitecore: {
        type: "multi-line-text",
        hint: "Dek under the title.",
        section: "Content",
        sortOrder: 200,
      },
    },
    {
      name: "Content",
      shape: "richText",
      sitecore: {
        type: "rich-text",
        hint: "Destination body.",
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
    {
      name: "Country",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Country.",
        section: "Content",
        sortOrder: 410,
      },
    },
    {
      name: "Continent",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Continent.",
        section: "Content",
        sortOrder: 420,
      },
    },
    {
      name: "TripDuration",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Typical trip length.",
        section: "Content",
        sortOrder: 430,
      },
    },
    {
      name: "StartingPrice",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Starting-price label.",
        section: "Content",
        sortOrder: 440,
      },
    },
  ],

  params: [...DETAILS_SPLIT_SHARE_PARAMS],

  variants: [{ name: "Default" }],

  dynamicPlaceholders: true,
  // Unique keys per type. scai currently does not create the
  // Presentation/Placeholder Settings items these compile to — live
  // was patched. Do not re-push until scai materializes them.
  placeholders: [
    { key: "destination-details-{*}" },
    { key: "destination-details-aside-{*}" },
    { key: "destination-details-related-{*}" },
    { key: "destination-details-full-width-{*}" },
  ],

  placedIn: ["headless-main-{*}"],

  datasource: {
    autoCreate: false,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Destination Details" },
      { scope: "site", subfolder: "Destination Details" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default destinationDetailsRecipe;
