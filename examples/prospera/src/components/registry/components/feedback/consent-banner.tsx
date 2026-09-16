"use client";

// Self-register this component's CDP events into the runtime catalog —
// same push-based pattern as alert-banner (see
// `@/lib/registry/analytics/cdp-events` for the rationale).
import { registerCdpRecipe } from "@/lib/registry/analytics/cdp-events";
import consentBannerRecipe from "@/recipes/consent-banner.recipe";

registerCdpRecipe(consentBannerRecipe);

/**
 * Consent banner — cookie-consent, age-gate, and privacy-notice surface
 * with five rendering variants:
 *
 *   - `Modal`      centered dialog over a dimming scrim — the classic
 *                  blocking cookie-consent / age-verification prompt.
 *   - `BottomBar`  full-width strip pinned to the bottom edge — the most
 *                  common low-friction cookie pattern.
 *   - `SidePanel`  side sheet sliding in from the inline-end edge with a
 *                  prominent brand-mark slot — the branded age-consent
 *                  treatment (spirits/tobacco-style gates).
 *   - `GdprBottomBar` full-width bar with per-cookie-category toggles
 *                  (Necessary / Preferences / Statistics / Marketing), a
 *                  details disclosure, and the three GDPR grant buttons —
 *                  the Cookiebot-style low-friction treatment.
 *   - `GdprModal`  centered dialog with Consent / Details / About tab
 *                  views — per-category toggle strip, expandable
 *                  per-category detail rows, and an authored About body.
 *
 * **Presentational-first.** Accept / Decline hide the banner locally
 * (component state only) — no cookie is written and no consent-management
 * platform is wired up. Consumers integrate a real CMP by handling
 * `onAccept` / `onDecline` (persist the choice, gate the initial render).
 *
 * **SSR-safe.** Renders visible by default on the server — dismissal is
 * client `useState`, no browser APIs are touched during render, so the
 * page-render route always sees the banner markup and never crashes.
 *
 * **Analytics.** Accept / Decline fire `accept` / `decline` CDP events
 * through the [[cdp-events]] catalog (gated by the `TrackEvents`
 * param). The `onAccept` / `onDecline` CMP hooks fire *in addition to*
 * the catalog events — storage and measurement are orthogonal. The GDPR
 * variants extend the fire payload additively with a per-category
 * `grants` map; the base variants fire without a `grants` key.
 */

import { ChevronDown } from "lucide-react";
import { type ReactNode, useId, useMemo, useState } from "react";
import { Button } from "@/components/registry/components/ui/cta-button";
import { Badge } from "@/components/registry/primitives/core/badge";
import { Switch } from "@/components/registry/primitives/core/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/registry/primitives/core/tabs";
import {
  Image,
  type ImageSource,
} from "@/components/registry/primitives/editables/image";
import {
  Link,
  type LinkSource,
} from "@/components/registry/primitives/editables/link";
import {
  RichText,
  type RichTextSource,
} from "@/components/registry/primitives/editables/richtext";
import {
  getSourceText,
  isEmptySource,
} from "@/components/registry/primitives/editables/source-normalizers";
import {
  Text,
  type TextSource,
} from "@/components/registry/primitives/editables/text";
import { useComponentAnalytics } from "@/lib/registry/analytics/use-component-analytics";
import { cn } from "@/lib/registry/cn";
import {
  type SurfaceTone,
  surfaceToneClass,
} from "@/lib/registry/color-scheme-classes";
import { isEnabled } from "@/lib/registry/param-parsers";
import {
  parseSectionMaxWidth,
  SECTION_MAX_WIDTH_CLASSES,
} from "@/lib/registry/section-surface";
import type { CmsProps } from "@/lib/registry/sitecore";

/**
 * Meta payload attached to the `accept` / `decline` CDP events (routed
 * to `extensionData` / `ext` on the event). Mirrors alert-banner's meta
 * contract: `instanceKey` is the author-set stable handle for
 * personalization rules ("suppress the gate after consent"), `id` the
 * opaque datasource GUID fallback, `instanceScope` tells the
 * personalization side whether history partitions per-page or site-wide
 * (consent is almost always site-wide).
 */
export interface ConsentBannerAnalyticsMeta {
  /** Datasource / rendering id assigned by Sitecore. Stable but opaque. */
  id?: string;
  /** Author-friendly stable handle, e.g. `"cookie-notice-2026"`. */
  instanceKey?: string;
  /** `"site"` = one shared consent record; `"page"` = per-URL. */
  instanceScope?: "site" | "page";
  /** Consent headline at the time of fire. */
  title?: string;
  /** Rendering variant at the time of fire. */
  layout?: ConsentBannerLayout | ConsentBannerGdprLayout;
  /**
   * Per-category grants — present only on fires from the GDPR variants
   * (`GdprBottomBar` / `GdprModal`). The base variants never attach it.
   */
  grants?: ConsentCategoryGrants;
}

/** The four fixed GDPR cookie-consent categories. */
export type ConsentCategoryKey =
  | "necessary"
  | "preferences"
  | "statistics"
  | "marketing";

/**
 * Per-category grant map carried on the GDPR variants' consent fires
 * and handed to the `onConsent` CMP hook. `necessary` is always `true`
 * — strictly-necessary cookies cannot be refused under the GDPR model.
 */
export interface ConsentCategoryGrants {
  necessary: true;
  preferences: boolean;
  statistics: boolean;
  marketing: boolean;
}

/**
 * Props shared by every variant export. Mirrors
 * `consent-banner.recipe.ts`; the Layout-Service translation lives in
 * `consent-banner.sitecore.ts`.
 */
export interface ConsentBannerProps extends CmsProps {
  /** Headline — "We value your privacy", "Are you of legal drinking age?". */
  title?: TextSource;
  /** Supporting copy explaining what is being consented to. */
  text?: RichTextSource;
  /** Label for the affirmative action. Button hides when cleared. */
  acceptLabel?: TextSource;
  /**
   * Label for the negative action. Optional — clear it for a
   * single-button notice; set it for accept/decline cookie consent or
   * yes/no age gates.
   */
  declineLabel?: TextSource;
  /** Optional link to the privacy / cookie policy. */
  policyLink?: LinkSource;
  /**
   * Optional logo / brand mark. Rendered prominently in `SidePanel`
   * (age gates are usually branded), smaller in `Modal` and `BottomBar`.
   */
  image?: ImageSource;
  /** Panel background tone from the shared `color-scheme@1` enum. */
  surfaceTone?: SurfaceTone;
  /**
   * `max-width@1` — width cap for the BottomBar's inner content row
   * (the same vocabulary as column-splitter / the section shells):
   * `default` keeps the standard container, `narrow` / `standard` /
   * `wide` cap it tighter, `full` spans edge to edge. The bar itself
   * always spans the viewport; this constrains the content inside it.
   * Inert on Modal / SidePanel (they size their own panels).
   */
  maxWidth?: string;
  /**
   * Dim the page behind the panel (Modal / SidePanel). Accepts Sitecore
   * string booleans. No React-side default — Sitecore Standard Values
   * (recipe default `true`) drives it; `isEnabled(undefined)` is false.
   * BottomBar never dims (it is non-blocking by design).
   */
  overlay?: string | boolean;
  /**
   * Author-friendly stable handle for personalization, e.g.
   * `"cookie-notice-2026"`. Flows into every fired event's
   * `ext.instanceKey`. When unset, falls back to the title text, then
   * the datasource id.
   */
  instanceKey?: string;
  /**
   * Scope of consent history. `"site"` (default) = one consent record
   * for the whole site — right for cookie banners and age gates;
   * `"page"` = per-URL.
   */
  instanceScope?: "site" | "page";
  /**
   * Per-instance opt-out for the CDP `accept` / `decline` events. No
   * React-side default — Sitecore Standard Values (recipe default
   * `true`) drives it; `isEnabled(undefined)` is false. Accepts
   * Sitecore string booleans.
   */
  trackEvents?: string | boolean;
  /**
   * Called when the accept button is clicked (before the local hide).
   * A CMP persistence hook, NOT an analytics override — unlike
   * alert-banner's `onView`/`onDismiss`, providing it does not suppress
   * the catalog event: consent measurement and consent storage are
   * orthogonal concerns, so both fire.
   */
  onAccept?: () => void;
  /** Decline counterpart of `onAccept` — same both-fire semantics. */
  onDecline?: () => void;

  // -- GDPR variant fields (GdprBottomBar / GdprModal only) -----------------
  // All optional; the GDPR variants degrade to generic English fallbacks
  // when a field is empty, and the base variants ignore them entirely.

  /** Category label — "Necessary". Falls back to a generic label. */
  necessaryLabel?: TextSource;
  /** What strictly-necessary cookies do. Shown in the Details rows. */
  necessaryDescription?: TextSource;
  /** Cookie count for the category badge. Badge hidden when absent. */
  necessaryCount?: TextSource;
  /** Category label — "Preferences". */
  preferencesLabel?: TextSource;
  /** What preference cookies do. */
  preferencesDescription?: TextSource;
  /** Cookie count for the category badge. Badge hidden when absent. */
  preferencesCount?: TextSource;
  /** Category label — "Statistics". */
  statisticsLabel?: TextSource;
  /** What statistics cookies do. */
  statisticsDescription?: TextSource;
  /** Cookie count for the category badge. Badge hidden when absent. */
  statisticsCount?: TextSource;
  /** Category label — "Marketing". */
  marketingLabel?: TextSource;
  /** What marketing cookies do. */
  marketingDescription?: TextSource;
  /** Cookie count for the category badge. Badge hidden when absent. */
  marketingCount?: TextSource;
  /**
   * Optional "Unclassified" category label. The unclassified row renders
   * greyed-out with a disabled, unchecked toggle — and only when this or
   * its description has content (Cookiebot-style "we are in the process
   * of classifying these cookies" row).
   */
  unclassifiedLabel?: TextSource;
  /** What unclassified cookies are. Row hidden when both fields empty. */
  unclassifiedDescription?: TextSource;
  /** Cookie count for the unclassified badge. Hidden when absent. */
  unclassifiedCount?: TextSource;
  /** Grant-everything button label. Default "Allow all cookies". */
  allowAllLabel?: TextSource;
  /** Grant-current-toggle-state button label. Default "Allow selected". */
  allowSelectedLabel?: TextSource;
  /** Necessary-only button label. Default "Necessary only". */
  necessaryOnlyLabel?: TextSource;
  /** Consent tab label (GdprModal). Default "Consent". */
  consentLabel?: TextSource;
  /**
   * Details affordance label — the GdprModal tab and the GdprBottomBar
   * disclosure link. Default "Details".
   */
  detailsLabel?: TextSource;
  /** About tab label (GdprModal). Default "About". */
  aboutLabel?: TextSource;
  /**
   * Authored privacy/about rich text for the GdprModal About view. The
   * About tab is omitted entirely when this field is empty.
   */
  aboutBody?: RichTextSource;
  /**
   * CMP persistence hook for the GDPR variants — receives the
   * per-category grant map on every grant path (allow all / allow
   * selected / necessary only), *in addition to* `onAccept`/`onDecline`
   * (which keep their both-fire semantics on the GDPR buttons).
   */
  onConsent?: (grants: ConsentCategoryGrants) => void;
}

/**
 * Internal layout discriminator — NOT part of the public props (the
 * export name is the discriminator, per the rendering-variant pattern).
 */
type ConsentBannerLayout = "modal" | "bottom-bar" | "side-panel";

/**
 * Internal layout discriminator for the GDPR variants — kept separate
 * from {@link ConsentBannerLayout} so the base `BODIES` table stays
 * exhaustively keyed.
 */
type ConsentBannerGdprLayout = "gdpr-bottom-bar" | "gdpr-modal";

/** Prepared nodes each per-layout body composes into its own tree. */
type ConsentBodyProps = {
  titleId: string;
  tone: string;
  hasOverlay: boolean;
  /** Resolved `max-width@1` class for the BottomBar content row. */
  maxWidthClass: string;
  styles: ConsentBannerProps["styles"];
  id: ConsentBannerProps["id"];
  isEditing: ConsentBannerProps["isEditing"];
  title: ConsentBannerProps["title"];
  image: ConsentBannerProps["image"];
  bodyText: ReactNode;
  acceptButton: ReactNode;
  declineButton: ReactNode;
  policyLinkEl: ReactNode;
};

/** Full-viewport dimming scrim shared by Modal and SidePanel. */
function Scrim() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-auto absolute inset-0 bg-theme-black/60"
    />
  );
}

function ModalBody({
  titleId,
  tone,
  hasOverlay,
  styles,
  id,
  isEditing,
  title,
  image,
  bodyText,
  acceptButton,
  declineButton,
  policyLinkEl,
}: ConsentBodyProps) {
  return (
    <section
      className={cn(
        "component consent-banner pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4",
        styles?.trimEnd(),
      )}
      id={id ?? undefined}
      data-slot="consent-banner"
      data-layout="modal"
    >
      {hasOverlay ? <Scrim /> : null}
      <div
        role="dialog"
        aria-modal={hasOverlay || undefined}
        aria-labelledby={titleId}
        className={cn(
          "pointer-events-auto relative flex w-full max-w-md flex-col items-center gap-4 rounded-xl border border-border p-6 text-center shadow-lg sm:p-8",
          tone,
        )}
      >
        <Image
          value={image}
          className="h-12 w-auto object-contain"
          isEditing={isEditing}
          placeholder="Logo"
        />
        <h2
          id={titleId}
          className="font-heading font-semibold text-xl tracking-tight"
        >
          <Text
            value={title}
            tag="span"
            isEditing={isEditing}
            placeholder="Title"
          />
        </h2>
        {bodyText}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {declineButton}
          {acceptButton}
        </div>
        <div className="text-xs">{policyLinkEl}</div>
      </div>
    </section>
  );
}

function SidePanelBody({
  titleId,
  tone,
  hasOverlay,
  styles,
  id,
  isEditing,
  title,
  image,
  bodyText,
  acceptButton,
  declineButton,
  policyLinkEl,
}: ConsentBodyProps) {
  return (
    <section
      className={cn(
        "component consent-banner pointer-events-none fixed inset-0 z-50",
        styles?.trimEnd(),
      )}
      id={id ?? undefined}
      data-slot="consent-banner"
      data-layout="side-panel"
    >
      {hasOverlay ? <Scrim /> : null}
      <div
        role="dialog"
        aria-modal={hasOverlay || undefined}
        aria-labelledby={titleId}
        className={cn(
          "pointer-events-auto absolute inset-y-0 end-0 flex w-full max-w-sm flex-col gap-5 overflow-y-auto border-border border-s p-6 shadow-lg sm:p-8",
          tone,
        )}
      >
        {/* Prominent brand mark — age gates are usually branded. */}
        <Image
          value={image}
          className="h-16 w-auto self-start object-contain"
          isEditing={isEditing}
          placeholder="Brand mark"
        />
        <h2
          id={titleId}
          className="font-heading font-semibold text-2xl tracking-tight"
        >
          <Text
            value={title}
            tag="span"
            isEditing={isEditing}
            placeholder="Title"
          />
        </h2>
        {bodyText}
        <div className="mt-auto flex flex-col gap-2">
          {acceptButton}
          {declineButton}
          <div className="pt-2 text-center text-xs">{policyLinkEl}</div>
        </div>
      </div>
    </section>
  );
}

/**
 * Non-blocking strip pinned to the bottom edge. Never dims the page —
 * the Overlay param applies to Modal / SidePanel only.
 */
function BottomBarBody({
  titleId,
  tone,
  maxWidthClass,
  styles,
  id,
  isEditing,
  title,
  image,
  bodyText,
  acceptButton,
  declineButton,
  policyLinkEl,
}: ConsentBodyProps) {
  return (
    <section
      className={cn(
        "component consent-banner fixed inset-x-0 bottom-0 z-50 border-border border-t shadow-lg",
        tone,
        styles?.trimEnd(),
      )}
      id={id ?? undefined}
      aria-labelledby={titleId}
      data-slot="consent-banner"
      data-layout="bottom-bar"
    >
      {/* `mx-auto` centers the content row — the bare `container` class
          left it start-aligned at wide viewports, so the action cluster
          never reached the bar's end. The `max-width@1` cap (after
          `container` in cn, so tailwind-merge lets it win) constrains
          the row like column-splitter's MaxWidth. */}
      <div
        className={cn(
          "container mx-auto flex flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:gap-6",
          maxWidthClass,
        )}
      >
        <Image
          value={image}
          className="h-8 w-auto shrink-0 object-contain"
          isEditing={isEditing}
          placeholder="Logo"
        />
        <div className="min-w-0 flex-1">
          <p
            id={titleId}
            className="font-heading font-semibold text-sm leading-tight"
          >
            <Text
              value={title}
              tag="span"
              isEditing={isEditing}
              placeholder="Title"
            />
          </p>
          {bodyText}
        </div>
        {/* `ms-auto` pins the action cluster to the row's end even when
            the copy column doesn't grow (short text, wrapped rows). */}
        <div className="flex shrink-0 flex-wrap items-center gap-3 md:ms-auto">
          {policyLinkEl}
          {declineButton}
          {acceptButton}
        </div>
      </div>
    </section>
  );
}

const BODIES: Record<
  ConsentBannerLayout,
  (props: ConsentBodyProps) => ReactNode
> = {
  modal: ModalBody,
  "bottom-bar": BottomBarBody,
  "side-panel": SidePanelBody,
};

function ConsentBannerBase({
  layout,
  title,
  text,
  acceptLabel,
  declineLabel,
  policyLink,
  image,
  surfaceTone,
  maxWidth,
  overlay,
  instanceKey,
  instanceScope = "site",
  trackEvents,
  onAccept,
  onDecline,
  styles,
  id,
  isEditing,
}: ConsentBannerProps & { layout: ConsentBannerLayout }) {
  const [isDismissed, setIsDismissed] = useState(false);
  const titleId = useId();
  const analytics =
    useComponentAnalytics<ConsentBannerAnalyticsMeta>("consent-banner");

  // Stable meta payload — same instanceKey priority as alert-banner:
  // explicit param, then title text, then the datasource GUID.
  const meta = useMemo<ConsentBannerAnalyticsMeta>(() => {
    const titleText = getSourceText(title);
    return {
      id,
      instanceKey: instanceKey || titleText || id,
      instanceScope,
      title: titleText,
      layout,
    };
  }, [id, instanceKey, instanceScope, title, layout]);

  // Editing-mode clicks are author previews, never real consent — the
  // catalog path stays silent there.
  const eventsEnabled = isEnabled(trackEvents) && !isEditing;

  const hasTitle = title != null && !isEmptySource(title);
  const hasText = text != null && !isEmptySource(text);
  const hasAcceptLabel = acceptLabel != null && !isEmptySource(acceptLabel);
  const hasDeclineLabel = declineLabel != null && !isEmptySource(declineLabel);
  const hasPolicyLink = policyLink != null && !isEmptySource(policyLink);

  // Keeps stray empty banners off the page; editing mode always renders
  // so authors see the placeholders. Dismissal is ignored while editing
  // (clicking the buttons in Pages must not hide the rendering).
  if (!hasTitle && !hasText && !isEditing) return null;
  if (isDismissed && !isEditing) return null;

  const isSidePanel = layout === "side-panel";

  // CDP event + CMP callback both fire — the callback persists the
  // choice, the catalog event measures it. See the onAccept docblock.
  const accept = () => {
    if (eventsEnabled) analytics.fire("accept", meta);
    onAccept?.();
    setIsDismissed(true);
  };
  const decline = () => {
    if (eventsEnabled) analytics.fire("decline", meta);
    onDecline?.();
    setIsDismissed(true);
  };

  const acceptButton =
    hasAcceptLabel || isEditing ? (
      <Button
        type="button"
        onClick={accept}
        className={cn(isSidePanel && "w-full")}
      >
        <Text
          value={acceptLabel}
          tag="span"
          isEditing={isEditing}
          placeholder="Accept label"
        />
      </Button>
    ) : null;

  const declineButton =
    hasDeclineLabel || isEditing ? (
      <Button
        type="button"
        variant="outline"
        onClick={decline}
        className={cn(isSidePanel && "w-full")}
      >
        <Text
          value={declineLabel}
          tag="span"
          isEditing={isEditing}
          placeholder="Decline label"
        />
      </Button>
    ) : null;

  // Renders the editing placeholder when empty; null when empty outside
  // editing — same pattern as alert-banner's CTA slot.
  const policyLinkEl = hasPolicyLink ? (
    <Link
      value={policyLink}
      className="text-sm underline underline-offset-4 opacity-80 hover:opacity-100"
    />
  ) : (
    <Link value={policyLink} placeholder="Policy link" isEditing={isEditing} />
  );

  const bodyText = (
    <div className="text-sm opacity-90 [&_p]:mb-0">
      <RichText value={text} placeholder="Text" isEditing={isEditing} />
    </div>
  );

  const Body = BODIES[layout];
  return (
    <Body
      titleId={titleId}
      tone={surfaceToneClass(surfaceTone)}
      hasOverlay={isEnabled(overlay)}
      maxWidthClass={SECTION_MAX_WIDTH_CLASSES[parseSectionMaxWidth(maxWidth)]}
      styles={styles}
      id={id}
      isEditing={isEditing}
      title={title}
      image={image}
      bodyText={bodyText}
      acceptButton={acceptButton}
      declineButton={declineButton}
      policyLinkEl={policyLinkEl}
    />
  );
}

/** Full-width strip pinned to the bottom edge — the common cookie bar. */
export function BottomBar(props: ConsentBannerProps) {
  return <ConsentBannerBase {...props} layout="bottom-bar" />;
}

/** Centered dialog over a scrim — blocking cookie consent / age check. */
export function Modal(props: ConsentBannerProps) {
  return <ConsentBannerBase {...props} layout="modal" />;
}

/** Inline-end side sheet with a prominent brand mark — branded age gate. */
export function SidePanel(props: ConsentBannerProps) {
  return <ConsentBannerBase {...props} layout="side-panel" />;
}

// ---------------------------------------------------------------------------
// GDPR variants — per-cookie-category consent (Cookiebot-style UX)
// ---------------------------------------------------------------------------

/**
 * Generic English fallbacks for the GDPR authoring fields — the GDPR
 * variants must degrade gracefully when the optional per-category fields
 * are absent (e.g. older datasources created before the fields existed).
 */
const GDPR_FALLBACKS = {
  necessaryLabel: "Necessary",
  necessaryDescription:
    "Necessary cookies keep the website usable — page navigation, secure areas, and remembering your consent choice. The website cannot function properly without them.",
  preferencesLabel: "Preferences",
  preferencesDescription:
    "Preference cookies let the website remember choices that change how it behaves or looks, like your preferred language or the region you are in.",
  statisticsLabel: "Statistics",
  statisticsDescription:
    "Statistics cookies help us understand how visitors interact with the website by collecting and reporting information anonymously.",
  marketingLabel: "Marketing",
  marketingDescription:
    "Marketing cookies are used to track visitors across websites so we can display content that is relevant and engaging.",
  unclassifiedLabel: "Unclassified",
  unclassifiedDescription:
    "Unclassified cookies are cookies we are in the process of classifying, together with the providers of individual cookies.",
  allowAllLabel: "Allow all cookies",
  allowSelectedLabel: "Allow selected",
  necessaryOnlyLabel: "Necessary only",
  consentLabel: "Consent",
  detailsLabel: "Details",
  aboutLabel: "About",
} as const;

/** The three toggleable (non-necessary) categories. */
type OptionalCategoryKey = Exclude<ConsentCategoryKey, "necessary">;
type OptionalSelection = Record<OptionalCategoryKey, boolean>;

const ALL_OFF: OptionalSelection = {
  preferences: false,
  statistics: false,
  marketing: false,
};

/** Parse an integer count field. `undefined` (no badge) when absent/invalid. */
function parseCount(source?: TextSource): number | undefined {
  const raw = getSourceText(source);
  if (!raw) return undefined;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

/**
 * Field-driven text with a generic fallback: renders the authored field
 * when it has content, the editing placeholder when the canvas is
 * authoring an empty field, and the fallback string otherwise.
 */
function FallbackText({
  value,
  fallback,
  placeholder,
  isEditing,
  className,
}: {
  value?: TextSource;
  fallback: string;
  placeholder: string;
  isEditing?: boolean;
  className?: string;
}) {
  const hasValue = value != null && !isEmptySource(value);
  return (
    <Text
      value={hasValue ? value : isEditing ? undefined : fallback}
      tag="span"
      className={className}
      placeholder={placeholder}
      isEditing={isEditing}
    />
  );
}

/** Resolved per-category view model shared by the toggle strip and rows. */
interface GdprCategory {
  key: ConsentCategoryKey | "unclassified";
  label?: TextSource;
  fallbackLabel: string;
  description?: TextSource;
  fallbackDescription: string;
  count?: number;
  /** Necessary: toggle rendered on + non-interactive. */
  locked: boolean;
  /** Unclassified: greyed row, toggle off + non-interactive. */
  inert: boolean;
}

function buildGdprCategories(props: ConsentBannerProps): GdprCategory[] {
  return [
    {
      key: "necessary",
      label: props.necessaryLabel,
      fallbackLabel: GDPR_FALLBACKS.necessaryLabel,
      description: props.necessaryDescription,
      fallbackDescription: GDPR_FALLBACKS.necessaryDescription,
      count: parseCount(props.necessaryCount),
      locked: true,
      inert: false,
    },
    {
      key: "preferences",
      label: props.preferencesLabel,
      fallbackLabel: GDPR_FALLBACKS.preferencesLabel,
      description: props.preferencesDescription,
      fallbackDescription: GDPR_FALLBACKS.preferencesDescription,
      count: parseCount(props.preferencesCount),
      locked: false,
      inert: false,
    },
    {
      key: "statistics",
      label: props.statisticsLabel,
      fallbackLabel: GDPR_FALLBACKS.statisticsLabel,
      description: props.statisticsDescription,
      fallbackDescription: GDPR_FALLBACKS.statisticsDescription,
      count: parseCount(props.statisticsCount),
      locked: false,
      inert: false,
    },
    {
      key: "marketing",
      label: props.marketingLabel,
      fallbackLabel: GDPR_FALLBACKS.marketingLabel,
      description: props.marketingDescription,
      fallbackDescription: GDPR_FALLBACKS.marketingDescription,
      count: parseCount(props.marketingCount),
      locked: false,
      inert: false,
    },
  ];
}

/**
 * The optional greyed "Unclassified" row — present only when its label
 * or description field has content (or the canvas is editing, so authors
 * can fill it in).
 */
function buildUnclassifiedCategory(
  props: ConsentBannerProps,
): GdprCategory | undefined {
  const hasContent =
    !isEmptySource(props.unclassifiedLabel) ||
    !isEmptySource(props.unclassifiedDescription);
  if (!hasContent && !props.isEditing) return undefined;
  return {
    key: "unclassified",
    label: props.unclassifiedLabel,
    fallbackLabel: GDPR_FALLBACKS.unclassifiedLabel,
    description: props.unclassifiedDescription,
    fallbackDescription: GDPR_FALLBACKS.unclassifiedDescription,
    count: parseCount(props.unclassifiedCount),
    locked: false,
    inert: true,
  };
}

/** Toggle-state accessors shared by the strip and the detail rows. */
interface GdprToggleState {
  selection: OptionalSelection;
  setCategory: (key: OptionalCategoryKey, checked: boolean) => void;
}

function categoryChecked(category: GdprCategory, state: GdprToggleState) {
  if (category.locked) return true;
  if (category.inert) return false;
  return state.selection[category.key as OptionalCategoryKey];
}

/** One switch + label pair in the inline / column toggle strip. */
function GdprCategoryToggle({
  category,
  state,
  idBase,
  isEditing,
}: {
  category: GdprCategory;
  state: GdprToggleState;
  idBase: string;
  isEditing?: boolean;
}) {
  const switchId = `${idBase}-toggle-${category.key}`;
  // Explicit aria-labelledby — the Switch primitive injects a generic
  // "Toggle switch" aria-label when neither labelling prop is set, which
  // would override the <label htmlFor> association.
  const labelId = `${switchId}-label`;
  const disabled = category.locked || category.inert;
  return (
    <div className="flex items-center gap-2">
      <Switch
        id={switchId}
        size="sm"
        checked={categoryChecked(category, state)}
        disabled={disabled}
        aria-disabled={disabled || undefined}
        aria-labelledby={labelId}
        onCheckedChange={(checked) => {
          if (!disabled)
            state.setCategory(category.key as OptionalCategoryKey, checked);
        }}
      />
      <label
        id={labelId}
        htmlFor={switchId}
        className="font-medium text-sm leading-none"
      >
        <FallbackText
          value={category.label}
          fallback={category.fallbackLabel}
          placeholder={`${category.fallbackLabel} label`}
          isEditing={isEditing}
        />
      </label>
    </div>
  );
}

/**
 * One expandable Details row: name + optional count badge behind an
 * `aria-expanded` disclosure button, a right-aligned toggle, and the
 * category description as the expandable panel.
 */
function GdprDetailRow({
  category,
  state,
  expanded,
  onToggleExpanded,
  idBase,
  isEditing,
}: {
  category: GdprCategory;
  state: GdprToggleState;
  expanded: boolean;
  onToggleExpanded: () => void;
  idBase: string;
  isEditing?: boolean;
}) {
  const panelId = `${idBase}-panel-${category.key}`;
  const switchId = `${idBase}-row-toggle-${category.key}`;
  const labelId = `${switchId}-label`;
  const disabled = category.locked || category.inert;
  return (
    <div
      className={cn(
        "border-border border-b last:border-b-0",
        category.inert && "opacity-60",
      )}
      data-category={category.key}
    >
      <div className="flex items-center gap-3 py-3">
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={onToggleExpanded}
          className="flex min-w-0 flex-1 items-center gap-2 text-start"
        >
          <ChevronDown
            aria-hidden="true"
            className={cn(
              "size-4 shrink-0 opacity-70 transition-transform",
              expanded && "rotate-180",
            )}
          />
          <span id={labelId} className="truncate font-medium text-sm">
            <FallbackText
              value={category.label}
              fallback={category.fallbackLabel}
              placeholder={`${category.fallbackLabel} label`}
              isEditing={isEditing}
            />
          </span>
          {category.count != null ? (
            <Badge variant="rounded" size="xs" colorScheme="neutral">
              {category.count}
            </Badge>
          ) : null}
        </button>
        <Switch
          id={switchId}
          size="sm"
          checked={categoryChecked(category, state)}
          disabled={disabled}
          aria-disabled={disabled || undefined}
          aria-labelledby={labelId}
          onCheckedChange={(checked) => {
            if (!disabled)
              state.setCategory(category.key as OptionalCategoryKey, checked);
          }}
        />
      </div>
      {expanded ? (
        <p id={panelId} className="ps-6 pb-3 text-sm opacity-80">
          <FallbackText
            value={category.description}
            fallback={category.fallbackDescription}
            placeholder={`${category.fallbackLabel} description`}
            isEditing={isEditing}
          />
        </p>
      ) : null}
    </div>
  );
}

/** The full per-category Details list (four categories + unclassified). */
function GdprDetailsList({
  categories,
  state,
  expandedKeys,
  onToggleExpanded,
  idBase,
  isEditing,
}: {
  categories: GdprCategory[];
  state: GdprToggleState;
  expandedKeys: Record<string, boolean>;
  onToggleExpanded: (key: string) => void;
  idBase: string;
  isEditing?: boolean;
}) {
  return (
    <div className="border-border border-t">
      {categories.map((category) => (
        <GdprDetailRow
          key={category.key}
          category={category}
          state={state}
          expanded={Boolean(expandedKeys[category.key])}
          onToggleExpanded={() => onToggleExpanded(category.key)}
          idBase={idBase}
          isEditing={isEditing}
        />
      ))}
    </div>
  );
}

/** The three GDPR grant buttons — allow all / allow selected / necessary only. */
function GdprButtonGroup({
  props,
  onAllowAll,
  onAllowSelected,
  onNecessaryOnly,
  stacked,
}: {
  props: ConsentBannerProps;
  onAllowAll: () => void;
  onAllowSelected: () => void;
  onNecessaryOnly: () => void;
  stacked?: boolean;
}) {
  const buttonClass = cn(stacked && "w-full");
  return (
    <>
      <Button type="button" onClick={onAllowAll} className={buttonClass}>
        <FallbackText
          value={props.allowAllLabel}
          fallback={GDPR_FALLBACKS.allowAllLabel}
          placeholder="Allow-all label"
          isEditing={props.isEditing}
        />
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={onAllowSelected}
        className={buttonClass}
      >
        <FallbackText
          value={props.allowSelectedLabel}
          fallback={GDPR_FALLBACKS.allowSelectedLabel}
          placeholder="Allow-selected label"
          isEditing={props.isEditing}
        />
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={onNecessaryOnly}
        className={buttonClass}
      >
        <FallbackText
          value={props.necessaryOnlyLabel}
          fallback={GDPR_FALLBACKS.necessaryOnlyLabel}
          placeholder="Necessary-only label"
          isEditing={props.isEditing}
        />
      </Button>
    </>
  );
}

/** Everything the two GDPR layout bodies need, prepared by the base. */
interface GdprBodyContext {
  props: ConsentBannerProps;
  titleId: string;
  idBase: string;
  tone: string;
  categories: GdprCategory[];
  detailCategories: GdprCategory[];
  state: GdprToggleState;
  expandedKeys: Record<string, boolean>;
  onToggleExpanded: (key: string) => void;
  onAllowAll: () => void;
  onAllowSelected: () => void;
  onNecessaryOnly: () => void;
  bodyText: ReactNode;
  policyLinkEl: ReactNode;
}

/**
 * Full-width GDPR bar: intro copy on the left, inline category toggles
 * with a details disclosure in the middle, stacked grant buttons at the
 * end, and the expandable per-category detail rows below the bar row.
 */
function GdprBottomBarBody(ctx: GdprBodyContext) {
  const { props, titleId, idBase, tone } = ctx;
  const [detailsOpen, setDetailsOpen] = useState(false);
  const detailsId = `${idBase}-details`;
  const maxWidthClass =
    SECTION_MAX_WIDTH_CLASSES[parseSectionMaxWidth(props.maxWidth)];
  return (
    <section
      className={cn(
        "component consent-banner fixed inset-x-0 bottom-0 z-50 border-border border-t shadow-lg",
        tone,
        props.styles?.trimEnd(),
      )}
      id={props.id ?? undefined}
      aria-labelledby={titleId}
      data-slot="consent-banner"
      data-layout="gdpr-bottom-bar"
    >
      <div
        className={cn(
          "container mx-auto flex flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:gap-8",
          maxWidthClass,
        )}
      >
        <div className="min-w-0 flex-1">
          <p
            id={titleId}
            className="font-heading font-semibold text-sm leading-tight"
          >
            <Text
              value={props.title}
              tag="span"
              isEditing={props.isEditing}
              placeholder="Title"
            />
          </p>
          {ctx.bodyText}
          <div className="mt-1 text-xs">{ctx.policyLinkEl}</div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-2">
          {ctx.categories.map((category) => (
            <GdprCategoryToggle
              key={category.key}
              category={category}
              state={ctx.state}
              idBase={idBase}
              isEditing={props.isEditing}
            />
          ))}
          <button
            type="button"
            aria-expanded={detailsOpen}
            aria-controls={detailsId}
            onClick={() => setDetailsOpen((open) => !open)}
            className="inline-flex items-center gap-1 text-sm underline underline-offset-4 opacity-80 hover:opacity-100"
          >
            <FallbackText
              value={props.detailsLabel}
              fallback={GDPR_FALLBACKS.detailsLabel}
              placeholder="Details label"
              isEditing={props.isEditing}
            />
            <ChevronDown
              aria-hidden="true"
              className={cn(
                "size-3.5 transition-transform",
                detailsOpen && "rotate-180",
              )}
            />
          </button>
        </div>
        <div className="flex shrink-0 flex-col gap-2 lg:ms-auto lg:w-52">
          <GdprButtonGroup
            props={props}
            onAllowAll={ctx.onAllowAll}
            onAllowSelected={ctx.onAllowSelected}
            onNecessaryOnly={ctx.onNecessaryOnly}
            stacked
          />
        </div>
      </div>
      {detailsOpen ? (
        <div
          id={detailsId}
          className={cn("container mx-auto px-4 pb-4", maxWidthClass)}
        >
          <GdprDetailsList
            categories={ctx.detailCategories}
            state={ctx.state}
            expandedKeys={ctx.expandedKeys}
            onToggleExpanded={ctx.onToggleExpanded}
            idBase={idBase}
            isEditing={props.isEditing}
          />
        </div>
      ) : null}
    </section>
  );
}

/**
 * Centered GDPR dialog with Consent / Details / About tab views. The
 * About tab renders the authored rich-text body and is omitted when the
 * field is empty (always reachable while editing so authors can fill it).
 */
function GdprModalBody(ctx: GdprBodyContext) {
  const { props, titleId, idBase, tone } = ctx;
  const hasOverlay = isEnabled(props.overlay);
  const showAbout =
    props.isEditing ||
    (props.aboutBody != null && !isEmptySource(props.aboutBody));
  return (
    <section
      className={cn(
        "component consent-banner pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4",
        props.styles?.trimEnd(),
      )}
      id={props.id ?? undefined}
      data-slot="consent-banner"
      data-layout="gdpr-modal"
    >
      {hasOverlay ? <Scrim /> : null}
      <div
        role="dialog"
        aria-modal={hasOverlay || undefined}
        aria-labelledby={titleId}
        className={cn(
          "pointer-events-auto relative flex max-h-full w-full max-w-lg flex-col gap-4 overflow-y-auto rounded-xl border border-border p-6 shadow-lg",
          tone,
        )}
      >
        <Image
          value={props.image}
          className="h-10 w-auto self-start object-contain"
          isEditing={props.isEditing}
          placeholder="Logo"
        />
        <h2
          id={titleId}
          className="font-heading font-semibold text-xl tracking-tight"
        >
          <Text
            value={props.title}
            tag="span"
            isEditing={props.isEditing}
            placeholder="Title"
          />
        </h2>
        <Tabs defaultValue="consent">
          <TabsList className="w-full justify-start border-border border-b">
            <TabsTrigger value="consent">
              <FallbackText
                value={props.consentLabel}
                fallback={GDPR_FALLBACKS.consentLabel}
                placeholder="Consent tab label"
                isEditing={props.isEditing}
              />
            </TabsTrigger>
            <TabsTrigger value="details">
              <FallbackText
                value={props.detailsLabel}
                fallback={GDPR_FALLBACKS.detailsLabel}
                placeholder="Details label"
                isEditing={props.isEditing}
              />
            </TabsTrigger>
            {showAbout ? (
              <TabsTrigger value="about">
                <FallbackText
                  value={props.aboutLabel}
                  fallback={GDPR_FALLBACKS.aboutLabel}
                  placeholder="About tab label"
                  isEditing={props.isEditing}
                />
              </TabsTrigger>
            ) : null}
          </TabsList>
          <TabsContent value="consent" className="flex flex-col gap-4 pt-2">
            {ctx.bodyText}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {ctx.categories.map((category) => (
                <GdprCategoryToggle
                  key={category.key}
                  category={category}
                  state={ctx.state}
                  idBase={idBase}
                  isEditing={props.isEditing}
                />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="details" className="pt-2">
            <GdprDetailsList
              categories={ctx.detailCategories}
              state={ctx.state}
              expandedKeys={ctx.expandedKeys}
              onToggleExpanded={ctx.onToggleExpanded}
              idBase={idBase}
              isEditing={props.isEditing}
            />
          </TabsContent>
          {showAbout ? (
            <TabsContent value="about" className="pt-2">
              <div className="text-sm opacity-90">
                <RichText
                  value={props.aboutBody}
                  placeholder="About body"
                  isEditing={props.isEditing}
                />
              </div>
            </TabsContent>
          ) : null}
        </Tabs>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <GdprButtonGroup
            props={props}
            onAllowAll={ctx.onAllowAll}
            onAllowSelected={ctx.onAllowSelected}
            onNecessaryOnly={ctx.onNecessaryOnly}
          />
        </div>
        <div className="text-xs">{ctx.policyLinkEl}</div>
      </div>
    </section>
  );
}

function ConsentBannerGdprBase({
  layout,
  ...props
}: ConsentBannerProps & { layout: ConsentBannerGdprLayout }) {
  const {
    title,
    text,
    policyLink,
    surfaceTone,
    instanceKey,
    instanceScope = "site",
    trackEvents,
    onAccept,
    onDecline,
    onConsent,
    id,
    isEditing,
  } = props;
  const [isDismissed, setIsDismissed] = useState(false);
  const [selection, setSelection] = useState<OptionalSelection>(ALL_OFF);
  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>({});
  const titleId = useId();
  const idBase = useId();
  const analytics =
    useComponentAnalytics<ConsentBannerAnalyticsMeta>("consent-banner");

  // Same meta contract (and instanceKey fallback chain) as the base
  // variants — duplicated rather than shared so the two paths stay
  // independent; the GDPR fires spread `grants` on top of this.
  const meta = useMemo<ConsentBannerAnalyticsMeta>(() => {
    const titleText = getSourceText(title);
    return {
      id,
      instanceKey: instanceKey || titleText || id,
      instanceScope,
      title: titleText,
      layout,
    };
  }, [id, instanceKey, instanceScope, title, layout]);

  // Editing-mode clicks are author previews, never real consent.
  const eventsEnabled = isEnabled(trackEvents) && !isEditing;

  const hasTitle = title != null && !isEmptySource(title);
  const hasText = text != null && !isEmptySource(text);
  const hasPolicyLink = policyLink != null && !isEmptySource(policyLink);

  // Same visibility rules as the base variants: no stray empty banners,
  // editing always renders, dismissal ignored while editing.
  if (!hasTitle && !hasText && !isEditing) return null;
  if (isDismissed && !isEditing) return null;

  // CDP fire (with grants), then the CMP hooks, then the local hide —
  // mirroring the base accept/decline order exactly.
  const grantAndDismiss = (
    event: "accept" | "decline",
    grants: ConsentCategoryGrants,
    cmpHook?: () => void,
  ) => {
    if (eventsEnabled) analytics.fire(event, { ...meta, grants });
    onConsent?.(grants);
    cmpHook?.();
    setIsDismissed(true);
  };

  const onAllowAll = () =>
    grantAndDismiss(
      "accept",
      { necessary: true, preferences: true, statistics: true, marketing: true },
      onAccept,
    );
  const onAllowSelected = () =>
    grantAndDismiss("accept", { necessary: true, ...selection }, onAccept);
  const onNecessaryOnly = () =>
    grantAndDismiss("decline", { necessary: true, ...ALL_OFF }, onDecline);

  const categories = buildGdprCategories(props);
  const unclassified = buildUnclassifiedCategory(props);
  const detailCategories = unclassified
    ? [...categories, unclassified]
    : categories;

  const ctx: GdprBodyContext = {
    props,
    titleId,
    idBase,
    tone: surfaceToneClass(surfaceTone),
    categories,
    detailCategories,
    state: {
      selection,
      setCategory: (key, checked) =>
        setSelection((current) => ({ ...current, [key]: checked })),
    },
    expandedKeys,
    onToggleExpanded: (key) =>
      setExpandedKeys((current) => ({ ...current, [key]: !current[key] })),
    onAllowAll,
    onAllowSelected,
    onNecessaryOnly,
    bodyText: (
      <div className="text-sm opacity-90 [&_p]:mb-0">
        <RichText value={text} placeholder="Text" isEditing={isEditing} />
      </div>
    ),
    policyLinkEl: hasPolicyLink ? (
      <Link
        value={policyLink}
        className="text-sm underline underline-offset-4 opacity-80 hover:opacity-100"
      />
    ) : (
      <Link
        value={policyLink}
        placeholder="Policy link"
        isEditing={isEditing}
      />
    ),
  };

  return layout === "gdpr-modal" ? (
    <GdprModalBody {...ctx} />
  ) : (
    <GdprBottomBarBody {...ctx} />
  );
}

/**
 * GDPR bottom bar — full-width strip with per-category toggles
 * (Necessary locked on), a details disclosure, and allow all / allow
 * selected / necessary only.
 */
export function GdprBottomBar(props: ConsentBannerProps) {
  return <ConsentBannerGdprBase {...props} layout="gdpr-bottom-bar" />;
}

/**
 * GDPR modal — centered dialog with Consent / Details / About tab views,
 * per-category toggle strip, and expandable per-category detail rows.
 */
export function GdprModal(props: ConsentBannerProps) {
  return <ConsentBannerGdprBase {...props} layout="gdpr-modal" />;
}

export default BottomBar;

/**
 * `universal` opts this file into BOTH the server and client component
 * maps the SDK generates — Pages chrome resolves named-export variants
 * client-side.
 */
export const componentType = "universal";
