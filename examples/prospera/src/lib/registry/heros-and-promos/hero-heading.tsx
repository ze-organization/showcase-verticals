import {
  Button,
  trailingArrow,
} from "@/components/registry/components/ui/cta-button";
import {
  TypographyH1,
  TypographyMuted,
} from "@/components/registry/primitives/core/typography";
import { Link } from "@/components/registry/primitives/editables/link";
import { RichText } from "@/components/registry/primitives/editables/richtext";
import { isEmptySource } from "@/components/registry/primitives/editables/source-normalizers";
import { Text } from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import {
  buttonColorScheme,
  parseButtonVariant,
} from "@/lib/registry/param-parsers";
import type {
  HeroColorScheme,
  HeroFields,
  HeroHeadingOptions,
  HeroTitleSize,
  HeroTitleWeight,
} from "./hero.types";

/**
 * Explicit title scales (`size@1`). `default` keeps the layout-driven
 * ramp (display vs compact) computed in `HeroHeading`.
 *
 * Every ramp MUST pin all three breakpoints (base / md / lg): the
 * TypographyH1 base carries its own `lg:text-5xl`, and tailwind-merge
 * only removes a conflicting class within the SAME modifier scope — a
 * ramp without an `lg:` entry lets the base's `lg:text-5xl` leak
 * through, which made `xs` / `sm` / compact render at 5xl on desktop
 * (the "heading layout does nothing" report). Keep any `leading-*`
 * AFTER its size classes: tailwind-merge's font-size group strips
 * earlier leading utilities in the same scope.
 */
const TITLE_SIZE_CLASSES: Record<Exclude<HeroTitleSize, "default">, string> = {
  xs: "text-2xl md:text-3xl lg:text-3xl",
  sm: "text-3xl md:text-4xl lg:text-4xl",
  md: "text-4xl md:text-5xl lg:text-5xl leading-[1.08]",
  lg: "text-4xl md:text-6xl lg:text-7xl leading-[1.08]",
  xl: "text-5xl md:text-7xl lg:text-8xl leading-[1.05]",
};

/**
 * Title weights (`title-weight@1`). `default` reads the
 * `--heading-weight` theme token with a 300 fallback — the hero's
 * historical `font-light` display face — so themes can re-weight hero
 * titles globally without touching params.
 */
const TITLE_WEIGHT_CLASSES: Record<HeroTitleWeight, string> = {
  default: "font-(--heading-weight,300)",
  light: "font-light",
  regular: "font-normal",
  semibold: "font-semibold",
  bold: "font-bold",
  heavy: "font-extrabold",
};

interface HeroHeadingProps {
  fields: HeroFields;
  heading: HeroHeadingOptions;
  isEditing?: boolean;
  /** DOM id stamped on the title H1 so the parent `<section>` can `aria-labelledby` it. */
  titleId?: string;
}

/**
 * Tailwind text-color class for the eyebrow keyed off the shared
 * `color-scheme@1` enum. For `"neutral"` (or undefined) the eyebrow
 * defers to the surrounding surface tone via `currentColor` (dimmed)
 * rather than pinning `text-muted-foreground` — this is what lets the
 * overlay panel's `text-*-foreground` flow through to the eyebrow the
 * same way it flows to the title and body. `text-current/70` overrides
 * `TypographyMuted`'s hardcoded `text-muted-foreground` via tw-merge.
 */
function resolveEyebrowColorClass(
  colorScheme: HeroColorScheme | undefined,
): string {
  if (!colorScheme || colorScheme === "neutral") return "text-current/70";
  if (colorScheme === "primary") return "text-primary";
  if (colorScheme === "secondary") return "text-secondary";
  if (colorScheme === "tertiary") return "text-tertiary";
  if (colorScheme === "accent") return "text-accent";
  if (colorScheme === "accent-2") return "text-accent-2";
  if (colorScheme === "accent-3") return "text-accent-3";
  if (colorScheme === "info") return "text-info";
  if (colorScheme === "success") return "text-success";
  if (colorScheme === "warning") return "text-warning";
  if (colorScheme === "destructive") return "text-destructive";
  return "text-ai";
}

function resolveAlignClasses(align: HeroHeadingOptions["align"]): {
  wrapper: string;
  actions: string;
  /**
   * Margin-auto alignment for the WIDTH-CAPPED blocks (title's
   * `md:max-w-[18ch]`, subtitle/description's ch caps). `text-center`
   * alone centers the glyphs INSIDE a block that still hugs the start
   * edge once the cap bites — the "centered hero heading sits left of
   * its centered subtitle" misalignment. Margin auto re-centers the
   * capped box itself without touching `items-*` (see the wrapper
   * note above).
   */
  block: string;
} {
  // IMPORTANT: only set `text-*` on the wrapper — do NOT set `items-*`.
  // `align-items: center` / `align-items: end` overrides the default
  // `stretch`, which collapses each child to its content width. With
  // `wrap-break-word` on the title, "content width" becomes one
  // character per line. Letting children stay stretched + aligning
  // the text inline gives the visual we want without the catastrophic
  // shrink.
  if (align === "center") {
    return {
      wrapper: "text-center",
      actions: "justify-center",
      block: "mx-auto",
    };
  }
  if (align === "end") {
    return { wrapper: "text-end", actions: "justify-end", block: "ms-auto" };
  }
  return { wrapper: "text-start", actions: "justify-start", block: "" };
}

/**
 * CTA row under the heading copy. Each CTA renders only when its link
 * field carries a value; in editing mode both slots always render so
 * authors get a clickable EditPlaceholder to attach a link to.
 *
 * The Buttons are `asChild` around editable Links, so CtaButton can't
 * compose inner content — the variant resolves here and the arrow rides
 * the Link's `after` slot (the CtaGroup pattern).
 */
function HeroHeadingActions({
  fields,
  heading,
  isEditing,
  actionsAlignClass,
}: {
  fields: HeroFields;
  heading: HeroHeadingOptions;
  isEditing?: boolean;
  actionsAlignClass: string;
}) {
  const hasPrimaryAction = Boolean(
    fields.primaryAction && !isEmptySource(fields.primaryAction),
  );
  const hasSecondaryAction = Boolean(
    fields.secondaryAction && !isEmptySource(fields.secondaryAction),
  );
  const showPrimaryAction = hasPrimaryAction || Boolean(isEditing);
  const showSecondaryAction = hasSecondaryAction || Boolean(isEditing);
  if (!showPrimaryAction && !showSecondaryAction) return null;

  const primaryButtonVariant = parseButtonVariant(
    heading.primaryActionVariant,
    "default",
  );
  const secondaryButtonVariant = parseButtonVariant(
    heading.secondaryActionVariant,
    "outline",
  );
  const wantsPrimaryArrow = Boolean(heading.primaryActionShowArrow);
  const wantsSecondaryArrow = Boolean(heading.secondaryActionShowArrow);

  return (
    <div
      className={cn(
        "mt-2 flex flex-wrap gap-3 [&_a]:no-underline",
        actionsAlignClass,
      )}
    >
      {showPrimaryAction ? (
        <Button
          asChild
          variant={primaryButtonVariant}
          colorScheme={buttonColorScheme(heading.primaryActionColorScheme)}
          fontColor={heading.primaryActionFontColor}
          size={heading.actionSize}
          className={cn(wantsPrimaryArrow && "group")}
        >
          <Link
            value={fields.primaryAction}
            data-cta="primary"
            isEditing={isEditing}
            placeholder="Primary CTA"
            after={wantsPrimaryArrow ? trailingArrow() : undefined}
          />
        </Button>
      ) : null}
      {showSecondaryAction ? (
        <Button
          asChild
          variant={secondaryButtonVariant}
          colorScheme={buttonColorScheme(heading.secondaryActionColorScheme)}
          fontColor={heading.secondaryActionFontColor}
          size={heading.actionSize}
          className={cn(wantsSecondaryArrow && "group")}
        >
          <Link
            value={fields.secondaryAction}
            data-cta="secondary"
            isEditing={isEditing}
            placeholder="Secondary CTA"
            after={wantsSecondaryArrow ? trailingArrow() : undefined}
          />
        </Button>
      ) : null}
    </div>
  );
}

/**
 * Renders the heading block independently from frame composition.
 *
 * `isEditing` flows down to every Text/RichText/Link so empty fields
 * still draw an EditPlaceholder stub in Sitecore Pages — authors get
 * a clickable affordance for each slot instead of an empty hero.
 */
export function HeroHeading({
  fields,
  heading,
  isEditing,
  titleId,
}: HeroHeadingProps) {
  // Mobile (375px) overlay panel inner column is ~295px wide. A 36px
  // display title clips/overcrowds at that width — start at text-3xl
  // on mobile and step up at md/lg. Compact stays a tier smaller.
  // An explicit `TitleSize` pick overrides the layout-driven ramp.
  const titleSize = heading.titleSize ?? "default";
  // Layout-driven ramps pin lg explicitly for the same base-class-leak
  // reason as TITLE_SIZE_CLASSES (see its doc comment).
  const titleScaleClass =
    titleSize !== "default"
      ? TITLE_SIZE_CLASSES[titleSize]
      : heading.layout === "compact"
        ? "text-2xl md:text-4xl lg:text-4xl"
        : "text-4xl md:text-6xl lg:text-7xl leading-[1.08]";
  // `TitleWeight` — `default` defers to the `--heading-weight` theme
  // token (fallback 300, the previous pinned font-light).
  const titleWeightClass =
    TITLE_WEIGHT_CLASSES[heading.titleWeight ?? "default"];
  // Eyebrow scales with the heading treatment — display heroes get a
  // larger, wider-tracked kicker; compact stays a discreet label.
  const eyebrowScaleClass =
    heading.layout === "compact"
      ? "text-xs tracking-[0.14em]"
      : "text-sm tracking-[0.2em] md:text-base";
  // Heading sits inside the overlay panel (or directly on the section
  // surface when no overlay renders). Both surfaces stamp their own
  // `text-*-foreground` so the heading defers via `currentColor` rather
  // than hardcoding `text-foreground` — that lets the panel's
  // `text-primary-foreground` / `text-accent-foreground` / etc. flow
  // through to the eyebrow / title / body. `text-current/85` dims the
  // body without reaching back to a fixed foreground token.
  const bodyTextClass = "text-current/85";
  const {
    wrapper: wrapperAlignClass,
    actions: actionsAlignClass,
    block: blockAlignClass,
  } = resolveAlignClasses(heading.align);

  return (
    <div className={cn("flex flex-col gap-4", wrapperAlignClass)}>
      <TypographyMuted
        className={cn(
          "font-medium uppercase",
          eyebrowScaleClass,
          resolveEyebrowColorClass(heading.eyebrowColorScheme),
        )}
      >
        <Text
          value={fields.eyebrow}
          tag="span"
          isEditing={isEditing}
          placeholder="Eyebrow"
        />
      </TypographyMuted>
      <TypographyH1
        id={titleId}
        className={cn(
          // `max-w-full` clamps the editorial ch-width cap to the parent
          // when the overlay panel is narrower than 18ch — otherwise a
          // `text-7xl` display heading inside a quarter-width overlay
          // bleeds past the padding. `wrap-break-word` is the safety
          // net for single long words (URLs, names) at large font sizes.
          "wrap-break-word max-w-full text-balance tracking-tight md:max-w-[18ch]",
          blockAlignClass,
          titleWeightClass,
          titleScaleClass,
        )}
      >
        <Text
          value={fields.title}
          tag="span"
          isEditing={isEditing}
          placeholder="Title"
        />
      </TypographyH1>
      <div
        className={cn(
          "wrap-break-word max-w-full text-pretty md:max-w-[56ch]",
          blockAlignClass,
          bodyTextClass,
        )}
      >
        <RichText
          value={fields.subtitle}
          isEditing={isEditing}
          placeholder="Subtitle"
        />
      </div>
      <div
        className={cn(
          "wrap-break-word max-w-full text-pretty md:max-w-[62ch] [&_p]:mb-2",
          blockAlignClass,
          bodyTextClass,
        )}
      >
        <RichText
          value={fields.description}
          isEditing={isEditing}
          placeholder="Description"
        />
      </div>
      <HeroHeadingActions
        fields={fields}
        heading={heading}
        isEditing={isEditing}
        actionsAlignClass={actionsAlignClass}
      />
    </div>
  );
}
