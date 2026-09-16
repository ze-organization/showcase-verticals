import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Dropdown field for `FormBuilder`. Options come from a Treelist
 * referencing `form-option@1` items so authors can reuse option lists
 * across forms (one "Country" list referenced by every form on the
 * site) and reorder via drag-and-drop in the picker.
 *
 * Lives in the `form-fields-{*}` placeholder.
 */
export const formSelectFieldRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "form-select-field@1",
  icon: componentIcons["form-select-field@1"],
  name: "form-select-field",
  displayName: "Form Select Field",
  description:
    "Dropdown field for FormBuilder. Options sourced from a Treelist of FormOption items.",

  section: { handle: "forms-section@1" },

  fields: [
    {
      name: "Name",
      shape: "text",
      default: "selection",
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "HTML input `name` attribute and FormData key on submission.",
        section: "Field",
        sortOrder: 100,
      },
    },
    {
      name: "Label",
      shape: "text",
      default: {
        en: "Choose one",
        ar: "اختر واحدًا",
        es: "Elige una opción",
        fr: "Choisissez une option",
        de: "Eine Option wählen",
        da: "Vælg en",
        ja: "1つ選択",
        "zh-CN": "选择一项",
        "zh-TW": "選擇一項",
        it: "Scegli un'opzione",
      },
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "Visible label above the select.",
        section: "Field",
        sortOrder: 200,
      },
    },
    {
      name: "Placeholder",
      shape: "text",
      default: {
        en: "Select an option",
        ar: "اختر خياراً",
        es: "Selecciona una opción",
        fr: "Sélectionnez une option",
        de: "Option auswählen",
        da: "Vælg en indstilling",
        ja: "オプションを選択",
        "zh-CN": "选择一个选项",
        "zh-TW": "選擇一個選項",
        it: "Seleziona un'opzione",
      },
      sitecore: {
        type: "single-line-text",
        hint: "First (disabled) option shown before the author picks anything.",
        section: "Field",
        sortOrder: 300,
      },
    },
    {
      name: "Description",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Helper text shown under the select.",
        section: "Field",
        sortOrder: 400,
      },
    },
    {
      // Options Treelist. Source filter dropped — Sitecore Pages's
      // Treelist chrome rejected every pick under
      // `IncludeTemplatesForSelection=<form-option@1 GUID>` (same
      // pattern that bit the enumHandle reference fields). Authors
      // get an unrestricted picker now AND can create new option
      // items inline via the `insertOptions` allow-list below — the
      // typical authoring flow is "right-click → Insert → Form
      // Option" under the select field's datasource.
      name: "Options",
      shape: "reference",
      multiple: true,
      sitecore: {
        type: "treelist",
        hint: "Pick option items to populate the dropdown. Create new ones via Insert → Form Option under this select field's datasource.",
        section: "Options",
        sortOrder: 100,
      },
    },
    {
      // Moved from params → fields. Required-ness is validation data.
      name: "Required",
      shape: "boolean",
      default: "false",
      sitecore: {
        type: "checkbox",
        hint: "Block submission until an option is picked.",
        section: "Validation",
        sortOrder: 100,
      },
    },
    {
      // Toggles multiselect. When true the picker becomes a checkbox
      // list (Radix Select doesn't natively support multiple) and the
      // submitted value is comma-separated.
      name: "Multiple",
      shape: "boolean",
      default: "false",
      sitecore: {
        type: "checkbox",
        hint: "Allow picking more than one option. Submits a comma-separated value.",
        section: "Field",
        sortOrder: 500,
      },
    },
    {
      // Default selected option(s). For single-select: the Value of one
      // option (matches against the option's submitted Value). For
      // multi-select: a comma-separated list of Values.
      name: "DefaultValue",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Pre-selected option Value(s). For multi-select, comma-separate values. Leave blank to show the placeholder.",
        section: "Field",
        sortOrder: 600,
      },
    },
  ],

  // Default = dropdown (Radix Select). Radio = radio-group treatment
  // for short option lists (3–5) where surfacing every option at once
  // beats a click-to-open menu. Same data shape, different
  // presentation per the rendering-variant convention.
  variants: [{ name: "Default" }, { name: "Radio" }],
  placedIn: [
    "form-fields-{*}",
    // Also droppable into row / column splitter slots so authors
    // can lay form fields out in multi-column / multi-row layouts
    // without forking the rendering. The splitter slots themselves
    // stay permissive globally (no `allowedRenderingHandles`); each
    // form-field recipe contributing to their Allowed Controls
    // surfaces it in the picker without restricting what else can
    // drop into a splitter elsewhere.
    "column-1-{*}",
    "column-2-{*}",
    "column-3-{*}",
    "column-4-{*}",
    "column-5-{*}",
    "column-6-{*}",
    "row-1-{*}",
    "row-2-{*}",
    "row-3-{*}",
    "row-4-{*}",
    "row-5-{*}",
    "row-6-{*}",
    "row-7-{*}",
    "row-8-{*}",
  ],

  // Child-items pattern — authors create Form Option items as direct
  // children of the select field's datasource via right-click →
  // Insert → Form Option. Pairs with the Options Treelist above
  // (whose source is unrestricted) so the same item set is
  // discoverable for both the child-creation and the pick-from-
  // existing flows.
  insertOptions: ["form-option@1"],
  children: { allowedHandles: ["form-option@1"] },

  params: [
    {
      name: "Width",
      shape: "enum",
      default: "full",
      sitecore: {
        enumHandle: "form-field-width@1",
        hint: "Width within the FormBuilder grid.",
        sortOrder: 200,
      },
    },
    {
      name: "Size",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "size@1",
        hint: "Field size. Scales the label typography + select trigger height together.",
        sortOrder: 210,
      },
    },
    {
      name: "LabelOrientation",
      shape: "enum",
      default: "stack",
      sitecore: {
        enumHandle: "label-orientation@1",
        hint: "Where the label sits relative to the select. Stack (above) is the default; Row pairs them horizontally; Inset floats the label inside the trigger chrome.",
        sortOrder: 220,
      },
    },
  ],

  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: true,
    // Nested leaf per-component — the four form-field recipes all
    // claim a Form Fields parent; the leaf disambiguates the per-
    // recipe data-folder template (see main-nav.recipe.ts for
    // rationale).
    locations: [{ scope: "page", subfolder: "Form Fields/Select" }],
  },
} satisfies ComponentTemplateRecipe;

export default formSelectFieldRecipe;
