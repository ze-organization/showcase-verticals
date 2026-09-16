import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";
import { FORM_INNER_SLOT_HANDLES } from "./_form-field-handles";

/**
 * Semantic grouping for related FormBuilder fields. Renders a
 * `<fieldset>` with a `<legend>` so AT users hear the group name
 * before the inner fields — WCAG 1.3.1 grouped-fields requirement.
 *
 * Drops into the FormBuilder's `form-fields-{*}` placeholder. Inner
 * fields drop into the fieldset's own `fieldset-fields-{*}`
 * placeholder.
 */
export const formFieldsetRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "form-fieldset@1",
  icon: componentIcons["form-fieldset@1"],
  name: "form-fieldset",
  displayName: "Form Fieldset",
  description:
    "Semantic grouping for FormBuilder fields (fieldset + legend). Breaks long forms into logical sections (Contact info / Mailing address / Marketing preferences) with proper a11y semantics.",

  section: { handle: "forms-section@1" },

  fields: [
    {
      name: "Legend",
      shape: "text",
      default: {
        en: "Contact information",
        ar: "معلومات الاتصال",
        es: "Información de contacto",
        fr: "Coordonnées",
        de: "Kontaktinformationen",
        da: "Kontaktoplysninger",
        ja: "連絡先情報",
        "zh-CN": "联系信息",
        "zh-TW": "聯絡資訊",
        it: "Informazioni di contatto",
      },
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "Group heading rendered as a semantic `<legend>` so screen readers announce it before the inner fields.",
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "Description",
      shape: "richText",
      sitecore: {
        type: "rich-text",
        hint: "Optional descriptive copy shown below the legend.",
        section: "Content",
        sortOrder: 200,
      },
    },
  ],

  variants: [{ name: "Default" }],

  dynamicPlaceholders: true,
  placeholders: [
    {
      key: "fieldset-fields-{*}",
      allowedRenderingHandles: [...FORM_INNER_SLOT_HANDLES],
    },
  ],

  placedIn: [
    "form-fields-{*}",
    // Allow fieldsets to nest inside splitter slots too — so a
    // 2-column layout can contain a "Contact info" fieldset in one
    // column and "Mailing address" in the other.
    "column-1-{*}",
    "column-2-{*}",
    "column-3-{*}",
    "column-4-{*}",
  ],

  params: [
    {
      name: "Variant",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "form-fieldset-variant@1",
        hint: "Visual treatment. `default` is heading-only (no border); `bordered` wraps the group in a thin bordered card; `card` uses a soft muted background.",
        sortOrder: 100,
      },
    },
    {
      name: "Gap",
      shape: "enum",
      default: "md",
      sitecore: {
        enumHandle: "gap@1",
        hint: "Spacing between the heading and the inner fields.",
        sortOrder: 200,
      },
    },
  ],

  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [{ scope: "page", subfolder: "Form Fields/Fieldsets" }],
  },
} satisfies ComponentTemplateRecipe;

export default formFieldsetRecipe;
