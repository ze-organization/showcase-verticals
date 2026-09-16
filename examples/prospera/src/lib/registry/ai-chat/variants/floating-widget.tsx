"use client";

import { MessageCircle, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/registry/components/ui/cta-button";
import { LibraryIcon } from "@/components/registry/primitives/core/library-icon";
import { Image } from "@/components/registry/primitives/editables/image";
import { getSourceText } from "@/components/registry/primitives/editables/source-normalizers";
import { cn } from "@/lib/registry/cn";
import { Composer } from "../composer";
import {
  CARD_BORDER_CLASSES,
  LAUNCHER_SIZE_CLASSES,
  PANEL_SIZE_CLASSES,
  WIDGET_PLACEMENT_CLASSES,
} from "../constants";
import { EmptyState } from "../empty-state";
import { Header } from "../header";
import { formatLabel } from "../labels";
import { MessageRenderer } from "../message-renderer";
import type {
  AIChatColorScheme,
  AIChatLauncherIcon,
  AIChatLauncherShape,
  AIChatLauncherSize,
  AIChatLauncherStyle,
  AIChatWidgetPlacement,
} from "../types";
import { useNewChatConfirm } from "../use-new-chat-confirm";
import type { VariantProps } from "../variant-props";
import { DropOverlay } from "./drop-overlay";

/**
 * Floating-widget variant. A round launcher button fixes to the viewport's
 * end-bottom corner; clicking opens a slide-up panel. The panel stays mounted
 * across open/close (so streaming, message history, attachments, mic baseline
 * survive) — only `opacity-0 translate-y-3 pointer-events-none` hide it.
 */
export function FloatingWidgetVariant(props: VariantProps) {
  const {
    controller,
    attachments,
    messages,
    id,
    className,
    styles,
    isEditing,
    schemeKey,
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
  } = props;

  const { hasUserMessage, isStreaming, error } = controller;
  // `defaultOpen` only seeds the initial client state — SSR and the
  // first client render agree (deterministic markup for screenshots);
  // expansion stays a purely client-side toggle after that.
  const [open, setOpen] = useState(props.defaultOpen);
  const newChat = useNewChatConfirm(controller.handleNewChat, labels);

  const titleText = getSourceText(title);
  const widgetTitle = titleText ?? labels.widgetTitleFallback;
  const cardBorderClass = CARD_BORDER_CLASSES[schemeKey];
  const placementClasses = WIDGET_PLACEMENT_CLASSES[props.placement];

  return (
    <div
      ref={controller.rootRef}
      className={cn("component ai-chat", styles?.trimEnd(), className)}
      id={id}
    >
      <div
        className={cn(
          // Radius + shadow follow the brand's card chrome tokens; the
          // shadow fallback keeps a strong floating elevation for themes
          // that don't define --card-shadow.
          "fixed z-40 flex flex-col overflow-hidden rounded-[var(--card-radius,0.75rem)] border bg-background shadow-[var(--card-shadow,0_24px_60px_-20px_rgba(0,0,0,0.35))] transition-all duration-200 ease-out",
          placementClasses.panel,
          PANEL_SIZE_CLASSES[props.panelSize],
          "focus-within:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.35)]",
          cardBorderClass,
          open
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-3 opacity-0",
        )}
        aria-hidden={!open}
        onDragEnter={attachments.dndHandlers.onDragEnter}
        onDragOver={attachments.dndHandlers.onDragOver}
        onDragLeave={attachments.dndHandlers.onDragLeave}
        onDrop={attachments.dndHandlers.onDrop}
      >
        <DropOverlay
          active={attachments.isDraggingFiles}
          cardBorderClass={cardBorderClass}
          iconClass={assistantIconClass}
          labels={labels}
        />
        <Header
          title={title}
          description={description}
          assistantName={assistantName}
          variant="default"
          schemeKey={schemeKey}
          isEditing={isEditing}
          showNewChat={hasUserMessage && !isEditing}
          onNewChat={newChat.request}
          avatar={avatar}
          avatarSrc={avatarSrc}
          avatarBubbleClass={assistantBubbleClass}
          avatarIconClass={assistantIconClass}
          compact
          onClose={() => setOpen(false)}
          labels={labels}
          headerStyle={props.panelHeaderStyle}
        />
        {newChat.dialog}
        <div className="flex min-h-0 flex-1 flex-col">
          {hasUserMessage ? (
            <MessageRenderer
              messages={messages}
              isStreaming={isStreaming}
              labels={labels}
              assistantLabel={assistantLabel}
              className="min-h-0 flex-1 rounded-none border-0 bg-transparent"
              viewportClassName="px-4 py-4 space-y-4"
              assistantBubbleClass={assistantBubbleClass}
              assistantIconClass={assistantIconClass}
              assistantAvatarSrc={avatarSrc}
              branches={controller.branches}
              onRegenerate={controller.handleRegenerate}
            />
          ) : !hideWelcome ? (
            <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto">
              <EmptyState
                welcomeMessage={welcomeMessage}
                avatar={avatar}
                avatarSrc={avatarSrc}
                assistantBubbleClass={assistantBubbleClass}
                assistantIconClass={assistantIconClass}
                suggestions={suggestions}
                onSuggestion={controller.handleSubmit}
                isEditing={isEditing}
                compact
              />
            </div>
          ) : (
            <div className="flex-1" />
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
            compact
          />
        </div>
      </div>
      <Launcher
        open={open}
        onOpen={() => {
          setOpen(true);
          controller.handleWidgetOpened();
        }}
        widgetTitle={widgetTitle}
        schemeKey={schemeKey}
        shape={props.launcherShape}
        style={props.launcherStyle}
        icon={props.launcherIcon}
        labelText={getSourceText(props.launcherLabel)}
        size={props.launcherSize}
        placement={props.placement}
        avatarSrc={avatarSrc}
        assistantInitial={widgetTitle.slice(0, 1) || "A"}
        openLabelTemplate={labels.openLauncherLabel}
      />
    </div>
  );
}

interface LauncherProps {
  open: boolean;
  onOpen: () => void;
  widgetTitle: string;
  schemeKey: AIChatColorScheme;
  shape: AIChatLauncherShape;
  style: AIChatLauncherStyle;
  icon: AIChatLauncherIcon;
  labelText: string | undefined;
  size: AIChatLauncherSize;
  placement: AIChatWidgetPlacement;
  avatarSrc: string | undefined;
  assistantInitial: string;
  /** `{title}` template for the launcher's aria-label. */
  openLabelTemplate: string;
}

/**
 * Floating launcher. Author-configurable along six axes:
 *
 *   shape      round (default) | pill (wider, fits a label)
 *   style      solid | outline | gradient
 *   icon       avatar (default, bot-fallback) | letter | bot | chat | sparkle
 *   label      optional string (rendered when shape="pill")
 *   size       compact | default | large
 *   placement  bottom-end (default) | bottom-start (logical; flips in RTL)
 *
 * The closed launcher is the assistant's face, so `avatar` is the
 * default — it renders the chat's Avatar image and falls back to the
 * generic bot icon only when no avatar is set.
 *
 * Gradient style auto-picks the matching `*-gradient` colorScheme on the
 * underlying CTA button, so the launcher gets the brand's gradient
 * treatment without authors needing to also flip the chat's colorScheme.
 */
function Launcher({
  open,
  onOpen,
  widgetTitle,
  schemeKey,
  shape,
  style,
  icon,
  labelText,
  size,
  placement,
  avatarSrc,
  assistantInitial,
  openLabelTemplate,
}: LauncherProps) {
  const baseScheme = schemeKey === "neutral" ? "primary" : schemeKey;
  // Gradient style: route to the matching *-gradient scheme on the
  // primitive Button. Falls through to the base scheme when the
  // current colorScheme has no gradient counterpart.
  const gradientScheme =
    baseScheme === "secondary" || baseScheme === "secondary-gradient"
      ? "secondary-gradient"
      : "primary-gradient";
  const buttonScheme = style === "gradient" ? gradientScheme : baseScheme;
  const buttonVariant = style === "outline" ? "outline" : "default";

  // Pill shape → render the label (falls back to the widget title).
  const showLabel =
    shape === "pill" && (Boolean(labelText) || icon === "letter");

  // Resolve the launcher face based on `icon`. `avatar` shows the
  // Avatar image and falls back to the bot icon when none is set, so the
  // closed launcher always carries a recognisable assistant face.
  let glyph: React.ReactNode;
  if (icon === "avatar" && avatarSrc) {
    glyph = (
      <Image
        value={{ src: avatarSrc, alt: "" }}
        className={cn(
          "object-cover",
          shape === "round" ? "size-full" : "size-7 rounded-full",
        )}
      />
    );
  } else if (icon === "letter") {
    glyph = (
      <span className="font-semibold text-base leading-none">
        {assistantInitial.toUpperCase()}
      </span>
    );
  } else if (icon === "chat") {
    // Chat-bubble glyph — same MessageCircle the icon-name@1
    // vocabulary's `chat` resolves to.
    glyph = <MessageCircle className="size-5" aria-hidden />;
  } else if (icon === "sparkle") {
    // AI-assistant sparkles — the "Ask AI" affordance convention.
    glyph = <Sparkles className="size-5" aria-hidden />;
  } else {
    // `bot`, or `avatar` with no image set → the generic bot icon.
    glyph = <LibraryIcon name="bot" className="size-5" aria-hidden />;
  }

  const ariaLabel = formatLabel(openLabelTemplate, {
    title: labelText || widgetTitle,
  });

  const sizeClasses = LAUNCHER_SIZE_CLASSES[size];

  return (
    <Button
      type="button"
      variant={buttonVariant}
      colorScheme={buttonScheme}
      className={cn(
        // shadow-xl is the float elevation; the Button primitive itself
        // layers the brand's --button-shadow chrome token. A round
        // launcher is always a circle; the pill deliberately does NOT
        // force rounded-full so it inherits the Button's own
        // rounded-[var(--button-radius,999px)] brand chrome.
        "fixed z-40 shadow-xl transition-all duration-200 ease-out hover:scale-105",
        WIDGET_PLACEMENT_CLASSES[placement].launcher,
        shape === "round"
          ? cn("overflow-hidden rounded-full p-0", sizeClasses.round)
          : cn("gap-2", sizeClasses.pill),
        open
          ? "pointer-events-none scale-90 opacity-0"
          : "scale-100 opacity-100",
      )}
      onClick={onOpen}
      aria-label={ariaLabel}
      aria-hidden={open}
    >
      {glyph}
      {showLabel ? (
        <span className="font-medium text-sm">{labelText || widgetTitle}</span>
      ) : null}
    </Button>
  );
}
