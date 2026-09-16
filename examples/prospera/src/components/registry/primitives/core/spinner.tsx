import type * as React from "react";

import { cn } from "@/lib/registry/cn";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "default" | "label";
  colorScheme?: "primary" | "neutral" | "success" | "destructive" | "warning";
  message?: string;
  withOverlay?: boolean;
  fullscreen?: boolean;
}

const sizeClasses = {
  xs: "size-3",
  sm: "size-4",
  md: "size-6",
  lg: "size-8",
  xl: "size-12",
};

const strokeClasses = {
  xs: "border-2",
  sm: "border-2",
  md: "border-[3px]",
  lg: "border-4",
  xl: "border-4",
};

const colorClasses = {
  primary: "text-primary",
  neutral: "text-neutral",
  success: "text-success",
  destructive: "text-destructive",
  warning: "text-warning",
};

function Spinner({
  size = "sm",
  variant = "default",
  colorScheme = "primary",
  message = "Loading",
  className,
  withOverlay = false,
  fullscreen = false,
  role = "status",
  "aria-label": ariaLabel = "Loading",
  ...props
}: SpinnerProps) {
  const spinnerClasses = cn(
    "inline-block rounded-full animate-spin",
    strokeClasses[size],
    "border-t-current border-e-current border-b-border border-s-border",
    colorClasses[colorScheme],
    sizeClasses[size],
    className,
  );

  const spinnerOnly = (
    // biome-ignore lint/a11y/useAriaPropsSupportedByRole: role is a runtime prop defaulting to "status" (a live-region role that supports aria-label); biome can't statically resolve the dynamic role binding.
    <div
      className={spinnerClasses}
      data-testid="spinner"
      data-color-scheme={colorScheme}
      role={role}
      aria-label={ariaLabel}
      {...props}
    />
  );

  const spinnerWithLabel = (
    <div className="flex flex-col items-center text-center">
      {spinnerOnly}
      {variant === "label" && message ? (
        <p className="mt-6 text-muted-foreground text-sm">{message}</p>
      ) : null}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90">
        {spinnerWithLabel}
      </div>
    );
  }

  if (withOverlay) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background/90">
        {spinnerWithLabel}
      </div>
    );
  }

  if (variant === "label" && message) {
    return spinnerWithLabel;
  }

  return spinnerOnly;
}

export { Spinner, type SpinnerProps };
