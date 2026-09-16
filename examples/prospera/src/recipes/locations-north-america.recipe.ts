import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { NA_LOCATION_CARD_HANDLES } from "./_location-demo-data";
import { locationsFinderLayout } from "./_locations-finder-layout";
import {
  featureCardPlacement,
  featuresListGrid,
  hubHero,
  hubPromoCloser,
} from "./_hub-grammar";

/**
 * North America territory hub. After push, set insert options to Metro
 * and Location (`location-metro@1`, `location@1`).
 *
 * Page fields stay on the `page@1` set (Title / Eyebrow / SEO). The live
 * items were created as Page; writing ShortDescription/Image here fails
 * Authoring GraphQL and rolls back the new Title-Case item.
 */
export const locationsNorthAmericaRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "locations-north-america@1",
  name: "North-America",
  displayName: "North America",
  description:
    "North America territory hub — finder of five locations plus a New York metro card.",
  template: "location-territory@1",
  pageDesign: "hub-page@1",
  itemPath: "/sitecore/content/{site}/Home/Locations/North-America",
  fields: {
    Title: "North America",
    Eyebrow: "Locations",
    MetaTitle: "North America locations — Showcase",
    MetaDescription:
      "Five sample locations in New York, Chicago, Toronto, Mexico City, and San Francisco.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.7",
    ChangeFrequency: "weekly",
  },
  layout: locationsFinderLayout({
    searchSlot: "NaSearch",
    gridSlot: "NaLocations",
    title: "North America",
    lead: "<p>Five locations in major metros. Use ZIP or city, or your current position, to sort by distance.</p>",
    cardHandles: NA_LOCATION_CARD_HANDLES,
    hero: hubHero({
      eyebrow: "Locations",
      title: "North America, five doors.",
      subtitle:
        "New York Midtown nests under a Metro. Chicago, Toronto, Mexico City, and San Francisco sit on this territory.",
      imageSeed: "nyc-midtown-location",
      imageAlt: "Midtown plaza towers",
      primary: {
        href: "/Locations/North-America/New-York",
        text: "New York metro",
      },
      secondary: { href: "/Locations", text: "All locations" },
    }),
    supporting: [
      featuresListGrid({
        slot: "Metros",
        title: "Metros",
        lead: "New York is the sample Metro fold. Insert another Metro when a city needs its own listing.",
        cards: [
          featureCardPlacement({
            slot: "CardNewYork",
            title: "New York",
            description: "Midtown is the sample location under this metro.",
            href: "/Locations/North-America/New-York",
            linkText: "View metro",
            imageSeed: "nyc-midtown-location",
            imageAlt: "Midtown plaza towers",
          }),
        ],
      }),
    ],
    closer: hubPromoCloser({
      eyebrow: "Locations",
      title: "See every territory",
      description: "EMEA and APJ sit beside North America under Locations.",
      cta: { href: "/Locations", text: "All locations" },
    }),
  }),
} satisfies PageRecipe;

export default locationsNorthAmericaRecipe;
