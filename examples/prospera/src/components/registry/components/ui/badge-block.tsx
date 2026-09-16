import { Badge } from "@/components/registry/primitives/core/badge";
import {
  Text,
  type TextSource,
} from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import type { CmsProps } from "@/lib/registry/sitecore";

export interface BadgeBlockProps extends CmsProps {
  /** Badge label. Accepts a plain string or a CMS field — `<Text>` handles both. */
  label?: TextSource;
  variant?: "default" | "bold" | "outline" | "rounded" | "rounded-bold";
  /**
   * Mirrors the shared `size@1` Sitecore enum. `"default"` resolves to
   * `md` — badge's natural default — per the
   * "each component owns the meaning of Default" convention on `size@1`.
   */
  size?: "default" | "xs" | "sm" | "md" | "lg" | "xl";
  colorScheme?:
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
    | "accent-3"
    | "success"
    | "warning"
    | "destructive";
  /**
   * Macro treatment (`badge-style@1`): `pill` (default) is the classic
   * filled chip; `eyebrow` is the editorial text-only uppercase tracked
   * label tinted by `colorScheme` — identical to the shared
   * `blocks/eyebrow.tsx` text mode. Accepts a raw Sitecore enum string
   * (anything other than `"eyebrow"` is treated as `"pill"`).
   */
  style?: "pill" | "eyebrow" | string;
  // TODO: wire an icon affordance through to the Badge primitive — needs
  // a Sitecore-side enum (icon@1) + an icon-position param, mirroring
  // how CtaButton will expose leading/trailing slots.
  icon?: React.ReactNode;
}

/**
 * Badge block built from the Badge primitive. CMS-agnostic at the file
 * level — accepts either raw values or polymorphic field sources, so the
 * same component works in standalone and CMS-driven contexts.
 *
 * The Sitecore registration happens in the consumer's component map via
 * `withSitecore(BadgeBlock)` — this file knows nothing about the
 * layout-service `{fields, params}` envelope.
 */
export function BadgeBlock({
  label,
  variant = "default",
  size = "md",
  colorScheme = "neutral",
  style = "pill",
  styles,
  isEditing,
}: BadgeBlockProps) {
  const resolvedSize = size === "default" ? "md" : size;
  // Sitecore delivers the Style param as a raw string — whitelist
  // `eyebrow`, everything else (empty / unknown / "pill") is the chip.
  const badgeStyle =
    typeof style === "string" && style.trim().toLowerCase() === "eyebrow"
      ? "eyebrow"
      : "pill";
  return (
    <Badge
      variant={variant}
      size={resolvedSize}
      colorScheme={colorScheme}
      badgeStyle={badgeStyle}
      className={cn(styles?.trimEnd())}
    >
      <Text
        tag="span"
        value={label}
        placeholder="Label"
        isEditing={isEditing}
      />
    </Badge>
  );
}

export default BadgeBlock;

// Sitecore default variant. Visual differentiation (bold / outline /
// rounded / etc.) lives on the CVA `variant` prop per the
// variant-vs-parameter rule.
export const Default = BadgeBlock;

// Mark this component as universal so the SDK's component-map
// generator includes it in BOTH the server map and the client map.
// Without this marker the generator treats the file as server-only,
// which makes runtime `<Placeholder>` lookups (e.g. inside
// `row-splitter` and other client components) fail with "unknown
// component badge-block."
export const componentType = "universal";
