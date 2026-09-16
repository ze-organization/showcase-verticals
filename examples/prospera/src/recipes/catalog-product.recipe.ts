import type { ContentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Content template for catalog products resolved by the Products
 * wildcard (`products-wildcard@1` → `wildcard-detail@1` Product
 * variant). Not an insertable page type — those are `product@1`.
 *
 * Field names match what the Product layout already reads: Title,
 * Tagline, Category, Image, Description. Missing tasting-notes / ABV
 * simply do not render.
 */
export const catalogProductRecipe = {
  kind: "content-template",
  schemaVersion: "1",
  handle: "catalog-product@1",
  name: "catalog-product",
  displayName: "Catalog Product",
  description:
    "Data-folder product resolved by the Products wildcard page. Title / Tagline / Category / Description / Image — the fields wildcard-detail@1 Product already reads.",

  fields: [
    {
      name: "Title",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "Product name. Read by wildcard-detail@1 as the headline.",
        sortOrder: 100,
      },
    },
    {
      name: "Tagline",
      shape: "text",
      sitecore: {
        type: "multi-line-text",
        hint: "Short supporting line under the title. Read as the Product-layout subtitle.",
        sortOrder: 200,
      },
    },
    {
      name: "Category",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Category label. Surfaces as a badge on the Product layout.",
        sortOrder: 300,
      },
    },
    {
      name: "Description",
      shape: "richText",
      sitecore: {
        type: "rich-text",
        hint: "Long description. wildcard-detail reads Body / Story / Description.",
        sortOrder: 400,
      },
    },
    {
      name: "Image",
      shape: "image",
      sitecore: {
        type: "image",
        hint: "Product image. 4:5 or 1:1 recommended.",
        section: "Media",
        sortOrder: 100,
      },
    },
  ],
} satisfies ContentTemplateRecipe;

export default catalogProductRecipe;
