import {
  partialDesignThumbnail,
  type PartialDesignRecipe,
} from "./_wireframe-thumbnail";

/**
 * Stock footer experience: the brand-led footer — logo + short brand
 * blurb beside a social-links column, over a narrow copyright strip,
 * composed inside the footer shell.
 *
 * Composition:
 *
 *   headless-footer
 *     └─ footer@1 (TwoTier, ShowTierDivider on)
 *          footer-main    → column-splitter@1 (2 cols, primary-start)
 *                             column-1 → image@1 (site logo) +
 *                                        content-block@1 (brand blurb)
 *                             column-2 → link-list@1 Horizontal
 *                                        (social profile links) +
 *                                        link-list@1 Horizontal
 *                                        (app-store listing links)
 *          footer-bottom  → content-block@1 (copyright)
 *
 * The app-download links are a SECOND list under the social row, not
 * extra entries in it — the social block keeps its own heading and
 * space, and the badge treatment (`app-badge`) resolves per store host.
 *
 * **Logo reuse.** `site-logo-content@1` is the same ContentItem the
 * stock header partials reference (from
 * `partial-designs/header-shared-content/`) — one logo asset, every
 * chrome placement. The copyright reuses `footer-copyright-content@1`.
 *
 * The blurb is inline (`kind:"scoped"`) so the partial is
 * self-contained; point it at a shared item to make it editable
 * across placements.
 */
export const footerBrandSocialRecipe = {
  kind: "partial-design",
  schemaVersion: "1",
  handle: "footer-brand-social@1",
  name: "FooterBrandSocial",
  displayName: "Footer — Brand + Social",
  thumbnail: partialDesignThumbnail("Footer_Brand_Social_Partial.png", "Footer — Brand + Social"),
  description:
    "Stock footer: logo + brand blurb beside a social-links column in the footer shell's main tier, copyright on the narrow second tier. Page designs include this via the `partials` field.",
  layout: {
    placeholders: {
      "headless-footer": [
        {
          componentHandle: "footer@1",
          variant: "TwoTier",
          params: {
            ShowTierDivider: "1",
            TierTwoBackground: "none",
          },
          datasourceRef: { kind: "none" },
          placeholders: {
            "footer-main": [
              {
                componentHandle: "column-splitter@1",
                variant: "Default",
                params: {
                  ColumnCount: "2",
                  Distribution: "primary-start",
                  MobileColumns: "1",
                },
                datasourceRef: { kind: "none" },
                placeholders: {
                  "column-1": [
                    {
                      componentHandle: "image@1",
                      variant: "Simple",
                      datasourceRef: {
                        kind: "shared",
                        handle: "site-logo-content@1",
                      },
                    },
                    {
                      componentHandle: "content-block@1",
                      variant: "Default",
                      datasourceRef: {
                        kind: "scoped",
                        slot: "BrandBlurb",
                        fields: {
                          Body: "<p>Build, ship, and grow. Tools for teams that move fast and care about craft.</p>",
                        },
                      },
                    },
                  ],
                  "column-2": [
                    {
                      componentHandle: "link-list@1",
                      variant: "Horizontal",
                      datasourceRef: {
                        kind: "shared",
                        handle: "footer-social-content@1",
                      },
                    },
                    {
                      componentHandle: "link-list@1",
                      variant: "Horizontal",
                      datasourceRef: {
                        kind: "shared",
                        handle: "footer-app-links-content@1",
                      },
                    },
                  ],
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
            ],
          },
        },
      ],
    },
  },
} satisfies PartialDesignRecipe;

export default footerBrandSocialRecipe;
