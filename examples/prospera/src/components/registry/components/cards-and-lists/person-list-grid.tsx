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
  CompactRow as PersonCardCompactRow,
  ImageLed as PersonCardImageLed,
  Overlay as PersonCardOverlay,
  type PersonCardProps,
  Standard as PersonCardStandard,
} from "@/components/registry/components/cards-and-lists/person-card";
import type { ImageSource } from "@/components/registry/primitives/editables/image";
import { type LinkSource } from "@/components/registry/primitives/editables/link";
import type { RichTextSource } from "@/components/registry/primitives/editables/richtext";
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
 * `PersonListGrid` — Sitecore-aware list-or-grid rendering for the
 * persons family. Composed/curated/search-driven by which datasource
 * field is populated:
 *
 *   - composed → placeholder children (person-card@1 children)
 *   - curated  → `items` populated via Sitecore Treelist
 *   - search   → `items` populated by ambient `useSearchControllerContext`
 *
 * Marked compatible with `person-carousel@1`. Authors swap layout
 * without re-binding because both renderings share the persons
 * family's datasource template.
 *
 * Flat props throughout — the Sitecore adapter unwraps fields/params
 * in `persons.sitecore.ts`, so this file is runnable in Storybook
 * with plain values.
 */

/** Per-person extras envelope. Top-level FlatItem.title carries full name,
 * FlatItem.image carries headshot, FlatItem.href carries the profile URL. */
export interface PersonExtras {
  /** Job title / position / specialty. */
  role?: TextSource;
  /** Long-form bio narrative. RichText, matching doctor-details. */
  bio?: RichTextSource;
  /** Small uppercase label above the name. */
  eyebrow?: TextSource;
  email?: TextSource;
  phone?: TextSource;
  link?: LinkSource;
  image?: ImageSource;
  /** Optional social links (team-bio style). */
  socialLinks?: { platform: string; href: string }[];
}

export type PersonFlatItem = FlatItem<PersonExtras>;

export type PersonCardVariant =
  | "default"
  | "title-only"
  | "image-title-only"
  | "overlay";

export interface PersonListGridProps
  extends SectionSurfaceProps,
    CuratedCardChromeProps {
  /** Heading content. */
  title?: TextSource;
  lead?: TextSource;
  headingLayout?: string;
  headingSize?: string;

  /** Curated/search items. */
  items?: PersonFlatItem[];
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
  cardVariant?: PersonCardVariant;

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

type LayoutVariant = "grid" | "list" | "cards" | "fifty-fifty" | "featured";

/**
 * Shared body — picks data source, lays out items. Variants vary
 * largely by the listing className and which card primitive renders
 * each row. `featured` uses a custom hero + sidebar composition.
 */
function PersonListGridInner({
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
  mediaShape,
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
}: PersonListGridProps & {
  layoutVariant: LayoutVariant;
}) {
  const items: PersonFlatItem[] = useResolvedListItems(
    directItems,
    searchConfig,
    { rendering, allowCurated: true },
  );

  // Curated-mode chrome forwarded to every leaf card.
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
    ],
  );

  const renderCardPerson = useCallback(
    (item: PersonFlatItem) =>
      renderPersonCard({ item, variant: cardVariant, chrome }),
    [cardVariant, chrome],
  );

  const renderListPerson = useCallback(
    (item: PersonFlatItem) => {
      const props = flatPersonProps(item);
      if (cardVariant === "title-only") {
        return (
          <CardNavigate
            link={props.link}
            className="text-foreground hover:text-accent hover:underline"
          >
            <Text
              value={props.fullName}
              placeholder="Name"
              tag="span"
            />
          </CardNavigate>
        );
      }
      if (cardVariant === "default") {
        return <PersonCardCompactRow {...props} {...leafChromeProps(chrome)} />;
      }
      return renderPersonCard({
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
        layout: parseHeadingLayout(
          headingLayout,
          layoutVariant === "cards" ? "center" : "start-with-section-divider",
        ),
        headingOptions: { size: parseHeadingSize(headingSize, "default") },
      },
      ...(resultControls ? { resultControls } : {}),
    }),
    [title, lead, headingLayout, headingSize, resultControls, layoutVariant],
  );

  const hasItems = items.length > 0;
  const placeholderKey = "cards-persons-{*}";
  const renderItem =
    layoutVariant === "list" ? renderListPerson : renderCardPerson;

  return (
    <ListingSection
      colorScheme={colorScheme}
      backgroundIntensity={backgroundIntensity}
      paddingY={paddingY}
      maxWidth={maxWidth}
      overlapTop={overlapTop}
      slot="person-list-grid"
      entityName="persons"
      id={id}
      className={className}
    >
      {hasItems ? (
        layoutVariant === "featured" ? (
          <FeaturedLayout
            items={items}
            title={title}
            lead={lead}
            headingLayout={headingLayout}
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
              empty: <EmptyHint message={emptyStateMessage}>People</EmptyHint>,
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
          People
        </ListingFallback>
      )}
    </ListingSection>
  );
}

export function Grid(props: PersonListGridProps) {
  return <PersonListGridInner {...props} layoutVariant="grid" />;
}

export function List(props: PersonListGridProps) {
  return <PersonListGridInner {...props} layoutVariant="list" />;
}

export function Cards(props: PersonListGridProps) {
  return <PersonListGridInner {...props} layoutVariant="cards" />;
}

export function Featured(props: PersonListGridProps) {
  return <PersonListGridInner {...props} layoutVariant="featured" />;
}

export function FiftyFifty(props: PersonListGridProps) {
  return <PersonListGridInner {...props} layoutVariant="fifty-fifty" />;
}

export const Default = Grid;
export default Grid;

/**
 * Spread a flat person item onto the leaf card's prop shape. The
 * `extras` already carry editable Sources; FlatItem core fields are
 * fallback wrappers when extras are absent.
 */
export function flatPersonProps(
  item: PersonFlatItem,
): Pick<
  PersonCardProps,
  "fullName" | "role" | "bio" | "eyebrow" | "image" | "email" | "phone" | "link"
> {
  const extras = item.extras ?? {};
  return {
    fullName: item.title ? { value: item.title } : undefined,
    role: extras.role,
    bio: extras.bio,
    eyebrow: extras.eyebrow,
    image:
      extras.image ??
      (item.image?.src
        ? { value: { src: item.image.src, alt: item.image.alt } }
        : undefined),
    email: extras.email,
    phone: extras.phone,
    link:
      extras.link ??
      (item.href
        ? { value: { href: item.href, text: item.title } }
        : undefined),
  };
}

function renderPersonCard({
  item,
  variant,
  chrome,
}: {
  item: PersonFlatItem;
  variant: PersonCardVariant;
  chrome?: CuratedCardChromeProps;
}) {
  const props = flatPersonProps(item);
  if (variant === "overlay") {
    return <PersonCardOverlay {...props} mediaAspect={chrome?.mediaAspect} />;
  }
  const chromeProps = leafChromeProps(chrome);
  if (variant === "title-only" || variant === "image-title-only") {
    return <PersonCardImageLed {...props} {...chromeProps} />;
  }
  return <PersonCardStandard {...props} {...chromeProps} />;
}

/**
 * `featured` variant — one hero person (image-led, vertical) spanning
 * two columns on lg, with up to three supporting people stacked in a
 * sidebar using the horizontal card treatment.
 */
function FeaturedLayout({
  items,
  title,
  lead,
  headingLayout,
  headingSize,
  resultControls,
  emptyStateMessage,
  chrome,
}: {
  items: PersonFlatItem[];
  title?: TextSource;
  lead?: TextSource;
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
        empty: <EmptyHint message={emptyStateMessage}>People</EmptyHint>,
      }}
      behaviorOptions={listingBehaviorOptions}
      styleOptions={{ className: "", itemClassName: "" }}
      renderItem={() => (
        <div className="grid gap-6 lg:grid-cols-3">
          {featured ? (
            <div className="min-w-0 lg:col-span-2">
              <PersonCardStandard
                {...flatPersonProps(featured)}
                {...leafChromeProps(chrome)}
              />
            </div>
          ) : null}
          <ul className="grid list-none grid-cols-1 gap-4 ps-0 sm:grid-cols-2 lg:grid-cols-1">
            {rest.slice(0, 3).map((item) => (
              <li key={item.id} className="min-w-0">
                <PersonCardCompactRow
                  {...flatPersonProps(item)}
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
