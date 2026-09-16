import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/** Account-panel link for the `header-utility-bar@1` stock header. */
export const accountLinkSignInRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "account-link-sign-in@1",
  name: "account-link-sign-in",
  displayName: "Login",
  description: "Header account-link: Login. Header LINK, not a second CTA.",
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: "Login" },
    Link: { shape: "link-external", href: "/account/sign-in", text: "Login" },
  },
} satisfies ContentItemRecipe;

export default accountLinkSignInRecipe;
