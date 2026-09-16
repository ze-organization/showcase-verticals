"use client";

import * as React from "react";
import { Input } from "@/components/registry/primitives/core/input";
import { ThemeIcon } from "@/components/registry/primitives/core/theme-icon";
import { cn } from "@/lib/registry/cn";

export interface PasswordInputProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof Input>,
    "type" | "value" | "defaultValue"
  > {
  value?: string;
  defaultValue?: string;
  /** Accessible label for the show/hide toggle. */
  toggleLabel?: (visible: boolean) => string;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(
    {
      className,
      toggleLabel = (visible) => (visible ? "Hide password" : "Show password"),
      ...props
    },
    ref,
  ) {
    const [visible, setVisible] = React.useState(false);
    const toggleId = React.useId();

    return (
      <div
        data-slot="password-input"
        className={cn(
          "flex items-center rounded-(--radius-md,0.5rem) border border-(--input-border,var(--color-border)) bg-(--input-background,var(--color-background)) [border-width:var(--input-border-width,1px)]",
          "focus-within:border-primary focus-within:ring-1 focus-within:ring-primary",
          "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        )}
      >
        <Input
          ref={ref}
          type={visible ? "text" : "password"}
          data-slot="password-input-field"
          aria-describedby={toggleId}
          className={cn("border-0 focus-visible:ring-0", className)}
          {...props}
        />
        <button
          id={toggleId}
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="flex size-10 shrink-0 items-center justify-center text-muted-foreground outline-none hover:text-foreground focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
          aria-label={toggleLabel(visible)}
        >
          {visible ? (
            <ThemeIcon name="eye-off" className="size-4" aria-hidden />
          ) : (
            <ThemeIcon name="eye" className="size-4" aria-hidden />
          )}
        </button>
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
