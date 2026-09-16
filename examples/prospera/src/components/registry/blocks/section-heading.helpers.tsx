"use client";

import { type ReactNode, useEffect, useState } from "react";
import { Eyebrow } from "@/components/registry/blocks/eyebrow";
import AccentLine from "@/components/registry/graphics/icons/accent-line/accent-line";
import { AnimatedSection } from "@/components/registry/primitives/animations/animated-section";
import {
  TypographyH1,
  TypographyH2,
  TypographyH3,
  TypographyH4,
} from "@/components/registry/primitives/core/typography";
import { isEmptySource } from "@/components/registry/primitives/editables/source-normalizers";
import {
  RichText,
  type RichTextSource,
} from "@/components/registry/primitives/editables/richtext";
import {
  Text,
  type TextSource,
} from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import { useSitecore } from "@/lib/registry/sitecore";

// Heading-shape types and pure parsers live in `section-heading.parsers`
// (NOT `'use client'`) so server components can use them without
// crossing the RSC boundary. Re-exported here so existing client-side
// callers (`section-heading.tsx`, `section-wrapper.helpers.tsx`, and
// the SXA-aware `section-wrapper`) keep their single import surface.
export type {
  AccentLineColorValue,
  BandHeadingPlacement,
  HeadingAnimation,
  HeadingLayout,
  HeadingLevel,
  HeadingSize,
  ListingHeadingInput,
  SectionHeadingAxisProps,
  SectionHeadingParams,
  SplitFooterAlignment,
} from "./section-heading.parsers";
export {
  accentLineColorClasses,
  adaptSectionHeadingParams,
  BAND_INLINE_HEADING_GRID_CLASS,
  parseAccentLineColor,
  parseBandHeadingPlacement,
  parseHeadingAnimation,
  parseHeadingLayout,
  parseHeadingLevel,
  parseHeadingSize,
  resolveListingHeading,
} from "./section-heading.parsers";

import type {
  HeadingAnimation,
  HeadingLayout,
  HeadingLevel,
  HeadingSize,
  SplitFooterAlignment,
} from "./section-heading.parsers";
import {
  accentLineColorClasses,
  parseAccentLineColor,
} from "./section-heading.parsers";

// Map a parsed `HeadingLevel` to the matching `TypographyHn` primitive.
// Keeps the level→tag mapping in one place so every render site below
// stays a single `<TitleTag>` swap.
const TYPOGRAPHY_BY_LEVEL: Record<
  HeadingLevel,
  | typeof TypographyH1
  | typeof TypographyH2
  | typeof TypographyH3
  | typeof TypographyH4
> = {
  h1: TypographyH1,
  h2: TypographyH2,
  h3: TypographyH3,
  h4: TypographyH4,
};

interface SectionWrapperProps {
  title?: TextSource;
  lead?: TextSource | RichTextSource;
  /**
   * Pages editing — keep empty Title / Lead slots mounted. Falls back
   * to `useSitecore().page.mode.isEditing` so listing shells do not
   * have to thread the flag through every heading bag.
   */
  isEditing?: boolean;
  /**
   * Optional kicker line above the title — the editorial "eyebrow"
   * treatment, rendered through the shared `Eyebrow` block (small-caps
   * text mode) and aligned with the heading layout (centered layouts
   * center it; start layouts start-align it). Renders nothing when the
   * source is empty, so callers can thread it unconditionally.
   */
  eyebrow?: TextSource;
  layout?: HeadingLayout;
  /**
   * Inner content-width treatment. When `true` (default) the body
   * renders inside a centered, prose-width container (`mx-auto
   * max-w-prose`). When `false`, the body fills its parent's full
   * width. Accepts Sitecore string-boolean shapes; falsy values
   * resolve via the strict allow-list.
   *
   * This is the single source of truth for "contained vs full-width"
   * across every component that uses SectionWrapper (content-block,
   * accordion-block, tabs-block, …). Wrapping components surface a
   * `UseSectionWrapper` rendering parameter that pipes straight
   * through to this prop.
   */
  useSectionWrapper?: string | boolean;
  children?: ReactNode;
  footer?: ReactNode;
  splitFooterAlignment?: SplitFooterAlignment;
  wrapperClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  sectionContainerClassName?: string;
  centeredContainerClassName?: string;
  sectionTitleClassName?: string;
  centeredTitleClassName?: string;
  sectionLeadClassName?: string;
  centeredLeadClassName?: string;
  headingOptions?: {
    animation?: HeadingAnimation;
    size?: HeadingSize;
    /**
     * Semantic heading tag for the title slot. Defaults to `h2` to
     * match the historical hardcoded `<TypographyH2>` — existing
     * callers don't need to thread it. Affects only the DOM element;
     * `size` continues to drive the typographic scale.
     */
    level?: HeadingLevel;
    /**
     * Extra Tailwind class merged onto the title element — used for
     * heading text color overrides (e.g. `text-accent`). Kept as a
     * raw class string so callers can use any "role text on page"
     * composition without this file re-deriving the role enum.
     */
    titleClassName?: string;
    /**
     * Raw `AccentLineColor` rendering param (color-scheme@1). Recolors
     * the accent scribble AND the section-divider hairline on layouts
     * that render them. `default` / unset inherits today's colors
     * (scribble follows the `currentColor` chain — `text-accent` at
     * the standalone section-wrapper root; divider stays
     * `border-border`).
     */
    accentLineColor?: string;
    /**
     * Styling for the eyebrow slot (raw Sitecore param strings).
     * `colorScheme` binds color-scheme@1, `style` binds
     * eyebrow-style@1 (`text`/`badge`, plus the `eyebrow`/`pill`
     * aliases), `size` binds size@1. Unset keeps the shared Eyebrow
     * block's defaults.
     */
    eyebrow?: {
      colorScheme?: string;
      style?: string;
      size?: string;
    };
    classes?: {
      sectionContainerClassName?: string;
      centeredContainerClassName?: string;
      sectionTitleClassName?: string;
      centeredTitleClassName?: string;
      sectionLeadClassName?: string;
      centeredLeadClassName?: string;
    };
  };
}

// Strict allow-list — matches the boolean-rendering-param convention
// (`isEnabled`) used by every other component. Empty / missing /
// unknown values coerce to false so an unchecked Sitecore checkbox
// reliably turns off the contained treatment.
const isEnabledStrict = (value: string | boolean | undefined): boolean => {
  if (typeof value === "boolean") return value;
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return ["1", "true", "yes", "on", "enabled"].includes(normalized);
};

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const prefersReducedMotionNow = (): boolean => {
  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return false;
  }
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
};

// Subscribes to the OS reduced-motion preference. Keeps the matchMedia
// subscription (with the addListener fallback for Safari < 14) out of
// SectionWrapper's body.
function usePrefersReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(prefersReducedMotionNow);
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return;
    }
    const mq = window.matchMedia(REDUCED_MOTION_QUERY);
    setReducedMotion(mq.matches);
    const handler = () => setReducedMotion(mq.matches);
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
    mq.addListener(handler);
    return () => mq.removeListener(handler);
  }, []);
  return reducedMotion;
}

type ResolvedHeadingClasses = {
  sectionContainerClassName?: string;
  centeredContainerClassName?: string;
  sectionTitleClassName?: string;
  centeredTitleClassName?: string;
  sectionLeadClassName?: string;
  centeredLeadClassName?: string;
};

// `headingOptions.classes.*` (the structured override bag) takes
// precedence over the equivalent flat prop; each slot falls back to the
// flat prop when the override is absent.
const resolveHeadingClasses = (
  headingOptions: SectionWrapperProps["headingOptions"],
  flat: ResolvedHeadingClasses,
): ResolvedHeadingClasses => {
  const overrides = headingOptions?.classes;
  return {
    sectionContainerClassName:
      overrides?.sectionContainerClassName ?? flat.sectionContainerClassName,
    centeredContainerClassName:
      overrides?.centeredContainerClassName ?? flat.centeredContainerClassName,
    sectionTitleClassName:
      overrides?.sectionTitleClassName ?? flat.sectionTitleClassName,
    centeredTitleClassName:
      overrides?.centeredTitleClassName ?? flat.centeredTitleClassName,
    sectionLeadClassName:
      overrides?.sectionLeadClassName ?? flat.sectionLeadClassName,
    centeredLeadClassName:
      overrides?.centeredLeadClassName ?? flat.centeredLeadClassName,
  };
};

const SPLIT_LAYOUTS = new Set<HeadingLayout>([
  "split-start",
  "split-end",
  "split-start-separator",
  "split-end-separator",
  "split-start-accent-line",
  "split-end-accent-line",
]);

const END_SPLIT_LAYOUTS = new Set<HeadingLayout>([
  "split-end",
  "split-end-separator",
  "split-end-accent-line",
]);

// Map a heading-animation token to the title's entrance direction. See
// the long comment near the call site for the axis semantics.
const titleAnimationDirection = (
  animation: HeadingAnimation,
): "start" | "up" | "end" => {
  if (animation === "banner-end") return "start";
  if (animation === "banner-center") return "up";
  return "end";
};

// Five meaningfully distinct heading sizes. `text-banner` keeps its
// oversized "hero band" treatment; `small | default | large | xl` form
// a regular progression for typical section headings. `xl` (the
// "strong headline block" scale real sites pair with an eyebrow)
// intentionally declares no font-weight utility so the TypographyHn
// base's `font-(--heading-weight,600)` theme token stays in charge.
const headingSizeClassFor = (size: HeadingSize): string => {
  if (size === "text-banner") {
    return "font-normal text-4xl text-box-trim-both-baseline tracking-tight md:text-5xl lg:text-6xl";
  }
  if (size === "xl") return "text-4xl tracking-tight md:text-5xl";
  if (size === "large") return "font-semibold text-3xl md:text-4xl";
  if (size === "small") return "font-semibold text-lg md:text-xl";
  return "font-semibold text-2xl md:text-3xl";
};

// Lead/subtitle scale follows the title scale proportionally so a
// large headline never sits over visibly undersized supporting copy.
// `default` stays `text-base` — byte-identical to the pre-axis lead.
const headingLeadSizeClassFor = (size: HeadingSize): string => {
  if (size === "text-banner" || size === "xl") return "text-lg md:text-xl";
  if (size === "large") return "text-lg";
  if (size === "small") return "text-sm";
  return "text-base";
};

// Shared animation/render config threaded from SectionWrapper into the
// per-layout heading builders. Keeps each builder a pure function of
// content + resolved styling, so the four layout branches collapse to
// small, near-declarative bodies.
type HeadingRenderConfig = {
  title?: TextSource;
  lead?: TextSource | RichTextSource;
  eyebrow?: TextSource;
  hasTitle: boolean;
  hasLead: boolean;
  hasEyebrow: boolean;
  isEditing: boolean;
  TitleTag: (typeof TYPOGRAPHY_BY_LEVEL)[HeadingLevel];
  headingSizeClass: string;
  leadSizeClass: string;
  resolvedTitleClassName: string;
  titleDirection: "start" | "up" | "end";
  leadDirection: "up" | "down";
  headingAnimationReducedMotion: boolean;
  /** `text-<role>` for the accent scribble ("" = inherit currentColor). */
  accentLineClassName: string;
  /** `border-<role>` for the section-divider hairline ("" = border-border). */
  dividerClassName: string;
  /** Raw eyebrow styling params threaded to the shared Eyebrow block. */
  eyebrowOptions?: {
    colorScheme?: string;
    style?: string;
    size?: string;
  };
};

// Eyebrow slot rendered above the title — shared across every layout.
// Alignment follows the heading layout (centered layouts pass
// `center`). No entrance animation: the kicker anchors the block while
// the title/lead animate around it.
function HeadingEyebrow({
  cfg,
  align,
}: {
  cfg: HeadingRenderConfig;
  align: "start" | "center";
}) {
  if (!(cfg.hasEyebrow && cfg.eyebrow)) return null;
  return (
    <Eyebrow
      value={cfg.eyebrow}
      align={align}
      colorScheme={cfg.eyebrowOptions?.colorScheme}
      style={cfg.eyebrowOptions?.style}
      size={cfg.eyebrowOptions?.size}
      isEditing={cfg.isEditing}
      className="mb-3"
    />
  );
}

// Title slot wrapped in its AnimatedSection — shared across every
// layout. `extraTitleClassName` carries the per-layout title class
// (centered vs section variants).
function HeadingTitle({
  cfg,
  extraTitleClassName,
}: {
  cfg: HeadingRenderConfig;
  extraTitleClassName?: string;
}) {
  const { title, TitleTag } = cfg;
  if (!cfg.hasTitle) return null;
  return (
    <AnimatedSection
      direction={cfg.titleDirection}
      distanceInRem={12}
      delay={0}
      duration={1000}
      reducedMotion={cfg.headingAnimationReducedMotion}
    >
      <TitleTag
        className={cn(
          "mb-2 border-0 pb-0 font-heading",
          cfg.headingSizeClass,
          extraTitleClassName,
          cfg.resolvedTitleClassName,
        )}
      >
        <Text
          value={title}
          tag="span"
          isEditing={cfg.isEditing}
          placeholder="Title"
        />
      </TitleTag>
    </AnimatedSection>
  );
}

// Title slot for accent-line layouts: the title is wrapped in an
// inline-block alongside the <AccentLine/>. Returns the inner content
// (caller supplies the surrounding AnimatedSection container).
function HeadingTitleAccentInner({
  cfg,
  extraTitleClassName,
}: {
  cfg: HeadingRenderConfig;
  extraTitleClassName?: string;
}) {
  const { title, TitleTag } = cfg;
  return (
    <>
      <TitleTag
        className={cn(
          "mb-2 border-0 pb-0 font-heading",
          cfg.headingSizeClass,
          extraTitleClassName,
          cfg.resolvedTitleClassName,
        )}
      >
        <span className="inline-block">
          <Text
            value={title}
            tag="span"
            isEditing={cfg.isEditing}
            placeholder="Title"
          />
        </span>
      </TitleTag>
      <AccentLine
        className={cn("mt-2 h-5! w-full md:h-6!", cfg.accentLineClassName)}
      />
    </>
  );
}

// Lead slot wrapped in its AnimatedSection — shared across every layout.
function HeadingLead({
  cfg,
  leadClassName,
}: {
  cfg: HeadingRenderConfig;
  leadClassName?: string;
}) {
  const { lead } = cfg;
  if (!cfg.hasLead) return null;
  return (
    <AnimatedSection
      direction={cfg.leadDirection}
      distanceInRem={4}
      delay={600}
      duration={1000}
      reducedMotion={cfg.headingAnimationReducedMotion}
    >
      <div className={cn(cfg.leadSizeClass, "text-current/70", leadClassName)}>
        <RichText
          value={lead}
          isEditing={cfg.isEditing}
          placeholder="Lead"
        />
      </div>
    </AnimatedSection>
  );
}

function CenteredHeading({
  cfg,
  withDivider = false,
  containerClassName,
  titleClassName,
  leadClassName,
}: {
  cfg: HeadingRenderConfig;
  /**
   * `center-with-section-divider`: full-width hairline rule under the
   * heading block — the centered twin of the start-aligned
   * section-divider treatment (same border classes).
   */
  withDivider?: boolean;
  containerClassName?: string;
  titleClassName?: string;
  leadClassName?: string;
}) {
  return (
    <div
      className={cn(
        withDivider
          ? "mb-5 border-border border-b pb-3 text-center md:mb-6"
          : "mb-4 text-center md:mb-3",
        withDivider && cfg.dividerClassName,
        containerClassName,
      )}
    >
      <HeadingEyebrow cfg={cfg} align="center" />
      <HeadingTitle cfg={cfg} extraTitleClassName={titleClassName} />
      <HeadingLead cfg={cfg} leadClassName={leadClassName} />
    </div>
  );
}

function AccentLineHeading({
  cfg,
  containerClassName,
  titleClassName,
  leadClassName,
}: {
  cfg: HeadingRenderConfig;
  containerClassName?: string;
  titleClassName?: string;
  leadClassName?: string;
}) {
  return (
    <div className={cn("mb-6 text-center md:mb-4", containerClassName)}>
      <HeadingEyebrow cfg={cfg} align="center" />
      {cfg.hasTitle ? (
        <AnimatedSection
          direction={cfg.titleDirection}
          distanceInRem={12}
          delay={0}
          duration={1000}
          reducedMotion={cfg.headingAnimationReducedMotion}
        >
          <div className="mx-auto inline-block max-w-full align-top">
            <HeadingTitleAccentInner
              cfg={cfg}
              extraTitleClassName={titleClassName}
            />
          </div>
        </AnimatedSection>
      ) : (
        <AccentLine
          className={cn(
            "mx-auto mt-2 h-5! w-full max-w-44 md:h-6! md:max-w-52",
            cfg.accentLineClassName,
          )}
        />
      )}
      <HeadingLead cfg={cfg} leadClassName={cn("mt-2", leadClassName)} />
    </div>
  );
}

function SplitHeading({
  cfg,
  layout,
  containerClassName,
  titleClassName,
  leadClassName,
}: {
  cfg: HeadingRenderConfig;
  layout: HeadingLayout;
  containerClassName?: string;
  titleClassName?: string;
  leadClassName?: string;
}) {
  const isSplitAccentLine =
    layout === "split-start-accent-line" || layout === "split-end-accent-line";
  const isSplitWithSeparator =
    layout === "split-start-separator" || layout === "split-end-separator";
  return (
    <div
      className={cn(
        isSplitWithSeparator
          ? "mb-4 border-border border-b pb-4 text-start md:mb-3"
          : "mb-4 pb-0 text-start md:mb-3",
        isSplitWithSeparator && cfg.dividerClassName,
        containerClassName,
      )}
    >
      <HeadingEyebrow cfg={cfg} align="start" />
      {cfg.hasTitle ? (
        <AnimatedSection
          direction={cfg.titleDirection}
          distanceInRem={12}
          delay={0}
          duration={1000}
          reducedMotion={cfg.headingAnimationReducedMotion}
        >
          {isSplitAccentLine ? (
            <div className="inline-block max-w-full align-top">
              <HeadingTitleAccentInner
                cfg={cfg}
                extraTitleClassName={titleClassName}
              />
            </div>
          ) : (
            <cfg.TitleTag
              className={cn(
                "mb-2 border-0 pb-0 font-heading",
                cfg.headingSizeClass,
                titleClassName,
                cfg.resolvedTitleClassName,
              )}
            >
              <Text
                value={cfg.title}
                tag="span"
                isEditing={cfg.isEditing}
                placeholder="Title"
              />
            </cfg.TitleTag>
          )}
        </AnimatedSection>
      ) : null}
      <HeadingLead cfg={cfg} leadClassName={leadClassName} />
    </div>
  );
}

function SectionHeading({
  cfg,
  layout,
  containerClassName,
  titleClassName,
  leadClassName,
}: {
  cfg: HeadingRenderConfig;
  layout: HeadingLayout;
  containerClassName?: string;
  titleClassName?: string;
  leadClassName?: string;
}) {
  // `start-with-section-divider` gets the full-width hairline rule;
  // `start` and `start-with-accent` render without it.
  const withDivider = layout === "start-with-section-divider";
  // `start-with-accent`: the accent scribble under the title — the
  // start-aligned twin of the centered accent treatment (same inner
  // markup as split-*-accent-line).
  const withAccent = layout === "start-with-accent";
  // Tightened section heading→content gap (was mb-8). With-divider
  // keeps a small breathing room below the border; the others drop
  // to mb-3 so the title sits closer to the body it introduces,
  // matching the rest of the design system's heading rhythm.
  return (
    <div
      className={cn(
        withDivider
          ? "mb-5 border-border border-b pb-3 text-start md:mb-6"
          : "mb-3 pb-0 text-start md:mb-4",
        withDivider && cfg.dividerClassName,
        containerClassName,
      )}
    >
      <HeadingEyebrow cfg={cfg} align="start" />
      {withAccent && cfg.hasTitle ? (
        <AnimatedSection
          direction={cfg.titleDirection}
          distanceInRem={12}
          delay={0}
          duration={1000}
          reducedMotion={cfg.headingAnimationReducedMotion}
        >
          <div className="inline-block max-w-full align-top">
            <HeadingTitleAccentInner
              cfg={cfg}
              extraTitleClassName={titleClassName}
            />
          </div>
        </AnimatedSection>
      ) : (
        <HeadingTitle cfg={cfg} extraTitleClassName={titleClassName} />
      )}
      <HeadingLead cfg={cfg} leadClassName={leadClassName} />
    </div>
  );
}

// Two-column split body: heading on one side, content on the other,
// with an optional full-width footer below. `isEndSplit` swaps the
// column order so the heading sits on the inline-end side.
function SplitBody({
  headingNode,
  body,
  footer,
  isEndSplit,
  splitFooterAlignment,
  wrapperClassName,
  innerContainerClassName,
  contentClassName,
  footerClassName,
}: {
  headingNode: ReactNode;
  body?: ReactNode;
  footer?: ReactNode;
  isEndSplit: boolean;
  splitFooterAlignment: SplitFooterAlignment;
  wrapperClassName?: string;
  innerContainerClassName: string;
  contentClassName?: string;
  footerClassName?: string;
}) {
  const splitFooterAlignClass =
    splitFooterAlignment === "start"
      ? "text-start"
      : splitFooterAlignment === "end"
        ? "text-end"
        : "text-center";
  return (
    <div className={wrapperClassName}>
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2 lg:gap-10">
        <div className={cn("lg:order-1", isEndSplit && "lg:order-2")}>
          {headingNode}
        </div>
        <div className={cn("min-w-0 lg:order-2", isEndSplit && "lg:order-1")}>
          {body != null ? (
            <div className={cn(innerContainerClassName, contentClassName)}>
              {body}
            </div>
          ) : null}
        </div>
      </div>
      {footer != null ? (
        <div className={cn("mt-6", splitFooterAlignClass, footerClassName)}>
          {footer}
        </div>
      ) : null}
    </div>
  );
}

// Dispatch the heading layout to its renderer. Centered/accent-line use
// the "centered*" class slots; split/section use the "section*" slots.
function renderHeadingNode({
  layout,
  isSplitLayout,
  cfg,
  centeredContainerClassName,
  centeredTitleClassName,
  centeredLeadClassName,
  sectionContainerClassName,
  sectionTitleClassName,
  sectionLeadClassName,
}: {
  layout: HeadingLayout;
  isSplitLayout: boolean;
  cfg: HeadingRenderConfig;
  centeredContainerClassName?: string;
  centeredTitleClassName?: string;
  centeredLeadClassName?: string;
  sectionContainerClassName?: string;
  sectionTitleClassName?: string;
  sectionLeadClassName?: string;
}): ReactNode {
  if (layout === "center" || layout === "center-with-section-divider") {
    return (
      <CenteredHeading
        cfg={cfg}
        withDivider={layout === "center-with-section-divider"}
        containerClassName={centeredContainerClassName}
        titleClassName={centeredTitleClassName}
        leadClassName={centeredLeadClassName}
      />
    );
  }
  if (layout === "center-with-accent") {
    return (
      <AccentLineHeading
        cfg={cfg}
        containerClassName={centeredContainerClassName}
        titleClassName={centeredTitleClassName}
        leadClassName={centeredLeadClassName}
      />
    );
  }
  if (isSplitLayout) {
    return (
      <SplitHeading
        cfg={cfg}
        layout={layout}
        containerClassName={sectionContainerClassName}
        titleClassName={sectionTitleClassName}
        leadClassName={sectionLeadClassName}
      />
    );
  }
  return (
    <SectionHeading
      cfg={cfg}
      layout={layout}
      containerClassName={sectionContainerClassName}
      titleClassName={sectionTitleClassName}
      leadClassName={sectionLeadClassName}
    />
  );
}

/**
 * Body rendered when SectionWrapper has no title/lead. Returns `null`
 * when there's nothing to render; otherwise emits the children + footer
 * (and their placeholder slots) so Pages chrome still wires drop targets.
 */
function renderHeadinglessBody({
  body,
  footer,
  wrapperClassName,
  innerContainerClassName,
  contentClassName,
  footerClassName,
}: {
  body: ReactNode;
  footer?: ReactNode;
  wrapperClassName?: string;
  innerContainerClassName: string;
  contentClassName?: string;
  footerClassName?: string;
}): ReactNode {
  if (body == null && footer == null) return null;
  return (
    <div className={wrapperClassName}>
      {body != null ? (
        <div className={cn(innerContainerClassName, contentClassName)}>
          {body}
        </div>
      ) : null}
      {footer != null ? (
        <div className={cn("text-center", footerClassName)}>{footer}</div>
      ) : null}
    </div>
  );
}

export function SectionWrapper({
  title,
  lead,
  eyebrow,
  isEditing: isEditingProp,
  layout = "start-with-section-divider",
  // Boolean rendering param (`UseSectionWrapper`) intentionally has NO
  // React-side default. Sitecore drives the truthy initial state via
  // the rendering parameters template's `__Standard Values` (compiled
  // from the recipe's `default: "true"`). A `= true` destructure here
  // would silently re-enable the contained treatment when Sitecore
  // serialises an unchecked checkbox as `""` and the layout-service
  // omits the key entirely — `isEnabledStrict(undefined)` correctly
  // resolves to `false`, but only if React doesn't pre-fill the prop.
  // See `feedback_no_react_defaults_for_sitecore_bool_params` memory.
  useSectionWrapper,
  children,
  footer,
  splitFooterAlignment = "center",
  wrapperClassName,
  contentClassName,
  footerClassName,
  sectionContainerClassName,
  centeredContainerClassName,
  sectionTitleClassName,
  centeredTitleClassName,
  sectionLeadClassName,
  centeredLeadClassName,
  headingOptions,
}: SectionWrapperProps) {
  // Inner content-width — single source of truth for "contained vs
  // full-width" across every component that consumes SectionWrapper.
  // Contained = a readable measure (~672px) centered in the parent
  // container; not-contained = the parent container's full width.
  const sitecore = useSitecore() as {
    page?: { mode?: { isEditing?: boolean } };
  };
  const isEditing =
    isEditingProp ?? Boolean(sitecore?.page?.mode?.isEditing);
  const isContained = isEnabledStrict(useSectionWrapper);
  const innerContainerClassName = isContained
    ? "mx-auto w-full max-w-2xl"
    : "w-full";
  const hasTitle =
    (Boolean(title) && !isEmptySource(title)) ||
    (isEditing && title != null);
  // Same contract as Title / Eyebrow: only mount the slot when the
  // field exists on this rendering. `|| isEditing` grew a ghost
  // `+ Lead` on Form Builder / Content Block / Visual Accordion, which
  // use SectionWrapper without a `lead` prop.
  const hasLead =
    (Boolean(lead) && !isEmptySource(lead)) ||
    (isEditing && lead != null);
  // Same contract as Title: only mount the slot when the field exists
  // on this rendering. `|| isEditing` would grow a ghost eyebrow on
  // gallery/carousel headings that have no Eyebrow field.
  const hasEyebrow =
    eyebrow != null && (!isEmptySource(eyebrow) || isEditing);
  const hasBody =
    children != null ||
    footer != null ||
    Boolean(wrapperClassName || contentClassName || footerClassName);
  const hasHeadingContent = Boolean(hasTitle || hasLead || hasEyebrow);
  const isSplitLayout = SPLIT_LAYOUTS.has(layout);
  // The "end" split keeps the heading on the inline-end side of the
  // grid (right in LTR, left in RTL — CSS grid order doesn't need a
  // physical flip; we set order classes on the children and the
  // grid's inline axis handles direction inherently).
  const isEndSplit = END_SPLIT_LAYOUTS.has(layout);
  const reducedMotion = usePrefersReducedMotion();
  const resolvedClasses = resolveHeadingClasses(headingOptions, {
    sectionContainerClassName,
    centeredContainerClassName,
    sectionTitleClassName,
    centeredTitleClassName,
    sectionLeadClassName,
    centeredLeadClassName,
  });
  const resolvedHeadingAnimation = headingOptions?.animation ?? "none";
  const resolvedHeadingSize = headingOptions?.size ?? "default";
  // Tag swap for the title slot. `h2` keeps the historical behavior for
  // every caller that doesn't thread the level — every other call site
  // through SectionWrapper (accordion-block, tabs-block, hero, promo,
  // …) renders unchanged.
  const resolvedHeadingLevel: HeadingLevel = headingOptions?.level ?? "h2";
  const TitleTag = TYPOGRAPHY_BY_LEVEL[resolvedHeadingLevel];
  const resolvedTitleClassName = headingOptions?.titleClassName ?? "";
  // Animation gating: any layout participates as long as the author
  // picked a non-`none` animation token. Previously the gate was
  // limited to `centered` + split-end variants, which meant the
  // animation parameter was silently ignored on `section`,
  // `section-no-separator`, `accent-line`, and split-start layouts —
  // confusing because the parameter is offered on every layout but
  // only fires for some.
  const animateHeading = resolvedHeadingAnimation !== "none";
  const headingAnimationReducedMotion = reducedMotion || !animateHeading;
  // AnimatedSection's `direction` is the axis the element MOVES IN to
  // reach its final position (not where it starts from):
  //   - `direction="start"` = element starts shifted toward inline-end
  //     and slides toward inline-start (visually right→left in LTR,
  //     left→right in RTL — the dir-aware flip lives in AnimatedSection).
  //   - `direction="end"` = inverse — slides toward inline-end.
  // Map heading-animation tokens to the matching axis: a `banner-end`
  // entrance slides FROM end TO start (i.e. `direction="start"`), and
  // `banner-start` slides FROM start TO end.
  const titleDirection = titleAnimationDirection(resolvedHeadingAnimation);
  const leadDirection =
    resolvedHeadingAnimation === "banner-center" ? "up" : "down";
  const headingSizeClass = headingSizeClassFor(resolvedHeadingSize);
  const leadSizeClass = headingLeadSizeClassFor(resolvedHeadingSize);
  // AccentLineColor (color-scheme@1) — one parse feeds both the accent
  // scribble (text-*) and the section-divider hairline (border-*).
  const accentClasses = accentLineColorClasses(
    parseAccentLineColor(headingOptions?.accentLineColor),
  );

  // No-heading-content branch must still render `children` and `footer`
  // when they're present — Pages chrome looks for the placeholder
  // sentinel in the rendered HTML to wire up drop targets, and a
  // freshly-dropped SectionWrapper rendering has empty title+lead but
  // still owns a placeholder slot the author needs to drop into. The
  // previous `return null` here stripped the placeholder entirely and
  // chrome hung waiting for it to appear.
  if (!hasHeadingContent) {
    return renderHeadinglessBody({
      body: children,
      footer,
      wrapperClassName,
      innerContainerClassName,
      contentClassName,
      footerClassName,
    });
  }

  const headingCfg: HeadingRenderConfig = {
    title,
    lead,
    eyebrow,
    hasTitle: Boolean(hasTitle),
    hasLead: Boolean(hasLead),
    hasEyebrow: Boolean(hasEyebrow),
    isEditing,
    TitleTag,
    headingSizeClass,
    leadSizeClass,
    resolvedTitleClassName,
    titleDirection,
    leadDirection,
    headingAnimationReducedMotion,
    accentLineClassName: accentClasses.line,
    dividerClassName: accentClasses.divider,
    eyebrowOptions: headingOptions?.eyebrow,
  };

  const headingNode = renderHeadingNode({
    layout,
    isSplitLayout,
    cfg: headingCfg,
    centeredContainerClassName: resolvedClasses.centeredContainerClassName,
    centeredTitleClassName: resolvedClasses.centeredTitleClassName,
    centeredLeadClassName: resolvedClasses.centeredLeadClassName,
    sectionContainerClassName: resolvedClasses.sectionContainerClassName,
    sectionTitleClassName: resolvedClasses.sectionTitleClassName,
    sectionLeadClassName: resolvedClasses.sectionLeadClassName,
  });

  if (!hasBody) return headingNode;

  if (isSplitLayout) {
    return (
      <SplitBody
        headingNode={headingNode}
        body={children}
        footer={footer}
        isEndSplit={isEndSplit}
        splitFooterAlignment={splitFooterAlignment}
        wrapperClassName={wrapperClassName}
        innerContainerClassName={innerContainerClassName}
        contentClassName={contentClassName}
        footerClassName={footerClassName}
      />
    );
  }

  return (
    <div className={wrapperClassName}>
      {/* Heading shares the same width constraint as the body when
          `useSectionWrapper` is on, so the two visually align. Without
          this, a contained-width body sat under a full-width heading
          and looked indented to the wrong axis. The non-contained
          branch keeps `w-full` so behavior matches the previous
          full-bleed default. */}
      <div className={innerContainerClassName}>{headingNode}</div>
      {children != null ? (
        <div className={cn(innerContainerClassName, contentClassName)}>
          {children}
        </div>
      ) : null}
      {footer != null ? (
        <div className={cn("text-center", footerClassName)}>{footer}</div>
      ) : null}
    </div>
  );
}
