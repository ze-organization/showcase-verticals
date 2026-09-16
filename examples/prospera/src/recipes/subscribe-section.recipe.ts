import type { ComponentTemplateRecipe } from "../lib/registry/sitecore-recipes";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for the `SubscribeSection` component (./subscribe-section.tsx).
 *
 * The forms group's subscribe surface. Renders a heading + supporting
 * copy and a subscribe form (email + optional name + optional consent)
 * underneath via the shared `SectionWrapper` shell so it shares the
 * same vocabulary as Accordion Block / Form Builder.
 *
 * Variants: a single `Default`. The old `WithConsent` variant was
 * collapsed years ago into field-presence checks — the form renders
 * the Consent block when `ConsentText` carries copy, the Name input
 * when `NameLabel` carries copy.
 *
 * Per-field sections (`Name Field` / `Email Field` / `Consent` /
 * `Submission`) keep the Content Editor tidy when authors edit a
 * datasource. `ConsentRequired`, `SubmitAction`, and `SubmitMethod`
 * moved from rendering params to fields — they're editorial data
 * (does this consent block require a tick? where does this form
 * post?), not presentation toggles.
 */
export const subscribeSectionRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "subscribe-section@1",
  icon: componentIcons["subscribe-section@1"],
  name: "subscribe-section",
  displayName: "Subscribe Section",
  description:
    "Subscribe banner with title + email-capture form. Mirrors Accordion Block + Form Builder's section-shell vocabulary (UseSectionWrapper, heading layout, form scheme + intensity, submit button axis). Fires submit-error + consent-toggle CDP events; view + submit attempt/success are captured by Sitecore CDP's OOTB auto-capture (semantic dimensions ride on the form's data attributes when the cdpRole-per-field pass lands).",

  section: { handle: "forms-section@1" },

  fields: [
    {
      name: "Title",
      shape: "text",
      default: {
        en: "Subscribe to our newsletter",
        ar: "اشترك في نشرتنا الإخبارية",
        es: "Suscríbete a nuestro boletín",
        fr: "Abonnez-vous à notre newsletter",
        de: "Newsletter abonnieren",
        da: "Tilmeld dig vores nyhedsbrev",
        ja: "ニュースレターを購読する",
        "zh-CN": "订阅我们的新闻通讯",
        "zh-TW": "訂閱我們的電子報",
        it: "Iscriviti alla nostra newsletter",
      },
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "Banner heading.",
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "Description",
      shape: "richText",
      default: {
        en: "<p>Stay in the loop with the latest updates.</p>",
        ar: "<p>ابقَ على اطّلاع بآخر التحديثات.</p>",
        es: "<p>Mantente al día con las últimas novedades.</p>",
        fr: "<p>Restez informé des dernières actualités.</p>",
        de: "<p>Bleiben Sie mit den neuesten Updates auf dem Laufenden.</p>",
        da: "<p>Hold dig opdateret med de seneste nyheder.</p>",
        ja: "<p>最新情報をお見逃しなく。</p>",
        "zh-CN": "<p>及时了解最新动态。</p>",
        "zh-TW": "<p>及時掌握最新動態。</p>",
        it: "<p>Resta aggiornato sulle ultime novità.</p>",
      },
      sitecore: {
        type: "rich-text",
        hint: "Optional supporting copy below the title.",
        section: "Content",
        sortOrder: 200,
      },
    },
    // Generic chrome (submit button + status messages) ship with NO
    // Standard Value: left blank so the component resolves the localized
    // default from the `core-ui-labels@1` dictionary (`cta-subscribe` /
    // `form-subscribe-success` / `form-error`). A Standard Value would
    // pre-fill the field, so resolution would stop at the authored value
    // and never reach the dictionary. See
    // src/lib/registry/forms/form-chrome.ts.
    {
      name: "SubmitText",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Label for the submit button. Leave blank to use the localized default from the Core UI Labels dictionary.",
        section: "Content",
        sortOrder: 300,
      },
    },
    {
      name: "SuccessMessage",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Message announced via aria-live and shown after a successful submit. Leave blank to use the localized default from the Core UI Labels dictionary.",
        section: "Status",
        sortOrder: 100,
      },
    },
    {
      name: "ErrorMessage",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Message announced via aria-live and shown when the submit handler rejects. Leave blank to use the localized default from the Core UI Labels dictionary.",
        section: "Status",
        sortOrder: 200,
      },
    },

    // ─── Name field (only rendered when NameLabel carries copy) ─────
    {
      name: "NameLabel",
      shape: "text",
      default: {
        en: "Name",
        ar: "الاسم",
        es: "Nombre",
        fr: "Nom",
        de: "Name",
        da: "Navn",
        ja: "名前",
        "zh-CN": "姓名",
        "zh-TW": "姓名",
        it: "Nome",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Visible label above the name input. Leave blank to omit the name field entirely.",
        section: "Name Field",
        sortOrder: 100,
      },
    },
    {
      name: "NamePlaceholder",
      shape: "text",
      default: {
        en: "Your name",
        ar: "اسمك",
        es: "Tu nombre",
        fr: "Votre nom",
        de: "Ihr Name",
        da: "Dit navn",
        ja: "お名前",
        "zh-CN": "您的姓名",
        "zh-TW": "您的姓名",
        it: "Il tuo nome",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Greyed-out placeholder text inside the name input.",
        section: "Name Field",
        sortOrder: 200,
      },
    },
    {
      // Validation lives on the field. Aligns with the four form-field
      // recipes — `Required` is editorial data, not a presentation
      // toggle. Defaults to off; turning it on blocks submission until
      // the name field has a value.
      name: "NameRequired",
      shape: "boolean",
      default: "false",
      sitecore: {
        type: "checkbox",
        hint: "Block submission until the name field has a value. Only meaningful when the name field is rendered (NameLabel is non-empty).",
        section: "Name Field",
        sortOrder: 300,
      },
    },

    // ─── Email field ────────────────────────────────────────────────
    {
      name: "EmailLabel",
      shape: "text",
      // No Standard Value — localized via `core-ui-labels@1`
      // (`form-email-label`). See the Content-section chrome note above.
      sitecore: {
        type: "single-line-text",
        hint: "Visible label above the email input. Leave blank to use the localized default from the Core UI Labels dictionary.",
        section: "Email Field",
        sortOrder: 100,
      },
    },
    {
      name: "EmailPlaceholder",
      shape: "text",
      // No Standard Value — localized via `core-ui-labels@1`
      // (`form-email-placeholder`).
      sitecore: {
        type: "single-line-text",
        hint: "Greyed-out placeholder text inside the email input. Leave blank to use the localized default from the Core UI Labels dictionary.",
        section: "Email Field",
        sortOrder: 200,
      },
    },
    {
      name: "EmailRequired",
      shape: "boolean",
      // Email is the load-bearing piece of data here, so it defaults
      // to required (you can't really subscribe without an email).
      default: "true",
      sitecore: {
        type: "checkbox",
        hint: "Block submission until the email field has a value. Defaults to required — a subscribe form without an email isn't a subscribe form.",
        section: "Email Field",
        sortOrder: 300,
      },
    },

    // ─── Consent (only rendered when ConsentText carries copy) ──────
    {
      name: "ConsentText",
      shape: "richText",
      default: {
        en: "<p>I agree to receive emails and understand I can unsubscribe at any time.</p>",
        ar: "<p>أوافق على تلقّي رسائل البريد الإلكتروني وأدرك أنه يمكنني إلغاء الاشتراك في أي وقت.</p>",
        es: "<p>Acepto recibir correos electrónicos y entiendo que puedo cancelar la suscripción en cualquier momento.</p>",
        fr: "<p>J'accepte de recevoir des e-mails et je comprends que je peux me désabonner à tout moment.</p>",
        de: "<p>Ich stimme dem Erhalt von E-Mails zu und weiß, dass ich mich jederzeit abmelden kann.</p>",
        da: "<p>Jeg accepterer at modtage e-mails og forstår, at jeg til enhver tid kan afmelde mig.</p>",
        ja: "<p>メールの受信に同意し、いつでも配信を停止できることを理解しています。</p>",
        "zh-CN": "<p>我同意接收电子邮件，并了解可以随时取消订阅。</p>",
        "zh-TW": "<p>我同意接收電子郵件，並瞭解可以隨時取消訂閱。</p>",
        it: "<p>Acconsento a ricevere e-mail e comprendo di poter annullare l'iscrizione in qualsiasi momento.</p>",
      },
      sitecore: {
        type: "rich-text",
        hint: "Opt-in copy rendered beside the consent checkbox. Leave blank to omit the consent block. Rich text so authors can drop links (Privacy Policy, Terms) inline.",
        section: "Consent",
        sortOrder: 100,
      },
    },
    {
      // Moved from params → fields. The validation contract on the
      // consent block (does ticking the box gate the submit?) is
      // editorial data tied to the consent text itself — same form on
      // two pages always has the same consent contract.
      name: "ConsentRequired",
      shape: "boolean",
      default: "true",
      sitecore: {
        type: "checkbox",
        hint: "Block submission until the consent checkbox is ticked. Only meaningful when ConsentText is non-empty.",
        section: "Consent",
        sortOrder: 200,
      },
    },

    // ─── Submission ─────────────────────────────────────────────────
    // Submission endpoint + verb moved from params → fields. They're
    // editorial data tied to the form's identity (where does this
    // form post? POST or GET?), not a presentation toggle changing
    // per placement. Same form on two pages always submits the same
    // way; living with the other field copy on the datasource lets
    // multiple placements share the contract.
    {
      name: "SubmitAction",
      shape: "text",
      default: "/api/forms/subscribe",
      sitecore: {
        type: "single-line-text",
        hint: "URL the subscribe form POSTs to.",
        section: "Submission",
        sortOrder: 100,
      },
    },
    {
      name: "SubmitMethod",
      shape: "enum",
      default: "POST",
      sitecore: {
        enumHandle: "submit-method@1",
        hint: "HTTP method for the submission. POST recommended.",
        section: "Submission",
        sortOrder: 200,
      },
    },
  ],

  variants: [{ name: "Default" }],

  params: [
    // Section-shell vocabulary — mirrors accordion-block@1 +
    // form-builder@1. SectionWrapper owns the heading layout +
    // animation + size + the contained-vs-full-width body toggle.
    {
      // Subscribe sections default to full-width so the email + submit
      // pair has room without bumping into a prose column. Authors
      // wrapping the form inside a narrow sidebar / card can opt in.
      name: "UseSectionWrapper",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Constrain the form to a prose-width column. Defaults off so the email + submit pair gets full container width.",
        sortOrder: 100,
      },
    },
    {
      name: "HeadingLayout",
      shape: "enum",
      default: "start-with-section-divider",
      sitecore: {
        enumHandle: "heading-layout@1",
        hint: "Heading alignment (start / center) and treatment (plain, accent scribble, or full-width section divider).",
        sortOrder: 110,
      },
    },
    {
      name: "HeadingAnimation",
      shape: "enum",
      default: "none",
      sitecore: {
        enumHandle: "heading-animation@1",
        hint: "Heading entrance animation.",
        sortOrder: 120,
      },
    },
    {
      name: "HeadingSize",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "heading-size@1",
        hint: "Typographic scale for the section heading. `default` is the typical section title; `large` for a prominent headline; `xl` when the heading block dominates the section.",
        sortOrder: 130,
      },
    },
    {
      // Same Gap axis as Form Builder. Drives the spacing between
      // section heading, the subscribe form, and any inline feedback
      // strip the success/error path renders.
      name: "Gap",
      shape: "enum",
      default: "md",
      sitecore: {
        enumHandle: "gap@1",
        hint: "Spacing between heading + subscribe form + feedback strip.",
        sortOrder: 140,
      },
    },
    // Form-level color scheme + intensity. Mirrors Form Builder's
    // behaviour — drives the surface background, foreground text,
    // and the input chrome (border / placeholder) via the same CSS
    // variable pattern. Earlier the recipe carried `ColorScheme` but
    // the React side only set a `data-color-scheme` attribute on the
    // root; the form's actual visual treatment ignored it.
    {
      name: "FormColorScheme",
      shape: "enum",
      // `none` is the transparent sentinel: the form paints no surface
      // of its own and reads on whatever section it sits in.
      default: "none",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Color scheme for the subscribe section surface — drives the background tint, foreground text, AND the input chrome (border + placeholder + caret) so the whole section reads cohesively. `default` = transparent surface, default input chrome.",
        section: "Form Style",
        sortOrder: 200,
      },
    },
    {
      name: "FormBackgroundIntensity",
      shape: "enum",
      default: "subtle",
      sitecore: {
        enumHandle: "background-intensity@1",
        hint: "`subtle` keeps the soft `-background` tint + default input chrome. `bold` swaps to the pure brand color, inverts text via `text-<scheme>-foreground`, and retones the input borders / placeholder so inputs stay legible on the darker surface.",
        section: "Form Style",
        sortOrder: 210,
      },
    },
    {
      // Mirrors form-builder. `outline` is the bordered cell; `underline`
      // is editorial bottom-edge-only.
      name: "FormInputStyle",
      shape: "enum",
      default: "outline",
      sitecore: {
        enumHandle: "form-input-style@1",
        hint: "Input chrome treatment. `outline` (default) is the standard bordered cell; `underline` is bottom-edge only.",
        section: "Form Style",
        sortOrder: 220,
      },
    },
    {
      // Replaces the old NewsletterLeadCapture component. `plain`
      // keeps the section background; `card` wraps in an elevated
      // rounded card (right for sidebar / footer-rail placements).
      name: "Surface",
      shape: "enum",
      default: "plain",
      sitecore: {
        enumHandle: "subscribe-block-surface@1",
        hint: "Plain section surface (default) or elevated card. Card replaces the old Newsletter Lead Capture treatment.",
        section: "Form Style",
        sortOrder: 220,
      },
    },
    // Submit button axis. Same three orthogonal axes as form-builder
    // (variant / size / colorScheme) threaded through to the shared
    // CTA Button primitive. `SubscribeButtonLayout` is the
    // subscribe-specific button-placement axis (overlay / stacked / row).
    {
      name: "SubscribeButtonLayout",
      shape: "enum",
      default: "overlay",
      sitecore: {
        enumHandle: "subscribe-block-layout@1",
        hint: "Button placement relative to the input pill. Overlay = submit button sits inside the email input pill (default). Stacked = full-width submit below. Row = side-by-side on tablet+.",
        section: "Submit Button",
        sortOrder: 300,
      },
    },
    {
      name: "SubmitButtonVariant",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "button-variant@1",
        hint: "Submit button visual treatment. `default` = filled CTA; `outline` / `ghost` / `link` / `pill` use the matching cta-button variant.",
        section: "Submit Button",
        sortOrder: 310,
      },
    },
    {
      name: "SubmitButtonShowArrow",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Append a trailing arrow (→) after the submit button label.",
        section: "Submit Button",
        sortOrder: 315,
      },
    },
    {
      name: "SubmitButtonSize",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "size@1",
        hint: "Submit button size. Maps to the shared `size@1` scale.",
        section: "Submit Button",
        sortOrder: 320,
      },
    },
    {
      name: "SubmitButtonColorScheme",
      shape: "enum",
      default: "primary",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Submit button color scheme. Independent of `FormColorScheme` so a neutral / soft surface can still carry a primary-tinted CTA.",
        section: "Submit Button",
        sortOrder: 330,
      },
    },
    {
      name: "InstanceKey",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Stable handle for personalization (e.g. 'footer-newsletter'). Lowercase kebab-case recommended. Leave blank to use the datasource id.",
        sortOrder: 500,
      },
    },
    {
      // Subscribe banners are typically site-wide (footer placements
      // shared across every page) so the default is `site`.
      name: "InstanceScope",
      shape: "enum",
      default: "site",
      sitecore: {
        enumHandle: "instance-scope@1",
        hint: "Scope of personalization history. Site = shared across pages (right for footer banners). Page = per-URL.",
        sortOrder: 600,
      },
    },
    {
      name: "TrackEvents",
      shape: "boolean",
      default: "true",
      sitecore: {
        type: "checkbox",
        hint: "Emit view / submit-attempt / submit-success / submit-error / consent-toggle CDP events.",
        sortOrder: 700,
      },
    },
  ],

  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      // Nested page leaf — form-builder and subscribe-section both
      // claim a Forms parent at page scope; the leaf disambiguates
      // the per-recipe data-folder template (see main-nav.recipe.ts
      // for rationale).
      { scope: "page", subfolder: "Forms/Subscribe" },
      { scope: "site", subfolder: "Site Shared Forms/Subscribe" },
    ],
  },

  // Events dispatched through the Content SDK at fire time via
  // `useComponentAnalytics`. The catalog's `cdpEventType` picks the
  // SDK lane: VIEW → pageView(); FORM_VIEWED / FORM_SUBMITTED →
  // form(formId, interactionType, instanceId); IDENTITY → identity();
  // CUSTOM → event({type}).
  //
  // Subscribe forms always carry the same semantic dimensions —
  // intent loyalty, commitment commit, emitsIdentity true — so the
  // form-submitted entry hardcodes them. The IDENTITY entry fires
  // alongside form-submitted because the email field reliably
  // resolves visitor identity at the wire.
  events: [
    {
      name: "view",
      type: "subscribe-section.viewed",
      description:
        "Fires once when the banner becomes ≥ 50% visible. Routed through the SDK's pageView().",
      action: "view",
      commitment: "browse",
      emitsIdentity: false,
      emitsAffinity: false,
      cdpEventType: "VIEW",
    },
    {
      name: "form-viewed",
      type: "subscribe-section.form-viewed",
      description:
        "Fires once when the form becomes ≥ 50% visible. Routed through the SDK's form() with VIEWED.",
      action: "view",
      commitment: "browse",
      emitsIdentity: false,
      emitsAffinity: false,
      cdpEventType: "FORM_VIEWED",
    },
    {
      name: "form-submitted",
      type: "subscribe-section.form-submitted",
      description:
        "Fires after the subscribe endpoint returns success. Routed through the SDK's form() with SUBMITTED.",
      action: "submit",
      intent: "loyalty",
      commitment: "commit",
      emitsIdentity: true,
      emitsAffinity: false,
      cdpEventType: "FORM_SUBMITTED",
    },
    {
      name: "identity",
      type: "subscribe-section.identity",
      description:
        "Fires when a successful subscribe carries an email. Routed through the SDK's identity() so the visitor's anonymous browser_id is linked to the known email.",
      action: "identify",
      intent: "loyalty",
      commitment: "commit",
      emitsIdentity: true,
      emitsAffinity: false,
      cdpEventType: "IDENTITY",
    },
    {
      name: "submit-error",
      type: "subscribe-section.submit-errored",
      description:
        "Fires when the subscribe endpoint returns a non-OK response or the request throws.",
      action: "abandon",
      intent: "loyalty",
      commitment: "engage",
      emitsIdentity: false,
      emitsAffinity: false,
      cdpEventType: "CUSTOM",
    },
    {
      name: "consent-toggle",
      type: "subscribe-section.consent-toggled",
      description:
        "Fires when the consent checkbox is toggled. Meta carries `consentAccepted` boolean.",
      action: "engage",
      intent: "loyalty",
      commitment: "engage",
      emitsIdentity: false,
      emitsAffinity: false,
      cdpEventType: "CUSTOM",
    },
  ],
} satisfies ComponentTemplateRecipe;

export default subscribeSectionRecipe;
