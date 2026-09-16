import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";
import {
  cardChromeParams,
  cardTitleLinkIconParam,
} from "./_card-chrome-params";

/**
 * Recipe for `LocationCard` — the leaf card rendering for the
 * locations family. Authors drop these into the `cards-locations-{*}`
 * placeholder exposed by the locations-list-grid / locations-carousel
 * parents (composed mode); in curated mode the location-card items
 * themselves are the datasource targets the parent's Treelist
 * references.
 *
 * Variants `Default`, `Compact`, `Inline`, `Pin` map to the four
 * LocationCard React function exports — different DOM topology, so the
 * variant boundary captures real composition differences (see
 * [[feedback-variant-vs-parameter]]).
 *
 * `ShowDistance` is a boolean rendering parameter — Sitecore Standard
 * Values drives the initial state; the React side leaves it
 * undefaulted (per [[feedback-no-react-defaults-for-sitecore-bool-params]]).
 * `DistanceUnit` defaults to `mi`; the search controller's location
 * filter populates the actual distance value via `extras.distance` on
 * the FlatItem.
 */
export const locationCardRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "location-card@1",
  icon: componentIcons["location-card@1"],
  name: "location-card",
  displayName: "Location Card",
  description:
    "Single location card. Variants: Default (full address + hours + CTA), Compact (image + name + CTA), Inline (single row), Pin (map-popup label).",
  section: { handle: "cards-and-lists-section@1" },
  fields: [
    {
      name: "Name",
      shape: "text",
      default: {
        en: "Downtown branch",
        ar: "فرع وسط المدينة",
        es: "Sucursal del centro",
        fr: "Agence du centre-ville",
        de: "Filiale Innenstadt",
        da: "Afdeling i centrum",
        ja: "ダウンタウン支店",
        "zh-CN": "市中心分店",
        "zh-TW": "市中心分店",
        it: "Filiale del centro",
      },
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "Location name (e.g. branch or store name).",
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "Address1",
      shape: "text",
      default: "123 Court Street",
      sitecore: {
        type: "single-line-text",
        hint: "Street address, line 1.",
        section: "Content",
        sortOrder: 200,
      },
    },
    {
      name: "Address2",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Street address, line 2 (suite, floor, etc.).",
        section: "Content",
        sortOrder: 300,
      },
    },
    {
      name: "City",
      shape: "text",
      default: "Brooklyn",
      sitecore: {
        type: "single-line-text",
        hint: "City / locality.",
        section: "Content",
        sortOrder: 400,
      },
    },
    {
      name: "State",
      shape: "text",
      default: "NY",
      sitecore: {
        type: "single-line-text",
        hint: "State / region.",
        section: "Content",
        sortOrder: 500,
      },
    },
    {
      name: "PostalCode",
      shape: "text",
      default: "11201",
      sitecore: {
        type: "single-line-text",
        hint: "Postal / ZIP code.",
        section: "Content",
        sortOrder: 600,
      },
    },
    {
      name: "Country",
      shape: "text",
      default: {
        en: "United States",
        ar: "الولايات المتحدة",
        es: "Estados Unidos",
        fr: "États-Unis",
        de: "Vereinigte Staaten",
        da: "USA",
        ja: "アメリカ合衆国",
        "zh-CN": "美国",
        "zh-TW": "美國",
        it: "Stati Uniti",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Country.",
        section: "Content",
        sortOrder: 700,
      },
    },
    {
      name: "Phone",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Phone number, surfaced as a `tel:` link.",
        section: "Contact",
        sortOrder: 100,
      },
    },
    {
      name: "Email",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Email address, surfaced as a `mailto:` link.",
        section: "Contact",
        sortOrder: 200,
      },
    },
    {
      name: "Hours",
      shape: "richText",
      sitecore: {
        type: "rich-text",
        hint: "Variable opening schedule — rich text supports per-day rows and seasonal notes.",
        section: "Content",
        sortOrder: 800,
      },
    },
    {
      name: "Image",
      shape: "image",
      role: "content",
      sitecore: {
        type: "image",
        hint: "Storefront / location photo. Optional for the Default variant; ignored by Inline and Pin.",
        section: "Media",
        sortOrder: 100,
      },
    },
    {
      name: "Link",
      shape: "link",
      sitecore: {
        type: "general-link",
        hint: "CTA destination — usually a `Get directions` map link or a location detail page.",
        section: "Action",
        sortOrder: 100,
      },
    },
    {
      name: "Latitude",
      shape: "number",
      default: "40.6943",
      sitecore: {
        type: "number",
        hint: "Decimal latitude. Used by map renderings and the search controller's distance filter.",
        section: "Geo",
        sortOrder: 100,
      },
    },
    {
      name: "Longitude",
      shape: "number",
      default: "-73.9903",
      sitecore: {
        type: "number",
        hint: "Decimal longitude. Used by map renderings and the search controller's distance filter.",
        section: "Geo",
        sortOrder: 200,
      },
    },
  ],
  params: [
    {
      name: "ShowDistance",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Show the distance pill when the search controller supplies a distance. Sitecore Standard Values drives the initial state — no React-side default.",
        section: "Behavior",
        sortOrder: 100,
      },
    },
    {
      name: "DistanceUnit",
      shape: "enum",
      default: "mi",
      sitecore: {
        enumHandle: "distance-unit@1",
        hint: "Unit for the distance pill. Defaults to `mi`.",
        section: "Behavior",
        sortOrder: 200,
      },
    },
    ...cardChromeParams,
    cardTitleLinkIconParam,
  ],
  variants: [
    { name: "Default" },
    { name: "Compact" },
    { name: "Inline" },
    { name: "Pin" },
  ],
  placedIn: ["cards-locations-{*}", "search-results-{*}"],
  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Locations" },
      { scope: "site", subfolder: "Locations" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default locationCardRecipe;
