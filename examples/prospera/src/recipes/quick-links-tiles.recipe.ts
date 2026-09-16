import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for `QuickLinksTiles` — a compact grid or row of task-entry
 * tiles (icon + short label + optional description + link), curated
 * via the `Tiles` Treelist. Three tile sources, freely mixable:
 *
 *   - `quick-link-tile@1` — the classic curated tile (icon + label +
 *     description + link).
 *   - PAGES (`page@1`) — the tile reads the page item's own shared
 *     fields (Title → label, MetaDescription → description, OgImage →
 *     image fallback) and links to the page's URL. No duplicated
 *     content to keep in sync.
 *   - `link-item@1` — a virtual link record with the page-aligned
 *     field set (Title / Description / Thumbnail / IconName) plus an
 *     explicit `Url`, for EXTERNAL destinations.
 *
 * The React side normalizes all three shapes (plus the raw nested
 * linked-item envelope) via `normalizeQuickLinkTiles` — see
 * `QuickLinkTileEntry` in ./quick-links-tiles.tsx.
 *
 * The task-portal archetype utility, insurance, banking, and
 * government homepages lead with. For plain text link columns use
 * `link-list@1`; for marketing feature grids use
 * `features-list-grid@1`.
 */
export const quickLinksTilesRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "quick-links-tiles@1",
  icon: componentIcons["quick-links-tiles@1"],
  name: "quick-links-tiles",
  displayName: "Quick Links Tiles",
  description:
    "Compact grid or row of task-entry tiles — icon + short label + optional one-line description per tile, whole tile linked. Use for utility / task-portal homepages: pay bill, report outage, start-stop service, sign in, file a claim, get a quote, track an order. 3-8 tiles. Tiles accept three sources, freely mixed: curated quick-link-tile items, PAGES (tile renders the page's Title / MetaDescription / OgImage and links to the page), and link-item virtual links (page-aligned fields + explicit Url) for external destinations. Variants: Default (responsive grid, icon above label + description), Row (single horizontal strip of compact pills, scrollable), CtaBand (purchase-locator / conversion band — centered heading over 2-4 large outline CTA panels drawn in the current foreground color; pair with a saturated ColorScheme for the 'Pick up a bottle' Find-in-store / Shop-online treatment). When the source shows a photo band with a heading and a floating row of small icon/utility cards, compose THIS component inside hero@1's Placeholders slot (`hero-overlay-content-{*}`): Default variant with Columns 4, TileSize sm (compact icon+label cards on the light card surface), MaxWidth standard, PaddingY none — and bind each tile's IconName from the icon-name@1 vocabulary (bill, power, warning, heart, outage, …).",
  section: { handle: "navigation-section@1" },
  fields: [
    {
      name: "Title",
      shape: "text",
      default: {
        en: "How can we help?",
        ar: "كيف يمكننا مساعدتك؟",
        es: "¿Cómo podemos ayudarte?",
        fr: "Comment pouvons-nous vous aider ?",
        de: "Wie können wir helfen?",
        da: "Hvordan kan vi hjælpe?",
        ja: "何かお手伝いできることはありますか？",
        "zh-CN": "我们能为您做什么？",
        "zh-TW": "我們能為您做什麼？",
        it: "Come possiamo aiutarti?",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Optional heading above the tiles. Leave blank to render the tiles alone.",
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "Lead",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Supporting copy under the title.",
        section: "Content",
        sortOrder: 200,
      },
    },
    {
      name: "Tiles",
      shape: "reference",
      multiple: true,
      sitecore: {
        type: "treelist",
        hint: "Curated mode — pick entries in display order (3-8 recommended) from any of three sources, freely mixed: quick-link-tile items (icon + label + description + link), PAGES (the tile reads the page's Title, MetaDescription, and OgImage and links to the page itself — no duplicate content to maintain), or link-item entries (virtual links: page-aligned Title/Description/Thumbnail/IconName plus an explicit Url for EXTERNAL destinations).",
        source: {
          kind: "filter",
          types: ["quick-link-tile@1", "link-item@1", "page@1"],
        },
        section: "Content",
        sortOrder: 300,
      },
    },
  ],
  params: [
    {
      name: "Columns",
      shape: "enum",
      default: "4",
      sitecore: {
        enumHandle: "quick-links-columns@1",
        hint: "Columns at the lg breakpoint — Default (grid) variant only.",
        section: "Layout",
        sortOrder: 100,
      },
    },
    {
      name: "TileAspect",
      shape: "enum",
      default: "auto",
      sitecore: {
        enumHandle: "tile-aspect@1",
        hint: "Tile shape — Default (grid) variant only. `auto` (default) keeps content-height tiles; `square` / `landscape` / `portrait` give every tile the aspect box with centered content. Bind from the measured grid signature's tileAspect: ~1.0 → square, >1.3 → landscape, <0.8 → portrait.",
        section: "Layout",
        sortOrder: 110,
      },
    },
    {
      name: "Gap",
      shape: "enum",
      default: "md",
      sitecore: {
        enumHandle: "gap@1",
        hint: "Gap between tiles, honored by every variant: the Default grid, the Row strip and the CtaBand panel row. `md` (default) is the natural 16px. Bind from the measured gapPx: 0 → none, 1–12px → sm, 13–20px → md, 21–32px → lg, >32px → xl.",
        section: "Layout",
        sortOrder: 120,
      },
    },
    {
      name: "TileSize",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "size@1",
        hint: "Tile density, both variants. Bucketed: `xs`/`sm` → compact (small icon + label only, descriptions dropped; the theme's --card-shadow elevation — the floating over-photo utility-card treatment), `default`/`md` → the natural tile, `lg`/`xl` → roomier tiles.",
        section: "Layout",
        sortOrder: 130,
      },
    },
    {
      // `full` spans the container — the tiles' real default; the
      // class map emits no extra wrapper for it.
      name: "MaxWidth",
      shape: "enum",
      default: "full",
      sitecore: {
        enumHandle: "max-width@1",
        hint: "Semantic width cap for the tiles block, centered when constrained. `full` (default) spans the container. Pair `standard` with Columns 4 + TileSize sm for the centered floating card row inside a hero Placeholders photo band.",
        section: "Layout",
        sortOrder: 140,
      },
    },
    {
      name: "ColorScheme",
      shape: "enum",
      default: "none",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Background tone of the section around the tiles. Keep `none` when composed inside a hero/promo band — the band supplies the surface and the tiles keep their light card faces.",
        section: "Style",
        sortOrder: 200,
      },
    },
    {
      // Defaults to the in-list `auto` member: the section's natural
      // padding is the responsive `py-10 md:py-14`, which no concrete
      // `padding-y@1` token reproduces. `auto` maps to that ramp; a
      // concrete pick takes over.
      name: "PaddingY",
      shape: "enum",
      default: "auto",
      sitecore: {
        enumHandle: "padding-y@1",
        hint: "Vertical padding around the section. `auto` (default) keeps the section's natural responsive padding.",
        section: "Style",
        sortOrder: 300,
      },
    },
  ],
  variants: [{ name: "Default" }, { name: "Row" }, { name: "CtaBand" }],
  // Also allowed inside hero@1's Placeholders overlay slot (the photo
  // band + floating utility-card row composition) and promo@1's
  // Placeholders content column.
  placedIn: [
    "headless-main-{*}",
    "hero-overlay-content-{*}",
    "promo-content-{*}",
  ],
  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Quick Links" },
      { scope: "site", subfolder: "Quick Links" },
      // Shared site-level Links pool — reusable virtual link-item
      // entries (external URLs and cross-cutting destinations) shared
      // across pages and across link-driven renderings. Follows the
      // `Site Shared UI/Avatars` / `Authors` precedent on
      // avatar-block@1.
      {
        scope: "site",
        subfolder: "Site Shared UI/Links",
        allowedTemplates: [{ handle: "link-item@1" }],
      },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default quickLinksTilesRecipe;
