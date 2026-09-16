import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { container1Layout, hubHero, hubPromoCloser } from "./_hub-grammar";

export const eventsRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "events@1",
  name: "Events",
  displayName: "Events",
  description: "Events listing — hub grammar over three sample Event pages.",
  template: "page@1",
  itemPath: "/sitecore/content/{site}/Home/Events",
  fields: {
    Title: "Events",
    Eyebrow: "Calendar",
    MetaTitle: "Events — Prospera",
    MetaDescription: "First-home workshop, treasury breakfast, and branch open house.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.8",
    ChangeFrequency: "weekly",
  },
  layout: container1Layout([
    hubHero({
      eyebrow: "Events",
      title: "Dates you can walk into.",
      subtitle: "A first-home workshop, a treasury breakfast, and a branch open house.",
      imageSeed: "promo-closer",
      imageAlt: "Advisor walking with a customer through a branch lobby",
      primary: { href: "/Events/authoring-workshop", text: "First-home workshop" },
      secondary: { href: "/Get-Started", text: "Apply Now" },
    }),
    {
      componentHandle: "articles-list-grid@1",
      variant: "Grid",
      params: { HeadingLayout: "start" },
      datasourceRef: {
        kind: "scoped",
        slot: "Events",
        fields: {
          Title: "Upcoming",
          Lead: "<p>Three events. First card is Featured.</p>",
        },
      },
      placeholders: {
        "cards-articles": [
          {
            componentHandle: "article-card@1",
            variant: "Featured",
            datasourceRef: {
              kind: "scoped",
              slot: "CardWorkshop",
              fields: {
                Title: "First-home workshop",
                Excerpt:
                  "<p>A half-day in branch on down payment, illustrative APR, and Apply Now.</p>",
                Image: {
                  shape: "image",
                  mediaPath:
                    "/theme-photos/hub-02.jpg",
                  alt: "Workshop around a large screen",
                },
                Link: { href: "/Events/authoring-workshop", text: "View event" },
                Date: "2026-05-12T09:00:00Z",
                Eyebrow: "Workshop",
              },
            },
          },
          {
            componentHandle: "article-card@1",
            variant: "Standard",
            datasourceRef: {
              kind: "scoped",
              slot: "CardSummit",
              fields: {
                Title: "Treasury breakfast",
                Excerpt: "<p>A morning with controllers on ACH, wires, and liquidity reporting.</p>",
                Image: {
                  shape: "image",
                  mediaPath:
                    "/theme-photos/pdp-01.jpg",
                  alt: "Handshake over a project table",
                },
                Link: { href: "/Events/partner-summit", text: "View event" },
                Date: "2026-06-03T09:00:00Z",
                Eyebrow: "Summit",
              },
            },
          },
          {
            componentHandle: "article-card@1",
            variant: "Standard",
            datasourceRef: {
              kind: "scoped",
              slot: "CardStudio",
              fields: {
                Title: "Branch open house",
                Excerpt: "<p>Walk in at New York Midtown. No ticket.</p>",
                Image: {
                  shape: "image",
                  mediaPath:
                    "/theme-photos/promo-closer.jpg",
                  alt: "Midtown plaza towers",
                },
                Link: { href: "/Events/open-studio", text: "View event" },
                Date: "2026-09-18T09:00:00Z",
                Eyebrow: "Studio",
              },
            },
          },
        ],
      },
    },
    hubPromoCloser({
      slot: "FeaturedChild",
      eyebrow: "Featured",
      title: "Hold a seat at the first-home workshop",
      description: "Half-day on the 30-year mortgage. Not a live rate lock.",
      cta: { href: "/Events/authoring-workshop", text: "View event" },
      imageSeed: "promo-closer",
      imageAlt: "Advisor walking with a customer through a branch lobby",
    }),
    hubPromoCloser({
      eyebrow: "Next",
      title: "Ready to register?",
      description: "Name and email. We will confirm the date.",
      cta: { href: "/Get-Started", text: "Apply Now" },
    }),
  ]),
} satisfies PageRecipe;

export default eventsRecipe;
