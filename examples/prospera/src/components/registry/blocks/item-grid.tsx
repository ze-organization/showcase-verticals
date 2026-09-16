"use client";

import { Fragment, type ReactNode, useEffect, useMemo, useState } from "react";
import { FacetList } from "@/components/registry/blocks/facet-list";
import { PaginationControls } from "@/components/registry/blocks/pagination-controls";
import { QuickSearchList } from "@/components/registry/blocks/quick-search-list";
import {
  ResultControls,
  type ResultControlsProps,
} from "@/components/registry/blocks/result-controls";
import {
  SectionHeading,
  type SectionHeadingProps,
} from "@/components/registry/blocks/section-heading";
import type {
  CollectionControllerState,
  CollectionResultControlsOptions,
} from "@/hooks/registry/use-collection-controller";
import { cn } from "@/lib/registry/cn";

/**
 * Opinionated responsive grid layouts for consistent listing patterns.
 * These use container queries so they respond to the docsite preview pane width.
 */
export const itemGridLayouts = {
  cards_1_2_3: "grid-cols-1 gap-6 @[640px]:grid-cols-2 @[1024px]:grid-cols-3",
} as const;

export type SplitLayoutColumns = "1-1" | "1-2" | "1-3" | "2-1" | "3-1";

function getSplitLayoutColumnsClass(columns: SplitLayoutColumns) {
  if (columns === "1-2") {
    return "lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]";
  }
  if (columns === "1-3") {
    return "lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)]";
  }
  if (columns === "2-1") {
    return "lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]";
  }
  if (columns === "3-1") {
    return "lg:grid-cols-[minmax(0,3fr)_minmax(0,1fr)]";
  }
  return "lg:grid-cols-2";
}

type ResolvedFilters = ResultControlsProps["filters"];

/** Should the sidebar filter rail render at all? */
function shouldRenderSidebar(filters: ResolvedFilters): boolean {
  if (!(filters?.enabled ?? false)) return false;
  if (filters?.placement !== "sidebar") return false;
  return (
    (filters?.facets?.length ?? 0) > 0 ||
    (filters?.quickSearch?.enabled ?? false)
  );
}

const SPLIT_HEADING_LAYOUTS = new Set([
  "split-start",
  "split-end",
  "split-start-separator",
  "split-end-separator",
  "split-start-accent-line",
  "split-end-accent-line",
]);

const SPLIT_END_LAYOUTS = new Set([
  "split-end",
  "split-end-separator",
  "split-end-accent-line",
]);

function resolveShouldPaginate(
  usesController: boolean,
  enabled: boolean | undefined,
): boolean {
  return usesController ? (enabled ?? true) : (enabled ?? false);
}

function resolveTotalPages(args: {
  usesController: boolean;
  controllerTotalPages: number | undefined;
  shouldPaginate: boolean;
  itemCount: number;
  pageSize: number;
}): number {
  if (args.usesController) return args.controllerTotalPages ?? 1;
  if (!args.shouldPaginate) return 1;
  return Math.ceil(args.itemCount / args.pageSize);
}

function selectVisibleItems<TItem>(args: {
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

export interface ItemGridProps<TItem> {
  items: TItem[];
  renderItem: (item: TItem, index: number) => ReactNode;
  /**
   * Stable key for each item. Required to avoid index keys since this is a
   * generic building block used across many carousels/grids.
   */
  getKey: (item: TItem, index: number) => string;

  /** Optional standardized heading (SectionWrapper heading mode). */
  heading?: SectionHeadingProps;
  /** Optional wrapper class (around heading + grid). */
  wrapperClassName?: string;

  /** ClassName applied to the grid wrapper. */
  className?: string;
  /** Optional wrapper around each rendered item (useful for min-w-0). */
  itemWrapperClassName?: string;
  /** Split layout columns for heading/content when using split heading layouts. */
  splitLayoutColumns?: SplitLayoutColumns;

  /** Rendered when items is empty. */
  empty?: ReactNode;
  /** Optional collection-level controls (search/sort/filter/count). */
  resultControls?: ResultControlsProps;
  collectionController?: {
    state: CollectionControllerState<TItem, string>;
    resultControlsOptions?: CollectionResultControlsOptions;
  };
  paginationOptions?: {
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
}

export function ItemGrid<TItem>({
  items,
  renderItem,
  getKey,
  heading,
  wrapperClassName,
  className,
  itemWrapperClassName,
  splitLayoutColumns = "1-1",
  empty,
  resultControls,
  collectionController,
  paginationOptions,
}: ItemGridProps<TItem>) {
  const controller = collectionController?.state;
  const usesController = Boolean(controller);
  const controllerPage = controller?.currentPage ?? 1;
  const setPage = (page: number) => {
    if (controller) {
      controller.setCurrentPage(page);
      return;
    }
    setCurrentPage(page);
  };
  const resolvedResultControls =
    resultControls ??
    (controller
      ? controller.createResultControlsProps(
          collectionController?.resultControlsOptions,
        )
      : undefined);
  const hasItems = items.length > 0;
  const shouldWrap = Boolean(
    heading || wrapperClassName || resolvedResultControls,
  );
  const shouldPaginate = resolveShouldPaginate(
    usesController,
    paginationOptions?.enabled,
  );
  const pageSize = Math.max(1, paginationOptions?.pageSize ?? 6);
  const totalPages = resolveTotalPages({
    usesController,
    controllerTotalPages: controller?.totalPages,
    shouldPaginate,
    itemCount: items.length,
    pageSize,
  });
  const [currentPage, setCurrentPage] = useState(
    Math.max(1, paginationOptions?.initialPage ?? 1),
  );

  useEffect(() => {
    if (usesController) return;
    if (!shouldPaginate) return;
    setCurrentPage((prev) => {
      if (prev < 1) return 1;
      if (prev > totalPages) return totalPages;
      return prev;
    });
  }, [shouldPaginate, totalPages, usesController]);

  const visibleItems = useMemo(
    () =>
      selectVisibleItems({
        usesController,
        shouldPaginate,
        controller,
        items,
        currentPage,
        pageSize,
      }),
    [controller, currentPage, items, pageSize, shouldPaginate, usesController],
  );

  if (!hasItems && !shouldWrap) return empty ?? null;

  const goPrevious = () =>
    usesController
      ? setPage(Math.max(1, controllerPage - 1))
      : setCurrentPage((prev) => Math.max(1, prev - 1));
  const goNext = () =>
    usesController
      ? setPage(Math.min(totalPages, controllerPage + 1))
      : setCurrentPage((prev) => Math.min(totalPages, prev + 1));

  const filters = resolvedResultControls?.filters;
  const sidebarVisible = shouldRenderSidebar(filters);
  const constrainedGridClassName = cn(
    className,
    sidebarVisible &&
      "lg:grid-cols-3 @[1024px]:grid-cols-3 @[1280px]:grid-cols-3",
  );
  const content = hasItems ? (
    <GridContent
      visibleItems={visibleItems}
      itemBaseIndex={shouldPaginate ? (currentPage - 1) * pageSize : 0}
      getKey={getKey}
      renderItem={renderItem}
      itemWrapperClassName={itemWrapperClassName}
      gridClassName={constrainedGridClassName}
      shouldPaginate={shouldPaginate}
      paginationOptions={paginationOptions}
      currentPage={usesController ? controllerPage : currentPage}
      totalPages={totalPages}
      onPageChange={setPage}
      onPrevious={goPrevious}
      onNext={goNext}
    />
  ) : (
    (empty ?? null)
  );
  const contentWithSidebar = sidebarVisible ? (
    <SidebarLayout filters={filters}>{content}</SidebarLayout>
  ) : (
    content
  );

  return (
    <ItemGridShell
      shouldWrap={shouldWrap}
      heading={heading}
      splitLayoutColumns={splitLayoutColumns}
      wrapperClassName={wrapperClassName}
      resolvedResultControls={resolvedResultControls}
    >
      {contentWithSidebar}
    </ItemGridShell>
  );
}

/**
 * Wraps the grid body in the appropriate outer chrome: bare content,
 * a split heading/content layout, or a heading + result-controls stack.
 */
function ItemGridShell({
  shouldWrap,
  heading,
  splitLayoutColumns,
  wrapperClassName,
  resolvedResultControls,
  children,
}: {
  shouldWrap: boolean;
  heading?: SectionHeadingProps;
  splitLayoutColumns: SplitLayoutColumns;
  wrapperClassName?: string;
  resolvedResultControls?: ResultControlsProps;
  children: ReactNode;
}) {
  if (!shouldWrap) return <>{children}</>;

  if (heading && SPLIT_HEADING_LAYOUTS.has(heading.layout ?? "")) {
    return (
      <SplitHeadingLayout
        heading={heading}
        splitLayoutColumns={splitLayoutColumns}
        wrapperClassName={wrapperClassName}
        resultControls={resolvedResultControls}
      >
        {children}
      </SplitHeadingLayout>
    );
  }

  return (
    <div className={wrapperClassName}>
      {heading ? <SectionHeading {...heading} /> : null}
      {resolvedResultControls ? (
        <ResultControls {...resolvedResultControls} className="mb-4" />
      ) : null}
      {children}
    </div>
  );
}

/** Filter rail (quick-search + facets) beside the grid content. */
function SidebarLayout({
  filters,
  children,
}: {
  filters: ResolvedFilters;
  children: ReactNode;
}) {
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

/** Two-column heading/content split layout. */
function SplitHeadingLayout({
  heading,
  splitLayoutColumns,
  wrapperClassName,
  resultControls,
  children,
}: {
  heading: SectionHeadingProps;
  splitLayoutColumns: SplitLayoutColumns;
  wrapperClassName?: string;
  resultControls?: ResultControlsProps;
  children: ReactNode;
}) {
  const isRight = SPLIT_END_LAYOUTS.has(heading.layout ?? "");
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 lg:gap-10",
        getSplitLayoutColumnsClass(splitLayoutColumns),
        wrapperClassName,
      )}
    >
      <div className={cn("lg:order-1", isRight && "lg:order-2")}>
        <SectionHeading {...heading} />
      </div>
      <div className={cn("min-w-0 lg:order-2", isRight && "lg:order-1")}>
        {resultControls ? (
          <ResultControls {...resultControls} className="mb-4" />
        ) : null}
        {children}
      </div>
    </div>
  );
}

interface GridContentProps<TItem> {
  visibleItems: TItem[];
  itemBaseIndex: number;
  getKey: (item: TItem, index: number) => string;
  renderItem: (item: TItem, index: number) => ReactNode;
  itemWrapperClassName?: string;
  gridClassName?: string;
  shouldPaginate: boolean;
  paginationOptions?: ItemGridProps<TItem>["paginationOptions"];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPrevious: () => void;
  onNext: () => void;
}

/** The grid of rendered items plus its optional pagination controls. */
function GridContent<TItem>({
  visibleItems,
  itemBaseIndex,
  getKey,
  renderItem,
  itemWrapperClassName,
  gridClassName,
  shouldPaginate,
  paginationOptions,
  currentPage,
  totalPages,
  onPageChange,
  onPrevious,
  onNext,
}: GridContentProps<TItem>) {
  return (
    <div>
      <div className={cn("grid", gridClassName)}>
        {visibleItems.map((item, index) => {
          const originalIndex = itemBaseIndex + index;
          const key = getKey(item, originalIndex);
          const node = renderItem(item, originalIndex);
          return itemWrapperClassName ? (
            <div key={key} className={itemWrapperClassName}>
              {node}
            </div>
          ) : (
            <Fragment key={key}>{node}</Fragment>
          );
        })}
      </div>
      {shouldPaginate ? (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          summaryClassName={paginationOptions?.summaryClassName}
          controlsClassName={paginationOptions?.controlsClassName}
          previousLabel={paginationOptions?.previousLabel}
          nextLabel={paginationOptions?.nextLabel}
          styleVariant={paginationOptions?.styleVariant}
          alignment={paginationOptions?.alignment}
          showPageNumbers={paginationOptions?.showPageNumbers}
          visiblePageLinkCount={paginationOptions?.visiblePageLinkCount}
          onPageChange={onPageChange}
          onPrevious={onPrevious}
          onNext={onNext}
        />
      ) : null}
    </div>
  );
}
