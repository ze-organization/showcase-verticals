import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";
import { FORM_INNER_SLOT_HANDLES } from "./_form-field-handles";

/**
 * Repeating field group — the "Add another email" / "Add another
 * address" pattern. Renders one template instance + duplicates it on
 * each "Add another" click. Per-instance field names need a `{n}`
 * suffix so FormData carries each instance's value distinctly.
 */
export const formFieldsetArrayRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "form-fieldset-array@1",
  icon: componentIcons["form-fieldset-array@1"],
  name: "form-fieldset-array",
  displayName: "Form Repeating Group",
  description:
    "Repeating fieldset — author one template, users add / remove instances at runtime. Min / max counts clamp the range.",

  section: { handle: "forms-section@1" },

  fields: [
    {
      name: "Legend",
      shape: "text",
      default: {
        en: "Contacts",
        ar: "جهات الاتصال",
        es: "Contactos",
        fr: "Contacts",
        de: "Kontakte",
        da: "Kontakter",
        ja: "連絡先",
        "zh-CN": "联系人",
        "zh-TW": "聯絡人",
        it: "Contatti",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Group heading — semantic `<legend>` for the fieldset.",
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "Description",
      shape: "richText",
      sitecore: {
        type: "rich-text",
        hint: "Optional description shown under the legend.",
        section: "Content",
        sortOrder: 200,
      },
    },
    {
      name: "AddLabel",
      shape: "text",
      default: {
        en: "Add another",
        ar: "إضافة عنصر آخر",
        es: "Añadir otro",
        fr: "Ajouter un autre",
        de: "Weiteres hinzufügen",
        da: "Tilføj endnu et",
        ja: "さらに追加",
        "zh-CN": "添加另一个",
        "zh-TW": "新增另一個",
        it: "Aggiungi un altro",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Label for the 'Add another' button.",
        section: "Content",
        sortOrder: 300,
      },
    },
    {
      name: "RemoveLabel",
      shape: "text",
      default: {
        en: "Remove",
        ar: "إزالة",
        es: "Eliminar",
        fr: "Supprimer",
        de: "Entfernen",
        da: "Fjern",
        ja: "削除",
        "zh-CN": "移除",
        "zh-TW": "移除",
        it: "Rimuovi",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Label for the 'Remove' button on each instance.",
        section: "Content",
        sortOrder: 400,
      },
    },
    {
      name: "InitialCount",
      shape: "text",
      default: "1",
      sitecore: {
        type: "single-line-text",
        hint: "Number of instances rendered on first load.",
        section: "Validation",
        sortOrder: 100,
      },
    },
    {
      name: "Min",
      shape: "text",
      default: "1",
      sitecore: {
        type: "single-line-text",
        hint: "Minimum allowed instance count. Users can't remove below this.",
        section: "Validation",
        sortOrder: 200,
      },
    },
    {
      name: "Max",
      shape: "text",
      default: "5",
      sitecore: {
        type: "single-line-text",
        hint: "Maximum allowed instance count. The Add button disables at this cap.",
        section: "Validation",
        sortOrder: 300,
      },
    },
  ],

  variants: [{ name: "Default" }],

  dynamicPlaceholders: true,
  placeholders: [
    {
      key: "array-fields-{*}",
      allowedRenderingHandles: [...FORM_INNER_SLOT_HANDLES],
    },
  ],

  placedIn: ["form-fields-{*}", "fieldset-fields-{*}"],

  params: [],

  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: true,
    locations: [{ scope: "page", subfolder: "Form Fields/Arrays" }],
  },
} satisfies ComponentTemplateRecipe;

export default formFieldsetArrayRecipe;
