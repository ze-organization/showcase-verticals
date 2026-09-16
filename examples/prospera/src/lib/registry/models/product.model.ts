import type { Field, ImageField, RichTextField } from "@/lib/registry/sitecore";
import type { IGQLField, SitecoreItem } from "@/lib/registry/sitecore-types";

export interface Product {
  Title: Field<string>;
  ShortDescription: Field<string>;
  LongDescription: RichTextField;
  Tags: Tag[];
  Category: Category;
  Price: Field<number>;
  /**
   * Canonical spelling on `product-card@1` items — the convention map
   * lowerFirsts field names, and only `Sku` lands on the component's
   * `sku` prop.
   */
  Sku?: Field<string>;
  /**
   * Optional per-item CTA label (e.g. "Buy Now" / "Learn More"). When set,
   * the leaf `product-card` renders a labeled action button instead of the
   * bare icon-only add-to-cart `+`. Backs the `CtaLabel` field on
   * `product-card@1`.
   */
  CtaLabel?: Field<string>;
  Color: Color[];
  Size: Size[];
  Image1: ImageField;
  Image2: ImageField;
  Image3: ImageField;
  Image4: ImageField;
  Image5: ImageField;
  Width: Field<string>;
  Height: Field<string>;
  Depth: Field<string>;
  Weight: Field<string>;
  SeatHeight: Field<string>;
  LegHeight: Field<string>;
}

export interface ProductIGQL {
  id: string;
  name: string;
  title: IGQLField<Field<string>>;
  price: IGQLField<Field<number>>;
  image1: IGQLField<ImageField>;
  category: IGQLField<Category>;
  url: {
    path: string;
  };
  reviews: {
    targetItems: Array<{
      rating: IGQLField<Field<number>>;
    }>;
  };
}

export interface CategoryFields {
  CategoryName: Field<string>;
}
export type Category = SitecoreItem<CategoryFields>;

export interface TagFields {
  Tag: Field<string>;
}
export type Tag = SitecoreItem<TagFields>;

export interface ColorFields {
  Name: Field<string>;
  HexCode: Field<string>;
}
export type Color = SitecoreItem<ColorFields>;

export interface SizeFields {
  ProductSize: Field<string>;
}
export type Size = SitecoreItem<SizeFields>;
