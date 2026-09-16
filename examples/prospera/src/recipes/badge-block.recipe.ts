import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for the `BadgeBlock` component (./badge-block.tsx).
 *
 * Bucket choices for badge-block:
 *
 *   fields    `Label` — Single-Line Text. The badge's text content (the
 *             component's `children` slot in React).
 *
 *   variants  `default | bold | outline | rounded | rounded-bold` — the
 *             structural CVA axis. Each becomes a Variant item under
 *             <BadgeBlock>/Variants, selected per-placement via
 *             FieldNames.
 *
 *   params    `Style`, `Size`, `ColorScheme` — orthogonal modifiers.
 *             `Style` (badge-style@1) picks pill chip vs the editorial
 *             eyebrow treatment.
 */
export const badgeBlockRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "badge-block@1",
  icon: componentIcons["badge-block@1"],
  name: "badge-block",
  displayName: "Badge",
  description:
    "Short label for status, tags, or metadata. Structural variants and orthogonal size/color modifiers.",

  section: { handle: "ui-section@1" },

  fields: [
    {
      name: "Label",
      shape: "text",
      default: {
        en: "Badge",
        ar: "شارة",
        es: "Insignia",
        fr: "Badge",
        de: "Badge",
        da: "Mærke",
        ja: "バッジ",
        "zh-CN": "徽章",
        "zh-TW": "徽章",
        it: "Badge",
      },
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "The text shown inside the badge.",
        sortOrder: 100,
      },
    },
  ],

  // One Sitecore rendering variant for now. The visual differentiation
  // that used to live across (Default | Bold | Outline | Rounded |
  // RoundedBold) variants is collapsed onto the existing CVA params
  // (`Size`, `ColorScheme`, …) so a single React export
  // (`Default = BadgeBlock`) covers every authored rendering. Adding
  // more variants later is a recipe + per-variant React export pair.
  variants: [{ name: "Default" }],

  params: [
    {
      // Macro treatment: `pill` (default) = the classic filled chip;
      // `eyebrow` = the editorial uppercase tracked text label —
      // identical to the promo / article-header eyebrow treatment, so
      // one badge covers those scattered eyebrow implementations.
      name: "Style",
      shape: "enum",
      default: "pill",
      sitecore: {
        enumHandle: "badge-style@1",
        hint: "Badge treatment. `pill` (default) is the filled chip; `eyebrow` is the editorial text-only uppercase tracked label tinted by ColorScheme.",
        sortOrder: 100,
      },
    },
    {
      // Shared with every other component's Size param via `size@1`.
      // Recipe-level `default: "default"` makes the Standard Value an
      // explicit pick rather than an empty string — the param's value
      // is required for the React side's `SIZE_CLASSES[size]` lookup
      // to resolve, and a blank SV meant fresh placements rendered
      // without size classes at all.
      name: "Size",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "size@1",
        hint: "Badge size.",
        sortOrder: 110,
      },
    },
    {
      // Shared with every other component's ColorScheme param (cta-button,
      // accordion, etc.). Updates to `color-scheme@1` value list surface
      // here automatically on the next push.
      name: "ColorScheme",
      shape: "enum",
      default: "neutral",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Color role for the badge chrome — tints the fill (soft style) or the border + label (outline style). `neutral` (default) keeps the quiet gray badge.",
        sortOrder: 200,
      },
    },
  ],

  /**
   * Convention: badge datasources live in the site's Data folder.
   * Tenants with a different content layout may need a per-install override.
   */
  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      // First location is the auto-create target. Per-page Data folder
      // → SXA materialises `<page>/Data/Badges/` lazily on first drop,
      // keeping each page's badges scoped to that page.
      { scope: "page", subfolder: "Badges" },
      // Site-shared pool — for re-using common badges (status pills,
      // category labels, etc.) across pages. The Browse picker shows
      // both locations; authors can pick from here or auto-create new.
      { scope: "site", subfolder: "Site Shared UI/Badges" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default badgeBlockRecipe;
