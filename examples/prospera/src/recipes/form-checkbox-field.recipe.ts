import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Single checkbox for `FormBuilder` — opt-in copy, terms acceptance,
 * "send me a copy", etc. The `Label` field is the visible copy next
 * to the checkbox (supports rich text so authors can drop links inline:
 * "I agree to the <a>Privacy Policy</a>").
 *
 * Lives in the `form-fields-{*}` placeholder. Submitted value is
 * literally `"on"` when ticked (HTML `<input type=checkbox>` default).
 */
export const formCheckboxFieldRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "form-checkbox-field@1",
  icon: componentIcons["form-checkbox-field@1"],
  name: "form-checkbox-field",
  displayName: "Form Checkbox Field",
  description:
    "Single checkbox for FormBuilder. Rich-text label, optional description, required + default-checked toggles.",

  section: { handle: "forms-section@1" },

  fields: [
    {
      name: "Name",
      shape: "text",
      default: "consent",
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "HTML input `name` attribute. Read on submit as `formData.get('<name>') === 'on'`.",
        section: "Field",
        sortOrder: 100,
      },
    },
    {
      name: "Label",
      shape: "richText",
      default: {
        en: "<p>I agree to the terms.</p>",
        ar: "<p>أوافق على الشروط.</p>",
        es: "<p>Acepto los términos.</p>",
        fr: "<p>J'accepte les conditions.</p>",
        de: "<p>Ich stimme den Bedingungen zu.</p>",
        da: "<p>Jeg accepterer betingelserne.</p>",
        ja: "<p>利用規約に同意します。</p>",
        "zh-CN": "<p>我同意相关条款。</p>",
        "zh-TW": "<p>我同意相關條款。</p>",
        it: "<p>Accetto i termini.</p>",
      },
      sitecore: {
        type: "rich-text",
        required: true,
        hint: "Copy shown next to the checkbox. Rich text supports inline links (Privacy Policy, Terms).",
        section: "Field",
        sortOrder: 200,
      },
    },
    {
      name: "Description",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Optional helper text shown under the checkbox row.",
        section: "Field",
        sortOrder: 300,
      },
    },
    {
      // Moved from params → fields. Required-ness is validation data.
      name: "Required",
      shape: "boolean",
      default: "false",
      sitecore: {
        type: "checkbox",
        hint: "Block submission until the box is ticked.",
        section: "Validation",
        sortOrder: 100,
      },
    },
    {
      // Moved from params → fields. The initial state is editorial
      // data (does this checkbox default to ticked?), not a
      // presentation toggle.
      name: "DefaultChecked",
      shape: "boolean",
      default: "false",
      sitecore: {
        type: "checkbox",
        hint: "Initial checked state. Authors typically leave off for consent boxes.",
        section: "Field",
        sortOrder: 400,
      },
    },
  ],

  // Default = native checkbox box. Switch = visual toggle (same data
  // shape, different presentation) — picked per placement so the same
  // checkbox field can be styled as a toggle on a settings surface and
  // a classic checkbox on a consent form.
  variants: [{ name: "Default" }, { name: "Switch" }],
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
        hint: "Field size. Scales the label typography + checkbox box size together.",
        sortOrder: 310,
      },
    },
    {
      // Row vs Stack for the checkbox + label pair. `row` (default,
      // the conventional `[x] I agree` consent pattern) sits the
      // checkbox alongside its label. `stack` puts the checkbox above
      // the label — useful when the label is long-form rich text and
      // the checkbox reads as a separate confirmation step. `inset`
      // is meaningless for a tick-box and cascades to `row`.
      name: "LabelOrientation",
      shape: "enum",
      default: "row",
      sitecore: {
        enumHandle: "label-orientation@1",
        hint: "Layout between the checkbox and its label. `Row` (default) pairs them side-by-side; `Stack` puts the checkbox above the label.",
        sortOrder: 320,
      },
    },
    {
      // Checkbox-specific. Picks which side of the label the checkbox
      // sits on within the row. `start` (the default) renders the
      // conventional consent pattern (`[x] I agree to the terms`);
      // `end` renders settings-style toggles (`Receive emails [x]`).
      // RTL-safe via logical `start` / `end`.
      name: "CheckboxPosition",
      shape: "enum",
      default: "start",
      sitecore: {
        enumHandle: "checkbox-position@1",
        hint: "Which side of the label the checkbox sits on. Start = checkbox before label (standard consent UX). End = checkbox after label (settings-style toggle).",
        sortOrder: 330,
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
    locations: [{ scope: "page", subfolder: "Form Fields/Checkbox" }],
  },
} satisfies ComponentTemplateRecipe;

export default formCheckboxFieldRecipe;
