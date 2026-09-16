"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { FacetList } from "@/components/registry/blocks/facet-list";
import { PaginationControls } from "@/components/registry/blocks/pagination-controls";
import { QuickSearchList } from "@/components/registry/blocks/quick-search-list";
import {
  ResultControls,
  type ResultControlsProps,
} from "@/components/registry/blocks/result-controls";
import {
  BAND_INLINE_HEADING_GRID_CLASS,
  parseBandHeadingPlacement,
  SectionHeading,
  type SectionHeadingProps,
} from "@/components/registry/blocks/section-heading";
import type {
  CollectionControllerState,
  CollectionResultControlsOptions,
} from "@/hooks/registry/use-collection-controller";
import { cn } from "@/lib/registry/cn";

/**
 * Opinionated listing layouts for consistent "stacked" configurations.
 * Use these when the content should not be displayed as a grid.
 */
export const itemListingLayouts = {
  stacked_md: "flex flex-col gap-4",
  stacked_sm: "flex flex-col gap-2",
  divided_md: "flex flex-col divide-y divide-border",
} as const;

export interface ItemListingProps<TItem> {
  items: TItem[];
  renderItem: (item: TItem, index: number) => React.ReactNode;
  /**
   * Stable key for each item. Required to avoid index keys since this is a
   * generic building block used across many lists.
   */
  getKey: (item: TItem, index: number) => string;

  displayOptions?: {
    /**
     * Wrapper element for the list itself.
     * Use `as="ul"` and `itemAs="li"` for semantic lists.
     */
    as?: React.ElementType;
    /** Wrapper element for each item. */
    itemAs?: React.ElementType;
    /** Rendered when items is empty. */
    empty?: React.ReactNode;
  };
  behaviorOptions?: {
    /** Optional standardized heading (SectionWrapper heading mode). */
    heading?: SectionHeadingProps;
    /**
     * `band-heading-placement@1` — `above` (default) or `inline`
     * (heading in the leading column, items beside it). Split
     * HeadingLayout values supersede `inline`.
     */
    headingPlacement?: string;
    /** Optional collection-level controls (search/sort/filter/count). */
    resultControls?: ResultControlsProps;
    collectionController?: {
      state: CollectionControllerState<TItem, string>;
      resultControlsOptions?: CollectionResultControlsOptions;
    };
    /**
     * Optional collapsible mode. When provided, each row renders as a disclosure
     * with explicit React state, summary from `renderItem`, and expanded body
     * from `renderDetails`.
     */
    collapsible?: {
      renderDetails: (item: TItem, index: number) => React.ReactNode;
      summaryClassName?: string;
      detailsClassName?: string;
      defaultOpen?: boolean;
    };
    pagination?: {
      enabled?: boolean;
      pageSize?: number;
      initialPage?: number;
      summaryClassName?: string;
      controlsClassName?: string;
      previousLabel?: string;
      nextLabel?: string;
      styleVariant?: "default" | "compact";
      alignment?: "start" | "center" | "end";
      showPageNumbers?: boolean;
      visiblePageLinkCount?: number;
    };
  };
  styleOptions?: {
    /** Optional wrapper class (around heading + list). */
    wrapperClassName?: string;
    /** ClassName applied to the list wrapper. */
    className?: string;
    /** ClassName applied to each item wrapper. */
    itemClassName?: string;
  };
}

type CollapsibleOptions<TItem> = NonNullable<
  NonNullable<ItemListingProps<TItem>["behaviorOptions"]>["collapsible"]
>;

/**
 * One disclosure row in collapsible mode: a summary button that toggles the
 * expanded details body. Extracted so the `ItemListing` map callback stays flat.
 */
function CollapsibleRow<TItem>({
  itemKey,
  isOpen,
  summaryNode,
  collapsible,
  item,
  originalIndex,
  onToggle,
}: {
  itemKey: string;
  isOpen: boolean;
  summaryNode: React.ReactNode;
  collapsible: CollapsibleOptions<TItem>;
  item: TItem;
  originalIndex: number;
  onToggle: () => void;
}) {
  return (
    <div>
      <button
        type="button"
        className={cn(
          "group flex w-full items-start justify-between gap-3 rounded-md text-start",
          collapsible.summaryClassName,
        )}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`${itemKey}-details`}
      >
        <div className="min-w-0 flex-1">{summaryNode}</div>
        <span
          aria-hidden="true"
          className={cn(
            "mt-1 inline-flex shrink-0 text-muted-foreground text-sm transition-transform",
            isOpen && "rotate-180",
          )}
        >
          ^
        </span>
      </button>
      <div
        id={`${itemKey}-details`}
        className={cn(
          "pt-3",
          !isOpen && "hidden",
          collapsible.detailsClassName,
        )}
      >
        {collapsible.renderDetails(item, originalIndex)}
      </div>
    </div>
  );
}

type PaginationOptions = NonNullable<
  NonNullable<ItemListingProps<unknown>["behaviorOptions"]>["pagination"]
>;

/**
 * Pagination footer. Routes page changes through the collection controller
 * when present, otherwise drives the component's local `currentPage` state.
 */
function ListPagination({
  pagination,
  usesController,
  controllerPage,
  currentPage,
  totalPages,
  setPage,
  setCurrentPage,
}: {
  pagination: PaginationOptions | undefined;
  usesController: boolean;
  controllerPage: number;
  currentPage: number;
  totalPages: number;
  setPage: (page: number) => void;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}) {
  return (
    <PaginationControls
      currentPage={usesController ? controllerPage : currentPage}
      totalPages={totalPages}
      summaryClassName={pagination?.summaryClassName}
      controlsClassName={pagination?.controlsClassName}
      previousLabel={pagination?.previousLabel}
      nextLabel={pagination?.nextLabel}
      styleVariant={pagination?.styleVariant}
      alignment={pagination?.alignment}
      showPageNumbers={pagination?.showPageNumbers}
      visiblePageLinkCount={pagination?.visiblePageLinkCount}
      onPageChange={setPage}
      onPrevious={() =>
        usesController
          ? setPage(Math.max(1, controllerPage - 1))
          : setCurrentPage((prev) => Math.max(1, prev - 1))
      }
      onNext={() =>
        usesController
          ? setPage(Math.min(totalPages, controllerPage + 1))
          : setCurrentPage((prev) => Math.min(totalPages, prev + 1))
      }
    />
  );
}

/**
 * Wraps the rendered list in a filter sidebar (quick-search + facets) when the
 * result controls request sidebar placement; otherwise renders the list alone.
 */
function ListWithSidebar({
  resultControls,
  children,
}: {
  resultControls: ResultControlsProps | undefined;
  children: React.ReactNode;
}) {
  const filters = resultControls?.filters;
  const showSidebar =
    (filters?.enabled ?? false) &&
    filters?.placement === "sidebar" &&
    ((filters?.facets?.length ?? 0) > 0 ||
      (filters?.quickSearch?.enabled ?? false));
  if (!showSidebar) return children;

  const showQuickSearch =
    (filters?.quickSearch?.enabled ?? false) &&
    (filters?.quickSearch?.items?.length ?? 0) > 0;
  const showFacetList = (filters?.facets?.length ?? 0) > 0;
  return (
    <div
      className={cn(
        "grid gap-6",
        "@container @[1024px]:grid-cols-[minmax(220px,280px)_minmax(0,1fr)]",
      )}
    >
      <aside className="min-w-0">
        <div className="space-y-3">
          {showQuickSearch ? (
            <QuickSearchList
              title={filters?.quickSearch?.title}
              items={filters?.quickSearch?.items ?? []}
              selectedQuery={filters?.quickSearch?.selectedQuery}
              onSelect={filters?.quickSearch?.onSelect}
              className={filters?.quickSearch?.className}
            />
          ) : null}
          {showFacetList ? (
            <FacetList
              facets={filters?.facets ?? []}
              selectedValues={filters?.selectedValues}
              selectedRanges={filters?.selectedRanges}
              onValueToggle={filters?.onValueToggle}
              onRangeChange={filters?.onRangeChange}
              variant="search-facets-panel"
              showFacetLabels
            />
          ) : null}
        </div>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/**
 * Outer wrapper applied when a heading, wrapper class, or result controls are
 * present. A split-layout heading renders heading + (controls + list) in a
 * two-column grid; otherwise heading + controls + list stack vertically.
 */
function WrappedListing({
  heading,
  headingPlacement,
  resultControls,
  wrapperClassName,
  children,
}: {
  heading: SectionHeadingProps | undefined;
  headingPlacement?: string;
  resultControls: ResultControlsProps | undefined;
  wrapperClassName: string | undefined;
  children: React.ReactNode;
}) {
  const headingLayout = heading?.layout;
  const isSplitLayout =
    headingLayout === "split-start" || headingLayout === "split-end";
  const isInlineHeading =
    Boolean(heading) &&
    !isSplitLayout &&
    parseBandHeadingPlacement(headingPlacement) === "inline";
  const controls = resultControls ? (
    <ResultControls {...resultControls} className="mb-4" />
  ) : null;

  if (heading && isSplitLayout) {
    const isRight = headingLayout === "split-end";
    return (
      <div
        className={cn(
          "grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-10",
          wrapperClassName,
        )}
      >
        <div className={cn("lg:order-1", isRight && "lg:order-2")}>
          <SectionHeading {...heading} />
        </div>
        <div className={cn("min-w-0 lg:order-2", isRight && "lg:order-1")}>
          {controls}
          {children}
        </div>
      </div>
    );
  }

  if (heading && isInlineHeading) {
    return (
      <div className={cn(BAND_INLINE_HEADING_GRID_CLASS, wrapperClassName)}>
        <SectionHeading {...heading} />
        <div className="min-w-0">
          {controls}
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={wrapperClassName}>
      {heading ? <SectionHeading {...heading} /> : null}
      {controls}
      {children}
    </div>
  );
}

/** Resolve the slice of items to render for the current page, routing
 *  through the collection controller when one is present. */
function resolveVisibleItems<TItem>(args: {
  usesController: boolean;
  shouldPaginate: boolean;
  controller: CollectionControllerState<TItem, string> | undefined;
  items: TItem[];
  currentPage: number;
  pageSize: number;
}): TItem[] {
  const { usesController, shouldPaginate, controller, items } = args;
  if (usesController) {
    if (!shouldPaginate) return controller?.filteredItems ?? [];
    return controller?.pagedItems ?? [];
  }
  if (!shouldPaginate) return items;
  const start = (args.currentPage - 1) * args.pageSize;
  return items.slice(start, start + args.pageSize);
}

/** Reconcile the open/closed disclosure map against the currently
 *  visible items, preserving prior open state and defaulting new rows. */
function reconcileOpenMap<TItem>(
  prev: Record<string, boolean>,
  args: {
    visibleItems: TItem[];
    shouldPaginate: boolean;
    currentPage: number;
    pageSize: number;
    getKey: (item: TItem, index: number) => string;
    defaultOpen: boolean;
  },
): Record<string, boolean> {
  const next: Record<string, boolean> = {};
  args.visibleItems.forEach((item, index) => {
    const originalIndex = args.shouldPaginate
      ? (args.currentPage - 1) * args.pageSize + index
      : index;
    const key = args.getKey(item, originalIndex);
    next[key] = prev[key] ?? args.defaultOpen;
  });
  return next;
}

type PaginationModel = {
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  controllerPage: number;
  usesController: boolean;
  shouldPaginate: boolean;
  pageSize: number;
  totalPages: number;
  setPage: (page: number) => void;
};

/** Owns the page-state machine: local `currentPage` plus derived
 *  pagination geometry, routed through the collection controller when
 *  present. Clamps the local page into range when the page count shrinks. */
function usePaginationModel<TItem>(
  items: TItem[],
  controller: CollectionControllerState<TItem, string> | undefined,
  pagination: PaginationOptions | undefined,
): PaginationModel {
  const usesController = Boolean(controller);
  const controllerPage = controller?.currentPage ?? 1;
  const shouldPaginate = usesController
    ? (pagination?.enabled ?? true)
    : (pagination?.enabled ?? false);
  const pageSize = Math.max(1, pagination?.pageSize ?? 8);
  const totalPages = usesController
    ? (controller?.totalPages ?? 1)
    : shouldPaginate
      ? Math.ceil(items.length / pageSize)
      : 1;
  const [currentPage, setCurrentPage] = useState(
    Math.max(1, pagination?.initialPage ?? 1),
  );
  const setPage = (page: number) => {
    if (controller) {
      controller.setCurrentPage(page);
      return;
    }
    setCurrentPage(page);
  };

  useEffect(() => {
    if (usesController) return;
    if (!shouldPaginate) return;
    setCurrentPage((prev) => {
      if (prev < 1) return 1;
      if (prev > totalPages) return totalPages;
      return prev;
    });
  }, [shouldPaginate, totalPages, usesController]);

  return {
    currentPage,
    setCurrentPage,
    controllerPage,
    usesController,
    shouldPaginate,
    pageSize,
    totalPages,
    setPage,
  };
}

/** Render one row of the list, wrapping in a `CollapsibleRow` when
 *  collapsible mode is on and applying the optional item wrapper. */
function ListRow<TItem>({
  item,
  originalIndex,
  itemKey,
  isOpen,
  renderItem,
  collapsible,
  ItemWrapper,
  itemClassName,
  onToggle,
}: {
  item: TItem;
  originalIndex: number;
  itemKey: string;
  isOpen: boolean;
  renderItem: (item: TItem, index: number) => React.ReactNode;
  collapsible: CollapsibleOptions<TItem> | undefined;
  ItemWrapper: React.ElementType;
  itemClassName: string | undefined;
  onToggle: () => void;
}) {
  const summaryNode = renderItem(item, originalIndex);
  const node = collapsible ? (
    <CollapsibleRow
      itemKey={itemKey}
      isOpen={isOpen}
      summaryNode={summaryNode}
      collapsible={collapsible}
      item={item}
      originalIndex={originalIndex}
      onToggle={onToggle}
    />
  ) : (
    summaryNode
  );
  if (itemClassName) {
    return <ItemWrapper className={itemClassName}>{node}</ItemWrapper>;
  }
  return <>{node}</>;
}

export function ItemListing<TItem>({
  items,
  renderItem,
  getKey,
  displayOptions,
  behaviorOptions,
  styleOptions,
}: ItemListingProps<TItem>) {
  const resolvedHeading = behaviorOptions?.heading;
  const resolvedHeadingPlacement = behaviorOptions?.headingPlacement;
  const resolvedWrapperClassName = styleOptions?.wrapperClassName;
  const resolvedAs = displayOptions?.as;
  const resolvedItemAs = displayOptions?.itemAs;
  const resolvedClassName = styleOptions?.className;
  const resolvedItemClassName = styleOptions?.itemClassName;
  const resolvedEmpty = displayOptions?.empty;
  const resolvedCollapsible = behaviorOptions?.collapsible;
  const resolvedCollectionController = behaviorOptions?.collectionController;
  const controller = resolvedCollectionController?.state;
  const resolvedResultControls =
    behaviorOptions?.resultControls ??
    (controller
      ? controller.createResultControlsProps(
          resolvedCollectionController?.resultControlsOptions,
        )
      : undefined);
  const resolvedPagination = behaviorOptions?.pagination;
  const {
    currentPage,
    setCurrentPage,
    controllerPage,
    usesController,
    shouldPaginate,
    pageSize,
    totalPages,
    setPage,
  } = usePaginationModel(items, controller, resolvedPagination);
  const visibleItems = useMemo(
    () =>
      resolveVisibleItems({
        usesController,
        shouldPaginate,
        controller,
        items,
        currentPage,
        pageSize,
      }),
    [controller, currentPage, items, pageSize, shouldPaginate, usesController],
  );
  const hasItems = items.length > 0;
  const shouldWrap = Boolean(
    resolvedHeading || resolvedWrapperClassName || resolvedResultControls,
  );
  const Wrapper = (resolvedAs ?? "div") as React.ElementType;
  const ItemWrapper = (resolvedItemAs ?? "div") as React.ElementType;
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!resolvedCollapsible) return;
    setOpenMap((prev) =>
      reconcileOpenMap(prev, {
        visibleItems,
        shouldPaginate,
        currentPage,
        pageSize,
        getKey,
        defaultOpen: Boolean(resolvedCollapsible.defaultOpen),
      }),
    );
  }, [
    resolvedCollapsible,
    visibleItems,
    getKey,
    shouldPaginate,
    currentPage,
    pageSize,
  ]);

  if (!hasItems && !shouldWrap) return resolvedEmpty ?? null;

  const renderListRow = (item: TItem, index: number) => {
    const originalIndex = shouldPaginate
      ? (currentPage - 1) * pageSize + index
      : index;
    const key = getKey(item, originalIndex);
    const isOpen = openMap[key] ?? Boolean(resolvedCollapsible?.defaultOpen);
    const toggleRow = () =>
      setOpenMap((prev) => ({
        ...prev,
        [key]: !(prev[key] ?? Boolean(resolvedCollapsible?.defaultOpen)),
      }));
    return (
      <ListRow
        key={key}
        item={item}
        originalIndex={originalIndex}
        itemKey={key}
        isOpen={isOpen}
        renderItem={renderItem}
        collapsible={resolvedCollapsible}
        ItemWrapper={ItemWrapper}
        itemClassName={resolvedItemClassName}
        onToggle={toggleRow}
      />
    );
  };

  const list = hasItems ? (
    <div>
      <Wrapper className={resolvedClassName}>
        {visibleItems.map(renderListRow)}
      </Wrapper>
      {shouldPaginate ? (
        <ListPagination
          pagination={resolvedPagination}
          usesController={usesController}
          controllerPage={controllerPage}
          currentPage={currentPage}
          totalPages={totalPages}
          setPage={setPage}
          setCurrentPage={setCurrentPage}
        />
      ) : null}
    </div>
  ) : (
    (resolvedEmpty ?? null)
  );
  const listWithSidebar = (
    <ListWithSidebar resultControls={resolvedResultControls}>
      {list}
    </ListWithSidebar>
  );

  if (!shouldWrap) return listWithSidebar;

  return (
    <WrappedListing
      heading={resolvedHeading}
      headingPlacement={resolvedHeadingPlacement}
      resultControls={resolvedResultControls}
      wrapperClassName={resolvedWrapperClassName}
    >
      {listWithSidebar}
    </WrappedListing>
  );
}
