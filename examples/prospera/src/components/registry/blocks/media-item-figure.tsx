import type { ReactNode } from "react";
import { VideoBlock } from "@/components/registry/blocks/video-block";
import { Card } from "@/components/registry/primitives/core/card";
import { TypographySmall } from "@/components/registry/primitives/core/typography";
import {
  type ImageSource,
  NextImage,
} from "@/components/registry/primitives/editables/image";
import { RichText } from "@/components/registry/primitives/editables/richtext";
import { getSourceText } from "@/components/registry/primitives/editables/source-normalizers";
import {
  Text,
  type TextSource,
} from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";

/** How a media caption renders relative to its image. */
export type MediaCaptionStyle = "none" | "below" | "overlay" | "card";

/**
 * Card primitive radius token. Same `rounded-[var(--card-radius,…)]`
 * form destination/article cards use so scanned themes (including
 * square-chrome `--card-radius: 0`) apply. `rounded-(--card-radius)`
 * is not equivalent for those themes.
 */
const CARD_RADIUS =
  "rounded-[var(--card-radius,var(--radius-lg,0.75rem))]";
const CARD_RADIUS_TOP =
  "rounded-t-[var(--card-radius,var(--radius-lg,0.75rem))]";

export interface MediaItemFigureProps {
  /**
   * Image source — wins over `videoUrl` when present. Pass the
   * Sitecore field directly; emptiness is handled internally so the
   * caller can stay declarative.
   */
  image?: ImageSource;
  /**
   * Video URL — rendered via `VideoBlock` when no image is supplied.
   * Pass the Sitecore field in Pages so an empty Video variant still
   * mounts Text chrome; strings work for search / fixture data.
   */
  videoUrl?: TextSource | string;
  /**
   * Optional video poster / thumbnail URL. When present, the
   * underlying `VideoBlock` opts into autoplay + muted + inline
   * playback with this image as its `poster` — yields the inline
   * looping-thumbnail pattern used in the gallery variants.
   */
  thumbnailUrl?: TextSource | string;
  /**
   * Title text rendered as the figcaption's primary line and also
   * used as the accessible `<video>` label when video falls back from
   * a missing image. Accepts either a Sitecore `TextSource` or a
   * pre-resolved string.
   */
  title?: TextSource | string;
  /** Caption rendered below the title in muted tone. */
  caption?: TextSource;
  /**
   * Image `sizes` attribute for responsive srcset. Caller provides
   * this because the surrounding layout knows the slot width.
   */
  imageSizes?: string;
  /**
   * Aspect-ratio class for the framed media. Defaults to
   * `aspect-video` (16:9) to match the carousel + gallery shells.
   */
  aspectClassName?: string;
  /** Extra classes applied to the `<figure>` root. */
  className?: string;
  /** Extra classes applied to the `<figcaption>`. */
  captionClassName?: string;
  /**
   * How the caption renders relative to the image: `none`, `below`
   * (default — plain prose under the image), `overlay` (floating over
   * the image bottom on a gradient scrim), or `card` (image + caption
   * together in a bordered panel). `none` hides the figcaption entirely
   * — used by the gallery's twisted-mixed-media variant, where a caption
   * would clash with the rotated card visuals.
   */
  captionStyle?: MediaCaptionStyle;
  /**
   * Pages editing — keep an empty image slot mounted so Sitecore
   * Image chrome is clickable. Without this, `MediaItemFigure`
   * returns `null` and authors see a dead gray tile.
   */
  isEditing?: boolean;
  /** Author label for the empty image slot. Default `"Image"`. */
  imagePlaceholder?: string;
  /**
   * Empty-slot chrome when neither image nor video is set. `video`
   * mounts a Video URL field instead of the image picker.
   */
  mediaKind?: "image" | "video";
  /**
   * Fallback string used as the accessible video label when the
   * resolved title is empty. Defaults to `"Media item video"`.
   */
  fallbackVideoLabel?: string;
}

/**
 * Shared figure rendering for the `media-carousel` and
 * `media-gallery-list-grid` families. CMS-agnostic — every input is a
 * flat prop, so it composes from any data source that produces an
 * image / video / title / caption triple.
 *
 * Render path:
 *   - `image` present     → `<NextImage>` cover-cropped to `aspectClassName`
 *   - `videoUrl` present  → `<VideoBlock>` (poster + autoplay when `thumbnailUrl` is set)
 *   - neither             → `null` on the published page; in Pages, an
 *     empty `NextImage` slot so the Image field stays clickable
 *
 * Server-safe — `NextImage` and `VideoBlock` both render fine on the
 * server; the only client interactivity is whatever `VideoBlock`
 * activates when its playback config opts in.
 */
export function MediaItemFigure({
  image,
  videoUrl,
  thumbnailUrl,
  title,
  caption,
  imageSizes,
  aspectClassName = "aspect-video",
  className,
  captionClassName,
  captionStyle,
  isEditing,
  imagePlaceholder = "Image",
  mediaKind = "image",
  fallbackVideoLabel = "Media item video",
}: MediaItemFigureProps) {
  const resolvedImage = image && !isEmptyImage(image) ? image : undefined;
  const videoUrlString =
    typeof videoUrl === "string"
      ? videoUrl.trim() || undefined
      : (getSourceText(videoUrl) ?? undefined);
  const thumbnailUrlString =
    typeof thumbnailUrl === "string"
      ? thumbnailUrl.trim() || undefined
      : (getSourceText(thumbnailUrl) ?? undefined);
  const titleText =
    typeof title === "string" ? title : (getSourceText(title) ?? "");
  const titleSource = typeof title === "string" ? undefined : title;
  const hasCaption = caption != null && getSourceText(caption) != null;
  const showEmptyEditingSlot = Boolean(
    isEditing && !resolvedImage && !videoUrlString,
  );

  if (!resolvedImage && !videoUrlString && !showEmptyEditingSlot) return null;

  const style: MediaCaptionStyle = captionStyle ?? "below";
  const { overlay, below, cardSurface } = buildFigureCaption({
    style,
    captionClassName,
    titleText,
    titleSource,
    hasCaption,
    caption,
    isEditing,
  });
  // Mosaic (and any other `h-full` cell) fills a fixed grid track. Overlay
  // / none can paint the photo edge-to-edge; below / card must leave the
  // media box `flex-1` so the caption sits under the image instead of
  // being forced onto a scrim (or clipped by overflow).
  const fillParent = aspectClassName.split(/\s+/).includes("h-full");
  const captionSitsBelow = style === "below" || style === "card";
  const mediaBoxAspect =
    fillParent && captionSitsBelow ? "min-h-0 flex-1" : aspectClassName;

  const mediaBox = (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-muted",
        mediaBoxAspect,
        // Clip the photo to `--card-radius`. Card chrome only rounds
        // the top so the image meets the caption on a square edge
        // (same as Image Framing `card` / article cards).
        cardSurface ? CARD_RADIUS_TOP : CARD_RADIUS,
      )}
    >
      <MediaItemFigureMedia
        resolvedImage={resolvedImage}
        emptyImage={showEmptyEditingSlot ? image : undefined}
        videoUrl={videoUrlString}
        videoUrlField={typeof videoUrl === "string" ? undefined : videoUrl}
        imageSizes={imageSizes}
        thumbnailUrl={thumbnailUrlString}
        videoLabel={titleText || fallbackVideoLabel}
        isEditing={isEditing}
        imagePlaceholder={imagePlaceholder}
        mediaKind={mediaKind}
      />
      {overlay}
    </div>
  );

  const fillCol = fillParent && captionSitsBelow;

  return (
    <figure
      className={cn(
        // No background on the figure itself — `bg-muted` lives on the
        // media box so a `below` caption sits on the page surface, not
        // on a muted panel. `card` chrome is the Card primitive.
        !cardSurface && CARD_RADIUS,
        fillCol && "flex h-full min-h-0 flex-col",
        className,
      )}
    >
      {cardSurface ? (
        <Card
          elevation="theme"
          style="outline"
          className={cn(
            "relative w-full gap-0 overflow-hidden p-0",
            fillCol && "flex h-full min-h-0 flex-col",
          )}
          data-framing="card"
        >
          {mediaBox}
          {below}
        </Card>
      ) : (
        <>
          {mediaBox}
          {below}
        </>
      )}
    </figure>
  );
}

/**
 * Resolve the caption into its placement slot for the chosen style:
 * `overlay` floats over the image bottom, `card` sits in a padded panel
 * below (and flags the figure as a bordered card surface), `below` is
 * plain prose under the image, and `none` renders nothing.
 */
function buildFigureCaption({
  style,
  captionClassName,
  titleText,
  titleSource,
  hasCaption,
  caption,
  isEditing,
}: {
  style: MediaCaptionStyle;
  captionClassName: string | undefined;
  titleText: string;
  titleSource: TextSource | undefined;
  hasCaption: boolean;
  caption: TextSource | undefined;
  isEditing?: boolean;
}): { overlay: ReactNode; below: ReactNode; cardSurface: boolean } {
  const cardSurface = style === "card";
  const showCaption =
    style !== "none" &&
    (Boolean(titleText || hasCaption) || Boolean(isEditing));
  if (!showCaption) return { overlay: null, below: null, cardSurface };

  const variant =
    style === "overlay" ? "overlay" : cardSurface ? "card" : "below";
  const node = (
    <MediaItemFigureCaption
      captionClassName={captionClassName}
      titleText={titleText}
      titleSource={titleSource}
      hasCaption={hasCaption}
      caption={caption}
      variant={variant}
      isEditing={isEditing}
    />
  );

  if (style === "overlay") {
    return {
      overlay: (
        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/75 via-black/40 to-transparent p-3 pt-8">
          {node}
        </div>
      ),
      below: null,
      cardSurface: false,
    };
  }
  return {
    overlay: null,
    below: cardSurface ? <div className="px-4 py-3">{node}</div> : node,
    cardSurface,
  };
}

function MediaItemFigureMedia({
  resolvedImage,
  emptyImage,
  videoUrl,
  videoUrlField,
  imageSizes,
  thumbnailUrl,
  videoLabel,
  isEditing,
  imagePlaceholder,
  mediaKind,
}: {
  resolvedImage: ImageSource | undefined;
  emptyImage: ImageSource | undefined;
  videoUrl: string | undefined;
  videoUrlField: TextSource | undefined;
  imageSizes: string | undefined;
  thumbnailUrl: string | undefined;
  videoLabel: string;
  isEditing?: boolean;
  imagePlaceholder?: string;
  mediaKind?: "image" | "video";
}) {
  if (resolvedImage) {
    return (
      <NextImage
        value={resolvedImage}
        className="object-cover"
        fill
        sizes={imageSizes}
        isEditing={isEditing}
        placeholder={imagePlaceholder}
      />
    );
  }
  if (isEditing && mediaKind === "video" && !videoUrl) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <Text
          value={videoUrlField}
          isEditing
          placeholder="Video URL"
        />
      </div>
    );
  }
  if (isEditing) {
    return (
      <NextImage
        value={emptyImage}
        className="object-cover"
        fill
        sizes={imageSizes}
        isEditing
        placeholder={imagePlaceholder}
      />
    );
  }
  if (!videoUrl) return null;
  return (
    <VideoBlock
      url={videoUrl}
      label={videoLabel}
      videoClassName="object-cover"
      {...(thumbnailUrl
        ? {
            behaviorOptions: {
              load: { enabled: true },
              playback: {
                autoPlay: true,
                muted: true,
                playsInline: true,
                poster: thumbnailUrl,
              },
            },
          }
        : {})}
    />
  );
}

function MediaItemFigureCaption({
  captionClassName,
  titleText,
  titleSource,
  hasCaption,
  caption,
  variant,
  isEditing,
}: {
  captionClassName: string | undefined;
  titleText: string;
  titleSource: TextSource | undefined;
  hasCaption: boolean;
  caption: TextSource | undefined;
  variant: "below" | "overlay" | "card";
  isEditing?: boolean;
}) {
  const isOverlay = variant === "overlay";
  const showTitle = Boolean(titleText) || Boolean(isEditing);
  const showCaptionSlot = hasCaption || Boolean(isEditing);
  return (
    <figcaption
      className={cn(
        "space-y-1",
        // `below` keeps the original under-image spacing; `card` +
        // `overlay` get their spacing from their wrapper.
        variant === "below" && "mt-2",
        captionClassName,
        isOverlay && "text-white",
      )}
    >
      {showTitle ? (
        <TypographySmall
          className={cn(
            "font-medium",
            isOverlay ? "text-white" : "text-foreground",
          )}
        >
          {titleSource || isEditing ? (
            <Text
              value={titleSource}
              tag="span"
              isEditing={isEditing}
              placeholder="Title"
            />
          ) : (
            <span>{titleText}</span>
          )}
        </TypographySmall>
      ) : null}
      {showCaptionSlot ? (
        <div
          className={cn(
            "text-sm",
            isOverlay ? "text-white/80" : "text-muted-foreground",
          )}
        >
          <RichText
            value={caption}
            isEditing={isEditing}
            placeholder="Caption"
          />
        </div>
      ) : null}
    </figcaption>
  );
}

export interface MediaItemThumbProps {
  /** Image source — preferred over the video-label fallback. */
  image?: ImageSource;
  /** Video URL — when no image, the thumb shows `label` over a muted slab. */
  videoUrl?: string;
  /**
   * Fallback label text rendered when there's no image to show. Pass
   * the resolved title/caption/href text — already a string, no
   * source dispatch needed.
   */
  label?: string;
  /**
   * Active-state flag. Currently only nudges the fallback label's
   * opacity so the active thumb reads slightly bolder.
   */
  isActive?: boolean;
}

/**
 * Thumbnail rendering for the media-carousel `PreviewBelow` variant's
 * scroll-to-index strip. Renders the image cover-cropped, or — if the
 * underlying item is a video without a thumbnail — a muted slab with
 * the resolved label centred.
 */
export function MediaItemThumb({
  image,
  videoUrl,
  label,
  isActive,
}: MediaItemThumbProps) {
  const resolvedImage = image && !isEmptyImage(image) ? image : undefined;

  return (
    <div
      className={cn(
        "relative h-full w-full",
        !resolvedImage &&
          videoUrl &&
          "flex items-center justify-center bg-foreground/80 px-2",
      )}
    >
      {resolvedImage ? (
        <NextImage
          value={resolvedImage}
          className="object-cover"
          fill
          sizes="112px"
        />
      ) : (
        <span
          className={cn(
            "line-clamp-2 text-center text-white text-xs",
            isActive ? "opacity-100" : "opacity-90",
          )}
        >
          {label ?? "Video"}
        </span>
      )}
    </div>
  );
}

function isEmptyImage(image: ImageSource): boolean {
  if (image == null) return true;
  if (typeof image === "object") {
    const v = (image as { value?: { src?: unknown } | string }).value;
    if (typeof v === "string") return v.trim() === "";
    if (v && typeof v === "object") {
      return !("src" in v && v.src);
    }
    if ("src" in image) {
      return !(image as { src?: unknown }).src;
    }
  }
  return true;
}
