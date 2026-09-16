import type { PartialDesignRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { partialDesignThumbnail } from "./_wireframe-thumbnail";

/**
 * Stock header experience: the simple classic — logo + primary nav +
 * mobile drawer, composed INSIDE the header shell's placeholders.
 *
 * Composition:
 *
 *   headless-header
 *     └─ header@1 (Default pure-placeholder shell)
 *          header-start   → image@1 Logo (site logo)
 *          header-nav     → main-nav@1 Default (primary nav strip)
 *          header-end     → cta-button@1 Default (Apply Now → /Get-Started)
 *          header-mobile  → mobile-menu@1 Drawer
 *                             mobile-menu → main-nav@1 Default
 *                             (same items as the desktop strip)
 *
 * All datasources are the SAME shared items every stock header
 * experience uses (`site-logo-content@1`, `primary-nav-content@1`,
 * from `partial-designs/header-shared-content/`) — edit once, every
 * header placement follows. No content recipes of its own.
 *
 * The shell's responsive CSS hides `header-nav` below the breakpoint
 * and `header-mobile` above it, so this one partial covers both
 * viewports.
 */
export const headerBrandNavRecipe = {
  kind: "partial-design",
  schemaVersion: "1",
  handle: "header-brand-nav@1",
  name: "HeaderBrandNav",
  displayName: "Header — Brand + Nav",
  thumbnail: partialDesignThumbnail("Header_Brand_Nav_Partial.png", "Header — Brand + Nav"),
  description:
    "Stock header: logo + primary navigation + Apply Now CTA + mobile drawer composed in the header shell's slots. Page designs include this via the `partials` field.",
  layout: {
    placeholders: {
      "headless-header": [
        {
          componentHandle: "header@1",
          variant: "Standard",
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
                params: { Variant: "default", Size: "sm" },
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

export default headerBrandNavRecipe;
