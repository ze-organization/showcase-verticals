import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { picsum } from "./_theme-photos";

export const serviceOnSiteAssessmentRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "service-on-site-assessment@1",
  name: "wealth-planning",
  displayName: "Wealth planning",
  description: "Wealth planning — advice next to checking and the operating account.",
  template: "service@1",
  pageDesign: "service-page@1",
  itemPath: "/sitecore/content/{site}/Home/Services/wealth-planning",
  fields: {
    Title: "Wealth planning",
    Eyebrow: "Advice",
    ShortDescription:
      "A plan that sits next to checking and the business — for households and owners who already bank with us.",
    Content:
      "<p>Wealth planning at Prospera is advice for households and owners who already keep deposits and credit here. We look at cash, retirement accounts, concentrated equity, and the operating company without turning the rest of the site into a luxury brochure.</p><h2>Who it is for</h2><p>Customers with investable assets, business owners who need a personal plan next to treasury, and families coordinating gifts or a sale. This is not an investment solicitation on this URL.</p><h2>What we cover</h2><ul><li>Cash, brokerage, and concentrated positions as facts</li><li>Coordination with retirement accounts and the operating company</li><li>A named advisor — Sofia Lang is the wealth contact on this demonstration</li></ul><h2>How to start</h2><p>Apply Now or Contact. We will ask what you already hold before we propose anything. Securities, when offered in a live franchise, would be through a broker-dealer affiliate disclosed on this page.</p><p><small>Prospera Bank, N.A., Member FDIC. Bank deposits are insured to applicable limits; investment products are not. This demonstration does not sell securities.</small></p>",
    Image: {
      shape: "image",
      mediaPath: picsum("wealth-planning"),
      alt: "Advisor and customer at a branch table",
    },
    MetaTitle: "Wealth planning — Prospera",
    MetaDescription:
      "Wealth planning from Prospera Bank, N.A. Advice for households and owners. Bank deposits FDIC-insured to applicable limits.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.6",
    ChangeFrequency: "monthly",
  },
  layout: { placeholders: {} },
} satisfies PageRecipe;

export default serviceOnSiteAssessmentRecipe;
