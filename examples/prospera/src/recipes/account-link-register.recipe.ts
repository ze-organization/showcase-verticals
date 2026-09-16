import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/** Account-panel link for the `header-utility-bar@1` stock header. */
export const accountLinkRegisterRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "account-link-register@1",
  name: "account-link-register",
  displayName: "Create account",
  description: "Header account-panel item: Create account link.",
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: "Create account" },
    Link: {
      shape: "link-external",
      href: "/account/register",
      text: "Create account",
    },
  },
} satisfies ContentItemRecipe;

export default accountLinkRegisterRecipe;
