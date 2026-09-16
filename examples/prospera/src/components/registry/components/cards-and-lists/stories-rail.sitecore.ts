/**
 * Sitecore adapter for `stories-rail@1`. Unwraps the `{fields, params}`
 * layout-service envelope into the flat `StoriesRailProps` shape the
 * React variant consumes, and normalises the curated `Items` Treelist
 * (flattened by the component map) into `StoryRailItem[]`.
 */
import type { ImageSource } from "@/components/registry/primitives/editables/image";
import type { LinkSource } from "@/components/registry/primitives/editables/link";
import type { TextSource } from "@/components/registry/primitives/editables/text";
import { linkedItemFields } from "@/lib/registry/placeholder-children";
import { adaptSectionSurfaceParams } from "@/lib/registry/section-surface";
import {
  STORY_RAIL_RING_COLOR_VALUES,
  STORY_RAIL_THUMB_SIZE_VALUES,
  type StoriesRailProps,
  type StoryRailItem,
  type StoryRailRingColorScheme,
  type StoryRailThumbSize,
} from "./stories-rail";

interface SitecoreStoryItem {
  id: string;
  url?: string;
  fields?: {
    Image?: ImageSource;
    Label?: TextSource;
    Link?: LinkSource;
  };
}

export interface SitecoreStoriesRailFields {
  Title?: TextSource;
  Lead?: TextSource;
  Items?: SitecoreStoryItem[];
}

export interface SitecoreStoriesRailParams {
  HeadingLayout?: string;
  HeadingSize?: string;
  RingColorScheme?: string;
  ThumbSize?: string;

  /** Section surface (shared card-list base params). */
  ColorScheme?: string;
  BackgroundIntensity?: string;
  PaddingY?: string;
  MaxWidth?: string;
  OverlapTop?: string;

  RenderingIdentifier?: string;
  styles?: string;
}

const oneOf = <T extends string>(
  value: string | undefined,
  allowed: readonly T[],
  fallback: T,
): T => {
  const normalized = value?.trim().toLowerCase() as T | undefined;
  return normalized && allowed.includes(normalized) ? normalized : fallback;
};

function adaptItems(items: SitecoreStoryItem[] | undefined): StoryRailItem[] {
  if (!items?.length) return [];
  return items.map((item, i) => {
    // Hoist-tolerant: installed starters can deliver linked items with
    // `fields` already flattened onto the item (see linkedItemFields).
    const fields = linkedItemFields(item);
    return {
      id: item.id ?? `story-${i}`,
      image: fields?.Image,
      label: fields?.Label,
      link: fields?.Link,
    };
  });
}

export function adaptStoriesRailProps({
  fields,
  params,
}: {
  fields?: SitecoreStoriesRailFields;
  params?: SitecoreStoriesRailParams;
}): StoriesRailProps {
  return {
    title: fields?.Title,
    lead: fields?.Lead,
    items: adaptItems(fields?.Items),
    headingLayout: params?.HeadingLayout,
    headingSize: params?.HeadingSize,
    ringColorScheme: oneOf<StoryRailRingColorScheme>(
      params?.RingColorScheme,
      STORY_RAIL_RING_COLOR_VALUES,
      "primary",
    ),
    thumbSize: oneOf<StoryRailThumbSize>(
      params?.ThumbSize,
      STORY_RAIL_THUMB_SIZE_VALUES,
      "md",
    ),
    ...adaptSectionSurfaceParams(params),
    id: params?.RenderingIdentifier,
    className: params?.styles,
  };
}

export const Default = adaptStoriesRailProps;
