"use client";

import { cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/registry/cn";

export interface StepperStep {
  id?: string;
  label: string;
  description?: string;
  status?: "completed" | "active" | "pending";
}

export interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: StepperStep[];
  currentStep?: number;
  orientation?: "horizontal" | "vertical";
  /** When orientation is horizontal, use "container" so vertical layout shows at narrow container width (e.g. preview mobile). Default "viewport". */
  orientationBreakpoint?: "viewport" | "container";
}

const stepIconVariants = cva(
  "flex items-center justify-center rounded-full font-medium transition-colors",
  {
    variants: {
      status: {
        completed: "bg-primary text-primary-foreground",
        active: "border-2 border-primary bg-background text-primary",
        pending: "border-2 border-border bg-background text-muted-foreground",
      },
      size: {
        default: "size-8 text-sm",
        sm: "size-6 text-xs",
        lg: "size-10 text-base",
      },
    },
    defaultVariants: {
      status: "pending",
      size: "default",
    },
  },
);

const stepLabelVariants = cva("font-medium transition-colors", {
  variants: {
    status: {
      completed: "text-foreground",
      active: "text-foreground",
      pending: "text-muted-foreground",
    },
  },
  defaultVariants: {
    status: "pending",
  },
});

const stepDescriptionVariants = cva("text-sm transition-colors", {
  variants: {
    status: {
      completed: "text-muted-foreground",
      active: "text-muted-foreground",
      pending: "text-muted-foreground/70",
    },
  },
  defaultVariants: {
    status: "pending",
  },
});

const connectorVariants = cva("transition-colors", {
  variants: {
    status: {
      completed: "bg-primary h-0.5",
      pending: "bg-border h-px",
    },
  },
  defaultVariants: {
    status: "pending",
  },
});

// Checkmark SVG path. Decorative — the parent step item already
// announces "completed" via aria-current / data-state, so this glyph
// is hidden from AT to avoid redundant announcements.
const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    aria-hidden="true"
    focusable="false"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export function Stepper({
  steps,
  currentStep,
  orientation = "horizontal",
  orientationBreakpoint: orientationBreakpointProp,
  className,
  ...props
}: StepperProps) {
  const orientationBreakpoint = orientationBreakpointProp ?? "viewport";

  // Determine step statuses based on currentStep if provided
  const stepsWithStatus = React.useMemo(() => {
    if (currentStep !== undefined) {
      return steps.map((step, index) => ({
        ...step,
        status:
          step.status ||
          (index < currentStep
            ? "completed"
            : index === currentStep
              ? "active"
              : "pending"),
      }));
    }
    return steps;
  }, [steps, currentStep]);

  const verticalContent = (
    <div className={cn("flex h-full flex-col gap-4", className)}>
      {stepsWithStatus.map((step, index) => (
        <div
          key={step.id ?? `${step.label}-${index}`}
          className="flex flex-1 gap-4"
        >
          <div className="flex flex-col items-center">
            <div
              className={cn(
                stepIconVariants({
                  status: step.status || "pending",
                }),
              )}
            >
              {step.status === "completed" ? (
                <CheckIcon className="size-4" />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            {index < stepsWithStatus.length - 1 && (
              <div
                className={cn(
                  connectorVariants({
                    status:
                      step.status === "completed" ? "completed" : "pending",
                  }),
                  "mt-2 w-0.5 flex-1",
                )}
              />
            )}
          </div>
          <div className="flex flex-1 flex-col pb-4">
            <div
              className={cn(
                stepLabelVariants({ status: step.status || "pending" }),
              )}
            >
              {step.label}
            </div>
            {step.description && (
              <div
                className={cn(
                  stepDescriptionVariants({
                    status: step.status || "pending",
                  }),
                )}
              >
                {step.description}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  if (orientation === "vertical") {
    return <div {...props}>{verticalContent}</div>;
  }

  const verticalVisibleClass =
    orientationBreakpoint === "container"
      ? "flex flex-col gap-4 h-full @[768px]:hidden"
      : "flex flex-col gap-4 h-full md:hidden";
  const horizontalVisibleClass =
    orientationBreakpoint === "container"
      ? "hidden @[768px]:block p-6 rounded-lg bg-muted w-full"
      : "hidden md:block p-6 rounded-lg bg-muted w-full";

  // Labels render BELOW the icons in horizontal mode. Each step claims
  // equal `flex-1` width with `min-w-0` so labels can truncate instead
  // of pushing the row past the parent. The connector to the previous
  // step is absolutely positioned at the icon's vertical center and
  // spans `w-full` of the step item — anchored by `end-1/2` at this
  // icon's center, it ends at the previous icon's center.
  //
  // Connector color follows the PRIOR step's status (Material UI
  // semantic): a connector reading "completed" means "the step on its
  // start side is done". Pending connectors render a 1px line; the
  // completed variant bumps to 2px so the progress is visible at a
  // glance.
  return (
    <div {...props}>
      <div className={cn(verticalVisibleClass, className)}>
        {verticalContent}
      </div>
      <div className={cn(horizontalVisibleClass, className)}>
        <ol className="flex w-full min-w-0 list-none">
          {stepsWithStatus.map((step, index) => {
            const status = step.status || "pending";
            const prevStatus =
              index > 0
                ? stepsWithStatus[index - 1]?.status || "pending"
                : undefined;
            return (
              <li
                key={step.id ?? `${step.label}-${index}`}
                className="relative flex min-w-0 flex-1 flex-col items-center gap-2 px-2"
              >
                {index > 0 && (
                  <span
                    aria-hidden
                    className={cn(
                      "absolute end-1/2 top-4 w-full",
                      connectorVariants({
                        status:
                          prevStatus === "completed" ? "completed" : "pending",
                      }),
                    )}
                  />
                )}
                <span
                  className={cn(
                    stepIconVariants({ status, size: "default" }),
                    "relative z-10 shrink-0",
                  )}
                  aria-current={status === "active" ? "step" : undefined}
                >
                  {status === "completed" ? (
                    <CheckIcon className="size-4" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </span>
                <div className="min-w-0 max-w-full text-center">
                  <div
                    className={cn(
                      stepLabelVariants({ status }),
                      "truncate text-sm",
                    )}
                    title={step.label}
                  >
                    {step.label}
                  </div>
                  {step.description && (
                    <div
                      className={cn(
                        stepDescriptionVariants({ status }),
                        "truncate text-xs",
                      )}
                      title={step.description}
                    >
                      {step.description}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
