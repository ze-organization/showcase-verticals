"use client";

import { Button } from "@/components/registry/primitives/core/button";
import { TypographyH4 } from "@/components/registry/primitives/core/typography";
import { cn } from "@/lib/registry/cn";

export interface QuickSearchListItem {
  id: string;
  label: string;
  query?: string;
}

export interface QuickSearchListProps {
  title?: string;
  items: QuickSearchListItem[];
  selectedQuery?: string;
  onSelect?: (query: string, item: QuickSearchListItem) => void;
  className?: string;
}

/**
 * Compact, vertical quick-query list that can live in a sidebar,
 * typically beside result listings and facets.
 */
export function QuickSearchList({
  title = "Quick search",
  items,
  selectedQuery,
  onSelect,
  className,
}: QuickSearchListProps) {
  if (items.length === 0) return null;

  return (
    <div className={cn("component quick-search-list", className)}>
      <TypographyH4 className="mb-2 block ps-1 text-lg">{title}</TypographyH4>
      <ul className="flex flex-col gap-2">
        {items.map((item) => {
          const query = item.query ?? item.label;
          const isActive =
            selectedQuery != null &&
            selectedQuery.trim().toLowerCase() === query.trim().toLowerCase();
          const itemClass = cn(
            "inline-flex h-auto w-full justify-start rounded-md px-2 py-2 text-muted-foreground text-sm hover:bg-background hover:text-foreground",
            isActive && "bg-background text-foreground",
          );
          return (
            <li key={item.id}>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={itemClass}
                onClick={() => onSelect?.(query, item)}
              >
                {item.label}
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
