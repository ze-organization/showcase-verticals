import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { container1Layout, hubHero, hubPromoCloser } from "./_hub-grammar";

export const newsListingRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "news-listing@1",
  name: "News",
  displayName: "News",
  description: "News listing — hub grammar over three sample News pages.",
  template: "page@1",
  itemPath: "/sitecore/content/{site}/Home/News",
  fields: {
    Title: "News",
    Eyebrow: "Desk",
    MetaTitle: "News — Prospera",
    MetaDescription: "APY restatements, HELOC reminders, and branch hours from Prospera Bank, N.A.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.8",
    ChangeFrequency: "weekly",
  },
  layout: container1Layout([
    hubHero({
      eyebrow: "News",
      title: "What changed this month.",
      subtitle:
        "Illustrative APY, HELOC policy, and branch hours. First card is Featured.",
      imageSeed: "promo-closer",
      imageAlt: "Advisor walking with a customer through a branch lobby",
      primary: {
        href: "/News/catalog-ships-insertable-types",
        text: "Read the latest",
      },
      secondary: { href: "/Resources", text: "All resources" },
    }),
    {
      componentHandle: "articles-list-grid@1",
      variant: "Grid",
      params: { HeadingLayout: "start" },
      datasourceRef: {
        kind: "scoped",
        slot: "News",
        fields: {
          Title: "From the desk",
          Lead: "<p>Three News pages. Insert → News under this listing for another story.</p>",
        },
      },
      placeholders: {
        "cards-articles": [
          {
            componentHandle: "article-card@1",
            variant: "Featured",
            datasourceRef: {
              kind: "scoped",
              slot: "CardCatalog",
              fields: {
                Title: "Illustrative high-yield APY restated at 4.15%",
                Excerpt:
                  "<p>The high-yield savings product page now shows 4.15% APY as an illustration. Not a live offer.</p>",
                Image: {
                  shape: "image",
                  mediaPath: "/theme-photos/hub-01.jpg",
                  alt: "Catalog spread on a studio table",
                },
                Link: {
                  href: "/News/catalog-ships-insertable-types",
                  text: "Read story",
                },
                Date: "2026-08-12T09:00:00Z",
                Eyebrow: "Product",
              },
            },
          },
          {
            componentHandle: "article-card@1",
            variant: "Standard",
            datasourceRef: {
              kind: "scoped",
              slot: "CardInsert",
              fields: {
                Title: "HELOC files still need occupancy and title",
                Excerpt:
                  "<p>A HELOC remains subject to credit, occupancy, and combined loan-to-value. Apply Now starts a conversation, not a lock.</p>",
                Image: {
                  shape: "image",
                  mediaPath: "/theme-photos/hub-02.jpg",
                  alt: "Editor setting insert options",
                },
                Link: {
                  href: "/News/listing-insert-options",
                  text: "Read story",
                },
                Date: "2026-08-19T09:00:00Z",
                Eyebrow: "Authoring",
              },
            },
          },
          {
            componentHandle: "article-card@1",
            variant: "Standard",
            datasourceRef: {
              kind: "scoped",
              slot: "CardHubs",
              fields: {
                Title: "New York Midtown extends lobby hours",
                Excerpt:
                  "<p>Walk-in hours expand at New York Midtown.</p>",
                Image: {
                  shape: "image",
                  mediaPath: "/theme-photos/pdp-01.jpg",
                  alt: "Stacked sections on a page proof",
                },
                Link: {
                  href: "/News/hub-parents-read-as-a-site",
                  text: "Read story",
                },
                Date: "2026-08-26T09:00:00Z",
                Eyebrow: "IA",
              },
            },
          },
        ],
      },
    },
    {
      componentHandle: "articles-carousel@1",
      variant: "Default",
      params: { HeadingLayout: "start" },
      datasourceRef: {
        kind: "scoped",
        slot: "Carousel",
        fields: { Title: "Three stories", Lead: "<p>The sample News pages.</p>" },
      },
      placeholders: {
        "cards-articles": [
          {
            componentHandle: "article-card@1",
            variant: "Standard",
            datasourceRef: {
              kind: "scoped",
              slot: "CarouselCatalog",
              fields: {
                Title: "Illustrative high-yield APY restated at 4.15%",
                Excerpt: "<p>4.15% APY as an illustration. Not a live offer.</p>",
                Image: {
                  shape: "image",
                  mediaPath: "/theme-photos/promo-closer.jpg",
                  alt: "Catalog spread on a studio table",
                },
                Link: {
                  href: "/News/catalog-ships-insertable-types",
                  text: "Read story",
                },
                Eyebrow: "Product",
              },
            },
          },
          {
            componentHandle: "article-card@1",
            variant: "Standard",
            datasourceRef: {
              kind: "scoped",
              slot: "CarouselInsert",
              fields: {
                Title: "HELOC files still need occupancy and title",
                Excerpt: "<p>Occupancy, title, and combined LTV still apply.</p>",
                Image: {
                  shape: "image",
                  mediaPath: "/theme-photos/home-hero.jpg",
                  alt: "Editor setting insert options",
                },
                Link: {
                  href: "/News/listing-insert-options",
                  text: "Read story",
                },
                Eyebrow: "Authoring",
              },
            },
          },
          {
            componentHandle: "article-card@1",
            variant: "Standard",
            datasourceRef: {
              kind: "scoped",
              slot: "CarouselHubs",
              fields: {
                Title: "New York Midtown extends lobby hours",
                Excerpt: "<p>Walk-in hours expand at New York Midtown.</p>",
                Image: {
                  shape: "image",
                  mediaPath: "/theme-photos/hub-01.jpg",
                  alt: "Stacked sections on a page proof",
                },
                Link: {
                  href: "/News/hub-parents-read-as-a-site",
                  text: "Read story",
                },
                Eyebrow: "IA",
              },
            },
          },
        ],
      },
    },
    hubPromoCloser({
      eyebrow: "Learn",
      title: "More in Resources",
      description: "Articles, case studies, and documentation sit beside News.",
      cta: { href: "/Resources", text: "Browse resources" },
    }),
  ]),
} satisfies PageRecipe;

export default newsListingRecipe;
