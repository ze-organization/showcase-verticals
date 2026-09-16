"use client";

import { registerCdpRecipe } from "@/lib/registry/analytics/cdp-events";
import formStepRecipe from "@/recipes/form-step.recipe";

registerCdpRecipe(formStepRecipe);

import { useEffect, useId } from "react";
import { getSourceText } from "@/components/registry/primitives/editables/source-normalizers";
import {
  Text,
  type TextSource,
} from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import { useFormWizard } from "@/lib/registry/forms/form-wizard-context";
import { type CmsProps, Placeholder } from "@/lib/registry/sitecore";

/**
 * One step in a multi-step wizard. Registers itself with the
 * surrounding FormWizardProvider on mount; renders its inner fields
 * placeholder ONLY when it's the active step (so non-active step
 * fields don't submit early / interfere with required-field
 * validation).
 *
 * When the surrounding form is NOT wrapped in a wizard provider
 * (single-step mode), the step renders its inner fields inline
 * without a stepper or back/next chrome — drop into a regular
 * FormBuilder without breaking anything.
 */

export interface FormStepProps extends CmsProps {
  /** Step heading rendered above the inner fields. */
  legend?: TextSource;
  description?: TextSource;
  /** Override the step id used for wizard registration. Defaults to a stable React id. */
  stepId?: string;
  /** Label shown in the stepper indicator. Falls back to the legend. */
  stepLabel?: TextSource;
  /** SXA dynamic placeholder digit — matches FormBuilder's behaviour. */
  dynamicPlaceholderId?: string;
  /**
   * Non-Sitecore escape hatch — renders the children inside the
   * step's body when no Sitecore `rendering` envelope is provided.
   * Same pattern FormBuilder uses for standalone previews.
   */
  children?: import("react").ReactNode;
}

export function Default({
  legend,
  description,
  stepId,
  stepLabel,
  styles,
  id,
  isEditing,
  rendering,
  dynamicPlaceholderId,
  children,
}: FormStepProps) {
  const autoId = useId();
  const wizard = useFormWizard();
  const ownId = stepId || autoId;
  const labelText = getSourceText(stepLabel) || getSourceText(legend) || "Step";
  const phSuffix = dynamicPlaceholderId ?? "1";
  const placeholderName = `step-fields-${phSuffix}`;

  // Self-register with the wizard. The wizard owns the active step
  // index; we re-register when the label changes so the stepper UI
  // stays in sync.
  //
  // CRITICAL: depend on the STABLE callback identities
  // (`registerStep`, `unregisterStep`), NOT the whole wizard ctx.
  // The wizard ctx is memoized off `steps`, which `registerStep`
  // mutates — so depending on `wizard` would re-fire this effect on
  // every registration, creating an infinite loop ("Maximum update
  // depth exceeded"). The callbacks themselves are `useCallback`
  // with empty deps in the provider, so they're stable for the
  // provider's lifetime.
  const registerStep = wizard?.registerStep;
  const unregisterStep = wizard?.unregisterStep;
  useEffect(() => {
    if (!registerStep || !unregisterStep) return;
    registerStep({ id: ownId, label: labelText });
    return () => unregisterStep(ownId);
  }, [registerStep, unregisterStep, ownId, labelText]);

  const isActive = wizard ? wizard.currentStep?.id === ownId : true;
  if (!isEditing && wizard && !isActive) return null;

  return (
    <section
      className={cn("flex w-full basis-full flex-col gap-4", styles?.trimEnd())}
      data-slot="form-step"
      data-step-id={ownId}
      data-active={isActive ? "true" : "false"}
      id={id || undefined}
    >
      {legend ? (
        <h3 className="font-heading font-semibold text-lg">
          <Text
            value={legend}
            tag="span"
            placeholder="Step heading"
            isEditing={isEditing}
          />
        </h3>
      ) : null}
      {description ? (
        <p className="text-muted-foreground text-sm">
          <Text
            value={description}
            tag="span"
            placeholder="Step description"
            isEditing={isEditing}
          />
        </p>
      ) : null}
      {rendering ? (
        <div className="flex w-full flex-wrap gap-6">
          <Placeholder name={placeholderName} rendering={rendering} />
        </div>
      ) : children ? (
        <div className="flex w-full flex-wrap gap-6">{children}</div>
      ) : null}
      {/*
       * Back / Next navigation lives on the FormBuilder chrome (see
       * FormBuilder's Wizard variant), NOT inside every step. Keeps
       * the nav buttons visually stable as the active step changes.
       */}
    </section>
  );
}

export const FormStep = Default;
export default Default;
export const componentType = "universal";
