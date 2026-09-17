"use client";

import type { UseEmblaCarouselType } from "embla-carousel-react";
import {
  isValidElement,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/registry/primitives/core/button";
import { NextImage } from "@/components/registry/primitives/editables/image";
import { cn } from "@/lib/registry/cn";

/**
 * `WithPreviewBelow` — the clickable thumbnail strip that pairs with an
 * `ItemCarousel`, keeping the active thumbnail in lockstep with the
 * active slide and scrolling the carousel when a thumbnail is clicked.
 *
 * Six entity-carousel recipes declare a `WithPreviewBelow` variant and
 * every one of them shipped the export while forwarding
 * `layoutVariant: "with-preview"` — a value present in each type union
 * and read nowhere, so all six rendered exactly the same markup as
 * Default. `media-carousel` had the only working implementation, inlined
 * in its own `PreviewBelow` export. This is that behaviour lifted into a
 * shared block so the six families wire it in a few lines each instead
 * of copying the Embla bookkeeping six more times.
 *
 * The strip stays generic over the item type: a family supplies
 * `getThumb`, which is the only thing it knows that this block does not
 * (where the item's image and label live).
 */

export type CarouselThumb = {
  /** Thumbnail image URL. Omit for a text-only chip. */
  imageUrl?: string;
  /** Accessible label — also the visible text when there is no image. */
  label: string;
};

/**
 * Every entity carousel's item is a `FlatItem<Extras>`, so the six
 * families that need this strip all read the thumbnail from the same two
 * fields. Exported so each one passes `flatItemThumb` rather than
 * re-deriving it — and so a change to the envelope moves one function,
 * not six.
 */
export const flatItemThumb = <
  TItem extends {
    title?: string;
    image?: { src: string; alt?: string };
  },
>(
  item: TItem,
): CarouselThumb => ({
  imageUrl: item.image?.src,
  label: item.title ?? "Untitled",
});

/**
 * Embla bookkeeping for the strip: hands `setApi` to the carousel,
 * tracks the selected snap, and exposes `scrollTo` for thumbnail
 * clicks. Kept as a hook so the carousel and the strip can be siblings
 * in the family's own layout rather than forcing a wrapper element.
 */
export function useCarouselPreviewStrip() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [api, setApiState] = useState<UseEmblaCarouselType[1] | null>(null);
  const apiRef = useRef<UseEmblaCarouselType[1] | null>(null);

  const setApi = useCallback((next: UseEmblaCarouselType[1] | undefined) => {
    apiRef.current = next ?? null;
    setApiState(next ?? null);
  }, []);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setActiveIndex(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  const scrollTo = useCallback((index: number) => {
    apiRef.current?.scrollTo(index);
  }, []);

  return { setApi, activeIndex, scrollTo };
}

export interface CarouselPreviewStripProps<TItem> {
  items: TItem[];
  getKey: (item: TItem, index: number) => string;
  /** Image + label for one thumbnail. */
  getThumb: (item: TItem) => CarouselThumb;
  activeIndex: number;
  onSelect: (index: number) => void;
  /** Names the collection in each thumbnail's accessible label. */
  ariaLabel?: string;
  className?: string;
}

export function CarouselPreviewStrip<TItem>({
  items,
  getKey,
  getThumb,
  activeIndex,
  onSelect,
  ariaLabel,
  className,
}: CarouselPreviewStripProps<TItem>) {
  // One slide is not a strip — there is nothing to page between, and an
  // always-active lone thumbnail reads as a broken control.
  if (items.length < 2) return null;
  return (
    <div
      data-slot="carousel-preview-strip"
      className={cn("flex flex-wrap justify-center gap-2", className)}
    >
      {items.map((item, index) => {
        const thumb = getThumb(item);
        const isActive = index === activeIndex;
        return (
          <Button
            key={getKey(item, index)}
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onSelect(index)}
            className={cn(
              "relative h-16 w-24 overflow-hidden rounded border-2 p-0 transition-opacity sm:h-20 sm:w-28",
              isActive
                ? "border-primary opacity-100"
                : "border-transparent opacity-60 hover:opacity-80",
            )}
            aria-label={
              ariaLabel
                ? `${thumb.label} — ${ariaLabel} ${index + 1} of ${items.length}`
                : `${thumb.label} — ${index + 1} of ${items.length}`
            }
            aria-current={isActive ? "true" : undefined}
          >
            {thumb.imageUrl ? (
              <NextImage
                value={{ src: thumb.imageUrl, alt: "" }}
                fill
                sizes="112px"
                className="object-cover"
              />
            ) : (
              // Text-only fallback — the strip still has to be usable for
              // families whose items carry no image (offers, some person
              // records), so it degrades to a legible chip rather than an
              // empty box.
              <span className="line-clamp-3 px-1 text-[10px] leading-tight">
                {thumb.label}
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
}

/** Numbered preview chips for composed carousel children (no image URL). */
export function ComposedCarouselPreviewStrip({
  nodes,
  activeIndex,
  onSelect,
  ariaLabel,
}: {
  nodes: ReactNode[];
  activeIndex: number;
  onSelect: (index: number) => void;
  ariaLabel?: string;
}) {
  return (
    <CarouselPreviewStrip
      items={nodes.map((node, index) => ({ node, index }))}
      getKey={(item) =>
        isValidElement(item.node) && item.node.key != null
          ? String(item.node.key)
          : `composed-${item.index}`
      }
      getThumb={(item) => ({ label: String(item.index + 1) })}
      activeIndex={activeIndex}
      onSelect={onSelect}
      ariaLabel={ariaLabel}
    />
  );
}
