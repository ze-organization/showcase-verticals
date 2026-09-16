import type React from "react";
import { Fragment, useId } from "react";
import type { ImageSource } from "@/components/registry/primitives/editables/image";
import { getSourceText } from "@/components/registry/primitives/editables/source-normalizers";
import {
  Text,
  type TextSource,
} from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import {
  colorSchemeTextClass,
  type SurfaceTone,
  surfaceToneClass,
} from "@/lib/registry/color-scheme-classes";
import {
  type InlineAccentSegment,
  parseInlineAccent,
} from "@/lib/registry/inline-accent";
import { isEnabled } from "@/lib/registry/param-parsers";
import {
  hasSectionBackgroundImage,
  parseSectionBackgroundPosition,
  parseSectionBackgroundScrim,
  SectionBackground,
  type SectionBackgroundPosition,
  type SectionBackgroundScrim,
  sectionBackgroundToneClass,
} from "@/lib/registry/section-background";
import type { CmsProps } from "@/lib/registry/sitecore";

/**
 * Normalized fields for a tagline banner — the editorial "full-width
 * text-only band" pattern. Two consumers in this codebase:
 *
 *   - SYNC's "LISTEN LOUD." display heading (large, top-start, default
 *     surface).
 *   - Northwind's "always by your side" brand band (small, centered,
 *     primary surface).
 *
 * Both share the same shape; the difference is purely alignment + size
 * + tone, exposed via `displayOptions`.
 */
export interface TaglineBannerFields {
  /** Big bold display text. */
  Tagline?: TextSource;
  /** Optional caption rendered below the tagline (e.g. "Come join us."). */
  Lead?: TextSource;
  /**
   * Optional full-bleed background image behind the band. Painted with a
   * configurable scrim for legibility (via the shared `SectionBackground`
   * helper), turning any tagline into an image banner.
   */
  BackgroundImage?: ImageSource;
}

export type TaglineBannerAlignX = "start" | "center" | "end";
export type TaglineBannerAlignY = "top" | "middle" | "bottom";
export type TaglineBannerSize = "sm" | "md" | "lg" | "xl";
export type TaglineBannerLayout =
  | "stacked"
  | "row"
  | "row-split"
  | "row-spread";
export type TaglineBannerPaddingY =
  | "auto"
  | "none"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl";
/**
 * SurfaceTone is now wired to the shared `color-scheme@1` enum so
 * authors get the same dropdown as every other component. Tagline
 * banner only paints the bg + foreground (no "subtle" intensity axis
 * — that's a Container concern), so the map below pairs each scheme
 * directly with its `bg-*` / `text-*-foreground` tokens.
 */
export type TaglineBannerSurfaceTone = SurfaceTone;

/**
 * Flat props delivered by `withSitecore`'s default convention:
 *   - `fields.Tagline` → `tagline`
 *   - `fields.Lead`    → `lead`
 *   - `params.AlignX` / `AlignY` / `Size` / `SurfaceTone` → camelCased
 *   - `params.RenderingIdentifier` → `id` (from `CmsProps`)
 *   - `params.styles`              → `styles` (from `CmsProps`)
 */
export interface TaglineBannerProps extends CmsProps {
  /** Big bold display text. */
  tagline?: TextSource;
  /** Optional caption rendered below the tagline. */
  lead?: TextSource;
  /** Inline-axis alignment of the text block. RTL-aware via start/end. */
  alignX?: TaglineBannerAlignX;
  /** Block-axis alignment within the banner's height. */
  alignY?: TaglineBannerAlignY;
  /**
   * Banner height + tagline type scale.
   *   sm — thin brand strip (~64px tall, body-sized tagline).
   *   md — medium band (~128px tall, h2-sized tagline).
   *   lg — section-height (~256px tall, display-sized tagline).
   *   xl — full editorial display panel (~384px tall, oversized tagline).
   */
  size?: TaglineBannerSize;
  /**
   * Tagline + lead composition.
   *   - `stacked` (default): single column, tagline above lead.
   *   - `row`: inline flow, tagline + lead side-by-side at content width.
   *   - `row-split`: 50/50 split, tagline start half, lead end half.
   *   - `row-spread`: tagline pinned start, lead pinned end (justify-between).
   */
  layout?: TaglineBannerLayout;
  /** Background tone + foreground text color, aligned to `color-scheme@1`. */
  colorScheme?: TaglineBannerSurfaceTone;
  /** Vertical padding band applied as `py-*`. */
  paddingY?: TaglineBannerPaddingY;
  /**
   * When enabled, the tagline scrolls horizontally as a continuous
   * marquee (SYNC's "LISTEN LOUD." / "IN THE MUSIC." strips) instead of
   * rendering as a static block. `layout` doesn't apply; `lead` renders
   * as a static caption below the scrolling track (aligned by `alignX`).
   * Arrives from Sitecore as a string-boolean; a real boolean from
   * React-side callers also works.
   */
  marquee?: boolean | string;
  /**
   * Tint for `{{accent}}…{{/accent}}` spans typed inside the Tagline
   * field (see `src/lib/registry/inline-accent.ts`). `color-scheme@1`
   * value resolved to role text (`text-<role>`); defaults to `accent`.
   */
  accentColor?: string;
  /** Optional full-bleed background image behind the band. */
  backgroundImage?: ImageSource;
  /**
   * LEGACY. Scrim over the background image. The authoring param was
   * REMOVED — it only did anything with a BackgroundImage set, and it
   * expressed the band's tone INDIRECTLY (dim the photo so text reads)
   * in competition with `colorScheme`, the axis that actually owns this
   * band's background. New placements get colour control in one place.
   *
   * Still FUNCTIONAL for stored values, deliberately: going inert would
   * silently re-treat every placement that had chosen `light` or `none`,
   * and a scrim is load-bearing for legibility over a photo. Same
   * contract as promo's retired `mediaAutoplay` / `mediaClickToLoad`
   * aliases. Unset falls back to `dark`, the retired param's default.
   */
  backgroundScrim?: string;
  /** Crop anchor of the background image — `center` / `top` / `bottom`. */
  backgroundPosition?: string;
  /** Escape-hatch className for the inner tagline element. */
  taglineClassName?: string;
  /** Escape-hatch className for the inner lead element. */
  leadClassName?: string;
  /**
   * Optional extra content appended below the lead, inside the banner's
   * own surface. Lets experiences append navigation rows, link lists,
   * or other compositions to a tagline (e.g. SYNC's footer banner
   * pairs "Let's sync." with category + utility nav strips on the same
   * `bg-accent` panel).
   */
  children?: React.ReactNode;
}

// Default vertical padding per size. The band has NO min-height — its
// height is always `tagline type + padding`, so `Size` (type scale) and
// `PaddingY` both change the height predictably. `Size` picks the default
// padding here; an explicit `PaddingY` overrides it (see `paddingYClass`).
const sizeDefaultPaddingClass: Record<TaglineBannerSize, string> = {
  sm: "py-4",
  md: "py-8",
  lg: "py-12",
  xl: "py-12 md:py-16",
};

const sizeTaglineClass: Record<TaglineBannerSize, string> = {
  sm: "font-bold text-lg md:text-xl tracking-tight",
  md: "font-bold text-3xl md:text-4xl tracking-tight",
  lg: "font-bold text-4xl sm:text-5xl md:text-6xl tracking-tight",
  xl: "font-bold text-5xl sm:text-6xl md:text-8xl tracking-tight",
};

const sizeLeadClass: Record<TaglineBannerSize, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg md:text-xl",
  xl: "text-xl md:text-2xl",
};

// IMPORTANT: only `text-*` here — no `items-*`. `align-items: center`
// or `end` overrides the default `stretch`, which collapses each child
// to its content width. With `wrap-break-word` on the headline that
// shrinks to one character per line at narrow widths. Default stretch
// keeps children w-full; `text-*` aligns text inline.
const alignXClass: Record<TaglineBannerAlignX, string> = {
  start: "text-start",
  center: "text-center",
  end: "text-end",
};

const alignYClass: Record<TaglineBannerAlignY, string> = {
  top: "justify-start",
  middle: "justify-center",
  bottom: "justify-end",
};

const paddingYClass: Record<TaglineBannerPaddingY, string> = {
  // `auto` (the recipe default) defers to the Size-bound padding below
  // — never read from this map (see the bandPaddingClass branch).
  auto: "",
  none: "py-0",
  sm: "py-4",
  md: "py-8",
  lg: "py-12",
  xl: "py-20",
  "2xl": "py-32",
};

// Row layout maps AlignY to flex-row items-*; stacked uses flex-col
// justify-*. Both maps keep `top` / `middle` / `bottom` as the
// author-facing vocabulary. Gated to `lg:` because below lg every row
// layout collapses to a column — there an ungated `items-*` would
// override the default `stretch`, shrink each child to content width,
// and silently fight `AlignX`'s `text-*` classes.
const rowAlignYClass: Record<TaglineBannerAlignY, string> = {
  top: "lg:items-start",
  middle: "lg:items-center",
  bottom: "lg:items-end",
};

// Row layout AlignX: the tagline + lead are content-width flex items in
// a `lg:flex-row`, so `text-*` alone cannot move them (text-align never
// repositions flex items) — that's why AlignX read as a no-op on `row`.
// `justify-*` places the pair along the row's main axis; the `text-*`
// classes on each item still align wrapped lines (and handle the <lg
// stacked column). RTL-aware via flex logical axes.
const rowJustifyXClass: Record<TaglineBannerAlignX, string> = {
  start: "lg:justify-start",
  center: "lg:justify-center",
  end: "lg:justify-end",
};

/**
 * Text tone for content over a background image on the transparent
 * (`none`) surface — resolved from the scrim via the shared
 * section-background vocabulary (dark scrim → white text +
 * `surface-invert` remap; light → black; none → untouched). On a tonal
 * surface the paired `text-*-foreground` token already handles
 * contrast, so this stays empty.
 */
function overImageTextClass(
  image: ImageSource | undefined,
  surfaceTone: TaglineBannerSurfaceTone,
  scrim: SectionBackgroundScrim,
): string {
  return hasSectionBackgroundImage(image) && surfaceTone === "none"
    ? sectionBackgroundToneClass(scrim)
    : "";
}

/**
 * Render parsed inline-accent segments — plain runs as bare text nodes,
 * accent runs wrapped in a tinted span. Shared by the static heading
 * and every marquee repeat so the two paths can't drift.
 */
function AccentedTagline({
  segments,
  accentClass,
}: {
  segments: InlineAccentSegment[];
  accentClass: string;
}) {
  return (
    <>
      {segments.map((segment, index) =>
        segment.accent ? (
          <span
            // Index keys are safe: the list is derived, static per render.
            // biome-ignore lint/suspicious/noArrayIndexKey: derived static list
            key={index}
            className={accentClass || undefined}
          >
            {segment.text}
          </span>
        ) : (
          // biome-ignore lint/suspicious/noArrayIndexKey: derived static list
          <Fragment key={index}>{segment.text}</Fragment>
        ),
      )}
    </>
  );
}

/**
 * Scrolling marquee body used by `Default` when `marquee` is on. Renders
 * the tagline in two identical groups; the `-50%` translate on
 * `animate-marquee` swaps the clone into the original's slot for a
 * seamless loop. The clone is `aria-hidden` (the section carries a single
 * `aria-label`), and `prefers-reduced-motion` freezes the scroll globally.
 */
function TaglineMarquee({
  segments,
  accentClass,
  size,
  taglineClassName,
}: {
  segments: InlineAccentSegment[];
  accentClass: string;
  size: TaglineBannerSize;
  taglineClassName?: string;
}) {
  return (
    // Clip only the inline axis (the scroll). `overflow-x-hidden` forces the
    // block axis to `auto` (CSS spec), which re-clips the tall display glyphs
    // top+bottom; `overflow-x-clip` clips the inline axis while leaving the
    // block axis visible. Paired with `leading-[1.2]` + a little `py` so the
    // band sizes to the full type.
    <div className="relative z-10 flex w-full flex-1 items-center overflow-x-clip py-[0.12em]">
      <div className="flex w-max animate-marquee focus-within:[animation-play-state:paused] hover:[animation-play-state:paused]">
        {[false, true].map((isClone) => (
          <ul
            key={isClone ? "clone" : "lead"}
            aria-hidden={isClone || undefined}
            className="flex shrink-0 items-center"
          >
            {[0, 1, 2, 3].map((repeat) => (
              <li key={repeat} className="whitespace-nowrap pe-8 md:pe-14">
                <span
                  className={cn(
                    "font-bold font-heading leading-[1.2] tracking-tight",
                    sizeTaglineClass[size],
                    taglineClassName,
                  )}
                >
                  <AccentedTagline
                    segments={segments}
                    accentClass={accentClass}
                  />
                </span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

/**
 * Parse the Tagline field's inline `{{accent}}` markup once per render.
 * `plainTagline` is the token-free reading (drives the marquee's
 * `aria-label` and the trailing-period check); `hasInlineMarkup` is
 * true when the parsed rendering differs from the raw field text —
 * for tinted spans AND for the `\{{accent}}` literal escape (where the
 * parse yields plain text without the backslash).
 */
function parseTaglineMarkup(tagline: TextSource | undefined): {
  segments: InlineAccentSegment[];
  hasAccentTokens: boolean;
  plainTagline: string;
  hasInlineMarkup: boolean;
} {
  const raw = getSourceText(tagline) ?? "";
  const segments = parseInlineAccent(raw);
  const hasAccentTokens = segments.some((s) => s.accent);
  const plainTagline = segments.map((s) => s.text).join("");
  return {
    segments,
    hasAccentTokens,
    plainTagline,
    hasInlineMarkup: hasAccentTokens || plainTagline !== raw,
  };
}

/**
 * Row inline-axis (X) distribution per layout — see the maps above.
 * `row-spread` pins the edges itself; `row-split` handles X inside its
 * halves via `text-*`; `row` positions the content-width pair.
 */
function rowJustifyClassFor(
  layout: TaglineBannerLayout,
  alignX: TaglineBannerAlignX,
): string {
  if (layout === "row-spread") return "lg:justify-between";
  if (layout === "row") return rowJustifyXClass[alignX];
  return "";
}

/**
 * Resolve the marquee's segment list. Inline `{{accent}}` tokens split
 * the tagline into tinted / plain runs; without them the whole tagline
 * is one plain run.
 */
function resolveMarqueeSegments(
  taglineSegments: InlineAccentSegment[],
  hasAccentTokens: boolean,
  plainTagline: string,
): InlineAccentSegment[] {
  if (hasAccentTokens) return taglineSegments;
  return [{ text: plainTagline, accent: false }];
}

/**
 * The marquee band — the scrolling track plus the STATIC lead caption.
 * The lead renders once, below the track (the stacked composition),
 * aligned by `AlignX`: scrolling it inside the track would repeat the
 * caption 8× at display scale and make it unreadable, and a static
 * line also gives assistive tech a stable caption.
 */
function MarqueeBand({
  className,
  id,
  plainTagline,
  segments,
  accentClass,
  size,
  taglineClassName,
  lead,
  leadAlignClass,
  leadToneClass,
  leadClassName,
  backgroundImage,
  scrim,
  scrimPosition,
  children,
}: {
  className: string;
  id?: string | null;
  plainTagline: string;
  segments: InlineAccentSegment[];
  accentClass: string;
  size: TaglineBannerSize;
  taglineClassName?: string;
  lead?: TextSource;
  leadAlignClass: string;
  leadToneClass: string;
  leadClassName?: string;
  backgroundImage?: ImageSource;
  scrim: SectionBackgroundScrim;
  scrimPosition: SectionBackgroundPosition;
  children?: React.ReactNode;
}) {
  const leadText = getSourceText(lead) ?? "";
  return (
    <section
      className={className}
      id={id ?? undefined}
      dir="inherit"
      data-slot="tagline-banner"
      data-layout="marquee"
      aria-label={plainTagline || undefined}
    >
      <SectionBackground
        image={backgroundImage}
        scrim={scrim}
        position={scrimPosition}
        scrimOpacity={0.4}
      />
      <TaglineMarquee
        segments={segments}
        accentClass={accentClass}
        size={size}
        taglineClassName={taglineClassName}
      />
      {leadText !== "" ? (
        <div
          className={cn(
            "container relative z-10 mx-auto mt-3 w-full max-w-6xl",
            leadAlignClass,
          )}
        >
          <p
            className={cn(
              "wrap-break-word text-pretty",
              leadToneClass,
              sizeLeadClass[size],
              leadClassName,
            )}
          >
            <Text value={lead} tag="span" />
          </p>
        </div>
      ) : null}
      {children}
    </section>
  );
}

/**
 * Default tagline banner. Reads layout-service data via `withSitecore`'s
 * default flat-props convention — every field arrives as a camelCased
 * top-level prop (e.g. `fields.Tagline` → `tagline`), every param
 * likewise.
 */
export function Default({
  tagline,
  lead,
  alignX = "start",
  alignY = "middle",
  size = "md",
  layout = "stacked",
  colorScheme,
  paddingY = "auto",
  marquee,
  accentColor,
  backgroundImage,
  backgroundScrim,
  backgroundPosition,
  taglineClassName,
  leadClassName,
  children,
  styles,
  id,
  isEditing,
}: TaglineBannerProps) {
  const titleId = useId();
  // `none` (transparent) is the sentinel default.
  const surfaceTone: TaglineBannerSurfaceTone = colorScheme ?? "none";
  // Computed only to gate the section's `aria-labelledby` — we still
  // render the heading slot so authors get the edit placeholder.
  const hasTagline = tagline != null;
  // On `none` (page background) the lead is dimmed via `text-muted-foreground`.
  // On tonal surfaces (`bg-primary`, `bg-warning`, etc.) the section
  // sets a paired `text-*-foreground` token; the lead inherits that —
  // overriding with `text-muted-foreground` would punch a contrast hole.
  const leadToneClass = surfaceTone === "none" ? "text-muted-foreground" : "";

  // Band vertical padding. There's no min-height — the band height is
  // always `tagline type + padding`, so both `Size` and `PaddingY` change
  // the height predictably. The natural padding follows `Size`; `auto`
  // (the recipe default) defers to it, while an explicit `PaddingY`
  // token overrides it. Same rule in the marquee path below.
  const bandPaddingClass =
    paddingY === "auto"
      ? sizeDefaultPaddingClass[size]
      : paddingYClass[paddingY];

  // Optional full-bleed background image. `SectionBackground` no-ops on
  // an empty source, so it's always safe to render; over an image on
  // the transparent surface the scrim decides the text tone (dark →
  // white copy + surface-invert remap).
  // Retired from authoring, still honoured when stored — see the prop
  // doc. Unset parses to `dark`, the param's old default.
  const scrim = parseSectionBackgroundScrim(backgroundScrim);
  const scrimPosition = parseSectionBackgroundPosition(backgroundPosition);
  const sectionClassName = cn(
    "component tagline-banner relative flex w-full flex-col",
    surfaceToneClass(surfaceTone),
    overImageTextClass(backgroundImage, surfaceTone, scrim),
    bandPaddingClass,
    styles?.trimEnd(),
  );

  // Inline accent tokens — `{{accent}}…{{/accent}}` spans typed in the
  // Tagline field, tinted via `AccentColor` (`color-scheme@1` → role
  // text). Malformed tokens degrade to plain text in the parser.
  const {
    segments: taglineSegments,
    hasAccentTokens,
    plainTagline,
    hasInlineMarkup,
  } = parseTaglineMarkup(tagline);
  const accentClass = colorSchemeTextClass(accentColor, "accent");

  // Marquee mode: a continuously scrolling band of the repeated tagline.
  // Suppressed while editing so authors get a static, editable field
  // rather than a moving target; the global prefers-reduced-motion reset
  // freezes the scroll for users who ask. Two identical duplicated groups
  // + a `-50%` translate give the seamless loop (see `--animate-marquee`).
  const showMarquee = isEnabled(marquee) && !isEditing && plainTagline !== "";

  if (showMarquee) {
    // Same height model as the static band — `tagline type + padding`,
    // no min-height (`sectionClassName` is shared).
    return (
      <MarqueeBand
        className={sectionClassName}
        id={id}
        plainTagline={plainTagline}
        segments={resolveMarqueeSegments(
          taglineSegments,
          hasAccentTokens,
          plainTagline,
        )}
        accentClass={accentClass}
        size={size}
        taglineClassName={taglineClassName}
        lead={lead}
        leadAlignClass={alignXClass[alignX]}
        leadToneClass={leadToneClass}
        leadClassName={leadClassName}
        backgroundImage={backgroundImage}
        scrim={scrim}
        scrimPosition={scrimPosition}
      >
        {children}
      </MarqueeBand>
    );
  }

  const taglineNode = (
    // Mirrors TypographyDisplay's defaults (`font-heading
    // font-semibold tabular-nums tracking-tight`) but renders as a
    // real heading so screen-reader heading navigation can land on
    // it (WCAG 1.3.1). `font-bold` from `sizeTaglineClass` wins over
    // `font-semibold` via Tailwind's later-in-cascade source order.
    <h2
      id={titleId}
      data-slot="typography-display"
      className={cn(
        "wrap-break-word font-heading font-semibold tabular-nums leading-[0.95]",
        sizeTaglineClass[size],
        taglineClassName,
      )}
    >
      {hasInlineMarkup && !isEditing ? (
        // Inline accent markup: render the parsed segments (tinted
        // spans / unescaped literals) instead of the raw field text.
        // While editing we fall through to the editable <Text> so
        // authors see and type the raw `{{accent}}` syntax.
        <span>
          <AccentedTagline
            segments={taglineSegments}
            accentClass={accentClass}
          />
        </span>
      ) : (
        <Text
          value={tagline}
          tag="span"
          isEditing={isEditing}
          placeholder="Tagline"
        />
      )}
    </h2>
  );

  const leadNode = (
    <p
      className={cn(
        "wrap-break-word text-pretty",
        leadToneClass,
        sizeLeadClass[size],
        leadClassName,
      )}
    >
      <Text value={lead} tag="span" isEditing={isEditing} placeholder="Lead" />
    </p>
  );

  const isRowLayout =
    layout === "row" || layout === "row-split" || layout === "row-spread";
  // Row inline-axis (X) distribution.
  //   - `row`:       content-width items; `AlignX` → `justify-*` places
  //                  the tagline+lead pair along the row (a `text-*`
  //                  class can never move flex items — the old no-op).
  //   - `row-split`: tagline + lead each `flex-1` (50/50); `AlignX`
  //                  aligns the text inside each half via `text-*`.
  //   - `row-spread`: items pinned start + end via `justify-between`
  //                  (the spread IS the X placement).
  const rowJustifyClass = rowJustifyClassFor(layout, alignX);
  // Every row layout honors `AlignY` as cross-axis item alignment
  // (`lg:items-*`): with the xl tagline towering over the small lead,
  // top/middle/bottom visibly shifts the shorter item against the
  // taller one. (The old `row` hardcoded `items-baseline` and swallowed
  // AlignY entirely.)
  const rowItemsClass = rowAlignYClass[alignY];

  return (
    // Flex column so the inner content container fills the band via
    // `flex-1`. The band has no min-height (height = tagline + padding),
    // so for the stacked layout `AlignY` (justify-*) only shifts the
    // column when something gives the section extra height; row layouts
    // use `AlignY` as cross-axis item alignment, which always applies.
    <section
      className={sectionClassName}
      id={id ?? undefined}
      dir="inherit"
      data-slot="tagline-banner"
      data-layout={layout}
      aria-labelledby={hasTagline ? titleId : undefined}
    >
      <SectionBackground
        image={backgroundImage}
        scrim={scrim}
        position={scrimPosition}
        scrimOpacity={0.4}
      />
      {isRowLayout ? (
        // Row layouts. `flex-1` lets the row container fill the band;
        // `AlignY` (mapped to `items-*`) cross-axis aligns the tagline +
        // lead relative to each other in the row. On mobile AND tablet we
        // collapse to a single column for legibility — text-heavy row
        // compositions are too cramped at <1024px even when the column
        // count technically fits. Layout-specific spacing kicks in at
        // `lg:` and up.
        <div
          className={cn(
            "container relative z-10 mx-auto flex max-w-6xl flex-1 flex-col gap-6 lg:flex-row lg:gap-12",
            rowItemsClass,
            rowJustifyClass,
          )}
        >
          {/*
           * `flex-1` is gated to `lg:` so row-split's 50/50 split only
           * kicks in on desktop. Below lg the wrapper is flex-col and
           * applying `flex-1` would stretch each row item to half the
           * column height — items end up far apart with awkward
           * vertical space.
           */}
          {layout === "row-split" ? (
            <div className={cn("lg:flex-1", alignXClass[alignX])}>
              {taglineNode}
            </div>
          ) : (
            <div className={alignXClass[alignX]}>{taglineNode}</div>
          )}
          {layout === "row-split" ? (
            <div className={cn("lg:flex-1", alignXClass[alignX])}>
              {leadNode}
            </div>
          ) : (
            <div className={alignXClass[alignX]}>{leadNode}</div>
          )}
          {children}
        </div>
      ) : (
        // Stacked: tagline above lead in a single column. `flex-1` fills
        // the band; `AlignX` aligns the text inline. `AlignY` (justify-*)
        // only shifts the column when the band has spare height beyond its
        // content — with the content-height band it's usually a no-op.
        <div
          className={cn(
            "container relative z-10 mx-auto flex max-w-6xl flex-1 flex-col gap-3",
            alignXClass[alignX],
            alignYClass[alignY],
          )}
        >
          {taglineNode}
          {leadNode}
          {children}
        </div>
      )}
    </section>
  );
}

/**
 * Marquee rendering variant — the full-width auto-scrolling
 * announcement band (announcement bar, ticker-tape tagline). Same
 * content shape as `Default` (Tagline / Lead / BackgroundImage) and
 * the same params; the scroll is always on. Thin wrapper over the
 * private marquee path in `Default` (per the rendering-variants
 * skill — the export name is the discriminator; `marquee` stays an
 * internal knob, and the `Marquee` boolean param turns the scroll on
 * for a `Default` placement).
 *
 * Pauses on hover/focus (`animation-play-state`); the global
 * `prefers-reduced-motion` reset freezes the scroll, and editing mode
 * renders the static band so authors get a stable target.
 */
export function Marquee(props: TaglineBannerProps) {
  return <Default {...props} marquee />;
}

/**
 * `universal` opts this file into BOTH the server and client
 * component maps the SDK generates (component-map.ts +
 * component-map.client.ts). Server-only by default would land
 * here in the server map alone, which means Sitecore Pages chrome
 * (browser-side) cannot look the component up and its named-export
 * variants fail to resolve. No runtime behaviour change: the file
 * stays a plain RSC server component; the universal marker is
 * purely a generate-map signal.
 */
export const componentType = "universal";
