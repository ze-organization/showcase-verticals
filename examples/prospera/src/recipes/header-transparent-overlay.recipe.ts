import type { PartialDesignRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { partialDesignThumbnail } from "./_wireframe-thumbnail";

/**
 * Stock header experience: the hero-overlay header — the bar floats
 * transparently over the page's first section with light-on-dark text
 * and a soft top scrim, composed INSIDE the header shell's
 * placeholders, using the shell's `Overlay` variant.
 *
 * Composition:
 *
 *   headless-header
 *     └─ header@1 (Overlay variant)
 *          header-start  → image@1 Logo (site logo)
 *          header-nav    → main-nav@1 Default (primary nav strip)
 *          header-end    → cta-button@1 Default (primary CTA)
 *          header-mobile → mobile-menu@1 Drawer
 *                            mobile-menu → main-nav@1 Default
 *
 * Pair this partial with a FullBleed Container wrapping a full-bleed
 * hero (hero-carousel / hero FullBleed) as the page's first body
 * section — the hero supplies the imagery behind the bar; without a
 * dark first section the light text has nothing to sit on. The overlay
 * layout ignores `ColorScheme` / `BackgroundIntensity` (transparent by
 * design).
 *
 * Logo + nav are the shared `header-shared-content/` items every
 * stock header experience uses. The CTA is inline (`kind:"scoped"`)
 * so the partial is self-contained.
 */
export const headerTransparentOverlayRecipe = {
  kind: "partial-design",
  schemaVersion: "1",
  handle: "header-transparent-overlay@1",
  name: "HeaderTransparentOverlay",
  displayName: "Header — Transparent Overlay",
  thumbnail: partialDesignThumbnail("Header_Transparent_Overlay_Partial.png", "Header — Transparent Overlay"),
  description:
    "Stock header: hero-overlay bar — logo, nav strip, and a primary CTA floating transparently over the page's first section (Overlay variant), composed in the header shell's slots. Pair with a full-bleed hero as the first section. Page designs include this via the `partials` field.",
  layout: {
    placeholders: {
      "headless-header": [
        {
          componentHandle: "header@1",
          variant: "Overlay",
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
                params: { Variant: "outline", Size: "sm" },
                datasourceRef: {
                  kind: "scoped",
                  slot: "OverlayCta",
                  fields: {
                    Link: {
                      shape: "link-external",
                      href: "/get-started",
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

export default headerTransparentOverlayRecipe;
