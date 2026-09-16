import type { PartialDesignRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { partialDesignThumbnail } from "./_wireframe-thumbnail";

/**
 * Stock footer experience: the four-band enterprise footer — a slim
 * brand tagline strip, a social + app-download row, the tall link-column
 * block, and a narrow legal line, each on its OWN band.
 *
 * This is the reference composition for `footer@1`'s `Bands` variant,
 * and the reason that variant exists. `Default` and `TwoTier` apply the
 * container, the tier padding and a fixed `gap-8` around their region,
 * so everything dropped in stacks at one uniform rhythm and nothing can
 * paint edge to edge. Real footers are not built that way: a one-line
 * tagline, an icon row, a four-column link tree, and a copyright line
 * all want different heights. `Bands` contributes no width, padding or
 * gap, leaving all three to each band — so each `section-wrapper@1`
 * below sets its own `PaddingY`, and `ShowBandDividers` rules each band
 * off from the next.
 *
 * Composition:
 *
 *   headless-footer
 *     └─ footer@1 (Bands, ShowBandDividers on)
 *          footer-bands →
 *            1. section-wrapper@1 (PaddingY sm)  → content-block@1 tagline
 *            2. section-wrapper@1 (PaddingY md)  → link-list@1 Horizontal (social)
 *                                                + link-list@1 Horizontal (app badges)
 *            3. section-wrapper@1 (PaddingY xl)  → link-list@1 MultiColumn (columns)
 *            4. section-wrapper@1 (PaddingY sm)  → content-block@1 copyright
 *                                                + link-list@1 InlineSeparated (legal)
 *
 * Note the padding ramp — sm / md / xl / sm. That asymmetry IS the
 * design; a uniform value here would reproduce exactly the problem the
 * variant was added to solve.
 *
 * **Content reuse.** Every datasource except the tagline is already
 * shared with another stock footer: `footer-social-content@1` and
 * `footer-app-links-content@1` from `footer-brand-social/`,
 * `footer-columns-content@1` from `footer-link-columns/`, and
 * `footer-copyright-content@1` + `footer-legal-content@1` from
 * `footer-shared-content/`. So a tenant that edits its social profiles
 * or link columns once sees the change in every footer placement.
 */
export const footerBandsRecipe = {
  kind: "partial-design",
  schemaVersion: "1",
  handle: "footer-bands@1",
  name: "FooterBands",
  displayName: "Footer — Bands",
  thumbnail: partialDesignThumbnail("Footer_Bands_Partial.png", "Footer — Bands"),
  description:
    "Stock footer: four bands at four different heights — a slim brand tagline strip, a social + app-download row, the tall link-column block, and a narrow legal line, each ruled off from the next. The reference composition for footer@1's Bands variant; pick it over footer-link-columns when the footer needs more than two rhythms. Page designs include this via the `partials` field.",
  layout: {
    placeholders: {
      "headless-footer": [
        {
          componentHandle: "footer@1",
          variant: "Bands",
          params: {
            ShowBandDividers: "1",
          },
          datasourceRef: { kind: "none" },
          placeholders: {
            "footer-bands": [
              // 1. Tagline strip — the shallowest band.
              {
                componentHandle: "section-wrapper@1",
                variant: "Default",
                params: { PaddingY: "sm" },
                datasourceRef: { kind: "none" },
                placeholders: {
                  "section-wrapper-content": [
                    {
                      componentHandle: "content-block@1",
                      variant: "Default",
                      datasourceRef: {
                        kind: "shared",
                        handle: "footer-tagline-content@1",
                      },
                    },
                  ],
                },
              },
              // 2. Social profiles + app-store badges.
              {
                componentHandle: "section-wrapper@1",
                variant: "Default",
                params: { PaddingY: "md" },
                datasourceRef: { kind: "none" },
                placeholders: {
                  "section-wrapper-content": [
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
              // 3. The link tree — the tallest band by a wide margin.
              {
                componentHandle: "section-wrapper@1",
                variant: "Default",
                params: { PaddingY: "xl" },
                datasourceRef: { kind: "none" },
                placeholders: {
                  "section-wrapper-content": [
                    {
                      componentHandle: "link-list@1",
                      variant: "MultiColumn",
                      params: { Columns: "4" },
                      datasourceRef: {
                        kind: "shared",
                        handle: "footer-columns-content@1",
                      },
                    },
                  ],
                },
              },
              // 4. Copyright + legal links.
              {
                componentHandle: "section-wrapper@1",
                variant: "Default",
                params: { PaddingY: "sm" },
                datasourceRef: { kind: "none" },
                placeholders: {
                  "section-wrapper-content": [
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
      ],
    },
  },
} satisfies PartialDesignRecipe;

export default footerBandsRecipe;
