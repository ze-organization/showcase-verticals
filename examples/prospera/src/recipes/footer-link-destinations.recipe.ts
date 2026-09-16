import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

export const footerLinkDestinationsRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "footer-link-destinations@1",
  name: "footer-link-destinations",
  displayName: "Locations",
  description: "Leftover footer item retargeted to Locations.",
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: "Locations" },
    Link: { shape: "link-external", href: "/Locations", text: "Locations" },
  },
} satisfies ContentItemRecipe;

export default footerLinkDestinationsRecipe;
