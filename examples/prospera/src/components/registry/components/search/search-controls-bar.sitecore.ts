/**
 * Sitecore adapter for `search-controls-bar@1`. Unwraps the layout-service
 * `{ fields, params }` payload into the flat props the React rendering
 * consumes. Without this adapter, convention-only wrapping delivers
 * `Field<{value}>` objects as `sortLabel` / `filtersButtonLabel` /
 * `searchPlaceholder` — React throws "Objects are not valid as a React
 * child" and the page goes blank the moment the bar is dropped.
 *
 * Keys mirror the variant export names (Default / Minimal / Compact) so
 * `withSitecore` applies the same map to each.
 */
import type { TextSource } from "@/components/registry/primitives/editables/text";
import { parseDefaultOnCheckbox } from "@/lib/registry/param-parsers";
import type { SearchControlsBarProps } from "./search-controls-bar";

interface SitecoreSearchControlsBarFields {
  SearchPlaceholder?: TextSource;
  SortLabel?: TextSource;
  FiltersButtonLabel?: TextSource;
}

interface SitecoreSearchControlsBarParams {
  ShowSearch?: string;
  ShowSort?: string;
  ShowFilter?: string;
  ShowView?: string;
  ShowCount?: string;
  ShowPerPage?: string;
  FiltersPlacement?: string;
  Surface?: string;
  Density?: string;
  RenderingIdentifier?: string;
  styles?: string;
}

const SURFACES = ["card", "muted", "inner", "none"] as const;
const DENSITIES = ["comfortable", "compact"] as const;
const PLACEMENTS = ["inline", "sidebar"] as const;

const oneOf = <T extends string>(
  value: string | undefined,
  allowed: readonly T[],
  fallback: T,
): T => {
  const normalized = value?.trim().toLowerCase() as T | undefined;
  return normalized && allowed.includes(normalized) ? normalized : fallback;
};

export function adaptSearchControlsBarProps({
  fields,
  params,
}: {
  fields?: SitecoreSearchControlsBarFields;
  params?: SitecoreSearchControlsBarParams;
}): SearchControlsBarProps {
  return {
    showSearch: parseDefaultOnCheckbox(params?.ShowSearch, true),
    showSort: parseDefaultOnCheckbox(params?.ShowSort, true),
    showFilter: parseDefaultOnCheckbox(params?.ShowFilter, true),
    showView: parseDefaultOnCheckbox(params?.ShowView, false),
    showCount: parseDefaultOnCheckbox(params?.ShowCount, true),
    showPerPage: parseDefaultOnCheckbox(params?.ShowPerPage, true),
    filtersPlacement: oneOf(params?.FiltersPlacement, PLACEMENTS, "inline"),
    surface: oneOf(params?.Surface, SURFACES, "card"),
    density: oneOf(params?.Density, DENSITIES, "comfortable"),
    searchPlaceholder: fields?.SearchPlaceholder,
    sortLabel: fields?.SortLabel,
    filtersButtonLabel: fields?.FiltersButtonLabel,
    className: params?.styles,
  };
}

export const Default = adaptSearchControlsBarProps;
export const Minimal = adaptSearchControlsBarProps;
export const Compact = adaptSearchControlsBarProps;
