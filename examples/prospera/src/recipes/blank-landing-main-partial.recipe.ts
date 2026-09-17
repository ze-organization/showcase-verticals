import {
  partialDesignThumbnail,
  type PartialDesignRecipe,
} from "./_wireframe-thumbnail";

/**
 * Blank Landing body shell — the third partial on `blank-landing-page@1`.
 * Header and footer partials only fill `headless-header` / `headless-footer`;
 * without this, Insert → Blank Landing is chrome-only.
 *
 * Places `container@1` on `headless-main` (same shell as `standard-page@1`)
 * so authors compose into `container-{*}`. Drop a FullBleed Container
 * above the Default one for page-top heroes. No campaign details rendering.
 */
export const blankLandingMainPartialRecipe = {
  kind: "partial-design",
  schemaVersion: "1",
  handle: "blank-landing-main-partial@1",
  name: "BlankLandingMain",
  displayName: "Blank Landing Main",
  thumbnail: partialDesignThumbnail("Blank_Landing_Main_Partial.png", "Blank Landing Main"),
  description:
    "Blank Landing body partial — Container on headless-main. Authors drop renderings into container-{*}; use the FullBleed Container variant for page-top heroes. Include from blank-landing-page via partials.",
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
} satisfies PartialDesignRecipe;

export default blankLandingMainPartialRecipe;
