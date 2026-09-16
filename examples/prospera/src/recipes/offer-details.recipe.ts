import type { ComponentTemplateRecipe } from "../lib/registry/sitecore-recipes";
import { componentIcons } from "./_component-icons";
import { DETAILS_SPLIT_SHARE_PARAMS } from "./_details-shell-params";

export const offerDetailsRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "offer-details@1",
  icon: componentIcons["offer-details@1"],
  name: "offer-details",
  displayName: "Offer Details",
  description:
    "Full offer view: image, offer text, promo code, dates, terms, CTA. Share is a Menu in the title row.",
  section: { handle: "page-details-section@1" },
  fields: [
    { name: "Title", shape: "text", sitecore: { type: "single-line-text", required: true, hint: "Offer name.", section: "Content", sortOrder: 100 } },
    { name: "Eyebrow", shape: "text", sitecore: { type: "single-line-text", hint: "Optional kicker.", section: "Content", sortOrder: 110 } },
    { name: "ShortDescription", shape: "text", sitecore: { type: "multi-line-text", hint: "Dek.", section: "Content", sortOrder: 200 } },
    { name: "Content", shape: "richText", sitecore: { type: "rich-text", hint: "Body.", section: "Content", sortOrder: 300 } },
    { name: "Image", shape: "image", role: "hero", sitecore: { type: "image", hint: "Lead image.", section: "Content", sortOrder: 400 } },
    { name: "OfferText", shape: "text", sitecore: { type: "single-line-text", hint: "Offer copy.", section: "Content", sortOrder: 410 } },
    { name: "PromoCode", shape: "text", sitecore: { type: "single-line-text", hint: "Promo code.", section: "Content", sortOrder: 420 } },
    { name: "StartDate", shape: "text", sitecore: { type: "single-line-text", hint: "Start date.", section: "Content", sortOrder: 430 } },
    { name: "EndDate", shape: "text", sitecore: { type: "single-line-text", hint: "End date.", section: "Content", sortOrder: 440 } },
    { name: "Terms", shape: "richText", sitecore: { type: "rich-text", hint: "Terms.", section: "Content", sortOrder: 450 } },
    { name: "CtaLink", shape: "link", sitecore: { type: "general-link", hint: "Primary CTA.", section: "Content", sortOrder: 460 } },
  ],
  params: [...DETAILS_SPLIT_SHARE_PARAMS],
  variants: [{ name: "Default" }],
  dynamicPlaceholders: true,
  placeholders: [
    { key: "offer-details-{*}" },
    { key: "offer-details-related-{*}" },
    { key: "offer-details-full-width-{*}" },
  ],
  placedIn: ["headless-main-{*}"],
  datasource: {
    autoCreate: false,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Offer Details" },
      { scope: "site", subfolder: "Offer Details" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default offerDetailsRecipe;
