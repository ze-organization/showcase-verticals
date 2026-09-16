import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Sitecore-registered rendering used as one tab inside a `tabs-block`'s
 * `visual-tabs@1`. Authors drop tab-rendering items into the
 * tabs-block's `tabs-items-{*}` placeholder; the tabs-block reads
 * each child's data + chosen variant to render the right thing in
 * the matching `<TabsContent>`.
 *
 * Datasource mirrors `tabs-item@1` (Label + TriggerImage for the
 * trigger; Content / Description / Media / Link for the panel) so
 * authoring feels identical whether you're picking content-driven
 * tabs (Default tabs-block + Treelist) or visually authoring with
 * renderings (visual-tabs + tab-renderings). The difference
 * shows up in which Variant the author picks per tab-rendering:
 *
 *   - `Default`  — the panel is a `tab-panel-{*}` placeholder.
 *                  Authors drop arbitrary rendering(s) into the
 *                  tab body. The datasource Content / Media / Link
 *                  fields are ignored (they're still on the
 *                  template so this variant can be flipped to
 *                  `Content` without losing the data).
 *   - `Content`  — the panel renders the datasource content
 *                  (Content / Description / Media / Link), same
 *                  shape a content-driven Tab Item would render.
 *
 * The tab-rendering's own React export returns `null` for both
 * variants — the parent visual-tabs inspects each
 * child's resolved variant name + fields and does the actual
 * rendering inside its `<Tabs>` shell.
 */
export const tabRenderingRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "tab-rendering@1",
  icon: componentIcons["tab-rendering@1"],
  name: "tab-rendering",
  displayName: "Tab",
  description:
    "One tab in a `visual-tabs@1`. Trigger label + optional image; panel is either a placeholder (Default variant) or datasource content (Content variant).",

  section: { handle: "ui-section@1" },

  fields: [
    {
      name: "Label",
      shape: "text",
      default: {
        en: "Tab",
        ar: "علامة تبويب",
        es: "Pestaña",
        fr: "Onglet",
        de: "Registerkarte",
        da: "Fane",
        ja: "タブ",
        "zh-CN": "标签页",
        "zh-TW": "標籤頁",
        it: "Scheda",
      },
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "The text shown on the tab's nav trigger.",
        sortOrder: 100,
      },
    },
    {
      name: "Content",
      shape: "richText",
      default: {
        en: "<p>Tab body copy goes here. Replace with the content for this tab's panel.</p>",
        ar: "<p>يوضع نص التبويب هنا. استبدله بمحتوى لوحة هذا التبويب.</p>",
        es: "<p>El contenido de la pestaña va aquí. Reemplázalo con el contenido del panel de esta pestaña.</p>",
        fr: "<p>Le contenu de l'onglet s'affiche ici. Remplacez-le par le contenu du panneau de cet onglet.</p>",
        de: "<p>Hier steht der Inhalt des Tabs. Ersetzen Sie ihn durch den Inhalt für dieses Tab-Panel.</p>",
        da: "<p>Fanens indhold vises her. Erstat det med indholdet til denne fanes panel.</p>",
        ja: "<p>ここにタブの本文が入ります。このタブのパネル用のコンテンツに置き換えてください。</p>",
        "zh-CN":
          "<p>选项卡正文内容显示在此处。请替换为该选项卡面板的内容。</p>",
        "zh-TW": "<p>分頁正文內容顯示於此處。請替換為該分頁面板的內容。</p>",
        it: "<p>Qui va il contenuto della scheda. Sostituiscilo con il contenuto del pannello di questa scheda.</p>",
      },
      sitecore: {
        hint: "The rich-text panel body — used by the `Content` variant.",
        sortOrder: 200,
      },
    },
    {
      name: "TriggerImage",
      shape: "image",
      role: "content",
      // `<alt>|<src>` — see card-block.recipe.ts for the encoder shape note.
      default:
        "Tab trigger thumbnail|/theme-photos/pdp-01.jpg",
      sitecore: {
        hint: "Optional image shown inside the tab trigger (used by image-style nav strips).",
        section: "Media",
        sortOrder: 100,
      },
    },
    {
      name: "PanelImage",
      shape: "image",
      role: "content",
      default: "Tab panel visual|/theme-photos/promo-closer.jpg",
      sitecore: {
        hint: "Optional image shown inside the expanded panel (used by the `Content` variant). Falls back to TriggerImage when empty.",
        section: "Media",
        sortOrder: 200,
      },
    },
  ],

  // Two Sitecore Variants. Authors pick per-placement which mode
  // each tab-rendering uses. `Default` is the headless-placeholder
  // shape; `Content` is the datasource-content shape.
  variants: [{ name: "Default" }, { name: "Content" }],

  // Panel placeholder used only by the `Default` variant. Each
  // tab-rendering's `{*}` substitution gives a unique slot
  // (`tab-panel-<tab-uid>`) so authors can drop different content
  // into each tab.
  dynamicPlaceholders: true,
  placeholders: [{ key: "tab-panel-{*}" }],

  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      // Nested leaf per-component — tabs-block and tab-rendering both
      // claim a Tabs parent, so the leaf disambiguates the per-recipe
      // data-folder template (see main-nav.recipe.ts for rationale).
      { scope: "page", subfolder: "Tabs/Tab" },
      { scope: "site", subfolder: "Site Shared UI/Tabs/Tab" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default tabRenderingRecipe;
