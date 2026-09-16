import type { PageDesignRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { pageDesignThumbnail } from "./_wireframe-thumbnail";

export const partnerPageRecipe = {
  kind: "page-design",
  schemaVersion: "1",
  handle: "partner-page@1",
  name: "PartnerPage",
  displayName: "Partner Page",
  thumbnail: pageDesignThumbnail("Partner_Page_Template.png", "Partner Page"),
  description: "Partner page design — header + Partner Details partial + footer.",
  appliesTo: ["partner@1"],
  partials: [
    "header-utility-bar@1",
    "partner-details-partial@1",
    "footer-link-columns@1",
  ],
  layout: { placeholders: {} },
} satisfies PageDesignRecipe;

export default partnerPageRecipe;
