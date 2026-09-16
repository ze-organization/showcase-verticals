import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";
import {
  CARD_EMPTY_STATE_PARAMS,
  CARD_LIST_BASE_PARAMS,
  CARD_LIST_GRID_PARAMS,
  CARD_MEDIA_ASPECT_PARAMS,
  CARD_STYLING_PARAMS,
  CARD_TITLE_LINK_ICON_PARAM,
} from "../lib/registry/card-list-shared-params";
import {
  DESTINATION_CARD_VARIANT_PARAM,
  DESTINATION_PRICE_TREATMENT_PARAM,
} from "./_family-params";

/**
 * Recipe for `DestinationsListGrid` — the list/grid layout rendering
 * for the destinations family. References `card-list-grid-params@1` for
 * all styling/layout params. Datasource carries:
 *
 *   - `Title`, `Lead`     — heading copy
 *   - `Destinations`      — curated Treelist of destination-card@1 items
 *   - `SearchConfig`      — Plugin field; populated only in search mode
 *
 * Component dispatches by which is populated. Composed mode uses the
 * `cards-destinations-{*}` placeholder (insertOptions restrict to
 * `destination-card@1`).
 *
 * Marked compatible with `destinations-carousel@1` via the shared
 * datasource template — swapping renderings preserves data.
 */
export const destinationsListGridRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "destinations-list-grid@1",
  icon: componentIcons["destinations-list-grid@1"],
  name: "destinations-list-grid",
  displayName: "Destinations List / Grid",
  description:
    "Destinations list or grid. Composed (placeholder children), curated (Treelist), or search-driven (when nested in a search-experience). Variants: Grid, Stacked, Split, Inline, Featured, FiftyFifty.",
  section: { handle: "cards-and-lists-section@1" },
  fields: [
    {
      name: "Eyebrow",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Optional kicker line above the title — rendered as a small-caps eyebrow. Populate when the source shows a short label above the section headline (centered small-caps kicker + large title → Eyebrow + HeadingSize xl + HeadingLayout centered).",
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "Title",
      shape: "text",
      default: {
        en: "Featured destinations",
        ar: "وجهات مميّزة",
        es: "Destinos destacados",
        fr: "Destinations à la une",
        de: "Empfohlene Reiseziele",
        da: "Fremhævede destinationer",
        ja: "おすすめの目的地",
        "zh-CN": "精选目的地",
        "zh-TW": "精選目的地",
        it: "Destinazioni in evidenza",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Section heading shown above the destinations.",
        section: "Content",
        sortOrder: 110,
      },
    },
    {
      name: "Lead",
      shape: "richText",
      sitecore: {
        type: "rich-text",
        hint: "Supporting copy under the title.",
        section: "Content",
        sortOrder: 200,
      },
    },
    {
      name: "Destinations",
      shape: "reference",
      multiple: true,
      sitecore: {
        type: "treelist",
        hint: "Curated mode — pick destination-card items to list. Leave empty to use the placeholder for composed mode, or populate SearchConfig for search mode.",
        source: { kind: "filter", types: ["destination-card@1"] },
        section: "Content",
        sortOrder: 300,
      },
    },
    {
      name: "SearchConfig",
      shape: "text",
      sitecore: {
        type: "Plugin",
        hint: "Search-mode config blob. Populated via the sai/search-source Marketplace plugin (filters, sort, personalization). Ignored unless this rendering is nested inside a destinations-search-experience.",
        source: {
          kind: "plugin",
          id: "sai/list-source",
          defaultAppId: "a559eb70-e5c3-4b3c-a0de-84def425a9c4",
        },
        section: "Search",
        sortOrder: 100,
      },
    },
  ],
  // Inline params (not `parameters: { handle }`): the shared external
  // template can't carry the family-specific `CardVariant`/`PriceTreatment`
  // axes. Spread the shared groups + family params.
  params: [
    ...CARD_LIST_BASE_PARAMS,
    ...CARD_LIST_GRID_PARAMS,
    ...CARD_STYLING_PARAMS,
    CARD_TITLE_LINK_ICON_PARAM,
    ...CARD_MEDIA_ASPECT_PARAMS,
    ...CARD_EMPTY_STATE_PARAMS,
    DESTINATION_CARD_VARIANT_PARAM,
    DESTINATION_PRICE_TREATMENT_PARAM,
  ],
  variants: [
    { name: "Grid" },
    { name: "Stacked" },
    { name: "Split" },
    { name: "Inline" },
    { name: "Featured" },
    { name: "FiftyFifty" },
  ],
  dynamicPlaceholders: true,

  placeholders: [
    {
      key: "cards-destinations-{*}",
      allowedRenderingHandles: ["destination-card@1"],
    },
  ],
  placedIn: ["headless-main-{*}", "search-results-{*}"],



  // Child-items authoring pattern (mirrors accordion-block): authors
  // can create items directly under this rendering's datasource via
  // Insert, then reference them from the curated Treelist.
  insertOptions: ["destination-card@1"],

  // Folder template Insert Options so Sitecore Insert surfaces the
  // card/item type under each folder instance.
  children: { allowedHandles: ["destination-card@1"] },

  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Destinations" },
      { scope: "site", subfolder: "Destinations" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default destinationsListGridRecipe;
