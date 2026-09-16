"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/registry/primitives/core/scroll-area";
import { cn } from "@/lib/registry/cn";
import type { ChatMessage as ChatMessageModel } from "./chat.types";
import ChatMessage, { type ChatMessageStyle } from "./chat-message";

export interface ChatThreadProps {
  messages: ChatMessageModel[];
  /** Accepts a string OR ReactNode so callers can pass an editable slot. */
  assistantLabel?: ReactNode;
  userLabel?: ReactNode;
  className?: string;
  viewportClassName?: string;
  /** Forwarded to every ChatMessage. Defaults to `"bubbles"`. */
  style?: ChatMessageStyle;
  /** Forwarded to each assistant ChatMessage as `assistantBubbleClass`. */
  assistantBubbleClass?: string;
  /** Forwarded to each assistant ChatMessage as `assistantIconClass`. */
  assistantIconClass?: string;
  /** Forwarded to each assistant ChatMessage as `assistantAvatarSrc`. */
  assistantAvatarSrc?: string;
}

/**
 * Scrollable conversation thread that auto-scrolls to latest message.
 */
export function ChatThread({
  messages,
  assistantLabel,
  userLabel,
  className,
  viewportClassName,
  style,
  assistantBubbleClass,
  assistantIconClass,
  assistantAvatarSrc,
}: ChatThreadProps) {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messages.length === 0) return;
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  return (
    <ScrollArea
      className={cn(
        "min-h-56 w-full rounded-lg border bg-background",
        className,
      )}
    >
      <ul
        className={cn("space-y-3 p-3 sm:p-4", viewportClassName)}
        aria-live="polite"
      >
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            assistantLabel={assistantLabel}
            userLabel={userLabel}
            style={style}
            assistantBubbleClass={assistantBubbleClass}
            assistantIconClass={assistantIconClass}
            assistantAvatarSrc={assistantAvatarSrc}
          />
        ))}
        <div ref={endRef} />
      </ul>
    </ScrollArea>
  );
}

export default ChatThread;
