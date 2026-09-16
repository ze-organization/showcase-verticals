import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Numeric range slider for `FormBuilder`. Single or dual-thumb mode;
 * payload is comma-joined values so single (`"25"`) and range
 * (`"10,40"`) submit through the same form encoder. Good fit for
 * budget brackets, NPS scores, satisfaction ratings.
 */
export const formRangeFieldRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "form-range-field@1",
  icon: componentIcons["form-range-field@1"],
  name: "form-range-field",
  displayName: "Form Range Field",
  description:
    "Numeric range slider — single-thumb for a one-value pick or dual-thumb for from/to selection. Renders an inline value chip so users see the picked number without guessing.",

  section: { handle: "forms-section@1" },

  fields: [
    {
      name: "Name",
      shape: "text",
      default: "range",
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "HTML input `name`. Form submits the value as a comma-joined string.",
        section: "Field",
        sortOrder: 100,
      },
    },
    {
      name: "Label",
      shape: "text",
      default: {
        en: "How would you rate us?",
        ar: "كيف تقيّمنا؟",
        es: "¿Cómo nos valorarías?",
        fr: "Comment nous évalueriez-vous ?",
        de: "Wie würden Sie uns bewerten?",
        da: "Hvordan vil du vurdere os?",
        ja: "評価をお聞かせください。",
        "zh-CN": "您对我们的评价如何？",
        "zh-TW": "您對我們的評價如何？",
        it: "Come ci valuteresti?",
      },
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "Label shown above the slider.",
        section: "Field",
        sortOrder: 200,
      },
    },
    {
      name: "Description",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Optional helper text shown below the slider.",
        section: "Field",
        sortOrder: 300,
      },
    },
    {
      name: "HelpText",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Long-form guidance shown via a tooltip on the label. Use for context that won't always be needed.",
        section: "Field",
        sortOrder: 350,
      },
    },
    {
      name: "Min",
      shape: "text",
      default: "0",
      sitecore: {
        type: "single-line-text",
        hint: "Slider minimum (number).",
        section: "Validation",
        sortOrder: 110,
      },
    },
    {
      name: "Max",
      shape: "text",
      default: "100",
      sitecore: {
        type: "single-line-text",
        hint: "Slider maximum (number).",
        section: "Validation",
        sortOrder: 200,
      },
    },
    {
      name: "Step",
      shape: "text",
      default: "1",
      sitecore: {
        type: "single-line-text",
        hint: "Smallest increment between values (e.g. `1`, `5`, `0.1`).",
        section: "Validation",
        sortOrder: 300,
      },
    },
    {
      name: "DefaultValue",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Initial value. Single number (e.g. `25`) or comma-joined pair for range mode (e.g. `10,40`).",
        section: "Field",
        sortOrder: 400,
      },
    },
    {
      name: "Unit",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Unit suffix shown next to the value chip (e.g. `%`, `$`, ` min`).",
        section: "Field",
        sortOrder: 410,
      },
    },
    {
      name: "Required",
      shape: "boolean",
      default: "false",
      sitecore: {
        type: "checkbox",
        hint: "Block submission until the slider is interacted with.",
        section: "Validation",
        sortOrder: 100,
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
    "column-4-{*}",
    "row-1-{*}",
    "row-2-{*}",
    "row-3-{*}",
    "row-4-{*}",
  ],

  params: [
    {
      name: "Mode",
      shape: "enum",
      default: "single",
      sitecore: {
        enumHandle: "range-mode@1",
        hint: "`single` — one thumb (e.g. NPS score). `range` — two thumbs for from/to selection (e.g. price range).",
        sortOrder: 100,
      },
    },
    {
      name: "Width",
      shape: "enum",
      default: "full",
      sitecore: {
        enumHandle: "form-field-width@1",
        hint: "Width within the FormBuilder grid.",
        sortOrder: 300,
      },
    },
    {
      name: "Size",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "size@1",
        hint: "Slider size. Scales the value chip typography.",
        sortOrder: 310,
      },
    },
    {
      name: "LabelOrientation",
      shape: "enum",
      default: "stack",
      sitecore: {
        enumHandle: "label-orientation@1",
        hint: "Where the label sits relative to the slider.",
        sortOrder: 320,
      },
    },
  ],

  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: true,
    locations: [{ scope: "page", subfolder: "Form Fields/Range" }],
  },
} satisfies ComponentTemplateRecipe;

export default formRangeFieldRecipe;
