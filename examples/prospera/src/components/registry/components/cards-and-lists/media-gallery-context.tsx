"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { CaptionStyleValue } from "@/lib/registry/param-parsers";

/**
 * Presentation a media shell (gallery / carousel / wall) owns and
 * applies to dropped `media-item` children. Layout variants wrap the
 * slot; CaptionStyle / MediaAspect lived only on the Treelist `items`
 * path until this context carried them into composed tiles.
 *
 * Outside a provider, Image / Video stay image-only. Parent
 * CaptionStyle `none` hides Title / Caption in Pages and preview.
 */
export type MediaGalleryTilePresentation = {
  captionStyle: CaptionStyleValue;
  /** Resolved aspect class (`aspect-video`, `aspect-square`, …). */
  aspectClassName?: string;
};

const MediaGalleryTileContext =
  createContext<MediaGalleryTilePresentation | null>(null);

export function MediaGalleryTileProvider({
  value,
  children,
}: {
  value: MediaGalleryTilePresentation;
  children: ReactNode;
}) {
  return (
    <MediaGalleryTileContext.Provider value={value}>
      {children}
    </MediaGalleryTileContext.Provider>
  );
}

export function useMediaGalleryTilePresentation(): MediaGalleryTilePresentation | null {
  return useContext(MediaGalleryTileContext);
}
