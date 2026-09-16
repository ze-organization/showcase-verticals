import type { ComponentTemplateRecipe } from "../lib/registry/sitecore-recipes";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for the `SocialShare` component (./social-share.tsx).
 *
 * The reference Social component. Two rendering variants — `Default`
 * (inline button row/column) and `Menu` (dropdown trigger). All visual
 * axes (icon style, orientation, labels, size, color scheme) are
 * rendering parameters per the variant-vs-parameter heuristic — same
 * underlying composition, orthogonal style.
 *
 * **Pure page-aware.** No URL / title / description / media fields on
 * the datasource. The React component reads everything from the page
 * at render time:
 *
 *   URL          window.location.origin + usePathname()
 *   Title        document.title (head)
 *   Description  meta[name="description"] (head)
 *   MediaUrl     meta[property="og:image"] (head)
 *
 * This shape is load-bearing for the "drop SocialShare on a shared
 * partial design" use case — a single share-row placement at the
 * bottom of an article-landing partial works for every article page
 * because each page's metadata drives the share payload. Per-instance
 * overrides aren't expressible today; add a per-render override prop
 * (not a Sitecore field) if a campaign-specific URL needs to ship
 * from a blog teaser.
 *
 * **Platforms is the only datasource field.** Authors pick which
 * platforms appear via the `Platforms` field. Today it's a comma-
 * separated text token list; a follow-up canary makes it a multi-
 * pick Treelist sourced from a shared `social-platform@1` enum so
 * the authoring UI matches the recipe-level guidance.
 */
export const socialShareRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "social-share@1",
  icon: componentIcons["social-share@1"],
  name: "social-share",
  displayName: "Social Share",
  description:
    "Page-aware social share buttons. Reads URL / title / description / OG image from the current page so a single placement on a shared partial design works for every page.",

  section: { handle: "social-section@1" },

  fields: [
    {
      // Multi-pick Treelist sourced from the shared `social-platform@1`
      // enumeration. Author picks which platforms appear (and in what
      // order); the React component dispatches per pick against the
      // matching `SocialPlatform` token. Adding a value to the enum
      // surfaces it here automatically on the next push.
      //
      // Needs scai ≥ 0.2.6 — `enumHandle` on `shape: "reference"` is
      // what produces the Treelist Source pointing at the enum folder
      // (with IncludeTemplatesForSelection restricting picks to value
      // items).
      name: "Platforms",
      shape: "reference",
      multiple: true,
      // Pipe-separated enum value names → resolved at SV emission to
      // ref-recipe-list pointing at the enum's value items.
      default:
        "native|copy-link|facebook|x|linkedin|pinterest|reddit|whatsapp|telegram|email",
      sitecore: {
        type: "treelist",
        enumHandle: "social-platform@1",
        hint: "Pick which share platforms appear, in order. Multi-select Treelist over the social-platform@1 enum. `native` becomes the Web Share API trigger on supported browsers (mobile-first); falls back silently on desktop.",
        sortOrder: 100,
      },
    },
  ],

  variants: [{ name: "Default" }, { name: "Menu" }],

  params: [
    {
      // Visual treatment for the platform icon chips. Composes freely
      // with Vertical/Display/Size/ColorScheme.
      name: "IconStyle",
      shape: "enum",
      default: "native",
      sitecore: {
        enumHandle: "social-share-icon-style@1",
        hint: "Icon chip treatment: Social Native Colors (default) keeps each network's brand color; Color Scheme paints the chips with the selected ColorScheme; Outline is a quiet ring + glyph in the scheme color.",
        sortOrder: 200,
      },
    },
    {
      // Stacking axis for the inline (Default) variant. No effect on
      // the Menu variant — dropdown items are always stacked.
      name: "Vertical",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Stack share buttons vertically instead of in a horizontal row. Only affects the Default variant — the Menu variant is always vertical inside the dropdown.",
        sortOrder: 300,
      },
    },
    {
      // Which parts of each platform button render.
      name: "Display",
      shape: "enum",
      default: "icons-only",
      sitecore: {
        enumHandle: "social-display@1",
        hint: "What each platform button shows: icon chips only (default, with tooltips + screen-reader labels), text-only labels, or icon chips with visible labels. Visible labels always render as neutral page text.",
        sortOrder: 400,
      },
    },
    {
      name: "Size",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "size@1",
        hint: "Icon / button size. Maps to the shared size scale.",
        sortOrder: 500,
      },
    },
    {
      // Tints the icon chips (Color Scheme / Outline icon styles, plus
      // the Web Share / Copy Link chips, which have no network brand
      // color) and the Menu variant's trigger CTA. Never the labels —
      // visible labels stay neutral page text.
      name: "ColorScheme",
      shape: "enum",
      default: "neutral",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Tint for the icon chips (Color Scheme / Outline styles and the Web Share / Copy Link chips) and the Menu trigger. Network icons keep their brand colors when IconStyle is Social Native Colors; visible labels always stay page text.",
        sortOrder: 600,
      },
    },
    {
      // CSS `position: sticky`. Right for article-side share rails.
      name: "Position",
      shape: "enum",
      default: "inline",
      sitecore: {
        enumHandle: "position@1",
        hint: "Inline in page flow (default) or pin to top / bottom of the nearest scroll container. Pair with sticky-top for article-side share rails.",
        sortOrder: 700,
      },
    },
    {
      // Mirrors container.recipe.ts. Lets authors give the share
      // row vertical breathing room when it sits between content
      // sections without wrapping in a SectionWrapper. `none` is the
      // row's real default — the wrapping section provides spacing.
      name: "PaddingY",
      shape: "enum",
      default: "none",
      sitecore: {
        enumHandle: "padding-y@1",
        hint: "Vertical padding token applied to the share row. `none` (default) — the wrapping section provides spacing. Use to give the row its own breathing room when standalone.",
        sortOrder: 750,
      },
    },
    {
      // Same personalization hooks as alert-banner — gives analytics a
      // stable handle for per-instance reporting.
      name: "InstanceKey",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Stable handle for personalization & analytics (e.g. 'article-share'). Lowercase kebab-case recommended. Leave blank to use the datasource id.",
        sortOrder: 800,
      },
    },
    {
      name: "InstanceScope",
      shape: "enum",
      default: "page",
      sitecore: {
        enumHandle: "instance-scope@1",
        hint: "Scope of analytics history. Page (default) = per-URL counters. Site = same instance everywhere (one shared counter).",
        sortOrder: 900,
      },
    },
    {
      name: "TrackEvents",
      shape: "boolean",
      default: "true",
      sitecore: {
        type: "checkbox",
        hint: "Emit CDP events for share opens, native shares, and copy-link successes. Uncheck to suppress entirely.",
        sortOrder: 1000,
      },
    },
  ],

  /**
   * Share buttons are usually placed inline on an article or product
   * page, so the page-scoped Share folder is the natural auto-create
   * target. The site-shared pool covers reusable footer / nav share
   * rows that point at a fixed campaign URL.
   */
  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Share" },
      { scope: "site", subfolder: "Site Shared Social/Share" },
    ],
  },

  /**
   * CDP events the React component fires through
   * `useComponentAnalytics("social-share")`. The meta shape
   * (`SocialShareAnalyticsMeta`) is typed alongside the React code in
   * `social-share.tsx`.
   */
  // Event type strings must match `^[a-zA-Z0-9\-_./]{1,100}$` — Sitecore
  // Edge CDP rejects `:` in the event type. Use `.` to namespace.
  // All three events survive the taxonomy migration — OOTB CDP doesn't
  // distinguish "user clicked a share button" from any other click,
  // and the Web Share + clipboard fallback flows are component-internal
  // signals the platform can't observe generically.
  events: [
    {
      name: "opened",
      type: "social-share.opened",
      description:
        "Fires when the author clicks a per-platform share button — meta carries the platform token (facebook, x, …).",
      action: "engage",
      intent: "advocacy",
      commitment: "engage",
      emitsIdentity: false,
      emitsAffinity: false,
      cdpEventType: "CUSTOM",
    },
    {
      name: "native-shared",
      type: "social-share.native-shared",
      description:
        "Fires when the Web Share API native sheet resolves successfully (user selected a target). Skipped on browsers without navigator.share.",
      action: "share",
      intent: "advocacy",
      commitment: "engage",
      emitsIdentity: false,
      emitsAffinity: false,
      cdpEventType: "SHARE",
    },
    {
      name: "copied",
      type: "social-share.copied",
      description:
        "Fires when copy-link writes to the clipboard successfully. Skipped on browsers without navigator.clipboard.",
      action: "share",
      intent: "advocacy",
      commitment: "engage",
      emitsIdentity: false,
      emitsAffinity: false,
      cdpEventType: "SHARE",
    },
  ],
} satisfies ComponentTemplateRecipe;

export default socialShareRecipe;
