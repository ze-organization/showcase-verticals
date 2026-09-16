import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Live values readout for a parent FormBuilder. Surfaces a configurable
 * subset of form values as a "running summary" — best fit for quote
 * builders, pricing calculators, and any multi-step form where users
 * want to see what they've answered so far. Drops anywhere inside a
 * FormBuilder; reads from the form's context via
 * `useFormBuilderContext`.
 */
export const formSummaryRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "form-summary@1",
  icon: componentIcons["form-summary@1"],
  name: "form-summary",
  displayName: "Form Summary",
  description:
    "Live summary block — shows the parent FormBuilder's current values as a labelled list, with optional total slot. Quote builders / pricing calculators / multi-step recap.",

  section: { handle: "forms-section@1" },

  fields: [
    {
      name: "Title",
      shape: "text",
      default: {
        en: "Your selections",
        ar: "اختياراتك",
        es: "Tus selecciones",
        fr: "Vos sélections",
        de: "Ihre Auswahl",
        da: "Dine valg",
        ja: "選択した項目",
        "zh-CN": "您的选择",
        "zh-TW": "您的選擇",
        it: "Le tue selezioni",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Heading shown above the summary list.",
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "Fields",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Comma-separated list of field names to show (e.g. `firstName,email,plan`). Leave empty to surface every registered value.",
        section: "Content",
        sortOrder: 200,
      },
    },
    {
      name: "TotalField",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Optional field name whose value renders as the headline total at the bottom.",
        section: "Total",
        sortOrder: 100,
      },
    },
    {
      name: "TotalLabel",
      shape: "text",
      default: {
        en: "Total",
        ar: "الإجمالي",
        es: "Total",
        fr: "Total",
        de: "Gesamt",
        da: "I alt",
        ja: "合計",
        "zh-CN": "总计",
        "zh-TW": "總計",
        it: "Totale",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Label shown next to the headline total value.",
        section: "Total",
        sortOrder: 200,
      },
    },
  ],

  variants: [{ name: "Default" }],

  placedIn: [
    "form-fields-{*}",
    "fieldset-fields-{*}",
    "column-1-{*}",
    "column-2-{*}",
    "column-3-{*}",
  ],

  params: [],

  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: true,
    locations: [{ scope: "page", subfolder: "Form Fields/Summary" }],
  },
} satisfies ComponentTemplateRecipe;

export default formSummaryRecipe;
