import type { ReactNode } from "react";
import {
  TypographyH2,
  TypographyMuted,
} from "@/components/registry/primitives/core/typography";
import {
  type ImageSource,
  NextImage,
} from "@/components/registry/primitives/editables/image";
import {
  Link,
  type LinkSource,
} from "@/components/registry/primitives/editables/link";
import {
  getLinkHref,
  getSourceText,
  isEmptySource,
} from "@/components/registry/primitives/editables/source-normalizers";
import {
  Text,
  type TextSource,
} from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import {
  type SurfaceTone,
  surfaceToneClass,
} from "@/lib/registry/color-scheme-classes";
import {
  SECTION_PADDING_Y_CLASSES,
  type SectionPaddingY,
} from "@/lib/registry/section-surface";
import type { CmsProps } from "@/lib/registry/sitecore";

/**
 * `versus-list` — a date-groupable list of two-party matchup rows.
 *
 * Each row pairs **party A** and **party B** (name + optional badge
 * image) around a **center value** — a score ("2 – 1"), a start time
 * ("18:00"), or any short status text — with a **status token**
 * (upcoming / live / finished), a **meta line** (competition, venue,
 * category, moderator), and an optional per-row **link**. It models
 * fixtures and results, but equally debates, comparisons, versus
 * polls, and head-to-heads — the parties are deliberately
 * un-opinionated.
 *
 * Three rendering shapes share one body:
 *   - `Default` → stacked rows, optionally grouped by date label.
 *   - `Cards`   → each matchup as a card in a responsive grid.
 *   - `Ticker`  → compact single-row auto-scrolling strip (the live
 *     score-ticker archetype, generic for any two-party rows).
 *
 * Curated items flow via the `Items` Treelist (flattened by the
 * component map); the file stays runnable with plain values so it
 * previews without a Sitecore payload.
 */

/** Generic lifecycle token for a matchup. */
export type VersusStatus = "upcoming" | "live" | "finished";

export interface VersusListItem {
  id?: string;
  /** First party name. */
  partyAName?: TextSource;
  /** First party badge / crest / avatar image. */
  partyABadge?: ImageSource;
  /** Second party name. */
  partyBName?: TextSource;
  /** Second party badge / crest / avatar image. */
  partyBBadge?: ImageSource;
  /** Center value — a score ("2 – 1"), a time ("18:00"), or short text. */
  centerValue?: TextSource;
  /** Lifecycle token driving the status badge. */
  status?: VersusStatus;
  /** Optional custom label for the status badge (defaults per status). */
  statusLabel?: TextSource;
  /** Meta line — competition, venue, category, round. */
  meta?: TextSource;
  /** Date label used as the group heading when grouping is enabled. */
  dateLabel?: TextSource;
  /** Optional details link for the row. */
  link?: LinkSource;
}

export type VersusPanelStyle = "card" | "flat";

export interface VersusListProps extends CmsProps {
  title?: TextSource;
  lead?: TextSource;
  items?: VersusListItem[];
  /** Group rows under their `dateLabel` headings. */
  groupByDate?: boolean;
  /** Columns at the lg breakpoint (Cards variant only). */
  columns?: 2 | 3 | 4;
  /** Background tone of the section. */
  surfaceTone?: SurfaceTone;
  /**
   * Chrome around the rows (`panel-style@1`): `card` (default) wraps
   * rows in a bordered elevated panel; `flat` drops border/bg/shadow
   * so rows sit directly on the section surface. Default + Cards
   * variants only — Ticker has no panel.
   */
  panelStyle?: VersusPanelStyle;
  /** Vertical padding around the section (`padding-y@1`). Ticker keeps its strip padding. */
  paddingY?: SectionPaddingY;
  className?: string;
}

const STATUS_DEFAULT_LABEL: Record<VersusStatus, string> = {
  upcoming: "Upcoming",
  live: "Live",
  finished: "Finished",
};

/**
 * Soft status-badge surfaces per the color-roles contract
 * (`bg-<X>-background` + `text-<X>`, or `bg-muted` + muted text).
 */
const STATUS_BADGE_CLASS: Record<VersusStatus, string> = {
  upcoming: "bg-info-background text-info",
  live: "bg-destructive-background text-destructive",
  finished: "bg-muted text-muted-foreground",
};

function StatusBadge({
  status = "upcoming",
  statusLabel,
  isEditing,
}: {
  status?: VersusStatus;
  statusLabel?: TextSource;
  isEditing?: boolean;
}) {
  const hasCustomLabel = statusLabel && getSourceText(statusLabel);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-medium text-xs uppercase tracking-wide",
        STATUS_BADGE_CLASS[status],
      )}
      data-status={status}
    >
      {status === "live" ? (
        <span
          aria-hidden="true"
          className="size-1.5 animate-pulse rounded-full bg-current"
        />
      ) : null}
      {hasCustomLabel ? (
        <Text value={statusLabel} tag="span" isEditing={isEditing} />
      ) : (
        STATUS_DEFAULT_LABEL[status]
      )}
    </span>
  );
}

function PartyBadge({
  badge,
  isEditing,
}: {
  badge?: ImageSource;
  isEditing?: boolean;
}) {
  if (!badge || isEmptySource(badge)) return null;
  return (
    <NextImage
      value={badge}
      width={32}
      height={32}
      className="size-8 shrink-0 rounded-full object-contain"
      isEditing={isEditing}
    />
  );
}

function Party({
  name,
  badge,
  side,
  isEditing,
}: {
  name?: TextSource;
  badge?: ImageSource;
  side: "a" | "b";
  isEditing?: boolean;
}) {
  return (
    <span
      className={cn(
        "flex min-w-0 flex-1 items-center gap-2.5",
        side === "a" ? "justify-end text-end" : "justify-start text-start",
      )}
    >
      {side === "b" ? <PartyBadge badge={badge} isEditing={isEditing} /> : null}
      <span className="truncate font-medium">
        <Text value={name} tag="span" isEditing={isEditing} />
      </span>
      {side === "a" ? <PartyBadge badge={badge} isEditing={isEditing} /> : null}
    </span>
  );
}

function CenterValue({
  value,
  emphasised,
  isEditing,
}: {
  value?: TextSource;
  emphasised?: boolean;
  isEditing?: boolean;
}) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-md bg-muted px-3 py-1 text-center font-bold tabular-nums",
        emphasised ? "text-xl" : "text-base",
      )}
    >
      <Text value={value} tag="span" isEditing={isEditing} />
    </span>
  );
}

function MatchupCore({
  item,
  emphasised,
  isEditing,
}: {
  item: VersusListItem;
  emphasised?: boolean;
  isEditing?: boolean;
}) {
  return (
    <span className="flex w-full items-center gap-3">
      <Party
        name={item.partyAName}
        badge={item.partyABadge}
        side="a"
        isEditing={isEditing}
      />
      <CenterValue
        value={item.centerValue}
        emphasised={emphasised}
        isEditing={isEditing}
      />
      <Party
        name={item.partyBName}
        badge={item.partyBBadge}
        side="b"
        isEditing={isEditing}
      />
    </span>
  );
}

function RowMeta({
  item,
  isEditing,
}: {
  item: VersusListItem;
  isEditing?: boolean;
}) {
  const hasMeta = item.meta && getSourceText(item.meta);
  const hasLink = item.link && !isEmptySource(item.link);
  if (!hasMeta && !hasLink) return null;
  return (
    <span className="flex items-center justify-center gap-3 text-muted-foreground text-xs">
      {hasMeta ? (
        <Text value={item.meta} tag="span" isEditing={isEditing} />
      ) : null}
      {hasLink ? (
        <span className="[&_a]:font-medium [&_a]:text-primary">
          <Link value={item.link} isEditing={isEditing} />
        </span>
      ) : null}
    </span>
  );
}

function VersusRow({
  item,
  isEditing,
}: {
  item: VersusListItem;
  isEditing?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 border-border border-b py-4 last:border-b-0">
      <div className="flex items-center gap-3">
        <MatchupCore item={item} isEditing={isEditing} />
        <StatusBadge
          status={item.status}
          statusLabel={item.statusLabel}
          isEditing={isEditing}
        />
      </div>
      <RowMeta item={item} isEditing={isEditing} />
    </div>
  );
}

function VersusCard({
  item,
  panelStyle = "card",
  isEditing,
}: {
  item: VersusListItem;
  panelStyle?: VersusPanelStyle;
  isEditing?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 p-5",
        panelStyle === "card" &&
          "rounded-(--card-radius,var(--radius-xl)) border border-border bg-card text-card-foreground shadow-sm",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        {item.dateLabel && getSourceText(item.dateLabel) ? (
          <span className="text-muted-foreground text-xs uppercase tracking-wide">
            <Text value={item.dateLabel} tag="span" isEditing={isEditing} />
          </span>
        ) : (
          <span />
        )}
        <StatusBadge
          status={item.status}
          statusLabel={item.statusLabel}
          isEditing={isEditing}
        />
      </div>
      <MatchupCore item={item} emphasised isEditing={isEditing} />
      <RowMeta item={item} isEditing={isEditing} />
    </div>
  );
}

function VersusListSection({
  title,
  lead,
  surfaceTone = "none",
  paddingY = "auto",
  id,
  styles,
  className,
  isEditing,
  children,
}: {
  title?: TextSource;
  lead?: TextSource;
  surfaceTone?: SurfaceTone;
  paddingY?: SectionPaddingY;
  id?: string;
  styles?: string;
  className?: string;
  isEditing?: boolean;
  children: ReactNode;
}) {
  const hasHeading =
    (title && getSourceText(title)) || (lead && getSourceText(lead));
  return (
    <section
      className={cn(
        "component versus-list w-full",
        // `auto` (recipe default) → the section's natural responsive
        // ramp; a concrete token takes over.
        paddingY === "auto"
          ? "py-12 md:py-16"
          : SECTION_PADDING_Y_CLASSES[paddingY],
        surfaceToneClass(surfaceTone),
        className,
        styles?.trimEnd(),
      )}
      id={id ?? undefined}
      data-slot="versus-list"
    >
      <div className="container mx-auto flex flex-col gap-8 px-4">
        {hasHeading ? (
          <div className="flex flex-col gap-2">
            {title && getSourceText(title) ? (
              <TypographyH2 className="font-heading tracking-tight">
                <Text value={title} tag="span" isEditing={isEditing} />
              </TypographyH2>
            ) : null}
            {lead && getSourceText(lead) ? (
              <TypographyMuted className="max-w-2xl text-pretty text-lg">
                <Text value={lead} tag="span" isEditing={isEditing} />
              </TypographyMuted>
            ) : null}
          </div>
        ) : null}
        {children}
      </div>
    </section>
  );
}

/**
 * Group items by their `dateLabel` text, preserving first-seen order.
 * Items without a label land in a trailing unlabelled group.
 */
function groupItems(
  items: VersusListItem[],
): { label: string; items: VersusListItem[] }[] {
  const groups = new Map<string, VersusListItem[]>();
  for (const item of items) {
    const label = getSourceText(item.dateLabel) ?? "";
    const bucket = groups.get(label);
    if (bucket) {
      bucket.push(item);
    } else {
      groups.set(label, [item]);
    }
  }
  return Array.from(groups, ([label, groupedItems]) => ({
    label,
    items: groupedItems,
  }));
}

const CARD_COLUMNS_CLASS: Record<2 | 3 | 4, string> = {
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
};

/** Stacked rows, optionally grouped under date-label headings. */
export function Default({
  title,
  lead,
  items = [],
  groupByDate = false,
  surfaceTone = "none",
  panelStyle = "card",
  paddingY,
  className,
  id,
  styles,
  isEditing,
}: VersusListProps) {
  const groups = groupByDate
    ? groupItems(items)
    : [{ label: "", items: items }];
  return (
    <VersusListSection
      title={title}
      lead={lead}
      surfaceTone={surfaceTone}
      paddingY={paddingY}
      id={id}
      styles={styles}
      className={className}
      isEditing={isEditing}
    >
      <div className="flex flex-col gap-6">
        {groups.map((group, groupIndex) => (
          <div
            key={group.label || `group-${groupIndex}`}
            className="flex flex-col gap-1"
          >
            {group.label ? (
              <h3 className="font-medium text-muted-foreground text-sm uppercase tracking-wide">
                {group.label}
              </h3>
            ) : null}
            <div
              className={cn(
                panelStyle === "card" &&
                  "rounded-(--card-radius,var(--radius-xl)) border border-border bg-card px-5 text-card-foreground shadow-sm",
              )}
            >
              {group.items.map((item, i) => (
                <VersusRow
                  key={item.id ?? `versus-${groupIndex}-${i}`}
                  item={item}
                  isEditing={isEditing}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </VersusListSection>
  );
}

/** Each matchup as a card in a responsive grid. */
export function Cards({
  title,
  lead,
  items = [],
  columns = 3,
  surfaceTone = "none",
  panelStyle = "card",
  paddingY,
  className,
  id,
  styles,
  isEditing,
}: VersusListProps) {
  return (
    <VersusListSection
      title={title}
      lead={lead}
      surfaceTone={surfaceTone}
      paddingY={paddingY}
      id={id}
      styles={styles}
      className={className}
      isEditing={isEditing}
    >
      <div
        className={cn(
          "grid grid-cols-1 gap-4 md:grid-cols-2",
          CARD_COLUMNS_CLASS[columns],
        )}
      >
        {items.map((item, i) => (
          <VersusCard
            key={item.id ?? `versus-${i}`}
            item={item}
            panelStyle={panelStyle}
            isEditing={isEditing}
          />
        ))}
      </div>
    </VersusListSection>
  );
}

/** Subtle status dot for the ticker — role text colors, dot via bg-current. */
const TICKER_STATUS_DOT_CLASS: Record<VersusStatus, string> = {
  upcoming: "text-info",
  live: "text-destructive animate-pulse",
  finished: "text-muted-foreground",
};

function TickerBadge({
  badge,
  isEditing,
}: {
  badge?: ImageSource;
  isEditing?: boolean;
}) {
  if (!badge || isEmptySource(badge)) return null;
  return (
    <NextImage
      value={badge}
      width={20}
      height={20}
      className="size-5 shrink-0 rounded-full object-contain"
      isEditing={isEditing}
    />
  );
}

function TickerEntry({
  item,
  isEditing,
}: {
  item: VersusListItem;
  isEditing?: boolean;
}) {
  const href = getLinkHref(item.link);
  const body = (
    <>
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 shrink-0 rounded-full bg-current",
          TICKER_STATUS_DOT_CLASS[item.status ?? "upcoming"],
        )}
        data-status={item.status ?? "upcoming"}
      />
      <TickerBadge badge={item.partyABadge} isEditing={isEditing} />
      <span className="font-medium text-sm">
        <Text value={item.partyAName} tag="span" isEditing={isEditing} />
      </span>
      <span className="rounded bg-muted px-2 py-0.5 font-bold text-sm tabular-nums">
        <Text value={item.centerValue} tag="span" isEditing={isEditing} />
      </span>
      <span className="font-medium text-sm">
        <Text value={item.partyBName} tag="span" isEditing={isEditing} />
      </span>
      <TickerBadge badge={item.partyBBadge} isEditing={isEditing} />
    </>
  );
  const entryClass = "inline-flex items-center gap-2 whitespace-nowrap";
  if (href && !isEditing) {
    return (
      <a href={href} className={cn(entryClass, "hover:underline")}>
        {body}
      </a>
    );
  }
  return <span className={entryClass}>{body}</span>;
}

function TickerGroup({
  items,
  isClone,
  isEditing,
}: {
  items: VersusListItem[];
  isClone?: boolean;
  isEditing?: boolean;
}) {
  return (
    <ul
      aria-hidden={isClone || undefined}
      className={cn(
        "flex shrink-0 items-center",
        isClone && "motion-reduce:hidden",
      )}
    >
      {items.map((item, i) => (
        <li
          key={item.id ?? `tick-${i}`}
          className="flex items-center border-border border-e px-4 last:border-e-0 md:px-6"
        >
          <TickerEntry item={item} isEditing={isEditing} />
        </li>
      ))}
    </ul>
  );
}

/**
 * Compact single-row auto-scrolling strip — the live score-ticker
 * archetype (score ticker, results strip, headline ticker), generic
 * for any two-party rows. Same content shape as `Default` / `Cards`;
 * grouping and grid params don't apply.
 *
 * Marquee mechanics: two identical duplicated groups + a `-50%`
 * translate for a seamless loop; **pauses on hover/focus**. Under
 * `prefers-reduced-motion` the animation is disabled and the strip
 * falls back to a static `overflow-x: auto` row (clone hidden).
 * Editing mode renders the static row so authors get a stable target.
 */
export function Ticker({
  items = [],
  surfaceTone = "none",
  className,
  id,
  styles,
  isEditing,
}: VersusListProps) {
  const showMarquee = !isEditing && items.length > 0;
  return (
    <section
      className={cn(
        "component versus-list relative w-full border-border border-y py-2.5",
        surfaceToneClass(surfaceTone),
        className,
        styles?.trimEnd(),
      )}
      id={id ?? undefined}
      data-slot="versus-list"
      data-layout="ticker"
    >
      {showMarquee ? (
        <div className="flex w-full overflow-x-clip motion-reduce:overflow-x-auto">
          <div className="flex w-max animate-marquee motion-reduce:animate-none focus-within:[animation-play-state:paused] hover:[animation-play-state:paused]">
            {[false, true].map((isClone) => (
              <TickerGroup
                key={isClone ? "clone" : "lead"}
                items={items}
                isClone={isClone}
                isEditing={isEditing}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex w-full overflow-x-auto">
          <TickerGroup items={items} isEditing={isEditing} />
        </div>
      )}
    </section>
  );
}

/**
 * `universal` opts this file into BOTH the server and client component
 * maps the SDK generates. Server-only by default would land it in the
 * server map alone, and Sitecore Pages chrome (browser-side) could not
 * resolve the named-export variants. Purely a generate-map signal.
 */
export const componentType = "universal";
