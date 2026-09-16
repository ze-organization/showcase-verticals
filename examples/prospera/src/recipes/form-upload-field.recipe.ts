import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * File upload input for `FormBuilder`. Renders a styled trigger that
 * proxies to a native `<input type="file">` so the result participates
 * in the parent `<form>`'s `multipart/form-data` submit the same way
 * every other form field does — the field's `Name` field is the form
 * key, the value is the File (or FileList when `Multiple` is on).
 *
 * The browser shows the picker; the renderer surfaces the selected
 * filename(s) next to the trigger so authors get feedback without
 * relying on the (vendor-styled, hard-to-style) native chrome.
 *
 * Note: making this work in real submissions requires the parent
 * FormBuilder's `<form>` element to set `encType="multipart/form-data"`.
 * The FormBlock primitive in the registry handles that automatically
 * when an `<input type="file">` is detected in the form tree.
 */
export const formUploadFieldRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "form-upload-field@1",
  icon: componentIcons["form-upload-field@1"],
  name: "form-upload-field",
  displayName: "Form Upload Field",
  description:
    'File upload input for FormBuilder. Renders a styled trigger over a native <input type="file">. Accept filter + Multiple + Max File Size validation; same width / size / label-orientation axis as the other form fields.',

  section: { handle: "forms-section@1" },

  fields: [
    {
      name: "Name",
      shape: "text",
      default: "file",
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "HTML input `name` attribute and FormData key on submission. Lowercase, no spaces (e.g. 'resume', 'photo').",
        section: "Field",
        sortOrder: 100,
      },
    },
    {
      name: "Label",
      shape: "text",
      default: {
        en: "Upload",
        ar: "رفع",
        es: "Subir",
        fr: "Téléverser",
        de: "Hochladen",
        da: "Upload",
        ja: "アップロード",
        "zh-CN": "上传",
        "zh-TW": "上傳",
        it: "Carica",
      },
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "Visible label above the trigger.",
        section: "Field",
        sortOrder: 200,
      },
    },
    {
      name: "ButtonText",
      shape: "text",
      default: {
        en: "Choose file",
        ar: "اختر ملفًا",
        es: "Elegir archivo",
        fr: "Choisir un fichier",
        de: "Datei auswählen",
        da: "Vælg fil",
        ja: "ファイルを選択",
        "zh-CN": "选择文件",
        "zh-TW": "選擇檔案",
        it: "Scegli file",
      },
      sitecore: {
        type: "single-line-text",
        hint: 'Label inside the upload trigger button. Becomes "Choose files" automatically when Multiple is on.',
        section: "Field",
        sortOrder: 250,
      },
    },
    {
      name: "Description",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: 'Helper text shown under the trigger (e.g. "PDF only, max 5MB").',
        section: "Field",
        sortOrder: 400,
      },
    },
    {
      // Allow multiple files. Browser-side flag flipped on the
      // underlying `<input type="file" multiple>`; FormData picks
      // each File up under the same key.
      name: "Multiple",
      shape: "boolean",
      default: "false",
      sitecore: {
        type: "checkbox",
        hint: "Allow the user to pick more than one file.",
        section: "Field",
        sortOrder: 450,
      },
    },
    {
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
      // The HTML `accept` attribute. Comma-separated list of MIME
      // types (`image/png,application/pdf`) or extensions
      // (`.pdf,.docx`). Empty = any file type.
      name: "Accept",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Comma-separated MIME types (image/png,application/pdf) or extensions (.pdf,.docx). Leave blank to accept any file type.",
        section: "Validation",
        sortOrder: 100,
      },
    },
    {
      // Max file size in megabytes. The renderer enforces this
      // client-side before the submit fires; the parent FormBuilder
      // still needs server-side validation, this is just the UX
      // guard.
      name: "MaxFileSizeMB",
      shape: "integer",
      sitecore: {
        type: "integer",
        hint: "Maximum file size in megabytes. Files larger than this are rejected client-side before submit (server still needs to validate).",
        section: "Validation",
        sortOrder: 200,
      },
    },
  ],

  variants: [{ name: "Default" }],

  placedIn: [
    "form-fields-{*}",
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
      name: "Size",
      shape: "enum",
      default: "default",
      sitecore: {
        enumHandle: "size@1",
        hint: "Field size. Scales the label typography + trigger height together.",
        sortOrder: 310,
      },
    },
    {
      name: "LabelOrientation",
      shape: "enum",
      default: "stack",
      sitecore: {
        enumHandle: "label-orientation@1",
        hint: "Where the label sits relative to the trigger. Stack (above) for the standard form layout, Row (beside) for short labels, Inset (floating) for dense forms.",
        sortOrder: 320,
      },
    },
  ],

  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: true,
    locations: [{ scope: "page", subfolder: "Form Fields/Upload" }],
  },
} satisfies ComponentTemplateRecipe;

export default formUploadFieldRecipe;
