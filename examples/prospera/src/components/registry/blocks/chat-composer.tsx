"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/registry/primitives/core/button";
import { Field, FieldLabel } from "@/components/registry/primitives/core/field";
import { Textarea } from "@/components/registry/primitives/core/textarea";
import { cn } from "@/lib/registry/cn";

export interface ChatComposerProps {
  placeholder?: string;
  submitLabel?: string;
  disabled?: boolean;
  className?: string;
  onSubmit: (value: string) => void;
}

/**
 * Composer with Enter-to-send and Shift+Enter newline behavior.
 */
export function ChatComposer({
  placeholder = "Ask something...",
  submitLabel = "Send",
  disabled = false,
  className,
  onSubmit,
}: ChatComposerProps) {
  const [value, setValue] = useState("");

  const submit = useCallback(() => {
    const next = value.trim();
    if (!next || disabled) return;
    onSubmit(next);
    setValue("");
  }, [disabled, onSubmit, value]);

  return (
    <div className={cn("rounded-lg border bg-card p-3", className)}>
      <Field className="gap-2">
        <FieldLabel htmlFor="chat-composer-input" className="sr-only">
          Chat message
        </FieldLabel>
        <Textarea
          id="chat-composer-input"
          rows={3}
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          className="min-h-20 resize-y"
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== "Enter" || event.shiftKey) return;
            event.preventDefault();
            submit();
          }}
        />
      </Field>
      <div className="mt-2 flex items-center justify-end">
        <Button
          type="button"
          size="sm"
          disabled={disabled || value.trim().length === 0}
          onClick={submit}
        >
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}

export default ChatComposer;
