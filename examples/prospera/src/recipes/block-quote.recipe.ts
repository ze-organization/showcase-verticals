import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for the `BlockQuote` component (./block-quote.tsx).
 *
 * Three fields (Quote, Attribution, Source), one Default variant, one
 * param (AccentColor → color-scheme@1) driving the inline-start accent
 * border.
 */
export const blockQuoteRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "block-quote@1",
  icon: componentIcons["block-quote@1"],
  name: "block-quote",
  displayName: "Block Quote",
  description:
    "Editorial pull quote: large quotation text over an inline-start accent border (color authorable via AccentColor), with a muted attribution + role/source line below. Use for testimonial pull quotes inside articles, press quotes, executive statements, and editorial callouts. For testimonial card grids use the reviews family; for general prose use `content-block`.",

  section: { handle: "ui-section@1" },

  fields: [
    {
      name: "Quote",
      shape: "text",
      // Standard Values seed for auto-created datasources.
      default: {
        en: "Design systems turn a thousand small decisions into one good one.",
        ar: "أنظمة التصميم تحوّل ألف قرار صغير إلى قرار واحد جيد.",
        es: "Los sistemas de diseño convierten mil pequeñas decisiones en una sola buena.",
        fr: "Les design systems transforment mille petites décisions en une seule bonne.",
        de: "Designsysteme machen aus tausend kleinen Entscheidungen eine gute.",
        da: "Designsystemer forvandler tusind små beslutninger til én god.",
        ja: "デザインシステムは、千の小さな決定をひとつの優れた決定に変えます。",
        "zh-CN": "设计系统把一千个小决定变成一个好决定。",
        "zh-TW": "設計系統把一千個小決定變成一個好決定。",
        it: "I design system trasformano mille piccole decisioni in una sola buona.",
      },
      sitecore: {
        type: "multi-line-text",
        required: true,
        hint: "The quotation. Line breaks are preserved.",
        sortOrder: 100,
      },
    },
    {
      name: "Attribution",
      shape: "text",
      default: {
        en: "Jordan Ellis",
        ar: "جوردان إيليس",
        es: "Jordan Ellis",
        fr: "Jordan Ellis",
        de: "Jordan Ellis",
        da: "Jordan Ellis",
        ja: "ジョーダン・エリス",
        "zh-CN": "乔丹·埃利斯",
        "zh-TW": "喬丹·埃利斯",
        it: "Jordan Ellis",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Who said it. Rendered below the quote.",
        sortOrder: 200,
      },
    },
    {
      name: "Source",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Optional role or source line (e.g. 'VP of Design, Contoso' or a publication name).",
        sortOrder: 300,
      },
    },
  ],

  variants: [{ name: "Default" }],

  params: [
    {
      name: "AccentColor",
      shape: "enum",
      default: "accent",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Color of the inline-start accent border. Defaults to the brand accent.",
        sortOrder: 100,
      },
    },
  ],

  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Quotes" },
      { scope: "site", subfolder: "Site Shared UI/Quotes" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default blockQuoteRecipe;
