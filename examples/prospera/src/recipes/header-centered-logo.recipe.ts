import type { PartialDesignRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { partialDesignThumbnail } from "./_wireframe-thumbnail";

/**
 * Stock header experience: the editorial masthead — brand up front,
 * nav strip, and a quiet utility cluster (language switcher + log-in
 * trigger), composed INSIDE the header shell's placeholders.
 *
 * Composition:
 *
 *   headless-header
 *     └─ header@1 (CenteredStack variant)
 *          header-start   → image@1 Logo (site logo — the centered
 *                           brand row)
 *          header-nav     → main-nav@1 Default (nav strip, centered on
 *                           the bordered row below the brand)
 *          header-end     → language-switcher@1 Default +
 *                           utility-trigger@1 Default (log-in link,
 *                           pinned to the brand row's inline end)
 *          header-mobile  → mobile-menu@1 Drawer
 *                             mobile-menu → main-nav@1 Default
 *
 * The shell's `CenteredStack` variant expresses the
 * literal centered masthead — brand row centered on its own line, nav
 * on a bordered row below — rather than approximating it with the
 * single start/nav/end bar.
 *
 * Logo + nav are the shared `header-shared-content/` items every
 * stock header experience uses. The log-in trigger is inline
 * (`kind:"scoped"`) so the partial is self-contained.
 */
export const headerCenteredLogoRecipe = {
  kind: "partial-design",
  schemaVersion: "1",
  handle: "header-centered-logo@1",
  name: "HeaderCenteredLogo",
  displayName: "Header — Centered Logo",
  thumbnail: partialDesignThumbnail("Header_Centered_Logo_Partial.png", "Header — Centered Logo"),
  description:
    "Stock header: editorial masthead — brand centered on its own row (CenteredStack variant), nav strip on the bordered row below, quiet utility cluster (language switcher + log-in) at the brand row's end, composed in the header shell's slots. Page designs include this via the `partials` field.",
  layout: {
    placeholders: {
      "headless-header": [
        {
          componentHandle: "header@1",
          variant: "CenteredStack",
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
                componentHandle: "language-switcher@1",
                variant: "Default",
                datasourceRef: { kind: "none" },
              },
              {
                componentHandle: "utility-trigger@1",
                variant: "Default",
                datasourceRef: {
                  kind: "scoped",
                  slot: "LogIn",
                  fields: {
                    Label: "Log in",
                    Link: {
                      shape: "link-external",
                      href: "/account",
                      text: "Log in",
                    },
                    HasPanel: false,
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

export default headerCenteredLogoRecipe;
