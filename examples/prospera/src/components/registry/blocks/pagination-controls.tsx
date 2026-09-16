"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/registry/primitives/core/pagination";
import { cn } from "@/lib/registry/cn";

export interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  summaryClassName?: string;
  controlsClassName?: string;
  previousLabel?: string;
  nextLabel?: string;
  styleVariant?: "default" | "compact";
  /**
   * Horizontal alignment of the pagination row. Logical values per
   * [[feedback_logical_props_not_physical]]: `start` / `end` map to
   * RTL-correct `justify-start` / `justify-end`.
   */
  alignment?: "start" | "end" | "center";
  showPageNumbers?: boolean;
  showSummary?: boolean;
  /**
   * Maximum number of numeric page links shown between previous/next controls.
   * Minimum effective value is 2.
   */
  visiblePageLinkCount?: number;
}

type PageToken = number | "ellipsis-left" | "ellipsis-right";

/** Compute the ordered list of numeric page links (and ellipsis
 *  markers) to render between the previous/next controls. */
function computeVisiblePageTokens(
  currentPage: number,
  totalPages: number,
  maxVisibleLinks: number,
): PageToken[] {
  if (totalPages <= maxVisibleLinks) {
    return Array.from({ length: totalPages }, (_unused, index) => index + 1);
  }

  const half = Math.floor(maxVisibleLinks / 2);
  let start = currentPage - half;
  let end = start + maxVisibleLinks - 1;

  if (start < 1) {
    start = 1;
    end = maxVisibleLinks;
  }
  if (end > totalPages) {
    end = totalPages;
    start = Math.max(1, end - maxVisibleLinks + 1);
  }

  const visibleSet = new Set(
    Array.from({ length: totalPages }, (_unused, index) => index + 1).filter(
      (page) => page >= start && page <= end,
    ),
  );
  visibleSet.add(1);
  visibleSet.add(totalPages);

  const sortedPages = Array.from(visibleSet).sort((a, b) => a - b);
  const visibleTokens: PageToken[] = [];
  for (const page of sortedPages) {
    const previous = visibleTokens[visibleTokens.length - 1];
    if (typeof previous === "number" && page - previous > 1) {
      visibleTokens.push(
        previous < currentPage ? "ellipsis-left" : "ellipsis-right",
      );
    }
    visibleTokens.push(page);
  }
  return visibleTokens;
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  onPrevious,
  onNext,
  summaryClassName,
  controlsClassName,
  previousLabel = "Previous",
  nextLabel = "Next",
  styleVariant = "default",
  alignment = "end",
  showPageNumbers,
  showSummary = false,
  visiblePageLinkCount = 5,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  const isCompact = styleVariant === "compact";
  const atStart = currentPage <= 1;
  const atEnd = currentPage >= totalPages;
  const shouldShowPageNumbers = showPageNumbers ?? true;
  const maxVisibleLinks = Math.max(2, Math.floor(visiblePageLinkCount));
  const alignmentClassName =
    alignment === "start"
      ? "justify-start"
      : alignment === "center"
        ? "justify-center"
        : "justify-end";

  return (
    <div className={cn("mt-6 flex items-center gap-3")}>
      {showSummary ? (
        <p className={cn("text-muted-foreground text-sm", summaryClassName)}>
          Page {currentPage} of {totalPages}
        </p>
      ) : null}
      <div className={cn("flex flex-1", alignmentClassName)}>
        <Pagination
          className={cn("mx-0 w-auto justify-end", controlsClassName)}
        >
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                as="button"
                styleVariant={isCompact ? "minimal" : "default"}
                showLabel={!isCompact}
                label={previousLabel}
                className={
                  atStart ? "pointer-events-none opacity-40" : undefined
                }
                disabled={atStart}
                aria-disabled={atStart}
                onClick={() => {
                  if (atStart) return;
                  onPrevious();
                }}
              />
            </PaginationItem>
            {shouldShowPageNumbers
              ? computeVisiblePageTokens(
                  currentPage,
                  totalPages,
                  maxVisibleLinks,
                ).map((token) => {
                  if (typeof token !== "number") {
                    return (
                      <PaginationItem key={token}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }

                  const isActivePage = token === currentPage;
                  return (
                    <PaginationItem key={`page-${token}`}>
                      <PaginationLink
                        as="button"
                        isActive={isActivePage}
                        styleVariant={isCompact ? "minimal" : "default"}
                        onClick={() => {
                          if (isActivePage) return;
                          onPageChange?.(token);
                        }}
                      >
                        {token}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })
              : null}
            <PaginationItem>
              <PaginationNext
                as="button"
                styleVariant={isCompact ? "minimal" : "default"}
                showLabel={!isCompact}
                label={nextLabel}
                className={atEnd ? "pointer-events-none opacity-40" : undefined}
                disabled={atEnd}
                aria-disabled={atEnd}
                onClick={() => {
                  if (atEnd) return;
                  onNext();
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
