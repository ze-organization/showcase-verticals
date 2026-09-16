/**
 * Shared Placeholder Settings allow-lists for FormBuilder slots.
 *
 * Nested picker Allowed Controls come from `placeholders[].allowedRenderingHandles`.
 * Keep this module as `_*.ts` (not `*.recipe.ts`) so scai does not compile it
 * as a component.
 */

/** Leaf fields + layout splitters. Safe in every form slot. */
export const FORM_LEAF_FIELD_HANDLES = [
  "form-text-field@1",
  "form-textarea-field@1",
  "form-checkbox-field@1",
  "form-select-field@1",
  "form-date-field@1",
  "form-upload-field@1",
  "form-phone-field@1",
  "form-range-field@1",
  "form-address-field@1",
  "form-rating-field@1",
  "row-splitter@1",
  "column-splitter@1",
] as const;

/** Composed chrome that belongs in the top-level form slot. */
export const FORM_COMPOSITION_HANDLES = [
  "form-step@1",
  "form-fieldset@1",
  "form-fieldset-array@1",
  "form-conditional@1",
  "form-summary@1",
] as const;

export const FORM_FIELDS_SLOT_HANDLES = [
  ...FORM_LEAF_FIELD_HANDLES,
  ...FORM_COMPOSITION_HANDLES,
] as const;

/** Inner slots: same leaves + nested fieldset/conditional/array/summary. No form-step@1 (steps do not nest). */
export const FORM_INNER_SLOT_HANDLES = [
  ...FORM_LEAF_FIELD_HANDLES,
  "form-fieldset@1",
  "form-fieldset-array@1",
  "form-conditional@1",
  "form-summary@1",
] as const;
