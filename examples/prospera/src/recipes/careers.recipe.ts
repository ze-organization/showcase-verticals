import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import {
  container1Layout,
  featureCardPlacement,
  featuresListGrid,
  hubHero,
  hubPromoCloser,
} from "./_hub-grammar";

export const careersRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "careers@1",
  name: "Careers",
  displayName: "Careers",
  description: "Careers listing — hub grammar over three sample Job pages.",
  template: "page@1",
  itemPath: "/sitecore/content/{site}/Home/Careers",
  fields: {
    Title: "Careers",
    Eyebrow: "Join us",
    MetaTitle: "Careers — Prospera",
    MetaDescription: "Sample jobs at Prospera Bank, N.A. — branch, lending, and treasury.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.8",
    ChangeFrequency: "weekly",
  },
  layout: container1Layout([
    hubHero({
      eyebrow: "Careers",
      title: "Roles you can walk into.",
      subtitle:
        "Branch, lending, and treasury. Department and location are facts on each posting.",
      imageSeed: "promo-closer",
      imageAlt: "Advisor walking with a customer through a branch lobby",
      primary: { href: "/Careers/branch-banker", text: "Branch banker" },
      secondary: { href: "/Contact", text: "Contact us" },
    }),
    featuresListGrid({
      slot: "Jobs",
      title: "Open roles",
      lead: "Three roles. Branch, credit, and treasury.",
      headingLayout: "start",
      firstFeatured: true,
      cards: [
        featureCardPlacement({
          slot: "CardBranch",
          variant: "MediaStacked",
          title: "Branch banker",
          description:
            "Help customers open checking and walk a HELOC conversation in person.",
          href: "/Careers/branch-banker",
          linkText: "View role",
          imageSeed: "promo-closer",
          imageAlt: "Advisor walking with a customer through a branch lobby",
        }),
        featureCardPlacement({
          slot: "CardCredit",
          title: "Credit underwriter",
          description: "Mortgage and HELOC files, stated as facts.",
          href: "/Careers/credit-underwriter",
          linkText: "View role",
          imageSeed: "hub-business",
          imageAlt: "Banker reviewing a printed plan",
        }),
        featureCardPlacement({
          slot: "CardTreasury",
          title: "Treasury specialist",
          description:
            "Payables, receivables, and liquidity for operators who already have a controller.",
          href: "/Careers/treasury-specialist",
          linkText: "View role",
          imageSeed: "treasury",
          imageAlt: "Business owner and commercial banker",
        }),
      ],
    }),
    hubPromoCloser({
      eyebrow: "Next",
      title: "Do not see the role?",
      description: "Write us. We will keep the note with the listing.",
      cta: { href: "/Contact", text: "Contact us" },
      imageSeed: "hub-personal",
      imageAlt: "Advisor and customer at a branch table",
    }),
  ]),
} satisfies PageRecipe;

export default careersRecipe;
