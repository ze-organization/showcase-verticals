import type { PartialDesignRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { partialDesignThumbnail } from "./_wireframe-thumbnail";

/**
 * Stock footer experience: the classic multi-column link-tree footer
 * (Product / Company / Resources columns) over a narrow legal strip —
 * the fifa/emirates-class enterprise footer, expressed as COMPOSITION
 * inside the footer shell rather than fields on it.
 *
 * Composition:
 *
 *   headless-footer
 *     └─ footer@1 (TwoTier, ShowTierDivider on)
 *          footer-main    → link-list@1 MultiColumn (grouped mode)
 *                           — one headed column per group referenced
 *                           by `footer-columns-content@1`
 *          footer-bottom  → content-block@1 (copyright) +
 *                           link-list@1 InlineSeparated (legal links)
 *
 * The bottom-row datasources are the SAME shared items every stock
 * footer partial uses (`footer-copyright-content@1`,
 * `footer-legal-content@1`, from `partial-designs/footer-shared-content/`)
 * — one copyright line / legal list, every footer placement (the
 * site-logo-content reuse precedent).
 *
 * To change the columns, edit the referenced Link List content items —
 * the layout stays on the shell.
 */
export const footerLinkColumnsRecipe = {
  kind: "partial-design",
  schemaVersion: "1",
  handle: "footer-link-columns@1",
  name: "FooterLinkColumns",
  displayName: "Footer — Link Columns",
  thumbnail: partialDesignThumbnail("Footer_Link_Columns_Partial.png", "Footer — Link Columns"),
  description:
    "Stock footer: multi-column link tree in the footer shell's main tier, copyright + legal links on the narrow second tier. Page designs include this via the `partials` field.",
  layout: {
    placeholders: {
      "headless-footer": [
        {
          componentHandle: "footer@1",
          variant: "TwoTier",
          params: {
            ShowTierDivider: "1",
            TierTwoBackground: "none",
            ColorScheme: "neutral",
          },
          datasourceRef: { kind: "none" },
          placeholders: {
            "footer-main": [
              {
                componentHandle: "link-list@1",
                variant: "MultiColumn",
                params: { Columns: "3" },
                datasourceRef: {
                  kind: "shared",
                  handle: "footer-columns-content@1",
                },
              },
            ],
            "footer-bottom": [
              {
                componentHandle: "content-block@1",
                variant: "Default",
                datasourceRef: {
                  kind: "shared",
                  handle: "footer-copyright-content@1",
                },
              },
              {
                componentHandle: "link-list@1",
                variant: "InlineSeparated",
                datasourceRef: {
                  kind: "shared",
                  handle: "footer-legal-content@1",
                },
              },
            ],
          },
        },
      ],
    },
  },
} satisfies PartialDesignRecipe;

export default footerLinkColumnsRecipe;
