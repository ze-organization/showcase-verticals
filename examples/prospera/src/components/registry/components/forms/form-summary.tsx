"use client";

import { registerCdpRecipe } from "@/lib/registry/analytics/cdp-events";
import formSummaryRecipe from "@/recipes/form-summary.recipe";

registerCdpRecipe(formSummaryRecipe);

import { getSourceText } from "@/components/registry/primitives/editables/source-normalizers";
import {
  Text,
  type TextSource,
} from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import { useFormBuilderContext } from "@/lib/registry/forms/form-context";
import type { CmsProps } from "@/lib/registry/sitecore";

/**
 * Live values readout for a parent FormBuilder. Shows a configurable
 * subset of the form's fields as a "running summary" — useful for
 * quote builders, pricing calculators, and any multi-step form where
 * users want to see what they've answered so far.
 *
 * Reads from the FormBuilderProvider context (must be a descendant).
 * The `fields` prop is a comma-separated list of field names to
 * surface; each name pulls its current value from the live values
 * map registered via `useRegisterFormValue`.
 *
 * Fields whose React component doesn't register their value won't
 * appear here. The standard form-X-fields auto-register via their
 * native input change events.
 */

export interface FormSummaryProps extends CmsProps {
  title?: TextSource;
  /**
   * Comma-separated list of field names to surface. Defaults to all
   * registered fields. Pass an explicit list to control display order
   * and limit the summary to a subset.
   */
  fields?: TextSource;
  /**
   * Optional total field — the name of a field whose value should
   * render in the largest type at the bottom of the summary (e.g.
   * `quote_total` from a calculator).
   */
  totalField?: TextSource;
  /** Label shown above the total value. Defaults to `Total`. */
  totalLabel?: TextSource;
}

function formatLabel(name: string): string {
  // camelCase / snake_case → Title Case
  return name
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^\w/, (c) => c.toUpperCase());
}

function renderValue(value: unknown): string {
  if (value == null || value === "") return "—";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return "—";
    }
  }
  return String(value);
}

export function Default({
  title,
  fields,
  totalField,
  totalLabel,
  styles,
  id,
  isEditing,
}: FormSummaryProps) {
  const { values } = useFormBuilderContext();
  const titleText = getSourceText(title) || "Summary";
  const fieldsList = (getSourceText(fields) ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const totalName = getSourceText(totalField) ?? "";
  const totalLabelText = getSourceText(totalLabel) || "Total";

  // When `fields` is empty, surface every registered value (excluding
  // the total, since it gets its own slot).
  const displayNames =
    fieldsList.length > 0
      ? fieldsList
      : Object.keys(values).filter((k) => k !== totalName);

  const totalValue = totalName ? values[totalName] : undefined;

  return (
    <aside
      className={cn(
        "flex w-full basis-full flex-col gap-3 rounded-lg border border-border bg-muted/30 p-4 md:p-6",
        styles?.trimEnd(),
      )}
      data-slot="form-summary"
      id={id || undefined}
      aria-label={titleText}
    >
      <h3 className="font-heading font-semibold text-base">
        <Text
          value={title}
          tag="span"
          placeholder="Summary title"
          isEditing={isEditing}
        />
      </h3>
      {displayNames.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Fill out the form to see a summary here.
        </p>
      ) : (
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          {displayNames.map((name) => (
            <div key={name} className="contents">
              <dt className="text-muted-foreground">{formatLabel(name)}</dt>
              <dd className="font-medium">{renderValue(values[name])}</dd>
            </div>
          ))}
        </dl>
      )}
      {totalName ? (
        <div
          className="mt-3 flex items-baseline justify-between border-border border-t pt-3"
          data-slot="form-summary-total"
        >
          <span className="font-medium text-sm">{totalLabelText}</span>
          <span className="font-heading font-semibold text-2xl tabular-nums">
            {renderValue(totalValue)}
          </span>
        </div>
      ) : null}
    </aside>
  );
}

export const FormSummary = Default;
export default Default;
export const componentType = "universal";
