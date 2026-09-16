"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

/**
 * Coordinates a multi-step FormBuilder. Each `<FormStep>` registers
 * itself with the wizard on mount; the wizard owns the current step
 * index, the registered step names, and the navigation API.
 *
 * Separate from FormBuilderProvider's main context because not every
 * form is a wizard — wrapping every form in a wizard provider would
 * make the indirection feel wrong on single-step forms.
 */

export interface FormWizardStep {
  /** Unique step id — matches the `<FormStep id="...">` prop. */
  id: string;
  /** Display label rendered in the stepper. */
  label: string;
}

export interface FormWizardContextValue {
  steps: FormWizardStep[];
  currentIndex: number;
  currentStep: FormWizardStep | undefined;
  /** Append (or update) a step in the registered list. Idempotent by id. */
  registerStep: (step: FormWizardStep) => void;
  /** Remove a step on unmount. */
  unregisterStep: (id: string) => void;
  /** Advance one step; clamps at the last index. */
  next: () => void;
  /** Go back one step; clamps at zero. */
  back: () => void;
  /** Jump directly. Useful for the stepper's clickable indicators. */
  goTo: (index: number) => void;
  /** True when the current step is the final one. */
  isLast: boolean;
  /** True when the current step is the first one. */
  isFirst: boolean;
}

const FormWizardContext = createContext<FormWizardContextValue | undefined>(
  undefined,
);

export function useFormWizard(): FormWizardContextValue | undefined {
  return useContext(FormWizardContext);
}

/**
 * Provider for the multi-step wizard. FormBuilder's `Wizard` variant
 * mounts this; standalone forms can mount it too if they want the
 * stepper UI without the rest of FormBuilder's chrome.
 */
export function FormWizardProvider({ children }: { children: ReactNode }) {
  const [steps, setSteps] = useState<FormWizardStep[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const registerStep = useCallback((step: FormWizardStep) => {
    setSteps((prev) => {
      const existingIndex = prev.findIndex((s) => s.id === step.id);
      const existing = prev[existingIndex];
      if (existing !== undefined) {
        if (existing.label === step.label) return prev;
        const next = [...prev];
        next[existingIndex] = step;
        return next;
      }
      return [...prev, step];
    });
  }, []);

  const unregisterStep = useCallback((id: string) => {
    setSteps((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const next = useCallback(() => {
    setCurrentIndex((prev) =>
      steps.length === 0 ? prev : Math.min(prev + 1, steps.length - 1),
    );
  }, [steps.length]);

  const back = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const goTo = useCallback(
    (index: number) => {
      setCurrentIndex(Math.max(0, Math.min(index, steps.length - 1)));
    },
    [steps.length],
  );

  const ctx = useMemo<FormWizardContextValue>(() => {
    const currentStep = steps[currentIndex];
    return {
      steps,
      currentIndex,
      currentStep,
      registerStep,
      unregisterStep,
      next,
      back,
      goTo,
      isLast: currentIndex >= steps.length - 1,
      isFirst: currentIndex === 0,
    };
  }, [steps, currentIndex, registerStep, unregisterStep, next, back, goTo]);

  return (
    <FormWizardContext.Provider value={ctx}>
      {children}
    </FormWizardContext.Provider>
  );
}
