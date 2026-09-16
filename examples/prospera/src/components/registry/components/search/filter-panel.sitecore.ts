/**
 * Sitecore adapter for `filter-panel@1`. Unwraps `{ fields, params }` into
 * the flat props the React rendering consumes so checkbox strings and
 * Field objects never reach the presentation layer.
 */
import type { TextSource } from "@/components/registry/primitives/editables/text";
import { parseDefaultOnCheckbox } from "@/lib/registry/param-parsers";
import type { FilterPanelProps } from "./filter-panel";

interface SitecoreFilterPanelFields {
  Title?: TextSource;
  TriggerLabel?: TextSource;
  ClearLabel?: TextSource;
}

interface SitecoreFilterPanelParams {
  ShowCounts?: string;
  Collapsible?: string;
  RenderingIdentifier?: string;
  styles?: string;
}

export function adaptFilterPanelProps({
  fields,
  params,
}: {
  fields?: SitecoreFilterPanelFields;
  params?: SitecoreFilterPanelParams;
}): FilterPanelProps {
  return {
    title: fields?.Title,
    triggerLabel: fields?.TriggerLabel,
    clearLabel: fields?.ClearLabel,
    showCounts: parseDefaultOnCheckbox(params?.ShowCounts, false),
    collapsible: parseDefaultOnCheckbox(params?.Collapsible, false),
    className: params?.styles,
  };
}

export const Default = adaptFilterPanelProps;
export const Sidebar = adaptFilterPanelProps;
export const HorizontalChips = adaptFilterPanelProps;
export const Drawer = adaptFilterPanelProps;
