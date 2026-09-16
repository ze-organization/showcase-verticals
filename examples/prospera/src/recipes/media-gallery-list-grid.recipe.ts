import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";
import {
  CARD_CAPTION_PARAMS,
  CARD_EMPTY_STATE_PARAMS,
  CARD_HEADING_PLACEMENT_PARAM,
  CARD_LIST_BASE_PARAMS,
  CARD_LIST_GRID_PARAMS,
} from "../lib/registry/card-list-shared-params";

/**
 * Recipe for `MediaGalleryListGrid` — the list/grid layout rendering for
 * the media-gallery family. Datasource carries Title, Lead, and
 * SearchConfig. Authors drop `media-item@1` renderings into the
 * `cards-media-gallery-{*}` placeholder (hero-carousel authoring model).
 *
 * Note: unlike the offers family, media-gallery has no carousel sibling
 * — the layout swaps stay inside this rendering's variants
 * (Grid/NoSpacing/FiftyFifty/Featured/TwistedMixedMedia/List), so there
 * is no cross-rendering compatibility partner.
 */
export const mediaGalleryListGridRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "media-gallery-list-grid@1",
  icon: componentIcons["media-gallery-list-grid@1"],
  name: "media-gallery-list-grid",
  displayName: "Media Gallery List / Grid",
  description:
    "Media gallery list or grid. Composed (placeholder children), curated (Treelist), or search-driven (when nested in a search-experience). Variants: Grid, NoSpacing, FiftyFifty, Featured, TwistedMixedMedia, List.",
  section: { handle: "cards-and-lists-section@1" },
  fields: [
    {
      name: "Title",
      shape: "text",
      default: {
        en: "Media gallery",
        ar: "معرض الوسائط",
        es: "Galería multimedia",
        fr: "Galerie multimédia",
        de: "Mediengalerie",
        da: "Mediegalleri",
        ja: "メディアギャラリー",
        "zh-CN": "媒体库",
        "zh-TW": "媒體庫",
        it: "Galleria multimediale",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Section heading shown above the gallery.",
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
      name: "MediaItems",
      shape: "reference",
      multiple: true,
      sitecore: {
        type: "treelist",
        hint: "Curated mode — pick media-item entries to gallery. Leave empty to use the placeholder for composed mode, or populate SearchConfig for search mode.",
        source: { kind: "filter", types: ["media-item@1"] },
        section: "Content",
        sortOrder: 300,
      },
    },
    {
      name: "SearchConfig",
      shape: "text",
      sitecore: {
        type: "Plugin",
        hint: "Search-mode config blob. Populated via the sai/search-source Marketplace plugin (filters, sort, personalization). Ignored unless this rendering is nested inside a media-gallery-search-experience.",
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
  params: [
    ...CARD_LIST_BASE_PARAMS,
    CARD_HEADING_PLACEMENT_PARAM,
    ...CARD_LIST_GRID_PARAMS,
    {
      name: "MediaAspect",
      shape: "enum" as const,
      sitecore: {
        enumHandle: "media-aspect@1",
        hint: "Aspect ratio for each media frame (16x9 / 4x5 / 3x4 / 1x1). Unset keeps the layout's own preset.",
        section: "Card",
        sortOrder: 120,
      },
    },
    ...CARD_CAPTION_PARAMS,
    ...CARD_EMPTY_STATE_PARAMS,
  ],
  variants: [
    { name: "Grid" },
    { name: "NoSpacing" },
    { name: "FiftyFifty" },
    { name: "Featured" },
    { name: "TwistedMixedMedia" },
    { name: "List" },
  ],
  dynamicPlaceholders: true,
  placeholders: [
    {
      key: "cards-media-gallery-{*}",
      allowedRenderingHandles: ["media-item@1"],
    },
  ],
  placedIn: ["headless-main-{*}"],

  // Child-items authoring pattern (mirrors accordion-block): authors
  // can create items directly under this rendering's datasource via
  // Insert, then reference them from the curated Treelist.
  insertOptions: ["media-item@1"],

  // Folder template Insert Options so Sitecore Insert surfaces the
  // card/item type under each folder instance.
  children: { allowedHandles: ["media-item@1"] },

  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Media Galleries" },
      { scope: "site", subfolder: "Media Galleries" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default mediaGalleryListGridRecipe;
