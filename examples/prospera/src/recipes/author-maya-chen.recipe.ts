import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared byline author for the sample article pages. Referenced from
 * each article-header `Authors` Treelist.
 */
export const authorMayaChenRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "author-maya-chen@1",
  name: "maya-chen",
  displayName: "Maya Chen",
  description: "Sample editorial author used on the starter article pages.",
  templateType: "author@1",
  fields: {
    AuthorName: { shape: "text", value: "Maya Chen" },
    JobTitle: { shape: "text", value: "Editorial Lead" },
    Pronouns: { shape: "text", value: "she/her" },
    About: {
      shape: "text",
      value:
        "Writes about composable architecture, authoring UX, and shipping Sitecore sites as code.",
    },
    Bio: {
      shape: "richText",
      value:
        "<p>Maya Chen leads the starter editorial voice — architecture explainers, authoring patterns, and the path from recipe to live page.</p>",
    },
    Avatar: {
      shape: "image",
      mediaPath: "/theme-photos/promo-closer.jpg",
      alt: "Portrait of Maya Chen",
    },
  },
} satisfies ContentItemRecipe;

export default authorMayaChenRecipe;
