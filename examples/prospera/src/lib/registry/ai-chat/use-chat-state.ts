"use client";

import { getSourceText } from "@/components/registry/primitives/editables/source-normalizers";
import { getImageSrc } from "@/lib/registry/ai-chat/compose";
import {
  ASSISTANT_BUBBLE_CLASSES,
  ASSISTANT_ICON_CLASSES,
  CARD_BORDER_CLASSES,
  DEFAULT_PLACEHOLDER,
} from "@/lib/registry/ai-chat/constants";
import { resolveLabels } from "@/lib/registry/ai-chat/labels";
import type {
  AIChatColorScheme,
  AIChatProps,
  AIChatVariant,
} from "@/lib/registry/ai-chat/types";
import { useAttachments } from "@/lib/registry/ai-chat/use-attachments";
import { useChatController } from "@/lib/registry/ai-chat/use-chat-controller";
import type { VariantProps } from "@/lib/registry/ai-chat/variant-props";
import { useDictionaryTranslate } from "@/lib/registry/i18n/use-dictionary-translate";

/**
 * Shared setup for every AI-chat rendering variant — used by both the
 * `ai-chat` card component (Default / Compact / HeroCollapsible) and the
 * `ai-chat-widget` floating component. Bundles the attachment + chat
 * controller hooks, resolves derived chrome (color-scheme classes,
 * placeholder text, assistant label), and produces the `VariantProps`
 * payload each variant shell consumes.
 *
 * Called once per variant export — the React-hook rules are honored
 * because each export is its own component invoking this helper at the
 * top of its render.
 *
 * `analyticsComponentName` keys which recipe the CDP catalog attributes
 * this placement's events to. Defaults to `"ai-chat"`; the floating
 * widget passes `"ai-chat-widget"` since it ships as its own recipe.
 */
export function useChatState(
  props: AIChatProps,
  variant: AIChatVariant,
  analyticsComponentName = "ai-chat",
): VariantProps {
  const attachments = useAttachments();
  const controller = useChatController({
    props,
    attachments,
    variant,
    analyticsComponentName,
  });

  const {
    title,
    description,
    placeholderText,
    welcomeMessage,
    avatar,
    colorScheme,
    assistantName,
    position = "inline",
    hideWelcome,
    suggestions,
    launcherShape = "round",
    launcherStyle = "solid",
    launcherIcon = "avatar",
    launcherLabel,
    launcherSize = "default",
    placement = "bottom-end",
    panelHeaderStyle = "tinted",
    panelSize = "default",
    defaultOpen = false,
    className,
    styles,
    id,
    isEditing,
    labels,
  } = props;

  // Resolve the chat chrome strings through three layers, lowest first:
  // English `DEFAULT_LABELS` < the active locale's `ai-chat-ui-labels@1`
  // dictionary phrases < any explicit `labels` prop. The `t` comes from the
  // host's next-intl message table (`useDictionaryTranslate`) — the same
  // context the Content SDK head fills from the Sitecore Dictionary — so a
  // phrase installed for the active locale localizes the chrome, while a
  // missing phrase falls through to the English default.
  const t = useDictionaryTranslate();
  const resolvedLabels = resolveLabels(labels, t);

  const placeholderValue =
    getSourceText(placeholderText) ?? DEFAULT_PLACEHOLDER;
  const titleText = getSourceText(title);
  const assistantNameText = getSourceText(assistantName);
  const avatarSrc = getImageSrc(avatar);

  // Plain string. The editable `<Text value={assistantName}>` is rendered
  // exactly once per instance — in the header — so Pages chrome can route
  // the click to the correct datasource when multiple AI Chats sit on the
  // same page. Rendering it on every assistant row (or in the welcome
  // bubble) emits multiple chrome markers for the same field, which makes
  // Pages route clicks to whichever marker is first in the DOM.
  const assistantLabel =
    assistantNameText || titleText || resolvedLabels.assistantLabel;

  // Mirror the recipe default (ColorScheme=primary) so previews and any
  // non-Sitecore caller that omits the prop still get the branded chrome.
  const schemeKey: AIChatColorScheme = colorScheme ?? "primary";
  const cardBorderClass = CARD_BORDER_CLASSES[schemeKey];
  const assistantBubbleClass = ASSISTANT_BUBBLE_CLASSES[schemeKey];
  const assistantIconClass = ASSISTANT_ICON_CLASSES[schemeKey];

  return {
    controller,
    attachments,
    messages: controller.messages,
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
    placeholder: placeholderValue,
    hideWelcome,
    suggestions,
    launcherShape,
    launcherStyle,
    launcherIcon,
    launcherLabel,
    launcherSize,
    placement,
    panelHeaderStyle,
    panelSize,
    defaultOpen,
    labels: resolvedLabels,
  };
}
