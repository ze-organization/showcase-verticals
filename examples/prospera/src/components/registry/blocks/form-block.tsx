import type React from "react";
import { cn } from "@/lib/registry/cn";

export type FormBlockProps = React.ComponentProps<"form">;

/**
 * Shared form shell for Sitecore blocks.
 */
export function FormBlock({ className, ...props }: FormBlockProps) {
  return <form className={cn("w-full", className)} {...props} />;
}

// Default export so the Sitecore Content SDK's component-map lookup
// (`component.default || component.Default || component`) resolves to the
// React component instead of falling through to the entire module
// namespace, which would break RSC serialization when the rendering is
// placed in a placeholder.
export default FormBlock;

/**
 * Sitecore default variant. Aliases `FormBlock` so the SDK's variant
 * lookup (`componentMap.get("form-block").Default`) resolves — same
 * pattern as the other components in this directory.
 */
export const Default = FormBlock;
