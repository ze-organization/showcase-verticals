import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { NY_METRO_LOCATION_CARD_HANDLES } from "./_location-demo-data";
import { locationsFinderLayout } from "./_locations-finder-layout";
import { hubHero, hubPromoCloser } from "./_hub-grammar";

export const locationMetroNewYorkRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "location-metro-new-york@1",
  name: "New-York",
  displayName: "New York",
  description: "New York metro hub — finder of Midtown only.",
  template: "location-metro@1",
  pageDesign: "hub-page@1",
  itemPath: "/sitecore/content/{site}/Home/Locations/North-America/New-York",
  fields: {
    Title: "New York",
    Eyebrow: "North America",
    ShortDescription: "Midtown is the sample location under this metro.",
    Image: {
      shape: "image",
      mediaPath: "/theme-photos/promo-closer.jpg",
      alt: "Midtown plaza towers",
    },
    MetaTitle: "New York locations — Showcase",
    MetaDescription:
      "New York metro hub. Insert Location under this type. Midtown is the sample.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.6",
    ChangeFrequency: "weekly",
  },
  layout: locationsFinderLayout({
    searchSlot: "NySearch",
    gridSlot: "NyLocations",
    title: "New York",
    lead: "<p>Midtown is the sample location in this metro. Insert another Location here for a second New York door.</p>",
    cardHandles: NY_METRO_LOCATION_CARD_HANDLES,
    hero: hubHero({
      eyebrow: "North America",
      title: "New York, starting in Midtown.",
      subtitle:
        "One sample Location under this metro. Insert another when the city needs a second door.",
      imageSeed: "nyc-midtown-location",
      imageAlt: "Midtown plaza towers",
      primary: {
        href: "/Locations/North-America/New-York/new-york-midtown",
        text: "Midtown",
      },
      secondary: { href: "/Locations/North-America", text: "North America" },
    }),
    closer: hubPromoCloser({
      eyebrow: "North America",
      title: "Back to North America",
      description: "New York is one metro fold under the territory.",
      cta: { href: "/Locations/North-America", text: "North America" },
    }),
  }),
} satisfies PageRecipe;

export default locationMetroNewYorkRecipe;
