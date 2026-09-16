"use client";

import {
  MediaItemFigure,
  type MediaCaptionStyle,
} from "@/components/registry/blocks/media-item-figure";
import type { ImageSource } from "@/components/registry/primitives/editables/image";
import type { TextSource } from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import { type CmsProps, useSitecore } from "@/lib/registry/sitecore";
import { useMediaGalleryTilePresentation } from "./media-gallery-context";

/**
 * Media Item — leaf rendering for the media-gallery / carousel / wall
 * family. Drop into `cards-media-gallery-{*}`, `cards-media-carousel-{*}`,
 * or `cards-media-wall-{*}`.
 */

export interface MediaItemProps extends CmsProps {
  image?: ImageSource;
  videoUrl?: TextSource | string;
  thumbnailUrl?: TextSource | string;
  title?: TextSource;
  caption?: TextSource;
  altText?: TextSource;
}

function MediaTile({
  image,
  videoUrl,
  thumbnailUrl,
  title,
  caption,
  captionStyle,
  id,
  styles,
  isEditing: isEditingProp,
  mediaKind = "image",
}: MediaItemProps & {
  captionStyle: MediaCaptionStyle;
  mediaKind?: "image" | "video";
}) {
  const sitecore = useSitecore() as {
    page?: { mode?: { isEditing?: boolean } };
  };
  const isEditing =
    isEditingProp ?? Boolean(sitecore?.page?.mode?.isEditing);
  const shell = useMediaGalleryTilePresentation();
  // Gallery / carousel / wall own CaptionStyle / MediaAspect for
  // dropped tiles. `none` is image-only in Pages and preview — Title /
  // Caption stay on the Media Item properties panel.
  const resolvedCaptionStyle: MediaCaptionStyle =
    shell?.captionStyle ?? captionStyle;
  const aspectClassName = shell?.aspectClassName ?? "aspect-video";
  const fillTile = aspectClassName.split(/\s+/).includes("h-full");
  const captionSitsBelow =
    resolvedCaptionStyle === "below" || resolvedCaptionStyle === "card";

  return (
    <div
      className={cn(
        "component media-item min-w-0",
        fillTile && "h-full min-h-0",
        fillTile && captionSitsBelow && "flex flex-col",
        styles?.trimEnd(),
      )}
      id={id}
      data-slot="media-item"
    >
      <MediaItemFigure
        image={image}
        videoUrl={videoUrl}
        thumbnailUrl={thumbnailUrl}
        title={title}
        caption={caption}
        imageSizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        aspectClassName={aspectClassName}
        className={cn(
          "rounded-[var(--card-radius,var(--radius-lg,0.75rem))]",
          fillTile && "h-full min-h-0",
        )}
        captionClassName="text-sm"
        captionStyle={resolvedCaptionStyle}
        isEditing={isEditing}
        mediaKind={mediaKind}
      />
    </div>
  );
}

export function Image(props: MediaItemProps) {
  return <MediaTile {...props} captionStyle="none" mediaKind="image" />;
}

export function Video(props: MediaItemProps) {
  return <MediaTile {...props} captionStyle="none" mediaKind="video" />;
}

export function ImageWithCaption(props: MediaItemProps) {
  return <MediaTile {...props} captionStyle="below" />;
}

export const Default = Image;

export const componentType = "universal";
