import {
  partialDesignThumbnail,
  type PartialDesignRecipe,
} from "./_wireframe-thumbnail";

/**
 * Stock footer experience: the single compact strip — copyright line +
 * inline legal links in ONE narrow band, composed inside the footer
 * shell (microsites, app landing pages, campaign sites).
 *
 * Composition:
 *
 *   headless-footer
 *     └─ footer@1 (Default single tier, PaddingY sm)
 *          footer-main → column-splitter@1 (2 cols)
 *                          column-1 → content-block@1 (copyright)
 *                          column-2 → link-list@1 InlineSeparated
 *                                     (legal links)
 *
 * Both datasources are the SAME shared items every stock footer
 * partial uses (`footer-copyright-content@1`, `footer-legal-content@1`,
 * from `partial-designs/footer-shared-content/`) — edit once, every
 * footer placement follows. No content recipes of its own.
 */
export const footerLegalStripRecipe = {
  kind: "partial-design",
  schemaVersion: "1",
  handle: "footer-legal-strip@1",
  name: "FooterLegalStrip",
  displayName: "Footer — Legal Strip",
  thumbnail: partialDesignThumbnail("Footer_Legal_Strip_Partial.png", "Footer — Legal Strip"),
  description:
    "Stock footer: one compact strip — copyright + inline legal links in the footer shell's single tier. Page designs include this via the `partials` field.",
  layout: {
    placeholders: {
      "headless-footer": [
        {
          componentHandle: "footer@1",
          variant: "Default",
          params: {
            PaddingY: "sm",
          },
          datasourceRef: { kind: "none" },
          placeholders: {
            "footer-main": [
              {
                componentHandle: "column-splitter@1",
                variant: "Default",
                params: {
                  ColumnCount: "2",
                  MobileColumns: "1",
                },
                datasourceRef: { kind: "none" },
                placeholders: {
                  "column-1": [
                    {
                      componentHandle: "content-block@1",
                      variant: "Default",
                      datasourceRef: {
                        kind: "shared",
                        handle: "footer-copyright-content@1",
                      },
                    },
                  ],
                  "column-2": [
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
      ],
    },
  },
} satisfies PartialDesignRecipe;

export default footerLegalStripRecipe;
