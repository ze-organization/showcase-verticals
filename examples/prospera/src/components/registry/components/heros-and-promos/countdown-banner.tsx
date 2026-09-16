"use client";

import { useEffect, useState } from "react";
import {
  Button,
  type CtaButtonSize,
  type CtaButtonVariant,
} from "@/components/registry/components/ui/cta-button";
import type { ImageSource } from "@/components/registry/primitives/editables/image";
import type { LinkSource } from "@/components/registry/primitives/editables/link";
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
  buttonColorScheme,
  type SurfaceTone,
  surfaceToneClass,
} from "@/lib/registry/color-scheme-classes";
import {
  hasSectionBackgroundImage,
  SectionBackground,
  type SectionBackgroundPosition,
  type SectionBackgroundScrim,
  sectionBackgroundToneClass,
} from "@/lib/registry/section-background";
import type { CmsProps } from "@/lib/registry/sitecore";

/**
 * `countdown-banner` — a banner counting down to a target datetime.
 *
 * Eyebrow + title + description around a live days / hours / minutes /
 * seconds grid, with an optional CTA link and an optional background
 * image. After the target passes it swaps the grid for a configurable
 * "live / started" label. Serves event launches, tournament kick-offs,
 * ticket on-sales, product releases, campaign deadlines — the event is
 * deliberately un-opinionated.
 *
 * Client component with a 1s interval. **SSR-safe**: the first render
 * (server AND first client render) shows deterministic `--`
 * placeholders; the interval only starts after mount, so the hydrated
 * markup always matches the server markup — no hydration mismatch.
 */

export type CountdownBannerAlign = "start" | "center" | "end";
export type CountdownBannerSize = "sm" | "md" | "lg";

export interface CountdownBannerProps extends CmsProps {
  /** Small uppercase line above the title. */
  eyebrow?: TextSource;
  title?: TextSource;
  description?: TextSource;
  /**
   * Target date-time. Accepts an ISO string (the Sitecore datetime
   * field value) via TextSource.
   */
  targetDate?: TextSource;
  /** Label shown in place of the grid once the target has passed. */
  expiredLabel?: TextSource;
  /** Optional CTA link. */
  cta?: LinkSource;
  /**
   * Visual treatment of the CTA — the shared `button-variant@1`
   * vocabulary (`default` / `outline` / `ghost` / `link`). Rendered
   * through the shared CTA Button, so the banner's CTA looks exactly
   * like every other button in the design system.
   */
  ctaVariant?: CtaButtonVariant;
  /**
   * Color scheme of the CTA button (shared `color-scheme@1`
   * vocabulary). Independent of the banner's SurfaceTone; defaults to
   * `white` so the button stays readable on the banner's saturated
   * default band.
   */
  ctaColorScheme?: SurfaceTone;
  /**
   * CTA button size (shared `size@1` scale). `default` keeps the
   * button primitive's natural size.
   */
  ctaSize?: CtaButtonSize;
  /**
   * Leading icon on the CTA label — a name from the shared
   * `icon-name@1` vocabulary. `none` / empty / unknown render no icon.
   */
  ctaIconName?: string;
  /** Optional full-bleed background image behind the banner. */
  backgroundImage?: ImageSource;
  /**
   * Scrim over the background image — `dark` (default) dims the photo
   * and flips the banner text light, `light` washes it and keeps text
   * dark, `none` leaves the image untreated. No effect without a
   * background image.
   */
  backgroundScrim?: SectionBackgroundScrim;
  /** Crop anchor of the background image — `center` / `top` / `bottom`. */
  backgroundPosition?: SectionBackgroundPosition;
  /**
   * Solid color of the banner band — the heros-and-promos bold surface
   * axis. Paints the full-bleed background with the scheme's solid
   * fill and flips text to the matching on-color; `none` keeps the
   * page surface. Visually covered by `backgroundImage` when one is
   * set (text tone then follows `backgroundScrim`).
   */
  surfaceTone?: SurfaceTone;
  /** Inline-axis alignment of the content. */
  align?: CountdownBannerAlign;
  /** Banner scale — padding + type + digit size. */
  size?: CountdownBannerSize;
  className?: string;
}

interface CountdownParts {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  expired: boolean;
}

/** Deterministic pre-mount state — identical on server and client. */
const PENDING_PARTS: CountdownParts = {
  days: "--",
  hours: "--",
  minutes: "--",
  seconds: "--",
  expired: false,
};

function computeParts(target: Date, now: Date): CountdownParts {
  const diffMs = target.getTime() - now.getTime();
  if (!Number.isFinite(diffMs) || diffMs <= 0) {
    return { days: "0", hours: "0", minutes: "0", seconds: "0", expired: true };
  }
  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    days: String(days),
    hours: pad(hours),
    minutes: pad(minutes),
    seconds: pad(seconds),
    expired: false,
  };
}

/**
 * Live countdown state. Starts at the deterministic `--` placeholder
 * and begins ticking only after mount (inside `useEffect`), so SSR and
 * the first client render agree.
 */
function useCountdown(targetIso: string | undefined): CountdownParts {
  const [parts, setParts] = useState<CountdownParts>(PENDING_PARTS);

  useEffect(() => {
    if (!targetIso) return;
    const target = new Date(targetIso);
    if (Number.isNaN(target.getTime())) return;

    const tick = () => setParts(computeParts(target, new Date()));
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [targetIso]);

  return parts;
}

const SIZE_SECTION_CLASS: Record<CountdownBannerSize, string> = {
  sm: "py-8 md:py-10",
  md: "py-12 md:py-16",
  lg: "py-16 md:py-24",
};

const SIZE_TITLE_CLASS: Record<CountdownBannerSize, string> = {
  sm: "text-2xl md:text-3xl",
  md: "text-3xl md:text-4xl",
  lg: "text-4xl md:text-6xl",
};

const SIZE_DIGIT_CLASS: Record<CountdownBannerSize, string> = {
  sm: "text-2xl md:text-3xl",
  md: "text-3xl md:text-5xl",
  lg: "text-4xl md:text-6xl",
};

const ALIGN_CLASS: Record<CountdownBannerAlign, string> = {
  start: "items-start text-start",
  center: "items-center text-center",
  end: "items-end text-end",
};

const UNIT_LABELS: [keyof Omit<CountdownParts, "expired">, string][] = [
  ["days", "Days"],
  ["hours", "Hours"],
  ["minutes", "Minutes"],
  ["seconds", "Seconds"],
];

function CountdownGrid({
  parts,
  size,
}: {
  parts: CountdownParts;
  size: CountdownBannerSize;
}) {
  return (
    <div className="flex gap-3 md:gap-4" role="timer" aria-live="off">
      {UNIT_LABELS.map(([key, label]) => (
        <div
          key={key}
          className="flex min-w-16 flex-col items-center gap-1 rounded-(--card-radius,var(--radius-lg)) bg-theme-black/20 px-3 py-2 backdrop-blur-sm md:min-w-20 md:px-4 md:py-3"
        >
          <span
            className={cn(
              "font-bold font-heading tabular-nums leading-none",
              SIZE_DIGIT_CLASS[size],
            )}
          >
            {parts[key]}
          </span>
          <span className="text-current/70 text-xs uppercase tracking-wide">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Default countdown banner. Reads layout-service data via the sibling
 * `.sitecore.ts` adapter; every field arrives as a flat prop.
 */
export function Default({
  eyebrow,
  title,
  description,
  targetDate,
  expiredLabel,
  cta,
  ctaVariant = "default",
  ctaColorScheme = "white",
  ctaSize = "default",
  ctaIconName,
  backgroundImage,
  backgroundScrim = "dark",
  backgroundPosition = "center",
  surfaceTone = "primary",
  align = "center",
  size = "md",
  className,
  id,
  styles,
  isEditing,
}: CountdownBannerProps) {
  const targetIso = getSourceText(targetDate)?.trim();
  const parts = useCountdown(targetIso);
  const hasBackground = hasSectionBackgroundImage(backgroundImage);
  const expiredText = getSourceText(expiredLabel) ?? "We're live!";

  return (
    <section
      className={cn(
        "component countdown-banner relative flex w-full flex-col overflow-hidden",
        surfaceToneClass(surfaceTone),
        // Same composition as section-wrapper: when a background image
        // is set it fully covers the SurfaceTone fill, so the text tone
        // follows the scrim (dark → light text, light → dark text,
        // none → keep the surface's own tone) regardless of the
        // SurfaceTone pick. Ordered after surfaceToneClass so the
        // scrim's text class wins the twMerge dedupe.
        hasBackground && sectionBackgroundToneClass(backgroundScrim),
        SIZE_SECTION_CLASS[size],
        className,
        styles?.trimEnd(),
      )}
      id={id ?? undefined}
      data-slot="countdown-banner"
      data-expired={parts.expired || undefined}
    >
      <SectionBackground
        image={backgroundImage}
        scrim={backgroundScrim}
        position={backgroundPosition}
        scrimOpacity={0.5}
      />
      <div
        className={cn(
          "container relative z-10 mx-auto flex max-w-4xl flex-col gap-5",
          ALIGN_CLASS[align],
        )}
      >
        {eyebrow && getSourceText(eyebrow) ? (
          <span className="font-medium text-current/80 text-sm uppercase tracking-wide">
            <Text value={eyebrow} tag="span" isEditing={isEditing} />
          </span>
        ) : null}
        <h2
          className={cn(
            "wrap-break-word font-bold font-heading tracking-tight",
            SIZE_TITLE_CLASS[size],
          )}
        >
          <Text
            value={title}
            tag="span"
            isEditing={isEditing}
            placeholder="Title"
          />
        </h2>
        {description && getSourceText(description) ? (
          <p className="max-w-2xl text-pretty text-current/80">
            <Text value={description} tag="span" isEditing={isEditing} />
          </p>
        ) : null}
        {parts.expired ? (
          <span className="inline-flex items-center gap-2 font-bold font-heading text-2xl md:text-3xl">
            <span
              aria-hidden="true"
              className="size-2.5 animate-pulse rounded-full bg-current"
            />
            {expiredLabel ? (
              <Text value={expiredLabel} tag="span" isEditing={isEditing} />
            ) : (
              expiredText
            )}
          </span>
        ) : (
          <CountdownGrid parts={parts} size={size} />
        )}
        {cta && !isEmptySource(cta) ? (
          // Shared CTA Button (link mode) — the banner's CTA carries
          // the exact button vocabulary every other component uses:
          // `button-variant@1` treatment, `color-scheme@1` scheme,
          // `size@1` scale, and an optional `icon-name@1` leading icon.
          <Button
            link={cta}
            variant={ctaVariant}
            colorScheme={buttonColorScheme(ctaColorScheme)}
            size={ctaSize}
            iconName={ctaIconName}
            isEditing={isEditing}
          />
        ) : null}
      </div>
    </section>
  );
}

/**
 * `universal` opts this file into BOTH the server and client component
 * maps the SDK generates, so Sitecore Pages chrome (browser-side) can
 * resolve the export. The file is a real client component (interval
 * state), so the marker also matches its runtime nature.
 */
export const componentType = "universal";
