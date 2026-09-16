/**
 * Sitecore adapter for `location-search-bar@1`. Unwraps `{ fields, params }`
 * into the flat props the React rendering consumes so Field objects
 * never land on `<input placeholder>` / button children.
 */
import type { TextSource } from "@/components/registry/primitives/editables/text";
import { parseDefaultOnCheckbox } from "@/lib/registry/param-parsers";
import type { LocationSearchBarProps } from "./location-search-bar";

interface SitecoreLocationSearchBarFields {
  InputPlaceholder?: TextSource;
  RadiusLabel?: TextSource;
  UseMyLocationLabel?: TextSource;
  SubmitLabel?: TextSource;
}

interface SitecoreLocationSearchBarParams {
  RadiusOptions?: string;
  DefaultUnit?: string;
  ShowRadius?: string;
  ShowUseMyLocation?: string;
  RenderingIdentifier?: string;
  styles?: string;
}

const UNITS = ["mi", "km"] as const;

const oneOf = <T extends string>(
  value: string | undefined,
  allowed: readonly T[],
  fallback: T,
): T => {
  const normalized = value?.trim().toLowerCase() as T | undefined;
  return normalized && allowed.includes(normalized) ? normalized : fallback;
};

export function adaptLocationSearchBarProps({
  fields,
  params,
}: {
  fields?: SitecoreLocationSearchBarFields;
  params?: SitecoreLocationSearchBarParams;
}): LocationSearchBarProps {
  return {
    inputPlaceholder: fields?.InputPlaceholder,
    radiusLabel: fields?.RadiusLabel,
    useMyLocationLabel: fields?.UseMyLocationLabel,
    submitLabel: fields?.SubmitLabel,
    radiusOptions: params?.RadiusOptions?.trim() || undefined,
    defaultUnit: oneOf(params?.DefaultUnit, UNITS, "mi"),
    showRadius: parseDefaultOnCheckbox(params?.ShowRadius, true),
    showUseMyLocation: parseDefaultOnCheckbox(params?.ShowUseMyLocation, true),
    className: params?.styles,
  };
}

export const Default = adaptLocationSearchBarProps;
export const Compact = adaptLocationSearchBarProps;
