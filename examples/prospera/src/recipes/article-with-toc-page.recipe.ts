import {
  pageDesignThumbnail,
  type PageDesignRecipe,
} from "./_wireframe-thumbnail";

/**
 * Page design for `article-with-toc@1`. Three partials, same pattern as
 * `article-page@1`:
 *
 *   headless-header  ← header-utility-bar@1
 *   headless-main    ← article-with-toc-details-partial@1
 *   headless-footer  ← footer-link-columns@1
 *
 * Body is a **partial**, not page-design layout. Insert → Article with
 * Table of Contents therefore always gets the TOC article shell.
 */
export const articleWithTocPageRecipe = {
  kind: "page-design",
  schemaVersion: "1",
  handle: "article-with-toc-page@1",
  name: "ArticleWithTocPage",
  displayName: "Article with Table of Contents Page",
  thumbnail: pageDesignThumbnail("Article_With_TOC_Page_Template.png", "Article with Table of Contents Page"),
  description:
    "Article-with-TOC page design — header + Article with Table of Contents Details partial + footer. The details partial places article-with-toc-details@1 on headless-main.",
  appliesTo: ["article-with-toc@1"],
  partials: [
    "header-utility-bar@1",
    "article-with-toc-details-partial@1",
    "footer-link-columns@1",
  ],
  layout: { placeholders: {} },
} satisfies PageDesignRecipe;

export default articleWithTocPageRecipe;
