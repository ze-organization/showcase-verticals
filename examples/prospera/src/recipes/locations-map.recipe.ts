import type { ComponentTemplateRecipe } from "../lib/registry/sitecore-recipes";
import { componentIcons } from "./_component-icons";

/**
 * Demo map rendering for `locations-map-{*}`. No datasource — markers
 * come from the parent locations list/carousel context. Leaflet+OSM is
 * the default adapter; swap in `create-map-adapter.ts`.
 *
 * This placeholder stays unrestricted so a tenant can drop a different
 * map rendering later.
 */
export const locationsMapRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "locations-map@1",
  icon: componentIcons["locations-map@1"],
  name: "locations-map",
  displayName: "Locations Map",
  description:
    "Map of the locations in the parent list or carousel. Demo adapter is Leaflet + OpenStreetMap. Drop into locations-map-{*} on a Map* variant of Locations List / Grid or Locations Carousel.",
  section: { handle: "cards-and-lists-section@1" },
  fields: [],
  variants: [{ name: "Default" }],
  placedIn: ["locations-map-{*}"],
  datasource: {
    autoCreate: false,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Locations Maps" },
      { scope: "site", subfolder: "Locations Maps" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default locationsMapRecipe;
