"use client";

// Self-register this component's CDP events into the runtime catalog.
// See `@/lib/registry/analytics/cdp-events` for the push-based
// registration rationale.
import { registerCdpRecipe } from "@/lib/registry/analytics/cdp-events";
import formBuilderRecipe from "@/recipes/form-builder.recipe";

registerCdpRecipe(formBuilderRecipe);

import {
  type FocusEvent,
  type FormEvent,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { FormBlock } from "@/components/registry/blocks/form-block";
import {
  FORM_INPUT_STYLE_CLASSES,
  parseFormInputStyle,
} from "@/components/registry/blocks/form-field-shell";
import { TextOrRichText } from "@/components/registry/blocks/text-or-rich-text";
import {
  parseHeadingAnimation,
  parseHeadingLayout,
  parseHeadingSize,
  SectionWrapper,
} from "@/components/registry/components/layout/section-wrapper";
import {
  Button,
  type CtaButtonVariant,
} from "@/components/registry/components/ui/cta-button";
import { LibraryIcon } from "@/components/registry/primitives/core/library-icon";
import type { RichTextSource } from "@/components/registry/primitives/editables/richtext";
import {
  getSourceText,
  isEmptySource,
} from "@/components/registry/primitives/editables/source-normalizers";
import type { TextSource } from "@/components/registry/primitives/editables/text";
import { useComponentAnalytics } from "@/lib/registry/analytics/use-component-analytics";
import { cn } from "@/lib/registry/cn";
import {
  FORM_CHROME,
  resolveChromeText,
  useDictionaryTranslate,
} from "@/lib/registry/forms/form-chrome";
import {
  FormBuilderProvider,
  useFormBuilderContext,
} from "@/lib/registry/forms/form-context";
import {
  FormWizardProvider,
  useFormWizard,
} from "@/lib/registry/forms/form-wizard-context";
import { useFormAutosave } from "@/lib/registry/forms/use-form-autosave";
import { type CmsProps, Placeholder } from "@/lib/registry/sitecore";

export interface FormBuilderFields {
  Title?: TextSource;
  Description?: RichTextSource;
  SubmitText?: TextSource;
  SuccessMessage?: TextSource;
  ErrorMessage?: TextSource;
  /**
   * Submit endpoint + verb live on fields now (moved from params).
   * They're editorial data — same form on two pages always posts to
   * the same URL with the same method, so the contract belongs with
   * Title / Description / SubmitText on the datasource rather than
   * being re-picked per placement.
   */
  SubmitAction?: TextSource;
  SubmitMethod?: TextSource;
}

export interface FormBuilderAnalyticsMeta {
  id?: string;
  instanceKey?: string;
  instanceScope?: "site" | "page";
  title?: string;
  colorScheme?: string;
  invalidField?: string;
  error?: string;
  /** Set on `field-focused`. The `name` attr of the input that received focus. */
  fieldName?: string;
  /** Set on `form-viewed` / `form-submitted`. Routed to the SDK's
   *  form() function as the formId argument. */
  formId?: string;
  /** Set on `identity`. Cloud SDK identity() email + identifiers.id. */
  email?: string;
  /** Set on `identity`. Cloud SDK identity() phone field. */
  phone?: string;
  /** Set on `identity`. Cloud SDK identity() firstName field. */
  firstName?: string;
  /** Set on `identity`. Cloud SDK identity() lastName field. */
  lastName?: string;
  /** Set on `identity`. Must include `{ id, provider: "email" }` so
   *  SitecoreAI identity rules (Identifier = email) can match. */
  identifiers?: Array<{ id: string; provider: string }>;
}

export type FormBuilderSubmissionPayload = Record<string, string | boolean>;

export interface FormBuilderProps extends CmsProps {
  title?: TextSource;
  description?: RichTextSource;
  submitText?: TextSource;
  successMessage?: TextSource;
  errorMessage?: TextSource;
  /**
   * Section-shell vocabulary shared with `accordion-block@1` /
   * `section-wrapper@1`. `useSectionWrapper` constrains the form to a
   * prose-width column; `headingLayout` / `headingAnimation` /
   * `headingSize` drive the heading treatment via the shared
   * `SectionWrapper` helper. All Sitecore string-boolean shapes
   * accepted on the boolean.
   */
  useSectionWrapper?: string | boolean;
  headingLayout?: string;
  headingAnimation?: string;
  headingSize?: string;
  /**
   * Spacing axis for the form's own flex containers — between status /
   * placeholder / submit-row sections AND between flat form fields
   * inside the placeholder. Backed by the shared `gap@1` enum.
   * `default` cascades to `md`. Splitters nested inside the form have
   * their own Gap param that takes precedence for the fields within
   * them.
   */
  gap?: "none" | "sm" | "md" | "lg" | "xl";
  /**
   * Form-level color scheme + intensity. `formColorScheme` picks the
   * brand token that drives the form surface AND the input chrome
   * (background tint, foreground text, input borders / placeholder /
   * caret), so the whole form reads cohesively. `subtle` (the
   * default) uses the soft `-background` tint + default input
   * chrome; `bold` swaps to the pure brand color, inverts text via
   * `text-<scheme>-foreground`, and retones inputs (translucent bg,
   * `currentColor` borders) so they stay readable. Replaces the
   * earlier `colorScheme` prop, which only set a data attribute.
   */
  formColorScheme?: string;
  formBackgroundIntensity?: "default" | "subtle" | "bold";
  /**
   * Visual treatment for descendant input chrome — `outline` (default,
   * the standard bordered cell) or `underline` (bottom-edge only,
   * editorial). Applied at the form root via descendant selectors so
   * every `<Input>` / `<Textarea>` / `<SelectTrigger>` inside the
   * form picks it up without per-field wiring.
   */
  formInputStyle?: string;
  /**
   * Render a "* required" hint above the form fields. Set to `false`
   * for forms with no required fields, or where the visual asterisk
   * on each field is enough on its own. Defaults to `true`.
   */
  showRequiredHint?: string | boolean;
  /**
   * Enable bot-protection honeypot — adds an invisible text field
   * (`name="hp_company"`) the form's submit handler checks; submits
   * with a non-empty value are silently rejected (treat as spam). On
   * by default; disable only when integrating a third-party captcha
   * that handles bot rejection separately.
   */
  honeypot?: string | boolean;
  /**
   * Optional captcha slot. Render a `<Turnstile>` / `<ReCaptcha>` /
   * similar React widget here; it sits between the form fields and
   * the submit button. The handler is captcha-agnostic — it doesn't
   * verify the token; that happens on the server when SubmitAction
   * forwards the form payload.
   */
  captchaSlot?: ReactNode;
  /**
   * Local-storage key for autosave. When set, the form persists every
   * input change (debounced 800ms) and surfaces a "Restore your
   * draft" prompt on revisit. Off when empty / undefined. Pick a key
   * that's stable across page visits (e.g. `application-form-2026q2`)
   * and unique per form so two forms on the same page don't collide.
   */
  autosaveKey?: string;
  /** Submit button axis — variant + size + colorScheme threaded through to the CTA Button primitive. */
  submitButtonVariant?: string;
  submitButtonSize?: string;
  submitButtonColorScheme?: string;
  /**
   * Append a trailing arrow (→) after the submit label. Backed by the
   * `SubmitButtonShowArrow` checkbox param, so Sitecore string-boolean
   * shapes are accepted.
   */
  submitButtonShowArrow?: string | boolean;
  /**
   * Submit endpoint + verb come from the recipe's fields (TextSource
   * shape from `withSitecore` convention), not rendering params —
   * they're editorial data tied to the form's identity. The runtime
   * value can arrive as a plain string (preview callers) OR
   * `{ value: "/api/forms/subscribe" }` (Sitecore `Field<string>`
   * shape); the React side normalises via `getSourceText`.
   */
  submitAction?: TextSource;
  submitMethod?: TextSource;
  instanceKey?: string;
  instanceScope?: "site" | "page";
  trackEvents?: string | boolean;
  /**
   * Stamped on the `<form>` as `data-cdp-form-intent`. Sitecore CDP's
   * OOTB FORM_SUBMIT auto-capture reads it as a payload dimension —
   * the same form template renders as Download / Contact / Subscribe
   * depending on author intent without us emitting our own wrapper
   * event. Default is `decision` (most common — lead-gen contact).
   */
  cdpFormIntent?: "research" | "consideration" | "decision" | "loyalty";
  /**
   * Stamped on the `<form>` as `data-cdp-form-commitment`. Companion
   * to `cdpFormIntent` for OOTB CDP classification. `provide-info` =
   * trading data for content; `commit` = ongoing relationship; `pay`
   * = financial.
   */
  cdpFormCommitment?: "provide-info" | "commit" | "pay";
  /**
   * Showcase / non-Sitecore escape hatch: when provided, the form renders
   * `children` inside the `<form>` instead of resolving a Sitecore
   * dynamic placeholder. In Sitecore Pages, leave this off and drop
   * field renderings into the `form-fields-{*}` placeholder.
   */
  children?: ReactNode;
  /**
   * Per-placement digit suffix SXA injects when the rendering is
   * marked `IsRenderingsWithDynamicPlaceholders=true`. Substituted
   * into the `form-fields-<id>` slot name so the SDK's
   * `^form-fields-\d+$` regex matches and the placeholder resolves
   * — the literal `{*}` token does NOT work as a `<Placeholder>`
   * `name` prop. See container.tsx for the full rationale.
   */
  dynamicPlaceholderId?: string;
  /**
   * Consumer-provided submission handler. When set, takes precedence
   * over the SubmitAction fetch. Resolving fires `submit-success`;
   * rejecting fires `submit-error`.
   */
  onSubmit?: (payload: FormBuilderSubmissionPayload) => Promise<void>;
  onView?: (meta: FormBuilderAnalyticsMeta) => void;
  onFieldFocused?: (meta: FormBuilderAnalyticsMeta) => void;
  onSubmitAttempt?: (meta: FormBuilderAnalyticsMeta) => void;
  onSubmitValidationFailed?: (meta: FormBuilderAnalyticsMeta) => void;
  onSubmitSuccess?: (meta: FormBuilderAnalyticsMeta) => void;
  onSubmitError?: (meta: FormBuilderAnalyticsMeta) => void;
}

// Form surface treatment per `formColorScheme` + `formBackgroundIntensity`.
// `subtle` keeps the soft `-background` tint and default input chrome —
// inputs render normally on a lightly tinted form surface. `bold` swaps
// to the pure brand color, inverts the form text via
// `text-<scheme>-foreground`, and retones the input chrome via CSS
// variables the Input / Textarea / Select primitives all read:
//
//   --input-background — set to a translucent foreground so the input
//                        cell shows through the bold surface
//   --input-border     — bumped to the scheme's foreground so the
//                        outline stays visible on the dark bg
//
// The CSS-variable approach matches what Container does for its own
// surface tokens, so existing input primitives pick up the new chrome
// automatically without per-component overrides.
type FormColorScheme =
  | "default"
  | "none"
  | "white"
  | "black"
  | "neutral"
  | "primary"
  | "primary-gradient"
  | "secondary"
  | "secondary-gradient"
  | "tertiary"
  | "accent"
  | "accent-2"
  | "accent-3"
  | "info"
  | "success"
  | "warning"
  | "destructive";

const FORM_SUBTLE_BG_CLASSES: Record<FormColorScheme, string> = {
  default: "",
  none: "",
  white: "bg-theme-white text-theme-black",
  black:
    "bg-theme-black text-theme-white [--input-background:rgb(255_255_255_/_0.12)] [--input-border:currentColor]",
  neutral: "bg-muted",
  primary: "bg-primary-background",
  "primary-gradient":
    "bg-gradient-to-br from-primary to-secondary text-primary-foreground [--input-background:rgb(255_255_255_/_0.12)] [--input-border:currentColor]",
  secondary: "bg-secondary-background",
  "secondary-gradient":
    "bg-gradient-to-br from-secondary to-accent text-secondary-foreground [--input-background:rgb(255_255_255_/_0.12)] [--input-border:currentColor]",
  tertiary: "bg-tertiary-background",
  accent: "bg-accent-background",
  "accent-2": "bg-accent-2-background",
  "accent-3": "bg-accent-3-background",
  info: "bg-info-background",
  success: "bg-success-background",
  warning: "bg-warning-background",
  destructive: "bg-destructive-background",
};

// Bold treatment: pure brand color + inverted foreground + retoned
// input chrome via CSS variables. Only the six brand schemes
// (primary / secondary / tertiary / accent-* ) carry a stable
// `<scheme>` + `<scheme>-foreground` token pair across every theme;
// the status / neutral / ai schemes don't, so picking `bold` on those
// silently falls back to the subtle entry. `currentColor` on the
// border ties the outline to the form's text color so the input
// chrome reads cohesively with the bold surface.
const FORM_BOLD_BG_CLASSES: Partial<Record<FormColorScheme, string>> = {
  primary:
    "bg-primary text-primary-foreground [--input-background:rgb(255_255_255_/_0.12)] [--input-border:currentColor]",
  secondary:
    "bg-secondary text-secondary-foreground [--input-background:rgb(255_255_255_/_0.12)] [--input-border:currentColor]",
  tertiary:
    "bg-tertiary text-tertiary-foreground [--input-background:rgb(255_255_255_/_0.12)] [--input-border:currentColor]",
  accent:
    "bg-accent text-accent-foreground [--input-background:rgb(255_255_255_/_0.12)] [--input-border:currentColor]",
  "accent-2":
    "bg-accent-2 text-accent-2-foreground [--input-background:rgb(255_255_255_/_0.12)] [--input-border:currentColor]",
  "accent-3":
    "bg-accent-3 text-accent-3-foreground [--input-background:rgb(255_255_255_/_0.12)] [--input-border:currentColor]",
};

// `gap@1` enum → Tailwind `gap-*` utility. `default` cascades to `md`
// (the previous hard-coded `gap-6`); `none` collapses spacing entirely
// for tight stacked layouts. The same map is applied to both the
// FormBlock's vertical flex (section spacing) and the fields-placeholder
// wrapper's flex-wrap (between flat form fields), so the form reads
// uniformly. Splitters override locally via their own Gap param.
const GAP_CLASSES: Record<NonNullable<FormBuilderProps["gap"]>, string> = {
  none: "gap-0",
  sm: "gap-2",
  md: "gap-6",
  lg: "gap-8",
  xl: "gap-12",
};

const resolveFormSurfaceClass = (
  scheme: FormColorScheme,
  intensity: NonNullable<FormBuilderProps["formBackgroundIntensity"]>,
): string => {
  if (intensity === "bold") {
    return FORM_BOLD_BG_CLASSES[scheme] ?? FORM_SUBTLE_BG_CLASSES[scheme];
  }
  return FORM_SUBTLE_BG_CLASSES[scheme];
};

/** Coerce a Sitecore `Field<string>` SubmitMethod into the HTTP verb
 *  the submit handler expects. Anything but `GET` (case-insensitive)
 *  resolves to `POST`. */
function resolveSubmitMethod(
  submitMethod: TextSource | undefined,
): "POST" | "GET" {
  const raw = getSourceText(submitMethod)?.trim().toUpperCase();
  return raw === "GET" ? "GET" : "POST";
}

/** The `name` of a focused/blurred form field, or undefined when the
 *  event target isn't a named input / textarea / select. Used by the
 *  field-engagement focus + blur handlers. */
function fieldNameFromFocusEvent(
  event: FocusEvent<HTMLFormElement>,
): string | undefined {
  const target = event.target as unknown as HTMLInputElement;
  if (!target?.name) return undefined;
  const tag = target.tagName;
  if (tag !== "INPUT" && tag !== "TEXTAREA" && tag !== "SELECT")
    return undefined;
  return target.name;
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

interface UseFormBuilderAnalyticsArgs {
  meta: FormBuilderAnalyticsMeta;
  eventsEnabled: boolean;
  isEditing?: boolean;
  rootRef: RefObject<HTMLElement | null>;
  onView?: (meta: FormBuilderAnalyticsMeta) => void;
  onFieldFocused?: (meta: FormBuilderAnalyticsMeta) => void;
  onSubmitAttempt?: (meta: FormBuilderAnalyticsMeta) => void;
  onSubmitValidationFailed?: (meta: FormBuilderAnalyticsMeta) => void;
  onSubmitSuccess?: (meta: FormBuilderAnalyticsMeta) => void;
  onSubmitError?: (meta: FormBuilderAnalyticsMeta) => void;
}

function useFormBuilderAnalytics({
  meta,
  eventsEnabled,
  isEditing,
  rootRef,
  onView,
  onFieldFocused,
  onSubmitAttempt,
  onSubmitValidationFailed,
  onSubmitSuccess,
  onSubmitError,
}: UseFormBuilderAnalyticsArgs) {
  const analytics =
    useComponentAnalytics<FormBuilderAnalyticsMeta>("form-builder");
  const hasFiredViewRef = useRef(false);
  const firedFieldsRef = useRef<Set<string>>(new Set());
  // Per-field engagement timing — keyed by `name`, value is the
  // `performance.now()` timestamp when focus entered. On blur we
  // compute the delta and fire `field-engagement` so analytics can
  // see where users spend time (and where they drop off).
  const focusStartRef = useRef<Record<string, number>>({});

  // Catalog fires routed through the Content SDK:
  //   view         → pageView()
  //   form-viewed  → form(formId, 'VIEWED', instanceId)
  //   form-submitted → form(formId, 'SUBMITTED', instanceId)
  //   identity     → identity({email, identifiers:[{id, provider:"email"}]})
  //   submit-error → event() (CUSTOM)
  //
  // submit-attempt + submit-validation-failed are intentionally not
  // catalog-routed — submit-attempt is the same wire event as
  // form-submitted at the platform layer, and validation-failed is
  // debug telemetry. Consumer-side on* callbacks still fire as a
  // component API.
  const fireView = useCallback(() => {
    if (onView) onView(meta);
    if (eventsEnabled) {
      analytics.fire("view", meta);
      analytics.fire("form-viewed", {
        ...meta,
        formId: `form-builder.${meta.instanceKey ?? meta.id ?? "default"}`,
      });
    }
  }, [analytics, eventsEnabled, meta, onView]);

  const fireFieldFocused = useCallback(
    (fieldName: string) => {
      // Start the engagement clock on EVERY focus enter so we can
      // measure return visits to the same field; gate the
      // `field-focused` first-touch event on the firedFieldsRef set.
      focusStartRef.current[fieldName] = performance.now();
      if (firedFieldsRef.current.has(fieldName)) return;
      firedFieldsRef.current.add(fieldName);
      const payload = { ...meta, fieldName };
      if (onFieldFocused) onFieldFocused(payload);
      else if (eventsEnabled) analytics.fire("field-focused", payload);
    },
    [analytics, eventsEnabled, meta, onFieldFocused],
  );

  /**
   * On blur, fire `field-engagement` with the dwell time (ms) for
   * that field. Lets analytics surface "Users spend 12s on
   * 'Industry' but only 2s on 'Email'" — useful for spotting which
   * fields confuse users. Skipped if focus never entered (or in
   * editing mode).
   */
  const fireFieldBlurred = useCallback(
    (fieldName: string) => {
      const start = focusStartRef.current[fieldName];
      if (start == null) return;
      delete focusStartRef.current[fieldName];
      const durationMs = Math.round(performance.now() - start);
      if (durationMs < 50) return; // ignore focus-blur noise
      const payload = { ...meta, fieldName, durationMs };
      if (eventsEnabled) analytics.fire("field-engagement", payload);
    },
    [analytics, eventsEnabled, meta],
  );

  const fireAttempt = useCallback(() => {
    if (onSubmitAttempt) onSubmitAttempt(meta);
  }, [meta, onSubmitAttempt]);

  const fireValidationFailed = useCallback(
    (invalidField?: string) => {
      const payload = { ...meta, invalidField };
      if (onSubmitValidationFailed) onSubmitValidationFailed(payload);
    },
    [meta, onSubmitValidationFailed],
  );

  const fireSuccess = useCallback(
    (payload: FormBuilderSubmissionPayload) => {
      if (onSubmitSuccess) onSubmitSuccess(meta);
      if (eventsEnabled) {
        analytics.fire("form-submitted", {
          ...meta,
          formId: `form-builder.${meta.instanceKey ?? meta.id ?? "default"}`,
        });
        const identity = extractIdentityFromPayload(payload);
        if (identity.email) {
          analytics.fire("identity", {
            ...meta,
            ...identity,
          });
        }
      }
    },
    [analytics, eventsEnabled, meta, onSubmitSuccess],
  );

  const fireError = useCallback(
    (error: string) => {
      const payload = { ...meta, error };
      if (onSubmitError) onSubmitError(payload);
      else if (eventsEnabled) analytics.fire("submit-error", payload);
    },
    [analytics, eventsEnabled, meta, onSubmitError],
  );

  useEffect(() => {
    if (isEditing) return;
    if (!eventsEnabled && !onView) return;
    if (hasFiredViewRef.current) return;
    const node = rootRef.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (hasFiredViewRef.current) return;
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            hasFiredViewRef.current = true;
            fireView();
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [fireView, isEditing, eventsEnabled, onView, rootRef]);

  return {
    fireFieldFocused,
    fireFieldBlurred,
    fireAttempt,
    fireValidationFailed,
    fireSuccess,
    fireError,
  };
}

/**
 * Serialize a FormData into a plain key/value record. Checkboxes
 * arrive as `"on"` when ticked and are omitted when not; convert
 * those to booleans so `payload.consent === true` reads naturally.
 */
function serializeFormData(
  form: HTMLFormElement,
): FormBuilderSubmissionPayload {
  const data = new FormData(form);
  const payload: FormBuilderSubmissionPayload = {};
  const checkboxes = form.querySelectorAll<HTMLInputElement>(
    'input[type="checkbox"]',
  );
  for (const cb of checkboxes) {
    if (cb.name) payload[cb.name] = cb.checked;
  }
  for (const [key, value] of data.entries()) {
    if (key in payload) continue;
    payload[key] = String(value);
  }
  return payload;
}

const EMAIL_VALUE_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const IDENTITY_EMAIL_KEYS = new Set(["email", "emailaddress", "mail"]);
const IDENTITY_PHONE_KEYS = new Set([
  "phone",
  "tel",
  "telephone",
  "mobile",
  "cellphone",
]);
const IDENTITY_FIRST_NAME_KEYS = new Set(["firstname", "givenname"]);
const IDENTITY_LAST_NAME_KEYS = new Set(["lastname", "surname", "familyname"]);
const IDENTITY_FULL_NAME_KEYS = new Set(["name", "legalname", "fullname"]);

function identityKey(name: string): string {
  return name.toLowerCase().replace(/[\s_-]/g, "");
}

function stringPayloadValue(
  payload: FormBuilderSubmissionPayload,
  keys: Set<string>,
): string | undefined {
  for (const [name, value] of Object.entries(payload)) {
    if (typeof value !== "string") continue;
    const trimmed = value.trim();
    if (!trimmed) continue;
    if (keys.has(identityKey(name))) return trimmed;
  }
  return undefined;
}

/**
 * Pull SitecoreAI IDENTITY fields out of a composed form payload.
 * Apply Now authors `email` + `name`; other placements may use
 * firstName/lastName/phone. `identifiers.provider` is always `"email"`
 * so it matches the tenant identity rule Identifier value `email`.
 */
function extractIdentityFromPayload(payload: FormBuilderSubmissionPayload): {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  identifiers: Array<{ id: string; provider: string }>;
} {
  let email = stringPayloadValue(payload, IDENTITY_EMAIL_KEYS);
  if (!email) {
    for (const value of Object.values(payload)) {
      if (typeof value === "string" && EMAIL_VALUE_RE.test(value.trim())) {
        email = value.trim();
        break;
      }
    }
  }
  email = email?.toLowerCase();

  const phone = stringPayloadValue(payload, IDENTITY_PHONE_KEYS);
  let firstName = stringPayloadValue(payload, IDENTITY_FIRST_NAME_KEYS);
  let lastName = stringPayloadValue(payload, IDENTITY_LAST_NAME_KEYS);
  if (!firstName && !lastName) {
    const fullName = stringPayloadValue(payload, IDENTITY_FULL_NAME_KEYS);
    if (fullName) {
      const parts = fullName.split(/\s+/).filter(Boolean);
      firstName = parts[0];
      if (parts.length > 1) lastName = parts.slice(1).join(" ");
    }
  }

  return {
    ...(email ? { email } : {}),
    ...(phone ? { phone } : {}),
    ...(firstName ? { firstName } : {}),
    ...(lastName ? { lastName } : {}),
    identifiers: email ? [{ id: email, provider: "email" }] : [],
  };
}

/**
 * On a failed `checkValidity()`, focus the first invalid field and
 * announce its native validation message (falling back to the
 * recipe-authored `errorText` so tenants keep i18n control). Returns
 * the invalid field's `name` for `fireValidationFailed`, or undefined
 * when the offender isn't a form field.
 */
function reportValidationFailure(
  form: HTMLFormElement,
  errorText: string,
  setSubmitState: (s: "idle" | "error" | "success") => void,
  setStatusMessage: (s: string) => void,
): string | undefined {
  const invalid = form.querySelector<HTMLElement>(":invalid");
  invalid?.focus();
  const isFormField =
    invalid instanceof HTMLInputElement ||
    invalid instanceof HTMLTextAreaElement ||
    invalid instanceof HTMLSelectElement;
  const validationMsg = isFormField ? invalid.validationMessage : "";
  setSubmitState("error");
  setStatusMessage(validationMsg || errorText);
  return isFormField ? invalid.name : undefined;
}

/**
 * Run the submission: a consumer-provided `onSubmit` takes precedence
 * over the `submitAction` fetch. Throws on a non-OK fetch response so
 * the caller's catch fires `submit-error`.
 */
async function submitFormPayload(
  payload: FormBuilderSubmissionPayload,
  {
    onSubmit,
    submitAction,
    submitMethod,
  }: {
    onSubmit?: (payload: FormBuilderSubmissionPayload) => Promise<void>;
    submitAction?: string;
    submitMethod: "POST" | "GET";
  },
): Promise<void> {
  if (onSubmit) {
    await onSubmit(payload);
    return;
  }
  if (submitAction) {
    const response = await fetch(submitAction, {
      method: submitMethod,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
  }
}

interface SubmitHandlerArgs {
  fireAttempt: () => void;
  fireValidationFailed: (invalidField?: string) => void;
  fireSuccess: (payload: FormBuilderSubmissionPayload) => void;
  fireError: (error: string) => void;
  onSubmit?: (payload: FormBuilderSubmissionPayload) => Promise<void>;
  submitAction?: string;
  submitMethod: "POST" | "GET";
  successText: string;
  errorText: string;
  setIsSubmitting: (b: boolean) => void;
  setSubmitState: (s: "idle" | "error" | "success") => void;
  setStatusMessage: (s: string) => void;
}

function useSubmitHandler({
  fireAttempt,
  fireValidationFailed,
  fireSuccess,
  fireError,
  onSubmit,
  submitAction,
  submitMethod,
  successText,
  errorText,
  setIsSubmitting,
  setSubmitState,
  setStatusMessage,
}: SubmitHandlerArgs) {
  return useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const form = event.currentTarget;
      fireAttempt();

      if (!form.checkValidity()) {
        // Prefer the browser's native validation message — it's
        // specific to the offending field. Falls back to the
        // recipe-authored `errorText` so tenants control the i18n.
        const invalidName = reportValidationFailure(
          form,
          errorText,
          setSubmitState,
          setStatusMessage,
        );
        fireValidationFailed(invalidName);
        return;
      }

      const payload = serializeFormData(form);
      setIsSubmitting(true);
      setSubmitState("idle");
      setStatusMessage("Submitting...");

      try {
        await submitFormPayload(payload, {
          onSubmit,
          submitAction,
          submitMethod,
        });
        form.reset();
        setSubmitState("success");
        setStatusMessage(successText);
        fireSuccess(payload);
      } catch (err) {
        setSubmitState("error");
        const errMessage = err instanceof Error ? err.message : String(err);
        setStatusMessage(errorText);
        fireError(errMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      onSubmit,
      submitAction,
      submitMethod,
      successText,
      errorText,
      fireAttempt,
      fireValidationFailed,
      fireSuccess,
      fireError,
      setIsSubmitting,
      setSubmitState,
      setStatusMessage,
    ],
  );
}

/**
 * Bridges the live form DOM and FormBuilderProvider's values map.
 * Subscribes to the parent form's `input` events: on each tick reads
 * every named input via `FormData`, pushes the snapshot into
 * context so conditional fields (#2) and FormSummary (#17) can
 * re-render in real-time without per-field opt-in. The honeypot
 * field (#4) is filtered out so it doesn't pollute the values map;
 * file inputs collapse to their filename (FormData files don't
 * serialise into context cleanly).
 *
 * Lives as a sibling component inside the provider so the
 * `useFormBuilderContext` hook can pick up the live setter — the
 * outer FormBuilder render can't read context (no provider yet) but
 * its formBody JSX is inside `<FormBuilderProvider>{formBody}</...>`,
 * so this sub-tree can.
 */
/**
 * Snapshot every named input in the live form into a plain values map.
 * The honeypot field (#4) is filtered out so it doesn't pollute the
 * map; file inputs collapse to their filename (FormData files don't
 * serialise into context cleanly); repeated names accumulate into an
 * array.
 */
function snapshotFormValues(form: HTMLFormElement): Record<string, unknown> {
  const data = new FormData(form);
  const next: Record<string, unknown> = {};
  for (const [name, value] of data.entries()) {
    if (name === "hp_company") continue;
    if (value instanceof File) {
      next[name] = value.name || true;
      continue;
    }
    const prev = next[name];
    if (prev !== undefined) {
      next[name] = Array.isArray(prev) ? [...prev, value] : [prev, value];
    } else {
      next[name] = value;
    }
  }
  return next;
}

function FormValuesSyncBridge({
  formRef,
}: {
  formRef: { current: HTMLFormElement | null };
}) {
  const { replaceValues } = useFormBuilderContext();
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const sync = () => {
      replaceValues(snapshotFormValues(form));
    };
    sync();
    form.addEventListener("input", sync);
    form.addEventListener("change", sync);
    return () => {
      form.removeEventListener("input", sync);
      form.removeEventListener("change", sync);
    };
  }, [formRef, replaceValues]);
  return null;
}

/**
 * Error summary block. Reads the form's error context and renders an
 * anchored list when any field has a validation error. Designed to
 * receive focus on submit-time failure so AT users get an actionable
 * summary rather than a silent re-render. Renders nothing when the
 * error map is empty.
 *
 * Lives inside FormBuilderProvider so the summary always sits next to
 * the fields it summarises.
 */
function FormBuilderErrorSummary() {
  const { errors } = useFormBuilderContext();
  const summaryRef = useRef<HTMLDivElement | null>(null);
  const entries = Object.entries(errors);
  useEffect(() => {
    if (entries.length === 0) return;
    summaryRef.current?.focus();
  }, [entries.length]);
  if (entries.length === 0) return null;
  return (
    <div
      ref={summaryRef}
      tabIndex={-1}
      role="alert"
      aria-labelledby="form-error-summary-heading"
      className="rounded-md border border-destructive/30 bg-destructive-background p-4 text-destructive"
      data-slot="form-builder-error-summary"
    >
      <p id="form-error-summary-heading" className="mb-2 font-semibold text-sm">
        {entries.length === 1
          ? "1 field needs attention"
          : `${entries.length} fields need attention`}
      </p>
      <ul className="list-disc space-y-1 ps-5 text-sm">
        {entries.map(([name, message]) => (
          <li key={name}>
            <a
              href={`#${name}`}
              className="underline underline-offset-2 hover:text-foreground"
              onClick={(e) => {
                e.preventDefault();
                const target = document.querySelector(
                  `[data-field-name="${name}"] input, [data-field-name="${name}"] textarea, [data-field-name="${name}"] [data-slot="select-trigger"]`,
                ) as HTMLElement | null;
                target?.focus();
              }}
            >
              {message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** "* indicates a required field" hint above the fields. */
function FormRequiredHint() {
  return (
    <p
      className="text-muted-foreground text-xs"
      data-slot="form-builder-required-hint"
    >
      <span aria-hidden="true" className="text-destructive">
        *
      </span>{" "}
      indicates a required field
    </p>
  );
}

/**
 * Form-fields region. Both the `children` (showcase / non-Sitecore)
 * and `rendering` (Sitecore Placeholder) paths share the `flex
 * flex-wrap` wrapper so half / third field widths pair side-by-side.
 * Renders nothing when neither is present.
 */
function FormFieldsRegion({
  gap,
  placeholderName,
  rendering,
  children,
}: {
  gap: NonNullable<FormBuilderProps["gap"]>;
  placeholderName: string;
  rendering: FormBuilderProps["rendering"];
  children?: ReactNode;
}) {
  if (children) {
    return (
      <div className={cn("flex min-h-24 w-full flex-wrap", GAP_CLASSES[gap])}>
        {children}
      </div>
    );
  }
  if (rendering) {
    return (
      <div className={cn("flex min-h-24 w-full flex-wrap", GAP_CLASSES[gap])}>
        <Placeholder name={placeholderName} rendering={rendering} />
      </div>
    );
  }
  return null;
}

/**
 * Optimistic success card — replaces the form chrome entirely after a
 * successful submit. `onReset` returns the form to its idle state.
 */
function FormSuccessCard({
  successText,
  onReset,
}: {
  successText: string;
  onReset: () => void;
}) {
  return (
    <output
      className="flex w-full flex-col items-center gap-3 rounded-lg border border-success/30 bg-success-background p-8 text-center"
      data-slot="form-builder-success"
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-success/15 text-success">
        <LibraryIcon name="check" className="size-6" aria-hidden />
      </div>
      <p className="font-medium text-base">{successText}</p>
      <button
        type="button"
        onClick={onReset}
        className="mt-2 text-muted-foreground text-sm underline underline-offset-4 hover:text-foreground"
      >
        Submit another
      </button>
    </output>
  );
}

/**
 * "Restore your draft" prompt shown when autosave has a stored draft.
 * Restore re-hydrates the form from local storage; Dismiss clears it.
 */
function FormRestorePrompt({
  draftAt,
  onRestore,
  onDismiss,
}: {
  draftAt: string;
  onRestore: () => void;
  onDismiss: () => void;
}) {
  return (
    <output
      className="flex items-start gap-3 rounded-md border border-info/30 bg-info-background p-3 text-info text-sm"
      data-slot="form-builder-restore-prompt"
    >
      <LibraryIcon name="rotate-ccw" className="mt-0.5 size-4" aria-hidden />
      <div className="flex-1">
        <p className="font-medium">You have an unsaved draft</p>
        <p className="text-xs">Saved {new Date(draftAt).toLocaleString()}</p>
      </div>
      <button
        type="button"
        className="font-medium text-sm underline underline-offset-2 hover:text-foreground"
        onClick={onRestore}
      >
        Restore
      </button>
      <button
        type="button"
        className="text-muted-foreground text-sm underline underline-offset-2 hover:text-foreground"
        onClick={onDismiss}
      >
        Dismiss
      </button>
    </output>
  );
}

/**
 * Bot honeypot — real users never see this; bots fill it in. The
 * submit handler treats a non-empty `hp_company` as spam.
 * `tabIndex={-1}` + `aria-hidden` so AT users skip it; CSS hides it
 * visually while keeping it in the form payload.
 */
function FormHoneypot({ formStatusId }: { formStatusId: string }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute top-[-10000px] -left-[10000px] h-0 w-0 overflow-hidden opacity-0"
      data-slot="form-builder-honeypot"
    >
      <label htmlFor={`${formStatusId}-hp`}>Leave this field blank</label>
      <input
        id={`${formStatusId}-hp`}
        name="hp_company"
        type="text"
        tabIndex={-1}
        autoComplete="off"
      />
    </div>
  );
}

/**
 * Compose-your-own form parent. Renders the `<form>` shell, status
 * announcement region, and submit button; fields render into the
 * `form-fields-{*}` dynamic placeholder (or `children`, when used
 * outside Sitecore).
 *
 * Submission semantics: when `SubmitAction` is set, POST/GET the
 * serialized payload to that URL. When unset, run the default
 * success-theater path (registry showcase). A consumer-provided
 * `onSubmit` overrides both.
 *
 * CDP events route through `useComponentAnalytics("form-builder")` —
 * see the recipe's `events:` block for the full list.
 */
export function Default({
  title,
  description,
  submitText,
  successMessage,
  errorMessage,
  useSectionWrapper,
  headingLayout,
  headingAnimation,
  headingSize,
  gap = "md",
  formColorScheme = "default",
  formBackgroundIntensity = "subtle",
  formInputStyle = "outline",
  showRequiredHint = true,
  honeypot = true,
  captchaSlot,
  autosaveKey,
  submitButtonVariant = "default",
  submitButtonSize = "default",
  submitButtonColorScheme = "primary",
  submitButtonShowArrow,
  submitAction,
  submitMethod,
  instanceKey,
  instanceScope = "page",
  trackEvents,
  cdpFormIntent = "decision",
  cdpFormCommitment = "provide-info",
  children,
  styles,
  id,
  isEditing,
  rendering,
  onSubmit,
  onView,
  onFieldFocused,
  onSubmitAttempt,
  onSubmitValidationFailed,
  onSubmitSuccess,
  onSubmitError,
  dynamicPlaceholderId,
}: FormBuilderProps) {
  const formStatusId = useId();
  // Section-shell vocabulary — mirrors accordion-block. SectionWrapper
  // owns the heading layout / animation / size + the contained-vs-
  // full-width body toggle, so the form picks up the same author
  // surface as every other section-shelled component.
  const layout = parseHeadingLayout(
    headingLayout,
    "start-with-section-divider",
  );
  const animation = parseHeadingAnimation(headingAnimation, "none");
  const size = parseHeadingSize(headingSize, "default");

  // SXA-injected per-placement digit so the SDK's `^form-fields-\d+$`
  // regex matches the layout-service `form-fields-{*}` template key.
  // See container.tsx for the full rationale on why the literal `{*}`
  // token doesn't work as a Placeholder name.
  const phSuffix = dynamicPlaceholderId ?? "1";
  const placeholderName = `form-fields-${phSuffix}`;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    "Fill out the form to submit.",
  );
  const [submitState, setSubmitState] = useState<"idle" | "error" | "success">(
    "idle",
  );
  const rootRef = useRef<HTMLElement | null>(null);

  const eventsEnabled = isEnabled(trackEvents);
  // SectionWrapper handles the empty-heading branch internally
  // (renders nothing when both title + lead are blank), so the
  // explicit `hasTitle` / `hasDescription` gates are gone.

  // Generic chrome (submit button + status messages) resolves author
  // field → core-ui-labels dictionary phrase → English net. The recipe
  // ships SubmitText / SuccessMessage / ErrorMessage with no Standard
  // Value, so a blank field falls through to the localized dictionary
  // default. Field-specific micro-copy that ISN'T recipe-field-backed
  // (Back / Next / "Restore" / honeypot label, etc.) is not yet routed
  // through the dictionary — tracked as a follow-up.
  const t = useDictionaryTranslate();
  const successText = resolveChromeText(
    getSourceText(successMessage),
    FORM_CHROME.formSuccess.key,
    FORM_CHROME.formSuccess.en,
    t,
  );
  const errorText = resolveChromeText(
    getSourceText(errorMessage),
    FORM_CHROME.error.key,
    FORM_CHROME.error.en,
    t,
  );
  const submitLabel = resolveChromeText(
    getSourceText(submitText),
    FORM_CHROME.submit.key,
    FORM_CHROME.submit.en,
    t,
  );
  // SubmitAction / SubmitMethod come from the recipe's fields now —
  // delivered as Sitecore `Field<string>` shape. Coerce + normalise to
  // the same `string | undefined` the submit handler historically saw.
  const submitActionUrl = getSourceText(submitAction) || undefined;
  const submitMethodVerb = resolveSubmitMethod(submitMethod);

  const meta = useMemo<FormBuilderAnalyticsMeta>(() => {
    const titleText = getSourceText(title);
    return {
      id,
      instanceKey: instanceKey || titleText || id,
      instanceScope,
      title: titleText,
      colorScheme: formColorScheme,
    };
  }, [id, instanceKey, instanceScope, title, formColorScheme]);

  const {
    fireFieldFocused,
    fireFieldBlurred,
    fireAttempt,
    fireValidationFailed,
    fireSuccess,
    fireError,
  } = useFormBuilderAnalytics({
    meta,
    eventsEnabled,
    isEditing,
    rootRef,
    onView,
    onFieldFocused,
    onSubmitAttempt,
    onSubmitValidationFailed,
    onSubmitSuccess,
    onSubmitError,
  });

  const handleFieldFocus = useCallback(
    (event: FocusEvent<HTMLFormElement>) => {
      if (isEditing) return;
      const name = fieldNameFromFocusEvent(event);
      if (name) fireFieldFocused(name);
    },
    [fireFieldFocused, isEditing],
  );

  const handleFieldBlur = useCallback(
    (event: FocusEvent<HTMLFormElement>) => {
      if (isEditing) return;
      const name = fieldNameFromFocusEvent(event);
      if (name) fireFieldBlurred(name);
    },
    [fireFieldBlurred, isEditing],
  );

  const handleSubmit = useSubmitHandler({
    fireAttempt,
    fireValidationFailed,
    fireSuccess,
    fireError,
    onSubmit,
    // The coerced field-shape values — SubmitAction / SubmitMethod
    // moved to the recipe's fields so they arrive as `Field<string>`.
    submitAction: submitActionUrl,
    submitMethod: submitMethodVerb,
    successText,
    errorText,
    setIsSubmitting,
    setSubmitState,
    setStatusMessage,
  });

  // Resolve the form surface class once. Bold + brand scheme applies a
  // pure brand bg, inverted text, and retones the input chrome via CSS
  // variables Input / Textarea / Select primitives read. `default`
  // scheme is transparent (form adopts whatever's behind it); subtle
  // brand schemes apply the soft `-background` tint with default
  // input chrome.
  const formSurfaceClass = resolveFormSurfaceClass(
    formColorScheme as FormColorScheme,
    formBackgroundIntensity,
  );

  // Outer `container py-8 md:py-12` mirrors accordion-block so the
  // form has page-section padding by default; `useSectionWrapper`
  // controls only the inner width constraint via the shared helper.
  const showRequiredHintResolved = isEnabled(showRequiredHint);
  const honeypotEnabled = isEnabled(honeypot);

  const autosave = useFormAutosave({ storageKey: autosaveKey ?? "" });
  const formRef = useRef<HTMLFormElement | null>(null);
  const [draftDismissed, setDraftDismissed] = useState(false);
  const showRestorePrompt =
    !isEditing &&
    !draftDismissed &&
    submitState === "idle" &&
    autosave.draftAt != null;

  // Optimistic success card — replaces the form chrome entirely after
  // a successful submit so authors don't have to choose between an
  // ugly inline status paragraph and a full-page redirect.
  if (submitState === "success") {
    return (
      <FormSuccessCard
        successText={successText}
        onReset={() => {
          setSubmitState("idle");
          setStatusMessage("Fill out the form to submit.");
        }}
      />
    );
  }

  const formBody = (
    <FormBlock
      // Flex column for the vertical strips: required hint, error
      // summary, status, form fields placeholder, captcha slot,
      // submit row. Form fields lay out horizontally inside the
      // placeholder wrapper below via `flex-wrap` + width `basis-*`
      // classes — the whole project is flex, no `grid` anywhere on
      // the form. `Gap` param drives both levels' spacing (section
      // stack + flat field row).
      className={cn("flex w-full flex-col", GAP_CLASSES[gap])}
      ref={(node) => {
        formRef.current = node;
      }}
      aria-describedby={formStatusId}
      onSubmit={handleSubmit}
      onFocus={handleFieldFocus}
      onBlur={handleFieldBlur}
      onInput={autosave.onInput}
      data-form-id={formStatusId}
      // Semantic dimensions for OOTB Sitecore CDP FORM_SUBMIT
      // auto-capture. Lets the same form-builder template render as
      // Download vs Contact vs Subscribe depending on author intent,
      // with the platform reading the semantics directly off the
      // form element. See the recipe's CdpFormIntent /
      // CdpFormCommitment params + cdp-form-intent.recipe.ts /
      // cdp-form-commitment.recipe.ts for the value space.
      data-cdp-form-intent={cdpFormIntent}
      data-cdp-form-commitment={cdpFormCommitment}
      // `multipart/form-data` is required for `<input type="file">`
      // to actually upload the file's bytes (otherwise FormData only
      // submits the filename string). Setting it unconditionally is
      // safe — text-only forms encode fine as multipart too, and
      // the parent form-builder placeholder accepts the upload field
      // by allowlist so a file input can appear in any placement.
      encType="multipart/form-data"
      noValidate
    >
      <FormValuesSyncBridge formRef={formRef} />
      {/*
       * Wizard stepper indicator. Renders inside the form body so it
       * picks up the container's horizontal centering automatically.
       * No-ops when no FormWizardProvider ancestor is present
       * (single-step forms render nothing here).
       */}
      <FormStepperIndicator />
      {showRequiredHintResolved ? <FormRequiredHint /> : null}
      {showRestorePrompt ? (
        <FormRestorePrompt
          draftAt={autosave.draftAt ?? ""}
          onRestore={() => {
            autosave.restore(formRef.current);
            setDraftDismissed(true);
          }}
          onDismiss={() => {
            autosave.clear();
            setDraftDismissed(true);
          }}
        />
      ) : null}
      {/*
       * Error summary lives between the required hint and the form
       * fields so it sits where AT users land after submit-time
       * validation failure. The actual `<FormErrorSummary>` block is
       * rendered conditionally inside FormBuilderProvider's subtree
       * (see below) — it reads errors from the context.
       */}
      <FormBuilderErrorSummary />
      {honeypotEnabled ? <FormHoneypot formStatusId={formStatusId} /> : null}
      <p
        id={formStatusId}
        className={cn(
          "w-full",
          submitState === "idle" ? "sr-only" : "text-sm",
          submitState === "error"
            ? "text-destructive"
            : "text-muted-foreground",
        )}
        aria-live="polite"
        aria-atomic="true"
      >
        {statusMessage}
      </p>
      {/*
        Sitecore editable Placeholder. Mirror section-wrapper /
        container: always render `<Placeholder>` when a rendering
        envelope is present, regardless of whether the author has
        dropped fields yet — Pages chrome reads the Placeholder
        component's data attributes to wire its drop targets, so a
        static stub here hides them. `children` stays as the
        showcase escape hatch for standalone (non-Sitecore) renders.

        The wrapper is `flex flex-wrap gap-6` so form fields lay out
        horizontally and wrap to a new row when the row fills up.
        Each field's `WIDTH_GRID_CLASSES` resolves to a `basis-*`
        pair (`basis-full` on mobile + `sm:basis-[calc(...)]` at the
        sm breakpoint, accounting for the 1.5rem gap) so two halves
        or three thirds fit on a single row without spilling.
      */}
      {/*
       * Both paths (children + rendering) need the `flex flex-wrap`
       * container so half / third field widths can pair side-by-side.
       * The previous gate dropped the wrapper on the `children` path
       * (used by the showcase preview + non-Sitecore consumers),
       * leaving every field on its own row regardless of declared
       * width — fix is to share the wrapper between both branches.
       */}
      <FormFieldsRegion
        gap={gap}
        placeholderName={placeholderName}
        rendering={rendering}
      >
        {children}
      </FormFieldsRegion>
      {captchaSlot ? (
        <div className="mt-2" data-slot="form-builder-captcha">
          {captchaSlot}
        </div>
      ) : null}
      <FormSubmitArea
        submitLabel={submitLabel}
        submitButtonVariant={submitButtonVariant}
        submitButtonSize={submitButtonSize}
        submitButtonColorScheme={submitButtonColorScheme}
        submitButtonShowArrow={submitButtonShowArrow}
        isSubmitting={isSubmitting}
        submitState={submitState}
      />
    </FormBlock>
  );

  return (
    <section
      ref={rootRef}
      // The form scheme + intensity classes paint the surface,
      // foreground text, and CSS-variable input chrome here at the
      // section root so every descendant (FormBlock, Placeholder
      // children, the submit Button shell) inherits the treatment.
      // Vertical padding mirrors accordion-block (`py-8 md:py-12`)
      // and the inner SectionWrapper handles the contained-vs-full-
      // width body toggle.
      className={cn(
        "component form-builder group",
        formSurfaceClass,
        FORM_INPUT_STYLE_CLASSES[parseFormInputStyle(formInputStyle)],
        styles ?? "",
      )}
      data-slot="form-builder"
      data-color-scheme={formColorScheme}
      data-color-intensity={formBackgroundIntensity}
      data-input-style={parseFormInputStyle(formInputStyle)}
      id={id || undefined}
    >
      <div className="container mx-auto px-4 py-8 md:py-12">
        <SectionWrapper
          title={title}
          layout={layout}
          headingOptions={{ animation, size }}
          useSectionWrapper={useSectionWrapper}
        >
          {description && !isEmptySource(description) ? (
            <div
              className="mb-6 max-w-prose [&_p]:mb-2"
              data-slot="form-builder-description"
            >
              <TextOrRichText value={description} />
            </div>
          ) : null}
          <FormBuilderProvider formId={formStatusId} isEditing={isEditing}>
            {formBody}
          </FormBuilderProvider>
        </SectionWrapper>
      </div>
    </section>
  );
}

/**
 * Stepper indicator used by the `Wizard` variant. Reads the live
 * step registry from the wizard context and renders a clickable dot
 * row so users see "Step 2 of 4 — Contact info" at a glance.
 */
function FormStepperIndicator() {
  const wizard = useFormWizard();
  if (!wizard || wizard.steps.length === 0) return null;
  return (
    <ol
      className="flex w-full items-center justify-between gap-2"
      data-slot="form-stepper"
      aria-label="Form steps"
    >
      {wizard.steps.map((step, i) => {
        const active = i === wizard.currentIndex;
        const done = i < wizard.currentIndex;
        return (
          <li
            key={step.id}
            className="flex flex-1 items-center gap-2"
            data-step-active={active || undefined}
            data-step-done={done || undefined}
          >
            <button
              type="button"
              onClick={() => wizard.goTo(i)}
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full border font-medium text-sm transition-colors",
                done && "border-primary bg-primary text-primary-foreground",
                active &&
                  !done &&
                  "border-primary bg-primary-background text-primary",
                !done &&
                  !active &&
                  "border-border bg-background text-muted-foreground",
              )}
              aria-current={active ? "step" : undefined}
              aria-label={`Step ${i + 1}: ${step.label}`}
            >
              {done ? (
                <LibraryIcon name="check" className="size-4" aria-hidden />
              ) : (
                i + 1
              )}
            </button>
            <span
              className={cn(
                "min-w-0 truncate font-medium text-sm",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {step.label}
            </span>
            {i < wizard.steps.length - 1 ? (
              <span
                aria-hidden="true"
                className={cn("h-px flex-1 bg-border", done && "bg-primary")}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Submit / navigation area at the bottom of the form. Reads the
 * wizard context (if present) to decide whether to render the
 * standard Submit button OR a Back / Next pair gated by step
 * position:
 *
 *   - No wizard               → Submit button only (the original behaviour).
 *   - Wizard, !isFirst        → Back enabled.
 *   - Wizard, !isLast         → Next button shown, Submit hidden.
 *   - Wizard, isLast          → Submit shown, Next hidden.
 *
 * Lives inside the FormBuilderProvider AND any FormWizardProvider
 * the parent variant has mounted — so the wizard hook resolves
 * correctly. Single-step (non-wizard) FormBuilders pass through to
 * the original submit chrome unchanged.
 */
function FormSubmitArea({
  submitLabel,
  submitButtonVariant,
  submitButtonSize,
  submitButtonColorScheme,
  submitButtonShowArrow,
  isSubmitting,
  submitState,
}: {
  submitLabel: string;
  submitButtonVariant: string;
  submitButtonSize: string;
  submitButtonColorScheme: string;
  submitButtonShowArrow?: string | boolean;
  isSubmitting: boolean;
  submitState: "idle" | "error" | "success";
}) {
  const wizard = useFormWizard();
  const submitButton = (
    <Button
      type="submit"
      variant={submitButtonVariant as CtaButtonVariant}
      size={submitButtonSize as React.ComponentProps<typeof Button>["size"]}
      colorScheme={
        submitButtonColorScheme as React.ComponentProps<
          typeof Button
        >["colorScheme"]
      }
      showArrow={submitButtonShowArrow}
      disabled={isSubmitting}
      aria-invalid={submitState === "error" || undefined}
      aria-busy={isSubmitting || undefined}
    >
      {isSubmitting ? (
        <>
          <LibraryIcon
            name="loader-2"
            className="me-2 size-4 animate-spin"
            aria-hidden
          />
          Submitting…
        </>
      ) : (
        submitLabel
      )}
    </Button>
  );

  if (!wizard || wizard.steps.length === 0) {
    return <div className="mt-4 w-full text-center">{submitButton}</div>;
  }

  return (
    <div
      className="mt-4 flex w-full items-center justify-between gap-3"
      data-slot="form-builder-wizard-nav"
    >
      <Button
        type="button"
        variant="ghost"
        colorScheme="neutral"
        onClick={wizard.back}
        disabled={wizard.isFirst}
      >
        <LibraryIcon name="arrow-left" className="me-1 size-4" aria-hidden />
        Back
      </Button>
      {wizard.isLast ? (
        // Distinct React key from Next so React mounts a fresh DOM
        // node for Submit rather than reusing Next's <button>. Without
        // this, the click that navigated to the last step can bleed
        // onto the just-rendered submit button (same DOM element, type
        // attribute updated mid-cycle) and fire the form's submit
        // handler. The wrapping span carries the key so the inner
        // submitButton's React identity doesn't matter.
        <span key="wizard-submit">{submitButton}</span>
      ) : (
        <Button
          key="wizard-next"
          type="button"
          variant="default"
          onClick={(e) => {
            // Belt-and-suspenders. Even if React's DOM diff someday
            // reuses the button element across the Next → Submit swap,
            // this prevents the form submitting from the same click.
            e.preventDefault();
            e.stopPropagation();
            wizard.next();
          }}
        >
          Next
          <LibraryIcon name="arrow-right" className="ms-1 size-4" aria-hidden />
        </Button>
      )}
    </div>
  );
}

/**
 * Wizard variant — wraps the form body in `FormWizardProvider` so
 * descendant `form-step@1` renderings can self-register. The stepper
 * indicator itself renders INSIDE Default's form body (just below
 * the required hint), where it inherits the container's horizontal
 * centering automatically — wrapping it here would put it outside
 * the section padding and break alignment.
 */
export function Wizard(props: FormBuilderProps) {
  return (
    <FormWizardProvider>
      <Default {...props} />
    </FormWizardProvider>
  );
}

/**
 * Inline variant — strips the section padding + heading chrome so
 * the form sits inline with surrounding content (e.g. embedded in
 * an article body, "Get the whitepaper" forms). Same props as
 * Default; just defaults `useSectionWrapper` off and drops the
 * outer container padding by overriding `styles`.
 */
export function Inline(props: FormBuilderProps) {
  return (
    <Default
      {...props}
      useSectionWrapper={false}
      styles={cn("py-0", props.styles)}
    />
  );
}

/**
 * Sticky variant — pins the form to the viewport's top edge as the
 * user scrolls. Best for newsletter capture that follows the reader.
 * Wraps the Default render in a `position: sticky` container.
 */
export function Sticky(props: FormBuilderProps) {
  return (
    <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md">
      <Default {...props} />
    </div>
  );
}

/**
 * Progressive variant — shows only the first field initially,
 * expands the rest after that field has a non-empty value. Best for
 * email-first capture forms where committing to a single field
 * lowers the entry barrier; the rest of the fields reveal once the
 * user invests.
 *
 * Implementation: a wrapping div applies `[&:not([data-expanded])
 * [data-slot=form-text-field]:not(:first-of-type)]:hidden` so every
 * field after the first is hidden until the wrapper sets
 * `data-expanded`. Toggled by listening to input events on the
 * form. Keeps the field tree intact for AT — fields are display-
 * hidden, not unmounted, so screen reader users can navigate past
 * the first field if they want to.
 */
export function Progressive(props: FormBuilderProps) {
  return (
    <div
      data-slot="form-builder-progressive"
      // CSS-only expand on input — works without a single line of JS
      // by using the `:has` selector to check whether any input
      // within has a non-empty value, then revealing the hidden
      // sibling fields.
      className={cn(
        "[&:not(:has([data-slot=form-text-field]:first-of-type_input:not(:placeholder-shown)))_[data-slot^=form-]:nth-of-type(n+2)]:hidden",
      )}
    >
      <Default {...props} />
    </div>
  );
}

export default Default;

export const componentType = "universal";
