import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { picsum } from "./_theme-photos";
import { container1Layout, hubHero, hubPromoCloser } from "./_hub-grammar";

export const productCategorySeatingRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "product-category-seating@1",
  name: "Cards",
  displayName: "Cards",
  description: "Cards category hub — rewards Visa on product@1.",
  template: "product-category@1",
  pageDesign: "hub-page@1",
  itemPath: "/sitecore/content/{site}/Home/Products/Cards",
  fields: {
    Title: "Cards",
    Eyebrow: "Personal",
    ShortDescription: "A rewards Visa for everyday spend.",
    Image: {
      shape: "image",
      mediaPath: picsum("cards"),
      alt: "Person reviewing household finances at a desk",
    },
    MetaTitle: "Cards — Prospera",
    MetaDescription: "Prospera Rewards Visa for everyday spend, with virtual card numbers. Apply Now.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.7",
    ChangeFrequency: "weekly",
  },
  layout: container1Layout([
    hubHero({
      eyebrow: "Personal",
      title: "A card for ordinary spend.",
      subtitle:
        "A Rewards Visa for ordinary purchases. Virtual card numbers live on the product page.",
      imageSeed: "cards",
      imageAlt: "Person reviewing household finances at a desk",
      primary: {
        href: "/Products/Cards/rewards-visa",
        text: "Rewards Visa",
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
          Title: "In cards",
          Lead: "<p>One purchase card. Virtual numbers, cash back, and fees are on the product page.</p>",
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
              slot: "CardVisa",
              fields: {
                Title: "Rewards Visa",
                ShortDescription:
                  "Everyday purchase rewards. Illustrative 1.5% cash back.",
                Price: "0 annual fee",
                Sku: "CRD-01",
                CtaLabel: "View card",
                Image1: {
                  shape: "image",
                  mediaPath: picsum("rewards-visa"),
                  alt: "Person reviewing household finances at a desk",
                },
                Link: {
                  href: "/Products/Cards/rewards-visa",
                  text: "View card",
                },
              },
            },
          },
        ],
      },
    },
    hubPromoCloser({
      eyebrow: "Next",
      title: "Apply Now for the Rewards Visa.",
      description: "Fees and rewards categories are on the product page.",
      cta: { href: "/Get-Started", text: "Apply Now" },
      imageSeed: "promo-closer",
      imageAlt: "Advisor walking with a customer through a branch lobby",
    }),
  ]),
} satisfies PageRecipe;

export default productCategorySeatingRecipe;
