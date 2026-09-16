import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";
import {
  CARD_EMPTY_STATE_PARAMS,
  CARD_LIST_BASE_PARAMS,
  CARD_LIST_GRID_PARAMS,
  CARD_MEDIA_ASPECT_PARAMS,
  CARD_MEDIA_SHAPE_PARAM,
  CARD_STYLING_PARAMS,
  CARD_TITLE_LINK_ICON_PARAM,
} from "../lib/registry/card-list-shared-params";
import { PERSON_CARD_VARIANT_PARAM } from "./_family-params";

/**
 * Recipe for `PersonListGrid` — the list/grid layout rendering for
 * the persons family. References `card-list-grid-params@1` for all
 * styling/layout params. Datasource carries:
 *
 *   - `Title`, `Lead`     — heading copy
 *   - `Persons`           — curated Treelist of person-card@1 items
 *   - `SearchConfig`      — Plugin field; populated only in search mode
 *
 * Component dispatches by which is populated. Composed mode uses the
 * `cards-persons-{*}` placeholder (insertOptions restrict to
 * `person-card@1`).
 *
 * Marked as compatible with `person-carousel@1` via the shared
 * datasource template — swapping renderings preserves data.
 *
 * Replaces `doctors-listing@1` — a doctor is just a flavor of person.
 */
export const personListGridRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "person-list-grid@1",
  icon: componentIcons["person-list-grid@1"],
  name: "person-list-grid",
  displayName: "Person List / Grid",
  description:
    "People list or grid (staff bios, doctor rosters, leadership teams, etc.). Composed (placeholder children), curated (Treelist), or search-driven (when nested in a search-experience). Variants: Grid, List, Cards, Featured, FiftyFifty.",
  section: { handle: "cards-and-lists-section@1" },
  fields: [
    {
      name: "Title",
      shape: "text",
      default: {
        en: "Meet the team",
        ar: "تعرّف على الفريق",
        es: "Conoce al equipo",
        fr: "Découvrez l'équipe",
        de: "Das Team",
        da: "Mød teamet",
        ja: "チーム紹介",
        "zh-CN": "团队介绍",
        "zh-TW": "團隊介紹",
        it: "Il nostro team",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Section heading shown above the people.",
        section: "Content",
        sortOrder: 100,
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
      name: "Persons",
      shape: "reference",
      multiple: true,
      sitecore: {
        type: "treelist",
        hint: "Curated mode — pick person-card items to list. Leave empty to use the placeholder for composed mode, or populate SearchConfig for search mode.",
        source: { kind: "filter", types: ["person-card@1"] },
        section: "Content",
        sortOrder: 300,
      },
    },
    {
      name: "SearchConfig",
      shape: "text",
      sitecore: {
        type: "Plugin",
        hint: "Search-mode config blob. Populated via the sai/search-source Marketplace plugin (filters, sort, personalization). Ignored unless this rendering is nested inside a person-search-experience.",
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
  // template can't carry the family-specific `CardVariant` axis.
  params: [
    ...CARD_LIST_BASE_PARAMS,
    ...CARD_LIST_GRID_PARAMS,
    ...CARD_STYLING_PARAMS,
    CARD_TITLE_LINK_ICON_PARAM,
    CARD_MEDIA_SHAPE_PARAM,
    ...CARD_MEDIA_ASPECT_PARAMS,
    ...CARD_EMPTY_STATE_PARAMS,
    PERSON_CARD_VARIANT_PARAM,
  ],
  variants: [
    { name: "Grid" },
    { name: "List" },
    { name: "Cards" },
    { name: "Featured" },
    { name: "FiftyFifty" },
  ],
  dynamicPlaceholders: true,

  placeholders: [
    {
      key: "cards-persons-{*}",
      allowedRenderingHandles: ["person-card@1"],
    },
  ],
  placedIn: ["headless-main-{*}", "search-results-{*}"],



  // Child-items authoring pattern (mirrors accordion-block): authors
  // can create items directly under this rendering's datasource via
  // Insert, then reference them from the curated Treelist.
  insertOptions: ["person-card@1"],

  // Folder template Insert Options so Sitecore Insert surfaces the
  // card/item type under each folder instance.
  children: { allowedHandles: ["person-card@1"] },

  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "People" },
      { scope: "site", subfolder: "People" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default personListGridRecipe;
