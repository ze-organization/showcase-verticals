import { CalendarDays, ChevronDown } from "lucide-react";
import { useId } from "react";
import { Button } from "@/components/registry/components/ui/cta-button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/registry/primitives/core/tabs";
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
  type SurfaceTone,
  surfaceToneClass,
} from "@/lib/registry/color-scheme-classes";
import {
  SECTION_PADDING_Y_CLASSES,
  type SectionPaddingY,
} from "@/lib/registry/section-surface";
import type { CmsProps } from "@/lib/registry/sitecore";

/**
 * `search-booking-bar` — a horizontal search / booking bar section.
 *
 * One prominent bar of segmented input cells (origin / destination /
 * dates, or query + category — the segments are curated via the
 * `Segments` Treelist, `search-booking-segment@1`) ending in a
 * prominent action button. The flight-search / trip-planner / booking
 * entry archetype airline, tourism, and hospitality homepages lead
 * with.
 *
 * **Presentational by design**: the inputs are display-only
 * (uncontrolled, nothing is queried) and the action button follows
 * `actionLink` when set, otherwise it is a plain button. For a
 * card-shaped multi-mode travel widget with a flight/hotel/train
 * toggle use `travel-search@1`; for wired site-content search use
 * `search-bar@1`.
 *
 * Three rendering shapes share one content shape:
 *   - `Default`   → full segmented bar: each segment is a labelled cell
 *                   with dividers, large action button at the end.
 *   - `Compact`   → condensed single-row pill: placeholder-only inputs,
 *                   smaller button (labels feed accessibility only).
 *   - `MultiMode` → tabbed multi-mode widget (Emirates / Tourism
 *                   Australia): a tab row of booking modes (Flights /
 *                   Hotels / Holidays…), each tab carrying its own
 *                   segmented bar via the `Modes` Treelist.
 */

export type BookingSegmentType = "text" | "select" | "date";

export interface SearchBookingSegment {
  id?: string;
  /** Label above the segment's input (Default) / its accessible name (Compact). */
  label?: TextSource;
  /** Placeholder text inside the input. */
  placeholder?: TextSource;
  /** Input type — `select` adds a chevron, `date` a calendar glyph. */
  segmentType?: BookingSegmentType;
}

/** One tab of the MultiMode widget — label + its own bar contents. */
export interface SearchBookingMode {
  id?: string;
  /** Tab label — the mode's name ("Flights", "Hotels", "Holidays"). */
  label?: TextSource;
  /** This mode's input cells. */
  segments?: SearchBookingSegment[];
  /** Per-mode action label; falls back to the bar's `actionLabel`. */
  actionLabel?: TextSource;
  /** Per-mode action link; falls back to the bar's `actionLink`. */
  actionLink?: LinkSource;
}

export interface SearchBookingBarProps extends CmsProps {
  /** Optional heading above the bar. */
  title?: TextSource;
  segments?: SearchBookingSegment[];
  /** MultiMode only — one entry per tab. Default/Compact ignore it. */
  modes?: SearchBookingMode[];
  /** Action button label. */
  actionLabel?: TextSource;
  /** Optional link the action button follows. Empty = plain button. */
  actionLink?: LinkSource;
  /** Background tone of the section. */
  surfaceTone?: SurfaceTone;
  /** Vertical padding around the section (`padding-y@1`). */
  paddingY?: SectionPaddingY;
  className?: string;
}

function SegmentGlyph({ segmentType }: { segmentType?: BookingSegmentType }) {
  if (segmentType === "select") {
    return (
      <ChevronDown
        aria-hidden="true"
        className="size-4 shrink-0 text-muted-foreground"
      />
    );
  }
  if (segmentType === "date") {
    return (
      <CalendarDays
        aria-hidden="true"
        className="size-4 shrink-0 text-muted-foreground"
      />
    );
  }
  return null;
}

function SegmentCell({
  segment,
  compact,
  isEditing,
}: {
  segment: SearchBookingSegment;
  compact?: boolean;
  isEditing?: boolean;
}) {
  const inputId = useId();
  const placeholderText =
    getSourceText(segment.placeholder) || getSourceText(segment.label) || "";
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col justify-center gap-0.5",
        compact ? "px-4 py-2" : "px-4 py-3 md:px-5",
      )}
      data-segment-type={segment.segmentType ?? "text"}
    >
      <label
        htmlFor={inputId}
        className={cn(
          "font-medium text-current/70 text-xs uppercase tracking-wide",
          compact && "sr-only",
        )}
      >
        <Text
          value={segment.label}
          tag="span"
          isEditing={isEditing}
          placeholder="Label"
        />
      </label>
      <div className="flex items-center gap-2">
        <input
          id={inputId}
          type="text"
          placeholder={placeholderText}
          className="w-full min-w-0 border-0 bg-transparent p-0 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none"
        />
        <SegmentGlyph segmentType={segment.segmentType} />
      </div>
    </div>
  );
}

function ActionButton({
  actionLabel,
  actionLink,
  compact,
  isEditing,
}: Pick<SearchBookingBarProps, "actionLabel" | "actionLink" | "isEditing"> & {
  compact?: boolean;
}) {
  const hasLink = Boolean(actionLink && !isEmptySource(actionLink));
  const size = compact ? "default" : "lg";
  if (hasLink) {
    return (
      <Button asChild size={size} className="shrink-0">
        <Link value={actionLink} isEditing={isEditing} />
      </Button>
    );
  }
  return (
    <Button type="button" size={size} className="shrink-0">
      <Text
        value={actionLabel}
        tag="span"
        isEditing={isEditing}
        placeholder="Search"
      />
    </Button>
  );
}

function BookingBarSection({
  title,
  surfaceTone = "none",
  paddingY = "auto",
  id,
  styles,
  className,
  isEditing,
  layout,
  children,
}: Pick<
  SearchBookingBarProps,
  "title" | "surfaceTone" | "paddingY" | "id" | "styles" | "className"
> & {
  isEditing?: boolean;
  layout: "default" | "compact" | "multi-mode";
  children: React.ReactNode;
}) {
  const hasTitle = title && getSourceText(title);
  return (
    <section
      className={cn(
        "component search-booking-bar w-full",
        // `auto` (recipe default) → the bar's tight natural responsive
        // band; a concrete token takes over.
        paddingY === "auto"
          ? "py-8 md:py-10"
          : SECTION_PADDING_Y_CLASSES[paddingY],
        surfaceToneClass(surfaceTone),
        className,
        styles?.trimEnd(),
      )}
      id={id ?? undefined}
      data-slot="search-booking-bar"
      data-layout={layout}
    >
      <div className="container mx-auto flex flex-col gap-4 px-4">
        {hasTitle ? (
          <h2 className="font-heading font-semibold text-xl tracking-tight md:text-2xl">
            <Text value={title} tag="span" isEditing={isEditing} />
          </h2>
        ) : null}
        {children}
      </div>
    </section>
  );
}

/** The full segmented bar body — shared by Default and MultiMode tabs. */
function SegmentedBar({
  segments = [],
  actionLabel,
  actionLink,
  isEditing,
}: Pick<
  SearchBookingBarProps,
  "segments" | "actionLabel" | "actionLink" | "isEditing"
>) {
  return (
    <div className="flex w-full flex-col items-stretch gap-2 rounded-(--card-radius,var(--radius-xl)) border border-border bg-card p-2 text-card-foreground shadow-lg lg:flex-row lg:items-center">
      {segments.map((segment, i) => (
        <div
          key={segment.id ?? `segment-${i}`}
          className={cn(
            "flex min-w-0 flex-1",
            i > 0 && "border-border border-t lg:border-s lg:border-t-0",
          )}
        >
          <SegmentCell segment={segment} isEditing={isEditing} />
        </div>
      ))}
      <ActionButton
        actionLabel={actionLabel}
        actionLink={actionLink}
        isEditing={isEditing}
      />
    </div>
  );
}

/** Full segmented bar — labelled cells with dividers, large action button. */
export function Default({
  title,
  segments = [],
  actionLabel,
  actionLink,
  surfaceTone,
  paddingY,
  className,
  id,
  styles,
  isEditing,
}: SearchBookingBarProps) {
  return (
    <BookingBarSection
      title={title}
      surfaceTone={surfaceTone}
      paddingY={paddingY}
      id={id}
      styles={styles}
      className={className}
      isEditing={isEditing}
      layout="default"
    >
      <SegmentedBar
        segments={segments}
        actionLabel={actionLabel}
        actionLink={actionLink}
        isEditing={isEditing}
      />
    </BookingBarSection>
  );
}

/** Condensed single-row pill — placeholder-only inputs, smaller button. */
export function Compact({
  title,
  segments = [],
  actionLabel,
  actionLink,
  surfaceTone,
  paddingY,
  className,
  id,
  styles,
  isEditing,
}: SearchBookingBarProps) {
  return (
    <BookingBarSection
      title={title}
      surfaceTone={surfaceTone}
      paddingY={paddingY}
      id={id}
      styles={styles}
      className={className}
      isEditing={isEditing}
      layout="compact"
    >
      <div className="flex w-full items-center gap-2 overflow-x-auto rounded-full border border-border bg-card p-1.5 text-card-foreground shadow-sm">
        {segments.map((segment, i) => (
          <div
            key={segment.id ?? `segment-${i}`}
            className={cn(
              "flex min-w-32 flex-1",
              i > 0 && "border-border border-s",
            )}
          >
            <SegmentCell segment={segment} compact isEditing={isEditing} />
          </div>
        ))}
        <ActionButton
          actionLabel={actionLabel}
          actionLink={actionLink}
          compact
          isEditing={isEditing}
        />
      </div>
    </BookingBarSection>
  );
}

/**
 * MultiMode — the tabbed multi-mode booking widget (Emirates: Flights /
 * Hotels / Flight+Hotel; Tourism Australia trip planner). A tab row of
 * booking modes above the segmented bar; each tab carries its own
 * segments and action from the `Modes` Treelist, falling back to the
 * bar-level ActionLabel / ActionLink when a mode leaves them empty.
 * Falls back to the plain Default bar when no modes are authored (so a
 * half-migrated datasource still renders something useful).
 */
export function MultiMode({
  title,
  segments = [],
  modes = [],
  actionLabel,
  actionLink,
  surfaceTone,
  paddingY,
  className,
  id,
  styles,
  isEditing,
}: SearchBookingBarProps) {
  if (modes.length === 0) {
    return (
      <Default
        title={title}
        segments={segments}
        actionLabel={actionLabel}
        actionLink={actionLink}
        surfaceTone={surfaceTone}
        paddingY={paddingY}
        className={className}
        id={id}
        styles={styles}
        isEditing={isEditing}
      />
    );
  }
  const modeId = (mode: SearchBookingMode | undefined, i: number) =>
    mode?.id ?? `mode-${i}`;
  return (
    <BookingBarSection
      title={title}
      surfaceTone={surfaceTone}
      paddingY={paddingY}
      id={id}
      styles={styles}
      className={className}
      isEditing={isEditing}
      layout="multi-mode"
    >
      <Tabs defaultValue={modeId(modes[0], 0)} className="w-full gap-3">
        <TabsList>
          {modes.map((mode, i) => (
            <TabsTrigger key={modeId(mode, i)} value={modeId(mode, i)}>
              <Text
                value={mode.label}
                tag="span"
                isEditing={isEditing}
                placeholder="Mode"
              />
            </TabsTrigger>
          ))}
        </TabsList>
        {modes.map((mode, i) => (
          <TabsContent key={modeId(mode, i)} value={modeId(mode, i)}>
            <SegmentedBar
              segments={mode.segments ?? []}
              actionLabel={
                mode.actionLabel != null && !isEmptySource(mode.actionLabel)
                  ? mode.actionLabel
                  : actionLabel
              }
              actionLink={
                mode.actionLink != null && !isEmptySource(mode.actionLink)
                  ? mode.actionLink
                  : actionLink
              }
              isEditing={isEditing}
            />
          </TabsContent>
        ))}
      </Tabs>
    </BookingBarSection>
  );
}

/**
 * `universal` opts this file into BOTH the server and client component
 * maps the SDK generates, so Sitecore Pages chrome (browser-side) can
 * resolve the named-export variants. Purely a generate-map signal.
 */
export const componentType = "universal";
