import type { ComponentTemplateRecipe } from "../lib/registry/sitecore-recipes";
import { componentIcons } from "./_component-icons";
import { DETAILS_SPLIT_SHARE_PARAMS } from "./_details-shell-params";

export const eventDetailsRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "event-details@1",
  icon: componentIcons["event-details@1"],
  name: "event-details",
  displayName: "Event Details",
  description:
    "Full event view: lead image, facts (dates, venue, virtual URL), registration CTA. Share is a Menu in the title row.",
  section: { handle: "page-details-section@1" },
  fields: [
    { name: "Title", shape: "text", sitecore: { type: "single-line-text", required: true, hint: "Event name.", section: "Content", sortOrder: 100 } },
    { name: "Eyebrow", shape: "text", sitecore: { type: "single-line-text", hint: "Optional kicker.", section: "Content", sortOrder: 110 } },
    { name: "ShortDescription", shape: "text", sitecore: { type: "multi-line-text", hint: "Dek.", section: "Content", sortOrder: 200 } },
    { name: "Content", shape: "richText", sitecore: { type: "rich-text", hint: "Body.", section: "Content", sortOrder: 300 } },
    { name: "Image", shape: "image", role: "hero", sitecore: { type: "image", hint: "Lead image.", section: "Content", sortOrder: 400 } },
    { name: "StartDate", shape: "text", sitecore: { type: "single-line-text", hint: "Start date.", section: "Content", sortOrder: 410 } },
    { name: "EndDate", shape: "text", sitecore: { type: "single-line-text", hint: "End date.", section: "Content", sortOrder: 420 } },
    { name: "Venue", shape: "text", sitecore: { type: "single-line-text", hint: "Venue.", section: "Content", sortOrder: 430 } },
    { name: "VirtualUrl", shape: "text", sitecore: { type: "single-line-text", hint: "Virtual URL.", section: "Content", sortOrder: 440 } },
    { name: "RegistrationAction", shape: "link", sitecore: { type: "general-link", hint: "Register CTA.", section: "Content", sortOrder: 450 } },
  ],
  params: [...DETAILS_SPLIT_SHARE_PARAMS],
  variants: [{ name: "Default" }],
  dynamicPlaceholders: true,
  placeholders: [
    { key: "event-details-{*}" },
    { key: "event-details-aside-{*}" },
    { key: "event-details-related-{*}" },
    { key: "event-details-full-width-{*}" },
  ],
  placedIn: ["headless-main-{*}"],
  datasource: {
    autoCreate: false,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Event Details" },
      { scope: "site", subfolder: "Event Details" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default eventDetailsRecipe;
