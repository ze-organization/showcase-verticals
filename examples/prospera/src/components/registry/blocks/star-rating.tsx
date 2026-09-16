import { LibraryIcon } from "@/components/registry/primitives/core/library-icon";
import { cn } from "@/lib/registry/cn";

export interface StarRatingProps {
  rating?: number;
  max?: number;
  className?: string;
}

/**
 * Backward-compatible star rating utility block.
 */
export function StarRating({
  rating = 0,
  max = 5,
  className,
}: StarRatingProps) {
  const safeMax = Math.max(1, max);
  const safeRating = Math.max(0, Math.min(rating, safeMax));

  return (
    <div
      role="img"
      className={cn("flex items-center gap-1 text-primary", className)}
      aria-label={`Rated ${safeRating} out of ${safeMax}`}
    >
      {Array.from({ length: safeMax }, (_, index) => {
        const starNumber = index + 1;
        const isFilled = starNumber <= safeRating;
        return (
          <LibraryIcon
            key={starNumber}
            name="star"
            className={cn(
              "size-4",
              isFilled ? "fill-current" : "fill-transparent text-primary/30",
            )}
            aria-hidden="true"
          />
        );
      })}
    </div>
  );
}

export default StarRating;
