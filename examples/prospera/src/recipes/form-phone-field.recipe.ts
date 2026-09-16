import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Phone number input with country code selector. Submits as a
 * combined E.164 string (e.g. `+12025550100`) — server-side code
 * doesn't need to glue the country code + national number.
 *
 * Country list is short (top 10 markets). Tenants needing a full
 * E.164 directory should fork this component or ship a plugin
 * wrapping libphonenumber-js.
 */
export const formPhoneFieldRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "form-phone-field@1",
  icon: componentIcons["form-phone-field@1"],
  name: "form-phone-field",
  displayName: "Form Phone Field",
  description:
    "Phone input with country-code selector. Submits as a single E.164 string so server code reads one value.",

  section: { handle: "forms-section@1" },

  fields: [
    {
      name: "Name",
      shape: "text",
      default: "phone",
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "HTML input `name`. The form submits the E.164 string under this key.",
        section: "Field",
        sortOrder: 100,
      },
    },
    {
      name: "Label",
      shape: "text",
      default: {
        en: "Phone number",
        ar: "رقم الهاتف",
        es: "Número de teléfono",
        fr: "Numéro de téléphone",
        de: "Telefonnummer",
        da: "Telefonnummer",
        ja: "電話番号",
        "zh-CN": "电话号码",
        "zh-TW": "電話號碼",
        it: "Numero di telefono",
      },
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "Label shown above the input.",
        section: "Field",
        sortOrder: 200,
      },
    },
    {
      name: "Description",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Optional helper text shown below the input.",
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
      name: "DefaultCountry",
      shape: "text",
      default: "US",
      sitecore: {
        type: "single-line-text",
        hint: "Initial country (ISO 3166-1 alpha-2). Accepts a comma-separated priority list — e.g. `IE,GB` pins Ireland as the default and pins Great Britain second so a user in Ireland sees both at the top of the picker before scrolling.",
        section: "Field",
        sortOrder: 400,
      },
    },
    {
      name: "Required",
      shape: "boolean",
      default: "true",
      sitecore: {
        type: "checkbox",
        hint: "Block submission until the input has a value.",
        section: "Validation",
        sortOrder: 100,
      },
    },
  ],

  variants: [{ name: "Default" }],

  placedIn: [
    "form-fields-{*}",
    "fieldset-fields-{*}",
    "array-fields-{*}",
    "conditional-fields-{*}",
    "column-1-{*}",
    "column-2-{*}",
    "column-3-{*}",
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
        hint: "Input size.",
        sortOrder: 310,
      },
    },
    {
      name: "LabelOrientation",
      shape: "enum",
      default: "stack",
      sitecore: {
        enumHandle: "label-orientation@1",
        hint: "Where the label sits relative to the input row.",
        sortOrder: 320,
      },
    },
  ],

  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: true,
    locations: [{ scope: "page", subfolder: "Form Fields/Phone" }],
  },
} satisfies ComponentTemplateRecipe;

export default formPhoneFieldRecipe;
