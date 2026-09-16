import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for the `MegaMenu` component (./mega-menu.tsx).
 *
 * Rich dropdown nav panel — a 3-region layout shell that pairs a set
 * of link-list columns with an optional featured slot and an optional
 * CTA strip. Designed to drop into a `main-nav@1` item's
 * `nav-item-panel-{*}` placeholder (the canonical mega-menu pattern),
 * but also valid as a top-level rendering placed directly under
 * the header.
 *
 * The shell is opinionated about layout (3 named placeholders, grid
 * arrangement, responsive collapse) and unopinionated about content
 * — authors compose whatever fits each slot:
 *
 *   - `mega-menu-columns-{*}`   — left/center region. Typical content:
 *                                  2–4 `link-list@1` renderings.
 *   - `mega-menu-featured`      — single-slot end region. Typical
 *                                  content: an article-card@1, a
 *                                  promo@1 (Image variant), or a
 *                                  product-card@1.
 *   - `mega-menu-cta-strip-{*}` — full-width footer strip. Typical
 *                                  content: a row of cta-button@1
 *                                  renderings, or a link-list@1 in
 *                                  Horizontal variant.
 *
 * Single `Default` variant — visual differentiation belongs on the
 * primitives the slots hold, not on per-variant React exports.
 */
export const megaMenuRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "mega-menu@1",
  icon: componentIcons["mega-menu@1"],
  name: "mega-menu",
  displayName: "Mega Menu",
  description:
    "Dropdown nav panel: columns region (link lists), featured slot (card / promo), CTA strip footer. Drops into a main-nav item's panel placeholder.",

  section: { handle: "layout-section@1" },

  fields: [
    {
      name: "Title",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Optional panel heading rendered above the columns region (e.g. 'Explore products'). Leave blank to render the columns flush with the panel edge.",
        section: "Content",
        sortOrder: 100,
      },
    },
  ],

  variants: [{ name: "Default" }],

  // Three named placeholders shape the panel:
  //   `{*}` segments expand to numeric indices the SDK injects per
  //   placement; the wildcard matches `^<prefix>-\d+$`. The featured
  //   slot is single-shot (no wildcard).
  dynamicPlaceholders: true,
  placeholders: [
    { key: "mega-menu-columns-{*}" },
    { key: "mega-menu-featured" },
    { key: "mega-menu-cta-strip-{*}" },
  ],

  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Navigation/Mega Menus" },
      { scope: "site", subfolder: "Navigation/Mega Menus" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default megaMenuRecipe;
