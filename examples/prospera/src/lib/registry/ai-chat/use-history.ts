"use client";

import type { UIMessage } from "ai";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import {
  type AIChatHistoryScope,
  clearChatHistory,
  loadChatHistory,
  saveChatHistory,
} from "@/lib/registry/ai-chat-history";

interface UseChatHistoryOptions {
  /** Stable handle (instanceKey ?? id). Falsy disables persistence entirely. */
  key: string | undefined;
  scope: AIChatHistoryScope;
  enabled: boolean;
  /** `useChat`'s current messages. */
  messages: UIMessage[];
  /** `useChat`'s status — only `"ready"` writes get persisted. */
  status: "submitted" | "streaming" | "ready" | "error";
  /** `useChat`'s setMessages, used for hydrate + reset. */
  setMessages: (messages: UIMessage[]) => void;
  /**
   * Initial seed (welcome bubble or caller's explicit messages). Used for
   * `reset()` and as the floor when deciding whether to persist.
   */
  seedMessages: UIMessage[];
}

export function useChatHistory({
  key,
  scope,
  enabled,
  messages,
  status,
  setMessages,
  seedMessages,
}: UseChatHistoryOptions) {
  const pathname = usePathname() ?? "/";
  const active = Boolean(enabled && key);
  const lastSavedRef = useRef<string | null>(null);
  const hydratedRef = useRef(false);

  // Hydrate from storage on mount.
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally mount-only — reload-restore reads storage once
  useEffect(() => {
    if (!active || !key) return;
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    const stored = loadChatHistory({ key, scope, pathname });
    if (stored && stored.length > 0) {
      setMessages(stored);
      lastSavedRef.current = JSON.stringify(stored);
    }
  }, [active, key, scope]);

  // Persist after streaming settles.
  useEffect(() => {
    if (!active || !key) return;
    if (!hydratedRef.current) return;
    if (status !== "ready") return;
    // Don't persist if we're still at the seed (nothing meaningful to save).
    if (messages.length <= seedMessages.length) return;
    const serialized = JSON.stringify(messages);
    if (serialized === lastSavedRef.current) return;
    saveChatHistory({ key, scope, pathname, messages });
    lastSavedRef.current = serialized;
  }, [active, key, scope, pathname, status, messages, seedMessages.length]);

  const reset = useCallback(() => {
    if (active && key) {
      clearChatHistory({ key, scope, pathname });
    }
    lastSavedRef.current = null;
    setMessages(seedMessages);
  }, [active, key, scope, pathname, setMessages, seedMessages]);

  return { reset };
}
