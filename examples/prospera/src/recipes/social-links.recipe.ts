import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for the `SocialLinks` component (./social-links.tsx).
 *
 * The LINK-OUT sibling of `social-share@1`. Where SocialShare renders
 * SHARE buttons for the *current page*, SocialLinks renders a row of
 * icons that link OUT to the brand's own social profiles (Facebook,
 * Instagram, X, LinkedIn, YouTube, TikTok, Pinterest, Threads, Reddit,
 * GitHub). It is the classic footer "follow us" social-icon row.
 *
 * **Styling API mirrors social-share exactly** — every visual axis is
 * a rendering parameter (IconStyle / Vertical / Display / Size /
 * ColorScheme / PaddingY), bound to the same shared enums, so the two
 * components read as one family. The only semantic difference is the
 * datasource: each item is an outbound `<a href>` to a brand profile,
 * not a react-share share button. There is deliberately NO analytics /
 * InstanceKey / TrackEvents surface (footer links aren't CDP-tracked
 * share actions) and NO Menu variant (a footer doesn't need a
 * dropdown) — inline `Default` row only.
 *
 * **Links is the only datasource field.** It's a Treelist of
 * `social-link-item@1` children, each carrying a `Platform`
 * (social-link-platform@1) + a `Link` (the brand's profile URL). The
 * React component reads platform token + href per item and dispatches
 * on the token — react-share's brand icon where one exists, a
 * FontAwesome brand glyph otherwise.
 */
export const socialLinksRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "social-links@1",
  icon: componentIcons["social-links@1"],
  name: "social-links",
  displayName: "Social Links",
  description:
    "Footer social-icon row that links OUT to the brand's own social profiles — Facebook, Instagram, X, LinkedIn, YouTube, TikTok, Pinterest, Threads, Reddit, GitHub. Use for 'follow us' / connect rows in a footer, contact block, or team bio. Each item is an outbound link to a brand profile URL (opens in a new tab), picked per-item from a Links Treelist. Mirrors social-share's icon styling (native brand colors, color-scheme-tinted chips, or outline chips; icons-only / labels / icons-and-labels; horizontal or vertical). This is the LINK-OUT analogue of `social-share@1` (which renders SHARE buttons for the current page) — pick social-share to let visitors share the page, pick social-links to point visitors at the brand's own profiles. Default inline-row variant only.",

  section: { handle: "social-section@1" },

  fields: [
    {
      // Multi-pick Treelist of `social-link-item@1` children — each an
      // outbound brand-profile link (Platform selector + Url). Authors
      // add / reorder items; the React component dispatches per item
      // against the matching `SocialLinkPlatform` token and renders the
      // brand icon.
      name: "Links",
      shape: "reference",
      multiple: true,
      sitecore: {
        type: "treelist",
        source: {
          kind: "filter",
          types: ["social-link-item@1"],
        },
        hint: "Pick the brand's social profiles, in display order. Each entry is a Social Link Item carrying a Platform (which network) and the brand's profile URL on that network.",
        sortOrder: 100,
      },
    },
  ],

  variants: [{ name: "Default" }],

  params: [
    {
      // Visual treatment for the platform icon chips. Same enum + same
      // three-value axis (native / color-scheme / outline) as
      // social-share so the two components stay visually consistent.
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
      // Stacking axis for the inline row.
      name: "Vertical",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Stack the social links vertically instead of in a horizontal row.",
        sortOrder: 300,
      },
    },
    {
      // What each item shows — icon chips only (default), text-only
      // labels, or icon chips with visible labels. Same enum as
      // social-share.
      name: "Display",
      shape: "enum",
      default: "icons-only",
      sitecore: {
        enumHandle: "social-display@1",
        hint: "What each social link shows: icon chips only (default, with tooltips + screen-reader labels), text-only labels, or icon chips with visible labels. Visible labels always render as neutral page text.",
        sortOrder: 400,
      },
    },
    {
      name: "Size",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "size@1",
        hint: "Icon size. Maps to the shared size scale.",
        sortOrder: 500,
      },
    },
    {
      // Tints the icon chips (Color Scheme / Outline icon styles, and
      // the FontAwesome brand-glyph chips). Network react-share icons
      // keep their brand colors under the native icon style.
      name: "ColorScheme",
      shape: "enum",
      default: "neutral",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Tint for the icon chips when IconStyle is Color Scheme or Outline. Network icons keep their brand colors under Social Native Colors; visible labels always stay page text.",
        sortOrder: 600,
      },
    },
    {
      // Mirrors social-share / container.recipe.ts. `none` is the row's
      // real default — the wrapping footer/section provides spacing.
      name: "PaddingY",
      shape: "enum",
      default: "none",
      sitecore: {
        enumHandle: "padding-y@1",
        hint: "Vertical padding token applied to the social-links row. `none` (default) — the wrapping section provides spacing. Use to give the row its own breathing room when standalone.",
        sortOrder: 700,
      },
    },
  ],

  /**
   * A social-links row is usually reused site-wide (one footer
   * placement shared across every page), so the site-shared pool is
   * the natural auto-create target; the page-scoped folder covers
   * page-specific contact blocks.
   */
  datasource: {
    templates: [{ handle: "social-links@1" }],
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "site", subfolder: "Site Shared Social/Links" },
      { scope: "page", subfolder: "Social Links" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default socialLinksRecipe;
