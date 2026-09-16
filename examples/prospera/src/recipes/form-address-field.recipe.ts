import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Grouped address input — street / apt / city / state / postal /
 * country in one labelled fieldset. Submits as individual named
 * fields prefixed with the recipe's `Name` value (e.g. `address_city`).
 */
export const formAddressFieldRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "form-address-field@1",
  icon: componentIcons["form-address-field@1"],
  name: "form-address-field",
  displayName: "Form Address Field",
  description:
    "Grouped address input — street, city, region, postal code, country in one fieldset. Submits as individually named sub-fields.",

  section: { handle: "forms-section@1" },

  fields: [
    {
      name: "Name",
      shape: "text",
      default: "address",
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "Prefix for the sub-fields' `name` attributes (e.g. `address` → `address_street`, `address_city`).",
        section: "Field",
        sortOrder: 100,
      },
    },
    {
      name: "Legend",
      shape: "text",
      default: {
        en: "Mailing address",
        ar: "العنوان البريدي",
        es: "Dirección postal",
        fr: "Adresse postale",
        de: "Postanschrift",
        da: "Postadresse",
        ja: "郵送先住所",
        "zh-CN": "邮寄地址",
        "zh-TW": "郵寄地址",
        it: "Indirizzo postale",
      },
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "Group legend rendered above the input set.",
        section: "Content",
        sortOrder: 200,
      },
    },
    {
      name: "Description",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Optional helper text shown under the legend.",
        section: "Content",
        sortOrder: 300,
      },
    },
    {
      name: "DefaultCountry",
      shape: "text",
      default: "US",
      sitecore: {
        type: "single-line-text",
        hint: "Initial country (ISO 3166-1 alpha-2). Accepts a comma-separated priority list — e.g. `IE,GB` defaults to Ireland and pins both Ireland + Great Britain at the top of the searchable picker.",
        section: "Field",
        sortOrder: 400,
      },
    },
    {
      name: "HideFields",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Comma-separated list of sub-fields to hide. Valid keys: street, apt, city, region, postal, country. Use for stripped forms (e.g. `apt,country` for a US-only billing block).",
        section: "Field",
        sortOrder: 500,
      },
    },
    {
      name: "Required",
      shape: "boolean",
      default: "true",
      sitecore: {
        type: "checkbox",
        hint: "Block submission until the visible sub-fields are filled.",
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
  ],

  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: true,
    locations: [{ scope: "page", subfolder: "Form Fields/Address" }],
  },
} satisfies ComponentTemplateRecipe;

export default formAddressFieldRecipe;
