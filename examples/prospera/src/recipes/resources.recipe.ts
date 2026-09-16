import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import {
  container1Layout,
  featureCardPlacement,
  featuresListGrid,
  hubHero,
  hubPromoCloser,
} from "./_hub-grammar";

export const resourcesRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "resources@1",
  name: "Resources",
  displayName: "Resources",
  description:
    "Resources hub — cards to Articles, News, Case Studies, and Documentation. Path /Resources.",
  template: "page@1",
  itemPath: "/sitecore/content/{site}/Home/Resources",
  fields: {
    Title: "Resources",
    Eyebrow: "Learn",
    MetaTitle: "Resources — Prospera",
    MetaDescription:
      "Articles, news, commercial case studies, and disclosures from Prospera Bank, N.A.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.8",
    ChangeFrequency: "weekly",
  },
  layout: container1Layout([
    hubHero({
      eyebrow: "Learn",
      title: "Stories, proof, and disclosures.",
      subtitle:
        "Articles for household money. News for rate and branch notes. Case studies for commercial proof. Documentation for the written record.",
      primary: { href: "/Articles", text: "Read articles" },
      secondary: { href: "/Documentation", text: "Open documentation" },
      backgroundColor: "primary",
    }),
    featuresListGrid({
      slot: "Links",
      title: "Start here",
      lead: "Four places to start. Advice is not in this list.",
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
          slot: "CardNews",
          title: "News",
          description:
            "APY restatements, HELOC reminders, and branch hours.",
          href: "/News",
          linkText: "Browse news",
          imageSeed: "catalog-ships-insertable-types",
          imageAlt: "Advisor walking with a customer through a branch lobby",
        }),
        featureCardPlacement({
          slot: "CardCaseStudies",
          title: "Case Studies",
          description:
            "How operators moved payroll, clinic deposits, or a family-office plan.",
          href: "/Case-Studies",
          linkText: "Browse case studies",
          imageSeed: "northwind-rollout",
          imageAlt: "Business owner and commercial banker on a factory floor",
        }),
        featureCardPlacement({
          slot: "CardDocumentation",
          title: "Documentation",
          description:
            "The map to Articles, Help, and FAQs.",
          href: "/Documentation",
          linkText: "Open documentation",
          imageSeed: "docs-hub",
          imageAlt: "Open documentation on a desk",
        }),
      ],
    }),
    hubPromoCloser({
      eyebrow: "Help",
      title: "Help when a page is not enough.",
      description:
        "Support, Contact, or a branch. Login stays in the header.",
      cta: { href: "/Support", text: "Get support" },
    }),
  ]),
} satisfies PageRecipe;

export default resourcesRecipe;
