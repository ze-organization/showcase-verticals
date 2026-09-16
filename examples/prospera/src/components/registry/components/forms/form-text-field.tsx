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
import { Input } from "@/components/registry/primitives/core/input";
import { getSourceText } from "@/components/registry/primitives/editables/source-normalizers";
import type { TextSource } from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import type { CmsProps } from "@/lib/registry/sitecore";

/**
 * Sitecore field shape for FormTextField. Mirrors the recipe's
 * `fields:` block in `form-text-field.recipe.ts`. Each field lives in
 * its own collapsible Sitecore section (Field / Validation).
 */
export interface FormTextFieldFields {
  Name?: TextSource;
  Label?: TextSource;
  Placeholder?: TextSource;
  Description?: TextSource;
  /** Sitecore string-boolean (`"1"` / `"true"` / `"on"` for on; everything else off). */
  AutoComplete?: string | boolean;
  Pattern?: TextSource;
  MinLength?: number | string;
  MaxLength?: number | string;
}

export type FormTextFieldType =
  | "text"
  | "email"
  | "tel"
  | "url"
  | "number"
  | "password";

export type { FormFieldSize, FormFieldWidth, FormLabelOrientation };

export interface FormTextFieldProps extends CmsProps {
  name?: TextSource;
  label?: TextSource;
  placeholder?: TextSource;
  description?: TextSource;
  /**
   * Long-form guidance shown via an info-tooltip next to the label.
   * Distinct from `description` (which renders inline beneath the
   * input). Use `helpText` for content that won't always be needed —
   * regulatory disclosures, format expectations, "why we ask".
   */
  helpText?: TextSource;
  /**
   * Browser-autofill toggle. Defaults to `true` — the field uses the
   * WAI token derived from `type` (email → "email", tel → "tel" …).
   * Set to `false` to emit `autocomplete="off"` and opt out (one-time
   * codes, security questions, anything that shouldn't be saved).
   */
  autoComplete?: string | boolean | TextSource;
  pattern?: TextSource;
  minLength?: number | string | TextSource | NumberSource;
  maxLength?: number | string | TextSource | NumberSource;
  type?: FormTextFieldType | TextSource;
  required?: string | boolean | TextSource;
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

/** Raw layout-service number/text field shape (`{ value: 5 }`). */
type NumberSource = { value?: number | string };

// The recipe's numeric knobs are Sitecore FIELDS, so the layout
// service delivers `{ value: 5 }` objects — unwrap before parsing or
// every authored value silently falls back to the default.
function parseLength(
  value: number | string | TextSource | NumberSource | undefined,
): number | undefined {
  const raw =
    typeof value === "object" && value !== null && "value" in value
      ? (value as { value?: unknown }).value
      : value;
  if (raw === undefined || raw === null || raw === "") return undefined;
  const n = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

const TEXT_FIELD_TYPES: readonly FormTextFieldType[] = [
  "text",
  "email",
  "tel",
  "url",
  "number",
  "password",
];

// The `Type` knob is a Sitecore FIELD too — normalize the `{ value }`
// object (or a raw string) to the union, falling back to `text` for
// anything unknown so `<input type>` never receives an object.
function parseType(
  value: FormTextFieldType | TextSource | undefined,
): FormTextFieldType {
  const raw =
    typeof value === "object" && value !== null && "value" in value
      ? (value as { value?: unknown }).value
      : value;
  if (typeof raw !== "string") return "text";
  const normalized = raw.trim().toLowerCase();
  return (TEXT_FIELD_TYPES as readonly string[]).includes(normalized)
    ? (normalized as FormTextFieldType)
    : "text";
}

const INPUT_MODE_BY_TYPE: Record<
  FormTextFieldType,
  React.HTMLAttributes<HTMLInputElement>["inputMode"]
> = {
  text: undefined,
  email: "email",
  tel: "tel",
  url: "url",
  number: "numeric",
  password: undefined,
};

// Sensible autocomplete defaults per input type. Author override (via
// the `AutoComplete` field) always wins.
const AUTO_COMPLETE_BY_TYPE: Record<FormTextFieldType, string | undefined> = {
  text: undefined,
  email: "email",
  tel: "tel",
  url: "url",
  number: undefined,
  password: "current-password",
};

// Shared layout constants moved to `blocks/form-field-shell.tsx` — see
// SIZE_LABEL_CLASSES / SIZE_INPUT_CLASSES / ORIENTATION_FIELD_CLASSES /
// WIDTH_GRID_CLASSES. Re-exported here for callers that previously
// imported them from this module.
export {
  ORIENTATION_FIELD_CLASSES,
  ORIENTATION_INSET_INPUT_CLASSES,
  ORIENTATION_INSET_LABEL_CLASSES,
  SIZE_INPUT_CLASSES,
  SIZE_LABEL_CLASSES,
  WIDTH_GRID_CLASSES,
} from "@/components/registry/blocks/form-field-shell";

/**
 * Single-line text input rendered inside a FormBuilder's
 * `form-fields-{*}` placeholder. State + submit + CDP events live on
 * the parent FormBuilder.
 */
export function Default(props: FormTextFieldProps) {
  const fieldId = useId();
  const {
    name,
    label,
    placeholder,
    description,
    autoComplete: autoCompleteRaw,
    pattern,
    minLength,
    maxLength,
    type: typeRaw = "text",
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
  // `Type` is a Sitecore FIELD — normalize `{ value: "email" }` (or a
  // raw string) to the union before anything indexes maps with it or
  // hands it to `<input type>`.
  const type = parseType(typeRaw);
  // The HTML `autocomplete` attribute. Sitecore checkbox emits `"1"`
  // / `""`; the recipe shape is boolean. But the React prop accepts
  // either form AND a verbatim WAI token string for showcase /
  // standalone callers that want explicit control. The layout service
  // wraps the field as `{ value: boolean | string }` — unwrap first.
  // Three branches:
  //   - boolean `true` (or string truthy) + no explicit token → use
  //     the WAI token derived from `type` (email → "email", tel → "tel").
  //   - boolean `false` (or string falsy: "", "0", "off", …) →
  //     `autocomplete="off"`, opt out.
  //   - any other string → treated as a verbatim WAI token for callers
  //     that pass "given-name" / "cc-number" / etc.
  const autoComplete =
    typeof autoCompleteRaw === "object" &&
    autoCompleteRaw !== null &&
    "value" in autoCompleteRaw
      ? ((autoCompleteRaw as { value?: unknown }).value as string | boolean)
      : autoCompleteRaw;
  const autoCompleteText = ((): string | undefined => {
    if (typeof autoComplete === "boolean") {
      return autoComplete ? AUTO_COMPLETE_BY_TYPE[type] : "off";
    }
    if (typeof autoComplete === "string") {
      const normalized = autoComplete.trim().toLowerCase();
      if (["", "0", "false", "no", "off", "disabled"].includes(normalized)) {
        return "off";
      }
      if (["1", "true", "yes", "on", "enabled"].includes(normalized)) {
        return AUTO_COMPLETE_BY_TYPE[type];
      }
      return autoComplete;
    }
    // Undefined → default to on (use type token).
    return AUTO_COMPLETE_BY_TYPE[type];
  })();
  const patternText = getSourceText(pattern) || undefined;

  return (
    <FormFieldShell
      slot="form-text-field"
      label={labelText}
      name={nameText}
      inputId={fieldId}
      required={isEnabled(required)}
      description={descriptionText}
      helpText={getSourceText(props.helpText)}
      width={width}
      size={size}
      labelOrientation={labelOrientation}
      dataAttrs={{ "data-type": type }}
      styles={styles}
      id={id}
    >
      {({ inputId, descId, isInset, isRequired }) => (
        <Input
          id={inputId}
          name={nameText}
          type={type}
          required={isRequired}
          placeholder={placeholderText}
          autoComplete={autoCompleteText}
          inputMode={INPUT_MODE_BY_TYPE[type]}
          pattern={patternText}
          minLength={parseLength(minLength)}
          maxLength={parseLength(maxLength)}
          aria-describedby={descId}
          className={cn(
            SIZE_INPUT_CLASSES[size],
            isInset && ORIENTATION_INSET_INPUT_CLASSES,
          )}
          // Placeholder-aware floor: the input is at least as wide as
          // its placeholder text on browsers that lack `field-sizing:
          // content`. Width-preset CSS still wins (`max-w-full` caps
          // on inline, `w-full` overrides on full/half/third).
          style={placeholderMinWidth(placeholderText)}
        />
      )}
    </FormFieldShell>
  );
}

export default Default;

export const componentType = "universal";
