import type { ComponentTemplateRecipe } from "../lib/registry/sitecore-recipes";
import { componentIcons } from "./_component-icons";
import { DETAILS_SPLIT_NO_SHARE_PARAMS } from "./_details-shell-params";

export const jobDetailsRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "job-details@1",
  icon: componentIcons["job-details@1"],
  name: "job-details",
  displayName: "Job Details",
  description:
    "Full job view: title, department, employment type, location. Share is off by default.",
  section: { handle: "page-details-section@1" },
  fields: [
    { name: "Title", shape: "text", sitecore: { type: "single-line-text", required: true, hint: "Role title.", section: "Content", sortOrder: 100 } },
    { name: "Eyebrow", shape: "text", sitecore: { type: "single-line-text", hint: "Optional kicker.", section: "Content", sortOrder: 110 } },
    { name: "ShortDescription", shape: "text", sitecore: { type: "multi-line-text", hint: "Dek.", section: "Content", sortOrder: 200 } },
    { name: "Content", shape: "richText", sitecore: { type: "rich-text", hint: "Body.", section: "Content", sortOrder: 300 } },
    { name: "Image", shape: "image", sitecore: { type: "image", hint: "Optional image.", section: "Content", sortOrder: 400 } },
    { name: "Department", shape: "text", sitecore: { type: "single-line-text", hint: "Department.", section: "Content", sortOrder: 410 } },
    { name: "EmploymentType", shape: "text", sitecore: { type: "single-line-text", hint: "Employment type.", section: "Content", sortOrder: 420 } },
    { name: "LocationName", shape: "text", sitecore: { type: "single-line-text", hint: "Location label.", section: "Content", sortOrder: 430 } },
    { name: "LocationLink", shape: "link", sitecore: { type: "general-link", hint: "Location page.", section: "Content", sortOrder: 440 } },
  ],
  params: [...DETAILS_SPLIT_NO_SHARE_PARAMS],
  variants: [{ name: "Default" }],
  dynamicPlaceholders: true,
  placeholders: [
    { key: "job-details-{*}" },
    { key: "job-details-aside-{*}" },
    { key: "job-details-related-{*}" },
    { key: "job-details-full-width-{*}" },
  ],
  placedIn: ["headless-main-{*}"],
  datasource: {
    autoCreate: false,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Job Details" },
      { scope: "site", subfolder: "Job Details" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default jobDetailsRecipe;
