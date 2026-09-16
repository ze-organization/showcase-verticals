import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { container1Layout } from "./_hub-grammar";

export const termsRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "terms@1",
  name: "Terms",
  displayName: "Terms",
  description: "Terms of use — content-block. Path /Terms.",
  template: "page@1",
  itemPath: "/sitecore/content/{site}/Home/Terms",
  fields: {
    Title: "Terms",
    Eyebrow: "Legal",
    MetaTitle: "Terms — Prospera",
    MetaDescription:
      "Terms of use for this Prospera Bank, N.A. demonstration site.",
    OgType: "website",
    TwitterCard: "summary",
    IncludeInSitemap: "true",
    SitemapPriority: "0.3",
    ChangeFrequency: "yearly",
  },
  layout: container1Layout([
        {
          componentHandle: "content-block@1",
          variant: "Default",
          datasourceRef: {
            kind: "scoped",
            slot: "Body",
            fields: {
              Eyebrow: "Terms",
              Title: "Terms of use",
              Body:
                "<p>This site is a demonstration of Prospera Bank, N.A., a fictional U.S. nationally chartered bank. Products, rates, people, jobs, and offers are illustrative. Do not treat APY, APR, fees, or roles as a live offer.</p><p>You may browse, search, and submit the demonstration forms. Do not use the site to store production customer data. See <a href=\"/Privacy\">Privacy</a> for cookies and form data. See <a href=\"/Accessibility\">Accessibility</a> for assistive technology.</p><p>Member FDIC. Equal Housing Lender — in this demonstration’s voice. We do not invent license, routing, or certificate numbers.</p>",
            },
          },
        },
      ]),
} satisfies PageRecipe;

export default termsRecipe;
