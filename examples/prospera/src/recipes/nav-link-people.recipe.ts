import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/** Mega-menu column link for the shared primary nav. */
export const navLinkPeopleRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "nav-link-people@1",
  name: "nav-link-people",
  displayName: "People",
  description: 'Primary-nav Company dropdown link: People.',
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: 'People' },
    Link: { shape: "link-external", href: '/People', text: 'People' },
  },
} satisfies ContentItemRecipe;

export default navLinkPeopleRecipe;
