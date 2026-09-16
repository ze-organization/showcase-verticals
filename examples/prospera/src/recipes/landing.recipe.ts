import type { PageTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { pageTemplateThumbnail } from "./_wireframe-thumbnail";
import { PAGE_SEO_FIELDS } from "./_page-seo-fields";

const seoFields = PAGE_SEO_FIELDS.map((field) => ({
  ...field,
  sitecore: {
    ...field.sitecore,
    sortOrder: field.sitecore.sortOrder + 2000,
  },
}));

/**
 * Landing page template — the insert type under `/Home/Landing-Pages`.
 *
 * Fixed-shape campaign page: all six sections live on the page item so
 * agents / ABM can fill fields without composing datasources. Bound to
 * `landing-page@1`. Listing stays `page@1`.
 */
export const landingRecipe = {
  kind: "page-template",
  schemaVersion: "1",
  handle: "landing@1",
  name: "Landing",
  displayName: "Landing",
  thumbnail: pageTemplateThumbnail("Landing_Page_Template.png", "Landing"),
  description:
    "Landing page template — hero, three features, three stats, social proof, five FAQs, and a final CTA plus the standard SEO field set. Insert this under Landing Pages for the fixed six-section campaign; use Blank Landing when you want header, footer, and an empty main Container instead.",

  fields: [
    {
      name: "Eyebrow",
      shape: "text",
      sitecore: {
        section: "Hero Data",
        hint: "Optional kicker above the headline. Max ~40 characters.",
        sortOrder: 100,
      },
    },
    {
      name: "Title",
      shape: "text",
      sitecore: {
        section: "Hero Data",
        hint: "Benefit-led headline. Read as the page h1 by landing-details@1.",
        sortOrder: 110,
      },
    },
    {
      name: "ShortDescription",
      shape: "text",
      sitecore: {
        section: "Hero Data",
        type: "multi-line-text",
        hint: "Supporting subhead under the headline.",
        sortOrder: 120,
      },
    },
    {
      name: "PrimaryAction",
      shape: "link",
      sitecore: {
        section: "Hero Data",
        type: "general-link",
        hint: "Primary conversion CTA.",
        sortOrder: 130,
      },
    },
    {
      name: "SecondaryAction",
      shape: "link",
      sitecore: {
        section: "Hero Data",
        type: "general-link",
        hint: "Optional lower-commitment CTA.",
        sortOrder: 140,
      },
    },
    {
      name: "Image",
      shape: "image",
      sitecore: {
        section: "Hero Data",
        type: "image",
        hint: "Hero visual when VideoUrl is empty. 16:9 recommended.",
        sortOrder: 150,
      },
    },
    {
      name: "VideoUrl",
      shape: "text",
      sitecore: {
        section: "Hero Data",
        hint: "Optional MP4 or YouTube URL. When set, replaces the hero image.",
        sortOrder: 160,
      },
    },
    {
      name: "Feature1IconName",
      shape: "text",
      sitecore: {
        section: "Features Data",
        hint: "Named-icon vocabulary name (e.g. play, shield, chart). See icon-name@1.",
        sortOrder: 200,
      },
    },
    {
      name: "Feature1Title",
      shape: "text",
      sitecore: {
        section: "Features Data",
        hint: "Feature 1 name. 2–4 words.",
        sortOrder: 210,
      },
    },
    {
      name: "Feature1Description",
      shape: "richText",
      sitecore: {
        section: "Features Data",
        type: "rich-text",
        hint: "Feature 1 supporting copy. 1–2 sentences.",
        sortOrder: 220,
      },
    },
    {
      name: "Feature2IconName",
      shape: "text",
      sitecore: {
        section: "Features Data",
        hint: "Named-icon vocabulary name (e.g. play, shield, chart). See icon-name@1.",
        sortOrder: 230,
      },
    },
    {
      name: "Feature2Title",
      shape: "text",
      sitecore: {
        section: "Features Data",
        hint: "Feature 2 name. 2–4 words.",
        sortOrder: 240,
      },
    },
    {
      name: "Feature2Description",
      shape: "richText",
      sitecore: {
        section: "Features Data",
        type: "rich-text",
        hint: "Feature 2 supporting copy. 1–2 sentences.",
        sortOrder: 250,
      },
    },
    {
      name: "Feature3IconName",
      shape: "text",
      sitecore: {
        section: "Features Data",
        hint: "Named-icon vocabulary name (e.g. play, shield, chart). See icon-name@1.",
        sortOrder: 260,
      },
    },
    {
      name: "Feature3Title",
      shape: "text",
      sitecore: {
        section: "Features Data",
        hint: "Feature 3 name. 2–4 words.",
        sortOrder: 270,
      },
    },
    {
      name: "Feature3Description",
      shape: "richText",
      sitecore: {
        section: "Features Data",
        type: "rich-text",
        hint: "Feature 3 supporting copy. 1–2 sentences.",
        sortOrder: 280,
      },
    },
    {
      name: "Stat1Number",
      shape: "text",
      sitecore: {
        section: "Stats Data",
        hint: "Stat 1 number with units. Examples: 70%, 10x, 500K+.",
        sortOrder: 300,
      },
    },
    {
      name: "Stat1Label",
      shape: "text",
      sitecore: {
        section: "Stats Data",
        hint: "What stat 1 describes.",
        sortOrder: 310,
      },
    },
    {
      name: "Stat2Number",
      shape: "text",
      sitecore: {
        section: "Stats Data",
        hint: "Stat 2 number with units.",
        sortOrder: 320,
      },
    },
    {
      name: "Stat2Label",
      shape: "text",
      sitecore: {
        section: "Stats Data",
        hint: "What stat 2 describes.",
        sortOrder: 330,
      },
    },
    {
      name: "Stat3Number",
      shape: "text",
      sitecore: {
        section: "Stats Data",
        hint: "Stat 3 number with units.",
        sortOrder: 340,
      },
    },
    {
      name: "Stat3Label",
      shape: "text",
      sitecore: {
        section: "Stats Data",
        hint: "What stat 3 describes.",
        sortOrder: 350,
      },
    },
    {
      name: "TestimonialQuote",
      shape: "richText",
      sitecore: {
        section: "Social Proof Data",
        type: "rich-text",
        hint: "Customer quote. 1–3 sentences.",
        sortOrder: 400,
      },
    },
    {
      name: "TestimonialAuthorName",
      shape: "text",
      sitecore: {
        section: "Social Proof Data",
        hint: "Full name of the quote author.",
        sortOrder: 410,
      },
    },
    {
      name: "TestimonialAuthorTitle",
      shape: "text",
      sitecore: {
        section: "Social Proof Data",
        hint: "Job title and company.",
        sortOrder: 420,
      },
    },
    {
      name: "TestimonialAuthorImage",
      shape: "image",
      sitecore: {
        section: "Social Proof Data",
        type: "image",
        hint: "Author headshot. Square crop.",
        sortOrder: 430,
      },
    },
    {
      name: "PartnerLogosImage",
      shape: "image",
      sitecore: {
        section: "Social Proof Data",
        type: "image",
        hint: "Composite strip of partner or customer logos.",
        sortOrder: 440,
      },
    },
    {
      name: "Faq1Question",
      shape: "text",
      sitecore: {
        section: "FAQ Data",
        hint: "FAQ 1 question.",
        sortOrder: 500,
      },
    },
    {
      name: "Faq1Answer",
      shape: "richText",
      sitecore: {
        section: "FAQ Data",
        type: "rich-text",
        hint: "FAQ 1 answer.",
        sortOrder: 510,
      },
    },
    {
      name: "Faq2Question",
      shape: "text",
      sitecore: {
        section: "FAQ Data",
        hint: "FAQ 2 question.",
        sortOrder: 520,
      },
    },
    {
      name: "Faq2Answer",
      shape: "richText",
      sitecore: {
        section: "FAQ Data",
        type: "rich-text",
        hint: "FAQ 2 answer.",
        sortOrder: 530,
      },
    },
    {
      name: "Faq3Question",
      shape: "text",
      sitecore: {
        section: "FAQ Data",
        hint: "FAQ 3 question.",
        sortOrder: 540,
      },
    },
    {
      name: "Faq3Answer",
      shape: "richText",
      sitecore: {
        section: "FAQ Data",
        type: "rich-text",
        hint: "FAQ 3 answer.",
        sortOrder: 550,
      },
    },
    {
      name: "Faq4Question",
      shape: "text",
      sitecore: {
        section: "FAQ Data",
        hint: "FAQ 4 question.",
        sortOrder: 560,
      },
    },
    {
      name: "Faq4Answer",
      shape: "richText",
      sitecore: {
        section: "FAQ Data",
        type: "rich-text",
        hint: "FAQ 4 answer.",
        sortOrder: 570,
      },
    },
    {
      name: "Faq5Question",
      shape: "text",
      sitecore: {
        section: "FAQ Data",
        hint: "FAQ 5 question.",
        sortOrder: 580,
      },
    },
    {
      name: "Faq5Answer",
      shape: "richText",
      sitecore: {
        section: "FAQ Data",
        type: "rich-text",
        hint: "FAQ 5 answer.",
        sortOrder: 590,
      },
    },
    {
      name: "FinalCtaTitle",
      shape: "text",
      sitecore: {
        section: "Final CTA Data",
        hint: "Closing headline. Different angle from the hero.",
        sortOrder: 600,
      },
    },
    {
      name: "FinalCtaSubhead",
      shape: "richText",
      sitecore: {
        section: "Final CTA Data",
        type: "rich-text",
        hint: "One sentence supporting the final CTA.",
        sortOrder: 610,
      },
    },
    {
      name: "FinalCtaAction",
      shape: "link",
      sitecore: {
        section: "Final CTA Data",
        type: "general-link",
        hint: "Closing CTA. Usually the same destination as PrimaryAction.",
        sortOrder: 620,
      },
    },
    ...seoFields,
  ],

  insertOptions: ["landing@1"],
} satisfies PageTemplateRecipe;

export default landingRecipe;
