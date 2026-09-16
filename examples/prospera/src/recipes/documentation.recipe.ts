import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import {
  container1Layout,
  featureCardPlacement,
  featuresListGrid,
  hubHero,
  hubPromoCloser,
} from "./_hub-grammar";

export const documentationRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "documentation@1",
  name: "Documentation",
  displayName: "Documentation",
  description:
    "Documentation hub — feature cards to Articles, Support, and FAQs. Path /Documentation.",
  template: "page@1",
  itemPath: "/sitecore/content/{site}/Home/Documentation",
  fields: {
    Title: "Documentation",
    Eyebrow: "Learn",
    MetaTitle: "Documentation — Prospera",
    MetaDescription:
      "Disclosures, articles, help, and FAQs from Prospera Bank, N.A.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.7",
    ChangeFrequency: "monthly",
  },
  layout: container1Layout([
    hubHero({
      eyebrow: "Documentation",
      title: "Disclosures and the written record.",
      subtitle:
        "Articles for household money. Help when you need a person. FAQs for questions we already answered.",
      primary: { href: "/Articles", text: "Browse articles" },
      secondary: { href: "/Support", text: "Get support" },
      backgroundColor: "primary",
    }),
    featuresListGrid({
      slot: "Links",
      title: "Start here",
      lead: "Three places to start. No second product.",
      cards: [
        featureCardPlacement({
          slot: "CardArticles",
          title: "Articles",
          description:
            "Guides on APY, checking, spending insights, FDIC, and HELOC.",
          href: "/Articles",
          linkText: "Browse articles",
          imageSeed: "composable-pages",
          imageAlt: "Customer and banker reviewing a household budget",
        }),
        featureCardPlacement({
          slot: "CardSupport",
          title: "Support",
          description:
            "Applications, Login, FDIC, and illustrative rates.",
          href: "/Support",
          linkText: "Get support",
          imageSeed: "support-center",
          imageAlt: "Advisor walking with a customer through a branch lobby",
        }),
        featureCardPlacement({
          slot: "CardFaqs",
          title: "FAQs",
          description:
            "Joint checking, branches, and whether APY figures are live.",
          href: "/FAQs",
          linkText: "Read FAQs",
          imageSeed: "faqs-hub",
          imageAlt: "Open notebook on a desk",
        }),
      ],
    }),
    hubPromoCloser({
      eyebrow: "Still stuck",
      title: "Still stuck? Write Help.",
      description:
        "Support, Contact, or a branch. Login stays in the header.",
      cta: { href: "/Support", text: "Open support" },
    }),
  ]),
} satisfies PageRecipe;

export default documentationRecipe;
