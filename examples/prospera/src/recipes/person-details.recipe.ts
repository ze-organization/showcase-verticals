import type { ComponentTemplateRecipe } from "../lib/registry/sitecore-recipes";
import { componentIcons } from "./_component-icons";
import { DETAILS_PERSON_PARAMS } from "./_details-shell-params";

/**
 * Recipe for `PersonDetails` — headshot, name, role, bio, plus
 * in-column / aside / related / full-width placeholders.
 *
 * Intended to sit on `headless-main` via `person-details-partial@1`.
 * Empty datasource = current `person@1` page.
 */
export const personDetailsRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "person-details@1",
  icon: componentIcons["person-details@1"],
  name: "person-details",
  displayName: "Person Details",
  description:
    "Full person view: headshot, name, role, bio, plus person-details-{*}, person-details-aside-{*}, person-details-related-{*}, and person-details-full-width-{*} placeholders.",

  section: { handle: "page-details-section@1" },

  fields: [
    {
      name: "Title",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Page title fallback when FullName is empty.",
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "FullName",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "Full name.",
        section: "Content",
        sortOrder: 110,
      },
    },
    {
      name: "Role",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Job title, position, or specialty.",
        section: "Content",
        sortOrder: 120,
      },
    },
    {
      name: "Bio",
      shape: "richText",
      sitecore: {
        type: "rich-text",
        hint: "Long-form bio.",
        section: "Content",
        sortOrder: 130,
      },
    },
    {
      name: "Eyebrow",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Small label above the name.",
        section: "Content",
        sortOrder: 140,
      },
    },
    {
      name: "Image",
      shape: "image",
      role: "person",
      sitecore: {
        type: "image",
        hint: "Headshot.",
        section: "Content",
        sortOrder: 150,
      },
    },
    {
      name: "Email",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Contact email.",
        section: "Contact",
        sortOrder: 100,
      },
    },
    {
      name: "Phone",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Contact phone.",
        section: "Contact",
        sortOrder: 200,
      },
    },
  ],

  params: [...DETAILS_PERSON_PARAMS],

  variants: [{ name: "Default" }],

  dynamicPlaceholders: true,
  // Unique keys per type. scai currently does not create the
  // Presentation/Placeholder Settings items these compile to — live
  // was patched. Do not re-push until scai materializes them.
  placeholders: [
    { key: "person-details-{*}" },
    { key: "person-details-aside-{*}" },
    { key: "person-details-related-{*}" },
    { key: "person-details-full-width-{*}" },
  ],

  placedIn: ["headless-main-{*}"],

  datasource: {
    autoCreate: false,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Person Details" },
      { scope: "site", subfolder: "Person Details" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default personDetailsRecipe;
