import type { ParamDefinition } from "@/lib/registry/sitecore-recipes";

/**
 * Reusable rendering-parameter definitions for the cards-and-lists family.
 *
 * Composed into per-rendering `DesignParametersTemplateRecipe`s via spread:
 *
 *   params: [...CARD_LIST_BASE_PARAMS, ...CARD_ANALYTICS_PARAMS]
 *
 * Why not a single shared `DesignParametersTemplateRecipe` referenced by every
 * family? The recipe schema makes `params:` and `parameters: { handle }`
 * mutually exclusive on a rendering — a rendering either references one
 * standalone template OR inlines its own. Sitecore parameters templates
 * don't compose via inheritance in this codebase, so reuse happens
 * TS-side: shared constants flow into multiple parameters templates,
 * each of which is self-contained.
 */

/**
 * Base layout/style params shared by every cards-and-lists rendering
 * (list-grid AND carousel). Family-specific choices (CardVariant, Action)
 * live on the datasource template, not here — that's why this set has no
 * variant or action params.
 */
export const CARD_LIST_BASE_PARAMS: ParamDefinition[] = [
  {
    name: "HeadingLayout",
    shape: "enum",
    default: "start-with-section-divider",
    sitecore: {
      enumHandle: "heading-layout@1",
      hint: "How the heading (Eyebrow + Title + Lead) lays out relative to the items — also its alignment axis. Bind from the observed source treatment: start-aligned header → start-with-section-divider (underlined) or start; centered title+subtitle stack → center; accent scribble under the title → *-with-accent.",
      section: "Style",
      sortOrder: 100,
    },
  },
  {
    name: "HeadingSize",
    shape: "enum",
    default: "default",
    sitecore: {
      enumHandle: "heading-size@1",
      hint: "Typographic scale for the section heading; the Lead scales proportionally. Bind from the measured source treatment: typical section title → default; prominent headline → large; strong headline block dominating the section (e.g. centered small-caps kicker + huge title → Eyebrow + HeadingSize xl + HeadingLayout centered) → xl.",
      section: "Style",
      sortOrder: 110,
    },
  },
  // `HeadingSplitColumns` was removed 2026-07: it promised a column
  // split "when HeadingLayout is a split variant", but heading-layout@1
  // has no split variants and no component ever read the param. Re-add
  // together with the split heading implementation if that layout
  // ships.
  {
    name: "ColorScheme",
    shape: "enum",
    default: "none",
    sitecore: {
      enumHandle: "color-scheme@1",
      hint: "Background color scheme for the section. `none` (default) keeps the section transparent so the page background shows through.",
      section: "Style",
      sortOrder: 200,
    },
  },
  {
    name: "BackgroundIntensity",
    shape: "enum",
    default: "subtle",
    sitecore: {
      enumHandle: "background-intensity@1",
      hint: "Strength of the color scheme background: `subtle` (default) uses the weak tint token, `bold` the saturated fill with inverted text. No-op while ColorScheme is `none` — there is no background to intensify.",
      section: "Style",
      sortOrder: 210,
    },
  },
  {
    name: "PaddingY",
    shape: "enum",
    default: "lg",
    sitecore: {
      enumHandle: "padding-y@1",
      hint: "Vertical padding around the section.",
      section: "Style",
      sortOrder: 220,
    },
  },
  {
    name: "MaxWidth",
    shape: "enum",
    // `wide` (1280px) is the closest shared-vocabulary value to the
    // max-w-6xl (1152px) the listing components render with today.
    default: "wide",
    sitecore: {
      enumHandle: "max-width@1",
      hint: "Maximum content width inside the section.",
      section: "Style",
      sortOrder: 230,
    },
  },
  {
    name: "OverlapTop",
    shape: "enum",
    default: "none",
    sitecore: {
      enumHandle: "overlap-top@1",
      hint: "Float the card row up over the previous section. Pick `half` when the source design shows the cards overlapping the hero's bottom edge (floating card row); `quarter` for a shallow edge clip; `full` when the cards sit mostly over the section above. Safe over any preceding section.",
      section: "Layout",
      sortOrder: 240,
    },
  },
];

/**
 * Grid-shaping params for the list-grid rendering. Carousel renderings
 * use `SlidesPerView*` instead.
 */
export const CARD_LIST_GRID_PARAMS: ParamDefinition[] = [
  {
    name: "ColumnsLg",
    shape: "enum",
    default: "3",
    sitecore: {
      enumHandle: "breakpoint-columns@1",
      hint: "Columns at the lg breakpoint (≥1024px).",
      section: "Layout",
      sortOrder: 100,
    },
  },
  {
    name: "ColumnsMd",
    shape: "enum",
    default: "2",
    sitecore: {
      enumHandle: "breakpoint-columns@1",
      hint: "Columns at the md breakpoint (≥768px).",
      section: "Layout",
      sortOrder: 110,
    },
  },
  {
    name: "ColumnsSm",
    shape: "enum",
    default: "1",
    sitecore: {
      enumHandle: "breakpoint-columns@1",
      hint: "Columns at the sm breakpoint (<768px).",
      section: "Layout",
      sortOrder: 120,
    },
  },
  {
    name: "Gap",
    shape: "enum",
    default: "md",
    sitecore: {
      enumHandle: "gap@1",
      hint: "Gap between items. Bind from the measured grid signature's gapPx: 0 → `none` (flush tiles — or use the NoSpacing variant where the family ships one), 1–16px → `sm` (tight), 17–28px → `md` (normal, default), 29–40px → `lg` (loose), >40px → `xl`. Canonical values are the gap@1 enum's; the bucket words tight/normal/loose are tolerated at runtime as aliases of sm/md/lg.",
      section: "Layout",
      sortOrder: 130,
    },
  },
  {
    name: "FeaturedFirst",
    shape: "enum",
    default: "none",
    sitecore: {
      enumHandle: "featured-first@1",
      hint: "Lead-tile treatment: `wide` spans the first tile across two columns, `tall` across two rows. Bind `wide` when the measured source grid shows its first tile spanning two columns (lead story + supporting tiles); `tall` when it spans two rows. `none` (default) keeps the uniform grid. Ignored when GridPattern is not `uniform`.",
      section: "Layout",
      sortOrder: 140,
    },
  },
  {
    name: "GridPattern",
    shape: "enum",
    default: "uniform",
    sitecore: {
      enumHandle: "grid-pattern@1",
      hint: "Tile rhythm: `uniform` (default) keeps every tile 1×1; `bento` renders a repeating asymmetric mosaic — 2×2 hero + double-width tile among 1×1 fillers, dense-packed. Bind `bento` when the measured source grid mixes large and small content tiles (not just a single promoted lead). Supersedes FeaturedFirst; reads best at 3–4 columns.",
      section: "Layout",
      sortOrder: 145,
    },
  },
];

/**
 * Card-styling params shared by both list-grid and carousel renderings.
 * Family-specific CardVariant lives on the datasource template; these
 * are orthogonal styling axes. Param names match what `withSitecore`'s
 * default convention map lowerFirsts into (`appearance`, `elevation`,
 * `padding`) on each child card.
 *
 * UNIVERSAL only — every cards-and-lists family implements all six.
 * Axes a family may or may not render (title link icon, media shape,
 * media aspect, CTA placement, CTA trailing icon) are exported
 * separately below and opted into per recipe; see the "Opt-in card
 * axes" block for why.
 */
export const CARD_STYLING_PARAMS: ParamDefinition[] = [
  {
    name: "Elevation",
    shape: "enum",
    default: "theme",
    sitecore: {
      enumHandle: "card-elevation@1",
      hint: "Shadow depth on the card. `theme` defers to the active theme.",
      section: "Card",
      sortOrder: 110,
    },
  },
  {
    name: "Padding",
    shape: "enum",
    default: "md",
    sitecore: {
      enumHandle: "card-padding@1",
      hint: "Internal padding on the card.",
      section: "Card",
      sortOrder: 120,
    },
  },
  // Curated-mode chrome pass-through: in composed mode each leaf card
  // reads these axes from its own params; in curated mode the grid
  // forwards them to every card it renders (see
  // `_card-chrome-adapter.ts` → `adaptCardChromeParams`). No default —
  // unset keeps the leaf card's own per-variant default.
  {
    name: "Style",
    shape: "enum",
    sitecore: {
      enumHandle: "card-style@1",
      hint: "Card style forwarded to every curated card: flat / outline / filled / elevated (opaque raised panel with a shadow — bind when the source shows white/raised cards standing off the section, especially on dark or coloured bands) / bare (surfaceless — transparent, no border/shadow). Unset keeps the card default.",
      section: "Card",
      sortOrder: 130,
    },
  },
  {
    name: "CardColorScheme",
    shape: "enum",
    sitecore: {
      enumHandle: "color-scheme@1",
      hint: "Card body scheme forwarded to every curated card. Visible when Style is outline (border) or filled (tint).",
      section: "Card",
      sortOrder: 140,
    },
  },
  {
    name: "ColorBand",
    shape: "enum",
    sitecore: {
      enumHandle: "color-band@1",
      hint: "Optional color band hosting the title, forwarded to every curated card.",
      section: "Card",
      sortOrder: 150,
    },
  },
  {
    name: "MediaBleed",
    shape: "enum",
    sitecore: {
      enumHandle: "card-media-bleed@1",
      hint: "Image treatment for a curated card's media box: none (inset) / fullbleed (edge-to-edge) / icon. Honored wherever the card renders its image through ItemCard's media slot. The DESTINATION and PRODUCT cards position their hero image in their own absolutely-positioned wrapper instead, so those two families ignore it — setting it there changes nothing.",
      section: "Card",
      sortOrder: 160,
    },
  },
  // `FooterColorScheme` (footer-color-scheme@1) was removed from this
  // shared bundle 2026-08: the tint only paints when `ItemCard` gets a
  // `footer` node, and **no** cards-and-lists leaf card passes one —
  // every family composes its bottom row (CTA, price, meta) into the
  // `content`/`children` slot instead. The axis therefore reached the
  // shell and rendered nothing on all 15 grids and carousels, while the
  // AI page composer kept setting it verbatim from the recipe contract.
  // Re-add it together with the composition change: the family's card
  // must route its bottom row through `ItemCard`'s `footer` prop (see
  // `ui/card-block.tsx`, which does exactly that and keeps its own
  // working `FooterColorScheme`).
  // NOTE (Liz's CTA cleanup): the shared `CtaShape` (cta-shape@1) param
  // was removed from the authoring surface — rounding is owned by
  // primitives/themes. The curated card-chrome adapter no longer reads or
  // forwards `CtaShape` either (the read was dead — no enum backed it);
  // `feature-card` keeps its own `ctaShape` prop for legacy stored values.
  // Do not re-add a CtaShape rendering param here.
  // `Emphasis` (stat-emphasis@1) was removed from this shared bundle
  // 2026-07: only `stats.sitecore.ts` ever read `params?.Emphasis`, so on
  // the other 8 families it was a declared-but-dead author knob (which the
  // AI page composer sets verbatim from the recipe contract). It now lives
  // where it's consumed — inline on the stats LIST-GRID via
  // `STAT_EMPHASIS_PARAM` in `_family-params.ts` — alongside the leaf
  // `stats-card@1` recipe's own `Emphasis`. (Narrowed again 2026-08: the
  // carousel renders the default `StatsCard`, which has no flank to
  // invert, so it declares neither the param nor reads it.) Do not
  // re-add it here.
];

/*
 * ---------------------------------------------------------------------
 * Opt-in card axes
 * ---------------------------------------------------------------------
 *
 * These five axes (six params — media aspect ships as a pair) used to
 * live in `CARD_STYLING_PARAMS`, which every cards-and-lists rendering
 * spreads wholesale. That made them universal on the authoring surface
 * while only a minority of families actually implemented them — the
 * grid forwarded the prop and the leaf card had nowhere to put it, so
 * the author (and the AI page composer, which sets recipe params
 * verbatim) got a knob that did nothing. 52 of the recipe-drift gate's
 * `param-adapter-prop-unread` findings were this one shape.
 *
 * They are now opt-in: a family recipe spreads the axis only when its
 * leaf card renders it. Adding an axis to a family means implementing
 * it in that family's card first — the gate fails the build otherwise,
 * which is the point.
 */

/**
 * `title-link-icon@1` — trailing chevron/arrow beside each curated
 * card's title.
 *
 * Opted into by the five families whose leaf card renders a title:
 * articles, person, products, destinations, locations. Reviews (a
 * quote + author), stats (a value + label) and offers (a single offer
 * sentence) have no title to decorate, so they leave it off.
 */
export const CARD_TITLE_LINK_ICON_PARAM: ParamDefinition = {
  name: "TitleLinkIcon",
  shape: "enum",
  sitecore: {
    enumHandle: "title-link-icon@1",
    hint: "Optional trailing glyph beside every curated card's title: `chevron` or `arrow`, signalling the whole card is a link/expandable. Unset/`none` keeps the plain title.",
    section: "Card",
    sortOrder: 155,
  },
};

/**
 * `media-shape@1` — circle / rounded framing of the media box.
 *
 * Person only. `person-card` uses it for the classic circular-headshot
 * treatment (`personMediaClassName`); no other family's card varies its
 * media framing, so the axis stays off their templates.
 */
export const CARD_MEDIA_SHAPE_PARAM: ParamDefinition = {
  name: "MediaShape",
  shape: "enum",
  sitecore: {
    enumHandle: "media-shape@1",
    hint: "Framing of each curated card's media box, orthogonal to aspect: `circle` clips the media to a full circle (forces a square box — headshots, story thumbnails), `rounded` applies the theme card radius, `default` keeps the variant chrome. Bind `circle` when the source shows circle-framed imagery.",
    section: "Card",
    sortOrder: 165,
  },
};

/**
 * `media-aspect@1` + `tile-aspect@1` — the media box's shape.
 *
 * Shipped as a pair because they ride a single channel: the chrome
 * adapter folds `TileAspect` (the measured-signature vocabulary) into
 * the same `mediaAspect` prop, with an explicit `MediaAspect` winning.
 * A family that can't honour one can't honour the other, so they are
 * opted into together.
 *
 * Opted OUT only where there is no media box to reshape, which is a
 * property of the card and not a gap to fill later:
 *
 *   stats   a value/label panel — renders no image
 *   offer   an offer sentence — renders no image
 *   review  a circular author Avatar; an aspect ratio on a round
 *           thumbnail is meaningless
 */
export const CARD_MEDIA_ASPECT_PARAMS: ParamDefinition[] = [
  {
    name: "MediaAspect",
    shape: "enum",
    sitecore: {
      enumHandle: "media-aspect@1",
      hint: "Media aspect ratio for a curated card's image box (16x9 / 4x5 / 3x4 / 1x1). Honored by article Standard/Featured/ImageLed/Overlay, feature MediaBanded/MediaStacked, destination (all image variants), location Default, product, and — CardVariant `overlay` ONLY — person. `auto`/unset keeps each variant's own sizing, so leaving it alone changes nothing. Wins over TileAspect when both are set.",
      section: "Card",
      sortOrder: 170,
    },
  },
  {
    name: "TileAspect",
    shape: "enum",
    sitecore: {
      enumHandle: "tile-aspect@1",
      hint: "Measured tile shape for a curated card's media box (text tiles unaffected). Bind from the measured grid signature's tileAspect: ~1.0 → `square`, >1.3 → `landscape`, <0.8 → `portrait`; `auto`/unset keeps the variant default. Honored wherever MediaAspect is — including person only under CardVariant `overlay`. An explicit MediaAspect wins over this, so setting both leaves this one with no effect.",
      section: "Card",
      sortOrder: 180,
    },
  },
];

/**
 * `cta-placement@1` — inline (in the copy flow) vs footer (actions row).
 *
 * Articles only among the families that inline their params;
 * `feature-card` also honours it in composed mode via its own recipe.
 * Every other family's card renders its CTA in one fixed position.
 */
export const CARD_CTA_PLACEMENT_PARAM: ParamDefinition = {
  name: "CtaPlacement",
  shape: "enum",
  sitecore: {
    enumHandle: "cta-placement@1",
    hint: "Where each curated card's CTA sits: `inline` flows it at the end of the copy; `footer` pins it in the card's actions row so CTAs align across the row. Honored by article Standard/Featured and feature Default/MediaBanded/MediaStacked; unset keeps each variant's default (articles inline, features footer).",
    section: "Card",
    sortOrder: 190,
  },
};

/**
 * Trailing-arrow adornment on a curated card's button-style CTA.
 *
 * Lives on the shared `card-list-grid-params@1` template, whose two
 * consumers both render it: `features-list-grid` forwards it to
 * `feature-card`, and `pricing-list-grid` forwards it to
 * `pricing-card`'s CTA `showArrow` slot. It is off the carousel
 * template (neither carousel forwards it) and off all sixteen families
 * that inline their own params — none of their cards implement it.
 */
export const CARD_CTA_ICON_TRAILING_PARAM: ParamDefinition = {
  name: "CtaIconTrailing",
  shape: "boolean",
  sitecore: {
    type: "checkbox",
    hint: "Append a trailing right-arrow adornment after each curated card's button-style CTA label (the circular-/chevron-arrow 'Get started →' treatment). Rides the CTA button's trailing-adornment slot, so authored link text is preserved. Off by default — Sitecore Standard Values drive the initial state; no React-side default per project convention.",
    section: "Card",
    sortOrder: 210,
  },
};

/**
 * `band-heading-placement@1` — heading above the items (default) or in
 * the band's leading column (`inline`). Shared by carousels, the media
 * gallery, and the media wall. HeadingLayout still owns alignment /
 * chrome inside whichever slot this places.
 */
export const CARD_HEADING_PLACEMENT_PARAM: ParamDefinition = {
  name: "HeadingPlacement",
  shape: "enum",
  default: "above",
  sitecore: {
    enumHandle: "band-heading-placement@1",
    hint: "Where the section heading (Eyebrow + Title + Lead) sits relative to the items: `above` (default — heading on its own row) or `inline` (heading occupies the band's leading column, items flow beside it). HeadingLayout keeps owning alignment/chrome inside that slot. On carousels, the `header` NavigationLayout supersedes `inline`.",
    section: "Style",
    sortOrder: 105,
  },
};

/**
 * Carousel-only viewport + behavior params. Combined with
 * `CARD_LIST_BASE_PARAMS` and `CARD_STYLING_PARAMS` to form the carousel
 * rendering's parameters template.
 *
 * `AutoplayDelayMs` is the canonical name — `AutoplayDelay`,
 * `AutoplayInterval`, and `AutoplayMs` are all dropped.
 */
export const CARD_CAROUSEL_PARAMS: ParamDefinition[] = [
  CARD_HEADING_PLACEMENT_PARAM,
  {
    name: "SlideEmphasis",
    shape: "enum",
    default: "uniform",
    sitecore: {
      enumHandle: "carousel-slide-emphasis@1",
      hint: "How slides share visual weight: `uniform` (default) keeps every slide the same size; `spotlight` center-aligns the strip and renders the selected slide full-size with scaled-down, dimmed neighbours peeking at the edges — clicking a compact slide advances it into the spotlight. Bind `spotlight` when the source shows one large active card flanked by small edge cards (Guinness-style spotlight slider); pair with CompactSlideVariant (where the family has one), `edge-stacked` NavigationLayout, and Loop.",
      section: "Carousel",
      sortOrder: 90,
    },
  },
  {
    name: "SlidesPerViewLg",
    shape: "number",
    default: "3",
    sitecore: {
      hint: "Slides visible at the lg breakpoint.",
      section: "Carousel",
      sortOrder: 100,
    },
  },
  {
    name: "SlidesPerViewMd",
    shape: "number",
    default: "2",
    sitecore: {
      hint: "Slides visible at the md breakpoint.",
      section: "Carousel",
      sortOrder: 110,
    },
  },
  {
    name: "SlidesPerViewSm",
    shape: "number",
    default: "1",
    sitecore: {
      hint: "Slides visible at the sm breakpoint.",
      section: "Carousel",
      sortOrder: 120,
    },
  },
  {
    name: "SpaceBetween",
    shape: "integer",
    default: "16",
    sitecore: {
      hint: "Pixel gap between slides.",
      section: "Carousel",
      sortOrder: 130,
    },
  },
  {
    name: "Autoplay",
    shape: "boolean",
    sitecore: {
      type: "checkbox",
      hint: "Auto-advance slides. Respects prefers-reduced-motion. Off by default — Sitecore Standard Values drives the initial state; no React-side default per project convention.",
      section: "Behavior",
      sortOrder: 200,
    },
  },
  {
    name: "AutoplayDelayMs",
    shape: "integer",
    default: "6000",
    sitecore: {
      hint: "Milliseconds between auto-advance ticks. Minimum 1000.",
      section: "Behavior",
      sortOrder: 210,
    },
  },
  {
    name: "Loop",
    shape: "boolean",
    sitecore: {
      type: "checkbox",
      hint: "Loop back to the first slide after the last.",
      section: "Behavior",
      sortOrder: 220,
    },
  },
  {
    name: "Navigation",
    shape: "boolean",
    sitecore: {
      type: "checkbox",
      hint: "Show previous / next navigation arrows.",
      section: "Behavior",
      sortOrder: 230,
    },
  },
  {
    name: "NavigationLayout",
    shape: "enum",
    default: "inline",
    sitecore: {
      enumHandle: "carousel-navigation-layout@1",
      hint: "Where the navigation arrows sit relative to the slides. `inline` flanks the whole strip; `overlay` floats the arrows over it; `header` puts them in the heading row's top corner (ketelone style); `center-flank` floats them on the center slide's edges in a 3-up layout; `edge-stacked` stacks prev/next in a column at the strip's end edge (pairs with spotlight SlideEmphasis). `below` is legacy and renders as `inline`.",
      section: "Behavior",
      sortOrder: 240,
    },
  },
  {
    name: "NavigationButtonStyle",
    shape: "enum",
    default: "default",
    sitecore: {
      enumHandle: "carousel-button-style@1",
      hint: "Navigation-arrow chrome: `default` (theme's soft shadow pill), `outline` (transparent fill + thin border — the boxed-arrow look), `solid` (primary fill), or `ghost` (bare glyph).",
      section: "Behavior",
      sortOrder: 242,
    },
  },
  {
    name: "NavigationButtonShape",
    shape: "enum",
    default: "default",
    sitecore: {
      enumHandle: "carousel-button-shape@1",
      hint: "Navigation-arrow corners: `default` keeps the pill; `square` uses the theme's small radius token (pair with `outline` for the boxed-arrow treatment).",
      section: "Behavior",
      sortOrder: 244,
    },
  },
  {
    name: "Pagination",
    shape: "enum",
    default: "none",
    sitecore: {
      enumHandle: "carousel-pagination@1",
      hint: "Pagination indicator style below the slides.",
      section: "Behavior",
      sortOrder: 250,
    },
  },
];

/**
 * Media-caption param — how a media tile's title/caption renders
 * relative to its image. Media-only (the tiles render through
 * `MediaItemFigure`), so it composes into the media-specific parameter
 * templates (`media-gallery-params@1` / `media-carousel-params@1`), NOT
 * the shared `card-*-params@1` templates every other family uses.
 */
export const CARD_CAPTION_PARAMS: ParamDefinition[] = [
  {
    name: "CaptionStyle",
    shape: "enum",
    default: "below",
    sitecore: {
      enumHandle: "caption-style@1",
      hint: "How each media caption renders: `none` (hidden), `below` (under the image, default), `overlay` (over the image on a scrim), or `card` (image + caption in a bordered panel).",
      section: "Card",
      sortOrder: 130,
    },
  },
];

/**
 * Empty-state params shared by list-grid and carousel renderings.
 *
 * `FilterMode` was removed 2026-07: the inline filter control it
 * promised was never implemented in any grid/carousel — the composer
 * kept setting legal values that no-oped. Re-add with the
 * implementation. Search-mode filtering is the filter-panel rendering's
 * job, not a grid param.
 */
export const CARD_EMPTY_STATE_PARAMS: ParamDefinition[] = [
  {
    name: "EmptyStateMessage",
    shape: "text",
    sitecore: {
      type: "single-line-text",
      hint: "Message shown when no items resolve in this placement. Defaults to a family-appropriate hint.",
      section: "Behavior",
      sortOrder: 310,
    },
  },
];

/**
 * Search-experience wrapper container params. Drives default facet
 * placement, initial view, and sticky-controls behavior. The wrapper
 * owns the controller; bars and inner list/carousel renderings read
 * controller state via context.
 */
export const CARD_SEARCH_EXPERIENCE_PARAMS: ParamDefinition[] = [
  {
    name: "FacetPlacement",
    shape: "enum",
    default: "none",
    sitecore: {
      enumHandle: "facet-placement@1",
      hint: "Does not drive chrome layout. Default stacks controls above results; SidebarFacets is the facet column. Filter Panel placement follows that variant.",
      section: "Layout",
      sortOrder: 100,
    },
  },
  {
    name: "StickyControls",
    shape: "boolean",
    sitecore: {
      type: "checkbox",
      hint: "Pin the controls bar to the viewport top on scroll.",
      section: "Layout",
      sortOrder: 110,
    },
  },
  {
    name: "DefaultView",
    shape: "enum",
    default: "grid",
    sitecore: {
      enumHandle: "results-view@1",
      hint: "Initial view shape — the inner list-grid rendering switches between grid and list variants when a view-toggle bar is present.",
      section: "Layout",
      sortOrder: 120,
    },
  },
  {
    name: "ResultsPerPage",
    shape: "integer",
    default: "12",
    sitecore: {
      hint: "Initial page size. Authors can override via the results-per-page rendering if placed.",
      section: "Results",
      sortOrder: 200,
    },
  },
  {
    name: "InitialSort",
    shape: "text",
    default: "featured",
    sitecore: {
      type: "single-line-text",
      hint: "Initial sort value. Matches one of the sort options the sort-dropdown rendering exposes.",
      section: "Results",
      sortOrder: 210,
    },
  },
  {
    name: "ShowResultsSummary",
    shape: "boolean",
    sitecore: {
      type: "checkbox",
      hint: "Show the total-results count summary above the items.",
      section: "Results",
      sortOrder: 220,
    },
  },
];

// `CARD_ANALYTICS_PARAMS` (InstanceKey / InstanceScope / TrackEvents)
// was removed 2026-07: no cards-and-lists rendering ever consumed the
// analytics params — unlike hero/promo/alert-banner, the card grids
// have no `useSectionAnalytics` wiring and no CDP `events:` catalog
// entries, so declared params silently no-oped and misled the AI page
// composer. Re-add the trio to the templates together with the
// analytics implementation (see `useSectionAnalytics` +
// `use-view-tracking` for the pattern the other families use).
