import type { WildcardExperienceProps } from "@/components/registry/components/ui/wildcard-experience";
import type { Field } from "@/lib/registry/sitecore";
import type { SitecoreInput } from "@/lib/registry/with-sitecore";

/**
 * Layout-service field shapes for `wildcard-experience@1`.
 *
 * The datasource is deliberately tiny — the wrapper renders no content
 * of its own. `SourceRoot` is resolver configuration; `Title` exists
 * only so the editing-mode hint can label the wrapper on the canvas.
 * All actual content comes from either the wildcard-resolved item
 * (overlaid onto child renderings via their `WildcardBindings` params)
 * or the children's own authored datasources.
 */
export interface WildcardExperienceFields {
  SourceRoot?: Field<string>;
  Title?: Field<string>;
}

const stringValue = (field: Field<string> | undefined): string | undefined => {
  const value = field?.value;
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
};

/**
 * Translate the Sitecore Layout Service input into
 * `WildcardExperienceProps`. `rendering` MUST be threaded through —
 * the wrapper renders the nested `wildcard-content-{*}` placeholder
 * from it (custom maps take full control of props, so dropping it here
 * would silently sever every composed child).
 */
export function mapWildcardExperience({
  fields,
  params,
  isEditing,
  rendering,
}: SitecoreInput<WildcardExperienceFields>): WildcardExperienceProps {
  return {
    sourceRoot: stringValue(fields?.SourceRoot),
    title: fields?.Title,
    id: params?.RenderingIdentifier,
    styles: params?.styles,
    isEditing,
    rendering,
  };
}

export { mapWildcardExperience as Default };
