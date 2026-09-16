import type { PageTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { pageTemplateThumbnail } from "./_wireframe-thumbnail";
import { PAGE_SEO_FIELDS } from "./_page-seo-fields";

export const offerRecipe = {
  kind: "page-template",
  schemaVersion: "1",
  handle: "offer@1",
  name: "Offer",
  displayName: "Offer",
  thumbnail: pageTemplateThumbnail("Offer_Page_Template.png", "Offer"),
  description:
    "Offer page template — Title / Eyebrow / ShortDescription / Content / Image / OfferText / PromoCode / StartDate / EndDate / Terms / CtaLink plus SEO. Insert under Offers.",
  fields: [
    {
      name: "Title",
      shape: "text",
      sitecore: {
        section: "Content",
        hint: "Offer name.",
        sortOrder: 100,
      },
    },
    {
      name: "Eyebrow",
      shape: "text",
      sitecore: {
        section: "Content",
        hint: "Optional kicker.",
        sortOrder: 200,
      },
    },
    {
      name: "ShortDescription",
      shape: "text",
      sitecore: {
        section: "Content",
        type: "multi-line-text",
        hint: "Dek under the title.",
        sortOrder: 210,
      },
    },
    {
      name: "Content",
      shape: "richText",
      sitecore: {
        section: "Content",
        type: "rich-text",
        hint: "Offer body.",
        sortOrder: 220,
      },
    },
    {
      name: "Image",
      shape: "image",
      sitecore: {
        section: "Content",
        type: "image",
        hint: "Lead image.",
        sortOrder: 230,
      },
    },
    {
      name: "OfferText",
      shape: "text",
      sitecore: {
        section: "Content",
        hint: "Primary offer copy (e.g. 20% off).",
        sortOrder: 240,
      },
    },
    {
      name: "PromoCode",
      shape: "text",
      sitecore: {
        section: "Content",
        hint: "Optional promo code.",
        sortOrder: 250,
      },
    },
    {
      name: "StartDate",
      shape: "text",
      sitecore: {
        section: "Content",
        hint: "Start date display string.",
        sortOrder: 260,
      },
    },
    {
      name: "EndDate",
      shape: "text",
      sitecore: {
        section: "Content",
        hint: "End date display string.",
        sortOrder: 270,
      },
    },
    {
      name: "Terms",
      shape: "richText",
      sitecore: {
        section: "Content",
        type: "rich-text",
        hint: "Terms and conditions.",
        sortOrder: 280,
      },
    },
    {
      name: "CtaLink",
      shape: "link",
      sitecore: {
        section: "Content",
        type: "general-link",
        hint: "Primary CTA.",
        sortOrder: 290,
      },
    },
    ...PAGE_SEO_FIELDS,
  ],
  insertOptions: ["offer@1"],
} satisfies PageTemplateRecipe;

export default offerRecipe;
