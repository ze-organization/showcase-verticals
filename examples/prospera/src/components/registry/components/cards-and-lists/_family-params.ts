import type { ParamDefinition } from "@/lib/registry/sitecore-recipes";

/**
 * Family-specific rendering parameters for the cards-and-lists grids and
 * carousels.
 *
 * These are the per-family knobs that CANNOT live in the shared
 * `card-list-shared-params.ts` bundle because each family allows a
 * DIFFERENT set of values (there is no single shared card-variant enum —
 * an offers card is `simple/complex/deal`, an articles card is
 * `default/title-only/image-title-only/overlay`, and so on). Each family
 * binds its own `<family>-card-variant@1` enum.
 *
 * A family rendering declares these by INLINING its params (spreading the
 * shared `CARD_*` groups plus the family constant here) rather than
 * referencing the shared external `card-list-grid-params@1` /
 * `card-carousel-params@1` template — the recipe schema makes
 * `parameters: { handle }` and inline `params` mutually exclusive, and the
 * shared external template can't carry per-family values. This mirrors the
 * inline-params approach the locations recipes already use.
 *
 * Every param here is CONSUMED by the family's `<family>.sitecore.ts`
 * adapter (`params?.CardVariant`, `params?.Action`, …) — declared and
 * read together, per the no-dead-params rule.
 */

/**
 * `CompactSlideVariant` factory — the spotlight companion to each
 * family's `CardVariant`, binding the SAME family variant enum. Consumed
 * by the family CAROUSEL only while `SlideEmphasis` is `spotlight`:
 * non-active (compact) edge slides render this shape instead of
 * CardVariant. No default — unset keeps CardVariant on every slide
 * (compacts are just scaled down and dimmed).
 */
const compactSlideVariantParam = (
  enumHandle: string,
  lighterShapes: string,
): ParamDefinition => ({
  name: "CompactSlideVariant",
  shape: "enum",
  sitecore: {
    enumHandle,
    hint: `Spotlight carousels only (SlideEmphasis = spotlight): card shape for the non-active compact edge slides — bind a lighter shape (${lighterShapes}) when the source shows small flanking cards that differ from the big spotlight card. Unset keeps CardVariant on every slide. Uniform carousels ignore it.`,
    section: "Card",
    sortOrder: 91,
  },
});

/** articles-carousel@1 → `articles.sitecore.ts` (spotlight compacts). */
export const ARTICLE_COMPACT_SLIDE_VARIANT_PARAM = compactSlideVariantParam(
  "article-card-variant@1",
  "e.g. image-title-only or title-only",
);

/** offers-carousel@1 → `offers.sitecore.ts` (spotlight compacts). */
export const OFFER_COMPACT_SLIDE_VARIANT_PARAM = compactSlideVariantParam(
  "offer-card-variant@1",
  "e.g. simple",
);

/** destinations-carousel@1 → `destinations.sitecore.ts` (spotlight compacts). */
export const DESTINATION_COMPACT_SLIDE_VARIANT_PARAM = compactSlideVariantParam(
  "destination-card-variant@1",
  "e.g. compact or essential",
);

/** locations-carousel@1 → `locations.sitecore.ts` (spotlight compacts). */
export const LOCATION_COMPACT_SLIDE_VARIANT_PARAM = compactSlideVariantParam(
  "location-card-variant@1",
  "e.g. compact or pin",
);

/** person-carousel@1 → `persons.sitecore.ts` (spotlight compacts). */
export const PERSON_COMPACT_SLIDE_VARIANT_PARAM = compactSlideVariantParam(
  "person-card-variant@1",
  "e.g. image-title-only or title-only",
);

/** products-carousel@1 → `products.sitecore.ts` (spotlight compacts). */
export const PRODUCT_COMPACT_SLIDE_VARIANT_PARAM = compactSlideVariantParam(
  "product-card-variant@1",
  "e.g. compact or minimal",
);

/** reviews-carousel@1 → `reviews.sitecore.ts` (spotlight compacts). */
export const REVIEW_COMPACT_SLIDE_VARIANT_PARAM = compactSlideVariantParam(
  "review-card-variant@1",
  "e.g. card",
);

/** articles-list-grid@1 / articles-carousel@1 → `articles.sitecore.ts`. */
export const ARTICLE_CARD_VARIANT_PARAM: ParamDefinition = {
  name: "CardVariant",
  shape: "enum",
  default: "default",
  sitecore: {
    enumHandle: "article-card-variant@1",
    hint: "Card shape forwarded to every article card in curated mode: default (image + meta + excerpt), title-only, image-title-only (image-forward), or overlay (photo card with gradient scrim). Bind from the source card treatment.",
    section: "Card",
    sortOrder: 90,
  },
};

/** offers-list-grid@1 / offers-carousel@1 → `offers.sitecore.ts`. */
export const OFFER_CARD_VARIANT_PARAM: ParamDefinition = {
  name: "CardVariant",
  shape: "enum",
  default: "simple",
  sitecore: {
    enumHandle: "offer-card-variant@1",
    hint: "Card shape forwarded to every offer card in curated mode: simple (offer text + code), complex (richer layout), or deal (deal-forward treatment).",
    section: "Card",
    sortOrder: 90,
  },
};

/**
 * offers-list-grid@1 / offers-carousel@1 → `offers.sitecore.ts` `Action`.
 * Reuses the existing `offer-action@1` enum (auto / link / copy / none).
 */
export const OFFER_ACTION_PARAM: ParamDefinition = {
  name: "Action",
  shape: "enum",
  default: "auto",
  sitecore: {
    enumHandle: "offer-action@1",
    hint: "Card action forwarded to every offer card: auto (link when a URL is present, else copy the code), link, copy, or none.",
    section: "Card",
    sortOrder: 92,
  },
};

/** destinations-list-grid@1 / destinations-carousel@1 → `destinations.sitecore.ts`. */
export const DESTINATION_CARD_VARIANT_PARAM: ParamDefinition = {
  name: "CardVariant",
  shape: "enum",
  default: "tile",
  sitecore: {
    enumHandle: "destination-card-variant@1",
    hint: "Card shape forwarded to every destination card in curated mode: tile (default), full, compact, essential, hero, highlight, listing-horizontal, or listing-horizontal-comprehensive.",
    section: "Card",
    sortOrder: 90,
  },
};

/**
 * destinations-list-grid@1 / destinations-carousel@1 →
 * `destinations.sitecore.ts` `PriceTreatment`.
 */
export const DESTINATION_PRICE_TREATMENT_PARAM: ParamDefinition = {
  name: "PriceTreatment",
  shape: "enum",
  default: "standard",
  sitecore: {
    enumHandle: "price-treatment@1",
    hint: "Whether destination cards show a starting-price callout: standard (no price) or with-price (StartingPrice badge).",
    section: "Card",
    sortOrder: 92,
  },
};

/** locations-carousel@1 → `locations.sitecore.ts` (carousel only). */
export const LOCATION_CARD_VARIANT_PARAM: ParamDefinition = {
  name: "CardVariant",
  shape: "enum",
  default: "compact",
  sitecore: {
    enumHandle: "location-card-variant@1",
    hint: "Card shape forwarded to every location card in a curated carousel: compact (default), default, inline, or pin.",
    section: "Card",
    sortOrder: 90,
  },
};

/** person-list-grid@1 / person-carousel@1 → `persons.sitecore.ts`. */
export const PERSON_CARD_VARIANT_PARAM: ParamDefinition = {
  name: "CardVariant",
  shape: "enum",
  default: "default",
  sitecore: {
    enumHandle: "person-card-variant@1",
    hint: "Card shape forwarded to every person/doctor card in curated mode: default (headshot + name + role + bio), title-only, image-title-only, or overlay.",
    section: "Card",
    sortOrder: 90,
  },
};

/** products-list-grid@1 / products-carousel@1 → `products.sitecore.ts`. */
export const PRODUCT_CARD_VARIANT_PARAM: ParamDefinition = {
  name: "CardVariant",
  shape: "enum",
  default: "default",
  sitecore: {
    enumHandle: "product-card-variant@1",
    hint: "Card shape forwarded to every product card in curated mode: default, compact, minimal, horizontal-essential, horizontal-detailed, or detail-panel.",
    section: "Card",
    sortOrder: 90,
  },
};

/** reviews-list-grid@1 / reviews-carousel@1 → `reviews.sitecore.ts`. */
export const REVIEW_CARD_VARIANT_PARAM: ParamDefinition = {
  name: "CardVariant",
  shape: "enum",
  default: "card",
  sitecore: {
    enumHandle: "review-card-variant@1",
    hint: "Card shape forwarded to every review card in curated mode: card (default — bordered testimonial panel) or quote (large pull-quote treatment).",
    section: "Card",
    sortOrder: 90,
  },
};

/**
 * reviews-list-grid@1 / reviews-carousel@1 → `reviews.sitecore.ts`
 * `ShowImages`. Off by default — Sitecore Standard Values drive the
 * initial state, so no `default` per project convention.
 */
export const REVIEW_SHOW_IMAGES_PARAM: ParamDefinition = {
  name: "ShowImages",
  shape: "boolean",
  sitecore: {
    type: "checkbox",
    hint: "Show each review author's avatar / review image. Off by default — Sitecore Standard Values drive the initial state.",
    section: "Card",
    sortOrder: 94,
  },
};

/**
 * stats-list-grid@1 / stats-carousel@1 → `stats.sitecore.ts`
 * `adaptCardThemeOptions`. The stats grid forwards these to every stat
 * card; the leaf `stats-card@1` recipe declares its own composed-mode
 * copies (Emphasis, etc.).
 */
export const STAT_CARD_ALIGN_PARAM: ParamDefinition = {
  name: "CardAlign",
  shape: "enum",
  default: "start",
  sitecore: {
    enumHandle: "alignment@1",
    hint: "Text alignment forwarded to every stat card: start (default) or center. (The `end` value falls back to start.)",
    section: "Card",
    sortOrder: 230,
  },
};

export const STAT_SHOW_LABEL_PARAM: ParamDefinition = {
  name: "ShowLabel",
  shape: "boolean",
  sitecore: {
    type: "checkbox",
    hint: "Show the metric label above each stat value. Off by default — Sitecore Standard Values drive the initial state.",
    section: "Card",
    sortOrder: 240,
  },
};

/**
 * The remaining four stat-card axes `adaptCardThemeOptions` forwards
 * from the GRID's params. Each mirrors the identically-named leaf
 * `stats-card@1` param and binds the SAME enum, so a grid author can
 * set the axis row-wide instead of card-by-card. Inline here (not in
 * the shared `CARD_*` bundles) for the same reason as `Emphasis`: only
 * the stats grids read them, and a declared-but-dead param on the other
 * 8 families misleads the AI page composer.
 */
export const STAT_TREND_DISPLAY_PARAM: ParamDefinition = {
  name: "TrendDisplay",
  shape: "enum",
  default: "badge",
  sitecore: {
    enumHandle: "trend-display@1",
    hint: "How the change/trend pairing renders on every stat card: badge (pill, default), text (inline), or none.",
    section: "Card",
    sortOrder: 260,
  },
};

export const STAT_TONE_PARAM: ParamDefinition = {
  name: "Tone",
  shape: "enum",
  default: "default",
  sitecore: {
    enumHandle: "stat-tone@1",
    hint: "Color tone forwarded to every stat card: default (foreground), neutral, primary, success, or warning.",
    section: "Card",
    sortOrder: 270,
  },
};

export const STAT_VALUE_SIZE_PARAM: ParamDefinition = {
  name: "ValueSize",
  shape: "enum",
  default: "default",
  sitecore: {
    enumHandle: "stat-value-size@1",
    hint: "Size of the prominent value text on every stat card: default, large, or xlarge.",
    section: "Card",
    sortOrder: 280,
  },
};

export const STAT_LABEL_CASE_PARAM: ParamDefinition = {
  name: "LabelCase",
  shape: "enum",
  default: "default",
  sitecore: {
    enumHandle: "label-case@1",
    hint: "Casing treatment for every stat card's metric label: default (as authored) or uppercase (small-caps tracking).",
    section: "Card",
    sortOrder: 290,
  },
};

/**
 * stats FlankedLabels grid emphasis — mirrors the leaf `stats-card@1`
 * `Emphasis` param. Removed from the shared `CARD_STYLING_PARAMS` bundle
 * (it was a no-op on the other 8 families); it lives here now because
 * only the stats grid reads `params?.Emphasis`.
 */
export const STAT_EMPHASIS_PARAM: ParamDefinition = {
  name: "Emphasis",
  shape: "enum",
  default: "value",
  sitecore: {
    enumHandle: "stat-emphasis@1",
    hint: "Stats FlankedLabels / Milestones: which slot dominates each stat — value (big number; the editorial stat-band default) or label (big label text, value de-emphasized — the inverted read).",
    section: "Card",
    sortOrder: 250,
  },
};

/**
 * stats-list-grid@1 `Milestones` only → `stats.sitecore.ts`
 * `showDividers`. Off by default — omitted `default` IS the unchecked
 * Standard Value, per project convention for boolean params.
 */
export const STAT_SHOW_DIVIDERS_PARAM: ParamDefinition = {
  name: "ShowDividers",
  shape: "boolean",
  sitecore: {
    type: "checkbox",
    hint: "Milestones only: draw a vertical hairline between stat cells (and the inline heading cell). Off by default — Sitecore Standard Values drive the initial state. Other variants ignore it.",
    section: "Layout",
    sortOrder: 150,
  },
};

/**
 * stats-list-grid@1 `Milestones` only → `stats.sitecore.ts`
 * `headingPlacement`. Binds the generic `band-heading-placement@1`
 * enum (shared with the carousel families' HeadingPlacement).
 */
export const STAT_HEADING_PLACEMENT_PARAM: ParamDefinition = {
  name: "HeadingPlacement",
  shape: "enum",
  default: "above",
  sitecore: {
    enumHandle: "band-heading-placement@1",
    hint: "Milestones only: `above` (default — the family's normal section heading) or `inline` — the heading (Eyebrow + Title + Lead) occupies the band's LEADING CELL, in the same row as the stats (bind when the source shows the heading beside the stat row). Other variants ignore it.",
    section: "Style",
    sortOrder: 105,
  },
};
