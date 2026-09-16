import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for the `AccordionBlock` component (./accordion-block.tsx).
 *
 * Three composition modes — same dispatch shape as the cards-and-lists
 * family containers (offers, products, etc.). The React component reads
 * which datasource field is populated at render time:
 *
 *   1. **Composed** (placeholder children) — `accordion-items-{*}`
 *      placeholder accepts `accordion-item-rendering@1` children that
 *      authors drop visually. Used by `visual-tabs@1` / `visual-accordion@1`.
 *
 *   2. **Curated** (Items Treelist) — `Items` is a Treelist whose
 *      source accepts THREE template types simultaneously:
 *        - `accordion-item@1` (the content model)
 *        - `accordion-item-rendering@1` (the visual rendering — referenceable as content too)
 *        - `faq-content@1` (the FAQ content model — Question/Answer)
 *      Authors pick any mix. The React adapter normalises each to a
 *      common item shape (Title/Content/Description/Image/Link).
 *
 *   3. **Search-driven** — `SearchConfig` Plugin field, authored via
 *      the `sai/search-source` Marketplace plugin. The accordion-block
 *      fetches matching items at render time via `useSearchResults`
 *      and renders them in the same shape as curated mode.
 *
 * Composed mode also supports the child-items pattern via
 * `insertOptions` — authors can author `accordion-item@1`,
 * `faq-content@1`, or nested `accordion-block@1` instances as
 * Sitecore children of the datasource item. Same dispatch outcome as
 * the Treelist path.
 */
export const accordionBlockRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "accordion-block@1",
  icon: componentIcons["accordion-block@1"],
  name: "accordion-block",
  displayName: "Accordion",
  description:
    "Collapsible section list. Supports both related-items (Treelist) and child-items (insertOptions) modeling.",

  section: { handle: "ui-section@1" },

  fields: [
    {
      name: "Heading",
      shape: "text",
      default: {
        en: "Frequently asked",
        ar: "الأسئلة الشائعة",
        es: "Preguntas frecuentes",
        fr: "Questions fréquentes",
        de: "Häufige Fragen",
        da: "Ofte stillede spørgsmål",
        ja: "よくある質問",
        "zh-CN": "常见问题",
        "zh-TW": "常見問題",
        it: "Domande frequenti",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Optional heading shown above the accordion.",
        sortOrder: 100,
      },
    },
    {
      name: "Description",
      shape: "richText",
      default: {
        en: "<p>Short supporting copy that frames the accordion section below.</p>",
        ar: "<p>نص داعم قصير يُؤطّر قسم الأكورديون أدناه.</p>",
        es: "<p>Texto de apoyo breve que enmarca la sección de acordeón siguiente.</p>",
        fr: "<p>Texte d'accompagnement court qui présente la section en accordéon ci-dessous.</p>",
        de: "<p>Kurzer Begleittext, der den nachfolgenden Akkordeon-Abschnitt einleitet.</p>",
        da: "<p>Kort støttetekst, der rammer accordion-sektionen nedenfor ind.</p>",
        ja: "<p>下のアコーディオンセクションを導く短い補足文です。</p>",
        "zh-CN": "<p>用于引出下方折叠面板部分的简短文案。</p>",
        "zh-TW": "<p>用於引出下方摺疊面板部分的簡短文案。</p>",
        it: "<p>Breve testo di supporto che introduce la sezione a fisarmonica qui sotto.</p>",
      },
      sitecore: {
        type: "rich-text",
        hint: "Optional supporting copy between the heading and the accordion. Hide by clearing the field.",
        sortOrder: 150,
      },
    },
    {
      name: "Items",
      shape: "reference",
      multiple: true,
      sitecore: {
        type: "treelist",
        // Three template types pass the filter. Compiler resolves each
        // handle to its deterministic template GUID and emits a
        // comma-joined IncludeTemplatesForSelection. The React adapter
        // normalises all three into the same row shape (Title +
        // Content + optional Description / Image / Link), so authors
        // can mix content-model items, FAQ items, and the visual
        // rendering used as a referenceable content item.
        source: {
          kind: "filter",
          types: [
            "accordion-item@1",
            "faq-content@1",
            "accordion-item-rendering@1",
          ],
        },
        hint: "Pick AccordionItem, FAQ, or AccordionItemRendering items. The component normalises all three into the same row shape.",
        sortOrder: 200,
      },
    },
    {
      name: "SearchConfig",
      shape: "text",
      sitecore: {
        type: "Plugin",
        hint: "Search-mode config blob. Populated via the sai/search-source Marketplace plugin (filters, sort, personalization). When set, the accordion fetches items at render time instead of reading Items / placeholder children.",
        source: {
          kind: "plugin",
          id: "sai/list-source",
          defaultAppId: "a559eb70-e5c3-4b3c-a0de-84def425a9c4",
        },
        section: "Search",
        sortOrder: 100,
      },
    },
  ],

  // Composed (child-items) pattern: authors can author accordion-items,
  // FAQs, full accordion-blocks, or accordion-item renderings directly
  // under this accordion's datasource. The React adapter treats child
  // items the same way it treats Treelist-referenced ones.
  insertOptions: [
    "accordion-item@1",
    "faq-content@1",
    "accordion-block@1",
    "accordion-item-rendering@1",
  ],

  // Generate a `<Accordion> Folder` template under
  // Components/<section>/Component Folders/. The folder template's
  // standard-values Insert Options field references the listed handles
  // so the Sitecore "Insert" UX surfaces both accordion-items and FAQ
  // items under each accordion folder instance.
  children: { allowedHandles: ["accordion-item@1", "faq-content@1"] },

  // Three rendering variants. `Default` and `Media` consume the
  // content-driven `Items` Treelist (per the variant-vs-parameter
  // rule, `Media` warrants its own export because it carries
  // different field semantics + composition). Placeholder-composed
  // accordions are `visual-accordion@1`.
  variants: [{ name: "Default" }, { name: "Media" }],

  params: [
    {
      name: "UseSectionWrapper",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Constrain the accordion to a prose-width column. Outer section padding applies regardless.",
        sortOrder: 100,
      },
    },
    {
      // Gate per-item thumbnails. Off by default so a plain Q&A
      // accordion stays text-only even when items DO carry an Image
      // field; on for media-rich accordions where the picture is
      // load-bearing. The Media variant ignores this flag (it always
      // shows images by definition) — Default variant
      // honor it.
      name: "ShowImages",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Show the per-item thumbnail next to each trigger. Off = text-only triggers regardless of whether items carry an Image. The Media variant always shows images and ignores this flag.",
        sortOrder: 120,
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
  ],

  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      // Nested leaf per-component — accordion-block and
      // accordion-item-rendering both claim an Accordions parent, so
      // the leaf disambiguates the per-recipe data-folder template
      // (see main-nav.recipe.ts for rationale).
      { scope: "page", subfolder: "Accordions/Accordion Block" },
      { scope: "site", subfolder: "Site Shared UI/Accordions/Accordion Block" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default accordionBlockRecipe;
