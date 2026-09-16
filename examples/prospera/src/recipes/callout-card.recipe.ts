import type { ComponentTemplateRecipe } from "../lib/registry/sitecore-recipes";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for the `CalloutCard` component (./callout-card.tsx).
 *
 * Contained card-shape callout panel with title, description, and a
 * single CTA. Distinct from the full-bleed `banner@1` family —
 * callout-cards sit inline within content, enclosed in a rounded
 * card surface, used to draw attention to a single editorial offer
 * or guidance (e.g. "Did you know — claims free up to $500?").
 *
 * Single `Default` variant; visual differentiation rides on rendering
 * parameters. The card chrome axes (CardStyle / ColorScheme /
 * BackgroundIntensity / Elevation) align 1:1 with the regular UI Card
 * (`card-block@1`) so authors meet the same controls on both.
 *
 * Fields organised into Sitecore sections (Content / Action). Params
 * organised into Analytics. Standard values seeded so the editor
 * surface shows meaningful copy out of the box.
 */
export const calloutCardRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "callout-card@1",
  icon: componentIcons["callout-card@1"],
  name: "callout-card",
  displayName: "Callout Card",
  description:
    "Contained card-shape callout with title, description, and a single CTA. Use for inline editorial attention pieces.",

  section: { handle: "heros-and-promos-section@1" },

  fields: [
    {
      name: "Title",
      shape: "text",
      default: {
        en: "Did you know?",
        ar: "هل تعلم؟",
        es: "¿Sabías que...?",
        fr: "Le saviez-vous ?",
        de: "Wussten Sie schon?",
        da: "Vidste du?",
        ja: "ご存じですか？",
        "zh-CN": "你知道吗？",
        "zh-TW": "你知道嗎？",
        it: "Lo sapevi?",
      },
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "Callout headline.",
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "Description",
      shape: "richText",
      default: {
        en: "<p>A short, focused note that pulls a single fact or offer out of the surrounding article.</p>",
        ar: "<p>ملاحظة قصيرة ومركّزة تُبرز حقيقة واحدة أو عرضًا من المقال المحيط.</p>",
        es: "<p>Una nota breve y concreta que destaca un dato u oferta del artículo que la rodea.</p>",
        fr: "<p>Une note courte et ciblée qui met en avant un fait ou une offre tiré de l'article.</p>",
        de: "<p>Ein kurzer, prägnanter Hinweis, der eine einzelne Aussage oder ein Angebot aus dem Artikel hervorhebt.</p>",
        da: "<p>En kort, fokuseret note, der fremhæver et enkelt faktum eller tilbud fra artiklen.</p>",
        ja: "<p>記事の中から一つの事実やお得な情報を切り出した、短く的を絞ったメモです。</p>",
        "zh-CN":
          "<p>一段简短聚焦的说明，从周边文章中提炼出单个要点或优惠。</p>",
        "zh-TW":
          "<p>一段簡短聚焦的說明，從周邊文章中提煉出單個要點或優惠。</p>",
        it: "<p>Una nota breve e mirata che evidenzia un singolo dato o un'offerta tratti dall'articolo.</p>",
      },
      sitecore: {
        type: "rich-text",
        hint: "Supporting copy under the title.",
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
        hint: "Optional background image for the callout panel.",
        section: "Content",
        sortOrder: 300,
      },
    },
    {
      name: "Link",
      shape: "link",
      sitecore: {
        type: "general-link",
        hint: "Primary CTA. Tracked as `callout-card.primary-cta-clicked`.",
        section: "Action",
        sortOrder: 100,
      },
    },
  ],

  params: [
    {
      // Same enum as the regular UI Card's Style param. `filled` is the
      // concrete default — the callout has always painted the scheme's
      // soft tint, which IS the filled treatment.
      name: "CardStyle",
      shape: "enum",
      default: "filled",
      sitecore: {
        enumHandle: "card-style@1",
        hint: "Card surface style, same axis as the regular Card: `filled` paints the ColorScheme tint (default, the historical look), `flat` is a transparent surface with a scheme-tinted title, `outline` draws a scheme-colored border with a tinted title.",
        section: "Layout",
        sortOrder: 100,
      },
    },
    {
      name: "ColorScheme",
      shape: "enum",
      default: "primary",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Brand tone for the card, applied per CardStyle exactly like the regular Card (filled = surface tint, flat = title tint, outline = border + title tint) — plus the top accent band and the primary CTA button. Image background overrides the surface fill.",
        section: "Layout",
        sortOrder: 110,
      },
    },
    {
      // Composes with ColorScheme the same way section-wrapper's
      // BackgroundColor axis does. Only meaningful on the filled style.
      name: "BackgroundIntensity",
      shape: "enum",
      default: "subtle",
      sitecore: {
        enumHandle: "background-intensity@1",
        hint: "How saturated the filled surface is: `subtle` (default) keeps the soft tint; `bold` fills with the pure brand color and inverts the text. No effect on flat / outline styles or when a background image is set.",
        section: "Layout",
        sortOrder: 115,
      },
    },
    {
      name: "ShowBand",
      shape: "boolean",
      default: "true",
      sitecore: {
        type: "checkbox",
        hint: "Render the slim accent band along the top edge of the card. Inherits the ColorScheme.",
        section: "Layout",
        sortOrder: 120,
      },
    },
    {
      name: "HeaderStyle",
      shape: "enum",
      default: "start",
      sitecore: {
        enumHandle: "callout-header-style@1",
        hint: "Title treatment: start-aligned, centered, or centered with an accent bar above.",
        section: "Layout",
        sortOrder: 130,
      },
    },
    {
      // `large` is the concrete default — the callout headline has
      // always rendered a step above the house section-heading default
      // (2xl → 3xl → 4xl across breakpoints), which maps to `large` in
      // the shared heading-size@1 vocabulary.
      name: "HeadingSize",
      shape: "enum",
      default: "large",
      sitecore: {
        enumHandle: "heading-size@1",
        hint: "Typographic scale for the title. `large` (default) is the callout's historical headline size; `small`/`default` calm it down for inline notes, `xl`/`text-banner` push it toward a statement piece.",
        section: "Layout",
        sortOrder: 135,
      },
    },
    {
      name: "Elevation",
      shape: "enum",
      default: "theme",
      sitecore: {
        enumHandle: "card-elevation@1",
        hint: "Card shadow depth, same axis as the regular Card. `theme` (default) defers to the active theme's `--card-shadow` token; `none` removes the shadow; xs–lg force an explicit scale.",
        section: "Layout",
        sortOrder: 140,
      },
    },
    {
      name: "ButtonVariant",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "button-variant@1",
        hint: "Visual style of the primary CTA (filled, outline, ghost, link).",
        section: "Action",
        sortOrder: 100,
      },
    },
    {
      name: "ButtonSize",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "size@1",
        hint: "Size of the primary CTA. Uses the shared size scale (Small / Default / Large).",
        section: "Action",
        sortOrder: 200,
      },
    },
    {
      name: "ShowArrow",
      shape: "boolean",
      default: "false",
      sitecore: {
        type: "checkbox",
        hint: "Append a trailing arrow (→) after the primary CTA label.",
        section: "Action",
        sortOrder: 250,
      },
    },
    {
      name: "ButtonAlignment",
      shape: "enum",
      default: "start",
      sitecore: {
        enumHandle: "alignment@1",
        hint: "Inline-axis alignment of the primary CTA within the card.",
        section: "Action",
        sortOrder: 300,
      },
    },
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
      default: "page",
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
        hint: "Emit CDP events for view + CTA click. Off by default.",
        section: "Analytics",
        sortOrder: 300,
      },
    },
  ],

  variants: [{ name: "Default" }],

  // CTA-click events deferred until the anchor data-cdp-* tagging
  // pass — semantic CTA distinction rides on those attrs.
  events: [
    {
      name: "view",
      type: "callout-card.viewed",
      description:
        "Fires once when the callout becomes ≥ 50% visible. Routed through SDK pageView().",
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
      { scope: "page", subfolder: "Callouts" },
      { scope: "site", subfolder: "Callouts" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default calloutCardRecipe;
