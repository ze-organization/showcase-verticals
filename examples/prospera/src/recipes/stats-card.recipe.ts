import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";
import { cardChromeParams } from "./_card-chrome-params";

/**
 * Recipe for `StatsCard` — the leaf card rendering for the stats
 * family. Authors drop these into the `cards-stats-{*}` placeholder
 * exposed by `stats-list-grid@1` and `stats-carousel@1` (composed
 * mode).
 *
 * Variants `Default` and `Inner` map to the two StatsCard React
 * function exports — same composition, but `Inner` swaps the
 * outline-card shell for the flat/inner treatment used inside
 * dense parent containers (see [[feedback-variant-vs-parameter]] —
 * the topology difference is a real variant, not a style flag).
 *
 * In curated mode the stats-card items themselves are the datasource
 * targets the parent stats-list-grid/carousel's Treelist references.
 */
export const statsCardRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "stats-card@1",
  icon: componentIcons["stats-card@1"],
  name: "stats-card",
  displayName: "Stats Card",
  description:
    "Single stat highlight. Fields: Label, Value, Change, Trend (up/down/flat), Context. Variants: Default (outline shell), Inner (flat treatment for dense parents).",
  section: { handle: "cards-and-lists-section@1" },
  fields: [
    {
      name: "Label",
      shape: "text",
      default: {
        en: "Active users",
        ar: "المستخدمون النشطون",
        es: "Usuarios activos",
        fr: "Utilisateurs actifs",
        de: "Aktive Nutzer",
        da: "Aktive brugere",
        ja: "アクティブユーザー",
        "zh-CN": "活跃用户",
        "zh-TW": "活躍使用者",
        it: "Utenti attivi",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Metric label shown above the value.",
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "Value",
      shape: "text",
      default: "24.8k",
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "The headline number or string — the prominent value.",
        section: "Content",
        sortOrder: 200,
      },
    },
    {
      name: "Change",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Delta versus a comparison period, e.g. `+12%` or `-0.3%`. Drives the trend inference when Trend is unset.",
        section: "Content",
        sortOrder: 300,
      },
    },
    {
      name: "Trend",
      shape: "enum",
      default: "flat",
      values: ["up", "down", "flat"],
      sitecore: {
        type: "droplist",
        hint: "Direction indicator. `up` is positive (success styling), `down` is negative (destructive), `flat` is neutral.",
        section: "Content",
        sortOrder: 400,
      },
    },
    {
      name: "Context",
      shape: "text",
      default: {
        en: "vs last month",
        ar: "مقارنةً بالشهر الماضي",
        es: "frente al mes pasado",
        fr: "vs le mois dernier",
        de: "ggü. Vormonat",
        da: "vs. sidste måned",
        ja: "先月比",
        "zh-CN": "较上月",
        "zh-TW": "較上月",
        it: "rispetto al mese scorso",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Small caption text shown next to the change badge — typically a comparison window.",
        section: "Content",
        sortOrder: 500,
      },
    },
  ],
  params: [
    {
      name: "Tone",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "stat-tone@1",
        hint: "Color tone applied to the card surface.",
        section: "Style",
        sortOrder: 200,
      },
    },
    {
      name: "ValueSize",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "stat-value-size@1",
        hint: "Size of the prominent value text.",
        section: "Style",
        sortOrder: 300,
      },
    },
    {
      name: "LabelCase",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "label-case@1",
        hint: "Casing treatment for the metric label.",
        section: "Style",
        sortOrder: 400,
      },
    },
    {
      name: "Emphasis",
      shape: "enum",
      default: "value",
      sitecore: {
        enumHandle: "stat-emphasis@1",
        hint: "FlankedLabel only: which slot dominates — `value` (big number, rotated label on the flank) or `label` (big label text, number on the flank — the inverted-emphasis read). Other variants ignore it.",
        section: "Style",
        sortOrder: 450,
      },
    },
    {
      name: "TrendDisplay",
      shape: "enum",
      default: "badge",
      sitecore: {
        enumHandle: "trend-display@1",
        hint: "How the change/trend pairing renders.",
        section: "Behavior",
        sortOrder: 100,
      },
    },
    ...cardChromeParams,
  ],
  variants: [{ name: "Default" }, { name: "Inner" }, { name: "FlankedLabel" }],
  placedIn: ["cards-stats-{*}", "search-results-{*}"],
  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Stats" },
      { scope: "site", subfolder: "Stats" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default statsCardRecipe;
