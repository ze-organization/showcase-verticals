import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for the `CtaButton` component (./cta-button.tsx).
 * Phase 1 worked example for the recipes initiative.
 *
 * Compiles to ordered Authoring GraphQL mutations via the scai recipe
 * compiler. See plans/sitecore-relationships.md in showcase-orchestrater
 * for the operation sequence.
 *
 * Bucket choices for cta-button:
 *
 *   fields    `Link` — General Link. Per-content; the link text doubles as
 *             the button label, so no separate `Label` field is needed.
 *
 *   variants  Single `Default` rendering variant. Visual differentiation
 *             (default / outline / ghost / link / pill) lives on the
 *             `Variant` rendering parameter rather than per-variant React
 *             exports.
 *
 *   params    `Variant`, `Size`, `ShowArrow`, `ColorScheme`,
 *             `FontColor`, `Icon` — orthogonal presentation modifiers.
 *             Plain rendering parameters; picked per-placement.
 */
export const ctaButtonRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "cta-button@1",
  icon: componentIcons["cta-button@1"],
  name: "cta-button",
  displayName: "CTA Button",
  description:
    "Call-to-action button with a Sitecore link field, structural variants, and presentation params.",

  // Per-site folder layout (plans/recipe-site-folder-layout.md): mirrors
  // the registry item's `meta.tax.subgroup`. Component lands at
  // /sitecore/templates/Project/<site>/Components/ui/CtaButton.
  section: { handle: "ui-section@1" },

  fields: [
    {
      name: "Link",
      shape: "link",
      // Standard Values seed for auto-created datasources so a freshly
      // dropped CTA visualises immediately with a meaningful label
      // (rather than an empty button shell). Pipe-separated
      // `"<text>|<url>"`; scai's encoder emits the Sitecore link-XML
      // payload Standard Values stores natively. Authors overwrite
      // both halves at placement time via the link picker.
      //
      // The URL half is `/` on purpose — NOT `#`. A `#` URL makes
      // scai's `encodeGeneralLinkDefault` pick `linktype="anchor"`
      // WITHOUT writing the `anchor` attribute the Layout Service
      // reads the href from, so the delivered field arrives as
      // `{ href: "", text: "Get started" }` and the Link primitive
      // treats the empty href as an empty field → a freshly dropped
      // CTA rendered BLANK on the tenant. `/` encodes as a plain
      // `external` link and round-trips a real href.
      default: "Get started|/",
      sitecore: {
        type: "general-link",
        required: true,
        hint: "Where the button goes. The link text doubles as the button label.",
        sortOrder: 100,
      },
    },
  ],

  // Single Sitecore rendering variant. Visual differentiation
  // (default / outline / ghost / link / pill) lives on the `Variant`
  // rendering parameter rather than per-variant React exports, so a
  // single component covers every authored rendering. Expanding back to
  // per-variant exports later is a recipe + per-variant React export pair.
  variants: [{ name: "Default" }],

  params: [
    {
      // Maps directly to the Button primitive's `variant` CVA axis
      // (plus the CTA-level `pill` treatment). Distinct from the SXA
      // Rendering Variant (which selects between exported React
      // components — only `Default` exists here).
      name: "Variant",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "button-variant@1",
        hint: "Visual treatment of the button: default (filled), outline, ghost, or link. Corner radius comes from the theme's --button-radius token, not this param.",
        sortOrder: 100,
      },
    },
    {
      // Shared with every other component's Size param via `size@1`.
      // No `default:` override — the enum's own default (`default`)
      // cascades through, and CtaButton.tsx maps `default` to the
      // button primitive's natural default size.
      name: "Size",
      shape: "enum",
      sitecore: {
        enumHandle: "size@1",
        hint: "Button size.",
        sortOrder: 110,
      },
    },
    {
      // Orthogonal trailing-arrow toggle. Independent of `Variant` — any
      // treatment (default/outline/ghost/link) can carry the arrow. On the
      // `link` variant it renders the full editorial arrow + underline
      // treatment.
      name: "ShowArrow",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Append a trailing arrow (→) after the button label. With Variant `link` this renders the editorial arrow + underline treatment.",
        sortOrder: 150,
      },
    },
    {
      // Shared with every other component's ColorScheme param (badge,
      // accordion, etc.). Updates to `color-scheme@1` value list surface
      // here automatically on the next push.
      name: "ColorScheme",
      shape: "enum",
      default: "primary",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Color role for the button — fill on solid variants, border + label on outline, label only on ghost/link. `primary` (default) is the brand action color.",
        sortOrder: 200,
      },
    },
    {
      // Label ink, independent of ColorScheme. ColorScheme owns the
      // fill (and the default paired text); this overrides the label
      // when the paired foreground doesn't read on that fill — e.g.
      // Brand Accent 1 fill + White text. Reuses `heading-color@1`
      // (`text-<role>` / theme white-black) so the vocabulary stays
      // one list. `default` keeps the scheme's own text token.
      name: "FontColor",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "heading-color@1",
        hint: "Label color, independent of ColorScheme. Default keeps the scheme's paired text. White/Black are fixed theme literals for contrast on a brand fill.",
        sortOrder: 210,
      },
    },
    {
      // Leading icon from the curated `icon-name@1` vocabulary — same
      // enum card-block's IconName badge uses, so the composer picks
      // from one vocabulary everywhere. Renders before the label,
      // sized to the button text.
      // Renamed from `Icon` (2026-07 param normalization — `Icon` is now
      // reserved nowhere; IconName is the one icon authoring surface).
      // The React side reads the old name as a permanent alias — scai
      // CreateOnly leaves the stale Icon field (with stored values) on
      // existing tenants.
      name: "IconName",
      shape: "enum",
      default: "none",
      sitecore: {
        enumHandle: "icon-name@1",
        hint: "Leading icon (icon-name@1 vocabulary, e.g. `download`, `phone`) rendered before the button label. Pick `none` to clear a previously picked icon.",
        sortOrder: 250,
      },
    },
  ],

  placedIn: [
    "header-end-{*}",
    "header-utility-start-{*}",
    "header-utility-end-{*}",
    "headless-main-{*}",
  ],

  /**
   * Convention: CTA datasources live in the site's Data folder.
   * Tenants with a different content layout may need a per-install
   * override.
   */
  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      // Per-page CTAs land in `<page>/Data/CTAs/` — auto-create target.
      { scope: "page", subfolder: "CTAs" },
      // Site-shared CTA pool for reusable links ("Contact us", "Get
      // started"). Browse picker offers both.
      { scope: "site", subfolder: "Site Shared UI/CTAs" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default ctaButtonRecipe;
