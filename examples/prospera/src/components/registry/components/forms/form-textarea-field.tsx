"use client";

import { useId } from "react";
import {
  FormFieldShell,
  type FormFieldSize,
  type FormFieldWidth,
  type FormLabelOrientation,
  ORIENTATION_INSET_INPUT_CLASSES,
  placeholderMinWidth,
  SIZE_INPUT_CLASSES,
} from "@/components/registry/blocks/form-field-shell";
import { Textarea } from "@/components/registry/primitives/core/textarea";
import { getSourceText } from "@/components/registry/primitives/editables/source-normalizers";
import type { TextSource } from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import type { CmsProps } from "@/lib/registry/sitecore";

export interface FormTextareaFieldFields {
  Name?: TextSource;
  Label?: TextSource;
  Placeholder?: TextSource;
  Description?: TextSource;
  MinLength?: number | string;
  MaxLength?: number | string;
}

export interface FormTextareaFieldProps extends CmsProps {
  name?: TextSource;
  label?: TextSource;
  placeholder?: TextSource;
  description?: TextSource;
  /** Long-form guidance shown via an info-tooltip next to the label. */
  helpText?: TextSource;
  minLength?: number | string;
  maxLength?: number | string;
  rows?: number | string;
  required?: string | boolean;
  width?: FormFieldWidth;
  size?: FormFieldSize;
  labelOrientation?: FormLabelOrientation;
}

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

function parseLength(value: number | string | undefined): number | undefined {
  if (value === undefined || value === "") return undefined;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Multi-line text input rendered inside a FormBuilder's
 * `form-fields-{*}` placeholder. State + submit + CDP events live on
 * the parent FormBuilder.
 */
export function Default(props: FormTextareaFieldProps) {
  const fieldId = useId();
  const {
    name,
    label,
    placeholder,
    description,
    minLength,
    maxLength,
    rows = 4,
    required,
    width = "full",
    size = "default",
    labelOrientation = "stack",
    styles,
    id,
  } = props;

  const nameText = getSourceText(name) || "field";
  const labelText = getSourceText(label) || "Field";
  const placeholderText = getSourceText(placeholder) || undefined;
  const descriptionText = getSourceText(description) || undefined;
  const rowCount = parseLength(rows) ?? 4;

  return (
    <FormFieldShell
      slot="form-textarea-field"
      label={labelText}
      name={nameText}
      inputId={fieldId}
      required={isEnabled(required)}
      description={descriptionText}
      helpText={getSourceText(props.helpText)}
      width={width}
      size={size}
      labelOrientation={labelOrientation}
      styles={styles}
      id={id}
    >
      {({ inputId, descId, isInset, isRequired }) => (
        <Textarea
          id={inputId}
          name={nameText}
          rows={rowCount}
          required={isRequired}
          placeholder={placeholderText}
          minLength={parseLength(minLength)}
          maxLength={parseLength(maxLength)}
          aria-describedby={descId}
          className={cn(
            // Textarea height is row-driven, so the size map only
            // adjusts text-size + horizontal padding. Vertical
            // padding shifts with text-size implicitly via the row
            // count.
            SIZE_INPUT_CLASSES[size].replace(/\bh-\d+\b/g, "").trim(),
            isInset && ORIENTATION_INSET_INPUT_CLASSES,
          )}
          // Placeholder-aware floor — textarea floor is 24ch (a touch
          // wider than `<input>` since textareas typically host longer
          // copy). Caps via `max-w-full` on the inline width preset.
          style={placeholderMinWidth(placeholderText, { floor: 24 })}
        />
      )}
    </FormFieldShell>
  );
}

export default Default;

export const componentType = "universal";
