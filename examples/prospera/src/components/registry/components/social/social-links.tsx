"use client";

import {
  faBluesky,
  faDiscord,
  faGithub,
  faInstagram,
  faMastodon,
  faSnapchat,
  faTelegram,
  faThreads,
  faTiktok,
  faTwitch,
  faVimeo,
  faWeixin,
  faWhatsapp,
  faYoutube,
  type IconDefinition,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ComponentType } from "react";
import {
  FacebookIcon,
  LinkedinIcon,
  PinterestIcon,
  RedditIcon,
  XIcon,
} from "react-share";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/registry/primitives/core/tooltip";
import { cn } from "@/lib/registry/cn";
import type { CmsProps } from "@/lib/registry/sitecore";

// ---------------------------------------------------------------------------
// SocialLinks — the LINK-OUT sibling of SocialShare.
//
// SocialShare renders SHARE buttons for the *current page*; SocialLinks
// renders a row of icons that link OUT to the brand's own social
// profiles. It mirrors social-share's styling API (icon style, size,
// color scheme, display, vertical, padding) EXACTLY — the only semantic
// difference is each item is a plain outbound `<a href>` to a brand
// profile, not a react-share share button.
//
// The style helpers (SOLID_CHIP_CLASSES / OUTLINE_CHIP_TEXT_CLASSES /
// iconProps / SIZE_PX / PADDING_Y_CLASSES / normalizeIconStyle /
// resolveDisplay) are copied from social-share rather than imported —
// social-share owns its shape and exports none of these internals, so
// duplicating keeps the two components decoupled per the no-peer-import
// boundary rule.
// ---------------------------------------------------------------------------

/**
 * One Links Treelist entry from the layout service. Each picked
 * `social-link-item@1` child arrives as a linked item carrying a
 * `Platform` droplink + a `Link` general-link. `name` is the item name
 * in Sitecore; `fields` holds the two authored fields.
 */
interface SocialLinkLinkedItem {
  id?: string;
  name?: string;
  fields?: {
    Platform?:
      | { value?: string }
      | { name?: string; fields?: { Value?: { value?: string } } };
    Link?: { value?: { href?: string; text?: string; target?: string } };
    /** Fallback plain-string url some adapters flatten a link into. */
    Url?: { value?: string } | string;
  };
}

/**
 * Already-parsed programmatic item shape (preview + standalone usage).
 * `platform` is the token; `href` is the brand profile URL; `label`
 * overrides the default platform label (accessible name / tooltip).
 */
export interface SocialLinkItem {
  platform: SocialLinkPlatform;
  href: string;
  label?: string;
}

/**
 * Platform tokens recognized by the `Links` datasource and the `links`
 * prop. Order is honored; unknown tokens / empty hrefs are skipped.
 *
 * react-share ships a brand Icon for facebook / x / linkedin /
 * pinterest / reddit — those render exactly like social-share's chips.
 * The remaining footer platforms (instagram / youtube / tiktok /
 * threads / github) have no react-share icon and no lucide brand glyph
 * (lucide dropped brand icons), so they render a FontAwesome brand
 * glyph in the same chip treatment, brand-colored via BRAND_COLORS
 * under the native icon style.
 */
export type SocialLinkPlatform =
  | "facebook"
  | "instagram"
  | "x"
  | "linkedin"
  | "youtube"
  | "tiktok"
  | "pinterest"
  | "threads"
  | "reddit"
  | "github"
  // Added because real footers use them and the generated bar dropped
  // them to a plain-text row: suse's Bluesky, duke-energy's feed link,
  // whitecube's WeChat. Each has a FontAwesome brand glyph.
  | "bluesky"
  | "mastodon"
  | "whatsapp"
  | "telegram"
  | "snapchat"
  | "vimeo"
  | "twitch"
  | "discord"
  | "wechat";

const KNOWN_PLATFORMS: readonly SocialLinkPlatform[] = [
  "facebook",
  "instagram",
  "x",
  "linkedin",
  "youtube",
  "tiktok",
  "pinterest",
  "threads",
  "reddit",
  "github",
  "bluesky",
  "mastodon",
  "whatsapp",
  "telegram",
  "snapchat",
  "vimeo",
  "twitch",
  "discord",
  "wechat",
];

/** Icon-chip visual treatment — backs the `social-share-icon-style@1` enum. */
export type SocialLinksIconStyle = "native" | "color-scheme" | "outline";

/** Which parts of each link render — backs the `social-display@1` enum. */
export type SocialLinksDisplay =
  | "icons-only"
  | "labels-only"
  | "icons-and-labels";

/**
 * Flat props delivered by the SDK's default (`withSitecore`) convention
 * — the same page-aware, adapter-less shape social-share uses:
 *   - `fields.Links` → `links` (Treelist of `social-link-item@1`)
 *   - `params.IconStyle` → `iconStyle`
 *   - `params.Vertical` → `vertical`
 *   - `params.Display` → `display`
 *   - `params.Size` → `size`
 *   - `params.ColorScheme` → `colorScheme`
 *   - `params.PaddingY` → `paddingY`
 */
export interface SocialLinksProps extends CmsProps {
  /**
   * The brand profile links. Two input shapes:
   *   - `SocialLinkItem[]`        — already-parsed (preferred standalone)
   *   - `SocialLinkLinkedItem[]`  — Layout Service Treelist shape
   */
  links?: SocialLinkItem[] | SocialLinkLinkedItem[];
  iconStyle?: SocialLinksIconStyle;
  /** Stack vertically. Accepts Sitecore string booleans. */
  vertical?: string | boolean;
  display?: SocialLinksDisplay;
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
  /**
   * See container.tsx — same vertical-padding axis. The row's real
   * default is `none` (the recipe default; the wrapping section
   * provides spacing).
   */
  paddingY?: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
}

type SocialLinksColorScheme = NonNullable<SocialLinksProps["colorScheme"]>;

// Strict allow-list — mirrors social-share / alert-banner. Empty /
// missing / unknown coerce to false so an unchecked rendering-param
// checkbox reliably turns the affordance off.
function isEnabled(value: string | boolean | undefined): boolean {
  if (typeof value === "boolean") return value;
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return ["1", "true", "yes", "on", "enabled"].includes(normalized);
}

// ---------------------------------------------------------------------------
// Item parsing — normalize whatever arrives into `{platform, href, label}`,
// dropping entries with an unknown platform or an empty href so malformed
// datasource rows degrade gracefully instead of rendering a broken chip.
// ---------------------------------------------------------------------------

function extractPlatformToken(
  entry: SocialLinkItem | SocialLinkLinkedItem,
): SocialLinkPlatform | null {
  const raw = entry as {
    platform?: string;
    fields?: SocialLinkLinkedItem["fields"];
  };
  // Programmatic shape.
  if (typeof raw.platform === "string") {
    const token = raw.platform.trim().toLowerCase() as SocialLinkPlatform;
    return KNOWN_PLATFORMS.includes(token) ? token : null;
  }
  // Layout Service linked-item shape: Platform is a droplink resolved to
  // a linked item (`name` / nested `Value`) or a flat `{ value }` token.
  const platform = raw.fields?.Platform;
  if (!platform) return null;
  let name: string | undefined;
  if ("name" in platform && platform.name) {
    name = platform.name;
  } else if ("value" in platform && platform.value) {
    name = platform.value;
  } else if ("fields" in platform) {
    name = platform.fields?.Value?.value;
  }
  if (!name) return null;
  const token = String(name).trim().toLowerCase() as SocialLinkPlatform;
  return KNOWN_PLATFORMS.includes(token) ? token : null;
}

function extractHref(
  entry: SocialLinkItem | SocialLinkLinkedItem,
): string | null {
  const raw = entry as {
    href?: string;
    fields?: SocialLinkLinkedItem["fields"];
  };
  if (typeof raw.href === "string" && raw.href.trim()) return raw.href.trim();
  const link = raw.fields?.Link;
  const fromLink = link?.value?.href;
  if (typeof fromLink === "string" && fromLink.trim()) return fromLink.trim();
  const url = raw.fields?.Url;
  if (typeof url === "string" && url.trim()) return url.trim();
  if (url && typeof url === "object" && typeof url.value === "string") {
    return url.value.trim() || null;
  }
  return null;
}

function extractLabel(
  entry: SocialLinkItem | SocialLinkLinkedItem,
  platform: SocialLinkPlatform,
): string {
  const raw = entry as {
    label?: string;
    fields?: SocialLinkLinkedItem["fields"];
  };
  if (typeof raw.label === "string" && raw.label.trim())
    return raw.label.trim();
  const text = raw.fields?.Link?.value?.text;
  if (typeof text === "string" && text.trim()) return text.trim();
  return PLATFORM_LABELS[platform];
}

interface ResolvedLink {
  platform: SocialLinkPlatform;
  href: string;
  label: string;
}

function parseLinks(
  raw: SocialLinkItem[] | SocialLinkLinkedItem[] | undefined,
): ResolvedLink[] {
  if (!Array.isArray(raw)) return [];
  const resolved: ResolvedLink[] = [];
  for (const entry of raw) {
    if (entry == null || typeof entry !== "object") continue;
    const platform = extractPlatformToken(entry);
    if (!platform) continue;
    const href = extractHref(entry);
    if (!href) continue;
    resolved.push({ platform, href, label: extractLabel(entry, platform) });
  }
  return resolved;
}

// ---------------------------------------------------------------------------
// Styling maps — copied verbatim from social-share so the two read as one
// family. See social-share.tsx for the color-roles rationale on each map.
// ---------------------------------------------------------------------------

const SIZE_PX: Record<NonNullable<SocialLinksProps["size"]>, number> = {
  xs: 20,
  sm: 24,
  md: 32,
  default: 32,
  lg: 40,
  xl: 48,
};

/**
 * Normalize the `iconStyle` input onto the three-value style axis.
 * Unset and unknown values land on the brand-colored default.
 */
function normalizeIconStyle(
  raw: SocialLinksIconStyle | undefined,
): SocialLinksIconStyle {
  return raw === "color-scheme" || raw === "outline" ? raw : "native";
}

function resolveDisplay(
  display: SocialLinksDisplay | undefined,
): SocialLinksDisplay {
  if (
    display === "icons-only" ||
    display === "labels-only" ||
    display === "icons-and-labels"
  ) {
    return display;
  }
  return "icons-only";
}

// Solid chip treatment per scheme — the color-roles SOLID pairing.
const SOLID_CHIP_CLASSES: Record<SocialLinksColorScheme, string> = {
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

// Outline chip ink per scheme — transparent fill, plain role token.
const OUTLINE_CHIP_TEXT_CLASSES: Record<SocialLinksColorScheme, string> = {
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

// Mirrors container.tsx PADDING_Y_CLASSES.
const PADDING_Y_CLASSES: Record<
  NonNullable<SocialLinksProps["paddingY"]>,
  string
> = {
  none: "py-0",
  sm: "py-4",
  md: "py-8",
  lg: "py-12",
  xl: "py-20",
  "2xl": "py-32",
};

const PLATFORM_LABELS: Record<SocialLinkPlatform, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  x: "X",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  tiktok: "TikTok",
  pinterest: "Pinterest",
  threads: "Threads",
  reddit: "Reddit",
  github: "GitHub",
  bluesky: "Bluesky",
  mastodon: "Mastodon",
  whatsapp: "WhatsApp",
  telegram: "Telegram",
  snapchat: "Snapchat",
  vimeo: "Vimeo",
  twitch: "Twitch",
  discord: "Discord",
  wechat: "WeChat",
};

/**
 * react-share brand Icon per platform (undefined → rendered via the
 * FontAwesome brand glyph instead). These carry each network's brand
 * fill under the native icon style, exactly like social-share.
 */
type ReactShareIconProps = {
  size?: number;
  round?: boolean;
  iconFillColor?: string;
  bgStyle?: React.CSSProperties;
};
const REACT_SHARE_ICONS: Partial<
  Record<SocialLinkPlatform, ComponentType<ReactShareIconProps>>
> = {
  facebook: FacebookIcon,
  x: XIcon,
  linkedin: LinkedinIcon,
  pinterest: PinterestIcon,
  reddit: RedditIcon,
};

/** FontAwesome brand glyph for the react-share-less platforms. */
const FA_ICONS: Partial<Record<SocialLinkPlatform, IconDefinition>> = {
  instagram: faInstagram,
  youtube: faYoutube,
  tiktok: faTiktok,
  threads: faThreads,
  github: faGithub,
  bluesky: faBluesky,
  mastodon: faMastodon,
  whatsapp: faWhatsapp,
  telegram: faTelegram,
  snapchat: faSnapchat,
  vimeo: faVimeo,
  twitch: faTwitch,
  discord: faDiscord,
  wechat: faWeixin,
};

/**
 * Native brand colors for the FontAwesome-glyph platforms — react-share
 * carries its own brand fill, but the FA glyphs don't, so the native
 * icon style paints the chip with these so it still reads brand-colored.
 */
const BRAND_COLORS: Partial<Record<SocialLinkPlatform, string>> = {
  instagram: "#E4405F",
  youtube: "#FF0000",
  tiktok: "#000000",
  threads: "#000000",
  github: "#181717",
  bluesky: "#0285FF",
  mastodon: "#6364FF",
  whatsapp: "#25D366",
  telegram: "#26A5E4",
  snapchat: "#FFFC00",
  vimeo: "#1AB7EA",
  twitch: "#9146FF",
  discord: "#5865F2",
  wechat: "#07C160",
};

/**
 * react-share icon prop bag driving the SVG treatment — identical to
 * social-share's `iconProps`. `native` is react-share's brand-colored
 * default; `color-scheme` strips the fill so the chip `<span>` paints
 * the circle; `outline` keeps the fill transparent + a currentColor
 * ring.
 */
function iconProps(
  iconStyle: SocialLinksIconStyle,
  pxSize: number,
): ReactShareIconProps {
  if (iconStyle === "color-scheme") {
    return {
      size: pxSize,
      iconFillColor: "currentColor",
      bgStyle: { fill: "transparent" },
      round: true,
    };
  }
  if (iconStyle === "outline") {
    return {
      size: pxSize,
      iconFillColor: "currentColor",
      bgStyle: { fill: "transparent", stroke: "currentColor", strokeWidth: 1 },
      round: true,
    };
  }
  return { size: pxSize, round: true };
}

// ---------------------------------------------------------------------------
// Single-link renderer.
// ---------------------------------------------------------------------------

const VISIBLE_LABEL_CLASS = "font-medium text-foreground text-sm";

interface SocialLinkAnchorProps {
  link: ResolvedLink;
  iconStyle: SocialLinksIconStyle;
  scheme: SocialLinksColorScheme;
  pxSize: number;
  display: SocialLinksDisplay;
  className?: string;
}

function SocialLinkAnchor({
  link,
  iconStyle,
  scheme,
  pxSize,
  display,
  className,
}: SocialLinkAnchorProps) {
  const { platform, href, label } = link;
  const showLabel = display !== "icons-only";
  const showIcon = display !== "labels-only";
  const labelNode = showLabel ? (
    <span className={VISIBLE_LABEL_CLASS}>{label}</span>
  ) : (
    <span className="sr-only">{label}</span>
  );

  const ReactShareIcon = REACT_SHARE_ICONS[platform];

  // react-share chip — same treatment as social-share's external chip.
  const externalChipClass = cn(
    "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full",
    iconStyle === "color-scheme" && SOLID_CHIP_CLASSES[scheme],
    iconStyle === "outline" && OUTLINE_CHIP_TEXT_CLASSES[scheme],
  );

  // FontAwesome brand-glyph chip — no network brand color of its own, so
  // `native` paints the chip with the platform's BRAND_COLORS entry
  // (brand-colored, white glyph); `color-scheme` / `outline` follow the
  // same scheme pairings as social-share's app-action chips.
  const faChipClass = cn(
    "inline-flex shrink-0 items-center justify-center rounded-full",
    iconStyle === "outline" &&
      cn("border border-current", OUTLINE_CHIP_TEXT_CLASSES[scheme]),
    iconStyle === "color-scheme" && SOLID_CHIP_CLASSES[scheme],
    iconStyle === "native" && "text-theme-white",
  );
  const faChipStyle: React.CSSProperties = {
    width: pxSize,
    height: pxSize,
    ...(iconStyle === "native"
      ? { backgroundColor: BRAND_COLORS[platform] }
      : {}),
  };

  const iconNode = !showIcon ? null : ReactShareIcon ? (
    <span aria-hidden className={externalChipClass}>
      <ReactShareIcon {...iconProps(iconStyle, pxSize)} />
    </span>
  ) : FA_ICONS[platform] ? (
    <span aria-hidden className={faChipClass} style={faChipStyle}>
      <FontAwesomeIcon
        icon={FA_ICONS[platform] as IconDefinition}
        className="size-[55%]"
      />
    </span>
  ) : null;

  const anchor = (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={className}
      data-platform={platform}
    >
      {iconNode}
      {labelNode}
    </a>
  );

  // Icon-only rows get a hover tooltip (the visible label is sr-only),
  // exactly like social-share.
  return showLabel ? (
    anchor
  ) : (
    <Tooltip>
      <TooltipTrigger asChild>{anchor}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

// ---------------------------------------------------------------------------
// Rendering variant — `Default` inline row only (rendering-variants skill:
// separate exported function, no discriminator prop). No Menu variant — a
// footer social row doesn't need a dropdown.
// ---------------------------------------------------------------------------

/**
 * Inline social-links row — renders every valid brand profile as an
 * outbound `<a target="_blank" rel="noopener noreferrer">` in a
 * horizontal row (default) or vertical stack (`vertical`).
 *
 * Presentational and accessible: aria-labels on every link, sr-only
 * labels + tooltips when icons-only, react-share brand icons where they
 * exist and FontAwesome brand glyphs otherwise. No analytics, no share
 * machinery — just links.
 */
export function Default(props: SocialLinksProps) {
  const links = parseLinks(props.links);
  const iconStyle = normalizeIconStyle(props.iconStyle);
  const scheme = props.colorScheme ?? "neutral";
  const pxSize = SIZE_PX[props.size ?? "default"];
  const display = resolveDisplay(props.display);
  const vertical = isEnabled(props.vertical);
  const paddingY = props.paddingY ?? "none";

  const anchorClasses = cn(
    "inline-flex cursor-pointer items-center gap-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    display !== "icons-only" && "px-2 py-1",
  );

  // Unlike its SocialShare sibling — whose `Platforms` param ships a
  // ten-value default and therefore always renders — SocialLinks is
  // DATASOURCE-driven: `Links` is a Treelist over `social-link-item@1`
  // CONTENT items, which don't exist until an author creates them, so
  // the field has no default it could point at. An unauthored placement
  // therefore resolved to zero rows and painted a bare empty <div>,
  // which is indistinguishable from the component being broken. Show the
  // same `is-empty-hint` affordance link-list uses so the placement
  // announces itself to authors; live pages keep rendering nothing.
  if (links.length === 0 && props.isEditing) {
    return (
      <div
        className={cn("component social-links", props.styles?.trimEnd())}
        id={props.id}
        data-slot="social-links"
        data-variant="default"
      >
        <span className="is-empty-hint text-muted-foreground text-sm">
          Social links — pick the brand&apos;s profiles in the Links field
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "component social-links",
        vertical
          ? "flex flex-col items-start gap-2"
          : "flex flex-wrap items-center gap-2",
        PADDING_Y_CLASSES[paddingY],
        props.styles?.trimEnd(),
      )}
      id={props.id}
      data-slot="social-links"
      data-variant="default"
      data-icon-style={iconStyle}
      data-display={display}
      data-vertical={vertical || undefined}
    >
      {links.map((link) => (
        <SocialLinkAnchor
          key={`${link.platform}-${link.href}`}
          link={link}
          iconStyle={iconStyle}
          scheme={scheme}
          pxSize={pxSize}
          display={display}
          className={anchorClasses}
        />
      ))}
    </div>
  );
}

// Back-compat named + default export.
export const SocialLinks = Default;
export default Default;

// Sitecore-aware multi-export components MUST declare this so the SDK
// lists them in BOTH server and client component maps.
export const componentType = "universal";
