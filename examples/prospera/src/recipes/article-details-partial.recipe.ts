import {
  partialDesignThumbnail,
  type PartialDesignRecipe,
} from "./_wireframe-thumbnail";

/**
 * Article body shell — the missing third partial on `article-page@1`.
 * Header and footer partials only fill `headless-header` / `headless-footer`;
 * without this, an Article page is chrome-only.
 *
 * Places `article-details@1` on `headless-main` (no outer Container —
 * the component brings its own). Empty datasource so the rendering
 * reads the current `article@1` page (Title, ShortDescription, Content,
 * Image). Authors compose extra blocks into `article-details-{*}` and
 * `article-details-full-width-{*}`.
 */
export const articleDetailsPartialRecipe = {
  kind: "partial-design",
  schemaVersion: "1",
  handle: "article-details-partial@1",
  name: "ArticleDetails",
  displayName: "Article Details",
  thumbnail: partialDesignThumbnail("Article_Details_Partial.png", "Article Details"),
  description:
    "Article body partial — Article Details on headless-main, with in-column and full-width placeholders. Include from article-page via partials.",
  layout: {
    placeholders: {
      "headless-main": [
        {
          componentHandle: "article-details@1",
          variant: "Default",
          params: { MaxWidth: "auto" },
          datasourceRef: { kind: "none" },
        },
      ],
    },
  },
} satisfies PartialDesignRecipe;

export default articleDetailsPartialRecipe;
