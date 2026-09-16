import type { PageRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { container1Layout } from "./_hub-grammar";

/**
 * Products wildcard — `/Products/*`. Sibling of the insertable PDPs
 * under `/Home/Products`. Named items (north-desk-lamp, …) win; unmatched
 * slugs resolve a `catalog-product@1` item under the Source Root.
 *
 * `SourceRoot` is a live content-tree path. `{site}` is NOT substituted
 * at runtime (see wildcard-detail@1). After push, confirm the folder
 * landed under this tenant’s contentItemsRoot (starter) and patch the
 * datasource if the compiled value still has a token. Sample slugs:
 * linen-throw, canvas-tote, oak-tray. This tenant’s items land at
 * `/sitecore/content/starter-collection/starter/Data/Catalog Products`.
 */
export const productsWildcardRecipe = {
  kind: "page",
  schemaVersion: "1",
  handle: "products-wildcard@1",
  name: "*",
  displayName: "Product (wildcard)",
  description:
    "Wildcard under Products. Resolves catalog-product items by URL slug; authored PDPs on product@1 take precedence.",
  template: "page@1",
  pageDesign: "standard-page@1",
  itemPath: "/sitecore/content/{site}/Home/Products/*",
  fields: {
    Title: "Product",
    Eyebrow: "Catalog",
    MetaTitle: "Product — Prospera",
    MetaDescription:
      "Wildcard product detail. Resolves a catalog item under Data/Catalog Products from the URL slug.",
    OgType: "website",
    TwitterCard: "summary_large_image",
    IncludeInSitemap: "false",
    SitemapPriority: "0.4",
    ChangeFrequency: "weekly",
  },
  layout: container1Layout([
        {
          componentHandle: "wildcard-detail@1",
          variant: "Product",
          datasourceRef: {
            kind: "scoped",
            slot: "WildcardDetail",
            fields: {
              SourceRoot:
                "/sitecore/content/starter-collection/prospera/Data/Catalog Products",
              Title: "Catalog product",
              Subtitle:
                "Set Source Root to the Catalog Products data folder. Named PDPs under Products win over this wildcard.",
              Body: "<p>Fallback copy for editing and unresolved slugs. A matching catalog-product item replaces this at request time.</p>",
              Image: {
                shape: "image",
                mediaPath:
                  "/theme-photos/home-hero.jpg",
                alt: "Catalog product placeholder",
              },
            },
          },
        },
      ]),
} satisfies PageRecipe;

export default productsWildcardRecipe;
