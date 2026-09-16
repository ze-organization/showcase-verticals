import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Sitecore-registered rendering used as one item inside an
 * `accordion-block`'s Headless variant. Authors drop these into the
 * accordion-block's `accordion-items-{*}` placeholder; the
 * accordion-block reads each child's data + chosen Variant to
 * render the right thing inside the matching `<AccordionContent>`.
 *
 * Datasource mirrors `accordion-item@1` (Title for the trigger;
 * Content / Description / Image / Link for the panel) so authoring
 * feels identical whether you're picking content-driven items
 * (Default accordion-block + Treelist) or visually authoring with
 * renderings (Headless accordion-block + accordion-item-renderings).
 *
 * Two Sitecore Variants:
 *
 *   - `Default`  — the panel is an `accordion-panel-{*}` placeholder.
 *                  Authors drop arbitrary rendering(s) into the
 *                  panel body.
 *   - `Content`  — the panel renders the datasource content
 *                  (Content / Description / Image / Link), same
 *                  shape a content-driven Accordion Item would
 *                  render.
 *
 * Both React exports return `null` — the parent accordion-block
 * (Headless variant) inspects each child's resolved variant name +
 * fields + nested placeholder and does the actual rendering.
 */
export const accordionItemRenderingRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "accordion-item-rendering@1",
  icon: componentIcons["accordion-item-rendering@1"],
  name: "accordion-item-rendering",
  displayName: "Accordion Item",
  description:
    "One item in a `visual-accordion@1`. Trigger title; panel is either a placeholder (Default variant) or datasource content (Content variant).",

  section: { handle: "ui-section@1" },

  fields: [
    {
      name: "Title",
      shape: "text",
      default: {
        en: "Section title",
        ar: "عنوان القسم",
        es: "Título de sección",
        fr: "Titre de section",
        de: "Abschnittstitel",
        da: "Sektionstitel",
        ja: "セクションタイトル",
        "zh-CN": "板块标题",
        "zh-TW": "區塊標題",
        it: "Titolo della sezione",
      },
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "The text shown on the accordion's trigger.",
        sortOrder: 100,
      },
    },
    {
      name: "Content",
      shape: "richText",
      default: {
        en: "<p>Replace this with the answer copy authors want to surface in the panel.</p>",
        ar: "<p>استبدل هذا بنص الإجابة الذي يريد المؤلفون عرضه في اللوحة.</p>",
        es: "<p>Reemplaza esto con el texto de la respuesta que los autores quieren mostrar en el panel.</p>",
        fr: "<p>Remplacez ce texte par la réponse que les auteurs souhaitent afficher dans le panneau.</p>",
        de: "<p>Ersetzen Sie dies durch den Antworttext, den Autoren im Panel anzeigen möchten.</p>",
        da: "<p>Erstat dette med den svartekst, som forfatterne vil vise i panelet.</p>",
        ja: "<p>作成者がパネルに表示したい回答文に置き換えてください。</p>",
        "zh-CN": "<p>请将此处替换为作者希望在面板中呈现的回答文案。</p>",
        "zh-TW": "<p>請將此處替換為作者希望在面板中呈現的回答文案。</p>",
        it: "<p>Sostituisci questo testo con la risposta che gli autori vogliono mostrare nel pannello.</p>",
      },
      sitecore: {
        hint: "The rich-text panel body — used by the `Content` variant.",
        sortOrder: 200,
      },
    },
    {
      name: "Description",
      shape: "text",
      default: {
        en: "Short summary line shown when Content is empty.",
        ar: "سطر ملخص قصير يظهر عندما يكون المحتوى فارغاً.",
        es: "Línea de resumen breve que se muestra cuando el contenido está vacío.",
        fr: "Courte ligne de résumé affichée lorsque le contenu est vide.",
        de: "Kurze Zusammenfassung, die angezeigt wird, wenn kein Inhalt vorhanden ist.",
        da: "Kort resumelinje, der vises, når indholdet er tomt.",
        ja: "コンテンツが空のときに表示される短い概要行。",
        "zh-CN": "内容为空时显示的简短摘要。",
        "zh-TW": "內容為空時顯示的簡短摘要。",
        it: "Breve riga di riepilogo mostrata quando il contenuto è vuoto.",
      },
      sitecore: {
        type: "multi-line-text",
        hint: "Optional plain-text description (used by the `Content` variant when Content is empty).",
        sortOrder: 300,
      },
    },
    {
      name: "Image",
      shape: "image",
      role: "content",
      default:
        "Accordion thumbnail|/theme-photos/pdp-01.jpg",
      sitecore: {
        hint: "Optional thumbnail image (used by the `Content` variant).",
        section: "Media",
        sortOrder: 100,
      },
    },
    {
      name: "Link",
      shape: "link",
      // The URL half is `/` on purpose — scai encodes a `#` URL as
      // linktype="anchor" WITHOUT the `anchor` attribute the Layout
      // Service builds hrefs from, so the SV arrived as href:"" and the
      // link rendered blank (see cta-button.recipe.ts diagnosis).
      default: "Learn more|/",
      sitecore: {
        type: "general-link",
        hint: "Optional CTA link (used by the `Content` variant).",
        section: "Media",
        sortOrder: 200,
      },
    },
  ],

  variants: [{ name: "Default" }, { name: "Content" }],

  // Panel placeholder used only by the `Default` variant. Permissive
  // — any rendering can drop into the panel body.
  dynamicPlaceholders: true,
  placeholders: [{ key: "accordion-panel-{*}" }],

  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      // Nested leaf per-component — accordion-block and
      // accordion-item-rendering both claim an Accordions parent, so
      // the leaf disambiguates the per-recipe data-folder template
      // (see main-nav.recipe.ts for rationale).
      { scope: "page", subfolder: "Accordions/Accordion Item" },
      { scope: "site", subfolder: "Site Shared UI/Accordions/Accordion Item" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default accordionItemRenderingRecipe;
