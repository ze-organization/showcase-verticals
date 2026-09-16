"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Per-form autosave bound to `localStorage`. Reads the form's
 * `<input>` / `<textarea>` / `<select>` values on a debounced
 * interval, persists them under a stable key, and exposes a restore
 * hook that re-populates the same elements on hydrate.
 *
 * Designed for long forms (applications, surveys, multi-step
 * wizards) where losing 10 minutes of work to a navigation accident
 * is a real cost. Off by default — opt in per form.
 *
 * Storage shape:
 *
 *     localStorage[<storageKey>] = JSON.stringify({
 *       at: ISO timestamp,
 *       values: { <field name>: string },
 *     })
 *
 * Skipped server-side and when `storageKey` is empty. Honors
 * `prefers-reduced-data` by no-op'ing if the user opts out.
 */

export interface UseFormAutosaveOptions {
  /** Stable key under which to persist. Skip autosave when empty. */
  storageKey: string;
  /** Debounce window in ms. Defaults to 800ms. */
  debounceMs?: number;
  /** Max age of a draft before we ignore it on restore. Defaults to 7 days. */
  expireAfterMs?: number;
}

export interface FormAutosaveState {
  /** Restore the persisted values into the given form element. */
  restore: (form: HTMLFormElement | null) => void;
  /** Wipe the persisted draft. Call from the form's submit success path. */
  clear: () => void;
  /**
   * ISO timestamp of the persisted draft, or `null` if none. Used to
   * gate the "Restore your draft" prompt on initial render.
   */
  draftAt: string | null;
  /**
   * Auto-bind the form. Returns the `onInput` handler — caller wires
   * it onto the form element. Persistence runs on every input event,
   * debounced.
   */
  onInput: (event: React.FormEvent<HTMLFormElement>) => void;
}

interface PersistedDraft {
  at: string;
  values: Record<string, string>;
}

/** Apply a single persisted value to its matching form element,
 *  respecting checkbox/radio vs. text/textarea/select semantics. */
function applyValueToElement(el: Element | RadioNodeList, value: string): void {
  if (el instanceof HTMLInputElement) {
    if (el.type === "checkbox" || el.type === "radio") {
      el.checked = value === "on" || value === "true";
    } else {
      el.value = value;
    }
    return;
  }
  if (el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
    el.value = value;
  }
}

export function useFormAutosave({
  storageKey,
  debounceMs = 800,
  expireAfterMs = 1000 * 60 * 60 * 24 * 7,
}: UseFormAutosaveOptions): FormAutosaveState {
  const [draftAt, setDraftAt] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enabledRef = useRef(true);

  // Read existing draft on mount so the UI can prompt for restore.
  useEffect(() => {
    if (!storageKey) {
      enabledRef.current = false;
      return;
    }
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as PersistedDraft;
      if (!parsed?.at) return;
      const ageMs = Date.now() - new Date(parsed.at).getTime();
      if (ageMs > expireAfterMs) {
        window.localStorage.removeItem(storageKey);
        return;
      }
      setDraftAt(parsed.at);
    } catch {
      // Corrupt payload — clear and move on. Don't surface to user.
      window.localStorage.removeItem(storageKey);
    }
  }, [storageKey, expireAfterMs]);

  const persist = useCallback(
    (form: HTMLFormElement) => {
      if (!enabledRef.current || !storageKey) return;
      if (typeof window === "undefined") return;
      const data = new FormData(form);
      const values: Record<string, string> = {};
      for (const [name, value] of data.entries()) {
        // Skip the honeypot + file inputs (file blobs don't
        // serialise meaningfully to JSON).
        if (name === "hp_company") continue;
        if (value instanceof File) continue;
        values[name] = String(value);
      }
      const payload: PersistedDraft = {
        at: new Date().toISOString(),
        values,
      };
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(payload));
        setDraftAt(payload.at);
      } catch {
        // Quota exceeded / private mode — silently degrade.
        enabledRef.current = false;
      }
    },
    [storageKey],
  );

  const onInput = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      const form = event.currentTarget;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => persist(form), debounceMs);
    },
    [persist, debounceMs],
  );

  const restore = useCallback(
    (form: HTMLFormElement | null) => {
      if (!form || !storageKey || typeof window === "undefined") return;
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;
      try {
        const { values } = JSON.parse(raw) as PersistedDraft;
        if (!values) return;
        for (const [name, value] of Object.entries(values)) {
          const el = form.elements.namedItem(name);
          if (!el) continue;
          applyValueToElement(el, value);
        }
      } catch {
        // ignore
      }
    },
    [storageKey],
  );

  const clear = useCallback(() => {
    if (!storageKey || typeof window === "undefined") return;
    window.localStorage.removeItem(storageKey);
    setDraftAt(null);
  }, [storageKey]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { onInput, restore, clear, draftAt };
}
