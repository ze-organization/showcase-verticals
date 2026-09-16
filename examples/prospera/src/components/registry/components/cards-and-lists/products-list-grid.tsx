"use client";

import type { ComponentType } from "react";
import {
  EmptyHint,
  ItemListing,
  ListingFallback,
  ListingSection,
  type ResultControlsProps,
} from "@/components/registry/blocks";
import {
  Compact as ProductCardCompact,
  Default as ProductCardDefault,
  DetailPanel as ProductCardDetailPanel,
  HorizontalDetailed as ProductCardHorizontalDetailed,
  HorizontalEssential as ProductCardHorizontalEssential,
  Minimal as ProductCardMinimal,
  type ProductCardProps,
} from "@/components/registry/components/cards-and-lists/product-card";
import type { ImageSource } from "@/components/registry/primitives/editables/image";
import type { TextSource } from "@/components/registry/primitives/editables/text";

/** Lower-case variant tokens emitted by the Sitecore adapter / search params. */
export type ProductCardVariant =
  | "default"
  | "compact"
  | "minimal"
  | "horizontal-essential"
  | "horizontal-detailed"
  | "detail-panel";

const PRODUCT_CARD_VARIANTS: Record<
  ProductCardVariant,
  ComponentType<ProductCardProps>
> = {
  default: ProductCardDefault,
  compact: ProductCardCompact,
  minimal: ProductCardMinimal,
  "horizontal-essential": ProductCardHorizontalEssential,
  "horizontal-detailed": ProductCardHorizontalDetailed,
  "detail-panel": ProductCardDetailPanel,
};

import { type ReactNode, useCallback, useMemo } from "react";
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
 * `ProductsListGrid` — Sitecore-aware list-or-grid rendering for the
 * products family. Composed/curated/search-driven by which datasource
 * field is populated:
 *
 *   - composed → placeholder children (product-card@1 children)
 *   - curated  → `items` populated via Sitecore Treelist
 *   - search   → `items` populated by ambient `useSearchControllerContext`
 *
 * Marked compatible with `products-carousel@1`. Authors swap layout
 * without re-binding because both renderings share the products family's
 * datasource template.
 *
 * Flat props throughout — the Sitecore adapter unwraps fields/params in
 * `products.sitecore.ts`, so this file is runnable in Storybook with
 * plain values.
 */

/**
 * Family-specific extras carried alongside the shared FlatItem envelope.
 * Mirrors the editable fields the React card destructures — kept as
 * source-shaped values so editing chrome survives the trip through the
 * search controller.
 */
export interface ProductExtras {
  title?: TextSource;
  shortDescription?: TextSource;
  category?: TextSource;
  price?: number;
  sku?: string;
  image1?: ImageSource;
  image2?: ImageSource;
  /**
   * Per-card CTA affordance, forwarded to the leaf `product-card`. Without
   * these a curated grid card always resolves to the shop default (an
   * icon-only add-to-cart `+`); a `ctaLabel` from the source (e.g. "Buy
   * Now" / "Learn More") upgrades it to a labeled action button, and
   * `ctaKind`/`ctaVariant`/`showPrice` let a content grid drop the shop
   * flavor entirely. Mirrors the `product-card@1` params.
   */
  ctaLabel?: TextSource;
  ctaKind?: string;
  ctaVariant?: string;
  showPrice?: string | boolean;
}

export type ProductFlatItem = FlatItem<ProductExtras>;

export interface ProductsListGridProps
  extends SectionSurfaceProps,
    CuratedCardChromeProps {
  /** Heading content. */
  title?: TextSource;
  lead?: TextSource;
  headingLayout?: string;
  headingSize?: string;

  /** Curated/search items. */
  items?: ProductFlatItem[];
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

  /** Card-shape choice. */
  cardVariant?: ProductCardVariant;

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

type LayoutVariant = "grid" | "featured" | "fifty-fifty" | "no-spacing";

/**
 * Shared body — picks data source, lays out items. Variants vary by the
 * grid/listing className they pass in and (for `featured`) by structural
 * composition that the standard `ItemListing` body wraps.
 */
function ProductsListGridInner({
  title,
  lead,
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
  columnsLg = 4,
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
}: ProductsListGridProps & {
  layoutVariant: LayoutVariant;
}) {
  const items: ProductFlatItem[] = useResolvedListItems(
    directItems,
    searchConfig,
    { rendering, allowCurated: true },
  );

  // For the "no-spacing" layout, the outer grid has gap-0 so cards sit
  // edge-to-edge. The card's own padding/typography handles legibility.
  const compactCardVariant: ProductCardVariant =
    layoutVariant === "no-spacing" && cardVariant === "default"
      ? "compact"
      : cardVariant;

  // Curated-mode chrome forwarded to every leaf card. `cardStyle`
  // maps back to the leaf's `style` prop name in `leafChromeProps`.
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
    ],
  );

  const renderProduct = useCallback(
    (product: ProductFlatItem) =>
      renderProductCard({ variant: compactCardVariant, product, chrome }),
    [compactCardVariant, chrome],
  );

  const layoutClassName = useMemo(() => {
    if (layoutVariant === "fifty-fifty") {
      return "grid grid-cols-1 gap-6 md:grid-cols-2";
    }
    if (layoutVariant === "no-spacing") {
      // Literal classes via the shared helper — the previous
      // `grid-cols-${n}` template strings were invisible to Tailwind's
      // source scanner, so the classes never generated and the grid
      // collapsed to a single stacked column.
      return buildGridClassName({
        columnsLg,
        columnsMd,
        columnsSm,
        gap: "none",
        featuredFirst,
      });
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
        layout: parseHeadingLayout(headingLayout, "start-with-section-divider"),
        headingOptions: { size: parseHeadingSize(headingSize, "default") },
      },
      ...(resultControls ? { resultControls } : {}),
    }),
    [title, lead, headingLayout, headingSize, resultControls],
  );

  const hasItems = items.length > 0;
  const placeholderKey = "cards-products-{*}";

  return (
    <ListingSection
      colorScheme={colorScheme}
      backgroundIntensity={backgroundIntensity}
      paddingY={paddingY}
      maxWidth={maxWidth}
      overlapTop={overlapTop}
      slot="products-list-grid"
      entityName="products"
      id={id}
      className={className}
    >
      {hasItems ? (
        layoutVariant === "featured" ? (
          <FeaturedLayout
            items={items}
            chrome={chrome}
            title={title}
            lead={lead}
            headingLayout={headingLayout}
            resultControls={resultControls}
            emptyStateMessage={emptyStateMessage}
          />
        ) : (
          <ItemListing
            items={layoutVariant === "fifty-fifty" ? items.slice(0, 2) : items}
            getKey={(product) => product.id}
            displayOptions={{
              as: "ul",
              itemAs: "li",
              empty: (
                <EmptyHint message={emptyStateMessage}>Products</EmptyHint>
              ),
            }}
            behaviorOptions={listingBehaviorOptions}
            styleOptions={{
              className: layoutClassName,
              itemClassName: "min-w-0",
            }}
            renderItem={renderProduct}
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
          Products
        </ListingFallback>
      )}
    </ListingSection>
  );
}

export function Grid(props: ProductsListGridProps) {
  return <ProductsListGridInner {...props} layoutVariant="grid" />;
}

export function Featured(props: ProductsListGridProps) {
  return <ProductsListGridInner {...props} layoutVariant="featured" />;
}

export function FiftyFifty(props: ProductsListGridProps) {
  return <ProductsListGridInner {...props} layoutVariant="fifty-fifty" />;
}

export function NoSpacing(props: ProductsListGridProps) {
  return <ProductsListGridInner {...props} layoutVariant="no-spacing" />;
}

export const Default = Grid;
export default Grid;

/**
 * Spread a flat product item onto the leaf card's prop shape. The
 * `extras` already carry editable Sources; FlatItem core fields are
 * fallback wrappers when extras are absent.
 */
export function flatProductProps(item: ProductFlatItem): ProductCardProps {
  const extras = item.extras ?? {};
  return {
    productId: item.id,
    url: item.href ?? "#",
    title: extras.title ?? (item.title ? { value: item.title } : undefined),
    shortDescription: extras.shortDescription,
    category: extras.category,
    price: extras.price,
    image1:
      extras.image1 ??
      (item.image?.src
        ? { value: { src: item.image.src, alt: item.image.alt } }
        : undefined),
    image2: extras.image2,
    // Forward the per-card CTA affordance so a curated shop card can render
    // the source's labeled action button instead of the bare icon `+`.
    ctaLabel: extras.ctaLabel,
    ctaKind: extras.ctaKind,
    ctaVariant: extras.ctaVariant,
    showPrice: extras.showPrice,
  };
}

function renderProductCard({
  variant,
  product,
  chrome,
}: {
  variant: ProductCardVariant;
  product: ProductFlatItem;
  chrome?: CuratedCardChromeProps;
}) {
  const Variant = PRODUCT_CARD_VARIANTS[variant] ?? ProductCardDefault;
  return (
    <Variant {...flatProductProps(product)} {...leafChromeProps(chrome)} />
  );
}

/**
 * `featured` layout — one hero product (col-span-2 on lg) rendered with
 * the `detail-panel` card, plus up to three secondary products stacked
 * alongside as `horizontal-essential` cards. Mirrors the media-gallery
 * `Featured` shape so the rendering-variant story stays consistent
 * across families.
 */
function FeaturedLayout({
  items,
  chrome,
  title,
  lead,
  headingLayout,
  headingSize,
  resultControls,
  emptyStateMessage,
}: {
  items: ProductFlatItem[];
  chrome?: CuratedCardChromeProps;
  title?: TextSource;
  lead?: TextSource;
  headingLayout?: string;
  headingSize?: string;
  resultControls?: ResultControlsProps;
  emptyStateMessage?: TextSource;
}) {
  const [hero, ...rest] = items;
  const listingBehaviorOptions = useMemo(
    () => ({
      heading: {
        title,
        lead,
        layout: parseHeadingLayout(headingLayout, "start-with-section-divider"),
        headingOptions: { size: parseHeadingSize(headingSize, "default") },
      },
      ...(resultControls ? { resultControls } : {}),
    }),
    [title, lead, headingLayout, headingSize, resultControls],
  );

  return (
    <ItemListing
      items={[null]}
      getKey={() => "featured-layout"}
      displayOptions={{
        as: "div",
        itemAs: "div",
        empty: <EmptyHint message={emptyStateMessage}>Products</EmptyHint>,
      }}
      behaviorOptions={listingBehaviorOptions}
      styleOptions={{ className: "", itemClassName: "" }}
      renderItem={() => (
        <div className="grid gap-6 lg:grid-cols-3">
          {hero ? (
            <div className="min-w-0 lg:col-span-2">
              {renderProductCard({
                variant: "detail-panel",
                product: hero,
                chrome,
              })}
            </div>
          ) : null}
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {rest.slice(0, 3).map((item) => (
              <li key={item.id} className="min-w-0">
                {renderProductCard({
                  variant: "horizontal-essential",
                  product: item,
                  chrome,
                })}
              </li>
            ))}
          </ul>
        </div>
      )}
    />
  );
}

export const componentType = "universal";
