"use client";

// Self-register this component's CDP events into the runtime catalog.
// See `@/lib/registry/analytics/cdp-events` for the push-based
// registration rationale (replaces the previous static-import design
// in cdp-events.ts that broke any starter not installing every
// event-emitting recipe).
import { registerCdpRecipe } from "@/lib/registry/analytics/cdp-events";
import alertBannerRecipe from "@/recipes/alert-banner.recipe";

registerCdpRecipe(alertBannerRecipe);

import { X } from "@phosphor-icons/react";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/registry/components/ui/cta-button";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/registry/primitives/core/alert";
import { ThemeIcon } from "@/components/registry/primitives/core/theme-icon";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/registry/primitives/core/tooltip";
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
import type { CmsProps } from "@/lib/registry/sitecore";

/**
 * Sitecore field shape for AlertBanner. Owned by this file — no cross-
 * component sharing. Mirrors the recipe's `fields:` block in
 * `alert-banner.recipe.ts`.
 */
export interface AlertBannerFields {
  Title?: TextSource;
  Description?: RichTextSource;
  Link?: LinkSource;
}

/**
 * Meta payload passed to analytics callbacks (and routed via the CDP
 * catalog to `extensionData` / `ext` on the event). Stable across `onView`
 * and `onDismiss` so subscribers can correlate.
 *
 * **For personalization rules** (e.g. "suppress this alert after 3
 * dismissals"), the two stable matching keys are:
 *   - `instanceKey` — author-set human-readable handle (preferred for
 *     audience definitions and dashboards)
 *   - `id` — datasource/rendering id assigned by Sitecore (always present
 *     for catalog-managed instances; opaque GUID)
 *
 * **For scoping** ("count dismissals across the whole site" vs "only on
 * this page"), `instanceScope` tells the personalization side how to
 * partition the event stream:
 *   - `"site"` → match on `instanceKey` alone
 *   - `"page"` → match on `{ instanceKey, pathname }`
 *
 * Pathname/href/referrer are auto-enriched at the provider layer (see
 * `cdp-provider.tsx`) so individual components don't repeat themselves.
 */
export interface AlertBannerAnalyticsMeta {
  /** Datasource / rendering id assigned by Sitecore. Stable but opaque. */
  id?: string;
  /**
   * Author-friendly stable handle for personalization rules, e.g.
   * `"may-2026-announcement"`. When unset the meta sends `id` only —
   * personalization rules then match on the opaque GUID.
   */
  instanceKey?: string;
  /**
   * Whether dismissal/view history should be scoped per-page or shared
   * site-wide. Site-wide is right for system banners (maintenance
   * notice); page-scoped is right for content-specific alerts (campaign
   * promo on the pricing page only).
   */
  instanceScope?: "site" | "page";
  /** Display title at the time of fire. */
  title?: string;
  /** Severity at the time of fire — useful for slicing analytics. */
  colorScheme?:
    | "info"
    | "success"
    | "warning"
    | "destructive"
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
    | "accent-3";
  /** Layout shape at the time of fire — distinguishes toasts from banners. */
  layout?:
    | "full-width"
    | "contained"
    | "toast-start"
    | "toast-center"
    | "toast-end";
}

/**
 * Flat props delivered by `withSitecore`'s default convention:
 *   - `fields.Title` → `title`
 *   - `fields.Description` → `description`
 *   - `fields.Link` → `link`
 *   - `params.Dismissible` → `dismissible` (string "1"/"true" or boolean)
 *   - `params.DismissLabel` → `dismissLabel`
 *
 * `CmsProps` brings `styles`, `id`, `isEditing`, `rendering`.
 *
 * **Analytics:** view + dismiss are wired through `useComponentAnalytics`
 * → the central [[cdp-events]] catalog. Callers can override either
 * callback via `onView` / `onDismiss` to route events into a non-Sitecore
 * analytics stack (Segment, Vercel Analytics, etc.) — overrides bypass
 * the catalog dispatcher entirely.
 */
export interface AlertBannerProps extends CmsProps {
  title?: TextSource;
  description?: RichTextSource;
  link?: LinkSource;
  /**
   * Color scheme for the alert. Maps to the shared `color-scheme@1`
   * enum. Drives the alert background, text color, and (when
   * `ShowIcon` is on) the leading icon. Semantic schemes carry their
   * own icon — `info` → info, `success` → check, `warning` →
   * warning, `destructive` → alert. Brand schemes (primary,
   * secondary, tertiary, accent / accent-2 / accent-3) and `neutral`
   * fall back to a generic info icon.
   */
  colorScheme?:
    | "info"
    | "success"
    | "warning"
    | "destructive"
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
    | "accent-3";
  /** Show the leading icon. Icon is picked by `colorScheme`. */
  showIcon?: string | boolean;
  /**
   * Width + horizontal alignment. `contained` (default) renders a
   * rounded alert within the parent container; `full-width` removes
   * rounding for an edge-to-edge system banner; `toast-*` renders a
   * narrow pill aligned left / center / right.
   */
  layout?:
    | "full-width"
    | "contained"
    | "toast-start"
    | "toast-center"
    | "toast-end";
  /**
   * Title + description placement.
   *
   *   stacked                    title above description (default)
   *   row                        title and description inline on the
   *                              same row
   *   row-with-divider           title in a colored slab on the
   *                              inline-start side, description on
   *                              the pale alert tint; slab end is a
   *                              flush vertical edge
   *   row-with-angled-divider    same as above but the slab ends in
   *                              a slash cut (clip-path polygon) —
   *                              editorial energy lifted from
   *                              SUSE-style news banners
   *
   * The two divider modes flatten into this single axis rather than a
   * separate `slabEndStyle` param because they never matter outside
   * divider compositions. Authors pick one thing.
   */
  composition?:
    | "stacked"
    | "row"
    | "row-with-divider"
    | "row-with-angled-divider";
  /**
   * Placement mode. `inline` (default) flows with the page; `sticky-top`
   * and `sticky-bottom` pin via CSS `position: sticky`. For viewport
   * pinning, place the component near the page root so the scroll
   * container is the page itself.
   */
  position?: "inline" | "sticky-top" | "sticky-bottom";
  /** Show the dismiss button. Accepts Sitecore string booleans. Defaults to true. */
  dismissible?: string | boolean;
  /** Accessible label for the dismiss button. */
  dismissLabel?: string;
  /** Live-region message announced after dismissal. */
  dismissAnnouncement?: string;
  /** How long the dismissal announcement stays in the live region. */
  dismissAnnouncementDurationMs?: number;
  /**
   * Author-friendly stable handle for personalization, e.g.
   * `"may-2026-announcement"`. Flows into every fired event's `ext.instanceKey`.
   * When unset, the meta sends `id` only — personalization rules then have
   * to match on the opaque datasource GUID.
   */
  instanceKey?: string;
  /**
   * Scope of dismissal/view history. `"site"` = same instance across all
   * pages (system banners); `"page"` = page-specific. Defaults to `"site"`
   * — alert banners are usually system-wide notices.
   */
  instanceScope?: "site" | "page";
  /**
   * Per-instance opt-out for analytics fires. Defaults `true` so events
   * flow by default. Set `false` for placements where view/dismiss events
   * would muddy the data (legal notices, accessibility-only banners,
   * single-use placements). Accepts Sitecore string booleans.
   */
  trackEvents?: string | boolean;
  /** Override the default catalog-driven view callback. */
  onView?: (meta: AlertBannerAnalyticsMeta) => void;
  /** Override the default catalog-driven dismiss callback. */
  onDismiss?: (meta: AlertBannerAnalyticsMeta) => void;
}

// Strict allow-list — matches the convention used by tabs-block,
// accordion-block, content-block. Empty/missing/unknown all coerce to
// false so an unchecked Sitecore rendering-param checkbox (which emits
// "" or no value) reliably turns the affordance off.
function isEnabled(value: string | boolean | undefined): boolean {
  if (typeof value === "boolean") return value;
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return ["1", "true", "yes", "on", "enabled"].includes(normalized);
}

/**
 * Dismissible alert bar — the feedback group's reference component.
 *
 * Renders title + optional description + optional CTA link inside a
 * shadcn `Alert`, plus a dismiss button that hides the banner and
 * announces the dismissal via an aria-live region. Authors mark a
 * placement as non-dismissible by setting `Dismissible=false`.
 *
 * Fires a `view` analytics event once when the banner enters the
 * viewport (≥ 50% visible), and a `dismiss` event when the close
 * button is clicked. Both are catalog-routed by default but can be
 * overridden per-placement via `onView` / `onDismiss`.
 *
 * Returns `null` outside editing mode when there's nothing to render
 * (no title, no description) — keeps stray empty bars off the page.
 */
// Contained + toast layouts share the CARD radius token — an alert is a
// card-class surface, and a dedicated toast-radius primitive would be
// vocabulary for vocabulary's sake. Full-width stays square (system
// banner, edge-to-edge).
const CARD_RADIUS_CLASS =
  "rounded-[var(--card-radius,var(--radius-lg,0.75rem))]";

const LAYOUT_CLASSES: Record<
  NonNullable<AlertBannerProps["layout"]>,
  string
> = {
  "full-width": "rounded-none",
  contained: CARD_RADIUS_CLASS,
  // Toast layouts: max-w-md caps width; logical-side auto margins
  // position the element within wider containers and flip correctly
  // under RTL. Vertical-only `my-4` (not shorthand `m-4`) so the auto
  // margins win on the inline axis.
  "toast-start": `${CARD_RADIUS_CLASS} max-w-md me-auto ms-4 my-4`,
  "toast-center": `${CARD_RADIUS_CLASS} max-w-md mx-auto my-4`,
  "toast-end": `${CARD_RADIUS_CLASS} max-w-md ms-auto me-4 my-4`,
};

const POSITION_CLASSES: Record<
  NonNullable<AlertBannerProps["position"]>,
  string
> = {
  inline: "",
  "sticky-top": "sticky top-0 z-40",
  "sticky-bottom": "sticky bottom-0 z-40",
};

// Saturated colored slab used by the `row-with-divider` composition.
// The alert root paints a pale tint (`bg-{scheme}-background`); the
// title slab uses the matching saturated tokens so the two sections
// read as a two-tone bar — pattern lifted from SUSE's news banner.
const TITLE_SLAB_CLASSES: Record<
  NonNullable<AlertBannerProps["colorScheme"]>,
  string
> = {
  info: "bg-info text-info-foreground",
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
  destructive: "bg-destructive text-destructive-foreground",
  none: "bg-transparent text-current",
  white: "bg-theme-white text-theme-black",
  black: "bg-theme-black text-theme-white",
  neutral: "bg-neutral text-neutral-foreground",
  primary: "bg-primary text-primary-foreground",
  "primary-gradient":
    "bg-gradient-to-br from-primary to-secondary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  "secondary-gradient":
    "bg-gradient-to-br from-secondary to-accent text-secondary-foreground",
  tertiary: "bg-tertiary text-tertiary-foreground",
  accent: "bg-accent text-accent-foreground",
  "accent-2": "bg-accent-2 text-accent-2-foreground",
  "accent-3": "bg-accent-3 text-accent-3-foreground",
};

// Description (body copy) color per scheme. Tinted schemes use
// `text-muted-foreground` — the Alert primitive's tint variants carry
// the `surface-tinted` remap, so muted re-derives from the role color
// and stays readable on the pale tint. The previous treatment (the
// SATURATED role color + opacity-90) failed contrast on many roles —
// saturated-on-own-tint is a title treatment, not a body-copy one.
// Solid fills (white / black / gradients) inherit the variant's own
// foreground via `text-current`.
const DESCRIPTION_TEXT_CLASSES: Record<
  NonNullable<AlertBannerProps["colorScheme"]>,
  string
> = {
  info: "text-muted-foreground",
  success: "text-muted-foreground",
  warning: "text-muted-foreground",
  destructive: "text-muted-foreground",
  none: "text-current",
  white: "text-theme-black",
  black: "text-theme-white",
  neutral: "text-muted-foreground",
  primary: "text-muted-foreground",
  "primary-gradient": "text-current",
  secondary: "text-muted-foreground",
  "secondary-gradient": "text-current",
  tertiary: "text-muted-foreground",
  accent: "text-muted-foreground",
  "accent-2": "text-muted-foreground",
  "accent-3": "text-muted-foreground",
};

// Icon name per colorScheme — mirrors the Alert primitive's
// `variantIcons` map. The primitive's own icon column is suppressed in
// EVERY composition and the icon is rendered manually next to the
// title instead: divider mode puts it inside the colored slab, and
// stacked/row put it on the title line. The primitive's grid column
// pins the icon to the alert's far start edge, which decouples it from
// the title once StandardBody centers its content in a max-w-7xl
// wrapper (full-width / contained at wide viewports).
const ICON_NAMES: Record<
  NonNullable<AlertBannerProps["colorScheme"]>,
  string
> = {
  info: "info",
  success: "check",
  warning: "warning",
  destructive: "alert",
  none: "info",
  white: "info",
  black: "info",
  neutral: "info",
  primary: "info",
  "primary-gradient": "info",
  secondary: "info",
  "secondary-gradient": "info",
  tertiary: "info",
  accent: "info",
  "accent-2": "info",
  "accent-3": "info",
};

type DividerBodyProps = {
  composition: NonNullable<AlertBannerProps["composition"]>;
  colorScheme: AlertBannerProps["colorScheme"];
  styles: AlertBannerProps["styles"];
  isAngledSlab: boolean;
  /**
   * `row` composition reuses this exact layout with the slab's colored
   * background turned off — same geometry (title block start-aligned,
   * description + actions stacked to its end side, toast-safe vertical
   * stacking), no two-tone treatment. Keeping one row layout is what
   * fixes the old StandardBody row's clipped title, misaligned
   * icon/title/description/dismiss, and toast overflow in one place.
   */
  slabTransparent: boolean;
  slabIconName: string | null;
  slabClipPath: string | undefined;
  title: AlertBannerProps["title"];
  description: AlertBannerProps["description"];
  isEditing: AlertBannerProps["isEditing"];
  canDismiss: boolean;
  layout: NonNullable<AlertBannerProps["layout"]>;
  hasLink: boolean;
  linkButton: ReactNode;
  dismissButton: ReactNode;
};

function DividerBody({
  composition,
  colorScheme,
  styles,
  isAngledSlab,
  slabTransparent,
  slabIconName,
  slabClipPath,
  title,
  description,
  isEditing,
  canDismiss,
  layout,
  hasLink,
  linkButton,
  dismissButton,
}: DividerBodyProps) {
  // Divider mode owns its own JSX shape: the slab always sits on
  // the inline-start edge (even on mobile), and description +
  // actions stack to its inline-end side. Mobile keeps a
  // single row instead of stacking the slab above so the alert
  // height stays compact when actions or copy wrap.
  return (
    <div
      className={cn(
        "col-start-2 flex w-full flex-row items-stretch",
        styles?.trimEnd(),
      )}
      data-composition={composition}
    >
      <AlertTitle
        className={cn(
          // `leading-tight`, not `leading-none` — the combination of
          // leading-none and the alert root's divider-mode
          // `overflow-hidden` clipped title descenders (g/y/p) at the
          // bottom edge.
          "flex shrink-0 items-center gap-2 px-4 py-3 font-heading font-semibold text-base leading-tight tracking-tight",
          // Min-widths give the colored slab breathing room when it
          // carries an icon + title in narrow contexts (mobile, toast
          // layouts). Without these the slab collapses to its content
          // width and the icon ends up cramped against the
          // description. The transparent (plain `row`) mode has no
          // slab to shape, so the title just sizes to content.
          !slabTransparent &&
            (slabIconName ? "min-w-32 sm:min-w-40" : "min-w-24 sm:min-w-32"),
          // Trailing visual gap between slab and right-side stack.
          slabTransparent ? "me-0" : "me-4",
          // Angled end-style: slash from top-end inward to
          // bottom-end. Extra trailing padding so the slash
          // doesn't bite into the title text.
          isAngledSlab && "pe-10",
          !slabTransparent && colorScheme && TITLE_SLAB_CLASSES[colorScheme],
        )}
        // Inline style for clip-path because Tailwind's arbitrary
        // value escaping doesn't reliably handle the polygon's
        // commas. `dir="rtl"` overrides via the [dir] selector
        // would mirror the cut, but a CSS-only approach via the
        // closest [dir] attribute works without per-cluster
        // tooling. For now, LTR-only — RTL gets a square slab.
        style={slabClipPath ? { clipPath: slabClipPath } : undefined}
      >
        {slabIconName ? (
          <ThemeIcon
            name={slabIconName}
            className="size-4 shrink-0 text-current"
            aria-hidden="true"
          />
        ) : null}
        <Text
          value={title}
          tag="span"
          placeholder="Title"
          isEditing={isEditing}
        />
      </AlertTitle>

      <div
        className={cn(
          // Relative so the dismiss X can absolutely anchor at the
          // top-end corner inside it without escaping the alert.
          "relative flex min-w-0 flex-1 flex-col gap-2 py-3",
          // Trailing padding gives room for the absolute X. Even
          // when there's no dismiss button the padding stays — it
          // visually balances the start-side slab.
          canDismiss ? "pe-12" : "pe-4",
          // Toast layouts are capped at max-w-md (~28rem) regardless
          // of viewport width, so Tailwind's `sm:` (viewport-based)
          // would incorrectly switch them to row at desktop sizes —
          // the alert itself is narrow, the actions get crammed
          // beside the description, and the right side overflows.
          // For toast we keep the stack vertical at every size;
          // for full-width / contained, sm+ gets the row treatment.
          !layout?.startsWith("toast-") &&
            "sm:flex-row sm:items-center sm:justify-between sm:gap-4",
        )}
      >
        <AlertDescription
          // No opacity dilution — the muted-derived description color
          // already encodes de-emphasis; stacking opacity on top of it
          // is what pushed several schemes under readable contrast.
          className={cn(
            "min-w-0 flex-1 text-sm",
            colorScheme && DESCRIPTION_TEXT_CLASSES[colorScheme],
          )}
        >
          <RichText
            value={description}
            placeholder="Description"
            isEditing={isEditing}
          />
        </AlertDescription>
        {hasLink ? (
          <div className="flex shrink-0 items-center gap-2">{linkButton}</div>
        ) : null}
        {dismissButton ? (
          // Absolute in the reserved `pe-12` end column, vertically
          // centered so the X lines up with the text (top-anchoring
          // left it riding high next to the centered single-line
          // description). Pulled out of the flex flow so it doesn't
          // displace the description or get pushed below the link in
          // vertical stacks.
          <div className="absolute inset-y-0 end-2 z-10 flex items-center">
            {dismissButton}
          </div>
        ) : null}
      </div>
    </div>
  );
}

type StandardBodyProps = {
  composition: NonNullable<AlertBannerProps["composition"]>;
  colorScheme: AlertBannerProps["colorScheme"];
  styles: AlertBannerProps["styles"];
  /** Icon rendered inline with the title (null = icon off). */
  iconName: string | null;
  title: AlertBannerProps["title"];
  description: AlertBannerProps["description"];
  isEditing: AlertBannerProps["isEditing"];
  hasLink: boolean;
  linkButton: ReactNode;
  dismissButton: ReactNode;
};

/**
 * Body for the `stacked` composition only — every row-shaped
 * composition (`row`, `row-with-divider`, `row-with-angled-divider`)
 * renders through `DividerBody`, which owns the row geometry (the old
 * StandardBody row branch clipped titles, misaligned the icon/title
 * against the description/dismiss, and overflowed in toast layouts).
 */
function StandardBody({
  composition,
  colorScheme,
  styles,
  iconName,
  title,
  description,
  isEditing,
  hasLink,
  linkButton,
  dismissButton,
}: StandardBodyProps) {
  return (
    <div
      className={cn(
        // `md:` (not `sm:`) for the actions-beside-copy breakpoint —
        // narrower viewports get the safer stacked form rather than a
        // cramped row that wraps mid-line. `pe-10` on small widths
        // reserves space for the absolutely-positioned dismiss X
        // so the title/description don't underrun the corner.
        "relative col-start-2 mx-auto flex w-full max-w-7xl flex-col justify-between gap-4 py-1 pe-10 md:flex-row md:items-center md:pe-0 xl:px-8",
        styles?.trimEnd(),
      )}
    >
      <div className="space-y-1" data-composition={composition}>
        <AlertTitle
          className={cn(
            "font-heading font-semibold text-base leading-tight tracking-tight",
            // Icon rides ON the title line (flex-coupled) instead of
            // the Alert primitive's far-start grid column — keeps
            // icon + title together inside the centered max-w-7xl
            // wrapper. Same manual-icon treatment as the divider slab.
            iconName && "flex items-center gap-2",
          )}
        >
          {iconName ? (
            <ThemeIcon
              name={iconName}
              className="size-4 shrink-0 text-current"
              aria-hidden="true"
            />
          ) : null}
          <Text
            value={title}
            tag="span"
            placeholder="Title"
            isEditing={isEditing}
          />
        </AlertTitle>
        <AlertDescription
          className={cn(
            "text-sm",
            colorScheme && DESCRIPTION_TEXT_CLASSES[colorScheme],
          )}
        >
          <RichText
            value={description}
            placeholder="Description"
            isEditing={isEditing}
          />
        </AlertDescription>
      </div>
      {/*
        Trailing actions group. `md:ms-auto` keeps the entire group
        anchored to the inline-end edge at the row breakpoint, no
        matter how many children sit inside the title-content block
        — `justify-between` alone gave the wrong layout when both
        link AND dismiss were present (justify-between drops the
        middle child into the empty space). With ms-auto on the
        group, every variant ends up cleanly end-aligned at md+,
        and the absolute-positioning rule for dismiss on stacked
        layouts (below md) keeps the X anchored top-end without
        displacing content.
      */}
      {hasLink || dismissButton ? (
        <div className="flex items-center gap-2 md:ms-auto">
          {hasLink ? linkButton : null}
          {dismissButton ? (
            // Stacked anchors the X to the alert's top-end corner on
            // small widths (the title/description/link stack below it
            // and a centered X would land mid-stack); md+ returns it
            // to the inline actions row.
            <div className="absolute end-2 top-2 z-10 md:static md:end-auto md:top-auto md:self-center">
              {dismissButton}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function Default({
  title,
  description,
  link,
  colorScheme,
  // Boolean rendering parameters (showIcon, dismissible, trackEvents)
  // intentionally have NO React-side default. Sitecore drives them via
  // the rendering parameters template's `__Standard Values` (compiled
  // from each recipe param's `default:`). Defaulting on this side would
  // mask the author's "uncheck" action when Sitecore Pages serializes
  // unchecked as `""` or omits the key entirely — `isEnabled(undefined)`
  // correctly resolves to `false`, but only if React doesn't pre-fill
  // the prop first.
  showIcon,
  layout = "contained",
  composition = "stacked",
  position = "inline",
  dismissible,
  dismissLabel = "Dismiss",
  dismissAnnouncement = "Alert dismissed",
  dismissAnnouncementDurationMs = 1000,
  instanceKey,
  instanceScope = "site",
  trackEvents,
  styles,
  id,
  isEditing,
  onView,
  onDismiss,
}: AlertBannerProps) {
  const [isHidden, setIsHidden] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const hasFiredViewRef = useRef(false);
  const analytics =
    useComponentAnalytics<AlertBannerAnalyticsMeta>("alert-banner");

  const canDismiss = isEnabled(dismissible);
  const hasTitle = title != null && !isEmptySource(title);
  const hasDescription = description != null && !isEmptySource(description);
  const hasLink = link != null && !isEmptySource(link);

  // Stable meta payload for analytics. `instanceKey` resolves in priority
  // order:
  //   1. explicit `InstanceKey` rendering parameter (preferred — survives
  //      title edits)
  //   2. the title text (sensible default for the common case where the
  //      author hasn't picked a stable handle — caveat: changing the
  //      title silently resegments personalization counters)
  //   3. the datasource `id` (opaque GUID, always present for catalog-
  //      managed instances)
  const meta = useMemo<AlertBannerAnalyticsMeta>(() => {
    const titleText = getSourceText(title);
    return {
      id,
      instanceKey: instanceKey || titleText || id,
      instanceScope,
      title: titleText,
      colorScheme,
      layout,
    };
  }, [id, instanceKey, instanceScope, title, colorScheme, layout]);

  const eventsEnabled = isEnabled(trackEvents);

  // Default callbacks route through the catalog; explicit overrides win.
  // When `TrackEvents=false`, the catalog dispatcher is skipped entirely;
  // explicit `onView` / `onDismiss` overrides STILL fire so consumer
  // analytics stacks (Segment, Vercel Analytics) keep working — the
  // opt-out only suppresses the Sitecore CDP catalog path.
  // view fires through the Content SDK's pageView() via the catalog's
  // cdpEventType: "VIEW" routing in trackCdpEvent.
  const handleView = useCallback(() => {
    if (onView) onView(meta);
    else if (eventsEnabled) analytics.fire("view", meta);
  }, [analytics, eventsEnabled, meta, onView]);

  const handleDismiss = useCallback(() => {
    if (onDismiss) onDismiss(meta);
    else if (eventsEnabled) analytics.fire("dismiss", meta);
  }, [analytics, eventsEnabled, meta, onDismiss]);

  // Fire `view` once when the banner is ≥ 50% visible. Skips editing
  // mode (authoring previews shouldn't count as impressions) and skips
  // entirely when neither catalog nor onView override is active.
  // Bails out gracefully when IntersectionObserver isn't available
  // (jsdom in tests, ancient browsers in prod).
  useEffect(() => {
    if (isEditing) return;
    if (!eventsEnabled && !onView) return;
    if (hasFiredViewRef.current) return;
    const node = rootRef.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Re-entry guard: `observer.disconnect()` prevents subsequent
        // callbacks in a real browser, but in test environments (where
        // the callback is invoked directly), the ref check is what
        // actually enforces fire-once semantics.
        if (hasFiredViewRef.current) return;
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            hasFiredViewRef.current = true;
            handleView();
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [handleView, isEditing, eventsEnabled, onView]);

  if (!hasTitle && !hasDescription && !isEditing) return null;
  if (isHidden && !isEditing) return null;

  // The Alert primitive's own icon column is suppressed in EVERY
  // composition (see ICON_NAMES) and the icon renders manually next to
  // the title: inside the colored slab in divider mode (where its
  // contrast token — the slab foreground — reads correctly), on the
  // title line in stacked/row (where the primitive's far-start grid
  // column would decouple it from the centered content).
  const iconEnabled = isEnabled(showIcon);
  // Both divider variants share the slab-vs-tint layout. The angle
  // is purely a slab end-shape modifier folded into the composition
  // axis so authors pick one thing instead of remembering a separate
  // SlabEndStyle param that only matters in divider mode.
  const isAngledSlab = composition === "row-with-angled-divider";
  const isDividerComposition =
    composition === "row-with-divider" || isAngledSlab;
  // Plain `row` renders through the SAME body as the divider modes,
  // just without the slab's colored background — one row layout to
  // maintain, and row inherits the divider layout's toast-safe
  // stacking + dismiss anchoring for free. StandardBody only handles
  // `stacked` now.
  const isRowLike = composition === "row" || isDividerComposition;
  const iconName = iconEnabled ? ICON_NAMES[colorScheme ?? "none"] : null;
  const slabIconName = isRowLike ? iconName : null;
  const standardIconName = isRowLike ? null : iconName;
  // Angled-slab clip-path. The slash goes from the slab's inline-end
  // edge at the top inward by ~2.5rem to the inline-end edge at the
  // bottom — a dramatic `/` cut that gives the slab editorial energy.
  // Bumps the slab's trailing padding so the cut doesn't bite text.
  // LTR-only for now; RTL gets a square slab (CSS clip-path has no
  // logical-direction syntax — would need a `dir`-aware swap).
  const slabClipPath = isAngledSlab
    ? "polygon(0 0, 100% 0, calc(100% - 2.5rem) 100%, 0 100%)"
    : undefined;

  // Link button (the CTA part of the actions row). Renders as a real
  // button when a Sitecore link is present; otherwise falls through
  // to the bare Link primitive's editing placeholder.
  // Outline CTA shape. `no-underline` (and hover counterpart) defeat the
  // global anchor-underline that bleeds through when Button wraps an
  // anchor via `asChild` — the wrapping Button styles need to win.
  const linkButton = hasLink ? (
    <Button
      asChild
      size="sm"
      variant="outline"
      colorScheme={colorScheme}
      className="no-underline hover:no-underline"
    >
      <Link value={link} />
    </Button>
  ) : (
    <Link value={link} placeholder="Link" isEditing={isEditing} />
  );

  // Dismiss X. Split out from the link so divider/toast layouts can
  // anchor the X at the alert's top-end corner (independent of the
  // link, which stacks with the description on narrow widths).
  const dismissButton = canDismiss ? (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          colorScheme={colorScheme}
          onClick={() => {
            setIsHidden(true);
            setAnnouncement(dismissAnnouncement);
            setTimeout(
              () => setAnnouncement(""),
              dismissAnnouncementDurationMs,
            );
            handleDismiss();
          }}
          aria-label={dismissLabel}
        >
          <X className="size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{dismissLabel}</TooltipContent>
    </Tooltip>
  ) : null;

  return (
    <Alert
      ref={rootRef}
      className={cn(
        "component alert-banner relative border-none",
        // Row-like modes zero the alert root's own px-4 py-3 so each
        // section (slab / description / actions) owns its padding
        // explicitly. With the alert root padded, the earlier negative-
        // margin trick failed to make the slab fill the alert's full
        // height — items-stretch caps slab height at the wrapper's
        // content height, and -my-3 only extends visual position, not
        // rendered height. Zeroing root padding makes the slab a true
        // edge-to-edge band. Plain `row` shares the body (transparent
        // slab), so it needs the same zeroing or paddings double up.
        isRowLike && "overflow-hidden p-0",
        LAYOUT_CLASSES[layout],
        POSITION_CLASSES[position],
      )}
      id={id}
      data-slot="alert-banner"
      data-color-scheme={colorScheme}
      data-layout={layout}
      data-position={position}
      variant={colorScheme}
      showIcon={false}
    >
      {isRowLike ? (
        <DividerBody
          composition={composition}
          colorScheme={colorScheme}
          styles={styles}
          isAngledSlab={isAngledSlab}
          slabTransparent={!isDividerComposition}
          slabIconName={slabIconName}
          slabClipPath={slabClipPath}
          title={title}
          description={description}
          isEditing={isEditing}
          canDismiss={canDismiss}
          layout={layout}
          hasLink={hasLink}
          linkButton={linkButton}
          dismissButton={dismissButton}
        />
      ) : (
        <StandardBody
          composition={composition}
          colorScheme={colorScheme}
          styles={styles}
          iconName={standardIconName}
          title={title}
          description={description}
          isEditing={isEditing}
          hasLink={hasLink}
          linkButton={linkButton}
          dismissButton={dismissButton}
        />
      )}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>
    </Alert>
  );
}

export const componentType = "universal";
