"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useCallback, useState } from "react";
import { Button } from "@/components/registry/primitives/core/button";
import { Field, FieldLabel } from "@/components/registry/primitives/core/field";
import { Input } from "@/components/registry/primitives/core/input";
import { LibraryIcon } from "@/components/registry/primitives/core/library-icon";
import { cn } from "@/lib/registry/cn";

export type SearchBarVariant = "default" | "medium" | "large" | "input-only";

export interface SearchBarProps {
  action?: string;
  placeholder?: string;
  className?: string;
  variant?: SearchBarVariant;
  inputName?: string;
  inputId?: string;
  submitLabel?: string;
  value?: string;
  defaultValue?: string;
  onQueryChange?: (query: string) => void;
  onSubmit?: (query: string) => void;
}

const mediumFilterOptions = {
  continent: ["Any continent", "Europe", "Asia", "North America", "Africa"],
  itemType: ["Any type", "City", "Beach", "Mountain", "Cultural"],
  activity: ["Any activity", "Relaxation", "Adventure", "Food", "History"],
};

/** Resolve the effective query: the named input, then `from`/`to`. */
function resolveQueryFromForm(formData: FormData, inputName: string): string {
  const queryValue = formData.get(inputName);
  const fromValue = formData.get("from");
  const toValue = formData.get("to");
  return (
    (typeof queryValue === "string" && queryValue.trim()) ||
    (typeof fromValue === "string" && fromValue.trim()) ||
    (typeof toValue === "string" && toValue.trim()) ||
    ""
  );
}

/** Focus the first present query-ish input so the validation error lands
 *  on a visible control. */
function focusFallbackInput(form: HTMLFormElement, inputName: string): void {
  const fallbackInput =
    form.querySelector<HTMLInputElement>(`input[name='${inputName}']`) ??
    form.querySelector<HTMLInputElement>("input[name='from']") ??
    form.querySelector<HTMLInputElement>("input[name='to']");
  fallbackInput?.focus();
}

/** Build the search querystring from all non-empty string fields,
 *  guaranteeing a `q` entry. */
function buildSearchParams(formData: FormData, query: string): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, rawValue] of formData.entries()) {
    if (typeof rawValue !== "string") continue;
    const trimmed = rawValue.trim();
    if (!trimmed) continue;
    params.set(key, trimmed);
  }
  if (!params.has("q")) {
    params.set("q", query);
  }
  return params;
}

export function SearchBar({
  action = "/search",
  placeholder = "Search...",
  className,
  variant = "default",
  inputName = "q",
  inputId,
  submitLabel = "Search",
  value,
  defaultValue,
  onQueryChange,
  onSubmit,
}: SearchBarProps) {
  const router = useRouter();
  const [validationMessage, setValidationMessage] = useState("");
  const [continent, setContinent] = useState("");
  const [itemType, setItemType] = useState("");
  const [activity, setActivity] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departDate, setDepartDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [passengers, setPassengers] = useState("1");
  const resolvedInputId = inputId ?? `search-bar-${variant}-${inputName}`;
  const isInputOnlyVariant = variant === "input-only";

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const form = event.currentTarget;
      const formData = new FormData(form);
      const query = resolveQueryFromForm(formData, inputName);
      if (!query) {
        setValidationMessage("Please enter a search term.");
        focusFallbackInput(form, inputName);
        return;
      }

      setValidationMessage("");
      if (onSubmit) {
        onSubmit(query);
        return;
      }

      if (action) {
        const params = buildSearchParams(formData, query);
        router.push(`${action}?${params.toString()}`);
      }
    },
    [action, inputName, onSubmit, router],
  );

  const handleInput = useCallback(() => {
    if (validationMessage) {
      setValidationMessage("");
    }
  }, [validationMessage]);

  if (variant === "medium") {
    return (
      // biome-ignore lint/a11y/useSemanticElements: search landmark on the <form>; the native <search> element lacks the form-submit semantics this control needs.
      <form
        role="search"
        className={cn(
          "component search-bar rounded-lg border bg-card p-4 shadow-sm",
          className,
        )}
        onSubmit={handleSubmit}
        onInput={handleInput}
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <Field className="min-w-0 gap-1 md:col-span-1">
            <FieldLabel htmlFor={resolvedInputId} className="sr-only">
              Search
            </FieldLabel>
            <Input
              id={resolvedInputId}
              name={inputName}
              type="search"
              autoComplete="off"
              placeholder={placeholder}
              className="w-full"
              value={value}
              defaultValue={defaultValue}
              onChange={(event) => onQueryChange?.(event.target.value)}
            />
          </Field>
          <Field className="min-w-0 gap-1">
            <FieldLabel htmlFor="search-bar-continent" className="sr-only">
              Continent
            </FieldLabel>
            <select
              id="search-bar-continent"
              name="continent"
              value={continent}
              onChange={(event) => setContinent(event.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {mediumFilterOptions.continent.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </Field>
          <Field className="min-w-0 gap-1">
            <FieldLabel htmlFor="search-bar-type" className="sr-only">
              Type
            </FieldLabel>
            <select
              id="search-bar-type"
              name="itemType"
              value={itemType}
              onChange={(event) => setItemType(event.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {mediumFilterOptions.itemType.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </Field>
          <Field className="min-w-0 gap-1">
            <FieldLabel htmlFor="search-bar-activity" className="sr-only">
              Activity
            </FieldLabel>
            <select
              id="search-bar-activity"
              name="activity"
              value={activity}
              onChange={(event) => setActivity(event.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {mediumFilterOptions.activity.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="mt-4 flex justify-end">
          <Button type="submit" variant="default" size="default">
            {submitLabel}
          </Button>
        </div>
      </form>
    );
  }

  if (variant === "large") {
    return (
      // biome-ignore lint/a11y/useSemanticElements: search landmark on the <form>; the native <search> element lacks the form-submit semantics this control needs.
      <form
        role="search"
        className={cn(
          "component search-bar rounded-xl border bg-card p-5 shadow-md",
          className,
        )}
        onSubmit={handleSubmit}
        onInput={handleInput}
      >
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
          <Field className="min-w-0 gap-1">
            <FieldLabel htmlFor="search-bar-from">From</FieldLabel>
            <Input
              id="search-bar-from"
              name="from"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              placeholder="Departure city"
            />
          </Field>
          <Field className="min-w-0 gap-1">
            <FieldLabel htmlFor="search-bar-to">To</FieldLabel>
            <Input
              id="search-bar-to"
              name="to"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              placeholder="Destination city"
            />
          </Field>
          <Field className="min-w-0 gap-1">
            <FieldLabel htmlFor="search-bar-depart">Departure</FieldLabel>
            <Input
              id="search-bar-depart"
              name="departDate"
              type="date"
              value={departDate}
              onChange={(event) => setDepartDate(event.target.value)}
            />
          </Field>
          <Field className="min-w-0 gap-1">
            <FieldLabel htmlFor="search-bar-return">Return</FieldLabel>
            <Input
              id="search-bar-return"
              name="returnDate"
              type="date"
              value={returnDate}
              onChange={(event) => setReturnDate(event.target.value)}
            />
          </Field>
          <Field className="min-w-0 gap-1">
            <FieldLabel htmlFor="search-bar-passengers">Passengers</FieldLabel>
            <select
              id="search-bar-passengers"
              name="passengers"
              value={passengers}
              onChange={(event) => setPassengers(event.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="1">1 Adult</option>
              <option value="2">2 Adults</option>
              <option value="3">3 Adults</option>
              <option value="4">4+ Adults</option>
            </select>
          </Field>
        </div>
        <div className="mt-5 flex justify-end">
          <Button type="submit" variant="default" size="default">
            {submitLabel}
          </Button>
        </div>
      </form>
    );
  }

  return (
    // biome-ignore lint/a11y/useSemanticElements: search landmark on the <form>; the native <search> element lacks the form-submit semantics this control needs.
    <form
      role="search"
      className={cn(
        "flex flex-col gap-2",
        !isInputOnlyVariant && "sm:flex-row sm:items-end",
        className,
      )}
      onSubmit={handleSubmit}
      onInput={handleInput}
    >
      <Field className="min-w-0 flex-1 gap-1">
        <FieldLabel htmlFor={resolvedInputId} className="sr-only">
          Search
        </FieldLabel>
        {isInputOnlyVariant ? (
          <div className="relative w-full">
            <LibraryIcon
              name="search"
              className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden={true}
            />
            <Input
              id={resolvedInputId}
              name={inputName}
              type="search"
              autoComplete="off"
              placeholder={placeholder}
              className="w-full ps-10"
              value={value}
              defaultValue={defaultValue}
              onChange={(event) => onQueryChange?.(event.target.value)}
            />
          </div>
        ) : (
          <Input
            id={resolvedInputId}
            name={inputName}
            type="search"
            autoComplete="off"
            placeholder={placeholder}
            className="w-full"
            value={value}
            defaultValue={defaultValue}
            onChange={(event) => onQueryChange?.(event.target.value)}
          />
        )}
      </Field>
      {!isInputOnlyVariant ? (
        <Button type="submit" variant="default" size="default">
          {submitLabel}
        </Button>
      ) : null}
      <p
        className={cn(
          "sm:basis-full sm:pt-1",
          validationMessage ? "text-destructive text-sm" : "sr-only",
        )}
        role="alert"
      >
        {/*
          When there's no validation message, render an empty alert
          rather than placeholder copy — the previous "Search
          validation message" fallback leaked to AT users via the
          sr-only class (the element is hidden visually but still
          announced through role=alert).
        */}
        {validationMessage}
      </p>
    </form>
  );
}

export default SearchBar;
