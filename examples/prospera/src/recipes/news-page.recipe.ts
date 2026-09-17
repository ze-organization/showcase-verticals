import {
  pageDesignThumbnail,
  type PageDesignRecipe,
} from "./_wireframe-thumbnail";

export const newsPageRecipe = {
  kind: "page-design",
  schemaVersion: "1",
  handle: "news-page@1",
  name: "NewsPage",
  displayName: "News Page",
  thumbnail: pageDesignThumbnail("News_Page_Template.png", "News Page"),
  description:
    "News page design — header + News Details partial + footer.",
  appliesTo: ["news@1"],
  partials: [
    "header-utility-bar@1",
    "news-details-partial@1",
    "footer-link-columns@1",
  ],
  layout: { placeholders: {} },
} satisfies PageDesignRecipe;

export default newsPageRecipe;
