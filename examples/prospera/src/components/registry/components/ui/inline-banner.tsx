import { Button } from "@/components/registry/components/ui/cta-button";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/registry/primitives/core/alert";
import { ThemeIcon } from "@/components/registry/primitives/core/theme-icon";
import {
  Link,
  type LinkSource,
} from "@/components/registry/primitives/editables/link";
import {
  RichText,
  type RichTextSource,
} from "@/components/registry/primitives/editables/richtext";
import { isEmptySource } from "@/components/registry/primitives/editables/source-normalizers";
import {
  Text,
  type TextSource,
} from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import { isEnabled } from "@/lib/registry/param-parsers";
import type { CmsProps } from "@/lib/registry/sitecore";

/**
 * Flat props delivered by `withSitecore`'s default convention:
 * `fields.Title` → `title`, `fields.Description` → `description`,
 * `fields.Link` → `link`, `params.ColorScheme` → `colorScheme`, and
 * so on.
 */
export interface InlineBannerProps extends CmsProps {
  title?: TextSource;
  description?: RichTextSource;
  /** Optional CTA link rendered as an outline button. */
  link?: LinkSource;
  /**
   * Color scheme (color-scheme@1). Drives the tinted surface, text
   * color, and (when `ShowIcon` is on) the leading icon — semantic
   * schemes get their own icon, brand schemes a generic info icon.
   */
  colorScheme?:
    | "info"
    | "success"
    | "warning"
    | "destructive"
    | "none"
    | "white"
    | "black"
    | "neutral"
    | "primary"
    | "primary-gradient"
    | "secondary"
    | "secondary-gradient"
    | "tertiary"
    | "accent"
    | "accent-2"
    | "accent-3";
  /** Show the leading icon. Accepts Sitecore string booleans. */
  showIcon?: string | boolean;
  /**
   * Title + description placement (alert-composition@1): `stacked`
   * (default) or `row`. The enum's divider values
   * (`row-with-divider` / `row-with-angled-divider`) belong to
   * alert-banner's slab treatment and render as plain `row` here.
   */
  composition?: string;
}

// Card-class surfaces share the card radius token — same rationale as
// alert-banner's contained layout.
const CARD_RADIUS_CLASS =
  "rounded-[var(--card-radius,var(--radius-lg,0.75rem))]";

type InlineBannerScheme = NonNullable<InlineBannerProps["colorScheme"]>;

// Description (body copy) color per scheme — mirrors alert-banner's
// DESCRIPTION_TEXT_CLASSES rationale: tinted schemes use
// `text-muted-foreground` because the Alert primitive's tint variants
// carry the `surface-tinted` remap (muted re-derives from the role
// color and stays readable on the pale tint); saturated-on-own-tint is
// a title treatment, not a body-copy one. Solid fills (white / black /
// gradients) inherit the variant's own foreground via `text-current`.
// NOT imported from alert-banner.tsx — that module is `"use client"`
// and registers CDP events on import; this component stays a server
// component with zero analytics.
const DESCRIPTION_TEXT_CLASSES: Record<InlineBannerScheme, string> = {
  info: "text-muted-foreground",
  success: "text-muted-foreground",
  warning: "text-muted-foreground",
  destructive: "text-muted-foreground",
  none: "text-current",
  white: "text-theme-black",
  black: "text-theme-white",
  neutral: "text-muted-foreground",
  primary: "text-muted-foreground",
  "primary-gradient": "text-current",
  secondary: "text-muted-foreground",
  "secondary-gradient": "text-current",
  tertiary: "text-muted-foreground",
  accent: "text-muted-foreground",
  "accent-2": "text-muted-foreground",
  "accent-3": "text-muted-foreground",
};

// Icon per scheme — mirrors the Alert primitive's variantIcons map.
// The primitive's own icon column is suppressed and the icon rides on
// the title line so it stays coupled to the copy (same reasoning as
// alert-banner).
const ICON_NAMES: Record<InlineBannerScheme, string> = {
  info: "info",
  success: "check",
  warning: "warning",
  destructive: "alert",
  none: "info",
  white: "info",
  black: "info",
  neutral: "info",
  primary: "info",
  "primary-gradient": "info",
  secondary: "info",
  "secondary-gradient": "info",
  tertiary: "info",
  accent: "info",
  "accent-2": "info",
  "accent-3": "info",
};

/** `stacked` | `row` — divider values degrade gracefully to `row`. */
function parseComposition(value: string | undefined): "stacked" | "row" {
  if (!value) return "stacked";
  const normalized = value.trim().toLowerCase();
  if (normalized.startsWith("row")) return "row";
  return "stacked";
}

/**
 * Inline, non-dismissible notice — alert-banner's contained look
 * without the app-shell behaviors: no dismiss button, no CDP/analytics
 * events, no sticky positioning, no toast layouts. Drop it inside page
 * content for persistent contextual notes ("this API is in beta",
 * "office closed on public holidays"). Server component — no state.
 *
 * Returns `null` outside editing mode when there's nothing to render.
 */
export function Default({
  title,
  description,
  link,
  colorScheme = "info",
  // Boolean rendering param intentionally has NO React-side default —
  // Sitecore drives the truthy initial state via the recipe param's
  // `default: "true"` Standard Values; a `= true` here would mask the
  // author's uncheck. See alert-banner.tsx / the
  // `feedback_no_react_defaults_for_sitecore_bool_params` memory.
  showIcon,
  composition,
  styles,
  id,
  isEditing,
}: InlineBannerProps) {
  const hasTitle = title != null && !isEmptySource(title);
  const hasDescription = description != null && !isEmptySource(description);
  const hasLink = link != null && !isEmptySource(link);
  if (!hasTitle && !hasDescription && !isEditing) return null;

  const resolvedComposition = parseComposition(composition);
  const isRow = resolvedComposition === "row";
  const iconName = isEnabled(showIcon) ? ICON_NAMES[colorScheme] : null;

  // Outline CTA — same shape as alert-banner's link button.
  // `no-underline` defeats the global anchor underline that bleeds
  // through when Button wraps an anchor via `asChild`.
  const linkButton = hasLink ? (
    <Button
      asChild
      size="sm"
      variant="outline"
      colorScheme={colorScheme}
      className="no-underline hover:no-underline"
    >
      <Link value={link} />
    </Button>
  ) : isEditing ? (
    <Link value={link} placeholder="Link" isEditing={isEditing} />
  ) : null;

  return (
    <Alert
      className={cn(
        "component inline-banner relative border-none",
        CARD_RADIUS_CLASS,
        styles?.trimEnd(),
      )}
      id={id}
      data-slot="inline-banner"
      data-color-scheme={colorScheme}
      data-composition={resolvedComposition}
      variant={colorScheme}
      // Icon rendered manually on the title line (below) so it stays
      // coupled to the copy instead of the primitive's far-start grid
      // column.
      showIcon={false}
    >
      <div
        className={cn(
          "col-start-2 flex w-full flex-col gap-2",
          isRow && "sm:flex-row sm:items-center sm:justify-between sm:gap-4",
        )}
      >
        <div
          className={cn(
            "min-w-0",
            isRow
              ? "flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3"
              : "space-y-1",
          )}
        >
          <AlertTitle
            className={cn(
              "shrink-0 font-heading font-semibold text-base leading-tight tracking-tight",
              iconName && "flex items-center gap-2",
            )}
          >
            {iconName ? (
              <ThemeIcon
                name={iconName}
                className="size-4 shrink-0 text-current"
                aria-hidden="true"
              />
            ) : null}
            <Text
              value={title}
              tag="span"
              placeholder="Title"
              isEditing={isEditing}
            />
          </AlertTitle>
          <AlertDescription
            className={cn(
              "min-w-0 text-sm",
              DESCRIPTION_TEXT_CLASSES[colorScheme],
            )}
          >
            <RichText
              value={description}
              placeholder="Description"
              isEditing={isEditing}
            />
          </AlertDescription>
        </div>
        {linkButton ? (
          <div className="flex shrink-0 items-center gap-2">{linkButton}</div>
        ) : null}
      </div>
    </Alert>
  );
}

/**
 * `universal` opts this file into BOTH the server and client component
 * maps the SDK generates — Pages chrome resolves named-export variants
 * client-side. See content-block.tsx for the full rationale.
 */
export const componentType = "universal";
