"use client";

import { PaginationControls } from "@/components/registry/blocks/pagination-controls";
import { ResultsPerPage as BlockResultsPerPage } from "@/components/registry/blocks/results-per-page";
import { TypographyMuted } from "@/components/registry/primitives/core/typography";
import { getSourceText } from "@/components/registry/primitives/editables/source-normalizers";
import type { TextSource } from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import { parseDefaultOnCheckbox } from "@/lib/registry/param-parsers";
import { useSearchControllerContext } from "@/lib/registry/search/search-controller-context";

/**
 * `SearchPaginationBar` — the bundled trailing-controls row for the
 * search-experience wrapper. One drop renders the three pieces almost
 * every search results page wants below the items: pagination,
 * results-per-page, and a results-summary line.
 *
 * Sits in the search-experience's `search-controls-trailing-{*}`
 * placeholder. Each piece is gated by a `Show…` param so authors can
 * hide what they don't need.
 *
 * Reads everything off `useSearchControllerContext` and composes the
 * blocks/ primitives (PaginationControls, ResultsPerPage, plus an
 * inline templated summary). Standalone placements (no wrapper context)
 * render an empty-state hint.
 */
export interface SearchPaginationBarProps {
  showPagination?: boolean | string;
  showPerPage?: boolean | string;
  showSummary?: boolean | string;

  perPageLabel?: TextSource;
  perPageOptions?: string | number[];
  summaryTemplate?: TextSource;
  summaryEmptyTemplate?: TextSource;
  previousLabel?: TextSource;
  nextLabel?: TextSource;
  alignment?: "start" | "center" | "end" | "split" | string;

  className?: string;
}

function parsePerPageOptions(options?: string | number[] | TextSource): number[] {
  if (!options) return [10, 25, 50];
  if (Array.isArray(options)) return options;
  const raw = typeof options === "string" ? options : getSourceText(options);
  if (!raw) return [10, 25, 50];
  return raw
    .split(",")
    .map((s) => Number.parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n) && n > 0);
}

function renderSummaryTemplate(
  template: string,
  start: number,
  end: number,
  total: number,
): string {
  return template
    .replaceAll("{start}", String(start))
    .replaceAll("{end}", String(end))
    .replaceAll("{total}", String(total));
}

export function Default({
  showPagination,
  showPerPage,
  showSummary,
  perPageLabel,
  perPageOptions = "10,25,50",
  summaryTemplate,
  summaryEmptyTemplate,
  previousLabel,
  nextLabel,
  alignment = "split",
  className,
}: SearchPaginationBarProps) {
  const controller = useSearchControllerContext();
  const paginationOn = parseDefaultOnCheckbox(showPagination, true);
  const perPageOn = parseDefaultOnCheckbox(showPerPage, true);
  const summaryOn = parseDefaultOnCheckbox(showSummary, true);

  if (!controller) {
    return (
      <div className="py-4 text-center text-muted-foreground text-sm">
        <span className="is-empty-hint">Pagination controls</span>
      </div>
    );
  }

  const resolvedPerPageOptions = parsePerPageOptions(perPageOptions);
  const currentPage = controller.currentPage ?? 1;
  const totalPages = controller.totalPages ?? 1;
  const pageSize = controller.pageSize ?? resolvedPerPageOptions[0];
  const totalItems = controller.totalItems ?? 0;
  const rangeStart = controller.resultRange.start ?? 0;
  const rangeEnd = controller.resultRange.end ?? 0;

  const summaryText = (() => {
    const tpl =
      getSourceText(summaryTemplate) ??
      "Showing {start}-{end} of {total} results";
    const emptyTpl = getSourceText(summaryEmptyTemplate) ?? "No results";
    if (totalItems === 0) return emptyTpl;
    return renderSummaryTemplate(tpl, rangeStart, rangeEnd, totalItems);
  })();

  const summary = summaryOn ? (
    <TypographyMuted className="text-sm">{summaryText}</TypographyMuted>
  ) : null;

  const perPage = perPageOn ? (
    <BlockResultsPerPage
      value={pageSize}
      options={resolvedPerPageOptions}
      onChange={(next) => controller.setPageSize(next)}
      showLabel
      surface="plain"
      label={getSourceText(perPageLabel) ?? "Results per page"}
    />
  ) : null;

  const pagination = paginationOn ? (
    <PaginationControls
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={(next) => controller.setCurrentPage(next)}
      onPrevious={() => controller.setCurrentPage(Math.max(1, currentPage - 1))}
      onNext={() =>
        controller.setCurrentPage(Math.min(totalPages, currentPage + 1))
      }
      previousLabel={getSourceText(previousLabel) ?? "Previous"}
      nextLabel={getSourceText(nextLabel) ?? "Next"}
      // PaginationControls now accepts the logical `start`/`end`
      // values directly — RTL-correct without consumer-side
      // physical mapping.
      alignment={
        alignment === "start" || alignment === "end" ? alignment : "center"
      }
    />
  ) : null;

  if (alignment === "split") {
    return (
      <div
        className={cn(
          "flex flex-col gap-3 border-border/60 border-t pt-4 sm:flex-row sm:items-center sm:justify-between",
          className,
        )}
      >
        <div className="flex flex-wrap items-center gap-4">
          {summary}
          {perPage}
        </div>
        {pagination ? <div className="shrink-0">{pagination}</div> : null}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-border/60 border-t pt-4",
        className,
      )}
    >
      {summary}
      {pagination}
      {perPage}
    </div>
  );
}

export function Compact(props: SearchPaginationBarProps) {
  return <Default {...props} alignment="end" />;
}

export const SearchPaginationBar = Default;
export default Default;

export const componentType = "universal";
