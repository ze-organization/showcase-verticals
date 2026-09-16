"use client";

import { Paperclip } from "lucide-react";
import { cn } from "@/lib/registry/cn";
import type { ResolvedAIChatLabels } from "../labels";

interface DropOverlayProps {
  active: boolean;
  cardBorderClass: string;
  iconClass: string;
  labels: ResolvedAIChatLabels;
}

/**
 * Drop-zone overlay shown while the user drags files over the panel.
 */
export function DropOverlay({
  active,
  cardBorderClass,
  iconClass,
  labels,
}: DropOverlayProps) {
  if (!active) return null;
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-30 flex items-center justify-center rounded-2xl border-2 border-dashed bg-background/85 backdrop-blur-sm",
        cardBorderClass,
      )}
      aria-hidden
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <Paperclip
          className={cn("size-6", iconClass || "text-foreground")}
          aria-hidden
        />
        <p className="font-medium text-sm">{labels.dropTitle}</p>
        <p className="text-muted-foreground text-xs">
          {labels.dropDescription}
        </p>
      </div>
    </div>
  );
}
