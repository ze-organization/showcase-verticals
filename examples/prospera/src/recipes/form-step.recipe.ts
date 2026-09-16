import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";
import { FORM_INNER_SLOT_HANDLES } from "./_form-field-handles";

/**
 * One step in a multi-step FormBuilder wizard. Self-registers with
 * the surrounding `FormWizardProvider`; inner fields render only
 * when the step is active so non-active fields don't submit early or
 * trip required-field validation.
 *
 * Drops into a FormBuilder using the `Wizard` variant — that
 * variant wraps the form body in the wizard provider. Single-step
 * forms can still use this block; without a wizard provider it
 * renders its inner fields inline like a fieldset.
 */
export const formStepRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "form-step@1",
  icon: componentIcons["form-step@1"],
  name: "form-step",
  displayName: "Form Step",
  description:
    "One step in a multi-step FormBuilder wizard. Self-registers with the wizard provider; renders inner fields only when the step is active.",

  section: { handle: "forms-section@1" },

  fields: [
    {
      name: "Legend",
      shape: "text",
      default: {
        en: "Step 1",
        ar: "الخطوة 1",
        es: "Paso 1",
        fr: "Étape 1",
        de: "Schritt 1",
        da: "Trin 1",
        ja: "ステップ 1",
        "zh-CN": "第 1 步",
        "zh-TW": "步驟 1",
        it: "Passaggio 1",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Step heading shown above the inner fields.",
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "Description",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Optional helper text shown under the step heading.",
        section: "Content",
        sortOrder: 200,
      },
    },
    {
      name: "StepLabel",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Short label shown in the stepper indicator. Defaults to the Legend.",
        section: "Content",
        sortOrder: 300,
      },
    },
  ],

  variants: [{ name: "Default" }],

  dynamicPlaceholders: true,
  placeholders: [
    {
      key: "step-fields-{*}",
      allowedRenderingHandles: [...FORM_INNER_SLOT_HANDLES],
    },
  ],

  placedIn: ["form-fields-{*}"],

  params: [],

  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: true,
    locations: [{ scope: "page", subfolder: "Form Fields/Steps" }],
  },
} satisfies ComponentTemplateRecipe;

export default formStepRecipe;
