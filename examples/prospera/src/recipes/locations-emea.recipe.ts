import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { EMEA_LOCATION_CARD_HANDLES } from "./_location-demo-data";
import { locationsFinderLayout } from "./_locations-finder-layout";
import { hubHero, hubPromoCloser } from "./_hub-grammar";

export const locationsEmeaRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "locations-emea@1",
  name: "EMEA",
  displayName: "EMEA",
  description: "EMEA territory hub — five sample Location pages.",
  template: "location-territory@1",
  pageDesign: "hub-page@1",
  itemPath: "/sitecore/content/{site}/Home/Locations/EMEA",
  fields: {
    Title: "EMEA",
    Eyebrow: "Locations",
    MetaTitle: "EMEA locations — Showcase",
    MetaDescription:
      "Five sample locations in London, Paris, Frankfurt, Dubai, and Johannesburg.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.7",
    ChangeFrequency: "weekly",
  },
  layout: locationsFinderLayout({
    searchSlot: "EmeaSearch",
    gridSlot: "EmeaLocations",
    title: "EMEA",
    lead: "<p>Five locations from London to Johannesburg. Radius search uses OpenStreetMap geocoding.</p>",
    cardHandles: EMEA_LOCATION_CARD_HANDLES,
    hero: hubHero({
      eyebrow: "Locations",
      title: "EMEA, five doors.",
      subtitle:
        "Locations sit on this territory. Insert a Metro when a city needs its own listing.",
      imageSeed: "london-canary-location",
      imageAlt: "Canary Wharf towers",
      primary: { href: "/Locations", text: "All locations" },
      secondary: { href: "/Contact", text: "Contact us" },
    }),
    closer: hubPromoCloser({
      eyebrow: "Locations",
      title: "See every territory",
      description: "North America and APJ sit beside EMEA under Locations.",
      cta: { href: "/Locations", text: "All locations" },
    }),
  }),
} satisfies PageRecipe;

export default locationsEmeaRecipe;
