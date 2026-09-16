import type { PageDesignRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { pageDesignThumbnail } from "./_wireframe-thumbnail";

/**
 * Page design for `article@1`. Three partials, same pattern as a real
 * SXA page design:
 *
 *   headless-header  ← header-utility-bar@1
 *   headless-main    ← article-details-partial@1  (Article Details + two placeholders)
 *   headless-footer  ← footer-link-columns@1
 *
 * Body is a **partial**, not page-design layout and not per-page FINAL
 * placements. Insert → Article therefore always gets the article shell;
 * authors fill the page fields and drop extras into the two placeholders.
 */
export const articlePageRecipe = {
  kind: "page-design",
  schemaVersion: "1",
  handle: "article-page@1",
  name: "ArticlePage",
  displayName: "Article Page",
  thumbnail: pageDesignThumbnail("Article_Page_Template.png", "Article Page"),
  description:
    "Article page design — header + Article Details partial + footer. The details partial places article-details@1 on headless-main.",
  appliesTo: ["article@1"],
  partials: [
    "header-utility-bar@1",
    "article-details-partial@1",
    "footer-link-columns@1",
  ],
  layout: { placeholders: {} },
} satisfies PageDesignRecipe;

export default articlePageRecipe;
