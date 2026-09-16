import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { ALL_LOCATION_CARD_HANDLES } from "./_location-demo-data";
import { locationsFinderLayout } from "./_locations-finder-layout";
import { hubHero, hubPromoCloser } from "./_hub-grammar";

/**
 * Locations listing — `/Locations`. Stays on `page@1` + `standard-page@1`.
 * Finder shows all 15 sample locations. After push, set insert options
 * to Location Territory.
 */
export const locationsRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "locations@1",
  name: "Locations",
  displayName: "Locations",
  description:
    "Locations listing — global finder of 15 sample locations, territory drill-down, and a Contact closer.",
  template: "page@1",
  itemPath: "/sitecore/content/{site}/Home/Locations",
  fields: {
    Title: "Locations",
    Eyebrow: "Branches",
    MetaTitle: "Branches — Prospera",
    MetaDescription:
      "Find a Prospera branch. Sample locations across North America, EMEA, and APJ.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "true",
    SitemapPriority: "0.8",
    ChangeFrequency: "weekly",
  },
  layout: locationsFinderLayout({
    searchSlot: "LocationSearch",
    gridSlot: "AllLocations",
    title: "Find a location",
    lead: "<p>Fifteen demonstration locations on one map. Filter by ZIP or city, or open a territory for a tighter view.</p>",
    cardHandles: ALL_LOCATION_CARD_HANDLES,
    includeRegionStrip: true,
    hero: hubHero({
      eyebrow: "Locations",
      title: "Find a branch.",
      subtitle:
        "Sample branches across North America, EMEA, and APJ. Filter by city, or open a territory. We keep a branch network — we do not tell a branchless story.",
      imageSeed: "locations",
      imageAlt: "Advisor walking with a customer through a branch lobby",
      primary: { href: "/Locations/North-America", text: "North America" },
      secondary: { href: "/Contact", text: "Contact us" },
    }),
    closer: hubPromoCloser({
      eyebrow: "Visit",
      title: "Need a branch that is not on the map?",
      description:
        "Write us. We will point you at a nearby location — or a time that works.",
      cta: { href: "/Contact", text: "Contact us" },
    }),
  }),
} satisfies PageRecipe;

export default locationsRecipe;
