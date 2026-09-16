import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import {
  container1Layout,
  featureCardPlacement,
  featuresListGrid,
  hubHero,
  hubPromoCloser,
} from "./_hub-grammar";

/**
 * Services listing — `/Services`. Not in the header. Advice lives here.
 */
export const servicesRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "services@1",
  name: "Services",
  displayName: "Services",
  description:
    "Advice listing — wealth planning, retirement, and treasury. Not in header chrome.",
  template: "page@1",
  itemPath: "/sitecore/content/{site}/Home/Services",
  fields: {
    Title: "Services",
    Eyebrow: "Advice",
    MetaTitle: "Advice & services — Prospera",
    MetaDescription:
      "Wealth planning, retirement, and treasury from Prospera. Advice lives in the tree, not the header.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.8",
    ChangeFrequency: "weekly",
  },
  layout: container1Layout([
    hubHero({
      eyebrow: "Advice",
      title: "Planning next to the operating account.",
      subtitle:
        "Wealth, retirement, and treasury — three advice offerings next to the accounts you already hold.",
      imageSeed: "services",
      imageAlt: "Business owner and commercial banker reviewing a plan",
      primary: { href: "/Services/wealth-planning", text: "Wealth planning" },
      secondary: { href: "/Get-Started", text: "Apply Now" },
    }),
    featuresListGrid({
      slot: "Services",
      title: "How we advise",
      lead: "Wealth planning, retirement accounts, and treasury for operators.",
      headingLayout: "start",
      firstFeatured: true,
      cards: [
        featureCardPlacement({
          slot: "CardWealth",
          variant: "MediaStacked",
          title: "Wealth planning",
          description:
            "A plan that sits next to checking and the business — not a private-bank-only story.",
          href: "/Services/wealth-planning",
          linkText: "Wealth planning",
          imageSeed: "wealth-planning",
          imageAlt: "Advisor and customer at a branch table",
        }),
        featureCardPlacement({
          slot: "CardRetirement",
          title: "Retirement",
          description:
            "IRAs and workplace plans stated as account types, not a lifestyle promise.",
          href: "/Services/retirement",
          linkText: "Retirement",
          imageSeed: "retirement",
          imageAlt: "Customer and banker reviewing a household budget",
        }),
        featureCardPlacement({
          slot: "CardTreasury",
          title: "Treasury",
          description:
            "Payables, receivables, and liquidity for operators who already have a controller.",
          href: "/Services/treasury",
          linkText: "Treasury",
          imageSeed: "treasury",
          imageAlt: "Business owner and commercial banker on a factory floor",
        }),
      ],
    }),
    hubPromoCloser({
      eyebrow: "Next",
      title: "Apply Now, or write if you already have a banker.",
      description:
        "Advice is a conversation. We will not open a brokerage from this page. Bank deposits are FDIC-insured to applicable limits in this demonstration; investments are not.",
      cta: { href: "/Get-Started", text: "Apply Now" },
      imageSeed: "promo-closer",
      imageAlt: "Advisor walking with a customer through a branch lobby",
    }),
  ]),
} satisfies PageRecipe;

export default servicesRecipe;
