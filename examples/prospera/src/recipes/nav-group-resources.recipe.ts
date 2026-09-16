import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * One mega-menu column for the shared primary nav — conforms to
 * `link-list-content@1` (Title heading + Items links) and is referenced
 * from `nav-item-resources@1`'s `Groups` Treelist. Field-driven Groups are what
 * make the stock nav dropdowns actually OPEN WITH CONTENT: the old
 * `HasPanel: true` seed pointed each item at a `nav-item-panel-{index}`
 * placeholder that no stock experience composes anything into, so every
 * chevron toggled an empty panel ("the dropdowns don't work").
 *
 * Items is CreateOnly after first apply — patch the live treelist
 * instead of re-pushing. Intended links: Articles, News, Case Studies,
 * Events, Documentation.
 */
export const navGroupResourcesRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "nav-group-resources@1",
  name: "nav-group-resources",
  displayName: "Nav Group — Resources",
  description: "Resources mega-menu column of the shared primary nav.",
  templateType: "link-list-content@1",
  fields: {
    Title: { shape: "text", value: "Learn" },
    Items: {
      shape: "reference",
      refs: [
        "nav-link-articles@1",
        "nav-link-news@1",
        "nav-link-case-studies@1",
        "nav-link-events@1",
        "nav-link-documentation@1",
      ],
    },
  },
} satisfies ContentItemRecipe;

export default navGroupResourcesRecipe;
