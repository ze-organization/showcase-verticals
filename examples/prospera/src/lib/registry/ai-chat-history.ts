import type { UIMessage } from "ai";

export type AIChatHistoryScope = "site" | "page";

interface HistoryOptions {
  key: string;
  scope: AIChatHistoryScope;
  pathname?: string;
}

const STORAGE_PREFIX = "ai-chat:history:";
const MAX_MESSAGES = 50;
const MAX_BYTES = 200_000;

function storageFor(scope: AIChatHistoryScope): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return scope === "site" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

function storageKey({ key, scope, pathname }: HistoryOptions): string {
  return scope === "page" && pathname
    ? `${STORAGE_PREFIX}${key}:${pathname}`
    : `${STORAGE_PREFIX}${key}`;
}

export function loadChatHistory(opts: HistoryOptions): UIMessage[] | null {
  const storage = storageFor(opts.scope);
  if (!storage) return null;
  try {
    const raw = storage.getItem(storageKey(opts));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed as UIMessage[];
  } catch {
    return null;
  }
}

export function saveChatHistory(
  opts: HistoryOptions & { messages: UIMessage[] },
): void {
  const storage = storageFor(opts.scope);
  if (!storage) return;
  const trimmed = trimMessages(opts.messages);
  try {
    storage.setItem(storageKey(opts), JSON.stringify(trimmed));
  } catch {
    // Quota or serialization failed — drop silently rather than throw mid-render.
  }
}

export function clearChatHistory(opts: HistoryOptions): void {
  const storage = storageFor(opts.scope);
  if (!storage) return;
  try {
    storage.removeItem(storageKey(opts));
  } catch {
    // Ignore.
  }
}

function trimMessages(messages: UIMessage[]): UIMessage[] {
  // Cap message count first: keep the seed assistant welcome (index 0 when
  // present) plus the most recent (MAX_MESSAGES - 1) entries.
  let trimmed = messages;
  if (messages.length > MAX_MESSAGES) {
    const head = messages[0];
    const tail = messages.slice(messages.length - (MAX_MESSAGES - 1));
    trimmed = head ? [head, ...tail] : tail;
  }
  // Then cap by serialized byte size: drop oldest non-seed entries until it
  // fits. A seed-only payload always wins (we never drop the welcome).
  let serialized = JSON.stringify(trimmed);
  while (serialized.length > MAX_BYTES && trimmed.length > 1) {
    const head = trimmed[0];
    if (!head) break;
    trimmed = [head, ...trimmed.slice(2)];
    serialized = JSON.stringify(trimmed);
  }
  return trimmed;
}
