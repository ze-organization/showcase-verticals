import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for the `CountdownBanner` component (./countdown-banner.tsx).
 *
 * Banner counting down to a target datetime — days / hours / minutes /
 * seconds — with eyebrow, title, description, optional CTA, and an
 * optional background image. After the target passes it shows a
 * configurable "live / started" label. Client-side interval; SSR-safe
 * (deterministic `--` placeholders until mount).
 */
export const countdownBannerRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "countdown-banner@1",
  icon: componentIcons["countdown-banner@1"],
  name: "countdown-banner",
  displayName: "Countdown Banner",
  description:
    "Full-width banner counting down to a target datetime with days/hours/minutes/seconds, eyebrow, title, description, optional CTA link, and optional background image. Shows a configurable 'live/started' label after expiry. Use for event launches, kick-offs, on-sales, releases, campaign deadlines. Tone, alignment, and size via params; the CTA renders through the shared CTA Button and carries the standard action params (CtaVariant / CtaColorScheme / CtaSize / CtaIconName). Variants: Default.",
  section: { handle: "heros-and-promos-section@1" },
  fields: [
    {
      name: "Eyebrow",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Small uppercase line above the title, e.g. 'Opening ceremony'.",
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "Title",
      shape: "text",
      default: {
        en: "The countdown is on",
        ar: "العد التنازلي بدأ",
        es: "La cuenta atrás ha comenzado",
        fr: "Le compte à rebours est lancé",
        de: "Der Countdown läuft",
        da: "Nedtællingen er i gang",
        ja: "カウントダウン開始",
        "zh-CN": "倒计时开始",
        "zh-TW": "倒數計時開始",
        it: "Il conto alla rovescia è iniziato",
      },
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "Banner headline above the countdown grid.",
        section: "Content",
        sortOrder: 200,
      },
    },
    {
      name: "Description",
      shape: "text",
      sitecore: {
        type: "multi-line-text",
        hint: "Supporting copy under the title.",
        section: "Content",
        sortOrder: 300,
      },
    },
    {
      name: "TargetDate",
      shape: "datetime",
      default: "2027-01-01T00:00:00Z",
      sitecore: {
        type: "datetime",
        required: true,
        hint: "The moment the countdown targets. After it passes, the banner shows the Expired Label instead of the grid.",
        section: "Content",
        sortOrder: 400,
      },
    },
    {
      name: "ExpiredLabel",
      shape: "text",
      default: {
        en: "We're live!",
        ar: "نحن على الهواء!",
        es: "¡Ya estamos en directo!",
        fr: "C'est parti !",
        de: "Wir sind live!",
        da: "Vi er live!",
        ja: "開始しました！",
        "zh-CN": "已经开始！",
        "zh-TW": "已經開始！",
        it: "Siamo in diretta!",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Label shown in place of the countdown once the target has passed, e.g. 'We're live!', 'Doors open'.",
        section: "Content",
        sortOrder: 500,
      },
    },
    {
      name: "Cta",
      shape: "link",
      sitecore: {
        type: "general-link",
        hint: "Optional call-to-action link, e.g. 'Get tickets'. Rendered as a design-system button; style it with the CtaVariant / CtaColorScheme / CtaSize / CtaIconName params.",
        section: "Content",
        sortOrder: 600,
      },
    },
    {
      name: "BackgroundImage",
      shape: "image",
      // Deliberately NO `role` and NO `default`: the banner renders as a
      // solid tonal surface by default; a role would make the installer's
      // image-defaults map fill the slot on every install.
      sitecore: {
        type: "image",
        hint: "Optional full-bleed background image behind the banner. Painted with a dim layer for legibility.",
        section: "Content",
        sortOrder: 700,
      },
    },
  ],
  params: [
    {
      name: "ColorScheme",
      shape: "enum",
      default: "primary",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Solid color of the banner band. Paints the full-bleed background with the scheme's bold fill and flips the text to the matching on-color; `none` keeps the page surface. Covered by the BackgroundImage when one is set — the text tone then follows BackgroundScrim instead.",
        section: "Style",
        sortOrder: 100,
      },
    },
    {
      name: "BackgroundScrim",
      shape: "enum",
      default: "dark",
      sitecore: {
        enumHandle: "background-scrim@1",
        hint: "Scrim over the BackgroundImage. `dark` (default) dims the photo and flips the banner text light; `light` washes it and keeps text dark; `none` leaves the image untreated. No effect without a BackgroundImage.",
        section: "Style",
        sortOrder: 110,
      },
    },
    {
      name: "BackgroundPosition",
      shape: "enum",
      default: "center",
      sitecore: {
        enumHandle: "background-position@1",
        hint: "Crop anchor of the BackgroundImage (`object-position`) — `center` / `top` / `bottom`. No effect without a BackgroundImage.",
        section: "Style",
        sortOrder: 120,
      },
    },
    // ─── Action (the shared CTA Button vocabulary) ────────────────
    {
      name: "CtaVariant",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "button-variant@1",
        hint: "Visual treatment of the CTA button. Same enum as CTA Button: default (filled) / outline / ghost / link / pill.",
        section: "Action",
        sortOrder: 300,
      },
    },
    {
      name: "CtaColorScheme",
      shape: "enum",
      default: "white",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Color scheme of the CTA button. Independent of SurfaceTone; defaults to `white` so the button stays readable on the banner's saturated default band.",
        section: "Action",
        sortOrder: 310,
      },
    },
    {
      name: "CtaSize",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "size@1",
        hint: "CTA button size (shared size scale). `default` keeps the button's natural size.",
        section: "Action",
        sortOrder: 320,
      },
    },
    {
      name: "CtaIconName",
      shape: "enum",
      default: "none",
      sitecore: {
        enumHandle: "icon-name@1",
        hint: "Leading icon (icon-name@1 vocabulary, e.g. `ticket`, `calendar`) rendered before the CTA label. Pick `none` to clear a previously picked icon.",
        section: "Action",
        sortOrder: 330,
      },
    },
    {
      name: "Alignment",
      shape: "enum",
      default: "center",
      sitecore: {
        enumHandle: "alignment@1",
        hint: "Inline-axis alignment of the content. `start` / `end` are RTL-aware logical edges.",
        section: "Layout",
        sortOrder: 200,
      },
    },
    {
      // Shared `size@1` enum via enumHandle — an inline pipe-list
      // Droplist Source does NOT render its values in Pages chrome
      // (the picker shows up empty), so the param must reference a
      // real enumeration item like every other Size param does.
      name: "Size",
      shape: "enum",
      default: "md",
      sitecore: {
        enumHandle: "size@1",
        hint: "Banner scale — padding, headline type, and digit size. Native steps are sm / md / lg; `default` = md, `xs` and `xl` clamp to the nearest native step.",
        section: "Layout",
        sortOrder: 210,
      },
    },
  ],
  variants: [{ name: "Default" }],
  placedIn: ["headless-main-{*}"],
  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Countdown Banners" },
      { scope: "site", subfolder: "Countdown Banners" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default countdownBannerRecipe;
