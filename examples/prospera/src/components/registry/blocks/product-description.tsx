import {
  TypographyH3,
  TypographyH4,
  TypographyMuted,
} from "@/components/registry/primitives/core/typography";
import { getSourceText } from "@/components/registry/primitives/editables/source-normalizers";
import { useLocale } from "@/hooks/registry/use-locale-options";
import type { Product } from "@/lib/registry/models/product.model";

interface ProductDescriptionProps {
  product: Product;
}

export const ProductDescription = ({ product }: ProductDescriptionProps) => {
  const { currencySymbol } = useLocale();
  const titleText = getSourceText(product.Title) ?? "Product";
  const shortDescriptionText = getSourceText(product.ShortDescription);
  const formattedPrice =
    product.Price?.value && !Number.isNaN(product.Price?.value)
      ? product.Price.value.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        })
      : product.Price?.value;

  return (
    <div className="space-y-3">
      <TypographyH3 className="text-2xl leading-tight sm:text-3xl">
        {titleText}
      </TypographyH3>
      {shortDescriptionText ? (
        <TypographyMuted className="text-base">
          {shortDescriptionText}
        </TypographyMuted>
      ) : null}
      {formattedPrice !== undefined &&
        formattedPrice !== null &&
        formattedPrice !== "" && (
          <TypographyH4 className="text-xl sm:text-2xl">
            <span className="me-2">{currencySymbol}</span>
            {formattedPrice}
          </TypographyH4>
        )}
    </div>
  );
};
