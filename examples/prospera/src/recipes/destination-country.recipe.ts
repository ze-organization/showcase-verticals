import type { PageTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { pageTemplateThumbnail } from "./_wireframe-thumbnail";
import { HUB_PAGE_FIELDS } from "./_hub-fields";

/**
 * Destination Country hub — insert Destination only. Bound to
 * `hub-page@1`.
 */
export const destinationCountryRecipe = {
  kind: "page-template",
  schemaVersion: "1",
  handle: "destination-country@1",
  name: "DestinationCountry",
  displayName: "Destination Country",
  thumbnail: pageTemplateThumbnail("Hub_Page_Template.png", "Destination Country"),
  description:
    "Destination country hub — Title / Eyebrow / ShortDescription / Image / Content plus SEO. Insert Destination under this type. hub-page supplies header, footer, and a Container.",
  fields: HUB_PAGE_FIELDS,
  insertOptions: ["destination@1"],
} satisfies PageTemplateRecipe;

export default destinationCountryRecipe;
