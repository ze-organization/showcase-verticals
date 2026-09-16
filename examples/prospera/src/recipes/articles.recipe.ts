import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { container1Layout } from "./_hub-grammar";

/**
 * Articles listing — `/Articles`. Stays on `page@1` + `standard-page@1`
 * (not the Article template). Body is `articles-list-grid@1` inside
 * `container1Layout` with a FullBleed Container around the hero and six
 * composed `article-card@1` children in the Default Container.
 *
 * Insert under an Article page is `article@1.insertOptions`. Insert
 * under an Article-with-TOC page is `article-with-toc@1.insertOptions`.
 * This listing stays `page@1`, so its Insert list cannot be those
 * types from recipes without also offering them under Home. After
 * push, set the listing item's insert options to Article and
 * Article with Table of Contents (`PageRecipe` has no `insertOptions`).
 */
export const articlesRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "articles@1",
  name: "Articles",
  displayName: "Articles",
  description:
    "Articles listing — hero, featured grid, a three-story carousel, and a Resources closer.",
  template: "page@1",
  itemPath: "/sitecore/content/{site}/Home/Articles",
  fields: {
    Title: "Articles",
    Eyebrow: "Editorial",
    MetaTitle: "Articles — Prospera",
    MetaDescription:
      "Guides from Prospera Bank, N.A. on APY, checking, spending insights, FDIC, HELOC, and Personal products.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.8",
    ChangeFrequency: "weekly",
  },
  layout: container1Layout([
        {
          componentHandle: "hero@1",
          variant: "FullBleed",
          params: {
            HeadingLayout: "display",
            Layout: "centered",
          },
          datasourceRef: {
            kind: "scoped",
            slot: "Hero",
            fields: {
              Eyebrow: "Articles",
              Title: "Guides for household money.",
              Subtitle:
                "APY, checking, spending insights, FDIC, HELOC, and a longer walk through Personal products.",
              Image: {
                shape: "image",
                mediaPath:
                  "/theme-photos/hub-01.jpg",
                alt: "Customer and banker reviewing a household budget",
              },
              PrimaryAction: {
                href: "/Articles/composable-pages",
                text: "Read the latest",
              },
              SecondaryAction: { href: "/Resources", text: "All resources" },
            },
          },
        },
        {
          componentHandle: "articles-list-grid@1",
          variant: "Grid",
          params: {
            HeadingLayout: "start",
          },
          datasourceRef: {
            kind: "scoped",
            slot: "Articles",
            fields: {
              Eyebrow: "From the desk",
              Title: "Latest articles",
              Lead: "<p>Six guides from consumer bank, lending, and disclosures.</p>",
            },
          },
          placeholders: {
            "cards-articles": [
              {
                componentHandle: "article-card@1",
                variant: "Featured",
                datasourceRef: {
                  kind: "scoped",
                  slot: "CardComposablePages",
                  fields: {
                    Title: "How Prospera publishes APY",
                    Excerpt:
                      "<p>Annual percentage yield stated as a fact, with compounding and a date — illustrative on this site.</p>",
                    Image: {
                      shape: "image",
                      mediaPath:
                        "/theme-photos/hub-02.jpg",
                      alt: "Modular blocks on a studio bench",
                    },
                    Link: {
                      href: "/Articles/composable-pages",
                      text: "Read article",
                    },
                    Date: "2026-04-02T09:00:00Z",
                    Eyebrow: "Architecture",
                  },
                },
              },
              {
                componentHandle: "article-card@1",
                variant: "Standard",
                datasourceRef: {
                  kind: "scoped",
                  slot: "CardAuthoring",
                  fields: {
                    Title: "Opening everyday checking",
                    Excerpt:
                      "<p>Direct deposit, debit, and bill pay. Joint owners apply together. Illustrative fees.</p>",
                    Image: {
                      shape: "image",
                      mediaPath:
                        "/theme-photos/pdp-01.jpg",
                      alt: "Editor working in a page canvas",
                    },
                    Link: {
                      href: "/Articles/authoring-that-scales",
                      text: "Read article",
                    },
                    Date: "2026-04-18T09:00:00Z",
                    Eyebrow: "Authoring",
                  },
                },
              },
              {
                componentHandle: "article-card@1",
                variant: "Standard",
                datasourceRef: {
                  kind: "scoped",
                  slot: "CardPersonalization",
                  fields: {
                    Title: "Reading spending insights",
                    Excerpt:
                      "<p>Categories on everyday checking show where the month went. Pair with bill pay and the planner.</p>",
                    Image: {
                      shape: "image",
                      mediaPath:
                        "/theme-photos/promo-closer.jpg",
                      alt: "Row of related still-life variants",
                    },
                    Link: {
                      href: "/Articles/personalization-authors-can-run",
                      text: "Read article",
                    },
                    Date: "2026-05-06T09:00:00Z",
                    Eyebrow: "Personalization",
                  },
                },
              },
              {
                componentHandle: "article-card@1",
                variant: "Standard",
                datasourceRef: {
                  kind: "scoped",
                  slot: "CardRecipeToLive",
                  fields: {
                    Title: "What FDIC insurance covers here",
                    Excerpt:
                      "<p>How this demonstration talks about FDIC insurance without inventing a certificate number.</p>",
                    Image: {
                      shape: "image",
                      mediaPath:
                        "/theme-photos/home-hero.jpg",
                      alt: "Notebook beside a published page",
                    },
                    Link: {
                      href: "/Articles/from-recipe-to-live",
                      text: "Read article",
                    },
                    Date: "2026-05-22T09:00:00Z",
                    Eyebrow: "Disclosures",
                  },
                },
              },
              {
                componentHandle: "article-card@1",
                variant: "Standard",
                datasourceRef: {
                  kind: "scoped",
                  slot: "CardSearch",
                  fields: {
                    Title: "When a HELOC is the better file",
                    Excerpt:
                      "<p>A revolving line against equity versus a 30-year first mortgage. Both subject to credit.</p>",
                    Image: {
                      shape: "image",
                      mediaPath:
                        "/theme-photos/hub-01.jpg",
                      alt: "Reading room with afternoon light",
                    },
                    Link: {
                      href: "/Articles/search-that-belongs",
                      text: "Read article",
                    },
                    Date: "2026-06-09T09:00:00Z",
                    Eyebrow: "Lending",
                  },
                },
              },
              {
                componentHandle: "article-card@1",
                variant: "Standard",
                datasourceRef: {
                  kind: "scoped",
                  slot: "CardWithToc",
                  fields: {
                    Title:
                      "Personal products, in order",
                    Excerpt:
                      "<p>Checking, savings, cards, mortgage, and HELOC — a longer walk with headings you can scan.</p>",
                    Image: {
                      shape: "image",
                      mediaPath:
                        "/theme-photos/hub-02.jpg",
                      alt: "Open notebook with a sketched outline beside a published article",
                    },
                    Link: {
                      href: "/Articles/with-table-of-contents",
                      text: "Read article",
                    },
                    Date: "2026-06-23T09:00:00Z",
                    Eyebrow: "Authoring",
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
            fields: {
              Title: "Three to start with",
              Lead: "<p>APY, everyday checking, and spending insights.</p>",
            },
          },
          placeholders: {
            "cards-articles": [
              {
                componentHandle: "article-card@1",
                variant: "Standard",
                datasourceRef: {
                  kind: "scoped",
                  slot: "CarouselComposable",
                  fields: {
                    Title: "How Prospera publishes APY",
                    Excerpt:
                      "<p>Yield stated as a fact, with compounding and a date.</p>",
                    Image: {
                      shape: "image",
                      mediaPath:
                        "/theme-photos/pdp-01.jpg",
                      alt: "Modular blocks on a studio bench",
                    },
                    Link: {
                      href: "/Articles/composable-pages",
                      text: "Read article",
                    },
                    Eyebrow: "Architecture",
                  },
                },
              },
              {
                componentHandle: "article-card@1",
                variant: "Standard",
                datasourceRef: {
                  kind: "scoped",
                  slot: "CarouselAuthoring",
                  fields: {
                    Title: "Opening everyday checking",
                    Excerpt:
                      "<p>Direct deposit, debit, and bill pay. Joint owners apply together.</p>",
                    Image: {
                      shape: "image",
                      mediaPath:
                        "/theme-photos/promo-closer.jpg",
                      alt: "Editor working in a page canvas",
                    },
                    Link: {
                      href: "/Articles/authoring-that-scales",
                      text: "Read article",
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
                  slot: "CarouselPersonalization",
                  fields: {
                    Title: "Reading spending insights",
                    Excerpt:
                      "<p>Categories on everyday checking show where the month went.</p>",
                    Image: {
                      shape: "image",
                      mediaPath:
                        "/theme-photos/home-hero.jpg",
                      alt: "Row of related still-life variants",
                    },
                    Link: {
                      href: "/Articles/personalization-authors-can-run",
                      text: "Read article",
                    },
                    Eyebrow: "Personalization",
                  },
                },
              },
            ],
          },
        },
        {
          componentHandle: "promo@1",
          variant: "Default",
          params: { ImagePosition: "end", SurfaceTone: "neutral" },
          datasourceRef: {
            kind: "scoped",
            slot: "Closer",
            fields: {
              Eyebrow: "Learn",
              Title: "More in Resources",
              Description:
                "<p>News, commercial case studies, and disclosures sit beside Articles.</p>",
              Link: { href: "/Resources", text: "Browse resources" },
            },
          },
        },
      ]),
} satisfies PageRecipe;

export default articlesRecipe;
