import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/** Mega-menu column link for the shared primary nav. */
export const navLinkEventsRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "nav-link-events@1",
  name: "nav-link-events",
  displayName: "Events",
  description: 'Primary-nav Resources dropdown link: Events. Patch live nav-group-resources@1; do not re-push that treelist.',
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: 'Events' },
    Link: { shape: "link-external", href: '/Events', text: 'Events' },
  },
} satisfies ContentItemRecipe;

export default navLinkEventsRecipe;
