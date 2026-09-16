import type { PageTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { pageTemplateThumbnail } from "./_wireframe-thumbnail";
import { HUB_PAGE_FIELDS } from "./_hub-fields";

/**
 * Location Metro hub — insert Location only. Bound to `hub-page@1`.
 */
export const locationMetroRecipe = {
  kind: "page-template",
  schemaVersion: "1",
  handle: "location-metro@1",
  name: "LocationMetro",
  displayName: "Location Metro",
  thumbnail: pageTemplateThumbnail("Hub_Page_Template.png", "Location Metro"),
  description:
    "Location metro hub — Title / Eyebrow / ShortDescription / Image / Content plus SEO. Insert Location under this type. hub-page supplies header, footer, and a Container.",
  fields: HUB_PAGE_FIELDS,
  insertOptions: ["location@1"],
} satisfies PageTemplateRecipe;

export default locationMetroRecipe;
