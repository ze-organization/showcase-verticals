import * as React from "react";
import { Button } from "@/components/registry/primitives/core/button";
import { ThemeIcon } from "@/components/registry/primitives/core/theme-icon";
import { cn } from "@/lib/registry/cn";

const carouselButtonClasses =
  "flex h-(--carousel-button-size,2rem) w-(--carousel-button-size,2rem) items-center justify-center rounded-(--carousel-button-radius,9999px) border-(--carousel-button-border-color,transparent) bg-(--carousel-button-bg,var(--color-background)) text-(--carousel-button-color,var(--color-foreground)) shadow-(--carousel-button-shadow,var(--shadow-md)) transition-colors [border-width:var(--carousel-button-border-width,0)] hover:bg-(--carousel-button-bg,var(--color-background)) hover:shadow-(--carousel-button-shadow-hover,var(--shadow-lg))";
const carouselButtonIconClasses =
  "h-(--carousel-button-icon-size,1rem) w-(--carousel-button-icon-size,1rem)";

export interface CarouselButtonProps
  extends React.ComponentProps<typeof Button> {
  direction?: "prev" | "next";
}

const CarouselButton = React.forwardRef<HTMLButtonElement, CarouselButtonProps>(
  ({ className, direction = "next", ...props }, ref) => (
    <Button
      ref={ref}
      variant="ghost"
      colorScheme="neutral"
      size="icon"
      className={cn(carouselButtonClasses, className)}
      aria-label={direction === "prev" ? "Previous" : "Next"}
      {...props}
    >
      <ThemeIcon
        name={direction === "prev" ? "arrow-left" : "arrow-right"}
        className={carouselButtonIconClasses}
      />
    </Button>
  ),
);

CarouselButton.displayName = "CarouselButton";

export { CarouselButton };
export default CarouselButton;
