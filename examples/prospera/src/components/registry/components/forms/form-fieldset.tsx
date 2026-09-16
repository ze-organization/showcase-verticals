"use client";

import { registerCdpRecipe } from "@/lib/registry/analytics/cdp-events";
import formFieldsetRecipe from "@/recipes/form-fieldset.recipe";

registerCdpRecipe(formFieldsetRecipe);

import {
  RichText,
  type RichTextSource,
} from "@/components/registry/primitives/editables/richtext";
import { isEmptySource } from "@/components/registry/primitives/editables/source-normalizers";
import {
  Text,
  type TextSource,
} from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import { type CmsProps, Placeholder } from "@/lib/registry/sitecore";

type FormGap = "none" | "sm" | "md" | "lg" | "xl";
// `md` (gap-6) is the fieldset's natural gap and the recipe's
// concrete standard value on gap@1.
const GAP_CLASSES: Record<FormGap, string> = {
  none: "gap-0",
  sm: "gap-3",
  md: "gap-6",
  lg: "gap-8",
  xl: "gap-10",
};

/**
 * Visual grouping for related form fields — semantically a `<fieldset>`
 * with a `<legend>` heading, so screen readers announce the group name
 * before the inner fields. Used to break long forms into logical
 * sections (Contact info / Mailing address / Marketing preferences)
 * without forking the FormBuilder rendering.
 *
 * Drops into the `form-fields-{*}` placeholder. Fields drop into the
 * fieldset's own `fieldset-fields-{*}` placeholder. Nesting one
 * fieldset inside another is supported via SXA's dynamic-placeholder
 * digit suffix.
 */

export interface FormFieldsetProps extends CmsProps {
  legend?: TextSource;
  description?: RichTextSource | TextSource;
  /** Visual treatment of the fieldset border. */
  variant?: "default" | "bordered" | "card";
  /** Spacing between the legend, description, and inner fields. */
  gap?: FormGap;
  /** SXA dynamic placeholder digit — matches FormBuilder's behaviour. */
  dynamicPlaceholderId?: string;
}

const VARIANT_CLASSES: Record<
  NonNullable<FormFieldsetProps["variant"]>,
  string
> = {
  default: "",
  bordered: "rounded-(--radius-md) border border-border p-4 md:p-6",
  card: "rounded-(--radius-lg) bg-muted/40 p-4 md:p-6",
};

export function Default({
  legend,
  description,
  variant = "default",
  gap = "md",
  styles,
  id,
  isEditing,
  rendering,
  dynamicPlaceholderId,
}: FormFieldsetProps) {
  const phSuffix = dynamicPlaceholderId ?? "1";
  const placeholderName = `fieldset-fields-${phSuffix}`;
  const hasLegend = legend != null && !isEmptySource(legend);
  const hasDescription = description != null && !isEmptySource(description);
  // `basis-full` so the fieldset itself takes a full row inside the
  // surrounding FormBuilder's flex-wrap container — nested fields
  // inside still respect their own half/third widths.
  return (
    <fieldset
      className={cn(
        "flex w-full basis-full flex-col",
        GAP_CLASSES[gap],
        VARIANT_CLASSES[variant],
        styles?.trimEnd(),
      )}
      data-slot="form-fieldset"
      data-variant={variant}
      id={id || undefined}
    >
      {(hasLegend || isEditing) && (
        <legend
          className="px-1 font-heading font-semibold text-base"
          data-slot="form-fieldset-legend"
        >
          <Text
            value={legend}
            tag="span"
            placeholder="Group title"
            isEditing={isEditing}
          />
        </legend>
      )}
      {(hasDescription || isEditing) && (
        <div
          className="text-muted-foreground text-sm"
          data-slot="form-fieldset-description"
        >
          <RichText
            value={description as RichTextSource}
            placeholder="Group description"
            isEditing={isEditing}
          />
        </div>
      )}
      {rendering ? (
        <div className={cn("flex w-full flex-wrap", GAP_CLASSES[gap])}>
          <Placeholder name={placeholderName} rendering={rendering} />
        </div>
      ) : (
        <div className={cn("flex w-full flex-wrap", GAP_CLASSES[gap])}>
          {/* Standalone showcase mode — render children passed in. */}
        </div>
      )}
    </fieldset>
  );
}

export const FormFieldset = Default;
export default Default;
export const componentType = "universal";
