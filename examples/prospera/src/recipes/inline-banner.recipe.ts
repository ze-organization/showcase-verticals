import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for the `InlineBanner` component (./inline-banner.tsx).
 *
 * Alert-banner's contained look, inline-only: no Dismissible /
 * Position / Layout params, no CDP events. Three fields (Title,
 * Description, Link) and three params (ColorScheme, ShowIcon,
 * Composition).
 */
export const inlineBannerRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "inline-banner@1",
  icon: componentIcons["inline-banner@1"],
  name: "inline-banner",
  displayName: "Inline Banner",
  description:
    "Inline, non-dismissible notice panel with title, optional description, and optional CTA link on a tinted card-radius surface. Use inside page content for persistent contextual notes — beta warnings, prerequisite callouts, opening-hours notices, plan-limit hints. Compositions: stacked (title above description) or row (inline). For dismissible site-wide notices with analytics use `alert-banner`; for scrolling announcements use `tagline-banner`.",

  section: { handle: "ui-section@1" },

  fields: [
    {
      name: "Title",
      shape: "text",
      // Standard Values seed for auto-created datasources.
      default: {
        en: "Good to know",
        ar: "معلومة مفيدة",
        es: "Bueno saberlo",
        fr: "Bon à savoir",
        de: "Gut zu wissen",
        da: "Godt at vide",
        ja: "お知らせ",
        "zh-CN": "温馨提示",
        "zh-TW": "溫馨提示",
        it: "Da sapere",
      },
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "The notice headline. Required.",
        sortOrder: 100,
      },
    },
    {
      name: "Description",
      shape: "richText",
      default: {
        en: "<p>Add supporting copy that explains the notice.</p>",
        ar: "<p>أضف نصًا توضيحيًا يشرح الملاحظة.</p>",
        es: "<p>Añade un texto de apoyo que explique el aviso.</p>",
        fr: "<p>Ajoutez un texte explicatif pour la notice.</p>",
        de: "<p>Fügen Sie einen erläuternden Text zum Hinweis hinzu.</p>",
        da: "<p>Tilføj en uddybende tekst, der forklarer meddelelsen.</p>",
        ja: "<p>お知らせを説明する補足テキストを追加してください。</p>",
        "zh-CN": "<p>添加用于说明该提示的辅助文案。</p>",
        "zh-TW": "<p>新增用於說明該提示的輔助文案。</p>",
        it: "<p>Aggiungi un testo di supporto che spieghi l'avviso.</p>",
      },
      sitecore: {
        type: "rich-text",
        hint: "Optional supporting copy.",
        sortOrder: 200,
      },
    },
    {
      name: "Link",
      shape: "link",
      default: "Learn more|#",
      sitecore: {
        type: "general-link",
        hint: "Optional CTA link rendered as an outline button.",
        sortOrder: 300,
      },
    },
  ],

  variants: [{ name: "Default" }],

  params: [
    {
      name: "ColorScheme",
      shape: "enum",
      default: "info",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Color scheme. Info/success/warning/destructive get semantic icons; brand schemes use the brand color with a generic info icon.",
        sortOrder: 100,
      },
    },
    {
      name: "ShowIcon",
      shape: "boolean",
      default: "true",
      sitecore: {
        type: "checkbox",
        hint: "Show the leading icon on the title line. Icon comes from the color scheme.",
        sortOrder: 200,
      },
    },
    {
      // Reuses alert-composition@1. Only `stacked` and `row` apply to
      // the inline banner — the divider values belong to alert-banner's
      // slab treatment and degrade gracefully to `row` here.
      name: "Composition",
      shape: "enum",
      default: "stacked",
      sitecore: {
        enumHandle: "alert-composition@1",
        hint: "Title and description placement: stacked (default) or row. The divider values are alert-banner treatments and render as plain row here.",
        sortOrder: 300,
      },
    },
  ],

  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Banners" },
      { scope: "site", subfolder: "Site Shared Feedback/Banners" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default inlineBannerRecipe;
