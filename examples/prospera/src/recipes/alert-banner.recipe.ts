import type { ComponentTemplateRecipe } from "../lib/registry/sitecore-recipes";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for the `AlertBanner` component (./alert-banner.tsx).
 *
 * The reference feedback component. Three fields (Title, Description,
 * Link) and two presentation params (Dismissible, DismissLabel). A
 * single Default rendering variant — visual differentiation by colour
 * scheme or severity belongs on Rendering Parameters in a future
 * iteration, not on per-variant React exports.
 *
 * No placeholders — alert banners are leaf content.
 */
export const alertBannerRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "alert-banner@1",
  icon: componentIcons["alert-banner@1"],
  name: "alert-banner",
  displayName: "Alert Banner",
  description:
    "Dismissible alert bar with title, optional description, and optional CTA link.",

  section: { handle: "feedback-section@1" },

  fields: [
    {
      name: "Title",
      shape: "text",
      // Compiled into the template's `__Standard Values` so auto-created
      // datasources arrive pre-filled — authors override per-item.
      default: {
        en: "Heads up",
        ar: "تنبيه",
        es: "Atención",
        fr: "À noter",
        de: "Hinweis",
        da: "Bemærk",
        ja: "ご注意",
        "zh-CN": "温馨提示",
        "zh-TW": "溫馨提示",
        it: "Attenzione",
      },
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "The alert headline. Required.",
        sortOrder: 100,
      },
    },
    {
      name: "Description",
      shape: "richText",
      // Standard Values seed for auto-created datasources. HTML because
      // rich-text fields store HTML.
      default: {
        en: "<p>Add supporting copy that explains the alert.</p>",
        ar: "<p>أضف نصًا توضيحيًا يشرح التنبيه.</p>",
        es: "<p>Añade un texto de apoyo que explique la alerta.</p>",
        fr: "<p>Ajoutez un texte explicatif pour l'alerte.</p>",
        de: "<p>Fügen Sie einen erläuternden Text zur Meldung hinzu.</p>",
        da: "<p>Tilføj en uddybende tekst, der forklarer notifikationen.</p>",
        ja: "<p>アラートを説明する補足テキストを追加してください。</p>",
        "zh-CN": "<p>添加用于说明该提醒的辅助文案。</p>",
        "zh-TW": "<p>新增用於說明該提醒的輔助文案。</p>",
        it: "<p>Aggiungi un testo di supporto che spieghi l'avviso.</p>",
      },
      sitecore: {
        type: "rich-text",
        hint: "Optional supporting copy below the title.",
        sortOrder: 200,
      },
    },
    {
      name: "Link",
      shape: "link",
      // The URL half is `/` on purpose — scai encodes a `#` URL as
      // linktype="anchor" WITHOUT the `anchor` attribute the Layout
      // Service builds hrefs from, so the SV arrived as href:"" and the
      // link rendered blank (see cta-button.recipe.ts diagnosis).
      default: "Learn more|/",
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
      // Drives the alert background, text color, and (with ShowIcon
      // on) the leading icon. Uses the shared color-scheme@1 enum —
      // semantic feedback values (info/success/warning/destructive)
      // get their own icons; brand schemes (primary/secondary/etc.)
      // fall back to a generic info icon — color carries the meaning.
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
        hint: "Show the leading icon. Icon comes from the color scheme (semantic schemes get their own icon; brand schemes get a generic info icon).",
        sortOrder: 200,
      },
    },
    {
      // Shape axis: width + horizontal alignment. Composes with Position.
      name: "Layout",
      shape: "enum",
      default: "contained",
      sitecore: {
        enumHandle: "alert-layout@1",
        hint: "Full-bleed banner, contained alert, or toast.",
        sortOrder: 300,
      },
    },
    {
      // Title + description placement axis. Composes with Layout/Position.
      // The two divider modes (square vs angled) are values on this
      // axis rather than a separate SlabEndStyle param because they
      // never apply outside divider compositions — flattening them
      // here keeps the author's choices to one dropdown.
      name: "Composition",
      shape: "enum",
      default: "stacked",
      sitecore: {
        enumHandle: "alert-composition@1",
        hint: "Title and description placement. Stacked (default) puts title above description; row places them inline; row-with-divider draws a colored title slab; row-with-angled-divider gives the slab a slash cut.",
        sortOrder: 350,
      },
    },
    {
      // Placement axis: inline vs sticky-top / sticky-bottom (CSS sticky).
      name: "Position",
      shape: "enum",
      default: "inline",
      sitecore: {
        enumHandle: "position@1",
        hint: "Inline in page flow, or pin to top / bottom.",
        sortOrder: 400,
      },
    },
    {
      name: "Dismissible",
      shape: "boolean",
      default: "true",
      sitecore: {
        type: "checkbox",
        hint: "Show the dismiss button. Defaults to true.",
        sortOrder: 500,
      },
    },
    {
      name: "DismissLabel",
      shape: "text",
      default: {
        en: "Dismiss",
        ar: "تجاهل",
        es: "Descartar",
        fr: "Ignorer",
        de: "Schließen",
        da: "Afvis",
        ja: "閉じる",
        "zh-CN": "关闭",
        "zh-TW": "關閉",
        it: "Ignora",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Accessible label for the dismiss button.",
        sortOrder: 600,
      },
    },
    {
      // Author-friendly stable handle that flows into every fired CDP
      // event's `ext.instanceKey`. Use this when you want personalization
      // rules to be readable (e.g. "suppress may-2026-announcement after
      // 3 dismissals"). When blank, events carry only the datasource id
      // (opaque GUID) — rules still work but humans have to look up which
      // alert each GUID refers to.
      name: "InstanceKey",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Stable handle for personalization (e.g. 'may-2026-announcement'). Lowercase kebab-case recommended. Leave blank to use the datasource id.",
        sortOrder: 700,
      },
    },
    {
      // Whether dismissal/view history is partitioned per-page or shared
      // across the whole site. `site` is right for system banners that
      // appear identically everywhere (maintenance notice); `page` is
      // right for content-specific alerts on one URL.
      name: "InstanceScope",
      shape: "enum",
      default: "site",
      sitecore: {
        enumHandle: "instance-scope@1",
        hint: "Scope of personalization history. Site = same banner everywhere (one shared dismissal count). Page = per-URL (count resets per page).",
        sortOrder: 800,
      },
    },
    {
      // Per-instance opt-out for analytics fires. Defaults on so authors
      // get tracking for free; flip off for placements where events would
      // muddy the data (legal notices, accessibility-only banners,
      // single-use placements you don't want polluting personalization
      // counters).
      name: "TrackEvents",
      shape: "boolean",
      default: "true",
      sitecore: {
        type: "checkbox",
        hint: "Emit view/dismiss CDP events for this placement. Uncheck to suppress entirely.",
        sortOrder: 900,
      },
    },
  ],

  placedIn: ["headless-main-{*}"],

  /**
   * Per-page Alerts folder is the auto-create target; the site-shared
   * pool covers reusable alerts (planned maintenance, account-wide
   * notices) that should appear identically across pages.
   */
  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Alerts" },
      { scope: "site", subfolder: "Site Shared Feedback/Alerts" },
    ],
  },

  /**
   * CDP events the React component fires through
   * `useComponentAnalytics("alert-banner")`. The meta shape
   * (`AlertBannerAnalyticsMeta`) is typed alongside the React code in
   * `alert-banner.tsx`.
   */
  // Type strings must match `^[a-zA-Z0-9\-_./]{1,100}$` — Sitecore Edge
  // CDP rejects `:` in the event type. Use `.` to namespace.
  events: [
    {
      name: "view",
      type: "alert-banner.viewed",
      description:
        "Fires once when the banner becomes ≥ 50% visible. Routed through SDK pageView().",
      action: "view",
      commitment: "browse",
      emitsIdentity: false,
      emitsAffinity: false,
      cdpEventType: "VIEW",
    },
    {
      name: "dismiss",
      type: "alert-banner.dismissed",
      description: "Fires when the author clicks the dismiss button.",
      action: "dismiss",
      commitment: "engage",
      emitsIdentity: false,
      emitsAffinity: false,
      cdpEventType: "CUSTOM",
    },
  ],
} satisfies ComponentTemplateRecipe;

export default alertBannerRecipe;
