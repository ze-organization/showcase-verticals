import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

export const articleAuthoringThatScalesRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "article-authoring-that-scales@1",
  name: "authoring-that-scales",
  displayName: "Opening everyday checking",
  description: "What to expect when you apply for Prospera everyday checking.",
  template: "article@1",
  pageDesign: "article-page@1",
  itemPath: "/sitecore/content/{site}/Home/Articles/authoring-that-scales",
  fields: {
    Title: "Opening everyday checking",
    Eyebrow: "Checking",
    ShortDescription:
      "Direct deposit, debit, and bill pay. Joint owners apply together. This demonstration form does not open a live account.",
    Content:
      "<p>Everyday checking is the account for paychecks, rent, and bills that already have a date. Apply Now collects legal name and email. A banker follows up with identity and funding steps.</p><h2>Joint owners</h2><p>Add a co-applicant on the same product. We do not use a separate joint-checking type. Under-16s accounts are not offered on this site.</p><h2>Fees</h2><p>Illustrative monthly maintenance is $0 with a $500 average daily balance or qualifying direct deposit. ATM fees at non-Prospera machines are on Rates &amp; fees.</p><p><small>Prospera Bank, N.A., Member FDIC. Fees are illustrative for a demonstration.</small></p>",
    Image: {
      shape: "image",
      mediaPath: "/theme-photos/promo-closer.jpg",
      alt: "Advisor walking with a customer through a branch lobby",
    },
    MetaTitle: "Opening everyday checking — Articles",
    MetaDescription:
      "How to apply for Prospera everyday checking, including joint owners and illustrative fees.",
    OgType: "article",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.6",
    ChangeFrequency: "monthly",
    JsonLd:
      '{"@context":"https://schema.org","@type":"Article","headline":"Opening everyday checking","author":{"@type":"Person","name":"Amira Hassan"}}',
  },
  layout: { placeholders: {} },
} satisfies PageRecipe;

export default articleAuthoringThatScalesRecipe;
