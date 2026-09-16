import type { ComponentTemplateRecipe } from "../lib/registry/sitecore-recipes";
import { componentIcons } from "./_component-icons";
import { DETAILS_SPLIT_SHARE_PARAMS } from "./_details-shell-params";

/**
 * Recipe for `CaseStudyDetails` — cover image, title, client/category
 * facts, problem, solution, plus in-column / aside / related /
 * full-width placeholders.
 *
 * Intended to sit on `headless-main` via `case-study-details-partial@1`.
 * Empty datasource = current `case-study@1` page.
 */
export const caseStudyDetailsRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "case-study-details@1",
  icon: componentIcons["case-study-details@1"],
  name: "case-study-details",
  displayName: "Case Study Details",
  description:
    "Full case study view: cover image, title, facts, problem, solution, plus case-study-details-{*}, case-study-details-aside-{*}, case-study-details-related-{*}, and case-study-details-full-width-{*} placeholders.",

  section: { handle: "page-details-section@1" },

  fields: [
    {
      name: "Title",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "Case study headline.",
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
        hint: "Abstract under the title.",
        section: "Content",
        sortOrder: 200,
      },
    },
    {
      name: "Client",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Client or organization name.",
        section: "Content",
        sortOrder: 210,
      },
    },
    {
      name: "Category",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Practice area or industry label.",
        section: "Content",
        sortOrder: 220,
      },
    },
    {
      name: "Problem",
      shape: "richText",
      sitecore: {
        type: "rich-text",
        hint: "The challenge the client brought.",
        section: "Content",
        sortOrder: 230,
      },
    },
    {
      name: "Solution",
      shape: "richText",
      sitecore: {
        type: "rich-text",
        hint: "What shipped and what changed.",
        section: "Content",
        sortOrder: 240,
      },
    },
    {
      name: "Image",
      shape: "image",
      role: "hero",
      sitecore: {
        type: "image",
        hint: "Cover image. 16:9 recommended.",
        section: "Content",
        sortOrder: 250,
      },
    },
  ],

  params: [...DETAILS_SPLIT_SHARE_PARAMS],

  variants: [{ name: "Default" }],

  dynamicPlaceholders: true,
  // scai writes hashed GUIDs onto the rendering Placeholders field
  // that do not match the live Presentation/Placeholder Settings
  // items (those were patched after aggregates-only). Do not re-push
  // this recipe or the rendering will point at missing IDs.
  placeholders: [
    { key: "case-study-details-{*}" },
    { key: "case-study-details-aside-{*}" },
    { key: "case-study-details-related-{*}" },
    { key: "case-study-details-full-width-{*}" },
  ],

  placedIn: ["headless-main-{*}"],

  datasource: {
    autoCreate: false,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Case Study Details" },
      { scope: "site", subfolder: "Case Study Details" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default caseStudyDetailsRecipe;
