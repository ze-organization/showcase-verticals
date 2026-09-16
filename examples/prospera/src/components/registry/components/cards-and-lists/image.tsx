import type { ReactNode } from "react";
import { Card } from "@/components/registry/primitives/core/card";
import {
  Image as BareImage,
  type ImageSource,
  NextImage,
} from "@/components/registry/primitives/editables/image";
import {
  Link,
  type LinkSource,
} from "@/components/registry/primitives/editables/link";
import { isEmptySource } from "@/components/registry/primitives/editables/source-normalizers";
import {
  Text,
  type TextSource,
} from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import { surfaceToneClass } from "@/lib/registry/color-scheme-classes";
import { resolveEditingMode } from "@/lib/registry/editing-mode";
import {
  type ButtonSizeValue,
  type CaptionStyleValue,
  parseButtonSize,
  parseCaptionStyle,
  parseColorScheme,
} from "@/lib/registry/param-parsers";
import type { ComponentProps } from "@/lib/registry/sitecore-types";

/** Normalized Image fields: image with optional caption and link. */
export interface ImageFields {
  Image?: ImageSource;
  Caption?: TextSource;
  Link?: LinkSource;
}

export interface ImageBlockProps extends ComponentProps {
  fields: ImageFields;
}

/**
 * `image-framing@1` — figure-level chrome. `rounded` is the historical
 * default (theme card radius), so stored placements without the param
 * keep today's look. Literal classes only — Tailwind's scanner must
 * see every class. `card` has no class here because it renders through
 * the Card primitive instead of a bare div.
 */
export type ImageFraming = "rounded" | "full-bleed" | "card" | "circle";

const IMAGE_FRAMING_CLASSES: Record<ImageFraming, string> = {
  rounded: "overflow-hidden rounded-(--card-radius,var(--radius-lg)) bg-muted",
  "full-bleed": "bg-muted",
  card: "",
  circle: "overflow-hidden rounded-full bg-muted",
};

/**
 * Parse the `Framing` param (`image-framing@1`). Empty and unknown
 * values collapse to `rounded`, the component's default frame.
 */
export function parseImageFraming(value: string | undefined): ImageFraming {
  const normalized = value?.trim().toLowerCase() as ImageFraming | undefined;
  return normalized && normalized in IMAGE_FRAMING_CLASSES
    ? normalized
    : "rounded";
}

/**
 * `size@1` → caption text size. `default` maps to the caption's
 * historical `text-sm`.
 */
const CAPTION_SIZE_CLASSES: Record<ButtonSizeValue, string> = {
  default: "text-sm",
  xs: "text-xs",
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
};

/** Resolve the authored link label (accessible name / never a visual replacement). */
function getLinkLabel(link: LinkSource): string | undefined {
  const nested = (link as { value?: { text?: string; title?: string } }).value;
  const flat = link as { text?: string };
  const label = nested?.text ?? nested?.title ?? flat.text;
  const trimmed = typeof label === "string" ? label.trim() : "";
  return trimmed || undefined;
}

/** Resolve the link href across both stored shapes (LinkField / loose). */
function getLinkHref(link: LinkSource): string | undefined {
  const nested = (link as { value?: { href?: string } }).value;
  const flat = link as { href?: string };
  const href = nested?.href ?? flat.href;
  return typeof href === "string" && href.trim() ? href : undefined;
}

/**
 * Strip the authored text/title from a link source so the Link
 * primitive renders our children (the image) instead of replacing
 * them. The primitive's contract is "authored text wins over
 * `children`" — correct for CTAs, wrong for a media wrapper. This was
 * the "link kills the image" bug: any authored URL text swapped the
 * `<NextImage>` out for a plain text anchor. Pages-chrome `metadata`
 * and every other key survive the spread.
 */
function toMediaLinkValue(link: LinkSource): LinkSource {
  const record = link as Record<string, unknown>;
  const nested = record.value;
  return {
    ...record,
    text: undefined,
    ...(nested && typeof nested === "object"
      ? {
          value: {
            ...(nested as Record<string, unknown>),
            text: undefined,
            title: undefined,
          },
        }
      : {}),
  } as LinkSource;
}

interface ResolvedImageParams {
  framing: ImageFraming;
  captionStyle: Exclude<CaptionStyleValue, "card">;
  captionSizeClass: string;
  /** Solid band pairing (`bg-<X>` + `text-<X>-foreground`) or undefined for no band. */
  bandClass: string | undefined;
}

/**
 * Resolve the param axes, folding the cross-axis cases:
 *
 *   - CaptionStyle `card` (shared `caption-style@1` meaning: image +
 *     caption joined in a bordered panel) upgrades the default
 *     `rounded` framing to `card`; an explicitly non-rounded Framing
 *     wins and the caption falls back to `below`.
 *   - `overlay` inside `circle` framing would clip the band inside the
 *     round mask, so it falls back to `below` (band under the circle).
 */
function resolveImageParams(
  params: ImageBlockProps["params"] | undefined,
  defaultCaptionStyle: CaptionStyleValue,
): ResolvedImageParams {
  const requestedStyle = parseCaptionStyle(
    params?.CaptionStyle,
    defaultCaptionStyle,
  );
  const requestedFraming = parseImageFraming(params?.Framing);
  const framing =
    requestedStyle === "card" && requestedFraming === "rounded"
      ? "card"
      : requestedFraming;
  const captionStyle: Exclude<CaptionStyleValue, "card"> =
    requestedStyle === "card"
      ? "below"
      : requestedStyle === "overlay" && framing === "circle"
        ? "below"
        : requestedStyle;
  const scheme = parseColorScheme(params?.CaptionColorScheme, "none");
  return {
    framing,
    captionStyle,
    captionSizeClass:
      CAPTION_SIZE_CLASSES[parseButtonSize(params?.CaptionSize)],
    // Contract-legal solid pairing per scheme (bg-<X> + text-<X>-foreground,
    // incl. gradient + surface-invert treatments) via the shared tone map.
    bandClass: scheme === "none" ? undefined : surfaceToneClass(scheme),
  };
}

/**
 * Resolve the caption into its placement slot:
 *
 *   - `overlay`: band (or the dark scrim) pinned to the bottom
 *     edge INSIDE the frame.
 *   - `below` + card framing: joined under the image inside the Card.
 *   - `below` + banded (rounded / full-bleed): the band joins the
 *     image inside the frame so its radius clips the band.
 *   - `below` + banded circle: OUTSIDE the round mask so the band is
 *     never clipped; the band carries its own theme radius.
 *   - `below` plain: plain `mt-3` muted prose below the frame.
 */
function buildImageCaption({
  caption,
  captionStyle,
  framing,
  captionSizeClass,
  bandClass,
}: Pick<
  ResolvedImageParams,
  "captionStyle" | "framing" | "captionSizeClass" | "bandClass"
> & { caption: TextSource | undefined }): {
  inFrame: ReactNode;
  belowFrame: ReactNode;
} {
  if (captionStyle === "none" || !caption) {
    return { inFrame: null, belowFrame: null };
  }
  const captionText = <Text value={caption} tag="span" />;

  if (captionStyle === "overlay") {
    return {
      inFrame: (
        <figcaption
          className={cn(
            "absolute inset-x-0 bottom-0 px-4 py-3",
            captionSizeClass,
            bandClass ?? "bg-black/60 text-white",
          )}
          data-slot="image-caption"
        >
          {captionText}
        </figcaption>
      ),
      belowFrame: null,
    };
  }

  if (framing === "card") {
    return {
      inFrame: (
        <figcaption
          className={cn(
            "px-4 py-3",
            captionSizeClass,
            bandClass ?? "text-muted-foreground",
          )}
          data-slot="image-caption"
        >
          {captionText}
        </figcaption>
      ),
      belowFrame: null,
    };
  }

  if (bandClass) {
    const joinsFrame = framing !== "circle";
    const banded = (
      <figcaption
        className={cn(
          !joinsFrame &&
            "mt-3 overflow-hidden rounded-(--card-radius,var(--radius-lg))",
          "px-4 py-2",
          captionSizeClass,
          bandClass,
        )}
        data-slot="image-caption"
      >
        {captionText}
      </figcaption>
    );
    return joinsFrame
      ? { inFrame: banded, belowFrame: null }
      : { inFrame: null, belowFrame: banded };
  }

  return {
    inFrame: null,
    belowFrame: (
      <figcaption
        className={cn("mt-3 text-muted-foreground", captionSizeClass)}
        data-slot="image-caption"
      >
        {captionText}
      </figcaption>
    ),
  };
}

function ImageFigureBase({
  params,
  fields,
  defaultCaptionStyle,
}: ImageBlockProps & { defaultCaptionStyle: CaptionStyleValue }) {
  const { styles, RenderingIdentifier: id } = params ?? {};
  const image =
    fields?.Image && !isEmptySource(fields.Image) ? fields.Image : undefined;
  const caption =
    fields?.Caption && !isEmptySource(fields.Caption)
      ? fields.Caption
      : undefined;
  const link =
    fields?.Link && !isEmptySource(fields.Link) ? fields.Link : undefined;

  if (!image) return null;

  const { framing, captionStyle, captionSizeClass, bandClass } =
    resolveImageParams(params, defaultCaptionStyle);

  const imageEl = (
    <NextImage
      value={image}
      className={
        framing === "circle"
          ? "aspect-square w-full object-cover"
          : "aspect-video w-full object-cover md:aspect-4/3"
      }
      width={800}
      height={450}
    />
  );

  // A link WRAPS the media — link text never replaces the image; it
  // becomes the anchor's accessible name (falling back to the image
  // alt inside the anchor when no text is authored). Text-only links
  // (no href) render no anchor at all.
  const href = link ? getLinkHref(link) : undefined;
  const media =
    link && href ? (
      <Link
        value={toMediaLinkValue(link)}
        aria-label={getLinkLabel(link)}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {imageEl}
      </Link>
    ) : (
      imageEl
    );

  const { inFrame, belowFrame } = buildImageCaption({
    caption,
    captionStyle,
    framing,
    captionSizeClass,
    bandClass,
  });

  const frame =
    framing === "card" ? (
      <Card
        elevation="theme"
        style="outline"
        className="relative w-full gap-0 overflow-hidden p-0"
        data-framing="card"
      >
        {media}
        {inFrame}
      </Card>
    ) : (
      <>
        <div
          className={cn("relative", IMAGE_FRAMING_CLASSES[framing])}
          data-framing={framing}
        >
          {media}
          {inFrame}
        </div>
        {belowFrame}
      </>
    );

  return (
    <figure
      className={cn(
        "component image w-full bg-background text-foreground",
        styles?.trimEnd(),
      )}
      id={id ?? undefined}
      dir="inherit"
      data-slot="image"
    >
      {frame}
    </figure>
  );
}

/**
 * Default variant: image with optional caption (below by default);
 * an optional link wraps the image. Framing / caption axes ride the
 * `Framing`, `CaptionStyle`, `CaptionSize`, `CaptionColorScheme`
 * rendering params.
 */
export function Default(props: ImageBlockProps) {
  return <ImageFigureBase {...props} defaultCaptionStyle="below" />;
}

/**
 * CaptionOverlay variant: caption overlaid at the bottom of the image.
 * Same engine as Default with the caption style defaulting to
 * `overlay` — the `CaptionStyle` param can still override it.
 */
export function CaptionOverlay(props: ImageBlockProps) {
  return <ImageFigureBase {...props} defaultCaptionStyle="overlay" />;
}

/**
 * Simple variant: image only, no caption, no link. Suited for SXA
 * image or decorative use (site logos in the footer partials). Honors
 * the `Framing` param; caption/link fields are intentionally ignored.
 */
export function Simple({ params, fields }: ImageBlockProps) {
  const { styles, RenderingIdentifier: id } = params ?? {};
  const image =
    fields?.Image && !isEmptySource(fields.Image) ? fields.Image : undefined;

  if (!image) return null;

  const framing = parseImageFraming(params?.Framing);
  const imageEl = (
    <NextImage
      value={image}
      className={
        framing === "circle"
          ? "aspect-square w-full object-cover"
          : "aspect-video w-full object-cover md:aspect-4/3"
      }
      width={800}
      height={450}
    />
  );

  return (
    <div
      className={cn(
        "component image w-full bg-background text-foreground",
        styles?.trimEnd(),
      )}
      id={id ?? undefined}
      dir="inherit"
      data-slot="image"
    >
      {framing === "card" ? (
        <Card
          elevation="theme"
          style="outline"
          className="w-full gap-0 overflow-hidden p-0"
          data-framing="card"
        >
          {imageEl}
        </Card>
      ) : (
        <div className={IMAGE_FRAMING_CLASSES[framing]} data-framing={framing}>
          {imageEl}
        </div>
      )}
    </div>
  );
}

/**
 * Logo variant: brand-mark treatment — the image renders at its
 * NATURAL aspect, height-capped and `object-contain`, wrapped in the
 * `Link` field when one is set (conventionally the home page). This is
 * what the stock header experiences place in the header shell's
 * `header-start` slot; `Simple`'s media framing (full-width
 * `aspect-video` crop) turns a logo into a stretched banner there.
 *
 * Renders through the bare, UNOPTIMIZED `<Image>` editable — brand
 * logos come from arbitrary external CDN hosts at generation time (and
 * may be SVG), so no `images.remotePatterns` allowlist entry or
 * `dangerouslyAllowSVG` is needed. Eager + async-decoded: a logo is
 * above the fold. Framing / caption params are intentionally ignored.
 *
 * Never returns null. An empty Image field would otherwise collapse
 * the header-start slot in Pages (empty + drop zone, nothing to
 * click). In editing the empty field still paints an Image chrome so
 * authors can assign media; live, the alt / link text becomes a
 * clickable wordmark until a file is uploaded.
 */
export function Logo({ params, fields, isEditing }: ImageBlockProps) {
  const { styles, RenderingIdentifier: id } = params ?? {};
  const editing = resolveEditingMode({ isEditing, params });
  const image =
    fields?.Image && !isEmptySource(fields.Image) ? fields.Image : undefined;

  // The Link editable's content precedence is `value.text ?? value.title
  // ?? children` — authored link text would REPLACE the logo image
  // (`toMediaLinkValue`'s "link kills the image" bug). Strip via the
  // shared helper; the authored label survives as the accessible name /
  // hover text.
  const link = fields?.Link;
  const href = link ? getLinkHref(link) : undefined;
  const linkLabel = link ? getLinkLabel(link) : undefined;
  const wordmark = logoWordmark(fields?.Image, linkLabel);

  const imageEl = (
    <BareImage
      value={image ?? fields?.Image}
      className="h-9 w-auto max-w-[12rem] object-contain"
      loading="eager"
      decoding="async"
      isEditing={editing}
      placeholder="Logo"
    />
  );

  const mark = image ? (
    imageEl
  ) : editing ? (
    imageEl
  ) : (
    <span className="font-heading text-lg font-semibold tracking-tight text-foreground">
      {wordmark}
    </span>
  );

  // Keep the Sitecore image chrome clickable in Pages — wrapping the
  // empty placeholder in a live <a> steals the assign-media click.
  const wrapLink = Boolean(link && href) && (!editing || Boolean(image));

  return (
    <div
      className={cn(
        "component image image-logo inline-flex min-h-9 min-w-8 w-auto items-center",
        styles?.trimEnd(),
      )}
      id={id ?? undefined}
      dir="inherit"
      data-slot="image-logo"
    >
      {wrapLink && link ? (
        <Link
          value={toMediaLinkValue(link)}
          className="inline-flex shrink-0 items-center"
          aria-label={linkLabel || wordmark}
          title={linkLabel || wordmark}
        >
          {mark}
        </Link>
      ) : (
        mark
      )}
    </div>
  );
}

function logoWordmark(
  image: ImageSource | undefined,
  linkLabel: string | undefined,
): string {
  if (image && typeof image === "object") {
    const nested =
      "value" in image
        ? (image as { value?: { alt?: string } }).value?.alt
        : undefined;
    if (typeof nested === "string" && nested.trim()) return nested.trim();
    const plain = "alt" in image ? (image as { alt?: string }).alt : undefined;
    if (typeof plain === "string" && plain.trim()) return plain.trim();
  }
  if (linkLabel?.trim()) return linkLabel.trim();
  return "Logo";
}

/**
 * `universal` opts this file into BOTH the server and client
 * component maps the SDK generates (component-map.ts +
 * component-map.client.ts). Server-only by default would land
 * here in the server map alone, which means Sitecore Pages chrome
 * (browser-side) cannot look the component up and its named-export
 * variants (Headless, Media, etc.) fail to resolve. No runtime
 * behaviour change: the file stays a plain RSC server component
 * (no useState, no client-only hooks here); the universal marker
 * is purely a generate-map signal.
 */
export const componentType = "universal";
