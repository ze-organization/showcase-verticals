import type { ComponentTemplateRecipe } from "../lib/registry/sitecore-recipes";
import { componentIcons } from "./_component-icons";
import { DETAILS_SPLIT_NO_SHARE_PARAMS } from "./_details-shell-params";

/**
 * Recipe for `LocationDetails` — photo, map, address, hours, body,
 * plus in-column / aside / related / full-width placeholders.
 *
 * Intended to sit on `headless-main` via `location-details-partial@1`.
 * Empty datasource = current `location@1` page.
 *
 * Unique keys per type. scai currently does not create the
 * Presentation/Placeholder Settings items these compile to — live
 * was patched for sibling types. Do not re-push until scai
 * materializes them.
 */
export const locationDetailsRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "location-details@1",
  icon: componentIcons["location-details@1"],
  name: "location-details",
  displayName: "Location Details",
  description:
    "Full location view: image, map pin, address, hours, body, plus location-details-{*}, location-details-aside-{*}, location-details-related-{*}, and location-details-full-width-{*} placeholders.",

  section: { handle: "page-details-section@1" },

  fields: [
    {
      name: "Title",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "Location name.",
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
      name: "Region",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Region label.",
        section: "Content",
        sortOrder: 115,
      },
    },
    {
      name: "ShortDescription",
      shape: "text",
      sitecore: {
        type: "multi-line-text",
        hint: "One-line summary under the title.",
        section: "Content",
        sortOrder: 200,
      },
    },
    {
      name: "Content",
      shape: "richText",
      sitecore: {
        type: "rich-text",
        hint: "Long description.",
        section: "Content",
        sortOrder: 300,
      },
    },
    {
      name: "Image",
      shape: "image",
      role: "content",
      sitecore: {
        type: "image",
        hint: "Location photo.",
        section: "Content",
        sortOrder: 400,
      },
    },
    {
      name: "Address1",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Street address, line 1.",
        section: "Content",
        sortOrder: 410,
      },
    },
    {
      name: "Address2",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Street address, line 2.",
        section: "Content",
        sortOrder: 420,
      },
    },
    {
      name: "City",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "City.",
        section: "Content",
        sortOrder: 430,
      },
    },
    {
      name: "State",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "State / region.",
        section: "Content",
        sortOrder: 440,
      },
    },
    {
      name: "PostalCode",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Postal code.",
        section: "Content",
        sortOrder: 450,
      },
    },
    {
      name: "Country",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Country.",
        section: "Content",
        sortOrder: 460,
      },
    },
    {
      name: "Phone",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Phone.",
        section: "Contact",
        sortOrder: 100,
      },
    },
    {
      name: "Email",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Email.",
        section: "Contact",
        sortOrder: 200,
      },
    },
    {
      name: "Hours",
      shape: "richText",
      sitecore: {
        type: "rich-text",
        hint: "Opening hours.",
        section: "Content",
        sortOrder: 470,
      },
    },
    {
      name: "Latitude",
      shape: "number",
      sitecore: {
        type: "number",
        hint: "Decimal latitude.",
        section: "Geo",
        sortOrder: 100,
      },
    },
    {
      name: "Longitude",
      shape: "number",
      sitecore: {
        type: "number",
        hint: "Decimal longitude.",
        section: "Geo",
        sortOrder: 200,
      },
    },
  ],

  params: [...DETAILS_SPLIT_NO_SHARE_PARAMS],

  variants: [{ name: "Default" }],

  dynamicPlaceholders: true,
  placeholders: [
    { key: "location-details-{*}" },
    { key: "location-details-aside-{*}" },
    { key: "location-details-related-{*}" },
    { key: "location-details-full-width-{*}" },
  ],

  placedIn: ["headless-main-{*}"],

  datasource: {
    autoCreate: false,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Location Details" },
      { scope: "site", subfolder: "Location Details" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default locationDetailsRecipe;
