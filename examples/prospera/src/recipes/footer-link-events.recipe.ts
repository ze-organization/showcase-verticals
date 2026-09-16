import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/** Footer link-columns / legal item. */
export const footerLinkEventsRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "footer-link-events@1",
  name: "footer-link-events",
  displayName: "Events",
  description: 'Footer Resources column link: Events.',
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: 'Events' },
    Link: { shape: "link-external", href: '/Events', text: 'Events' },
  },
} satisfies ContentItemRecipe;

export default footerLinkEventsRecipe;
