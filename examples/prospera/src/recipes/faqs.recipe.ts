import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { container1Layout } from "./_hub-grammar";

export const faqsRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "faqs@1",
  name: "FAQs",
  displayName: "FAQs",
  description:
    "FAQs — content block plus a visual accordion of banking questions. Path /FAQs.",
  template: "page@1",
  itemPath: "/sitecore/content/{site}/Home/FAQs",
  fields: {
    Title: "FAQs",
    Eyebrow: "Help",
    MetaTitle: "FAQs — Prospera",
    MetaDescription:
      "Questions about applying, FDIC, rates, joint checking, and branches at Prospera Bank, N.A.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.6",
    ChangeFrequency: "monthly",
  },
  layout: container1Layout([
    {
      componentHandle: "content-block@1",
      variant: "Default",
      params: { EyebrowStyle: "text" },
      datasourceRef: {
        kind: "scoped",
        slot: "Intro",
        fields: {
          Eyebrow: "FAQs",
          Title: "Answers we give more than once",
          Body: "<p>Applications, deposits, rates, and branches. Support has a shorter set with a CTA. Help in the header lands on Support.</p>",
        },
      },
    },
    {
      componentHandle: "visual-accordion@1",
      variant: "Default",
      datasourceRef: {
        kind: "scoped",
        slot: "Faq",
        fields: {
          Heading: "Questions",
        },
      },
      placeholders: {
        "visual-accordion": [
          {
            componentHandle: "accordion-item-rendering@1",
            variant: "Content",
            datasourceRef: {
              kind: "scoped",
              slot: "Faq1",
              fields: {
                Title: "How do I apply for checking or a HELOC?",
                Content:
                  "<p>Apply Now in the header goes to /Get-Started. Choose Personal or Business and the product. Checking, cards, mortgage, and HELOC each disclose illustrative fees and eligibility on their own pages.</p>",
              },
            },
          },
          {
            componentHandle: "accordion-item-rendering@1",
            variant: "Content",
            datasourceRef: {
              kind: "scoped",
              slot: "Faq2",
              fields: {
                Title: "Are deposits FDIC-insured?",
                Content:
                  "<p>This site is a demonstration of a fictional national bank. Copy treats deposits as FDIC-insured to applicable limits. We do not invent a certificate number or a routing number.</p>",
              },
            },
          },
          {
            componentHandle: "accordion-item-rendering@1",
            variant: "Content",
            datasourceRef: {
              kind: "scoped",
              slot: "Faq3",
              fields: {
                Title: "Are APY and APR figures live?",
                Content:
                  "<p>No. They are illustrative for this demo. See Rates &amp; fees and the product page. Offers, when listed, are still demonstration terms.</p>",
              },
            },
          },
          {
            componentHandle: "accordion-item-rendering@1",
            variant: "Content",
            datasourceRef: {
              kind: "scoped",
              slot: "Faq4",
              fields: {
                Title: "Can two people open checking together?",
                Content:
                  "<p>Yes. Joint owners apply on everyday checking via Apply Now. We do not use a separate joint product type. We do not offer an under-16s account on this site.</p>",
              },
            },
          },
          {
            componentHandle: "accordion-item-rendering@1",
            variant: "Content",
            datasourceRef: {
              kind: "scoped",
              slot: "Faq5",
              fields: {
                Title: "Where do I find a branch?",
                Content:
                  "<p>Locations. Prospera keeps a branch network in this demonstration. Login is a header link, not a second Apply Now button.</p>",
              },
            },
          },
        ],
      },
    },
  ]),
} satisfies PageRecipe;

export default faqsRecipe;
