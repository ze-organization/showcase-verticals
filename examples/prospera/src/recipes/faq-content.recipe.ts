import type { ContentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * FAQ Content Model — a Question + Answer pair (plus optional metadata)
 * that an `accordion-block`'s Items Treelist can reference alongside
 * regular `accordion-item@1` entries.
 *
 * Why a separate template (vs. just using accordion-item@1):
 *
 *   - **Semantic clarity for authors.** "FAQ" carries clear meaning
 *     ("a question and its answer, possibly authored once and reused
 *     across multiple FAQ-style accordions"). Accordion items, in
 *     contrast, can be arbitrary content rows (a feature list,
 *     pricing tier collapsibles, etc.). Different name = different
 *     authoring intent.
 *
 *   - **Reusable knowledge-base authoring.** FAQs typically live in a
 *     shared FAQ folder and get referenced by many accordion-blocks
 *     across the site (Support FAQ, Returns FAQ, etc.). The template's
 *     own datasource locations point at a shared root so the picker
 *     surfaces them as their own pool, distinct from per-page
 *     accordion-items.
 *
 *   - **Compatible field shape.** The fields are deliberately Title-
 *     and Content-shaped so the same React item-adapter handles both
 *     `accordion-item@1` and `faq-content@1` referenced items without
 *     branching. Question maps to Title, Answer maps to Content.
 *
 * Authors compose an Accordions/FAQ Accordion either as:
 *   1. **Curated:** `Items` Treelist filtered to
 *      `["accordion-item@1", "faq-content@1", "accordion-item-rendering@1"]`.
 *      Authors pick any mix.
 *   2. **Composed:** `visual-accordion-{*}` placeholder,
 *      authors drop `accordion-item-rendering@1` instances directly.
 *   3. **Search-driven:** SearchConfig field on the parent accordion-block,
 *      populated via the `sai/search-source` Marketplace plugin.
 *
 * See `accordion-block.recipe.ts` for the parent wiring.
 */
export const faqContentRecipe = {
  kind: "content-template",
  schemaVersion: "1",
  handle: "faq-content@1",
  name: "faq-content",
  displayName: "FAQ",
  description:
    "A Question / Answer pair, reusable across FAQ-style accordions. The same shape an accordion-item carries, but named for FAQ semantics so the item picker reads clearly.",

  fields: [
    {
      name: "Question",
      shape: "text",
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
        hint: "The question text. Maps to Title for accordion components.",
        sortOrder: 100,
      },
    },
    {
      name: "Answer",
      shape: "richText",
      default: {
        en: "<p>Replace this with the answer copy authors want to surface in the panel.</p>",
        ar: "<p>استبدل هذا بنص الإجابة الذي يريد المحررون إظهاره في اللوحة.</p>",
        es: "<p>Sustituye esto por el texto de la respuesta que se mostrará en el panel.</p>",
        fr: "<p>Remplacez ceci par le texte de la réponse à afficher dans le panneau.</p>",
        de: "<p>Ersetzen Sie dies durch den Antworttext, der im Panel erscheinen soll.</p>",
        da: "<p>Erstat dette med den svartekst, der skal vises i panelet.</p>",
        ja: "<p>パネルに表示する回答テキストに置き換えてください。</p>",
        "zh-CN": "<p>请将此处替换为要在面板中显示的答案文案。</p>",
        "zh-TW": "<p>請將此處替換為要在面板中顯示的答案文案。</p>",
        it: "<p>Sostituisci questo con il testo della risposta da mostrare nel pannello.</p>",
      },
      sitecore: {
        type: "rich-text",
        required: true,
        hint: "The answer body. Maps to Content for accordion components.",
        sortOrder: 200,
      },
    },
    {
      name: "Category",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Optional category label for filtering (e.g. 'Billing', 'Shipping'). Surfaced by search-driven accordion-blocks as a facet.",
        section: "Metadata",
        sortOrder: 100,
      },
    },
    {
      name: "Tags",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Optional comma-separated tags for search faceting.",
        section: "Metadata",
        sortOrder: 200,
      },
    },
  ],
} satisfies ContentTemplateRecipe;

export default faqContentRecipe;
