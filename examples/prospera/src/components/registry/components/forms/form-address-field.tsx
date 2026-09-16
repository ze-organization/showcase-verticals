"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  type FormFieldSize,
  type FormFieldWidth,
  type FormLabelOrientation,
  placeholderMinWidth,
  WIDTH_GRID_CLASSES,
} from "@/components/registry/blocks/form-field-shell";
import { Button } from "@/components/registry/components/ui/cta-button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/registry/primitives/core/command";
import { Field, FieldLabel } from "@/components/registry/primitives/core/field";
import { Input } from "@/components/registry/primitives/core/input";
import { LibraryIcon } from "@/components/registry/primitives/core/library-icon";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/registry/primitives/core/popover";
import { getSourceText } from "@/components/registry/primitives/editables/source-normalizers";
import type { TextSource } from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import {
  COUNTRIES,
  type CountryEntry,
  flagEmoji,
  parsePriorityCountries,
} from "@/lib/registry/forms/countries";
import type { CmsProps } from "@/lib/registry/sitecore";

/**
 * Grouped address input. Renders four standard inputs (street /
 * apartment / city / state-or-region / postal code / country) with
 * sensible widths so they pair correctly on desktop. Submits as
 * individual named fields (`address_street`, `address_city`, etc.)
 * keyed off the field's `name` prop.
 *
 * Country list is short — the most common ten markets. Authors that
 * need a full country list should fork this block or wire a custom
 * select for the country slot. Keeping it short avoids shipping a
 * 200-row select most tenants will never need.
 */

export interface FormAddressFieldFields {
  Name?: TextSource;
  Legend?: TextSource;
  Description?: TextSource;
  /** Default country code (ISO 3166-1 alpha-2). */
  DefaultCountry?: TextSource;
}

export interface FormAddressFieldProps extends CmsProps {
  name?: TextSource;
  legend?: TextSource;
  description?: TextSource;
  required?: string | boolean | TextSource | CheckboxSource;
  defaultCountry?: TextSource;
  width?: FormFieldWidth;
  size?: FormFieldSize;
  labelOrientation?: FormLabelOrientation;
  /**
   * Hide individual sub-fields when an author wants a stripped
   * version (e.g. country-less for a US-only form). Comma-separated
   * list of keys: `street | apt | city | region | postal | country`.
   */
  hideFields?: TextSource;
  /**
   * Render the picker's popover already open. Author/preview seam only —
   * the interior is Radix-portalled and absent from the DOM until a
   * gesture opens it, so a static preview paints a bare trigger and the
   * country list can never be seen or measured.
   */
  defaultOpen?: boolean;
}

interface AddressCountryPickerProps {
  selected: CountryEntry;
  priority: CountryEntry[];
  onSelect: (c: CountryEntry) => void;
  inputId: string;
  isRequired: boolean;
  name: string;
  defaultOpen?: boolean;
}

/**
 * Searchable country picker for the address field. Pinned-priority
 * countries appear at the top (priority list from the recipe's
 * `DefaultCountry` prop), full ISO 3166-1 list below.
 */
function AddressCountryPicker({
  selected,
  priority,
  onSelect,
  inputId,
  isRequired,
  name,
  defaultOpen,
}: AddressCountryPickerProps) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const prioritySet = useMemo(
    () => new Set(priority.map((c) => c.code)),
    [priority],
  );
  const rest = useMemo(
    () => COUNTRIES.filter((c) => !prioritySet.has(c.code)),
    [prioritySet],
  );
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          id={inputId}
          variant="outline"
          colorScheme="neutral"
          role="combobox"
          aria-expanded={open}
          aria-required={isRequired || undefined}
          className="w-full justify-between font-normal"
        >
          <span className="inline-flex items-center gap-2">
            <span aria-hidden="true">{flagEmoji(selected.code)}</span>
            <span>{selected.name}</span>
          </span>
          <LibraryIcon
            name="chevrons-up-down"
            className="ms-2 size-4 shrink-0 text-muted-foreground"
            aria-hidden
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] min-w-[280px] p-0"
        align="start"
      >
        <Command
          filter={(value, search) =>
            value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
          }
        >
          <CommandInput placeholder="Search country…" />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            {priority.length > 0 ? (
              <>
                <CommandGroup heading="Priority">
                  {priority.map((c) => (
                    <CommandItem
                      key={c.code}
                      value={`${c.name} ${c.code}`}
                      onSelect={() => {
                        onSelect(c);
                        setOpen(false);
                      }}
                    >
                      <span className="me-2" aria-hidden="true">
                        {flagEmoji(c.code)}
                      </span>
                      <span className="flex-1">{c.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
              </>
            ) : null}
            <CommandGroup heading="All countries">
              {rest.map((c) => (
                <CommandItem
                  key={c.code}
                  value={`${c.name} ${c.code}`}
                  onSelect={() => {
                    onSelect(c);
                    setOpen(false);
                  }}
                >
                  <span className="me-2" aria-hidden="true">
                    {flagEmoji(c.code)}
                  </span>
                  <span className="flex-1">{c.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
      <input type="hidden" name={name} value={selected.code} />
    </Popover>
  );
}

/** Raw layout-service checkbox field shape (`{ value: boolean }`). */
type CheckboxSource = { value?: boolean };

// Accepts the raw layout-service shapes: the recipe's `Required` is a
// Sitecore CHECKBOX field, so it arrives as `{ value: boolean }` — NOT
// a plain string. Calling `.trim()` on that object (the old body)
// threw on every render and took the whole Pages editing canvas down
// with it. Mirror form-text-field's safe unwrap instead.
function isEnabled(
  value: string | boolean | TextSource | CheckboxSource | undefined,
): boolean {
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

function parseHidden(value: string | undefined): Set<string> {
  if (!value) return new Set();
  return new Set(
    value
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function Default(props: FormAddressFieldProps) {
  const groupId = useId();
  const {
    name,
    legend,
    description,
    required,
    defaultCountry,
    width = "full",
    hideFields,
    styles,
    id,
  } = props;

  const nameText = getSourceText(name) || "address";
  const legendText = getSourceText(legend) || "Address";
  const descriptionText = getSourceText(description) || undefined;
  const priority = useMemo(
    () => parsePriorityCountries(getSourceText(defaultCountry)),
    [defaultCountry],
  );
  // `parsePriorityCountries` always returns at least one entry, so
  // the cast through the non-empty contract is safe.
  const [selectedCountry, setSelectedCountry] = useState<CountryEntry>(
    () => priority[0] as CountryEntry,
  );
  const manualPickRef = useRef(false);
  useEffect(() => {
    if (manualPickRef.current) return;
    setSelectedCountry(priority[0] as CountryEntry);
  }, [priority]);
  const isRequired = isEnabled(required);
  const hidden = parseHidden(getSourceText(hideFields));

  const street1Id = `${groupId}-street`;
  const street2Id = `${groupId}-apt`;
  const cityId = `${groupId}-city`;
  const regionId = `${groupId}-region`;
  const postalId = `${groupId}-postal`;
  const countryId = `${groupId}-country`;

  return (
    <fieldset
      className={cn(
        "flex flex-col gap-3",
        WIDTH_GRID_CLASSES[width],
        styles?.trimEnd(),
      )}
      data-slot="form-address-field"
      id={id || undefined}
    >
      <legend className="px-1 font-medium text-sm">
        {legendText}
        {isRequired ? (
          <span aria-hidden="true" className="ms-0.5 text-destructive">
            *
          </span>
        ) : null}
      </legend>
      {descriptionText ? (
        <p className="text-muted-foreground text-xs">{descriptionText}</p>
      ) : null}
      <div className="flex w-full flex-wrap gap-3">
        {!hidden.has("street") && (
          <Field className="basis-full gap-1">
            <FieldLabel htmlFor={street1Id} className="text-sm">
              Street address
            </FieldLabel>
            <Input
              id={street1Id}
              name={`${nameText}_street`}
              type="text"
              autoComplete="address-line1"
              required={isRequired}
              style={placeholderMinWidth("123 Main St")}
            />
          </Field>
        )}
        {!hidden.has("apt") && (
          <Field className="basis-full gap-1">
            <FieldLabel htmlFor={street2Id} className="text-sm">
              Apt, suite, etc. (optional)
            </FieldLabel>
            <Input
              id={street2Id}
              name={`${nameText}_apt`}
              type="text"
              autoComplete="address-line2"
            />
          </Field>
        )}
        {!hidden.has("city") && (
          <Field className="basis-full gap-1 sm:basis-[calc(50%-0.5rem)]">
            <FieldLabel htmlFor={cityId} className="text-sm">
              City
            </FieldLabel>
            <Input
              id={cityId}
              name={`${nameText}_city`}
              type="text"
              autoComplete="address-level2"
              required={isRequired}
            />
          </Field>
        )}
        {!hidden.has("region") && (
          <Field className="basis-full gap-1 sm:basis-[calc(25%-0.5rem)]">
            <FieldLabel htmlFor={regionId} className="text-sm">
              State / Region
            </FieldLabel>
            <Input
              id={regionId}
              name={`${nameText}_region`}
              type="text"
              autoComplete="address-level1"
              required={isRequired}
            />
          </Field>
        )}
        {!hidden.has("postal") && (
          <Field className="basis-full gap-1 sm:basis-[calc(25%-0.5rem)]">
            <FieldLabel htmlFor={postalId} className="text-sm">
              Postal code
            </FieldLabel>
            <Input
              id={postalId}
              name={`${nameText}_postal`}
              type="text"
              autoComplete="postal-code"
              required={isRequired}
            />
          </Field>
        )}
        {!hidden.has("country") && (
          <Field className="basis-full gap-1">
            <FieldLabel htmlFor={countryId} className="text-sm">
              Country
            </FieldLabel>
            <AddressCountryPicker
              selected={selectedCountry}
              priority={priority}
              onSelect={(c) => {
                manualPickRef.current = true;
                setSelectedCountry(c);
              }}
              inputId={countryId}
              isRequired={isRequired}
              name={`${nameText}_country`}
              defaultOpen={props.defaultOpen}
            />
          </Field>
        )}
      </div>
    </fieldset>
  );
}

export const FormAddressField = Default;
export default Default;
export const componentType = "universal";
