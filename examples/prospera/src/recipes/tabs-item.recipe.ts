import type { ContentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Content template for a tabs item. No rendering — tabs-items exist only
 * as content referenced by `tabs-block@1` (either via its `Items` Treelist
 * field or as Sitecore children of its datasource; see
 * `tabs-block.recipe.ts`).
 *
 * Five fields, all optional. Mirrors `TabsBlockItemFields` in
 * `../tabs-block.tsx`. The image fields service two distinct slots:
 *
 *   - `TriggerImage` shows in the tab's clickable trigger (used by the
 *     `image-triggers` style for logo / icon-driven tab navigation).
 *   - `PanelImage` shows inside the expanded panel; falls back to
 *     `TriggerImage` in the React component when not set.
 *
 * `Link` wraps the panel image so authors can make the panel visual
 * itself a CTA target.
 */
export const tabsItemRecipe = {
  kind: "content-template",
  schemaVersion: "1",
  handle: "tabs-item@1",
  name: "tabs-item",
  displayName: "Tabs Item",
  description:
    "One tab in a tabs-block: trigger label + panel content, with optional image-triggers and panel-image fields.",

  fields: [
    {
      name: "Label",
      shape: "text",
      // Standard Values seed so a freshly dropped tab item visualises
      // immediately with a clickable label authors then swap for
      // their own copy.
      default: {
        en: "Overview",
        ar: "نظرة عامة",
        es: "Resumen",
        fr: "Aperçu",
        de: "Überblick",
        da: "Oversigt",
        ja: "概要",
        "zh-CN": "概览",
        "zh-TW": "概覽",
        it: "Panoramica",
      },
      sitecore: {
        type: "single-line-text",
        hint: "The text shown on the tab trigger. Falls back to image alt text when image-triggers style is in use.",
        sortOrder: 100,
      },
    },
    {
      name: "Content",
      shape: "richText",
      default: {
        en: "<p>Replace this with the rich-text body shown when this tab is selected.</p>",
        ar: "<p>استبدل هذا بالنص المنسّق الذي يظهر عند تحديد علامة التبويب هذه.</p>",
        es: "<p>Sustituye esto por el contenido de texto enriquecido que se muestra al seleccionar esta pestaña.</p>",
        fr: "<p>Remplacez ceci par le contenu riche affiché lorsque cet onglet est sélectionné.</p>",
        de: "<p>Ersetzen Sie dies durch den Rich-Text-Inhalt, der bei Auswahl dieses Tabs angezeigt wird.</p>",
        da: "<p>Erstat dette med det formaterede indhold, der vises, når denne fane er valgt.</p>",
        ja: "<p>このタブを選択したときに表示されるリッチテキスト本文に置き換えてください。</p>",
        "zh-CN": "<p>请将此处替换为选中该选项卡时显示的富文本内容。</p>",
        "zh-TW": "<p>請將此處替換為選取該索引標籤時顯示的富文字內容。</p>",
        it: "<p>Sostituisci questo con il corpo rich-text mostrato quando questa scheda è selezionata.</p>",
      },
      sitecore: {
        hint: "The rich-text panel body shown when this tab is selected.",
        sortOrder: 200,
      },
    },
    {
      name: "TriggerImage",
      shape: "image",
      role: "content",
      default:
        "Tab trigger image|/theme-photos/home-hero.jpg",
      sitecore: {
        hint: "Optional image shown inside the tab trigger (used by the image-triggers style for logos / icons).",
        section: "Media",
        sortOrder: 100,
      },
    },
    {
      name: "PanelImage",
      shape: "image",
      role: "content",
      default:
        "Tab panel image|/theme-photos/hub-01.jpg",
      sitecore: {
        hint: "Optional image shown inside the expanded panel. Falls back to TriggerImage when empty.",
        section: "Media",
        sortOrder: 200,
      },
    },
  ],
} satisfies ContentTemplateRecipe;

export default tabsItemRecipe;
