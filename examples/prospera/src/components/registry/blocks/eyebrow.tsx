import { isEmptySource } from "@/components/registry/primitives/editables/source-normalizers";
import {
  Text,
  type TextSource,
} from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";

/**
 * Small uppercase line rendered above a title — the editorial "eyebrow"
 * treatment. Two visual modes:
 *
 *   - `text`  (default) — small uppercase prose tinted by `colorScheme`.
 *   - `badge` — pill-shaped chip with a soft-surface fill + saturated
 *               label text, both keyed to `colorScheme`.
 *
 * Source-driven via the `value` field. In editing mode the slot stays
 * mounted with an EditPlaceholder stub even when the source is empty so
 * authors can click into it from Pages.
 *
 * Shared across the registry — promo, article-header, hero overlays —
 * so the visual vocabulary stays consistent and a future treatment
 * change happens in one place. Keep this block source-driven; surfaces
 * that need extra chrome around the eyebrow should compose around it.
 */

const EYEBROW_TEXT_COLOR: Record<string, string> = {
  primary: "text-primary",
  "primary-gradient": "text-primary",
  secondary: "text-secondary",
  "secondary-gradient": "text-secondary",
  tertiary: "text-tertiary",
  accent: "text-accent",
  "accent-2": "text-accent-2",
  "accent-3": "text-accent-3",
  info: "text-info",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
};

const EYEBROW_BADGE_SURFACE: Record<string, string> = {
  primary: "bg-primary-background text-primary",
  "primary-gradient": "bg-primary-background text-primary",
  secondary: "bg-secondary-background text-secondary",
  "secondary-gradient": "bg-secondary-background text-secondary",
  tertiary: "bg-tertiary-background text-tertiary",
  accent: "bg-accent-background text-accent",
  "accent-2": "bg-accent-2-background text-accent-2",
  "accent-3": "bg-accent-3-background text-accent-3",
  info: "bg-info-background text-info",
  success: "bg-success-background text-success",
  warning: "bg-warning-background text-warning",
  destructive: "bg-destructive-background text-destructive",
};

export type EyebrowStyle = "text" | "badge";
export type EyebrowAlign = "start" | "center" | "end";

// `size@1` value → text-size utility for the eyebrow's inner element.
// `default` keeps the block's base scale (text-sm for the text mode,
// text-xs for the badge). Merged via cn so an explicit size wins over
// the base utility through tailwind-merge.
const EYEBROW_SIZE_CLASS: Record<string, string> = {
  default: "",
  xs: "text-xs",
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
};

function resolveSizeClass(size: string | undefined): string {
  if (!size) return "";
  return EYEBROW_SIZE_CLASS[size.trim().toLowerCase()] ?? "";
}

export interface EyebrowProps {
  /** Sitecore single-line text source. */
  value: TextSource | undefined;
  /**
   * Brand scheme. Unset (or `none` / `neutral`) renders the text mode
   * at reduced opacity inheriting the surface foreground, and the
   * badge mode on the neutral muted surface. Any other scheme tints
   * the eyebrow with the matching role color.
   */
  colorScheme?: string;
  /**
   * Visual treatment. Accepts the typed union OR a raw Sitecore enum
   * string (`"badge"` / its `"pill"` alias render the chip; anything
   * else — incl. the `"eyebrow"` alias — is treated as `"text"`).
   * Defaults to `text`.
   */
  style?: EyebrowStyle | string;
  /**
   * Optional size override bound to the shared `size@1` enum
   * (`default | xs | sm | md | lg | xl`). `default` (or unset) keeps
   * the block's base scale.
   */
  size?: string;
  /**
   * Inline-axis alignment of the eyebrow itself within its parent
   * column. Logical, RTL-safe. Defaults to `start`.
   */
  align?: EyebrowAlign;
  /**
   * Pages-editing mode flag. When `true` the eyebrow slot stays
   * mounted (with an EditPlaceholder stub) so the author can click
   * into an empty source.
   */
  isEditing?: boolean;
  /** Placeholder label shown in the Pages stub. Defaults to `"Eyebrow"`. */
  placeholder?: string;
  /** Optional escape-hatch className applied to the wrapping element. */
  className?: string;
}

function alignClass(align: EyebrowAlign): string {
  if (align === "center") return "text-center";
  if (align === "end") return "text-end";
  return "text-start";
}

function resolveTextTint(colorScheme: string | undefined): string {
  if (!colorScheme) return "opacity-70";
  const normalized = colorScheme.trim().toLowerCase();
  if (normalized === "none" || normalized === "neutral") return "opacity-70";
  return EYEBROW_TEXT_COLOR[normalized] ?? "opacity-70";
}

function resolveBadgeSurface(colorScheme: string | undefined): string {
  if (!colorScheme) return "bg-muted text-muted-foreground";
  const normalized = colorScheme.trim().toLowerCase();
  if (normalized === "none" || normalized === "neutral")
    return "bg-muted text-muted-foreground";
  return EYEBROW_BADGE_SURFACE[normalized] ?? "bg-muted text-muted-foreground";
}

/**
 * Shared editorial eyebrow. Returns `null` when there's no value and
 * the parent isn't in editing mode — callers don't need to guard.
 */
export function Eyebrow({
  value,
  colorScheme,
  style = "text",
  size,
  align = "start",
  isEditing,
  placeholder = "Eyebrow",
  className,
}: EyebrowProps) {
  const hasValue = value != null && !isEmptySource(value);
  if (!hasValue && !isEditing) return null;

  const normalizedStyle =
    typeof style === "string" ? style.trim().toLowerCase() : style;
  // `pill` is the content-block recipe's author-facing alias for the
  // badge chip treatment.
  const isBadge = normalizedStyle === "badge" || normalizedStyle === "pill";
  const sizeClass = resolveSizeClass(size);
  const wrapperClass = cn("w-full", alignClass(align), className);

  if (isBadge) {
    return (
      <div className={wrapperClass}>
        <span
          className={cn(
            "inline-flex w-fit max-w-full items-center rounded-full px-3 py-1 font-medium text-xs uppercase tracking-[0.12em]",
            resolveBadgeSurface(colorScheme),
            sizeClass,
          )}
          data-slot="eyebrow"
          data-style="badge"
        >
          <Text
            value={value}
            tag="span"
            placeholder={placeholder}
            isEditing={isEditing}
          />
        </span>
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      <p
        className={cn(
          "wrap-break-word font-medium text-sm uppercase tracking-[0.16em]",
          resolveTextTint(colorScheme),
          sizeClass,
        )}
        data-slot="eyebrow"
        data-style="text"
      >
        <Text
          value={value}
          tag="span"
          placeholder={placeholder}
          isEditing={isEditing}
        />
      </p>
    </div>
  );
}

export default Eyebrow;
