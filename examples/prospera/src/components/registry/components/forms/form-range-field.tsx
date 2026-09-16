"use client";

import { useId, useMemo, useState } from "react";
import {
  FormFieldShell,
  type FormFieldSize,
  type FormFieldWidth,
  type FormLabelOrientation,
  SIZE_INPUT_CLASSES,
} from "@/components/registry/blocks/form-field-shell";
import { Slider } from "@/components/registry/primitives/core/slider";
import { getSourceText } from "@/components/registry/primitives/editables/source-normalizers";
import type { TextSource } from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import type { CmsProps } from "@/lib/registry/sitecore";

/**
 * Numeric range slider — useful for survey budget brackets, NPS
 * scores, satisfaction ratings, pricing tiers. Renders a Radix
 * Slider primitive with an accompanying value chip so users can see
 * the picked number without trial-and-error.
 *
 * Single-thumb by default; pass `mode="range"` for dual-thumb range
 * selection (e.g. "Budget from / to").
 *
 * The form payload is the comma-joined value list — `formData.get(
 * "<name>")` returns "25" for single, "10,40" for range.
 */

export interface FormRangeFieldFields {
  Name?: TextSource;
  Label?: TextSource;
  Description?: TextSource;
  HelpText?: TextSource;
  Min?: number | string;
  Max?: number | string;
  Step?: number | string;
  /**
   * Default value(s) — single number ("25") or comma-joined pair
   * ("10,40") for range mode. Drives the initial thumb position.
   */
  DefaultValue?: TextSource;
  /** Unit shown alongside the value chip ("%", "$", "min"). */
  Unit?: TextSource;
}

export interface FormRangeFieldProps extends CmsProps {
  name?: TextSource;
  label?: TextSource;
  description?: TextSource;
  helpText?: TextSource;
  min?: number | string | TextSource | NumberSource;
  max?: number | string | TextSource | NumberSource;
  step?: number | string | TextSource | NumberSource;
  defaultValue?: TextSource;
  unit?: TextSource;
  /** `single` (default) — one thumb. `range` — two thumbs for from/to selection. */
  mode?: "single" | "range";
  required?: string | boolean | TextSource | CheckboxSource;
  width?: FormFieldWidth;
  size?: FormFieldSize;
  labelOrientation?: FormLabelOrientation;
}

/** Raw layout-service number/text field shape (`{ value: 5 }`). */
type NumberSource = { value?: number | string };

// The recipe's numeric knobs are Sitecore FIELDS, so the layout
// service delivers `{ value: 5 }` objects — unwrap before parsing or
// every authored value silently falls back to the default.
function parseN(
  value: number | string | TextSource | NumberSource | undefined,
  fallback: number,
): number {
  const raw =
    typeof value === "object" && value !== null && "value" in value
      ? (value as { value?: unknown }).value
      : value;
  if (raw === undefined || raw === null || raw === "") return fallback;
  const n = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

function parseDefault(
  source: TextSource | undefined,
  fallback: number[],
): number[] {
  const text = getSourceText(source);
  if (!text) return fallback;
  const parts = text
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n));
  return parts.length > 0 ? parts : fallback;
}

/** Raw layout-service checkbox field shape (`{ value: boolean }`). */
type CheckboxSource = { value?: boolean };

// Accepts the raw layout-service shapes: the recipe's `Required` is a
// Sitecore CHECKBOX field, so it arrives as `{ value: boolean }` — NOT
// a plain string. Calling `.trim()` on that object (the old body)
// threw on every render and took the whole Pages editing canvas down
// with it. Mirror form-text-field's safe unwrap instead.
function isEnabled(
  value: string | boolean | TextSource | CheckboxSource | undefined,
): boolean {
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

/** Single or range numeric slider rendered as a FormBuilder field. */
export function Default(props: FormRangeFieldProps) {
  const fieldId = useId();
  const {
    name,
    label,
    description,
    helpText,
    min,
    max,
    step,
    defaultValue,
    unit,
    mode = "single",
    required,
    width = "full",
    size = "default",
    labelOrientation = "stack",
    styles,
    id,
  } = props;

  const nameText = getSourceText(name) || "range";
  const labelText = getSourceText(label) || "Range";
  const descriptionText = getSourceText(description) || undefined;
  const helpTextText = getSourceText(helpText) || undefined;
  const unitText = getSourceText(unit) || "";

  const minN = parseN(min, 0);
  const maxN = parseN(max, 100);
  const stepN = parseN(step, 1);
  const defaults = useMemo(
    () =>
      parseDefault(
        defaultValue,
        mode === "range" ? [minN, maxN] : [Math.round((minN + maxN) / 2)],
      ),
    [defaultValue, minN, maxN, mode],
  );
  const [value, setValue] = useState<number[]>(defaults);

  const displayValue =
    value.length === 1
      ? `${value[0]}${unitText}`
      : `${value[0]}${unitText} – ${value[1]}${unitText}`;
  // Form payload — comma-joined so single-thumb and range modes
  // serialise to the same shape.
  const hiddenValue = value.join(",");

  return (
    <FormFieldShell
      slot="form-range-field"
      label={labelText}
      name={nameText}
      inputId={fieldId}
      required={isEnabled(required)}
      description={descriptionText}
      helpText={helpTextText}
      width={width}
      size={size}
      labelOrientation={labelOrientation}
      dataAttrs={{ "data-mode": mode }}
      styles={styles}
      id={id}
    >
      {({ inputId, descId, isRequired }) => (
        <div
          className={cn("flex w-full flex-col gap-3", SIZE_INPUT_CLASSES[size])}
          data-slot="form-range-field-control"
        >
          <div className="flex w-full items-center gap-4">
            <Slider
              id={inputId}
              value={value}
              onValueChange={setValue}
              min={minN}
              max={maxN}
              step={stepN}
              aria-describedby={descId}
              aria-required={isRequired || undefined}
              aria-label={labelText}
              className="flex-1"
            />
            <output
              className="min-w-[5ch] text-end font-medium text-sm tabular-nums"
              data-slot="form-range-field-value"
            >
              {displayValue}
            </output>
          </div>
          {/* Hidden input so FormData captures the picked value(s). */}
          <input
            type="hidden"
            name={nameText}
            value={hiddenValue}
            required={isRequired}
          />
        </div>
      )}
    </FormFieldShell>
  );
}

export const FormRangeField = Default;
export default Default;
export const componentType = "universal";
