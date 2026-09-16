"use client";

import { Button } from "@/components/registry/primitives/core/button";
import { TypographyH4 } from "@/components/registry/primitives/core/typography";
import { Link } from "@/components/registry/primitives/editables/link";
import { cn } from "@/lib/registry/cn";

const listClassVertical = "flex flex-col gap-2";

export type ActionListItem = {
  label: string;
  href?: string;
  onSelect?: (label: string) => void;
};

export type ActionListProps = {
  title?: string;
  items: ActionListItem[];
  className?: string;
  id?: string;
};

/**
 * Client-only action list for interactive use-cases (e.g. suggestion pickers).
 * Use `onSelect` for command behavior; use `href` for direct navigation.
 */
export function ActionList({
  title = "Actions",
  items,
  className,
  id,
}: ActionListProps) {
  if (!items.length) return null;

  return (
    <div className={cn("component action-list", className)} id={id}>
      <TypographyH4 className="mb-2 block ps-1 text-lg">{title}</TypographyH4>
      <ul className={listClassVertical}>
        {items.map((item, index) => {
          const key = `${item.label}-${index}`;
          const itemClass =
            "inline-flex h-auto w-full justify-start rounded-md px-2 py-2 text-muted-foreground text-sm hover:bg-background hover:text-foreground";

          if (item.href !== undefined && item.href !== "") {
            return (
              <li key={key}>
                <Link
                  value={{ value: { href: item.href, text: item.label } }}
                  className={itemClass}
                />
              </li>
            );
          }

          return (
            <li key={key}>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={itemClass}
                onClick={() => item.onSelect?.(item.label)}
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

export default ActionList;
