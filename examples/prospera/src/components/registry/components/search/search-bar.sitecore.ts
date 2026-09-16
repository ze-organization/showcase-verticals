/**
 * Sitecore adapter for `search-bar@1`. Maps `PlaceholderText` / `SubmitLabel`
 * / `Action` onto the presentation props and unwraps the General Link
 * field to an href string the block's `router.push` can consume.
 */
import type { LinkSource } from "@/components/registry/primitives/editables/link";
import { getLinkHref } from "@/components/registry/primitives/editables/source-normalizers";
import type { TextSource } from "@/components/registry/primitives/editables/text";
import type { SearchBarProps } from "./search-bar";

interface SitecoreSearchBarFields {
  PlaceholderText?: TextSource;
  SubmitLabel?: TextSource;
  Action?: LinkSource;
}

interface SitecoreSearchBarParams {
  Variant?: string;
  RenderingIdentifier?: string;
  styles?: string;
}

const VARIANTS = ["default", "medium", "large", "input-only"] as const;

const oneOf = <T extends string>(
  value: string | undefined,
  allowed: readonly T[],
  fallback: T,
): T => {
  const normalized = value?.trim().toLowerCase() as T | undefined;
  return normalized && allowed.includes(normalized) ? normalized : fallback;
};

export function adaptSearchBarProps({
  fields,
  params,
}: {
  fields?: SitecoreSearchBarFields;
  params?: SitecoreSearchBarParams;
}): SearchBarProps {
  const href = getLinkHref(fields?.Action, "");
  return {
    placeholder: fields?.PlaceholderText,
    submitLabel: fields?.SubmitLabel,
    action: href || "/search",
    variant: oneOf(params?.Variant, VARIANTS, "default"),
    className: params?.styles,
  };
}

export const Default = adaptSearchBarProps;
