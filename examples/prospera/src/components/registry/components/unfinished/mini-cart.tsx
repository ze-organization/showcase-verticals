"use client";

import { useI18n } from "next-localization";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { QuantityControl } from "@/components/registry/blocks";
import { Button } from "@/components/registry/components/ui/cta-button";
import { Separator } from "@/components/registry/primitives/core/separator";
import {
  TypographyH4,
  TypographyMuted,
} from "@/components/registry/primitives/core/typography";
import { NextImage as Image } from "@/components/registry/primitives/editables/image";
import { Link } from "@/components/registry/primitives/editables/link";
import { Text } from "@/components/registry/primitives/editables/text";
import { useCartAction } from "@/hooks/registry/use-cart-action";
import { useLocale } from "@/hooks/registry/use-locale-options";
import { type CartItem, getCart } from "@/lib/registry/cart";
import { cn } from "@/lib/registry/cn";
import type { LinkField } from "@/lib/registry/sitecore";

function useCartTotals(cart: CartItem[]) {
  return useMemo(() => {
    let itemCount = 0;
    let amount = 0;
    for (const item of cart) {
      const price = Number(item.product.Price?.value) || 0;
      itemCount += item.quantity;
      amount += price * item.quantity;
    }
    return { totalItems: itemCount, total: amount };
  }, [cart]);
}

const MiniCartItemRow = memo(function MiniCartItemRow({
  item,
  isUpdating,
  currencySymbol,
  onQuantityChange,
  onRemove,
}: {
  item: CartItem;
  isUpdating: boolean;
  currencySymbol: string;
  onQuantityChange: (cartItemId: string, qty: number) => void;
  onRemove: (cartItemId: string) => void;
}) {
  return (
    <li
      key={item.id}
      aria-busy={isUpdating || undefined}
      className={cn(
        "flex gap-4 lg:gap-9",
        isUpdating && "pointer-events-none opacity-50",
      )}
    >
      <div className="relative size-23 rounded-sm lg:size-30">
        <Image
          value={item.product.Image1}
          alt={item.product.Title?.value || "Cart item image"}
          className="h-full w-full object-cover"
          width={120}
          height={120}
        />
      </div>
      <div className="flex w-full flex-col">
        <TypographyH4 className="text-lg">
          <Text value={item.product.Title} />
          <span>
            {(item.size?.fields?.ProductSize || item.color?.fields?.Name) &&
              " - "}
            {item.size?.fields?.ProductSize?.value ?? ""}
            {item.size?.fields?.ProductSize &&
              item.color?.fields?.Name &&
              " | "}
            {item.color?.fields?.Name?.value ?? ""}
          </span>
        </TypographyH4>
        <TypographyMuted className="mt-1">
          {currencySymbol}{" "}
          {(Number(item.product.Price?.value) * item.quantity).toFixed(2)}
        </TypographyMuted>
        <div className="mt-auto flex flex-wrap justify-between">
          <QuantityControl
            quantity={item.quantity}
            onChange={(q) => onQuantityChange(item.id, q)}
          />
          <Button variant="outline" onClick={() => onRemove(item.id)} size="sm">
            Remove
          </Button>
        </div>
      </div>
    </li>
  );
});

export interface MiniCartDisplayOptions {
  title?: string;
  emptyStateText?: string;
  checkoutLabel?: string;
  maxVisibleItemsBeforeScroll?: number;
}

export interface MiniCartBehaviorOptions {
  initialCart?: CartItem[];
  syncStorage?: boolean;
}

export interface MiniCartStyleOptions {
  containerClassName?: string;
}

export interface MiniCartProps {
  checkoutPage: LinkField;
  displayOptions?: MiniCartDisplayOptions;
  behaviorOptions?: MiniCartBehaviorOptions;
  styleOptions?: MiniCartStyleOptions;
}

export const MiniCart = ({
  checkoutPage,
  displayOptions,
  behaviorOptions,
  styleOptions,
}: MiniCartProps) => {
  const initialCart = behaviorOptions?.initialCart;
  const syncStorage = behaviorOptions?.syncStorage ?? true;
  const [cart, setCart] = useState<CartItem[]>(() => initialCart ?? []);
  const initialCartRef = useRef(initialCart);
  const { t } = useI18n();
  const { currencySymbol } = useLocale();
  const { updatingItemId, handleRemoveFromCart, handleUpdateQuantity } =
    useCartAction();

  useEffect(() => {
    initialCartRef.current = initialCart;
  }, [initialCart]);

  useEffect(() => {
    if (initialCartRef.current !== undefined) {
      setCart(initialCartRef.current);
    }
  }, []);

  useEffect(() => {
    if (initialCartRef.current !== undefined || !syncStorage) return;
    setCart(getCart());
    const handler = () => setCart(getCart());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [syncStorage]);

  const handleRemove = useCallback(
    async (cartItemId: string) => {
      const updatedCart = await handleRemoveFromCart(cartItemId);
      setCart(updatedCart);
    },
    [handleRemoveFromCart],
  );

  const handleQuantity = useCallback(
    async (cartItemId: string, qty: number) => {
      const updatedCart = await handleUpdateQuantity(cartItemId, qty);
      setCart(updatedCart);
    },
    [handleUpdateQuantity],
  );

  const { totalItems, total } = useCartTotals(cart);
  const resolvedTitle =
    displayOptions?.title ?? (t("shopping_cart_label") || "My Cart");
  const resolvedEmptyStateText =
    displayOptions?.emptyStateText ??
    (t("cart-empty") || "Your cart is empty.");
  const resolvedCheckoutLabel =
    displayOptions?.checkoutLabel ??
    checkoutPage?.value?.text ??
    t("checkout_label") ??
    "Checkout";
  const maxVisibleItemsBeforeScroll =
    displayOptions?.maxVisibleItemsBeforeScroll ?? 2;

  if (!cart.length) {
    return (
      <div className={cn("lg:mx-18", styleOptions?.containerClassName)}>
        <TypographyH4 className="drawer-heading">{resolvedTitle}</TypographyH4>
        <TypographyMuted>{resolvedEmptyStateText}</TypographyMuted>
      </div>
    );
  }

  const listMaxHeight =
    cart.length > maxVisibleItemsBeforeScroll ? "max-h-[20rem]" : "";

  return (
    <div
      className={cn("flex min-h-0 flex-col", styleOptions?.containerClassName)}
    >
      <TypographyH4 className="drawer-heading mx-5 lg:mx-18">
        {resolvedTitle}{" "}
        <span aria-live="polite" aria-atomic="true">
          ({totalItems})
        </span>
      </TypographyH4>
      <div
        className={cn(
          "custom-scrollbar scrollbar-end-side mx-3 shrink overflow-auto px-2 pt-4 pb-6 lg:mx-16",
          listMaxHeight,
        )}
      >
        <div className="scrollbar-end-side-content min-h-full min-w-full">
          <ul className="space-y-6" aria-live="polite" aria-atomic="false">
            {cart.map((item) => (
              <MiniCartItemRow
                key={item.id}
                item={item}
                isUpdating={updatingItemId === item.id}
                currencySymbol={currencySymbol}
                onQuantityChange={handleQuantity}
                onRemove={handleRemove}
              />
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-auto">
        <Separator className="mb-6" />
        <div className="mx-5 lg:mx-18">
          <TypographyH4 className="mb-6 flex justify-between text-lg">
            <span>{t("total_label") || "Total:"}</span>
            <span aria-live="polite" aria-atomic="true">
              {currencySymbol} {total.toFixed(2)}
            </span>
          </TypographyH4>
          <Button asChild className="w-full text-lg" size="lg">
            <Link value={checkoutPage} className="w-full">
              {resolvedCheckoutLabel}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export const componentType = "universal";
