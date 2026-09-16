"use client";

import { createContext, type ReactNode, useContext } from "react";
import type { FlatItem, SearchControllerState } from "./types";

/**
 * React context exposing search-controller state to descendant bar
 * renderings (search-bar, sort-dropdown, filter-panel, pagination,
 * etc.) and to the inner list-grid / carousel rendering that lives
 * inside a `<family>-search-experience` wrapper.
 *
 * When a bar rendering is placed OUTSIDE a wrapper (i.e. directly in a
 * page, configured with explicit props), it reads its props directly.
 * When placed INSIDE a wrapper, it pulls controller state from context.
 * Bar components check for context first, fall back to props.
 *
 * The wrapper container is the only producer. Bars and the inner
 * list/carousel are consumers.
 */
const SearchControllerContext =
  createContext<SearchControllerState<FlatItem> | null>(null);

export interface SearchControllerProviderProps {
  controller: SearchControllerState<FlatItem>;
  children: ReactNode;
}

export function SearchControllerProvider({
  controller,
  children,
}: SearchControllerProviderProps) {
  return (
    <SearchControllerContext.Provider value={controller}>
      {children}
    </SearchControllerContext.Provider>
  );
}

/**
 * Returns the ambient controller state if a parent
 * `SearchControllerProvider` is mounted, or `null` otherwise. Use this
 * in bar renderings to opt into context-driven mode while keeping the
 * standalone (prop-driven) path working.
 */
export function useSearchControllerContext(): SearchControllerState<FlatItem> | null {
  return useContext(SearchControllerContext);
}
