import type { LinkedItemsRailProps } from "@/components/registry/components/ui/linked-items-rail";
import {
  isSurfaceTone,
  type SurfaceTone,
} from "@/lib/registry/color-scheme-classes";
import { parseSectionPaddingY } from "@/lib/registry/section-surface";
import type { Field } from "@/lib/registry/sitecore";
import type { SitecoreInput } from "@/lib/registry/with-sitecore";

/**
 * Layout-service field shapes for `linked-items-rail@1`.
 *
 * The datasource is heading-only on purpose: `items` is NOT a
 * datasource field — it arrives through the `WildcardBindings`
 * rendering param (`{"items":"<ReferenceFieldName>"}`) when the
 * rendering sits inside `wildcard-experience@1`. The `withSitecore`
 * seam normalizes the resolved reference field into
 * `WildcardLinkedItem[]` and overlays it onto the mapped props AFTER
 * this map runs — so the map never sets `items`, and outside a
 * resolved wildcard context the component renders just the authored
 * heading (live) or the labeled placeholder row (editing canvas).
 */
export interface LinkedItemsRailFields {
  Title?: Field<string>;
  Intro?: Field<string>;
}

const toSurfaceTone = (value: string | undefined): SurfaceTone => {
  const raw = value?.trim().toLowerCase() ?? "";
  return isSurfaceTone(raw) ? raw : "none";
};

/**
 * Translate the Sitecore Layout Service input into
 * `LinkedItemsRailProps`. One map fans out to both variants
 * (Rail / Grid) — they differ in layout only.
 */
export function mapLinkedItemsRail({
  fields,
  params,
  isEditing,
}: SitecoreInput<LinkedItemsRailFields>): LinkedItemsRailProps {
  return {
    title: fields?.Title,
    intro: fields?.Intro,
    surfaceTone: toSurfaceTone(params?.ColorScheme),
    paddingY: parseSectionPaddingY(params?.PaddingY, "auto"),
    id: params?.RenderingIdentifier,
    styles: params?.styles,
    isEditing,
  };
}

export {
  mapLinkedItemsRail as Rail,
  mapLinkedItemsRail as Grid,
  mapLinkedItemsRail as Default,
};
