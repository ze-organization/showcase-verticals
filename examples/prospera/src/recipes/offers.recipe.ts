import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { container1Layout, hubHero, hubPromoCloser } from "./_hub-grammar";

export const offersRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "offers@1",
  name: "Offers",
  displayName: "Offers",
  description:
    "Offers listing — promo APY and limited-time rates, not a retail sale.",
  template: "page@1",
  itemPath: "/sitecore/content/{site}/Home/Offers",
  fields: {
    Title: "Offers",
    Eyebrow: "Limited-time rates",
    MetaTitle: "Offers — Prospera",
    MetaDescription:
      "Limited-time APY and rate promotions from Prospera. Illustrative terms, not a retail sale.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.8",
    ChangeFrequency: "weekly",
  },
  layout: container1Layout([
    hubHero({
      eyebrow: "Offers",
      title: "Limited-time APY and rate promotions.",
      subtitle:
        "Three disclosed promotions. Still illustrative for this demonstration — not a live lock.",
      imageSeed: "hub-personal",
      imageAlt: "Advisor and customer reviewing a household budget",
      primary: {
        href: "/Offers/high-yield-bonus",
        text: "High-yield bonus APY",
      },
      secondary: { href: "/Get-Started", text: "Apply Now" },
    }),
    {
      componentHandle: "offers-list-grid@1",
      variant: "Grid",
      params: { HeadingLayout: "start" },
      datasourceRef: {
        kind: "scoped",
        slot: "Offers",
        fields: {
          Title: "Current promotions",
          Lead: "<p>Three promotions. Bonus APY, a checking fee waiver, and a HELOC introductory draw rate.</p>",
        },
      },
      placeholders: {
        "cards-offers": [
          {
            componentHandle: "offer-card@1",
            variant: "Complex",
            datasourceRef: {
              kind: "scoped",
              slot: "CardApy",
              fields: {
                OfferText: "Bonus APY on high-yield savings",
                DiscountToken: "APY4.40",
                Link: {
                  href: "/Offers/high-yield-bonus",
                  text: "View offer",
                },
              },
            },
          },
          {
            componentHandle: "offer-card@1",
            variant: "Deal",
            datasourceRef: {
              kind: "scoped",
              slot: "CardChecking",
              fields: {
                OfferText: "Checking monthly fee waived for 12 months",
                DiscountToken: "CHK0",
                Link: {
                  href: "/Offers/checking-fee-waiver",
                  text: "View offer",
                },
              },
            },
          },
          {
            componentHandle: "offer-card@1",
            variant: "Simple",
            datasourceRef: {
              kind: "scoped",
              slot: "CardHeloc",
              fields: {
                OfferText: "Introductory HELOC draw rate",
                Link: {
                  href: "/Offers/heloc-intro-rate",
                  text: "View offer",
                },
              },
            },
          },
        ],
      },
    },
    hubPromoCloser({
      slot: "FeaturedChild",
      eyebrow: "Featured",
      title: "Bonus APY on high-yield savings",
      description:
        "Sample 4.40% APY for a limited window. Disclosures on the offer page.",
      cta: { href: "/Offers/high-yield-bonus", text: "View offer" },
      imageSeed: "high-yield-savings",
      imageAlt: "Advisor and customer reviewing a budget",
    }),
    hubPromoCloser({
      eyebrow: "Next",
      title: "Apply Now to use a promotion.",
      description: "Eligibility and end dates are on each offer. Not a sale rack.",
      cta: { href: "/Get-Started", text: "Apply Now" },
      imageSeed: "promo-closer",
      imageAlt: "Advisor walking with a customer through a branch lobby",
    }),
  ]),
} satisfies PageRecipe;

export default offersRecipe;
