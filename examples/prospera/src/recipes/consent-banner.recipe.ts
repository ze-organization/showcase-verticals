// Registry-local recipe type — scai's ComponentTemplateRecipe extended
// with the `events` block (CDP analytics catalog).
import type { ComponentTemplateRecipe } from "../lib/registry/sitecore-recipes";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for `ConsentBanner` — cookie-consent / age-gate / privacy-
 * notice surface. Three rendering variants sharing one content shape:
 *
 *   - `BottomBar`  full-width strip pinned to the bottom edge — the
 *                  most common low-friction cookie pattern.
 *   - `Modal`      centered dialog over a dimming scrim — blocking
 *                  cookie consent / age verification.
 *   - `SidePanel`  inline-end side sheet with a prominent brand-mark
 *                  slot — the branded age-consent treatment.
 *   - `GdprBottomBar` full-width bar with per-cookie-category toggles
 *                  (Necessary locked on / Preferences / Statistics /
 *                  Marketing), a details disclosure, and allow all /
 *                  allow selected / necessary only buttons.
 *   - `GdprModal`  centered dialog with Consent / Details / About tab
 *                  views — category toggle strip, expandable per-
 *                  category rows with count badges, authored About body.
 *
 * Presentational-first: Accept / Decline hide the banner locally in the
 * browser — no cookie is written and no consent-management platform is
 * wired up. Wire a real CMP via the component's onAccept / onDecline
 * callbacks.
 *
 * No placeholders — consent banners are leaf content.
 */
export const consentBannerRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "consent-banner@1",
  icon: componentIcons["consent-banner@1"],
  name: "consent-banner",
  displayName: "Consent Banner",
  description:
    "Cookie-consent / age-gate / privacy-notice banner with title, supporting text, accept + optional decline buttons, optional policy link, and an optional brand mark. Variants: BottomBar (fixed bottom strip — common cookie bar), Modal (centered dialog over a scrim — blocking consent or age check), SidePanel (side sheet with prominent logo — branded age gate), GdprBottomBar (full-width bar with per-cookie-category toggles — Necessary locked on, Preferences/Statistics/Marketing default off — plus a details disclosure and allow all / allow selected / necessary only buttons), GdprModal (centered dialog with Consent / Details / About tab views, per-category toggle strip, expandable category rows with cookie-count badges, and an authored About body). Presentational: accept/decline hide the banner locally; no cookies or CMP wiring.",

  section: { handle: "feedback-section@1" },

  fields: [
    {
      name: "Title",
      shape: "text",
      // Compiled into the template's `__Standard Values` so auto-created
      // datasources arrive pre-filled — authors override per-item.
      default: {
        en: "We value your privacy",
        ar: "نحن نقدّر خصوصيتك",
        es: "Valoramos tu privacidad",
        fr: "Nous respectons votre vie privée",
        de: "Wir schätzen Ihre Privatsphäre",
        da: "Vi værdsætter dit privatliv",
        ja: "プライバシーを大切にしています",
        "zh-CN": "我们重视您的隐私",
        "zh-TW": "我們重視您的隱私",
        it: "Teniamo alla tua privacy",
      },
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: 'The consent headline — e.g. "We value your privacy" or "Are you of legal drinking age?". Required.',
        sortOrder: 100,
      },
    },
    {
      name: "Text",
      shape: "richText",
      // Standard Values seed for auto-created datasources. HTML because
      // rich-text fields store HTML.
      default: {
        en: "<p>We use cookies to improve your experience and analyze traffic. Choose whether to accept.</p>",
        ar: "<p>نستخدم ملفات تعريف الارتباط لتحسين تجربتك وتحليل حركة الزيارات. اختر ما إذا كنت توافق.</p>",
        es: "<p>Usamos cookies para mejorar tu experiencia y analizar el tráfico. Elige si deseas aceptarlas.</p>",
        fr: "<p>Nous utilisons des cookies pour améliorer votre expérience et analyser le trafic. Choisissez de les accepter ou non.</p>",
        de: "<p>Wir verwenden Cookies, um Ihr Erlebnis zu verbessern und den Datenverkehr zu analysieren. Entscheiden Sie, ob Sie zustimmen.</p>",
        da: "<p>Vi bruger cookies til at forbedre din oplevelse og analysere trafikken. Vælg, om du vil acceptere.</p>",
        ja: "<p>体験の向上とトラフィック分析のためにクッキーを使用しています。同意するかどうかをお選びください。</p>",
        "zh-CN":
          "<p>我们使用 Cookie 来改善您的体验并分析流量。请选择是否接受。</p>",
        "zh-TW":
          "<p>我們使用 Cookie 來改善您的體驗並分析流量。請選擇是否接受。</p>",
        it: "<p>Utilizziamo i cookie per migliorare la tua esperienza e analizzare il traffico. Scegli se accettare.</p>",
      },
      sitecore: {
        type: "rich-text",
        hint: "Supporting copy explaining what is being consented to.",
        sortOrder: 200,
      },
    },
    {
      name: "AcceptLabel",
      shape: "text",
      default: {
        en: "Accept all",
        ar: "قبول الكل",
        es: "Aceptar todo",
        fr: "Tout accepter",
        de: "Alle akzeptieren",
        da: "Accepter alle",
        ja: "すべて同意する",
        "zh-CN": "全部接受",
        "zh-TW": "全部接受",
        it: "Accetta tutto",
      },
      sitecore: {
        type: "single-line-text",
        hint: 'Label for the affirmative button. For age gates use e.g. "Yes, I am". Clearing it hides the button.',
        sortOrder: 300,
      },
    },
    {
      name: "DeclineLabel",
      shape: "text",
      default: {
        en: "Decline",
        ar: "رفض",
        es: "Rechazar",
        fr: "Refuser",
        de: "Ablehnen",
        da: "Afvis",
        ja: "拒否する",
        "zh-CN": "拒绝",
        "zh-TW": "拒絕",
        it: "Rifiuta",
      },
      sitecore: {
        type: "single-line-text",
        hint: 'Label for the negative button — "Decline", "No". Optional: clear it for a single-button notice.',
        sortOrder: 400,
      },
    },
    {
      name: "PolicyLink",
      shape: "link",
      // The URL half is `/` on purpose — scai encodes a `#` URL as
      // linktype="anchor" WITHOUT the `anchor` attribute the Layout
      // Service builds hrefs from, so the SV arrived as href:"" and the
      // link rendered blank (see cta-button.recipe.ts diagnosis).
      default: "Privacy policy|/",
      sitecore: {
        type: "general-link",
        hint: "Optional link to the privacy / cookie policy, rendered as an underlined text link.",
        sortOrder: 500,
      },
    },
    {
      name: "Image",
      shape: "image",
      sitecore: {
        type: "image",
        hint: "Optional logo / brand mark. Rendered prominently in the SidePanel variant (branded age gates), smaller in Modal and BottomBar.",
        sortOrder: 600,
      },
    },

    // -- GDPR category fields (GdprBottomBar / GdprModal only) --------------
    // All optional. The base variants ignore them; the GDPR variants
    // fall back to generic English copy when a field is empty, so older
    // datasources keep working. Counts drive the per-category cookie
    // badges and hide when absent.
    {
      name: "NecessaryLabel",
      shape: "text",
      default: "Necessary",
      sitecore: {
        type: "single-line-text",
        hint: "GDPR variants: label for the always-on strictly-necessary category. Falls back to 'Necessary'.",
        section: "GDPR",
        sortOrder: 700,
      },
    },
    {
      name: "NecessaryDescription",
      shape: "text",
      default:
        "Necessary cookies keep the website usable — page navigation, secure areas, and remembering your consent choice. The website cannot function properly without them.",
      sitecore: {
        type: "multi-line-text",
        hint: "GDPR variants: what strictly-necessary cookies do. Shown in the expandable Details row.",
        section: "GDPR",
        sortOrder: 710,
      },
    },
    {
      name: "NecessaryCount",
      shape: "integer",
      sitecore: {
        type: "integer",
        hint: "GDPR variants: cookie count for the Necessary category badge. Leave blank to hide the badge.",
        section: "GDPR",
        sortOrder: 720,
      },
    },
    {
      name: "PreferencesLabel",
      shape: "text",
      default: "Preferences",
      sitecore: {
        type: "single-line-text",
        hint: "GDPR variants: label for the preferences category. Falls back to 'Preferences'.",
        section: "GDPR",
        sortOrder: 730,
      },
    },
    {
      name: "PreferencesDescription",
      shape: "text",
      default:
        "Preference cookies let the website remember choices that change how it behaves or looks, like your preferred language or the region you are in.",
      sitecore: {
        type: "multi-line-text",
        hint: "GDPR variants: what preference cookies do. Shown in the expandable Details row.",
        section: "GDPR",
        sortOrder: 740,
      },
    },
    {
      name: "PreferencesCount",
      shape: "integer",
      sitecore: {
        type: "integer",
        hint: "GDPR variants: cookie count for the Preferences category badge. Leave blank to hide the badge.",
        section: "GDPR",
        sortOrder: 750,
      },
    },
    {
      name: "StatisticsLabel",
      shape: "text",
      default: "Statistics",
      sitecore: {
        type: "single-line-text",
        hint: "GDPR variants: label for the statistics/analytics category. Falls back to 'Statistics'.",
        section: "GDPR",
        sortOrder: 760,
      },
    },
    {
      name: "StatisticsDescription",
      shape: "text",
      default:
        "Statistics cookies help us understand how visitors interact with the website by collecting and reporting information anonymously.",
      sitecore: {
        type: "multi-line-text",
        hint: "GDPR variants: what statistics cookies do. Shown in the expandable Details row.",
        section: "GDPR",
        sortOrder: 770,
      },
    },
    {
      name: "StatisticsCount",
      shape: "integer",
      sitecore: {
        type: "integer",
        hint: "GDPR variants: cookie count for the Statistics category badge. Leave blank to hide the badge.",
        section: "GDPR",
        sortOrder: 780,
      },
    },
    {
      name: "MarketingLabel",
      shape: "text",
      default: "Marketing",
      sitecore: {
        type: "single-line-text",
        hint: "GDPR variants: label for the marketing/advertising category. Falls back to 'Marketing'.",
        section: "GDPR",
        sortOrder: 790,
      },
    },
    {
      name: "MarketingDescription",
      shape: "text",
      default:
        "Marketing cookies are used to track visitors across websites so we can display content that is relevant and engaging.",
      sitecore: {
        type: "multi-line-text",
        hint: "GDPR variants: what marketing cookies do. Shown in the expandable Details row.",
        section: "GDPR",
        sortOrder: 800,
      },
    },
    {
      name: "MarketingCount",
      shape: "integer",
      sitecore: {
        type: "integer",
        hint: "GDPR variants: cookie count for the Marketing category badge. Leave blank to hide the badge.",
        section: "GDPR",
        sortOrder: 810,
      },
    },
    {
      name: "UnclassifiedLabel",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "GDPR variants: optional 'Unclassified' row label. The row renders greyed-out with a disabled toggle, and only when this or its description has content.",
        section: "GDPR",
        sortOrder: 820,
      },
    },
    {
      name: "UnclassifiedDescription",
      shape: "text",
      sitecore: {
        type: "multi-line-text",
        hint: "GDPR variants: what unclassified cookies are. Row hidden when both Unclassified fields are empty.",
        section: "GDPR",
        sortOrder: 830,
      },
    },
    {
      name: "UnclassifiedCount",
      shape: "integer",
      sitecore: {
        type: "integer",
        hint: "GDPR variants: cookie count for the Unclassified badge. Leave blank to hide the badge.",
        section: "GDPR",
        sortOrder: 840,
      },
    },
    {
      name: "AllowAllLabel",
      shape: "text",
      default: "Allow all cookies",
      sitecore: {
        type: "single-line-text",
        hint: "GDPR variants: label for the grant-everything button. Falls back to 'Allow all cookies'.",
        section: "GDPR",
        sortOrder: 850,
      },
    },
    {
      name: "AllowSelectedLabel",
      shape: "text",
      default: "Allow selected",
      sitecore: {
        type: "single-line-text",
        hint: "GDPR variants: label for the grant-current-toggles button. Falls back to 'Allow selected'.",
        section: "GDPR",
        sortOrder: 860,
      },
    },
    {
      name: "NecessaryOnlyLabel",
      shape: "text",
      default: "Necessary only",
      sitecore: {
        type: "single-line-text",
        hint: "GDPR variants: label for the necessary-cookies-only button. Falls back to 'Necessary only'.",
        section: "GDPR",
        sortOrder: 870,
      },
    },
    {
      name: "ConsentLabel",
      shape: "text",
      default: "Consent",
      sitecore: {
        type: "single-line-text",
        hint: "GdprModal: label for the Consent tab. Falls back to 'Consent'.",
        section: "GDPR",
        sortOrder: 880,
      },
    },
    {
      name: "DetailsLabel",
      shape: "text",
      default: "Details",
      sitecore: {
        type: "single-line-text",
        hint: "GDPR variants: label for the GdprModal Details tab and the GdprBottomBar details disclosure link (e.g. 'Show details'). Falls back to 'Details'.",
        section: "GDPR",
        sortOrder: 890,
      },
    },
    {
      name: "AboutLabel",
      shape: "text",
      default: "About",
      sitecore: {
        type: "single-line-text",
        hint: "GdprModal: label for the About tab. Falls back to 'About'.",
        section: "GDPR",
        sortOrder: 900,
      },
    },
    {
      name: "AboutBody",
      shape: "richText",
      sitecore: {
        type: "rich-text",
        hint: "GdprModal: authored privacy/about copy for the About tab. Leave empty to omit the About tab entirely.",
        section: "GDPR",
        sortOrder: 910,
      },
    },
  ],

  variants: [
    { name: "BottomBar" },
    { name: "Modal" },
    { name: "SidePanel" },
    { name: "GdprBottomBar" },
    { name: "GdprModal" },
  ],

  params: [
    {
      name: "ColorScheme",
      shape: "enum",
      default: "none",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Background tone of the consent panel. `none` keeps the page's neutral surface.",
        sortOrder: 100,
      },
    },
    {
      // Defaults to the in-list `auto` member: the bar's natural width
      // is Tailwind's responsive `container` cap (consent-banner.tsx
      // BottomBarBody), which no concrete `max-width@1` token
      // reproduces — and is deliberately NOT `full` (`max-w-none` would
      // strip the container cap via tailwind-merge and widen the bar).
      // `auto` emits no `max-w-*` class, keeping the container cap.
      name: "MaxWidth",
      shape: "enum",
      default: "auto",
      sitecore: {
        enumHandle: "max-width@1",
        hint: "BottomBar only: width cap for the centered content row inside the full-width bar (same vocabulary as column-splitter) — `auto` keeps the standard container, `narrow`/`standard`/`wide` cap it tighter, `full` runs edge to edge. Modal and SidePanel size their own panels and ignore this.",
        sortOrder: 150,
      },
    },
    {
      name: "Overlay",
      shape: "boolean",
      default: "true",
      sitecore: {
        type: "checkbox",
        hint: "Paints a dimming scrim (60% black) over the whole page behind the panel and marks the dialog aria-modal — the blocking 'deal with this first' treatment. Modal and SidePanel only; BottomBar is non-blocking by design and never dims. Uncheck for a softer notice the visitor can ignore.",
        sortOrder: 200,
      },
    },
    {
      // Stable handle for personalization rules ("suppress the gate
      // after consent", "re-prompt decliners after 30 days"). When
      // blank, events carry the title text, then the datasource id.
      name: "InstanceKey",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Stable handle for personalization (e.g. 'cookie-notice-2026'). Lowercase kebab-case recommended. Leave blank to use the title, then the datasource id.",
        sortOrder: 700,
      },
    },
    {
      // Consent is almost always a site-wide record — one cookie
      // notice / age gate for the whole site — so `site` is the
      // default; `page` covers page-specific notices.
      name: "InstanceScope",
      shape: "enum",
      default: "site",
      sitecore: {
        enumHandle: "instance-scope@1",
        hint: "Scope of personalization history. Site = one shared consent record (the usual choice). Page = per-URL.",
        sortOrder: 800,
      },
    },
    {
      // Per-instance opt-out for the CDP accept/decline events.
      // Suppresses only the catalog path — the onAccept / onDecline
      // CMP hooks keep firing regardless.
      name: "TrackEvents",
      shape: "boolean",
      default: "true",
      sitecore: {
        type: "checkbox",
        hint: "Emit accept/decline CDP events for this placement. Uncheck to suppress entirely.",
        sortOrder: 900,
      },
    },
  ],

  events: [
    {
      name: "accept",
      type: "consent-banner.accepted",
      description:
        "Fires when the visitor clicks the affirmative button (accept cookies / confirm age).",
      // `action` comes from the closed 10-verb CdpEventAction set —
      // both consent outcomes are explicit submissions of a choice;
      // the `type` string carries the accepted/declined distinction.
      action: "submit",
      commitment: "engage",
      emitsIdentity: false,
      emitsAffinity: false,
      cdpEventType: "CUSTOM",
    },
    {
      name: "decline",
      type: "consent-banner.declined",
      description:
        "Fires when the visitor clicks the negative button (decline cookies / fail the age gate).",
      action: "submit",
      commitment: "engage",
      emitsIdentity: false,
      emitsAffinity: false,
      cdpEventType: "CUSTOM",
    },
  ],

  placedIn: ["headless-main-{*}"],

  /**
   * Consent banners are usually site-wide (one cookie notice / age gate
   * for the whole site), so the site-shared pool is first; the per-page
   * folder covers page-specific notices.
   */
  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "site", subfolder: "Site Shared Feedback/Consent" },
      { scope: "page", subfolder: "Consent" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default consentBannerRecipe;
