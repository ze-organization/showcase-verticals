import {
  COLOR_BAND_CLASSES,
  ItemCard,
  type ItemCardColorBand,
  type ItemCardMediaBleed,
  type ItemCardProps,
  type ItemCardTitleLinkIcon,
  withTitleLinkIcon,
} from "@/components/registry/blocks/item-card";
import { Button } from "@/components/registry/components/ui/cta-button";
import { iconByName } from "@/components/registry/graphics/icons/named-icon/icon-vocabulary";
import { NamedIcon } from "@/components/registry/graphics/icons/named-icon/named-icon";
import { TypographyDisplay } from "@/components/registry/primitives/core/typography";
import { ArrowLink } from "@/components/registry/primitives/editables/arrow-link";
import {
  type ImageSource,
  NextImage,
} from "@/components/registry/primitives/editables/image";
import {
  Link,
  type LinkSource,
} from "@/components/registry/primitives/editables/link";
import {
  RichText,
  type RichTextSource,
} from "@/components/registry/primitives/editables/richtext";
import { getImageSrc } from "@/components/registry/primitives/editables/source-normalizers";
import {
  Text,
  type TextSource,
} from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import { mediaFitClass } from "@/lib/registry/media-fit";
import {
  parseBoolParam,
  parseButtonVariant,
  type SitecoreBoolInput,
} from "@/lib/registry/param-parsers";
import type { CmsProps } from "@/lib/registry/sitecore";
import { type CardCtaPlacement, parseCardCtaPlacement } from "./_cta-placement";
import { type CardCtaShape, ctaShapeClassName } from "./_cta-shape";
import {
  type CardMediaAspect,
  MEDIA_ASPECT_CLASSES,
  MEDIA_SHAPE_CLASSES,
  type MediaShape,
  parseCardMediaAspect,
  parseOptionalMediaShape,
} from "./_media-aspect";

/**
 * Feature card — leaf rendering for the features family. Fields and
 * params map 1:1 to the `feature-card@1` recipe via `withSitecore`'s
 * default convention map; extends `CmsProps` so `id` / `styles` /
 * `isEditing` are picked up automatically. No sibling `.sitecore.ts`
 * adapter — pure default convention.
 *
 * All five variants compose the shared `ItemCard` shell from
 * `blocks/item-card` so chrome (elevation/style/padding/colorScheme),
 * media bleed, and the header / content / actions topology are
 * consistent with the rest of the cards-and-lists family.
 *
 * Seven variants — each variant has a distinct DOM topology (see
 * [[feedback-variant-vs-parameter]]):
 *   - `Default`       bare title + body + arrow CTA (no card chrome)
 *   - `NumberedTile`  large ordinal badge + title + body, hover-tint card
 *   - `MediaBanded`   image with title overlaid as a caption band
 *   - `MediaStacked`  image on top, large title + body + bare link, no chrome
 *   - `Horizontal`    media-left row: image start, title + body + CTA end
 *   - `IconTile`      small icon + title + body + outline-pill CTA, filled card
 *   - `OverlayPanel`  image fills the tile; solid scheme-colored panel over
 *                     the lower portion carries the title + pill CTA
 */
export interface FeatureCardProps extends CmsProps {
  title?: TextSource;
  description?: RichTextSource;
  /**
   * Named vector icon (`icon-name@1`) — the icon authoring surface.
   * `none` / empty / unknown fall back to the card's `image`.
   */
  iconName?: string;
  image?: ImageSource;
  link?: LinkSource;
  /**
   * Optional explicit ordinal badge for `NumberedTile`. When empty the
   * variant derives the number from `index` (the parent-grid iteration
   * position), matching the recipe's `Number` param hint.
   */
  number?: string;
  /**
   * Parent-iteration index injected by `FeaturesListGrid` /
   * `FeaturesCarousel`. Only consumed by `NumberedTile`.
   */
  index?: number;

  // Chrome axes — pass-through to the shared ItemCard shell. Each is
  // optional; per-variant defaults apply when unset.
  elevation?: ItemCardProps["elevation"];
  padding?: ItemCardProps["padding"];
  style?: ItemCardProps["style"];
  cardColorScheme?: ItemCardProps["colorScheme"];
  colorBand?: ItemCardColorBand;
  mediaBleed?: ItemCardMediaBleed;
  /**
   * Trailing glyph after the title (`title-link-icon@1`). The shared
   * `ItemCard` shell composes it; every variant here routes its title
   * through that shell, so each one honours it.
   */
  titleLinkIcon?: ItemCardTitleLinkIcon;
  /**
   * Media aspect ratio (`media-aspect@1`) on the image-led variants —
   * `MediaBanded` / `MediaStacked` default to `16x9` (aspect-video)
   * and honor any concrete value here. Icon / text variants ignore it.
   * Accepts the raw Sitecore enum string.
   */
  mediaAspect?: CardMediaAspect | string;
  /**
   * How the cover image fills its box (`media-fit@1`). `cover`
   * (default) crops to fill — right for photography. `contain` fits the
   * whole image in without cropping; bind it for logos, brand marks,
   * badges and seals, whose edges carry meaning. Accepts the raw
   * Sitecore enum string.
   */
  mediaFit?: string;
  /**
   * `media-shape@1` — how the media box is framed, orthogonal to
   * aspect. Composed after the aspect class so `circle`'s own
   * `aspect-square` wins via tailwind-merge. Only the image-led
   * variants have a media box to shape.
   */
  mediaShape?: MediaShape | string;
  /**
   * Where the CTA sits (`cta-placement@1`): `footer` (default — the
   * card's actions row) or `inline` (flows at the end of the copy).
   * `Default` / `MediaBanded` / `MediaStacked` honor it; `Horizontal`
   * is already inline by design and `IconTile`'s pill button stays in
   * the actions row.
   */
  ctaPlacement?: CardCtaPlacement | string;
  /**
   * Corner shape (`cta-shape@1`) of the button-style CTA — `pill` /
   * `rounded` / `square`. Only `IconTile` (the button-CTA variant)
   * honors it; the arrow-link variants render editorial text links, so
   * a button radius is inapplicable there. Unset keeps the theme's
   * `--button-radius` default. Accepts the raw Sitecore enum string.
   */
  ctaShape?: CardCtaShape | string;
  /**
   * Append a trailing right-arrow adornment after the CTA label
   * (`CtaIconTrailing`). Honored by every variant's button CTA — the
   * arrow rides the CTA button's `showArrow`/`after` slot so authored
   * link text is preserved. Accepts a Sitecore string-boolean.
   */
  ctaIconTrailing?: boolean | string;
  /**
   * CTA fill (`CtaVariant`, the shared `button-variant@1` axis). Unset
   * keeps each variant's editorial default; an explicit button fill
   * (default = filled, outline, ghost) promotes the editorial arrow-link
   * variants to a real Button so a source's solid/outline pill CTA
   * renders as such, and overrides the hardcoded `outline` on
   * IconTile/OverlayPanel. `link` keeps the editorial treatment.
   */
  ctaVariant?: string;
}

/**
 * Resolve the CTA fill for the two BUTTON variants (IconTile / OverlayPanel),
 * whose CTA is always a Button — unset `CtaVariant` keeps their `outline`
 * default. `showArrow` folds the explicit `CtaIconTrailing` with any arrow
 * implied by the fill (the `link` editorial treatment).
 */
function resolveButtonCta(
  ctaVariant: string | undefined,
  ctaIconTrailing: boolean | string | undefined,
) {
  return {
    variant: parseButtonVariant(ctaVariant, "outline"),
    showArrow: parseBoolParam(ctaIconTrailing as SitecoreBoolInput, false),
  };
}

/**
 * For the editorial arrow-link variants (Default / MediaBanded /
 * MediaStacked / Horizontal): when the author/composer set an explicit
 * BUTTON fill (default / outline / ghost) the CTA renders as a real Button
 * so a source's solid/outline pill is honored. Returns `null` for an unset
 * or `link` fill so the caller keeps its editorial arrow-link/link
 * treatment (byte-identical to before this param existed).
 */
function editorialButtonCta(
  ctaVariant: string | undefined,
  ctaIconTrailing: boolean | string | undefined,
  link: LinkSource | undefined,
  isEditing: boolean | undefined,
  className?: string,
) {
  const raw =
    typeof ctaVariant === "string" ? ctaVariant.trim().toLowerCase() : "";
  if (!raw || raw === "link") return null;
  if (link == null && !isEditing) return null;
  return (
    <Button
      link={link}
      variant={parseButtonVariant(ctaVariant, "default")}
      showArrow={parseBoolParam(ctaIconTrailing as SitecoreBoolInput, false)}
      className={cn("self-start", className)}
    />
  );
}

/** Resolve the CTA placement for the variants that honor the axis. */
function resolveCtaPlacement(
  value: CardCtaPlacement | string | undefined,
): CardCtaPlacement {
  return (
    parseCardCtaPlacement(typeof value === "string" ? value : undefined) ??
    "footer"
  );
}

/** Concrete media aspect class for the image-led variants (default 16:9). */
/** `media-shape@1` → its composable class, or "" when unset/default. */
function mediaShapeClass(value: MediaShape | string | undefined): string {
  const shape = parseOptionalMediaShape(
    typeof value === "string" ? value : undefined,
  );
  return shape ? MEDIA_SHAPE_CLASSES[shape] : "";
}

function mediaAspectClass(value: CardMediaAspect | string | undefined): string {
  const aspect = parseCardMediaAspect(
    typeof value === "string" ? value : undefined,
    "16x9",
  );
  return MEDIA_ASPECT_CLASSES[aspect];
}

function formatFeatureIndex(index: number): string {
  return (index + 1).toString().padStart(2, "0");
}

function resolveNumberLabel(
  number: string | undefined,
  index: number | undefined,
): string {
  const trimmed = number?.trim();
  if (trimmed) return trimmed;
  return formatFeatureIndex(index ?? 0);
}

/** Default — bare title + body + arrow CTA, no card chrome. */
export function Default({
  id,
  styles,
  isEditing,
  title,
  description,
  link,
  elevation,
  padding,
  style,
  cardColorScheme,
  colorBand,
  titleLinkIcon,
  mediaBleed,
  ctaPlacement,
  ctaVariant,
  ctaIconTrailing,
}: FeatureCardProps) {
  const hasLink = link != null || isEditing;
  const placement = resolveCtaPlacement(ctaPlacement);
  const ctaNode =
    editorialButtonCta(ctaVariant, ctaIconTrailing, link, isEditing) ??
    (hasLink ? (
      <ArrowLink
        value={link}
        isEditing={isEditing}
        placeholder="Link"
        hideBorder
        className="text-accent"
      />
    ) : undefined);
  return (
    <ItemCard
      id={id}
      style={style ?? "bare"}
      elevation={elevation ?? "none"}
      padding={padding ?? "md"}
      colorScheme={cardColorScheme}
      colorBand={colorBand}
      mediaBleed={mediaBleed}
      className={cn("gap-0", styles?.trimEnd())}
      titleLinkIcon={titleLinkIcon}
      title={<Text value={title} placeholder="Title" isEditing={isEditing} />}
      titleClassName="wrap-break-word mb-5 font-bold text-2xl text-foreground"
      content={
        <>
          <RichText
            value={description}
            placeholder="Description"
            isEditing={isEditing}
          />
          {placement === "inline" && ctaNode ? (
            <span className="mt-3 block">{ctaNode}</span>
          ) : null}
        </>
      }
      contentClassName="wrap-break-word mb-3.5 flex-auto text-foreground leading-7"
      actions={placement === "footer" ? ctaNode : undefined}
    />
  );
}

/** NumberedTile — large ordinal badge + title + body, hover-tint card. */
export function NumberedTile({
  id,
  styles,
  isEditing,
  title,
  description,
  number,
  index,
  elevation,
  padding,
  style,
  cardColorScheme,
  colorBand,
  titleLinkIcon,
}: FeatureCardProps) {
  const label = resolveNumberLabel(number, index);
  return (
    <ItemCard
      id={id}
      style={style}
      elevation={elevation ?? "none"}
      padding={padding ?? "md"}
      colorScheme={cardColorScheme}
      colorBand={colorBand}
      className={cn(
        "group cursor-pointer text-background hover:bg-accent",
        styles?.trimEnd(),
      )}
      // The ordinal isn't a real "media" element — it's a decorative
      // pre-header label. Hand it to the media slot so it renders
      // above the title without growing a dedicated `label` slot on
      // ItemCard for one variant.
      media={
        <TypographyDisplay className="mb-2 text-7xl text-muted-foreground leading-24 group-hover:text-background">
          {label}
        </TypographyDisplay>
      }
      titleLinkIcon={titleLinkIcon}
      title={<Text value={title} placeholder="Title" isEditing={isEditing} />}
      titleClassName="wrap-break-word mb-4 block font-bold text-2xl text-accent leading-8 group-hover:text-background"
      content={
        <RichText
          value={description}
          placeholder="Description"
          isEditing={isEditing}
        />
      }
      contentClassName="wrap-break-word block text-muted-foreground leading-7 group-hover:text-background"
    />
  );
}

/**
 * MediaBanded — image full-bleed to the top edges of the card, title
 * overlaid as a band at the bottom of the image, body + arrow CTA
 * below.
 */
export function MediaBanded({
  id,
  styles,
  isEditing,
  title,
  description,
  image,
  link,
  elevation,
  padding,
  style,
  cardColorScheme,
  colorBand,
  titleLinkIcon,
  mediaBleed,
  mediaAspect,
  mediaFit,
  mediaShape,
  ctaPlacement,
  ctaVariant,
  ctaIconTrailing,
}: FeatureCardProps) {
  const imageSrc = getImageSrc(image);
  const hasImage = imageSrc != null || isEditing;
  const hasLink = link != null || isEditing;
  const placement = resolveCtaPlacement(ctaPlacement);
  const ctaNode =
    editorialButtonCta(ctaVariant, ctaIconTrailing, link, isEditing) ??
    (hasLink ? (
      <ArrowLink
        value={link}
        placeholder="Link"
        isEditing={isEditing}
        className="text-accent"
      />
    ) : undefined);
  return (
    <ItemCard
      id={id}
      style={style ?? "filled"}
      elevation={elevation}
      padding={padding}
      colorScheme={cardColorScheme}
      colorBand={colorBand}
      className={styles?.trimEnd()}
      mediaBleed={mediaBleed ?? (hasImage ? "fullbleed" : "none")}
      mediaClassName={
        hasImage
          ? cn(
              mediaAspectClass(mediaAspect),
              "w-full overflow-hidden",
              mediaShapeClass(mediaShape),
            )
          : undefined
      }
      media={
        hasImage ? (
          <NextImage
            value={image}
            placeholder="Image"
            isEditing={isEditing}
            className={mediaFitClass(mediaFit)}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : undefined
      }
      // The "banded title" treatment is exactly what the media-caption
      // slot does — an opaque band at the bottom of the media area
      // styled with the brand tone. No need for a separate header.
      mediaCaption={
        title
          ? withTitleLinkIcon(<Text value={title} tag="span" />, titleLinkIcon)
          : undefined
      }
      content={
        <>
          <RichText
            value={description}
            placeholder="Description"
            isEditing={isEditing}
          />
          {placement === "inline" && ctaNode ? (
            <span className="mt-3 block">{ctaNode}</span>
          ) : null}
        </>
      }
      actions={placement === "footer" ? ctaNode : undefined}
    />
  );
}

/**
 * MediaStacked — image on top, large bold title + muted body + simple
 * underline link below as bare text. No card chrome.
 */
export function MediaStacked({
  id,
  styles,
  isEditing,
  title,
  description,
  image,
  link,
  elevation,
  padding,
  style,
  cardColorScheme,
  colorBand,
  titleLinkIcon,
  mediaBleed,
  mediaAspect,
  mediaFit,
  mediaShape,
  ctaPlacement,
  ctaVariant,
  ctaIconTrailing,
}: FeatureCardProps) {
  const imageSrc = getImageSrc(image);
  const hasImage = imageSrc != null || isEditing;
  const placement = resolveCtaPlacement(ctaPlacement);
  const ctaNode =
    editorialButtonCta(ctaVariant, ctaIconTrailing, link, isEditing) ??
    (link || isEditing ? (
      <Link
        value={link}
        placeholder="Link"
        isEditing={isEditing}
        className="font-medium text-sm underline-offset-4 hover:underline"
      />
    ) : undefined);
  return (
    <ItemCard
      id={id}
      style={style ?? "bare"}
      elevation={elevation ?? "none"}
      padding={padding ?? "md"}
      colorScheme={cardColorScheme}
      colorBand={colorBand}
      mediaBleed={mediaBleed}
      className={cn("gap-4", styles?.trimEnd())}
      mediaClassName={
        hasImage
          ? cn(
              "relative w-full overflow-hidden rounded-(--card-radius,var(--radius-lg)) bg-muted",
              mediaAspectClass(mediaAspect),
              mediaShapeClass(mediaShape),
            )
          : undefined
      }
      media={
        hasImage ? (
          <NextImage
            value={image}
            placeholder="Image"
            isEditing={isEditing}
            className={mediaFitClass(mediaFit)}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : undefined
      }
      titleLinkIcon={titleLinkIcon}
      title={<Text value={title} placeholder="Title" isEditing={isEditing} />}
      titleClassName="wrap-break-word font-bold font-heading text-2xl tracking-tight md:text-3xl"
      content={
        <>
          <RichText
            value={description}
            placeholder="Description"
            isEditing={isEditing}
          />
          {placement === "inline" && ctaNode ? (
            <span className="mt-3 block">{ctaNode}</span>
          ) : null}
        </>
      }
      contentClassName="wrap-break-word text-pretty text-muted-foreground leading-relaxed"
      actions={placement === "footer" ? ctaNode : undefined}
    />
  );
}

/**
 * Horizontal — media-left row: image at the start (fixed column on
 * sm+), title + body + arrow CTA filling the end. The list/row
 * counterpart to `MediaStacked` — use for editorial feature rows,
 * "more for customers" listings, and anywhere the source shows
 * side-by-side image + copy rather than stacked tiles. Falls back to
 * a text-only row when no image is authored.
 */
export function Horizontal({
  id,
  styles,
  isEditing,
  title,
  description,
  image,
  link,
  elevation,
  padding,
  style,
  cardColorScheme,
  colorBand,
  titleLinkIcon,
  mediaBleed,
  mediaFit,
  ctaVariant,
  ctaIconTrailing,
}: FeatureCardProps) {
  const imageSource = image;
  const imageSrc = getImageSrc(imageSource);
  const hasImage = imageSrc != null || isEditing;
  const hasLink = link != null || isEditing;
  const buttonCta = editorialButtonCta(
    ctaVariant,
    ctaIconTrailing,
    link,
    isEditing,
  );
  return (
    <ItemCard
      id={id}
      style={style ?? "outline"}
      elevation={elevation ?? "sm"}
      padding={padding ?? "sm"}
      colorScheme={cardColorScheme}
      colorBand={colorBand}
      mediaBleed={mediaBleed}
      className={cn("overflow-hidden p-0", styles?.trimEnd())}
    >
      <div
        className={cn(
          "grid grid-cols-1",
          hasImage && "sm:grid-cols-[220px_1fr]",
        )}
      >
        {hasImage ? (
          <div className="relative min-h-44 w-full overflow-hidden bg-muted">
            <NextImage
              value={imageSource}
              placeholder="Image"
              isEditing={isEditing}
              className={mediaFitClass(mediaFit)}
              fill
              sizes="(max-width: 640px) 100vw, 220px"
            />
          </div>
        ) : null}
        <div className="flex flex-col justify-center gap-3 p-5 sm:p-6">
          <span className="wrap-break-word font-bold font-heading text-xl tracking-tight">
            {withTitleLinkIcon(
              <Text value={title} placeholder="Title" isEditing={isEditing} />,
              titleLinkIcon,
            )}
          </span>
          <div className="wrap-break-word text-muted-foreground text-sm leading-relaxed">
            <RichText
              value={description}
              placeholder="Description"
              isEditing={isEditing}
            />
          </div>
          {buttonCta ??
            (hasLink ? (
              <ArrowLink
                value={link}
                isEditing={isEditing}
                placeholder="Link"
                hideBorder
                className="text-accent"
              />
            ) : null)}
        </div>
      </div>
    </ItemCard>
  );
}

/**
 * IconTile — small icon at top-start + title + body + outline-pill CTA.
 * Filled card body suits product/service explorers.
 */
export function IconTile({
  id,
  styles,
  isEditing,
  title,
  description,
  iconName,
  image,
  link,
  elevation,
  padding,
  style,
  cardColorScheme,
  colorBand,
  titleLinkIcon,
  mediaBleed,
  ctaShape,
  ctaIconTrailing,
  ctaVariant,
}: FeatureCardProps) {
  const cta = resolveButtonCta(ctaVariant, ctaIconTrailing);
  // Named glyph wins when it resolves (`none` is the icon-name@1
  // clearing sentinel; unknown/empty names degrade to the card Image).
  const namedGlyph = iconName?.trim().toLowerCase();
  const hasNamedIcon = Boolean(
    namedGlyph && namedGlyph !== "none" && iconByName(namedGlyph),
  );
  const iconSource = image;
  const iconSrc = getImageSrc(iconSource);
  const hasIcon = hasNamedIcon || iconSrc != null || isEditing;
  return (
    <ItemCard
      id={id}
      style={style ?? "filled"}
      elevation={elevation}
      padding={padding}
      colorScheme={cardColorScheme}
      colorBand={colorBand}
      className={styles?.trimEnd()}
      mediaBleed={mediaBleed ?? (hasIcon ? "icon" : "none")}
      media={
        hasNamedIcon ? (
          // Named vector icon: crisp at any size, recolors with the
          // theme (`text-primary` per the color-role contract). Sized to
          // match the 56px image slot.
          <NamedIcon
            name={namedGlyph as string}
            size={56}
            className="size-14 shrink-0 text-primary"
          />
        ) : hasIcon ? (
          // Naturally-sized (not `fill`) so the icon flows inside the
          // icon-bleed wrapper's horizontal padding and lines up with
          // the title/body's start edge. A `fill` image is absolutely
          // positioned and would ignore that padding, sitting flush at
          // the card's left edge instead.
          <NextImage
            value={iconSource}
            placeholder="Icon"
            isEditing={isEditing}
            className="h-14 w-14 object-contain"
            width={56}
            height={56}
          />
        ) : undefined
      }
      titleLinkIcon={titleLinkIcon}
      title={<Text value={title} placeholder="Title" isEditing={isEditing} />}
      titleClassName="font-semibold text-lg"
      content={
        <RichText
          value={description}
          placeholder="Description"
          isEditing={isEditing}
        />
      }
      contentClassName="wrap-break-word text-muted-foreground text-sm leading-relaxed"
      // CtaShape overrides `--button-radius` on the button; CtaIconTrailing
      // rides the CtaButton `showArrow` seam, which drops the arrow into
      // the Link's `after` slot (children-drop-safe — authored link text
      // survives). CtaVariant now feeds the fill (unset → the classic
      // outline pill); the arrow/shape defaults are unchanged.
      actions={
        <Button
          link={link}
          variant={cta.variant}
          showArrow={cta.showArrow}
          className={ctaShapeClassName(ctaShape)}
        />
      }
    />
  );
}

/**
 * OverlayPanel — the colored-overlay image tile (ResMed / Scholastic /
 * Tourism Australia pattern): the image fills the whole tile and a
 * solid scheme-colored panel hugs the lower portion carrying the title
 * (+ optional short description) and a pill CTA button.
 *
 * The panel scheme rides the shared `ColorBand` chrome axis — in this
 * variant the band IS the overlay panel (positioned over the media
 * bottom instead of the card top); `none` falls back to `primary` so
 * the tile never renders an unreadable transparent panel.
 */
export function OverlayPanel({
  id,
  styles,
  isEditing,
  title,
  description,
  image,
  link,
  elevation,
  padding,
  style,
  cardColorScheme,
  colorBand,
  titleLinkIcon,
  mediaAspect,
  mediaFit,
  mediaShape,
  ctaShape,
  ctaIconTrailing,
  ctaVariant,
}: FeatureCardProps) {
  const panelScheme: Exclude<ItemCardColorBand, "none"> =
    colorBand && colorBand !== "none" ? colorBand : "primary";
  const cta = resolveButtonCta(ctaVariant, ctaIconTrailing);
  // The transparent pill over the colored panel is the signature look —
  // keep it for the default (outline) fill; a fill the composer sets
  // (filled/ghost/link) drops the transparent override so it renders.
  const isOutlinePill = cta.variant === "outline";
  const hasDescription = description != null || isEditing;
  const hasLink = link != null || isEditing;
  return (
    <ItemCard
      id={id}
      style={style ?? "flat"}
      elevation={elevation ?? "sm"}
      padding={padding ?? "sm"}
      colorScheme={cardColorScheme}
      className={cn("overflow-hidden p-0", styles?.trimEnd())}
    >
      {/* Taller-than-wide frame — the pattern reads as a poster tile.
          The media-aspect axis still wins when the author sets it. */}
      <div
        className={cn(
          "relative w-full overflow-hidden",
          mediaAspectClass(mediaAspect ?? "3x4"),
        )}
      >
        <NextImage
          value={image}
          placeholder="Image"
          isEditing={isEditing}
          className={cn(
            mediaFitClass(mediaFit),
            "transition-transform duration-300 group-hover:scale-105",
          )}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 flex flex-col items-start gap-3 p-5",
            COLOR_BAND_CLASSES[panelScheme],
          )}
        >
          <span className="wrap-break-word font-bold font-heading text-xl leading-tight tracking-tight">
            {withTitleLinkIcon(
              <Text value={title} placeholder="Title" isEditing={isEditing} />,
              titleLinkIcon,
            )}
          </span>
          {hasDescription ? (
            <div className="wrap-break-word text-sm opacity-90 [&_p]:mb-0">
              <RichText
                value={description}
                placeholder="Description"
                isEditing={isEditing}
              />
            </div>
          ) : null}
          {hasLink ? (
            <Button
              link={link}
              variant={cta.variant}
              colorScheme={panelScheme}
              size="sm"
              showArrow={cta.showArrow}
              // Pill by default — the signature shape of this pattern;
              // an explicit CtaShape still wins.
              className={cn(
                isOutlinePill &&
                  "border-current bg-transparent text-current hover:bg-current/10",
                ctaShapeClassName(ctaShape) ?? "rounded-full",
              )}
            />
          ) : null}
        </div>
      </div>
    </ItemCard>
  );
}

export default Default;

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
