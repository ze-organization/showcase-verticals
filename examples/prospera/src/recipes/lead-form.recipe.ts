import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for `LeadForm` — a lead / quote capture form section:
 * headline, supporting copy, a curated stack of labelled input
 * placeholders (`Fields` Treelist of lead-form-field@1), a submit CTA,
 * and an optional small-print note.
 *
 * Presentational by design — the inputs are display-only and nothing
 * is submitted. For a working multi-step form use `form-builder@1`;
 * for email-only capture use `subscribe-section@1`.
 */
export const leadFormRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "lead-form@1",
  icon: componentIcons["lead-form@1"],
  name: "lead-form",
  displayName: "Lead Form",
  description:
    "Lead / quote capture form section: headline, supporting copy, 2-5 labelled input placeholders (text/email/tel/number/date/select/textarea), a prominent submit CTA, and an optional privacy note. Presentational — display-only inputs, no submission wiring. Use for insurance quote starters, mortgage rate checks, demo/consultation requests, signup teasers. Variants: Default (centered column, heading above the form panel), Split (headline + copy beside the form panel).",
  section: { handle: "forms-section@1" },
  fields: [
    {
      name: "Title",
      shape: "text",
      default: {
        en: "Get your free quote",
        ar: "احصل على عرض أسعار مجاني",
        es: "Obtén tu presupuesto gratis",
        fr: "Obtenez votre devis gratuit",
        de: "Holen Sie sich Ihr kostenloses Angebot",
        da: "Få dit gratis tilbud",
        ja: "無料見積もりを取得",
        "zh-CN": "获取免费报价",
        "zh-TW": "獲取免費報價",
        it: "Richiedi il tuo preventivo gratuito",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Headline above (Default) or beside (Split) the form.",
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
      name: "Fields",
      shape: "reference",
      multiple: true,
      sitecore: {
        type: "treelist",
        hint: "Curated input placeholders — pick lead-form-field entries in display order. 2-5 fields recommended.",
        source: { kind: "filter", types: ["lead-form-field@1"] },
        section: "Content",
        sortOrder: 300,
      },
    },
    {
      name: "SubmitLabel",
      shape: "text",
      default: {
        en: "Get my quote",
        ar: "احصل على عرض الأسعار",
        es: "Obtener mi presupuesto",
        fr: "Obtenir mon devis",
        de: "Angebot anfordern",
        da: "Få mit tilbud",
        ja: "見積もりを依頼",
        "zh-CN": "获取报价",
        "zh-TW": "獲取報價",
        it: "Richiedi preventivo",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Label for the submit CTA.",
        section: "Content",
        sortOrder: 400,
      },
    },
    {
      name: "Note",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Optional small print under the CTA (privacy / no-spam note).",
        section: "Content",
        sortOrder: 500,
      },
    },
  ],
  params: [
    {
      name: "ColorScheme",
      shape: "enum",
      default: "none",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Background tone of the section around the form.",
        section: "Style",
        sortOrder: 100,
      },
    },
    {
      name: "PanelStyle",
      shape: "enum",
      default: "card",
      sitecore: {
        enumHandle: "panel-style@1",
        hint: "Chrome around the form — `card` (bordered elevated panel, default) or `flat` (fields sit directly on the section surface).",
        section: "Style",
        sortOrder: 200,
      },
    },
    {
      // Defaults to the in-list `auto` member: the section's natural
      // padding is the responsive `py-12 md:py-16` (lead-form.tsx),
      // which no concrete `padding-y@1` token reproduces. `auto` maps to
      // that ramp; a concrete pick takes over.
      name: "PaddingY",
      shape: "enum",
      default: "auto",
      sitecore: {
        enumHandle: "padding-y@1",
        hint: "Vertical padding around the section. `auto` (default) keeps the standard band padding.",
        section: "Style",
        sortOrder: 300,
      },
    },
  ],
  variants: [
    { name: "Default" },
    { name: "Split" },
    // Compact inline quote bar that floats up over the bottom edge of
    // the section above (place directly after a hero@1) — pick when
    // the source shows a conversion/quote widget overlapping the hero
    // (insurance quote starters, in-hero capture panels).
    { name: "HeroEmbed" },
  ],
  placedIn: ["headless-main-{*}"],
  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Lead Forms" },
      { scope: "site", subfolder: "Lead Forms" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default leadFormRecipe;
