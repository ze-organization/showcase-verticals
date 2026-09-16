"use client";

/**
 * `FeatureSpotlightLayout` — editorial dual-carousel layout for the
 * cards-and-lists family.
 *
 * Anchors an editorial text panel (title + lead + CTA) on one side and a
 * synced pair of offset carousels on the other. The primary carousel is
 * the hero slot (single tall card); the secondary follows by `index + 1`
 * to create the magazine-feature feel of a lead story paired with the
 * "up next" peek.
 *
 * Cross-family by design — the variant is wired into each
 * `*-carousel.tsx` by passing its family-specific `renderItem` callback
 * (article card, product card, etc.). The block itself stays CMS-agnostic
 * (lives under `blocks/`) and knows nothing about the underlying item
 * shape.
 *
 * Behavior:
 *   - Left-anchored text panel (`md:w-1/3`), reversible via `reversed`.
 *   - Two synced Embla carousels; secondary scrolls one ahead of primary.
 *   - Manual prev/next + dot pagination; disabled at boundaries (no loop).
 *   - Empty-state hint for the no-items case.
 *   - RTL-aware arrow rotation (start/end logical props throughout).
 */

import type { UseEmblaCarouselType } from "embla-carousel-react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";

import { Eyebrow } from "@/components/registry/blocks/eyebrow";
import {
  EmptyHint,
  ListingSectionRoot,
} from "@/components/registry/blocks/listing-section";
import AccentLine from "@/components/registry/graphics/icons/accent-line/accent-line";
import { Button } from "@/components/registry/primitives/core/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/registry/primitives/core/carousel";
import { LibraryIcon } from "@/components/registry/primitives/core/library-icon";
import { ArrowLink } from "@/components/registry/primitives/editables/arrow-link";
import type { LinkSource } from "@/components/registry/primitives/editables/link";
import {
  RichText,
  type RichTextSource,
} from "@/components/registry/primitives/editables/richtext";
import { isEmptySource } from "@/components/registry/primitives/editables/source-normalizers";
import {
  Text,
  type TextSource,
} from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import {
  resolveSectionSurfaceClass,
  SECTION_MAX_WIDTH_CLASSES,
  SECTION_PADDING_Y_CLASSES,
  type SectionSurfaceProps,
} from "@/lib/registry/section-surface";
import { useSitecore } from "@/lib/registry/sitecore";

export interface FeatureSpotlightLayoutProps<T> extends SectionSurfaceProps {
  /** Items to render through the dual carousels. */
  items: T[];
  /** Stable key for each item — used for React keys in both carousels. */
  getKey: (item: T, index: number) => string;
  /** Renders one slide. Same callback drives the primary and secondary. */
  renderItem: (item: T, index: number) => ReactNode;

  /** Editorial heading content. */
  title?: TextSource;
  /** Optional kicker above the title (small-caps eyebrow). */
  eyebrow?: TextSource;
  /** Supporting copy under the title. */
  lead?: TextSource | RichTextSource;
  /** "Explore" / "View all" CTA shown under the lead. */
  cta?: LinkSource;
  /** Hide the small accent rule under the title. */
  hideAccentLine?: boolean;

  /** Flip the text panel to the end side. */
  reversed?: boolean;

  /** Optional aria label for both carousels (defaults to "Spotlight"). */
  ariaLabel?: string;
  /** Fallback message when `items` is empty. */
  emptyStateMessage?: string;

  /** Pass-through styling hook for the outermost section. */
  className?: string;
  id?: string;
  /**
   * Optional family prefix class — e.g. `"articles"`, `"locations"`.
   * Threaded through to the shared `ListingSectionRoot` so the section
   * emits `component <entityName> <dataSlot>` rather than just
   * `component <dataSlot>`.
   */
  entityName?: string;
  /** `data-slot` for instrumentation. Each consumer sets its own. */
  dataSlot?: string;
}

export function FeatureSpotlightLayout<T>({
  items,
  getKey,
  renderItem,
  title,
  eyebrow,
  lead,
  cta,
  hideAccentLine,
  reversed = false,
  ariaLabel = "Spotlight",
  emptyStateMessage,
  colorScheme = "default",
  backgroundIntensity = "subtle",
  paddingY = "auto",
  maxWidth = "auto",
  className,
  id,
  entityName,
  dataSlot,
}: FeatureSpotlightLayoutProps<T>) {
  const [primaryApi, setPrimaryApi] = useState<UseEmblaCarouselType[1] | null>(
    null,
  );
  const [secondaryApi, setSecondaryApi] = useState<
    UseEmblaCarouselType[1] | null
  >(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const itemCount = items.length;
  const hasItems = itemCount > 0;
  const multiple = itemCount > 1;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === itemCount - 1;

  const handleNext = useCallback(() => {
    if (currentIndex >= itemCount - 1) return;
    primaryApi?.scrollNext();
    secondaryApi?.scrollNext();
  }, [primaryApi, secondaryApi, currentIndex, itemCount]);

  const handlePrev = useCallback(() => {
    if (currentIndex <= 0) return;
    primaryApi?.scrollPrev();
    secondaryApi?.scrollPrev();
  }, [primaryApi, secondaryApi, currentIndex]);

  const goToSlide = useCallback(
    (index: number) => {
      primaryApi?.scrollTo(index);
      secondaryApi?.scrollTo((index + 1) % Math.max(1, itemCount));
      setCurrentIndex(index);
    },
    [primaryApi, secondaryApi, itemCount],
  );

  // Keep currentIndex in lockstep with the primary carousel.
  useEffect(() => {
    if (!primaryApi) return;
    const onSelect = () => setCurrentIndex(primaryApi.selectedScrollSnap());
    onSelect();
    primaryApi.on("select", onSelect);
    return () => {
      primaryApi.off("select", onSelect);
    };
  }, [primaryApi]);

  // Secondary kicks off one slide ahead on first load.
  useEffect(() => {
    if (secondaryApi && itemCount > 1) {
      secondaryApi.scrollTo(1);
    }
  }, [secondaryApi, itemCount]);

  const sitecore = useSitecore() as {
    page?: { mode?: { isEditing?: boolean } };
  };
  const isEditing = Boolean(sitecore?.page?.mode?.isEditing);

  const titleEmpty = isEmptySource(title);
  const leadEmpty = isEmptySource(lead);
  const ctaEmpty = isEmptySource(cta);
  const showTitle = !titleEmpty || (isEditing && title != null);
  const showLead = !leadEmpty || (isEditing && lead != null);
  const showCta = !ctaEmpty || (isEditing && cta != null);

  const flexDirectionClass = reversed ? "md:flex-row-reverse" : "md:flex-row";
  const translateClass = multiple
    ? reversed
      ? "lg:-translate-x-3"
      : "lg:translate-x-3"
    : "";
  const gridItemClass = cn(
    "col-span-1",
    !multiple ? "lg:col-span-full" : "lg:col-span-1",
    reversed && "lg:order-2",
  );

  return (
    <ListingSectionRoot
      slot={dataSlot ?? "feature-spotlight"}
      entityName={entityName}
      id={id}
      className={className}
      surfaceClassName={
        resolveSectionSurfaceClass(colorScheme, backgroundIntensity) ||
        "bg-background text-foreground"
      }
    >
      <div
        className={cn(
          "container mx-auto px-4",
          paddingY === "auto"
            ? "py-12 md:py-20"
            : SECTION_PADDING_Y_CLASSES[paddingY],
        )}
      >
        <div
          className={cn(
            "relative overflow-hidden",
            maxWidth !== "auto" && [
              "mx-auto",
              SECTION_MAX_WIDTH_CLASSES[maxWidth],
            ],
          )}
        >
          <div
            className={cn(
              "flex flex-col items-center gap-10",
              flexDirectionClass,
              "w-full",
            )}
          >
            {/* Editorial text panel */}
            <div className="w-full space-y-5 md:w-1/3">
              <Eyebrow value={eyebrow} align="start" isEditing={isEditing} />
              {showTitle && (
                <h2 className="inline-block max-w-md">
                  <Text value={title} isEditing={isEditing} placeholder="Title" />
                  {!hideAccentLine && (
                    <AccentLine className="w-full max-w-xs" />
                  )}
                </h2>
              )}

              {showLead && (
                <div className="max-w-md">
                  <RichText
                    value={lead as RichTextSource}
                    isEditing={isEditing}
                    placeholder="Lead"
                  />
                </div>
              )}

              {showCta && (
                <ArrowLink
                  value={cta}
                  isEditing={isEditing}
                  placeholder="CTA"
                />
              )}
            </div>

            {/* Dual carousel pane */}
            <div className={cn("w-full md:w-2/3 lg:transform", translateClass)}>
              {hasItems ? (
                <div className="relative overflow-hidden">
                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                    {/* Primary (hero) carousel */}
                    <div className={gridItemClass}>
                      <div className="feature-spotlight-primary relative">
                        <Carousel
                          opts={{ loop: false, align: "center" }}
                          setApi={setPrimaryApi}
                          className="w-full"
                          aria-label={ariaLabel}
                        >
                          <CarouselContent>
                            {items.map((item, index) => (
                              <CarouselItem key={getKey(item, index)}>
                                {renderItem(item, index)}
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                        </Carousel>
                      </div>
                    </div>

                    {/* Secondary peek + nav controls */}
                    {multiple && (
                      <div className="lg:col-span-2">
                        <div className="flex h-full flex-col">
                          <div className="feature-spotlight-secondary hidden shrink-0 lg:block">
                            <Carousel
                              opts={{ loop: false, align: "start" }}
                              setApi={setSecondaryApi}
                              className="w-full"
                              aria-label={`${ariaLabel} preview`}
                              style={{
                                paddingInlineStart: "20px",
                                paddingInlineEnd: "20px",
                              }}
                            >
                              <CarouselContent
                                className="flex"
                                style={{ gap: "20px" }}
                              >
                                {items.map((item, index) => (
                                  <CarouselItem
                                    key={`${getKey(item, index)}-peek`}
                                    style={{
                                      flexBasis:
                                        itemCount <= 2
                                          ? "100%"
                                          : "calc(50% - 10px)",
                                    }}
                                  >
                                    {renderItem(item, index)}
                                  </CarouselItem>
                                ))}
                              </CarouselContent>
                            </Carousel>
                          </div>

                          {/* Manual nav + dot pagination */}
                          <div className="mx-auto my-auto">
                            <div className="inline-flex flex-row items-center gap-5">
                              <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                  "text-accent",
                                  isFirst && "cursor-not-allowed opacity-50",
                                )}
                                disabled={isFirst}
                                name="feature-spotlight-previous"
                                aria-label="Previous"
                                onClick={handlePrev}
                              >
                                <LibraryIcon
                                  name="chevron-left"
                                  className="size-4 rtl:rotate-180"
                                  aria-hidden="true"
                                />
                              </Button>

                              <div className="flex flex-wrap justify-center gap-1">
                                {items.map((item, index) => (
                                  <Button
                                    key={`${getKey(item, index)}-dot`}
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                      "size-2 rounded-full p-0",
                                      index === currentIndex
                                        ? "bg-accent"
                                        : "bg-muted/40",
                                    )}
                                    aria-label={`Go to slide ${index + 1}`}
                                    aria-pressed={index === currentIndex}
                                    onClick={() => goToSlide(index)}
                                  />
                                ))}
                              </div>

                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={isLast}
                                className={cn(
                                  "text-accent",
                                  isLast && "cursor-not-allowed opacity-50",
                                )}
                                name="feature-spotlight-next"
                                aria-label="Next"
                                onClick={handleNext}
                              >
                                <LibraryIcon
                                  name="chevron-right"
                                  className="size-4 rtl:rotate-180"
                                  aria-hidden="true"
                                />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <EmptyHint message={emptyStateMessage}>Spotlight</EmptyHint>
              )}
            </div>
          </div>
        </div>
      </div>
    </ListingSectionRoot>
  );
}

export default FeatureSpotlightLayout;
