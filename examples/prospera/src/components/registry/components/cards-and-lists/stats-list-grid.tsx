"use client";

import { type ReactNode, useCallback, useMemo } from "react";
import {
  EmptyHint,
  ItemListing,
  ListingFallback,
  ListingSection,
  wrapComposedByListVariant,
  parseBandHeadingPlacement,
  ResultControls,
  type ResultControlsProps,
  SectionHeading,
} from "@/components/registry/blocks";
import {
  ItemCard,
  type ItemCardColorBand,
  type ItemCardMediaBleed,
  type ItemCardProps,
} from "@/components/registry/blocks/item-card";
import {
  FlankedLabel,
  parseStatEmphasis,
  StatsCard,
} from "@/components/registry/components/cards-and-lists/stats-card";
import { isEmptySource } from "@/components/registry/primitives/editables/source-normalizers";
import {
  Text,
  type TextSource,
} from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import { isEnabled } from "@/lib/registry/param-parsers";
import type { FlatItem, SearchConfig } from "@/lib/registry/search/types";
import { useResolvedListItems } from "@/lib/registry/search/use-resolved-list-items";
import type { SectionSurfaceProps } from "@/lib/registry/section-surface";
import {
  parseHeadingLayout,
  parseHeadingSize,
} from "../layout/section-wrapper";
import {
  buildGridClassName,
  type FeaturedFirst,
  type GridGap,
  type GridPattern,
} from "./_grid-classname";

/**
 * `StatsListGrid` — Sitecore-aware list-or-grid rendering for the
 * stats family. Composed/curated/search-driven by which datasource
 * field is populated:
 *
 *   - composed → placeholder children (stats-card@1 children)
 *   - curated  → `items` populated via Sitecore Treelist
 *   - search   → `items` populated by ambient `useSearchControllerContext`
 *
 * Stats are typically grid-shaped highlights; the `Grid` variant
 * covers the tile layouts (column count + gap via params),
 * `FlankedLabels` the rotated-flank editorial band, and `Milestones`
 * the chrome-free big-value-over-descriptor band — no carousel here,
 * see `stats-carousel.tsx` for that.
 *
 * Flat props throughout — the Sitecore adapter unwraps fields/params
 * in `stats.sitecore.ts`, so this file is runnable in Storybook with
 * plain values.
 */

export type StatExtras = {
  label?: TextSource;
  value?: TextSource;
  change?: TextSource;
  trend?: TextSource;
  context?: TextSource;
};

export type StatFlatItem = FlatItem<StatExtras>;

export interface StatsListGridProps extends SectionSurfaceProps {
  /** Heading content. */
  title?: TextSource;
  lead?: TextSource;
  /** Optional kicker above the title (small-caps eyebrow). */
  eyebrow?: TextSource;
  headingLayout?: string;
  headingSize?: string;

  /** Curated/search items. */
  items?: StatFlatItem[];
  /**
   * `SearchConfig` datasource field — when populated and this
   * rendering is NOT inside a search experience, it fetches its own
   * results and they replace the curated `items`.
   */
  searchConfig?: SearchConfig;

  /** Composed-mode placeholder children. Sitecore SDK injects these. */
  children?: ReactNode;
  /** Sitecore rendering descriptor — opaque, passed to <Placeholder>. */
  rendering?: unknown;

  /** Card-shape choices — flow through to StatsCard's chrome axes. */
  style?: "flat" | "outline" | "filled" | "elevated";
  elevation?: "theme" | "none" | "xs" | "sm" | "base" | "md" | "lg";
  padding?: "sm" | "md" | "lg";
  cardColorScheme?: ItemCardProps["colorScheme"];
  colorBand?: ItemCardColorBand;
  mediaBleed?: ItemCardMediaBleed;
  align?: "start" | "center";
  trendDisplay?: "badge" | "text" | "none";
  tone?: "default" | "neutral" | "primary" | "success" | "warning";
  valueSize?: "default" | "large" | "xlarge";
  labelCase?: "default" | "uppercase";
  showLabel?: boolean;
  /**
   * `FlankedLabels` / `Milestones` (`stat-emphasis@1`): `value`
   * (default — the big number dominates) or `label` (inverted —
   * the label text dominates). The Grid variant ignores it.
   */
  emphasis?: string;
  /**
   * `Milestones` only — draw vertical hairlines between cells
   * (divide-x pattern, same vocabulary as row-splitter's
   * ShowDividers). Accepts Sitecore string-boolean shapes; off by
   * default (Standard Values drive the initial state). Other
   * variants ignore it.
   */
  showDividers?: string | boolean;
  /**
   * `Milestones` only (`band-heading-placement@1`): `above` (default —
   * the family's normal section heading) or `inline` — the heading
   * (Eyebrow / Title / Lead) occupies the band's LEADING CELL, in the
   * same row as the stats. Other variants ignore it.
   */
  headingPlacement?: string;

  /** Layout params. */
  columnsLg?: number;
  columnsMd?: number;
  columnsSm?: number;
  gap?: GridGap;
  /**
   * `featured-first@1` — lead-tile treatment: `wide` spans the first
   * tile across 2 columns, `tall` across 2 rows. `none` (default)
   * keeps the uniform grid.
   */
  featuredFirst?: FeaturedFirst;
  /**
   * `grid-pattern@1` tile rhythm — `bento` renders the repeating
   * hero + fillers mosaic; `uniform` (default) keeps 1×1 tiles.
   * Supersedes `featuredFirst`.
   */
  gridPattern?: GridPattern;

  /** Controls bar (optional, only in non-search-context placements). */
  resultControls?: ResultControlsProps;

  /** Empty-state copy. */
  emptyStateMessage?: TextSource;

  className?: string;
  id?: string;
}

/**
 * One `Milestones` cell — the Allstate stats-band unit: a big value
 * stacked over a short de-emphasized descriptor, center-aligned, with
 * NO per-stat card chrome (band-level chrome is the container's job).
 * `stat-emphasis@1` flips which slot dominates: `value` (default) puts
 * the number on top; `label` inverts the pairing. An optional Context
 * renders as a smaller third line.
 */
function MilestoneStat({
  label,
  value,
  context,
  emphasis,
}: {
  label?: TextSource;
  value?: TextSource;
  context?: TextSource;
  emphasis?: string;
}) {
  const emphasisMode = parseStatEmphasis(emphasis);
  const labelNode = label ? (
    <Text value={label} tag="span" />
  ) : (
    <span className="is-empty-hint">Metric</span>
  );
  const valueNode = value ? (
    <Text value={value} tag="span" />
  ) : (
    <span className="is-empty-hint">0</span>
  );
  const primaryNode = emphasisMode === "value" ? valueNode : labelNode;
  const secondaryNode = emphasisMode === "value" ? labelNode : valueNode;
  return (
    <div
      data-slot="stats-card"
      data-emphasis={emphasisMode}
      className="flex min-w-0 flex-col items-center gap-1.5 px-4 py-2 text-center"
    >
      <span className="wrap-break-word font-bold font-heading text-4xl leading-none tracking-tight md:text-5xl">
        {primaryNode}
      </span>
      <span className="text-muted-foreground text-sm leading-snug">
        {secondaryNode}
      </span>
      {context != null && !isEmptySource(context) ? (
        <span className="text-muted-foreground text-xs">
          <Text value={context} tag="span" />
        </span>
      ) : null}
    </div>
  );
}

/**
 * Shared body — picks data source, lays out items. Variants vary only
 * by the grid/listing className they pass in.
 */
function StatsListGridInner({
  title,
  lead,
  eyebrow,
  headingLayout,
  headingSize,
  items: directItems,
  searchConfig,
  children,
  rendering,
  // No React-side `style` default: unset flows through so StatsCard's
  // own effective default (outline) applies per-stat, and Milestones
  // reads an explicit pick as the band-as-card opt-in.
  style,
  elevation = "theme",
  padding = "md",
  cardColorScheme,
  colorBand,
  mediaBleed,
  align = "start",
  trendDisplay = "badge",
  tone = "default",
  valueSize = "default",
  labelCase = "default",
  showLabel,
  columnsLg = 4,
  columnsMd = 2,
  columnsSm = 1,
  gap = "md",
  featuredFirst = "none",
  gridPattern = "uniform",
  resultControls,
  emptyStateMessage,
  emphasis,
  showDividers,
  headingPlacement,
  colorScheme,
  backgroundIntensity,
  paddingY,
  maxWidth,
  overlapTop,
  className,
  id,
  layoutVariant = "grid",
}: StatsListGridProps & {
  layoutVariant?: "grid" | "flanked" | "milestones";
}) {
  const items: StatFlatItem[] = useResolvedListItems(directItems, searchConfig, { rendering, allowCurated: true });

  const isFlanked = layoutVariant === "flanked";
  const isMilestones = layoutVariant === "milestones";

  const renderStat = useCallback(
    (stat: StatFlatItem) =>
      isMilestones ? (
        <MilestoneStat
          label={stat.extras?.label ?? stat.title}
          value={stat.extras?.value}
          context={stat.extras?.context}
          emphasis={emphasis}
        />
      ) : isFlanked ? (
        <FlankedLabel
          label={stat.extras?.label ?? stat.title}
          value={stat.extras?.value}
          description={stat.extras?.context}
          emphasis={emphasis}
        />
      ) : (
        <StatsCard
          label={stat.extras?.label ?? stat.title}
          value={stat.extras?.value}
          change={stat.extras?.change}
          trend={stat.extras?.trend}
          context={stat.extras?.context}
          style={style}
          elevation={elevation}
          padding={padding}
          cardColorScheme={cardColorScheme}
          colorBand={colorBand}
          mediaBleed={mediaBleed}
          align={align}
          trendDisplay={trendDisplay}
          tone={tone}
          valueSize={valueSize}
          labelCase={labelCase}
          showLabel={showLabel}
        />
      ),
    [
      isFlanked,
      isMilestones,
      emphasis,
      style,
      elevation,
      padding,
      cardColorScheme,
      colorBand,
      mediaBleed,
      align,
      trendDisplay,
      tone,
      valueSize,
      labelCase,
      showLabel,
    ],
  );

  const layoutClassName = useMemo(() => {
    // The flanked band reads as one horizontal row of stats with wide
    // gutters (wrapping on narrow viewports), not a tile grid.
    if (isFlanked) {
      return "flex flex-wrap items-stretch gap-x-14 gap-y-10";
    }
    // The milestones band is always a uniform grid (no lead-tile /
    // bento rhythm — it reads as one row of equal cells). Optional
    // vertical hairlines between cells ride the divide-x pattern
    // (row-splitter's ShowDividers, rotated 90°).
    if (isMilestones) {
      return cn(
        buildGridClassName({
          columnsLg,
          columnsMd,
          columnsSm,
          gap,
          featuredFirst: "none",
          gridPattern: "uniform",
        }),
        "items-center",
        isEnabled(showDividers) && "divide-x divide-border",
      );
    }
    return buildGridClassName({
      columnsLg,
      columnsMd,
      columnsSm,
      gap,
      featuredFirst,
      gridPattern,
    });
  }, [
    isFlanked,
    isMilestones,
    showDividers,
    columnsLg,
    columnsMd,
    columnsSm,
    gap,
    featuredFirst,
    gridPattern,
  ]);

  const listingBehaviorOptions = useMemo(
    () => ({
      heading: {
        title,
        lead,
        eyebrow,
        layout: parseHeadingLayout(headingLayout, "start-with-section-divider"),
        headingOptions: { size: parseHeadingSize(headingSize, "default") },
      },
      ...(resultControls ? { resultControls } : {}),
    }),
    [title, lead, eyebrow, headingLayout, headingSize, resultControls],
  );

  const hasItems = items.length > 0;
  const placeholderKey = "cards-stats-{*}";

  if (isMilestones) {
    const heading = listingBehaviorOptions.heading;
    const hasHeadingContent = [title, eyebrow, lead].some(
      (source) => source != null && !isEmptySource(source),
    );
    // `band-heading-placement@1`: `inline` puts the heading in the
    // band's LEADING CELL, same row as the stats (Allstate read).
    const inlineHeading =
      hasHeadingContent &&
      parseBandHeadingPlacement(headingPlacement) === "inline";
    // Band-as-card: an explicit Style pick draws the WHOLE band
    // (heading cell + stats + dividers) as one card — the shared
    // chrome axes apply to the band container here, not per-stat.
    const bandAsCard = style != null;
    const bandContent = (
      <div className={layoutClassName}>
        {inlineHeading ? (
          <div className="min-w-0 px-4 py-2">
            <SectionHeading
              {...heading}
              sectionContainerClassName="mb-0 md:mb-0"
              centeredContainerClassName="mb-0 md:mb-0"
            />
          </div>
        ) : null}
        {items.map((stat) => (
          <div key={stat.id} className="min-w-0">
            {renderStat(stat)}
          </div>
        ))}
      </div>
    );
    const bandNode = bandAsCard ? (
      <ItemCard
        style={style}
        elevation={elevation}
        padding={padding}
        colorScheme={cardColorScheme}
        colorBand={colorBand}
      >
        {bandContent}
      </ItemCard>
    ) : (
      bandContent
    );
    return (
      <ListingSection
        colorScheme={colorScheme}
        backgroundIntensity={backgroundIntensity}
        paddingY={paddingY}
        maxWidth={maxWidth}
        overlapTop={overlapTop}
        slot="stats-list-grid"
        entityName="stats"
        id={id}
        className={className}
      >
        {hasItems ? (
          <>
            {!inlineHeading ? <SectionHeading {...heading} /> : null}
            {resultControls ? (
              <ResultControls {...resultControls} className="mb-4" />
            ) : null}
            {bandNode}
          </>
        ) : (
          <ListingFallback
            heading={heading}
            placeholderKey={placeholderKey}
            rendering={rendering}
            fallback={children}
            composedClassName={layoutClassName}
            wrapComposed={wrapComposedByListVariant(layoutVariant)}
            emptyStateMessage={emptyStateMessage}
          >
            Stats
          </ListingFallback>
        )}
      </ListingSection>
    );
  }

  return (
    <ListingSection
      colorScheme={colorScheme}
      backgroundIntensity={backgroundIntensity}
      paddingY={paddingY}
      maxWidth={maxWidth}
      overlapTop={overlapTop}
      slot="stats-list-grid"
      entityName="stats"
      id={id}
      className={className}
    >
      {hasItems ? (
        <ItemListing
          items={items}
          getKey={(stat) => stat.id}
          displayOptions={{
            as: "ul",
            itemAs: "li",
            empty: <EmptyHint message={emptyStateMessage}>Stats</EmptyHint>,
          }}
          behaviorOptions={listingBehaviorOptions}
          styleOptions={{
            className: layoutClassName,
            itemClassName: "min-w-0",
          }}
          renderItem={renderStat}
        />
      ) : (
        <ListingFallback
          heading={listingBehaviorOptions.heading}
          placeholderKey={placeholderKey}
          rendering={rendering}
          fallback={children}
          composedClassName={layoutClassName}
          wrapComposed={wrapComposedByListVariant(layoutVariant)}
          emptyStateMessage={emptyStateMessage}
        >
          Stats
        </ListingFallback>
      )}
    </ListingSection>
  );
}

export function Grid(props: StatsListGridProps) {
  return <StatsListGridInner {...props} />;
}

/**
 * FlankedLabels — the editorial stat band (Diageo / ONEOK / SUSE):
 * each stat renders as a `FlankedLabel` unit (rotated flank text
 * beside a dominant number) in one wide-guttered wrapping row. The
 * `Emphasis` param flips which slot dominates (Allstate's inverted
 * read). Card chrome axes are inert here — the band draws no card
 * shells; put color on the section surface instead.
 */
export function FlankedLabels(props: StatsListGridProps) {
  return <StatsListGridInner {...props} layoutVariant="flanked" />;
}

/**
 * Milestones — the Allstate stats band: each stat renders a big value
 * stacked over a short de-emphasized descriptor, center-aligned, 3-4
 * across, with NO per-stat card chrome. Band-level knobs:
 *
 *   `ShowDividers`      vertical hairlines between cells (divide-x).
 *   `HeadingPlacement`  `above` (default) or `inline` — the section
 *                       heading occupies the band's leading cell.
 *   `Style` (+ Elevation/Padding/CardColorScheme/ColorBand) — an
 *                       explicit pick renders the WHOLE band as one
 *                       card instead of forwarding chrome per-stat.
 *   `Emphasis`          `stat-emphasis@1` value-vs-label weighting
 *                       (label puts the descriptor on top).
 */
export function Milestones(props: StatsListGridProps) {
  return <StatsListGridInner {...props} layoutVariant="milestones" />;
}

export const Default = Grid;
export default Grid;

export const componentType = "universal";
