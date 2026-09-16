"use client";

import { useState } from "react";
import { VideoBlock } from "@/components/registry/blocks/video-block";
import {
  TypographyH2,
  TypographyMuted,
} from "@/components/registry/primitives/core/typography";
import { isEmptySource } from "@/components/registry/primitives/editables/source-normalizers";
import {
  Text,
  type TextSource,
} from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import {
  isEnabled,
  parseDefaultOnCheckbox,
} from "@/lib/registry/param-parsers";
import type { ComponentProps } from "@/lib/registry/sitecore-types";

/** Normalized video fields: embed URL or video src, optional title and caption. */
export interface VideoFields {
  /** YouTube/Vimeo embed URL or direct video file URL */
  VideoUrl?: TextSource;
  /** Optional thumbnail/poster image URL used for click-to-load and native poster. */
  ThumbnailUrl?: TextSource;
  Title?: TextSource;
  Caption?: TextSource;
  /** Optional captions/subtitles file URL (for native video only) */
  CaptionFileUrl?: TextSource;
}

export interface VideoBlockProps extends ComponentProps {
  fields: VideoFields;
}

/** Native `<video>`/embed preload strategy from the `MediaPreload` param. */
function parsePreload(value?: string): "none" | "metadata" | "auto" {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "none" || normalized === "auto") return normalized;
  return "metadata";
}

function getUrl(value: TextSource | undefined): string | undefined {
  if (value == null) return undefined;
  if (typeof value === "string") return value.trim() || undefined;
  if (typeof value === "object" && "value" in value) {
    const v = (value as { value?: string }).value;
    return v != null && typeof v === "string"
      ? v.trim() || undefined
      : undefined;
  }
  return undefined;
}

/**
 * Default variant: video embed or video element with optional title and caption.
 * Supports `params.ClickToLoad` ("1" | "true") to defer media loading until user click.
 */
export function Default({ params, fields }: VideoBlockProps) {
  const { styles, RenderingIdentifier: id } = params ?? {};
  const clickToLoad = isEnabled(params?.ClickToLoad);
  // Playback controls — routed from rendering params so authors can
  // tune them in Pages / the preview. `controls` defaults on; autoplay
  // forces muted (browsers block unmuted autoplay).
  // `default: "true"` in the recipe -> unchecking emits "", which
  // parseBoolParam would resolve back to the `true` fallback.
  const controls = parseDefaultOnCheckbox(params?.MediaControls);
  const autoPlay = isEnabled(params?.MediaAutoplay);
  const muted = isEnabled(params?.MediaMuted) || autoPlay;
  const loop = isEnabled(params?.MediaLoop);
  const playsInline = isEnabled(params?.MediaPlaysInline);
  const preload = parsePreload(params?.MediaPreload);
  const url = getUrl(fields?.VideoUrl);
  const hasTitle = fields?.Title && !isEmptySource(fields.Title);
  const hasCaption = fields?.Caption && !isEmptySource(fields.Caption);
  const title = hasTitle ? fields.Title : undefined;
  const caption = hasCaption ? fields.Caption : undefined;
  const posterUrl = getUrl(fields?.ThumbnailUrl);
  const captionTrackUrl = getUrl(fields?.CaptionFileUrl);
  const [isMediaLoaded, setIsMediaLoaded] = useState(!clickToLoad);
  const mediaLabel = getUrl(title) ?? "Video";

  return (
    <section
      className={cn(
        "component video w-full bg-background text-foreground",
        styles?.trimEnd(),
      )}
      id={id ?? undefined}
      dir="inherit"
      data-slot="video"
    >
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="mx-auto max-w-4xl">
          {title && (
            <TypographyH2 className="mb-4 font-heading font-semibold text-2xl md:text-3xl">
              <Text value={title} tag="span" />
            </TypographyH2>
          )}
          {url && (
            <div className="relative aspect-video w-full overflow-hidden rounded-(--card-radius,var(--radius-lg)) bg-muted">
              <VideoBlock
                url={url}
                label={mediaLabel}
                behaviorOptions={{
                  captions: { trackUrl: captionTrackUrl },
                  load: {
                    enabled: clickToLoad,
                    isLoaded: isMediaLoaded,
                    onLoad: () => setIsMediaLoaded(true),
                  },
                  playback: {
                    poster: posterUrl,
                    controls,
                    autoPlay,
                    muted,
                    loop,
                    playsInline,
                    preload,
                  },
                }}
              />
            </div>
          )}
          {caption && (
            <TypographyMuted className="mt-3 text-sm">
              <Text value={caption} tag="span" />
            </TypographyMuted>
          )}
        </div>
      </div>
    </section>
  );
}

export const componentType = "universal";
