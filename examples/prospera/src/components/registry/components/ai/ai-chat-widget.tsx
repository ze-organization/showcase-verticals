"use client";

import type { AIChatProps } from "@/lib/registry/ai-chat/types";
import { useChatState } from "@/lib/registry/ai-chat/use-chat-state";
import { FloatingWidgetVariant } from "@/lib/registry/ai-chat/variants/floating-widget";
// Self-register this component's CDP events into the runtime catalog
// via the push-based registerCdpRecipe pattern.
// See `@/lib/registry/analytics/cdp-events` for the rationale.
import { registerCdpRecipe } from "@/lib/registry/analytics/cdp-events";
import aiChatWidgetRecipe from "@/recipes/ai-chat-widget.recipe";

registerCdpRecipe(aiChatWidgetRecipe);

/**
 * AI Chat Widget — the viewport-pinned floating chat.
 *
 * A round (or pill) launcher button fixes to the end-bottom corner;
 * clicking opens a slide-up panel. The panel stays mounted across
 * open/close so streaming, message history, attachments, and mic
 * baseline survive the toggle.
 *
 * Split out from the `ai-chat` card component because its author surface
 * is specific to this placement: the launcher chrome params
 * (`LauncherShape` / `LauncherStyle` / `LauncherIcon` / `LauncherLabel`)
 * only mean something for a floating launcher, and it's always
 * viewport-pinned so it has no `Position` param. Everything else — the
 * conversation shape, grounding (SystemPrompt / Context / Search),
 * model tuning, and analytics — mirrors `ai-chat`, which is why both
 * share the `useChatState` controller and the `@/lib/registry/ai-chat`
 * runtime.
 *
 * Its CDP events are attributed to the `ai-chat-widget` recipe (not
 * `ai-chat`) so a page carrying only the widget still resolves its
 * event catalog.
 */
export function Default(props: AIChatProps) {
  const state = useChatState(props, "floating-widget", "ai-chat-widget");
  return <FloatingWidgetVariant {...state} />;
}

export default Default;

// Re-export public types so consumers keep working with the same import
// paths whether they install `ai-chat` or `ai-chat-widget`.
export type {
  AIChatAnalyticsMeta,
  AIChatColorScheme,
  AIChatContextItem,
  AIChatLabels,
  AIChatProps,
  AIChatSkill,
  AIChatVariant,
} from "@/lib/registry/ai-chat/types";

export const componentType = "universal";
