import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for the `TreeNavigation` component (./tree-navigation.tsx).
 *
 * Touch-first tree/menu navigation over the same `nav-item@1` content
 * shape as `main-nav@1` — the SAME Items treelist can drive both: the
 * desktop strip (main-nav, hover panels) and this component (mobile
 * drawer, tap-driven). Two variants:
 *
 *   Default   — drill-down panel stack (the Duke-Energy mobile drawer
 *               pattern): root list of items; tapping a branch slides
 *               to that item's panel with a "‹ Main Menu" back row,
 *               the item's own overview link, and its groups as
 *               headed sections of link rows.
 *   Accordion — branch items expand in place beneath their row.
 *
 * Level-2 sections come from each nav-item's `Groups` treelist
 * (`link-list-content@1`); a group whose own `Link` field is set
 * renders its heading as a navigable row.
 *
 * **Placement**: compose inside `mobile-menu@1`'s `mobile-menu-{*}`
 * placeholder — the drawer/overlay owns the panel chrome (title,
 * close X); this rendering is only the list content. It also works
 * standalone in any narrow container (sidebar nav).
 */
export const treeNavigationRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "tree-navigation@1",
  icon: componentIcons["tree-navigation@1"],
  name: "tree-navigation",
  displayName: "Tree Navigation",
  description:
    "Touch-first tree navigation rendering nav-item refs. Variants: Default (drill-down panel stack — root list slides to a per-item panel with a back row; the classic mobile drawer nav) and Accordion (branches expand in place). Compose inside mobile-menu's placeholder for the hamburger drawer.",

  section: { handle: "navigation-section@1" },

  fields: [
    {
      name: "Title",
      shape: "text",
      default: {
        en: "Main Menu",
        ar: "القائمة الرئيسية",
        es: "Menú principal",
        fr: "Menu principal",
        de: "Hauptmenü",
        da: "Hovedmenu",
        ja: "メインメニュー",
        "zh-CN": "主菜单",
        "zh-TW": "主選單",
        it: "Menu principale",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Label for the root level — the drill-down back row reads '‹ {Title}'. Also names the nav region for screen readers.",
        sortOrder: 100,
      },
    },
    {
      name: "Items",
      shape: "reference",
      multiple: true,
      sitecore: {
        type: "treelist",
        source: { kind: "filter", types: ["nav-item@1"] },
        hint: "Top-level items in render order — the same nav-item entries main-nav uses, so one tree can drive both the desktop strip and this mobile menu. An item's Groups (Link List refs) become its drill-down/accordion sections; an item without Groups is a plain link row.",
        sortOrder: 200,
      },
    },
  ],

  variants: [{ name: "Default" }, { name: "Accordion" }],

  params: [
    {
      name: "LinkColorScheme",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "color-scheme@1",
        hint: "Row label color as a role text tone. `default` keeps the page foreground; `primary` gives the classic blue utility rows (Duke-Energy drawer). Gradients fall back to their base role.",
        sortOrder: 300,
      },
    },
    {
      // Checked default = the hairline-separated drawer rows.
      name: "RowSeparators",
      shape: "boolean",
      default: "true",
      sitecore: {
        type: "checkbox",
        hint: "Hairline rules between rows (checked, the classic drawer look). Uncheck for separator-less rows with a tinted hover pill.",
        sortOrder: 310,
      },
    },
    {
      // Checked default = mark the row matching the current page.
      name: "ShowActiveMarker",
      shape: "boolean",
      default: "true",
      sitecore: {
        type: "checkbox",
        hint: "Mark the row whose link matches the current page with a colored start bar (accent role). Uncheck to render all rows identically.",
        sortOrder: 320,
      },
    },
  ],

  // Child-items pattern: authors can also create nav-items directly
  // as children of the datasource. Either pattern works.
  insertOptions: ["nav-item@1"],
  children: { allowedHandles: ["nav-item@1"] },

  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      // Nested leaf per-component (see main-nav.recipe.ts) — the
      // navigation components share a Navigation parent, so each
      // recipe's data-folder template needs a unique leaf.
      { scope: "page", subfolder: "Navigation/Tree Navigation" },
      { scope: "site", subfolder: "Navigation/Tree Navigation" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default treeNavigationRecipe;
