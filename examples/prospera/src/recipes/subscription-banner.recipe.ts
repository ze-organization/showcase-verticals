import type { ComponentTemplateRecipe } from "../lib/registry/sitecore-recipes";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for the `SubscriptionBanner` component (./subscription-banner.tsx).
 *
 * Banner-shaped subscription form. Mirrors `subscribe-section@1`'s
 * field + param vocabulary so authors using both surfaces work with
 * the same controls — the banner just paints a heavier surface (full
 * width, background image / gradient option) while subscribe-section
 * is the prose-width column form.
 *
 * Fields organised into Sitecore sections (Content / Name Field /
 * Email Field / Consent / Submission). Params split into Form Style
 * (form surface color, intensity), Submit Button (variant / size /
 * colorScheme), Layout (button vs input arrangement).
 */
export const subscriptionBannerRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "subscription-banner@1",
  icon: componentIcons["subscription-banner@1"],
  name: "subscription-banner",
  displayName: "Subscription Banner",
  description:
    "Full-width subscription banner — title, description, and inline email capture. Same vocabulary as subscribe-section@1; renders as a banner surface instead of a prose-width section.",

  section: { handle: "heros-and-promos-section@1" },

  fields: [
    {
      name: "Title",
      shape: "text",
      default: {
        en: "Stay in the loop",
        ar: "ابقَ على اطّلاع",
        es: "Mantente al día",
        fr: "Restez informé",
        de: "Bleiben Sie auf dem Laufenden",
        da: "Hold dig opdateret",
        ja: "最新情報をお届けします",
        "zh-CN": "保持关注",
        "zh-TW": "保持關注",
        it: "Resta aggiornato",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Banner headline (e.g. 'Stay updated').",
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "Description",
      shape: "richText",
      default: {
        en: "<p>Get monthly updates on new components, recipes, and starter kits.</p>",
        ar: "<p>احصل على تحديثات شهرية حول المكوّنات والوصفات وأطقم البدء الجديدة.</p>",
        es: "<p>Recibe actualizaciones mensuales sobre nuevos componentes, recetas y kits de inicio.</p>",
        fr: "<p>Recevez chaque mois les nouveautés sur les composants, recettes et kits de démarrage.</p>",
        de: "<p>Erhalten Sie monatliche Updates zu neuen Komponenten, Rezepten und Starter-Kits.</p>",
        da: "<p>Få månedlige opdateringer om nye komponenter, opskrifter og startpakker.</p>",
        ja: "<p>新しいコンポーネント、レシピ、スターターキットの最新情報を毎月お届けします。</p>",
        "zh-CN": "<p>每月获取有关新组件、配方和入门套件的更新。</p>",
        "zh-TW": "<p>每月獲取有關新元件、配方和入門套件的更新。</p>",
        it: "<p>Ricevi aggiornamenti mensili su nuovi componenti, ricette e starter kit.</p>",
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
        hint: "Optional background image. When set it owns the banner surface — BackgroundScrim controls the overlay + text tone, and FormColorScheme keeps tinting only the form chrome (submit button + focus ring).",
        section: "Content",
        sortOrder: 300,
      },
    },
    // Generic chrome (email label + placeholder, submit button, status
    // messages) ships WITH multi-language Standard Values (design-owner
    // request 2026-07: a fresh drop should read finished, and authors
    // should see the post-submit copy without hunting a dictionary).
    // Values mirror the matching `core-ui-labels@1` phrases
    // (`form-email-label` / `form-email-placeholder` / `cta-subscribe`
    // / `form-subscribe-success` / `form-error`), which remain the
    // fallback when an author blanks a field — see
    // src/lib/registry/forms/form-chrome.ts for the resolution chain.
    {
      name: "SuccessMessage",
      shape: "text",
      default: {
        en: "Thanks for subscribing.",
        ar: "شكرًا لاشتراكك.",
        es: "Gracias por suscribirte.",
        fr: "Merci de votre abonnement.",
        de: "Danke für Ihr Abonnement.",
        da: "Tak for din tilmelding.",
        ja: "ご登録ありがとうございます。",
        "zh-CN": "感谢您的订阅。",
        "zh-TW": "感謝您的訂閱。",
        it: "Grazie per l'iscrizione.",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Message shown after a successful submit. Blank falls back to the localized Core UI Labels dictionary default. Edit this label from the right rail — inline editing not supported.",
        section: "Status",
        sortOrder: 100,
      },
    },
    {
      name: "ErrorMessage",
      shape: "text",
      default: {
        en: "Something went wrong. Please try again.",
        ar: "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
        es: "Algo salió mal. Inténtalo de nuevo.",
        fr: "Une erreur s'est produite. Veuillez réessayer.",
        de: "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.",
        da: "Noget gik galt. Prøv igen.",
        ja: "エラーが発生しました。もう一度お試しください。",
        "zh-CN": "出了点问题，请重试。",
        "zh-TW": "發生錯誤，請重試。",
        it: "Qualcosa è andato storto. Riprova.",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Message shown when the submission endpoint rejects. Blank falls back to the localized Core UI Labels dictionary default. Edit this label from the right rail — inline editing not supported.",
        section: "Status",
        sortOrder: 200,
      },
    },
    // ---- Name field ---------------------------------------------------
    {
      name: "NameLabel",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Label for the optional name input. Leave blank to omit the name field entirely (email-only banner — the common case). Edit this label from the right rail — inline editing not supported.",
        section: "Name Field",
        sortOrder: 100,
      },
    },
    {
      name: "NamePlaceholder",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Placeholder text inside the name input. Used only when NameLabel is set. Edit this label from the right rail — inline editing not supported.",
        section: "Name Field",
        sortOrder: 200,
      },
    },
    {
      name: "NameRequired",
      shape: "boolean",
      default: "false",
      sitecore: {
        type: "checkbox",
        hint: "Block submission until the name input has a value. Only meaningful when the Name Label is set.",
        section: "Name Field",
        sortOrder: 300,
      },
    },
    // ---- Email field --------------------------------------------------
    {
      name: "EmailLabel",
      shape: "text",
      default: {
        en: "Email address",
        ar: "البريد الإلكتروني",
        es: "Correo electrónico",
        fr: "Adresse e-mail",
        de: "E-Mail-Adresse",
        da: "E-mailadresse",
        ja: "メールアドレス",
        "zh-CN": "电子邮箱",
        "zh-TW": "電子郵件地址",
        it: "Indirizzo email",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Label above the email input. Blank falls back to the localized Core UI Labels dictionary default. Edit this label from the right rail — inline editing not supported.",
        section: "Email Field",
        sortOrder: 100,
      },
    },
    {
      name: "EmailPlaceholder",
      shape: "text",
      // Deliberately the same in every language — an example address
      // reads universally (matches the `form-email-placeholder`
      // dictionary phrase, identical across locales).
      default: "you@example.com",
      sitecore: {
        type: "single-line-text",
        hint: "Placeholder text inside the email input. Blank falls back to the localized Core UI Labels dictionary default. Edit this label from the right rail — inline editing not supported.",
        section: "Email Field",
        sortOrder: 200,
      },
    },
    {
      name: "EmailRequired",
      shape: "boolean",
      default: "true",
      sitecore: {
        type: "checkbox",
        hint: "Block submission until the email input has a value. Recommended on for typical subscribe flows.",
        section: "Email Field",
        sortOrder: 300,
      },
    },
    // ---- Consent ------------------------------------------------------
    {
      name: "ConsentText",
      shape: "richText",
      sitecore: {
        type: "rich-text",
        hint: "Optional consent line shown under the form (privacy / marketing opt-in disclosure). When set, a checkbox renders alongside.",
        section: "Consent",
        sortOrder: 100,
      },
    },
    {
      name: "ConsentRequired",
      shape: "boolean",
      default: "false",
      sitecore: {
        type: "checkbox",
        hint: "Block submission until the consent checkbox is ticked. Only meaningful when Consent Text is set.",
        section: "Consent",
        sortOrder: 200,
      },
    },
    // ---- Submission ---------------------------------------------------
    {
      name: "SubmitText",
      shape: "text",
      default: {
        en: "Subscribe",
        ar: "اشترك",
        es: "Suscribirse",
        fr: "S'abonner",
        de: "Abonnieren",
        da: "Tilmeld",
        ja: "登録する",
        "zh-CN": "订阅",
        "zh-TW": "訂閱",
        it: "Iscriviti",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Label for the submit button. Blank falls back to the localized Core UI Labels dictionary default. Edit this label from the right rail — inline editing not supported.",
        section: "Submission",
        sortOrder: 100,
      },
    },
    {
      name: "SubmitAction",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "URL the form submits to. Leave blank to skip the network call (showcase mode — submit fires CDP events and resets).",
        section: "Submission",
        sortOrder: 200,
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
        sortOrder: 300,
      },
    },
  ],

  params: [
    {
      name: "BlurBackground",
      shape: "boolean",
      default: "false",
      sitecore: {
        type: "checkbox",
        hint: "When a background Image is set, blur it behind the scrim layer for a frosted overlay.",
        section: "Content",
        sortOrder: 600,
      },
    },
    {
      name: "BackgroundScrim",
      shape: "enum",
      default: "dark",
      sitecore: {
        enumHandle: "background-scrim@1",
        hint: "Scrim over the background Image — also sets the text tone. `dark` (default) dims the photo and flips the copy white; `light` washes it and flips the copy black; `none` leaves the image untreated and keeps the page text color. No effect without a background image.",
        section: "Content",
        sortOrder: 610,
      },
    },
    {
      name: "BackgroundPosition",
      shape: "enum",
      default: "center",
      sitecore: {
        enumHandle: "background-position@1",
        hint: "Crop anchor of the background Image (`object-position`) — `center` / `top` / `bottom`. No effect without a background image.",
        section: "Content",
        sortOrder: 620,
      },
    },
    // Form surface vocabulary — mirrors subscribe-section@1 +
    // form-builder@1 so authors learn one vocabulary.
    {
      name: "FormColorScheme",
      shape: "enum",
      // `none` is the transparent sentinel: the form paints no surface
      // of its own and reads on whatever section it sits in.
      default: "none",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Color scheme for the banner + form. Without a background Image it paints the banner surface (tint or, with Intensity=bold, the solid brand fill with inverted text). It always re-tints the input focus ring, and the submit button follows it while Submit Button Color Scheme is left at `primary`. With a background Image the image owns the surface and only the form chrome follows. `default` adopts the surrounding section background.",
        section: "Form Style",
        sortOrder: 100,
      },
    },
    {
      name: "FormBackgroundIntensity",
      shape: "enum",
      default: "subtle",
      sitecore: {
        enumHandle: "background-intensity@1",
        hint: "`subtle` keeps the soft -background tint; `bold` swaps to the pure brand color and inverts text + input chrome for legibility.",
        section: "Form Style",
        sortOrder: 200,
      },
    },
    // Submit button axis. Three params separated — mirrors form-builder.
    {
      name: "SubmitButtonVariant",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "button-variant@1",
        hint: "Submit button visual treatment. `default` = filled CTA; `outline` / `ghost` / `link` / `pill` use the matching cta-button variant.",
        section: "Submit Button",
        sortOrder: 100,
      },
    },
    {
      name: "SubmitButtonShowArrow",
      shape: "boolean",
      default: "false",
      sitecore: {
        type: "checkbox",
        hint: "Append a trailing arrow (→) after the submit button label.",
        section: "Submit Button",
        sortOrder: 150,
      },
    },
    {
      name: "SubmitButtonSize",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "size@1",
        hint: "Submit button size.",
        section: "Submit Button",
        sortOrder: 200,
      },
    },
    {
      name: "SubmitButtonColorScheme",
      shape: "enum",
      default: "primary",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Submit button color scheme. Left at `primary` (the default) it follows Form Color Scheme when one is set; pick any other value to pin the button independently (e.g. a neutral banner with a primary CTA).",
        section: "Submit Button",
        sortOrder: 300,
      },
    },
    // Subscribe button layout — same enum that subscribe-section uses
    // (subscribe-button-layout@1 surfaces row / stacked / overlay /
    // inline). The component reads it as the SubscribeBlock's
    // `layout` prop.
    {
      name: "SubscribeButtonLayout",
      shape: "enum",
      default: "row",
      sitecore: {
        enumHandle: "subscribe-block-layout@1",
        hint: "How the email input and submit button align — `row` (side-by-side, default), `stacked` (input above, button below), or `overlay` (button anchored inside the input pill). `row` auto-stacks below the `sm` breakpoint for mobile readability.",
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
        hint: "Inline-axis alignment of the title, description, and subscribe form within the content column.",
        section: "Layout",
        sortOrder: 200,
      },
    },
    {
      name: "TitleSize",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "heading-size@1",
        hint: "Title scale. `default` matches the banner body; `large`, `xl`, and `text-banner` step the title into the editorial / Hero range — pick `xl` for a strong headline block.",
        section: "Layout",
        sortOrder: 210,
      },
    },
    {
      name: "ShowSeparator",
      shape: "boolean",
      default: "false",
      sitecore: {
        type: "checkbox",
        hint: "Render the banner's single horizontal rule, between the heading region and the subscribe form. (The title no longer draws its own underline, so this is the only divider.)",
        section: "Layout",
        sortOrder: 220,
      },
    },
    {
      // Author-friendly stable handle that flows into every fired CDP
      // event. Defaults to the rendering id when blank so analytics
      // queries still find each banner instance, but readable handles
      // ('footer-newsletter', 'q2-launch-strip') make downstream
      // analysis dramatically easier than raw GUIDs.
      name: "InstanceKey",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Stable handle for personalization (e.g. 'footer-newsletter'). Lowercase kebab-case recommended. Leave blank to use the datasource id.",
        section: "Analytics",
        sortOrder: 100,
      },
    },
    {
      // Whether view + submit history is partitioned per-page or
      // shared across the whole site. `site` is right for a footer
      // newsletter that appears identically everywhere (one shared
      // submission count); `page` is right for landing-page-specific
      // capture forms where each URL is its own funnel.
      name: "InstanceScope",
      shape: "enum",
      default: "site",
      sitecore: {
        enumHandle: "instance-scope@1",
        hint: "Scope of personalization history. Site = same banner everywhere (one shared submission count). Page = per-URL (count resets per page).",
        section: "Analytics",
        sortOrder: 200,
      },
    },
    {
      // Per-instance opt-out for analytics fires. Defaults on so
      // authors get tracking for free; flip off for placements where
      // events would muddy the data (test banners, internal-only
      // surfaces, single-use placements you don't want polluting
      // personalization counters).
      name: "TrackEvents",
      shape: "boolean",
      default: "true",
      sitecore: {
        type: "checkbox",
        hint: "Emit view + submit-attempt / success / error CDP events for this placement. Uncheck to suppress entirely.",
        section: "Analytics",
        sortOrder: 300,
      },
    },
  ],

  variants: [{ name: "Default" }],

  // Events dispatched through the Content SDK via useComponentAnalytics.
  // Same shape as subscribe-section — see that recipe for routing rationale.
  events: [
    {
      name: "view",
      type: "subscription-banner.viewed",
      description:
        "Fires once when the banner becomes ≥ 50% visible. Routed through SDK pageView().",
      action: "view",
      commitment: "browse",
      emitsIdentity: false,
      emitsAffinity: false,
      cdpEventType: "VIEW",
    },
    {
      name: "form-viewed",
      type: "subscription-banner.form-viewed",
      description:
        "Fires once when the form becomes ≥ 50% visible. Routed through SDK form() with VIEWED.",
      action: "view",
      commitment: "browse",
      emitsIdentity: false,
      emitsAffinity: false,
      cdpEventType: "FORM_VIEWED",
    },
    {
      name: "form-submitted",
      type: "subscription-banner.form-submitted",
      description:
        "Fires after the subscription endpoint resolves successfully. Routed through SDK form() with SUBMITTED.",
      action: "submit",
      intent: "loyalty",
      commitment: "commit",
      emitsIdentity: true,
      emitsAffinity: false,
      cdpEventType: "FORM_SUBMITTED",
    },
    {
      name: "identity",
      type: "subscription-banner.identity",
      description:
        "Fires when a successful subscribe carries an email. Routed through SDK identity() so the visitor's browser_id is linked to the known email.",
      action: "identify",
      intent: "loyalty",
      commitment: "commit",
      emitsIdentity: true,
      emitsAffinity: false,
      cdpEventType: "IDENTITY",
    },
    {
      name: "submit-error",
      type: "subscription-banner.submit-errored",
      description: "Fires when the subscription endpoint returns an error.",
      action: "abandon",
      intent: "loyalty",
      commitment: "engage",
      emitsIdentity: false,
      emitsAffinity: false,
      cdpEventType: "CUSTOM",
    },
  ],

  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Subscription Banners" },
      { scope: "site", subfolder: "Subscription Banners" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default subscriptionBannerRecipe;
