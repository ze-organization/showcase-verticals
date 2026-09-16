"use client";

import { Button } from "@/components/registry/primitives/core/button";
import { TypographyMuted } from "@/components/registry/primitives/core/typography";
import { cn } from "@/lib/registry/cn";
import type { Product } from "@/lib/registry/models/product.model";

interface ProductSizeControlProps {
  sizes?: Product["Size"];
  selectedSize?: Product["Size"][number];
  onSelect: (size: Product["Size"][number]) => void;
}

export const ProductSizeControl = ({
  sizes = [],
  selectedSize,
  onSelect,
}: ProductSizeControlProps) => {
  if (!sizes.length) return null;

  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-3">
        {sizes.map((size) => {
          const label = size.fields?.ProductSize?.value ?? "-";
          const isSelected = selectedSize?.id === size.id;
          return (
            <Button
              key={size.id}
              variant="ghost"
              aria-label={`Select size ${label}`}
              aria-pressed={isSelected}
              onClick={() => onSelect(size)}
              className={cn(
                "h-8 min-w-8 rounded px-2 text-sm transition-colors",
                isSelected
                  ? "bg-accent text-background"
                  : "bg-background-accent hover:bg-accent/20",
              )}
            >
              {label}
            </Button>
          );
        })}
      </div>
      <TypographyMuted>
        {selectedSize?.fields?.ProductSize?.value}
      </TypographyMuted>
    </div>
  );
};
