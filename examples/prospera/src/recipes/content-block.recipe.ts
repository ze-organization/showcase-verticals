import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for the `ContentBlock` component (./content-block.tsx).
 *
 * Three fields (Eyebrow + Title + Body) and two variants:
 *   Default       — eyebrow + heading + rich-text body; the rendering
 *                   params (UseSectionWrapper, HeadingLayout, Prose*,
 *                   Eyebrow*, …) carry every layout choice.
 *   Placeholders  — the same content, then a permissive dynamic
 *                   placeholder (`content-block-{*}`) below it for
 *                   composing any rendering (UI components, images, …)
 *                   under the prose.
 */
export const contentBlockRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "content-block@1",
  icon: componentIcons["content-block@1"],
  name: "content-block",
  displayName: "Content Block",
  description:
    "Content block with optional eyebrow kicker, title, and rich-text body. Use for editorial copy sections, intro paragraphs, and long-form prose. Variants: Default (eyebrow + heading + body; heading layout/size/color, prose size/leading, and content width are rendering params) and Placeholders (the same content plus a permissive placeholder below it for composing other renderings — images, cards, code — under the prose).",

  section: { handle: "ui-section@1" },

  fields: [
    {
      // Optional kicker line rendered above the heading through the
      // shared Eyebrow block. Styled by the EyebrowColorScheme /
      // EyebrowSize / EyebrowStyle params.
      name: "Eyebrow",
      shape: "text",
      // Standard Values seed for auto-created datasources — authors
      // clear it when the block doesn't need a kicker.
      default: {
        en: "Overview",
        ar: "نظرة عامة",
        es: "Resumen",
        fr: "Aperçu",
        de: "Überblick",
        da: "Oversigt",
        ja: "概要",
        "zh-CN": "概览",
        "zh-TW": "概覽",
        it: "Panoramica",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Optional small uppercase kicker above the title (e.g. 'OVERVIEW', 'CASE STUDY'). Clear to hide.",
        sortOrder: 100,
      },
    },
    {
      name: "Title",
      shape: "text",
      // Standard Values seed for auto-created datasources.
      default: {
        en: "Section heading",
        ar: "عنوان القسم",
        es: "Encabezado de sección",
        fr: "En-tête de section",
        de: "Abschnittsüberschrift",
        da: "Sektionsoverskrift",
        ja: "セクション見出し",
        "zh-CN": "板块标题",
        "zh-TW": "區塊標題",
        it: "Intestazione della sezione",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Optional section title shown above the body.",
        sortOrder: 110,
      },
    },
    {
      name: "Body",
      shape: "richText",
      default: {
        en: "<p>Add your body copy here. Supports <strong>rich text</strong> formatting.</p>",
        ar: "<p>أضف نص المحتوى هنا. يدعم تنسيق <strong>النص المنسّق</strong>.</p>",
        es: "<p>Añade aquí el cuerpo del texto. Admite formato de <strong>texto enriquecido</strong>.</p>",
        fr: "<p>Ajoutez ici le corps du texte. Prend en charge la mise en forme <strong>en texte enrichi</strong>.</p>",
        de: "<p>Fügen Sie hier Ihren Fließtext ein. Unterstützt <strong>Rich-Text</strong>-Formatierung.</p>",
        da: "<p>Tilføj din brødtekst her. Understøtter <strong>rich text</strong>-formatering.</p>",
        ja: "<p>ここに本文を追加してください。<strong>リッチテキスト</strong>の書式に対応しています。</p>",
        "zh-CN": "<p>在此添加正文内容。支持<strong>富文本</strong>格式。</p>",
        "zh-TW": "<p>在此新增正文內容。支援<strong>富文本</strong>格式。</p>",
        it: "<p>Aggiungi qui il corpo del testo. Supporta la formattazione <strong>rich text</strong>.</p>",
      },
      sitecore: {
        hint: "The rich-text body content.",
        sortOrder: 200,
      },
    },
  ],

  // One content variant plus the placeholder shell — prose layout is a
  // rendering-param axis, not a variant axis.
  variants: [{ name: "Default" }, { name: "Placeholders" }],

  // Headless placeholder for the `Placeholders` variant. Permissive —
  // any rendering (the whole UI section AND image components) can drop
  // into the slot. The placeholder schema has no per-SECTION allow-list
  // (allowedRenderingHandles enumerates individual rendering handles),
  // and enumerating every ui-section handle would go stale, so the
  // slot stays unrestricted like card-block's / section-wrapper's.
  dynamicPlaceholders: true,
  placeholders: [{ key: "content-block-{*}" }],

  params: [
    {
      // Inner content-width toggle. `true` (default) constrains the
      // body to a prose-width centered column; `false` lets it fill
      // the section container's full width. Piped through to the
      // SectionWrapper helper — same boolean controls the same
      // behavior on accordion-block, tabs-block, and the standalone
      // section-wrapper recipe.
      name: "UseSectionWrapper",
      shape: "boolean",
      default: "true",
      sitecore: {
        type: "checkbox",
        hint: "Constrain the body to a prose-width column. Uncheck for full-width content.",
        sortOrder: 100,
      },
    },
    {
      name: "HeadingLayout",
      shape: "enum",
      default: "start",
      sitecore: {
        enumHandle: "heading-layout@1",
        hint: "Heading layout. `start` (default) is start-aligned plain; `*-with-accent` adds the brand scribble under the title; `*-with-section-divider` adds a full-width hairline rule under the heading block; `center*` values center the heading.",
        sortOrder: 110,
      },
    },
    {
      // Eyebrow tint — drives the text color in the `text` treatment
      // and the pill's soft surface (`bg-<X>-background text-<X>`) in
      // the `badge` treatment.
      name: "EyebrowColorScheme",
      shape: "enum",
      default: "primary",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Eyebrow tint. Colors the small-caps line, or the pill chip's soft surface when EyebrowStyle is badge.",
        sortOrder: 120,
      },
    },
    {
      name: "EyebrowSize",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "size@1",
        hint: "Eyebrow text size. `default` keeps the standard eyebrow scale.",
        sortOrder: 130,
      },
    },
    {
      // `text` = small uppercase prose line (the classic eyebrow);
      // `badge` = pill chip on the soft role surface. Reuses the
      // shared eyebrow-style@1 enum (article-header et al) — its
      // `text`/`badge` values are the `eyebrow`/`pill` treatments.
      name: "EyebrowStyle",
      shape: "enum",
      default: "text",
      sitecore: {
        enumHandle: "eyebrow-style@1",
        hint: "Eyebrow treatment: `text` (default, small-caps line) or `badge` (pill chip tinted by EyebrowColorScheme).",
        sortOrder: 140,
      },
    },
    {
      // Recolors the heading's accent scribble (`*-with-accent`
      // layouts) and the section-divider hairline
      // (`*-with-section-divider` layouts). `accent` pins the design
      // system's accent scribble color; the divider keeps its neutral
      // border unless a non-default role is picked.
      name: "AccentLineColor",
      shape: "enum",
      default: "accent",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Color of the accent line under the heading (and the section-divider rule). `default` inherits the surrounding decorative color chain.",
        sortOrder: 150,
      },
    },
    {
      name: "HeadingAnimation",
      shape: "enum",
      default: "none",
      sitecore: {
        enumHandle: "heading-animation@1",
        hint: "Heading entrance animation. Slide animations fire only on `centered` and `banner-end` layouts; on other layouts the heading renders without an entrance.",
        sortOrder: 200,
      },
    },
    {
      name: "HeadingSize",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "heading-size@1",
        hint: "Heading size.",
        sortOrder: 300,
      },
    },
    {
      // Semantic heading tag for the title slot. Independent of
      // HeadingSize — level controls document outline, size controls
      // the typographic scale.
      name: "HeadingLevel",
      shape: "enum",
      default: "h2",
      sitecore: {
        enumHandle: "heading-level@1",
        hint: "Semantic heading tag (h1–h4). Affects the document outline, not the visual size — pick HeadingSize for that.",
        sortOrder: 310,
      },
    },
    {
      // Heading text color. Compiles to `text-<role>` ("role text on
      // page" composition per the color-roles contract). `default`
      // inherits text-foreground.
      name: "HeadingColor",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "heading-color@1",
        hint: "Heading text color override. Default inherits the page foreground.",
        sortOrder: 320,
      },
    },
    {
      // Inline alignment for the heading + body within the contained
      // column. Logical (start/end), flips correctly under RTL.
      // Independent of HeadingLayout — that controls
      // accent-line/split/separator chrome; this controls where the
      // text sits on the inline axis.
      name: "ContentAlignment",
      shape: "enum",
      default: "start",
      sitecore: {
        enumHandle: "alignment@1",
        hint: "Inline alignment of the heading + body text. start / center / end.",
        sortOrder: 400,
      },
    },
    {
      // Line-height for the prose body. Independent of ProseSize —
      // leading is rhythm, size is scale.
      name: "ProseLeading",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "prose-leading@1",
        hint: "Body line-height. Default uses the Prose primitive's inherited leading.",
        sortOrder: 500,
      },
    },
    {
      // Body copy size override. Applied to the Prose container so
      // paragraphs, lists, and quotes inherit through the cascade.
      name: "ProseSize",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "prose-size@1",
        hint: "Body text size override. Default inherits the page size.",
        sortOrder: 510,
      },
    },
  ],

  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Content" },
      { scope: "site", subfolder: "Site Shared UI/Content" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default contentBlockRecipe;
