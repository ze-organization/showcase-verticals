import {
  ItemCard,
  type ItemCardActionPlacement,
  type ItemCardColorBand,
  type ItemCardFooterColorScheme,
  type ItemCardMediaBleed,
  type ItemCardProps,
  type ItemCardTitleLinkIcon,
} from "@/components/registry/blocks/item-card";
import { iconByName } from "@/components/registry/graphics/icons/named-icon/icon-vocabulary";
import { NamedIcon } from "@/components/registry/graphics/icons/named-icon/named-icon";
import {
  Image,
  type ImageSource,
} from "@/components/registry/primitives/editables/image";
import type { LinkSource } from "@/components/registry/primitives/editables/link";
import {
  RichText,
  type RichTextSource,
} from "@/components/registry/primitives/editables/richtext";
import {
  Text,
  type TextSource,
} from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import { mediaFitClass } from "@/lib/registry/media-fit";
import { isEnabled } from "@/lib/registry/param-parsers";
import { type CmsProps, Placeholder } from "@/lib/registry/sitecore";
import { Button, type CtaButtonSize } from "./cta-button";

/**
 * Visual treatment for a CTA link rendered in a CardBlock. Mirrors the
 * CTA button's variant axis (the shared `button-variant@1` Sitecore
 * enum) so author choices are uniform across the design system:
 *
 *   default     filled CTA button
 *   outline     outline CTA button
 *   ghost       transparent CTA button
 *   link        bare anchor (no chrome; + ShowArrow = the editorial
 *               trailing-arrow + underline treatment)
 *   pill        filled CTA button with fully-rounded pill corners
 *
 * `default` is the variant default so authors get a tappable CTA on
 * drop without picking a style; that matches CTA Button's own default.
 */
export type CardBlockActionStyle = "default" | "outline" | "ghost" | "link";

/** Where the action row sits within the card body. */
export type CardBlockActionPlacement = ItemCardActionPlacement;

/**
 * How the media slot is sized / placed relative to the card padding.
 * Re-exported from the ItemCard shell so authors see the same enum
 * everywhere it's referenced.
 */
export type CardBlockMediaBleed = ItemCardMediaBleed;

/**
 * The 11 named color schemes the rest of the design system uses, plus
 * `"none"` (no band rendered). When a real scheme is picked the band
 * sits at the top of the card with the title inside.
 */
export type CardBlockColorBand = ItemCardColorBand;

/**
 * Optional trailing chevron/arrow glyph beside the card title — the
 * "Södra card" affordance signalling the whole card is a link /
 * expandable. `"none"` (default) keeps the plain title.
 */
export type CardBlockTitleLinkIcon = ItemCardTitleLinkIcon;

/**
 * Optional footer-band tint, independent of the card body surface.
 * `"none"` (default) inherits the card surface; a role value renders a
 * soft-tinted footer band under the content (`"muted"` = the shadcn
 * quiet surface).
 */
export type CardBlockFooterColorScheme = ItemCardFooterColorScheme;

/**
 * Fill of the thin accent strip pinned to the card's top edge —
 * mirrors the shared `color-scheme@1` enum (including the two gradient
 * entries) plus `"none"` (no strip, the default). The strip is a pure
 * chrome affordance: 6px tall, clipped to the card radius, painted
 * with the scheme's saturated background (or gradient) token.
 */
export type CardBlockAccentBar =
  | "none"
  | "white"
  | "black"
  | "neutral"
  | "primary"
  | "primary-gradient"
  | "secondary"
  | "secondary-gradient"
  | "tertiary"
  | "tertiary-gradient"
  | "accent"
  | "accent-gradient"
  | "accent-2"
  | "accent-2-gradient"
  | "accent-3"
  | "accent-3-gradient"
  | "info"
  | "success"
  | "warning"
  | "destructive";

/**
 * Accent-strip fills per scheme. Solid schemes use the role's
 * saturated background token; the two gradient schemes reuse the
 * same role pairings the Card primitive's `filled` gradients use
 * (primary→secondary, secondary→accent), run along the inline axis.
 */
const ACCENT_BAR_CLASSES: Record<
  Exclude<CardBlockAccentBar, "none">,
  string
> = {
  white: "bg-theme-white",
  black: "bg-theme-black",
  neutral: "bg-neutral",
  primary: "bg-primary",
  "primary-gradient": "bg-gradient-to-r from-primary to-secondary",
  secondary: "bg-secondary",
  "secondary-gradient": "bg-gradient-to-r from-secondary to-accent",
  tertiary: "bg-tertiary",
  // Neighbouring-role pairings so sibling cards can carry several
  // RELATED gradient hues (the Duke-Energy utility-card grid look):
  // accent→accent-2 → accent-2→accent-3 → accent-3→tertiary →
  // tertiary→primary walk the brand ramp without repeating a pair.
  "tertiary-gradient": "bg-gradient-to-r from-tertiary to-primary",
  accent: "bg-accent",
  "accent-gradient": "bg-gradient-to-r from-accent to-accent-2",
  "accent-2": "bg-accent-2",
  "accent-2-gradient": "bg-gradient-to-r from-accent-2 to-accent-3",
  "accent-3": "bg-accent-3",
  "accent-3-gradient": "bg-gradient-to-r from-accent-3 to-tertiary",
  info: "bg-info",
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
};

/**
 * Builds the accent-strip node handed to ItemCard's `accentBar` slot.
 * Absolutely pinned to the top edge (ItemCard adds `relative` +
 * layout-mode `overflow-hidden` clips it to the card radius) so it
 * never disturbs the card's flex flow or padding rhythm.
 */
function accentBarNode(accentBar: CardBlockAccentBar | undefined) {
  if (!accentBar || accentBar === "none") return undefined;
  const fill = ACCENT_BAR_CLASSES[accentBar];
  if (!fill) return undefined;
  return (
    <div
      aria-hidden="true"
      data-slot="card-accent-bar"
      className={cn("pointer-events-none absolute inset-x-0 top-0 h-1.5", fill)}
    />
  );
}

/**
 * `size@1` → badge treatment bucket. The shared six-step scale
 * collapses to three: xs/sm → compact, default/md → the historic
 * 48px badge, lg/xl → the large ~80px task-portal badge (the
 * Duke-Energy utility-card treatment).
 */
const ICON_BADGE_SIZE_CLASSES: Record<
  "compact" | "default" | "large",
  { shell: string; icon: string }
> = {
  compact: { shell: "size-10", icon: "size-5" },
  default: { shell: "size-12", icon: "size-6" },
  large: { shell: "size-20", icon: "size-10" },
};

function iconBadgeSizeBucket(
  size: string | undefined,
): keyof typeof ICON_BADGE_SIZE_CLASSES {
  const normalized = (size ?? "").trim().toLowerCase();
  if (normalized === "xs" || normalized === "sm") return "compact";
  if (normalized === "lg" || normalized === "xl") return "large";
  return "default";
}

/**
 * Badge tint per scheme — soft `-background` surface + the role's
 * saturated glyph color, per the color-role contract. Lets sibling
 * cards carry differently-hued badges (the target grids tint each
 * card's badge to its accent). `neutral` reads on any card surface.
 */
const ICON_BADGE_TINT_CLASSES: Record<CardBlockColorScheme, string> = {
  // `default` = no opinion. Empty so the `||` at the call site falls
  // through to the historic `primary` badge, which is what an unset
  // scheme has always rendered.
  default: "",
  // `none` = no chip surface at all; the glyph inherits the card's
  // text color. Useful for a bare icon above the title.
  none: "bg-transparent text-current",
  white: "bg-theme-white text-theme-black",
  black: "bg-theme-black text-theme-white",
  neutral: "bg-muted text-foreground",
  primary: "bg-primary-background text-primary",
  secondary: "bg-secondary-background text-secondary",
  tertiary: "bg-tertiary-background text-tertiary",
  accent: "bg-accent-background text-accent",
  "accent-2": "bg-accent-2-background text-accent-2",
  "accent-3": "bg-accent-3-background text-accent-3",
  info: "bg-info-background text-info",
  success: "bg-success-background text-success",
  warning: "bg-warning-background text-warning",
  destructive: "bg-destructive-background text-destructive",
  // The badge is small enough that a soft tint would read as flat, so
  // the gradients take their SATURATED fill + the paired foreground —
  // the same pairings SURFACE_TONE_CLASS and ACCENT_BAR_CLASSES use.
  "primary-gradient":
    "bg-gradient-to-br from-primary to-secondary text-primary-foreground",
  "secondary-gradient":
    "bg-gradient-to-br from-secondary to-accent text-secondary-foreground",
  "tertiary-gradient":
    "bg-gradient-to-br from-tertiary to-primary text-tertiary-foreground",
  "accent-gradient":
    "bg-gradient-to-br from-accent to-accent-2 text-accent-foreground",
  "accent-2-gradient":
    "bg-gradient-to-br from-accent-2 to-accent-3 text-accent-2-foreground",
  "accent-3-gradient":
    "bg-gradient-to-br from-accent-3 to-tertiary text-accent-3-foreground",
};

/**
 * Circular icon badge rendered in the card's media slot when
 * `iconName` is set — the utility-card treatment (icon badge above the
 * title). Soft role surface per the color-role contract (defaults to
 * the historic `bg-primary-background` + `text-primary`). Unknown /
 * empty names render nothing (NamedIcon's own degrade rule), so the
 * media slot falls back to the authored image.
 */
function iconBadgeNode(
  iconName: string | undefined,
  size?: string,
  colorScheme?: CardBlockColorScheme,
) {
  const name = iconName?.trim().toLowerCase();
  // `none` is the icon-name@1 clearing sentinel (Droplinks can't be
  // unset in Pages) — treat it exactly like empty so the media slot
  // falls back to the authored image. `iconByName` would reject it
  // anyway; the explicit check documents the contract.
  if (!name || name === "none" || !iconByName(name)) return undefined;
  const sizeClasses = ICON_BADGE_SIZE_CLASSES[iconBadgeSizeBucket(size)];
  const tint =
    (colorScheme && ICON_BADGE_TINT_CLASSES[colorScheme]) ||
    ICON_BADGE_TINT_CLASSES.primary;
  return (
    <span
      data-slot="card-icon-badge"
      className={cn(
        "flex items-center justify-center rounded-full",
        sizeClasses.shell,
        tint,
      )}
    >
      <NamedIcon name={name} className={sizeClasses.icon} />
    </span>
  );
}

/**
 * Optional title typography overrides (`TitleSize` / `TitleWeight`).
 * `default` (or unset) keeps the Card primitive's theme-token path
 * (`--card-title-weight` etc.) byte-identical; a concrete pick appends
 * literal classes that win the token fallbacks. Weight vocabulary
 * matches `title-weight@1` (hero's TitleWeight); size buckets the
 * shared `size@1` scale.
 */
const CARD_TITLE_SIZE_CLASSES: Record<string, string> = {
  xs: "text-sm",
  sm: "text-base",
  md: "text-xl",
  lg: "text-2xl leading-snug",
  xl: "text-3xl leading-snug",
};

const CARD_TITLE_WEIGHT_CLASSES: Record<string, string> = {
  light: "font-light",
  regular: "font-normal",
  semibold: "font-semibold",
  bold: "font-bold",
  heavy: "font-extrabold",
};

function titleTypographyClasses(
  titleSize: string | undefined,
  titleWeight: string | undefined,
): string | undefined {
  const size = CARD_TITLE_SIZE_CLASSES[(titleSize ?? "").trim().toLowerCase()];
  const weight =
    CARD_TITLE_WEIGHT_CLASSES[(titleWeight ?? "").trim().toLowerCase()];
  return cn(size, weight) || undefined;
}

/**
 * The shared `color-scheme@1` vocabulary, in full.
 *
 * This was a hand-written 11-value union — 10 short of the enum the
 * recipe params bind to (`default`, `none`, `white`, `black` and the
 * six gradients). Derived from the Card primitive rather than
 * re-spelled, so it cannot drift from what the card can actually paint:
 * widen the primitive's `colorScheme` variant and this follows, and the
 * compiler forces every `Record` over it to grow a matching entry.
 */
export type CardBlockColorScheme = NonNullable<ItemCardProps["colorScheme"]>;

type CardPadding = "sm" | "md" | "lg";

export interface CardBlockProps extends CmsProps {
  elevation?: "theme" | "none" | "xs" | "sm" | "base" | "md" | "lg";
  style?: "flat" | "outline" | "filled";
  padding?: CardPadding;
  /**
   * Card body scheme. Drives the outline border color when
   * `style="outline"`, the pale-tint background + foreground text
   * when `style="filled"`, and is a no-op on the `flat` default
   * (border-transparent overrides any scheme-tinted border). Action
   * button schemes live on `primaryActionColorScheme` +
   * `secondaryActionColorScheme` so cards can independently style
   * the body and the per-button treatments.
   */
  cardColorScheme?: CardBlockColorScheme;
  /**
   * Optional color band at the top of the card. When set, the title
   * moves into the band and renders with the scheme's foreground
   * color. `"none"` (default) keeps the standard header rendering.
   */
  colorBand?: CardBlockColorBand;
  /**
   * Optional trailing chevron/arrow glyph rendered inline after the
   * title. `"none"` (default) keeps the plain title; `"chevron"` /
   * `"arrow"` append the link-icon glyph (the whole-card-is-a-link
   * signal).
   */
  titleLinkIcon?: CardBlockTitleLinkIcon;
  /**
   * Thin (6px) accent strip across the card's top edge — `"none"`
   * (default) renders nothing; any scheme paints the strip with that
   * role's saturated color, and the two `-gradient` values run the
   * role pairing along the inline axis. Purely decorative chrome; the
   * duke-energy-style utility card pairs it with `iconName` +
   * `showDivider`.
   */
  accentBar?: CardBlockAccentBar;
  /**
   * Named vector icon from the curated `icon-name@1` vocabulary (e.g.
   * "bill", "globe"). Renders as a circular soft-primary badge in the
   * media slot above the title. Wins over `media` when both are set;
   * unknown/empty names degrade to the authored image (never an empty
   * circle).
   */
  iconName?: string;
  /**
   * Badge scale (`size@1`, bucketed): xs/sm → compact 40px,
   * default/md → the historic 48px, lg/xl → the large ~80px
   * task-portal badge. No effect without `iconName`.
   */
  iconBadgeSize?: string;
  /**
   * Badge tint (`color-scheme@1` solid roles): soft `-background`
   * surface + the role's saturated glyph color. Defaults to the
   * historic `primary`. Lets sibling cards carry differently-hued
   * badges. No effect without `iconName`.
   */
  iconBadgeColorScheme?: CardBlockColorScheme;
  /**
   * Title scale override (`size@1`, bucketed). `default`/unset keeps
   * the Card primitive's own scale; a concrete pick appends a literal
   * text-size class (lg ≈ the big utility-card heading).
   */
  titleSize?: string;
  /**
   * Title weight override (`title-weight@1`). `default`/unset keeps
   * the `--card-title-weight` theme token (600 fallback); `regular`
   * is the light editorial utility-card heading.
   */
  titleWeight?: string;
  /**
   * Render a hairline rule between the header (title + description)
   * and the body — the "title, divider, then rows" utility-card
   * treatment. Accepts the Sitecore checkbox param's string shape.
   */
  showDivider?: string | boolean;
  mediaBleed?: CardBlockMediaBleed;
  mediaClassName?: string;
  /**
   * Optional caption rendered as an opaque overlay band at the bottom
   * of the media. Distinct from `colorBand`.
   */
  /**
   * How the media fills its box (`media-fit@1`). `cover` (default)
   * crops to fill; `contain` fits the whole image in. Matters most on
   * the ICON media path, where a brand mark is otherwise cropped
   * square inside a 96px box.
   */
  mediaFit?: string;
  mediaCaption?: TextSource;
  mediaCaptionClassName?: string;
  headerClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  media?: ImageSource;
  title?: TextSource;
  description?: TextSource;
  content?: RichTextSource;
  primaryAction?: LinkSource;
  primaryActionVariant?: CardBlockActionStyle;
  /**
   * Primary action button scheme. Independent of `cardColorScheme`
   * so a neutral card body can carry a primary-tinted main CTA
   * (the common case). Defaults to `primary`.
   */
  primaryActionColorScheme?: CardBlockColorScheme;
  /** Append a trailing arrow (→) after the primary action label. */
  primaryActionShowArrow?: string | boolean;
  secondaryAction?: LinkSource;
  secondaryActionVariant?: CardBlockActionStyle;
  /**
   * Secondary action button scheme. Defaults to `neutral` so it
   * reads as a calmer companion next to the main CTA.
   */
  secondaryActionColorScheme?: CardBlockColorScheme;
  /** Append a trailing arrow (→) after the secondary action label. */
  secondaryActionShowArrow?: string | boolean;
  /**
   * Size applied to BOTH action buttons (`size@1`, shared with
   * cta-button). `default` defers to the button's natural size; the
   * scale values override it. Shared across the two actions so a
   * card's CTAs read consistently.
   */
  actionSize?: CtaButtonSize;
  /**
   * Horizontal alignment of the action row. `start` is the default;
   * `end` pushes actions to the inline-end edge. Logical direction —
   * flips correctly under RTL.
   */
  actionPlacement?: CardBlockActionPlacement;
  footer?: RichTextSource;
  /**
   * Optional footer-band tint, independent of the card body surface.
   * `"none"` (default) keeps the footer inheriting the card surface; a
   * role value renders a full-width soft-tinted footer band under the
   * content (`"muted"` = the shadcn quiet surface). The "Södra card"
   * footer.
   */
  footerColorScheme?: CardBlockFooterColorScheme;
  /**
   * Per-placement digit suffix SXA injects when the rendering is
   * marked `IsRenderingsWithDynamicPlaceholders=true`. Only consumed by
   * the `Placeholders` variant — names the `card-body-<id>` and
   * `card-footer-<id>` slots.
   */
  dynamicPlaceholderId?: string;
}

/**
 * Renders a single action link via CTA Button. Style maps 1:1 to the
 * CTA Button variant axis — same `default / outline / ghost / link /
 * pill` enum the standalone CtaButton rendering uses, so author
 * choices read identically across the system. CTA Button owns the
 * Link primitive's slot, hover treatment, per-scheme text colour, the
 * link+arrow
 * normalization.
 *
 * `placeholder` + `isEditing` aren't needed here: CTA Button's own
 * `link` prop branch already renders an editable Link placeholder
 * stub when the source is empty.
 */
function ActionLink({
  action,
  style,
  colorScheme,
  showArrow,
  size,
}: {
  action: LinkSource | undefined;
  style: CardBlockActionStyle;
  colorScheme?: CardBlockColorScheme;
  showArrow?: string | boolean;
  size?: CtaButtonSize;
}) {
  return (
    <Button
      link={action}
      variant={style}
      // `default` is the one scheme a button can't paint — it means
      // "inherit", which for a CTA is "keep the caller's own default"
      // rather than a role, so hand back nothing.
      colorScheme={colorScheme === "default" ? undefined : colorScheme}
      showArrow={showArrow}
      size={size}
    />
  );
}

/**
 * Sitecore-friendly card shell. All slots are source-driven — consumers
 * that need to drop arbitrary React content into the card chrome
 * should compose the `ItemCard` shell from `blocks/item-card` directly
 * (passing JSX into its slot props) or fall back to the primitive
 * `Card` atoms for fully bespoke compositions.
 *
 * Layout, bleed, color-band, and action-placement logic live on the
 * shared `ItemCard` in `blocks/item-card`. CardBlock's job is to wrap
 * editable Sources (`<Text>`, `<Image>`, `<RichText>`, action buttons)
 * and pipe them into ItemCard's slots.
 */
export function CardBlock({
  styles,
  id,
  isEditing,
  elevation = "theme",
  style = "flat",
  padding = "lg",
  cardColorScheme = "neutral",
  colorBand = "none",
  titleLinkIcon = "none",
  accentBar = "none",
  iconName,
  iconBadgeSize,
  iconBadgeColorScheme,
  titleSize,
  titleWeight,
  showDivider,
  mediaBleed = "none",
  mediaClassName,
  mediaCaption,
  mediaFit,
  mediaCaptionClassName,
  headerClassName,
  titleClassName,
  descriptionClassName,
  contentClassName,
  footerClassName,
  footerColorScheme = "none",
  media,
  title,
  description,
  content,
  primaryAction,
  primaryActionVariant,
  primaryActionColorScheme = "primary",
  primaryActionShowArrow,
  secondaryAction,
  secondaryActionVariant,
  secondaryActionColorScheme = "neutral",
  secondaryActionShowArrow,
  actionSize,
  actionPlacement = "start",
  footer,
}: CardBlockProps) {
  const primaryActionStyle = primaryActionVariant ?? "default";
  const secondaryActionStyle = secondaryActionVariant ?? "outline";
  const isIconMedia = mediaBleed === "icon";
  const hasActions =
    primaryAction != null || secondaryAction != null || isEditing;
  const hasFooter = footer != null;
  const hasMediaCaption = mediaCaption != null;
  const iconBadge = iconBadgeNode(
    iconName,
    iconBadgeSize,
    iconBadgeColorScheme,
  );
  // A badge in the media slot NEVER wants fullbleed (the recipe default
  // for image cards) — it slams the circle flush into the card corner,
  // colliding with the accent bar. Auto-correct to the padded inset.
  const effectiveMediaBleed =
    iconBadge && mediaBleed === "fullbleed" ? "none" : mediaBleed;

  return (
    <ItemCard
      id={id}
      className={styles?.trimEnd()}
      elevation={elevation}
      style={style}
      padding={padding}
      colorScheme={cardColorScheme}
      colorBand={colorBand}
      titleLinkIcon={titleLinkIcon}
      accentBar={accentBarNode(accentBar)}
      headerDivider={isEnabled(showDivider)}
      mediaBleed={effectiveMediaBleed}
      mediaClassName={mediaClassName}
      mediaCaptionClassName={mediaCaptionClassName}
      headerClassName={headerClassName}
      titleClassName={cn(
        titleTypographyClasses(titleSize, titleWeight),
        titleClassName,
      )}
      descriptionClassName={descriptionClassName}
      contentClassName={contentClassName}
      footerClassName={footerClassName}
      footerColorScheme={footerColorScheme}
      actionPlacement={actionPlacement}
      media={
        iconBadge ??
        (media != null ? (
          <Image
            value={media}
            placeholder="Media"
            isEditing={isEditing}
            className={
              isIconMedia
                ? cn("h-24 w-24 rounded-md", mediaFitClass(mediaFit))
                : mediaFit
                  ? mediaFitClass(mediaFit)
                  : undefined
            }
          />
        ) : undefined)
      }
      mediaCaption={
        hasMediaCaption ? (
          // Render via inline `span` (not `TypographyP`) — globals.css's
          // base layer applies `text-muted-foreground` to every <p>, which would
          // override the band's `text-primary-foreground`.
          <Text
            value={mediaCaption}
            tag="span"
            placeholder="Caption"
            isEditing={isEditing}
          />
        ) : undefined
      }
      title={<Text value={title} placeholder="Title" isEditing={isEditing} />}
      description={
        <Text
          value={description}
          placeholder="Description"
          isEditing={isEditing}
        />
      }
      content={
        <RichText value={content} placeholder="Body" isEditing={isEditing} />
      }
      actions={
        hasActions ? (
          <>
            <ActionLink
              action={primaryAction}
              style={primaryActionStyle}
              colorScheme={primaryActionColorScheme}
              showArrow={primaryActionShowArrow}
              size={actionSize}
            />
            <ActionLink
              action={secondaryAction}
              style={secondaryActionStyle}
              colorScheme={secondaryActionColorScheme}
              showArrow={secondaryActionShowArrow}
              size={actionSize}
            />
          </>
        ) : undefined
      }
      footer={
        hasFooter ? (
          <RichText value={footer} placeholder="Footer" isEditing={isEditing} />
        ) : undefined
      }
    />
  );
}

export default CardBlock;

/** Sitecore default variant — source-driven body + footer + actions. */
export const Default = CardBlock;

/**
 * Source-driven head (title + description + media + colorBand) with
 * Sitecore placeholders for the body and footer. Content / Footer /
 * Action fields are ignored on this variant; authors drop renderings
 * into `card-body-{*}` and `card-footer-{*}` instead.
 */
export function Placeholders({
  styles,
  id,
  isEditing,
  elevation = "theme",
  style = "flat",
  padding = "lg",
  cardColorScheme = "neutral",
  colorBand = "none",
  titleLinkIcon = "none",
  accentBar = "none",
  iconName,
  iconBadgeSize,
  iconBadgeColorScheme,
  titleSize,
  titleWeight,
  showDivider,
  mediaBleed = "none",
  mediaClassName,
  mediaCaption,
  mediaFit,
  mediaCaptionClassName,
  headerClassName,
  titleClassName,
  descriptionClassName,
  contentClassName,
  footerClassName,
  footerColorScheme = "none",
  media,
  title,
  description,
  dynamicPlaceholderId,
  rendering,
}: CardBlockProps) {
  const isIconMedia = mediaBleed === "icon";
  const hasMediaCaption = mediaCaption != null;
  const iconBadge = iconBadgeNode(
    iconName,
    iconBadgeSize,
    iconBadgeColorScheme,
  );
  // Same auto-correction as the Default variant — a badge never wants
  // the fullbleed media treatment.
  const effectiveMediaBleed =
    iconBadge && mediaBleed === "fullbleed" ? "none" : mediaBleed;

  // SXA injects a per-placement digit suffix when the rendering opts
  // into dynamic placeholders. See section-wrapper.tsx for the full
  // rationale on why the literal `{*}` token doesn't work.
  const phSuffix = dynamicPlaceholderId ?? "1";
  const bodyPlaceholder = `card-body-${phSuffix}`;
  const footerPlaceholder = `card-footer-${phSuffix}`;

  // Mirror container.tsx / section-wrapper.tsx: ALWAYS render
  // `<Placeholder>` when we have a rendering envelope. Pages chrome
  // reads the Placeholder component's data attributes to wire drop
  // targets — gating it behind `isEditing || hasChildren` (the previous
  // shape) left the editor with nowhere to hang the drop-zone marker,
  // so authors couldn't drop anything into the card's slots. Outside
  // editing an empty Placeholder renders nothing on its own, so empty
  // slots still collapse.
  const slotNode = (name: string, stubClassName: string) => {
    if (rendering) {
      return <Placeholder name={name} rendering={rendering} />;
    }
    return <div className={stubClassName} />;
  };

  return (
    <ItemCard
      id={id}
      className={styles?.trimEnd()}
      elevation={elevation}
      style={style}
      padding={padding}
      colorScheme={cardColorScheme}
      colorBand={colorBand}
      titleLinkIcon={titleLinkIcon}
      accentBar={accentBarNode(accentBar)}
      headerDivider={isEnabled(showDivider)}
      mediaBleed={effectiveMediaBleed}
      mediaClassName={mediaClassName}
      mediaCaptionClassName={mediaCaptionClassName}
      headerClassName={headerClassName}
      titleClassName={cn(
        titleTypographyClasses(titleSize, titleWeight),
        titleClassName,
      )}
      descriptionClassName={descriptionClassName}
      contentClassName={contentClassName}
      footerClassName={footerClassName}
      footerColorScheme={footerColorScheme}
      media={
        iconBadge ??
        (media != null ? (
          <Image
            value={media}
            placeholder="Media"
            isEditing={isEditing}
            className={
              isIconMedia
                ? cn("h-24 w-24 rounded-md", mediaFitClass(mediaFit))
                : mediaFit
                  ? mediaFitClass(mediaFit)
                  : undefined
            }
          />
        ) : undefined)
      }
      mediaCaption={
        hasMediaCaption ? (
          <Text
            value={mediaCaption}
            tag="span"
            placeholder="Caption"
            isEditing={isEditing}
          />
        ) : undefined
      }
      title={<Text value={title} placeholder="Title" isEditing={isEditing} />}
      description={
        <Text
          value={description}
          placeholder="Description"
          isEditing={isEditing}
        />
      }
      content={slotNode(
        bodyPlaceholder,
        "h-16 w-full rounded-md border border-border border-dashed bg-muted/30",
      )}
      footer={slotNode(
        footerPlaceholder,
        "h-10 w-full rounded-md border border-border border-dashed bg-muted/30",
      )}
    />
  );
}

/**
 * `universal` opts this file into BOTH the server and client
 * component maps the SDK generates (component-map.ts +
 * component-map.client.ts). Server-only by default would land
 * here in the server map alone, which means Sitecore Pages chrome
 * (browser-side) cannot look the component up and its named-export
 * variants (Headless, Media, etc.) fail to resolve. No runtime
 * behaviour change: the file stays a plain RSC server component
 * (no useState, no client-only hooks here); the universal marker
 * is purely a generate-map signal.
 */
export const componentType = "universal";
