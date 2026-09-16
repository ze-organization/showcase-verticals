import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/** Account-panel link for the `header-utility-bar@1` stock header. */
export const accountLinkOrdersRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "account-link-orders@1",
  name: "account-link-orders",
  displayName: "Order history",
  description: "Header account-panel item: Order history link.",
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: "Order history" },
    Link: {
      shape: "link-external",
      href: "/account/orders",
      text: "Order history",
    },
  },
} satisfies ContentItemRecipe;

export default accountLinkOrdersRecipe;
