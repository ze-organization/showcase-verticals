"use client";

// Self-register this component's CDP events into the runtime catalog.
// See `@/lib/registry/analytics/cdp-events` for the push-based
// registration rationale.
import { registerCdpRecipe } from "@/lib/registry/analytics/cdp-events";
import subscribeSectionRecipe from "@/recipes/subscribe-section.recipe";

registerCdpRecipe(subscribeSectionRecipe);

import { type RefObject, useCallback, useEffect, useMemo, useRef } from "react";
import {
  FORM_INPUT_STYLE_CLASSES,
  parseFormInputStyle,
} from "@/components/registry/blocks/form-field-shell";
import { SubscribeBlock } from "@/components/registry/blocks/subscribe-block";
import { TextOrRichText } from "@/components/registry/blocks/text-or-rich-text";
import {
  parseHeadingAnimation,
  parseHeadingLayout,
  parseHeadingSize,
  SectionWrapper,
} from "@/components/registry/components/layout/section-wrapper";
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
import type { CmsProps } from "@/lib/registry/sitecore";

/**
 * Sitecore field shape for SubscribeSection. Mirrors the recipe's
 * `fields:` block — submit endpoint + verb + per-field validation
 * live on the datasource (editorial data), not the rendering params.
 */
export interface SubscribeSectionFields {
  Title?: TextSource;
  Description?: RichTextSource;
  NameLabel?: TextSource;
  NamePlaceholder?: TextSource;
  NameRequired?: string | boolean;
  EmailLabel?: TextSource;
  EmailPlaceholder?: TextSource;
  EmailRequired?: string | boolean;
  ConsentText?: RichTextSource;
  ConsentRequired?: string | boolean;
  SubmitText?: TextSource;
  SuccessMessage?: TextSource;
  ErrorMessage?: TextSource;
  SubmitAction?: TextSource;
  SubmitMethod?: TextSource;
}

export interface SubscribeSectionAnalyticsMeta {
  id?: string;
  instanceKey?: string;
  instanceScope?: "site" | "page";
  title?: string;
  subscribeButtonLayout?: "row" | "overlay" | "stacked";
  surface?: "plain" | "card";
  colorScheme?: string;
  /** Error captured from the submission endpoint. Only on `submit-error`. */
  error?: string;
  /** Consent state at the time of fire. Only on `consent-toggle`. */
  consentAccepted?: boolean;
  /** Set on `form-viewed` / `form-submitted`. Routed to the SDK's form()
   *  function as the formId argument. */
  formId?: string;
  /** Set on `identity`. Routed to the SDK's identity() function as the
   *  email top-level field. */
  email?: string;
  /** Set on `identity`. Routed to the SDK's identity() function as the
   *  identifiers array (typically empty for subscribe-form identity). */
  identifiers?: Array<{ id: string; provider: string }>;
}

export interface SubscribeSectionProps extends CmsProps {
  title?: TextSource;
  description?: RichTextSource;
  nameLabel?: TextSource;
  namePlaceholder?: TextSource;
  nameRequired?: string | boolean;
  emailLabel?: TextSource;
  emailPlaceholder?: TextSource;
  emailRequired?: string | boolean;
  consentText?: RichTextSource;
  consentRequired?: string | boolean;
  submitText?: TextSource;
  successMessage?: TextSource;
  errorMessage?: TextSource;
  // Submission endpoint + verb come from the recipe's fields now —
  // delivered as Sitecore `Field<string>` shape; `getSourceText`
  // normalises to a plain string.
  submitAction?: TextSource;
  submitMethod?: TextSource;
  // SectionWrapper vocabulary — mirrors accordion-block + form-builder.
  useSectionWrapper?: string | boolean;
  headingLayout?: string;
  headingAnimation?: string;
  headingSize?: string;
  /** Gap between heading + form + feedback strip. Backed by `gap@1`. */
  gap?: "none" | "sm" | "md" | "lg" | "xl";
  /** Form-level color scheme (drives surface bg + text + input chrome). */
  formColorScheme?: string;
  formBackgroundIntensity?: "default" | "subtle" | "bold";
  /**
   * Visual treatment for the input chrome — `outline` (default) or
   * `underline`. Mirrors form-builder's `formInputStyle`.
   */
  formInputStyle?: string;
  /** Plain section surface or elevated card. */
  surface?: "plain" | "card";
  /** Renamed from `layout`. Drives button placement relative to the input. */
  subscribeButtonLayout?: "row" | "overlay" | "stacked";
  /** Submit button axis — variant / size / colorScheme / arrow. */
  submitButtonVariant?: string;
  submitButtonSize?: string;
  submitButtonColorScheme?: string;
  /** Append a trailing arrow (→) after the submit label (checkbox param). */
  submitButtonShowArrow?: string | boolean;
  instanceKey?: string;
  instanceScope?: "site" | "page";
  trackEvents?: string | boolean;
  onView?: (meta: SubscribeSectionAnalyticsMeta) => void;
  onSubmitAttempt?: (meta: SubscribeSectionAnalyticsMeta) => void;
  onSubmitSuccess?: (meta: SubscribeSectionAnalyticsMeta) => void;
  onSubmitError?: (meta: SubscribeSectionAnalyticsMeta) => void;
  onConsentToggle?: (meta: SubscribeSectionAnalyticsMeta) => void;
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

// Form surface treatment per `formColorScheme` + `formBackgroundIntensity`.
// Mirrors form-builder.tsx's FORM_*_BG_CLASSES — duplicated rather than
// extracted so the form-builder + subscribe-section files stay
// independently editable; the maps haven't diverged in practice yet but
// extracting a shared module would tightly couple two largely separate
// components. If a third subscribe-style component lands, lift this
// into `forms/form-surface.ts` then.
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

const resolveFormSurfaceClass = (
  scheme: FormColorScheme,
  intensity: NonNullable<SubscribeSectionProps["formBackgroundIntensity"]>,
): string => {
  if (intensity === "bold") {
    return FORM_BOLD_BG_CLASSES[scheme] ?? FORM_SUBTLE_BG_CLASSES[scheme];
  }
  return FORM_SUBTLE_BG_CLASSES[scheme];
};

const GAP_CLASSES: Record<NonNullable<SubscribeSectionProps["gap"]>, string> = {
  none: "gap-0",
  sm: "gap-2",
  md: "gap-6",
  lg: "gap-8",
  xl: "gap-12",
};

interface UseSubscribeSectionAnalyticsArgs {
  meta: SubscribeSectionAnalyticsMeta;
  eventsEnabled: boolean;
  isEditing?: boolean;
  rootRef: RefObject<HTMLElement | null>;
  onView?: (meta: SubscribeSectionAnalyticsMeta) => void;
  onSubmitAttempt?: (meta: SubscribeSectionAnalyticsMeta) => void;
  onSubmitSuccess?: (meta: SubscribeSectionAnalyticsMeta) => void;
  onSubmitError?: (meta: SubscribeSectionAnalyticsMeta) => void;
  onConsentToggle?: (meta: SubscribeSectionAnalyticsMeta) => void;
}

function useSubscribeSectionAnalytics({
  meta,
  eventsEnabled,
  isEditing,
  rootRef,
  onView,
  onSubmitAttempt,
  onSubmitSuccess,
  onSubmitError,
  onConsentToggle,
}: UseSubscribeSectionAnalyticsArgs) {
  const analytics =
    useComponentAnalytics<SubscribeSectionAnalyticsMeta>("subscribe-section");
  const hasFiredViewRef = useRef(false);

  // Catalog fires routed through the Content SDK:
  //   view           → pageView()
  //   form-viewed    → form(formId, 'VIEWED', instanceId)
  //   form-submitted → form(formId, 'SUBMITTED', instanceId)
  //   identity       → identity({email}) — fires alongside form-submitted
  //                    so the visitor's browser_id is linked to the
  //                    captured email at the wire.
  //   submit-error   → event() (CUSTOM)
  //   consent-toggle → event() (CUSTOM)
  //
  // Consumer-side on* callbacks stay as a component API.
  const fireView = useCallback(() => {
    if (onView) onView(meta);
    if (eventsEnabled) {
      analytics.fire("view", meta);
      analytics.fire("form-viewed", {
        ...meta,
        formId: `subscribe-section.${meta.instanceKey ?? meta.id ?? "default"}`,
      });
    }
  }, [analytics, eventsEnabled, meta, onView]);

  const fireAttempt = useCallback(() => {
    if (onSubmitAttempt) onSubmitAttempt(meta);
  }, [meta, onSubmitAttempt]);

  const fireSuccess = useCallback(
    (submittedEmail?: string) => {
      if (onSubmitSuccess) onSubmitSuccess(meta);
      if (eventsEnabled) {
        analytics.fire("form-submitted", {
          ...meta,
          formId: `subscribe-section.${meta.instanceKey ?? meta.id ?? "default"}`,
        });
        if (submittedEmail) {
          analytics.fire("identity", {
            ...meta,
            email: submittedEmail,
            identifiers: [],
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

  const fireConsentToggle = useCallback(
    (consentAccepted: boolean) => {
      const payload = { ...meta, consentAccepted };
      if (onConsentToggle) onConsentToggle(payload);
      else if (eventsEnabled) analytics.fire("consent-toggle", payload);
    },
    [analytics, eventsEnabled, meta, onConsentToggle],
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

  return { fireAttempt, fireSuccess, fireError, fireConsentToggle };
}

/**
 * Sitecore-authorable section that wraps a SubscribeBlock in the
 * shared `SectionWrapper` shell so it carries the same heading +
 * width vocabulary as Accordion Block / Form Builder. CDP analytics
 * surface (`view` / `submit-attempt` / `submit-success` /
 * `submit-error` / `consent-toggle`) is unchanged.
 */
export function Default({
  title,
  description,
  nameLabel,
  namePlaceholder,
  nameRequired,
  emailLabel,
  emailPlaceholder,
  emailRequired,
  consentText,
  consentRequired,
  submitText,
  successMessage,
  errorMessage,
  submitAction,
  submitMethod,
  useSectionWrapper,
  headingLayout,
  headingAnimation,
  headingSize,
  gap = "md",
  formColorScheme = "default",
  formBackgroundIntensity = "subtle",
  formInputStyle = "outline",
  surface = "plain",
  subscribeButtonLayout = "overlay",
  submitButtonVariant = "default",
  submitButtonSize = "default",
  submitButtonColorScheme = "primary",
  submitButtonShowArrow,
  instanceKey,
  instanceScope = "site",
  trackEvents,
  styles,
  id,
  isEditing,
  onView,
  onSubmitAttempt,
  onSubmitSuccess,
  onSubmitError,
  onConsentToggle,
}: SubscribeSectionProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const layout = parseHeadingLayout(
    headingLayout,
    "start-with-section-divider",
  );
  const animation = parseHeadingAnimation(headingAnimation, "none");
  const size = parseHeadingSize(headingSize, "default");

  const eventsEnabled = isEnabled(trackEvents);
  // Validation contracts live on fields now (Sitecore Field<string>
  // shape, coerced via isEnabled's permissive value handling).
  const consentMustAccept = isEnabled(consentRequired);
  const nameMustAccept = isEnabled(nameRequired);
  const emailMustAccept = isEnabled(emailRequired ?? true);
  const hasConsentText = consentText != null && !isEmptySource(consentText);
  const hasNameCopy =
    (nameLabel != null && !isEmptySource(nameLabel)) ||
    (namePlaceholder != null && !isEmptySource(namePlaceholder));
  const nameEnabled = hasNameCopy;
  const consentEnabled = hasConsentText;

  // Always-rendered generic chrome (submit button, email label +
  // placeholder, status messages) resolves author field → core-ui-labels
  // dictionary phrase → English net. The recipe ships these fields with
  // no Standard Value so a blank field falls through to the localized
  // dictionary default. The Name / Consent copy stays authored-only: it's
  // presence-gated ("leave blank to omit the field"), so it keeps its
  // Standard Value and is NOT routed through the dictionary — an
  // always-on dictionary default would break the omit-when-blank contract.
  const t = useDictionaryTranslate();
  const submitLabel = resolveChromeText(
    getSourceText(submitText),
    FORM_CHROME.subscribe.key,
    FORM_CHROME.subscribe.en,
    t,
  );
  const successText = resolveChromeText(
    getSourceText(successMessage),
    FORM_CHROME.subscribeSuccess.key,
    FORM_CHROME.subscribeSuccess.en,
    t,
  );
  const errorText = resolveChromeText(
    getSourceText(errorMessage),
    FORM_CHROME.error.key,
    FORM_CHROME.error.en,
    t,
  );
  const nameLabelText = getSourceText(nameLabel) || "Name";
  const namePlaceholderText = getSourceText(namePlaceholder) || "Your name";
  const emailLabelText = resolveChromeText(
    getSourceText(emailLabel),
    FORM_CHROME.emailLabel.key,
    FORM_CHROME.emailLabel.en,
    t,
  );
  const emailPlaceholderText = resolveChromeText(
    getSourceText(emailPlaceholder),
    FORM_CHROME.emailPlaceholder.key,
    FORM_CHROME.emailPlaceholder.en,
    t,
  );
  // Submit endpoint + verb come from fields now.
  const submitActionUrl = getSourceText(submitAction) || "/api/forms/subscribe";
  const submitMethodVerb = ((): "POST" | "GET" => {
    const raw = getSourceText(submitMethod)?.trim().toUpperCase();
    return raw === "GET" ? "GET" : "POST";
  })();

  const meta = useMemo<SubscribeSectionAnalyticsMeta>(() => {
    const titleText = getSourceText(title);
    return {
      id,
      instanceKey: instanceKey || titleText || id,
      instanceScope,
      title: titleText,
      subscribeButtonLayout,
      surface,
      colorScheme: formColorScheme,
    };
  }, [
    id,
    instanceKey,
    instanceScope,
    title,
    subscribeButtonLayout,
    surface,
    formColorScheme,
  ]);

  const { fireAttempt, fireSuccess, fireError, fireConsentToggle } =
    useSubscribeSectionAnalytics({
      meta,
      eventsEnabled,
      isEditing,
      rootRef,
      onView,
      onSubmitAttempt,
      onSubmitSuccess,
      onSubmitError,
      onConsentToggle,
    });

  // Pass the rich-text consent value through verbatim when consent is
  // on; SubscribeBlock handles both rich-text and plain-string sources.
  const consentValue = consentEnabled ? consentText : undefined;
  // Resolve the form surface class once. Bold + brand scheme applies a
  // pure brand bg, inverted text, and retones the input chrome via
  // CSS variables that the Input primitive reads. Same pattern as
  // form-builder.
  const formSurfaceClass = resolveFormSurfaceClass(
    formColorScheme as FormColorScheme,
    formBackgroundIntensity,
  );

  return (
    <section
      ref={rootRef}
      className={cn(
        "component subscribe-section group py-10 md:py-14",
        formSurfaceClass,
        FORM_INPUT_STYLE_CLASSES[parseFormInputStyle(formInputStyle)],
        styles ?? "",
      )}
      data-slot="subscribe-section"
      data-layout={subscribeButtonLayout}
      data-surface={surface}
      data-color-scheme={formColorScheme}
      data-color-intensity={formBackgroundIntensity}
      data-input-style={parseFormInputStyle(formInputStyle)}
      id={id || undefined}
    >
      <div className="container mx-auto max-w-4xl px-4 md:max-w-5xl md:px-10">
        <SectionWrapper
          title={title}
          layout={layout}
          headingOptions={{ animation, size }}
          useSectionWrapper={useSectionWrapper}
        >
          {description && !isEmptySource(description) ? (
            <div
              className="mb-6 max-w-prose [&_p]:mb-2"
              data-slot="subscribe-section-description"
            >
              <TextOrRichText value={description} />
            </div>
          ) : null}
          <div className={cn("flex flex-col", GAP_CLASSES[gap])}>
            <SubscribeBlock
              submitAction={submitActionUrl}
              submitMethod={submitMethodVerb}
              successMessage={successText}
              errorMessage={errorText}
              layout={subscribeButtonLayout}
              surface={surface}
              className="w-full md:max-w-lg"
              emailLabel={emailLabelText}
              emailPlaceholder={emailPlaceholderText}
              emailRequired={emailMustAccept}
              submitLabel={submitLabel}
              submitButtonVariant={submitButtonVariant}
              submitButtonSize={submitButtonSize}
              submitButtonColorScheme={submitButtonColorScheme}
              submitButtonShowArrow={submitButtonShowArrow}
              showName={nameEnabled}
              nameLabel={nameLabelText}
              namePlaceholder={namePlaceholderText}
              nameRequired={nameMustAccept}
              consentText={consentValue}
              consentRequired={consentMustAccept}
              onSubmitAttempt={fireAttempt}
              onSubmitSuccess={fireSuccess}
              onSubmitError={fireError}
              onConsentToggle={fireConsentToggle}
            />
          </div>
        </SectionWrapper>
      </div>
    </section>
  );
}

/** SDK variant-lookup target. */
export const SubscribeSection = Default;

export default Default;

export const componentType = "universal";
