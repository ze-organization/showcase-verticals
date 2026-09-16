import type { ContentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Content template for a single option inside a `FormSelectField` (and,
 * in the future, `FormRadioGroup`). No rendering — these items live
 * either as Sitecore children of the select field's datasource or as
 * shared items picked via Treelist. Walked at render time to produce
 * the dropdown's `<option>` list.
 *
 * Two fields: `Label` (visible) and `Value` (form-submission value).
 * When `Value` is blank the option's name is used so authors can dash
 * off an options list without typing both.
 */
export const formOptionRecipe = {
  kind: "content-template",
  schemaVersion: "1",
  handle: "form-option@1",
  name: "form-option",
  displayName: "Form Option",
  description:
    "One option inside a Form Select Field. Author-visible label + submitted value.",

  meta: {
    tax: {
      group: "Forms",
    },
  },

  fields: [
    {
      name: "Label",
      shape: "text",
      default: {
        en: "Option",
        ar: "خيار",
        es: "Opción",
        fr: "Option",
        de: "Option",
        da: "Valgmulighed",
        ja: "オプション",
        "zh-CN": "选项",
        "zh-TW": "選項",
        it: "Opzione",
      },
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "Author-visible label shown in the dropdown.",
        sortOrder: 100,
      },
    },
    {
      name: "Value",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Value submitted with the form. Defaults to the item's name when blank.",
        sortOrder: 200,
      },
    },
  ],
} satisfies ContentTemplateRecipe;

export default formOptionRecipe;
