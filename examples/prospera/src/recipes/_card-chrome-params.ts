import type { ComponentTemplateRecipe } from "@/lib/registry/sitecore-recipes";

/**
 * Shared chrome-axis params for every cards-and-lists recipe.
 *
 * Surface treatment, body color scheme, optional color band hosting the
 * title, and the media-bleed axis. Spread into the recipe's `params:`
 * array — each card's React component reads the matching prop (lower-
 * cased via the default convention map) and forwards to the shared
 * `ItemCard` shell in [src/components/registry/blocks/item-card.tsx].
 *
 * The `sortOrder` values land each axis after typical family-specific
 * params (which conventionally start at 100). If a family needs to
 * intersperse its own style axis between these, override the affected
 * entry inline.
 *
 * UNIVERSAL only. `TitleLinkIcon` is exported separately as
 * `cardTitleLinkIconParam` below, because three of these cards have no
 * title to decorate; a card recipe spreads this array and then adds the
 * opt-in axis if its component renders one.
 */
export const cardChromeParams: NonNullable<ComponentTemplateRecipe["params"]> =
  [
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
      name: "Style",
      shape: "enum",
      default: "flat",
      sitecore: {
        enumHandle: "card-style@1",
        hint: "Card style: flat / outline / filled / elevated (opaque raised panel with a shadow — bind when the source shows white/raised cards standing off the section, especially on dark or coloured bands).",
        section: "Style",
        sortOrder: 400,
      },
    },
    {
      name: "CardColorScheme",
      shape: "enum",
      default: "neutral",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Card body scheme. Visible only when Style is outline (border) or filled (background tint).",
        section: "Style",
        sortOrder: 500,
      },
    },
    {
      name: "ColorBand",
      shape: "enum",
      default: "none",
      sitecore: {
        enumHandle: "color-band@1",
        hint: "Optional color band hosting the title at the top of the card.",
        section: "Style",
        sortOrder: 600,
      },
    },
    {
      name: "MediaBleed",
      shape: "enum",
      default: "fullbleed",
      sitecore: {
        enumHandle: "card-media-bleed@1",
        hint: "Image treatment: `fullbleed` (edge-to-edge — image extends past padding to the card outline, the default) / `none` (inset — image sits inside the card padding, editorial opt-out) / `icon` (small icon, top-start corner).",
        section: "Style",
        sortOrder: 700,
      },
    },
    // `FooterColorScheme` (footer-color-scheme@1) was removed 2026-08 for
    // the same reason it left `CARD_STYLING_PARAMS`: the tint only paints
    // when `ItemCard` receives a `footer` node, and no cards-and-lists
    // leaf card passes one — each composes its bottom row into the
    // content slot. Re-add alongside the composition change that routes a
    // card's footer through `ItemCard`'s `footer` prop.
  ];

/**
 * `title-link-icon@1` — opt-in, because not every leaf card has a
 * title to decorate.
 *
 * Spread by the six card recipes whose component renders one (article,
 * person, product, destination, location, pricing). `review-card` (a
 * quote + author), `stats-card` (a value + label) and `offer-card` (an
 * offer sentence) leave it off — on those the glyph had nowhere to
 * attach.
 */
export const cardTitleLinkIconParam: NonNullable<
  ComponentTemplateRecipe["params"]
>[number] = {
  name: "TitleLinkIcon",
  shape: "enum",
  default: "none",
  sitecore: {
    enumHandle: "title-link-icon@1",
    hint: "Optional trailing glyph beside each card title: `chevron` or `arrow`, signalling the whole card is a link/expandable. `none` (default) keeps the plain title.",
    section: "Style",
    sortOrder: 650,
  },
};
