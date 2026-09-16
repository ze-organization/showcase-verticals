"use client";

import { registerCdpRecipe } from "@/lib/registry/analytics/cdp-events";
import formFieldsetArrayRecipe from "@/recipes/form-fieldset-array.recipe";

registerCdpRecipe(formFieldsetArrayRecipe);

import { useState } from "react";
import { Button } from "@/components/registry/components/ui/cta-button";
import { LibraryIcon } from "@/components/registry/primitives/core/library-icon";
import {
  RichText,
  type RichTextSource,
} from "@/components/registry/primitives/editables/richtext";
import { isEmptySource } from "@/components/registry/primitives/editables/source-normalizers";
import {
  Text,
  type TextSource,
} from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import { type CmsProps, Placeholder } from "@/lib/registry/sitecore";

/**
 * Repeating fieldset group — the "Add another email" / "Add another
 * address" pattern. Renders a template instance of an inner field
 * placeholder; "Add" duplicates the template, "Remove" tears one
 * instance back down.
 *
 * Each rendered instance gets a numeric suffix on its inner inputs'
 * names — e.g. `email_1` / `email_2` — so FormData carries every
 * value distinctly on submit. The author authors ONE template; the
 * runtime fans it out.
 *
 * Constraints:
 *   - `min` / `max` clamp the instance count.
 *   - Removing the last instance is blocked when `min === 1`.
 *   - Inner inputs MUST use the `{n}` placeholder in their `name`
 *     attribute so the suffix substitution finds them. e.g. authors
 *     drop a form-text-field with `Name = email_{n}`.
 */

export interface FormFieldsetArrayProps extends CmsProps {
  legend?: TextSource;
  description?: RichTextSource | TextSource;
  /** Label for the "Add another" button. */
  addLabel?: TextSource;
  /** Label for the "Remove" button on each instance. */
  removeLabel?: TextSource;
  /** Starting instance count. Defaults to `1`. */
  initialCount?: string | number | TextSource | NumberSource;
  /** Minimum instance count. Defaults to `1`. */
  min?: string | number | TextSource | NumberSource;
  /** Maximum instance count. Defaults to `5`. */
  max?: string | number | TextSource | NumberSource;
  /** SXA dynamic placeholder digit — matches FormBuilder's behaviour. */
  dynamicPlaceholderId?: string;
}

/** Raw layout-service number/text field shape (`{ value: 5 }`). */
type NumberSource = { value?: number | string };

// The recipe's numeric knobs are Sitecore FIELDS, so the layout
// service delivers `{ value: 5 }` objects — unwrap before parsing or
// every authored value silently falls back to the default.
function parseN(
  value: string | number | TextSource | NumberSource | undefined,
  fallback: number,
): number {
  const raw =
    typeof value === "object" && value !== null && "value" in value
      ? (value as { value?: unknown }).value
      : value;
  if (raw === undefined || raw === null || raw === "") return fallback;
  const n = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : fallback;
}

export function Default({
  legend,
  description,
  addLabel,
  removeLabel,
  initialCount,
  min,
  max,
  styles,
  id,
  isEditing,
  rendering,
  dynamicPlaceholderId,
}: FormFieldsetArrayProps) {
  const phSuffix = dynamicPlaceholderId ?? "1";
  const placeholderName = `array-fields-${phSuffix}`;
  const minN = parseN(min, 1);
  const maxN = Math.max(minN, parseN(max, 5));
  const startN = Math.min(Math.max(minN, parseN(initialCount, minN)), maxN);
  const [instances, setInstances] = useState<number[]>(() =>
    Array.from({ length: startN }, (_, i) => i + 1),
  );
  const canAdd = instances.length < maxN;
  const canRemove = instances.length > minN;
  const hasLegend = legend != null && !isEmptySource(legend);

  return (
    <fieldset
      className={cn("flex w-full basis-full flex-col gap-4", styles?.trimEnd())}
      data-slot="form-fieldset-array"
      data-count={instances.length}
      id={id || undefined}
    >
      {(hasLegend || isEditing) && (
        <legend className="px-1 font-heading font-semibold text-base">
          <Text
            value={legend}
            tag="span"
            placeholder="Group title"
            isEditing={isEditing}
          />
        </legend>
      )}
      {description ? (
        <div className="text-muted-foreground text-sm">
          <RichText
            value={description as RichTextSource}
            placeholder="Group description"
            isEditing={isEditing}
          />
        </div>
      ) : null}
      <div className="flex w-full flex-col gap-4">
        {instances.map((index) => (
          <div
            key={index}
            className="flex flex-col gap-3 rounded-md border border-border bg-muted/30 p-4"
            data-slot="form-fieldset-array-instance"
            data-instance-index={index}
          >
            <div className="flex items-center justify-between">
              <p className="font-medium text-muted-foreground text-sm">
                #{index}
              </p>
              {canRemove ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  colorScheme="destructive"
                  onClick={() =>
                    setInstances((prev) => prev.filter((n) => n !== index))
                  }
                >
                  <LibraryIcon
                    name="trash-2"
                    className="me-1 size-3.5"
                    aria-hidden
                  />
                  {addLabel == null ? "Remove" : null}
                  <Text value={removeLabel} tag="span" isEditing={isEditing} />
                </Button>
              ) : null}
            </div>
            {/*
             * Inner template placeholder. Sitecore Pages drops a fresh
             * copy of every inner field rendered into `array-fields-{*}`
             * per instance — the rendering envelope's placeholder
             * lookup is by name, so all instances render the same
             * inner template. Per-instance name uniqueness is the
             * author's responsibility (use `{n}` suffix discipline).
             */}
            {rendering ? (
              <Placeholder name={placeholderName} rendering={rendering} />
            ) : null}
          </div>
        ))}
      </div>
      <div className="flex w-full">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canAdd}
          onClick={() => {
            const nextIndex = Math.max(0, ...instances) + 1;
            setInstances((prev) => [...prev, nextIndex]);
          }}
        >
          <LibraryIcon name="plus" className="me-1 size-3.5" aria-hidden />
          {addLabel == null ? "Add another" : null}
          <Text value={addLabel} tag="span" isEditing={isEditing} />
        </Button>
      </div>
    </fieldset>
  );
}

export const FormFieldsetArray = Default;
export default Default;
export const componentType = "universal";
