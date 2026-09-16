import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/** Mega-menu column link for the shared primary nav. */
export const navLinkLeadershipRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "nav-link-leadership@1",
  name: "nav-link-leadership",
  displayName: "Leadership",
  description: 'Primary-nav Company dropdown link: Leadership.',
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: 'Leadership' },
    Link: { shape: "link-external", href: '/Leadership', text: 'Leadership' },
  },
} satisfies ContentItemRecipe;

export default navLinkLeadershipRecipe;
