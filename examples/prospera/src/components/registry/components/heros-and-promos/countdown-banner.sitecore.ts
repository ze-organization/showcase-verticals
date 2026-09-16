/**
 * Sitecore adapter for `countdown-banner`. Unwraps the Sitecore
 * `{ fields, params }` payload into the flat props the React rendering
 * consumes. The Sitecore `datetime` field arrives as a `Field<string>`
 * with an ISO value — passed through as a TextSource; the component
 * parses it client-side.
 */
import type { ImageSource } from "@/components/registry/primitives/editables/image";
import type { LinkSource } from "@/components/registry/primitives/editables/link";
import type { TextSource } from "@/components/registry/primitives/editables/text";
import {
  isSurfaceTone,
  type SurfaceTone,
} from "@/lib/registry/color-scheme-classes";
import {
  parseButtonSize,
  parseButtonVariant,
  parseColorScheme,
} from "@/lib/registry/param-parsers";
import {
  parseSectionBackgroundPosition,
  parseSectionBackgroundScrim,
} from "@/lib/registry/section-background";
import type {
  CountdownBannerAlign,
  CountdownBannerProps,
  CountdownBannerSize,
} from "./countdown-banner";

interface SitecoreCountdownBannerFields {
  Eyebrow?: TextSource;
  Title?: TextSource;
  Description?: TextSource;
  TargetDate?: TextSource;
  ExpiredLabel?: TextSource;
  Cta?: LinkSource;
  BackgroundImage?: ImageSource;
}

interface SitecoreCountdownBannerParams {
  ColorScheme?: string;
  Alignment?: string;
  Size?: string;
  BackgroundScrim?: string;
  BackgroundPosition?: string;
  CtaVariant?: string;
  CtaColorScheme?: string;
  CtaSize?: string;
  CtaIconName?: string;
  RenderingIdentifier?: string;
  styles?: string;
}

const ALIGNS: readonly CountdownBannerAlign[] = ["start", "center", "end"];

// `center` is the banner's real default (and the recipe default);
// anything outside the allow-list falls back to it.
const toAlign = (value: string | undefined): CountdownBannerAlign => {
  const raw = value?.trim().toLowerCase() as CountdownBannerAlign | undefined;
  return raw && ALIGNS.includes(raw) ? raw : "center";
};

// The banner's native scale is sm/md/lg; Size is authored on the shared
// `size@1` enum (default/xs/sm/md/lg/xl), so the outer values alias to
// the nearest native step. `default` = the banner's natural `md` (also
// the fallback for unknown stored values).
const SIZE_ALIAS: Record<string, CountdownBannerSize> = {
  default: "md",
  xs: "sm",
  sm: "sm",
  md: "md",
  lg: "lg",
  xl: "lg",
};

const toSize = (value: string | undefined): CountdownBannerSize =>
  SIZE_ALIAS[value?.trim().toLowerCase() ?? ""] ?? "md";

// The banner's tone fallback is `primary` (a saturated band is its
// identity), so the color-scheme@1 `default` value — and any unknown
// stored pick — aliases to it.
const toSurfaceTone = (value: string | undefined): SurfaceTone => {
  const raw = value?.trim().toLowerCase() ?? "";
  return isSurfaceTone(raw) ? raw : "primary";
};

export function adaptCountdownBannerProps({
  fields,
  params,
}: {
  fields?: SitecoreCountdownBannerFields;
  params?: SitecoreCountdownBannerParams;
}): CountdownBannerProps {
  return {
    eyebrow: fields?.Eyebrow,
    title: fields?.Title,
    description: fields?.Description,
    targetDate: fields?.TargetDate,
    expiredLabel: fields?.ExpiredLabel,
    cta: fields?.Cta,
    // Shared CTA vocabulary — same parsers as cta-button / hero /
    // and normalize inside the shared CTA Button.
    ctaVariant: parseButtonVariant(params?.CtaVariant),
    ctaColorScheme: parseColorScheme(params?.CtaColorScheme, "white"),
    ctaSize: parseButtonSize(params?.CtaSize),
    ctaIconName: params?.CtaIconName,
    backgroundImage: fields?.BackgroundImage,
    backgroundScrim: parseSectionBackgroundScrim(params?.BackgroundScrim),
    backgroundPosition: parseSectionBackgroundPosition(
      params?.BackgroundPosition,
    ),
    surfaceTone: toSurfaceTone(params?.ColorScheme),
    align: toAlign(params?.Alignment),
    size: toSize(params?.Size),
    id: params?.RenderingIdentifier,
    styles: params?.styles,
  };
}

export const Default = adaptCountdownBannerProps;
