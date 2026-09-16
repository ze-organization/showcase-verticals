/**
 * Sitecore adapter for `search-experience@1`. Unwraps the layout-service
 * `{ fields, params }` payload into the flat props the React wrapper
 * consumes. Before this adapter existed the component was registered
 * convention-only, which delivered raw strings where the component
 * expects typed values (`resultsPerPage` as `"12"`, `stickyControls` as
 * `"1"`, `searchConfig` as a `Field<string>` blob) and dropped the
 * section params (`card-search-experience-params@1` includes the four
 * shared section-surface params + HeadingLayout) on the floor.
 *
 * Keys mirror the variant export names (Default / SidebarFacets) so
 * `withSitecore` applies the same map to each.
 */
import type { TextSource } from "@/components/registry/primitives/editables/text";
import type { SearchConfig } from "@/lib/registry/search/types";
import { adaptSectionSurfaceParams } from "@/lib/registry/section-surface";
import type { Field } from "@/lib/registry/sitecore";

export interface SitecoreSearchExperienceFields {
  Title?: TextSource;
  Lead?: TextSource;
  SearchConfig?: Field<string>;
}

export interface SitecoreSearchExperienceParams {
  /** Wrapper behavior (CARD_SEARCH_EXPERIENCE_PARAMS). */
  FacetPlacement?: string;
  StickyControls?: string;
  DefaultView?: string;
  ResultsPerPage?: string;
  InitialSort?: string;
  ShowResultsSummary?: string;

  /** Heading + section surface (shared card-list base params). */
  HeadingLayout?: string;
  HeadingSize?: string;
  ColorScheme?: string;
  BackgroundIntensity?: string;
  PaddingY?: string;
  MaxWidth?: string;

  /** Standard. */
  RenderingIdentifier?: string;
  styles?: string;
}

const ALLOWED_FACET_PLACEMENTS = [
  "sidebar",
  "horizontal",
  "drawer",
  "none",
] as const;
const ALLOWED_VIEWS = ["grid", "list"] as const;

const oneOf = <T extends string>(
  value: string | undefined,
  allowed: readonly T[],
  fallback: T,
): T => {
  const normalized = value?.trim().toLowerCase() as T | undefined;
  return normalized && allowed.includes(normalized) ? normalized : fallback;
};

const parseIntOr = (value: string | undefined, fallback: number) => {
  const n = Number.parseInt((value ?? "").trim(), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

// Preserves `undefined` so Sitecore Standard Values keep driving the
// initial state on boolean params — per project memory
// `feedback_no_react_defaults_for_sitecore_bool_params`.
const parseBoolMaybe = (value?: string): boolean | undefined => {
  if (value === undefined || value === null) return undefined;
  const trimmed = value.trim().toLowerCase();
  if (trimmed === "") return undefined;
  if (trimmed === "1" || trimmed === "true") return true;
  if (trimmed === "0" || trimmed === "false") return false;
  return undefined;
};

export function adaptSearchConfig(
  field: Field<string> | undefined,
): SearchConfig | undefined {
  const raw = field?.value?.trim();
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as SearchConfig;
    if (!parsed.provider || !parsed.source) return undefined;
    return parsed;
  } catch {
    return undefined;
  }
}

export function adaptSearchExperienceProps({
  fields,
  params,
}: {
  fields?: SitecoreSearchExperienceFields;
  params?: SitecoreSearchExperienceParams;
}) {
  return {
    title: fields?.Title,
    lead: fields?.Lead,
    searchConfig: adaptSearchConfig(fields?.SearchConfig),
    facetPlacement: oneOf(
      params?.FacetPlacement,
      ALLOWED_FACET_PLACEMENTS,
      "none",
    ),
    stickyControls: parseBoolMaybe(params?.StickyControls),
    defaultView: oneOf(params?.DefaultView, ALLOWED_VIEWS, "grid"),
    resultsPerPage: parseIntOr(params?.ResultsPerPage, 12),
    initialSort: params?.InitialSort?.trim() || "featured",
    showResultsSummary: parseBoolMaybe(params?.ShowResultsSummary),
    headingLayout: params?.HeadingLayout,
    headingSize: params?.HeadingSize,
    ...adaptSectionSurfaceParams(params),
    id: params?.RenderingIdentifier,
    className: params?.styles,
  };
}

export const Default = adaptSearchExperienceProps;
export const SidebarFacets = adaptSearchExperienceProps;
