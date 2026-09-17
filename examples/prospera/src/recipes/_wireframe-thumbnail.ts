/**
 * Appearance thumbnails for page designs, partial designs, and page
 * templates. Paths are repo-root relative — scai's MediaUpload executor
 * resolves `path.resolve(source.path)` from cwd, not from the recipe file.
 *
 * Destination on push is the existing
 * `/sitecore/media library/Project/starter-collection/shared/Wireframes/`
 * tree (page-designs / partial-designs), so re-push overwrites the
 * uploaded items rather than minting a second copy.
 *
 * scai 0.41's public recipe types do not yet declare `thumbnail`, so the
 * three design-kind aliases below intersect it on. Recipes `satisfies`
 * these instead of the CLI types so `npm run build` typecheck passes.
 */

import type {
  PageDesignRecipe as PageDesignRecipeBase,
  PageTemplateRecipe as PageTemplateRecipeBase,
  PartialDesignRecipe as PartialDesignRecipeBase,
} from "@sitecoreai-labs/sitecoreai-cli/recipe";

const PAGE_DESIGNS_DIR = "src/recipes/media/wireframes/page-designs";
const PARTIAL_DESIGNS_DIR = "src/recipes/media/wireframes/partial-designs";

export type RecipeAssetThumbnail = {
  kind: "asset";
  path: string;
  alt: string;
};

export type PartialDesignRecipe = PartialDesignRecipeBase & {
  thumbnail?: RecipeAssetThumbnail;
};

export type PageDesignRecipe = PageDesignRecipeBase & {
  thumbnail?: RecipeAssetThumbnail;
};

export type PageTemplateRecipe = PageTemplateRecipeBase & {
  thumbnail?: RecipeAssetThumbnail;
};

export const pageDesignThumbnail = (file: string, displayName: string) =>
  ({
    kind: "asset" as const,
    path: `${PAGE_DESIGNS_DIR}/${file}`,
    alt: `Wireframe thumbnail for the ${displayName} page design`,
  });

export const partialDesignThumbnail = (file: string, displayName: string) =>
  ({
    kind: "asset" as const,
    path: `${PARTIAL_DESIGNS_DIR}/${file}`,
    alt: `Wireframe thumbnail for the ${displayName} partial design`,
  });

export const pageTemplateThumbnail = (file: string, displayName: string) =>
  ({
    kind: "asset" as const,
    path: `${PAGE_DESIGNS_DIR}/${file}`,
    alt: `Wireframe thumbnail for the ${displayName} page template`,
  });
