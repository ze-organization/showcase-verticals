"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  EmailIcon,
  EmailShareButton,
  FacebookIcon,
  FacebookShareButton,
  LinkedinIcon,
  LinkedinShareButton,
  PinterestIcon,
  PinterestShareButton,
  RedditIcon,
  RedditShareButton,
  TelegramIcon,
  TelegramShareButton,
  TwitterShareButton,
  WhatsappIcon,
  WhatsappShareButton,
  XIcon,
} from "react-share";
import { Button } from "@/components/registry/components/ui/cta-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/registry/primitives/core/dropdown-menu";
import { LibraryIcon } from "@/components/registry/primitives/core/library-icon";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/registry/primitives/core/tooltip";
import { registerCdpRecipe } from "@/lib/registry/analytics/cdp-events";
import { useComponentAnalytics } from "@/lib/registry/analytics/use-component-analytics";
import { cn } from "@/lib/registry/cn";
import type { CmsProps } from "@/lib/registry/sitecore";
import socialShareRecipe from "@/recipes/social-share.recipe";

// Self-register this component's CDP events into the runtime catalog
// via the push-based registerCdpRecipe pattern.
registerCdpRecipe(socialShareRecipe);

/**
 * Sitecore field shape for SocialShare. Owned by this file — no cross-
 * component sharing. Mirrors the recipe's `fields:` block in
 * `social-share.recipe.ts`.
 */
/**
 * Sitecore datasource field shape. Only Platforms lives on the
 * datasource now — every content value (URL / title / description /
 * media) comes from the live page context. See `usePageShareContext`.
 *
 * `Platforms` is a Treelist sourced from the `social-platform@1`
 * enum, so each picked value arrives as a linked item with its
 * enum-value template fields. `Name` (the item name in Sitecore) is
 * the enum value's `name` from the recipe — that's the same string
 * the React component dispatches on (`SocialPlatform`).
 */
interface SocialPlatformLinkedItem {
  id?: string;
  name?: string;
  fields?: { Value?: { value?: string } };
}
export interface SocialShareFields {
  Platforms?: SocialPlatformLinkedItem[];
}

/**
 * Platform tokens recognized by the `Platforms` rendering parameter and
 * the `platforms` prop. Order is honored; unknown tokens are skipped.
 *
 *   native      Web Share API trigger — opens the OS share sheet on
 *               supported browsers (mobile first). Falls back silently
 *               on browsers without `navigator.share`.
 *   copy-link   Clipboard copy with a transient "Copied!" announcement.
 *   facebook    facebook.com/sharer — URL only; FB scrapes og: tags.
 *   x           twitter.com/intent — honors text/hashtags/via params.
 *   linkedin    linkedin.com/sharing — URL only; LI scrapes og: tags.
 *   pinterest   pinterest.com/pin/create — REQUIRES mediaUrl.
 *   reddit      reddit.com/submit — honors title.
 *   whatsapp    api.whatsapp.com/send — text + URL concatenated.
 *   telegram    t.me/share/url — honors title + URL.
 *   email       mailto: — opens the user's mail client.
 */
export type SocialPlatform =
  | "native"
  | "copy-link"
  | "facebook"
  | "x"
  | "linkedin"
  | "pinterest"
  | "reddit"
  | "whatsapp"
  | "telegram"
  | "email";

const KNOWN_PLATFORMS: readonly SocialPlatform[] = [
  "native",
  "copy-link",
  "facebook",
  "x",
  "linkedin",
  "pinterest",
  "reddit",
  "whatsapp",
  "telegram",
  "email",
];

const DEFAULT_PLATFORMS: readonly SocialPlatform[] = KNOWN_PLATFORMS;

/**
 * Icon-chip visual treatment — backs the `social-share-icon-style@1`
 * enum:
 *
 *   native        Each network's own brand color (react-share default).
 *   color-scheme  Chip painted with the selected ColorScheme role —
 *                 solid `bg-<X>` chip + `text-<X>-foreground` glyph
 *                 (the color-roles solid-surface pairing).
 *   outline       Outlined chip: transparent fill, ring + glyph in the
 *                 scheme color (`text-<X>`).
 */
export type SocialShareIconStyle = "native" | "color-scheme" | "outline";

/**
 * Which parts of each platform button render — backs the
 * `social-display@1` enum
 * (truthy → `icons-and-labels`, falsy → `icons-only`).
 *
 *   icons-only        Icon chips, sr-only labels, tooltips (default —
 *                     the default read).
 *   labels-only       Accessible text-only links; no icon chip.
 *   icons-and-labels  Icon chip + visible label. The ColorScheme tints
 *                     the chip ONLY — the label stays neutral page text.
 */
export type SocialShareDisplay =
  | "icons-only"
  | "labels-only"
  | "icons-and-labels";

export interface SocialShareAnalyticsMeta {
  /** Datasource / rendering id assigned by Sitecore. Stable but opaque. */
  id?: string;
  /** Author-friendly stable handle for personalization rules. */
  instanceKey?: string;
  /** Whether view/event history is scoped per-page or shared site-wide. */
  instanceScope?: "site" | "page";
  /** The platform token for `opened` events. Absent on `copied` / `native-shared`. */
  platform?: SocialPlatform;
  /** The URL that was actually shared (resolved page URL or author override). */
  sharedUrl?: string;
  /** Title at the time of share — surfaced for analytics slicing. */
  title?: string;
}

/**
 * Flat props delivered by `withSitecore`'s default convention:
 *   - `fields.Platforms` → `platforms` (Treelist of `social-platform@1` items)
 *   - `params.IconStyle` → `iconStyle`
 *   - `params.Vertical` → `vertical`
 *   - `params.Display` → `display`
 *   - `params.Size` → `size`
 *   - `params.ColorScheme` → `colorScheme`
 *   - `params.Position` → `position`
 *   - `params.InstanceKey` → `instanceKey`
 *   - `params.InstanceScope` → `instanceScope`
 *   - `params.TrackEvents` → `trackEvents`
 *
 * URL / Title / Description / MediaUrl are NOT datasource fields any
 * more — `usePageShareContext()` reads them from the live page
 * (document.title, og: meta tags, current pathname) so a single
 * placement on a shared partial design works for every page. The
 * earlier `fields.Url` / `fields.Title` / `fields.Description` /
 * `fields.MediaUrl` / `fields.Hashtags` / `fields.Via` are gone.
 *
 * `CmsProps` brings `styles`, `id`, `isEditing`, `rendering`.
 */
export interface SocialShareProps extends CmsProps {
  /**
   * Platforms allowlist. Two input shapes:
   *
   *   - `SocialPlatform[]`   — already-parsed array (preferred for
   *     standalone usage)
   *   - `SocialPlatformLinkedItem[]` — Layout Service Treelist shape
   *     (each item's `name` is the enum value's token)
   *
   * Datasource-bound (not a rendering parameter) so authors pick
   * platforms once per shared placement, not per page.
   */
  platforms?: SocialPlatform[] | SocialPlatformLinkedItem[];
  /**
   * Render the `Menu` variant's dropdown already open. Preview seam
   * only — the menu is Radix-portalled and absent from the DOM until a
   * gesture opens it, so a static preview paints a bare trigger and the
   * share targets can never be seen or measured.
   */
  defaultOpen?: boolean;
  /** Icon-chip treatment (`social-share-icon-style@1`). */
  iconStyle?: SocialShareIconStyle;
  /** Stack vertically. Accepts Sitecore string booleans. */
  vertical?: string | boolean;
  /**
   * Which parts of each platform button render. Backs the `Display`
   * rendering parameter (`social-display@1`).
   */
  display?: SocialShareDisplay;
  size?: "default" | "xs" | "sm" | "md" | "lg" | "xl";
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
  position?: "inline" | "sticky-top" | "sticky-bottom";
  /**
   * See container.tsx — same vertical-padding axis. The row's real
   * default is `none` (the recipe default; the wrapping section
   * provides spacing).
   */
  paddingY?: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
  instanceKey?: string;
  instanceScope?: "site" | "page";
  /** Per-instance opt-out for analytics fires. Accepts Sitecore string booleans. */
  trackEvents?: string | boolean;
  /** Label for the share trigger (Menu variant only). */
  triggerLabel?: string;
  /** Override the default catalog-driven `opened` callback. */
  onShareOpen?: (meta: SocialShareAnalyticsMeta) => void;
  /** Override the default catalog-driven `copied` callback. */
  onCopyLink?: (meta: SocialShareAnalyticsMeta) => void;
  /** Override the default catalog-driven `native-shared` callback. */
  onNativeShare?: (meta: SocialShareAnalyticsMeta) => void;
}

// Strict allow-list — matches alert-banner / tabs-block / content-block.
// Empty/missing/unknown coerce to false so an unchecked rendering-param
// checkbox (which emits "" or no value) reliably turns the affordance off.
function isEnabled(value: string | boolean | undefined): boolean {
  if (typeof value === "boolean") return value;
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return ["1", "true", "yes", "on", "enabled"].includes(normalized);
}

// Extract a platform token from a raw value that might be:
//   - A SocialPlatform string token (already normalised)
//   - A Layout Service Treelist linked-item — read `name` (the
//     enum value's recipe-side `name`, e.g. "facebook"), falling
//     back to `fields.Value.value` if a custom Value field is
//     populated. Lowercased + trimmed before the known-list check
//     so a stray capitalised author choice still resolves.
function extractPlatformToken(
  entry: SocialPlatform | SocialPlatformLinkedItem,
): SocialPlatform | null {
  if (typeof entry === "string") {
    const token = entry.trim().toLowerCase() as SocialPlatform;
    return KNOWN_PLATFORMS.includes(token) ? token : null;
  }
  if (entry == null || typeof entry !== "object") return null;
  const name = entry.name ?? entry.fields?.Value?.value;
  if (!name) return null;
  const token = String(name).trim().toLowerCase() as SocialPlatform;
  return KNOWN_PLATFORMS.includes(token) ? token : null;
}

function parsePlatforms(
  raw: SocialPlatform[] | SocialPlatformLinkedItem[] | undefined,
): readonly SocialPlatform[] {
  if (!Array.isArray(raw)) return DEFAULT_PLATFORMS;
  const seen = new Set<SocialPlatform>();
  const ordered: SocialPlatform[] = [];
  for (const entry of raw) {
    const token = extractPlatformToken(entry);
    if (token && !seen.has(token)) {
      seen.add(token);
      ordered.push(token);
    }
  }
  return ordered.length ? ordered : DEFAULT_PLATFORMS;
}

/**
 * Per-instance Url override + Hashtags field are no
 * longer modeled on the datasource (page-derived now).
 */

const SIZE_PX: Record<NonNullable<SocialShareProps["size"]>, number> = {
  xs: 20,
  sm: 24,
  md: 32,
  default: 32,
  lg: 40,
  xl: 48,
};

/**
 * Map the social-share `size@1` value (xs / sm / md / default / lg /
 * xl) onto the Button primitive's size axis (xs / sm / default / lg
 * + icon-* for square-only). Button has no xl entry, so xl collapses
 * to lg (largest filled size). Drives both the Menu trigger and the
 * per-platform buttons inside so the visual stays cohesive.
 */
type ButtonSize = "default" | "lg" | "sm" | "xs";
const SIZE_TO_BUTTON: Record<
  NonNullable<SocialShareProps["size"]>,
  ButtonSize
> = {
  xs: "xs",
  sm: "sm",
  md: "default",
  default: "default",
  lg: "lg",
  xl: "lg",
};

type SocialShareColorScheme = NonNullable<SocialShareProps["colorScheme"]>;

/**
 * Normalize the `iconStyle` input onto the three-value style axis.
 * Unset and unknown values land on the brand-colored default.
 */
function normalizeIconStyle(
  raw: SocialShareIconStyle | undefined,
): SocialShareIconStyle {
  return raw === "color-scheme" || raw === "outline" ? raw : "native";
}

/** Resolve the display axis; `icons-only` is the default read. */
function resolveDisplay(
  display: SocialShareDisplay | undefined,
): SocialShareDisplay {
  if (
    display === "icons-only" ||
    display === "labels-only" ||
    display === "icons-and-labels"
  ) {
    return display;
  }
  return "icons-only";
}

/**
 * Map IconStyle onto the Button variant axis for the Menu trigger.
 *   - `native` / `color-scheme` → filled CTA (the Button pairs
 *     `bg-<X>` with `text-<X>-foreground` internally).
 *   - `outline` → outline border, scheme text.
 */
function iconStyleToButtonVariant(
  iconStyle: SocialShareIconStyle,
): "default" | "outline" {
  return iconStyle === "outline" ? "outline" : "default";
}

/**
 * Solid chip treatment per scheme — the color-roles SOLID pairing:
 * `bg-<X>` MUST pair with `text-<X>-foreground` on the same element
 * (the glyph inherits via currentColor). `none` is the explicit
 * transparent chip (page-foreground glyph, no fill); `white`/`black`
 * use the theme's own white/black
 * token pair; gradients pair the FROM color's foreground per the
 * color-roles gradient rule.
 */
const SOLID_CHIP_CLASSES: Record<SocialShareColorScheme, string> = {
  none: "text-foreground",
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
  info: "bg-info text-info-foreground",
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
  destructive: "bg-destructive text-destructive-foreground",
};

/**
 * Outline chip ink per scheme — transparent fill, so the color-roles
 * contract requires the plain role token (`text-<X>`), never
 * `text-<X>-foreground`. The ring is drawn in `currentColor` (SVG
 * stroke for react-share icons, `border-current` for the app chips) so
 * it always matches the glyph. Gradients fall back to their FROM color.
 */
const OUTLINE_CHIP_TEXT_CLASSES: Record<SocialShareColorScheme, string> = {
  none: "text-foreground",
  white: "text-theme-white",
  black: "text-theme-black",
  neutral: "text-neutral",
  primary: "text-primary",
  "primary-gradient": "text-primary",
  secondary: "text-secondary",
  "secondary-gradient": "text-secondary",
  tertiary: "text-tertiary",
  accent: "text-accent",
  "accent-2": "text-accent-2",
  "accent-3": "text-accent-3",
  info: "text-info",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
};

const POSITION_CLASSES: Record<
  NonNullable<SocialShareProps["position"]>,
  string
> = {
  inline: "",
  "sticky-top": "sticky top-0 z-40",
  "sticky-bottom": "sticky bottom-0 z-40",
};

// Mirrors container.tsx PADDING_Y_CLASSES.
const PADDING_Y_CLASSES: Record<
  NonNullable<SocialShareProps["paddingY"]>,
  string
> = {
  none: "py-0",
  sm: "py-4",
  md: "py-8",
  lg: "py-12",
  xl: "py-20",
  "2xl": "py-32",
};

const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  native: "Share",
  "copy-link": "Copy link",
  facebook: "Facebook",
  x: "X",
  linkedin: "LinkedIn",
  pinterest: "Pinterest",
  reddit: "Reddit",
  whatsapp: "WhatsApp",
  telegram: "Telegram",
  email: "Email",
};

/**
 * react-share icon prop bag that drives the SVG treatment. `native` is
 * react-share's brand-colored default. `color-scheme` strips the brand
 * fill entirely — the SURROUNDING chip `<span>` paints the circle via
 * `SOLID_CHIP_CLASSES` and the glyph inherits `currentColor`
 * (`text-<X>-foreground` on the same painted element, per the
 * color-roles contract). `outline` keeps the fill transparent and draws
 * the ring as an SVG stroke in `currentColor` (`text-<X>` from
 * `OUTLINE_CHIP_TEXT_CLASSES`).
 */
function iconProps(iconStyle: SocialShareIconStyle, pxSize: number) {
  if (iconStyle === "color-scheme") {
    return {
      size: pxSize,
      iconFillColor: "currentColor",
      bgStyle: { fill: "transparent" } as const,
      round: true,
    };
  }
  if (iconStyle === "outline") {
    return {
      size: pxSize,
      iconFillColor: "currentColor",
      bgStyle: {
        fill: "transparent",
        stroke: "currentColor",
        strokeWidth: 1,
      } as const,
      round: true,
    };
  }
  return { size: pxSize, round: true } as const;
}

// ---------------------------------------------------------------------------
// Shared core — resolves URL, builds meta, exposes click handlers.
// Variant-specific JSX wraps this.
// ---------------------------------------------------------------------------

interface ShareCore {
  resolvedUrl: string;
  resolvedTitle: string;
  resolvedDescription: string;
  resolvedMedia: string;
  resolvedHashtags: string[];
  resolvedVia: string;
  platforms: readonly SocialPlatform[];
  /** Normalized style axis. */
  iconStyle: SocialShareIconStyle;
  /**
   * Resolved color scheme for the icon chips + Menu trigger — the
   * ColorScheme param (recipe default `neutral`).
   */
  scheme: SocialShareColorScheme;
  pxSize: number;
  /** Mapped Button size for the trigger + in-menu buttons. */
  buttonSize: ButtonSize;
  /** Mapped Button variant for the Menu trigger. */
  buttonVariant: "default" | "outline";
  fireOpen: (platform: SocialPlatform) => void;
  fireCopy: () => Promise<void>;
  fireNative: () => Promise<void>;
  copied: boolean;
  nativeAvailable: boolean;
}

// Read a `<head>` `<meta>` tag's content. Returns empty string when
// the tag is missing, the document is unavailable (SSR), or the
// content is blank. The fall-throughs let the share buttons render
// without falling back into an error path when SocialShare is placed
// on a page whose head doesn't carry the queried tag.
function readMetaContent(selectors: ReadonlyArray<string>): string {
  if (typeof document === "undefined") return "";
  for (const selector of selectors) {
    const tag = document.querySelector(selector);
    const content = tag?.getAttribute("content") ?? null;
    if (content?.trim()) return content.trim();
  }
  return "";
}

// URL-resolution priority — first match wins:
//   1. `<link rel="canonical">` href           (author-set canonical URL)
//   2. `<meta property="og:url">` content      (OpenGraph canonical)
//   3. `window.location.href` (NOT pathname)   (raw browser URL — but
//      stripped of anything that looks like an internal render route)
//   4. `${origin}${pathname}` (last resort)
//
// Why this order: editing-host iframes commonly load the page through
// an internal API route (e.g. `/api/render/<route>`, `/api/preview`).
// `usePathname()` returns the API path and ships it as the share URL,
// which is a broken link for everyone the author shares with. The
// canonical / og:url meta tags are the conventional surface where the
// REAL public URL lives (Next.js sets these from layout metadata),
// and chrome's iframe preserves them in the rendered head.
const INTERNAL_PATH_RE = /^\/(api|_next)\b/;

function readLinkHref(rel: string): string {
  if (typeof document === "undefined") return "";
  const tag = document.querySelector(`link[rel="${rel}"]`);
  const href = tag?.getAttribute("href") ?? null;
  return href?.trim() ? href.trim() : "";
}

function resolveCanonicalPageUrl(pathname: string | null): string {
  if (typeof window === "undefined") return "";
  const origin = window.location.origin;
  const fromLink = readLinkHref("canonical");
  if (fromLink) {
    return fromLink.startsWith("http") ? fromLink : `${origin}${fromLink}`;
  }
  const fromOg = readMetaContent(['meta[property="og:url"]']);
  if (fromOg) {
    return fromOg.startsWith("http") ? fromOg : `${origin}${fromOg}`;
  }
  const raw = window.location.href;
  // If we're inside an internal API path (editing-host render route),
  // strip the prefix so the share URL points at the public route.
  // The convention is `/api/<service>/render/<page-route>` — keep the
  // tail after the last `/render/` segment when present, otherwise
  // fall back to origin alone.
  if (pathname && INTERNAL_PATH_RE.test(pathname)) {
    const renderMatch = pathname.match(/\/render\/(.+)$/);
    const captured = renderMatch?.[1];
    if (captured) {
      const tail = captured.startsWith("/") ? captured : `/${captured}`;
      return `${origin}${tail}`;
    }
    return origin;
  }
  return raw || `${origin}${pathname ?? ""}`;
}

// Page-context derived values: title from <title>, description from
// the standard meta tags (Open Graph first, then the SEO fallback),
// hero image from og:image / twitter:image. All read from the live
// DOM at the time of the share click via the useEffect below so SSR
// renders see empty strings (avoids hydration mismatch) and the live
// values populate after mount.
function usePageShareContext() {
  const pathname = usePathname();
  const [ctx, setCtx] = useState<{
    url: string;
    title: string;
    description: string;
    media: string;
  }>({ url: "", title: "", description: "", media: "" });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const nextUrl = resolveCanonicalPageUrl(pathname);
    const nextTitle =
      readMetaContent(['meta[property="og:title"]']) ||
      (typeof document !== "undefined" ? document.title : "") ||
      "";
    const nextDescription = readMetaContent([
      'meta[property="og:description"]',
      'meta[name="description"]',
    ]);
    const nextMedia = readMetaContent([
      'meta[property="og:image"]',
      'meta[name="twitter:image"]',
    ]);
    setCtx({
      url: nextUrl,
      title: nextTitle.trim(),
      description: nextDescription,
      media: nextMedia,
    });
  }, [pathname]);

  return ctx;
}

function useShareCore(props: SocialShareProps): ShareCore {
  const pageContext = usePageShareContext();
  const [copied, setCopied] = useState(false);
  const [nativeAvailable, setNativeAvailable] = useState(false);

  // Feature-detect Web Share API. Runs once on mount; the API surface
  // doesn't change across navigations.
  useEffect(() => {
    if (typeof navigator === "undefined") return;
    setNativeAvailable(
      typeof navigator.share === "function" &&
        typeof window.isSecureContext === "boolean"
        ? window.isSecureContext
        : false,
    );
  }, []);

  const platforms = useMemo(
    () => parsePlatforms(props.platforms),
    [props.platforms],
  );
  const iconStyle = normalizeIconStyle(props.iconStyle);
  const scheme = props.colorScheme ?? "neutral";
  const pxSize = SIZE_PX[props.size ?? "default"];

  // All share-content values now come from the live page context, not
  // from datasource fields. Authors can't override per-instance from
  // Sitecore today — by design, so a single SocialShare placement on
  // a shared partial design works for every page that uses the
  // partial. Hashtags + Via are X-specific niche fields; we drop them
  // entirely until a real use case asks for them back (or move them
  // to rendering parameters at that point).
  const resolvedUrl = pageContext.url;
  const resolvedTitle = pageContext.title;
  const resolvedDescription = pageContext.description;
  const resolvedMedia = pageContext.media;
  const resolvedHashtags: string[] = [];
  const resolvedVia = "";

  const analytics =
    useComponentAnalytics<SocialShareAnalyticsMeta>("social-share");
  const eventsEnabled = isEnabled(props.trackEvents);

  const meta = useMemo<SocialShareAnalyticsMeta>(
    () => ({
      id: props.id,
      instanceKey: props.instanceKey || resolvedTitle || props.id,
      instanceScope: props.instanceScope,
      sharedUrl: resolvedUrl,
      title: resolvedTitle,
    }),
    [
      props.id,
      props.instanceKey,
      props.instanceScope,
      resolvedUrl,
      resolvedTitle,
    ],
  );

  const fireOpen = useCallback(
    (platform: SocialPlatform) => {
      const m: SocialShareAnalyticsMeta = { ...meta, platform };
      if (props.onShareOpen) props.onShareOpen(m);
      else if (eventsEnabled) analytics.fire("opened", m);
    },
    [analytics, eventsEnabled, meta, props.onShareOpen],
  );

  const fireCopy = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(resolvedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      if (props.onCopyLink) props.onCopyLink(meta);
      else if (eventsEnabled) analytics.fire("copied", meta);
    } catch {
      // Silently ignore — clipboard rejections happen on insecure
      // contexts and permission denials. The user sees no toast; the
      // share row just doesn't update. Authors can still hit other
      // platforms.
    }
  }, [analytics, eventsEnabled, meta, props.onCopyLink, resolvedUrl]);

  const fireNative = useCallback(async () => {
    if (
      typeof navigator === "undefined" ||
      typeof navigator.share !== "function"
    )
      return;
    try {
      await navigator.share({
        title: resolvedTitle || undefined,
        text: resolvedDescription || undefined,
        url: resolvedUrl,
      });
      if (props.onNativeShare) props.onNativeShare(meta);
      else if (eventsEnabled) analytics.fire("native-shared", meta);
    } catch {
      // User dismissed the native sheet — not an error. AbortError is
      // the standard rejection shape and we treat it the same as any
      // other failure.
    }
  }, [
    analytics,
    eventsEnabled,
    meta,
    props.onNativeShare,
    resolvedDescription,
    resolvedTitle,
    resolvedUrl,
  ]);

  return {
    resolvedUrl,
    resolvedTitle,
    resolvedDescription,
    resolvedMedia,
    resolvedHashtags,
    resolvedVia,
    platforms,
    iconStyle,
    scheme,
    pxSize,
    buttonSize: SIZE_TO_BUTTON[props.size ?? "default"],
    buttonVariant: iconStyleToButtonVariant(iconStyle),
    fireOpen,
    fireCopy,
    fireNative,
    copied,
    nativeAvailable,
  };
}

// ---------------------------------------------------------------------------
// Single-platform button renderer. Shared by Default + Menu variants.
// ---------------------------------------------------------------------------

interface PlatformButtonProps {
  platform: SocialPlatform;
  core: ShareCore;
  display: SocialShareDisplay;
  className?: string;
}

/**
 * Visible platform-name label. Deliberately neutral page text
 * (`text-foreground`) — the ColorScheme param tints the icon chip ONLY,
 * never the label. Do not paint this with `text-<scheme>` or (worse)
 * `text-<scheme>-foreground`; the latter is only legal on an element
 * that itself carries `bg-<scheme>`.
 */
const VISIBLE_LABEL_CLASS = "font-medium text-foreground text-sm";

function PlatformButton({
  platform,
  core,
  display,
  className,
}: PlatformButtonProps) {
  const label = PLATFORM_LABELS[platform];
  const ariaLabel = `Share via ${label}`;
  const showLabel = display !== "icons-only";
  const showIcon = display !== "labels-only";
  const labelNode = showLabel ? (
    <span className={VISIBLE_LABEL_CLASS}>{label}</span>
  ) : (
    <span className="sr-only">{label}</span>
  );
  const iProps = iconProps(core.iconStyle, core.pxSize);

  // Chip wrapper around the react-share SVG. `native` needs no classes
  // beyond the circle mask — the SVG carries the brand fill.
  // `color-scheme` paints the circle: solid `bg-<X>` + the paired
  // `text-<X>-foreground` on the SAME element, so the currentColor
  // glyph satisfies the color-roles solid-surface contract. `outline`
  // sets only `text-<X>` — transparent fill, ring drawn by the SVG
  // stroke in currentColor.
  const externalChipClass = cn(
    "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full",
    core.iconStyle === "color-scheme" && SOLID_CHIP_CLASSES[core.scheme],
    core.iconStyle === "outline" && OUTLINE_CHIP_TEXT_CLASSES[core.scheme],
  );

  const renderExternalIcon = (icon: React.ReactNode) =>
    showIcon ? (
      <span aria-hidden className={externalChipClass}>
        {icon}
      </span>
    ) : null;

  const wrapWithTooltip = (trigger: React.ReactNode) =>
    showLabel ? (
      trigger
    ) : (
      <Tooltip>
        <TooltipTrigger asChild>{trigger}</TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    );

  // Chip for the app-action platforms (Web Share trigger, Copy Link),
  // whose glyphs are LibraryIcons instead of react-share SVGs. They
  // have no network brand color, so `native` falls back to the
  // scheme-painted solid chip (matching the pre-Display behavior where
  // these rendered as scheme-colored CTAs). Same contract pairings as
  // the external chips: solid = `bg-<X>` + `text-<X>-foreground`,
  // outline = `border-current` ring + `text-<X>`.
  const appChipClass = cn(
    "inline-flex shrink-0 items-center justify-center rounded-full",
    core.iconStyle === "outline"
      ? cn("border border-current", OUTLINE_CHIP_TEXT_CLASSES[core.scheme])
      : SOLID_CHIP_CLASSES[core.scheme],
  );

  const renderAppIcon = (name: string) =>
    showIcon ? (
      <span
        aria-hidden
        className={appChipClass}
        style={{ width: core.pxSize, height: core.pxSize }}
      >
        <LibraryIcon name={name} className="size-[55%]" aria-hidden />
      </span>
    ) : null;

  switch (platform) {
    case "native":
      if (!core.nativeAvailable) return null;
      return wrapWithTooltip(
        <button
          type="button"
          onClick={() => core.fireNative()}
          aria-label={ariaLabel}
          className={className}
        >
          {renderAppIcon("share")}
          {labelNode}
        </button>,
      );

    case "copy-link":
      return wrapWithTooltip(
        <button
          type="button"
          onClick={() => core.fireCopy()}
          aria-label={ariaLabel}
          className={className}
        >
          {renderAppIcon(core.copied ? "check" : "link")}
          {core.copied ? (
            <span className={VISIBLE_LABEL_CLASS}>Copied</span>
          ) : (
            labelNode
          )}
        </button>,
      );

    case "facebook":
      return wrapWithTooltip(
        <FacebookShareButton
          url={core.resolvedUrl}
          aria-label={ariaLabel}
          beforeOnClick={() => core.fireOpen("facebook")}
          className={className}
        >
          {renderExternalIcon(<FacebookIcon {...iProps} />)}
          {labelNode}
        </FacebookShareButton>,
      );

    case "x":
      return wrapWithTooltip(
        <TwitterShareButton
          url={core.resolvedUrl}
          title={core.resolvedTitle}
          hashtags={core.resolvedHashtags}
          via={core.resolvedVia || undefined}
          aria-label={ariaLabel}
          beforeOnClick={() => core.fireOpen("x")}
          className={className}
        >
          {renderExternalIcon(<XIcon {...iProps} />)}
          {labelNode}
        </TwitterShareButton>,
      );

    case "linkedin":
      return wrapWithTooltip(
        <LinkedinShareButton
          url={core.resolvedUrl}
          title={core.resolvedTitle}
          summary={core.resolvedDescription}
          aria-label={ariaLabel}
          beforeOnClick={() => core.fireOpen("linkedin")}
          className={className}
        >
          {renderExternalIcon(<LinkedinIcon {...iProps} />)}
          {labelNode}
        </LinkedinShareButton>,
      );

    case "pinterest":
      // Pinterest *prefers* media — when none is available we hand it
      // an empty string so the button still renders + dispatches; the
      // user is dropped on Pinterest's own pin-create flow which lets
      // them paste an image manually. The previous silent `return null`
      // made the button vanish whenever the page had no og:image (most
      // showcase / preview contexts), which read as a broken icon set
      // even though the rest of the platforms rendered fine.
      return wrapWithTooltip(
        <PinterestShareButton
          url={core.resolvedUrl}
          media={core.resolvedMedia || ""}
          description={core.resolvedDescription || core.resolvedTitle}
          aria-label={ariaLabel}
          beforeOnClick={() => core.fireOpen("pinterest")}
          className={className}
        >
          {renderExternalIcon(<PinterestIcon {...iProps} />)}
          {labelNode}
        </PinterestShareButton>,
      );

    case "reddit":
      return wrapWithTooltip(
        <RedditShareButton
          url={core.resolvedUrl}
          title={core.resolvedTitle}
          aria-label={ariaLabel}
          beforeOnClick={() => core.fireOpen("reddit")}
          className={className}
        >
          {renderExternalIcon(<RedditIcon {...iProps} />)}
          {labelNode}
        </RedditShareButton>,
      );

    case "whatsapp":
      return wrapWithTooltip(
        <WhatsappShareButton
          url={core.resolvedUrl}
          title={core.resolvedTitle}
          aria-label={ariaLabel}
          beforeOnClick={() => core.fireOpen("whatsapp")}
          className={className}
        >
          {renderExternalIcon(<WhatsappIcon {...iProps} />)}
          {labelNode}
        </WhatsappShareButton>,
      );

    case "telegram":
      return wrapWithTooltip(
        <TelegramShareButton
          url={core.resolvedUrl}
          title={core.resolvedTitle}
          aria-label={ariaLabel}
          beforeOnClick={() => core.fireOpen("telegram")}
          className={className}
        >
          {renderExternalIcon(<TelegramIcon {...iProps} />)}
          {labelNode}
        </TelegramShareButton>,
      );

    case "email":
      return wrapWithTooltip(
        <EmailShareButton
          url={core.resolvedUrl}
          subject={core.resolvedTitle}
          body={core.resolvedDescription}
          aria-label={ariaLabel}
          beforeOnClick={() => core.fireOpen("email")}
          className={className}
        >
          {renderExternalIcon(<EmailIcon {...iProps} />)}
          {labelNode}
        </EmailShareButton>,
      );

    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Rendering variants — separate exported functions per the
// rendering-variants skill. Both share the same `SocialShareProps`
// shape; no public discriminator prop.
// ---------------------------------------------------------------------------

/**
 * Inline share row — renders every enabled platform as a button in a
 * horizontal row (default) or vertical stack (when `vertical` is on).
 *
 * Page-aware: when `url` is unset, resolves to the current page URL
 * via `usePathname()` + `window.location.origin`. Authors drop this on
 * any page without configuring a per-instance URL.
 *
 * Fires `social-share.opened` per platform click, `social-share.copied`
 * on clipboard success, and `social-share.native-shared` when the OS
 * share sheet resolves. All three route through the CDP catalog by
 * default; explicit `onShareOpen`/`onCopyLink`/`onNativeShare`
 * overrides bypass the catalog (Segment, Vercel Analytics, etc.).
 */
export function Default(props: SocialShareProps) {
  const core = useShareCore(props);
  const display = resolveDisplay(props.display);
  const vertical = isEnabled(props.vertical);
  const position = props.position ?? "inline";
  const paddingY = props.paddingY ?? "none";

  const buttonClasses = cn(
    "inline-flex cursor-pointer items-center gap-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    display !== "icons-only" && "px-2 py-1",
  );

  return (
    <div
      className={cn(
        "component social-share",
        vertical
          ? "flex flex-col items-start gap-2"
          : "flex flex-wrap items-center gap-2",
        POSITION_CLASSES[position],
        PADDING_Y_CLASSES[paddingY],
        props.styles?.trimEnd(),
      )}
      id={props.id}
      data-slot="social-share"
      data-variant="default"
      data-icon-style={core.iconStyle}
      data-display={display}
      data-vertical={vertical || undefined}
    >
      {/* Editing-mode hint slot so authors see *which* page title the
          share row will use — derived from the live DOM head, not a
          datasource field. Helps confirm in Pages that the share
          payload matches the current page being authored. */}
      {props.isEditing && core.resolvedTitle ? (
        <span className="sr-only">{`Shares: ${core.resolvedTitle}`}</span>
      ) : null}
      {core.platforms.map((platform) => (
        <PlatformButton
          key={platform}
          platform={platform}
          core={core}
          display={display}
          className={buttonClasses}
        />
      ))}
    </div>
  );
}

/**
 * Dropdown menu variant — single "Share" trigger that opens a menu of
 * platform options. Right for header bars and article rails where a
 * full button row would steal too much visual weight.
 *
 * Same share-link mechanics, analytics events, and page-aware URL
 * resolution as `Default`. `vertical` and `display` are ignored — the
 * menu is always stacked with labels.
 *
 * Exported as `Menu` because the SDK's component-map variant lookup is
 * `component[variantName]` (case-sensitive); recipe declares
 * `variants: [{ name: "Menu" }]` so the export name has to match
 * verbatim. Earlier `MenuVariant` mismatched and silently fell back to
 * the missing-component placeholder in Pages.
 */
export function Menu(props: SocialShareProps) {
  const core = useShareCore(props);
  const position = props.position ?? "inline";
  const paddingY = props.paddingY ?? "none";
  const triggerLabel = props.triggerLabel ?? "Share";

  return (
    <div
      className={cn(
        "component social-share",
        POSITION_CLASSES[position],
        PADDING_Y_CLASSES[paddingY],
        props.styles?.trimEnd(),
      )}
      id={props.id}
      data-slot="social-share"
      data-variant="menu"
      data-icon-style={core.iconStyle}
    >
      <DropdownMenu defaultOpen={props.defaultOpen}>
        <DropdownMenuTrigger asChild>
          {/*
            IconStyle → Button variant (see `iconStyleToButtonVariant`).
            Size threads through from the recipe's `Size` param via
            `core.buttonSize`. The resolved scheme (`core.scheme` —
            the ColorScheme param) goes to the Button, whose CVA
            compounds own the
            contract pairing: `default` paints `bg-<scheme>` +
            `text-<scheme>-foreground`, `outline` paints a border +
            `text-<scheme>`. The trigger is a genuine CTA, not an
            icon-chip-plus-label row, so the whole button carries the
            scheme here.
          */}
          <Button
            variant={core.buttonVariant}
            size={core.buttonSize}
            colorScheme={core.scheme}
            aria-label={triggerLabel}
            className={cn(
              "inline-flex items-center gap-2",
              // Filled-neutral rest ink is the same gray as the fill
              // (`text-neutral` on `bg-neutral`). Lift it to white;
              // hover keeps the primitive's slightly lighter gray.
              core.buttonVariant === "default" &&
                core.scheme === "neutral" &&
                "text-theme-white hover:text-neutral",
            )}
          >
            <LibraryIcon name="share" className="size-4" aria-hidden />
            <span>{triggerLabel}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-56 space-y-1 p-2" align="end">
          {core.platforms.map((platform) => {
            // `copy-link` and `native` are the two platforms whose
            // action runs in-page (clipboard write / `navigator.share`).
            // Inside the menu, they need DropdownMenuItem's `onSelect`
            // to fire the action directly — wrapping a `<Button
            // onClick>` inside an `asChild` `<div>` made the menu
            // close on click BEFORE the inner Button's onClick fired,
            // so the clipboard write never ran (or ran with stale
            // state — the user reported "copy doesn't work"). Calling
            // `event.preventDefault()` inside the handler ALSO keeps
            // the menu open long enough for the "Copied" feedback to
            // surface (~1500ms). The external platforms (Facebook /
            // X / LinkedIn etc.) use react-share's own components and
            // open a new window — the menu closing on click is the
            // right behavior there.
            if (platform === "copy-link") {
              return (
                <DropdownMenuItem
                  key={platform}
                  className="cursor-pointer gap-3"
                  onSelect={(event) => {
                    event.preventDefault();
                    void core.fireCopy();
                  }}
                  aria-label="Copy link"
                >
                  <LibraryIcon
                    name={core.copied ? "check" : "link"}
                    className="size-4"
                    aria-hidden
                  />
                  <span className="font-medium text-sm">
                    {core.copied ? "Copied" : "Copy link"}
                  </span>
                </DropdownMenuItem>
              );
            }
            if (platform === "native") {
              if (!core.nativeAvailable) return null;
              return (
                <DropdownMenuItem
                  key={platform}
                  className="cursor-pointer gap-3"
                  onSelect={() => {
                    void core.fireNative();
                  }}
                  aria-label="Share via system"
                >
                  <LibraryIcon name="share" className="size-4" aria-hidden />
                  <span className="font-medium text-sm">Share…</span>
                </DropdownMenuItem>
              );
            }
            return (
              <DropdownMenuItem
                key={platform}
                asChild
                className="cursor-pointer"
              >
                <div className="flex w-full items-center gap-3">
                  <PlatformButton
                    platform={platform}
                    core={core}
                    display="icons-and-labels"
                    className="flex w-full items-center gap-3 rounded-md px-1 py-1"
                  />
                </div>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Back-compat default export — older consumers import `SocialShare`
// expecting the inline behavior.
export const SocialShare = Default;
export default Default;

export const componentType = "universal";
