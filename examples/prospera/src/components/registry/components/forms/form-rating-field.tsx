"use client";

import { useId, useState } from "react";
import {
  FormFieldShell,
  type FormFieldSize,
  type FormFieldWidth,
  type FormLabelOrientation,
} from "@/components/registry/blocks/form-field-shell";
import { LibraryIcon } from "@/components/registry/primitives/core/library-icon";
import { getSourceText } from "@/components/registry/primitives/editables/source-normalizers";
import type { TextSource } from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import type { CmsProps } from "@/lib/registry/sitecore";

/**
 * Star / NPS rating input. Two variants share the field shell:
 *
 *   - `Default` — star icons (`max` defaulting to 5), best for
 *     review-style "How would you rate this?" prompts.
 *   - `Nps` — numeric 0–10 buttons in a single row, the canonical
 *     Net Promoter Score input. Anchored with "Not at all likely"
 *     / "Extremely likely" labels at the ends.
 *
 * Both submit the picked number as the form value.
 */

export interface FormRatingFieldFields {
  Name?: TextSource;
  Label?: TextSource;
  Description?: TextSource;
  HelpText?: TextSource;
  Max?: number | string;
  StartLabel?: TextSource;
  EndLabel?: TextSource;
}

export interface FormRatingFieldProps extends CmsProps {
  name?: TextSource;
  label?: TextSource;
  description?: TextSource;
  helpText?: TextSource;
  /** Highest score. Defaults to 5 for star, 10 for NPS. */
  max?: number | string | TextSource | NumberSource;
  /** Label rendered under the lowest score (e.g. "Not at all likely"). */
  startLabel?: TextSource;
  /** Label rendered under the highest score (e.g. "Extremely likely"). */
  endLabel?: TextSource;
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
  return Number.isFinite(n) ? Math.floor(n) : fallback;
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

const SIZE_STAR_CLASSES: Record<FormFieldSize, string> = {
  default: "size-7",
  xs: "size-4",
  sm: "size-5",
  md: "size-7",
  lg: "size-8",
  xl: "size-10",
};

const SIZE_NPS_CELL_CLASSES: Record<FormFieldSize, string> = {
  default: "h-10 min-w-10 text-sm",
  xs: "h-7 min-w-7 text-xs",
  sm: "h-8 min-w-8 text-sm",
  md: "h-10 min-w-10 text-sm",
  lg: "h-12 min-w-12 text-base",
  xl: "h-14 min-w-14 text-lg",
};

/** Star rating. Max defaults to 5 — `max=10` gives a Likert-ish scale. */
export function Default(props: FormRatingFieldProps) {
  const fieldId = useId();
  const {
    name,
    label,
    description,
    helpText,
    max,
    required,
    width = "full",
    size = "default",
    labelOrientation = "stack",
    styles,
    id,
  } = props;

  const nameText = getSourceText(name) || "rating";
  const labelText = getSourceText(label) || "Rating";
  const descriptionText = getSourceText(description) || undefined;
  const helpTextText = getSourceText(helpText) || undefined;
  const maxN = parseN(max, 5);
  const isRequired = isEnabled(required);

  const [value, setValue] = useState(0);
  const [hover, setHover] = useState(0);

  return (
    <FormFieldShell
      slot="form-rating-field"
      label={labelText}
      name={nameText}
      inputId={fieldId}
      required={isRequired}
      description={descriptionText}
      helpText={helpTextText}
      width={width}
      size={size}
      labelOrientation={labelOrientation}
      dataAttrs={{ "data-variant": "stars", "data-max": String(maxN) }}
      styles={styles}
      id={id}
    >
      {({ inputId, descId, isRequired: req }) => (
        <div
          role="radiogroup"
          id={inputId}
          aria-describedby={descId}
          aria-label={labelText}
          aria-required={req || undefined}
          className="inline-flex w-fit items-center gap-1"
          data-slot="form-rating-field-control"
        >
          {Array.from({ length: maxN }, (_, i) => i + 1).map((n) => {
            const active = (hover || value) >= n;
            return (
              // biome-ignore lint/a11y/useSemanticElements: visually-styled rating buttons; native <input type="radio"> would lose the icon + hover preview chrome.
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={value === n}
                aria-label={`${n} of ${maxN}`}
                onClick={() => setValue(n)}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                onFocus={() => setHover(n)}
                onBlur={() => setHover(0)}
                className={cn(
                  "rounded-sm p-0.5 transition-colors focus-visible:outline-2 focus-visible:outline-primary",
                  active ? "text-warning" : "text-muted-foreground",
                )}
              >
                <LibraryIcon
                  name="star"
                  className={cn(
                    SIZE_STAR_CLASSES[size],
                    active && "fill-current",
                  )}
                  aria-hidden
                />
              </button>
            );
          })}
          <input
            type="hidden"
            name={nameText}
            value={String(value || "")}
            required={isRequired}
          />
        </div>
      )}
    </FormFieldShell>
  );
}

/** NPS variant — 0–10 numeric scale, the survey-research standard. */
export function Nps(props: FormRatingFieldProps) {
  const fieldId = useId();
  const {
    name,
    label,
    description,
    helpText,
    max,
    startLabel,
    endLabel,
    required,
    width = "full",
    size = "default",
    labelOrientation = "stack",
    styles,
    id,
  } = props;

  const nameText = getSourceText(name) || "nps";
  const labelText =
    getSourceText(label) ||
    "How likely are you to recommend us to a friend or colleague?";
  const descriptionText = getSourceText(description) || undefined;
  const helpTextText = getSourceText(helpText) || undefined;
  const startLabelText = getSourceText(startLabel) || "Not at all likely";
  const endLabelText = getSourceText(endLabel) || "Extremely likely";
  const maxN = parseN(max, 10);
  const isRequired = isEnabled(required);

  const [value, setValue] = useState<number | null>(null);

  return (
    <FormFieldShell
      slot="form-rating-field"
      label={labelText}
      name={nameText}
      inputId={fieldId}
      required={isRequired}
      description={descriptionText}
      helpText={helpTextText}
      width={width}
      size={size}
      labelOrientation={labelOrientation}
      dataAttrs={{ "data-variant": "nps", "data-max": String(maxN) }}
      styles={styles}
      id={id}
    >
      {({ inputId, descId, isRequired: req }) => (
        <div
          className="flex w-full flex-col gap-2"
          data-slot="form-rating-field-control"
        >
          <div
            role="radiogroup"
            id={inputId}
            aria-describedby={descId}
            aria-label={labelText}
            aria-required={req || undefined}
            className="grid w-full grid-cols-11 gap-1"
          >
            {Array.from({ length: maxN + 1 }, (_, i) => i).map((n) => {
              const active = value === n;
              return (
                // biome-ignore lint/a11y/useSemanticElements: visually-styled NPS button row; native radio inputs would lose the numeric tile chrome.
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-label={String(n)}
                  onClick={() => setValue(n)}
                  className={cn(
                    "flex items-center justify-center rounded-md border font-medium tabular-nums",
                    SIZE_NPS_CELL_CLASSES[size],
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:border-primary/50",
                  )}
                >
                  {n}
                </button>
              );
            })}
          </div>
          <div className="flex w-full justify-between text-muted-foreground text-xs">
            <span>{startLabelText}</span>
            <span>{endLabelText}</span>
          </div>
          <input
            type="hidden"
            name={nameText}
            value={value == null ? "" : String(value)}
            required={isRequired}
          />
        </div>
      )}
    </FormFieldShell>
  );
}

export const FormRatingField = Default;
export default Default;
export const componentType = "universal";
