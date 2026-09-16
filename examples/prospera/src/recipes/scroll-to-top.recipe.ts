import type { ComponentTemplateRecipe } from "../lib/registry/sitecore-recipes";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for the `ScrollToTop` component (./scroll-to-top.tsx).
 *
 * **Programmatic + datasourceless** (same pattern as breadcrumb): the
 * component scrolls the window to the top — there is nothing to
 * author beyond presentation params. Two variants:
 *
 *   - `Default` — sticky floating button in the viewport's bottom-end
 *     corner, revealed after ~one viewport of scroll (always visible
 *     in editing mode so authors can select it).
 *   - `Inline` — in-flow row for placement at a section seam, with an
 *     `Overlap` option that collapses the row to zero height and
 *     centers the button on the boundary between the surrounding
 *     surfaces (half over each — the straddle treatment).
 */
export const scrollToTopRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "scroll-to-top@1",
  icon: componentIcons["scroll-to-top@1"],
  name: "scroll-to-top",
  displayName: "Scroll To Top",
  description:
    "Back-to-top button. Default variant floats sticky in the viewport's bottom-end corner and appears after scrolling; Inline renders in flow at a section seam, optionally straddling the boundary between its neighbouring surfaces (Overlap). Smooth scroll, reduced-motion aware, no datasource.",

  section: { handle: "navigation-section@1" },

  params: [
    {
      name: "ButtonVariant",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "button-variant@1",
        hint: "Button chrome: default (filled circle), outline, or ghost. `link` and `pill` fold onto default — the button is already a filled circle.",
        section: "Style",
        sortOrder: 100,
      },
    },
    {
      name: "ButtonColorScheme",
      shape: "enum",
      default: "primary",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Role color for the button fill (outline/ghost tint their border/glyph instead). Bind from the source button color; `primary` is the default.",
        section: "Style",
        sortOrder: 110,
      },
    },
    {
      name: "Label",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Optional visible label beside the arrow (e.g. 'Back to top'). Blank keeps the icon-only circle; the accessible name falls back to 'Back to top'.",
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "Alignment",
      shape: "enum",
      default: "end",
      sitecore: {
        enumHandle: "alignment@1",
        hint: "Inline variant only: which side of the row the button sits on. `end` (default) matches the common bottom-right placement. The sticky Default variant ignores it.",
        section: "Layout",
        sortOrder: 100,
      },
    },
    {
      name: "Overlap",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Inline variant only: collapse the row to zero height so the button straddles the boundary between the previous section and the next (half over each — bind when the source shows the button riding the content/footer seam). Off by default — Sitecore Standard Values drive the initial state. The sticky Default variant ignores it.",
        section: "Layout",
        sortOrder: 110,
      },
    },
  ],

  variants: [{ name: "Default" }, { name: "Inline" }],
} satisfies ComponentTemplateRecipe;

export default scrollToTopRecipe;
