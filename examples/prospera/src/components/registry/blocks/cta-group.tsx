import type { ComponentProps, ReactNode } from "react";
import {
  Button,
  trailingArrow,
} from "@/components/registry/components/ui/cta-button";
import type { LinkSource } from "@/components/registry/primitives/editables/link";
import { Link } from "@/components/registry/primitives/editables/link";
import { isEmptySource } from "@/components/registry/primitives/editables/source-normalizers";
import { cn } from "@/lib/registry/cn";
import { isEnabled, parseButtonVariant } from "@/lib/registry/param-parsers";

// Widen the variant/size accept set to whatever the CtaButton wrapper
// itself accepts — that's the shared CTA vocabulary (`pill`, the
// (`xl`, …) the Sitecore `button-variant@1`
// and `size@1` enums surface. Using the primitive Button's narrower
// types here meant the param parsers' wider return types collided at
// every call site.
type ButtonVariantProp = NonNullable<ComponentProps<typeof Button>["variant"]>;
type ButtonSizeProp = NonNullable<ComponentProps<typeof Button>["size"]>;
type ButtonColorSchemeProp = NonNullable<
  ComponentProps<typeof Button>["colorScheme"]
>;

export interface CtaGroupProps {
  /**
   * Primary CTA link source. Rendered as a default Button + Link with
   * `data-cta="primary"` so analytics can pick it out without
   * inspecting className. Omit to skip the primary slot.
   */
  primary?: LinkSource;
  /**
   * Secondary CTA link source. Rendered as an outline Button + Link
   * with `data-cta="secondary"`. Omit to render a single-CTA layout.
   */
  secondary?: LinkSource;
  /**
   * Fallback label used when the link has no author-supplied text.
   * Authors writing text on the Sitecore link field still win — Link
   * prefers its own text over children. Defaults to `"Learn more"`.
   */
  primaryFallback?: ReactNode;
  /**
   * Fallback label for the secondary CTA. Defaults to `"Secondary"` so
   * an unauthored secondary at least renders something legible until
   * the author fills it in.
   */
  secondaryFallback?: ReactNode;
  /** Flex justify-content. Defaults to `"start"`. */
  justify?: "start" | "center" | "end";
  /** Visual variant for the primary CTA. Defaults to `"default"` (filled). */
  primaryVariant?: ButtonVariantProp;
  /** Size token for the primary CTA. Defaults to `"default"`. */
  primarySize?: ButtonSizeProp;
  /** Color scheme passed to the primary CTA Button. Defaults to `"primary"`. */
  primaryColorScheme?: ButtonColorSchemeProp;
  /** Visual variant for the secondary CTA. Defaults to `"outline"`. */
  secondaryVariant?: ButtonVariantProp;
  /** Size token for the secondary CTA. Defaults to `"default"`. */
  secondarySize?: ButtonSizeProp;
  /** Color scheme passed to the secondary CTA Button. */
  secondaryColorScheme?: ButtonColorSchemeProp;
  /**
   * Append a trailing arrow (→) after the primary CTA label. Accepts a
   * Sitecore string-boolean. Routed into the Link's `after` slot rather
   * than the Button's `showArrow` prop — the Button here is `asChild`,
   * so its own arrow path is a no-op.
   */
  primaryShowArrow?: string | boolean;
  /** Append a trailing arrow (→) after the secondary CTA label. */
  secondaryShowArrow?: string | boolean;
  /**
   * Pages-editing mode. When `true`, an empty `primary` / `secondary`
   * source still mounts so authors can click the slot and pick a link
   * (`[No text in field]` / link-picker chrome). Published pages keep
   * the existing "omit empty slots" behavior.
   */
  isEditing?: boolean;
  className?: string;
}

/**
 * Shared CTA cluster for the heros-and-promos family. Wraps the
 * primary + optional secondary Link in matching Buttons with
 * `data-cta` attributes, no-underline override (so the Button's
 * affordance dominates), and consistent flex-wrap/gap spacing.
 *
 * Returns `null` when both slots are empty so the caller doesn't need
 * to gate the block — useful in templated layouts where the CTA slot
 * is conditional on Sitecore field population. Pass `isEditing` to
 * keep empty slots mounted in Pages so authors can click into them.
 */
export function CtaGroup({
  primary,
  secondary,
  primaryFallback = "Learn more",
  secondaryFallback = "Secondary",
  justify = "start",
  primaryVariant = "default",
  primarySize = "default",
  primaryColorScheme,
  secondaryVariant = "outline",
  secondarySize = "default",
  secondaryColorScheme,
  primaryShowArrow,
  secondaryShowArrow,
  isEditing,
  className,
}: CtaGroupProps) {
  const hasPrimary =
    primary != null && (!isEmptySource(primary) || Boolean(isEditing));
  const hasSecondary =
    secondary != null && (!isEmptySource(secondary) || Boolean(isEditing));
  if (!hasPrimary && !hasSecondary) return null;
  const primaryPopulated = primary != null && !isEmptySource(primary);
  const secondaryPopulated = secondary != null && !isEmptySource(secondary);
  // The Buttons below are `asChild` when the link is populated, so
  // CtaButton's own normalization can't compose inner content —
  // resolve here and route the arrow into the Link's `after` slot.
  // Empty editing slots skip `asChild` so Pages chrome markers
  // (a fragment) can wrap the placeholder without Slot rejecting them.
  const primaryButtonVariant = parseButtonVariant(primaryVariant, "default");
  const secondaryButtonVariant = parseButtonVariant(
    secondaryVariant,
    "outline",
  );
  const wantsPrimaryArrow = isEnabled(primaryShowArrow);
  const wantsSecondaryArrow = isEnabled(secondaryShowArrow);
  return (
    <div
      className={cn(
        "mt-2 flex flex-wrap gap-3 [&_a]:no-underline",
        justify === "center" && "justify-center",
        justify === "end" && "justify-end",
        className,
      )}
    >
      {hasPrimary && (
        <Button
          asChild={primaryPopulated}
          variant={primaryButtonVariant}
          size={primarySize}
          colorScheme={primaryColorScheme}
          className={cn(wantsPrimaryArrow && "group")}
        >
          <Link
            value={primary}
            data-cta="primary"
            placeholder="CTA"
            isEditing={isEditing}
            after={wantsPrimaryArrow ? trailingArrow() : undefined}
          >
            {primaryFallback}
          </Link>
        </Button>
      )}
      {hasSecondary && (
        <Button
          asChild={secondaryPopulated}
          variant={secondaryButtonVariant}
          size={secondarySize}
          colorScheme={secondaryColorScheme}
          className={cn(wantsSecondaryArrow && "group")}
        >
          <Link
            value={secondary}
            data-cta="secondary"
            placeholder="CTA"
            isEditing={isEditing}
            after={wantsSecondaryArrow ? trailingArrow() : undefined}
          >
            {secondaryFallback}
          </Link>
        </Button>
      )}
    </div>
  );
}
