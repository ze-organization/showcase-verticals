"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import type { ComponentProps, MouseEvent, ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/registry/cn";

export type SnippetChipProps = Omit<ComponentProps<"span">, "children"> & {
  /** The value to display and copy. */
  code: string;
  /** Override the displayed text. Defaults to `code`. Useful when the
   *  rendered label differs from the value (e.g. truncated UUID + full copy). */
  children?: ReactNode;
  onCopy?: () => void;
  onError?: (error: Error) => void;
  /** ms before the Copied state reverts. Default 1500. */
  timeout?: number;
};

/**
 * Inline-copyable monospace chip — sized for dense list rows where the
 * full `Snippet` (input-group chrome) would shout. The copy button is
 * hover-revealed so the chip reads as plain text at rest and stays
 * discoverable on focus / hover. For peer-of-Input value rows use the
 * full `Snippet` primitive instead.
 */
export function SnippetChip({
  code,
  children,
  className,
  onCopy,
  onError,
  timeout = 1500,
  ...props
}: SnippetChipProps) {
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef<number>(0);

  const handleCopy = useCallback(
    async (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (typeof window === "undefined" || !navigator?.clipboard?.writeText) {
        onError?.(new Error("Clipboard API not available"));
        return;
      }
      try {
        await navigator.clipboard.writeText(code);
        setIsCopied(true);
        onCopy?.();
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = window.setTimeout(
          () => setIsCopied(false),
          timeout,
        );
      } catch (error) {
        onError?.(error as Error);
      }
    },
    [code, onCopy, onError, timeout],
  );

  useEffect(
    () => () => {
      window.clearTimeout(timeoutRef.current);
    },
    [],
  );

  const Icon = isCopied ? CheckIcon : CopyIcon;

  return (
    <span
      className={cn(
        "group/snippet-chip inline-flex items-center gap-1 rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-muted-foreground",
        className,
      )}
      {...props}
    >
      <span className="truncate">{children ?? code}</span>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={isCopied ? "Copied" : "Copy to clipboard"}
        title={isCopied ? "Copied" : "Copy"}
        className={cn(
          "inline-flex size-3.5 shrink-0 items-center justify-center rounded-xs text-muted-foreground transition-opacity hover:text-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          "opacity-0 group-focus-within/snippet-chip:opacity-100 group-hover/snippet-chip:opacity-100",
          isCopied && "opacity-100",
        )}
      >
        <Icon className="size-3" aria-hidden />
      </button>
    </span>
  );
}
