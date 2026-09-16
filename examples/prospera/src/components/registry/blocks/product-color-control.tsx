"use client";

import { Button } from "@/components/registry/primitives/core/button";
import { TypographyMuted } from "@/components/registry/primitives/core/typography";
import { cn } from "@/lib/registry/cn";
import type { Product } from "@/lib/registry/models/product.model";

interface ProductColorControlProps {
  colors?: Product["Color"];
  selectedColor?: Product["Color"][number];
  onSelect: (color: Product["Color"][number]) => void;
}

export const ProductColorControl = ({
  colors = [],
  selectedColor,
  onSelect,
}: ProductColorControlProps) => {
  if (!colors.length) return null;

  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-3">
        {colors.map((color) => {
          const colorName = color.fields?.Name?.value;
          const isSelected = selectedColor?.id === color.id;
          return (
            <Button
              key={color.id}
              variant="ghost"
              aria-label={`Select ${colorName ?? "color"}`}
              aria-pressed={isSelected}
              onClick={() => onSelect(color)}
              className={cn(
                "size-8 min-h-8 min-w-8 shrink-0 rounded-full p-0 transition-all [&>span]:hidden",
                isSelected && "ring ring-accent ring-offset-2",
              )}
              title={colorName}
              style={{ backgroundColor: color.fields?.HexCode?.value }}
            />
          );
        })}
      </div>
      <TypographyMuted>{selectedColor?.fields?.Name?.value}</TypographyMuted>
    </div>
  );
};
