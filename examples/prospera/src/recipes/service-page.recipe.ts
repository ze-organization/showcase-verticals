import type { PageDesignRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { pageDesignThumbnail } from "./_wireframe-thumbnail";

/**
 * Page design for `service@1`. Three partials, same pattern as
 * `article-page@1`. Body is a **partial**, not page-design layout.
 */
export const servicePageRecipe = {
  kind: "page-design",
  schemaVersion: "1",
  handle: "service-page@1",
  name: "ServicePage",
  displayName: "Service Page",
  thumbnail: pageDesignThumbnail("Service_Page_Template.png", "Service Page"),
  description:
    "Service page design — header + Service Details partial + footer. The details partial places service-details@1 on headless-main.",
  appliesTo: ["service@1"],
  partials: [
    "header-utility-bar@1",
    "service-details-partial@1",
    "footer-link-columns@1",
  ],
  layout: { placeholders: {} },
} satisfies PageDesignRecipe;

export default servicePageRecipe;
