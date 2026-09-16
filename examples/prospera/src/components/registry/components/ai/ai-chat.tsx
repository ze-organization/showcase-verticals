"use client";

import type { AIChatProps } from "@/lib/registry/ai-chat/types";
import { useChatState } from "@/lib/registry/ai-chat/use-chat-state";
import { CardVariant } from "@/lib/registry/ai-chat/variants/card";
// Self-register this component's CDP events into the runtime catalog
// via the push-based registerCdpRecipe pattern.
// See `@/lib/registry/analytics/cdp-events` for the rationale.
import { registerCdpRecipe } from "@/lib/registry/analytics/cdp-events";
import aiChatRecipe from "@/recipes/ai-chat.recipe";

registerCdpRecipe(aiChatRecipe);

/**
 * Streaming AI chat panel — the AI group's reference component.
 *
 * Each in-flow visual mode is a separate exported function (the
 * project's rendering-variant convention: separate functions sharing
 * one props shape, no discriminator-prop dispatch on a single
 * component). The Sitecore-side renderings pick which one to render by
 * name — `Default` / `Compact` / `HeroCollapsible`.
 *
 * The viewport-pinned **floating widget** ships as its own component
 * (`ai-chat-widget`) — its launcher chrome params are specific to that
 * placement, so it no longer rides along as a variant here.
 *
 * Renders a chat surface (header + thread + composer) backed by the Vercel
 * AI SDK's `useChat` hook talking to the BFF route at `/api/ai-chat`. The
 * BFF runs OpenAI / Anthropic via `streamText`, or falls back to a
 * deterministic `[ai-chat:demo]` stream when no provider key is set.
 *
 * Per-placement steering lives on the `SystemPrompt` field; the client
 * sends the composed prompt alongside `model` / `temperature` / `maxTokens`
 * / `searchSourceId` / `searchTopK` as extra body fields on each request.
 * Skills + Context items + live page context + text attachments are all
 * concatenated into the composed system prompt at request time.
 */

/**
 * Standard card-shell chat. Bordered surface, generous padding, full
 * thread height. Inline placement is the common case; the `Position`
 * param flips sticky-top / sticky-bottom for fixed-on-scroll callouts.
 */
export function Default(props: AIChatProps) {
  const state = useChatState(props, "default");
  return <CardVariant {...state} layout="default" />;
}

/**
 * Tighter card-shell variant — same conversation shape but shorter
 * thread height + reduced header padding. Suits sidebars, dense
 * layouts, and any placement that needs to share vertical real estate
 * with other content.
 */
export function Compact(props: AIChatProps) {
  const state = useChatState(props, "compact");
  return <CardVariant {...state} layout="compact" />;
}

/**
 * Hero-collapsible card-shell variant. Larger thread height + a
 * "Show / Hide history" toggle that filters the visible messages to
 * just the most recent exchange when collapsed. Suits the top of a
 * page where the chat IS the primary CTA and historic turns should
 * recede.
 */
export function HeroCollapsible(props: AIChatProps) {
  const state = useChatState(props, "hero-collapsible");
  return <CardVariant {...state} layout="hero-collapsible" />;
}

export default Default;

// Re-export public types so the sitecore adapter and other consumers keep
// working with the same import paths as before the directory split.
export type {
  AIChatAnalyticsMeta,
  AIChatColorScheme,
  AIChatContextItem,
  AIChatLabels,
  AIChatPosition,
  AIChatProps,
  AIChatSkill,
  AIChatVariant,
} from "@/lib/registry/ai-chat/types";

export const componentType = "universal";
