"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/registry/primitives/core/tooltip";

interface CopyableTokenProps {
  token: string;
}

async function copyToClipboard(value: string) {
  await navigator.clipboard.writeText(value);
}

export function CopyableToken({ token }: CopyableTokenProps) {
  const handleCopy = async () => {
    await copyToClipboard(token);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {/* A real <button> for the click/keyboard affordance (Enter/Space fire
            onClick natively); the inner <code> keeps the monospace token
            semantic without needing role="button" on a non-interactive tag. */}
        <button
          type="button"
          dir="ltr"
          aria-label="Copy token to clipboard"
          onClick={() => void handleCopy()}
          className="inline-block cursor-pointer rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm outline-none transition-colors hover:bg-muted-hover focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <code>{token}</code>
        </button>
      </TooltipTrigger>
      <TooltipContent>Copy to clipboard</TooltipContent>
    </Tooltip>
  );
}
