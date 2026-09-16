import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import {
  container1Layout,
  featureCardPlacement,
  featuresListGrid,
  hubHero,
  hubPromoCloser,
  hubSupportingBand,
} from "./_hub-grammar";

/**
 * Personal listing — `/Products`. Header label is Personal.
 */
export const productsRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "products@1",
  name: "Products",
  displayName: "Personal",
  description:
    "Personal hub — checking and savings, cards, and lending including HELOC.",
  template: "page@1",
  itemPath: "/sitecore/content/{site}/Home/Products",
  fields: {
    Title: "Personal",
    Eyebrow: "Banking",
    MetaTitle: "Personal banking — Prospera",
    MetaDescription:
      "Checking, high-yield savings, rewards cards, 30-year mortgages, and HELOC from Prospera Bank, N.A. Member FDIC.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.8",
    ChangeFrequency: "weekly",
  },
  layout: container1Layout([
    hubHero({
      eyebrow: "Personal",
      title: "Accounts, cards, and lending for household money.",
      subtitle:
        "Everyday checking for paychecks and bills. High-yield savings when cash can wait. A Rewards Visa, a 30-year mortgage, or a HELOC when you need one. Joint owners use the same checking product — add a co-applicant on Apply Now.",
      imageSeed: "hub-personal",
      imageAlt: "Customer and banker reviewing a household budget",
      primary: {
        href: "/Products/Checking-and-Savings",
        text: "Checking & Savings",
      },
      secondary: { href: "/Get-Started", text: "Apply Now" },
    }),
    featuresListGrid({
      slot: "Categories",
      title: "Bank by category",
      lead: "Three Personal families: deposits, cards, and home lending.",
      headingLayout: "start",
      firstFeatured: true,
      cards: [
        featureCardPlacement({
          slot: "CardChecking",
          variant: "MediaStacked",
          title: "Checking & Savings",
          description:
            "Everyday checking with bill pay and debit, plus high-yield savings with a published illustrative APY. Certificates of deposit are listed on Rates & fees when offered in this demo.",
          href: "/Products/Checking-and-Savings",
          linkText: "See accounts",
          imageSeed: "checking-and-savings",
          imageAlt: "Advisor and customer at a branch table",
        }),
        featureCardPlacement({
          slot: "CardCards",
          title: "Cards",
          description:
            "A Rewards Visa for everyday purchases, with virtual card numbers for subscriptions and vendors.",
          href: "/Products/Cards",
          linkText: "See cards",
          imageSeed: "cards",
          imageAlt: "Person reviewing household finances at a desk",
        }),
        featureCardPlacement({
          slot: "CardLending",
          title: "Lending",
          description:
            "A 30-year fixed-rate mortgage and a home-equity line of credit. Both are subject to credit approval.",
          href: "/Products/Lending",
          linkText: "See lending",
          imageSeed: "lending",
          imageAlt: "Commercial banker reviewing a printed plan",
        }),
      ],
    }),
    hubSupportingBand({
      eyebrow: "Rates",
      title: "APY, APR, and fees belong next to the product.",
      description:
        "Illustrative yields and loan rates are disclosed on each product page and summarized on Rates & fees. Compare accounts, then Apply Now when you are ready.",
      cta: { href: "/Pricing", text: "Rates & fees" },
      imageSeed: "pdp",
      imageAlt: "Person reviewing a household checklist at a desk",
    }),
    hubPromoCloser({
      eyebrow: "Ready?",
      title: "Open an account with Apply Now.",
      description:
        "We will ask only what the application needs. A banker can finish the file in a branch if you prefer.",
      cta: { href: "/Get-Started", text: "Apply Now" },
      imageSeed: "promo-closer",
      imageAlt: "Advisor walking with a customer through a branch lobby",
    }),
  ]),
} satisfies PageRecipe;

export default productsRecipe;
