import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for the `SearchPaginationBar` rendering.
 *
 * Bundled trailing-controls row for the search-experience wrapper.
 * Renders the three pieces every search results page typically wants
 * below the items — pagination, results-per-page selector, and a
 * results-summary line — each gated by a `Show…` param.
 *
 * Lives in `search-controls-trailing-{*}`. The granular renderings
 * (pagination@1 / results-per-page@1 / results-summary@1) stay
 * available for cases where authors want them split across different
 * areas of the page (e.g. pagination centered, summary as part of a
 * header above the results).
 */
export const searchPaginationBarRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "search-pagination-bar@1",
  icon: componentIcons["search-pagination-bar@1"],
  name: "search-pagination-bar",
  displayName: "Search Pagination Bar",
  description:
    "Bundled trailing-controls row — pagination + results-per-page + results-summary in one drop. Each piece gated by a Show* param.",
  section: { handle: "search-section@1" },
  fields: [
    {
      name: "PerPageLabel",
      shape: "text",
      default: {
        en: "Results per page",
        ar: "النتائج لكل صفحة",
        es: "Resultados por página",
        fr: "Résultats par page",
        de: "Ergebnisse pro Seite",
        da: "Resultater pr. side",
        ja: "1ページあたりの件数",
        "zh-CN": "每页结果数",
        "zh-TW": "每頁結果數",
        it: "Risultati per pagina",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Label next to the results-per-page selector.",
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "PreviousLabel",
      shape: "text",
      default: {
        en: "Previous",
        ar: "السابق",
        es: "Anterior",
        fr: "Précédent",
        de: "Zurück",
        da: "Forrige",
        ja: "前へ",
        "zh-CN": "上一页",
        "zh-TW": "上一頁",
        it: "Indietro",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Label on the previous-page button.",
        section: "Content",
        sortOrder: 200,
      },
    },
    {
      name: "NextLabel",
      shape: "text",
      default: {
        en: "Next",
        ar: "التالي",
        es: "Siguiente",
        fr: "Suivant",
        de: "Weiter",
        da: "Næste",
        ja: "次へ",
        "zh-CN": "下一页",
        "zh-TW": "下一頁",
        it: "Avanti",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Label on the next-page button.",
        section: "Content",
        sortOrder: 300,
      },
    },
    {
      name: "SummaryTemplate",
      shape: "text",
      default: {
        en: "Showing {start}-{end} of {total} results",
        ar: "عرض {start}-{end} من {total} نتيجة",
        es: "Mostrando {start}-{end} de {total} resultados",
        fr: "Affichage de {start} à {end} sur {total} résultats",
        de: "{start}–{end} von {total} Ergebnissen",
        da: "Viser {start}-{end} af {total} resultater",
        ja: "{total} 件中 {start}〜{end} 件を表示",
        "zh-CN": "显示第 {start}-{end} 项，共 {total} 项结果",
        "zh-TW": "顯示第 {start}-{end} 項，共 {total} 項結果",
        it: "Visualizzazione di {start}-{end} di {total} risultati",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Result-summary template. Placeholders: {start}, {end}, {total}.",
        section: "Content",
        sortOrder: 400,
      },
    },
    {
      name: "SummaryEmptyTemplate",
      shape: "text",
      default: {
        en: "No results",
        ar: "لا توجد نتائج",
        es: "Sin resultados",
        fr: "Aucun résultat",
        de: "Keine Ergebnisse",
        da: "Ingen resultater",
        ja: "結果がありません",
        "zh-CN": "无结果",
        "zh-TW": "無結果",
        it: "Nessun risultato",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Summary text shown when totalItems is 0.",
        section: "Content",
        sortOrder: 500,
      },
    },
  ],
  params: [
    {
      name: "ShowPagination",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Show the page navigation controls.",
        section: "Visibility",
        sortOrder: 100,
      },
    },
    {
      name: "ShowPerPage",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Show the results-per-page selector.",
        section: "Visibility",
        sortOrder: 200,
      },
    },
    {
      name: "ShowSummary",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Show the X-Y of N results summary line.",
        section: "Visibility",
        sortOrder: 300,
      },
    },
    {
      name: "PerPageOptions",
      shape: "text",
      default: "10,25,50,100",
      sitecore: {
        type: "single-line-text",
        hint: "Comma-separated page-size options for the results-per-page selector.",
        section: "Behavior",
        sortOrder: 100,
      },
    },
    {
      name: "Alignment",
      shape: "enum",
      default: "split",
      sitecore: {
        enumHandle: "pagination-alignment@1",
        hint: "How the three pieces align. `split` = summary+per-page on one side, pagination on the other; `start/center/end` stack vertically with the chosen alignment.",
        section: "Layout",
        sortOrder: 100,
      },
    },
  ],
  variants: [{ name: "Default" }, { name: "Compact" }],
  placedIn: ["search-controls-trailing-{*}", "search-controls-leading-{*}"],
  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Search Pagination Bars" },
      { scope: "site", subfolder: "Search Pagination Bars" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default searchPaginationBarRecipe;
