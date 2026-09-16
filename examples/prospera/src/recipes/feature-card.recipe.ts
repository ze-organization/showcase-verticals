import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for `FeatureCard` — the leaf card rendering for the features
 * family. Authors drop these into the `cards-features-{*}` placeholder
 * exposed by `features-list-grid@1` and `features-carousel@1` (composed
 * mode); in curated mode the feature-card items themselves are the
 * Treelist targets the parent list-grid/carousel references.
 *
 * Variants map 1:1 to the React function exports in `feature-card.tsx`
 * (`FeatureCardDefault`, `FeatureCardNumbered`, `FeatureCardMediaBanded`,
 * `FeatureCardMediaStacked`, `FeatureCardIconTile`). Each variant has
 * different DOM topology — the variant boundary captures real
 * composition differences (see [[feedback-variant-vs-parameter]]).
 *
 * The `Number` parameter is only consumed by `NumberedTile` and is
 * surfaced as a per-placement override; in `NumberedGrid` the parent
 * list-grid normally derives the number from the item's ordinal, so
 * authors leave this empty unless they want a custom badge.
 */
export const featureCardRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "feature-card@1",
  icon: componentIcons["feature-card@1"],
  name: "feature-card",
  displayName: "Feature Card",
  description:
    "Single feature card. Variants: Default (bare title + body + arrow), NumberedTile (large ordinal + title + body), MediaBanded (image with overlaid title band), MediaStacked (image on top, text below), Horizontal (media-left row: image start, title + body + CTA end — pick when the source shows side-by-side image + copy), IconTile (small icon + title + body + pill CTA).",
  section: { handle: "cards-and-lists-section@1" },
  fields: [
    {
      name: "Title",
      shape: "text",
      default: {
        en: "Feature title",
        ar: "عنوان الميزة",
        es: "Título de la característica",
        fr: "Titre de la fonctionnalité",
        de: "Titel des Features",
        da: "Funktionstitel",
        ja: "機能のタイトル",
        "zh-CN": "功能标题",
        "zh-TW": "功能標題",
        it: "Titolo della funzionalità",
      },
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "Feature title — the card's primary heading.",
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "Description",
      shape: "richText",
      sitecore: {
        type: "rich-text",
        hint: "Supporting copy under the title.",
        section: "Content",
        sortOrder: 200,
      },
    },
    {
      // An icon is never an image upload: the authoring surface is a
      // named-glyph dropdown, and sizing/display belong to rendering
      // params/variants.
      name: "IconName",
      shape: "enum",
      default: "none",
      sitecore: {
        enumHandle: "icon-name@1",
        hint: "Named vector icon for the IconTile variant, picked from the shared icon-name@1 vocabulary — a small mark shown above the title. Renders crisp at any size and recolors with the theme. `none` (default) shows no icon.",
        section: "Content",
        sortOrder: 300,
      },
    },
    {
      name: "Image",
      shape: "image",
      role: "content",
      sitecore: {
        type: "image",
        hint: "Optional hero image for MediaBanded / MediaStacked variants.",
        section: "Content",
        sortOrder: 400,
      },
    },
    {
      name: "Link",
      shape: "link",
      sitecore: {
        type: "general-link",
        hint: "Optional click-through destination for the card's CTA.",
        section: "Action",
        sortOrder: 100,
      },
    },
  ],
  params: [
    {
      name: "Number",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Optional ordinal label shown by the NumberedTile variant. Leave empty to let the parent list-grid derive the number from the item's position.",
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "Elevation",
      shape: "enum",
      default: "theme",
      sitecore: {
        enumHandle: "card-elevation@1",
        hint: "Shadow depth. `theme` defers to the active theme.",
        section: "Style",
        sortOrder: 200,
      },
    },
    {
      name: "Padding",
      shape: "enum",
      default: "lg",
      sitecore: {
        enumHandle: "card-padding@1",
        hint: "Inner padding density.",
        section: "Style",
        sortOrder: 300,
      },
    },
    {
      name: "CardColorScheme",
      shape: "enum",
      default: "neutral",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Card body scheme. Visible only when Style is outline (border) or filled (background tint). No effect on flat/inner cards.",
        section: "Style",
        sortOrder: 400,
      },
    },
    {
      name: "ColorBand",
      shape: "enum",
      default: "none",
      sitecore: {
        enumHandle: "color-band@1",
        hint: "Optional color band hosting the title at the top of the card. Default/MediaStacked/IconTile only; MediaBanded's title-band treatment is built-in to its variant.",
        section: "Style",
        sortOrder: 500,
      },
    },
    {
      name: "MediaBleed",
      shape: "enum",
      default: "fullbleed",
      sitecore: {
        enumHandle: "card-media-bleed@1",
        hint: "How the cover image is sized + placed within the card padding. `fullbleed` (default) extends the cover to the card edges; `none` insets it. MediaBanded/MediaStacked lean on fullbleed; IconTile uses icon mode; Default and NumberedTile ignore this.",
        section: "Style",
        sortOrder: 600,
      },
    },
    {
      name: "MediaAspect",
      shape: "enum",
      default: "auto",
      sitecore: {
        enumHandle: "media-aspect@1",
        hint: "Aspect ratio of the cover image on MediaBanded / MediaStacked (16x9 / 4x5 / 3x4 / 1x1). `auto` (default) keeps the classic 16x9. Icon / text variants ignore this.",
        section: "Style",
        sortOrder: 700,
      },
    },
    {
      name: "MediaFit",
      shape: "enum",
      default: "cover",
      sitecore: {
        enumHandle: "media-fit@1",
        hint: "How the cover image fills its box. `cover` (default) scales up and crops — right for photography. `contain` fits the whole image in, never cropping — bind for logos, brand marks, partner/analyst/award badges, certification seals, product cut-outs and screenshots, whose edges carry meaning.",
        section: "Style",
        sortOrder: 750,
      },
    },
    // No default on CtaPlacement — unset keeps the variant default
    // (footer actions row), same contract as the grid-level chrome axes.
    {
      name: "CtaPlacement",
      shape: "enum",
      sitecore: {
        enumHandle: "cta-placement@1",
        hint: "Where the CTA sits on Default / MediaBanded / MediaStacked: `footer` (default — the card's actions row) or `inline` (end of the copy block). Horizontal is inline by design; IconTile's pill button stays in the actions row.",
        section: "Style",
        sortOrder: 800,
      },
    },
    // NOTE (Liz's CTA cleanup): the `CtaShape` (cta-shape@1) param was
    // removed from the authoring surface — rounding is owned by
    // primitives/themes. The component's `ctaShape` prop stays
    // functional for placements that stored it; do not re-add.
    {
      // CTA fill — the shared `button-variant@1` axis, mirroring
      // `product-card@1`'s `CtaVariant`. Unset keeps each variant's
      // editorial default (arrow-link on Default/MediaBanded/MediaStacked/
      // Horizontal; outline pill on IconTile/OverlayPanel). Setting a
      // button fill (default = filled, outline, ghost) upgrades the
      // editorial arrow-link variants to a real Button so a source's
      // solid/outline pill CTA renders as such; `link` keeps the editorial
      // treatment. This closes the feature-card fill gap the composer's
      // captured `ctaFill` signal had nothing to bind to.
      name: "CtaVariant",
      shape: "enum",
      sitecore: {
        enumHandle: "button-variant@1",
        hint: "CTA fill: default (filled), outline, ghost, or link. Unset keeps the variant's editorial default; a button fill turns an editorial arrow-link card into a real button CTA.",
        section: "Style",
        sortOrder: 900,
      },
    },
    {
      name: "CtaIconTrailing",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Append a trailing right-arrow after the CTA label (the 'Get started →' treatment). Off by default. Honored by every variant's button CTA (IconTile/OverlayPanel always; the other variants when CtaVariant promotes them to a button).",
        section: "Style",
        sortOrder: 1000,
      },
    },
  ],
  variants: [
    { name: "Default" },
    { name: "NumberedTile" },
    { name: "MediaBanded" },
    { name: "MediaStacked" },
    { name: "Horizontal" },
    { name: "IconTile" },
    { name: "OverlayPanel" },
  ],
  placedIn: ["cards-features-{*}", "search-results-{*}"],
  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Features" },
      { scope: "site", subfolder: "Features" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default featureCardRecipe;
