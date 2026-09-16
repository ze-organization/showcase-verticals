import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for the `LocationSearchBar` rendering.
 *
 * Bundled location-input affordance for the search-experience wrapper.
 * ZIP / city input + radius selector + a "use my location" button
 * that pre-fills the controller with the user's coords via
 * `navigator.geolocation`. Drops into `search-controls-leading-{*}`.
 *
 * Reads + writes `controller.location` via the shared
 * `SearchControllerContext` (see `src/lib/registry/search/types.ts`).
 * The provider does any geocoding the search backend needs (ZIP/city
 * → lat/lng) and applies the radius filter. The custom in-memory
 * provider uses the haversine formula client-side so previews behave
 * like a real backend.
 *
 * Lives as its own bundled bar (rather than as Show* params on
 * `SearchControlsBar`) because the input has more bespoke logic than
 * a generic controls bar should grow: geolocation API,
 * radius-with-unit, and address autocomplete down the road.
 */
export const locationSearchBarRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "location-search-bar@1",
  icon: componentIcons["location-search-bar@1"],
  name: "location-search-bar",
  displayName: "Location Search Bar",
  description:
    "Bundled location input — ZIP / city + radius + 'use my location'. Drives controller.location inside a search-experience wrapper.",
  section: { handle: "search-section@1" },
  fields: [
    {
      name: "InputPlaceholder",
      shape: "text",
      default: {
        en: "ZIP or city",
        ar: "الرمز البريدي أو المدينة",
        es: "Código postal o ciudad",
        fr: "Code postal ou ville",
        de: "PLZ oder Ort",
        da: "Postnummer eller by",
        ja: "郵便番号または市区町村",
        "zh-CN": "邮编或城市",
        "zh-TW": "郵遞區號或城市",
        it: "CAP o città",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Placeholder text shown in the empty location input.",
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "RadiusLabel",
      shape: "text",
      default: {
        en: "Within",
        ar: "ضمن",
        es: "Dentro de",
        fr: "Dans un rayon de",
        de: "Innerhalb von",
        da: "Inden for",
        ja: "範囲内",
        "zh-CN": "范围内",
        "zh-TW": "範圍內",
        it: "Entro",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Label next to the radius selector.",
        section: "Content",
        sortOrder: 200,
      },
    },
    {
      name: "UseMyLocationLabel",
      shape: "text",
      default: {
        en: "Use my location",
        ar: "استخدم موقعي",
        es: "Usar mi ubicación",
        fr: "Utiliser ma position",
        de: "Meinen Standort verwenden",
        da: "Brug min placering",
        ja: "現在地を使用",
        "zh-CN": "使用我的位置",
        "zh-TW": "使用我的位置",
        it: "Usa la mia posizione",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Label on the 'use my location' button.",
        section: "Content",
        sortOrder: 300,
      },
    },
    {
      name: "SubmitLabel",
      shape: "text",
      default: {
        en: "Search",
        ar: "بحث",
        es: "Buscar",
        fr: "Rechercher",
        de: "Suchen",
        da: "Søg",
        ja: "検索",
        "zh-CN": "搜索",
        "zh-TW": "搜尋",
        it: "Cerca",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Label on the submit button.",
        section: "Content",
        sortOrder: 400,
      },
    },
  ],
  params: [
    {
      name: "RadiusOptions",
      shape: "text",
      default: "5,10,25,50,100",
      sitecore: {
        type: "single-line-text",
        hint: "Comma-separated list of selectable radius values.",
        section: "Behavior",
        sortOrder: 100,
      },
    },
    {
      name: "DefaultUnit",
      shape: "enum",
      default: "mi",
      sitecore: {
        enumHandle: "distance-unit@1",
        hint: "Distance unit. The controller.location.unit overrides this when set.",
        section: "Behavior",
        sortOrder: 200,
      },
    },
    {
      name: "ShowRadius",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Show the radius selector. Off = ZIP-only.",
        section: "Visibility",
        sortOrder: 100,
      },
    },
    {
      name: "ShowUseMyLocation",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Show the 'use my location' button.",
        section: "Visibility",
        sortOrder: 200,
      },
    },
  ],
  variants: [{ name: "Default" }, { name: "Compact" }],
  placedIn: ["search-controls-leading-{*}", "search-controls-trailing-{*}"],
  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Location Search Bars" },
      { scope: "site", subfolder: "Location Search Bars" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default locationSearchBarRecipe;
