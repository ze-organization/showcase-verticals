import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Multi-line text input for `FormBuilder`. Same Field / Validation
 * shape as `form-text-field@1` but with a Rows param instead of
 * Type/Pattern — textareas don't take HTML5 type or pattern constraints.
 *
 * Lives in the `form-fields-{*}` placeholder exposed by FormBuilder.
 */
export const formTextareaFieldRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "form-textarea-field@1",
  icon: componentIcons["form-textarea-field@1"],
  name: "form-textarea-field",
  displayName: "Form Textarea Field",
  description:
    "Multi-line text input for FormBuilder. Rows / MinLength / MaxLength control sizing and validation.",

  section: { handle: "forms-section@1" },

  fields: [
    {
      name: "Name",
      shape: "text",
      default: "message",
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
        en: "Message",
        ar: "الرسالة",
        es: "Mensaje",
        fr: "Message",
        de: "Nachricht",
        da: "Besked",
        ja: "メッセージ",
        "zh-CN": "留言",
        "zh-TW": "訊息",
        it: "Messaggio",
      },
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "Visible label above the textarea.",
        section: "Field",
        sortOrder: 200,
      },
    },
    {
      name: "Placeholder",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Greyed-out placeholder text inside the textarea.",
        section: "Field",
        sortOrder: 300,
      },
    },
    {
      name: "Description",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Helper text shown under the textarea.",
        section: "Field",
        sortOrder: 400,
      },
    },
    {
      name: "MinLength",
      shape: "integer",
      sitecore: {
        type: "integer",
        hint: "Minimum character count.",
        section: "Validation",
        sortOrder: 100,
      },
    },
    {
      // Moved from params → fields. Required-ness is validation data
      // (does this field allow blanks?) — a property of the field
      // itself, not a presentation toggle.
      name: "Required",
      shape: "boolean",
      default: "false",
      sitecore: {
        type: "checkbox",
        hint: "Mark the field as required.",
        section: "Validation",
        sortOrder: 100,
      },
    },
    {
      name: "MaxLength",
      shape: "integer",
      sitecore: {
        type: "integer",
        hint: "Maximum character count.",
        section: "Validation",
        sortOrder: 200,
      },
    },
  ],

  variants: [{ name: "Default" }],
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

  params: [
    {
      name: "Rows",
      shape: "integer",
      default: "4",
      sitecore: {
        type: "integer",
        hint: "Visible row count. Browser still allows scrolling beyond this.",
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
      // Mirrors the other form-field recipes. Scales the label
      // typography + the textarea's min-height baseline together.
      name: "Size",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "size@1",
        hint: "Field size. Scales the label typography + textarea padding together.",
        sortOrder: 310,
      },
    },
    {
      name: "LabelOrientation",
      shape: "enum",
      default: "stack",
      sitecore: {
        enumHandle: "label-orientation@1",
        hint: "Where the label sits relative to the textarea. Stack (above) is the default; Row pairs label + textarea horizontally; Inset floats the label inside the textarea chrome.",
        sortOrder: 320,
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
    locations: [{ scope: "page", subfolder: "Form Fields/Textarea" }],
  },
} satisfies ComponentTemplateRecipe;

export default formTextareaFieldRecipe;
