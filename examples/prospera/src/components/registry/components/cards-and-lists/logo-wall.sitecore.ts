/**
 * Sitecore adapter for `logo-wall`. Unwraps the Sitecore
 * `{ fields, params }` payload into the flat props the React rendering
 * consumes, and normalises the curated `Logos` Treelist (flattened by
 * the component map) into `LogoWallItem[]`.
 *
 * The same adapter fans out to every variant export (Default / Strip /
 * Grid) so `withSitecore` applies it uniformly — mirrors the pattern
 * in `status-list.sitecore.ts`.
 */
import type { ImageSource } from "@/components/registry/primitives/editables/image";
import type { LinkSource } from "@/components/registry/primitives/editables/link";
import type { RichTextSource } from "@/components/registry/primitives/editables/richtext";
import type { TextSource } from "@/components/registry/primitives/editables/text";
import {
  isSurfaceTone,
  type SurfaceTone,
} from "@/lib/registry/color-scheme-classes";
import { linkedItemFields } from "@/lib/registry/placeholder-children";
import { parseSectionPaddingY } from "@/lib/registry/section-surface";
import type { LogoWallItem, LogoWallProps, LogoWallSize } from "./logo-wall";

interface SitecoreLogoItem {
  id: string;
  url?: string;
  fields?: {
    Logo?: ImageSource;
    Name?: TextSource;
    Description?: RichTextSource;
    Link?: LinkSource;
  };
}

interface SitecoreLogoWallFields {
  Title?: TextSource;
  Eyebrow?: TextSource;
  Logos?: SitecoreLogoItem[];
}

interface SitecoreLogoWallParams {
  Monochrome?: string;
  Columns?: string;
  Size?: string;
  Marquee?: string;
  ColorScheme?: string;
  PaddingY?: string;
  RenderingIdentifier?: string;
  styles?: string;
}

const SIZES: readonly LogoWallSize[] = ["sm", "md", "lg"];

const toSize = (value: string | undefined): LogoWallSize => {
  const raw = value?.trim().toLowerCase() as LogoWallSize | undefined;
  return raw && SIZES.includes(raw) ? raw : "md";
};

const toColumns = (value: string | undefined): 3 | 4 | 5 | 6 => {
  const n = Number.parseInt((value ?? "").trim(), 10);
  return n === 3 || n === 4 || n === 6 ? n : 5;
};

const toSurfaceTone = (value: string | undefined): SurfaceTone => {
  const raw = value?.trim().toLowerCase() ?? "";
  return isSurfaceTone(raw) ? raw : "none";
};

const parseBool = (value?: string) => value === "1" || value === "true";

function adaptItems(items: SitecoreLogoItem[] | undefined): LogoWallItem[] {
  if (!items?.length) return [];
  return items.map((item, i) => {
    // Hoist-tolerant: installed starters can deliver linked items with
    // `fields` already flattened onto the item (see linkedItemFields).
    const fields = linkedItemFields(item);
    return {
      id: item.id ?? `logo-${i}`,
      logo: fields?.Logo,
      name: fields?.Name,
      description: fields?.Description,
      link: fields?.Link,
    };
  });
}

export function adaptLogoWallProps({
  fields,
  params,
}: {
  fields?: SitecoreLogoWallFields;
  params?: SitecoreLogoWallParams;
}): LogoWallProps {
  return {
    title: fields?.Title,
    eyebrow: fields?.Eyebrow,
    items: adaptItems(fields?.Logos),
    // No React-side default for boolean params — undefined means
    // "Sitecore Standard Values drives it"; the component defaults.
    monochrome:
      params?.Monochrome === undefined
        ? undefined
        : parseBool(params.Monochrome),
    columns: toColumns(params?.Columns),
    size: toSize(params?.Size),
    marquee:
      params?.Marquee === undefined ? undefined : parseBool(params.Marquee),
    surfaceTone: toSurfaceTone(params?.ColorScheme),
    paddingY: parseSectionPaddingY(params?.PaddingY),
    id: params?.RenderingIdentifier,
    styles: params?.styles,
  };
}

export const Default = adaptLogoWallProps;
export const Strip = adaptLogoWallProps;
export const Grid = adaptLogoWallProps;
export const RecognitionRows = adaptLogoWallProps;
