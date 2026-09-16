"use client";

// Direct-file imports only — the blocks barrel (and the
// ListingSection/ItemListing machinery) would drag the search/controls
// stack into this item's registryDependencies and blow the new-item
// fan-out cap. A stories rail is a static strip; it hand-rolls the
// section shell from the shared section-surface vocabulary instead.
import { CardNavigate } from "@/components/registry/blocks/card-navigate";
import { SectionHeading } from "@/components/registry/blocks/section-heading";
import {
  Image,
  type ImageSource,
} from "@/components/registry/primitives/editables/image";
import { type LinkSource } from "@/components/registry/primitives/editables/link";
import {
  getSourceText,
  isEmptySource,
} from "@/components/registry/primitives/editables/source-normalizers";
import {
  Text,
  type TextSource,
} from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import {
  parseSectionBackgroundIntensity,
  parseSectionColorScheme,
  parseSectionMaxWidth,
  parseSectionOverlapTop,
  parseSectionPaddingY,
  resolveSectionSurfaceClass,
  SECTION_MAX_WIDTH_CLASSES,
  SECTION_OVERLAP_TOP_CLASSES,
  SECTION_PADDING_Y_CLASSES,
  type SectionSurfaceProps,
} from "@/lib/registry/section-surface";
import {
  parseHeadingLayout,
  parseHeadingSize,
} from "../layout/section-wrapper";

/**
 * `StoriesRail` — a horizontally scrollable row of circular,
 * ring-framed image thumbnails with a short label under each: the
 * Instagram-stories / match-highlights pattern. Every item can wrap in
 * a link (story viewer, highlight reel, player profile).
 *
 * Pure CSS rail: `overflow-x-auto` + scroll-snap, no JS. Thumbs render
 * through the registry editables (`Image` inside a `rounded-full
 * overflow-hidden` div — the avatar-block pattern, NOT
 * AvatarPrimitive.Image, which can't host Sitecore's editable image
 * surface) so Pages inline editing stays intact.
 *
 * Flat props throughout — the Sitecore adapter unwraps fields/params in
 * `stories-rail.sitecore.ts`, so this file is runnable in Storybook /
 * previews with plain values.
 */

export interface StoryRailItem {
  id: string;
  /** Circular thumbnail image. */
  image?: ImageSource;
  /** Short label under the thumb (score, name, topic). */
  label?: TextSource;
  /** Optional destination the whole item links to. */
  link?: LinkSource;
}

/**
 * Ring color role → border class. `neutral` uses the theme's border
 * token (a quiet gray ring) rather than the saturated `neutral` role —
 * role text/fill compositions don't apply to a decorative ring.
 * Literal classes only (Tailwind JIT); see the color-roles skill.
 */
const RING_COLOR_CLASSES = {
  primary: "border-primary",
  secondary: "border-secondary",
  accent: "border-accent",
  neutral: "border-border",
} as const;

export type StoryRailRingColorScheme = keyof typeof RING_COLOR_CLASSES;

/** All legal ring schemes, for adapter `oneOf` parsing. */
export const STORY_RAIL_RING_COLOR_VALUES = Object.keys(
  RING_COLOR_CLASSES,
) as readonly StoryRailRingColorScheme[];

/**
 * `ThumbSize` → thumb diameter + item column width (so labels wrap
 * within the thumb's footprint). Literal classes only (Tailwind JIT).
 */
const THUMB_SIZE_CLASSES = {
  sm: { thumb: "size-16", item: "w-20" },
  md: { thumb: "size-20", item: "w-24" },
  lg: { thumb: "size-24", item: "w-28" },
} as const;

export type StoryRailThumbSize = keyof typeof THUMB_SIZE_CLASSES;

/** All legal thumb sizes, for adapter `oneOf` parsing. */
export const STORY_RAIL_THUMB_SIZE_VALUES = Object.keys(
  THUMB_SIZE_CLASSES,
) as readonly StoryRailThumbSize[];

export interface StoriesRailProps extends SectionSurfaceProps {
  /** Heading content. */
  title?: TextSource;
  lead?: TextSource;
  headingLayout?: string;
  headingSize?: string;

  /** Curated items (the `Items` Treelist, flattened by the adapter). */
  items?: StoryRailItem[];

  /** Ring color role around each thumb. */
  ringColorScheme?: StoryRailRingColorScheme;
  /** Thumb diameter. */
  thumbSize?: StoryRailThumbSize;

  /** Empty-state copy. */
  emptyStateMessage?: TextSource;

  className?: string;
  id?: string;
  isEditing?: boolean;
}

function StoryThumb({
  item,
  ringClass,
  size,
  isEditing,
}: {
  item: StoryRailItem;
  ringClass: string;
  size: (typeof THUMB_SIZE_CLASSES)[StoryRailThumbSize];
  isEditing?: boolean;
}) {
  const labelText = getSourceText(item.label);
  const content = (
    <>
      {/* Ring = outer circle border; the inner rounded-full
          overflow-hidden div hosts the editable Image (avatar-block
          pattern) so editing mode matches the runtime treatment. */}
      <span className={cn("block rounded-full border-2 p-0.5", ringClass)}>
        <span
          className={cn(
            "relative flex items-center justify-center overflow-hidden rounded-full bg-muted",
            size.thumb,
          )}
        >
          <Image
            value={item.image}
            placeholder="Story"
            isEditing={isEditing}
            alt={labelText ?? ""}
            className="size-full object-cover"
          />
        </span>
      </span>
      <span className="line-clamp-2 block w-full text-center text-foreground text-xs">
        <Text
          value={item.label}
          tag="span"
          placeholder="Label"
          isEditing={isEditing}
        />
      </span>
    </>
  );

  const itemClass = cn("flex flex-col items-center gap-1.5", size.item);

  return (
    <CardNavigate
      link={item.link}
      isEditing={isEditing}
      aria-label={labelText || undefined}
      className={cn(itemClass, "rounded-md no-underline hover:no-underline")}
    >
      {content}
    </CardNavigate>
  );
}

/**
 * The scrollable rail. Native CSS overflow + scroll snap — no JS.
 */
export function Default({
  title,
  lead,
  headingLayout,
  headingSize,
  items = [],
  ringColorScheme = "primary",
  thumbSize = "md",
  emptyStateMessage,
  colorScheme,
  backgroundIntensity,
  paddingY,
  maxWidth,
  overlapTop,
  className,
  id,
  isEditing,
}: StoriesRailProps) {
  const ringClass =
    RING_COLOR_CLASSES[ringColorScheme] ?? RING_COLOR_CLASSES.primary;
  const size = THUMB_SIZE_CLASSES[thumbSize] ?? THUMB_SIZE_CLASSES.md;

  // Hand-rolled section shell from the shared section-surface
  // vocabulary — same axes ListingSection resolves, without pulling
  // the listing/search machinery into this item's dependency graph.
  const surfaceClass = resolveSectionSurfaceClass(
    parseSectionColorScheme(
      typeof colorScheme === "string" ? colorScheme : undefined,
    ),
    parseSectionBackgroundIntensity(
      typeof backgroundIntensity === "string" ? backgroundIntensity : undefined,
    ),
  );
  const paddingClass =
    SECTION_PADDING_Y_CLASSES[
      parseSectionPaddingY(typeof paddingY === "string" ? paddingY : undefined)
    ] || "py-8 md:py-12";
  const maxWidthClass =
    SECTION_MAX_WIDTH_CLASSES[
      parseSectionMaxWidth(typeof maxWidth === "string" ? maxWidth : undefined)
    ];
  const overlapClass =
    SECTION_OVERLAP_TOP_CLASSES[
      parseSectionOverlapTop(
        typeof overlapTop === "string" ? overlapTop : undefined,
      )
    ];

  const hasHeading = title != null || lead != null;

  return (
    <section
      id={id ?? undefined}
      data-slot="stories-rail"
      className={cn(
        "component stories-rail w-full",
        surfaceClass,
        paddingClass,
        className,
      )}
    >
      <div
        className={cn("container mx-auto px-4", maxWidthClass, overlapClass)}
      >
        {hasHeading ? (
          <SectionHeading
            title={title}
            lead={lead}
            layout={parseHeadingLayout(
              headingLayout,
              "start-with-section-divider",
            )}
            headingOptions={{
              size: parseHeadingSize(headingSize, "default"),
            }}
          />
        ) : null}
        {items.length > 0 ? (
          <ul
            className="m-0 flex snap-x list-none gap-4 overflow-x-auto ps-0 pb-2"
            aria-label="Stories"
          >
            {items.map((item) => (
              <li key={item.id} className="shrink-0 snap-start">
                <StoryThumb
                  item={item}
                  ringClass={ringClass}
                  size={size}
                  isEditing={isEditing}
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-md border border-border border-dashed p-6 text-center text-muted-foreground text-sm">
            {emptyStateMessage != null && !isEmptySource(emptyStateMessage) ? (
              <Text
                value={emptyStateMessage}
                tag="span"
                isEditing={isEditing}
              />
            ) : (
              "Stories"
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default Default;

/**
 * `universal` opts this file into BOTH the server and client component
 * maps the SDK generates, so Sitecore Pages chrome (browser-side) can
 * resolve the named-export variant. Purely a generate-map signal.
 */
export const componentType = "universal";
