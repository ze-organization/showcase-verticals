import { TypographyMuted } from "@/components/registry/primitives/core/typography";
import { cn } from "@/lib/registry/cn";

type QueryResultsSummaryProps = {
  currentPage: number;
  itemsPerPage: number;
  totalItemsReturned: number;
  totalItems: number;
  tone?: "default" | "subtle" | "emphasis";
  density?: "comfortable" | "compact";
  className?: string;
};
const QueryResultsSummary = ({
  currentPage,
  itemsPerPage,
  totalItems,
  totalItemsReturned,
  tone = "default",
  density = "comfortable",
  className,
}: QueryResultsSummaryProps) => {
  const hasResults = totalItems > 0 && totalItemsReturned > 0;
  const start = hasResults ? itemsPerPage * (currentPage - 1) + 1 : 0;
  const end = hasResults
    ? Math.min(
        itemsPerPage * (currentPage - 1) + totalItemsReturned,
        totalItems,
      )
    : 0;

  return (
    <TypographyMuted
      className={cn(
        "mx-0 my-auto",
        density === "compact" ? "text-sm" : "@[640px]:text-base text-sm",
        tone === "subtle"
          ? "text-muted-foreground/80"
          : tone === "emphasis"
            ? "font-medium text-foreground"
            : "text-muted-foreground",
        className,
      )}
      aria-live="polite"
    >
      Showing {start} - {end} of {totalItems} results
    </TypographyMuted>
  );
};

export { QueryResultsSummary };
export default QueryResultsSummary;
