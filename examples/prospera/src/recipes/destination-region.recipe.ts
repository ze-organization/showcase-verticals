import type { PageTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { pageTemplateThumbnail } from "./_wireframe-thumbnail";
import { HUB_PAGE_FIELDS } from "./_hub-fields";

/**
 * Destination Region hub — insert Country or Destination. Bound to
 * `hub-page@1`. Listing grids use `destinations-list-grid@1`.
 */
export const destinationRegionRecipe = {
  kind: "page-template",
  schemaVersion: "1",
  handle: "destination-region@1",
  name: "DestinationRegion",
  displayName: "Destination Region",
  thumbnail: pageTemplateThumbnail("Hub_Page_Template.png", "Destination Region"),
  description:
    "Destination region hub — Title / Eyebrow / ShortDescription / Image / Content plus SEO. Insert Country or Destination under this type. hub-page supplies header, footer, and a Container.",
  fields: HUB_PAGE_FIELDS,
  insertOptions: ["destination-country@1", "destination@1"],
} satisfies PageTemplateRecipe;

export default destinationRegionRecipe;
