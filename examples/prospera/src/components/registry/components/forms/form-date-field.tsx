"use client";

import { useId, useState } from "react";
import {
  FormFieldShell,
  type FormFieldSize,
  type FormFieldWidth,
  type FormLabelOrientation,
  ORIENTATION_INSET_INPUT_CLASSES,
  SIZE_INPUT_CLASSES,
} from "@/components/registry/blocks/form-field-shell";
import { DatePicker } from "@/components/registry/primitives/core/date-picker";
import { getSourceText } from "@/components/registry/primitives/editables/source-normalizers";
import type { TextSource } from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import type { CmsProps } from "@/lib/registry/sitecore";

export interface FormDateFieldFields {
  Name?: TextSource;
  Label?: TextSource;
  Description?: TextSource;
  AutoComplete?: string | boolean;
  // Sitecore Date fields arrive as ISO strings with a time component
  // (e.g. `2026-06-01T00:00:00Z`); the renderer slices them to the
  // bare `yyyy-MM-dd` the native date input expects.
  MinDate?: string | TextSource;
  MaxDate?: string | TextSource;
}

export interface FormDateFieldProps extends CmsProps {
  name?: TextSource;
  label?: TextSource;
  description?: TextSource;
  autoComplete?: string | boolean;
  minDate?: string | TextSource;
  maxDate?: string | TextSource;
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

// Sitecore Date fields ship as ISO strings with a time component
// (`2026-06-01T00:00:00Z`). The DatePicker primitive wants a `Date`
// object for its `minDate` prop, so parse the incoming source string
// — bare `yyyy-MM-dd` or full ISO — into a Date. Returns undefined
// if the value is empty or unparseable.
function toDate(raw: string | TextSource | undefined): Date | undefined {
  const text = getSourceText(raw)?.trim();
  if (!text) return undefined;
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

// Hidden input mirrors the picked Date back into the parent FormBuilder's
// FormData submit. Format: `yyyy-MM-dd`, matching the native input's
// submit value so server-side handlers don't need to special-case the
// primitive picker.
function toIsoDateValue(date: Date | null): string {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Date field rendered inside a FormBuilder's `form-fields-{*}` placeholder.
 * Uses the project's `DatePicker` primitive (styled popover + calendar)
 * instead of the browser-native `<input type="date">` so dates match the
 * registry's design system. A hidden input mirrors the picked value as
 * `yyyy-MM-dd` so the parent FormBuilder's standard FormData submit picks
 * it up keyed by the field's `Name` — same wire shape as the native input.
 */
export function Default(props: FormDateFieldProps) {
  const fieldId = useId();
  const {
    name,
    label,
    description,
    minDate,
    maxDate,
    required,
    width = "full",
    size = "default",
    labelOrientation = "stack",
    styles,
    id,
  } = props;

  const nameText = getSourceText(name) || "date";
  const labelText = getSourceText(label) || "Date";
  const descriptionText = getSourceText(description) || undefined;
  const minDateValue = toDate(minDate);
  const maxDateValue = toDate(maxDate);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  return (
    <FormFieldShell
      slot="form-date-field"
      label={labelText}
      name={nameText}
      inputId={fieldId}
      required={isEnabled(required)}
      description={descriptionText}
      width={width}
      size={size}
      labelOrientation={labelOrientation}
      styles={styles}
      id={id}
    >
      {({ inputId, descId, isInset, isRequired }) => (
        <>
          <DatePicker
            selected={selectedDate}
            onChange={setSelectedDate}
            placeholderText="Pick a date"
            minDate={minDateValue}
            maxDate={maxDateValue}
            showIcon
            inputClassName={cn(
              SIZE_INPUT_CLASSES[size],
              isInset && ORIENTATION_INSET_INPUT_CLASSES,
            )}
          />
          <input
            type="hidden"
            id={inputId}
            name={nameText}
            value={toIsoDateValue(selectedDate)}
            required={isRequired}
            aria-describedby={descId}
          />
        </>
      )}
    </FormFieldShell>
  );
}

export default Default;

export const componentType = "universal";
