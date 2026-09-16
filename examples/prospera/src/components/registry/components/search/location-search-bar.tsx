"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { Button } from "@/components/registry/primitives/core/button";
import { Input } from "@/components/registry/primitives/core/input";
import { Label } from "@/components/registry/primitives/core/label";
import { LibraryIcon } from "@/components/registry/primitives/core/library-icon";
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
import { parseDefaultOnCheckbox } from "@/lib/registry/param-parsers";
import { useSearchControllerContext } from "@/lib/registry/search/search-controller-context";

/**
 * `LocationSearchBar` — the bundled location input for the
 * search-experience wrapper. ZIP / city input + radius selector + a
 * "use my location" button that calls `navigator.geolocation` to
 * pre-fill coords on the controller (skipping the geocoding step the
 * provider would otherwise do).
 *
 * Reads + writes `controller.location` on the ambient
 * `useSearchControllerContext`. Standalone placements (no controller
 * context) render an empty-state hint — this rendering only makes
 * sense inside a SearchExperience wrapper.
 *
 * The location input has more bespoke logic than a generic Show*
 * toggle on `SearchControlsBar` (geolocation API, radius unit,
 * potential autocomplete later), which is why it lives as its own
 * bundled bar rather than as a sub-bar on SearchControlsBar.
 */
export interface LocationSearchBarProps {
  inputPlaceholder?: TextSource;
  radiusLabel?: TextSource;
  useMyLocationLabel?: TextSource;
  submitLabel?: TextSource;
  radiusOptions?: string | TextSource;
  defaultUnit?: "mi" | "km" | string;
  showRadius?: boolean | string;
  showUseMyLocation?: boolean | string;
  className?: string;
}

function parseRadiusOptions(options?: string | TextSource): number[] {
  const raw = typeof options === "string" ? options : getSourceText(options);
  if (!raw) return [5, 10, 25, 50, 100];
  return raw
    .split(",")
    .map((s) => Number.parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n) && n > 0);
}

export function Default({
  inputPlaceholder,
  radiusLabel,
  useMyLocationLabel,
  submitLabel,
  radiusOptions = "5,10,25,50,100",
  defaultUnit = "mi",
  showRadius,
  showUseMyLocation,
  className,
}: LocationSearchBarProps) {
  const controller = useSearchControllerContext();
  const radiusOn = parseDefaultOnCheckbox(showRadius, true);
  const geoOn = parseDefaultOnCheckbox(showUseMyLocation, true);
  const resolvedPlaceholder = getSourceText(inputPlaceholder) ?? "ZIP or city";
  const resolvedRadiusLabel = getSourceText(radiusLabel) ?? "Within";
  const resolvedGeoLabel = getSourceText(useMyLocationLabel) ?? "Use my location";
  const resolvedSubmitLabel = getSourceText(submitLabel) ?? "Search";
  const [value, setValue] = useState(controller?.location.query ?? "");
  const [geoError, setGeoError] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  // `navigator.geolocation.getCurrentPosition` has no cancellation
  // API. The callback can fire up to ~8s later (default timeout) —
  // long enough for the user to navigate away. Track mount state so
  // the callback no-ops if it resolves after unmount.
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  if (!controller) {
    return (
      <div className="py-4 text-center text-muted-foreground text-sm">
        <span className="is-empty-hint">Location search bar</span>
      </div>
    );
  }

  const parsedOptions = parseRadiusOptions(radiusOptions);
  const radius = controller.location.radius ?? parsedOptions[0] ?? 25;
  const unit = controller.location.unit ?? (defaultUnit === "km" ? "km" : "mi");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const q = value.trim();
    if (!q) {
      controller.setLocationQuery("");
      return;
    }
    setGeoError(null);
    setGeoLoading(true);
    try {
      const response = await fetch(
        `/api/geocode?q=${encodeURIComponent(q)}`,
      );
      const payload = (await response.json()) as {
        lat?: number;
        lng?: number;
        error?: string;
      };
      controller.setLocationQuery(q);
      if (
        response.ok &&
        typeof payload.lat === "number" &&
        typeof payload.lng === "number"
      ) {
        controller.setLocationCoords({ lat: payload.lat, lng: payload.lng });
      } else {
        setGeoError("Couldn't find that place.");
      }
    } catch {
      setGeoError("Couldn't look up that place.");
    } finally {
      if (isMountedRef.current) setGeoLoading(false);
    }
  };

  const handleUseMyLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoError("Geolocation isn't available in this browser.");
      return;
    }
    setGeoError(null);
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!isMountedRef.current) return;
        controller.setLocationCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setGeoLoading(false);
        // Clear the textual query when we've resolved real coords —
        // the provider will fall through to the lat/lng pair.
        if (value) {
          setValue("");
        }
      },
      (err) => {
        if (!isMountedRef.current) return;
        setGeoError(err.message || "Couldn't get your location.");
        setGeoLoading(false);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 },
    );
  };

  return (
    // biome-ignore lint/a11y/useSemanticElements: search landmark on the <form>; the native <search> element lacks the form-submit semantics this control needs.
    <form
      role="search"
      onSubmit={handleSubmit}
      className={cn(
        "flex flex-col gap-3 rounded-md border bg-card p-3 sm:flex-row sm:items-end",
        className,
      )}
      aria-label="Location search"
    >
      <div className="min-w-0 flex-1 space-y-1">
        <Label htmlFor="location-search-bar-input">Location</Label>
        <Input
          id="location-search-bar-input"
          name="location"
          type="text"
          inputMode="search"
          autoComplete="postal-code"
          placeholder={resolvedPlaceholder}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      </div>

      {radiusOn && parsedOptions.length > 0 ? (
        <div className="space-y-1">
          <Label htmlFor="location-search-bar-radius">{resolvedRadiusLabel}</Label>
          <Select
            value={String(radius)}
            onValueChange={(next) => {
              const n = Number.parseInt(next, 10);
              if (Number.isFinite(n)) controller.setLocationRadius(n);
            }}
          >
            <SelectTrigger
              id="location-search-bar-radius"
              className="min-w-[8rem]"
            >
              <SelectValue placeholder={`${parsedOptions[0]} ${unit}`} />
            </SelectTrigger>
            <SelectContent>
              {parsedOptions.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option} {unit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={geoLoading}>
          {resolvedSubmitLabel}
        </Button>
        {geoOn ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleUseMyLocation}
            disabled={geoLoading}
            aria-busy={geoLoading || undefined}
          >
            <LibraryIcon name="crosshair" className="me-1 size-4" aria-hidden />
            {geoLoading ? "Locating…" : resolvedGeoLabel}
          </Button>
        ) : null}
      </div>

      {geoError ? (
        <p
          role="status"
          aria-live="polite"
          className="basis-full text-destructive text-xs"
        >
          {geoError}
        </p>
      ) : null}
    </form>
  );
}

export function Compact(props: LocationSearchBarProps) {
  return (
    <Default
      showUseMyLocation={false}
      submitLabel="Go"
      {...props}
      className={cn("p-2 sm:p-2", props.className)}
    />
  );
}

export const LocationSearchBar = Default;
export default Default;

export const componentType = "universal";
