import type { PageTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { pageTemplateThumbnail } from "./_wireframe-thumbnail";
import { PAGE_SEO_FIELDS } from "./_page-seo-fields";

/**
 * Product page template — the insert type under `/Home/Products`.
 *
 * Same SEO / Open Graph / Twitter / Sitemap / JSON-LD field set as
 * `page@1`, plus the Product Details body fields so
 * `product-details@1` can use the page as its datasource. Default
 * `OgType` is `website`.
 *
 * Bound to `product-page@1` via that design's `appliesTo`. The
 * `/Products` listing stays `page@1` + `standard-page@1`.
 *
 * `insertOptions: ["product@1"]` keeps nested children as Product.
 */
export const productRecipe = {
  kind: "page-template",
  schemaVersion: "1",
  handle: "product@1",
  name: "Product",
  displayName: "Product",
  thumbnail: pageTemplateThumbnail("Product_Page_Template.png", "Product"),
  description:
    "Product page template — Title / Eyebrow / ShortDescription / Content / Category / Price / Sku / Image1 / Image2 plus the standard SEO field set. Insert this under Products; product-page supplies the Product Details partial.",

  fields: [
    {
      name: "Title",
      shape: "text",
      sitecore: {
        section: "Content",
        hint: "Product name used in the layout's primary heading. Distinct from Meta Title.",
        sortOrder: 100,
      },
    },
    {
      name: "Eyebrow",
      shape: "text",
      sitecore: {
        section: "Content",
        hint: "Optional small label above the title — collection name, etc.",
        sortOrder: 200,
      },
    },
    {
      name: "ShortDescription",
      shape: "text",
      sitecore: {
        section: "Content",
        type: "multi-line-text",
        hint: "One-line summary under the title. Read by product-details@1.",
        sortOrder: 210,
      },
    },
    {
      name: "Content",
      shape: "richText",
      sitecore: {
        section: "Content",
        type: "rich-text",
        hint: "Long description. Read by product-details@1.",
        sortOrder: 220,
      },
    },
    {
      name: "Category",
      shape: "text",
      sitecore: {
        section: "Content",
        hint: "Category label (text, not a taxonomy). Surfaces as an eyebrow on product-details@1.",
        sortOrder: 230,
      },
    },
    {
      name: "Price",
      shape: "number",
      sitecore: {
        section: "Content",
        hint: "Price value (currency symbol is locale-driven).",
        sortOrder: 240,
      },
    },
    {
      name: "Sku",
      shape: "text",
      sitecore: {
        section: "Content",
        hint: "Stock-keeping unit. `Sku` not `SKU` so the convention map lowerFirsts to `sku`.",
        sortOrder: 250,
      },
    },
    {
      name: "Image1",
      shape: "image",
      sitecore: {
        section: "Content",
        type: "image",
        hint: "Primary product image. 4:5 or 1:1 recommended.",
        sortOrder: 260,
      },
    },
    {
      name: "Image2",
      shape: "image",
      sitecore: {
        section: "Content",
        type: "image",
        hint: "Secondary product image. Optional; shown beside Image1 when set.",
        sortOrder: 270,
      },
    },
    ...PAGE_SEO_FIELDS,
  ],

  insertOptions: ["product@1"],
} satisfies PageTemplateRecipe;

export default productRecipe;
