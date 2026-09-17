import {
  partialDesignThumbnail,
  type PartialDesignRecipe,
} from "./_wireframe-thumbnail";

/**
 * Prospera site chrome: logo + Personal / Business / About / Help,
 * Login as a header link, Apply Now as the sole CTA.
 *
 *   headless-header
 *     └─ header@1 (Standard, ColorScheme white)
 *          header-start  → image@1 Logo
 *          header-nav    → main-nav@1 (primary-nav-content@1)
 *          header-end    → cta-button@1 link (Login) +
 *                          cta-button@1 default (Apply Now)
 *          header-mobile → mobile-menu@1 Drawer → main-nav@1
 */
export const headerUtilityBarRecipe = {
  kind: "partial-design",
  schemaVersion: "1",
  handle: "header-utility-bar@1",
  name: "HeaderUtilityBar",
  displayName: "Header — Utility Bar",
  thumbnail: partialDesignThumbnail("Header_Utility_Bar_Partial.png", "Header — Utility Bar"),
  description:
    "Prospera header: logo, Personal / Business / About / Help, Login link, Apply Now CTA, mobile drawer. Page designs include this via `partials`.",
  layout: {
    placeholders: {
      "headless-header": [
        {
          componentHandle: "header@1",
          variant: "Standard",
          params: { ColorScheme: "white" },
          datasourceRef: { kind: "none" },
          placeholders: {
            "header-start": [
              {
                componentHandle: "image@1",
                variant: "Logo",
                datasourceRef: {
                  kind: "shared",
                  handle: "site-logo-content@1",
                },
              },
            ],
            "header-nav": [
              {
                componentHandle: "main-nav@1",
                variant: "Default",
                datasourceRef: {
                  kind: "shared",
                  handle: "primary-nav-content@1",
                },
              },
            ],
            "header-end": [
              {
                componentHandle: "cta-button@1",
                variant: "Default",
                params: { Variant: "link", Size: "sm" },
                datasourceRef: {
                  kind: "scoped",
                  slot: "HeaderLogin",
                  fields: {
                    Link: {
                      shape: "link-external",
                      href: "/account/sign-in",
                      text: "Login",
                    },
                  },
                },
              },
              {
                componentHandle: "cta-button@1",
                variant: "Default",
                params: {
                  Variant: "default",
                  Size: "sm",
                  ColorScheme: "primary",
                },
                datasourceRef: {
                  kind: "scoped",
                  slot: "HeaderCta",
                  fields: {
                    Link: {
                      shape: "link-external",
                      href: "/Get-Started",
                      text: "Apply Now",
                    },
                  },
                },
              },
            ],
            "header-mobile": [
              {
                componentHandle: "mobile-menu@1",
                variant: "Drawer",
                datasourceRef: { kind: "none" },
                placeholders: {
                  "mobile-menu": [
                    {
                      componentHandle: "main-nav@1",
                      variant: "Default",
                      datasourceRef: {
                        kind: "shared",
                        handle: "primary-nav-content@1",
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

export default headerUtilityBarRecipe;
