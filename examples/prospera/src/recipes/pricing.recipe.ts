import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { container1Layout, hubHero } from "./_hub-grammar";

export const pricingRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "pricing@1",
  name: "Pricing",
  displayName: "Rates & fees",
  description:
    "Rates & fees — abstract hub, not SaaS tiers. Path stays /Pricing.",
  template: "page@1",
  itemPath: "/sitecore/content/{site}/Home/Pricing",
  fields: {
    Title: "Rates & fees",
    Eyebrow: "Disclosures",
    MetaTitle: "Rates & fees — Prospera",
    MetaDescription:
      "APY, APR, and account fees from Prospera Bank, N.A. Illustrative figures, not live offers.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.8",
    ChangeFrequency: "monthly",
  },
  layout: container1Layout([
    hubHero({
      eyebrow: "Rates & fees",
      title: "Sample rates, stated as facts.",
      subtitle:
        "APY, APR, and monthly fees for demonstration products. These are illustrations, not a live lock or a limited-time sale.",
      primary: { href: "/Get-Started", text: "Apply Now" },
      secondary: { href: "/Products", text: "Browse Personal" },
      backgroundColor: "primary",
    }),
    {
      componentHandle: "pricing-list-grid@1",
      variant: "Grid",
      params: { HeadingLayout: "start" },
      datasourceRef: {
        kind: "scoped",
        slot: "Plans",
        fields: {
          Title: "Illustrative products",
          Lead: "<p>Each card is a deposit or lending product with a disclosed demonstration rate.</p>",
        },
      },
      placeholders: {
        "cards-pricing": [
          {
            componentHandle: "pricing-card@1",
            variant: "Default",
            datasourceRef: {
              kind: "scoped",
              slot: "PlanChecking",
              fields: {
                Name: "Everyday checking",
                Price: "$0",
                Currency: "USD",
                PricePeriod: "/month",
                Features:
                  "Qualifying activity waives the sample fee\nDebit and bill pay\nOverdraft options disclosed",
                CtaLabel: "Apply Now",
                CtaLink: {
                  href: "/Products/Checking-and-Savings/everyday-checking",
                  text: "Apply Now",
                },
              },
            },
          },
          {
            componentHandle: "pricing-card@1",
            variant: "Default",
            datasourceRef: {
              kind: "scoped",
              slot: "PlanSavings",
              fields: {
                Name: "High-yield savings",
                Price: "4.15%",
                Currency: "APY",
                PricePeriod: " sample",
                Features:
                  "Sample APY as of this page\nCompounded monthly\nSix convenient withdrawals",
                Highlighted: "true",
                HighlightLabel: "Sample APY",
                CtaLabel: "Apply Now",
                CtaLink: {
                  href: "/Products/Checking-and-Savings/high-yield-savings",
                  text: "Apply Now",
                },
              },
            },
          },
          {
            componentHandle: "pricing-card@1",
            variant: "Default",
            datasourceRef: {
              kind: "scoped",
              slot: "PlanMortgage",
              fields: {
                Name: "30-year mortgage",
                Price: "6.375%",
                Currency: "APR",
                PricePeriod: " sample",
                Features:
                  "Not a live lock\nPoints and closing costs on the product page\nHELOC is a separate product",
                CtaLabel: "Apply Now",
                CtaLink: {
                  href: "/Products/Lending/thirty-year-mortgage",
                  text: "Apply Now",
                },
              },
            },
          },
        ],
      },
    },
  ]),
} satisfies PageRecipe;

export default pricingRecipe;
