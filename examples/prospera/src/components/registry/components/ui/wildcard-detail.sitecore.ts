import type { WildcardDetailProps } from "@/components/registry/components/ui/wildcard-detail";
import type { Field, ImageField, RichTextField } from "@/lib/registry/sitecore";
import type { SitecoreInput } from "@/lib/registry/with-sitecore";

/**
 * Layout-service field shapes for `wildcard-detail@1`.
 *
 * The datasource carries only the resolver configuration
 * (`SourceRoot`) plus the generic authored-fallback quartet — the
 * variant-specific richness (tasting notes, ingredients, references,
 * …) comes from the *runtime-resolved* wildcard item, which the
 * component fetches client-side via `useWildcardItem` and which
 * therefore never flows through this adapter.
 *
 * Reference-field shape note: authored fallback fields here arrive in
 * Layout-Service shape; runtime-resolved fields arrive as Edge
 * `jsonValue`s. The two disagree on reference fields (LinkedItem vs.
 * jsonValue item entries) — `normalizeReferenceField` in
 * `src/lib/registry/wildcard/normalize.ts` accepts both, so any
 * future authored reference field should be routed through it rather
 * than read raw.
 */
export interface WildcardDetailFields {
  SourceRoot?: Field<string>;
  Title?: Field<string>;
  Subtitle?: Field<string>;
  Body?: RichTextField;
  Image?: ImageField;
}

const stringValue = (field: Field<string> | undefined): string | undefined => {
  const value = field?.value;
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : undefined;
};

/**
 * Translate the Sitecore Layout Service input (`{ fields, params }`)
 * into `WildcardDetailProps`. `SourceRoot` is unwrapped to a plain
 * string (it's resolver configuration, not renderable content); the
 * fallback quartet passes through as field sources so Pages inline
 * editing stays intact.
 */
export function mapWildcardDetail({
  fields,
  params,
  isEditing,
}: SitecoreInput<WildcardDetailFields>): WildcardDetailProps {
  return {
    sourceRoot: stringValue(fields?.SourceRoot),
    title: fields?.Title,
    subtitle: fields?.Subtitle,
    body: fields?.Body,
    image: fields?.Image,
    id: params?.RenderingIdentifier,
    styles: params?.styles,
    isEditing,
  };
}

// One map per rendering variant — same adapter for each; the variants
// differ in layout, not in datasource shape. Sitecore's variant lookup
// resolves `component.<VariantName>` against these exports.
export {
  mapWildcardDetail as Default,
  mapWildcardDetail as Product,
  mapWildcardDetail as Recipe,
  mapWildcardDetail as Initiative,
};
