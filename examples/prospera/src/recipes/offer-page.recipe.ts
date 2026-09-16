import type { PageDesignRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { pageDesignThumbnail } from "./_wireframe-thumbnail";

export const offerPageRecipe = {
  kind: "page-design",
  schemaVersion: "1",
  handle: "offer-page@1",
  name: "OfferPage",
  displayName: "Offer Page",
  thumbnail: pageDesignThumbnail("Offer_Page_Template.png", "Offer Page"),
  description: "Offer page design — header + Offer Details partial + footer.",
  appliesTo: ["offer@1"],
  partials: [
    "header-utility-bar@1",
    "offer-details-partial@1",
    "footer-link-columns@1",
  ],
  layout: { placeholders: {} },
} satisfies PageDesignRecipe;

export default offerPageRecipe;
