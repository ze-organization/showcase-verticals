/**
 * Sitecore adapter for `search-pagination-bar@1`. Unwraps `{ fields, params }`
 * into the flat props the React rendering consumes so checkbox strings
 * (`"1"` / `""`) and Field objects never reach the presentation layer.
 */
import type { TextSource } from "@/components/registry/primitives/editables/text";
import { parseDefaultOnCheckbox } from "@/lib/registry/param-parsers";
import type { SearchPaginationBarProps } from "./search-pagination-bar";

interface SitecoreSearchPaginationBarFields {
  PerPageLabel?: TextSource;
  PreviousLabel?: TextSource;
  NextLabel?: TextSource;
  SummaryTemplate?: TextSource;
  SummaryEmptyTemplate?: TextSource;
}

interface SitecoreSearchPaginationBarParams {
  ShowPagination?: string;
  ShowPerPage?: string;
  ShowSummary?: string;
  PerPageOptions?: string;
  Alignment?: string;
  RenderingIdentifier?: string;
  styles?: string;
}

const ALIGNMENTS = ["start", "center", "end", "split"] as const;

const oneOf = <T extends string>(
  value: string | undefined,
  allowed: readonly T[],
  fallback: T,
): T => {
  const normalized = value?.trim().toLowerCase() as T | undefined;
  return normalized && allowed.includes(normalized) ? normalized : fallback;
};

export function adaptSearchPaginationBarProps({
  fields,
  params,
}: {
  fields?: SitecoreSearchPaginationBarFields;
  params?: SitecoreSearchPaginationBarParams;
}): SearchPaginationBarProps {
  return {
    showPagination: parseDefaultOnCheckbox(params?.ShowPagination, true),
    showPerPage: parseDefaultOnCheckbox(params?.ShowPerPage, true),
    showSummary: parseDefaultOnCheckbox(params?.ShowSummary, true),
    perPageOptions: params?.PerPageOptions?.trim() || undefined,
    alignment: oneOf(params?.Alignment, ALIGNMENTS, "split"),
    perPageLabel: fields?.PerPageLabel,
    previousLabel: fields?.PreviousLabel,
    nextLabel: fields?.NextLabel,
    summaryTemplate: fields?.SummaryTemplate,
    summaryEmptyTemplate: fields?.SummaryEmptyTemplate,
    className: params?.styles,
  };
}

export const Default = adaptSearchPaginationBarProps;
export const Compact = adaptSearchPaginationBarProps;
