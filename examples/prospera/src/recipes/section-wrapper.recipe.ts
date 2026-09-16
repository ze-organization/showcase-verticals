import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for the `SectionWrapper` component (./section-wrapper.tsx).
 *
 * Page-section shell: title + optional lead + content placeholder
 * + optional bottom region (button or subscribe form). One canonical
 * name per concept.
 *
 * The content placeholder is permissive — any rendering allowed.
 */
export const sectionWrapperRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "section-wrapper@1",
  icon: componentIcons["section-wrapper@1"],
  name: "section-wrapper",
  displayName: "Section Wrapper",
  description:
    "Page-section shell with heading, optional lead, content placeholder, and optional bottom region.",

  section: { handle: "layout-section@1" },

  fields: [
    {
      // Optional kicker line rendered above the heading through the
      // shared Eyebrow block — same field + params pattern as
      // content-block. Styled by EyebrowColorScheme / EyebrowSize /
      // EyebrowStyle.
      name: "Eyebrow",
      shape: "text",
      // Standard Values seed for auto-created datasources — authors
      // clear it when the section doesn't need a kicker.
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
      // Standard Values seed so a freshly dropped section visualises
      // immediately with a heading + lead pair authors swap for their
      // own copy. The Title is required so we must seed something —
      // an empty required field blocks publish at validate time.
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
        required: true,
        hint: "Section heading. Required.",
        sortOrder: 110,
      },
    },
    {
      name: "Lead",
      shape: "text",
      default: {
        en: "Short supporting copy that sets up the section.",
        ar: "نص داعم قصير يمهّد للقسم.",
        es: "Texto de apoyo breve que introduce la sección.",
        fr: "Court texte d'accompagnement qui présente la section.",
        de: "Kurzer Begleittext, der den Abschnitt einleitet.",
        da: "Kort supplerende tekst, der introducerer sektionen.",
        ja: "セクションを導く短い補足文。",
        "zh-CN": "用于引出该板块的简短说明文字。",
        "zh-TW": "用於引出該區塊的簡短說明文字。",
        it: "Breve testo di supporto che introduce la sezione.",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Optional subheading shown below the title.",
        sortOrder: 200,
      },
    },
    {
      name: "Link",
      shape: "link",
      default: "Learn more|#",
      sitecore: {
        type: "general-link",
        hint: 'CTA target when BottomContent="button".',
        sortOrder: 300,
      },
    },
    {
      // Moved from rendering params → datasource fields. Bottom
      // content type (none / button / subscribe) is an editorial
      // decision tied to the section's content, not a presentation
      // toggle — the same author who decides what goes in this
      // section's body also decides whether it carries a CTA. Living
      // on the datasource lets multiple placements of the same
      // section reuse the same bottom treatment without each
      // placement re-picking it.
      name: "BottomContent",
      shape: "enum",
      default: "none",
      sitecore: {
        enumHandle: "bottom-content@1",
        hint: 'What to show in the bottom region: "none", "button" (uses Link), or "subscribe".',
        sortOrder: 400,
      },
    },
    {
      name: "BottomAlignment",
      shape: "enum",
      default: "center",
      sitecore: {
        enumHandle: "bottom-alignment@1",
        hint: "Horizontal alignment of the bottom region.",
        sortOrder: 500,
      },
    },
    {
      name: "BackgroundImage",
      shape: "image",
      // Deliberately NO `role` and NO `default`: the section renders on
      // its BackgroundColor surface by default. A role would make the
      // installer's image-defaults map fill the slot on every install,
      // turning an opt-in photo backdrop into always-on imagery.
      sitecore: {
        type: "image",
        hint: "Optional full-bleed background image behind the heading + content. Painted with the BackgroundScrim treatment for legibility; visually overrides BackgroundColor when set.",
        sortOrder: 600,
      },
    },
  ],

  variants: [{ name: "Default" }],

  params: [
    {
      // Inner content-width toggle. `true` keeps the body inside a
      // prose-width centered column; `false` lets it fill the section
      // container's full width. Same boolean is surfaced (and piped
      // through to the SectionWrapper helper) by every wrapping
      // component that uses SectionWrapper internally.
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
      default: "center-with-accent",
      sitecore: {
        enumHandle: "heading-layout@1",
        hint: "Heading alignment (start / center) and treatment (plain, accent scribble, or full-width section divider).",
        sortOrder: 110,
      },
    },
    {
      // Eyebrow tint — drives the text color in the `text` treatment
      // and the pill's soft surface (`bg-<X>-background text-<X>`) in
      // the `badge` treatment. Same trio as content-block.
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
      // shared eyebrow-style@1 enum — its `text`/`badge` values are
      // the `eyebrow`/`pill` treatments (aliases accepted).
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
      // The single accent-decoration color: recolors the heading's
      // accent scribble (`*-with-accent` layouts) AND the
      // section-divider hairline (`*-with-section-divider` layouts).
      // `accent` (the default) pins the design system's accent color —
      // matching content-block.
      name: "AccentLineColor",
      shape: "enum",
      default: "accent",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Color of the accent line under the heading (and the section-divider rule). `accent` (default) uses the design system's accent color.",
        sortOrder: 150,
      },
    },
    {
      name: "HeadingAnimation",
      shape: "enum",
      default: "none",
      sitecore: {
        enumHandle: "heading-animation@1",
        hint: "Heading entrance animation.",
        sortOrder: 200,
      },
    },
    {
      name: "HeadingSize",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "heading-size@1",
        hint: "Heading size token.",
        sortOrder: 300,
      },
    },
    // (BottomContent + BottomAlignment moved to `fields` above —
    // they're editorial decisions tied to the section's content,
    // not presentation toggles, so they live with Title / Lead /
    // Link on the datasource.)
    // Shared section-shell vocabulary. Same enums as Container /
    // ColumnSplitter / RowSplitter so the four layout shells expose a
    // consistent author surface. BreakpointsBase is gone — the root is
    // its own `@container/section-wrapper`, so the layout always
    // reflows against its own width.
    {
      name: "Position",
      shape: "enum",
      default: "inline",
      sitecore: {
        enumHandle: "position@1",
        hint: "Inline in page flow, or pin to top / bottom (CSS `position: sticky`).",
        sortOrder: 600,
      },
    },
    {
      // `full` (no constraint) is the section's real default — it
      // fills its parent.
      name: "MaxWidth",
      shape: "enum",
      default: "full",
      sitecore: {
        enumHandle: "max-width@1",
        hint: "Semantic width cap for the section element itself. `full` (default) fills the parent.",
        sortOrder: 700,
      },
    },
    {
      // `start` is the section's real default when constrained; a
      // no-op when MaxWidth is `full`.
      name: "Alignment",
      shape: "enum",
      default: "start",
      sitecore: {
        enumHandle: "alignment@1",
        hint: "Horizontal placement of the constrained section. `start` (default); only meaningful when MaxWidth is not `full`.",
        sortOrder: 800,
      },
    },
    {
      // Surface fill — same axis + token mapping as Container's
      // BackgroundColor param. `none` is transparent so the
      // section adopts whatever's behind it. Authors pick a scheme
      // to drop a colored band behind the heading + placeholder.
      name: "BackgroundColor",
      shape: "enum",
      default: "none",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Surface fill behind the section heading + content placeholder. `none` is transparent. The other schemes apply the matching subdued background token.",
        sortOrder: 850,
      },
    },
    {
      // See container.recipe.ts — bold composes with the chosen
      // BackgroundColor (any scheme, via resolveSectionSurfaceClass).
      name: "BackgroundIntensity",
      shape: "enum",
      default: "subtle",
      sitecore: {
        enumHandle: "background-intensity@1",
        hint: "`subtle` keeps the soft -background tint (default). `bold` uses the pure scheme color (any scheme, incl. status colors) and inverts text inside the section.",
        sortOrder: 860,
      },
    },
    {
      // Shared section-background vocabulary — pairs with the
      // BackgroundImage datasource field.
      name: "BackgroundScrim",
      shape: "enum",
      default: "dark",
      sitecore: {
        enumHandle: "background-scrim@1",
        hint: "Scrim over the BackgroundImage. `dark` (default) dims the photo and flips the section text light; `light` washes it and keeps text dark; `none` leaves the image untreated. No effect without a BackgroundImage.",
        sortOrder: 870,
      },
    },
    {
      name: "BackgroundPosition",
      shape: "enum",
      default: "center",
      sitecore: {
        enumHandle: "background-position@1",
        hint: "Crop anchor of the BackgroundImage (`object-position`) — `center` / `top` / `bottom`. No effect without a BackgroundImage.",
        sortOrder: 880,
      },
    },
    {
      // Same `padding-y` axis as Container's PaddingY. Defaults to the
      // in-list `auto` member: the section's natural padding is the
      // responsive container-query ramp (`pt-10 → @[1024px]:pt-14`,
      // `pb-8 → @[1024px]:pb-10` — see section-wrapper.tsx), which no
      // concrete `padding-y@1` token reproduces. `auto` maps to that
      // ramp in code; an explicit concrete pick (incl. `none`) takes
      // over entirely.
      name: "PaddingY",
      shape: "enum",
      default: "auto",
      sitecore: {
        enumHandle: "padding-y@1",
        hint: "Vertical padding (`py-*`). `auto` (default) keeps the section's natural responsive padding; an explicit pick (incl. `none`) takes over entirely.",
        sortOrder: 900,
      },
    },
  ],

  dynamicPlaceholders: true,
  // Permissive: any rendering can drop into the content slot.
  placeholders: [{ key: "section-wrapper-content-{*}" }],

  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Sections" },
      { scope: "site", subfolder: "Site Shared Layout/Sections" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default sectionWrapperRecipe;
