import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import {
  container1Layout,
  featureCardPlacement,
  featuresListGrid,
  hubContentBlock,
  hubHero,
  hubPromoCloser,
  hubStatsGrid,
} from "./_hub-grammar";

export const homepageDemoRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "homepage-demo@1",
  name: "Home",
  displayName: "Home",
  description:
    "Prospera Home — FullBleed hero, Personal/Business/checking tiles, feature strip, rates, trust, Apply Now closer.",
  template: "page@1",
  itemPath: "/sitecore/content/{site}/Home",
  fields: {
    Title: "Prospera",
    Eyebrow: "National banking",
    MetaTitle: "Prospera — Personal and business banking",
    MetaDescription:
      "Everyday checking, high-yield savings, cards, and lending from Prospera Bank, N.A. Apply now or visit a branch. Member FDIC.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "1.0",
    ChangeFrequency: "weekly",
  },
  layout: container1Layout([
    hubHero({
      eyebrow: "Prospera Bank, N.A.",
      title: "A national bank for the way you already live.",
      subtitle:
        "Checking and savings for the week, a card when you spend, a mortgage or HELOC when you are ready — with advice and branches behind it.",
      imageSeed: "home-hero",
      imageAlt:
        "A couple reviewing household finances in a city apartment",
      primary: { href: "/Get-Started", text: "Apply Now" },
      secondary: { href: "/Products", text: "Explore Personal" },
    }),
    featuresListGrid({
      slot: "Highlights",
      title: "Choose how you bank",
      lead: "Personal accounts, commercial relationships, or start with everyday checking.",
      headingLayout: "center",
      firstFeatured: true,
      cards: [
        featureCardPlacement({
          slot: "CardPersonal",
          variant: "MediaStacked",
          title: "Personal",
          description:
            "Everyday checking, high-yield savings, a rewards Visa, a 30-year mortgage, and a home-equity line of credit.",
          href: "/Products",
          linkText: "Browse Personal",
          imageSeed: "hub-personal",
          imageAlt: "Customer and banker reviewing a household budget",
        }),
        featureCardPlacement({
          slot: "CardBusiness",
          title: "Business",
          description:
            "Operating accounts, treasury, and a named banker for companies that already run payroll.",
          href: "/Business",
          linkText: "Explore Business",
          imageSeed: "hub-business",
          imageAlt: "Business owner and commercial banker on a factory floor",
        }),
        featureCardPlacement({
          slot: "CardChecking",
          title: "Everyday checking",
          description:
            "Direct deposit, debit, and bill pay. Sample monthly maintenance is $0 with qualifying activity.",
          href: "/Products/Checking-and-Savings/everyday-checking",
          linkText: "See checking",
          imageSeed: "pdp",
          imageAlt: "Person reviewing household finances at a desk",
        }),
      ],
    }),
    featuresListGrid({
      slot: "Tools",
      title: "Built into your accounts",
      lead: "Savings goals, virtual cards, and bill pay — Prospera names for everyday money tools, not a sixth header item.",
      headingLayout: "center",
      firstFeatured: true,
      cards: [
        featureCardPlacement({
          slot: "CardGoals",
          variant: "MediaStacked",
          title: "Savings goals",
          description:
            "Set aside cash inside high-yield savings for rent, a repair, or a down payment — with a published sample APY.",
          href: "/Products/Checking-and-Savings/high-yield-savings",
          linkText: "See savings",
          imageSeed: "high-yield-savings",
          imageAlt: "Advisor and customer reviewing a household budget",
        }),
        featureCardPlacement({
          slot: "CardVirtual",
          title: "Virtual cards",
          description:
            "Issue a number for a subscription or a vendor without sharing your physical Rewards Visa.",
          href: "/Products/virtual-cards",
          linkText: "How virtual cards work",
          imageSeed: "cards",
          imageAlt: "Person reviewing household finances at a desk",
        }),
        featureCardPlacement({
          slot: "CardBills",
          title: "Bill pay",
          description:
            "Schedule rent, utilities, and loan payments from everyday checking. Reminders stay on the account.",
          href: "/Products/Checking-and-Savings/everyday-checking",
          linkText: "See bill pay",
          imageSeed: "promo-closer",
          imageAlt: "Advisor walking with a customer through a branch lobby",
        }),
      ],
    }),
    hubStatsGrid({
      slot: "Rates",
      title: "Illustrative rates and fees",
      lead: "Figures below are demonstration values for this site, not a live lock or a limited-time sale. Confirm current terms on Rates & fees before you apply.",
      headingLayout: "start",
      stats: [
        {
          slot: "StatSavings",
          label: "High-yield savings APY (illustrative)",
          value: "4.15%",
        },
        {
          slot: "StatChecking",
          label: "Everyday checking monthly fee (illustrative)",
          value: "$0",
        },
        {
          slot: "StatMortgage",
          label: "30-year mortgage APR (illustrative)",
          value: "6.375%",
        },
      ],
    }),
    hubContentBlock({
      slot: "Trust",
      eyebrow: "Safety",
      title: "Deposits, lending, and a person if you need one.",
      body: "<p>Prospera Bank, N.A. is a fictional U.S. nationally chartered bank for this demonstration. In a live franchise, deposits would be FDIC-insured to applicable limits. Lending products are subject to credit approval and equal-housing rules.</p><p>Login is in the header. Apply Now is the only conversion button. Branches remain in Locations — we do not tell a branchless story.</p><p><small>Member FDIC. Equal Housing Lender. Rates and fees on this page are illustrative for a demo and are not live offers.</small></p>",
    }),
    hubPromoCloser({
      eyebrow: "Next step",
      title: "Apply Now — we will tell you what we need.",
      description:
        "Open checking, request a card, or start a mortgage or HELOC conversation. Eligibility and illustrative fees stay on each product page.",
      cta: { href: "/Get-Started", text: "Apply Now" },
      imageSeed: "promo-closer",
      imageAlt: "Advisor and customer in a bright urban branch",
    }),
  ]),
} satisfies PageRecipe;

export default homepageDemoRecipe;
