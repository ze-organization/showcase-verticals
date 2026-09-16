import type { PartialDesignRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { partialDesignThumbnail } from "./_wireframe-thumbnail";

/**
 * Article-with-TOC body shell — the third partial on
 * `article-with-toc-page@1`. Header and footer partials only fill
 * `headless-header` / `headless-footer`; without this, an Insert is
 * chrome-only.
 *
 * Places `article-with-toc-details@1` on `headless-main` (no outer
 * Container). Empty datasource so the rendering reads the current
 * `article-with-toc@1` page. Authors compose extras into
 * `article-with-toc-details-{*}` and `article-with-toc-details-full-width-{*}`.
 */
export const articleWithTocDetailsPartialRecipe = {
  kind: "partial-design",
  schemaVersion: "1",
  handle: "article-with-toc-details-partial@1",
  name: "ArticleWithTocDetails",
  displayName: "Article with Table of Contents Details",
  thumbnail: partialDesignThumbnail("Article_With_TOC_Details_Partial.png", "Article with Table of Contents Details"),
  description:
    "Article-with-TOC body partial — details component on headless-main, with in-column and full-width placeholders. Include from article-with-toc-page via partials.",
  layout: {
    placeholders: {
      "headless-main": [
        {
          componentHandle: "article-with-toc-details@1",
          variant: "Default",
          params: { MaxWidth: "auto" },
          datasourceRef: { kind: "none" },
        },
      ],
    },
  },
} satisfies PartialDesignRecipe;

export default articleWithTocDetailsPartialRecipe;
