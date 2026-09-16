import type { UIMessage } from "ai";
import type { ImageSource } from "@/components/registry/primitives/editables/image";
import type { TextSource } from "@/components/registry/primitives/editables/text";
import type { ResolvedAIChatLabels } from "./labels";
import type {
  AIChatColorScheme,
  AIChatLauncherIcon,
  AIChatLauncherShape,
  AIChatLauncherSize,
  AIChatLauncherStyle,
  AIChatPanelHeaderStyle,
  AIChatPanelSize,
  AIChatPosition,
  AIChatWidgetPlacement,
} from "./types";
import type { UseAttachmentsResult } from "./use-attachments";
import type { UseChatControllerResult } from "./use-chat-controller";

/**
 * Shape passed from `Default` to each variant shell. Bundles the controller
 * output, the attachments hook output, the resolved visual state, and the
 * editable field references the variant needs to render its chrome.
 */
export interface VariantProps {
  controller: UseChatControllerResult;
  attachments: UseAttachmentsResult;
  /** Resolved messages (delegated through controller). */
  messages: UIMessage[];

  // Identity / layout
  id: string | undefined;
  className: string | undefined;
  styles: string | undefined;
  position: AIChatPosition;
  isEditing: boolean | undefined;

  // Visual slots
  schemeKey: AIChatColorScheme;
  cardBorderClass: string;
  assistantBubbleClass: string;
  assistantIconClass: string;
  avatarSrc: string | undefined;
  /**
   * Resolved label text. Plain string in both runtime and editing modes —
   * the editable `<Text value={assistantName}>` is rendered once per instance
   * by the header so Pages chrome routes clicks to the correct datasource.
   */
  assistantLabel: string;

  // Editable field references — passed through to Header / EmptyState
  title: TextSource | undefined;
  description: TextSource | undefined;
  /** AssistantName field — the header renders its editable slot in editing mode. */
  assistantName: TextSource | undefined;
  avatar: ImageSource | undefined;
  welcomeMessage: TextSource | undefined;

  // Composer config
  placeholder: string;
  hideWelcome: boolean | undefined;
  /** Fully-resolved localizable chrome strings (Send, hints, tooltips, …). */
  labels: ResolvedAIChatLabels;
  /** Follow-up prompt chips for the suggested-actions row. */
  suggestions: string[] | undefined;

  // Floating-widget launcher + panel chrome — ignored by other variants.
  launcherShape: AIChatLauncherShape;
  launcherStyle: AIChatLauncherStyle;
  launcherIcon: AIChatLauncherIcon;
  launcherLabel: TextSource | undefined;
  launcherSize: AIChatLauncherSize;
  placement: AIChatWidgetPlacement;
  panelHeaderStyle: AIChatPanelHeaderStyle;
  panelSize: AIChatPanelSize;
  /** Presentational initial open state (SSR-safe; previews/screenshots). */
  defaultOpen: boolean;
}
