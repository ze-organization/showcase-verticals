import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { APJ_LOCATION_CARD_HANDLES } from "./_location-demo-data";
import { locationsFinderLayout } from "./_locations-finder-layout";
import { hubHero, hubPromoCloser } from "./_hub-grammar";

export const locationsApjRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "locations-apj@1",
  name: "APJ",
  displayName: "APJ",
  description: "APJ territory hub — five sample Location pages.",
  template: "location-territory@1",
  pageDesign: "hub-page@1",
  itemPath: "/sitecore/content/{site}/Home/Locations/APJ",
  fields: {
    Title: "APJ",
    Eyebrow: "Locations",
    MetaTitle: "APJ locations — Showcase",
    MetaDescription:
      "Five sample locations in Tokyo, Singapore, Sydney, Mumbai, and Seoul.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.7",
    ChangeFrequency: "weekly",
  },
  layout: locationsFinderLayout({
    searchSlot: "ApjSearch",
    gridSlot: "ApjLocations",
    title: "APJ",
    lead: "<p>Five locations from Tokyo to Seoul. Click a pin to highlight the card, or a card to fly the map.</p>",
    cardHandles: APJ_LOCATION_CARD_HANDLES,
    hero: hubHero({
      eyebrow: "Locations",
      title: "APJ, five doors.",
      subtitle:
        "Locations sit on this territory. Insert a Metro when a city needs its own listing.",
      imageSeed: "tokyo-marunouchi-location",
      imageAlt: "Tokyo Station Marunouchi",
      primary: { href: "/Locations", text: "All locations" },
      secondary: { href: "/Contact", text: "Contact us" },
    }),
    closer: hubPromoCloser({
      eyebrow: "Locations",
      title: "See every territory",
      description: "North America and EMEA sit beside APJ under Locations.",
      cta: { href: "/Locations", text: "All locations" },
    }),
  }),
} satisfies PageRecipe;

export default locationsApjRecipe;
