/**
 * Parsers and class maps for page-details styling params.
 *
 * Details renderings use `sitecorePassthrough`, so Layout Service
 * params stay PascalCase (`params.ColorScheme`). Do not camelCase here.
 */

import {
  type HeadingAnimation,
  type HeadingSize,
  parseHeadingAnimation,
  parseHeadingSize,
} from "@/components/registry/blocks/section-heading.parsers";
import {
  MEDIA_ASPECT_CLASSES,
  type CardMediaAspect,
  parseOptionalCardMediaAspect,
} from "@/components/registry/components/cards-and-lists/_media-aspect";
import { cn } from "@/lib/registry/cn";
import { mediaFitClass } from "@/lib/registry/media-fit";
import {
  MEDIA_SHAPE_CLASSES,
  parseOptionalMediaShape,
} from "@/lib/registry/media-shape";
import {
  type AlignmentValue,
  headingColorClass,
  isEnabled,
  parseAlignment,
  parseHeadingColor,
  parseProseLeading,
  parseProseSize,
  proseLeadingClass,
  proseSizeClass,
} from "@/lib/registry/param-parsers";
import {
  parseSectionBackgroundIntensity,
  parseSectionColorScheme,
  parseSectionMaxWidth,
  parseSectionPaddingY,
  resolveSectionSurfaceClass,
  SECTION_MAX_WIDTH_CLASSES,
  SECTION_PADDING_Y_CLASSES,
  type SectionMaxWidth,
  type SectionPaddingY,
} from "@/lib/registry/section-surface";

export type DetailsTextAlign = "start" | "center" | "end";
export type DetailsImagePosition = "above" | "below" | "hidden";
export type DetailsMediaColumn = "start" | "end" | "hidden";
export type DetailsTocPlacement = "start" | "end" | "hidden";
export type DetailsTitleWeight =
  | "default"
  | "light"
  | "regular"
  | "semibold"
  | "bold"
  | "heavy";

export interface DetailsShellParams {
  ColorScheme?: string;
  BackgroundIntensity?: string;
  PaddingY?: string;
  MaxWidth?: string;
  Alignment?: string;
  HeadingSize?: string;
  TitleWeight?: string;
  HeadingColor?: string;
  HeadingAnimation?: string;
  Layout?: string;
  EyebrowColorScheme?: string;
  EyebrowStyle?: string;
  EyebrowSize?: string;
  ProseSize?: string;
  ProseLeading?: string;
  MediaAspect?: string;
  MediaShape?: string;
  MediaFit?: string;
  ImagePosition?: string;
  MediaColumn?: string;
  ShowSeparator?: string;
  TocPlacement?: string;
  HideShareWidget?: string;
  styles?: string;
  RenderingIdentifier?: string;
  DynamicPlaceholderId?: string;
}

const COLUMN_ALIGNMENT_CLASSES: Record<AlignmentValue, string> = {
  start: "me-auto",
  center: "mx-auto",
  end: "ms-auto",
};

const TEXT_ALIGN_CLASSES: Record<DetailsTextAlign, string> = {
  start: "text-start",
  center: "text-center",
  end: "text-end",
};

const TITLE_WEIGHT_CLASSES: Record<DetailsTitleWeight, string> = {
  default: "font-(--heading-weight,600)",
  light: "font-light",
  regular: "font-normal",
  semibold: "font-semibold",
  bold: "font-bold",
  heavy: "font-extrabold",
};

const TITLE_SIZE_CLASSES: Record<HeadingSize, string> = {
  "text-banner": "font-light text-3xl tracking-tight md:text-5xl lg:text-6xl",
  xl: "text-3xl tracking-tight md:text-5xl lg:text-6xl",
  large: "text-3xl tracking-tight md:text-5xl",
  small: "text-xl tracking-tight md:text-2xl",
  default: "text-2xl tracking-tight md:text-4xl lg:text-5xl",
};

const TITLE_WEIGHT_VALUES: ReadonlySet<DetailsTitleWeight> = new Set([
  "default",
  "light",
  "regular",
  "semibold",
  "bold",
  "heavy",
]);

/** Natural vertical padding while PaddingY is `auto` — the pre-token ramp. */
export const DETAILS_AUTO_PADDING_Y_CLASS = "py-6 @[768px]:py-11";

export function parseDetailsTextAlign(
  value: string | undefined,
  fallback: DetailsTextAlign = "start",
): DetailsTextAlign {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "centered" || normalized === "center") return "center";
  if (normalized === "end") return "end";
  if (normalized === "start") return "start";
  return fallback;
}

export function parseDetailsImagePosition(
  value: string | undefined,
  fallback: DetailsImagePosition = "above",
): DetailsImagePosition {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "below" || normalized === "hidden") return normalized;
  if (normalized === "above") return "above";
  return fallback;
}

export function parseDetailsMediaColumn(
  value: string | undefined,
  fallback: DetailsMediaColumn = "start",
): DetailsMediaColumn {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "end" || normalized === "hidden") return normalized;
  if (normalized === "start") return "start";
  return fallback;
}

export function parseDetailsTocPlacement(
  value: string | undefined,
  fallback: DetailsTocPlacement = "end",
): DetailsTocPlacement {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "start" || normalized === "hidden") return normalized;
  if (normalized === "end") return "end";
  return fallback;
}

export function parseDetailsTitleWeight(
  value: string | undefined,
  fallback: DetailsTitleWeight = "default",
): DetailsTitleWeight {
  const normalized = value?.trim().toLowerCase() as DetailsTitleWeight | undefined;
  return normalized && TITLE_WEIGHT_VALUES.has(normalized)
    ? normalized
    : fallback;
}

export function detailsTitleClass(params: DetailsShellParams | undefined): string {
  const size = parseHeadingSize(params?.HeadingSize, "default");
  const weight = parseDetailsTitleWeight(params?.TitleWeight);
  const color = headingColorClass(parseHeadingColor(params?.HeadingColor));
  return cn(TITLE_SIZE_CLASSES[size], TITLE_WEIGHT_CLASSES[weight], color);
}

export function detailsTextAlignClass(
  params: DetailsShellParams | undefined,
): string {
  return TEXT_ALIGN_CLASSES[parseDetailsTextAlign(params?.Layout)];
}

export function detailsProseClass(
  params: DetailsShellParams | undefined,
): string {
  const size = parseProseSize(params?.ProseSize);
  const leading = parseProseLeading(params?.ProseLeading);
  return cn(
    size === "default" ? "text-lg" : proseSizeClass(size),
    proseLeadingClass(leading),
  );
}

export function detailsMediaBoxClass(
  params: DetailsShellParams | undefined,
  fallbackAspect: CardMediaAspect,
): string {
  const aspect =
    parseOptionalCardMediaAspect(params?.MediaAspect) ?? fallbackAspect;
  const shape = parseOptionalMediaShape(params?.MediaShape);
  return cn(
    "w-full overflow-hidden",
    MEDIA_ASPECT_CLASSES[aspect],
    shape ? MEDIA_SHAPE_CLASSES[shape] : "rounded-lg",
  );
}

export function detailsMediaFitClass(
  params: DetailsShellParams | undefined,
): string {
  return cn("h-full w-full", mediaFitClass(params?.MediaFit));
}

export function detailsShowSeparator(
  params: DetailsShellParams | undefined,
): boolean {
  return isEnabled(params?.ShowSeparator);
}

export function detailsHideShare(
  params: DetailsShellParams | undefined,
): boolean {
  return isEnabled(params?.HideShareWidget);
}

export function detailsSplitColClasses(
  mediaColumn: DetailsMediaColumn,
  layout: "gallery" | "aside",
): { mediaClass: string; copyClass: string } {
  if (layout === "gallery") {
    if (mediaColumn === "hidden") {
      return {
        mediaClass: "",
        copyClass: "col-span-12 @[768px]:col-span-8 @[768px]:col-start-3",
      };
    }
    if (mediaColumn === "end") {
      return {
        mediaClass:
          "relative z-10 col-span-12 @[768px]:col-span-5 @[768px]:col-start-8",
        copyClass: "col-span-12 @[768px]:col-span-5 @[768px]:col-start-2",
      };
    }
    return {
      mediaClass:
        "relative z-10 col-span-12 @[768px]:col-span-5 @[768px]:col-start-2",
      copyClass: "col-span-12 @[768px]:col-span-5 @[768px]:col-start-8",
    };
  }
  if (mediaColumn === "hidden") {
    return {
      mediaClass: "",
      copyClass: "col-span-12 @[768px]:col-span-8 @[768px]:col-start-3",
    };
  }
  if (mediaColumn === "end") {
    return {
      mediaClass:
        "relative z-10 col-span-12 @[768px]:col-span-4 @[768px]:col-start-8",
      copyClass: "col-span-12 @[768px]:col-span-6 @[768px]:col-start-2",
    };
  }
  return {
    mediaClass:
      "relative z-10 col-span-12 @[768px]:col-span-4 @[768px]:col-start-2",
    copyClass: "col-span-12 @[768px]:col-span-6 @[768px]:col-start-6",
  };
}

export function detailsHeadingAnimation(
  params: DetailsShellParams | undefined,
): HeadingAnimation {
  return parseHeadingAnimation(params?.HeadingAnimation, "none");
}

export function detailsAnimationEnabled(
  params: DetailsShellParams | undefined,
): boolean {
  return detailsHeadingAnimation(params) !== "none";
}

export function detailsAnimationDirection(
  params: DetailsShellParams | undefined,
): "start" | "end" | "up" {
  const animation = detailsHeadingAnimation(params);
  if (animation === "banner-end") return "start";
  if (animation === "banner-center") return "up";
  return "end";
}

export function detailsPaddingYClass(
  params: DetailsShellParams | undefined,
  autoClass: string = DETAILS_AUTO_PADDING_Y_CLASS,
): string {
  const paddingY: SectionPaddingY = parseSectionPaddingY(
    params?.PaddingY,
    "auto",
  );
  if (paddingY === "auto") return autoClass;
  return SECTION_PADDING_Y_CLASSES[paddingY];
}

export function detailsMaxWidthClass(
  params: DetailsShellParams | undefined,
  fallback: SectionMaxWidth = "standard",
): string {
  const maxWidth = parseSectionMaxWidth(params?.MaxWidth, fallback);
  return SECTION_MAX_WIDTH_CLASSES[maxWidth];
}

export function detailsColumnAlignmentClass(
  params: DetailsShellParams | undefined,
): string {
  const maxWidth = parseSectionMaxWidth(params?.MaxWidth, "standard");
  if (maxWidth === "full") return "";
  return COLUMN_ALIGNMENT_CLASSES[parseAlignment(params?.Alignment, "center")];
}

export function detailsSurfaceClass(
  params: DetailsShellParams | undefined,
): string {
  return resolveSectionSurfaceClass(
    parseSectionColorScheme(params?.ColorScheme, "none"),
    parseSectionBackgroundIntensity(params?.BackgroundIntensity, "subtle"),
  );
}

export {
  parseHeadingSize,
  parseHeadingAnimation,
  parseSectionMaxWidth,
  parseAlignment,
};
