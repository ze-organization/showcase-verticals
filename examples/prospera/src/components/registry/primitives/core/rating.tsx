import type * as React from "react";
import { LibraryIcon } from "@/components/registry/primitives/core/library-icon";
import { cn } from "@/lib/registry/cn";

export interface RatingProps {
  /** Current rating value (e.g. 4.5). */
  rating: number;
  /** Maximum rating (e.g. 5). Default 5. */
  maxRating?: number;
  /** Hide empty (unfilled) icons. Default false. */
  showOnlyFilled?: boolean;
  /** Size in pixels for each icon. Default 16. */
  iconSize?: number;
  /** Icon name for filled state (LibraryIcon). Default "star". */
  iconName?: string;
  /** Class for the container. */
  className?: string;
  /** Optional direction override for partial fill clipping. */
  direction?: "ltr" | "rtl";
  /** Class for filled icon. */
  filledClassName?: string;
  /** Class for empty icon. */
  emptyClassName?: string;
}

/** Renders a single partially-filled icon with direction-aware clip. */
function PartialIcon({
  iconName,
  fillFraction,
  directionProp,
  filledClassName,
  emptyClassName,
}: {
  iconName: string;
  fillFraction: number;
  directionProp?: "ltr" | "rtl";
  filledClassName: string;
  emptyClassName: string;
}) {
  const clipPct = 100 - fillFraction * 100;
  const ltrClipPath = `inset(0 ${clipPct}% 0 0)`;
  const rtlClipPath = `inset(0 0 0 ${clipPct}%)`;
  const resolvedClipPath =
    directionProp === "rtl"
      ? rtlClipPath
      : directionProp === "ltr"
        ? ltrClipPath
        : undefined;
  return (
    <div className="relative size-full">
      <LibraryIcon
        name={iconName}
        className={cn("size-full", emptyClassName)}
        aria-hidden
      />
      {resolvedClipPath ? (
        <div
          className="absolute inset-0"
          style={{
            clipPath: resolvedClipPath,
            WebkitClipPath: resolvedClipPath,
          }}
        >
          <LibraryIcon
            name={iconName}
            className={cn("size-full", filledClassName)}
            aria-hidden
          />
        </div>
      ) : (
        <>
          <div
            className="absolute inset-0 rtl:hidden"
            style={{
              clipPath: ltrClipPath,
              WebkitClipPath: ltrClipPath,
            }}
          >
            <LibraryIcon
              name={iconName}
              className={cn("size-full", filledClassName)}
              aria-hidden
            />
          </div>
          <div
            className="absolute inset-0 hidden rtl:block"
            style={{
              clipPath: rtlClipPath,
              WebkitClipPath: rtlClipPath,
            }}
          >
            <LibraryIcon
              name={iconName}
              className={cn("size-full", filledClassName)}
              aria-hidden
            />
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Display rating as a row of icons (e.g. stars), with optional partial fill.
 * Use for read-only display. For interactive rating input, wrap in state and pass rating/onChange.
 */
function Rating({
  rating,
  maxRating = 5,
  showOnlyFilled = false,
  iconSize = 16,
  iconName = "star",
  className,
  direction: directionProp,
  filledClassName = "fill-current text-warning",
  emptyClassName = "text-muted-foreground",
}: RatingProps) {
  const safeRating = Math.max(0, Math.min(rating, maxRating));
  const fullCount = Math.floor(safeRating);
  const hasPartial = safeRating % 1 !== 0;
  const iconStyle = { width: iconSize, height: iconSize } as const;

  const items: Array<{ key: number; node: React.ReactNode }> = [];

  for (let i = 1; i <= maxRating; i++) {
    const isFull = i <= fullCount;
    const isPartial = i === fullCount + 1 && hasPartial;

    if (showOnlyFilled && !isFull && !isPartial) continue;

    if (isPartial) {
      items.push({
        key: i,
        node: (
          <PartialIcon
            iconName={iconName}
            fillFraction={safeRating - fullCount}
            directionProp={directionProp}
            filledClassName={filledClassName}
            emptyClassName={emptyClassName}
          />
        ),
      });
    } else {
      items.push({
        key: i,
        node: (
          <LibraryIcon
            key={i}
            name={iconName}
            className={cn(
              "size-full",
              isFull ? filledClassName : emptyClassName,
            )}
            aria-hidden
          />
        ),
      });
    }
  }

  return (
    <div
      data-slot="rating"
      role="img"
      aria-label={`Rated ${safeRating} out of ${maxRating}`}
      className={cn("flex gap-1 text-accent!", className)}
    >
      {items.map(({ key, node }) => (
        <span key={key} className="inline-flex" style={iconStyle}>
          {node}
        </span>
      ))}
    </div>
  );
}
Rating.displayName = "Rating";

export { Rating };
