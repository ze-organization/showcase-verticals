"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { resolveSocialIcon } from "@/components/registry/graphics/icons/social/resolve";
import { Button } from "@/components/registry/primitives/core/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/registry/primitives/core/dialog";
import { ThemeIcon } from "@/components/registry/primitives/core/theme-icon";
import type { ImageSource } from "@/components/registry/primitives/editables/image";
import { getSourceText } from "@/components/registry/primitives/editables/source-normalizers";
import {
  Text,
  type TextSource,
} from "@/components/registry/primitives/editables/text";
import { useDirection } from "@/hooks/registry/use-direction";
import { cn } from "@/lib/registry/cn";
import { MediaItemFigure } from "./media-item-figure";

/**
 * `MediaLightbox` — modal detail view over a media grid (the social /
 * UGC wall pattern): clicking a tile greys out the page and opens the
 * post at full size with a detail panel (author handle + platform
 * icon, caption, date, view-post link) and previous / next controls
 * that page through the whole collection without leaving the modal.
 *
 * When `embedSocialPost` is set and an item's `postUrl` is an
 * Instagram permalink, the media half swaps to Instagram's own
 * `/embed/captioned/` iframe so the actual post loads in place; every
 * other item keeps the self-hosted media + caption panel (no external
 * script, works offline / in previews).
 */

export interface MediaLightboxItem {
  id: string;
  image?: ImageSource;
  videoUrl?: string;
  thumbnailUrl?: string;
  title?: TextSource;
  caption?: TextSource;
  /** Social author handle, with or without the leading `@`. */
  authorHandle?: string;
  /** Permalink of the original post (drives the platform icon). */
  postUrl?: string;
  /** Pre-formatted display date, e.g. `27 Jun`. */
  postDate?: string;
}

export interface MediaLightboxProps {
  items: MediaLightboxItem[];
  /** Index to open at, or `null` when closed. Controlled by the host grid. */
  openIndex: number | null;
  onClose: () => void;
  /** Swap the media half for the platform's own embed when available. */
  embedSocialPost?: boolean;
  ariaLabel?: string;
}

/**
 * Instagram permalink → embeddable URL. Returns undefined for anything
 * that isn't an instagram.com post/reel permalink so callers fall back
 * to self-hosted media.
 */
export function instagramEmbedUrl(
  postUrl: string | undefined,
): string | undefined {
  if (!postUrl) return undefined;
  let url: URL;
  try {
    url = new URL(postUrl);
  } catch {
    return undefined;
  }
  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  if (host !== "instagram.com" && host !== "instagr.am") return undefined;
  const match = url.pathname.match(/^\/(p|reel|tv)\/([\w-]+)/);
  if (!match) return undefined;
  return `https://www.instagram.com/${match[1]}/${match[2]}/embed/captioned/`;
}

function normalizeHandle(handle: string | undefined): string | undefined {
  const trimmed = handle?.trim();
  if (!trimmed) return undefined;
  return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
}

function LightboxDetailPanel({ item }: { item: MediaLightboxItem }) {
  const handle = normalizeHandle(item.authorHandle);
  const PlatformIcon = resolveSocialIcon(item.postUrl);
  const titleText = getSourceText(item.title);

  return (
    <div className="flex min-h-0 flex-col gap-4 p-5 md:p-6">
      <div className="flex items-center gap-2 pe-10">
        {PlatformIcon ? (
          <span className="flex h-6 w-6 shrink-0 items-center justify-center [&>svg]:h-5 [&>svg]:w-5">
            <PlatformIcon />
          </span>
        ) : null}
        <DialogTitle className="truncate font-semibold text-base text-foreground">
          {handle ?? titleText ?? "Post"}
        </DialogTitle>
      </div>

      <DialogDescription asChild>
        <div className="min-h-0 flex-1 overflow-y-auto text-foreground/90 text-sm leading-relaxed">
          {item.caption != null ? (
            <Text value={item.caption} tag="p" />
          ) : titleText ? (
            <p>{titleText}</p>
          ) : null}
        </div>
      </DialogDescription>

      <div className="mt-auto flex items-end justify-between gap-4">
        {item.postUrl ? (
          <a
            href={item.postUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary text-sm hover:underline"
          >
            View post
          </a>
        ) : (
          <span />
        )}
        {item.postDate ? (
          <span className="text-muted-foreground text-xs">{item.postDate}</span>
        ) : null}
      </div>
    </div>
  );
}

function LightboxMedia({
  item,
  embedSocialPost,
}: {
  item: MediaLightboxItem;
  embedSocialPost: boolean;
}) {
  const embedUrl = embedSocialPost
    ? instagramEmbedUrl(item.postUrl)
    : undefined;
  if (embedUrl) {
    return (
      <iframe
        src={embedUrl}
        title={normalizeHandle(item.authorHandle) ?? "Social post"}
        loading="lazy"
        allow="encrypted-media"
        className="h-full min-h-[420px] w-full border-0 md:min-h-[540px]"
      />
    );
  }
  return (
    <MediaItemFigure
      image={item.image}
      videoUrl={item.videoUrl}
      thumbnailUrl={item.thumbnailUrl}
      title={item.title}
      imageSizes="(max-width: 768px) 100vw, 60vw"
      aspectClassName="h-full min-h-[320px] md:min-h-[540px]"
      className="h-full"
      captionStyle="none"
    />
  );
}

export function MediaLightbox({
  items,
  openIndex,
  onClose,
  embedSocialPost = false,
  ariaLabel,
}: MediaLightboxProps) {
  const direction = useDirection();
  const isRtl = direction === "rtl";
  const [index, setIndex] = useState(0);

  // Re-seed the cursor every time the host opens a (new) tile.
  useEffect(() => {
    if (openIndex != null) setIndex(openIndex);
  }, [openIndex]);

  if (!items.length) return null;

  const open = openIndex != null;
  const clamped = Math.min(Math.max(index, 0), items.length - 1);
  const item = items[clamped];
  if (!item) return null;

  const goPrev = () => setIndex((clamped + items.length - 1) % items.length);
  const goNext = () => setIndex((clamped + 1) % items.length);
  const showNav = items.length > 1;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      if (isRtl) goNext();
      else goPrev();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      if (isRtl) goPrev();
      else goNext();
    }
  };

  const navButtonClassName =
    "absolute top-1/2 z-10 -translate-y-1/2 h-10 w-10 min-w-0 rounded-full bg-background/90 text-foreground shadow-md hover:bg-background";

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        size="xl"
        aria-label={ariaLabel}
        onKeyDown={handleKeyDown}
        className="gap-0 overflow-hidden p-0"
      >
        <div className="relative">
          <div className="grid min-h-[320px] md:min-h-[540px] md:grid-cols-[3fr_2fr]">
            <div className="min-w-0 bg-muted">
              <LightboxMedia item={item} embedSocialPost={embedSocialPost} />
            </div>
            <LightboxDetailPanel item={item} />
          </div>

          {showNav ? (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                colorScheme="neutral"
                className={cn(navButtonClassName, "start-3")}
                onClick={goPrev}
              >
                <ThemeIcon
                  name={isRtl ? "arrow-right" : "arrow-left"}
                  className="h-4 w-4"
                />
                <span className="sr-only">Previous post</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                colorScheme="neutral"
                className={cn(navButtonClassName, "end-3")}
                onClick={goNext}
              >
                <ThemeIcon
                  name={isRtl ? "arrow-left" : "arrow-right"}
                  className="h-4 w-4"
                />
                <span className="sr-only">Next post</span>
              </Button>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
