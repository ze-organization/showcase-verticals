"use client";

import { type ReactNode, useCallback, useMemo } from "react";
import {
  EmptyHint,
  ItemListing,
  itemListingLayouts,
  ListingFallback,
  ListingSection,
  type ResultControlsProps,
} from "@/components/registry/blocks";
import { CardNavigate } from "@/components/registry/blocks/card-navigate";
import {
  CompactRow as ArticleCardCompactRow,
  ImageLed as ArticleCardImageLed,
  Overlay as ArticleCardOverlay,
  type ArticleCardProps,
  Standard as ArticleCardStandard,
} from "@/components/registry/components/cards-and-lists/article-card";
import type { ImageSource } from "@/components/registry/primitives/editables/image";
import { type LinkSource } from "@/components/registry/primitives/editables/link";
import {
  Text,
  type TextSource,
} from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import type { FlatItem, SearchConfig } from "@/lib/registry/search/types";
import { useResolvedListItems } from "@/lib/registry/search/use-resolved-list-items";
import type { SectionSurfaceProps } from "@/lib/registry/section-surface";
import {
  parseHeadingLayout,
  parseHeadingSize,
} from "../layout/section-wrapper";
import {
  type CuratedCardChromeProps,
  leafChromeProps,
} from "./_card-chrome-adapter";
import {
  buildGridClassName,
  type FeaturedFirst,
  type GridGap,
  type GridPattern,
} from "./_grid-classname";

/**
 * `ArticlesListGrid` — Sitecore-aware list-or-grid rendering for the
 * articles family. Composed/curated/search-driven by which datasource
 * field is populated:
 *
 *   - composed → placeholder children (article-card@1 children)
 *   - curated  → `items` populated via Sitecore Treelist
 *   - search   → `items` populated by ambient `useSearchControllerContext`
 *
 * Marked compatible with `articles-carousel@1`. Authors swap layout
 * without re-binding because both renderings share the articles
 * family's datasource template.
 *
 * Flat props throughout — the Sitecore adapter unwraps fields/params
 * in `articles.sitecore.ts`, so this file is runnable in Storybook
 * with plain values.
 */

export type ArticleFlatItem = FlatItem<{
  excerpt?: TextSource;
  image?: ImageSource;
  link?: LinkSource;
  date?: TextSource;
  eyebrow?: TextSource;
}>;

export type ArticleCardVariant =
  | "default"
  | "title-only"
  | "image-title-only"
  | "overlay";

export interface ArticlesListGridProps
  extends SectionSurfaceProps,
    CuratedCardChromeProps {
  /** Heading content. */
  title?: TextSource;
  lead?: TextSource;
  /** Optional kicker above the title (small-caps eyebrow). */
  eyebrow?: TextSource;
  headingLayout?: string;
  headingSize?: string;

  /** Curated/search items. */
  items?: ArticleFlatItem[];
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

  /** Card-shape choices (datasource fields). */
  cardVariant?: ArticleCardVariant;

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

type LayoutVariant =
  | "grid"
  | "list"
  | "cards"
  | "fifty-fifty"
  | "featured"
  | "featured-list";

/**
 * Shared body — picks data source, lays out items. Variants vary
 * largely by the listing className and which card primitive renders
 * each row. `featured` uses a custom hero + sidebar composition.
 */
function ArticlesListGridInner({
  title,
  lead,
  eyebrow,
  headingLayout,
  headingSize,
  items: directItems,
  searchConfig,
  children,
  rendering,
  cardVariant = "default",
  elevation,
  padding,
  cardStyle,
  cardColorScheme,
  colorBand,
  titleLinkIcon,
  mediaBleed,
  mediaAspect,
  mediaShape,
  ctaPlacement,
  columnsLg = 3,
  columnsMd = 2,
  columnsSm = 1,
  gap = "md",
  featuredFirst = "none",
  gridPattern = "uniform",
  resultControls,
  emptyStateMessage,
  colorScheme,
  backgroundIntensity,
  paddingY,
  maxWidth,
  overlapTop,
  className,
  id,
  layoutVariant,
}: ArticlesListGridProps & {
  layoutVariant: LayoutVariant;
}) {
  const items: ArticleFlatItem[] = useResolvedListItems(
    directItems,
    searchConfig,
    { rendering, allowCurated: true },
  );

  // Curated-mode chrome forwarded to every leaf card. `cardStyle`
  // maps back to the leaf's `style` prop name.
  const chrome = useMemo<CuratedCardChromeProps>(
    () => ({
      elevation,
      padding,
      cardStyle,
      cardColorScheme,
      colorBand,
      titleLinkIcon,
      mediaBleed,
      mediaAspect,
      mediaShape,
      ctaPlacement,
    }),
    [
      elevation,
      padding,
      cardStyle,
      cardColorScheme,
      colorBand,
      titleLinkIcon,
      mediaBleed,
      mediaAspect,
      mediaShape,
      ctaPlacement,
    ],
  );

  const renderCardArticle = useCallback(
    (item: ArticleFlatItem) =>
      renderArticleCard({ item, variant: cardVariant, chrome }),
    [cardVariant, chrome],
  );

  const renderListArticle = useCallback(
    (item: ArticleFlatItem) => {
      const props = flatArticleProps(item);
      if (cardVariant === "title-only") {
        return (
          <CardNavigate
            link={props.link}
            className="text-foreground hover:text-accent hover:underline"
          >
            <Text
              value={props.title}
              placeholder="Title"
              tag="span"
            />
          </CardNavigate>
        );
      }
      if (cardVariant === "default") {
        return (
          <ArticleCardCompactRow {...props} {...leafChromeProps(chrome)} />
        );
      }
      return renderArticleCard({
        item,
        variant: cardVariant,
        chrome,
      });
    },
    [cardVariant, chrome],
  );

  const layoutClassName = useMemo(() => {
    if (layoutVariant === "list") {
      return cn(
        "list-none ps-0",
        cardVariant === "title-only"
          ? itemListingLayouts.stacked_sm
          : itemListingLayouts.stacked_md,
      );
    }
    if (layoutVariant === "fifty-fifty") {
      return "grid grid-cols-1 gap-6 md:grid-cols-2";
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
    layoutVariant,
    cardVariant,
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
        layout: parseHeadingLayout(
          headingLayout,
          layoutVariant === "cards" ? "center" : "start-with-section-divider",
        ),
        headingOptions: { size: parseHeadingSize(headingSize, "default") },
      },
      ...(resultControls ? { resultControls } : {}),
    }),
    [
      title,
      lead,
      eyebrow,
      headingLayout,
      headingSize,
      resultControls,
      layoutVariant,
    ],
  );

  const hasItems = items.length > 0;
  const placeholderKey = "cards-articles-{*}";
  const renderItem =
    layoutVariant === "list" ? renderListArticle : renderCardArticle;

  return (
    <ListingSection
      colorScheme={colorScheme}
      backgroundIntensity={backgroundIntensity}
      paddingY={paddingY}
      maxWidth={maxWidth}
      overlapTop={overlapTop}
      slot="articles-list-grid"
      entityName="articles"
      id={id}
      className={className}
    >
      {hasItems ? (
        layoutVariant === "featured" ? (
          <FeaturedLayout
            items={items}
            title={title}
            lead={lead}
            eyebrow={eyebrow}
            headingLayout={headingLayout}
            resultControls={resultControls}
            emptyStateMessage={emptyStateMessage}
            chrome={chrome}
          />
        ) : layoutVariant === "featured-list" ? (
          <FeaturedListLayout
            items={items}
            title={title}
            lead={lead}
            eyebrow={eyebrow}
            headingLayout={headingLayout}
            headingSize={headingSize}
            resultControls={resultControls}
            emptyStateMessage={emptyStateMessage}
            chrome={chrome}
          />
        ) : (
          <ItemListing
            items={layoutVariant === "fifty-fifty" ? items.slice(0, 2) : items}
            getKey={(item) => item.id}
            displayOptions={{
              as: "ul",
              itemAs: "li",
              empty: (
                <EmptyHint message={emptyStateMessage}>Articles</EmptyHint>
              ),
            }}
            behaviorOptions={listingBehaviorOptions}
            styleOptions={{
              className: layoutClassName,
              itemClassName: "min-w-0",
            }}
            renderItem={renderItem}
          />
        )
      ) : (
        <ListingFallback
          heading={listingBehaviorOptions.heading}
          placeholderKey={placeholderKey}
          rendering={rendering}
          fallback={children}
          composedClassName={layoutClassName}
          emptyStateMessage={emptyStateMessage}
        >
          Articles
        </ListingFallback>
      )}
    </ListingSection>
  );
}

export function Grid(props: ArticlesListGridProps) {
  return <ArticlesListGridInner {...props} layoutVariant="grid" />;
}

export function List(props: ArticlesListGridProps) {
  return <ArticlesListGridInner {...props} layoutVariant="list" />;
}

export function Cards(props: ArticlesListGridProps) {
  return <ArticlesListGridInner {...props} layoutVariant="cards" />;
}

export function Featured(props: ArticlesListGridProps) {
  return <ArticlesListGridInner {...props} layoutVariant="featured" />;
}

/**
 * `featured-list` variant — one large lead article (media-led,
 * start side) beside a full stacked list of every remaining entry as
 * divider-separated compact rows. Unlike `Featured` (fixed 1 + 3
 * sidebar), the list is uncapped — the "customer story + link list" /
 * "featured exhibition + programme" pattern (sitecore / ketelone
 * bartender stories / whitecube).
 */
export function FeaturedList(props: ArticlesListGridProps) {
  return <ArticlesListGridInner {...props} layoutVariant="featured-list" />;
}

export function FiftyFifty(props: ArticlesListGridProps) {
  return <ArticlesListGridInner {...props} layoutVariant="fifty-fifty" />;
}

export const Default = Grid;
export default Grid;

/**
 * Spread a flat article item onto the leaf card's prop shape. The
 * `extras` already carry editable Sources; FlatItem core fields are
 * fallback wrappers when extras are absent.
 */
export function flatArticleProps(
  item: ArticleFlatItem,
): Pick<
  ArticleCardProps,
  "title" | "excerpt" | "image" | "link" | "date" | "eyebrow"
> {
  const extras = item.extras ?? {};
  return {
    title: item.title ? { value: item.title } : undefined,
    excerpt:
      extras.excerpt ??
      (item.description ? { value: item.description } : undefined),
    image:
      extras.image ??
      (item.image?.src
        ? { value: { src: item.image.src, alt: item.image.alt } }
        : undefined),
    link:
      extras.link ??
      (item.href
        ? { value: { href: item.href, text: item.title } }
        : undefined),
    date: extras.date,
    eyebrow: extras.eyebrow,
  };
}

function renderArticleCard({
  item,
  variant,
  chrome,
}: {
  item: ArticleFlatItem;
  variant: ArticleCardVariant;
  chrome?: CuratedCardChromeProps;
}) {
  const props = flatArticleProps(item);
  const chromeProps = leafChromeProps(chrome);
  if (variant === "overlay") {
    return <ArticleCardOverlay {...props} mediaAspect={chrome?.mediaAspect} />;
  }
  if (variant === "image-title-only") {
    return <ArticleCardImageLed {...props} {...chromeProps} />;
  }
  // `title-only` falls through to ImageLed (image hidden when the
  // datasource has no image); the `list` layout above handles the bare
  // title-link rendering explicitly.
  if (variant === "title-only") {
    return <ArticleCardImageLed {...props} {...chromeProps} />;
  }
  return <ArticleCardStandard {...props} {...chromeProps} />;
}

/**
 * `featured` variant — one hero article (image-led, vertical) spanning
 * two columns on lg, with up to three supporting articles stacked in a
 * sidebar using the horizontal card treatment.
 */
function FeaturedLayout({
  items,
  title,
  lead,
  eyebrow,
  headingLayout,
  headingSize,
  resultControls,
  emptyStateMessage,
  chrome,
}: {
  items: ArticleFlatItem[];
  title?: TextSource;
  lead?: TextSource;
  /** Optional kicker above the title (small-caps eyebrow). */
  eyebrow?: TextSource;
  headingLayout?: string;
  headingSize?: string;
  resultControls?: ResultControlsProps;
  emptyStateMessage?: TextSource;
  chrome?: CuratedCardChromeProps;
}) {
  const [featured, ...rest] = items;
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

  return (
    <ItemListing
      items={[null]}
      getKey={() => "featured-layout"}
      displayOptions={{
        as: "div",
        itemAs: "div",
        empty: <EmptyHint message={emptyStateMessage}>Articles</EmptyHint>,
      }}
      behaviorOptions={listingBehaviorOptions}
      styleOptions={{ className: "", itemClassName: "" }}
      renderItem={() => (
        <div className="grid gap-6 lg:grid-cols-3">
          {featured ? (
            <div className="min-w-0 lg:col-span-2">
              <ArticleCardStandard
                {...flatArticleProps(featured)}
                {...leafChromeProps(chrome)}
              />
            </div>
          ) : null}
          <ul className="grid list-none grid-cols-1 gap-4 ps-0 sm:grid-cols-2 lg:grid-cols-1">
            {rest.slice(0, 3).map((item) => (
              <li key={item.id} className="min-w-0">
                <ArticleCardCompactRow
                  {...flatArticleProps(item)}
                  {...leafChromeProps(chrome)}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    />
  );
}

/**
 * `featured-list` variant — one large lead article on the start side
 * (media-led, fills the column height) with EVERY remaining entry as
 * a divider-separated compact row on the end side. The list is
 * deliberately uncapped, unlike `FeaturedLayout`'s 1 + 3 sidebar —
 * this is the "customer story + long link list" arrangement.
 */
function FeaturedListLayout({
  items,
  title,
  lead,
  eyebrow,
  headingLayout,
  headingSize,
  resultControls,
  emptyStateMessage,
  chrome,
}: {
  items: ArticleFlatItem[];
  title?: TextSource;
  lead?: TextSource;
  /** Optional kicker above the title (small-caps eyebrow). */
  eyebrow?: TextSource;
  headingLayout?: string;
  headingSize?: string;
  resultControls?: ResultControlsProps;
  emptyStateMessage?: TextSource;
  chrome?: CuratedCardChromeProps;
}) {
  const [featured, ...rest] = items;
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

  return (
    <ItemListing
      items={[null]}
      getKey={() => "featured-list-layout"}
      displayOptions={{
        as: "div",
        itemAs: "div",
        empty: <EmptyHint message={emptyStateMessage}>Articles</EmptyHint>,
      }}
      behaviorOptions={listingBehaviorOptions}
      styleOptions={{ className: "", itemClassName: "" }}
      renderItem={() => (
        <div className="grid gap-8 lg:grid-cols-12">
          {featured ? (
            <div className="min-w-0 lg:col-span-7 [&>*]:h-full">
              <ArticleCardStandard
                {...flatArticleProps(featured)}
                {...leafChromeProps(chrome)}
              />
            </div>
          ) : null}
          <ul className="m-0 list-none divide-y divide-border ps-0 lg:col-span-5">
            {rest.map((item) => (
              <li key={item.id} className="min-w-0 py-3 first:pt-0 last:pb-0">
                <ArticleCardCompactRow
                  {...flatArticleProps(item)}
                  elevation="none"
                  style="bare"
                  padding="md"
                  {...leafChromeProps(chrome)}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    />
  );
}

export const componentType = "universal";
