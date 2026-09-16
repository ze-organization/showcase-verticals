import type { ComponentTemplateRecipe } from "../lib/registry/sitecore-recipes";
import { componentIcons } from "./_component-icons";
import { DETAILS_STACKED_EYEBROW_PARAMS } from "./_details-shell-params";

export const partnerDetailsRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "partner-details@1",
  icon: componentIcons["partner-details@1"],
  name: "partner-details",
  displayName: "Partner Details",
  description:
    "Full partner view: lead image, logo, type, website, body. Share is off by default.",
  section: { handle: "page-details-section@1" },
  fields: [
    { name: "Title", shape: "text", sitecore: { type: "single-line-text", required: true, hint: "Partner name.", section: "Content", sortOrder: 100 } },
    { name: "Eyebrow", shape: "text", sitecore: { type: "single-line-text", hint: "Optional kicker.", section: "Content", sortOrder: 110 } },
    { name: "ShortDescription", shape: "text", sitecore: { type: "multi-line-text", hint: "Dek.", section: "Content", sortOrder: 200 } },
    { name: "Content", shape: "richText", sitecore: { type: "rich-text", hint: "Body.", section: "Content", sortOrder: 300 } },
    { name: "Image", shape: "image", role: "hero", sitecore: { type: "image", hint: "Lead image.", section: "Content", sortOrder: 400 } },
    { name: "Logo", shape: "image", sitecore: { type: "image", hint: "Logo.", section: "Content", sortOrder: 410 } },
    { name: "Website", shape: "link", sitecore: { type: "general-link", hint: "Website.", section: "Content", sortOrder: 420 } },
    { name: "PartnerType", shape: "text", sitecore: { type: "single-line-text", hint: "Technology / Channel.", section: "Content", sortOrder: 430 } },
  ],
  params: [...DETAILS_STACKED_EYEBROW_PARAMS],
  variants: [{ name: "Default" }],
  dynamicPlaceholders: true,
  placeholders: [
    { key: "partner-details-{*}" },
    { key: "partner-details-related-{*}" },
    { key: "partner-details-full-width-{*}" },
  ],
  placedIn: ["headless-main-{*}"],
  datasource: {
    autoCreate: false,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Partner Details" },
      { scope: "site", subfolder: "Partner Details" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default partnerDetailsRecipe;
