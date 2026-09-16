import { DETAILS_ARTICLE_HEADER_ADDITIONS } from "./_details-shell-params";
import { componentIcons } from "./_component-icons";
import type { ComponentTemplateRecipe } from "../lib/registry/sitecore-recipes";

/**
 * Recipe for the `ArticleHeader` component (./article-header.tsx).
 *
 * Article-style page-top header — meta-led layout for editorial /
 * blog / press-release pages. Sits ABOVE the article content and
 * BELOW the site nav header (a partial design, not the site header
 * itself). Single `Default` variant — alignment (start / centered /
 * end) is driven by the `Alignment` rendering parameter.
 *
 * Distinct from `hero@1` — article-header has no CTAs, instead
 * surfaces Created / Updated dates + an Authors byline (linked to
 * `author@1` items, supports multiple co-authors) + an optional
 * "As featured in:" logo strip for press / awards mentions.
 *
 * The "Published" / "Updated" labels are baked into the component (no
 * per-instance text field) so they can be swapped for Sitecore
 * dictionary values later without touching every datasource.
 *
 * Fields are organised into collapsible Sitecore sections (Content /
 * Meta) so authors see a tidy editor surface. Params mirror the
 * shared shell vocabulary (UseSectionWrapper + HeadingAnimation /
 * HeadingSize) used by accordion-block / form-builder /
 * content-block, plus a ColorScheme surface axis aligned to the
 * shared `color-scheme@1` enum.
 */
export const articleHeaderRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "article-header@1",
  icon: componentIcons["article-header@1"],
  name: "article-header",
  displayName: "Article Header",
  description:
    "Article-style page-top header with title, rich-text subtitle, lead image, Created / Updated dates, and a multi-author byline (avatar + name, linked to author@1 — entries that reference an author page link to it). Alignment is driven by the Alignment param (start / center / end).",

  section: { handle: "heros-and-promos-section@1" },

  fields: [
    {
      name: "Eyebrow",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Optional small uppercase line above the title (e.g. 'CASE STUDY', 'INSIGHTS'). Mirrors the editorial hero treatment.",
        section: "Content",
        sortOrder: 50,
      },
    },
    {
      name: "Title",
      shape: "text",
      default: "How we built the new experience platform",
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "Article headline. Renders as the page H1 — the article title IS the document's primary heading, not an H2.",
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "Subtitle",
      shape: "richText",
      default: {
        en: "<p>A deep dive into the architecture and design decisions behind the launch.</p>",
        ar: "<p>نظرة معمّقة على البنية والقرارات التصميمية وراء الإطلاق.</p>",
        es: "<p>Un análisis en profundidad de la arquitectura y las decisiones de diseño detrás del lanzamiento.</p>",
        fr: "<p>Une analyse approfondie de l'architecture et des choix de conception derrière le lancement.</p>",
        de: "<p>Ein tiefer Einblick in die Architektur und die Designentscheidungen hinter dem Launch.</p>",
        da: "<p>Et dybdegående kig på arkitekturen og designbeslutningerne bag lanceringen.</p>",
        ja: "<p>ローンチの背後にあるアーキテクチャと設計判断を徹底解説します。</p>",
        "zh-CN": "<p>深入解析此次发布背后的架构与设计决策。</p>",
        "zh-TW": "<p>深入解析此次發布背後的架構與設計決策。</p>",
        it: "<p>Un'analisi approfondita dell'architettura e delle scelte di design dietro il lancio.</p>",
      },
      sitecore: {
        type: "rich-text",
        hint: "Optional dek / lead paragraph under the title.",
        section: "Content",
        sortOrder: 200,
      },
    },
    {
      name: "Image",
      shape: "image",
      role: "hero",
      sitecore: {
        type: "image",
        hint: "Optional lead image rendered above the title. 16:9 aspect ratio recommended.",
        section: "Content",
        sortOrder: 300,
      },
    },
    {
      name: "Created",
      shape: "text",
      // Seeded so the Meta section visibly does something out of the
      // box — without a default the byline renders nothing on a fresh
      // datasource and the section reads as vestigial in the editor.
      default: "March 15, 2026",
      sitecore: {
        type: "single-line-text",
        hint: "Publication date display string. Free text so authors can include relative phrasing like 'Today' or '2 hours ago' — the component prepends a 'Published' label automatically.",
        section: "Meta",
        sortOrder: 100,
      },
    },
    {
      name: "Updated",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Optional last-updated date string. Component prepends an 'Updated' label automatically and only renders the row when this field is non-empty.",
        section: "Meta",
        sortOrder: 110,
      },
    },
    {
      name: "Authors",
      shape: "reference",
      multiple: true,
      // Deliberately NO default — an empty reference renders no byline
      // (the component hides the authors row entirely), so fresh
      // datasources don't ship a phantom author.
      sitecore: {
        type: "treelist",
        hint: "Linked Author items (author@1). Renders as an avatar + name byline; supports multiple authors for co-authored pieces. Entries that reference an author PAGE link the byline to it. Treelist source filters to Author items.",
        section: "Meta",
        sortOrder: 200,
        source: { kind: "filter", types: ["author@1"] },
      },
    },
  ],

  params: [
    // Shared section-shell vocabulary. Mirrors accordion-block + form-builder.
    {
      name: "UseSectionWrapper",
      shape: "boolean",
      default: "true",
      sitecore: {
        type: "checkbox",
        hint: "Constrain the content to a prose-width column. Uncheck for full-width article headers.",
        section: "Layout",
        sortOrder: 100,
      },
    },
    {
      name: "Alignment",
      shape: "enum",
      default: "start",
      sitecore: {
        enumHandle: "alignment@1",
        hint: "Inline-axis alignment of the eyebrow, title, subtitle, and byline. `start` (default) is the editorial layout; `center` mirrors the old Centered variant.",
        section: "Layout",
        sortOrder: 110,
      },
    },
    {
      name: "ImagePosition",
      shape: "enum",
      default: "above",
      sitecore: {
        enumHandle: "image-position@1",
        hint: "Where the lead image renders. `above` (default) sits the image above the title (editorial conventional). `below` puts copy first then image — matches the Hero Editorial / Centered shape. `hidden` suppresses the image even when populated.",
        section: "Layout",
        sortOrder: 120,
      },
    },
    // HeadingLayout was removed — article-header now renders its own H1
    // directly (the page title is the page H1, semantically). The
    // accent-line / separator chrome that HeadingLayout used to drive
    // is reachable via `ShowSeparator` (the explicit horizontal rule
    // under the heading region) and the `Alignment` param.
    {
      name: "HeadingAnimation",
      shape: "enum",
      default: "none",
      sitecore: {
        enumHandle: "heading-animation@1",
        hint: "Heading entrance animation.",
        section: "Layout",
        sortOrder: 130,
      },
    },
    {
      name: "HeadingSize",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "heading-size@1",
        hint: "Heading size token.",
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
        hint: "Background tone + foreground text color. Aligned to the shared color-scheme set — picking `primary` paints the header in the brand color with inverted text, `none` (default) leaves the surface on the page background.",
        section: "Layout",
        sortOrder: 150,
      },
    },
    ...DETAILS_ARTICLE_HEADER_ADDITIONS,
    {
      name: "EyebrowColorScheme",
      shape: "enum",
      default: "none",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Brand color of the eyebrow above the title. `none` inherits the surface foreground (dimmed); any other value tints the eyebrow with that role color. When `EyebrowStyle = badge`, drives both the badge fill and label.",
        section: "Layout",
        sortOrder: 160,
      },
    },
    {
      name: "EyebrowStyle",
      shape: "enum",
      default: "text",
      sitecore: {
        enumHandle: "eyebrow-style@1",
        hint: "Visual treatment for the eyebrow. `text` (default) is small uppercase prose; `badge` is a pill-shaped chip tinted by EyebrowColorScheme.",
        section: "Layout",
        sortOrder: 170,
      },
    },
    {
      name: "ShowSeparator",
      shape: "boolean",
      default: "false",
      sitecore: {
        type: "checkbox",
        hint: "Render a horizontal rule between the heading region and the byline / meta row.",
        section: "Layout",
        sortOrder: 180,
      },
    },
    {
      name: "AuthorStyle",
      shape: "enum",
      default: "avatar-and-name",
      sitecore: {
        enumHandle: "author-style@1",
        hint: "How linked Authors render in the byline: name-only, avatar + name, or avatar-only.",
        section: "Layout",
        sortOrder: 190,
      },
    },
    // Personalization / analytics axis. Mirrors form-builder.
    {
      name: "InstanceKey",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Stable author-friendly handle for analytics. Defaults to the rendering id when blank.",
        section: "Analytics",
        sortOrder: 100,
      },
    },
    {
      name: "InstanceScope",
      shape: "enum",
      default: "site",
      sitecore: {
        enumHandle: "instance-scope@1",
        hint: "Whether this instance is reused site-wide or unique per page. Drives personalization partition keys.",
        section: "Analytics",
        sortOrder: 200,
      },
    },
    {
      name: "TrackEvents",
      shape: "boolean",
      default: "false",
      sitecore: {
        type: "checkbox",
        hint: "Emit a CDP `view` event when the header becomes ≥50% visible. Off by default — article headers have no CTAs, so most installs don't need an impression event.",
        section: "Analytics",
        sortOrder: 300,
      },
    },
  ],

  // Permissive `article-header-content-{*}` placeholder for
  // embellishments below the byline / logo strip — supporting blocks,
  // related-link strips, key-takeaway grids, etc. Mirrors Promo's
  // `promo-content-{*}` slot.
  dynamicPlaceholders: true,
  placeholders: [{ key: "article-header-content-{*}" }],

  // Two variants:
  //   Default       — source-driven (title / subtitle / byline / etc).
  //   Placeholders  — source-driven heading PLUS an
  //                   `article-header-content-{*}` slot for arbitrary
  //                   embellishments (related-link strips, key takeaways,
  //                   downloads). Source-driven Default doesn't paint
  //                   the slot — picking Placeholders is the opt-in.
  variants: [{ name: "Default" }, { name: "Placeholders" }],

  events: [
    {
      name: "view",
      type: "article-header.viewed",
      description:
        "Fires once when the article header becomes ≥ 50% visible. Routed through SDK pageView(). Article topic / category affinity tags ride on the meta payload (emitsAffinity follow-up wires datasource-tags → ext keys).",
      action: "view",
      commitment: "browse",
      emitsIdentity: false,
      emitsAffinity: false,
      cdpEventType: "VIEW",
    },
  ],

  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Article Headers" },
      { scope: "site", subfolder: "Article Headers" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default articleHeaderRecipe;
