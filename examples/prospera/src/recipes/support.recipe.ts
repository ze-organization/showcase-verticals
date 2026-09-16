import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { container1Layout, hubHero, hubPromoCloser } from "./_hub-grammar";

export const supportRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "support@1",
  name: "Support",
  displayName: "Help",
  description:
    "Help / Support — compact abstract hero, FAQ accordion, closer. Nav label Help.",
  template: "page@1",
  itemPath: "/sitecore/content/{site}/Home/Support",
  fields: {
    Title: "Help",
    Eyebrow: "Support",
    MetaTitle: "Help — Prospera",
    MetaDescription:
      "Help with accounts, applications, branches, and disclosures. Prospera Bank, N.A. Member FDIC.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.7",
    ChangeFrequency: "monthly",
  },
  layout: container1Layout([
    hubHero({
      eyebrow: "Help",
      title: "Answers, disclosures, and a person if you need one.",
      subtitle:
        "FAQs, documentation, and branches. Login is in the header. Apply Now starts an application.",
      primary: { href: "/FAQs", text: "Read FAQs" },
      secondary: { href: "/Locations", text: "Find a branch" },
      backgroundColor: "primary",
      headingLayout: "compact",
      variant: "Placeholders",
    }),
    {
      componentHandle: "visual-accordion@1",
      variant: "Default",
      datasourceRef: {
        kind: "scoped",
        slot: "Faq",
        fields: {
          Heading: "Common questions",
        },
      },
      placeholders: {
        "visual-accordion": [
          {
            componentHandle: "accordion-item-rendering@1",
            variant: "Content",
            datasourceRef: {
              kind: "scoped",
              slot: "FaqApply",
              fields: {
                Title: "How do I apply?",
                Content:
                  "<p>Use Apply Now in the header. That path is /Get-Started. Choose Personal or Business, then the product you want. Checking, cards, mortgage, and HELOC each list illustrative fees and eligibility on their own pages.</p>",
              },
            },
          },
          {
            componentHandle: "accordion-item-rendering@1",
            variant: "Content",
            datasourceRef: {
              kind: "scoped",
              slot: "FaqLogin",
              fields: {
                Title: "Where do I sign in to my accounts?",
                Content:
                  "<p>Login is a header link to /account/sign-in. It is not a second Apply Now button. This marketing site does not reproduce an authenticated banking app.</p>",
              },
            },
          },
          {
            componentHandle: "accordion-item-rendering@1",
            variant: "Content",
            datasourceRef: {
              kind: "scoped",
              slot: "FaqFdic",
              fields: {
                Title: "Are deposits insured?",
                Content:
                  "<p>Prospera Bank, N.A. is fictional for this demonstration. Copy on this site treats deposits as FDIC-insured to applicable limits, the way a live U.S. bank would disclose. We do not invent a certificate number or a routing number.</p>",
              },
            },
          },
          {
            componentHandle: "accordion-item-rendering@1",
            variant: "Content",
            datasourceRef: {
              kind: "scoped",
              slot: "FaqRates",
              fields: {
                Title: "Are the APY and APR figures live?",
                Content:
                  "<p>No. Yields, loan rates, and fees are labeled illustrative for this demo. See Rates &amp; fees and the product page before you apply. Nothing here is a live lock or a limited-time sale unless an Offers page says so — and those are still demonstration terms.</p>",
              },
            },
          },
        ],
      },
    },
    hubPromoCloser({
      eyebrow: "Still stuck?",
      title: "Write us, or walk into a branch.",
      description:
        "Contact is a form. Locations is the branch finder. A banker can finish what this page cannot.",
      cta: { href: "/Contact", text: "Contact us" },
      imageSeed: "promo-closer",
      imageAlt: "Advisor walking with a customer through a branch lobby",
    }),
  ]),
} satisfies PageRecipe;

export default supportRecipe;
