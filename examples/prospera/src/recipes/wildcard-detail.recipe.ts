import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for the `WildcardDetail` component (./wildcard-detail.tsx) —
 * the generic detail rendering for Sitecore *wildcard pages*.
 *
 * A wildcard page is a page item literally named `*` (a Page recipe
 * whose `itemPath` ends in `/*`). One wildcard page carries the
 * design; the actual content is resolved at request time in the head
 * app: the URL's last segment (the slug) is looked up under the
 * `SourceRoot` data folder configured on this datasource, via the
 * server-only Edge GraphQL proxy (`/api/sitecore/igql` +
 * `useWildcardItem`).
 *
 * The datasource therefore has two jobs:
 *
 *   1. `SourceRoot` — resolver configuration: the content-tree path
 *      of the data folder the slugs live under.
 *   2. Title / Subtitle / Body / Image — the authored *fallback*
 *      surface: what renders in editing mode, in the showcase
 *      preview, in environments without Edge, or when a slug doesn't
 *      resolve. Runtime-resolved fields always win over these.
 *
 * Variants differ in layout only (all four share this datasource):
 * Default (generic + definition list), Product, Recipe, Initiative —
 * the non-Default layouts read conventional field names from the
 * resolved item (Tagline, TastingNotes, Ingredients, Steps,
 * FeaturedProducts, SignatureCocktail, …).
 */
export const wildcardDetailRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "wildcard-detail@1",
  icon: componentIcons["wildcard-detail@1"],
  name: "wildcard-detail",
  displayName: "Wildcard Detail",
  description:
    "Detail rendering for Sitecore wildcard (*) pages. Resolves the URL slug to a content item under the configured Source Root and renders it; falls back to the authored Title/Subtitle/Body/Image when no item resolves.",

  section: { handle: "ui-section@1" },

  fields: [
    {
      name: "SourceRoot",
      shape: "text",
      default: "",
      sitecore: {
        type: "single-line-text",
        hint: "Content-tree path of the data folder the URL slug resolves under (e.g. /sitecore/content/<Site>/Home/Data/Items). Enter the real site path — a {site} token is NOT substituted at runtime. Leave empty to always render the authored fallback fields below.",
        sortOrder: 100,
      },
    },
    {
      name: "Title",
      shape: "text",
      default: {
        en: "Item title",
        ar: "عنوان العنصر",
        es: "Título del elemento",
        fr: "Titre de l'élément",
        de: "Elementtitel",
        da: "Elementtitel",
        ja: "アイテムのタイトル",
        "zh-CN": "条目标题",
        "zh-TW": "項目標題",
        it: "Titolo dell'elemento",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Fallback headline. Shown when no content item resolves from the URL (editing mode, preview, Edge not configured).",
        sortOrder: 200,
      },
    },
    {
      name: "Subtitle",
      shape: "text",
      default: {
        en: "A short supporting summary for this item.",
        ar: "ملخص داعم قصير لهذا العنصر.",
        es: "Un breve resumen de apoyo para este elemento.",
        fr: "Un bref résumé d'appui pour cet élément.",
        de: "Eine kurze ergänzende Zusammenfassung zu diesem Element.",
        da: "Et kort understøttende resumé af dette element.",
        ja: "このアイテムの短い補足要約。",
        "zh-CN": "该条目的简短补充摘要。",
        "zh-TW": "該項目的簡短補充摘要。",
        it: "Un breve riepilogo di supporto per questo elemento.",
      },
      sitecore: {
        type: "multi-line-text",
        hint: "Fallback subtitle / summary shown under the headline.",
        sortOrder: 300,
      },
    },
    {
      name: "Body",
      shape: "richText",
      default: {
        en: "<p>Fallback body copy. When a URL slug resolves to a content item under the Source Root, that item's fields replace this authored content.</p>",
        ar: "<p>نص احتياطي. عندما يُطابق مقطع عنوان URL عنصر محتوى ضمن جذر المصدر، تحل حقول ذلك العنصر محل هذا المحتوى.</p>",
        es: "<p>Texto de respaldo. Cuando un slug de URL se resuelve en un elemento de contenido bajo la raíz de origen, los campos de ese elemento sustituyen este contenido.</p>",
        fr: "<p>Texte de repli. Lorsqu'un slug d'URL correspond à un élément de contenu sous la racine source, les champs de cet élément remplacent ce contenu.</p>",
        de: "<p>Fallback-Text. Wenn ein URL-Slug auf ein Inhaltselement unterhalb des Quellstamms verweist, ersetzen dessen Felder diesen Inhalt.</p>",
        da: "<p>Reserveindhold. Når en URL-slug matcher et indholdselement under kilderoden, erstatter det elements felter dette indhold.</p>",
        ja: "<p>フォールバック本文。URLスラッグがソースルート配下のコンテンツアイテムに解決されると、そのアイテムのフィールドがこの本文を置き換えます。</p>",
        "zh-CN":
          "<p>后备正文。当 URL 别名解析到源根目录下的内容项时，该内容项的字段将替换此处的内容。</p>",
        "zh-TW":
          "<p>後備內文。當 URL 別名解析到來源根目錄下的內容項目時，該項目的欄位將取代此處的內容。</p>",
        it: "<p>Testo di riserva. Quando uno slug URL corrisponde a un elemento di contenuto sotto la radice di origine, i campi di quell'elemento sostituiscono questo contenuto.</p>",
      },
      sitecore: {
        type: "rich-text",
        hint: "Fallback rich-text body.",
        sortOrder: 400,
      },
    },
    {
      name: "Image",
      shape: "image",
      default:
        "Detail placeholder|/theme-photos/hub-02.jpg",
      sitecore: {
        hint: "Fallback detail image.",
        section: "Media",
        sortOrder: 100,
      },
    },
  ],

  variants: [
    { name: "Default" },
    { name: "Product" },
    { name: "Recipe" },
    { name: "Initiative" },
  ],

  datasource: {
    templates: [{ handle: "wildcard-detail@1" }],
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      {
        scope: "page",
        subfolder: "Wildcard Details",
        allowedTemplates: [{ handle: "wildcard-detail@1" }],
      },
    ],
  },

  placedIn: ["headless-main-{*}"],
} satisfies ComponentTemplateRecipe;

export default wildcardDetailRecipe;
