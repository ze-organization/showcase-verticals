import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Single-line text input for `FormBuilder`. The Type rendering
 * parameter flips this between `text`, `email`, `tel`, `url`,
 * `number`, and `password` so authors don't need separate
 * field-per-type renderings for the seven common single-line cases.
 *
 * Lives in the `form-fields-{*}` placeholder exposed by FormBuilder —
 * the Pages toolbox surfaces it inside any FormBuilder placement via
 * the recipe's `placedIn` allowlist.
 *
 * The component itself doesn't fire CDP events — the parent FormBuilder
 * owns the analytics surface. Each field's `Name` field becomes the
 * HTML `<input name>` and the FormData key on submit.
 */
export const formTextFieldRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "form-text-field@1",
  icon: componentIcons["form-text-field@1"],
  name: "form-text-field",
  displayName: "Form Text Field",
  description:
    "Single-line text input for FormBuilder. Type param flips between text, email, tel, url, number, password.",

  section: { handle: "forms-section@1" },

  fields: [
    {
      name: "Name",
      shape: "text",
      default: "field",
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "HTML input `name` attribute and FormData key on submission. Lowercase, no spaces (e.g. 'firstName', 'email').",
        section: "Field",
        sortOrder: 100,
      },
    },
    {
      name: "Label",
      shape: "text",
      default: {
        en: "Field",
        ar: "الحقل",
        es: "Campo",
        fr: "Champ",
        de: "Feld",
        da: "Felt",
        ja: "フィールド",
        "zh-CN": "字段",
        "zh-TW": "欄位",
        it: "Campo",
      },
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "Visible label above the input.",
        section: "Field",
        sortOrder: 200,
      },
    },
    {
      name: "Placeholder",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Greyed-out placeholder text inside the input.",
        section: "Field",
        sortOrder: 300,
      },
    },
    {
      name: "Description",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Helper text shown under the input.",
        section: "Field",
        sortOrder: 400,
      },
    },
    {
      // Moved from params → fields. The HTML5 input type is editorial
      // data (does this field collect an email, a phone, a number?) —
      // a property of the field itself, not a presentation toggle. It
      // travels with the field across placements rather than being
      // re-picked per placement.
      name: "Type",
      shape: "enum",
      default: "text",
      sitecore: {
        enumHandle: "form-field-type@1",
        hint: "HTML5 input type. Drives inputMode and autoComplete defaults.",
        section: "Field",
        sortOrder: 450,
      },
    },
    {
      // Boolean wrapper around the HTML `autocomplete` attribute.
      // `true` (default) lets the browser autofill from saved values,
      // using a sensible WAI token derived from the field's `Type`
      // (email type → `autocomplete="email"`, tel → `tel`, etc.).
      // `false` emits `autocomplete="off"` to opt out — right for
      // one-time codes, security questions, anything that shouldn't
      // be remembered. The WAI-token power-user case lives on the
      // React side's `AUTO_COMPLETE_BY_TYPE` map; authors who need
      // a bespoke token override the field-level prop directly in
      // code rather than authoring an arbitrary string through CMS.
      name: "AutoComplete",
      shape: "boolean",
      default: "true",
      sitecore: {
        type: "checkbox",
        hint: "Let the browser autofill this field from saved values (recommended). Uncheck for one-time codes / security questions / anything that shouldn't be remembered.",
        section: "Field",
        sortOrder: 500,
      },
    },
    {
      // Moved from params → fields. Required-ness is validation data
      // (does this field allow blanks?) — a property of the field
      // itself, not a presentation toggle. Travels with the field
      // across placements like the other validation entries below.
      name: "Required",
      shape: "boolean",
      default: "true",
      sitecore: {
        type: "checkbox",
        hint: "Mark the field as required. Adds the HTML5 required attribute and a visible *.",
        section: "Validation",
        sortOrder: 100,
      },
    },
    {
      name: "Pattern",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "HTML5 validation regex (no leading/trailing slashes). Leave blank to skip pattern validation.",
        section: "Validation",
        sortOrder: 110,
      },
    },
    {
      name: "MinLength",
      shape: "integer",
      sitecore: {
        type: "integer",
        hint: "Minimum character count.",
        section: "Validation",
        sortOrder: 200,
      },
    },
    {
      name: "MaxLength",
      shape: "integer",
      sitecore: {
        type: "integer",
        hint: "Maximum character count.",
        section: "Validation",
        sortOrder: 300,
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
      name: "Width",
      shape: "enum",
      default: "full",
      sitecore: {
        enumHandle: "form-field-width@1",
        hint: "Width within the FormBuilder grid. Use Half/Third to pair fields on one row.",
        sortOrder: 300,
      },
    },
    {
      // Shared `size@1` scale. Scales BOTH the label typography and
      // the input height/padding so the field reads cohesively at
      // each size step. `default` cascades to the component's
      // natural midpoint (md).
      name: "Size",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "size@1",
        hint: "Field size. Scales the label typography + input height together.",
        sortOrder: 310,
      },
    },
    {
      // Where the label sits relative to the input — stack (above,
      // default), row (beside), or inset (floating). Backed by the
      // shared `label-orientation@1` enum so the four form-field
      // recipes expose the same vocabulary.
      name: "LabelOrientation",
      shape: "enum",
      default: "stack",
      sitecore: {
        enumHandle: "label-orientation@1",
        hint: "Where the label sits relative to the input. Stack (above) for the standard form layout, Row (beside) for short labels + short inputs, Inset (floating) for dense forms.",
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
    locations: [{ scope: "page", subfolder: "Form Fields/Text" }],
  },
} satisfies ComponentTemplateRecipe;

export default formTextFieldRecipe;
