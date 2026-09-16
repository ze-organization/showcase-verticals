"use client";

import { useI18n } from "next-localization";
import { useCallback } from "react";
import { Button } from "@/components/registry/primitives/core/button";
import { LibraryIcon } from "@/components/registry/primitives/core/library-icon";
import { useCartAction } from "@/hooks/registry/use-cart-action";
import type { Color, Product, Size } from "@/lib/registry/models/product.model";

interface AddToCartButtonProps {
  productId: string;
  product: Product;
  selectedQuantity?: number;
  selectedColor?: Color;
  selectedSize?: Size;
}

export const AddToCartButton = ({
  productId,
  product,
  selectedQuantity,
  selectedColor,
  selectedSize,
}: AddToCartButtonProps) => {
  const { status, handleAddToCart } = useCartAction();
  const { t } = useI18n();
  const handleClick = useCallback(() => {
    handleAddToCart(
      productId,
      product,
      selectedQuantity,
      selectedColor,
      selectedSize,
    );
  }, [
    handleAddToCart,
    productId,
    product,
    selectedQuantity,
    selectedColor,
    selectedSize,
  ]);

  return (
    <Button
      disabled={status !== "idle"}
      onClick={handleClick}
      variant="default"
      size="lg"
      className="w-full text-lg"
      aria-label={t("cart_btn_text") || "Add to Cart"}
      type="button"
    >
      {status !== "idle" && (
        <span className="sr-only" aria-live="polite">
          {status === "loading"
            ? "Adding to cart"
            : status === "success"
              ? "Added to cart"
              : "Unable to add to cart"}
        </span>
      )}
      {status === "loading" && (
        <LibraryIcon
          name="loader"
          className="size-6 animate-spin"
          aria-hidden="true"
        />
      )}
      {status === "success" && (
        <LibraryIcon name="check" className="size-6" aria-hidden="true" />
      )}
      {status === "error" && (
        <LibraryIcon name="x" className="size-6" aria-hidden="true" />
      )}
      {status === "idle" && (
        <>
          <LibraryIcon name="plus" className="size-5" aria-hidden="true" />
          {t("cart_btn_text") || "Add to Cart"}
        </>
      )}
    </Button>
  );
};
