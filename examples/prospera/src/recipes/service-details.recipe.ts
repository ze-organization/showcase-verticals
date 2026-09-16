import type { ComponentTemplateRecipe } from "../lib/registry/sitecore-recipes";
import { componentIcons } from "./_component-icons";
import { DETAILS_STACKED_EYEBROW_PARAMS } from "./_details-shell-params";

/**
 * Recipe for `ServiceDetails` — lead image, title, dek, body, plus
 * in-column / related / full-width placeholders. Closest to Article
 * Details without a table of contents.
 *
 * Intended to sit on `headless-main` via `service-details-partial@1`.
 * Empty datasource = current `service@1` page.
 */
export const serviceDetailsRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "service-details@1",
  icon: componentIcons["service-details@1"],
  name: "service-details",
  displayName: "Service Details",
  description:
    "Full service view: lead image, title, short description, body, plus service-details-{*}, service-details-related-{*}, and service-details-full-width-{*} placeholders.",

  section: { handle: "page-details-section@1" },

  fields: [
    {
      name: "Title",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "Service name.",
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
        hint: "Service body.",
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
  ],

  params: [...DETAILS_STACKED_EYEBROW_PARAMS],

  variants: [{ name: "Default" }],

  dynamicPlaceholders: true,
  // Unique keys per type. scai currently does not create the
  // Presentation/Placeholder Settings items these compile to — live
  // was patched. Do not re-push until scai materializes them.
  placeholders: [
    { key: "service-details-{*}" },
    { key: "service-details-related-{*}" },
    { key: "service-details-full-width-{*}" },
  ],

  placedIn: ["headless-main-{*}"],

  datasource: {
    autoCreate: false,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Service Details" },
      { scope: "site", subfolder: "Service Details" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default serviceDetailsRecipe;
