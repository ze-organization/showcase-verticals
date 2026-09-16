"use client";

/**
 * Subscription banner — title, description, email input, and submit
 * action. Full-width banner-shaped surface; the prose-width form
 * companion lives on `subscribe-section@1`.
 */
import { registerCdpRecipe } from "@/lib/registry/analytics/cdp-events";
import subscriptionBannerRecipe from "@/recipes/subscription-banner.recipe";

registerCdpRecipe(subscriptionBannerRecipe);

import { useCallback, useId } from "react";
import { SubscribeBlock } from "@/components/registry/blocks/subscribe-block";
import { TextOrRichText } from "@/components/registry/blocks/text-or-rich-text";
import { TypographyH2 } from "@/components/registry/primitives/core/typography";
import type { ImageSource } from "@/components/registry/primitives/editables/image";
import type { RichTextSource } from "@/components/registry/primitives/editables/richtext";
import {
  getNonEmptySource,
  getSourceText,
} from "@/components/registry/primitives/editables/source-normalizers";
import {
  Text,
  type TextSource,
} from "@/components/registry/primitives/editables/text";
import { useSectionAnalytics } from "@/lib/registry/analytics/use-section-analytics";
import { cn } from "@/lib/registry/cn";
import {
  FORM_CHROME,
  resolveChromeSource,
  resolveChromeText,
  useDictionaryTranslate,
} from "@/lib/registry/forms/form-chrome";
import { isEnabled, parseAlignment } from "@/lib/registry/param-parsers";
import {
  hasSectionBackgroundImage,
  parseSectionBackgroundPosition,
  parseSectionBackgroundScrim,
  SectionBackground,
  sectionBackgroundToneClass,
} from "@/lib/registry/section-background";
import {
  isInvertedSurface,
  parseSectionBackgroundIntensity,
  parseSectionColorScheme,
  resolveSectionSurfaceClass,
  type SectionBackgroundIntensity,
  type SectionColorScheme,
} from "@/lib/registry/section-surface";
import type { CmsProps } from "@/lib/registry/sitecore";

/** Meta for SubscriptionBanner analytics events. */
export interface SubscriptionBannerAnalyticsMeta {
  id?: string;
  instanceKey?: string;
  instanceScope?: "site" | "page";
  variant?: string;
  /** Set on `submit-error`. */
  error?: string;
  /** Set on `form-viewed` / `form-submitted`. SDK form() formId. */
  formId?: string;
  /** Set on `identity`. SDK identity() email field. */
  email?: string;
  /** Set on `identity`. SDK identity() identifiers array. */
  identifiers?: Array<{ id: string; provider: string }>;
}

// Form surface treatment — built on the shared section-surface
// vocabulary (`resolveSectionSurfaceClass`) instead of a hand-rolled
// map so the banner can't drift from section-wrapper / listing-section:
// bold + dark + gradient fills automatically carry the `surface-invert`
// token remap (labels, muted text, input chrome, borders re-tone
// against the fill), and the soft `*-background` tints carry the
// `surface-tinted` remap so labels + hairlines harmonize with the tint
// (see .claude/skills/color-roles — "Muted on a colored surface").

// Input chrome on inverted (bold / dark / gradient) fills. Derives from
// `--surface-on` (set by the surface-invert remap) rather than a
// hard-coded white so a pale bold fill (e.g. a light warning yellow
// with a near-black foreground) gets dark input chrome.
const INVERTED_INPUT_CHROME =
  "[--input-background:color-mix(in_srgb,var(--surface-on)_14%,transparent)] [--input-border:currentColor]";

// Soft-tint remap per scheme. Concrete strings (not templated) — see the
// color-roles skill's Tailwind-scanner warning about placeholder `<X>`
// inside arbitrary-value candidates.
const FORM_TINT_REMAP: Partial<Record<SectionColorScheme, string>> = {
  primary: "surface-tinted [--surface-tint:var(--color-primary)]",
  secondary: "surface-tinted [--surface-tint:var(--color-secondary)]",
  tertiary: "surface-tinted [--surface-tint:var(--color-tertiary)]",
  accent: "surface-tinted [--surface-tint:var(--color-accent)]",
  "accent-2": "surface-tinted [--surface-tint:var(--color-accent-2)]",
  "accent-3": "surface-tinted [--surface-tint:var(--color-accent-3)]",
  info: "surface-tinted [--surface-tint:var(--color-info)]",
  success: "surface-tinted [--surface-tint:var(--color-success)]",
  warning: "surface-tinted [--surface-tint:var(--color-warning)]",
  destructive: "surface-tinted [--surface-tint:var(--color-destructive)]",
};

// Inline-axis gradients flip under RTL so the readable start-color
// stays anchored to inline-start. Matches the callout-card + hero-
// overlay RTL policy (the shared map ships the LTR direction only).
const GRADIENT_RTL_FLIP: Partial<Record<SectionColorScheme, string>> = {
  "primary-gradient": "rtl:bg-gradient-to-bl",
  "secondary-gradient": "rtl:bg-gradient-to-bl",
};

function resolveBannerFormSurfaceClass(
  scheme: SectionColorScheme,
  intensity: SectionBackgroundIntensity,
): string {
  const surface = resolveSectionSurfaceClass(scheme, intensity);
  if (!surface) return "";
  if (isInvertedSurface(scheme, intensity)) {
    return cn(surface, GRADIENT_RTL_FLIP[scheme], INVERTED_INPUT_CHROME);
  }
  return cn(surface, FORM_TINT_REMAP[scheme]);
}

// FormColorScheme must reach the form chrome even when a background
// image owns the banner surface — otherwise the param reads as a dead
// knob (the pre-2026-07 bug). Two touchpoints:
//   1. the input focus ring re-tints to the scheme, and
//   2. the submit button follows the scheme (solid `bg-<X>` +
//      `text-<X>-foreground` pairing via the Button primitive) whenever
//      the author left `SubmitButtonColorScheme` at its `primary`
//      default. An explicit non-default button scheme always wins.
const FORM_SCHEME_FOCUS_RING: Partial<Record<SectionColorScheme, string>> = {
  secondary:
    "focus:border-secondary focus:ring-secondary focus-visible:border-secondary",
  "secondary-gradient":
    "focus:border-secondary focus:ring-secondary focus-visible:border-secondary",
  tertiary:
    "focus:border-tertiary focus:ring-tertiary focus-visible:border-tertiary",
  accent: "focus:border-accent focus:ring-accent focus-visible:border-accent",
  "accent-2":
    "focus:border-accent-2 focus:ring-accent-2 focus-visible:border-accent-2",
  "accent-3":
    "focus:border-accent-3 focus:ring-accent-3 focus-visible:border-accent-3",
  info: "focus:border-info focus:ring-info focus-visible:border-info",
  success:
    "focus:border-success focus:ring-success focus-visible:border-success",
  warning:
    "focus:border-warning focus:ring-warning focus-visible:border-warning",
  destructive:
    "focus:border-destructive focus:ring-destructive focus-visible:border-destructive",
};

// Schemes the submit button may follow. `primary` is the button's own
// default (following would be a no-op); `default`/`none`/`white`/
// `black`/`neutral` aren't CTA colors.
const BUTTON_FOLLOW_SCHEMES: ReadonlySet<SectionColorScheme> = new Set([
  "secondary",
  "secondary-gradient",
  "primary-gradient",
  "tertiary",
  "accent",
  "accent-2",
  "accent-3",
  "info",
  "success",
  "warning",
  "destructive",
]);

/**
 * How `FormColorScheme` reaches the form chrome (submit button + input
 * focus ring). The submit button follows the form scheme (solid role
 * pairing) when the author left `SubmitButtonColorScheme` at its
 * `primary` default — except on bold image-less fills, where the button
 * would dissolve into its own bold surface. The focus ring re-tints
 * wherever it stays visible (skipped on inverted image-less fills,
 * where the inverted input chrome carries affordance instead).
 */
function resolveFormChromeFollow({
  formScheme,
  formIntensity,
  hasBackgroundImage,
  submitButtonColorScheme,
}: {
  formScheme: SectionColorScheme;
  formIntensity: SectionBackgroundIntensity;
  hasBackgroundImage: boolean;
  submitButtonColorScheme: string | undefined;
}): { effectiveSubmitScheme: string | undefined; focusRingClass?: string } {
  const authored = submitButtonColorScheme?.trim().toLowerCase();
  const buttonFollowsForm =
    (!authored || authored === "primary") &&
    BUTTON_FOLLOW_SCHEMES.has(formScheme) &&
    (hasBackgroundImage || formIntensity !== "bold");
  const focusRingClass =
    hasBackgroundImage || !isInvertedSurface(formScheme, formIntensity)
      ? FORM_SCHEME_FOCUS_RING[formScheme]
      : undefined;
  return {
    effectiveSubmitScheme: buttonFollowsForm
      ? formScheme
      : submitButtonColorScheme,
    focusRingClass,
  };
}

/**
 * Flat props delivered by `withSitecore`'s default convention. Mirrors
 * `subscription-banner.recipe.ts` — every field becomes a top-level
 * camelCased prop (e.g. `fields.NameLabel` → `nameLabel`), every
 * param likewise (`params.FormColorScheme` → `formColorScheme`).
 *
 * Surface treatment is expressed via the submit-button axis
 * (`SubmitButtonVariant/Size/ColorScheme`) plus `FormColorScheme` /
 * `FormBackgroundIntensity`.
 */
export interface SubscriptionBannerProps extends CmsProps {
  // Content
  title?: TextSource;
  description?: RichTextSource | TextSource;
  image?: ImageSource;
  /** Blur the background image behind the scrim layer (frosted overlay). */
  blurBackground?: string | boolean;
  /**
   * Scrim over the background image — `dark` (default) dims the photo
   * and flips the copy to white (`surface-invert` remap), `light`
   * washes it and flips the copy to black, `none` leaves both the image
   * and the text tone untreated. No effect without a background image.
   */
  backgroundScrim?: string;
  /** Crop anchor of the background image — `center` / `top` / `bottom`. */
  backgroundPosition?: string;
  // Status
  successMessage?: TextSource;
  errorMessage?: TextSource;
  // Name field (optional second input)
  nameLabel?: TextSource;
  namePlaceholder?: TextSource;
  nameRequired?: TextSource | string | boolean;
  // Email field
  emailLabel?: TextSource;
  emailPlaceholder?: TextSource;
  emailRequired?: TextSource | string | boolean;
  // Consent
  consentText?: RichTextSource | TextSource;
  consentRequired?: TextSource | string | boolean;
  // Submission
  submitText?: TextSource;
  submitAction?: TextSource;
  submitMethod?: TextSource;
  // Style — form surface
  formColorScheme?: string;
  formBackgroundIntensity?: string;
  // Submit button axis
  submitButtonVariant?: string;
  submitButtonSize?: string;
  submitButtonColorScheme?: string;
  /** Append a trailing arrow (→) after the submit label (checkbox param). */
  submitButtonShowArrow?: string | boolean;
  // Layout
  subscribeButtonLayout?: string;
  /** Inline-axis alignment of the title, description, and form. */
  alignment?: string;
  /** Title scale token from `heading-size@1`. */
  titleSize?: string;
  /**
   * Render THE horizontal rule between the heading region and the form.
   * Single-source: the title's built-in `TypographyH2` underline is
   * suppressed unconditionally, so this toggle controls the only rule
   * the banner ever draws (pre-2026-07 it added a second one).
   */
  showSeparator?: string | boolean;
  // Analytics
  instanceKey?: string;
  instanceScope?: "site" | "page";
  trackEvents?: string | boolean;
  /**
   * Showcase-only: force the subscribe feedback strip into a state so
   * previews can exhibit the Success / Error messages without a live
   * submission. Never authored from Sitecore.
   */
  previewStatus?: "success" | "error";
}

/**
 * Boolean-y props accept boolean OR string OR TextSource. Unwrap the
 * TextSource shape and let `isEnabled` handle boolean + string.
 */
const toBoolish = (
  value: TextSource | string | boolean | undefined,
): string | boolean | undefined =>
  typeof value === "boolean" || typeof value === "string" || value === undefined
    ? value
    : getSourceText(value);

const parseSubscribeLayout = (
  value: string | undefined,
): "row" | "stacked" | "overlay" => {
  const raw = value?.trim().toLowerCase();
  return raw === "stacked" || raw === "overlay" || raw === "row" ? raw : "row";
};

const parseSubmitMethod = (value: string | undefined): "POST" | "GET" => {
  const normalized = (value || "POST").trim().toUpperCase();
  return normalized === "GET" ? "GET" : "POST";
};

const titleSizeClass = (value: string | undefined): string => {
  const raw = value?.trim().toLowerCase();
  if (raw === "text-banner")
    return "font-normal text-3xl tracking-tight sm:text-4xl md:text-5xl lg:text-6xl";
  // `xl` — strong headline block; weight defers to `--heading-weight`.
  if (raw === "xl") return "text-3xl tracking-tight sm:text-4xl md:text-5xl";
  if (raw === "large") return "font-semibold text-2xl sm:text-3xl md:text-4xl";
  if (raw === "small") return "font-semibold text-lg md:text-xl";
  return "font-semibold text-xl sm:text-2xl md:text-3xl";
};

/** Subscription: title, description, email input, and submit action. */
export function Default({
  title,
  description: descriptionRaw,
  image,
  blurBackground,
  backgroundScrim,
  backgroundPosition,
  successMessage: successMessageRaw,
  errorMessage: errorMessageRaw,
  nameLabel: nameLabelRaw,
  namePlaceholder: namePlaceholderRaw,
  nameRequired: nameRequiredRaw,
  emailLabel: emailLabelRaw,
  emailPlaceholder: emailPlaceholderRaw,
  emailRequired: emailRequiredRaw,
  consentText: consentTextRaw,
  consentRequired: consentRequiredRaw,
  submitText,
  submitAction: submitActionRaw,
  submitMethod: submitMethodRaw,
  formColorScheme,
  formBackgroundIntensity,
  submitButtonVariant,
  submitButtonSize,
  submitButtonColorScheme,
  submitButtonShowArrow,
  subscribeButtonLayout: subscribeButtonLayoutRaw,
  alignment: alignmentRaw,
  titleSize,
  showSeparator: showSeparatorRaw,
  instanceKey: instanceKeyRaw,
  instanceScope = "site",
  trackEvents,
  previewStatus,
  styles,
  id,
  isEditing,
}: SubscriptionBannerProps) {
  const instanceKey = instanceKeyRaw || id;
  const eventsEnabled = isEnabled(trackEvents);
  const titleId = useId();

  const { rootRef, fire, meta } =
    useSectionAnalytics<SubscriptionBannerAnalyticsMeta>({
      family: "subscription-banner",
      variant: "Default",
      id,
      instanceKey,
      instanceScope,
      titleSource: title,
      eventsEnabled,
      isEditing,
    });

  // Catalog fires routed through the Content SDK. See subscribe-section
  // for the routing rationale — both share the same subscribe-form
  // semantic (intent loyalty, commitment commit, emitsIdentity true).
  const handleSubmitAttempt = useCallback(() => {
    // submit-attempt isn't a catalog event — it duplicates
    // FORM_SUBMITTED at the platform layer. Consumers can still
    // observe submission lifecycle via the form element's events.
  }, []);

  const handleSubmitSuccess = useCallback(
    (submittedEmail?: string) => {
      if (!eventsEnabled) return;
      fire("form-submitted", {
        ...meta,
        formId: `subscription-banner.${meta.instanceKey ?? meta.id ?? "default"}`,
      });
      if (submittedEmail) {
        fire("identity", {
          ...meta,
          email: submittedEmail,
          identifiers: [],
        });
      }
    },
    [fire, eventsEnabled, meta],
  );

  const handleSubmitError = useCallback(
    (message: string) => {
      if (!eventsEnabled) return;
      fire("submit-error", { ...meta, error: message });
    },
    [fire, eventsEnabled, meta],
  );

  const hasBackgroundImage = hasSectionBackgroundImage(image);
  const description = getNonEmptySource(descriptionRaw);

  // Generic chrome resolves author field → core-ui-labels dictionary
  // phrase → English net. The recipe now ships EmailLabel /
  // EmailPlaceholder / SubmitText / SuccessMessage / ErrorMessage WITH
  // multi-language Standard Values (design-owner request: a fresh drop
  // should look finished and show what will render post-submit), so the
  // authored layer normally wins; an author who blanks a field still
  // falls through to the localized dictionary default, then the English
  // net.
  //
  // SubscribeBlock accepts TextSource directly on label slots so authors
  // can inline-edit in Pages — `resolveChromeSource` hands the original
  // editable source back untouched when the author typed a value, and
  // substitutes the localized string only when the field is blank.
  // Placeholder / success / error resolve to plain strings (the
  // placeholder is a native `<input>` attribute; the status messages
  // appear post-submit, not at compose time).
  const t = useDictionaryTranslate();
  const emailLabel = resolveChromeSource(
    emailLabelRaw,
    getSourceText(emailLabelRaw),
    FORM_CHROME.emailLabel.key,
    FORM_CHROME.emailLabel.en,
    t,
  );
  const submitLabel = resolveChromeSource(
    submitText,
    getSourceText(submitText),
    FORM_CHROME.subscribe.key,
    FORM_CHROME.subscribe.en,
    t,
  );
  const placeholderText = resolveChromeText(
    getSourceText(emailPlaceholderRaw),
    FORM_CHROME.emailPlaceholder.key,
    FORM_CHROME.emailPlaceholder.en,
    t,
  );
  const namePlaceholderText =
    getSourceText(namePlaceholderRaw) ||
    getSourceText(nameLabelRaw) ||
    undefined;
  const successMessage = resolveChromeText(
    getSourceText(successMessageRaw),
    FORM_CHROME.subscribeSuccess.key,
    FORM_CHROME.subscribeSuccess.en,
    t,
  );
  const errorMessage = resolveChromeText(
    getSourceText(errorMessageRaw),
    FORM_CHROME.error.key,
    FORM_CHROME.error.en,
    t,
  );
  const consentText = getNonEmptySource(consentTextRaw);

  // `showName` toggles on when the author populated NameLabel; we
  // peek at the source's text without unwrapping the editable to make
  // the decision.
  const nameLabelText = getSourceText(nameLabelRaw);
  const showName = Boolean(nameLabelText);

  const emailRequired = isEnabled(toBoolish(emailRequiredRaw) ?? "true");
  const nameRequired = isEnabled(toBoolish(nameRequiredRaw));
  const consentRequired = isEnabled(toBoolish(consentRequiredRaw));

  // Honor the recipe's documented "leave blank → showcase mode"
  // behavior. Empty string flows to the submission hook, which treats
  // it as a local-success path (CDP events + reset). The previous
  // `|| "/api/forms/subscribe"` fallback silently routed every blank-
  // action submit to a path that 404s for most tenants.
  const submitAction = getSourceText(submitActionRaw) ?? "";
  const submitMethod = parseSubmitMethod(getSourceText(submitMethodRaw));

  const subscribeButtonLayout = parseSubscribeLayout(subscribeButtonLayoutRaw);
  const alignment = parseAlignment(alignmentRaw);
  const titleSizeC = titleSizeClass(titleSize);
  const showSeparator = isEnabled(showSeparatorRaw);

  // Form surface treatment. When a background image is set it owns the
  // banner surface (shared section-background convention: a section
  // paints EITHER a color-scheme fill or an image), so the surface
  // class only applies image-less; the scheme still reaches the form
  // chrome below (submit button + focus ring) either way.
  const formScheme = parseSectionColorScheme(formColorScheme);
  const formIntensity = parseSectionBackgroundIntensity(
    formBackgroundIntensity,
    "subtle",
  );
  const formSurfaceClass = hasBackgroundImage
    ? ""
    : resolveBannerFormSurfaceClass(formScheme, formIntensity);

  const scrim = parseSectionBackgroundScrim(backgroundScrim);
  const imageToneClass = sectionBackgroundToneClass(scrim);
  const { effectiveSubmitScheme, focusRingClass } = resolveFormChromeFollow({
    formScheme,
    formIntensity,
    hasBackgroundImage,
    submitButtonColorScheme,
  });

  return (
    <section
      ref={rootRef}
      className={cn(
        "component banner banner-subscription relative w-full overflow-hidden border-border border-y",
        hasBackgroundImage
          ? cn("bg-transparent", imageToneClass)
          : formSurfaceClass || "bg-muted/50 text-foreground",
        styles?.trimEnd(),
      )}
      id={id ?? undefined}
      dir="inherit"
      data-slot="banner"
      aria-labelledby={titleId}
    >
      {/* Shared section-background layer: image + configurable scrim.
          Fixed 45% scrim alpha so authors don't need an opacity knob;
          `BlurBackground` adds a frosted blur on the scrim layer (kept
          even when the scrim is `none`). */}
      <SectionBackground
        image={image}
        scrim={scrim}
        position={parseSectionBackgroundPosition(backgroundPosition)}
        scrimOpacity={0.45}
        scrimClassName={
          isEnabled(blurBackground) ? "backdrop-blur-md" : undefined
        }
        isEditing={isEditing}
        placeholder="Subscription background"
      />
      <div className="container relative z-10 mx-auto px-4 py-8 sm:py-10 md:py-14">
        <div
          className={cn(
            "mx-auto max-w-2xl",
            alignment === "center" && "text-center",
            alignment === "end" && "text-end",
          )}
        >
          <TypographyH2
            id={titleId}
            // `border-b-0 pb-0` suppresses TypographyH2's built-in
            // underline — the ShowSeparator rule below is the banner's
            // single divider (see the prop doc).
            className={cn(
              "wrap-break-word mb-3 text-balance border-b-0 pb-0 font-heading tracking-tight",
              titleSizeC,
            )}
          >
            <Text
              value={title}
              tag="span"
              isEditing={isEditing}
              placeholder="Title"
            />
          </TypographyH2>
          {description && (
            <div className="wrap-break-word mb-6 [&_p]:mb-2">
              <TextOrRichText
                value={description}
                textClassName="text-inherit"
              />
            </div>
          )}
          {showSeparator && (
            <hr
              className={cn(
                "mb-6 border-0 border-current/20 border-t",
                alignment === "center" && "mx-auto w-24",
                alignment === "end" && "ms-auto w-24",
              )}
              data-slot="subscription-banner-separator"
            />
          )}
          <SubscribeBlock
            submitAction={submitAction}
            submitMethod={submitMethod}
            successMessage={successMessage}
            errorMessage={errorMessage}
            layout={subscribeButtonLayout}
            emailLabel={emailLabel}
            emailPlaceholder={placeholderText}
            emailRequired={emailRequired}
            inputClassName={focusRingClass}
            submitLabel={submitLabel}
            submitButtonVariant={submitButtonVariant}
            submitButtonSize={submitButtonSize}
            submitButtonColorScheme={effectiveSubmitScheme}
            submitButtonShowArrow={submitButtonShowArrow}
            showName={showName}
            nameLabel={nameLabelRaw}
            namePlaceholder={namePlaceholderText}
            nameRequired={nameRequired}
            consentText={consentText}
            consentRequired={consentRequired}
            className="w-full"
            consentClassName={"sm:max-w-[53ch]"}
            onSubmitAttempt={handleSubmitAttempt}
            onSubmitSuccess={handleSubmitSuccess}
            onSubmitError={handleSubmitError}
            previewStatus={previewStatus}
            isEditing={isEditing}
          />
        </div>
      </div>
    </section>
  );
}

/**
 * `universal` opts this file into BOTH the server and client
 * component maps the SDK generates (component-map.ts +
 * component-map.client.ts).
 */
export const componentType = "universal";

export default Default;
