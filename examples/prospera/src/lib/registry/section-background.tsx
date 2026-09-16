import type { ImageSource } from "@/components/registry/primitives/editables/image";
import { NextImage } from "@/components/registry/primitives/editables/image";
import { isEmptySource } from "@/components/registry/primitives/editables/source-normalizers";
import { cn } from "@/lib/registry/cn";

/**
 * Shared section-background vocabulary — the single mapping from the
 * `BackgroundImage` field + `BackgroundScrim` / `BackgroundPosition`
 * rendering params (enums `background-scrim@1` / `background-position@1`)
 * to the absolutely-positioned image layer every section component
 * paints behind its content.
 *
 * Consumed by the photo-banner family (promo, tagline-banner,
 * countdown-banner, subscription-banner, callout-card) and the
 * `section-wrapper` layout shell, so the "text over a full-bleed photo"
 * treatment can't drift between sections. Companion to
 * `section-surface.ts` (the solid-fill vocabulary): a section paints
 * EITHER a color-scheme fill or a background image; when the image is
 * set it wins and the scrim + `sectionBackgroundToneClass` take over
 * legibility duty.
 *
 * The caller's section root must be `relative` (the layer is
 * `absolute inset-0`) and its content must sit above it (the
 * convention is `relative z-10` on the content container).
 */

export type SectionBackgroundScrim = "none" | "light" | "dark";
export type SectionBackgroundPosition = "center" | "top" | "bottom";

const SECTION_BACKGROUND_SCRIMS: readonly SectionBackgroundScrim[] = [
  "none",
  "light",
  "dark",
];

const SECTION_BACKGROUND_POSITIONS: readonly SectionBackgroundPosition[] = [
  "center",
  "top",
  "bottom",
];

/**
 * Parse the `BackgroundScrim` param. Defaults to `dark` — the classic
 * "dimmed photo with light text" treatment every existing background
 * band shipped with before the axis existed.
 */
export function parseSectionBackgroundScrim(
  value: string | undefined,
  fallback: SectionBackgroundScrim = "dark",
): SectionBackgroundScrim {
  const normalized = value?.trim().toLowerCase() as
    | SectionBackgroundScrim
    | undefined;
  return normalized && SECTION_BACKGROUND_SCRIMS.includes(normalized)
    ? normalized
    : fallback;
}

/** Parse the `BackgroundPosition` param (image crop anchor). */
export function parseSectionBackgroundPosition(
  value: string | undefined,
  fallback: SectionBackgroundPosition = "center",
): SectionBackgroundPosition {
  const normalized = value?.trim().toLowerCase() as
    | SectionBackgroundPosition
    | undefined;
  return normalized && SECTION_BACKGROUND_POSITIONS.includes(normalized)
    ? normalized
    : fallback;
}

/** Whether an image source is populated enough to paint. */
export function hasSectionBackgroundImage(
  image: ImageSource | undefined,
): image is ImageSource {
  return image != null && !isEmptySource(image);
}

// Scrim fill — page-level theme tokens (not role tokens) because the
// scrim tones a photo, not a branded surface.
const SCRIM_FILL_CLASS: Record<SectionBackgroundScrim, string> = {
  none: "",
  light: "bg-theme-white",
  dark: "bg-theme-black",
};

/**
 * Text tone for section content over the scrimmed image. `dark` flips
 * the copy to white and applies the `surface-invert` token remap (same
 * mechanism the `black` / bold color schemes use in section-surface)
 * so interior muted text, card slabs, and borders re-tone against the
 * dark photo. `light` is the mirror for whitened images. `none` returns
 * no classes — the author asserts the raw image is legible, so the
 * section keeps whatever tone its surface axis dictates.
 */
const SCRIM_TONE_CLASS: Record<SectionBackgroundScrim, string> = {
  none: "",
  light:
    "text-theme-black surface-invert [--surface-invert-on:var(--color-theme-black)]",
  dark: "text-theme-white surface-invert [--surface-invert-on:var(--color-theme-white)]",
};

export function sectionBackgroundToneClass(
  scrim: SectionBackgroundScrim,
): string {
  return SCRIM_TONE_CLASS[scrim];
}

/**
 * Scrim fill class for bespoke media layers (e.g. promo's background
 * video) that paint their own dim layer but must stay tonally
 * consistent with the shared image treatment.
 */
export function sectionBackgroundScrimFillClass(
  scrim: SectionBackgroundScrim,
): string {
  return SCRIM_FILL_CLASS[scrim];
}

const POSITION_CLASS: Record<SectionBackgroundPosition, string> = {
  center: "object-center",
  top: "object-top",
  bottom: "object-bottom",
};

/** Default scrim alpha when the caller doesn't pin an explicit value. */
export const DEFAULT_SCRIM_OPACITY = 0.45;

export interface SectionBackgroundProps {
  /** Background image source. `null`-safe: empty source renders nothing. */
  image: ImageSource | undefined;
  /** Scrim tone over the image (`BackgroundScrim` param). */
  scrim?: SectionBackgroundScrim;
  /** Image crop anchor (`BackgroundPosition` param). */
  position?: SectionBackgroundPosition;
  /**
   * 0–1 scrim alpha. Internal knob (not an author param) so adopting
   * components keep their historical dim strengths (0.4–0.5).
   */
  scrimOpacity?: number;
  /**
   * Extra backdrop-effect classes (e.g. `backdrop-blur-md` for a
   * frosted treatment) rendered as a full-opacity layer between the
   * image and the tint, so the effect keeps full strength regardless
   * of the scrim alpha — and still applies when `scrim="none"`.
   */
  scrimClassName?: string;
  /** Editing mode passthrough for the NextImage editable. */
  isEditing?: boolean;
  /** Edit-placeholder label for the NextImage editable. */
  placeholder?: string;
}

/**
 * Optional full-bleed background image behind section content —
 * absolutely-positioned `object-cover` image plus a configurable scrim
 * for text legibility. Renders `null` when the image source is empty,
 * so callers can mount it unconditionally without changing the no-image
 * output.
 */
export function SectionBackground({
  image,
  scrim = "dark",
  position = "center",
  scrimOpacity = DEFAULT_SCRIM_OPACITY,
  scrimClassName,
  isEditing,
  placeholder,
}: SectionBackgroundProps) {
  if (!hasSectionBackgroundImage(image)) return null;
  const rawOpacity = Number.isFinite(scrimOpacity)
    ? scrimOpacity
    : DEFAULT_SCRIM_OPACITY;
  const clampedOpacity = Math.max(0, Math.min(1, rawOpacity));
  return (
    <div
      className="absolute inset-0"
      data-slot="section-background"
      data-scrim={scrim}
      data-position={position}
    >
      <NextImage
        value={image}
        className={cn("size-full object-cover", POSITION_CLASS[position])}
        fill
        sizes="100vw"
        isEditing={isEditing}
        placeholder={placeholder}
      />
      {scrimClassName ? (
        <div
          aria-hidden="true"
          className={cn("absolute inset-0", scrimClassName)}
        />
      ) : null}
      {scrim !== "none" ? (
        <div
          aria-hidden="true"
          className={cn("absolute inset-0", SCRIM_FILL_CLASS[scrim])}
          style={{ opacity: clampedOpacity }}
        />
      ) : null}
    </div>
  );
}
