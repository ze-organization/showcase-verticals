import type { ParamDefinition } from "../lib/registry/sitecore-recipes";

/**
 * Shared styling params for page-details renderings (`article-details@1`
 * and siblings). Spread into each recipe's `params:` — opt-in groups
 * stay off templates whose React shell cannot honor them.
 *
 * Universal surface/heading/prose/media live here. Eyebrow, stacked
 * ImagePosition, two-column MediaColumn, ShowSeparator, TocPlacement,
 * and HideShareWidget are exported separately.
 */

export function detailsSurfaceParams(options?: {
  maxWidthDefault?: string;
}): ParamDefinition[] {
  const maxWidthDefault = options?.maxWidthDefault ?? "standard";
  return [
    {
      name: "ColorScheme",
      shape: "enum",
      default: "none",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Background color scheme for the details shell. `none` (default) keeps the page surface.",
        section: "Style",
        sortOrder: 100,
      },
    },
    {
      name: "BackgroundIntensity",
      shape: "enum",
      default: "subtle",
      sitecore: {
        enumHandle: "background-intensity@1",
        hint: "Saturation of ColorScheme. No-op while ColorScheme is `none`.",
        section: "Style",
        sortOrder: 110,
      },
    },
    {
      name: "PaddingY",
      shape: "enum",
      default: "auto",
      sitecore: {
        enumHandle: "padding-y@1",
        hint: "Vertical padding of the details shell. `auto` (default) keeps the natural responsive ramp.",
        section: "Style",
        sortOrder: 120,
      },
    },
    {
      name: "MaxWidth",
      shape: "enum",
      default: maxWidthDefault,
      sitecore: {
        enumHandle: "max-width@1",
        hint: "Maximum content width inside the details shell. `full` removes the cap (Alignment is then a no-op).",
        section: "Style",
        sortOrder: 130,
      },
    },
    {
      name: "Alignment",
      shape: "enum",
      default: "center",
      sitecore: {
        enumHandle: "alignment@1",
        hint: "Horizontal placement of the constrained column. No-op when MaxWidth is `full`.",
        section: "Style",
        sortOrder: 140,
      },
    },
  ];
}

export const DETAILS_SURFACE_PARAMS = detailsSurfaceParams();

export const DETAILS_HEADING_PARAMS: ParamDefinition[] = [
  {
    name: "HeadingSize",
    shape: "enum",
    default: "default",
    sitecore: {
      enumHandle: "heading-size@1",
      hint: "Title scale.",
      section: "Layout",
      sortOrder: 200,
    },
  },
  {
    name: "TitleWeight",
    shape: "enum",
    default: "default",
    sitecore: {
      enumHandle: "title-weight@1",
      hint: "Title font weight. `default` reads the theme `--heading-weight` token.",
      section: "Layout",
      sortOrder: 210,
    },
  },
  {
    name: "HeadingColor",
    shape: "enum",
    default: "default",
    sitecore: {
      enumHandle: "heading-color@1",
      hint: "Title text color override. `default` inherits the surface foreground.",
      section: "Layout",
      sortOrder: 220,
    },
  },
  {
    name: "HeadingAnimation",
    shape: "enum",
    default: "none",
    sitecore: {
      enumHandle: "heading-animation@1",
      hint: "Title entrance animation. `none` (default) keeps the title static.",
      section: "Layout",
      sortOrder: 230,
    },
  },
  {
    name: "Layout",
    shape: "enum",
    default: "start",
    sitecore: {
      enumHandle: "text-alignment@1",
      hint: "Inline alignment of the title, dek, and body column.",
      section: "Layout",
      sortOrder: 240,
    },
  },
];

export const DETAILS_EYEBROW_PARAMS: ParamDefinition[] = [
  {
    name: "EyebrowColorScheme",
    shape: "enum",
    default: "none",
    sitecore: {
      enumHandle: "color-scheme@1",
      hint: "Kicker color. `none` inherits muted surface text; any other value tints the eyebrow.",
      section: "Layout",
      sortOrder: 260,
    },
  },
  {
    name: "EyebrowStyle",
    shape: "enum",
    default: "text",
    sitecore: {
      enumHandle: "eyebrow-style@1",
      hint: "`text` (default) is small uppercase prose; `badge` is a pill chip.",
      section: "Layout",
      sortOrder: 270,
    },
  },
  {
    name: "EyebrowSize",
    shape: "enum",
    default: "default",
    sitecore: {
      enumHandle: "size@1",
      hint: "Eyebrow text size. `default` keeps the standard kicker scale.",
      section: "Layout",
      sortOrder: 280,
    },
  },
];

export const DETAILS_PROSE_PARAMS: ParamDefinition[] = [
  {
    name: "ProseSize",
    shape: "enum",
    default: "default",
    sitecore: {
      enumHandle: "prose-size@1",
      hint: "Body text size. `default` keeps the details shell's natural `text-lg`.",
      section: "Typography",
      sortOrder: 300,
    },
  },
  {
    name: "ProseLeading",
    shape: "enum",
    default: "default",
    sitecore: {
      enumHandle: "prose-leading@1",
      hint: "Body line-height.",
      section: "Typography",
      sortOrder: 310,
    },
  },
];

export function detailsMediaParams(options?: {
  aspectDefault?: string;
  shapeDefault?: string;
}): ParamDefinition[] {
  return [
    {
      name: "MediaAspect",
      shape: "enum",
      default: options?.aspectDefault ?? "auto",
      sitecore: {
        enumHandle: "media-aspect@1",
        hint: "Lead-image aspect. `auto` keeps this type's natural box (16:9 editorial, 4:5 product, 3:4 person).",
        section: "Media",
        sortOrder: 400,
      },
    },
    {
      name: "MediaShape",
      shape: "enum",
      default: options?.shapeDefault ?? "default",
      sitecore: {
        enumHandle: "media-shape@1",
        hint: "Lead-image framing. `circle` clips to a round headshot (person). `default` keeps the rounded rectangle.",
        section: "Media",
        sortOrder: 410,
      },
    },
    {
      name: "MediaFit",
      shape: "enum",
      default: "cover",
      sitecore: {
        enumHandle: "media-fit@1",
        hint: "How the lead image fills its box. `cover` (default) crops; `contain` shows the whole image.",
        section: "Media",
        sortOrder: 420,
      },
    },
  ];
}

export const DETAILS_MEDIA_PARAMS = detailsMediaParams();

export const DETAILS_STACKED_IMAGE_POSITION: ParamDefinition = {
  name: "ImagePosition",
  shape: "enum",
  default: "above",
  sitecore: {
    enumHandle: "image-position@1",
    hint: "Where the lead image sits on a stacked details page: `above` (default), `below` the heading, or `hidden`.",
    section: "Media",
    sortOrder: 440,
  },
};

export const DETAILS_SPLIT_MEDIA_COLUMN: ParamDefinition = {
  name: "MediaColumn",
  shape: "enum",
  default: "start",
  sitecore: {
    enumHandle: "media-column@1",
    hint: "Which column the lead media occupies: `start` (default), `end`, or `hidden`.",
    section: "Media",
    sortOrder: 440,
  },
};

export const DETAILS_SHOW_SEPARATOR: ParamDefinition = {
  name: "ShowSeparator",
  shape: "boolean",
  default: "false",
  sitecore: {
    type: "checkbox",
    hint: "Render a horizontal rule between the heading region and the body.",
    section: "Layout",
    sortOrder: 250,
  },
};

export const DETAILS_TOC_PLACEMENT: ParamDefinition = {
  name: "TocPlacement",
  shape: "enum",
  default: "end",
  sitecore: {
    enumHandle: "toc-placement@1",
    hint: "Where the on-this-page TOC sits: `end` (default) trails the body; `start` leads it; `hidden` suppresses it.",
    section: "Layout",
    sortOrder: 255,
  },
};

export const DETAILS_HIDE_SHARE: ParamDefinition = {
  name: "HideShareWidget",
  shape: "boolean",
  default: "false",
  sitecore: {
    type: "checkbox",
    hint: "Hide the social share control in the title row.",
    section: "Behavior",
    sortOrder: 900,
  },
};

/** Stacked editorial (article, news): no eyebrow field. */
export const DETAILS_STACKED_EDITORIAL_PARAMS: ParamDefinition[] = [
  ...DETAILS_SURFACE_PARAMS,
  ...DETAILS_HEADING_PARAMS,
  ...DETAILS_PROSE_PARAMS,
  ...detailsMediaParams({ aspectDefault: "16x9" }),
  DETAILS_STACKED_IMAGE_POSITION,
  DETAILS_SHOW_SEPARATOR,
  DETAILS_HIDE_SHARE,
];

/** Article with TOC — stacked editorial plus TocPlacement. */
export const DETAILS_STACKED_TOC_PARAMS: ParamDefinition[] = [
  ...DETAILS_SURFACE_PARAMS,
  ...DETAILS_HEADING_PARAMS,
  DETAILS_TOC_PLACEMENT,
  ...DETAILS_PROSE_PARAMS,
  ...detailsMediaParams({ aspectDefault: "16x9" }),
  DETAILS_STACKED_IMAGE_POSITION,
  DETAILS_SHOW_SEPARATOR,
  DETAILS_HIDE_SHARE,
];

/** Stacked with eyebrow, no share (service, partner). */
export const DETAILS_STACKED_EYEBROW_PARAMS: ParamDefinition[] = [
  ...DETAILS_SURFACE_PARAMS,
  ...DETAILS_HEADING_PARAMS,
  ...DETAILS_EYEBROW_PARAMS,
  ...DETAILS_PROSE_PARAMS,
  ...detailsMediaParams({ aspectDefault: "16x9" }),
  DETAILS_STACKED_IMAGE_POSITION,
];

/** Two-column with share (destination, event, case-study, offer). */
export const DETAILS_SPLIT_SHARE_PARAMS: ParamDefinition[] = [
  ...DETAILS_SURFACE_PARAMS,
  ...DETAILS_HEADING_PARAMS,
  ...DETAILS_EYEBROW_PARAMS,
  ...DETAILS_PROSE_PARAMS,
  ...DETAILS_MEDIA_PARAMS,
  DETAILS_SPLIT_MEDIA_COLUMN,
  DETAILS_HIDE_SHARE,
];

/** Product — wide shell, 4:5 gallery. */
export const DETAILS_PRODUCT_PARAMS: ParamDefinition[] = [
  ...detailsSurfaceParams({ maxWidthDefault: "wide" }),
  ...DETAILS_HEADING_PARAMS,
  ...DETAILS_EYEBROW_PARAMS,
  ...DETAILS_PROSE_PARAMS,
  ...detailsMediaParams({ aspectDefault: "4x5" }),
  DETAILS_SPLIT_MEDIA_COLUMN,
  DETAILS_HIDE_SHARE,
];

/** Person — 3:4 circle headshot, no share. */
export const DETAILS_PERSON_PARAMS: ParamDefinition[] = [
  ...DETAILS_SURFACE_PARAMS,
  ...DETAILS_HEADING_PARAMS,
  ...DETAILS_EYEBROW_PARAMS,
  ...DETAILS_PROSE_PARAMS,
  ...detailsMediaParams({ aspectDefault: "3x4", shapeDefault: "circle" }),
  DETAILS_SPLIT_MEDIA_COLUMN,
];

/** Two-column, no share (location, job). */
export const DETAILS_SPLIT_NO_SHARE_PARAMS: ParamDefinition[] = [
  ...DETAILS_SURFACE_PARAMS,
  ...DETAILS_HEADING_PARAMS,
  ...DETAILS_EYEBROW_PARAMS,
  ...DETAILS_PROSE_PARAMS,
  ...DETAILS_MEDIA_PARAMS,
  DETAILS_SPLIT_MEDIA_COLUMN,
];

/** Landing collage — shell + heading + eyebrow only. */
export const DETAILS_LANDING_PARAMS: ParamDefinition[] = [
  ...DETAILS_SURFACE_PARAMS,
  ...DETAILS_HEADING_PARAMS,
  ...DETAILS_EYEBROW_PARAMS,
];

/**
 * Axes article-header is missing vs the shared details shell.
 * Do not spread Alignment / Layout — article-header Alignment is text
 * alignment (live content). Do not spread ColorScheme — already declared.
 */
export const DETAILS_ARTICLE_HEADER_ADDITIONS: ParamDefinition[] = [
  {
    name: "BackgroundIntensity",
    shape: "enum",
    default: "subtle",
    sitecore: {
      enumHandle: "background-intensity@1",
      hint: "Saturation of ColorScheme. No-op while ColorScheme is `none`.",
      section: "Layout",
      sortOrder: 155,
    },
  },
  {
    name: "PaddingY",
    shape: "enum",
    default: "auto",
    sitecore: {
      enumHandle: "padding-y@1",
      hint: "Vertical padding of the header band. `auto` keeps the natural spacing.",
      section: "Layout",
      sortOrder: 156,
    },
  },
  {
    name: "MaxWidth",
    shape: "enum",
    sitecore: {
      enumHandle: "max-width@1",
      hint: "Content width cap. When set, wins over UseSectionWrapper. Unset keeps the boolean prose column.",
      section: "Layout",
      sortOrder: 157,
    },
  },
  {
    name: "TitleWeight",
    shape: "enum",
    default: "default",
    sitecore: {
      enumHandle: "title-weight@1",
      hint: "Title font weight. `default` reads the theme `--heading-weight` token.",
      section: "Layout",
      sortOrder: 145,
    },
  },
  {
    name: "HeadingColor",
    shape: "enum",
    default: "default",
    sitecore: {
      enumHandle: "heading-color@1",
      hint: "Title text color override.",
      section: "Layout",
      sortOrder: 146,
    },
  },
  {
    name: "EyebrowSize",
    shape: "enum",
    default: "default",
    sitecore: {
      enumHandle: "size@1",
      hint: "Eyebrow text size.",
      section: "Layout",
      sortOrder: 175,
    },
  },
  {
    name: "ProseSize",
    shape: "enum",
    default: "default",
    sitecore: {
      enumHandle: "prose-size@1",
      hint: "Subtitle / dek text size.",
      section: "Layout",
      sortOrder: 176,
    },
  },
  {
    name: "ProseLeading",
    shape: "enum",
    default: "default",
    sitecore: {
      enumHandle: "prose-leading@1",
      hint: "Subtitle / dek line-height.",
      section: "Layout",
      sortOrder: 177,
    },
  },
  {
    name: "MediaAspect",
    shape: "enum",
    default: "16x9",
    sitecore: {
      enumHandle: "media-aspect@1",
      hint: "Lead-image aspect. `auto` keeps 16:9.",
      section: "Layout",
      sortOrder: 125,
    },
  },
  {
    name: "MediaShape",
    shape: "enum",
    default: "default",
    sitecore: {
      enumHandle: "media-shape@1",
      hint: "Lead-image framing.",
      section: "Layout",
      sortOrder: 126,
    },
  },
  {
    name: "MediaFit",
    shape: "enum",
    default: "cover",
    sitecore: {
      enumHandle: "media-fit@1",
      hint: "How the lead image fills its box.",
      section: "Layout",
      sortOrder: 127,
    },
  },
];
