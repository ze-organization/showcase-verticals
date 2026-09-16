"use client";

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
  getSourceTextOrEmpty,
} from "@/components/registry/primitives/editables/source-normalizers";
import {
  Text,
  type TextSource,
} from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import type { CmsProps } from "@/lib/registry/sitecore";
import {
  type CardMediaAspect,
  MEDIA_ASPECT_CLASSES,
  MEDIA_SHAPE_CLASSES,
  type MediaShape,
  parseCardMediaAspect,
  parseOptionalMediaShape,
} from "./_media-aspect";

/** Default headshot placeholder. Sized for a portrait card (3:4). */
export const DEFAULT_PERSON_CARD_IMG_URL =
  "https://placehold.co/500x600?text=Headshot";

/**
 * Person card — leaf rendering for the persons family. Fields and
 * params map 1:1 to the `person-card@1` recipe via `withSitecore`'s
 * default convention map; extends `CmsProps` so `id` / `styles` /
 * `isEditing` are picked up automatically. No sibling `.sitecore.ts`
 * adapter — pure default convention.
 *
 * Vertical variants (`Standard`, `Featured`, `ImageLed`) compose the
 * shared `ItemCard` shell in layout mode. `CompactRow` is horizontal
 * and uses `ItemCard` in wrapper mode pending horizontal orientation
 * in the shell.
 *
 * Five variants (per recipe), each with a distinct DOM topology (see
 * [[feedback-variant-vs-parameter]]):
 *   - `Standard`    headshot on top + eyebrow + name + role + bio + CTA
 *   - `ImageLed`    headshot-forward, name + role only
 *   - `CompactRow`  headshot start + content end (horizontal layout)
 *   - `Featured`    Standard with a prominent, larger headline
 *   - `Overlay`     image-dominant photo card — absolute-fill headshot,
 *                   gradient scrim, badge eyebrow + on-image name/role
 */
export interface PersonCardProps extends CmsProps {
  fullName?: TextSource;
  role?: TextSource;
  bio?: RichTextSource;
  eyebrow?: TextSource;
  image?: ImageSource;
  email?: TextSource;
  phone?: TextSource;
  link?: LinkSource;

  // Chrome axes — pass-through to the shared ItemCard shell. Default to
  // the "outlined" look (elevation sm / style outline / padding sm).
  elevation?: ItemCardProps["elevation"];
  padding?: ItemCardProps["padding"];
  style?: ItemCardProps["style"];
  cardColorScheme?: ItemCardProps["colorScheme"];
  colorBand?: ItemCardColorBand;
  titleLinkIcon?: ItemCardTitleLinkIcon;
  mediaBleed?: ItemCardMediaBleed;
  /**
   * Media aspect ratio on the image-dominant `Overlay` variant
   * (`media-aspect@1`). Other variants pin their own aspect and
   * ignore this. Accepts the raw Sitecore enum string.
   */
  mediaAspect?: CardMediaAspect | string;
  /**
   * `media-shape@1` framing of the headshot. `circle` renders the
   * classic centered circular avatar treatment on the vertical
   * variants and a fully circular tile on `Overlay`. Accepts the raw
   * Sitecore enum string.
   */
  mediaShape?: MediaShape | string;
}

type VerticalSize = {
  titleClassName: string;
  bioClampClassName: string;
};

const VERTICAL_SIZES = {
  standard: {
    titleClassName:
      "wrap-break-word line-clamp-2 overflow-hidden font-bold text-lg",
    bioClampClassName: "line-clamp-3",
  },
  featured: {
    titleClassName:
      "wrap-break-word line-clamp-2 overflow-hidden font-bold text-2xl md:text-3xl",
    bioClampClassName: "line-clamp-4",
  },
} satisfies Record<string, VerticalSize>;

/**
 * Editable JSX nodes piped into ItemCard's slots. All editorial
 * content (eyebrow + name + role + bio + contact + CTA) lives in one
 * content slot to match the original CardContent topology; `m-4` on
 * the content wrapper inset's the text from the Card padding (matches
 * the original `<CardContent className="m-4 …">` behaviour).
 */
/**
 * Compose the vertical variants' headshot class with the optional
 * `media-shape@1` framing: `circle` swaps the full-width portrait for
 * the classic centered circular avatar; `rounded` keeps the portrait
 * but rounds every corner.
 */
function personMediaClassName(
  mediaShape: PersonCardProps["mediaShape"],
): string {
  const base =
    "aspect-[3/4] w-full overflow-hidden rounded-t-(--card-radius,var(--radius-md)) bg-background-surface";
  const shape = parseOptionalMediaShape(
    typeof mediaShape === "string" ? mediaShape : undefined,
  );
  if (!shape) return base;
  return cn(
    base,
    MEDIA_SHAPE_CLASSES[shape],
    shape === "circle" && "mx-auto mt-6 w-2/3",
  );
}

function buildVerticalSlots({
  fullName,
  role,
  bio,
  eyebrow,
  image,
  email,
  phone,
  link,
  isEditing,
  size,
  mediaShape,
  titleLinkIcon,
}: {
  fullName?: TextSource;
  role?: TextSource;
  bio?: RichTextSource;
  eyebrow?: TextSource;
  image?: ImageSource;
  email?: TextSource;
  phone?: TextSource;
  link?: LinkSource;
  isEditing?: boolean;
  size: VerticalSize;
  mediaShape?: PersonCardProps["mediaShape"];
  titleLinkIcon?: ItemCardTitleLinkIcon;
}) {
  const nameText = getSourceTextOrEmpty(fullName) || "Unnamed";
  const hasBio = bio != null || isEditing;
  const hasRole = role != null || isEditing;
  const hasEyebrow = eyebrow != null || isEditing;
  const emailText = getSourceTextOrEmpty(email);
  const phoneText = getSourceTextOrEmpty(phone);
  const hasContact = emailText || phoneText;
  const imageSrc = getImageSrc(image) || DEFAULT_PERSON_CARD_IMG_URL;

  return {
    media: (
      <Image
        value={image ?? { value: { src: imageSrc, alt: nameText } }}
        placeholder="Image"
        isEditing={isEditing}
        className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        width={500}
        height={600}
        loading="lazy"
      />
    ),
    mediaClassName: personMediaClassName(mediaShape),
    contentClassName: "relative m-4 flex flex-col justify-between p-0",
    content: (
      <>
        {hasEyebrow && (
          <TypographySmall className="mb-1 font-medium text-muted-foreground uppercase tracking-wide">
            <Text
              value={eyebrow}
              tag="span"
              placeholder="Eyebrow"
              isEditing={isEditing}
            />
          </TypographySmall>
        )}
        <TypographyH4 className={size.titleClassName}>
          {withTitleLinkIcon(
            <Text value={fullName} placeholder="Name" isEditing={isEditing} />,
            titleLinkIcon,
          )}
        </TypographyH4>
        {hasRole && (
          <TypographySmall className="mt-1 text-muted-foreground">
            <Text
              value={role}
              tag="span"
              placeholder="Role"
              isEditing={isEditing}
            />
          </TypographySmall>
        )}
        {hasBio && (
          <TypographyMuted
            className={cn(
              "mt-2",
              size.bioClampClassName,
              "text-foreground",
              "text-sm leading-5 md:text-base md:leading-6",
            )}
          >
            <RichText value={bio} placeholder="Bio" isEditing={isEditing} />
          </TypographyMuted>
        )}
        {hasContact && (
          <TypographySmall className="mt-3 flex flex-col gap-1 text-muted-foreground">
            {emailText && <span className="truncate">{emailText}</span>}
            {phoneText && <span>{phoneText}</span>}
          </TypographySmall>
        )}
        <TypographyMuted className="mt-3 flex text-sm">
          <TypographySmall className="end-0 inline-flex items-center gap-1 font-accent font-medium text-muted-foreground group-hover:text-accent">
            <CardCta
              link={link}
              fallback="View profile"
              isEditing={isEditing}
            />
          </TypographySmall>
        </TypographyMuted>
      </>
    ),
  };
}

/** Standard variant — vertical card (headshot, eyebrow, name, role, bio, contact, CTA). */
export function Standard({
  id,
  styles,
  isEditing,
  fullName,
  role,
  bio,
  eyebrow,
  image,
  email,
  phone,
  link,
  elevation = "sm",
  padding = "sm",
  style = "outline",
  cardColorScheme,
  colorBand,
  titleLinkIcon,
  mediaBleed,
  mediaShape,
}: PersonCardProps) {
  const nameText = getSourceTextOrEmpty(fullName) || "Unnamed";
  const slots = buildVerticalSlots({
    fullName,
    role,
    bio,
    eyebrow,
    image,
    email,
    phone,
    link,
    isEditing,
    size: VERTICAL_SIZES.standard,
    mediaShape,
    titleLinkIcon,
  });
  return (
    <CardNavigate
      link={link}
      isEditing={isEditing}
      className="focus:outline-accent"
      aria-label={nameText}
    >
      <ItemCard
        id={id}
        className={cn(
          "rounded-(--card-radius,var(--radius-md))",
          styles?.trimEnd(),
        )}
        elevation={elevation}
        padding={padding}
        style={style}
        colorScheme={cardColorScheme}
        colorBand={colorBand}
        titleLinkIcon={titleLinkIcon}
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
  fullName,
  role,
  bio,
  eyebrow,
  image,
  email,
  phone,
  link,
  elevation = "sm",
  padding = "sm",
  style = "outline",
  cardColorScheme,
  colorBand,
  titleLinkIcon,
  mediaBleed,
  mediaShape,
}: PersonCardProps) {
  const nameText = getSourceTextOrEmpty(fullName) || "Unnamed";
  const slots = buildVerticalSlots({
    fullName,
    role,
    bio,
    eyebrow,
    image,
    email,
    phone,
    link,
    isEditing,
    size: VERTICAL_SIZES.featured,
    mediaShape,
    titleLinkIcon,
  });
  return (
    <CardNavigate
      link={link}
      isEditing={isEditing}
      className="focus:outline-accent"
      aria-label={nameText}
    >
      <ItemCard
        id={id}
        className={cn(
          "rounded-(--card-radius,var(--radius-md))",
          styles?.trimEnd(),
        )}
        elevation={elevation}
        padding={padding}
        style={style}
        colorScheme={cardColorScheme}
        colorBand={colorBand}
        titleLinkIcon={titleLinkIcon}
        mediaBleed={mediaBleed}
        {...slots}
      />
    </CardNavigate>
  );
}

/** ImageLed variant — headshot-forward, name + role only. */
export function ImageLed({
  id,
  styles,
  isEditing,
  fullName,
  role,
  image,
  link,
  elevation = "sm",
  padding = "sm",
  style = "outline",
  cardColorScheme,
  colorBand,
  titleLinkIcon,
  mediaBleed,
  mediaShape,
}: PersonCardProps) {
  const nameText = getSourceTextOrEmpty(fullName) || "Unnamed";
  const imageSrc = getImageSrc(image) || DEFAULT_PERSON_CARD_IMG_URL;
  return (
    <CardNavigate
      link={link}
      isEditing={isEditing}
      className="focus:outline-accent"
      aria-label={nameText}
    >
      <ItemCard
        id={id}
        className={cn(
          "rounded-(--card-radius,var(--radius-md))",
          styles?.trimEnd(),
        )}
        elevation={elevation}
        padding={padding}
        style={style}
        colorScheme={cardColorScheme}
        colorBand={colorBand}
        titleLinkIcon={titleLinkIcon}
        mediaBleed={mediaBleed}
        mediaClassName={personMediaClassName(mediaShape)}
        media={
          <Image
            value={image ?? { value: { src: imageSrc, alt: nameText } }}
            placeholder="Image"
            isEditing={isEditing}
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            width={500}
            height={600}
            loading="lazy"
          />
        }
        contentClassName="m-4 p-0"
        content={
          <>
            <TypographyH4 className="wrap-break-word line-clamp-2 text-lg md:text-xl">
              {withTitleLinkIcon(
                <Text
                  value={fullName}
                  placeholder="Name"
                  isEditing={isEditing}
                />,
                titleLinkIcon,
              )}
            </TypographyH4>
            {(role || isEditing) && (
              <TypographySmall className="mt-1 text-muted-foreground">
                <Text
                  value={role}
                  tag="span"
                  placeholder="Role"
                  isEditing={isEditing}
                />
              </TypographySmall>
            )}
          </>
        }
      />
    </CardNavigate>
  );
}

/**
 * CompactRow variant — horizontal card (headshot start, content end).
 * Wrapper mode pending horizontal orientation on the shared shell.
 */
export function CompactRow({
  id,
  styles,
  isEditing,
  fullName,
  role,
  bio,
  eyebrow,
  image,
  email,
  phone,
  link,
  elevation = "sm",
  padding = "sm",
  style = "outline",
  cardColorScheme,
  titleLinkIcon,
}: PersonCardProps) {
  const nameText = getSourceTextOrEmpty(fullName) || "Unnamed";
  const imageSrc = getImageSrc(image);
  const emailText = getSourceTextOrEmpty(email);
  const phoneText = getSourceTextOrEmpty(phone);
  const hasContact = emailText || phoneText;
  // The former `appearance="inner"` treatment (elevation none / style
  // flat / padding sm) — a flat, shadowless inset tile.
  const isInner = elevation === "none" && style === "flat";
  const padClass = isInner
    ? "group relative my-2 flex max-h-56 w-full flex-row flex-nowrap rounded-(--card-radius,var(--radius-md)) bg-background p-4 transition-colors hover:bg-muted/20"
    : "group relative my-4 flex max-h-56 w-full flex-row flex-nowrap rounded-(--card-radius,var(--radius-md)) bg-background p-6 shadow-sm transition-shadow hover:shadow-md";
  return (
    <CardNavigate
      link={link}
      isEditing={isEditing}
      className="focus:outline-accent"
      aria-label={nameText}
    >
      <ItemCard
        id={id}
        className={cn(padClass, styles?.trimEnd())}
        elevation={elevation}
        padding={padding}
        style={style}
        colorScheme={cardColorScheme}
      >
        {(imageSrc || isEditing) && (
          <div className="aspect-[3/4] w-1/4 flex-none overflow-hidden rounded bg-background-surface">
            <Image
              value={image}
              placeholder="Image"
              isEditing={isEditing}
              className="h-full w-full rounded object-cover object-center"
              width={500}
              height={600}
            />
          </div>
        )}
        <div className="grow flex-col ps-4">
          <span aria-hidden="true" className="absolute inset-0" />
          {(eyebrow || isEditing) && (
            <TypographySmall className="mb-1 font-medium text-muted-foreground uppercase tracking-wide">
              <Text
                value={eyebrow}
                tag="span"
                placeholder="Eyebrow"
                isEditing={isEditing}
              />
            </TypographySmall>
          )}
          <TypographyH4 className="wrap-break-word mb-1 text-foreground text-lg">
            {withTitleLinkIcon(
              <Text
                value={fullName}
                placeholder="Name"
                isEditing={isEditing}
              />,
              titleLinkIcon,
            )}
          </TypographyH4>
          {(role || isEditing) && (
            <TypographySmall className="text-muted-foreground">
              <Text
                value={role}
                tag="span"
                placeholder="Role"
                isEditing={isEditing}
              />
            </TypographySmall>
          )}
          {(bio || isEditing) && (
            <TypographyMuted
              className={cn(
                "mt-2",
                "line-clamp-2",
                "text-foreground",
                "text-sm leading-5 md:text-base md:leading-6",
              )}
            >
              <RichText value={bio} placeholder="Bio" isEditing={isEditing} />
            </TypographyMuted>
          )}
          {hasContact && (
            <TypographySmall className="mt-3 flex flex-col gap-1 text-muted-foreground">
              {emailText && <span className="truncate">{emailText}</span>}
              {phoneText && <span>{phoneText}</span>}
            </TypographySmall>
          )}
        </div>
      </ItemCard>
    </CardNavigate>
  );
}

/**
 * Overlay variant — image-dominant photo card (headshot as absolute
 * fill behind a bottom-up gradient scrim; name + role pinned
 * bottom-start, eyebrow as a badge). Aspect from `mediaAspect`
 * (`media-aspect@1`, default `3x4` to match the family's portrait
 * media).
 */
export function Overlay({
  id,
  styles,
  isEditing,
  fullName,
  role,
  eyebrow,
  image,
  link,
  mediaAspect,
  mediaShape,
  titleLinkIcon,
}: PersonCardProps) {
  const nameText = getSourceTextOrEmpty(fullName) || "Unnamed";
  const imageSrc = getImageSrc(image) || DEFAULT_PERSON_CARD_IMG_URL;
  const overlayShape = parseOptionalMediaShape(
    typeof mediaShape === "string" ? mediaShape : undefined,
  );
  const aspect = parseCardMediaAspect(
    typeof mediaAspect === "string" ? mediaAspect : undefined,
    "3x4",
  );
  return (
    <CardNavigate
      link={link}
      isEditing={isEditing}
      className="focus:outline-accent"
      aria-label={nameText}
    >
      <article
        id={id}
        data-slot="person-card-overlay"
        className={cn(
          "group relative w-full overflow-hidden rounded-(--card-radius,var(--radius-md)) bg-background-surface",
          MEDIA_ASPECT_CLASSES[aspect],
          overlayShape && MEDIA_SHAPE_CLASSES[overlayShape],
          styles?.trimEnd(),
        )}
      >
        <Image
          value={image ?? { value: { src: imageSrc, alt: nameText } }}
          placeholder="Image"
          isEditing={isEditing}
          className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
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
          <TypographyH4 className="wrap-break-word line-clamp-2 font-bold text-current text-xl leading-snug md:text-2xl">
            {withTitleLinkIcon(
              <Text
                value={fullName}
                placeholder="Name"
                isEditing={isEditing}
              />,
              titleLinkIcon,
            )}
          </TypographyH4>
          {(role || isEditing) && (
            <TypographySmall className="text-theme-white/70">
              <Text
                value={role}
                tag="span"
                placeholder="Role"
                isEditing={isEditing}
              />
            </TypographySmall>
          )}
        </div>
      </article>
    </CardNavigate>
  );
}

export const Default = Standard;
export default Standard;

export const componentType = "universal";
