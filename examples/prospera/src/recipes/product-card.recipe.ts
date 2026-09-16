import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";
import {
  cardChromeParams,
  cardTitleLinkIconParam,
} from "./_card-chrome-params";

/**
 * Recipe for `ProductCard` — the leaf card rendering for the products
 * family. Authors drop these into the `cards-products-{*}` placeholder
 * exposed by `products-list-grid@1` and `products-carousel@1` (composed
 * mode).
 *
 * Variants `Default`, `Compact`, `Minimal`, `HorizontalEssential`,
 * `HorizontalDetailed`, `DetailPanel` map to the six product-card React
 * function exports — different DOM topology, the variant boundary
 * captures real composition differences (see [[feedback-variant-vs-parameter]]).
 *
 * In curated mode the product-card items themselves are the datasource
 * targets the parent products-list-grid/carousel's Treelist references.
 */
export const productCardRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "product-card@1",
  icon: componentIcons["product-card@1"],
  name: "product-card",
  displayName: "Product Card",
  description:
    "Single product card. Variants: Default, Compact, Minimal, HorizontalEssential, HorizontalDetailed, DetailPanel.",
  section: { handle: "cards-and-lists-section@1" },
  fields: [
    {
      name: "Title",
      shape: "text",
      default: {
        en: "Product name",
        ar: "اسم المنتج",
        es: "Nombre del producto",
        fr: "Nom du produit",
        de: "Produktname",
        da: "Produktnavn",
        ja: "商品名",
        "zh-CN": "产品名称",
        "zh-TW": "產品名稱",
        it: "Nome del prodotto",
      },
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "Product name. Used as the card's primary heading.",
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "ShortDescription",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "One-line product summary surfaced on the horizontal-detailed and detail-panel variants.",
        section: "Content",
        sortOrder: 200,
      },
    },
    {
      name: "Category",
      shape: "reference",
      sitecore: {
        type: "droplink",
        hint: "Product category. Surfaces as an eyebrow above the title and feeds the parent's category facet filter.",
        section: "Content",
        sortOrder: 300,
      },
    },
    {
      name: "Price",
      shape: "number",
      sitecore: {
        type: "number",
        hint: "Price value (currency symbol is locale-driven).",
        section: "Content",
        sortOrder: 400,
      },
    },
    {
      // `Sku`, not `SKU`: the convention map lowerFirsts field names and
      // lowerFirst("SKU") is "sKU", which would never match `sku`.
      name: "Sku",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Stock-keeping unit. Used for analytics and cart integration.",
        section: "Content",
        sortOrder: 500,
      },
    },
    {
      name: "Image1",
      shape: "image",
      role: "product",
      sitecore: {
        type: "image",
        hint: "Primary product image. Required for all variants except detail-panel.",
        section: "Media",
        sortOrder: 100,
      },
    },
    {
      name: "Image2",
      shape: "image",
      role: "product",
      sitecore: {
        type: "image",
        hint: "Secondary product image. Shown on hover for the default variant.",
        section: "Media",
        sortOrder: 200,
      },
    },
    {
      // Label for the footer CTA. Content, not chrome — a field so
      // authors localize it. With `CtaKind: cart` an empty label keeps
      // the compact icon-only add-to-cart button; a set label upgrades
      // it to a labeled button. With `CtaKind: link` it defaults to
      // "Learn more" when empty.
      name: "CtaLabel",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Footer CTA label. Empty + Add-to-Cart kind → the compact icon button; empty + Link kind → 'Learn more'.",
        section: "Content",
        sortOrder: 600,
      },
    },
    {
      name: "Link",
      shape: "link",
      sitecore: {
        type: "general-link",
        hint: "Click-through URL when CtaKind is link — typically a product detail page.",
        section: "Action",
        sortOrder: 100,
      },
    },
  ],
  params: [
    ...cardChromeParams,
    cardTitleLinkIconParam,
    {
      name: "MediaFit",
      shape: "enum",
      default: "cover",
      sitecore: {
        enumHandle: "media-fit@1",
        hint: "How the product image fills its media box. `cover` (default) scales up and crops — right for photography. `contain` fits the whole image in without cropping — bind for product cut-outs on a plain backdrop, packshots, logos and badges, whose edges carry meaning.",
        section: "Style",
        sortOrder: 750,
      },
    },
    {
      // What the footer CTA DOES — decoupled from its visual fill
      // (`CtaVariant`) and from the price row (`ShowPrice`). `cart` is
      // the e-commerce shop affordance (add-to-cart); `link` turns the
      // card into a content tile with an editorial CTA; `none` drops the
      // CTA entirely. Lets one card serve shop AND content contexts.
      name: "CtaKind",
      shape: "enum",
      default: "cart",
      sitecore: {
        enumHandle: "product-cta-kind@1",
        hint: "Footer CTA behavior: cart (add-to-cart), link (content CTA), or none.",
        section: "Call to Action",
        sortOrder: 100,
      },
    },
    {
      // Visual fill of the footer CTA — the shared button-variant axis,
      // so the shop flavor gets the same fill options as a content link.
      // Corner radius stays theme-token-only (`--button-radius`).
      name: "CtaVariant",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "button-variant@1",
        hint: "CTA fill: default (filled), outline, ghost, or link. On the Link kind an unset value reads as the editorial link treatment.",
        section: "Call to Action",
        sortOrder: 200,
      },
    },
    {
      // Trailing arrow on the CTA — orthogonal to fill. On a link-fill
      // CTA this is the editorial arrow + underline treatment.
      name: "ShowArrow",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Append a trailing arrow (→) after the CTA label.",
        section: "Call to Action",
        sortOrder: 300,
      },
    },
    {
      // Whether the footer paints the price row. Independent of the CTA
      // so a content card (`CtaKind: link`) can drop the price while a
      // shop card keeps it. Defaults on; the component defaults it OFF
      // for the link kind unless the author sets it.
      name: "ShowPrice",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Show the price row. Turn off for content (non-shop) cards. Unset defers to the CTA kind — on for cart/none, off for link.",
        section: "Call to Action",
        sortOrder: 400,
      },
    },
  ],
  variants: [
    { name: "Default" },
    { name: "Compact" },
    { name: "Minimal" },
    { name: "HorizontalEssential" },
    { name: "HorizontalDetailed" },
    { name: "DetailPanel" },
  ],
  placedIn: ["cards-products-{*}", "search-results-{*}"],
  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Products" },
      { scope: "site", subfolder: "Products" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default productCardRecipe;
