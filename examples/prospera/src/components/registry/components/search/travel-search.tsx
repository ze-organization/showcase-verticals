"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/registry/components/ui/cta-button";
import {
  Link,
  type LinkSource,
} from "@/components/registry/primitives/editables/link";
import {
  getSourceText,
  isEmptySource,
} from "@/components/registry/primitives/editables/source-normalizers";
import {
  Text,
  type TextSource,
} from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";

/**
 * `travel-search` — a generic travel search widget. A mode toggle
 * (flight / hotel / train) swaps the field labels; the fields
 * themselves stay constant (origin, destination, two dates, party
 * size) so one component serves airlines, hotels, and rail without a
 * bespoke rendering per mode.
 *
 * Deliberately un-plumbed: the fields are uncontrolled and the Search
 * button follows `searchLink` (or submits the wrapping form). Wiring it
 * to a real search backend is a downstream concern — this is the
 * booking-style entry surface a brand hero leads with.
 *
 * Two variants share one body:
 *   - `Default`   → a solid card, e.g. sitting in a page section.
 *   - `HeroEmbed` → a translucent, blurred panel meant to overlap a
 *                   hero image (no heading chrome).
 */

export type TravelMode = "flight" | "hotel" | "train";

interface ModeCopy {
  label: string;
  origin: string;
  destination: string;
  depart: string;
  ret: string;
  party: string;
}

const MODE_COPY: Record<TravelMode, ModeCopy> = {
  flight: {
    label: "Flights",
    origin: "From",
    destination: "To",
    depart: "Depart",
    ret: "Return",
    party: "Passengers",
  },
  hotel: {
    label: "Hotels",
    origin: "Destination",
    destination: "Neighborhood",
    depart: "Check in",
    ret: "Check out",
    party: "Guests",
  },
  train: {
    label: "Trains",
    origin: "From",
    destination: "To",
    depart: "Depart",
    ret: "Return",
    party: "Travelers",
  },
};

export interface TravelSearchProps {
  title?: TextSource;
  subtitle?: TextSource;
  /** CTA link. When empty the button falls back to a plain submit. */
  searchLink?: LinkSource;
  searchLabel?: TextSource;
  /** Modes shown in the toggle, in order. Defaults to all three. */
  modes?: TravelMode[];
  defaultMode?: TravelMode;
  className?: string;
  id?: string;
  isEditing?: boolean;
}

function Field({
  label,
  type = "text",
  placeholder,
}: {
  label: string;
  type?: string;
  placeholder?: string;
}) {
  const fieldId = `travel-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <label htmlFor={fieldId} className="flex min-w-0 flex-col gap-1">
      <span className="font-medium text-current/70 text-xs uppercase tracking-wide">
        {label}
      </span>
      <input
        id={fieldId}
        type={type}
        placeholder={placeholder}
        className="w-full rounded-md border border-border bg-background/80 px-3 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
      />
    </label>
  );
}

function PartyField({ label }: { label: string }) {
  const fieldId = `travel-${label.toLowerCase()}`;
  return (
    <label htmlFor={fieldId} className="flex min-w-0 flex-col gap-1">
      <span className="font-medium text-current/70 text-xs uppercase tracking-wide">
        {label}
      </span>
      <select
        id={fieldId}
        className="w-full rounded-md border border-border bg-background/80 px-3 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        defaultValue="1"
      >
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <option key={n} value={n}>
            {n} {n === 1 ? label.replace(/s$/, "") : label}
          </option>
        ))}
      </select>
    </label>
  );
}

function TravelSearchBody({
  title,
  subtitle,
  searchLink,
  searchLabel,
  modes = ["flight", "hotel", "train"],
  defaultMode,
  isEditing,
  embedded,
}: TravelSearchProps & { embedded?: boolean }) {
  const available = modes.length ? modes : (["flight"] as TravelMode[]);
  const initialMode: TravelMode =
    defaultMode && available.includes(defaultMode)
      ? defaultMode
      : (available[0] ?? "flight");
  const [mode, setMode] = useState<TravelMode>(initialMode);
  const copy = useMemo(() => MODE_COPY[mode], [mode]);
  const hasSearchLink = Boolean(searchLink && !isEmptySource(searchLink));
  const label = getSourceText(searchLabel) || "Search";

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-4 rounded-(--card-radius,var(--radius-xl)) p-5 md:p-6",
        embedded
          ? "border border-white/20 bg-background/80 text-foreground shadow-2xl backdrop-blur-md"
          : "border border-border bg-card text-card-foreground shadow-lg",
      )}
      data-slot="travel-search"
      data-mode={mode}
    >
      {!embedded && (title || subtitle) ? (
        <div className="flex flex-col gap-1">
          {title && getSourceText(title) ? (
            <div className="font-heading font-semibold text-xl tracking-tight">
              <Text value={title} tag="span" isEditing={isEditing} />
            </div>
          ) : null}
          {subtitle && getSourceText(subtitle) ? (
            <div className="text-current/70 text-sm">
              <Text value={subtitle} tag="span" isEditing={isEditing} />
            </div>
          ) : null}
        </div>
      ) : null}

      {available.length > 1 ? (
        <div
          className="inline-flex w-fit rounded-full bg-muted p-1"
          role="tablist"
          aria-label="Search mode"
        >
          {available.map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={m === mode}
              onClick={() => setMode(m)}
              className={cn(
                "rounded-full px-4 py-1.5 font-medium text-sm transition",
                m === mode
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {MODE_COPY[m].label}
            </button>
          ))}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
        <Field label={copy.origin} placeholder={copy.origin} />
        <Field label={copy.destination} placeholder={copy.destination} />
        <Field label={copy.depart} type="date" />
        <Field label={copy.ret} type="date" />
        <PartyField label={copy.party} />
      </div>

      <div className="flex justify-end">
        {hasSearchLink ? (
          <Button asChild size="lg">
            <Link value={searchLink} isEditing={isEditing} />
          </Button>
        ) : (
          <Button type="submit" size="lg">
            {label}
          </Button>
        )}
      </div>
    </div>
  );
}

/** Solid card — sits inside a page section. */
export function Default(props: TravelSearchProps) {
  return (
    <section
      className="component travel-search w-full py-10"
      id={props.id}
      data-variant="Default"
    >
      <div className="container mx-auto px-4">
        <TravelSearchBody {...props} />
      </div>
    </section>
  );
}

/** Translucent blurred panel — meant to overlap a hero image. */
export function HeroEmbed(props: TravelSearchProps) {
  return (
    <section
      className="component travel-search relative z-10 w-full"
      id={props.id}
      data-variant="HeroEmbed"
    >
      <div className="container mx-auto -mt-16 px-4 md:-mt-20">
        <TravelSearchBody {...props} embedded />
      </div>
    </section>
  );
}

export const componentType = "universal";
