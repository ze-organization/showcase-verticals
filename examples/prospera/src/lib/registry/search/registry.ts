import type { FlatItem, SearchProvider, SearchProviderKey } from "./types";

/**
 * Lazy provider registry — keeps the dynamic provider list out of the
 * static import graph so registry components can import the hook
 * without forcing in every provider client.
 *
 * Provider clients self-register at module-load time:
 *
 *   import { registerSearchProvider } from "@/lib/registry/search/registry";
 *   registerSearchProvider("coveo", { ... });
 *
 * The `custom` and `sitecore-search` providers register from
 * `providers/index.ts`, which the wrapper container imports on mount.
 */
const providers = new Map<SearchProviderKey, SearchProvider<FlatItem>>();

export function registerSearchProvider<TItem extends FlatItem>(
  key: SearchProviderKey,
  provider: SearchProvider<TItem>,
): void {
  providers.set(key, provider as SearchProvider<FlatItem>);
}

export function getSearchProvider(
  key: SearchProviderKey,
): SearchProvider<FlatItem> | undefined {
  return providers.get(key);
}

export function listSearchProviders(): SearchProviderKey[] {
  return Array.from(providers.keys());
}
