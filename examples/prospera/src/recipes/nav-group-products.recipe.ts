import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * One mega-menu column for the shared primary nav — conforms to
 * `link-list-content@1` (Title heading + Items links) and is referenced
 * from `nav-item-products@1`'s `Groups` Treelist. Field-driven Groups are what
 * make the stock nav dropdowns actually OPEN WITH CONTENT: the old
 * `HasPanel: true` seed pointed each item at a `nav-item-panel-{index}`
 * placeholder that no stock experience composes anything into, so every
 * chevron toggled an empty panel ("the dropdowns don't work").
 *
 * Items is CreateOnly after first apply — patch the live treelist
 * instead of re-pushing. Intended links: Lighting, Seating, Tableware,
 * Offers, Pricing.
 */
export const navGroupProductsRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "nav-group-products@1",
  name: "nav-group-products",
  displayName: "Nav Group — Products",
  description: "Products mega-menu column of the shared primary nav.",
  templateType: "link-list-content@1",
  fields: {
    Title: { shape: "text", value: "Explore" },
    Items: {
      shape: "reference",
      refs: [
        "nav-link-lighting@1",
        "nav-link-seating@1",
        "nav-link-tableware@1",
        "nav-link-offers@1",
        "nav-link-pricing@1",
      ],
    },
  },
} satisfies ContentItemRecipe;

export default navGroupProductsRecipe;
