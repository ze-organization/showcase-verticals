"use client";

import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/**
 * Shared state model for any FormBuilder-shelled surface.
 *
 * Three concerns hang off this context, intentionally co-located so a
 * single React subtree can drive all of them:
 *
 *   - **errors**: per-field error messages, surfaced by FormFieldShell
 *     under each input AND aggregated into the top-of-form error
 *     summary (#25). Server-returned errors push in via `setError`;
 *     each form-field reads via `useFormFieldError(name)`.
 *
 *   - **values**: live values for every field that opts in via the
 *     `useRegisterFormValue` hook. Conditional-fields (#2), the form
 *     summary block (#17), and autosave (#23) all read from here.
 *     Inputs without a `name` don't register and don't appear here.
 *
 *   - **status**: idle / submitting / success / error. The submit
 *     button (#20), the optimistic success card (#21), and the
 *     summary heading (#25) all branch on this.
 *
 * Designed to live on FormBuilder. Anything dropped into the form-
 * fields placeholder gets the context for free; standalone uses of
 * form-X-field outside FormBuilder fall through to the
 * `useDetachedFormContext` defaults so the fields still render
 * standalone without a wrapping provider.
 */

export type FormFieldErrors = Record<string, string>;
export type FormFieldValues = Record<string, unknown>;
export type FormStatus = "idle" | "submitting" | "success" | "error";

export interface FormBuilderContextValue {
  errors: FormFieldErrors;
  setError: (name: string, message: string | undefined) => void;
  clearErrors: () => void;
  values: FormFieldValues;
  setValue: (name: string, value: unknown) => void;
  replaceValues: (next: FormFieldValues) => void;
  status: FormStatus;
  setStatus: Dispatch<SetStateAction<FormStatus>>;
  /**
   * Whether the form is being authored in a CMS editor. Lets form-
   * fields hide submit-time chrome (focus rings on edit-mode hover,
   * for instance) without each field re-reading `isEditing` from
   * Sitecore props.
   */
  isEditing?: boolean;
  /**
   * Stable string identifier for the form so per-field error ids and
   * autosave keys don't collide when two forms share a page.
   */
  formId: string;
}

const FORM_DETACHED: FormBuilderContextValue = {
  errors: {},
  setError: () => {},
  clearErrors: () => {},
  values: {},
  setValue: () => {},
  replaceValues: () => {},
  status: "idle",
  setStatus: () => {},
  formId: "form-detached",
};

const FormBuilderContext = createContext<FormBuilderContextValue | undefined>(
  undefined,
);

export function useFormBuilderContext(): FormBuilderContextValue {
  return useContext(FormBuilderContext) ?? FORM_DETACHED;
}

/**
 * Read the current error message for a field by name. Returns
 * `undefined` when the field has no error OR the form is rendered
 * outside a FormBuilder provider.
 */
export function useFormFieldError(
  name: string | undefined,
): string | undefined {
  const ctx = useFormBuilderContext();
  if (!name) return undefined;
  return ctx.errors[name];
}

/**
 * Subscribe to the current value of a field by name. Conditional-
 * field renderers use this to flip visibility on a sibling field's
 * value. Returns `undefined` when no provider OR no value registered.
 */
export function useFormFieldValue(
  name: string | undefined,
): unknown | undefined {
  const ctx = useFormBuilderContext();
  if (!name) return undefined;
  return ctx.values[name];
}

/**
 * Register a field's live value into the form context so siblings can
 * read it. Stable across renders; cleans up on unmount.
 *
 * Fields that don't need their value visible to siblings (most
 * passive inputs) can skip this — the form's submit handler still
 * reads from native `FormData` regardless.
 */
export function useRegisterFormValue(
  name: string | undefined,
  value: unknown,
): void {
  const ctx = useFormBuilderContext();
  const last = useRef<unknown>(undefined);
  // Hold the latest `setValue` in a ref so the unmount-cleanup effect
  // can call it without listing `ctx` (whose identity changes on every
  // value update) as a dependency. Without this, the cleanup fires on
  // each context change — not just unmount — and wipes the value the
  // sibling effect just registered.
  const setValueRef = useRef(ctx.setValue);
  setValueRef.current = ctx.setValue;
  useEffect(() => {
    if (!name) return;
    if (last.current === value) return;
    last.current = value;
    ctx.setValue(name, value);
  }, [ctx, name, value]);
  useEffect(() => {
    if (!name) return;
    return () => {
      setValueRef.current(name, undefined);
    };
  }, [name]);
}

interface FormBuilderProviderProps {
  children: ReactNode;
  /** Stable id (typically derived from `useId` or the rendering identifier). */
  formId: string;
  /** Pages-edit flag flowing through to descendant placeholder slots. */
  isEditing?: boolean;
  /**
   * Optional initial error map — useful when a server-side render
   * already has validation errors to surface on hydrate.
   */
  initialErrors?: FormFieldErrors;
}

/**
 * Provider that owns the error / values / status state for a single
 * FormBuilder instance. FormBuilder mounts this around its placeholder
 * subtree; every form-X-field consumes via the hooks above.
 */
export function FormBuilderProvider({
  children,
  formId,
  isEditing,
  initialErrors,
}: FormBuilderProviderProps) {
  const [errors, setErrors] = useState<FormFieldErrors>(initialErrors ?? {});
  const [values, setValues] = useState<FormFieldValues>({});
  const [status, setStatus] = useState<FormStatus>("idle");

  const setError = useCallback((name: string, message: string | undefined) => {
    setErrors((prev) => {
      if (message === undefined || message === "") {
        if (!(name in prev)) return prev;
        const next = { ...prev };
        delete next[name];
        return next;
      }
      if (prev[name] === message) return prev;
      return { ...prev, [name]: message };
    });
  }, []);

  const clearErrors = useCallback(() => {
    setErrors((prev) => (Object.keys(prev).length === 0 ? prev : {}));
  }, []);

  const setValue = useCallback((name: string, value: unknown) => {
    setValues((prev) => {
      if (value === undefined) {
        if (!(name in prev)) return prev;
        const next = { ...prev };
        delete next[name];
        return next;
      }
      if (prev[name] === value) return prev;
      return { ...prev, [name]: value };
    });
  }, []);

  /**
   * Bulk-replace the values map. Used by FormBuilder to broadcast
   * every named input's current value on each input event, so
   * conditional fields and FormSummary react in real-time without
   * per-field wiring.
   */
  const replaceValues = useCallback((next: FormFieldValues) => {
    setValues((prev) => {
      const prevKeys = Object.keys(prev);
      const nextKeys = Object.keys(next);
      if (prevKeys.length === nextKeys.length) {
        let same = true;
        for (const k of nextKeys) {
          if (prev[k] !== next[k]) {
            same = false;
            break;
          }
        }
        if (same) return prev;
      }
      return next;
    });
  }, []);

  const ctx = useMemo<FormBuilderContextValue>(
    () => ({
      errors,
      setError,
      clearErrors,
      values,
      setValue,
      replaceValues,
      status,
      setStatus,
      isEditing,
      formId,
    }),
    [
      errors,
      setError,
      clearErrors,
      values,
      setValue,
      replaceValues,
      status,
      isEditing,
      formId,
    ],
  );

  return (
    <FormBuilderContext.Provider value={ctx}>
      {children}
    </FormBuilderContext.Provider>
  );
}
