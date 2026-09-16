"use client";

import { useId, useMemo, useState } from "react";
import {
  FormFieldShell,
  type FormFieldSize,
  type FormFieldWidth,
  type FormLabelOrientation,
  ORIENTATION_FIELD_CLASSES,
  ORIENTATION_INSET_INPUT_CLASSES,
  placeholderMinWidth,
  SIZE_INPUT_CLASSES,
  SIZE_LABEL_CLASSES,
  WIDTH_GRID_CLASSES,
} from "@/components/registry/blocks/form-field-shell";
import { Button } from "@/components/registry/primitives/core/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/registry/primitives/core/command";
import { Field, FieldLabel } from "@/components/registry/primitives/core/field";
import { LibraryIcon } from "@/components/registry/primitives/core/library-icon";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/registry/primitives/core/popover";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/registry/primitives/core/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/registry/primitives/core/select";
import { getSourceText } from "@/components/registry/primitives/editables/source-normalizers";
import type { TextSource } from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import type { CmsProps, TextField } from "@/lib/registry/sitecore";

/**
 * Resolved shape of a single FormOption Treelist entry as it arrives
 * from the Sitecore layout service. Each item carries its `Label` and
 * `Value` text fields.
 */
export interface FormOptionItem {
  id?: string;
  name?: string;
  fields?: {
    Label?: TextField;
    Value?: TextField;
  };
}

export interface FormSelectFieldFields {
  Name?: TextSource;
  Label?: TextSource;
  Placeholder?: TextSource;
  Description?: TextSource;
  Options?: FormOptionItem[];
}

export interface FormSelectFieldProps extends CmsProps {
  name?: TextSource;
  label?: TextSource;
  placeholder?: TextSource;
  description?: TextSource;
  options?: FormOptionItem[];
  required?: string | boolean;
  multiple?: string | boolean;
  defaultValue?: TextSource;
  width?: FormFieldWidth;
  size?: FormFieldSize;
  labelOrientation?: FormLabelOrientation;
  /**
   * Render the picker's popover already open. Author/preview seam only —
   * the interior is Radix-portalled and absent from the DOM until a
   * gesture opens it, so a static preview paints a bare trigger and the
   * options list can never be seen or measured.
   */
  defaultOpen?: boolean;
}

function isEnabled(value: string | boolean | TextSource | undefined): boolean {
  if (typeof value === "boolean") return value;
  if (value == null) return false;
  const raw =
    typeof value === "object" && "value" in value
      ? (value as { value?: unknown }).value
      : value;
  if (typeof raw === "boolean") return raw;
  if (typeof raw !== "string") return false;
  const normalized = raw.trim().toLowerCase();
  return ["1", "true", "yes", "on", "enabled"].includes(normalized);
}

interface ResolvedOption {
  value: string;
  label: string;
}

/**
 * Normalize a Treelist option entry. Falls back to the item's `name`
 * when the author hasn't typed a `Value` so quick lists still submit
 * something meaningful.
 */
function resolveOption(item: FormOptionItem): ResolvedOption | undefined {
  const label = item.fields?.Label?.value?.trim() || item.name?.trim();
  if (!label) return undefined;
  const value = item.fields?.Value?.value?.trim() || label;
  return { value, label };
}

function parseDefaultValues(source: TextSource | undefined): string[] {
  const text = getSourceText(source);
  if (!text) return [];
  return text
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function useResolvedSelectState(props: FormSelectFieldProps) {
  const fieldId = useId();
  const {
    name,
    label,
    placeholder,
    description,
    options = [],
    required,
    defaultValue,
    width = "full",
    size = "default",
    labelOrientation = "stack",
    styles,
    id,
  } = props;

  const nameText = getSourceText(name) || "field";
  const labelText = getSourceText(label) || "Field";
  const placeholderText = getSourceText(placeholder) || "Select an option";
  const descriptionText = getSourceText(description) || undefined;
  const isRequired = isEnabled(required);
  const descId = descriptionText ? `${fieldId}-desc` : undefined;
  const resolvedOptions = useMemo(
    () =>
      options.map(resolveOption).filter((o): o is ResolvedOption => o != null),
    [options],
  );
  const defaults = useMemo(
    () => parseDefaultValues(defaultValue),
    [defaultValue],
  );

  return {
    fieldId,
    nameText,
    labelText,
    placeholderText,
    descriptionText,
    isRequired,
    descId,
    resolvedOptions,
    defaults,
    width,
    size,
    labelOrientation,
    styles,
    id,
  };
}

/**
 * Multi-select trigger summary. Renders the selected option labels as
 * a comma-joined list (or the placeholder when nothing is picked).
 * Pulled out of the render so the trigger logic stays scannable.
 */
function multiselectSummary(
  selected: string[],
  options: ResolvedOption[],
  placeholder: string,
): string {
  if (selected.length === 0) return placeholder;
  const labels = selected.map(
    (value) => options.find((o) => o.value === value)?.label ?? value,
  );
  return labels.join(", ");
}

/**
 * Multi-select branch — Popover + Command + checkbox-row pattern (the
 * same shape as the combobox primitive's `ComboboxWithCheckbox`). One
 * hidden `<input>` per selected value carries the field name so native
 * form submission flattens to `name=v1&name=v2&...` exactly like a
 * `<select multiple>` would.
 */
function MultiSelectField({
  inputId,
  descId,
  isInset,
  nameText,
  isRequired,
  placeholderText,
  resolvedOptions,
  defaults,
  size,
  defaultOpen,
}: {
  inputId: string;
  descId?: string;
  isInset: boolean;
  nameText: string;
  isRequired: boolean;
  placeholderText: string;
  resolvedOptions: ResolvedOption[];
  defaults: string[];
  size: FormFieldSize;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const [selected, setSelected] = useState<string[]>(defaults);
  const contentId = useId();
  const toggle = (value: string) =>
    setSelected((current) =>
      current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value],
    );

  return (
    <>
      {/* One hidden input per selected value so native form submission
          serialises as `name=v1&name=v2&...` (matches `<select multiple>`
          semantics). When nothing is selected and the field is required,
          emit one empty hidden so the required check still fires. */}
      {selected.length > 0 ? (
        selected.map((value) => (
          <input key={value} type="hidden" name={nameText} value={value} />
        ))
      ) : isRequired ? (
        <input type="hidden" name={nameText} value="" required />
      ) : null}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            id={inputId}
            variant="outline"
            colorScheme="neutral"
            role="combobox"
            aria-expanded={open}
            aria-controls={open ? contentId : undefined}
            aria-describedby={descId}
            aria-required={isRequired || undefined}
            className={cn(
              "w-full justify-between font-normal",
              SIZE_INPUT_CLASSES[size],
              isInset && ORIENTATION_INSET_INPUT_CLASSES,
              selected.length === 0 && "text-muted-foreground",
            )}
            style={placeholderMinWidth(placeholderText, { floor: 18 })}
          >
            <span className="truncate">
              {multiselectSummary(selected, resolvedOptions, placeholderText)}
            </span>
            <LibraryIcon
              name="chevrons-up-down"
              className="ms-2 size-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          id={contentId}
          align="start"
          className="w-[min(360px,calc(100vw-2rem))] p-0"
        >
          <Command>
            <CommandInput placeholder="Search…" />
            <CommandList>
              <CommandEmpty>No options found.</CommandEmpty>
              <CommandGroup>
                {resolvedOptions.map((option) => {
                  const isSelected = selected.includes(option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => toggle(option.value)}
                    >
                      <div
                        data-selected={isSelected}
                        className="pointer-events-none size-4 shrink-0 select-none rounded-[4px] border border-input transition-all data-[selected=true]:border-primary data-[selected=true]:bg-primary data-[selected=true]:text-inverse-text *:[svg]:opacity-0 data-[selected=true]:*:[svg]:opacity-100"
                      >
                        <LibraryIcon
                          name="check"
                          className="size-3.5 text-current"
                        />
                      </div>
                      <span>{option.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  );
}

/**
 * Dropdown rendered inside a FormBuilder's `form-fields-{*}`
 * placeholder. Single-select uses the Radix Select primitive (with a
 * hidden `<input>` mirroring the chosen value so native form
 * submission keeps working). Multi-select uses the Popover + Command
 * + checkbox-row pattern (same shape as the combobox primitive's
 * `ComboboxWithCheckbox`) — Radix Select doesn't natively support
 * multiple, and the native `<select multiple>` UX was unreadable on
 * design surfaces.
 */
export function Default(props: FormSelectFieldProps) {
  const {
    fieldId,
    nameText,
    labelText,
    placeholderText,
    descriptionText,
    isRequired,
    resolvedOptions,
    defaults,
    width,
    size,
    labelOrientation,
    styles,
    id,
  } = useResolvedSelectState(props);
  const isMultiple = isEnabled(props.multiple);
  const initialSingle = defaults[0] ?? "";
  const [singleValue, setSingleValue] = useState(initialSingle);

  return (
    <FormFieldShell
      slot="form-select-field"
      label={labelText}
      name={nameText}
      inputId={fieldId}
      required={isRequired}
      description={descriptionText}
      width={width}
      size={size}
      labelOrientation={labelOrientation}
      styles={styles}
      id={id}
    >
      {({ inputId, descId, isInset }) =>
        isMultiple ? (
          <MultiSelectField
            inputId={inputId}
            descId={descId}
            isInset={isInset}
            nameText={nameText}
            isRequired={isRequired}
            placeholderText={placeholderText}
            resolvedOptions={resolvedOptions}
            defaults={defaults}
            size={size}
            defaultOpen={props.defaultOpen}
          />
        ) : (
          <>
            {/* Radix Select handles its own value state, but native
                form submission needs an <input> in the form. Mirror
                the chosen value via a hidden input that carries the
                field name. */}
            <input
              type="hidden"
              name={nameText}
              value={singleValue}
              required={isRequired}
            />
            <Select value={singleValue} onValueChange={setSingleValue}>
              <SelectTrigger
                id={inputId}
                aria-describedby={descId}
                aria-required={isRequired || undefined}
                className={cn(
                  "w-full",
                  SIZE_INPUT_CLASSES[size],
                  isInset && ORIENTATION_INSET_INPUT_CLASSES,
                )}
                // Placeholder-aware floor — picker triggers need a
                // wider floor (18ch) than text inputs since they host
                // the chevron + selected value.
                style={placeholderMinWidth(placeholderText, { floor: 18 })}
              >
                <SelectValue placeholder={placeholderText} />
              </SelectTrigger>
              <SelectContent>
                {resolvedOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )
      }
    </FormFieldShell>
  );
}

/**
 * Radio-group variant — surfaces every option at once for short lists
 * (3–5 entries) where a click-to-open dropdown is friction. Same data
 * model as Default; the `Multiple` field is ignored here (radio groups
 * are single-select by definition).
 */
export function Radio(props: FormSelectFieldProps) {
  const {
    fieldId,
    nameText,
    labelText,
    descriptionText,
    isRequired,
    descId,
    resolvedOptions,
    defaults,
    width,
    size,
    labelOrientation,
    styles,
    id,
  } = useResolvedSelectState(props);
  const initial = defaults[0] ?? "";
  const [value, setValue] = useState(initial);
  // Radio variant has no input chrome to inset INTO — `inset` falls
  // back to `stack` so the label always sits clearly above the radio
  // options. `row` still works: label sits inline with the radio
  // group on a single horizontal row.
  const orientationForRadio =
    labelOrientation === "inset" ? "stack" : labelOrientation;

  return (
    <Field
      className={cn(
        "gap-2",
        WIDTH_GRID_CLASSES[width],
        ORIENTATION_FIELD_CLASSES[orientationForRadio],
        styles?.trimEnd(),
      )}
      orientation={orientationForRadio === "row" ? "horizontal" : "vertical"}
      data-slot="form-select-field"
      data-variant="radio"
      data-size={size}
      data-label-orientation={orientationForRadio}
      id={id || undefined}
    >
      <FieldLabel htmlFor={fieldId} className={cn(SIZE_LABEL_CLASSES[size])}>
        {labelText}
        {isRequired ? (
          <span aria-hidden="true" className="ms-0.5 text-destructive">
            *
          </span>
        ) : null}
      </FieldLabel>
      <input
        type="hidden"
        name={nameText}
        value={value}
        required={isRequired}
      />
      <RadioGroup
        id={fieldId}
        value={value}
        onValueChange={setValue}
        aria-describedby={descId}
        className="gap-2"
      >
        {resolvedOptions.map((option) => {
          const itemId = `${fieldId}-${option.value}`;
          return (
            <div key={option.value} className="flex items-center gap-2">
              <RadioGroupItem id={itemId} value={option.value} />
              <label
                htmlFor={itemId}
                className="cursor-pointer text-sm leading-none"
              >
                {option.label}
              </label>
            </div>
          );
        })}
      </RadioGroup>
      {descriptionText ? (
        <p id={descId} className="text-muted-foreground text-xs">
          {descriptionText}
        </p>
      ) : null}
    </Field>
  );
}

export default Default;

export const componentType = "universal";
