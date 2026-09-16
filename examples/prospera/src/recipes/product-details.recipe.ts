import type { ComponentTemplateRecipe } from "../lib/registry/sitecore-recipes";
import { componentIcons } from "./_component-icons";
import { DETAILS_PRODUCT_PARAMS } from "./_details-shell-params";

/**
 * Recipe for `ProductDetails` — gallery, title, price, sku, dek, body,
 * plus media / in-column / related / full-width placeholders.
 *
 * Intended to sit on `headless-main` via `product-details-partial@1`.
 * Empty datasource = current `product@1` page.
 */
export const productDetailsRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "product-details@1",
  icon: componentIcons["product-details@1"],
  name: "product-details",
  displayName: "Product Details",
  description:
    "Full product view: images, title, price, sku, short description, body, plus product-details-media-{*}, product-details-{*}, product-details-related-{*}, and product-details-full-width-{*} placeholders.",

  section: { handle: "page-details-section@1" },

  fields: [
    {
      name: "Title",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "Product name.",
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "Eyebrow",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Optional kicker above the title.",
        section: "Content",
        sortOrder: 110,
      },
    },
    {
      name: "ShortDescription",
      shape: "text",
      sitecore: {
        type: "multi-line-text",
        hint: "One-line summary under the title.",
        section: "Content",
        sortOrder: 200,
      },
    },
    {
      name: "Content",
      shape: "richText",
      sitecore: {
        type: "rich-text",
        hint: "Long description.",
        section: "Content",
        sortOrder: 300,
      },
    },
    {
      name: "Category",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Category label.",
        section: "Content",
        sortOrder: 310,
      },
    },
    {
      name: "Price",
      shape: "number",
      sitecore: {
        type: "number",
        hint: "Price value.",
        section: "Content",
        sortOrder: 320,
      },
    },
    {
      name: "Sku",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Stock-keeping unit.",
        section: "Content",
        sortOrder: 330,
      },
    },
    {
      name: "Image1",
      shape: "image",
      role: "product",
      sitecore: {
        type: "image",
        hint: "Primary product image.",
        section: "Content",
        sortOrder: 400,
      },
    },
    {
      name: "Image2",
      shape: "image",
      role: "product",
      sitecore: {
        type: "image",
        hint: "Secondary product image.",
        section: "Content",
        sortOrder: 410,
      },
    },
  ],

  params: [...DETAILS_PRODUCT_PARAMS],

  variants: [{ name: "Default" }],

  dynamicPlaceholders: true,
  // Unique keys per type. scai currently does not create the
  // Presentation/Placeholder Settings items these compile to — live
  // was patched. Do not re-push until scai materializes them.
  placeholders: [
    { key: "product-details-media-{*}" },
    { key: "product-details-{*}" },
    { key: "product-details-related-{*}" },
    { key: "product-details-full-width-{*}" },
  ],

  placedIn: ["headless-main-{*}"],

  datasource: {
    autoCreate: false,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Product Details" },
      { scope: "site", subfolder: "Product Details" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default productDetailsRecipe;
