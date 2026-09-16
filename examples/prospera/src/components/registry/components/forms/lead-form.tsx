import { useId } from "react";
import { Button } from "@/components/registry/components/ui/cta-button";
import {
  TypographyH2,
  TypographyMuted,
} from "@/components/registry/primitives/core/typography";
import { getSourceText } from "@/components/registry/primitives/editables/source-normalizers";
import {
  Text,
  type TextSource,
} from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import {
  type SurfaceTone,
  surfaceToneClass,
} from "@/lib/registry/color-scheme-classes";
import {
  SECTION_PADDING_Y_CLASSES,
  type SectionPaddingY,
} from "@/lib/registry/section-surface";
import type { CmsProps } from "@/lib/registry/sitecore";

/**
 * `lead-form` — a lead / quote capture form section.
 *
 * Headline + supporting copy + a short stack of labelled input
 * placeholders + a submit CTA + an optional small-print note. The
 * fields are curated via the `Fields` Treelist (`lead-form-field@1`)
 * so authors model "First name / Email / ZIP code" style capture
 * forms without the full form-builder machinery.
 *
 * **Presentational by design**: the inputs are display-only
 * (uncontrolled, nothing is submitted) and the CTA is a plain button.
 * Wiring the capture to a real endpoint is a downstream concern — for
 * a working multi-step form use `form-builder@1`; for email-only
 * capture use `subscribe-section@1` / `subscription-banner@1`.
 *
 * Two rendering shapes share one form body:
 *   - `Default` → centered column: heading above, form panel below.
 *   - `Split`   → headline + copy in the start column, form panel in
 *                 the end column (the insurance-quote archetype).
 */

export type LeadFormFieldType =
  | "text"
  | "email"
  | "tel"
  | "number"
  | "date"
  | "select"
  | "textarea";

export interface LeadFormField {
  id?: string;
  /** Label above the input. */
  label?: TextSource;
  /** Placeholder text inside the input. */
  placeholder?: TextSource;
  /** Input affordance the placeholder renders as. */
  fieldType?: LeadFormFieldType;
  /** Render a required marker (*) next to the label. */
  required?: boolean;
}

export type LeadFormPanelStyle = "card" | "flat";

export interface LeadFormProps extends CmsProps {
  title?: TextSource;
  /** Supporting copy under the title. */
  lead?: TextSource;
  fields?: LeadFormField[];
  /** Submit CTA label. */
  submitLabel?: TextSource;
  /** Small print under the CTA (privacy / no-spam note). */
  note?: TextSource;
  /** Background tone of the section. */
  surfaceTone?: SurfaceTone;
  /** Chrome around the form (`panel-style@1`): bordered card or flat. */
  panelStyle?: LeadFormPanelStyle;
  /** Vertical padding around the section (`padding-y@1`). */
  paddingY?: SectionPaddingY;
  className?: string;
}

const INPUT_CLASS =
  "w-full rounded-md border border-border bg-background/80 px-3 py-2.5 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";

/** Field types that span the full form width. */
const FULL_WIDTH_TYPES: readonly LeadFormFieldType[] = ["textarea", "select"];

function FieldShell({
  field,
  isEditing,
  inline = false,
}: {
  field: LeadFormField;
  isEditing?: boolean;
  /**
   * Inline quote-bar mode (`HeroEmbed`): every field keeps a single
   * column so selects sit beside the other inputs instead of spanning
   * the full row.
   */
  inline?: boolean;
}) {
  const inputId = useId();
  const fieldType = field.fieldType ?? "text";
  const placeholderText = getSourceText(field.placeholder) ?? "";
  const fullWidth = !inline && FULL_WIDTH_TYPES.includes(fieldType);
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-1",
        fullWidth && "sm:col-span-2",
      )}
      data-field-type={fieldType}
    >
      <label htmlFor={inputId} className="font-medium text-current/80 text-sm">
        <Text
          value={field.label}
          tag="span"
          isEditing={isEditing}
          placeholder="Label"
        />
        {field.required ? (
          <span aria-hidden="true" className="ms-0.5 text-destructive">
            *
          </span>
        ) : null}
      </label>
      {fieldType === "textarea" ? (
        <textarea
          id={inputId}
          rows={3}
          placeholder={placeholderText}
          className={cn(INPUT_CLASS, "resize-none")}
        />
      ) : fieldType === "select" ? (
        <select id={inputId} className={INPUT_CLASS} defaultValue="">
          <option value="" disabled>
            {placeholderText || getSourceText(field.label) || "Select…"}
          </option>
        </select>
      ) : (
        <input
          id={inputId}
          type={fieldType}
          placeholder={placeholderText}
          className={INPUT_CLASS}
        />
      )}
    </div>
  );
}

function LeadFormPanel({
  fields = [],
  submitLabel,
  note,
  panelStyle = "card",
  isEditing,
}: Pick<
  LeadFormProps,
  "fields" | "submitLabel" | "note" | "panelStyle" | "isEditing"
>) {
  const hasNote = note && getSourceText(note);
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-5",
        panelStyle === "card" &&
          "rounded-(--card-radius,var(--radius-xl)) border border-border bg-card p-6 text-card-foreground shadow-sm md:p-8",
      )}
      data-slot="lead-form-panel"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((field, i) => (
          <FieldShell
            key={field.id ?? `lead-field-${i}`}
            field={field}
            isEditing={isEditing}
          />
        ))}
      </div>
      <Button type="button" size="lg" className="w-full">
        <Text
          value={submitLabel}
          tag="span"
          isEditing={isEditing}
          placeholder="Submit"
        />
      </Button>
      {hasNote ? (
        <p className="text-muted-foreground text-xs">
          <Text value={note} tag="span" isEditing={isEditing} />
        </p>
      ) : null}
    </div>
  );
}

function Heading({
  title,
  lead,
  isEditing,
}: Pick<LeadFormProps, "title" | "lead" | "isEditing">) {
  return (
    <div className="flex flex-col gap-3">
      <TypographyH2 className="font-heading tracking-tight">
        <Text
          value={title}
          tag="span"
          isEditing={isEditing}
          placeholder="Title"
        />
      </TypographyH2>
      {lead && getSourceText(lead) ? (
        <TypographyMuted className="text-pretty text-lg">
          <Text value={lead} tag="span" isEditing={isEditing} />
        </TypographyMuted>
      ) : null}
    </div>
  );
}

function LeadFormSection({
  surfaceTone = "none",
  paddingY = "auto",
  id,
  styles,
  className,
  children,
}: Pick<
  LeadFormProps,
  "surfaceTone" | "paddingY" | "id" | "styles" | "className"
> & {
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "component lead-form w-full",
        // `auto` (recipe default) → the section's natural responsive
        // ramp; a concrete token takes over.
        paddingY === "auto"
          ? "py-12 md:py-16"
          : SECTION_PADDING_Y_CLASSES[paddingY],
        surfaceToneClass(surfaceTone),
        className,
        styles?.trimEnd(),
      )}
      id={id ?? undefined}
      data-slot="lead-form"
    >
      {children}
    </section>
  );
}

/** Centered column — heading above, form panel below. */
export function Default({
  title,
  lead,
  fields = [],
  submitLabel,
  note,
  surfaceTone,
  panelStyle,
  paddingY,
  className,
  id,
  styles,
  isEditing,
}: LeadFormProps) {
  return (
    <LeadFormSection
      surfaceTone={surfaceTone}
      paddingY={paddingY}
      id={id}
      styles={styles}
      className={className}
    >
      <div className="container mx-auto flex max-w-2xl flex-col gap-8 px-4">
        <Heading title={title} lead={lead} isEditing={isEditing} />
        <LeadFormPanel
          fields={fields}
          submitLabel={submitLabel}
          note={note}
          panelStyle={panelStyle}
          isEditing={isEditing}
        />
      </div>
    </LeadFormSection>
  );
}

/** Headline + copy in the start column, form panel in the end column. */
export function Split({
  title,
  lead,
  fields = [],
  submitLabel,
  note,
  surfaceTone,
  panelStyle,
  paddingY,
  className,
  id,
  styles,
  isEditing,
}: LeadFormProps) {
  return (
    <LeadFormSection
      surfaceTone={surfaceTone}
      paddingY={paddingY}
      id={id}
      styles={styles}
      className={className}
    >
      <div className="container mx-auto grid grid-cols-1 items-center gap-10 px-4 lg:grid-cols-2 lg:gap-16">
        <Heading title={title} lead={lead} isEditing={isEditing} />
        <LeadFormPanel
          fields={fields}
          submitLabel={submitLabel}
          note={note}
          panelStyle={panelStyle}
          isEditing={isEditing}
        />
      </div>
    </LeadFormSection>
  );
}

/**
 * `HeroEmbed` — the conversion-hero pattern (nationwide / allstate /
 * rocketmortgage quote widgets, ketelone's hero search panel): place a
 * `hero@1` as the section above, then this rendering directly after
 * it. The compact capture panel pulls itself up over the hero's
 * bottom edge with a negative top margin — the same self-contained
 * overlap shell as travel-search's `HeroEmbed`, so nothing couples to
 * the hero component — and renders on a translucent blurred panel.
 * Fields flow as an inline quote bar on desktop (each field one
 * column, CTA at the end) and stack on mobile.
 */
export function HeroEmbed({
  title,
  lead,
  fields = [],
  submitLabel,
  note,
  className,
  id,
  styles,
  isEditing,
}: LeadFormProps) {
  const hasLead = lead && getSourceText(lead);
  const hasNote = note && getSourceText(note);
  return (
    <section
      className={cn(
        "component lead-form relative z-10 w-full",
        className,
        styles?.trimEnd(),
      )}
      id={id ?? undefined}
      data-slot="lead-form"
    >
      <div className="container mx-auto -mt-16 max-w-5xl px-4 md:-mt-20">
        <div
          className="flex flex-col gap-5 rounded-(--card-radius,var(--radius-xl)) border border-white/20 bg-background/85 p-6 shadow-2xl backdrop-blur-md md:p-8"
          data-slot="lead-form-panel"
        >
          <div className="flex flex-col gap-1.5">
            <h2 className="font-heading text-2xl tracking-tight">
              <Text
                value={title}
                tag="span"
                isEditing={isEditing}
                placeholder="Title"
              />
            </h2>
            {hasLead ? (
              <p className="text-muted-foreground text-sm">
                <Text value={lead} tag="span" isEditing={isEditing} />
              </p>
            ) : null}
          </div>
          <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {fields.map((field, i) => (
              <FieldShell
                key={field.id ?? `lead-field-${i}`}
                field={field}
                isEditing={isEditing}
                inline
              />
            ))}
            <Button type="button" size="lg" className="w-full">
              <Text
                value={submitLabel}
                tag="span"
                isEditing={isEditing}
                placeholder="Submit"
              />
            </Button>
          </div>
          {hasNote ? (
            <p className="text-muted-foreground text-xs">
              <Text value={note} tag="span" isEditing={isEditing} />
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/**
 * `universal` opts this file into BOTH the server and client component
 * maps the SDK generates, so Sitecore Pages chrome (browser-side) can
 * resolve the named-export variants. Purely a generate-map signal.
 */
export const componentType = "universal";
