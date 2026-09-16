import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";
import {
  CARD_EMPTY_STATE_PARAMS,
  CARD_LIST_BASE_PARAMS,
  CARD_LIST_GRID_PARAMS,
} from "../lib/registry/card-list-shared-params";

/**
 * Recipe for `StatusList` — a generic status / incident / live-metric
 * list. Authors drop `status-item@1` renderings into the
 * `cards-statuses-{*}` placeholder. Dispatches between metric-forward
 * tiles (`Grid`) and dense incident rows (`List`).
 *
 * Use for grid-operations dashboards (live load / reserve tiles),
 * outage boards (region + customers affected + restore status), and
 * any service-status surface — subject and metric are un-opinionated.
 */
export const statusListRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "status-list@1",
  icon: componentIcons["status-list@1"],
  name: "status-list",
  displayName: "Status List",
  description:
    "Generic status / incident / live-metric list. Each row has a subject (a region, service, or metric), a status badge with a semantic tone, and a metric (value + unit + caption). Use for grid/outage/service dashboards. Variants: List (incident rows), Grid (metric tiles).",
  section: { handle: "cards-and-lists-section@1" },
  fields: [
    {
      name: "Title",
      shape: "text",
      // 10-language SV seed — status-list was the one cards-and-lists
      // container without a Title default, so a fresh drop rendered a
      // headingless section and the Title field looked dead.
      default: {
        en: "Status overview",
        ar: "نظرة عامة على الحالة",
        es: "Resumen de estado",
        fr: "Aperçu des statuts",
        de: "Statusübersicht",
        da: "Statusoversigt",
        ja: "ステータス概要",
        "zh-CN": "状态概览",
        "zh-TW": "狀態概覽",
        it: "Panoramica dello stato",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Section heading shown above the list.",
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "Lead",
      shape: "richText",
      sitecore: {
        type: "rich-text",
        hint: "Supporting copy under the title.",
        section: "Content",
        sortOrder: 200,
      },
    },
    {
      name: "Statuses",
      shape: "reference",
      multiple: true,
      sitecore: {
        type: "treelist",
        hint: "Curated mode — pick status-item entries to list.",
        source: { kind: "filter", types: ["status-item@1"] },
        section: "Content",
        sortOrder: 300,
      },
    },
  ],
  params: [
    ...CARD_LIST_BASE_PARAMS.filter((param) =>
      ["HeadingLayout", "HeadingSize", "ColorScheme", "BackgroundIntensity", "PaddingY", "MaxWidth"].includes(
        param.name,
      ),
    ),
    ...CARD_LIST_GRID_PARAMS,
    ...CARD_EMPTY_STATE_PARAMS,
  ],
  variants: [{ name: "List" }, { name: "Grid" }],
  dynamicPlaceholders: true,

  placeholders: [
    {
      key: "cards-statuses-{*}",
      allowedRenderingHandles: ["status-item@1"],
    },
  ],
  placedIn: ["headless-main-{*}"],



  // Child-items authoring pattern (mirrors accordion-block): authors
  // can create items directly under this rendering's datasource via
  // Insert, then reference them from the curated Treelist.
  insertOptions: ["status-item@1"],

  // Folder template Insert Options so Sitecore Insert surfaces the
  // card/item type under each folder instance.
  children: { allowedHandles: ["status-item@1"] },

  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Statuses" },
      { scope: "site", subfolder: "Statuses" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default statusListRecipe;
