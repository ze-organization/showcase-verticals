"use client";

import { registerCdpRecipe } from "@/lib/registry/analytics/cdp-events";
import formConditionalRecipe from "@/recipes/form-conditional.recipe";

registerCdpRecipe(formConditionalRecipe);

import type { ReactNode } from "react";
import { getSourceText } from "@/components/registry/primitives/editables/source-normalizers";
import type { TextSource } from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import { useFormFieldValue } from "@/lib/registry/forms/form-context";
import { type CmsProps, Placeholder } from "@/lib/registry/sitecore";

/**
 * Conditional wrapper for FormBuilder fields. Watches a sibling
 * field's value and toggles the inner fields' visibility based on a
 * comparison. Use when "If Country = US, show State" — without
 * forking the FormBuilder rendering.
 *
 * Conditions are kept simple intentionally — `equals` / `contains` /
 * `is-set`. Anything fancier (multi-condition logic, nested branches)
 * is out of scope for this primitive; nest multiple
 * `<FormConditional>` wrappers if you need AND/OR.
 *
 * The hidden branch is unmounted (not just `display: none`) so its
 * inputs DON'T submit when invisible — important for form payload
 * cleanliness AND for required-field validation.
 */

export type ConditionalOperator =
  | "equals"
  | "not-equals"
  | "contains"
  | "is-set"
  | "is-empty";

export interface FormConditionalProps extends CmsProps {
  /**
   * The `name` of the sibling field whose value drives the
   * conditional render. Must match the input's `name` attribute
   * exactly (case-sensitive). Accepts the raw layout-service field
   * shape (`{ value: "…" }`) — the recipe's `Watch` is a Sitecore
   * TEXT FIELD, so the convention map delivers an object, not a
   * plain string.
   */
  watch?: TextSource;
  /** Operator. */
  operator?: ConditionalOperator;
  /**
   * Comparison value (operator-dependent). For `contains`, accepts
   * comma-separated list — true if ANY substring matches. Ignored by
   * `is-set` / `is-empty`. Same field-shape tolerance as `watch` —
   * `compare.split(",")` on the raw `{ value }` object crashed the
   * editing canvas whenever `operator="contains"` was picked.
   */
  value?: TextSource;
  /** SXA dynamic placeholder digit — matches FormBuilder's behaviour. */
  dynamicPlaceholderId?: string;
  /**
   * Non-Sitecore escape hatch — when no `rendering` envelope is
   * available, the children are rendered when the condition matches.
   * Lets the showcase / standalone consumers compose a conditional
   * without authoring a fake rendering tree.
   */
  children?: ReactNode;
}

function coerceToString(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  if (Array.isArray(value)) return value.join(",");
  return "";
}

function evaluate(
  operator: ConditionalOperator,
  watched: unknown,
  compare: string,
): boolean {
  const text = coerceToString(watched);
  switch (operator) {
    case "equals":
      return text === compare;
    case "not-equals":
      return text !== compare;
    case "contains":
      return compare
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .some((part) => text.includes(part));
    case "is-set":
      return text.trim() !== "";
    case "is-empty":
      return text.trim() === "";
    default:
      return false;
  }
}

export function Default({
  watch,
  operator = "equals",
  value: compareValue,
  styles,
  id,
  isEditing,
  rendering,
  dynamicPlaceholderId,
  children,
}: FormConditionalProps) {
  // Normalize the field-shaped inputs to plain strings before any
  // string ops — see the prop docs: both arrive as `{ value }` objects
  // through the convention map.
  const watchName = getSourceText(watch);
  const compareText = getSourceText(compareValue) ?? "";
  const watched = useFormFieldValue(watchName);
  const shouldShow = watchName
    ? evaluate(operator, watched, compareText)
    : true;

  // In editing mode always render the inner slot so authors can edit
  // its content — the runtime gate only fires for actual visitors.
  if (!isEditing && !shouldShow) {
    return (
      <div
        className="hidden"
        aria-hidden="true"
        data-slot="form-conditional"
        data-active="false"
      />
    );
  }

  const phSuffix = dynamicPlaceholderId ?? "1";
  const placeholderName = `conditional-fields-${phSuffix}`;

  return (
    <div
      className={cn(
        "flex w-full basis-full flex-wrap gap-6",
        styles?.trimEnd(),
      )}
      data-slot="form-conditional"
      data-active={shouldShow ? "true" : "false"}
      data-watch={watchName || undefined}
      id={id || undefined}
    >
      {rendering ? (
        <Placeholder name={placeholderName} rendering={rendering} />
      ) : (
        children
      )}
    </div>
  );
}

export const FormConditional = Default;
export default Default;
export const componentType = "universal";
