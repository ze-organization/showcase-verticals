"use client";

import { Suggestion } from "@/components/registry/primitives/ai-elements/chatbot/suggestion";
import { LibraryIcon } from "@/components/registry/primitives/core/library-icon";
import type { ImageSource } from "@/components/registry/primitives/editables/image";
import { Image } from "@/components/registry/primitives/editables/image";
import type { TextSource } from "@/components/registry/primitives/editables/text";
import { Text } from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import { DEFAULT_WELCOME } from "./constants";

interface EmptyStateProps {
  welcomeMessage: TextSource | undefined;
  avatar: ImageSource | undefined;
  avatarSrc: string | undefined;
  assistantBubbleClass: string;
  assistantIconClass: string;
  suggestions: string[] | undefined;
  onSuggestion: (text: string) => void;
  isEditing: boolean | undefined;
  /** Tight layout — used by the floating-widget variant. */
  compact?: boolean;
}

/**
 * Shared empty / pre-conversation state. Centered avatar, welcome
 * message, and (when set) suggestion chips. Both `card` and
 * `floating-widget` variants render this when `!hasUserMessage` so the
 * idle surface is invitational and consistent across variants.
 *
 * Drop-in replacement for the previous "static welcome bubble" (card
 * editing mode) and "Send a message to start the conversation." bare
 * text (floating widget). The welcome message field stays editable in
 * Pages chrome — the `<Text>` slot drives the marker.
 */
export function EmptyState({
  welcomeMessage,
  avatar,
  avatarSrc,
  assistantBubbleClass,
  assistantIconClass,
  suggestions,
  onSuggestion,
  isEditing,
  compact = false,
}: EmptyStateProps) {
  const avatarSize = compact ? "size-12" : "size-16";
  const avatarIconSize = compact ? "size-5" : "size-7";
  const showImage = Boolean(avatarSrc) || isEditing;
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 text-center",
        compact ? "px-4 py-6" : "px-6 py-10",
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-background ring-1",
          avatarSize,
          assistantBubbleClass,
        )}
      >
        {showImage ? (
          <Image
            value={avatar}
            alt=""
            className="size-full object-cover"
            isEditing={isEditing}
            placeholder="Avatar"
          />
        ) : (
          <LibraryIcon
            name="bot"
            className={cn(avatarIconSize, assistantIconClass)}
            aria-hidden
          />
        )}
      </div>
      <p
        className={cn(
          "max-w-md text-balance text-foreground leading-relaxed",
          compact ? "text-sm" : "text-base",
        )}
      >
        <Text
          value={welcomeMessage}
          tag="span"
          placeholder={DEFAULT_WELCOME}
          isEditing={isEditing}
        />
      </p>
      {suggestions && suggestions.length > 0 ? (
        // Wrap on narrow widths instead of horizontal-scrolling. The
        // Vercel AI Elements `<Suggestions>` wrapper forces
        // `flex-nowrap` + a hidden ScrollArea, which on a 28rem
        // floating-widget canvas (or any mobile viewport) clips chips
        // off the inline-end edge. Plain flex-wrap reads better — the
        // chip stack falls onto multiple rows and every option stays
        // tappable.
        <div className="flex w-full flex-wrap items-center justify-center gap-2">
          {suggestions.map((suggestion) => (
            <Suggestion
              key={suggestion}
              suggestion={suggestion}
              onClick={onSuggestion}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
