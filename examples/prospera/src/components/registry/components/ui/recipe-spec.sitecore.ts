import type { RecipeSpecProps } from "@/components/registry/components/ui/recipe-spec";
import {
  isSurfaceTone,
  type SurfaceTone,
} from "@/lib/registry/color-scheme-classes";
import { parseSectionPaddingY } from "@/lib/registry/section-surface";
import type { Field } from "@/lib/registry/sitecore";
import type { SitecoreInput } from "@/lib/registry/with-sitecore";

/**
 * Layout-service field shapes for `recipe-spec@1`.
 *
 * All fields are optional on purpose — the component renders only the
 * rows whose fields carry content. On a wildcard page the same props
 * are typically overlaid per-URL via `WildcardBindings`
 * (e.g. `{"ingredients":"Ingredients","method":"Method"}`), so the
 * authored datasource doubles as the fallback surface.
 */
export interface RecipeSpecFields {
  Title?: Field<string>;
  Serves?: Field<number>;
  Ingredients?: Field<string>;
  Garnish?: Field<string>;
  AlcoholPerServe?: Field<string>;
  Equipment?: Field<string>;
  Method?: Field<string>;
  PrepTimeMinutes?: Field<number>;
  GlassType?: Field<string>;
  Difficulty?: Field<string>;
}

const toSurfaceTone = (value: string | undefined): SurfaceTone => {
  const raw = value?.trim().toLowerCase() ?? "";
  return isSurfaceTone(raw) ? raw : "none";
};

/**
 * Translate the Sitecore Layout Service input into `RecipeSpecProps`.
 * Field envelopes pass through verbatim so the registry editables keep
 * Pages inline editing intact; params follow the shared section-surface
 * vocabulary (`ColorScheme` → surface tone, `PaddingY`).
 *
 * One map fans out to both variants (Default / Compact) — the variants
 * differ in layout only and share this datasource contract.
 */
export function mapRecipeSpec({
  fields,
  params,
  isEditing,
}: SitecoreInput<RecipeSpecFields>): RecipeSpecProps {
  return {
    title: fields?.Title,
    serves: fields?.Serves,
    ingredients: fields?.Ingredients,
    garnish: fields?.Garnish,
    alcoholPerServe: fields?.AlcoholPerServe,
    equipment: fields?.Equipment,
    method: fields?.Method,
    prepTimeMinutes: fields?.PrepTimeMinutes,
    glassType: fields?.GlassType,
    difficulty: fields?.Difficulty,
    surfaceTone: toSurfaceTone(params?.ColorScheme),
    paddingY: parseSectionPaddingY(params?.PaddingY, "auto"),
    id: params?.RenderingIdentifier,
    styles: params?.styles,
    isEditing,
  };
}

export { mapRecipeSpec as Default, mapRecipeSpec as Compact };
