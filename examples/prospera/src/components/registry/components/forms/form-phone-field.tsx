"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  FormFieldShell,
  type FormFieldSize,
  type FormFieldWidth,
  type FormLabelOrientation,
  placeholderMinWidth,
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
 * Phone number input with country-code prefix. Searchable country
 * picker backed by the full ISO 3166-1 list (~240 countries). The
 * `defaultCountry` prop accepts either a single ISO code (`"IE"`) or
 * a comma-separated priority list (`"IE,GB"`) — the first becomes
 * the initial selection; subsequent entries appear at the top of
 * the picker so a user in Ireland sees IE → GB before scrolling.
 *
 * Submit shape: a single combined value in E.164 format — e.g.
 * `+353812345678`. The form payload at `formData.get("<name>")` is
 * the concatenated string; the per-part selections aren't separate
 * inputs so server code doesn't need to glue them.
 */

export interface FormPhoneFieldFields {
  Name?: TextSource;
  Label?: TextSource;
  Description?: TextSource;
  HelpText?: TextSource;
  /**
   * Single ISO 3166-1 alpha-2 code (`"IE"`) or comma-separated
   * priority list (`"IE,GB"`) — first is the initial selection;
   * later entries pin to the top of the country picker.
   */
  DefaultCountry?: TextSource;
}

export interface FormPhoneFieldProps extends CmsProps {
  name?: TextSource;
  label?: TextSource;
  description?: TextSource;
  helpText?: TextSource;
  defaultCountry?: TextSource;
  required?: string | boolean | TextSource | CheckboxSource;
  width?: FormFieldWidth;
  size?: FormFieldSize;
  labelOrientation?: FormLabelOrientation;
  /**
   * Render the country picker's popover already open. Author/preview
   * seam only — the interior is Radix-portalled and absent from the DOM
   * until a gesture opens it, so a static preview paints a bare trigger
   * and the country list can never be seen or measured.
   */
  defaultOpen?: boolean;
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

interface CountryPickerProps {
  selected: CountryEntry;
  priority: CountryEntry[];
  onSelect: (country: CountryEntry) => void;
  /**
   * Render the country picker's popover already open. Author/preview
   * seam only — the interior is Radix-portalled and absent from the DOM
   * until a gesture opens it, so a static preview paints a bare trigger
   * and the country list can never be seen or measured.
   */
  defaultOpen?: boolean;
}

function CountryPicker({
  selected,
  priority,
  onSelect,
  defaultOpen,
}: CountryPickerProps) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  // Surface priority countries at the top + a separator + the full
  // list. De-dupe so priority countries don't appear twice.
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
          variant="outline"
          colorScheme="neutral"
          role="combobox"
          aria-expanded={open}
          aria-label="Country code"
          className="w-fit shrink-0 justify-between gap-2 ps-3 pe-2"
        >
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden="true">{flagEmoji(selected.code)}</span>
            <span className="font-medium tabular-nums">{selected.dial}</span>
          </span>
          <LibraryIcon
            name="chevrons-up-down"
            className="ms-1 size-4 text-muted-foreground"
            aria-hidden
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] min-w-[280px] p-0"
        align="start"
      >
        <Command
          filter={(value, search) => {
            // Match against name / code / dial code — so a user typing
            // "ire" finds Ireland, "+353" finds Ireland, and "ie"
            // finds Ireland.
            const haystack = value.toLowerCase();
            return haystack.includes(search.toLowerCase()) ? 1 : 0;
          }}
        >
          <CommandInput placeholder="Search country or code…" />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            {priority.length > 0 ? (
              <>
                <CommandGroup heading="Priority">
                  {priority.map((c) => (
                    <CommandItem
                      key={c.code}
                      value={`${c.name} ${c.code} ${c.dial}`}
                      onSelect={() => {
                        onSelect(c);
                        setOpen(false);
                      }}
                    >
                      <span className="me-2" aria-hidden="true">
                        {flagEmoji(c.code)}
                      </span>
                      <span className="flex-1">{c.name}</span>
                      <span className="text-muted-foreground text-xs tabular-nums">
                        {c.dial}
                      </span>
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
                  value={`${c.name} ${c.code} ${c.dial}`}
                  onSelect={() => {
                    onSelect(c);
                    setOpen(false);
                  }}
                >
                  <span className="me-2" aria-hidden="true">
                    {flagEmoji(c.code)}
                  </span>
                  <span className="flex-1">{c.name}</span>
                  <span className="text-muted-foreground text-xs tabular-nums">
                    {c.dial}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function Default(props: FormPhoneFieldProps) {
  const fieldId = useId();
  const {
    name,
    label,
    description,
    helpText,
    defaultCountry,
    required,
    width = "full",
    size = "default",
    labelOrientation = "stack",
    styles,
    id,
  } = props;

  const nameText = getSourceText(name) || "phone";
  const labelText = getSourceText(label) || "Phone";
  const descriptionText = getSourceText(description) || undefined;
  const helpTextText = getSourceText(helpText) || undefined;
  const priority = useMemo(
    () => parsePriorityCountries(getSourceText(defaultCountry)),
    [defaultCountry],
  );
  const isRequired = isEnabled(required);

  // `parsePriorityCountries` guarantees a non-empty list (falls back
  // to US if every input code was invalid). Cast through the
  // non-empty contract rather than a non-null assertion so biome's
  // strict rule stays satisfied.
  const [selectedCountry, setSelectedCountry] = useState<CountryEntry>(
    () => priority[0] as CountryEntry,
  );
  // Re-seed the selection when the priority list changes AND the
  // user hasn't picked manually — important for the preview iframe
  // where props update via postMessage at runtime. A manual pick
  // wins permanently for that mount.
  const manualPickRef = useRef(false);
  useEffect(() => {
    if (manualPickRef.current) return;
    setSelectedCountry(priority[0] as CountryEntry);
  }, [priority]);
  const [nationalNumber, setNationalNumber] = useState("");

  // E.164 = `+` + country dial digits + national digits only.
  const digits = nationalNumber.replace(/\D/g, "");
  const e164 = digits ? `${selectedCountry.dial}${digits}` : "";

  return (
    <FormFieldShell
      slot="form-phone-field"
      label={labelText}
      name={nameText}
      inputId={fieldId}
      required={isRequired}
      description={descriptionText}
      helpText={helpTextText}
      width={width}
      size={size}
      labelOrientation={labelOrientation}
      styles={styles}
      id={id}
    >
      {({ inputId, descId, isRequired: req }) => (
        <div
          className="flex w-full items-stretch gap-2"
          data-slot="form-phone-field-control"
        >
          <CountryPicker
            selected={selectedCountry}
            priority={priority}
            onSelect={(c) => {
              manualPickRef.current = true;
              setSelectedCountry(c);
            }}
            defaultOpen={props.defaultOpen}
          />
          <Input
            id={inputId}
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            value={nationalNumber}
            onChange={(e) => setNationalNumber(e.target.value)}
            required={req}
            placeholder="555 123 4567"
            aria-describedby={descId}
            className={cn("flex-1")}
            style={placeholderMinWidth("555 123 4567")}
          />
          <input type="hidden" name={nameText} value={e164} required={req} />
        </div>
      )}
    </FormFieldShell>
  );
}

export const FormPhoneField = Default;
export default Default;
export const componentType = "universal";
