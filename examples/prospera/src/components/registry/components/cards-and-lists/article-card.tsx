"use client";

import type { SearchArticle } from "@/components/registry/blocks";
import { CardCta, CardNavigate } from "@/components/registry/blocks/card-navigate";
import { Eyebrow } from "@/components/registry/blocks/eyebrow";
import type {
  ItemCardColorBand,
  ItemCardMediaBleed,
  ItemCardProps,
  ItemCardTitleLinkIcon,
} from "@/components/registry/blocks/item-card";
import {
  ItemCard,
  withTitleLinkIcon,
} from "@/components/registry/blocks/item-card";
import { ThemeIcon } from "@/components/registry/primitives/core/theme-icon";
import {
  TypographyH4,
  TypographyMuted,
  TypographySmall,
} from "@/components/registry/primitives/core/typography";
import {
  NextImage as Image,
  type ImageSource,
} from "@/components/registry/primitives/editables/image";
import { type LinkSource } from "@/components/registry/primitives/editables/link";
import {
  RichText,
  type RichTextSource,
} from "@/components/registry/primitives/editables/richtext";
import {
  getImageSrc,
  getSourceText,
  getSourceTextOrEmpty,
} from "@/components/registry/primitives/editables/source-normalizers";
import {
  Text,
  type TextSource,
} from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import { mediaFitClass } from "@/lib/registry/media-fit";
import type { CmsProps } from "@/lib/registry/sitecore";
import { formatSitecoreDate } from "@/lib/registry/sitecore-datetime";
import { type CardCtaPlacement, parseCardCtaPlacement } from "./_cta-placement";
import {
  type CardMediaAspect,
  MEDIA_ASPECT_CLASSES,
  MEDIA_SHAPE_CLASSES,
  type MediaShape,
  parseCardMediaAspect,
  parseOptionalCardMediaAspect,
  parseOptionalMediaShape,
} from "./_media-aspect";
import { DEFAULT_ARTICLE_CARD_IMG_URL } from "./article-card-config";

/**
 * Article card — leaf rendering for the articles family. Fields and
 * params map 1:1 to the `article-card@1` recipe via `withSitecore`'s
 * default convention map; extends `CmsProps` so `id` / `styles` /
 * `isEditing` are picked up automatically. No sibling `.sitecore.ts`
 * adapter — pure default convention.
 *
 * Vertical variants (`Standard`, `Featured`, `ImageLed`) compose the
 * shared `ItemCard` shell from `blocks/item-card` in layout mode —
 * the shell owns media bleed, color band, header / content / actions
 * topology, and per-slot className overrides. `CompactRow` is
 * horizontal and uses `ItemCard` in wrapper mode (composes the body
 * by hand) until `ItemCard` learns a horizontal orientation.
 *
 * Five variants (per recipe), each with a distinct DOM topology (see
 * [[feedback-variant-vs-parameter]]):
 *   - `Standard`    image on top + meta + title + excerpt + arrow CTA
 *   - `ImageLed`    image-forward, title only
 *   - `CompactRow`  image start + content end (horizontal layout)
 *   - `Featured`    Standard with a prominent, larger headline
 *   - `Overlay`     image-dominant photo card — absolute-fill media,
 *                   gradient scrim, badge eyebrow + on-image title
 */
export interface ArticleCardProps extends CmsProps {
  title?: TextSource;
  excerpt?: RichTextSource;
  image?: ImageSource;
  link?: LinkSource;
  /** Publish date — surfaced in the meta line. */
  date?: TextSource;
  /** Eyebrow line above the title. */
  eyebrow?: TextSource;

  // Chrome axes — pass-through to the shared ItemCard shell. Each is
  // optional; per-variant defaults apply when unset.
  elevation?: ItemCardProps["elevation"];
  padding?: ItemCardProps["padding"];
  style?: ItemCardProps["style"];
  cardColorScheme?: ItemCardProps["colorScheme"];
  colorBand?: ItemCardColorBand;
  /**
   * Trailing glyph beside the card title (`title-link-icon@1`) —
   * signals the whole card is a link. Every variant renders a title,
   * so all five honour it.
   */
  titleLinkIcon?: ItemCardTitleLinkIcon;
  mediaBleed?: ItemCardMediaBleed;
  /**
   * Media aspect ratio (`media-aspect@1`). `Overlay` sizes its
   * absolute-fill media with it (default `4x5`); `Standard` /
   * `Featured` / `ImageLed` swap their fixed media height for the
   * aspect box when a concrete value is set (`auto`/unset keeps the
   * height-based default). `CompactRow` ignores it. Accepts the raw
   * Sitecore enum string.
   */
  mediaAspect?: CardMediaAspect | string;
  /**
   * How the image fills its media box (`media-fit@1`). `cover`
   * (default) crops to fill — right for photography. `contain` fits
   * the whole image in without cropping; bind for logos, brand marks,
   * badges, seals and product cut-outs, whose edges carry meaning.
   * Accepts the raw Sitecore enum string.
   */
  mediaFit?: string;
  /**
   * `media-shape@1` — how the media box is framed, orthogonal to
   * aspect. Composes onto the media wrapper after the aspect class, so
   * `circle`'s own `aspect-square` wins via tailwind-merge.
   */
  mediaShape?: MediaShape | string;
  /**
   * Where the arrow CTA sits (`cta-placement@1`): `inline` (default —
   * flows at the end of the copy block) or `footer` (pinned in the
   * card's actions row so CTAs align across unequal-height cards).
   * `Standard` / `Featured` only — `ImageLed`, `CompactRow`, and
   * `Overlay` render no CTA row.
   */
  ctaPlacement?: CardCtaPlacement | string;
}

function buildMeta(
  eyebrow: TextSource | undefined,
  date: TextSource | undefined,
): string {
  return [getSourceText(eyebrow), formatSitecoreDate(getSourceText(date))]
    .filter(Boolean)
    .join(" · ");
}

/**
 * Configurable knobs for the three vertical variants. Each variant
 * supplies its own sizing for media + headline; the rest of the
 * topology (meta line, excerpt, arrow CTA) is uniform.
 */
type VerticalSize = {
  mediaHeight: string;
  titleClassName: string;
  excerptClampClassName: string;
};

const VERTICAL_SIZES = {
  standard: {
    mediaHeight: "h-50",
    titleClassName:
      "wrap-break-word line-clamp-2 overflow-hidden font-bold text-lg",
    excerptClampClassName: "line-clamp-2",
  },
  featured: {
    mediaHeight: "h-64",
    titleClassName:
      "wrap-break-word line-clamp-2 overflow-hidden font-bold text-2xl md:text-3xl",
    excerptClampClassName: "line-clamp-3",
  },
} satisfies Record<string, VerticalSize>;

/**
 * Build the editable JSX nodes that get piped into ItemCard's slots.
 * Centralises the placeholder/isEditing/source-normalizer wiring so
 * Standard + Featured + ImageLed don't fork it.
 *
 * Mirrors the product-card / location-card pattern: ALL editorial
 * content (eyebrow + title + excerpt + decorative arrow) lives in the
 * single `content` slot rather than split across CardHeader (title +
 * description) + CardContent. That keeps the visual order — eyebrow
 * ABOVE title, body BELOW title — consistent with editorial-card
 * convention and avoids the Card-level gap between header/content
 * tearing the meta line away from the body.
 */
function buildVerticalSlots({
  title,
  excerpt,
  image,
  eyebrow,
  date,
  link,
  isEditing,
  size,
  imageHeight,
  mediaAspect,
  mediaFit,
  mediaShape,
  ctaPlacement,
  titleLinkIcon,
}: {
  title?: TextSource;
  excerpt?: RichTextSource;
  image?: ImageSource;
  eyebrow?: TextSource;
  date?: TextSource;
  link?: LinkSource;
  isEditing?: boolean;
  size: VerticalSize;
  imageHeight: string;
  mediaAspect?: CardMediaAspect | string;
  /**
   * How the image fills its media box (`media-fit@1`). `cover`
   * (default) crops to fill — right for photography. `contain` fits
   * the whole image in without cropping; bind for logos, brand marks,
   * badges, seals and product cut-outs, whose edges carry meaning.
   * Accepts the raw Sitecore enum string.
   */
  mediaFit?: string;
  /**
   * `media-shape@1` — how the media box is framed, orthogonal to
   * aspect. Composes onto the media wrapper after the aspect class, so
   * `circle`'s own `aspect-square` wins via tailwind-merge.
   */
  mediaShape?: MediaShape | string;
  ctaPlacement?: CardCtaPlacement | string;
  titleLinkIcon?: ItemCardTitleLinkIcon;
}) {
  const titleText = getSourceTextOrEmpty(title);
  const meta = buildMeta(eyebrow, date);
  const hasExcerpt = excerpt != null || isEditing;
  const imageSrc = getImageSrc(image) || DEFAULT_ARTICLE_CARD_IMG_URL;
  // A concrete `media-aspect@1` value replaces the variant's fixed
  // media height with an aspect box; `auto`/unset keeps the height.
  const aspect = parseOptionalCardMediaAspect(
    typeof mediaAspect === "string" ? mediaAspect : undefined,
  );
  const shape = parseOptionalMediaShape(
    typeof mediaShape === "string" ? mediaShape : undefined,
  );
  const mediaWrapperClassName = cn(
    aspect ? MEDIA_ASPECT_CLASSES[aspect] : imageHeight,
    "w-full overflow-hidden rounded-t-(--card-radius,var(--radius-md)) bg-background-surface",
    // After the aspect class on purpose — `circle` carries its own
    // `aspect-square` and must win via tailwind-merge.
    shape && MEDIA_SHAPE_CLASSES[shape],
  );
  const placement =
    parseCardCtaPlacement(
      typeof ctaPlacement === "string" ? ctaPlacement : undefined,
    ) ?? "inline";
  const ctaNode = (
    <TypographyMuted className="mt-3 flex text-sm">
      <TypographySmall className="end-0 inline-flex items-center gap-1 font-accent font-medium text-muted-foreground group-hover:text-accent">
        <CardCta link={link} fallback="View" isEditing={isEditing} />
        <ThemeIcon
          name="arrow-right"
          className="size-3.5 transition-transform rtl:rotate-180"
          aria-hidden
        />
      </TypographySmall>
    </TypographyMuted>
  );

  return {
    media: (
      <Image
        value={image ?? { value: { src: imageSrc, alt: titleText } }}
        placeholder="Image"
        isEditing={isEditing}
        className={cn(
          "h-full w-full object-center transition-transform duration-500 group-hover:scale-105",
          mediaFitClass(mediaFit),
        )}
        width={500}
        height={300}
        loading="lazy"
      />
    ),
    mediaClassName: mediaWrapperClassName,
    // CardContent gets `m-4` so the text content area is inset 16px
    // from the Card's padding box — restores the original `<CardContent
    // className="m-4 ...">` behaviour that gave Article cards their
    // 28px text inset (Card's 12px sm-padding + CardContent's 16px
    // margin). Without this, text sits right at the Card's padding
    // edge.
    contentClassName: "relative m-4 flex flex-col justify-between p-0",
    // All editorial content (eyebrow + title + excerpt + arrow CTA)
    // lives in one content slot — matches product-card / location-card
    // which pack their content into a single CardContent rather than
    // splitting across Header/Content. Per-item `mt-X` margins handle
    // internal vertical rhythm; the surrounding CardContent's `m-4`
    // handles the inset from card edges.
    content: (
      <>
        {meta && (
          <TypographySmall className="mt-4 font-light text-muted-foreground">
            {meta}
          </TypographySmall>
        )}
        <TypographyH4 className={size.titleClassName}>
          {withTitleLinkIcon(
            <Text value={title} placeholder="Title" isEditing={isEditing} />,
            titleLinkIcon,
          )}
        </TypographyH4>
        {hasExcerpt && (
          <TypographyMuted
            className={cn(
              "mt-2",
              size.excerptClampClassName,
              "text-foreground",
              "text-sm leading-5 md:text-base md:leading-6",
            )}
          >
            <RichText
              value={excerpt}
              placeholder="Excerpt"
              isEditing={isEditing}
            />
          </TypographyMuted>
        )}
        {placement === "inline" ? ctaNode : null}
      </>
    ),
    // `footer` pins the CTA in ItemCard's actions row — rendered after
    // the content inside the same CardContent wrapper, so it inherits
    // the card's 16px inset and aligns across unequal-height cards.
    actions: placement === "footer" ? ctaNode : undefined,
  };
}

/** Standard variant — vertical card (image + meta + title + excerpt + arrow CTA). */
export function Standard({
  id,
  styles,
  isEditing,
  title,
  excerpt,
  image,
  link,
  date,
  eyebrow,
  elevation,
  padding,
  style,
  cardColorScheme,
  colorBand,
  mediaBleed,
  mediaAspect,
  mediaFit,
  mediaShape,
  ctaPlacement,
  titleLinkIcon,
}: ArticleCardProps) {
  const titleText = getSourceTextOrEmpty(title);
  const slots = buildVerticalSlots({
    title,
    excerpt,
    image,
    eyebrow,
    date,
    link,
    isEditing,
    size: VERTICAL_SIZES.standard,
    imageHeight: VERTICAL_SIZES.standard.mediaHeight,
    mediaAspect,
    mediaFit,
    mediaShape,
    ctaPlacement,
    titleLinkIcon,
  });
  return (
    <CardNavigate
      link={link}
      isEditing={isEditing}
      className="focus:outline-accent"
      aria-label={titleText}
    >
      <ItemCard
        id={id}
        className={cn(
          "rounded-(--card-radius,var(--radius-md))",
          styles?.trimEnd(),
        )}
        elevation={elevation ?? "sm"}
        padding={padding ?? "sm"}
        style={style ?? "outline"}
        colorScheme={cardColorScheme}
        colorBand={colorBand}
        mediaBleed={mediaBleed}
        {...slots}
      />
    </CardNavigate>
  );
}

/** Featured variant — Standard with a larger headline. */
export function Featured({
  id,
  styles,
  isEditing,
  title,
  excerpt,
  image,
  link,
  date,
  eyebrow,
  elevation,
  padding,
  style,
  cardColorScheme,
  colorBand,
  mediaBleed,
  mediaAspect,
  mediaFit,
  mediaShape,
  ctaPlacement,
  titleLinkIcon,
}: ArticleCardProps) {
  const titleText = getSourceTextOrEmpty(title);
  const slots = buildVerticalSlots({
    title,
    excerpt,
    image,
    eyebrow,
    date,
    link,
    isEditing,
    size: VERTICAL_SIZES.featured,
    imageHeight: VERTICAL_SIZES.featured.mediaHeight,
    mediaAspect,
    mediaFit,
    mediaShape,
    ctaPlacement,
    titleLinkIcon,
  });
  return (
    <CardNavigate
      link={link}
      isEditing={isEditing}
      className="focus:outline-accent"
      aria-label={titleText}
    >
      <ItemCard
        id={id}
        className={cn(
          "rounded-(--card-radius,var(--radius-md))",
          styles?.trimEnd(),
        )}
        elevation={elevation ?? "sm"}
        padding={padding ?? "sm"}
        style={style ?? "outline"}
        colorScheme={cardColorScheme}
        colorBand={colorBand}
        mediaBleed={mediaBleed}
        {...slots}
      />
    </CardNavigate>
  );
}

/** ImageLed variant — image-forward, title only. */
export function ImageLed({
  id,
  styles,
  isEditing,
  title,
  image,
  link,
  elevation,
  padding,
  style,
  cardColorScheme,
  colorBand,
  mediaBleed,
  mediaAspect,
  mediaFit,
  mediaShape,
  titleLinkIcon,
}: ArticleCardProps) {
  const titleText = getSourceTextOrEmpty(title);
  const imageSrc = getImageSrc(image) || DEFAULT_ARTICLE_CARD_IMG_URL;
  const aspect = parseOptionalCardMediaAspect(
    typeof mediaAspect === "string" ? mediaAspect : undefined,
  );
  const shape = parseOptionalMediaShape(
    typeof mediaShape === "string" ? mediaShape : undefined,
  );
  return (
    <CardNavigate
      link={link}
      isEditing={isEditing}
      className="focus:outline-accent"
      aria-label={titleText}
    >
      <ItemCard
        id={id}
        className={cn(
          "rounded-(--card-radius,var(--radius-md))",
          styles?.trimEnd(),
        )}
        elevation={elevation ?? "sm"}
        padding={padding ?? "sm"}
        style={style ?? "outline"}
        colorScheme={cardColorScheme}
        colorBand={colorBand}
        mediaBleed={mediaBleed}
        mediaClassName={cn(
          aspect ? MEDIA_ASPECT_CLASSES[aspect] : "h-50",
          "w-full overflow-hidden rounded-t-(--card-radius,var(--radius-md)) bg-background-surface",
          shape && MEDIA_SHAPE_CLASSES[shape],
        )}
        media={
          <Image
            value={image ?? { value: { src: imageSrc, alt: titleText } }}
            placeholder="Image"
            isEditing={isEditing}
            className={cn(
              "h-full w-full object-center transition-transform duration-500 group-hover:scale-105",
              mediaFitClass(mediaFit),
            )}
            width={500}
            height={300}
            loading="lazy"
          />
        }
        title={<Text value={title} placeholder="Title" isEditing={isEditing} />}
        titleLinkIcon={titleLinkIcon}
        titleClassName="wrap-break-word line-clamp-3 text-lg md:text-xl"
      />
    </CardNavigate>
  );
}

/**
 * CompactRow variant — horizontal card (image start, content end).
 *
 * ItemCard's layout mode is vertical-only today; the horizontal
 * orientation is a Phase 4 follow-up that benefits every family with
 * a horizontal variant (Person, Destination, Product, Location).
 * Until then this variant composes the body by hand inside ItemCard's
 * wrapper mode.
 */
export function CompactRow({
  id,
  styles,
  isEditing,
  title,
  excerpt,
  image,
  link,
  date,
  eyebrow,
  elevation,
  padding,
  style,
  cardColorScheme,
  mediaFit,
}: ArticleCardProps) {
  const titleText = getSourceTextOrEmpty(title);
  const meta = buildMeta(eyebrow, date);
  const imageSrc = getImageSrc(image);
  const padClass =
    "my-4 flex max-h-52 w-full flex-row flex-nowrap rounded-(--card-radius,var(--radius-md)) bg-background p-6";
  return (
    <CardNavigate
      link={link}
      isEditing={isEditing}
      className="focus:outline-accent"
      aria-label={titleText}
    >
      <ItemCard
        id={id}
        className={cn(padClass, styles?.trimEnd())}
        elevation={elevation ?? "sm"}
        padding={padding ?? "sm"}
        style={style ?? "outline"}
        colorScheme={cardColorScheme}
      >
        {(imageSrc || isEditing) && (
          <div className="w-1/4 flex-none overflow-hidden rounded bg-background-surface">
            <Image
              value={image}
              placeholder="Image"
              isEditing={isEditing}
              className={cn(
                "h-full w-full rounded object-center",
                mediaFitClass(mediaFit),
              )}
              width={500}
              height={300}
            />
          </div>
        )}
        <div className="grow flex-col ps-4">
          <span aria-hidden="true" className="absolute inset-0" />
          <h4 className="wrap-break-word mb-2 font-(--card-title-weight,600) text-foreground text-lg">
            <Text value={title} placeholder="Title" isEditing={isEditing} />
          </h4>
          {(excerpt || isEditing) && (
            <TypographyMuted
              className={cn(
                "mt-2",
                "line-clamp-2",
                "text-foreground",
                "text-sm leading-5 md:text-base md:leading-6",
              )}
            >
              <RichText
                value={excerpt}
                placeholder="Excerpt"
                isEditing={isEditing}
              />
            </TypographyMuted>
          )}
          {meta && (
            <TypographySmall className="mt-3 text-muted-foreground">
              {meta}
            </TypographySmall>
          )}
        </div>
      </ItemCard>
    </CardNavigate>
  );
}

/**
 * Overlay variant — image-dominant photo card for editorial / news
 * portals (the FIFA-style card). Media as an absolute fill behind a
 * bottom-up gradient scrim; content pinned bottom-start with the
 * eyebrow rendered as a badge (`eyebrow-style@1` badge semantics) and
 * an on-image title. Aspect comes from `mediaAspect`
 * (`media-aspect@1`, default `4x5`).
 */
export function Overlay({
  id,
  styles,
  isEditing,
  title,
  image,
  link,
  date,
  eyebrow,
  mediaAspect,
  mediaFit,
  mediaShape,
  titleLinkIcon,
}: ArticleCardProps) {
  const titleText = getSourceTextOrEmpty(title);
  const imageSrc = getImageSrc(image) || DEFAULT_ARTICLE_CARD_IMG_URL;
  const dateText = formatSitecoreDate(getSourceText(date));
  const aspect = parseCardMediaAspect(
    typeof mediaAspect === "string" ? mediaAspect : undefined,
    "4x5",
  );
  return (
    <CardNavigate
      link={link}
      isEditing={isEditing}
      className="focus:outline-accent"
      aria-label={titleText}
    >
      <article
        id={id}
        data-slot="article-card-overlay"
        className={cn(
          "group relative w-full overflow-hidden rounded-(--card-radius,var(--radius-md)) bg-background-surface",
          MEDIA_ASPECT_CLASSES[aspect],
          styles?.trimEnd(),
        )}
      >
        <Image
          value={image ?? { value: { src: imageSrc, alt: titleText } }}
          placeholder="Image"
          isEditing={isEditing}
          className={cn(
            "absolute inset-0 h-full w-full object-center transition-transform duration-500 group-hover:scale-105",
            mediaFitClass(mediaFit),
          )}
          width={800}
          height={1000}
          loading="lazy"
        />
        {/* Bottom-up scrim keeps the on-image copy legible on any photo. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-theme-black/80 via-theme-black/30 to-transparent"
        />
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-2 p-4 text-theme-white md:p-5">
          <Eyebrow
            value={eyebrow}
            style="badge"
            isEditing={isEditing}
            className="w-auto"
          />
          <TypographyH4 className="wrap-break-word line-clamp-3 font-bold text-current text-xl leading-snug md:text-2xl">
            {withTitleLinkIcon(
              <Text value={title} placeholder="Title" isEditing={isEditing} />,
              titleLinkIcon,
            )}
          </TypographyH4>
          {dateText && (
            <TypographySmall className="text-theme-white/70">
              {dateText}
            </TypographySmall>
          )}
        </div>
      </article>
    </CardNavigate>
  );
}

export const Default = Standard;
export default Standard;

/**
 * Convert a `SearchArticle` (the cross-block search-results shape) into
 * the flat article-card prop bag. Preview renderers + search adapters
 * call this to feed the leaf card without manually re-wrapping fields.
 */
export function adaptSearchArticle(
  a: SearchArticle,
): Pick<ArticleCardProps, "title" | "excerpt" | "image" | "link" | "eyebrow"> {
  const titleText = a.name || a.title || "Untitled";
  const imageUrl = a.image_url?.trim() ? a.image_url : undefined;
  return {
    title: { value: titleText },
    excerpt: a.description ? { value: a.description } : undefined,
    image: imageUrl ? { value: { src: imageUrl, alt: titleText } } : undefined,
    link: { value: { href: a.url || "#", text: "Read more" } },
    eyebrow: a.type ? { value: a.type } : undefined,
  };
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
