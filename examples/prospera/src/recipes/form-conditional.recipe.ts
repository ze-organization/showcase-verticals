import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";
import { FORM_INNER_SLOT_HANDLES } from "./_form-field-handles";

/**
 * Conditional wrapper for FormBuilder fields. Watches a sibling
 * field's value and shows / hides the inner fields based on a
 * comparison. "If Country = US, show State."
 *
 * The hidden branch is unmounted at runtime so its inputs DON'T
 * submit when invisible — important for payload cleanliness AND for
 * required-field validation (hidden required fields would otherwise
 * block submit).
 */
export const formConditionalRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "form-conditional@1",
  icon: componentIcons["form-conditional@1"],
  name: "form-conditional",
  displayName: "Form Conditional",
  description:
    "Conditional wrapper. Shows or hides inner form fields based on a sibling field's value (equals / not-equals / contains / is-set / is-empty).",

  section: { handle: "forms-section@1" },

  fields: [
    {
      name: "Watch",
      shape: "text",
      default: "country",
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "The `name` attribute of the sibling field whose value drives the visibility check. Must match exactly (case-sensitive).",
        section: "Condition",
        sortOrder: 100,
      },
    },
    {
      name: "Value",
      shape: "text",
      default: "US",
      sitecore: {
        type: "single-line-text",
        hint: "Comparison value. Ignored by `is-set` / `is-empty`. For `contains`, accepts a comma-separated list (true if ANY substring matches).",
        section: "Condition",
        sortOrder: 200,
      },
    },
  ],

  variants: [{ name: "Default" }],

  placedIn: [
    "form-fields-{*}",
    "fieldset-fields-{*}",
    "column-1-{*}",
    "column-2-{*}",
    "column-3-{*}",
    "column-4-{*}",
  ],

  dynamicPlaceholders: true,
  placeholders: [
    {
      key: "conditional-fields-{*}",
      allowedRenderingHandles: [...FORM_INNER_SLOT_HANDLES],
    },
  ],

  params: [
    {
      name: "Operator",
      shape: "enum",
      default: "equals",
      sitecore: {
        enumHandle: "conditional-operator@1",
        hint: "Comparison operator. equals / not-equals / contains compare against `Value`; is-set / is-empty ignore it.",
        sortOrder: 100,
      },
    },
  ],

  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: true,
    locations: [{ scope: "page", subfolder: "Form Fields/Conditional" }],
  },
} satisfies ComponentTemplateRecipe;

export default formConditionalRecipe;
