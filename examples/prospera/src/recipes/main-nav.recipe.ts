import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for the `MainNav` component (./main-nav.tsx).
 *
 * Desktop-only horizontal navigation strip. Renders an ordered list
 * of `nav-item@1` items with two mega-menu modes per item:
 *
 *   - Field-driven: an item's `Groups` treelist (link-list-content@1
 *     refs) renders as a hover/focus dropdown — one column per Link
 *     List, plus an optional `Promo*` card. No placeholder
 *     composition required, so flat partial designs (including
 *     generated chrome) can express mega-menus with inline fields.
 *   - Placeholder-driven: items with `HasPanel` on expose a dynamic
 *     `nav-item-panel-{*}` placeholder per item-index that authors
 *     fill with arbitrary renderings (RichText + LinkLists + Buttons
 *     + LinkList(social-icon) — the "Explore Northwind" mega-menu
 *     pattern). Wins over `Groups` when both are set.
 *
 * **Mobile is intentionally out of scope.** The Header shell hides
 * this rendering below its breakpoint and surfaces a separate
 * mobile-only slot for mobile-menu renderings. Mobile-menu patterns
 * (drawer / overlay / bottom-sheet) are a separate rendering family.
 *
 * Two variants sharing one content shape:
 *
 *   Default   — field-driven items open an anchored dropdown panel
 *               under the item (auto width). Pick for compact
 *               per-item dropdowns (1-2 columns).
 *   MegaPanel — field-driven items open a FULL-WIDTH panel spanning
 *               the whole nav strip. Pick when dropdown content is
 *               deep: 3+ columns per item, group imagery (the
 *               link-list-content `Image` field), promo cards.
 *
 * Placeholder-mode items (`HasPanel`) behave identically in both.
 */
export const mainNavRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "main-nav@1",
  icon: componentIcons["main-nav@1"],
  name: "main-nav",
  displayName: "Main Nav",
  description:
    "Desktop horizontal navigation strip. Variants: Default (anchored per-item dropdowns) and MegaPanel (full-width mega-menu panels spanning the strip).",

  section: { handle: "navigation-section@1" },

  fields: [
    {
      name: "Items",
      shape: "reference",
      multiple: true,
      sitecore: {
        type: "treelist",
        source: { kind: "filter", types: ["nav-item@1"] },
        hint: "Top-level nav items in render order. Each item's Link, Groups (field-driven dropdown columns), Promo* (dropdown promo card), and HasPanel (placeholder panel) fields control its render mode.",
        sortOrder: 100,
      },
    },
  ],

  params: [
    {
      name: "MaxItems",
      shape: "enum",
      default: "auto",
      sitecore: {
        enumHandle: "nav-max-items@1",
        hint: "How many top-level links show inline before the rest collapse into a 'More' menu. `auto` (default) shows every item. Cap at the count the source site shows (typically 5-7) when the discovered link set is larger — an uncapped strip renders the whole sitemap in one overflowing row.",
        section: "Style",
        sortOrder: 100,
      },
    },
  ],

  variants: [{ name: "Default" }, { name: "MegaPanel" }],

  // Per-item mega-menu panel placeholder. The wildcard segment is the
  // item index (always digit) — matches the SDK's `^<prefix>-\d+$`
  // regex. Authors compose any renderings here (RichText, LinkList,
  // Button, etc.) — the mega-menu pattern.
  dynamicPlaceholders: true,
  placeholders: [
    {
      key: "nav-item-panel-{*}",
    },
  ],

  // Child-items pattern: authors can also create nav-items directly
  // as children of the MainNav datasource. Either pattern works.
  insertOptions: ["nav-item@1"],
  children: { allowedHandles: ["nav-item@1"] },
  placedIn: ["header-nav-{*}", "mobile-menu-{*}"],

  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      // Nested leaf per-component — main-nav and mobile-menu both claim
      // a Navigation parent, so the leaf disambiguates the per-recipe
      // data-folder template. Without a unique leaf, scai's shared-
      // subfolder coalescing produces a template GUID for one recipe
      // and a folder ITEM for the other, leaving the folder pointing at
      // a missing template ID.
      { scope: "page", subfolder: "Navigation/Main Nav" },
      { scope: "site", subfolder: "Navigation/Main Nav" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default mainNavRecipe;
