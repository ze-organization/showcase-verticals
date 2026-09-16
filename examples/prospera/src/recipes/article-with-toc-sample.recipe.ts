import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

export const articleWithTocSampleRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "article-with-toc-sample@1",
  name: "with-table-of-contents",
  displayName: "Personal products, in order",
  description:
    "Long read: checking, savings, cards, mortgage, and HELOC with a table of contents.",
  template: "article-with-toc@1",
  pageDesign: "article-with-toc-page@1",
  itemPath: "/sitecore/content/{site}/Home/Articles/with-table-of-contents",
  fields: {
    Title: "Personal products, in order",
    Eyebrow: "Personal",
    ShortDescription:
      "A longer walk through everyday checking, high-yield savings, the Rewards Visa, the 30-year mortgage, and the HELOC — with headings you can scan.",
    Content:
      "<p>Personal at Prospera is five products. This article is the long version of the Personal hub. Rates are illustrative for a demonstration.</p><h2>Everyday checking</h2><p>Paychecks, rent, debit, and bill pay. Joint owners apply together. Illustrative monthly maintenance is $0 with qualifying activity.</p><h3>Bill pay and insights</h3><p>Schedule payments that already have a date. Spending insights group the month without cloning an app screen.</p><h2>High-yield savings</h2><p>Cash you can leave. Illustrative 4.15% APY. Savings goals label a balance for rent or a down payment. This is not a UK ISA.</p><h3>Certificates of deposit</h3><p>When a CD is listed, it appears on Rates &amp; fees — not as a separate tax wrapper.</p><h2>Rewards Visa</h2><p>Illustrative 1.5% cash back. Virtual card numbers for vendors. No annual fee in this demonstration.</p><h2>30-year mortgage</h2><p>First-lien purchase or refinance. Illustrative 6.375% APR. Not a live lock.</p><h2>Home equity line of credit</h2><p>A revolving draw against equity. Variable illustrative APR. Subject to credit, occupancy, and title.</p><h3>How to apply</h3><p>Apply Now. Eligibility stays on each product page. Member FDIC. Equal Housing Lender.</p>",
    Image: {
      shape: "image",
      mediaPath: "/theme-photos/pdp-01.jpg",
      alt: "Person reviewing household finances at a desk",
    },
    MetaTitle: "Personal products, in order — Articles",
    MetaDescription:
      "Checking, savings, cards, mortgage, and HELOC from Prospera Bank, N.A. Illustrative rates. Member FDIC.",
    OgType: "article",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.6",
    ChangeFrequency: "monthly",
    JsonLd:
      '{"@context":"https://schema.org","@type":"Article","headline":"Personal products, in order","author":{"@type":"Person","name":"Amira Hassan"}}',
  },
  layout: { placeholders: {} },
} satisfies PageRecipe;

export default articleWithTocSampleRecipe;
