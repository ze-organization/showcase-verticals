import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Recipe for `LeadFormField` — the leaf datasource item for the
 * `lead-form@1` family. Recipe-only (no rendering of its own, like
 * `versus-item@1`): the parent `lead-form` reads these via its
 * `Fields` Treelist and renders each as a labelled display-only input
 * placeholder.
 */
export const leadFormFieldRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "lead-form-field@1",
  icon: componentIcons["lead-form-field@1"],
  name: "lead-form-field",
  displayName: "Lead Form Field",
  description:
    "Single input placeholder for the lead-form family: a label, placeholder text, an input type (text/email/tel/number/date/select/textarea), and a required marker. Presentational — the input is display-only.",
  section: { handle: "forms-section@1" },
  fields: [
    {
      name: "Label",
      shape: "text",
      default: {
        en: "Email address",
        ar: "البريد الإلكتروني",
        es: "Correo electrónico",
        fr: "Adresse e-mail",
        de: "E-Mail-Adresse",
        da: "E-mailadresse",
        ja: "メールアドレス",
        "zh-CN": "电子邮箱",
        "zh-TW": "電子郵箱",
        it: "Indirizzo e-mail",
      },
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "Label shown above the input.",
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "Placeholder",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Placeholder text inside the input. For `select` fields this doubles as the visible prompt option.",
        section: "Content",
        sortOrder: 200,
      },
    },
    {
      name: "FieldType",
      shape: "enum",
      default: "text",
      values: ["text", "email", "tel", "number", "date", "select", "textarea"],
      sitecore: {
        type: "droplist",
        hint: "Input type the placeholder renders as. `select` and `textarea` span the full form width.",
        section: "Content",
        sortOrder: 300,
      },
    },
    {
      name: "Required",
      shape: "boolean",
      default: "false",
      sitecore: {
        type: "checkbox",
        hint: "Render a required marker (*) next to the label. Presentational only — nothing is validated or submitted.",
        section: "Content",
        sortOrder: 400,
      },
    },
  ],
  variants: [{ name: "Default" }],
} satisfies ComponentTemplateRecipe;

export default leadFormFieldRecipe;
