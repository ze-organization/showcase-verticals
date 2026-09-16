"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/registry/components/ui/cta-button";
import { Card } from "@/components/registry/primitives/core/card";
import { cn } from "@/lib/registry/cn";
import { Composer } from "../composer";
import { CARD_BORDER_CLASSES, POSITION_CLASSES } from "../constants";
import { EmptyState } from "../empty-state";
import { Header } from "../header";
import { MessageRenderer } from "../message-renderer";
import { useNewChatConfirm } from "../use-new-chat-confirm";
import type { VariantProps } from "../variant-props";
import { DropOverlay } from "./drop-overlay";

/** Card-shell layouts. The floating widget uses its own variant shell. */
export type CardLayout = "default" | "compact" | "hero-collapsible";

interface CardVariantProps extends VariantProps {
  /**
   * Which card layout to render. Driven by the exported variant function
   * in `ai-chat.tsx` (`Default` / `Compact` / `HeroCollapsible`) — IS the
   * variant identity, not a discriminator prop on a single variant.
   */
  layout: CardLayout;
}

/**
 * Default / compact / hero-collapsible card shell. Focus-within polish lifted
 * from the InlineUpdateThemeWithAgent surface — border + shadow lift when any
 * child is focused.
 */
export function CardVariant(props: CardVariantProps) {
  const {
    controller,
    attachments,
    messages,
    id,
    className,
    styles,
    position,
    isEditing,
    schemeKey,
    cardBorderClass,
    assistantBubbleClass,
    assistantIconClass,
    avatarSrc,
    assistantLabel,
    assistantName,
    title,
    description,
    avatar,
    welcomeMessage,
    placeholder,
    hideWelcome,
    suggestions,
    labels,
    layout,
  } = props;

  const { hasUserMessage, isStreaming, error } = controller;
  const newChat = useNewChatConfirm(controller.handleNewChat, labels);

  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(
    layout === "hero-collapsible",
  );

  const threadHeightClass = layout === "compact" ? "h-64" : "h-72 lg:h-96";

  // Hero-collapsible: keep only the most recent exchange (last user prompt +
  // everything after) when collapsed so the hero stays focused.
  const visibleMessages = useMemo(() => {
    if (!isHistoryCollapsed) return messages;
    let lastUserIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i]?.role === "user") {
        lastUserIndex = i;
        break;
      }
    }
    return lastUserIndex === -1 ? messages : messages.slice(lastUserIndex);
  }, [messages, isHistoryCollapsed]);

  const hasHistoryBeyondCurrent = useMemo(() => {
    let userTurnCount = 0;
    for (const message of messages) {
      if (message.role === "user") userTurnCount++;
      if (userTurnCount > 1) return true;
    }
    return false;
  }, [messages]);

  return (
    <Card
      ref={controller.rootRef}
      id={id}
      className={cn(
        "component ai-chat relative flex w-full flex-col gap-0 overflow-hidden p-0",
        "rounded-[var(--card-radius,0.75rem)] border bg-background shadow-sm transition-shadow",
        "focus-within:shadow-md",
        cardBorderClass,
        POSITION_CLASSES[position],
        styles?.trimEnd(),
        className,
      )}
      onDragEnter={attachments.dndHandlers.onDragEnter}
      onDragOver={attachments.dndHandlers.onDragOver}
      onDragLeave={attachments.dndHandlers.onDragLeave}
      onDrop={attachments.dndHandlers.onDrop}
    >
      <DropOverlay
        active={attachments.isDraggingFiles}
        cardBorderClass={CARD_BORDER_CLASSES[schemeKey]}
        iconClass={assistantIconClass}
        labels={labels}
      />
      <Header
        title={title}
        description={description}
        assistantName={assistantName}
        variant={layout}
        schemeKey={schemeKey}
        isEditing={isEditing}
        showNewChat={!isEditing && hasUserMessage}
        onNewChat={newChat.request}
        labels={labels}
      />
      {newChat.dialog}
      {layout === "hero-collapsible" && hasHistoryBeyondCurrent ? (
        <div className="flex items-center justify-end border-border/60 border-b px-3 py-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setIsHistoryCollapsed((previous) => !previous)}
          >
            {isHistoryCollapsed
              ? labels.showHistoryLabel
              : labels.hideHistoryLabel}
          </Button>
        </div>
      ) : null}
      {!hasUserMessage && !hideWelcome ? (
        <div
          className={cn(
            "flex items-center justify-center",
            threadHeightClass,
            "overflow-y-auto",
          )}
        >
          <EmptyState
            welcomeMessage={welcomeMessage}
            avatar={avatar}
            avatarSrc={avatarSrc}
            assistantBubbleClass={assistantBubbleClass}
            assistantIconClass={assistantIconClass}
            suggestions={suggestions}
            onSuggestion={controller.handleSubmit}
            isEditing={isEditing}
          />
        </div>
      ) : (
        <MessageRenderer
          messages={visibleMessages}
          isStreaming={isStreaming}
          labels={labels}
          assistantLabel={assistantLabel}
          className={cn(
            "rounded-none border-0 bg-transparent",
            threadHeightClass,
          )}
          viewportClassName="px-4 py-4 space-y-4 sm:px-5"
          assistantBubbleClass={assistantBubbleClass}
          assistantIconClass={assistantIconClass}
          assistantAvatarSrc={avatarSrc}
          branches={controller.branches}
          onRegenerate={controller.handleRegenerate}
        />
      )}
      <Composer
        id={id}
        placeholder={placeholder}
        labels={labels}
        schemeKey={schemeKey}
        isStreaming={isStreaming}
        error={error}
        attachedFiles={attachments.attachedFiles}
        attachmentError={attachments.attachmentError}
        fileInputRef={attachments.fileInputRef}
        handleFilePick={attachments.handleFilePick}
        removeAttachment={attachments.removeAttachment}
        onSubmit={controller.handleSubmit}
        onStop={controller.handleStop}
      />
    </Card>
  );
}
