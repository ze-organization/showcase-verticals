import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { picsum } from "./_theme-photos";

export const productNorthDeskLampRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "product-north-desk-lamp@1",
  name: "everyday-checking",
  displayName: "Everyday checking",
  description: "Everyday checking — deposits, debit, bill pay, and spending tools.",
  template: "product@1",
  pageDesign: "product-page@1",
  itemPath:
    "/sitecore/content/{site}/Home/Products/Checking-and-Savings/everyday-checking",
  fields: {
    Title: "Everyday checking",
    Eyebrow: "Checking & Savings",
    ShortDescription:
      "Paychecks, rent, and bills in one account. Debit, bill pay, and spending insights included. Illustrative monthly maintenance is $0 with qualifying activity.",
    Content:
      "<p>Everyday checking is for money that already has a date: payroll, rent, utilities, and the payments you do not want to miss. Direct deposit, a debit card, online bill pay, and spending insights come with the account.</p><h2>Who it is for</h2><p>Households that want one operating account. Joint owners apply together on Apply Now — we do not use a separate product type for joint checking. We do not offer an under-16s account on this site.</p><h2>What is included</h2><ul><li>Direct deposit and ACH transfers</li><li>Debit card for everyday spend</li><li>Bill pay with scheduled reminders</li><li>Spending insights on the categories you already use</li><li>Optional overdraft coverage, disclosed as a choice — not a default</li></ul><h2>How to apply</h2><p>Apply Now collects legal name and email. A banker follows up with identity and funding steps. This page does not open a live account.</p><h2>Fees</h2><p>Illustrative monthly maintenance is $0 with a $500 average daily balance or qualifying direct deposit. ATM fees at non-Prospera machines are listed under Rates &amp; fees.</p><p><small>Prospera Bank, N.A., Member FDIC. Equal Housing Lender. Fees on this page are illustrative for a demonstration and are not a live offer.</small></p>",
    Category: "Checking & Savings",
    Price: "0",
    Sku: "CHK-01",
    Image1: {
      shape: "image",
      mediaPath: picsum("everyday-checking"),
      alt: "Person reviewing household finances at a desk",
    },
    Image2: {
      shape: "image",
      mediaPath: picsum("hub-personal"),
      alt: "Customer and banker reviewing a household budget",
    },
    MetaTitle: "Everyday checking — Prospera",
    MetaDescription:
      "Everyday checking from Prospera Bank, N.A. Direct deposit, debit, and bill pay. Illustrative $0 monthly fee with qualifying activity. Member FDIC.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.6",
    ChangeFrequency: "monthly",
    JsonLd:
      '{"@context":"https://schema.org","@type":"BankAccount","name":"Everyday checking","brand":"Prospera"}',
  },
  layout: { placeholders: {} },
} satisfies PageRecipe;

export default productNorthDeskLampRecipe;
