import type * as React from "react";
import { cn } from "@/lib/registry/cn";

function DescriptionList({ className, ...props }: React.ComponentProps<"dl">) {
  return (
    <dl
      data-slot="description-list"
      className={cn("grid gap-2", className)}
      {...props}
    />
  );
}
DescriptionList.displayName = "DescriptionList";

function DescriptionTerm({ className, ...props }: React.ComponentProps<"dt">) {
  return (
    <dt
      data-slot="description-term"
      className={cn("font-medium text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}
DescriptionTerm.displayName = "DescriptionTerm";

function DescriptionDetails({
  className,
  ...props
}: React.ComponentProps<"dd">) {
  return (
    <dd
      data-slot="description-details"
      className={cn("text-base text-foreground", className)}
      {...props}
    />
  );
}
DescriptionDetails.displayName = "DescriptionDetails";

function DescriptionSeparator({
  className,
  ...props
}: React.ComponentProps<"dd">) {
  return (
    <dd
      data-slot="description-separator"
      className={cn("text-center text-muted-foreground", className)}
      aria-hidden="true"
      {...props}
    />
  );
}
DescriptionSeparator.displayName = "DescriptionSeparator";

export {
  DescriptionDetails,
  DescriptionList,
  DescriptionSeparator,
  DescriptionTerm,
};
