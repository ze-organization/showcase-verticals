"use client";

import { useI18n } from "next-localization";
import {
  DescriptionDetails,
  DescriptionList,
  DescriptionSeparator,
  DescriptionTerm,
} from "@/components/registry/primitives/core/description-list";
import {
  TypographyMuted,
  TypographySmall,
} from "@/components/registry/primitives/core/typography";
import { getSourceText } from "@/components/registry/primitives/editables/source-normalizers";
import type { Product } from "@/lib/registry/models/product.model";

function isEmptyValue(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === "object" && "value" in value)
    return (value as { value?: unknown }).value == null;
  if (typeof value === "string") return (value as string).trim() === "";
  return false;
}

interface ProductMetaDetailsProps {
  product: Product;
}

export const ProductMetaDetails = ({ product }: ProductMetaDetailsProps) => {
  const { t } = useI18n();
  const hasSku = product?.Sku && !isEmptyValue(product.Sku);
  const skuText = getSourceText(product.Sku);
  const categoryText = getSourceText(product.Category?.fields?.CategoryName);

  return (
    <DescriptionList className="grid grid-cols-[auto_16px_1fr] gap-x-2 gap-y-3 text-sm">
      <DescriptionTerm>
        <TypographyMuted>{t("product_sku_label") || "SKU"}</TypographyMuted>
      </DescriptionTerm>
      <DescriptionSeparator>:</DescriptionSeparator>
      <DescriptionDetails>
        <TypographySmall className="font-normal">
          {hasSku && skuText ? (
            skuText
          ) : (
            <span className="is-empty-hint">SKU</span>
          )}
        </TypographySmall>
      </DescriptionDetails>

      {categoryText && (
        <>
          <DescriptionTerm>
            <TypographyMuted>
              {t("product_category_label") || "Category"}
            </TypographyMuted>
          </DescriptionTerm>
          <DescriptionSeparator>:</DescriptionSeparator>
          <DescriptionDetails>
            <TypographySmall className="font-normal">
              {categoryText}
            </TypographySmall>
          </DescriptionDetails>
        </>
      )}

      {Array.isArray(product?.Tags) && product.Tags.length > 0 && (
        <>
          <DescriptionTerm>
            <TypographyMuted>
              {t("product_tags_label") || "Tags"}
            </TypographyMuted>
          </DescriptionTerm>
          <DescriptionSeparator>:</DescriptionSeparator>
          <DescriptionDetails>
            <TypographySmall className="flex flex-wrap gap-x-1 font-normal">
              {product.Tags.map((tag, i) => (
                <span key={tag.id ?? i}>
                  {i > 0 && ", "}
                  {getSourceText(tag.fields.Tag) ?? "Tag"}
                </span>
              ))}
            </TypographySmall>
          </DescriptionDetails>
        </>
      )}
    </DescriptionList>
  );
};
