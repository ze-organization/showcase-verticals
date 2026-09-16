import type * as React from "react";
import { cn } from "@/lib/registry/cn";

function StatRoot({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="stat"
      className={cn("flex flex-col gap-1", className)}
      {...props}
    />
  );
}
StatRoot.displayName = "Stat";

function StatLabel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="stat-label"
      className={cn(
        "wrap-break-word font-medium text-muted-foreground text-sm",
        className,
      )}
      {...props}
    />
  );
}
StatLabel.displayName = "StatLabel";

function StatValue({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="stat-value"
      className={cn(
        "wrap-break-word font-semibold text-2xl text-foreground tabular-nums tracking-tight",
        className,
      )}
      {...props}
    />
  );
}
StatValue.displayName = "StatValue";

function StatChange({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="stat-change"
      className={cn(
        "flex items-center gap-2 text-muted-foreground text-sm",
        className,
      )}
      {...props}
    />
  );
}
StatChange.displayName = "StatChange";

/** Key-value pair (term + value). Use for simple label-value rows. */
function KeyValue({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="key-value"
      className={cn("flex flex-col gap-0.5", className)}
      {...props}
    />
  );
}
KeyValue.displayName = "KeyValue";

function KeyValueTerm({ className, ...props }: React.ComponentProps<"dt">) {
  return (
    <dt
      data-slot="key-value-term"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}
KeyValueTerm.displayName = "KeyValueTerm";

function KeyValueValue({ className, ...props }: React.ComponentProps<"dd">) {
  return (
    <dd
      data-slot="key-value-value"
      className={cn("font-medium text-base text-foreground", className)}
      {...props}
    />
  );
}
KeyValueValue.displayName = "KeyValueValue";

export {
  KeyValue,
  KeyValueTerm,
  KeyValueValue,
  StatChange,
  StatLabel,
  StatRoot as Stat,
  StatValue,
};
