"use client";

import { useId } from "react";
import {
  type FormFieldSize,
  type FormFieldWidth,
  type FormLabelOrientation,
  SIZE_LABEL_CLASSES,
  WIDTH_GRID_CLASSES,
} from "@/components/registry/blocks/form-field-shell";
import { Checkbox } from "@/components/registry/primitives/core/checkbox";
import { Label } from "@/components/registry/primitives/core/label";
import { Switch as SwitchPrimitive } from "@/components/registry/primitives/core/switch";
import {
  RichText,
  type RichTextSource,
} from "@/components/registry/primitives/editables/richtext";
import { getSourceText } from "@/components/registry/primitives/editables/source-normalizers";
import type { TextSource } from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import type { CmsProps } from "@/lib/registry/sitecore";

export interface FormCheckboxFieldFields {
  Name?: TextSource;
  Label?: RichTextSource;
  Description?: TextSource;
}

/** `start` puts the checkbox before the label (`[x] I agree`); `end` puts it after (`Receive emails [x]`). RTL-safe via logical row direction. */
export type FormCheckboxPosition = "start" | "end";

export interface FormCheckboxFieldProps extends CmsProps {
  name?: TextSource;
  label?: RichTextSource;
  description?: TextSource;
  required?: string | boolean;
  defaultChecked?: string | boolean;
  width?: FormFieldWidth;
  size?: FormFieldSize;
  labelOrientation?: FormLabelOrientation;
  checkboxPosition?: FormCheckboxPosition;
}

// Checkbox + Switch box dimensions per `size@1`. Applied as a Tailwind
// descendant selector to the Checkbox / Switch primitive's
// `data-slot` so we don't have to pass a size prop into Radix
// internals. `default` cascades to `md`.
const SIZE_CHECKBOX_CLASSES: Record<FormFieldSize, string> = {
  default: "[&_[data-slot=checkbox]]:size-4 [&_[data-slot=switch]]:h-5",
  xs: "[&_[data-slot=checkbox]]:size-3 [&_[data-slot=switch]]:h-3.5",
  sm: "[&_[data-slot=checkbox]]:size-3.5 [&_[data-slot=switch]]:h-4",
  md: "[&_[data-slot=checkbox]]:size-4 [&_[data-slot=switch]]:h-5",
  lg: "[&_[data-slot=checkbox]]:size-5 [&_[data-slot=switch]]:h-6",
  xl: "[&_[data-slot=checkbox]]:size-6 [&_[data-slot=switch]]:h-7",
};

function isEnabled(value: string | boolean | TextSource | undefined): boolean {
  if (typeof value === "boolean") return value;
  if (value == null) return false;
  const raw =
    typeof value === "object" && "value" in value
      ? (value as { value?: unknown }).value
      : value;
  if (typeof raw === "boolean") return raw;
  if (typeof raw !== "string") return false;
  const normalized = raw.trim().toLowerCase();
  return ["1", "true", "yes", "on", "enabled"].includes(normalized);
}

/**
 * Single checkbox rendered inside a FormBuilder's `form-fields-{*}`
 * placeholder. Radix Checkbox doesn't submit a native value on its
 * own, so the underlying primitive shims an `<input type="hidden">`
 * sibling — `formData.get("<name>") === "on"` reads the checked
 * state at submit time.
 */
export function Default(props: FormCheckboxFieldProps) {
  const fieldId = useId();
  const {
    name,
    label,
    description,
    required,
    defaultChecked,
    width = "full",
    size = "default",
    labelOrientation = "row",
    checkboxPosition = "start",
    isEditing,
    styles,
    id,
  } = props;

  const nameText = getSourceText(name) || "field";
  const descriptionText = getSourceText(description) || undefined;
  const isRequired = isEnabled(required);
  const initialChecked = isEnabled(defaultChecked);
  const descId = descriptionText ? `${fieldId}-desc` : undefined;
  // `inset` doesn't apply to a tickbox (no input chrome to float a
  // label into); fall back to `row` so the checkbox + label still
  // pair horizontally. `stack` puts the label above the checkbox
  // row — unusual but valid for a11y-first forms that want the
  // labelling to be wholly separate from the control.
  const resolvedOrientation: FormLabelOrientation =
    labelOrientation === "inset" ? "row" : labelOrientation;
  const isRow = resolvedOrientation === "row";
  // `flex-row-reverse` keeps the DOM order intact (Checkbox first,
  // then Label) so screen readers still associate them correctly via
  // `htmlFor`; only the visual order flips.
  const rowDirection =
    checkboxPosition === "end" ? "flex-row-reverse" : "flex-row";

  return (
    <div
      className={cn(
        "flex flex-col gap-1",
        WIDTH_GRID_CLASSES[width],
        SIZE_CHECKBOX_CLASSES[size],
        styles?.trimEnd(),
      )}
      data-slot="form-checkbox-field"
      data-size={size}
      data-label-orientation={resolvedOrientation}
      data-checkbox-position={checkboxPosition}
      id={id || undefined}
    >
      <div
        className={cn(
          "flex items-start gap-3",
          isRow ? rowDirection : "flex-col",
        )}
      >
        <Checkbox
          id={fieldId}
          name={nameText}
          required={isRequired}
          defaultChecked={initialChecked}
          aria-describedby={descId}
        />
        <Label
          htmlFor={fieldId}
          className={cn("leading-5", SIZE_LABEL_CLASSES[size])}
          data-slot="form-checkbox-field-label"
        >
          <RichText value={label} placeholder="Label" isEditing={isEditing} />
          {isRequired ? (
            <span aria-hidden="true" className="ms-0.5 text-destructive">
              *
            </span>
          ) : null}
        </Label>
      </div>
      {descriptionText ? (
        <p
          id={descId}
          className={cn(
            "text-muted-foreground text-xs",
            // Indent the description to align with the label when the
            // checkbox sits at the start (default); end-positioned
            // checkboxes pull the description back to the start edge.
            isRow && checkboxPosition === "start" && "ms-7",
          )}
          data-slot="form-checkbox-field-description"
        >
          {descriptionText}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Switch variant — same data model as Default (Required, DefaultChecked,
 * Label etc. all flow through identically), but renders the Radix
 * Switch primitive instead of a checkbox. Authors pick this per
 * placement for settings-style toggles where a switch reads more
 * naturally than a tick-box. Radix Switch doesn't submit a native
 * value, so a hidden input mirrors the checked state.
 */
export function Switch_Variant(props: FormCheckboxFieldProps) {
  const fieldId = useId();
  const {
    name,
    label,
    description,
    required,
    defaultChecked,
    width = "full",
    size = "default",
    labelOrientation = "row",
    checkboxPosition = "start",
    isEditing,
    styles,
    id,
  } = props;

  const nameText = getSourceText(name) || "field";
  const descriptionText = getSourceText(description) || undefined;
  const isRequired = isEnabled(required);
  const initialChecked = isEnabled(defaultChecked);
  const descId = descriptionText ? `${fieldId}-desc` : undefined;
  // Same orientation rules as Default — `inset` is meaningless for a
  // toggle; cascade to `row`. `stack` lifts the label above the
  // switch row for forms that need label/control separation.
  const resolvedOrientation: FormLabelOrientation =
    labelOrientation === "inset" ? "row" : labelOrientation;
  const isRow = resolvedOrientation === "row";
  const rowDirection =
    checkboxPosition === "end" ? "flex-row-reverse" : "flex-row";

  return (
    <div
      className={cn(
        "flex flex-col gap-1",
        WIDTH_GRID_CLASSES[width],
        SIZE_CHECKBOX_CLASSES[size],
        styles?.trimEnd(),
      )}
      data-slot="form-checkbox-field"
      data-variant="switch"
      data-size={size}
      data-label-orientation={resolvedOrientation}
      data-checkbox-position={checkboxPosition}
      id={id || undefined}
    >
      <div
        className={cn(
          "flex items-center gap-3",
          isRow ? rowDirection : "flex-col items-start",
        )}
      >
        <SwitchPrimitive
          id={fieldId}
          name={nameText}
          required={isRequired}
          defaultChecked={initialChecked}
          aria-describedby={descId}
        />
        <Label
          htmlFor={fieldId}
          className={cn("leading-5", SIZE_LABEL_CLASSES[size])}
          data-slot="form-checkbox-field-label"
        >
          <RichText value={label} placeholder="Label" isEditing={isEditing} />
          {isRequired ? (
            <span aria-hidden="true" className="ms-0.5 text-destructive">
              *
            </span>
          ) : null}
        </Label>
      </div>
      {descriptionText ? (
        <p
          id={descId}
          className={cn(
            "text-muted-foreground text-xs",
            isRow && checkboxPosition === "start" && "ms-12",
          )}
          data-slot="form-checkbox-field-description"
        >
          {descriptionText}
        </p>
      ) : null}
    </div>
  );
}

// Sitecore variant exports use PascalCase. Re-export under the
// component-map-facing name (`Switch`) without clashing with the
// imported Radix Switch primitive — the variant function above is
// named `Switch_Variant` only because the source needs both symbols
// in scope.
export { Switch_Variant as Switch };

export default Default;

export const componentType = "universal";
