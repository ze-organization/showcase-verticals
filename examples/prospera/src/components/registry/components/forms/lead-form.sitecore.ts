/**
 * Sitecore adapter for `lead-form`. Unwraps the Sitecore
 * `{ fields, params }` payload into the flat props the React rendering
 * consumes, and normalises the curated `Fields` Treelist (flattened by
 * the component map) into `LeadFormField[]`.
 *
 * The same adapter fans out to every variant export (Default / Split)
 * so `withSitecore` applies it uniformly — mirrors the pattern in
 * `versus-list.sitecore.ts`.
 */
import type { TextSource } from "@/components/registry/primitives/editables/text";
import {
  isSurfaceTone,
  type SurfaceTone,
} from "@/lib/registry/color-scheme-classes";
import { parseSectionPaddingY } from "@/lib/registry/section-surface";
import type { Field } from "@/lib/registry/sitecore";
import type {
  LeadFormField,
  LeadFormFieldType,
  LeadFormPanelStyle,
  LeadFormProps,
} from "./lead-form";

interface SitecoreLeadFormField {
  id: string;
  url?: string;
  fields?: {
    Label?: TextSource;
    Placeholder?: TextSource;
    FieldType?: Field<string>;
    Required?: Field<boolean | string>;
  };
}

interface SitecoreLeadFormFields {
  Title?: TextSource;
  Lead?: TextSource;
  Fields?: SitecoreLeadFormField[];
  SubmitLabel?: TextSource;
  Note?: TextSource;
}

interface SitecoreLeadFormParams {
  ColorScheme?: string;
  PanelStyle?: string;
  PaddingY?: string;
  RenderingIdentifier?: string;
  styles?: string;
}

const FIELD_TYPES: readonly LeadFormFieldType[] = [
  "text",
  "email",
  "tel",
  "number",
  "date",
  "select",
  "textarea",
];

function toFieldType(field: Field<string> | undefined): LeadFormFieldType {
  const raw = field?.value?.trim().toLowerCase() as
    | LeadFormFieldType
    | undefined;
  return raw && FIELD_TYPES.includes(raw) ? raw : "text";
}

const toSurfaceTone = (value: string | undefined): SurfaceTone => {
  const raw = value?.trim().toLowerCase() ?? "";
  return isSurfaceTone(raw) ? raw : "none";
};

const toPanelStyle = (value: string | undefined): LeadFormPanelStyle =>
  value?.trim().toLowerCase() === "flat" ? "flat" : "card";

const toRequired = (field: Field<boolean | string> | undefined): boolean =>
  field?.value === true || field?.value === "1" || field?.value === "true";

function adaptFields(
  fields: SitecoreLeadFormField[] | undefined,
): LeadFormField[] {
  if (!fields?.length) return [];
  return fields.map((field, i) => ({
    id: field.id ?? `lead-field-${i}`,
    label: field.fields?.Label,
    placeholder: field.fields?.Placeholder,
    fieldType: toFieldType(field.fields?.FieldType),
    required: toRequired(field.fields?.Required),
  }));
}

export function adaptLeadFormProps({
  fields,
  params,
}: {
  fields?: SitecoreLeadFormFields;
  params?: SitecoreLeadFormParams;
}): LeadFormProps {
  return {
    title: fields?.Title,
    lead: fields?.Lead,
    fields: adaptFields(fields?.Fields),
    submitLabel: fields?.SubmitLabel,
    note: fields?.Note,
    surfaceTone: toSurfaceTone(params?.ColorScheme),
    panelStyle: toPanelStyle(params?.PanelStyle),
    paddingY: parseSectionPaddingY(params?.PaddingY),
    id: params?.RenderingIdentifier,
    styles: params?.styles,
  };
}

export const Default = adaptLeadFormProps;
export const Split = adaptLeadFormProps;
// EVERY variant needs an adapter entry. A variant missing here falls
// back to the convention map, whose raw-envelope passthrough spreads
// `fields` (the whole `{ Title, Fields, … }` object) AFTER the
// camelCased `fields` array — so the component received an object and
// `fields.map` threw, taking the Pages editing canvas down when the
// variant was placed. That was HeroEmbed's fate before this line.
export const HeroEmbed = adaptLeadFormProps;
