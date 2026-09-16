import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { container1Layout } from "./_hub-grammar";

/**
 * Landing Pages listing — `/Landing-Pages`. Stays on `page@1` +
 * `standard-page@1`. Uses `features-list-grid@1` (no new card family).
 * After push, set this listing item's insert options to Landing and
 * Blank Landing (`PageRecipe` has no `insertOptions`).
 */
export const landingPagesRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "landing-pages@1",
  name: "Landing-Pages",
  displayName: "Landing Pages",
  description:
    "Landing Pages listing — grid of four sample feature cards linking to Landing and Blank Landing pages.",
  template: "page@1",
  itemPath: "/sitecore/content/{site}/Home/Landing-Pages",
  fields: {
    Title: "Landing Pages",
    Eyebrow: "Campaigns",
    MetaTitle: "Landing Pages — Prospera",
    MetaDescription:
      "Campaign landings for virtual cards, the budget planner, business accounting, and a blank canvas.",
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
            BackgroundColor: "primary",
          },
          datasourceRef: {
            kind: "scoped",
            slot: "Hero",
            fields: {
              Eyebrow: "Campaigns",
              Title: "Campaigns with a fixed shape.",
              Subtitle:
                "Virtual cards, the budget planner, and business accounting — plus a blank canvas. Apply Now remains the conversion.",
              PrimaryAction: {
                href: "/Products/virtual-cards",
                text: "Virtual cards",
              },
              SecondaryAction: { href: "/Get-Started", text: "Apply Now" },
            },
          },
        },
        {
          componentHandle: "features-list-grid@1",
          variant: "MediaStacked",
          params: {
            HeadingLayout: "start",
          },
          datasourceRef: {
            kind: "scoped",
            slot: "Landings",
            fields: {
              Eyebrow: "Campaigns",
              Title: "Landing Pages",
              Lead: "<p>Three filled campaigns under Personal or Business, and one blank canvas.</p>",
            },
          },
          placeholders: {
            "cards-features": [
              {
                componentHandle: "feature-card@1",
                variant: "MediaStacked",
                datasourceRef: {
                  kind: "scoped",
                  slot: "CardLaunch",
                  fields: {
                    Title: "Virtual cards",
                    Description:
                      "<p>Issue a number for a vendor without sharing the Rewards Visa. Under Personal.</p>",
                    Image: {
                      shape: "image",
                      mediaPath:
                        "/theme-photos/promo-closer.jpg",
                      alt: "Desk lamp on a studio table",
                    },
                    Link: {
                      href: "/Products/virtual-cards",
                      text: "View landing",
                    },
                  },
                },
              },
              {
                componentHandle: "feature-card@1",
                variant: "MediaStacked",
                datasourceRef: {
                  kind: "scoped",
                  slot: "CardWorkshop",
                  fields: {
                    Title: "Budget planner",
                    Description:
                      "<p>Income, bills, and savings goals next to everyday checking. Not a live calculator.</p>",
                    Image: {
                      shape: "image",
                      mediaPath:
                        "/theme-photos/home-hero.jpg",
                      alt: "Workshop around a large screen",
                    },
                    Link: {
                      href: "/Products/budget-planner",
                      text: "View landing",
                    },
                  },
                },
              },
              {
                componentHandle: "feature-card@1",
                variant: "MediaStacked",
                datasourceRef: {
                  kind: "scoped",
                  slot: "CardPartner",
                  fields: {
                    Title: "Business accounting",
                    Description:
                      "<p>Keep the books next to the operating account. Eligibility on the Business hub.</p>",
                    Image: {
                      shape: "image",
                      mediaPath:
                        "/theme-photos/hub-01.jpg",
                      alt: "Handshake over a project table",
                    },
                    Link: {
                      href: "/Business/accounting",
                      text: "View landing",
                    },
                  },
                },
              },
              {
                componentHandle: "feature-card@1",
                variant: "MediaStacked",
                datasourceRef: {
                  kind: "scoped",
                  slot: "CardBlank",
                  fields: {
                    Title: "Blank landing",
                    Description:
                      "<p>Header and footer only. Drop components into the main Container to build the campaign yourself.</p>",
                    Image: {
                      shape: "image",
                      mediaPath:
                        "/theme-photos/hub-02.jpg",
                      alt: "Empty studio table ready for a layout",
                    },
                    Link: {
                      href: "/Landing-Pages/blank",
                      text: "View blank landing",
                    },
                  },
                },
              },
            ],
          },
        },
        {
          componentHandle: "promo@1",
          variant: "Default",
          params: { ImagePosition: "hidden", SurfaceTone: "neutral" },
          datasourceRef: {
            kind: "scoped",
            slot: "Closer",
            fields: {
              Eyebrow: "Next",
              Title: "Need a campaign URL?",
              Description:
                "<p>Start an application, or write Contact if this is a commercial conversation.</p>",
              Link: { href: "/Get-Started", text: "Apply Now" },
            },
          },
        },
      ]),
} satisfies PageRecipe;

export default landingPagesRecipe;
