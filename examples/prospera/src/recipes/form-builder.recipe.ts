import type { ComponentTemplateRecipe } from "../lib/registry/sitecore-recipes";
import { componentIcons } from "./_component-icons";
import { FORM_FIELDS_SLOT_HANDLES } from "./_form-field-handles";

/**
 * Compose-your-own form. Authors drag field renderings and composition
 * chrome (steps, fieldsets, conditionals, arrays, summary) into the
 * `form-fields-{*}` dynamic placeholder exposed below. The parent
 * renders the `<form>` shell, submit button,
 * status announcement region, and the full CDP analytics surface;
 * fields are dumb input renderers.
 *
 * The submit handler reads FormData keyed by each field's `Name` field
 * — so the FormBuilder doesn't care what fields the author drops in.
 * Authors wire the endpoint via the `SubmitAction` / `SubmitMethod`
 * params, identical to Subscribe Section.
 */
export const formBuilderRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "form-builder@1",
  icon: componentIcons["form-builder@1"],
  name: "form-builder",
  displayName: "Form Builder",
  description:
    "Compose-your-own form. Drag field renderings into the form-fields placeholder. On successful submit, fires FORM_SUBMITTED plus an IDENTITY event when the payload includes an email so SitecoreAI Profiles can resolve the visitor.",

  section: { handle: "forms-section@1" },

  fields: [
    {
      name: "Title",
      shape: "text",
      default: {
        en: "Get in touch",
        ar: "تواصل معنا",
        es: "Ponte en contacto",
        fr: "Nous contacter",
        de: "Kontakt aufnehmen",
        da: "Kom i kontakt",
        ja: "お問い合わせ",
        "zh-CN": "联系我们",
        "zh-TW": "與我們聯絡",
        it: "Contattaci",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Optional heading shown above the form.",
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "Description",
      shape: "richText",
      default: {
        en: "<p>Tell us a bit about yourself and we'll be in touch shortly.</p>",
        ar: "<p>أخبرنا قليلًا عن نفسك وسنتواصل معك قريبًا.</p>",
        es: "<p>Cuéntanos un poco sobre ti y nos pondremos en contacto en breve.</p>",
        fr: "<p>Parlez-nous un peu de vous et nous vous recontacterons rapidement.</p>",
        de: "<p>Erzählen Sie uns etwas über sich, und wir melden uns in Kürze.</p>",
        da: "<p>Fortæl os lidt om dig selv, så vender vi tilbage til dig snarest.</p>",
        ja: "<p>あなたについて少しお聞かせください。追ってご連絡いたします。</p>",
        "zh-CN": "<p>请简单介绍一下您自己，我们会尽快与您联系。</p>",
        "zh-TW": "<p>請簡單介紹一下您自己，我們會盡快與您聯繫。</p>",
        it: "<p>Parlaci un po' di te e ti contatteremo a breve.</p>",
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
    // default from the `core-ui-labels@1` dictionary (`form-submit` /
    // `form-thanks` / `form-error`). A Standard Value would pre-fill the
    // field, so resolution would stop at the authored value and never
    // reach the dictionary. See src/lib/registry/forms/form-chrome.ts.
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
        hint: "Message shown when the submission endpoint rejects. Leave blank to use the localized default from the Core UI Labels dictionary.",
        section: "Status",
        sortOrder: 200,
      },
    },
    // SubmitAction + SubmitMethod moved from params → fields. They're
    // editorial data tied to the form's identity (where does this
    // form post? POST or GET?), not a presentation toggle that
    // changes per placement. Same form on two pages always submits
    // to the same endpoint with the same verb; living on the
    // datasource lets multiple placements share that contract
    // without each placement re-picking it.
    {
      name: "SubmitAction",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "URL the form submits to. Leave blank to skip the network call (registry showcase mode — submit fires CDP events and resets).",
        section: "Submit",
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
        section: "Submit",
        sortOrder: 200,
      },
    },
  ],

  // Five variants — same field/param surface; chrome differs.
  //   Default      — section-shelled form with title + description.
  //   Wizard       — wraps in FormWizardProvider + stepper indicator.
  //                  Drop form-step@1 renderings into form-fields-{*}.
  //   Inline       — strips section padding + heading for inline-with-
  //                  content placements (whitepaper download, etc.).
  //   Sticky       — pins the form to the viewport top as the user
  //                  scrolls (newsletter capture that follows reader).
  //   Progressive  — shows only the first field initially; expands the
  //                  rest after that field is filled. Email-first
  //                  capture pattern.
  variants: [
    { name: "Default" },
    { name: "Wizard" },
    { name: "Inline" },
    { name: "Sticky" },
    { name: "Progressive" },
  ],

  // Required for the `form-fields-{*}` slot below to resolve per
  // placement (two load-bearing side effects in the scai compiler).
  dynamicPlaceholders: true,
  placeholders: [
    {
      key: "form-fields-{*}",
      // Leaf fields, composition chrome (step / fieldset / array /
      // conditional / summary), and the two layout splitters. Nesting
      // a row- or column-splitter inside the form's fields slot lets
      // authors lay fields out in multiple columns or rows without
      // bolting on a custom layout component. The splitters are
      // `componentType: "universal"`, so they resolve in both the
      // client and server component maps the form chrome iterates
      // through; the splitter slots themselves are permissive (no
      // `allowedRenderingHandles`), so a form field dropped inside a
      // splitter column / row picks up the surrounding `<form>`
      // element automatically — HTML form serialisation walks the
      // entire descendant tree, so submit still collects every nested
      // field on a single `onSubmit`.
      allowedRenderingHandles: [...FORM_FIELDS_SLOT_HANDLES],
    },
  ],

  params: [
    // Shared section-shell vocabulary. Mirrors `accordion-block@1` —
    // `UseSectionWrapper` constrains the body to a prose-width column;
    // `HeadingLayout` / `HeadingAnimation` / `HeadingSize` drive the
    // heading treatment. These are the same enums the layout shells
    // (SectionWrapper, AccordionBlock, ContentBlock) expose so authors
    // can lean on one consistent vocabulary across the form sections.
    {
      // Forms default to full-width so the `half` / `third` field
      // widths get enough horizontal room to pair side-by-side without
      // wrapping. Authors who want a narrow prose-width form (single
      // newsletter capture, embedded card) opt into the wrapper.
      name: "UseSectionWrapper",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Constrain the form to a prose-width column. Defaults off so half/third field widths have room to pair on a row.",
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
        hint: "Typographic scale for the form heading. `default` is the typical section title; `large` for a prominent headline; `xl` when the heading block dominates the section.",
        sortOrder: 130,
      },
    },
    {
      // Gap between the form's vertical sections (status, fields
      // placeholder, submit row) AND between the form fields inside
      // the placeholder when they're laid out flat (no splitter).
      // When a row- or column-splitter sits inside the form, the
      // splitter's own Gap param takes over for the fields nested
      // within it — this param controls the form's own spacing only.
      name: "Gap",
      shape: "enum",
      default: "md",
      sitecore: {
        enumHandle: "gap@1",
        hint: "Spacing between the form's sections + between flat form fields. When a Row/Column Splitter is nested inside, the splitter's own Gap controls the fields within it.",
        sortOrder: 140,
      },
    },
    // Form color-scheme + intensity. Replaces the dead `ColorScheme`
    // param that only set a `data-color-scheme` attribute and did
    // nothing visually. The React side now wires this scheme into the
    // form surface AND the inputs via CSS variables — `subtle` keeps
    // the soft `-background` tint with default text/input borders;
    // `bold` swaps to the pure brand color and re-tones the input
    // chrome (translucent background, `currentColor` borders, scheme
    // foreground text) so inputs stay readable on dark surfaces. No
    // composer-side foreground-color management needed — pick the
    // scheme and the form chrome follows.
    {
      name: "FormColorScheme",
      shape: "enum",
      // `none` is the transparent sentinel: the form paints no surface
      // of its own and reads on whatever section it sits in.
      default: "none",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Color scheme for the form surface — drives the background tint, text color, AND the input chrome (borders + placeholder + caret) so the whole form reads cohesively. `default` = no scheme (transparent surface, default input chrome).",
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
        hint: "`subtle` keeps the soft `-background` tint and default input chrome (right for a light pastel form on a page). `bold` swaps to the pure brand color, inverts the text via `text-<scheme>-foreground`, AND retones the input borders / placeholder so the inputs stay legible on the darker surface.",
        section: "Form Style",
        sortOrder: 210,
      },
    },
    {
      // Drives the descendant Input / Textarea / SelectTrigger chrome.
      // `outline` is the natural bordered cell; `underline` strips
      // every border except the bottom edge for the editorial pattern.
      name: "FormInputStyle",
      shape: "enum",
      default: "outline",
      sitecore: {
        enumHandle: "form-input-style@1",
        hint: "Input chrome treatment. `outline` (default) is the standard bordered cell; `underline` is bottom-edge only — editorial / dense forms.",
        section: "Form Style",
        sortOrder: 220,
      },
    },
    // Submit-button axis. Three params separated so authors can pick
    // a chunky brand-colored bold button OR an outline button OR a
    // bare link with the existing CTA primitive — without forking
    // the FormBuilder rendering. Mirrors the cta-button + card-block
    // action vocabulary.
    {
      name: "SubmitButtonVariant",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "button-variant@1",
        hint: "Submit button visual treatment. `default` = filled CTA; `outline` / `ghost` / `link` / `pill` use the matching cta-button variant.",
        section: "Submit Button",
        sortOrder: 300,
      },
    },
    {
      name: "SubmitButtonShowArrow",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Append a trailing arrow (→) after the submit button label.",
        section: "Submit Button",
        sortOrder: 305,
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
        sortOrder: 310,
      },
    },
    {
      name: "SubmitButtonColorScheme",
      shape: "enum",
      default: "primary",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Submit button color scheme. Independent of `FormColorScheme` so a neutral / soft form surface can still carry a primary-tinted CTA.",
        section: "Submit Button",
        sortOrder: 320,
      },
    },
    {
      name: "InstanceKey",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Stable handle for personalization. Lowercase kebab-case recommended.",
        sortOrder: 500,
      },
    },
    {
      name: "InstanceScope",
      shape: "enum",
      default: "page",
      sitecore: {
        enumHandle: "instance-scope@1",
        hint: "Scope of personalization history. Page = per-URL (default). Site = shared across pages.",
        sortOrder: 600,
      },
    },
    {
      name: "TrackEvents",
      shape: "boolean",
      default: "true",
      sitecore: {
        type: "checkbox",
        hint: "Emit the form's CDP events (field-focused, submit-success, identity, submit-errored). Uncheck to suppress entirely.",
        sortOrder: 700,
      },
    },
    // Semantic dimensions stamped on the <form> element as data-cdp-*
    // attributes for author-facing classification (Download vs Contact
    // vs Subscribe). Identity resolution does not read these — on
    // successful submit the React component fires Cloud SDK identity()
    // with identifiers.provider = "email" so SitecoreAI identity rules
    // can match the visitor. Email / phone / name are inferred from
    // the submitted field `name` attributes (email, firstName, name).
    {
      name: "CdpFormIntent",
      shape: "enum",
      default: "decision",
      sitecore: {
        enumHandle: "cdp-form-intent@1",
        hint: "Journey-stage hint stamped on the form for Sitecore Personalize affinity scoring. Download = research; Contact / Lead = decision; Subscribe / Register = loyalty.",
        section: "Analytics",
        sortOrder: 800,
      },
    },
    {
      name: "CdpFormCommitment",
      shape: "enum",
      default: "provide-info",
      sitecore: {
        enumHandle: "cdp-form-commitment@1",
        hint: "Depth of user investment at submit time. provide-info = trading data for content (download / contact); commit = ongoing relationship (subscribe / register).",
        section: "Analytics",
        sortOrder: 810,
      },
    },
    {
      name: "DemoFundedConfirmation",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "After a successful submit, show a demo 'account funded' confirmation and fire form-builder.account-funded. Off by default — only check this on /Apply-Now.",
        section: "Analytics",
        sortOrder: 820,
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
      // for rationale). Site scope is already disambiguated via
      // distinct Custom / Subscribe leaves.
      { scope: "page", subfolder: "Forms/Custom" },
      { scope: "site", subfolder: "Site Shared Forms/Custom" },
    ],
  },

  // Events dispatched through the Content SDK at fire time via
  // `useComponentAnalytics`. The catalog's `cdpEventType` picks the
  // SDK lane: VIEW → pageView(); FORM_VIEWED / FORM_SUBMITTED →
  // form(formId, interactionType, instanceId); IDENTITY → identity();
  // CUSTOM → event({type}).
  //
  // `submit-attempt` and `submit-validation-failed` from the original
  // sketch are dropped — submit-attempt is the same wire event as
  // FORM_SUBMITTED at the platform layer, and validation-failed is
  // pre-submit debug telemetry too granular for marketing stories.
  // Identity fires alongside form-submitted when the payload includes
  // an email so SitecoreAI can resolve the anonymous browser_id.
  events: [
    {
      name: "view",
      type: "form-builder.viewed",
      description:
        "Fires once when the form becomes ≥ 50% visible. Routed through the SDK's pageView().",
      action: "view",
      commitment: "browse",
      emitsIdentity: false,
      emitsAffinity: false,
      cdpEventType: "VIEW",
    },
    {
      name: "form-viewed",
      type: "form-builder.form-viewed",
      description:
        "Fires once when the form becomes ≥ 50% visible. Routed through the SDK's form(formId, 'VIEWED', instanceId). Distinct from `view` — pageView fires per page, form-viewed fires per form instance.",
      action: "view",
      commitment: "browse",
      emitsIdentity: false,
      emitsAffinity: false,
      cdpEventType: "FORM_VIEWED",
    },
    {
      name: "field-focused",
      type: "form-builder.field-focused",
      description:
        "Fires the first time each named field receives focus during a session. Meta carries the field name. Useful for funnel / drop-off analysis.",
      action: "engage",
      intent: "consideration",
      commitment: "engage",
      emitsIdentity: false,
      emitsAffinity: false,
      cdpEventType: "CUSTOM",
    },
    {
      name: "form-submitted",
      type: "form-builder.form-submitted",
      description:
        "Fires after submission resolves successfully. Routed through the SDK's form(formId, 'SUBMITTED', instanceId).",
      action: "submit",
      intent: "decision",
      commitment: "provide-info",
      emitsIdentity: true,
      emitsAffinity: false,
      cdpEventType: "FORM_SUBMITTED",
    },
    {
      name: "identity",
      type: "form-builder.identity",
      description:
        "Fires when a successful submit carries an email. Routed through the SDK's identity() with identifiers.provider = email so SitecoreAI can link the anonymous browser_id to a known profile.",
      action: "identify",
      intent: "decision",
      commitment: "provide-info",
      emitsIdentity: true,
      emitsAffinity: false,
      cdpEventType: "IDENTITY",
    },
    {
      name: "submit-error",
      type: "form-builder.submit-errored",
      description:
        "Fires when the submission endpoint returns a non-OK response or throws. Distinct from form-submitted because it's a negative-engagement signal that platform-level FORM doesn't expose.",
      action: "abandon",
      intent: "decision",
      commitment: "provide-info",
      emitsIdentity: false,
      emitsAffinity: false,
      cdpEventType: "CUSTOM",
    },
    {
      name: "application-completed",
      type: "form-builder.application-completed",
      description:
        "Fires after a successful submit. CUSTOM companion to form-submitted so extensionData (product) reaches SitecoreAI — FORM_SUBMITTED has no extension payload.",
      action: "submit",
      intent: "decision",
      commitment: "commit",
      emitsIdentity: false,
      emitsAffinity: false,
      cdpEventType: "CUSTOM",
    },
    {
      name: "account-funded",
      type: "form-builder.account-funded",
      description:
        "Demo-only. Fires after submit when DemoFundedConfirmation is on. Meta carries product + depositAmountUsd.",
      action: "submit",
      intent: "decision",
      commitment: "pay",
      emitsIdentity: false,
      emitsAffinity: false,
      cdpEventType: "CUSTOM",
    },
  ],
} satisfies ComponentTemplateRecipe;

export default formBuilderRecipe;
