import type { ReactNode } from "react";
// Import from the concrete module, not the blocks barrel — the barrel
// would pull the whole blocks tier into status-list's install fan-out.
import { EmptyHint } from "@/components/registry/blocks/listing-section";
import { SectionHeading } from "@/components/registry/blocks/section-heading";
import { resolveListingHeading } from "@/components/registry/blocks/section-heading.parsers";
import { TypographyMuted } from "@/components/registry/primitives/core/typography";
import {
  Link,
  type LinkSource,
} from "@/components/registry/primitives/editables/link";
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
  resolveSectionSurfaceClass,
  SECTION_MAX_WIDTH_CLASSES,
  SECTION_PADDING_Y_CLASSES,
  type SectionSurfaceProps,
} from "@/lib/registry/section-surface";
import { resolvedPlaceholderName } from "@/lib/registry/placeholder-children";
import { renderingHasComposedChildren } from "@/lib/registry/search/use-resolved-list-items";
import {
  type ComponentRendering,
  Placeholder,
} from "@/lib/registry/sitecore";
import {
  buildGridClassName,
  type FeaturedFirst,
  type GridGap,
  type GridPattern,
} from "./_grid-classname";

/**
 * `status-list` — a generic status / incident / live-metric list.
 *
 * Each row (or tile) has a **subject** (a label, optionally typed as a
 * location or a service), a **status badge** (with a semantic tone),
 * and a **metric** (a value + optional unit + a small caption). It
 * serves grid-operations dashboards (live load / reserve tiles),
 * outage boards (region + customers affected), and any service-status
 * surface — the subject and metric are deliberately un-opinionated.
 *
 * Two rendering shapes share one body:
 *   - `Grid` → metric-forward tiles (big value + badge), 2–4 up.
 *   - `List` → dense incident rows (subject + badge + metric + link).
 *
 * Curated items flow via the `Statuses` Treelist (flattened by the
 * component map); the file stays runnable with plain values so it
 * previews in Storybook without a Sitecore payload.
 */

/** Semantic tone for the status badge. Mirrors `status-tone@1`. */
export type StatusTone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "destructive";

export interface StatusListItem {
  id?: string;
  /** The thing being reported on — a region, a service, a metric name. */
  subject?: TextSource;
  /** Optional qualifier shown under the subject (e.g. "Service", "Region"). */
  subjectType?: TextSource;
  /** Badge label, e.g. "Active", "Restored", "Warning", "Normal". */
  status?: TextSource;
  /** Badge color. Defaults to `neutral`. */
  statusTone?: StatusTone;
  /** The headline metric value, e.g. "68,245" or "12,500". */
  value?: TextSource;
  /** Optional unit appended to the value, e.g. "MW", "%", "customers". */
  unit?: TextSource;
  /** Small caption under the metric, e.g. "since 3:42 PM". */
  metricLabel?: TextSource;
  /** Optional details link. */
  link?: LinkSource;
}

export interface StatusListProps extends SectionSurfaceProps {
  title?: TextSource;
  lead?: TextSource;
  items?: StatusListItem[];
  /** Composed-mode placeholder children (Sitecore SDK injects these). */
  children?: ReactNode;
  /** Layout-service envelope for the `cards-statuses-{*}` slot. */
  rendering?: ComponentRendering;
  /** Raw `HeadingLayout` param (`heading-layout@1`). */
  headingLayout?: string;
  /** Raw `HeadingSize` param (`heading-size@1`). */
  headingSize?: string;
  columnsLg?: number;
  columnsMd?: number;
  columnsSm?: number;
  gap?: GridGap;
  /**
   * `featured-first@1` lead-tile treatment. `Grid` only — the `List`
   * variant renders stacked rows, not a grid.
   */
  featuredFirst?: FeaturedFirst;
  /** `grid-pattern@1` tile rhythm. `Grid` only. Supersedes `featuredFirst`. */
  gridPattern?: GridPattern;
  /** Empty-state copy shown when no statuses resolve. */
  emptyStateMessage?: TextSource;
  className?: string;
  id?: string;
  isEditing?: boolean;
}

const BADGE_TONE_CLASS: Record<StatusTone, string> = {
  neutral: "bg-muted text-muted-foreground ring-border",
  info: "bg-info/15 text-info ring-info/30",
  success: "bg-success/15 text-success ring-success/30",
  warning: "bg-warning/15 text-warning ring-warning/40",
  destructive: "bg-destructive/15 text-destructive ring-destructive/30",
};

function StatusBadge({
  status,
  tone,
  isEditing,
}: {
  status?: TextSource;
  tone: StatusTone;
  isEditing?: boolean;
}) {
  if (!status || !getSourceText(status)) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-medium text-xs uppercase tracking-wide ring-1 ring-inset",
        BADGE_TONE_CLASS[tone],
      )}
      data-status-tone={tone}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      <Text value={status} tag="span" isEditing={isEditing} />
    </span>
  );
}

function Metric({
  value,
  unit,
  metricLabel,
  large,
  isEditing,
}: {
  value?: TextSource;
  unit?: TextSource;
  metricLabel?: TextSource;
  large?: boolean;
  isEditing?: boolean;
}) {
  if (!value || !getSourceText(value)) return null;
  return (
    <div className={cn(large ? "mt-3" : "text-end")}>
      <div className="flex items-baseline gap-1">
        <span
          className={cn(
            "font-bold font-heading tracking-tight",
            large ? "text-4xl md:text-5xl" : "text-xl",
          )}
        >
          <Text value={value} tag="span" isEditing={isEditing} />
        </span>
        {unit && getSourceText(unit) ? (
          <span className="font-medium text-current/60 text-sm">
            <Text value={unit} tag="span" isEditing={isEditing} />
          </span>
        ) : null}
      </div>
      {metricLabel && getSourceText(metricLabel) ? (
        <div className="mt-0.5 text-current/60 text-xs">
          <Text value={metricLabel} tag="span" isEditing={isEditing} />
        </div>
      ) : null}
    </div>
  );
}

function TileCard({
  item,
  isEditing,
}: {
  item: StatusListItem;
  isEditing?: boolean;
}) {
  return (
    <div className="flex flex-col rounded-(--card-radius,var(--radius-xl)) border border-border bg-card p-5 text-card-foreground shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {item.subject && getSourceText(item.subject) ? (
            <div className="font-medium text-sm">
              <Text value={item.subject} tag="span" isEditing={isEditing} />
            </div>
          ) : null}
          {item.subjectType && getSourceText(item.subjectType) ? (
            <TypographyMuted className="text-xs uppercase tracking-wide">
              <Text value={item.subjectType} tag="span" isEditing={isEditing} />
            </TypographyMuted>
          ) : null}
        </div>
        <StatusBadge
          status={item.status}
          tone={item.statusTone ?? "neutral"}
          isEditing={isEditing}
        />
      </div>
      <Metric
        value={item.value}
        unit={item.unit}
        metricLabel={item.metricLabel}
        large
        isEditing={isEditing}
      />
      {item.link && !isEmptySource(item.link) ? (
        <div className="mt-4 [&_a]:font-medium [&_a]:text-primary [&_a]:text-sm">
          <Link value={item.link} isEditing={isEditing} />
        </div>
      ) : null}
    </div>
  );
}

function Row({
  item,
  isEditing,
}: {
  item: StatusListItem;
  isEditing?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4 border-border border-b py-4 last:border-b-0">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3">
          {item.subject && getSourceText(item.subject) ? (
            <span className="font-medium">
              <Text value={item.subject} tag="span" isEditing={isEditing} />
            </span>
          ) : null}
          <StatusBadge
            status={item.status}
            tone={item.statusTone ?? "neutral"}
            isEditing={isEditing}
          />
        </div>
        {item.subjectType && getSourceText(item.subjectType) ? (
          <TypographyMuted className="mt-0.5 text-sm">
            <Text value={item.subjectType} tag="span" isEditing={isEditing} />
          </TypographyMuted>
        ) : null}
      </div>
      <Metric
        value={item.value}
        unit={item.unit}
        metricLabel={item.metricLabel}
        isEditing={isEditing}
      />
      {item.link && !isEmptySource(item.link) ? (
        <div className="[&_a]:font-medium [&_a]:text-primary [&_a]:text-sm">
          <Link value={item.link} isEditing={isEditing} />
        </div>
      ) : null}
    </div>
  );
}

function StatusListSection({
  title,
  lead,
  headingLayout,
  headingSize,
  colorScheme = "default",
  backgroundIntensity = "subtle",
  paddingY = "auto",
  maxWidth = "auto",
  children,
}: SectionSurfaceProps & {
  title?: TextSource;
  lead?: TextSource;
  headingLayout?: string;
  headingSize?: string;
  children: ReactNode;
}) {
  const hasHeading =
    (title && getSourceText(title)) || (lead && getSourceText(lead));
  // Same construction path every sibling listing uses, so the
  // heading-layout@1 / heading-size@1 vocabulary can't drift here.
  const heading = resolveListingHeading<TextSource>({
    title,
    lead,
    headingLayout,
    headingSize,
  });
  return (
    <section
      className={cn(
        "component status-list w-full",
        paddingY === "auto"
          ? "py-12 md:py-16"
          : SECTION_PADDING_Y_CLASSES[paddingY],
        resolveSectionSurfaceClass(colorScheme, backgroundIntensity),
      )}
      data-slot="status-list"
    >
      <div
        className={cn(
          "container mx-auto flex flex-col gap-8 px-4",
          maxWidth !== "auto" && SECTION_MAX_WIDTH_CLASSES[maxWidth],
        )}
      >
        {hasHeading ? <SectionHeading {...heading} /> : null}
        {children}
      </div>
    </section>
  );
}

/** Metric-forward tiles (big value + badge), responsive grid. */
export function Grid({
  title,
  lead,
  headingLayout,
  headingSize,
  items = [],
  columnsLg = 4,
  columnsMd = 2,
  columnsSm = 1,
  gap = "md",
  featuredFirst = "none",
  gridPattern = "uniform",
  emptyStateMessage,
  isEditing,
  rendering,
  colorScheme,
  backgroundIntensity,
  paddingY,
  maxWidth,
}: StatusListProps) {
  return (
    <StatusListSection
      title={title}
      lead={lead}
      headingLayout={headingLayout}
      headingSize={headingSize}
      colorScheme={colorScheme}
      backgroundIntensity={backgroundIntensity}
      paddingY={paddingY}
      maxWidth={maxWidth}
    >
      {items.length > 0 && !renderingHasComposedChildren(rendering) ? (
        <div
          className={buildGridClassName({
            columnsLg,
            columnsMd,
            columnsSm,
            gap,
            featuredFirst,
            gridPattern,
          })}
        >
          {items.map((item, i) => (
            <TileCard
              key={item.id ?? `status-${i}`}
              item={item}
              isEditing={isEditing}
            />
          ))}
        </div>
      ) : rendering ? (
        <Placeholder
          name={resolvedPlaceholderName(rendering, "cards-statuses-{*}")}
          rendering={rendering}
        />
      ) : (
        <EmptyHint message={emptyStateMessage}>Statuses</EmptyHint>
      )}
    </StatusListSection>
  );
}

/** Dense incident rows (subject + badge + metric + link). */
export function List({
  title,
  lead,
  headingLayout,
  headingSize,
  items = [],
  emptyStateMessage,
  isEditing,
  rendering,
  colorScheme,
  backgroundIntensity,
  paddingY,
  maxWidth,
}: StatusListProps) {
  return (
    <StatusListSection
      title={title}
      lead={lead}
      headingLayout={headingLayout}
      headingSize={headingSize}
      colorScheme={colorScheme}
      backgroundIntensity={backgroundIntensity}
      paddingY={paddingY}
      maxWidth={maxWidth}
    >
      {items.length > 0 && !renderingHasComposedChildren(rendering) ? (
        <div className="rounded-(--card-radius,var(--radius-xl)) border border-border bg-card px-5 text-card-foreground shadow-sm">
          {items.map((item, i) => (
            <Row
              key={item.id ?? `status-${i}`}
              item={item}
              isEditing={isEditing}
            />
          ))}
        </div>
      ) : rendering ? (
        <Placeholder
          name={resolvedPlaceholderName(rendering, "cards-statuses-{*}")}
          rendering={rendering}
        />
      ) : (
        <EmptyHint message={emptyStateMessage}>Statuses</EmptyHint>
      )}
    </StatusListSection>
  );
}

export const Default = List;

export const componentType = "universal";
