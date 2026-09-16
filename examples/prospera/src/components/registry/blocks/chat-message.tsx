"use client";

import type { ReactNode } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { LibraryIcon } from "@/components/registry/primitives/core/library-icon";
import { Prose } from "@/components/registry/primitives/core/prose";
import { Image } from "@/components/registry/primitives/editables/image";
import { cn } from "@/lib/registry/cn";
import type { ChatMessage as ChatMessageModel } from "./chat.types";

/**
 * Visual mode for the message row.
 *   - `"bubbles"`  Both roles render as filled rounded bubbles. Familiar
 *                  and didactic — used by the chat-preview showcase to
 *                  demonstrate the message-block primitive standalone.
 *   - `"minimal"`  Assistant renders as plain prose with a small avatar
 *                  in the start margin (ChatGPT / Claude.ai shape). User
 *                  keeps a subtle muted pill bubble with an asymmetric
 *                  tail corner. Easier on the eye for long replies and
 *                  matches the new ai-chat shell.
 */
export type ChatMessageStyle = "bubbles" | "minimal";

export interface ChatMessageProps {
  message: ChatMessageModel;
  /**
   * Label shown beside the assistant's name. Accepts a string OR a
   * ReactNode so callers can pass a Sitecore `<Text isEditing>` slot
   * and authors can click-to-edit the assistant name in Pages chrome.
   */
  assistantLabel?: ReactNode;
  userLabel?: ReactNode;
  className?: string;
  /** Visual mode. Defaults to `"bubbles"`. */
  style?: ChatMessageStyle;
  /**
   * Tailwind classes layered onto the assistant bubble (ring color,
   * background tint, etc.) — e.g. `"ring-primary/30 bg-primary/5"`.
   * Optional; defaults to the neutral card chrome. Has no effect on
   * user or system bubbles. In `"minimal"` mode this targets the
   * avatar circle ring + background instead of a bubble.
   */
  assistantBubbleClass?: string;
  /**
   * Tailwind classes for the assistant icon color — e.g.
   * `"text-primary"`. Pairs with `assistantBubbleClass` so the icon and
   * ring read as one tinted unit.
   */
  assistantIconClass?: string;
  /**
   * Resolved URL for the assistant avatar. Only rendered in `"minimal"`
   * mode (where the avatar circle in the start margin is the primary
   * identity affordance). Pass `undefined` to fall back to a generic
   * bot icon.
   */
  assistantAvatarSrc?: string;
}

const formatTimestamp = (value?: string) => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  return `${hours}:${minutes} UTC`;
};

/** Derived role flags + label shared by both visual modes. */
type ResolvedRole = {
  isUser: boolean;
  isSystem: boolean;
  isAssistant: boolean;
  label: ReactNode;
};

const resolveRole = (
  message: ChatMessageModel,
  assistantLabel: ReactNode,
  userLabel: ReactNode,
): ResolvedRole => {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";
  return {
    isUser,
    isSystem,
    isAssistant: !isUser && !isSystem,
    label: isUser ? userLabel : isSystem ? "System" : assistantLabel,
  };
};

/** Minimal mode: prose + start-margin avatar for assistant/system. */
function MinimalChatMessage({
  message,
  role,
  className,
  assistantBubbleClass,
  assistantIconClass,
  assistantAvatarSrc,
  timestamp,
  streamingCursor,
}: {
  message: ChatMessageModel;
  role: ResolvedRole;
  className?: string;
  assistantBubbleClass?: string;
  assistantIconClass?: string;
  assistantAvatarSrc?: string;
  timestamp?: string;
  streamingCursor: ReactNode;
}) {
  const { isUser, isSystem, isAssistant, label } = role;
  return (
    <li className={cn("flex w-full gap-3", isUser && "justify-end", className)}>
      {!isUser ? (
        <div
          className={cn(
            // No ring outline — the avatar reads as a floating image
            // pinned to the start margin rather than a UI chip.
            "flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full",
            isAssistant && assistantBubbleClass,
          )}
        >
          {isAssistant && assistantAvatarSrc ? (
            // Editable <Image> (plain-{src} branch renders an unoptimized
            // <img>): avatars are author-supplied CDN URLs; the next/image
            // remote-pattern allowlist would otherwise need every customer's
            // CDN host.
            <Image
              value={{ src: assistantAvatarSrc, alt: "" }}
              className="size-full object-cover"
            />
          ) : (
            <LibraryIcon
              name={isSystem ? "info" : "bot"}
              className={cn("size-3.5", isAssistant && assistantIconClass)}
              aria-hidden
            />
          )}
        </div>
      ) : null}
      <div
        className={cn(
          "flex min-w-0 flex-col gap-1",
          // User column caps width here so the inner bubble can stay
          // `w-fit` and grow with content. The previous arrangement
          // (`max-w-[85%]` on the bubble inside an auto-sized column)
          // resolved to a tiny effective width — short messages would
          // wrap after every word because the percentage was relative
          // to a column with no defined width to anchor against.
          isUser ? "max-w-[85%] items-end" : "flex-1",
        )}
      >
        <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide opacity-60">
          <span className="font-medium">{label}</span>
          {timestamp ? <span className="opacity-60">{timestamp}</span> : null}
        </div>
        {isAssistant ? (
          // Assistant replies are LLM-generated and routinely include
          // markdown: bold, headings, lists, fenced code, tables. The
          // previous plain-text render leaked literal `**heading**`
          // tokens into the UI. `remark-gfm` adds GitHub-flavored
          // markdown (tables, strikethrough, autolinks, task lists).
          // The streaming cursor sits outside the Markdown subtree so
          // it doesn't get parsed.
          <div className="text-sm leading-relaxed">
            <Prose className="prose-sm dark:prose-invert max-w-none *:first:mt-0 *:last:mb-0">
              <Markdown remarkPlugins={[remarkGfm]}>{message.content}</Markdown>
            </Prose>
            {streamingCursor}
          </div>
        ) : (
          <div
            className={cn(
              "wrap-break-word whitespace-pre-wrap text-sm leading-relaxed",
              isUser &&
                "w-fit rounded-2xl rounded-be-sm bg-muted px-3.5 py-2 text-foreground",
              isSystem && "text-muted-foreground",
            )}
          >
            {message.content}
            {streamingCursor}
          </div>
        )}
      </div>
    </li>
  );
}

/** Bubbles mode: both roles render as filled rounded bubbles. */
function BubbleChatMessage({
  message,
  role,
  className,
  assistantBubbleClass,
  assistantIconClass,
  timestamp,
  streamingCursor,
}: {
  message: ChatMessageModel;
  role: ResolvedRole;
  className?: string;
  assistantBubbleClass?: string;
  assistantIconClass?: string;
  timestamp?: string;
  streamingCursor: ReactNode;
}) {
  const { isUser, isSystem, isAssistant, label } = role;
  return (
    <li
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start",
        className,
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-xl px-3 py-2",
          isUser
            ? "bg-primary text-primary-foreground"
            : isSystem
              ? "bg-muted text-muted-foreground"
              : "bg-card text-card-foreground ring-1 ring-border",
          // Assistant-only tint hook. Applied AFTER the neutral defaults
          // so a passed `ring-primary/30 bg-primary/5` overrides the
          // default border ring without the caller having to negate
          // anything first.
          isAssistant && assistantBubbleClass,
        )}
      >
        <div className="mb-1 flex items-center gap-1.5">
          {!isUser ? (
            <LibraryIcon
              name={isSystem ? "info" : "bot"}
              className={cn("size-3.5", isAssistant && assistantIconClass)}
              aria-hidden
            />
          ) : null}
          <span className="font-medium text-[11px] uppercase tracking-wide opacity-80">
            {label}
          </span>
          {timestamp ? (
            <span className="text-[11px] opacity-60">{timestamp}</span>
          ) : null}
        </div>
        {/*
          `text-inherit` defeats globals.css's base `p { color: var(--muted-foreground); }`
          rule. Without it the parent bubble's `text-{scheme}-foreground`
          loses to the base rule and the user message text reads as dark
          muted on the saturated colored bubble (visible "dark text on
          dark blue" regression). The bubble owns the text colour now,
          via its parent class — the `<p>` just inherits.
        */}
        <p className="wrap-break-word whitespace-pre-wrap text-inherit text-sm leading-relaxed">
          {message.content}
          {streamingCursor}
        </p>
      </div>
    </li>
  );
}

/**
 * Renders an individual chat bubble with role-specific styling.
 */
export function ChatMessage({
  message,
  assistantLabel = "Assistant",
  userLabel = "You",
  className,
  style = "bubbles",
  assistantBubbleClass,
  assistantIconClass,
  assistantAvatarSrc,
}: ChatMessageProps) {
  const role = resolveRole(message, assistantLabel, userLabel);
  const timestamp = formatTimestamp(message.createdAt);

  const streamingCursor =
    message.status === "streaming" ? (
      <span className="ms-1 inline-block animate-pulse text-current opacity-60">
        |
      </span>
    ) : null;

  // Minimal: assistant/system render as prose with an avatar in the
  // start margin, user keeps a subtle muted pill bubble. User content
  // text leans on `text-foreground` rather than the saturated
  // `text-primary-foreground` so the bubble reads as "your message"
  // without aggressively pulling the eye.
  if (style === "minimal") {
    return (
      <MinimalChatMessage
        message={message}
        role={role}
        className={className}
        assistantBubbleClass={assistantBubbleClass}
        assistantIconClass={assistantIconClass}
        assistantAvatarSrc={assistantAvatarSrc}
        timestamp={timestamp}
        streamingCursor={streamingCursor}
      />
    );
  }

  return (
    <BubbleChatMessage
      message={message}
      role={role}
      className={className}
      assistantBubbleClass={assistantBubbleClass}
      assistantIconClass={assistantIconClass}
      timestamp={timestamp}
      streamingCursor={streamingCursor}
    />
  );
}

export default ChatMessage;
