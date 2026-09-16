"use client";

import { useState } from "react";
import { Button } from "@/components/registry/primitives/core/button";
import { Image } from "@/components/registry/primitives/editables/image";
import { cn } from "@/lib/registry/cn";

export interface VideoBlockProps {
  url: string;
  label: string;
  className?: string;
  videoClassName?: string;
  behaviorOptions?: {
    load?: {
      enabled?: boolean;
      /** Backward-compatible alias for `enabled`. */
      clickToLoad?: boolean;
      isLoaded?: boolean;
      onLoad?: () => void;
      label?: string;
    };
    playback?: {
      controls?: boolean;
      autoPlay?: boolean;
      muted?: boolean;
      loop?: boolean;
      playsInline?: boolean;
      poster?: string;
      preload?: "none" | "metadata" | "auto";
    };
    captions?: {
      trackUrl?: string;
      language?: string;
      label?: string;
    };
  };
}

export function isEmbedVideoUrl(url: string): boolean {
  return (
    url.includes("youtube.com") ||
    url.includes("youtu.be") ||
    url.includes("vimeo.com")
  );
}

function getYouTubeVideoId(url: string): string | undefined {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id?.trim() || undefined;
    }
    if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname.startsWith("/watch")) {
        return parsed.searchParams.get("v")?.trim() || undefined;
      }
      if (parsed.pathname.startsWith("/embed/")) {
        return (
          parsed.pathname.split("/").filter(Boolean)[1]?.trim() || undefined
        );
      }
      if (parsed.pathname.startsWith("/shorts/")) {
        return (
          parsed.pathname.split("/").filter(Boolean)[1]?.trim() || undefined
        );
      }
    }
  } catch {
    return undefined;
  }
  return undefined;
}

function getVimeoVideoId(url: string): string | undefined {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("vimeo.com")) return undefined;
    const segments = parsed.pathname.split("/").filter(Boolean);
    const numericSegment = [...segments]
      .reverse()
      .find((segment) => /^\d+$/.test(segment));
    return numericSegment?.trim() || undefined;
  } catch {
    return undefined;
  }
}

function resolveEmbedUrlAndThumbnail(url: string): {
  embedUrl: string;
  thumbnailUrl?: string;
  provider?: "youtube" | "vimeo";
} {
  const youtubeId = getYouTubeVideoId(url);
  if (youtubeId) {
    return {
      embedUrl: `https://www.youtube.com/embed/${youtubeId}`,
      thumbnailUrl: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
      provider: "youtube",
    };
  }

  const vimeoId = getVimeoVideoId(url);
  if (vimeoId) {
    return {
      embedUrl: `https://player.vimeo.com/video/${vimeoId}`,
      thumbnailUrl: `https://vumbnail.com/${vimeoId}.jpg`,
      provider: "vimeo",
    };
  }

  return { embedUrl: url };
}

function withEmbedPlaybackParams({
  embedUrl,
  provider,
  autoPlay,
  muted,
  playsInline,
}: {
  embedUrl: string;
  provider?: "youtube" | "vimeo";
  autoPlay: boolean;
  muted: boolean;
  playsInline: boolean;
}) {
  if (!provider || !autoPlay) return embedUrl;
  try {
    const parsed = new URL(embedUrl);
    if (provider === "youtube") {
      parsed.searchParams.set("autoplay", "1");
      parsed.searchParams.set("mute", muted ? "1" : "0");
      if (playsInline) parsed.searchParams.set("playsinline", "1");
      return parsed.toString();
    }
    if (provider === "vimeo") {
      parsed.searchParams.set("autoplay", "1");
      parsed.searchParams.set("muted", muted ? "1" : "0");
      if (playsInline) parsed.searchParams.set("playsinline", "1");
      return parsed.toString();
    }
  } catch {
    return embedUrl;
  }
  return embedUrl;
}

/** Resolve the playback option defaults in one place. */
function resolvePlaybackOptions(
  playback: NonNullable<VideoBlockProps["behaviorOptions"]>["playback"],
) {
  return {
    controls: playback?.controls ?? true,
    autoPlay: playback?.autoPlay ?? false,
    muted: playback?.muted ?? false,
    loop: playback?.loop ?? false,
    playsInline: playback?.playsInline ?? false,
    preload: playback?.preload ?? "metadata",
    poster: playback?.poster,
  };
}

/** The click-to-load gate: poster (or provider thumbnail) + play button. */
function ClickToLoadPoster({
  thumbnailUrl,
  label,
  loadLabel,
  onLoad,
  className,
}: {
  thumbnailUrl?: string;
  label: string;
  loadLabel: string;
  onLoad: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center overflow-hidden bg-muted/80",
        className,
      )}
    >
      {thumbnailUrl ? (
        <Image
          value={{ src: thumbnailUrl, alt: label }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
      <div className="absolute inset-0 bg-black/35" aria-hidden />
      <Button
        type="button"
        onClick={onLoad}
        aria-label={`${loadLabel}: ${label}`}
        className="relative z-10 h-12 w-12 rounded-full p-0"
      >
        {/*
          Play-button triangle. Built from CSS borders — `border-s-12
          + border-y-transparent` produces an inline-end-pointing
          arrow (right in LTR, left in RTL) automatically, no rotate
          hack needed. The optical-balance `ms-0.5` nudge also flips
          via the same logical token.
        */}
        <span
          aria-hidden
          className="ms-0.5 block h-0 w-0 border-y-8 border-y-transparent border-s-12 border-s-current"
        />
      </Button>
    </div>
  );
}

/**
 * Shared video renderer for embed URLs and native video URLs.
 */
export function VideoBlock({
  url,
  label,
  className,
  videoClassName,
  behaviorOptions,
}: VideoBlockProps) {
  const {
    embedUrl,
    thumbnailUrl: derivedThumbnailUrl,
    provider,
  } = resolveEmbedUrlAndThumbnail(url);
  const { controls, autoPlay, muted, loop, playsInline, preload, poster } =
    resolvePlaybackOptions(behaviorOptions?.playback);
  const thumbnailUrl = poster ?? derivedThumbnailUrl;
  const clickToLoad =
    behaviorOptions?.load?.enabled ??
    behaviorOptions?.load?.clickToLoad ??
    false;
  const [internalLoaded, setInternalLoaded] = useState(false);
  const hasControlledLoadedState =
    typeof behaviorOptions?.load?.isLoaded === "boolean";
  const isLoaded = clickToLoad
    ? hasControlledLoadedState
      ? Boolean(behaviorOptions?.load?.isLoaded)
      : internalLoaded
    : true;
  const onLoad = () => {
    behaviorOptions?.load?.onLoad?.();
    if (!hasControlledLoadedState) {
      setInternalLoaded(true);
    }
  };
  const captionTrackUrl = behaviorOptions?.captions?.trackUrl;
  const captionLanguage = behaviorOptions?.captions?.language ?? "en";
  const captionLabel = behaviorOptions?.captions?.label ?? "English captions";
  // Click-to-load is click-to-PLAY: once the viewer clicks through the
  // poster gate, playback must actually start — the embed URL gets
  // autoplay appended and the native <video> mounts with autoPlay.
  // Without this, clicking only swapped the poster for a paused player
  // (the "click to load doesn't play" bug).
  const startedByViewer = clickToLoad && isLoaded;
  const effectiveAutoPlay = autoPlay || startedByViewer;
  const embedSrc = withEmbedPlaybackParams({
    embedUrl,
    provider,
    autoPlay: effectiveAutoPlay,
    muted,
    playsInline,
  });

  if (clickToLoad && !isLoaded) {
    return (
      <ClickToLoadPoster
        thumbnailUrl={thumbnailUrl}
        label={label}
        loadLabel={behaviorOptions?.load?.label ?? "Load video"}
        onLoad={onLoad}
        className={className}
      />
    );
  }

  if (isEmbedVideoUrl(url)) {
    return (
      <iframe
        src={embedSrc}
        title={label}
        className={cn("absolute inset-0 h-full w-full", className)}
        loading="lazy"
        allowFullScreen
        // YouTube/Vimeo embeds need scripts (player), same-origin
        // (cookie-less personalization), presentation (fullscreen API),
        // and popups (the "watch on YouTube" link). All other powerful
        // features are denied by `allow` below.
        sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
        allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    );
  }

  return (
    <video
      src={url}
      controls={controls}
      preload={preload}
      className={cn("h-full w-full object-contain", className, videoClassName)}
      aria-label={label}
      autoPlay={effectiveAutoPlay}
      muted={muted}
      loop={loop}
      playsInline={playsInline}
      poster={poster}
    >
      {captionTrackUrl ? (
        <track
          src={captionTrackUrl}
          kind="captions"
          srcLang={captionLanguage}
          label={captionLabel}
        />
      ) : null}
      <span className="sr-only">
        Your browser does not support the video tag.
      </span>
    </video>
  );
}
