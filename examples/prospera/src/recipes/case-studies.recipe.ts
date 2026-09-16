import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { container1Layout } from "./_hub-grammar";

/**
 * Case Studies listing — `/Case-Studies`. Stays on `page@1` +
 * `standard-page@1`. Uses `articles-list-grid@1` (no new card family).
 * After push, set this listing item's insert options to Case Study.
 */
export const caseStudiesRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "case-studies@1",
  name: "Case-Studies",
  displayName: "Case Studies",
  description:
    "Case Studies listing — grid of three sample article cards linking to Case Study pages.",
  template: "page@1",
  itemPath: "/sitecore/content/{site}/Home/Case-Studies",
  fields: {
    Title: "Case Studies",
    Eyebrow: "Proof",
    MetaTitle: "Case Studies — Prospera",
    MetaDescription:
      "Commercial proof from Prospera: payroll, clinic deposits, and a family-office plan.",
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
              Eyebrow: "Proof",
              Title: "Work we can name.",
              Subtitle:
                "Payroll, clinic deposits, and a family-office plan. Commercial proof, not a replatform story.",
              Image: {
                shape: "image",
                mediaPath:
                  "/theme-photos/pdp-01.jpg",
                alt: "Retail floor with modular displays",
              },
              PrimaryAction: {
                href: "/Case-Studies/northwind-rollout",
                text: "Read Northline",
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
            slot: "CaseStudies",
            fields: {
              Eyebrow: "Proof",
              Title: "Case Studies",
              Lead: "<p>Three Case Study pages. Insert → Case Study under this listing for another story.</p>",
            },
          },
          placeholders: {
            "cards-articles": [
              {
                componentHandle: "article-card@1",
                variant: "Featured",
                datasourceRef: {
                  kind: "scoped",
                  slot: "CardNorthwind",
                  fields: {
                    Title: "Northline moved payroll onto treasury",
                    Excerpt:
                      "<p>One shared Page for marketing URLs. Insertable types only where insert options and layout actually change.</p>",
                    Image: {
                      shape: "image",
                      mediaPath:
                        "/theme-photos/promo-closer.jpg",
                      alt: "Retail floor with modular displays",
                    },
                    Link: {
                      href: "/Case-Studies/northwind-rollout",
                      text: "Read case study",
                    },
                    Eyebrow: "Manufacturing",
                  },
                },
              },
              {
                componentHandle: "article-card@1",
                variant: "Standard",
                datasourceRef: {
                  kind: "scoped",
                  slot: "CardHarbor",
                  fields: {
                    Title: "Harbor Clinics ran payroll without a second bank",
                    Excerpt:
                      "<p>Care stories stay on Article. Campaigns moved to Landing. Editors stopped asking for a new template every week.</p>",
                    Image: {
                      shape: "image",
                      mediaPath:
                        "/theme-photos/home-hero.jpg",
                      alt: "Clinic waiting area in morning light",
                    },
                    Link: {
                      href: "/Case-Studies/harbor-health",
                      text: "Read case study",
                    },
                    Eyebrow: "Harbor Health",
                  },
                },
              },
              {
                componentHandle: "article-card@1",
                variant: "Standard",
                datasourceRef: {
                  kind: "scoped",
                  slot: "CardRidge",
                  fields: {
                    Title: "Ridge family office kept deposits next to the plan",
                    Excerpt:
                      "<p>Partner pages are Landings. Proof pages are Case Studies. The catalog stayed small on purpose.</p>",
                    Image: {
                      shape: "image",
                      mediaPath:
                        "/theme-photos/hub-01.jpg",
                      alt: "Workshop table with partner kits",
                    },
                    Link: {
                      href: "/Case-Studies/ridge-onboarding",
                      text: "Read case study",
                    },
                    Eyebrow: "Ridge",
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
              Title: "Three stories",
              Lead: "<p>Northwind, Harbor Health, and Ridge.</p>",
            },
          },
          placeholders: {
            "cards-articles": [
              {
                componentHandle: "article-card@1",
                variant: "Standard",
                datasourceRef: {
                  kind: "scoped",
                  slot: "CarouselNorthwind",
                  fields: {
                    Title: "Northline moved payroll onto treasury",
                    Excerpt:
                      "<p>One shared Page for marketing URLs.</p>",
                    Image: {
                      shape: "image",
                      mediaPath:
                        "/theme-photos/hub-02.jpg",
                      alt: "Retail floor with modular displays",
                    },
                    Link: {
                      href: "/Case-Studies/northwind-rollout",
                      text: "Read case study",
                    },
                    Eyebrow: "Manufacturing",
                  },
                },
              },
              {
                componentHandle: "article-card@1",
                variant: "Standard",
                datasourceRef: {
                  kind: "scoped",
                  slot: "CarouselHarbor",
                  fields: {
                    Title: "Harbor Clinics ran payroll without a second bank",
                    Excerpt:
                      "<p>Care stories stay on Article. Campaigns moved to Landing.</p>",
                    Image: {
                      shape: "image",
                      mediaPath:
                        "/theme-photos/pdp-01.jpg",
                      alt: "Clinic waiting area in morning light",
                    },
                    Link: {
                      href: "/Case-Studies/harbor-health",
                      text: "Read case study",
                    },
                    Eyebrow: "Harbor Health",
                  },
                },
              },
              {
                componentHandle: "article-card@1",
                variant: "Standard",
                datasourceRef: {
                  kind: "scoped",
                  slot: "CarouselRidge",
                  fields: {
                    Title: "Ridge family office kept deposits next to the plan",
                    Excerpt:
                      "<p>Partner pages are Landings. Proof pages are Case Studies.</p>",
                    Image: {
                      shape: "image",
                      mediaPath:
                        "/theme-photos/promo-closer.jpg",
                      alt: "Workshop table with partner kits",
                    },
                    Link: {
                      href: "/Case-Studies/ridge-onboarding",
                      text: "Read case study",
                    },
                    Eyebrow: "Ridge",
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
                "<p>Articles, news, and documentation sit beside Case Studies.</p>",
              Link: { href: "/Resources", text: "Browse resources" },
            },
          },
        },
      ]),
} satisfies PageRecipe;

export default caseStudiesRecipe;
