import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { picsum } from "./_theme-photos";
import { container1Layout, hubHero, hubPromoCloser } from "./_hub-grammar";

export const productCategoryLightingRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "product-category-lighting@1",
  name: "Checking-and-Savings",
  displayName: "Checking & Savings",
  description: "Checking and savings category hub — everyday checking and high-yield savings.",
  template: "product-category@1",
  pageDesign: "hub-page@1",
  itemPath: "/sitecore/content/{site}/Home/Products/Checking-and-Savings",
  fields: {
    Title: "Checking & Savings",
    Eyebrow: "Personal",
    ShortDescription:
      "Everyday checking and a high-yield savings account with a published APY.",
    Image: {
      shape: "image",
      mediaPath: picsum("checking-and-savings"),
      alt: "Advisor and customer at a branch table",
    },
    MetaTitle: "Checking & Savings — Prospera",
    MetaDescription:
      "Everyday checking and high-yield savings from Prospera Bank, N.A.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.7",
    ChangeFrequency: "weekly",
  },
  layout: container1Layout([
    hubHero({
      eyebrow: "Personal",
      title: "Accounts for the week, and for later.",
      subtitle:
        "Everyday checking for deposits and bills. High-yield savings when you want the APY stated as a fact.",
      imageSeed: "checking-and-savings",
      imageAlt: "Advisor and customer at a branch table",
      primary: {
        href: "/Products/Checking-and-Savings/everyday-checking",
        text: "Everyday checking",
      },
      secondary: { href: "/Get-Started", text: "Apply Now" },
    }),
    {
      componentHandle: "products-list-grid@1",
      variant: "Grid",
      params: { HeadingLayout: "start" },
      datasourceRef: {
        kind: "scoped",
        slot: "Products",
        fields: {
          Title: "In this category",
          Lead: "<p>Everyday checking for the week. High-yield savings for cash you can leave.</p>",
        },
      },
      placeholders: {
        "cards-products": [
          {
            componentHandle: "product-card@1",
            variant: "Default",
            params: { CtaKind: "link" },
            datasourceRef: {
              kind: "scoped",
              slot: "CardChecking",
              fields: {
                Title: "Everyday checking",
                ShortDescription:
                  "Deposits, debit, and bill pay without a monthly maze of fees.",
                Price: "0",
                Sku: "CHK-01",
                CtaLabel: "View account",
                Image1: {
                  shape: "image",
                  mediaPath: picsum("everyday-checking"),
                  alt: "Person reviewing household finances at a desk",
                },
                Link: {
                  href: "/Products/Checking-and-Savings/everyday-checking",
                  text: "View account",
                },
              },
            },
          },
          {
            componentHandle: "product-card@1",
            variant: "Default",
            params: { CtaKind: "link" },
            datasourceRef: {
              kind: "scoped",
              slot: "CardSavings",
              fields: {
                Title: "High-yield savings",
                ShortDescription:
                  "A published APY on balances you do not need this week.",
                Price: "4.15% APY",
                Sku: "SAV-01",
                CtaLabel: "View account",
                Image1: {
                  shape: "image",
                  mediaPath: picsum("high-yield-savings"),
                  alt: "Advisor and customer reviewing a budget",
                },
                Link: {
                  href: "/Products/Checking-and-Savings/high-yield-savings",
                  text: "View account",
                },
              },
            },
          },
        ],
      },
    },
    hubPromoCloser({
      eyebrow: "Next",
      title: "Open an account with Apply Now.",
      description: "Eligibility, fees, and APY sit on each product page.",
      cta: { href: "/Get-Started", text: "Apply Now" },
      imageSeed: "promo-closer",
      imageAlt: "Advisor walking with a customer through a branch lobby",
    }),
  ]),
} satisfies PageRecipe;

export default productCategoryLightingRecipe;
