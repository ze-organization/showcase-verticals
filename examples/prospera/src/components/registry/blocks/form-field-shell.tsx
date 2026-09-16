import type { ReactNode } from "react";
import { Field, FieldLabel } from "@/components/registry/primitives/core/field";
import { LibraryIcon } from "@/components/registry/primitives/core/library-icon";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/registry/primitives/core/tooltip";
import { cn } from "@/lib/registry/cn";
import { useFormFieldError } from "@/lib/registry/forms/form-context";

/**
 * Width preset for a form field — the shared `width@1` axis exposed
 * by every form-X-field rendering. `inline` shrinks the field to its
 * input's natural width; the others map to flex-basis fractions.
 */
export type FormFieldWidth = "full" | "half" | "third" | "inline";

/**
 * Form-level visual treatment for the input chrome — applies to every
 * descendant `<Input>` / `<Textarea>` / `<SelectTrigger>` rendered
 * inside the form via descendant selectors.
 *
 * - `outline` (default) — the Input primitive's natural chrome: full
 *   1px border, rounded corners, surface-background fill.
 * - `underline` — bare editorial treatment: no top / inline borders,
 *   transparent background, only a 1px bottom border. Pairs well with
 *   the `inset` label orientation for dense forms.
 */
export type FormInputStyle = "outline" | "underline";

/**
 * Descendant-selector class map for `FormInputStyle`. Applied once at
 * the form root; each input primitive gets overridden via its
 * `data-slot` attribute. Keeps the Input primitive's defaults intact
 * for non-form callers (chat composer, search inputs, etc.).
 */
export const FORM_INPUT_STYLE_CLASSES: Record<FormInputStyle, string> = {
  outline: "",
  underline: cn(
    // Input — drop the rounded corners + top / inline borders, paint
    // the inline padding tighter so the underline reads as the bottom
    // edge of the input column rather than a full bordered cell.
    "[&_[data-slot=input]]:rounded-none",
    "[&_[data-slot=input]]:border-x-0",
    "[&_[data-slot=input]]:border-t-0",
    "[&_[data-slot=input]]:bg-transparent",
    "[&_[data-slot=input]]:px-1",
    // Textarea — same treatment so multi-line copy reads as one
    // bottom-edge stripe.
    "[&_[data-slot=textarea]]:rounded-none",
    "[&_[data-slot=textarea]]:border-x-0",
    "[&_[data-slot=textarea]]:border-t-0",
    "[&_[data-slot=textarea]]:bg-transparent",
    "[&_[data-slot=textarea]]:px-1",
    // SelectTrigger — keep the disclosure chevron but drop the rounded
    // cell so the trigger reads as a single underlined affordance.
    "[&_[data-slot=select-trigger]]:rounded-none",
    "[&_[data-slot=select-trigger]]:border-x-0",
    "[&_[data-slot=select-trigger]]:border-t-0",
    "[&_[data-slot=select-trigger]]:bg-transparent",
    "[&_[data-slot=select-trigger]]:px-1",
  ),
};

/**
 * Helper for runtime values that may not exactly match the
 * `FormInputStyle` literal type — coerces unknown strings to the
 * default. Sitecore enum params arrive as strings the recipe doesn't
 * statically narrow.
 */
export function parseFormInputStyle(
  value: string | undefined,
  fallback: FormInputStyle = "outline",
): FormInputStyle {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  return normalized === "underline" || normalized === "outline"
    ? normalized
    : fallback;
}

/**
 * Per-input `minWidth` floor sized from the placeholder length so the
 * input is always wide enough to show its placeholder text in full
 * (browsers with `field-sizing: content` already do this; the inline
 * style here is the fallback for older Chrome / Safari / Firefox).
 * `extraCh` pads for the input's own inline padding + caret.
 *
 * Returns `undefined` when there's no placeholder to size against so
 * the input falls back to the width preset's CSS-side floor
 * (`min-w-[20ch]` etc. on the inline preset).
 */
export function placeholderMinWidth(
  placeholder: string | undefined,
  options: { floor?: number; extraCh?: number } = {},
): { minWidth: string } | undefined {
  const { floor = 14, extraCh = 2 } = options;
  if (!placeholder) return undefined;
  const trimmed = placeholder.trim();
  if (!trimmed) return undefined;
  const ch = Math.max(floor, trimmed.length + extraCh);
  return { minWidth: `${ch}ch` };
}

/**
 * Shared `size@1` scale used by every form field + the size axis CTA
 * Button + Badge expose. `default` is the "let the component pick"
 * entry per convention; in forms it cascades to `md`.
 */
export type FormFieldSize = "default" | "xs" | "sm" | "md" | "lg" | "xl";

/**
 * Where the label sits relative to the input. `stack` (label above) is
 * canonical. `row` puts label + input on a single line for short
 * fields. `inset` floats the label inside the input chrome for dense
 * forms.
 */
export type FormLabelOrientation = "stack" | "row" | "inset";

/**
 * Per-`FormFieldSize` className for the `<FieldLabel>` element. Only
 * tweaks the size axis — colour, weight, leading come from FieldLabel.
 */
export const SIZE_LABEL_CLASSES: Record<FormFieldSize, string> = {
  default: "text-sm",
  xs: "text-xs",
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
  xl: "text-lg",
};

/**
 * Per-`FormFieldSize` className for the actual input primitive
 * (`<Input>` / `<Textarea>` / `<SelectTrigger>` / the upload trigger
 * `<Button>`). Sets height + horizontal padding + font-size; vertical
 * padding stays implicit via the input's own line-height.
 */
export const SIZE_INPUT_CLASSES: Record<FormFieldSize, string> = {
  default: "h-10 text-base",
  xs: "h-7 px-2 text-xs",
  sm: "h-8 px-2.5 text-sm",
  md: "h-10 text-base",
  lg: "h-12 text-base",
  xl: "h-14 px-4 text-lg",
};

/**
 * Field wrapper classes per `FormLabelOrientation`. `stack` (default)
 * needs no override. `row` flips to horizontal. `inset` makes the
 * wrapper `relative` so the label can be absolutely positioned over
 * the input chrome.
 */
export const ORIENTATION_FIELD_CLASSES: Record<FormLabelOrientation, string> = {
  stack: "",
  row: "flex-row items-center gap-3 [&_label]:shrink-0",
  inset: "relative",
};

/**
 * Inset-mode label override — absolute-positioned, uppercase, faded.
 * Stays visible at all times so the input behaves like a labelled cell.
 */
export const ORIENTATION_INSET_LABEL_CLASSES =
  "pointer-events-none absolute start-3 top-1.5 z-10 text-[10px] uppercase tracking-wide opacity-75";

/** Inset-mode input override — extra top padding to clear the floated label. */
export const ORIENTATION_INSET_INPUT_CLASSES = "pt-5";

/**
 * Width-preset classes. Each preset pairs flex-basis (for `flex
 * flex-wrap` form bodies) with col-span (for `grid grid-cols-12` form
 * bodies — used by the standalone field showcase previews) so the
 * Field reads the same width regardless of which layout system the
 * surrounding form picks.
 *
 * `inline` shrinks the Field to content-fit AND clamps every
 * descendant input/textarea/select-trigger to a tight content-width
 * floor — useful for short answers (zip code, age, color picker).
 * The floor is generous enough (`min-w-[16rem]` on the Field,
 * `min-w-[20ch]` on the inputs) that labels and placeholders read
 * naturally; the previous 14ch / w-fit pair collapsed labels like
 * "Date of birth" into 2-line wraps and pushed descriptions to 4-
 * line wraps, which is the compression bug fixed here.
 */
export const WIDTH_GRID_CLASSES: Record<FormFieldWidth, string> = {
  full: "basis-full col-span-full",
  half: "basis-full sm:basis-[calc(50%-0.75rem)] col-span-full sm:col-span-6",
  third:
    "basis-full sm:basis-[calc(33.333%-1rem)] col-span-full sm:col-span-6 md:col-span-4",
  inline: cn(
    // Field column: shrink to content but with a generous floor so
    // labels + descriptions still read cleanly. Without the floor a
    // bare date input (`<input type=date>` has no visible text and
    // no placeholder) collapsed the whole column to ~100px and
    // forced the label / description to wrap line-by-line.
    "basis-auto w-fit min-w-[16rem] max-w-full",
    "col-span-full sm:col-span-4",
    // Input — auto-grow to fit the placeholder / typed content via
    // `field-sizing: content` (Tailwind v4 utility, Chrome 123+ /
    // Safari 18+ / Firefox 138+). The min-w-[20ch] floor guarantees
    // a usable target on older browsers and prevents collapse when
    // the placeholder is empty. `max-w-full` caps growth at the
    // container width so a long typed value doesn't overflow.
    "[&_[data-slot=input]]:field-sizing-content",
    "[&_[data-slot=input]]:w-fit",
    "[&_[data-slot=input]]:min-w-[20ch]",
    "[&_[data-slot=input]]:max-w-full",
    "[&_[data-slot=textarea]]:field-sizing-content",
    "[&_[data-slot=textarea]]:w-fit",
    "[&_[data-slot=textarea]]:min-w-[24ch]",
    "[&_[data-slot=textarea]]:max-w-full",
    "[&_[data-slot=select-trigger]]:w-fit",
    "[&_[data-slot=select-trigger]]:min-w-[18ch]",
    "[&_[data-slot=select-trigger]]:max-w-full",
  ),
};

/**
 * Wiring helpers handed to the `FormFieldShell` render-prop child so
 * the input element can flow ids, aria attributes, required state,
 * and inset-mode overrides without each consumer recomputing them.
 */
export interface FormFieldShellChildHelpers {
  /** Element id to apply to the input (also the FieldLabel's htmlFor). */
  inputId: string;
  /**
   * Combined `aria-describedby` value — wire straight to the input's
   * `aria-describedby` attribute. Includes the error id (when present)
   * followed by the description id so screen readers announce errors
   * first.
   */
  descId?: string;
  /** Error paragraph id alone, when callers need to reference it specifically. */
  errorId?: string;
  /** True when `labelOrientation === "inset"` — apply the input pt-5 override. */
  isInset: boolean;
  /** True when the field is required — flow to the input's `required` attr. */
  isRequired: boolean;
}

export interface FormFieldShellProps {
  /**
   * `data-slot` value for the field root — e.g. `"form-text-field"`,
   * `"form-select-field"`. Drives the preview / editing chrome lookup.
   */
  slot: string;
  /** Resolved label text shown above (or inside) the input. */
  label: string;
  /**
   * The form field's `name` attribute — used to read its current
   * error from the FormBuilder context. Pass the same string the
   * underlying `<input name="...">` carries so error messages line
   * up.
   */
  name?: string;
  /** Element id used by the FieldLabel's `htmlFor` and the input. */
  inputId: string;
  /** Mark the field as required (renders the destructive asterisk). */
  required?: boolean;
  /** Description rendered as a muted caption below the input. */
  description?: string;
  /**
   * Optional info-tooltip label — when set, renders a small `?` icon
   * next to the label that opens a tooltip with the help-text. Use
   * for the long-form guidance that doesn't fit in a description
   * line; descriptions still render below the input as before.
   */
  helpText?: string;
  /**
   * Explicit error message override. When omitted, the shell reads
   * the field's error from the FormBuilder context (server-pushed
   * validation, real-time client validation). Pass an explicit
   * string when a parent field group needs to surface its own error
   * separate from the context (e.g. the upload field's size-limit).
   */
  error?: string;
  /** Width preset — `full` / `half` / `third` / `inline`. */
  width: FormFieldWidth;
  /** Size preset — `default` / `xs` / `sm` / `md` / `lg` / `xl`. */
  size: FormFieldSize;
  /** Where the label sits relative to the input. */
  labelOrientation: FormLabelOrientation;
  /**
   * Extra `data-*` attributes appended to the field root. Use for
   * per-variant signal (e.g. `{ "data-type": "email" }` on text).
   */
  dataAttrs?: Record<string, string>;
  /** styles className escape-hatch passed by Sitecore's params bag. */
  styles?: string;
  /** Component id from the Sitecore rendering identifier. */
  id?: string;
  /**
   * Render-prop child returning the input element. Receives wiring
   * helpers so the input can stay declarative without each form-field
   * file recomputing `descId` / `isInset` / `isRequired`.
   */
  children: (helpers: FormFieldShellChildHelpers) => ReactNode;
}

/**
 * Shared shell for the form-X-field family (text, textarea, date,
 * select, upload). Renders the `<Field>` + `<FieldLabel>` +
 * description / error chrome that every variant repeated; the actual
 * input lives in the render-prop child.
 *
 * The shell is server-safe — only the Field/FieldLabel primitives
 * (server) are mounted here, so the block stays usable from RSC.
 * Client-only inputs ride in the child render-prop, which respects
 * the consumer's `"use client"` boundary.
 *
 * RTL: uses logical `start`/`end` throughout. The destructive
 * asterisk uses `ms-0.5`, not `ml-`.
 */
export function FormFieldShell({
  slot,
  label,
  name,
  inputId,
  required,
  description,
  helpText,
  error,
  width,
  size,
  labelOrientation,
  dataAttrs,
  styles,
  id,
  children,
}: FormFieldShellProps) {
  // Context error wins over an explicit prop only when the prop is
  // empty — that way upload fields and other consumers that compute
  // their own validation can still surface a local error without
  // pushing through context.
  const contextError = useFormFieldError(name);
  const resolvedError = error ?? contextError;

  const descId = description ? `${inputId}-desc` : undefined;
  const errorId = resolvedError ? `${inputId}-error` : undefined;
  // `aria-describedby` combines description + error so AT users hear
  // both. Order matters — error first so it's announced first.
  const describedBy = [errorId, descId].filter(Boolean).join(" ") || undefined;
  const isInset = labelOrientation === "inset";
  const isRequired = Boolean(required);

  return (
    <Field
      className={cn(
        "gap-1",
        WIDTH_GRID_CLASSES[width],
        ORIENTATION_FIELD_CLASSES[labelOrientation],
        styles?.trimEnd(),
      )}
      orientation={labelOrientation === "row" ? "horizontal" : "vertical"}
      data-slot={slot}
      data-size={size}
      data-label-orientation={labelOrientation}
      data-field-name={name || undefined}
      data-invalid={resolvedError ? true : undefined}
      id={id || undefined}
      {...dataAttrs}
    >
      <FieldLabel
        htmlFor={inputId}
        className={cn(
          "inline-flex items-center gap-1.5",
          SIZE_LABEL_CLASSES[size],
          isInset && ORIENTATION_INSET_LABEL_CLASSES,
        )}
      >
        <span>
          {label}
          {isRequired ? (
            <span aria-hidden="true" className="ms-0.5 text-destructive">
              *
            </span>
          ) : null}
        </span>
        {helpText ? (
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80"
                  aria-label={`Help: ${label}`}
                >
                  <LibraryIcon
                    name="circle-help"
                    className="size-3"
                    aria-hidden
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent>{helpText}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : null}
      </FieldLabel>
      {children({
        inputId,
        descId: describedBy,
        errorId,
        isInset,
        isRequired,
      })}
      {description ? (
        <p id={descId} className="text-muted-foreground text-xs">
          {description}
        </p>
      ) : null}
      {resolvedError ? (
        <p
          id={errorId}
          className="font-medium text-destructive text-xs"
          role="alert"
        >
          {resolvedError}
        </p>
      ) : null}
    </Field>
  );
}
