import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/** Footer link-columns / legal item. */
export const footerLinkPeopleRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "footer-link-people@1",
  name: "footer-link-people",
  displayName: "People",
  description: 'Footer Company column link: People.',
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: 'People' },
    Link: { shape: "link-external", href: '/People', text: 'People' },
  },
} satisfies ContentItemRecipe;

export default footerLinkPeopleRecipe;
