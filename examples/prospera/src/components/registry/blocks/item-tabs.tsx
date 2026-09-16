"use client";

import type React from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/registry/primitives/core/tabs";
import { cn } from "@/lib/registry/cn";

export interface ItemTabDefinition<TItem> {
  id: string;
  label: React.ReactNode;
  items: TItem[];
  renderItem?: (
    item: TItem,
    index: number,
    tab: ItemTabDefinition<TItem>,
  ) => React.ReactNode;
  getItemKey?: (
    item: TItem,
    index: number,
    tab: ItemTabDefinition<TItem>,
  ) => string;
  itemClassName?: string;
  empty?: React.ReactNode;
}

export interface ItemTabsProps<TItem> {
  tabs: Array<ItemTabDefinition<TItem>>;
  defaultTabId?: string;
  renderItem?: (
    item: TItem,
    index: number,
    tab: ItemTabDefinition<TItem>,
  ) => React.ReactNode;
  getItemKey?: (
    item: TItem,
    index: number,
    tab: ItemTabDefinition<TItem>,
  ) => string;
  empty?: React.ReactNode;
  className?: string;
  tabsListClassName?: string;
  tabsContentClassName?: string;
  itemsClassName?: string;
  triggerClassName?: string;
  listVariant?: "line" | "soft-rounded" | "segmented";
  triggerVariant?: "line" | "soft-rounded" | "segmented";
  tabsAriaLabel?: string;
}

export function ItemTabs<TItem>({
  tabs,
  defaultTabId,
  renderItem,
  getItemKey,
  empty,
  className,
  tabsListClassName,
  tabsContentClassName,
  itemsClassName,
  triggerClassName,
  listVariant = "line",
  triggerVariant = "line",
  tabsAriaLabel,
}: ItemTabsProps<TItem>) {
  if (!tabs.length) return null;

  const fallbackDefaultId = tabs.find((tab) => tab.items.length > 0)?.id;
  const resolvedDefaultId = defaultTabId ?? fallbackDefaultId ?? tabs[0]?.id;

  if (!resolvedDefaultId) return null;

  return (
    <Tabs defaultValue={resolvedDefaultId} className={className}>
      <TabsList
        className={cn("mb-6 flex w-full flex-wrap gap-2", tabsListClassName)}
        variant={listVariant}
        aria-label={tabsAriaLabel}
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            variant={triggerVariant}
            className={triggerClassName}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => {
        const tabRenderItem = tab.renderItem ?? renderItem;
        const tabGetItemKey = tab.getItemKey ?? getItemKey;

        return (
          <TabsContent
            key={tab.id}
            value={tab.id}
            className={cn("flex w-full flex-col gap-4", tabsContentClassName)}
          >
            {tab.items.length === 0 ? (
              (tab.empty ?? empty ?? null)
            ) : tabRenderItem && tabGetItemKey ? (
              <div className={cn("flex w-full flex-col gap-4", itemsClassName)}>
                {tab.items.map((item, index) => (
                  <div
                    key={tabGetItemKey(item, index, tab)}
                    className={tab.itemClassName}
                  >
                    {tabRenderItem(item, index, tab)}
                  </div>
                ))}
              </div>
            ) : null}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
