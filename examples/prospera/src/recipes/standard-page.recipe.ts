import type { PageDesignRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { pageDesignThumbnail } from "./_wireframe-thumbnail";

/**
 * Marketing page design — `header-brand-nav` + `footer-link-columns`
 * around a `Container` on `headless-main`. Bound to `page@1` only.
 * Insertable types do **not** reuse this shell: they put the body in a
 * third partial (copy `article-page.recipe.ts`) instead of a Container.
 *
 * Slot map at runtime:
 *
 *   headless-main           ← root body (Pages labels this "Main")
 *     ├ container@1 FullBleed  ← page-top hero (container-{id}, no width cap)
 *     └ container@1 Default     ← constrained body (container1Layout)
 *   headless-header         ← from header-brand-nav partial
 *   headless-footer         ← from footer-link-columns partial
 *
 * This design still pre-places a Container on SHARED. Page recipes
 * must ALSO place Container in FINAL (`container1Layout`) — otherwise
 * Pages shows empty Main and `container-1` components never appear.
 *
 * `appliesTo: ["page@1"]` binds this design to the shared `Page`
 * template — the compiler aggregates `appliesTo` arrays across every
 * PageDesignRecipe to emit one `TemplatesMapping` write on the Page
 * Designs root, so each design must enumerate the templates it owns.
 */
export const standardPageRecipe = {
  kind: "page-design",
  schemaVersion: "1",
  handle: "standard-page@1",
  name: "StandardPage",
  displayName: "Standard Page",
  thumbnail: pageDesignThumbnail("Standard_Page_Template.png", "Standard Page"),
  description:
    "Marketing page design — header + footer partials wrapping a centered Container at headless-main. For insertable types, copy article-page (body partial, no Container).",
  appliesTo: ["page@1"],
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

export default standardPageRecipe;
