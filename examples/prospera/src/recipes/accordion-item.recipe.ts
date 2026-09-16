import type { ContentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Content template for an accordion item. No rendering — accordion-items
 * exist only as content referenced by `accordion-block@1` (either via
 * its `Items` Treelist field or as Sitecore children of its datasource;
 * see `accordion-block.recipe.ts`).
 *
 * Five fields, all optional except Title. Mirrors `AccordionItemFields`
 * in `../accordion-block.tsx`.
 */
export const accordionItemRecipe = {
  kind: "content-template",
  schemaVersion: "1",
  handle: "accordion-item@1",
  name: "accordion-item",
  displayName: "Accordion Item",
  description:
    "One row of an accordion: collapsible title + content, with optional media variant fields.",

  fields: [
    {
      name: "Title",
      shape: "text",
      // Standard Values seed: auto-created accordion items arrive with
      // a placeholder question so the row visualises immediately and
      // authors swap it for their own copy.
      default: {
        en: "How does this work?",
        ar: "كيف يعمل هذا؟",
        es: "¿Cómo funciona esto?",
        fr: "Comment cela fonctionne-t-il ?",
        de: "Wie funktioniert das?",
        da: "Hvordan fungerer det?",
        ja: "これはどのように機能しますか？",
        "zh-CN": "这是如何运作的？",
        "zh-TW": "這是如何運作的？",
        it: "Come funziona?",
      },
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "The clickable header for this accordion row.",
        sortOrder: 100,
      },
    },
    {
      name: "Content",
      shape: "richText",
      default: {
        en: "<p>Replace this with the body content that opens when this row is expanded.</p>",
        ar: "<p>استبدل هذا بمحتوى النص الذي يظهر عند توسيع هذا الصف.</p>",
        es: "<p>Sustituye esto por el contenido que se muestra al expandir esta fila.</p>",
        fr: "<p>Remplacez ceci par le contenu affiché lorsque cette ligne est déployée.</p>",
        de: "<p>Ersetzen Sie dies durch den Inhalt, der beim Aufklappen dieser Zeile angezeigt wird.</p>",
        da: "<p>Erstat dette med det indhold, der vises, når rækken foldes ud.</p>",
        ja: "<p>この行を展開したときに表示される本文に置き換えてください。</p>",
        "zh-CN": "<p>请将此处替换为展开该行时显示的正文内容。</p>",
        "zh-TW": "<p>請將此處替換為展開該列時顯示的內文內容。</p>",
        it: "<p>Sostituisci questo con il contenuto mostrato quando la riga viene espansa.</p>",
      },
      sitecore: {
        hint: "The body shown when the accordion row is expanded.",
        sortOrder: 200,
      },
    },
    {
      name: "Description",
      shape: "text",
      default: {
        en: "Short summary surfaced in the row trigger.",
        ar: "ملخص قصير يظهر في زر الصف.",
        es: "Resumen breve que se muestra en el activador de la fila.",
        fr: "Bref résumé affiché dans le déclencheur de la ligne.",
        de: "Kurze Zusammenfassung, die im Zeilen-Trigger angezeigt wird.",
        da: "Kort resumé, der vises i rækkens udløser.",
        ja: "行のトリガーに表示される短い要約。",
        "zh-CN": "显示在行触发器中的简短摘要。",
        "zh-TW": "顯示在列觸發器中的簡短摘要。",
        it: "Breve riepilogo mostrato nel trigger della riga.",
      },
      sitecore: {
        type: "multi-line-text",
        hint: "Optional short summary used by the media variant. Plain text.",
        sortOrder: 300,
      },
    },
    {
      name: "Image",
      shape: "image",
      role: "content",
      // Picsum seed keyed off the recipe handle so each accordion item
      // gets a stable placeholder; authors swap to a real media item
      // via the picker. See scai's `<image src ...>` encoding.
      default:
        "Accordion thumbnail|/theme-photos/hub-01.jpg",
      sitecore: {
        hint: "Optional thumbnail used by the media variant.",
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
        hint: "Optional CTA link rendered in the expanded body.",
        section: "Media",
        sortOrder: 200,
      },
    },
  ],
} satisfies ContentTemplateRecipe;

export default accordionItemRecipe;
