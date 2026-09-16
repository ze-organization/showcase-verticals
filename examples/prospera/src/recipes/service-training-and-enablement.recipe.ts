import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { picsum } from "./_theme-photos";

export const serviceTrainingAndEnablementRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "service-training-and-enablement@1",
  name: "treasury",
  displayName: "Treasury",
  description: "Treasury — payables, receivables, and liquidity for operators.",
  template: "service@1",
  pageDesign: "service-page@1",
  itemPath: "/sitecore/content/{site}/Home/Services/treasury",
  fields: {
    Title: "Treasury",
    Eyebrow: "Business",
    ShortDescription:
      "Payables, receivables, and liquidity reporting for operators who already have a controller.",
    Content:
      "<p>Treasury is the commercial cash stack: ACH, wires, controlled disbursement, and reporting a controller can reconcile. It is listed under Services and linked from Business.</p><h2>Who it is for</h2><p>U.S.-registered companies with payroll, vendors, and an operating history. Eligibility is a conversation — see the Business hub — not an instant-approve widget.</p><h2>What is included</h2><ul><li>ACH credits and debits, wires, and positive pay in this demonstration</li><li>Payables and receivables reporting for month-end</li><li>A named commercial banker — Julian Park on this site</li></ul><h2>How to apply</h2><p>Apply Now starts a commercial conversation. We will ask entity type, beneficial owners, and monthly payment volume. Books-and-payments tools are described on the accounting landing.</p><p><small>Prospera Bank, N.A., Member FDIC. Terms on this page are illustrative for a demonstration and are not a live offer.</small></p>",
    Image: {
      shape: "image",
      mediaPath: picsum("treasury"),
      alt: "Business owner and commercial banker on a factory floor",
    },
    MetaTitle: "Treasury — Prospera",
    MetaDescription:
      "Treasury services from Prospera Bank, N.A. for operating companies. ACH, wires, and liquidity reporting.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.6",
    ChangeFrequency: "monthly",
  },
  layout: { placeholders: {} },
} satisfies PageRecipe;

export default serviceTrainingAndEnablementRecipe;
