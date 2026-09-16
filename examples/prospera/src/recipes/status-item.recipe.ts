import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for `StatusItem` — leaf rendering for the `status-list@1`
 * family. Authors drop these into the `cards-statuses-{*}` placeholder.
 * Variants: Default (metric tile) and List (incident row).
 */
export const statusItemRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "status-item@1",
  icon: componentIcons["status-item@1"],
  name: "status-item",
  displayName: "Status Item",
  description:
    "Single status / incident / metric row for the status-list family: a subject, a status badge with a tone, and a metric (value + unit + caption).",
  section: { handle: "cards-and-lists-section@1" },
  fields: [
    {
      name: "Subject",
      shape: "text",
      default: {
        en: "Subject",
        ar: "الموضوع",
        es: "Asunto",
        fr: "Objet",
        de: "Betreff",
        da: "Emne",
        ja: "件名",
        "zh-CN": "主题",
        "zh-TW": "主旨",
        it: "Oggetto",
      },
      sitecore: {
        type: "single-line-text",
        hint: "What is being reported on — a region, a service, or a metric name.",
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "SubjectType",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Optional qualifier under the subject, e.g. 'Region', 'Service'.",
        section: "Content",
        sortOrder: 200,
      },
    },
    {
      name: "Status",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Badge label, e.g. 'Active', 'Restored', 'Warning', 'Normal'.",
        section: "Content",
        sortOrder: 300,
      },
    },
    {
      name: "StatusTone",
      shape: "text",
      default: "neutral",
      sitecore: {
        type: "single-line-text",
        hint: "Badge color — one of: neutral, info, success, warning, destructive.",
        section: "Content",
        sortOrder: 400,
      },
    },
    {
      name: "Value",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Headline metric value, e.g. '68,245' or '12,500'.",
        section: "Content",
        sortOrder: 500,
      },
    },
    {
      name: "Unit",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Optional unit appended to the value, e.g. 'MW', '%', 'customers'.",
        section: "Content",
        sortOrder: 600,
      },
    },
    {
      name: "MetricLabel",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Small caption under the metric, e.g. 'since 3:42 PM'.",
        section: "Content",
        sortOrder: 700,
      },
    },
    {
      name: "Link",
      shape: "link",
      sitecore: {
        type: "general-link",
        hint: "Optional details link.",
        section: "Content",
        sortOrder: 800,
      },
    },
  ],
  variants: [{ name: "Default" }, { name: "List" }],
  placedIn: ["cards-statuses-{*}"],
  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Statuses" },
      { scope: "site", subfolder: "Statuses" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default statusItemRecipe;
