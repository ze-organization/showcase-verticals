import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for the `VisualTabs` component (./visual-tabs.tsx) — the
 * placeholder-composed sibling of `tabs-block@1`.
 *
 * tabs-block sources its tabs from an Items Treelist (content-driven —
 * `tabs-item@1` / `tab-rendering@1` references). VisualTabs sources
 * them from a Sitecore placeholder: authors drop `tab-rendering@1`
 * items into `visual-tabs-{*}`, and each dropped rendering becomes
 * ANOTHER TAB. There is deliberately NO Items field and NO
 * SearchConfig — the placeholder is the item list. This replaces the
 * placeholder-composed tabs (formerly tabs-block's `Headless` variant).
 *
 * The display-variant axis matches tabs-block: `Default` (text
 * triggers) / `ImageTriggers` (media-tile triggers) / `VerticalRails`
 * (expanding rails).
 */
export const visualTabsRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "visual-tabs@1",
  icon: componentIcons["visual-tabs@1"],
  name: "visual-tabs",
  displayName: "Visual Tabs",
  description:
    "Placeholder-composed tabs — drop Tab Rendering items into the `visual-tabs-{*}` placeholder and each one becomes another tab (trigger from its Label / TriggerImage, panel from its Content / PanelImage / Link plus its own `tab-panel-{*}` placeholder). Display variants: Default (text triggers), ImageTriggers (media-tile triggers), VerticalRails (expanding rails). Pick over `tabs-block@1` when tabs are composed visually in Pages rather than curated via a Treelist.",

  section: { handle: "ui-section@1" },

  fields: [
    {
      name: "Title",
      shape: "text",
      default: {
        en: "Tabs heading",
        ar: "عنوان علامات التبويب",
        es: "Título de las pestañas",
        fr: "Titre des onglets",
        de: "Überschrift der Tabs",
        da: "Fane-overskrift",
        ja: "タブの見出し",
        "zh-CN": "标签页标题",
        "zh-TW": "標籤頁標題",
        it: "Titolo delle schede",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Optional heading shown above the tabs.",
        sortOrder: 100,
      },
    },
  ],

  variants: [
    { name: "Default" },
    { name: "ImageTriggers" },
    { name: "VerticalRails" },
  ],

  // Each dropped tab-rendering@1 = one tab. Restricted so authors can
  // only drop the right thing; each tab-rendering's own `tab-panel-{*}`
  // placeholder stays permissive for composed panel content.
  dynamicPlaceholders: true,
  placeholders: [
    {
      key: "visual-tabs-{*}",
      allowedRenderingHandles: ["tab-rendering@1"],
    },
  ],

  params: [
    {
      name: "UseSectionWrapper",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Wrap the tabs in a SectionWrapper using Title as the heading.",
        sortOrder: 100,
      },
    },
    {
      name: "HeadingLayout",
      shape: "enum",
      default: "start-with-section-divider",
      sitecore: {
        enumHandle: "heading-layout@1",
        hint: "Heading alignment (start / center) and treatment (plain, accent scribble, or full-width section divider).",
        sortOrder: 200,
      },
    },
    {
      name: "HeadingAnimation",
      shape: "enum",
      default: "none",
      sitecore: {
        enumHandle: "heading-animation@1",
        hint: "Heading entrance animation.",
        sortOrder: 300,
      },
    },
    {
      name: "HeadingSize",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "heading-size@1",
        hint: "Heading size.",
        sortOrder: 400,
      },
    },
    {
      name: "TabsAlignment",
      shape: "enum",
      default: "start",
      sitecore: {
        enumHandle: "alignment@1",
        hint: "Horizontal placement of the tabs list. `start` (default) / `center` / `end`.",
        sortOrder: 500,
      },
    },
  ],

  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Tabs/Visual Tabs" },
      { scope: "site", subfolder: "Site Shared UI/Tabs/Visual Tabs" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default visualTabsRecipe;
