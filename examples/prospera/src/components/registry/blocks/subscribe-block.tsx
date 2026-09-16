"use client";

import type { ComponentProps, FormEvent, ReactNode } from "react";
import { useCallback, useId } from "react";
import { trailingArrow } from "@/components/registry/components/ui/cta-button";
import { Button } from "@/components/registry/primitives/core/button";
import { Card, CardContent } from "@/components/registry/primitives/core/card";
import { Checkbox } from "@/components/registry/primitives/core/checkbox";
import { Field, FieldLabel } from "@/components/registry/primitives/core/field";
import { Input } from "@/components/registry/primitives/core/input";
import { Label } from "@/components/registry/primitives/core/label";
import type { RichTextSource } from "@/components/registry/primitives/editables/richtext";
import { RichText } from "@/components/registry/primitives/editables/richtext";
import {
  getNonEmptySource,
  getSourceText,
  isRichTextSource,
  isStringSource,
} from "@/components/registry/primitives/editables/source-normalizers";
import type { TextSource } from "@/components/registry/primitives/editables/text";
import { Text } from "@/components/registry/primitives/editables/text";
import { useSubscribeSubmission } from "@/hooks/registry/use-subscribe-submission";
import { cn } from "@/lib/registry/cn";
import { isEnabled, parseButtonVariant } from "@/lib/registry/param-parsers";
import type { ComponentParams } from "@/lib/registry/sitecore";
import { FormBlock } from "./form-block";

/**
 * Render a label value as either a plain string or, when given a
 * Sitecore `TextSource`, an inline-editable `<Text>` slot. Lets
 * consumers (subscribe-section, subscription-banner) pass the raw
 * editable source through and have authors click into the label
 * directly in Pages instead of editing from the right-rail.
 *
 * `placeholder` powers the Pages EditPlaceholder stub shown when the
 * source is empty in editing mode.
 */
function renderLabel(
  value: TextSource | string | undefined,
  placeholder: string,
  fallback: string,
  isEditing: boolean | undefined,
): ReactNode {
  if (value == null) return fallback;
  if (typeof value === "string") return value || fallback;
  return (
    <Text
      value={value}
      tag="span"
      placeholder={placeholder}
      isEditing={isEditing}
    />
  );
}

/** Resolve a label-shaped prop to a plain string (for `placeholder` / `title` attrs). */
function labelAsString(
  value: TextSource | string | undefined,
  fallback: string,
): string {
  if (value == null) return fallback;
  if (typeof value === "string") return value || fallback;
  return getSourceText(value) || fallback;
}

export type SubscribeBlockLayout = "row" | "overlay" | "stacked";
export type SubscribeBlockMethod = "POST" | "GET";
export type SubscribeBlockSurface = "plain" | "card";

export interface SubscribeBlockConfig {
  submitAction: string;
  submitMethod: SubscribeBlockMethod;
  successMessage?: string;
  errorMessage?: string;
}

export interface SubscribeBlockProps extends SubscribeBlockConfig {
  layout?: SubscribeBlockLayout;
  /**
   * Surface chrome around the form. `plain` (default) renders raw;
   * `card` wraps in an elevated rounded Card — formerly the
   * NewsletterLeadCapture treatment.
   */
  surface?: SubscribeBlockSurface;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
  consentClassName?: string;
  /**
   * Email field label. Accepts either a plain string or a Sitecore
   * `TextSource` — when a source is passed, the label renders inside
   * an inline-editable `<Text>` slot and Pages authors can click into
   * it directly.
   */
  emailLabel?: TextSource | string;
  /**
   * Input placeholder text. Stays a plain string because `<input
   * placeholder>` is a native HTML attribute and can't contain
   * editable JSX. Authors edit the placeholder from the right rail.
   */
  emailPlaceholder?: TextSource | string;
  /**
   * Block submission until the email input has a value. Defaults to
   * `true` — a subscribe form without an email isn't really a
   * subscribe form, but the subscribe-section recipe surfaces the
   * toggle so authors can switch it off for double-opt-in flows
   * where the email gets captured later.
   */
  emailRequired?: boolean;
  /** Submit button label. `TextSource` enables inline editing in Pages. */
  submitLabel?: TextSource | string;
  /**
   * Submit-button axis — variant / size / colorScheme threaded
   * through to the shared CTA Button primitive. Each subscribe-
   * section placement can pick (e.g. an outline button on a
   * primary-bold form surface, or a ghost button in a sidebar
   * card). Strings rather than typed enums because they're
   * authored upstream as Sitecore param values; the CTA Button
   * accepts the broader string at runtime.
   */
  submitButtonVariant?: string;
  submitButtonSize?: string;
  submitButtonColorScheme?: string;
  /**
   * Append a trailing arrow (→) after the submit label. Accepts the
   * Sitecore checkbox string-boolean shapes. Also forced on by a
   * `submitButtonVariant` (
   * `link` + arrow).
   */
  submitButtonShowArrow?: string | boolean;
  consentText?: RichTextSource | TextSource;
  consentRequired?: boolean;
  /**
   * Render a Name input above the Email input. Submitted via `name`
   * form data. Authors that just want an email opt-in leave this off.
   */
  showName?: boolean;
  /** Name field label. `TextSource` enables inline editing in Pages. */
  nameLabel?: TextSource | string;
  /** Name input placeholder. String-only — see `emailPlaceholder`. */
  namePlaceholder?: TextSource | string;
  /**
   * Block submission until the name input has a value. Only
   * meaningful when `showName` is on. Defaults to `false` — the
   * name field is optional unless the author explicitly opts in.
   */
  nameRequired?: boolean;
  /** Fires on every Submit click, before the request goes out. */
  onSubmitAttempt?: () => void;
  /** Fires when the submission endpoint resolves OK. */
  onSubmitSuccess?: (submittedEmail?: string) => void;
  /** Fires when the endpoint returns a non-OK response or throws. */
  onSubmitError?: (message: string) => void;
  /** Fires when the consent checkbox is toggled (only when consentText is set). */
  onConsentToggle?: (accepted: boolean) => void;
  /**
   * Showcase-only: force the feedback strip into a state so previews
   * can exhibit the success / error copy without a live submission.
   * Overrides the submission hook's status for DISPLAY only — the form
   * still submits normally. Never wire this to Sitecore data.
   */
  previewStatus?: "success" | "error";
  /**
   * Pages-editing mode. Threads down to every `<Text>`-rendered label
   * (emailLabel / submitLabel / nameLabel) so authors get inline
   * EditPlaceholder stubs and click targets in Pages.
   */
  isEditing?: boolean;
}

function readParam(params: ComponentParams | undefined, key: string) {
  const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
  const value = params?.[key] ?? params?.[camelKey];
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Reads standard subscribe-block submission params from a Sitecore
 * rendering's `params` map. Used by SubscribeSection (and any other
 * Sitecore-side wrapper) to translate `params.SubmitAction` /
 * `params.SubmitMethod` etc. into the flat-prop shape SubscribeBlock
 * accepts.
 */
export function parseSubscribeBlockConfig(
  params: ComponentParams | undefined,
): SubscribeBlockConfig {
  const submitAction =
    readParam(params, "SubmitAction") || "/api/forms/subscribe";
  const rawMethod = readParam(params, "SubmitMethod").toUpperCase();
  const submitMethod: SubscribeBlockMethod =
    rawMethod === "GET" ? "GET" : "POST";
  const successMessage = readParam(params, "SuccessMessage") || undefined;
  const errorMessage = readParam(params, "ErrorMessage") || undefined;

  return {
    submitAction,
    submitMethod,
    successMessage,
    errorMessage,
  };
}

function emailInputClass(layout: SubscribeBlockLayout): string {
  // Overlay layout: at < sm the absolute submit button doesn't fit
  // alongside the input without crushing the placeholder, so we
  // collapse overlay to a stacked-style input (no end padding) and
  // restore the inline padding at `sm`.
  if (layout === "overlay") return "h-11 min-h-11 sm:pe-28 md:pe-36";
  if (layout === "stacked") return "h-11 min-h-11";
  // Row layout: `w-full` keeps the input from collapsing when the
  // parent flex container stacks at < sm; `min-w-0` lets it shrink
  // inside the flex row at `sm`+ instead of overflowing.
  return "h-11 min-h-11 w-full min-w-0 sm:flex-1";
}

function submitButtonClass(layout: SubscribeBlockLayout): string {
  if (layout === "overlay") {
    // Below `sm` the overlay layout breaks down (button would overflow
    // a narrow input), so the wrapper renders it stacked at mobile —
    // give the button the same mobile-stacked treatment as the row
    // layout, then snap it back to absolute-positioned chip at `sm`.
    return "h-11 w-full shrink-0 rounded-md text-sm sm:-translate-y-1/2 sm:absolute sm:end-2 sm:top-1/2 sm:h-10 sm:w-auto sm:px-4 sm:rtl:start-2 sm:rtl:end-auto md:end-3 md:h-10 md:px-5 md:rtl:start-3 md:rtl:end-auto";
  }
  if (layout === "stacked") return "h-12 w-full rounded-sm uppercase";
  // Row layout collapses to flex-col below `sm` (see the wrapper that
  // pairs `flex-col gap-3` with `sm:flex-row`). Make the button
  // full-width on that mobile-stacked state so it doesn't read as a
  // tiny chip under a full-width input; reset to content width at
  // `sm` so the side-by-side row reads correctly.
  return "h-11 w-full shrink-0 sm:h-10 sm:w-auto";
}

/**
 * Display state for the feedback strip. The showcase-only
 * `previewStatus` override applies while the live submission is idle —
 * a real submission always wins.
 */
function resolveFeedbackDisplay({
  status,
  message,
  previewStatus,
  successMessage,
  errorMessage,
}: {
  status: "idle" | "submitting" | "success" | "error";
  message: string;
  previewStatus?: "success" | "error";
  successMessage?: string;
  errorMessage?: string;
}): { displayStatus: string; displayMessage: string } {
  if (status !== "idle" || !previewStatus) {
    return { displayStatus: status, displayMessage: message };
  }
  const displayMessage =
    previewStatus === "success"
      ? successMessage || "Thanks for subscribing."
      : errorMessage || "Something went wrong. Please try again.";
  return { displayStatus: previewStatus, displayMessage };
}

interface SubscribeSubmissionHandlers {
  submitAction: string;
  submitMethod: SubscribeBlockMethod;
  successMessage?: string;
  errorMessage?: string;
  onSubmitAttempt?: () => void;
  onSubmitSuccess?: (submittedEmail?: string) => void;
  onSubmitError?: (message: string) => void;
  onConsentToggle?: (accepted: boolean) => void;
}

/**
 * Bundles the submission lifecycle (status, message, submit/reset) with
 * the consumer-provided event callbacks. Pulled out of the renderer so
 * the main function stays under the file's complexity ceiling.
 */
function useSubscribeBlockSubmission({
  submitAction,
  submitMethod,
  successMessage,
  errorMessage,
  onSubmitAttempt,
  onSubmitSuccess,
  onSubmitError,
  onConsentToggle,
}: SubscribeSubmissionHandlers) {
  const { status, message, submit, reset } = useSubscribeSubmission({
    action: submitAction,
    method: submitMethod,
    successMessage,
    errorMessage,
  });

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      onSubmitAttempt?.();
      const form = event.currentTarget;
      const formData = new FormData(form);
      const emailValue = String(formData.get("email") ?? "").trim();
      const consentAccepted = formData.get("consent") === "on";
      const success = await submit({ email: emailValue, consentAccepted });
      if (success) {
        form.reset();
        // Pass the submitted email so analytics can route an IDENTITY
        // event alongside the FORM_SUBMITTED — the email is the strong
        // identifier that links anonymous browser_id → known visitor.
        onSubmitSuccess?.(emailValue);
      } else {
        onSubmitError?.(message);
      }
    },
    [submit, onSubmitAttempt, onSubmitSuccess, onSubmitError, message],
  );

  const handleInput = useCallback(() => {
    if (status !== "idle") reset();
  }, [status, reset]);

  const handleConsentChange = useCallback(
    (checked: boolean | "indeterminate") => {
      onConsentToggle?.(checked === true);
    },
    [onConsentToggle],
  );

  return { status, message, handleSubmit, handleInput, handleConsentChange };
}

/** The submit button. */
function SubscribeSubmitButton({
  layout,
  status,
  submitLabel,
  submitButtonVariant,
  submitButtonSize,
  submitButtonColorScheme,
  submitButtonShowArrow,
  buttonClassName,
  isEditing,
}: {
  layout: SubscribeBlockLayout;
  status: "idle" | "submitting" | "success" | "error";
  submitLabel?: TextSource | string;
  submitButtonVariant?: string;
  submitButtonSize?: string;
  submitButtonColorScheme?: string;
  submitButtonShowArrow?: string | boolean;
  buttonClassName?: string;
  isEditing?: boolean;
}) {
  const submitVariantValue = parseButtonVariant(submitButtonVariant, "default");
  const wantsSubmitArrow = isEnabled(submitButtonShowArrow);
  return (
    <Button
      type="submit"
      variant={submitVariantValue}
      size={
        (submitButtonSize as ComponentProps<typeof Button>["size"]) ?? undefined
      }
      colorScheme={
        (submitButtonColorScheme as ComponentProps<
          typeof Button
        >["colorScheme"]) ?? undefined
      }
      disabled={status === "submitting"}
      className={cn(
        submitButtonClass(layout),
        wantsSubmitArrow && "group",
        buttonClassName,
      )}
      data-slot="subscribe-block-submit"
      data-variant={layout}
    >
      {status === "submitting" ? (
        "Submitting..."
      ) : wantsSubmitArrow ? (
        <>
          {renderLabel(submitLabel, "Submit", "Subscribe", isEditing)}
          {trailingArrow()}
        </>
      ) : (
        renderLabel(submitLabel, "Submit", "Subscribe", isEditing)
      )}
    </Button>
  );
}

/**
 * Reusable subscribe form primitive — email + submit, optional consent,
 * optional name, optional card surface. Three layouts (row / overlay /
 * stacked). Consumers handle the section/heading chrome themselves
 * (see SubscribeSection for the Sitecore-authorable wrapper).
 *
 * The form state + POST live here; CDP analytics live on the consuming
 * wrapper (SubscribeSection) via the optional `onSubmitAttempt` /
 * `onSubmitSuccess` / `onSubmitError` / `onConsentToggle` callbacks.
 */
export function SubscribeBlock({
  submitAction,
  submitMethod,
  successMessage,
  errorMessage,
  layout = "row",
  surface = "plain",
  className,
  inputClassName,
  buttonClassName,
  consentClassName,
  emailLabel,
  emailPlaceholder,
  emailRequired = true,
  submitLabel,
  submitButtonVariant,
  submitButtonSize,
  submitButtonColorScheme,
  submitButtonShowArrow,
  consentText,
  consentRequired = false,
  showName = false,
  nameLabel,
  namePlaceholder,
  nameRequired = false,
  onSubmitAttempt,
  onSubmitSuccess,
  onSubmitError,
  onConsentToggle,
  previewStatus,
  isEditing,
}: SubscribeBlockProps) {
  const formId = useId();
  const nameInputId = `${formId}-name`;
  const emailId = `${formId}-email`;
  const consentId = `${formId}-consent`;

  const { status, message, handleSubmit, handleInput, handleConsentChange } =
    useSubscribeBlockSubmission({
      submitAction,
      submitMethod,
      successMessage,
      errorMessage,
      onSubmitAttempt,
      onSubmitSuccess,
      onSubmitError,
      onConsentToggle,
    });

  const normalizedConsent = getNonEmptySource(consentText);

  const { displayStatus, displayMessage } = resolveFeedbackDisplay({
    status,
    message,
    previewStatus,
    successMessage,
    errorMessage,
  });

  const emailPlaceholderText = labelAsString(
    emailPlaceholder,
    "Enter your email",
  );
  const namePlaceholderText = labelAsString(namePlaceholder, "Your name");

  const inputEl = (
    <Input
      id={emailId}
      name="email"
      type="email"
      inputMode="email"
      autoComplete="email"
      required={emailRequired}
      placeholder={emailPlaceholderText}
      className={cn(emailInputClass(layout), inputClassName)}
      data-component="subscribe-block-input"
      data-variant={layout}
      // Auto-capture FORM_SUBMIT routes this value into the top-level
      // `email` field of the IDENTITY event payload — the email role
      // is the strongest CDP identifier and triggers identity
      // resolution server-side.
      data-cdp-field-role="email"
    />
  );

  const submitEl = (
    <SubscribeSubmitButton
      layout={layout}
      status={status}
      submitLabel={submitLabel}
      submitButtonVariant={submitButtonVariant}
      submitButtonSize={submitButtonSize}
      submitButtonColorScheme={submitButtonColorScheme}
      submitButtonShowArrow={submitButtonShowArrow}
      buttonClassName={buttonClassName}
      isEditing={isEditing}
    />
  );

  const body = (
    <FormBlock
      className={cn(surface === "plain" ? className : undefined)}
      action={submitAction}
      method={submitMethod}
      noValidate
      onSubmit={handleSubmit}
      onInput={handleInput}
      dir="inherit"
      // Subscribe forms have fixed semantic dimensions — a subscription
      // is always a loyalty-stage commit-level action that establishes
      // identity. OOTB Sitecore CDP's FORM_SUBMIT auto-capture reads
      // these data attributes as payload so SitecoreAI Personalize can
      // score affinity + segment without us emitting a wrapper event.
      data-cdp-form-intent="loyalty"
      data-cdp-form-commitment="commit"
      data-cdp-emits-identity="true"
    >
      {showName ? (
        <Field className="mb-3 gap-1">
          {/* `text-muted-foreground` (not the primitive's page-tuned
              `text-neutral`): both the `surface-invert` (bold/dark
              fills, scrimmed photos) and `surface-tinted` (soft role
              tints) remaps re-derive it, so the label follows whatever
              surface the consuming section paints — per the color-roles
              contract. */}
          <FieldLabel htmlFor={nameInputId} className="text-muted-foreground">
            {renderLabel(nameLabel, "Name label", "Name", isEditing)}
          </FieldLabel>
          <Input
            id={nameInputId}
            name="name"
            type="text"
            autoComplete="name"
            required={nameRequired}
            placeholder={namePlaceholderText}
            className={cn("h-11 min-h-11 w-full min-w-0", inputClassName)}
            data-component="subscribe-block-name"
          />
        </Field>
      ) : null}

      <Field className="gap-1">
        {/* Surface-following label color — see the name-field note. */}
        <FieldLabel htmlFor={emailId} className="text-muted-foreground">
          {renderLabel(emailLabel, "Email label", "Email address", isEditing)}
        </FieldLabel>

        {layout === "overlay" ? (
          // Overlay layout: stacked column at mobile (< sm) so the
          // submit button stays full-width and tappable; flips to a
          // `relative` parent at `sm`+ so the button can absolutely
          // position inside the input. The button class itself owns
          // the absolute/static breakpoint via `sm:absolute`.
          <div
            className="flex flex-col gap-3 sm:relative sm:block"
            dir="inherit"
          >
            {inputEl}
            {submitEl}
          </div>
        ) : layout === "stacked" ? (
          <div className="space-y-3">
            {inputEl}
            {submitEl}
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {inputEl}
            {submitEl}
          </div>
        )}
      </Field>

      {normalizedConsent && (
        <div className={cn("mt-4 flex items-start gap-3", consentClassName)}>
          <Checkbox
            id={consentId}
            name="consent"
            required={consentRequired}
            onCheckedChange={handleConsentChange}
            data-slot="subscribe-block-checkbox"
          />
          <Label
            htmlFor={consentId}
            // Surface-following label color — see the name-field note.
            className="wrap-break-word min-w-0 text-muted-foreground"
            data-slot="subscribe-block-consent"
          >
            {isStringSource(normalizedConsent) ? (
              <p>{normalizedConsent}</p>
            ) : isRichTextSource(normalizedConsent) ? (
              <RichText value={normalizedConsent} />
            ) : null}
          </Label>
        </div>
      )}

      <p
        className={cn(
          displayStatus === "idle" ? "sr-only" : "wrap-break-word mt-3 text-sm",
          displayStatus === "error"
            ? "text-destructive"
            : "text-muted-foreground",
        )}
        aria-live="polite"
        aria-atomic="true"
        data-slot="subscribe-block-feedback"
      >
        {displayStatus === "idle" ? "" : displayMessage}
      </p>
    </FormBlock>
  );

  if (surface === "card") {
    return (
      <Card
        elevation="sm"
        padding="md"
        // Radius stays with the Card primitive's `--card-radius` token.
        className={cn("gap-6", className)}
        data-slot="subscribe-block-card"
      >
        <CardContent className="p-0">{body}</CardContent>
      </Card>
    );
  }

  return body;
}

// Default export so the Sitecore Content SDK's component-map lookup
// (`component.default || component.Default || component`) resolves to
// the React component instead of falling through to the entire module
// namespace, which would break RSC serialization when the rendering is
// placed in a placeholder.
export default SubscribeBlock;

/** Sitecore default variant lookup target. */
export const Default = SubscribeBlock;
