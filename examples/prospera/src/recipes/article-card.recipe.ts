import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for `ArticleCard` — the leaf card rendering for the articles
 * family. Authors drop these into the `cards-articles-{*}` placeholder
 * exposed by `articles-list-grid@1` and `articles-carousel@1`
 * (composed mode).
 *
 * Variants map to the React function exports in `./article-card.tsx`:
 *
 *  - `Standard`   → `ArticleCardDefault` (image on top, meta, title, excerpt, CTA)
 *  - `ImageLed`   → `ArticleCardImageTitleOnly` (image + title only — visually image-forward)
 *  - `CompactRow` → `ArticleCardHorizontal` (image start, content end)
 *  - `Featured`   → `ArticleCardDefault` in a prominent, larger-headline configuration
 *
 * In curated mode the article-card items themselves are the datasource
 * targets the parent articles-list-grid/carousel's Treelist references.
 */
export const articleCardRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "article-card@1",
  icon: componentIcons["article-card@1"],
  name: "article-card",
  displayName: "Article Card",
  description:
    "Single article card. Variants: Standard, ImageLed, CompactRow, Featured, Overlay (photo card with gradient scrim for editorial/news portals).",
  section: { handle: "cards-and-lists-section@1" },
  fields: [
    {
      name: "Title",
      shape: "text",
      default: {
        en: "Untitled article",
        ar: "مقال بدون عنوان",
        es: "Artículo sin título",
        fr: "Article sans titre",
        de: "Unbenannter Artikel",
        da: "Artikel uden titel",
        ja: "無題の記事",
        "zh-CN": "无标题文章",
        "zh-TW": "無標題文章",
        it: "Articolo senza titolo",
      },
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "Article headline.",
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "Excerpt",
      shape: "richText",
      sitecore: {
        type: "rich-text",
        hint: "Short summary shown under the headline.",
        section: "Content",
        sortOrder: 200,
      },
    },
    {
      name: "Image",
      shape: "image",
      role: "content",
      sitecore: {
        type: "image",
        hint: "Cover image displayed at the top (Standard/Featured) or start (CompactRow).",
        section: "Content",
        sortOrder: 300,
      },
    },
    {
      name: "Link",
      shape: "link",
      sitecore: {
        type: "general-link",
        hint: "Destination URL for the card. Authors set per-placement; falls back to the article item's URL.",
        section: "Content",
        sortOrder: 400,
      },
    },
    {
      name: "Date",
      shape: "datetime",
      sitecore: {
        type: "datetime",
        hint: "Publish date. Surfaced in the meta line on Standard/Featured/CompactRow variants.",
        section: "Content",
        sortOrder: 500,
      },
    },
    {
      name: "Eyebrow",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Small uppercase line above the title (e.g. category, section).",
        section: "Content",
        sortOrder: 600,
      },
    },
  ],
  params: [
    {
      name: "Elevation",
      shape: "enum",
      default: "theme",
      sitecore: {
        enumHandle: "card-elevation@1",
        hint: "Shadow depth. `theme` defers to the active theme.",
        section: "Style",
        sortOrder: 200,
      },
    },
    {
      name: "Padding",
      shape: "enum",
      default: "lg",
      sitecore: {
        enumHandle: "card-padding@1",
        hint: "Inner padding density.",
        section: "Style",
        sortOrder: 300,
      },
    },
    {
      name: "Style",
      shape: "enum",
      default: "flat",
      sitecore: {
        enumHandle: "card-style@1",
        hint: "Card style: flat / outline / filled / elevated (opaque raised panel with a shadow — bind when the source shows white/raised cards standing off the section, especially on dark or coloured bands).",
        section: "Style",
        sortOrder: 400,
      },
    },
    {
      name: "CardColorScheme",
      shape: "enum",
      default: "neutral",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Card body scheme. Visible only when Style is outline (border) or filled (background tint). No effect on flat cards.",
        section: "Style",
        sortOrder: 500,
      },
    },
    {
      name: "ColorBand",
      shape: "enum",
      default: "none",
      sitecore: {
        enumHandle: "color-band@1",
        hint: "Optional color band hosting the title at the top of the card. Standard/Featured/ImageLed only.",
        section: "Style",
        sortOrder: 600,
      },
    },
    {
      name: "TitleLinkIcon",
      shape: "enum",
      default: "none",
      sitecore: {
        enumHandle: "title-link-icon@1",
        hint: "Optional trailing glyph beside the card title: `chevron` or `arrow`, signalling the whole card is a link/expandable. `none` (default) keeps the plain title. Honoured by every variant.",
        section: "Style",
        sortOrder: 650,
      },
    },
    {
      name: "MediaBleed",
      shape: "enum",
      default: "fullbleed",
      sitecore: {
        enumHandle: "card-media-bleed@1",
        hint: "Image treatment: `fullbleed` (edge-to-edge — image extends past padding to the card outline, the default) / `none` (inset — image sits inside the card padding, editorial opt-out) / `icon` (small icon, ~6rem square, top-start corner). Standard / Featured / ImageLed honor all three; CompactRow and Overlay ignore this.",
        section: "Style",
        sortOrder: 700,
      },
    },
    {
      name: "MediaFit",
      shape: "enum",
      default: "cover",
      sitecore: {
        enumHandle: "media-fit@1",
        hint: "How the image fills its media box. `cover` (default) scales up and crops — right for photography. `contain` fits the whole image in without cropping — bind for logos, brand marks, badges, seals, product cut-outs and screenshots, whose edges carry meaning.",
        section: "Style",
        sortOrder: 750,
      },
    },
    {
      name: "MediaAspect",
      shape: "enum",
      default: "auto",
      sitecore: {
        enumHandle: "media-aspect@1",
        hint: "Media aspect ratio (16x9 / 4x5 / 3x4 / 1x1). Overlay paints its absolute-fill media with it (`auto` → 4x5); Standard / Featured / ImageLed swap their fixed media height for the aspect box when a concrete value is set (`auto` keeps the height-based default). CompactRow ignores this.",
        section: "Style",
        sortOrder: 800,
      },
    },
    // No default on CtaPlacement — unset keeps the variant default
    // (inline arrow at the end of the copy), same contract as the
    // grid-level chrome axes.
    {
      name: "CtaPlacement",
      shape: "enum",
      sitecore: {
        enumHandle: "cta-placement@1",
        hint: "Where the arrow CTA sits on Standard / Featured: `inline` (default — end of the copy block) or `footer` (pinned actions row so CTAs align across a card row). ImageLed / CompactRow / Overlay render no CTA row.",
        section: "Style",
        sortOrder: 900,
      },
    },
  ],
  variants: [
    { name: "Standard" },
    { name: "ImageLed" },
    { name: "CompactRow" },
    { name: "Featured" },
    { name: "Overlay" },
  ],
  placedIn: ["cards-articles-{*}", "search-results-{*}"],
  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Articles" },
      { scope: "site", subfolder: "Articles" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default articleCardRecipe;
