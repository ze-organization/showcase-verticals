import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";
import { CARD_LIST_BASE_PARAMS } from "../lib/registry/card-list-shared-params";

/**
 * Recipe for `StoriesRail` — a horizontally scrollable row of circular,
 * ring-framed image thumbnails with a short label under each (the
 * Instagram-stories / match-highlights pattern). Datasource carries
 * `Title`, `Lead`, and an `Items` Treelist of `story-item@1` entries.
 *
 * Params are inlined (not the shared `card-list-grid-params@1`): the
 * rail has no grid columns, gap, or card-chrome axes — its own knobs
 * are `RingColorScheme` and `ThumbSize`, plus the shared heading /
 * section-surface base set.
 */
export const storiesRailRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "stories-rail@1",
  icon: componentIcons["stories-rail@1"],
  name: "stories-rail",
  displayName: "Stories Rail",
  description:
    "Horizontally scrollable row of circular, ring-framed image thumbnails with a short label under each — the Instagram-stories / match-highlights pattern. Each item links out (story viewer, highlight reel, player profile). Variants: Default.",
  section: { handle: "cards-and-lists-section@1" },
  fields: [
    {
      name: "Title",
      shape: "text",
      default: {
        en: "Highlights",
        ar: "أبرز اللحظات",
        es: "Destacados",
        fr: "Temps forts",
        de: "Highlights",
        da: "Højdepunkter",
        ja: "ハイライト",
        "zh-CN": "精彩集锦",
        "zh-TW": "精彩集錦",
        it: "In evidenza",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Section heading shown above the rail.",
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
      name: "Items",
      shape: "reference",
      multiple: true,
      sitecore: {
        type: "treelist",
        hint: "Curated story items — each a circular thumbnail image, a short label, and an optional link.",
        source: { kind: "filter", types: ["story-item@1"] },
        section: "Content",
        sortOrder: 300,
      },
    },
  ],
  variants: [{ name: "Default" }],
  params: [
    ...CARD_LIST_BASE_PARAMS,
    {
      name: "RingColorScheme",
      shape: "enum",
      default: "primary",
      sitecore: {
        enumHandle: "ring-color@1",
        hint: "Color role of the ring framing each thumbnail — primary (default), secondary, accent, or neutral (quiet gray border).",
        section: "Style",
        sortOrder: 300,
      },
    },
    {
      name: "ThumbSize",
      shape: "enum",
      default: "md",
      sitecore: {
        enumHandle: "size-scale@1",
        hint: "Thumbnail diameter: sm (64px), md (80px, default), lg (96px).",
        section: "Style",
        sortOrder: 310,
      },
    },
  ],
  placedIn: ["headless-main-{*}"],
  // Child-items authoring pattern (mirrors accordion-block): authors
  // can create `story-item@1` items directly under this rendering's
  // datasource item via the Sitecore "Insert" UX, then reference them
  // from the curated Treelist. Compiled onto the datasource template's
  // __Standard Values Insert Options — handles resolve to the
  // content-item (datasource) template GUIDs, not the rendering GUIDs,
  // so "add item" creates an authorable card item.
  insertOptions: ["story-item@1"],

  // Generate a `<Stories Rail> Folder` template under
  // Components/<section>/Component Folders/. The folder template's
  // standard-values Insert Options field references the listed handles
  // so the Sitecore "Insert" UX surfaces `story-item@1` items under
  // each folder instance.
  children: { allowedHandles: ["story-item@1"] },

  datasource: {
    templates: [{ handle: "stories-rail@1" }],
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Stories Rails" },
      { scope: "site", subfolder: "Stories Rails" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default storiesRailRecipe;
