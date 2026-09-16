import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing the grid-level `CardVariant` rendering parameter
 * on the articles renderings (`articles-list-grid@1` /
 * `articles-carousel@1`). In curated mode the grid forwards this shape
 * to every child article card — values match the `ALLOWED_CARD_VARIANTS`
 * set the `articles.sitecore.ts` adapter parses. Lands at
 * `<enumerationsRoot>/Card/ArticleCardVariant` per-site.
 *
 * Reference via `sitecore.enumHandle: "article-card-variant@1"`.
 */
export const articleCardVariantEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "article-card-variant@1",
  name: "ArticleCardVariant",
  displayName: "Article Card Variant",
  description:
    "Card shape forwarded to every article card in a curated grid/carousel: default (image + meta + excerpt), title-only, image-title-only (image-forward), or overlay (photo card with gradient scrim).",
  location: { scope: "site", folder: ["Card"] },
  default: "default",
  values: [
    { name: "default", displayName: "Default" },
    { name: "title-only", displayName: "Title Only" },
    { name: "image-title-only", displayName: "Image + Title" },
    { name: "overlay", displayName: "Overlay" },
  ],
} satisfies EnumerationRecipe;

export default articleCardVariantEnumRecipe;
