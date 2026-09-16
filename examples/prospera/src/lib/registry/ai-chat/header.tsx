"use client";

import { RotateCcw } from "lucide-react";
import {
  CardDescription,
  CardTitle,
} from "@/components/registry/primitives/core/card";
import { LibraryIcon } from "@/components/registry/primitives/core/library-icon";
import { TypographyMuted } from "@/components/registry/primitives/core/typography";
import type { ImageSource } from "@/components/registry/primitives/editables/image";
import { Image } from "@/components/registry/primitives/editables/image";
import {
  Text,
  type TextSource,
} from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  HEADER_ACCENT_STRIP_CLASSES,
  HEADER_SOLID_CLASSES,
} from "./constants";
import type { ResolvedAIChatLabels } from "./labels";
import type {
  AIChatColorScheme,
  AIChatPanelHeaderStyle,
  AIChatVariant,
} from "./types";

interface HeaderProps {
  title: TextSource | undefined;
  description: TextSource | undefined;
  /**
   * AssistantName field. The header renders the editable `<Text>` slot for
   * this field in editing mode — kept here (and ONLY here) so Pages chrome
   * sees one edit marker per instance, which is what lets it route clicks
   * to the right datasource when several AI Chats sit on the same page.
   */
  assistantName: TextSource | undefined;
  variant: AIChatVariant;
  schemeKey: AIChatColorScheme;
  isEditing: boolean | undefined;
  /** When true (and not editing) the New chat button is shown. */
  showNewChat: boolean;
  onNewChat: () => void;
  /** Optional trailing slot (collapse toggle, etc.). Rendered before the New chat button. */
  trailing?: React.ReactNode;
  /**
   * Avatar source — when set, renders an avatar tile to the left of the
   * title. Used by the floating widget; the card variant leaves it
   * undefined (the conversation already shows assistant avatars per
   * message, no need to double up in the chrome).
   */
  avatar?: ImageSource;
  avatarSrc?: string;
  avatarBubbleClass?: string;
  avatarIconClass?: string;
  /**
   * Compact title row: smaller font + tighter padding (floating widget).
   * Defaults are derived from the `variant` prop, but `compact` is the
   * explicit override the floating widget passes in.
   */
  compact?: boolean;
  /** Close button rendered after New chat. Floating widget uses this. */
  onClose?: () => void;
  /** Localizable chrome strings (New chat / Close labels). */
  labels: ResolvedAIChatLabels;
  /**
   * Header treatment. `tinted` (default) keeps the low-alpha accent
   * strip; `solid` fills the header with the ColorScheme role +
   * foreground text (branded chat-widget convention); `plain` drops the
   * accent entirely for a clean background header.
   */
  headerStyle?: AIChatPanelHeaderStyle;
}

/**
 * Resolves the header chrome for a treatment + scheme pair. Kept outside
 * `Header` so the component body stays under the complexity budget.
 *
 *   tinted  low-alpha accent strip over the page background (default)
 *   solid   role fill + role foreground per the color-roles contract;
 *           the divider is dropped (the fill is the edge) and the
 *           icon buttons/description inherit the role foreground
 *   plain   no accent at all
 */
function resolveHeaderChrome(
  headerStyle: AIChatPanelHeaderStyle,
  schemeKey: AIChatColorScheme,
) {
  const solid = headerStyle === "solid";
  return {
    solid,
    stripClass:
      headerStyle === "tinted" ? HEADER_ACCENT_STRIP_CLASSES[schemeKey] : "",
    rootClass: solid ? cn("border-b-0", HEADER_SOLID_CLASSES[schemeKey]) : "",
    // On a solid role fill, muted-foreground was tuned for the page
    // background — inherit the role foreground instead.
    descriptionClass: solid ? "text-current opacity-85" : "",
    iconButtonClass: cn(
      "inline-flex size-8 items-center justify-center rounded-md transition-colors",
      solid
        ? "text-current hover:bg-background/20"
        : "text-muted-foreground hover:bg-muted hover:text-muted-foreground",
    ),
  };
}

export function Header({
  title,
  description,
  assistantName,
  variant,
  schemeKey,
  isEditing,
  showNewChat,
  onNewChat,
  trailing,
  avatar,
  avatarSrc,
  avatarBubbleClass,
  avatarIconClass,
  compact = false,
  onClose,
  labels,
  headerStyle = "tinted",
}: HeaderProps) {
  const chrome = resolveHeaderChrome(headerStyle, schemeKey);
  const { stripClass } = chrome;
  const showAvatar = Boolean(avatar || avatarSrc || isEditing);
  return (
    <div
      className={cn(
        "relative border-b px-5 py-4",
        (variant === "compact" || compact) && "px-4 py-3",
        variant === "hero-collapsible" && "py-5",
        chrome.rootClass,
      )}
    >
      {stripClass ? (
        <div
          className={cn(
            "pointer-events-none absolute inset-0 -z-10",
            stripClass,
          )}
          aria-hidden
        />
      ) : null}
      <div className="flex items-center gap-3">
        {showAvatar ? (
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-background",
              avatarBubbleClass,
            )}
          >
            {avatarSrc || isEditing ? (
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
                className={cn("size-4", avatarIconClass)}
                aria-hidden
              />
            )}
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <CardTitle
            className={cn(
              compact ? "text-sm" : "text-base",
              variant !== "compact" && !compact && "text-lg",
              variant === "hero-collapsible" && "text-xl",
            )}
          >
            <Text
              value={title}
              tag="span"
              placeholder={DEFAULT_TITLE}
              isEditing={isEditing}
            />
          </CardTitle>
          <CardDescription className={compact ? undefined : "mt-1"}>
            <TypographyMuted
              className={cn(
                compact ? "truncate text-xs" : "text-sm",
                chrome.descriptionClass,
              )}
            >
              <Text
                value={description}
                tag="span"
                placeholder={DEFAULT_DESCRIPTION}
                isEditing={isEditing}
              />
            </TypographyMuted>
          </CardDescription>
          {isEditing ? (
            <div
              className={cn(
                "mt-2 flex items-baseline gap-1.5 uppercase tracking-wide opacity-60",
                compact ? "mt-1 text-[10px]" : "text-[11px]",
              )}
            >
              <span>Assistant name:</span>
              <Text
                value={assistantName}
                tag="span"
                placeholder="Assistant Name"
                isEditing={isEditing}
                className="text-foreground/80 normal-case tracking-normal"
              />
            </div>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {trailing}
          {showNewChat ? (
            <button
              type="button"
              onClick={onNewChat}
              aria-label={labels.newChatAriaLabel}
              title={labels.newChatLabel}
              className={chrome.iconButtonClass}
            >
              <RotateCcw className="size-4" aria-hidden />
            </button>
          ) : null}
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              aria-label={labels.closeLabel}
              className={chrome.iconButtonClass}
            >
              <LibraryIcon name="x" className="size-4" aria-hidden />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
