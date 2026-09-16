import { ArrowRight, ChevronRight } from "lucide-react";
import type React from "react";
import type { ReactNode } from "react";
import {
  Card as PrimitiveCard,
  CardAction as PrimitiveCardAction,
  CardContent as PrimitiveCardContent,
  CardDescription as PrimitiveCardDescription,
  CardFooter as PrimitiveCardFooter,
  CardHeader as PrimitiveCardHeader,
  CardTitle as PrimitiveCardTitle,
} from "@/components/registry/primitives/core/card";
import { cn } from "@/lib/registry/cn";

type PrimitiveCardProps = React.ComponentProps<typeof PrimitiveCard>;
type PrimitiveCardPadding = NonNullable<PrimitiveCardProps["padding"]>;

/**
 * Optional color band rendered at the top of the card. When set to a
 * named scheme the band takes the title and renders against the
 * scheme's saturated background + foreground tokens. `"none"`
 * (default) keeps the standard header rendering.
 */
export type ItemCardColorBand =
  | "none"
  | "neutral"
  | "primary"
  | "secondary"
  | "tertiary"
  | "accent"
  | "accent-2"
  | "accent-3"
  | "info"
  | "success"
  | "warning"
  | "destructive";

/**
 * Optional trailing link-icon glyph rendered inline after the card
 * title. Signals the whole card is a link / expandable target (the
 * "Södra card" treatment). `"none"` (default) keeps the plain title;
 * `"chevron"` appends a right-chevron, `"arrow"` a right-arrow. Both
 * glyphs are decorative (aria-hidden) — the title text carries meaning.
 */
export type ItemCardTitleLinkIcon = "none" | "chevron" | "arrow";

/**
 * Optional tint for the card footer band, independent of the card body
 * surface. `"none"` (default) keeps the footer inheriting the card
 * surface (rendered inline in the content wrapper, unchanged). A role
 * value renders the footer as a full-width soft-tinted band under the
 * content — `"muted"` the shadcn quiet surface, the saturated roles
 * their soft-surface pair. Mirrors the primitive `CardFooter` `surface`
 * variant; every value resolves to a theme token, never a hex.
 */
export type ItemCardFooterColorScheme =
  | "none"
  | "muted"
  | "neutral"
  | "primary"
  | "secondary"
  | "tertiary"
  | "accent"
  | "accent-2"
  | "accent-3"
  | "info"
  | "success"
  | "warning"
  | "destructive";

/**
 * How the media slot is sized + placed relative to the card padding.
 *
 *   `none`        Media renders inside the padded content area at its
 *                 natural display size (default — editorial card with
 *                 image inset from card edge).
 *   `fullbleed`   Media extends to the card edges, ignoring padding
 *                 — the canonical "image-led" treatment.
 *   `icon`        Small (~6rem) media at the top-start, useful for
 *                 category / feature-card layouts where the image is
 *                 decorative rather than the focal point.
 */
export type ItemCardMediaBleed = "none" | "fullbleed" | "icon";

/** Horizontal alignment of the action row within the card body. */
export type ItemCardActionPlacement = "start" | "end";

/** Focus ring + `group` token for nested hover effects — applied to every
 *  ItemCard. */
const INTERACTION_BASE =
  "group relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** Hover affordance derived from the card's elevation: a raised card
 *  (any real shadow) lifts on hover; a flat/none/theme card stays put. */
const interactionHover = (
  elevation: PrimitiveCardProps["elevation"] | undefined,
): string =>
  elevation && elevation !== "none" && elevation !== "theme"
    ? "transition-shadow hover:shadow-md"
    : "";

/**
 * Positive-padding classes used by layout mode. The Card primitive
 * itself runs `p-0` in layout mode (its `padding` variant produces no
 * outer padding); the padding lives on inner wrappers below — a media
 * inset wrapper, a band wrapper, and the content padding wrapper. This
 * is the same architecture product-card uses: outer card holds the
 * surface + radius + border + shadow, an inner wrapper holds the
 * editorial padding. Eliminates the negative-margin tricks the old
 * layout mode used to escape the Card's outer padding.
 */
const CONTENT_PADDING_X: Record<PrimitiveCardPadding, string> = {
  sm: "px-3",
  md: "px-5",
  lg: "px-7",
};
const CONTENT_PADDING_Y: Record<PrimitiveCardPadding, string> = {
  sm: "py-3",
  md: "py-5",
  lg: "py-7",
};

/**
 * Saturated background + foreground pair per band scheme. Exported so
 * card variants that paint their own scheme-colored panel (e.g. the
 * feature card's OverlayPanel treatment) reuse the exact band palette
 * instead of forking a parallel map.
 */
export const COLOR_BAND_CLASSES: Record<
  Exclude<ItemCardColorBand, "none">,
  string
> = {
  neutral: "bg-neutral-background text-neutral",
  primary: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
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
 * Trailing title-link-icon glyph. Decorative (`aria-hidden`) — the
 * title text is the accessible label. Sized in `em` so it scales with
 * the title font. Returns null for `none`/undefined so the default
 * title rendering stays byte-identical.
 */
function titleLinkGlyph(linkIcon: ItemCardTitleLinkIcon | undefined) {
  if (!linkIcon || linkIcon === "none") return null;
  const Icon = linkIcon === "arrow" ? ArrowRight : ChevronRight;
  return (
    <Icon
      aria-hidden="true"
      data-slot="card-title-link-icon"
      data-title-link-icon={linkIcon}
      className="size-[1.1em] shrink-0"
    />
  );
}

/**
 * Compose a title node with its optional trailing link-icon glyph.
 *
 * Exported because the cards-and-lists leaf cards render their own
 * titles (their own `TypographyH4`/`CardTitle` markup) instead of
 * handing a `title` node to `ItemCard`'s header slot — so they can't
 * inherit the link icon from the card the way the layout-mode header
 * and colour band do. Routing every caller through this one helper
 * keeps the glyph, its spacing, and its `data-` hooks identical
 * everywhere.
 *
 * Returns `title` unchanged when no link icon is set, so the default
 * rendering stays byte-identical and only an explicitly-set param adds
 * a wrapper element.
 */
export function withTitleLinkIcon(
  title: ReactNode,
  linkIcon: ItemCardTitleLinkIcon | undefined,
): ReactNode {
  const glyph = titleLinkGlyph(linkIcon);
  if (title == null || glyph == null) return title;
  return (
    <span className="inline-flex items-center gap-1.5">
      {title}
      {glyph}
    </span>
  );
}

// `title` collides with HTMLAttributes.title (string — tooltip) and
// `content` collides with HTMLAttributes.content (string — RDFa). Drop
// both from the inherited prop bag so our ReactNode slot overrides
// don't intersect into `string & ReactNode`.
export type ItemCardProps = Omit<PrimitiveCardProps, "title" | "content"> & {
  /**
   * Optional accent-strip slot rendered as the card's first child
   * (before media / band / content). The card root gains `relative`
   * when this is set so callers can pin an absolutely-positioned
   * strip to the top edge (`absolute inset-x-0 top-0`) without
   * disturbing the flex flow; `overflow-hidden` on the layout-mode
   * root clips it to the card radius. The caller owns the node's
   * styling (height, solid/gradient fill).
   */
  accentBar?: ReactNode;

  /**
   * Optional color band rendered above the header. When set to a
   * named scheme the band takes the title (the header's own title
   * slot is suppressed) and renders against the scheme's saturated
   * background + foreground tokens.
   */
  colorBand?: ItemCardColorBand;

  /** Slot for the card's media element (image, video, custom JSX). */
  media?: ReactNode;
  /** How the media is sized / placed relative to the card padding. */
  mediaBleed?: ItemCardMediaBleed;
  /** Optional caption rendered as an overlay band at the bottom of the media. */
  mediaCaption?: ReactNode;
  mediaClassName?: string;
  mediaCaptionClassName?: string;

  /** Header slots. When unset the header doesn't render. */
  title?: ReactNode;
  /**
   * Optional trailing chevron/arrow glyph rendered inline after the
   * title (in both the header and the color-band treatments). `"none"`
   * (default) keeps the plain title.
   */
  titleLinkIcon?: ItemCardTitleLinkIcon;
  description?: ReactNode;
  /**
   * Render a hairline rule between the header and the body content —
   * the "title, divider, then rows" utility-card treatment. Only
   * meaningful in layout mode when a header renders; ignored
   * otherwise.
   */
  headerDivider?: boolean;

  /** Body content slot. */
  content?: ReactNode;

  /** Action row slot — typically one or two CTA buttons. */
  actions?: ReactNode;
  /** Horizontal alignment of the action row. */
  actionPlacement?: ItemCardActionPlacement;

  /** Footer slot rendered below the body. */
  footer?: ReactNode;
  /**
   * Optional tint for the footer region, independent of the card body
   * surface. `"none"` (default) keeps the footer inline in the content
   * wrapper (unchanged); a role value promotes the footer to a
   * full-width soft-tinted band under the content.
   */
  footerColorScheme?: ItemCardFooterColorScheme;

  headerClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
};

/** Media slot for layout mode — handles the inset / fullbleed / icon
 *  bleed treatments and the optional caption band. Returns null when no
 *  media is provided. */
function CardMedia({
  media,
  mediaBleed,
  mediaCaption,
  mediaClassName,
  mediaCaptionClassName,
  px,
}: {
  media: ReactNode;
  mediaBleed: ItemCardMediaBleed;
  mediaCaption?: ReactNode;
  mediaClassName?: string;
  mediaCaptionClassName?: string;
  px: string;
}) {
  if (media == null) return null;
  const hasMediaCaption = mediaCaption != null;
  const isIconMedia = mediaBleed === "icon";
  return (
    <div
      className={cn(
        "relative",
        // overflow-hidden keeps the caption band clipped to the
        // image bounds when the card has a non-zero radius.
        hasMediaCaption && "overflow-hidden",
        // `none` (inset) wraps the media in horizontal+top padding
        // so the image sits visually inside the card's editorial
        // grid. `fullbleed` skips padding so the image fills the
        // card edge-to-edge. `icon` uses a small fixed-size frame
        // with a top-start inset.
        mediaBleed === "none" && cn(px, "pt-(--card-padding,1.25rem)"),
        mediaBleed === "fullbleed" && undefined,
        isIconMedia && cn(px, "w-24 pt-(--card-padding,1.25rem)"),
        mediaClassName,
      )}
    >
      {media}
      {hasMediaCaption && (
        <div
          className={cn(
            "wrap-break-word absolute inset-x-0 bottom-0 bg-primary px-6 py-4 font-bold text-lg text-primary-foreground",
            mediaCaptionClassName,
          )}
        >
          {mediaCaption}
        </div>
      )}
    </div>
  );
}

/** Header block for layout mode — title (unless a color band consumed
 *  it) + description, plus the optional hairline divider that separates
 *  the header from the body. Extracted from ItemCard to keep its
 *  cognitive complexity in check. */
function CardHeaderBlock({
  bandActive,
  title,
  description,
  headerDivider,
  headerClassName,
  titleClassName,
  descriptionClassName,
}: {
  bandActive: boolean;
  title: ReactNode;
  description: ReactNode;
  headerDivider: boolean;
  headerClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}) {
  return (
    <>
      <PrimitiveCardHeader className={cn("border-0 p-0", headerClassName)}>
        {!bandActive && title != null && (
          <PrimitiveCardTitle className={cn(titleClassName)}>
            {title}
          </PrimitiveCardTitle>
        )}
        {description != null && (
          <PrimitiveCardDescription className={cn(descriptionClassName)}>
            {description}
          </PrimitiveCardDescription>
        )}
      </PrimitiveCardHeader>
      {headerDivider && (
        <div
          aria-hidden="true"
          data-slot="item-card-header-divider"
          className="border-border border-b"
        />
      )}
    </>
  );
}

function hasAnyLayoutSlot(props: ItemCardProps): boolean {
  return (
    props.accentBar != null ||
    props.media != null ||
    props.title != null ||
    props.description != null ||
    props.content != null ||
    props.actions != null ||
    props.footer != null ||
    props.mediaCaption != null ||
    (props.colorBand != null && props.colorBand !== "none")
  );
}

/**
 * Shared card wrapper for entity-style cards. Lives in building blocks
 * so Sitecore cards and non-Sitecore blocks can compose the same shell.
 *
 * Two modes — chosen automatically by which props are set:
 *
 *   **Wrapper mode** (no slot props set): renders the primitive Card
 *   around `children`. Callers compose the card body by hand using the
 *   re-exported atoms (`ItemCardHeader`, `ItemCardTitle`, …). The
 *   Card's own `padding` variant applies normally.
 *
 *   **Layout mode** (any of `media` / `title` / `description` /
 *   `content` / `actions` / `footer` / `mediaCaption` / non-`none`
 *   `colorBand` set): renders the standard card composition — media,
 *   color band, header, content + actions, footer — into the slots
 *   provided. The Card runs `p-0` here (no outer padding); media at
 *   `fullbleed` fills the card naturally, media at `none` (inset)
 *   sits in a padded wrapper, and the editorial content lives in a
 *   final padded wrapper. No negative margins anywhere — the
 *   product-card / location-card pattern, generalized.
 */
export function ItemCard({
  elevation,
  style,
  padding,
  colorScheme,
  className,
  accentBar,
  colorBand = "none",
  media,
  mediaBleed = "fullbleed",
  mediaCaption,
  mediaClassName,
  mediaCaptionClassName,
  title,
  titleLinkIcon = "none",
  description,
  headerDivider = false,
  content,
  actions,
  actionPlacement = "start",
  footer,
  footerColorScheme = "none",
  headerClassName,
  titleClassName,
  descriptionClassName,
  contentClassName,
  footerClassName,
  children,
  ...rest
}: ItemCardProps) {
  const resolvedElevation = elevation;
  // Image/media cards must not sit on the `filled` muted slab: a cut-out
  // (transparent) product / logo image shows the dark
  // `--card-muted-background` behind it. When the card renders a bound
  // IMAGE (not an icon chip), downgrade a `filled` surface to `bare`
  // (transparent) so the image and its surroundings read on the section
  // background instead of a dark panel. Explicit non-filled styles
  // (outline / elevated / flat) are respected, and icon-media chips keep
  // their surface (a small glyph reads fine on a tinted chip).
  const hasImageMedia = media != null && mediaBleed !== "icon";
  const resolvedStyle = hasImageMedia && style === "filled" ? "bare" : style;
  const resolvedPadding = padding;
  // Interaction is applied to every ItemCard: the focus/group base plus
  // an elevation-derived hover lift.
  const interaction = cn(INTERACTION_BASE, interactionHover(resolvedElevation));

  const useLayout = hasAnyLayoutSlot({
    accentBar,
    media,
    title,
    description,
    content,
    actions,
    footer,
    mediaCaption,
    colorBand,
  });

  // Wrapper mode — backward-compatible with the original ItemCard API.
  if (!useLayout) {
    return (
      <PrimitiveCard
        data-slot="item-card"
        elevation={resolvedElevation}
        style={resolvedStyle}
        padding={resolvedPadding}
        colorScheme={colorScheme}
        className={cn(interaction, className)}
        {...rest}
      >
        {children}
      </PrimitiveCard>
    );
  }

  // Layout mode.
  const bandActive = colorBand !== "none";
  const hasActions = actions != null;
  const hasFooter = footer != null;
  // Footer tint promotes the footer to a full-width band rendered
  // OUTSIDE the padded content wrapper; `none` keeps it inline in the
  // wrapper (byte-identical to the historical rendering).
  const footerBandActive = footerColorScheme !== "none";
  const footerInInnerWrapper = hasFooter && !footerBandActive;
  // Title in the header only when it's not consumed by the band.
  const hasHeader = (!bandActive && title != null) || description != null;
  const hasContent = content != null;
  const hasInnerWrapper =
    bandActive || hasHeader || hasContent || hasActions || footerInInnerWrapper;
  // Compose the title with its optional trailing link-icon glyph once,
  // so the band and header treatments share the exact same node. When
  // no link icon is set this is just `title` (unchanged rendering).
  const titleContent = withTitleLinkIcon(title, titleLinkIcon);

  // Resolve the effective padding axis — falls back to `lg` to match
  // the primitive Card's own default so the inset wrappers look
  // proportional even when neither preset nor explicit prop is set.
  const layoutPadding: PrimitiveCardPadding = resolvedPadding ?? "lg";
  const px = CONTENT_PADDING_X[layoutPadding];
  const py = CONTENT_PADDING_Y[layoutPadding];

  return (
    <PrimitiveCard
      data-slot="item-card"
      elevation={resolvedElevation}
      style={resolvedStyle}
      // Layout mode: zero out the Card's own padding — inner wrappers
      // own the padding so the media slot can fill the card edge-to-
      // edge naturally (no negative margins needed).
      padding={resolvedPadding}
      colorScheme={colorScheme}
      className={cn(
        "overflow-hidden p-0",
        accentBar != null && "relative",
        interaction,
        className,
      )}
      {...rest}
    >
      {accentBar}
      <CardMedia
        media={media}
        mediaBleed={mediaBleed}
        mediaCaption={mediaCaption}
        mediaClassName={mediaClassName}
        mediaCaptionClassName={mediaCaptionClassName}
        px={px}
      />
      {bandActive && (
        <div
          className={cn(
            "wrap-break-word font-heading font-semibold text-lg",
            px,
            layoutPadding === "sm" ? "py-2" : "py-3",
            COLOR_BAND_CLASSES[colorBand],
          )}
        >
          {titleContent}
        </div>
      )}
      {hasInnerWrapper && (
        <div className={cn("flex flex-col gap-6", px, py)}>
          {hasHeader && (
            <CardHeaderBlock
              bandActive={bandActive}
              title={titleContent}
              description={description}
              headerDivider={headerDivider}
              headerClassName={headerClassName}
              titleClassName={titleClassName}
              descriptionClassName={descriptionClassName}
            />
          )}
          {(hasContent || hasActions) && (
            <PrimitiveCardContent className={cn("p-0", contentClassName)}>
              {content}
              {hasActions && (
                <PrimitiveCardAction
                  className={cn(
                    // CardAction defaults to top-end grid placement;
                    // this composition lives in the card body, so
                    // switch to static + flex.
                    "static col-auto row-auto mt-4 flex flex-wrap items-center gap-3 self-auto justify-self-auto",
                    actionPlacement === "end" ? "justify-end" : "justify-start",
                  )}
                >
                  {actions}
                </PrimitiveCardAction>
              )}
            </PrimitiveCardContent>
          )}
          {footerInInnerWrapper && (
            <PrimitiveCardFooter className={cn("block p-0", footerClassName)}>
              {footer}
            </PrimitiveCardFooter>
          )}
        </div>
      )}
      {hasFooter && footerBandActive && (
        // Tinted footer band: rendered OUTSIDE the padded content
        // wrapper so it spans the card edge-to-edge (its own px/py), a
        // distinct region under the body — the "Södra card" footer.
        <PrimitiveCardFooter
          surface={footerColorScheme}
          className={cn("block", px, py, footerClassName)}
        >
          {footer}
        </PrimitiveCardFooter>
      )}
      {children}
    </PrimitiveCard>
  );
}

export const ItemCardHeader = PrimitiveCardHeader;
export const ItemCardTitle = PrimitiveCardTitle;
export const ItemCardDescription = PrimitiveCardDescription;
export const ItemCardAction = PrimitiveCardAction;
export const ItemCardContent = PrimitiveCardContent;
export const ItemCardFooter = PrimitiveCardFooter;

// Compatibility aliases for incremental migration from primitive Card imports.
export const Card = ItemCard;
export const CardHeader = ItemCardHeader;
export const CardTitle = ItemCardTitle;
export const CardDescription = ItemCardDescription;
export const CardAction = ItemCardAction;
export const CardContent = ItemCardContent;
export const CardFooter = ItemCardFooter;
