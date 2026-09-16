"use client";

import { registerCdpRecipe } from "@/lib/registry/analytics/cdp-events";
import languageSwitcherRecipe from "@/recipes/language-switcher.recipe";

registerCdpRecipe(languageSwitcherRecipe);

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback } from "react";
import { LibraryIcon } from "@/components/registry/primitives/core/library-icon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/registry/primitives/core/select";
import { useComponentAnalytics } from "@/lib/registry/analytics/use-component-analytics";
import { cn } from "@/lib/registry/cn";
import {
  getDirectionFromLanguage,
  setStoredDirection,
} from "@/lib/registry/direction";
import type { ComponentParams } from "@/lib/registry/sitecore";
import type { ComponentProps } from "@/lib/registry/sitecore-types";
import { localeOptions } from "./language-switcher-config";

export interface LanguageSwitcherAnalyticsMeta {
  id?: string;
  instanceKey?: string;
  instanceScope?: "site" | "page";
  fromLocale?: string;
  toLocale?: string;
}

export type LanguageSwitcherProps = Omit<ComponentProps, "params"> & {
  /**
   * Optional on purpose: installed starters can place this rendering
   * on any placeholder, and some render paths (metadata editing
   * payloads, hand-mounted previews) deliver no params at all.
   * Destructuring a missing params object must not crash the page.
   * (`Omit` + optional re-add — a plain intersection would keep the
   * base type's required `params` and defeat the intent.)
   */
  params?: ComponentParams;
  activeLocale?: string;
};

function isEnabled(value: string | boolean | undefined): boolean {
  if (typeof value === "boolean") return value;
  if (!value) return false;
  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
}

/** Clamp the active locale to the supported list (fall back to en). */
function resolveSelectedLocale(activeLocale: string | undefined): string {
  const locale = activeLocale ?? "en";
  return localeOptions.some((l) => l.code === locale) ? locale : "en";
}

/**
 * Presentational select shared by the live component and the Suspense
 * fallback — identical chrome in both, so the boundary resolving never
 * shifts layout. The fallback simply has no change handler yet.
 */
function LanguageSwitcherSelect({
  styles,
  id,
  selectedLocale,
  onValueChange,
}: {
  styles: string | undefined;
  id: string | undefined;
  selectedLocale: string;
  onValueChange?: (langCode: string) => void;
}) {
  return (
    <div className={cn("component language-switcher", styles)} id={id}>
      <Select value={selectedLocale} onValueChange={onValueChange}>
        <SelectTrigger
          id="language-select"
          aria-label={`Current Language: ${selectedLocale}`}
          className="border-0 shadow-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&>svg]:hidden [.component.header_&]:px-1"
        >
          <div className="flex items-center gap-2">
            <LibraryIcon name="globe" className="size-5" />
            <span className="max-lg:hidden">
              <SelectValue placeholder="Language" />
            </span>
          </div>
        </SelectTrigger>
        <SelectContent className="min-w-44 border-0">
          {localeOptions.map((language) => (
            <SelectItem
              key={language.code}
              value={language.code}
              // Explicit `aria-current="true"` on the active locale —
              // Radix Select sets `aria-selected` for the matched value,
              // but `aria-current` is the WAI-ARIA convention for
              // "this option represents the current state" (active
              // page/language). Belt-and-braces for AT consistency.
              aria-current={
                language.code === selectedLocale ? "true" : undefined
              }
            >
              <span>{language.label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/**
 * Inner component that owns the `useSearchParams()` call. In the App
 * Router, `useSearchParams()` in a client component opts the nearest
 * Suspense boundary into client-side rendering — and with NO boundary
 * above it, prerender fails for the WHOLE page (the "put it on a page
 * placeholder and everything breaks" failure in installed starters).
 * The exported `LanguageSwitcher` wraps this in `<Suspense>` so the
 * bailout is scoped to this component regardless of placement.
 */
function LanguageSwitcherInner(props: LanguageSwitcherProps) {
  const {
    styles,
    RenderingIdentifier: id,
    InstanceKey,
    InstanceScope,
    TrackEvents,
  } = props.params ?? {};

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeLocale = props.activeLocale ?? "en";
  const instanceKey = InstanceKey || id;
  const instanceScope =
    (InstanceScope as "site" | "page" | undefined) ?? "site";
  const trackEvents = isEnabled(TrackEvents as string | undefined);

  const analytics =
    useComponentAnalytics<LanguageSwitcherAnalyticsMeta>("language-switcher");

  const changeLanguage = useCallback(
    (langCode: string) => {
      if (trackEvents && langCode !== activeLocale) {
        analytics.fire("changed", {
          id,
          instanceKey,
          instanceScope,
          fromLocale: activeLocale,
          toLocale: langCode,
        });
      }
      // Flip document direction to match the chosen language. Without
      // this, picking an RTL locale (ar / he / …) updates the URL but
      // leaves <html dir="ltr"> in place — Tailwind v4 logical
      // properties, Radix UI direction context, and every consumer of
      // useDirection() stay LTR. setStoredDirection writes the cookie
      // + dispatches the "direction-change" event the DirectionProvider
      // listens for, so the flip is immediate (no reload required).
      setStoredDirection(getDirectionFromLanguage(langCode));
      // `useSearchParams()` types as nullable in shared-runtime setups
      // (pages-router mounts); guard rather than crash.
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      params.set("sc_lang", langCode);
      router.push(`${pathname}?${params.toString()}`);
    },
    [
      pathname,
      searchParams,
      router,
      analytics,
      trackEvents,
      activeLocale,
      id,
      instanceKey,
      instanceScope,
    ],
  );

  return (
    <LanguageSwitcherSelect
      styles={styles}
      id={id}
      selectedLocale={resolveSelectedLocale(props.activeLocale)}
      onValueChange={changeLanguage}
    />
  );
}

/**
 * Locale picker. Safe on ANY placeholder — page or header partial —
 * because the `useSearchParams()` consumer is isolated behind its own
 * `<Suspense>` boundary here (see LanguageSwitcherInner). The fallback
 * renders the exact same trigger chrome with the resolved locale, so
 * there is no layout shift while the boundary resolves.
 */
export function LanguageSwitcher(props: LanguageSwitcherProps) {
  const { styles, RenderingIdentifier: id } = props.params ?? {};
  return (
    <Suspense
      fallback={
        <LanguageSwitcherSelect
          styles={styles}
          id={id}
          selectedLocale={resolveSelectedLocale(props.activeLocale)}
        />
      }
    >
      <LanguageSwitcherInner {...props} />
    </Suspense>
  );
}

export default LanguageSwitcher;

export const componentType = "universal";
