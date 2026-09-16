import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";

/**
 * Date input for `FormBuilder`. Renders the browser's native
 * `<input type="date">` so the result participates in the parent
 * `<form>`'s FormData submit the same way every other form field
 * does — the field's `Name` field is the FormData key, the value
 * is the ISO `yyyy-MM-dd` date string the browser emits.
 *
 * Lives in the `form-fields-{*}` placeholder exposed by FormBuilder
 * (and the splitter slots) — same `placedIn` surface as the other
 * three form-field recipes so the Pages toolbox surfaces it inside
 * any FormBuilder placement.
 *
 * Min / Max bounds are surfaced as Sitecore Date fields so authors
 * pick them via the same date picker they use elsewhere. The
 * renderer coerces them to ISO `yyyy-MM-dd` strings before threading
 * them onto the native input.
 */
export const formDateFieldRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "form-date-field@1",
  icon: componentIcons["form-date-field@1"],
  name: "form-date-field",
  displayName: "Form Date Field",
  description:
    'Date input for FormBuilder. Native <input type="date"> with Min/Max bounds + Required validation. Same width / size / label-orientation axis as the other form fields.',

  section: { handle: "forms-section@1" },

  fields: [
    {
      name: "Name",
      shape: "text",
      default: "date",
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "HTML input `name` attribute and FormData key on submission. Lowercase, no spaces (e.g. 'startDate', 'birthday').",
        section: "Field",
        sortOrder: 100,
      },
    },
    {
      name: "Label",
      shape: "text",
      default: {
        en: "Date",
        ar: "التاريخ",
        es: "Fecha",
        fr: "Date",
        de: "Datum",
        da: "Dato",
        ja: "日付",
        "zh-CN": "日期",
        "zh-TW": "日期",
        it: "Data",
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
      // Boolean wrapper around the HTML `autocomplete` attribute.
      // Mirrors the other form-field recipes: `true` (default) lets
      // the browser autofill from saved values (the WAI token for
      // dates is `bday` if the field's name maps to a birthday, but
      // we default to `on` — the browser falls back to its own
      // heuristics); `false` emits `autocomplete="off"`.
      name: "AutoComplete",
      shape: "boolean",
      default: "true",
      sitecore: {
        type: "checkbox",
        hint: 'Let the browser autofill this field from saved dates (recommended). Uncheck for one-time entries like "date of incident" you don\'t want autofilled.',
        section: "Field",
        sortOrder: 500,
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
      // Min / Max dates use Sitecore Date fields. The renderer
      // coerces the Sitecore field value (an ISO date string with a
      // time component) to a bare `yyyy-MM-dd` before passing it to
      // the native input's `min` / `max` attributes.
      name: "MinDate",
      shape: "text",
      sitecore: {
        type: "date",
        hint: "Earliest allowed date. Leave blank for no lower bound.",
        section: "Validation",
        sortOrder: 100,
      },
    },
    {
      name: "MaxDate",
      shape: "text",
      sitecore: {
        type: "date",
        hint: "Latest allowed date. Leave blank for no upper bound.",
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
        hint: "Field size. Scales the label typography + input height together.",
        sortOrder: 310,
      },
    },
    {
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
    locations: [{ scope: "page", subfolder: "Form Fields/Date" }],
  },
} satisfies ComponentTemplateRecipe;

export default formDateFieldRecipe;
