import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Star / NPS rating input for `FormBuilder`. Two variants: `Default`
 * (5-star icons) and `Nps` (0–10 numeric scale with anchor labels).
 * Both submit the picked number; NPS is the survey-research standard.
 */
export const formRatingFieldRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "form-rating-field@1",
  icon: componentIcons["form-rating-field@1"],
  name: "form-rating-field",
  displayName: "Form Rating Field",
  description:
    "Star or NPS rating input. Star variant defaults to 5 icons; NPS variant uses the 0–10 scale with anchor labels at each end.",

  section: { handle: "forms-section@1" },

  fields: [
    {
      name: "Name",
      shape: "text",
      default: "rating",
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "HTML input `name` attribute. The picked number arrives as a string.",
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
        hint: "Question shown above the rating row.",
        section: "Field",
        sortOrder: 200,
      },
    },
    {
      name: "Description",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Optional helper text below the rating row.",
        section: "Field",
        sortOrder: 300,
      },
    },
    {
      name: "HelpText",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Long-form guidance shown via a tooltip on the label.",
        section: "Field",
        sortOrder: 350,
      },
    },
    {
      name: "Max",
      shape: "text",
      default: "5",
      sitecore: {
        type: "single-line-text",
        hint: "Highest score. Star variant default 5; NPS variant default 10.",
        section: "Validation",
        sortOrder: 100,
      },
    },
    {
      name: "StartLabel",
      shape: "text",
      default: {
        en: "Not at all likely",
        ar: "غير محتمل على الإطلاق",
        es: "Nada probable",
        fr: "Pas du tout probable",
        de: "Überhaupt nicht wahrscheinlich",
        da: "Slet ikke sandsynligt",
        ja: "まったくそう思わない",
        "zh-CN": "完全不可能",
        "zh-TW": "完全不可能",
        it: "Per niente probabile",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Anchor text below the LOWEST score (NPS only).",
        section: "Field",
        sortOrder: 400,
      },
    },
    {
      name: "EndLabel",
      shape: "text",
      default: {
        en: "Extremely likely",
        ar: "من المرجّح جدًا",
        es: "Extremadamente probable",
        fr: "Extrêmement probable",
        de: "Äußerst wahrscheinlich",
        da: "Yderst sandsynligt",
        ja: "非常に高い",
        "zh-CN": "极有可能",
        "zh-TW": "極有可能",
        it: "Estremamente probabile",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Anchor text below the HIGHEST score (NPS only).",
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
        hint: "Block submission until a score is picked.",
        section: "Validation",
        sortOrder: 100,
      },
    },
  ],

  variants: [{ name: "Default" }, { name: "Nps" }],

  placedIn: [
    "form-fields-{*}",
    "fieldset-fields-{*}",
    "column-1-{*}",
    "column-2-{*}",
    "column-3-{*}",
    "column-4-{*}",
  ],

  params: [
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
        hint: "Rating icon / cell size.",
        sortOrder: 310,
      },
    },
    {
      name: "LabelOrientation",
      shape: "enum",
      default: "stack",
      sitecore: {
        enumHandle: "label-orientation@1",
        hint: "Where the question label sits relative to the rating row.",
        sortOrder: 320,
      },
    },
  ],

  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: true,
    locations: [{ scope: "page", subfolder: "Form Fields/Rating" }],
  },
} satisfies ComponentTemplateRecipe;

export default formRatingFieldRecipe;
