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
import {
  Compact as LocationCardCompact,
  Default as LocationCardDefault,
  Inline as LocationCardInline,
  Pin as LocationCardPin,
} from "@/components/registry/components/cards-and-lists/location-card";
import type { ImageSource } from "@/components/registry/primitives/editables/image";
import type { LinkSource } from "@/components/registry/primitives/editables/link";
import type { TextSource } from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import {
  LocationsMapProvider,
  useLocationsMapContext,
} from "@/lib/registry/maps/locations-map-context";
import { useSearchControllerContext } from "@/lib/registry/search/search-controller-context";
import type { FlatItem, SearchConfig } from "@/lib/registry/search/types";
import { useResolvedListItems } from "@/lib/registry/search/use-resolved-list-items";
import type { SectionSurfaceProps } from "@/lib/registry/section-surface";
import { Placeholder } from "@/lib/registry/sitecore";
import { itemsFromComposedLocationCards } from "./locations.sitecore";
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
 * `LocationsListGrid` — Sitecore-aware list-or-grid rendering for the
 * locations family. Composed/curated/search-driven by which datasource
 * field is populated:
 *
 *   - composed → placeholder children (location-card@1 children)
 *   - curated  → `items` populated via Sitecore Treelist
 *   - search   → `items` populated by ambient `useSearchControllerContext`
 *
 * Map-aware variants. The map slot is a Sitecore `<Placeholder>` named
 * `locations-map-{*}` so tenants drop in their own Mapbox / Google /
 * Leaflet rendering. When no rendering is composed, we render a dashed
 * empty-state placard so authors see where the map will appear.
 *
 * Flat props throughout — the Sitecore adapter unwraps fields/params
 * in `locations.sitecore.ts`, so this file is runnable in Storybook
 * with plain values.
 */

export interface LocationExtras {
  address1?: TextSource;
  address2?: TextSource;
  city?: TextSource;
  state?: TextSource;
  postalCode?: TextSource;
  country?: TextSource;
  phone?: TextSource;
  email?: TextSource;
  hours?: TextSource;
  link?: LinkSource;
  image?: ImageSource;
  lat?: number;
  lng?: number;
  distance?: number;
  distanceUnit?: "mi" | "km";
}

export type LocationFlatItem = FlatItem<LocationExtras>;

export interface LocationsListGridProps
  extends SectionSurfaceProps,
    CuratedCardChromeProps {
  /** Heading content. */
  title?: TextSource;
  lead?: TextSource;
  headingLayout?: string;
  headingSize?: string;

  /** Curated/search items. */
  items?: LocationFlatItem[];
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

  /**
   * Dynamic placeholder suffix the SXA chrome injects per-placement.
   * Substituted into the literal `{*}` token in the map slot key so
   * the SDK's `^locations-map-\d+$` regex matches at runtime. See
   * `section-wrapper.tsx` for the full rationale.
   */
  dynamicPlaceholderId?: string;

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
  | "map-and-list"
  | "map-above"
  | "map-with-sidebar";

type CardVariantName = "default" | "compact" | "inline" | "pin";

function LocationsListGridInner({
  title,
  lead,
  headingLayout,
  headingSize,
  items: directItems,
  searchConfig,
  children,
  rendering,
  dynamicPlaceholderId,
  elevation,
  padding,
  cardStyle,
  cardColorScheme,
  colorBand,
  titleLinkIcon,
  mediaBleed,
  mediaAspect,
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
}: LocationsListGridProps & {
  layoutVariant: LayoutVariant;
}) {
  // The items resolver hides the controller, but the distance pill needs
  // its geo state, so read the ambient controller directly. Self-contained
  // search has no ambient controller and falls back to the default unit.
  const controller = useSearchControllerContext();
  const resolvedItems: LocationFlatItem[] = useResolvedListItems(
    directItems,
    searchConfig,
    { rendering, allowCurated: true },
  );
  const composedItems = useMemo(
    () => itemsFromComposedLocationCards(rendering, dynamicPlaceholderId),
    [rendering, dynamicPlaceholderId],
  );
  const items: LocationFlatItem[] =
    resolvedItems.length > 0 ? resolvedItems : composedItems;

  const distanceUnit: "mi" | "km" = controller?.location?.unit ?? "mi";
  const hasOrigin = Boolean(
    controller?.location?.lat != null && controller?.location?.lng != null,
  );

  // Sidebar layouts pack results tighter — default to the `compact` card.
  const cardVariant: CardVariantName = useMemo(() => {
    if (
      layoutVariant === "map-and-list" ||
      layoutVariant === "map-above" ||
      layoutVariant === "map-with-sidebar"
    ) {
      return "compact";
    }
    return "default";
  }, [layoutVariant]);

  // Curated-mode chrome forwarded to every leaf card (Default/Compact
  // honor it; Inline/Pin are chrome-free rows). `cardStyle` maps back
  // to the leaf's `style` prop name in `leafChromeProps`.
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

  const renderLocation = useCallback(
    (location: LocationFlatItem) => (
      <SelectableLocationCard
        variant={cardVariant}
        location={location}
        hasOrigin={hasOrigin}
        distanceUnit={distanceUnit}
        chrome={chrome}
      />
    ),
    [cardVariant, hasOrigin, distanceUnit, chrome],
  );

  const listLayoutClassName = useMemo(() => {
    if (layoutVariant === "list") return itemListingLayouts.stacked_md;
    if (layoutVariant === "map-and-list") return itemListingLayouts.stacked_sm;
    if (layoutVariant === "map-above") {
      return buildGridClassName({
        columnsLg,
        columnsMd,
        columnsSm,
        gap,
        featuredFirst,
      });
    }
    if (layoutVariant === "map-with-sidebar") {
      return itemListingLayouts.stacked_sm;
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
  const placeholderKey = "cards-locations-{*}";
  const mapPlaceholderKey = `locations-map-${dynamicPlaceholderId ?? "1"}`;

  const showMap =
    layoutVariant === "map-and-list" ||
    layoutVariant === "map-above" ||
    layoutVariant === "map-with-sidebar";

  const listingBody = hasItems ? (
    <ItemListing
      items={items}
      getKey={(location) => location.id}
      displayOptions={{
        as: "ul",
        itemAs: "li",
        empty: <EmptyHint message={emptyStateMessage}>Locations</EmptyHint>,
      }}
      behaviorOptions={listingBehaviorOptions}
      styleOptions={{
        className: listLayoutClassName,
        itemClassName: "min-w-0",
      }}
      renderItem={renderLocation}
    />
  ) : (
    <ListingFallback
      heading={listingBehaviorOptions.heading}
      placeholderKey={placeholderKey}
      rendering={rendering}
      fallback={children}
      composedClassName={listLayoutClassName}
      emptyStateMessage={emptyStateMessage}
    >
      Locations
    </ListingFallback>
  );

  return (
    <LocationsMapProvider items={items}>
    <ListingSection
      colorScheme={colorScheme}
      backgroundIntensity={backgroundIntensity}
      paddingY={paddingY}
      maxWidth={maxWidth}
      overlapTop={overlapTop}
      slot="locations-list-grid"
      entityName="locations"
      id={id}
      className={className}
    >
      {!showMap ? (
        listingBody
      ) : layoutVariant === "map-above" ? (
        <div className="flex flex-col gap-8">
          <MapSlot
            placeholderKey={mapPlaceholderKey}
            rendering={rendering}
            aspectClassName="aspect-[16/9] sm:aspect-[21/9]"
            className="w-full"
          />
          {listingBody}
        </div>
      ) : layoutVariant === "map-and-list" ? (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="order-2 lg:order-1">
            <MapSlot
              placeholderKey={mapPlaceholderKey}
              rendering={rendering}
              aspectClassName="aspect-[4/3] lg:aspect-auto lg:min-h-[28rem] lg:h-full"
              className="h-full w-full"
            />
          </div>
          <div className="order-1 min-w-0 lg:order-2">{listingBody}</div>
        </div>
      ) : (
        // map-with-sidebar — sticky map; sidebar list scrolls beside.
        <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
          <div className="min-w-0">
            <div className="lg:sticky lg:top-24">
              <MapSlot
                placeholderKey={mapPlaceholderKey}
                rendering={rendering}
                aspectClassName="aspect-[4/3] lg:aspect-[16/10] lg:min-h-[32rem]"
                className="w-full"
              />
            </div>
          </div>
          <div className="min-w-0 lg:max-h-[36rem] lg:overflow-y-auto lg:pe-2">
            {listingBody}
          </div>
        </div>
      )}
    </ListingSection>
    </LocationsMapProvider>
  );
}

export function Grid(props: LocationsListGridProps) {
  return <LocationsListGridInner {...props} layoutVariant="grid" />;
}

export function List(props: LocationsListGridProps) {
  return <LocationsListGridInner {...props} layoutVariant="list" />;
}

export function MapAndList(props: LocationsListGridProps) {
  return <LocationsListGridInner {...props} layoutVariant="map-and-list" />;
}

export function MapAbove(props: LocationsListGridProps) {
  return <LocationsListGridInner {...props} layoutVariant="map-above" />;
}

export function MapWithSidebar(props: LocationsListGridProps) {
  return <LocationsListGridInner {...props} layoutVariant="map-with-sidebar" />;
}

export const Default = Grid;
export default Grid;

function SelectableLocationCard({
  variant,
  location,
  hasOrigin,
  distanceUnit,
  chrome,
}: {
  variant: CardVariantName;
  location: LocationFlatItem;
  hasOrigin: boolean;
  distanceUnit: "mi" | "km";
  chrome?: CuratedCardChromeProps;
}) {
  const mapCtx = useLocationsMapContext();
  const selected = mapCtx?.selectedId === location.id;
  return (
    <div
      className={cn(
        "cursor-pointer rounded-[inherit]",
        selected && "ring-2 ring-primary",
      )}
      data-location-id={location.id}
      data-selected={selected ? "true" : undefined}
      onClick={() => mapCtx?.setSelectedId(location.id)}
    >
      {renderLocationCard({
        variant,
        location,
        hasOrigin,
        distanceUnit,
        chrome,
      })}
    </div>
  );
}

/**
 * Map each FlatItem's `extras` into the leaf card's flat props. The
 * leaf card already destructures `name/address1/...` so we just
 * forward — title is the location name and falls back to `item.title`.
 */
function buildCardProps({
  location,
  hasOrigin,
  distanceUnit,
}: {
  location: LocationFlatItem;
  hasOrigin: boolean;
  distanceUnit: "mi" | "km";
}) {
  const extras = location.extras ?? {};
  return {
    id: location.id,
    name: location.title,
    image: extras.image ?? location.image,
    href: extras.link ? undefined : location.href || undefined,
    link: extras.link,
    address1: extras.address1,
    address2: extras.address2,
    city: extras.city,
    state: extras.state,
    postalCode: extras.postalCode,
    country: extras.country,
    phone: extras.phone,
    email: extras.email,
    hours: extras.hours,
    lat: extras.lat,
    lng: extras.lng,
    // Distance pill only renders when the controller has an origin —
    // otherwise the value is meaningless ("3.2mi from where?").
    distance: hasOrigin ? extras.distance : undefined,
    distanceUnit: hasOrigin ? (extras.distanceUnit ?? distanceUnit) : undefined,
  };
}

function renderLocationCard({
  variant,
  location,
  hasOrigin,
  distanceUnit,
  chrome,
}: {
  variant: CardVariantName;
  location: LocationFlatItem;
  hasOrigin: boolean;
  distanceUnit: "mi" | "km";
  chrome?: CuratedCardChromeProps;
}) {
  const cardProps = {
    ...buildCardProps({ location, hasOrigin, distanceUnit }),
    ...leafChromeProps(chrome),
  };
  switch (variant) {
    case "compact":
      return <LocationCardCompact {...cardProps} />;
    case "inline":
      return <LocationCardInline {...cardProps} />;
    case "pin":
      return <LocationCardPin {...cardProps} />;
    default:
      return <LocationCardDefault {...cardProps} />;
  }
}

/**
 * The map slot. Tenants compose their own Mapbox/Google/Leaflet
 * rendering into the `locations-map-{*}` placeholder. When no
 * rendering is wired up (Storybook, fresh page), we show a dashed
 * placard so authors and reviewers see where the map will sit —
 * mirrors the dashed empty-state media-gallery-list-grid uses.
 */
function MapSlot({
  placeholderKey,
  rendering,
  aspectClassName,
  className,
}: {
  placeholderKey: string;
  rendering?: unknown;
  aspectClassName: string;
  className?: string;
}) {
  if (rendering) {
    return (
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-(--card-radius,var(--radius-lg)) bg-muted",
          aspectClassName,
          className,
        )}
        data-slot="locations-map"
      >
        {/* @ts-expect-error — rendering is opaque here; SDK validates at runtime */}
        <Placeholder name={placeholderKey} rendering={rendering} />
      </div>
    );
  }
  return (
    <div
      className={cn(
        "flex w-full items-center justify-center rounded-(--card-radius,var(--radius-lg)) border-2 border-border border-dashed bg-muted/40 text-muted-foreground",
        aspectClassName,
        className,
      )}
      data-slot="locations-map"
      data-empty="true"
    >
      <span className="font-medium text-sm uppercase tracking-wide">Map</span>
    </div>
  );
}

export const componentType = "universal";
