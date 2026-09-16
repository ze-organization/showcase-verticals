import type { ComponentTemplateRecipe } from "../lib/registry/sitecore-recipes";
import { componentIcons } from "./_component-icons";
import { DETAILS_STACKED_EDITORIAL_PARAMS } from "./_details-shell-params";

export const newsDetailsRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "news-details@1",
  icon: componentIcons["news-details@1"],
  name: "news-details",
  displayName: "News Details",
  description:
    "Full news view: lead image, title, dek, source, date, body, plus news-details-{*} and news-details-full-width-{*} placeholders. Share chips under the dek.",
  section: { handle: "page-details-section@1" },
  fields: [
    {
      name: "Title",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "Headline.",
        section: "Content",
        sortOrder: 100,
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
        hint: "News body.",
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
      name: "Source",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Wire or desk attribution.",
        section: "Content",
        sortOrder: 410,
      },
    },
    {
      name: "DisplayDate",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Display date.",
        section: "Content",
        sortOrder: 420,
      },
    },
  ],
  params: [...DETAILS_STACKED_EDITORIAL_PARAMS],
  variants: [{ name: "Default" }],
  dynamicPlaceholders: true,
  placeholders: [
    { key: "news-details-{*}" },
    { key: "news-details-full-width-{*}" },
  ],
  placedIn: ["headless-main-{*}"],
  datasource: {
    autoCreate: false,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "News Details" },
      { scope: "site", subfolder: "News Details" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default newsDetailsRecipe;
