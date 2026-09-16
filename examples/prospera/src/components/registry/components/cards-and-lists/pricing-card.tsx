import { EditableMultilineList } from "@/components/registry/blocks/editable-multiline-list";
import type {
  ItemCardColorBand,
  ItemCardMediaBleed,
  ItemCardProps,
  ItemCardTitleLinkIcon,
} from "@/components/registry/blocks/item-card";
import {
  ItemCard as Card,
  withTitleLinkIcon,
} from "@/components/registry/blocks/item-card";
import { Button } from "@/components/registry/components/ui/cta-button";
import { Badge } from "@/components/registry/primitives/core/badge";
import { Separator } from "@/components/registry/primitives/core/separator";
import {
  TypographyH3,
  TypographyMuted,
} from "@/components/registry/primitives/core/typography";
import type { LinkSource } from "@/components/registry/primitives/editables/link";
import { getSourceText } from "@/components/registry/primitives/editables/source-normalizers";
import {
  Text,
  type TextSource,
} from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import type { CmsProps } from "@/lib/registry/sitecore";

/**
 * Pricing card — leaf rendering for the pricing family. Fields and
 * params map 1:1 to the `pricing-card@1` recipe via `withSitecore`'s
 * default convention map; extends `CmsProps` so `id` / `styles` /
 * `isEditing` are picked up automatically. No sibling `.sitecore.ts`
 * adapter — pure default convention.
 *
 * `features` accepts either a multi-line `TextSource` (the recipe
 * shape — Sitecore stores one row per line) or an already-split
 * `string[]` (search results that never had a field object). The
 * field stays in the tree via {@link EditableMultilineList}.
 */
export interface PricingCardProps extends CmsProps {
  name?: TextSource;
  price?: TextSource;
  /** ISO 4217 currency code — surfaced by downstream formatters. */
  currency?: TextSource | string;
  features?: TextSource | string[];
  /**
   * Mark this plan as recommended. Undefaulted so Sitecore standard
   * values drive the truthy state (see
   * [[feedback-no-react-defaults-for-sitecore-bool-params]]).
   */
  highlighted?: boolean;
  /** Badge copy when `highlighted`. Standard value: `Most popular`. */
  highlightLabel?: TextSource;
  /** Trailing period next to Price when the price is not `Custom`. */
  pricePeriod?: TextSource;
  ctaLabel?: TextSource;
  ctaLink?: LinkSource;
  /**
   * Append the trailing right-arrow adornment to the plan's CTA
   * (`CtaIconTrailing` on the grid). Rides the CTA button's own
   * `showArrow` slot, so the authored label is preserved.
   */
  ctaIconTrailing?: boolean;

  // Chrome axes — pass-through to the shared ItemCard shell.
  elevation?: ItemCardProps["elevation"];
  padding?: ItemCardProps["padding"];
  style?: ItemCardProps["style"];
  cardColorScheme?: ItemCardProps["colorScheme"];
  colorBand?: ItemCardColorBand;
  titleLinkIcon?: ItemCardTitleLinkIcon;
  mediaBleed?: ItemCardMediaBleed;
}

export function PricingCard({
  id,
  styles,
  isEditing,
  name,
  price,
  features,
  highlighted,
  highlightLabel,
  pricePeriod,
  ctaLabel,
  ctaLink,
  ctaIconTrailing,
  elevation,
  padding,
  style,
  cardColorScheme,
  colorBand,
  titleLinkIcon,
  mediaBleed,
}: PricingCardProps) {
  const priceText = getSourceText(price);
  const isCustomPrice = priceText === "Custom";
  return (
    <Card
      id={id}
      elevation={elevation}
      padding={padding ?? "md"}
      style={style}
      colorScheme={cardColorScheme}
      colorBand={colorBand}
      titleLinkIcon={titleLinkIcon}
      mediaBleed={mediaBleed}
      className={cn(
        // No radius class: the Card primitive's `--card-radius` token
        // must drive corner rounding so scanned themes apply.
        "gap-4 border border-border",
        highlighted && "border-primary shadow-md",
        styles?.trimEnd(),
      )}
    >
      <div className="flex items-center justify-between">
        <TypographyH3 className="wrap-break-word text-xl">
          {withTitleLinkIcon(
            <Text value={name} placeholder="Plan" isEditing={isEditing} />,
            titleLinkIcon,
          )}
        </TypographyH3>
        {highlighted && (
          <Badge>
            <Text
              value={highlightLabel ?? "Most popular"}
              placeholder="Most popular"
              isEditing={isEditing}
            />
          </Badge>
        )}
      </div>
      <div className="flex items-baseline gap-1">
        <TypographyH3 className="text-3xl text-foreground">
          <Text value={price} placeholder="Price" isEditing={isEditing} />
        </TypographyH3>
        {!isCustomPrice && (
          <TypographyMuted className="text-sm">
            <Text
              value={pricePeriod ?? "/month"}
              placeholder="/month"
              isEditing={isEditing}
            />
          </TypographyMuted>
        )}
      </div>
      <Button
        link={ctaLink}
        variant={highlighted ? "default" : "outline"}
        showArrow={ctaIconTrailing}
      >
        <Text value={ctaLabel} placeholder="CTA" isEditing={isEditing} />
      </Button>
      <Separator />
      <EditableMultilineList
        value={features}
        isEditing={isEditing}
        placeholder="Features"
      />
    </Card>
  );
}

export default PricingCard;

/** Sitecore default variant. */
export const Default = PricingCard;

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
