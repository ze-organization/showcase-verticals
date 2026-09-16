import type { ComponentTemplateRecipe } from "../lib/registry/sitecore-recipes";
import { componentIcons } from "./_component-icons";
import { DETAILS_LANDING_PARAMS } from "./_details-shell-params";

/**
 * Recipe for `LandingDetails` — fixed-shape campaign view from the
 * current `landing@1` page: hero, features, stats, social proof, FAQ,
 * final CTA, plus `landing-details-full-width-{*}`.
 *
 * Intended to sit on `headless-main` via `landing-details-partial@1`.
 * Empty datasource = current page.
 */
export const landingDetailsRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "landing-details@1",
  icon: componentIcons["landing-details@1"],
  name: "landing-details",
  displayName: "Landing Details",
  description:
    "Full landing view: hero, three features, three stats, testimonial, FAQ, final CTA, plus landing-details-full-width-{*} placeholder.",

  section: { handle: "page-details-section@1" },

  fields: [
    {
      name: "Title",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "Hero headline.",
        section: "Hero Data",
        sortOrder: 100,
      },
    },
    {
      name: "Eyebrow",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Optional kicker above the headline.",
        section: "Hero Data",
        sortOrder: 110,
      },
    },
    {
      name: "ShortDescription",
      shape: "text",
      sitecore: {
        type: "multi-line-text",
        hint: "Hero subhead.",
        section: "Hero Data",
        sortOrder: 120,
      },
    },
    {
      name: "PrimaryAction",
      shape: "link",
      sitecore: {
        type: "general-link",
        hint: "Primary CTA.",
        section: "Hero Data",
        sortOrder: 130,
      },
    },
    {
      name: "SecondaryAction",
      shape: "link",
      sitecore: {
        type: "general-link",
        hint: "Optional secondary CTA.",
        section: "Hero Data",
        sortOrder: 140,
      },
    },
    {
      name: "Image",
      shape: "image",
      role: "hero",
      sitecore: {
        type: "image",
        hint: "Hero image when VideoUrl is empty.",
        section: "Hero Data",
        sortOrder: 150,
      },
    },
    {
      name: "VideoUrl",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Optional MP4 or YouTube URL.",
        section: "Hero Data",
        sortOrder: 160,
      },
    },
    {
      name: "Feature1IconName",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Named-icon vocabulary name.",
        section: "Features Data",
        sortOrder: 200,
      },
    },
    {
      name: "Feature1Title",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Feature 1 title.",
        section: "Features Data",
        sortOrder: 210,
      },
    },
    {
      name: "Feature1Description",
      shape: "richText",
      sitecore: {
        type: "rich-text",
        hint: "Feature 1 copy.",
        section: "Features Data",
        sortOrder: 220,
      },
    },
    {
      name: "Feature2IconName",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Named-icon vocabulary name.",
        section: "Features Data",
        sortOrder: 230,
      },
    },
    {
      name: "Feature2Title",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Feature 2 title.",
        section: "Features Data",
        sortOrder: 240,
      },
    },
    {
      name: "Feature2Description",
      shape: "richText",
      sitecore: {
        type: "rich-text",
        hint: "Feature 2 copy.",
        section: "Features Data",
        sortOrder: 250,
      },
    },
    {
      name: "Feature3IconName",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Named-icon vocabulary name.",
        section: "Features Data",
        sortOrder: 260,
      },
    },
    {
      name: "Feature3Title",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Feature 3 title.",
        section: "Features Data",
        sortOrder: 270,
      },
    },
    {
      name: "Feature3Description",
      shape: "richText",
      sitecore: {
        type: "rich-text",
        hint: "Feature 3 copy.",
        section: "Features Data",
        sortOrder: 280,
      },
    },
    {
      name: "Stat1Number",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Stat 1 number.",
        section: "Stats Data",
        sortOrder: 300,
      },
    },
    {
      name: "Stat1Label",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Stat 1 label.",
        section: "Stats Data",
        sortOrder: 310,
      },
    },
    {
      name: "Stat2Number",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Stat 2 number.",
        section: "Stats Data",
        sortOrder: 320,
      },
    },
    {
      name: "Stat2Label",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Stat 2 label.",
        section: "Stats Data",
        sortOrder: 330,
      },
    },
    {
      name: "Stat3Number",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Stat 3 number.",
        section: "Stats Data",
        sortOrder: 340,
      },
    },
    {
      name: "Stat3Label",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Stat 3 label.",
        section: "Stats Data",
        sortOrder: 350,
      },
    },
    {
      name: "TestimonialQuote",
      shape: "richText",
      sitecore: {
        type: "rich-text",
        hint: "Customer quote.",
        section: "Social Proof Data",
        sortOrder: 400,
      },
    },
    {
      name: "TestimonialAuthorName",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Quote author name.",
        section: "Social Proof Data",
        sortOrder: 410,
      },
    },
    {
      name: "TestimonialAuthorTitle",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Quote author title.",
        section: "Social Proof Data",
        sortOrder: 420,
      },
    },
    {
      name: "TestimonialAuthorImage",
      shape: "image",
      sitecore: {
        type: "image",
        hint: "Author headshot.",
        section: "Social Proof Data",
        sortOrder: 430,
      },
    },
    {
      name: "PartnerLogosImage",
      shape: "image",
      sitecore: {
        type: "image",
        hint: "Partner logo strip.",
        section: "Social Proof Data",
        sortOrder: 440,
      },
    },
    {
      name: "Faq1Question",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "FAQ 1 question.",
        section: "FAQ Data",
        sortOrder: 500,
      },
    },
    {
      name: "Faq1Answer",
      shape: "richText",
      sitecore: {
        type: "rich-text",
        hint: "FAQ 1 answer.",
        section: "FAQ Data",
        sortOrder: 510,
      },
    },
    {
      name: "Faq2Question",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "FAQ 2 question.",
        section: "FAQ Data",
        sortOrder: 520,
      },
    },
    {
      name: "Faq2Answer",
      shape: "richText",
      sitecore: {
        type: "rich-text",
        hint: "FAQ 2 answer.",
        section: "FAQ Data",
        sortOrder: 530,
      },
    },
    {
      name: "Faq3Question",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "FAQ 3 question.",
        section: "FAQ Data",
        sortOrder: 540,
      },
    },
    {
      name: "Faq3Answer",
      shape: "richText",
      sitecore: {
        type: "rich-text",
        hint: "FAQ 3 answer.",
        section: "FAQ Data",
        sortOrder: 550,
      },
    },
    {
      name: "Faq4Question",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "FAQ 4 question.",
        section: "FAQ Data",
        sortOrder: 560,
      },
    },
    {
      name: "Faq4Answer",
      shape: "richText",
      sitecore: {
        type: "rich-text",
        hint: "FAQ 4 answer.",
        section: "FAQ Data",
        sortOrder: 570,
      },
    },
    {
      name: "Faq5Question",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "FAQ 5 question.",
        section: "FAQ Data",
        sortOrder: 580,
      },
    },
    {
      name: "Faq5Answer",
      shape: "richText",
      sitecore: {
        type: "rich-text",
        hint: "FAQ 5 answer.",
        section: "FAQ Data",
        sortOrder: 590,
      },
    },
    {
      name: "FinalCtaTitle",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Closing headline.",
        section: "Final CTA Data",
        sortOrder: 600,
      },
    },
    {
      name: "FinalCtaSubhead",
      shape: "richText",
      sitecore: {
        type: "rich-text",
        hint: "Closing supporting copy.",
        section: "Final CTA Data",
        sortOrder: 610,
      },
    },
    {
      name: "FinalCtaAction",
      shape: "link",
      sitecore: {
        type: "general-link",
        hint: "Closing CTA.",
        section: "Final CTA Data",
        sortOrder: 620,
      },
    },
  ],

  params: [...DETAILS_LANDING_PARAMS],

  variants: [{ name: "Default" }],

  dynamicPlaceholders: true,
  // scai writes hashed GUIDs onto the rendering Placeholders field
  // that do not match the live Presentation/Placeholder Settings
  // items (those were patched after aggregates-only). Do not re-push
  // this recipe or the rendering will point at missing IDs.
  placeholders: [{ key: "landing-details-full-width-{*}" }],

  placedIn: ["headless-main-{*}"],

  datasource: {
    autoCreate: false,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Landing Details" },
      { scope: "site", subfolder: "Landing Details" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default landingDetailsRecipe;
