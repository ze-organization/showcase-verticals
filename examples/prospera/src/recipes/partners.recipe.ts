import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import {
  container1Layout,
  featureCardPlacement,
  featuresListGrid,
  hubHero,
  hubPromoCloser,
} from "./_hub-grammar";

export const partnersRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "partners@1",
  name: "Partners",
  displayName: "Partners",
  description: "Partners listing — core, payments, and reporting partners.",
  template: "page@1",
  itemPath: "/sitecore/content/{site}/Home/Partners",
  fields: {
    Title: "Partners",
    Eyebrow: "Network",
    MetaTitle: "Partners — Prospera",
    MetaDescription:
      "Technology and payments partners that sit next to Prospera deposits and treasury.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.8",
    ChangeFrequency: "weekly",
  },
  layout: container1Layout([
    hubHero({
      eyebrow: "Partners",
      title: "The systems next to the operating account.",
      subtitle:
        "Core processing, payments, and reporting partners. We do not put competitor logos on a comparison grid.",
      imageSeed: "hub-business",
      imageAlt: "Business owner and commercial banker on a factory floor",
      primary: {
        href: "/Partners/northwind-systems",
        text: "Clearpath Core",
      },
      secondary: { href: "/Get-Started", text: "Apply Now" },
    }),
    featuresListGrid({
      slot: "Partners",
      title: "The network",
      lead: "Three partners. Core records, ACH settlement, and liquidity reporting.",
      headingLayout: "start",
      firstFeatured: true,
      cards: [
        featureCardPlacement({
          slot: "CardNorthwind",
          variant: "MediaStacked",
          title: "Clearpath Core",
          description: "Deposit and lending records behind checking and the HELOC file.",
          href: "/Partners/northwind-systems",
          linkText: "View partner",
          imageSeed: "hub-personal",
          imageAlt: "Advisor and customer at a branch table",
        }),
        featureCardPlacement({
          slot: "CardHarbor",
          title: "Harbor Payments",
          description: "ACH and settlement next to treasury for operators who run payroll.",
          href: "/Partners/harbor-channel",
          linkText: "View partner",
          imageSeed: "hub-business",
          imageAlt: "Business owner and commercial banker on a factory floor",
        }),
        featureCardPlacement({
          slot: "CardRidge",
          title: "Ridge Analytics",
          description: "Liquidity and payables reporting a controller can reconcile.",
          href: "/Partners/ridge-labs",
          linkText: "View partner",
          imageSeed: "pdp",
          imageAlt: "Person reviewing finances at a desk",
        }),
      ],
    }),
    hubPromoCloser({
      eyebrow: "Next",
      title: "Want to partner?",
      description:
        "Write us with the capability you bring. Commercial clients still apply through Apply Now.",
      cta: { href: "/Contact", text: "Contact us" },
      imageSeed: "promo-closer",
      imageAlt: "Advisor walking with a customer through a branch lobby",
    }),
  ]),
} satisfies PageRecipe;

export default partnersRecipe;
