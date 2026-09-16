import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";
import {
  CARD_CAPTION_PARAMS,
  CARD_EMPTY_STATE_PARAMS,
  CARD_HEADING_PLACEMENT_PARAM,
  CARD_LIST_BASE_PARAMS,
} from "../lib/registry/card-list-shared-params";

/**
 * Recipe for `MediaWall` — the edge-to-edge photo-wall rendering for the
 * media family. Split out of `media-gallery-list-grid@1` so the two wall
 * layouts stop inheriting grid params (per-breakpoint columns, card
 * styling) that never applied to them.
 *
 * Datasource carries Title, Lead, Eyebrow, Cta, and SearchConfig.
 * Authors drop `media-item@1` renderings into the
 * `cards-media-wall-{*}` placeholder (hero-carousel authoring model).
 *
 * Variants:
 *   - `Mosaic`  — dense tight span grid, overlay captions.
 *   - `Collage` — loose CSS-masonry wall, full CaptionStyle support.
 *   - `Arc`     — photo arch: tiles fanned along a semicircular arc
 *                 around the heading stack. Tiles are decorative
 *                 (aria-hidden, captionless, never lightboxed).
 *                 ContentPlacement `center` moves the heading + pill
 *                 CTA into the well inside the arc; ArcSpread picks
 *                 ~120° vs ~180°. Below md the arch collapses to a
 *                 shallow top-arch of the leading tiles (same
 *                 parametric fan, flatter arc — not a grid).
 */
export const mediaWallRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "media-wall@1",
  icon: componentIcons["media-wall@1"],
  name: "media-wall",
  displayName: "Media Wall",
  description:
    "Edge-to-edge media photo wall. Composed (placeholder children), curated (Treelist), or search-driven. Variants: Mosaic (dense span grid, overlay captions), Collage (loose masonry), Arc (decorative photo arch fanned around an optionally centered heading + pill CTA). Shared Columns/Gap/CaptionStyle params plus Arc-only ContentPlacement/ArcSpread — no grid-card params.",
  section: { handle: "cards-and-lists-section@1" },
  fields: [
    {
      name: "Eyebrow",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Optional kicker line above the title — rendered as a small-caps eyebrow. On the Arc variant it tops the heading stack (normal placement or the arc's center well).",
        section: "Content",
        sortOrder: 90,
      },
    },
    {
      name: "Title",
      shape: "text",
      default: {
        en: "Media wall",
        ar: "جدار الوسائط",
        es: "Muro multimedia",
        fr: "Mur multimédia",
        de: "Medienwand",
        da: "Medievæg",
        ja: "メディアウォール",
        "zh-CN": "媒体墙",
        "zh-TW": "媒體牆",
        it: "Parete multimediale",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Section heading shown above the wall.",
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
      name: "Cta",
      shape: "link",
      sitecore: {
        type: "general-link",
        hint: "Optional heading CTA. Rendered as a pill button under the heading stack on Mosaic, Collage, and Arc (including Arc's center well).",
        section: "Content",
        sortOrder: 250,
      },
    },
    {
      name: "MediaItems",
      shape: "reference",
      multiple: true,
      sitecore: {
        type: "treelist",
        hint: "Curated mode — pick media-item entries for the wall. Leave empty to use the placeholder for composed mode, or populate SearchConfig for search mode.",
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
        hint: "Search-mode config blob. Populated via the sai/list-source Marketplace plugin. Ignored unless this rendering is nested inside a media search-experience.",
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
    {
      name: "Columns",
      shape: "enum",
      default: "4",
      sitecore: {
        enumHandle: "column-count@1",
        hint: "Column count on desktop (mobile stays 2). Mosaic maps it to the grid tracks; Collage to its CSS masonry columns.",
        section: "Layout",
        sortOrder: 100,
      },
    },
    {
      name: "Gap",
      shape: "enum",
      default: "md",
      sitecore: {
        enumHandle: "gap@1",
        hint: "Gap between tiles.",
        section: "Layout",
        sortOrder: 110,
      },
    },
    {
      name: "ContentPlacement",
      shape: "enum",
      default: "above",
      sitecore: {
        enumHandle: "band-content-placement@1",
        hint: "Arc variant only — where the heading sits relative to the photo arch: `above` (default — family's HeadingLayout) or `center` (heading + CTA in the well inside the fan). Mosaic/Collage ignore this; use HeadingLayout for alignment.",
        section: "Layout",
        sortOrder: 120,
      },
    },
    {
      name: "ArcSpread",
      shape: "enum",
      default: "wide",
      sitecore: {
        enumHandle: "arc-spread@1",
        hint: "Arc variant only — how far around the tile fan wraps: `wide` (~180°, default) or `tight` (~120°).",
        section: "Layout",
        sortOrder: 130,
      },
    },
    ...CARD_CAPTION_PARAMS,
    {
      name: "Lightbox",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Clicking a tile opens a modal detail view with previous/next paging. Off by default.",
        section: "Behavior",
        sortOrder: 200,
      },
    },
    {
      name: "LightboxEmbedPost",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Inside the lightbox, swap the media half for the platform embed when the item has an Instagram permalink. Requires Lightbox.",
        section: "Behavior",
        sortOrder: 210,
      },
    },
    ...CARD_EMPTY_STATE_PARAMS,
  ],
  variants: [{ name: "Mosaic" }, { name: "Collage" }, { name: "Arc" }],
  dynamicPlaceholders: true,

  placeholders: [
    {
      key: "cards-media-wall-{*}",
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
      { scope: "page", subfolder: "Media Walls" },
      { scope: "site", subfolder: "Media Walls" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default mediaWallRecipe;
