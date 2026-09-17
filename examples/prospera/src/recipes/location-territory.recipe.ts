import {
  pageTemplateThumbnail,
  type PageTemplateRecipe,
} from "./_wireframe-thumbnail";
import { HUB_PAGE_FIELDS } from "./_hub-fields";

/**
 * Location Territory hub — insert Metro or Location. Bound to
 * `hub-page@1`. Body uses the locations finder layout.
 */
export const locationTerritoryRecipe = {
  kind: "page-template",
  schemaVersion: "1",
  handle: "location-territory@1",
  name: "LocationTerritory",
  displayName: "Location Territory",
  thumbnail: pageTemplateThumbnail("Hub_Page_Template.png", "Location Territory"),
  description:
    "Location territory hub — Title / Eyebrow / ShortDescription / Image / Content plus SEO. Insert Metro or Location under this type. hub-page supplies header, footer, and a Container.",
  fields: HUB_PAGE_FIELDS,
  insertOptions: ["location-metro@1", "location@1"],
} satisfies PageTemplateRecipe;

export default locationTerritoryRecipe;
