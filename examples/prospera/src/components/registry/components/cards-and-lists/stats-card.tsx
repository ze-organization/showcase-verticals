import type {
  ItemCardColorBand,
  ItemCardMediaBleed,
  ItemCardProps,
} from "@/components/registry/blocks/item-card";
import { ItemCard } from "@/components/registry/blocks/item-card";
import { Badge } from "@/components/registry/primitives/core/badge";
import {
  Stat,
  StatChange,
  StatLabel,
  StatValue,
} from "@/components/registry/primitives/core/stat";
import { TypographyMuted } from "@/components/registry/primitives/core/typography";
import { getSourceText } from "@/components/registry/primitives/editables/source-normalizers";
import {
  Text,
  type TextSource,
} from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import type { CmsProps } from "@/lib/registry/sitecore";

/**
 * Single-metric card. Fields map 1:1 to the recipe's PascalCase field
 * names via `withSitecore`'s default convention map (`Label` → `label`,
 * `Value` → `value`, ...) and extends `CmsProps` so the `id` / `styles`
 * / `isEditing` slots are picked up automatically. No sibling
 * `.sitecore.ts` adapter — pure default convention.
 *
 * Curated and search modes in `stats-list-grid` / `stats-carousel`
 * iterate items and spread these same flat fields onto this rendering.
 */
export interface StatsCardProps extends CmsProps {
  label?: TextSource;
  value?: TextSource;
  change?: TextSource;
  context?: TextSource;
  trend?: TextSource;
  /**
   * Optional standalone caption rendered below the big value. Use when a
   * stat has no Change/Trend pairing but still benefits from a short
   * descriptor — e.g. `value: "16 million+"`, `description:
   * "well-protected households"`.
   */
  description?: TextSource;

  /**
   * Chrome axes — names match the convention map's lowerFirst output
   * for the recipe's `Style` / `Elevation` / `Padding` params (spread
   * in via `cardChromeParams`). The `Inner` variant sets these
   * explicitly to the flat-tile treatment (`style="flat"`,
   * `elevation="none"`, `padding="sm"`).
   */
  style?: "flat" | "outline" | "filled" | "elevated";
  elevation?: "theme" | "none" | "xs" | "sm" | "base" | "md" | "lg";
  padding?: "sm" | "md" | "lg";

  /** Card body color scheme — drives outline color when style is outline. */
  cardColorScheme?: ItemCardProps["colorScheme"];
  /** Optional color band rendered above the metric. */
  colorBand?: ItemCardColorBand;
  /** Image bleed axis — accepted for parity, has no visible effect on Stats (no media). */
  mediaBleed?: ItemCardMediaBleed;

  align?: "start" | "center";
  trendDisplay?: "badge" | "text" | "none";
  tone?: "default" | "neutral" | "primary" | "success" | "warning";
  valueSize?: "default" | "large" | "xlarge";
  labelCase?: "default" | "uppercase";
  /**
   * Whether to render the `<StatLabel>` slot. Defaults to `true` so the
   * editing-mode "Metric" empty-hint placeholder still appears when no
   * label content is supplied. Set `false` for editorial "value-first"
   * panels that have no label at all (e.g. northwind.com's "16 million+
   * / well-protected households" stat bar — value + description, no
   * label above).
   */
  showLabel?: boolean;
  /**
   * `FlankedLabel` only (`stat-emphasis@1`): which slot dominates —
   * `value` (default; big number, rotated label on the flank) or
   * `label` (big label text, number on the flank — the "emphasis
   * inverted" read). Other variants ignore it.
   */
  emphasis?: string;
}

type StatsTrend = "up" | "down" | "flat";

const trendStyles: Record<StatsTrend, string> = {
  up: "border-success/30 text-success",
  down: "border-destructive/30 text-destructive",
  flat: "border-border text-muted-foreground",
};

const trendTextStyles: Record<StatsTrend, string> = {
  up: "text-success",
  down: "text-destructive",
  flat: "text-muted-foreground",
};

const toneStyles: Record<NonNullable<StatsCardProps["tone"]>, string> = {
  default: "",
  neutral: "border-border/80 bg-muted/40",
  // Tinted tones carry `surface-tinted` so the muted description/trend
  // text re-derives from the tone color instead of clashing gray-on-tint.
  primary:
    "border-primary/30 bg-primary-background/60 surface-tinted [--surface-tint:var(--color-primary)]",
  success:
    "border-success/30 bg-success-background/60 surface-tinted [--surface-tint:var(--color-success)]",
  warning:
    "border-warning/30 bg-warning-background/60 surface-tinted [--surface-tint:var(--color-warning)]",
};

function resolveTrend(
  trend: TextSource | undefined,
  change: TextSource | undefined,
): StatsTrend {
  const t = getSourceText(trend)?.toLowerCase();
  if (t === "up" || t === "positive" || t === "increase") return "up";
  if (t === "down" || t === "negative" || t === "decrease") return "down";

  const changeText = getSourceText(change);
  if (changeText?.startsWith("+")) return "up";
  if (changeText?.startsWith("-")) return "down";

  return "flat";
}

export function StatsCard({
  id,
  styles,
  label,
  value,
  change,
  context,
  trend,
  description,
  style,
  elevation,
  padding,
  cardColorScheme,
  colorBand,
  mediaBleed,
  align = "start",
  trendDisplay = "badge",
  tone = "default",
  valueSize = "default",
  labelCase = "default",
  showLabel = true,
}: StatsCardProps) {
  const resolvedTrend = resolveTrend(trend, change);
  const hasChange = Boolean(getSourceText(change));
  const contextText = getSourceText(context) ?? "vs last month";
  const centerAligned = align === "center";
  const showTrend = trendDisplay !== "none";
  // Explicit per-axis defaults — the Default variant renders an
  // outline/theme/md card shell; the `Inner` variant passes its own
  // flat/none/sm axes.
  const effectiveStyle = style ?? "outline";
  const effectiveElevation = elevation ?? "theme";
  const effectivePadding = padding ?? "md";

  const valueSizeClass =
    valueSize === "xlarge"
      ? "text-4xl md:text-5xl"
      : valueSize === "large"
        ? "text-3xl md:text-4xl"
        : "";

  const labelCaseClass =
    labelCase === "uppercase" ? "uppercase tracking-wide" : "";

  return (
    <ItemCard
      id={id}
      style={effectiveStyle}
      elevation={effectiveElevation}
      padding={effectivePadding}
      colorScheme={cardColorScheme}
      colorBand={colorBand}
      mediaBleed={mediaBleed}
      className={cn("gap-3", toneStyles[tone], styles?.trimEnd())}
    >
      <Stat className={cn(centerAligned && "items-center text-center")}>
        {showLabel && (
          <StatLabel className={labelCaseClass}>
            {label ? (
              <Text value={label} tag="span" />
            ) : (
              <span className="is-empty-hint">Metric</span>
            )}
          </StatLabel>
        )}
        <StatValue className={valueSizeClass}>
          {value ? (
            <Text value={value} tag="span" />
          ) : (
            <span className="is-empty-hint">0</span>
          )}
        </StatValue>
        {description ? (
          <TypographyMuted className="text-sm leading-snug">
            <Text value={description} tag="span" />
          </TypographyMuted>
        ) : null}
        {hasChange && showTrend && (
          <StatChange className={cn(centerAligned && "justify-center")}>
            {trendDisplay === "text" ? (
              <TypographyMuted
                className={cn("font-medium", trendTextStyles[resolvedTrend])}
              >
                <Text value={change as TextSource} tag="span" />
              </TypographyMuted>
            ) : (
              <Badge
                variant="outline"
                className={cn("font-medium", trendStyles[resolvedTrend])}
              >
                <Text value={change as TextSource} tag="span" />
              </Badge>
            )}
            <TypographyMuted className="text-xs">{contextText}</TypographyMuted>
          </StatChange>
        )}
      </Stat>
    </ItemCard>
  );
}

export default StatsCard;

/** Sitecore default variant — outline card shell. */
export const Default = StatsCard;

/**
 * Flat / "inner" treatment for use inside dense parent containers. Same
 * composition as Default; only the card shell changes (per
 * [[feedback-variant-vs-parameter]] — topology difference is a real
 * variant, not a style flag).
 */
export function Inner(props: Omit<StatsCardProps, "style">) {
  return (
    <StatsCard
      {...props}
      style="flat"
      elevation={props.elevation ?? "none"}
      padding={props.padding ?? "sm"}
    />
  );
}

/**
 * Normalize the `stat-emphasis@1` value; unknown/empty → `value`.
 * Shared with the stats-list-grid `Milestones` band, which reuses the
 * same value-vs-label weighting vocabulary.
 */
export function parseStatEmphasis(
  value: string | undefined,
): "value" | "label" {
  return value?.trim().toLowerCase() === "label" ? "label" : "value";
}

/**
 * FlankedLabel — the editorial stat-band unit (Diageo / ONEOK / SUSE):
 * a vertically-rotated flank text runs up the stat's start edge beside
 * the dominant element. The `Emphasis` param decides the pairing:
 *
 *   `value` (default)  rotated label on the flank, big number as the
 *                      dominant element, optional description below —
 *                      the number-primary band.
 *   `label`            rotated number on the flank, big label text as
 *                      the dominant element — the inverted-emphasis
 *                      read (Allstate).
 *
 * No card chrome — the unit is designed for edge-to-edge bands where
 * the section surface provides the color field. `writing-mode:
 * vertical-rl` + `rotate-180` makes the flank read bottom-up, the
 * conventional direction for flank labels.
 */
export function FlankedLabel({
  id,
  styles,
  label,
  value,
  description,
  emphasis,
  isEditing,
}: StatsCardProps) {
  const emphasisMode = parseStatEmphasis(emphasis);
  const labelNode = label ? (
    <Text value={label} tag="span" isEditing={isEditing} />
  ) : (
    <span className="is-empty-hint">Metric</span>
  );
  const valueNode = value ? (
    <Text value={value} tag="span" isEditing={isEditing} />
  ) : (
    <span className="is-empty-hint">0</span>
  );
  const flankNode = emphasisMode === "value" ? labelNode : valueNode;
  const primaryNode = emphasisMode === "value" ? valueNode : labelNode;
  return (
    <div
      id={id ?? undefined}
      data-slot="stats-card"
      data-emphasis={emphasisMode}
      className={cn("flex items-stretch gap-3", styles?.trimEnd())}
    >
      {/* Real content, not decoration — stays in the a11y tree; the
          rotation is purely visual. */}
      <span className="rotate-180 self-stretch border-current/30 border-e pe-2 font-medium text-xs uppercase tracking-widest opacity-70 [writing-mode:vertical-rl]">
        {flankNode}
      </span>
      <div className="flex min-w-0 flex-col justify-center gap-1">
        <span
          className={cn(
            "wrap-break-word font-bold font-heading leading-none tracking-tight",
            emphasisMode === "value"
              ? "text-5xl md:text-6xl"
              : "text-2xl md:text-3xl",
          )}
        >
          {primaryNode}
        </span>
        {description ? (
          <span className="text-sm opacity-80">
            <Text value={description} tag="span" isEditing={isEditing} />
          </span>
        ) : null}
      </div>
    </div>
  );
}

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
