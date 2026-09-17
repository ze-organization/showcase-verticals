import {
  pageDesignThumbnail,
  type PageDesignRecipe,
} from "./_wireframe-thumbnail";

/**
 * Browse-hub page design — cloned from `standard-page@1`. Header +
 * footer partials around a Container on `headless-main`. Bound to the
 * six hub templates (not `page@1`). Page recipes use `container1Layout`
 * so Container lives in FINAL (FullBleed Container for the hero,
 * Default Container for the children grid + supporting band + promo).
 * Do not address `container-1` as a top-level page slot.
 */
export const hubPageRecipe = {
  kind: "page-design",
  schemaVersion: "1",
  handle: "hub-page@1",
  name: "HubPage",
  displayName: "Hub Page",
  thumbnail: pageDesignThumbnail("Hub_Page_Template.png", "Hub Page"),
  description:
    "Browse-hub page design — header + footer partials wrapping a centered Container at headless-main. Applies to Category, Subcategory, Region, Country, Territory, and Metro.",
  appliesTo: [
    "product-category@1",
    "product-subcategory@1",
    "destination-region@1",
    "destination-country@1",
    "location-territory@1",
    "location-metro@1",
  ],
  partials: ["header-utility-bar@1", "footer-link-columns@1"],
  layout: {
    placeholders: {
      "headless-main": [
        {
          componentHandle: "container@1",
          variant: "Default",
          params: {
            MaxWidth: "wide",
            Alignment: "center",
            PaddingY: "lg",
          },
          datasourceRef: { kind: "none" },
        },
      ],
    },
  },
} satisfies PageDesignRecipe;

export default hubPageRecipe;
