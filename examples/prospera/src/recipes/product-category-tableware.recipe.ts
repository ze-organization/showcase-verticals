import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { picsum } from "./_theme-photos";
import { container1Layout, hubHero, hubPromoCloser } from "./_hub-grammar";

export const productCategoryTablewareRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "product-category-tableware@1",
  name: "Lending",
  displayName: "Lending",
  description:
    "Lending category hub — 30-year mortgage and HELOC, both product@1.",
  template: "product-category@1",
  pageDesign: "hub-page@1",
  itemPath: "/sitecore/content/{site}/Home/Products/Lending",
  fields: {
    Title: "Lending",
    Eyebrow: "Personal",
    ShortDescription:
      "A 30-year mortgage and a home-equity line of credit. Both subject to credit approval.",
    Image: {
      shape: "image",
      mediaPath: picsum("lending"),
      alt: "Commercial banker reviewing a printed plan",
    },
    MetaTitle: "Lending — Prospera",
    MetaDescription:
      "30-year mortgage and HELOC from Prospera Bank, N.A. Equal Housing Lender. Illustrative rates.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.7",
    ChangeFrequency: "weekly",
  },
  layout: container1Layout([
    hubHero({
      eyebrow: "Personal",
      title: "Mortgage and home equity, stated as facts.",
      subtitle:
        "A 30-year fixed-rate mortgage and a home-equity line of credit. Rates, closing costs, and combined loan-to-value live on each product page.",
      imageSeed: "lending",
      imageAlt: "Commercial banker reviewing a printed plan",
      primary: {
        href: "/Products/Lending/thirty-year-mortgage",
        text: "30-year mortgage",
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
          Title: "In lending",
          Lead: "<p>Purchase or refinance on a 30-year mortgage. Draw against equity on a HELOC.</p>",
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
              slot: "CardMortgage",
              fields: {
                Title: "30-year mortgage",
                ShortDescription:
                  "Fixed-rate purchase or refinance. Sample rate, not a live lock.",
                Price: "6.375% APR",
                Sku: "MTG-30",
                CtaLabel: "View mortgage",
                Image1: {
                  shape: "image",
                  mediaPath: picsum("thirty-year-mortgage"),
                  alt: "Advisor and customer reviewing a budget",
                },
                Link: {
                  href: "/Products/Lending/thirty-year-mortgage",
                  text: "View mortgage",
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
              slot: "CardHeloc",
              fields: {
                Title: "Home equity line of credit",
                ShortDescription:
                  "Draw against equity for a renovation or a rate that is not a second mortgage.",
                Price: "Variable APR",
                Sku: "HELOC-01",
                CtaLabel: "View HELOC",
                Image1: {
                  shape: "image",
                  mediaPath: picsum("home-equity-line-of-credit"),
                  alt: "Business owner and banker reviewing a printed plan",
                },
                Link: {
                  href: "/Products/Lending/home-equity-line-of-credit",
                  text: "View HELOC",
                },
              },
            },
          },
        ],
      },
    },
    hubPromoCloser({
      eyebrow: "Next",
      title: "Start a lending conversation with Apply Now.",
      description:
        "We will ask for property and income facts. This is not a live rate lock.",
      cta: { href: "/Get-Started", text: "Apply Now" },
      imageSeed: "promo-closer",
      imageAlt: "Advisor walking with a customer through a branch lobby",
    }),
  ]),
} satisfies PageRecipe;

export default productCategoryTablewareRecipe;
