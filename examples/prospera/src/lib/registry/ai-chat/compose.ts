import type { UIMessage } from "ai";
import type { ImageSource } from "@/components/registry/primitives/editables/image";
import type { RichTextSource } from "@/components/registry/primitives/editables/richtext";
import { getSourceText } from "@/components/registry/primitives/editables/source-normalizers";
import { ATTACHMENT_TOTAL_TEXT_LIMIT } from "./constants";
import type {
  AIChatColorScheme,
  AIChatContextItem,
  AIChatSkill,
  AIChatVariant,
  AttachedFile,
} from "./types";

export function resolveVariant(variant: string | undefined): AIChatVariant {
  const normalized = variant?.trim().toLowerCase();
  if (normalized === "compact") return "compact";
  if (normalized === "floating-widget") return "floating-widget";
  if (
    normalized === "hero-collapsible" ||
    normalized === "collapsible-history" ||
    normalized === "top-home-collapsible"
  ) {
    return "hero-collapsible";
  }
  return "default";
}

export type SpinnerScheme =
  | "primary"
  | "neutral"
  | "success"
  | "warning"
  | "destructive";

export function resolveSpinnerScheme(scheme: AIChatColorScheme): SpinnerScheme {
  switch (scheme) {
    case "neutral":
    case "success":
    case "warning":
    case "destructive":
      return scheme;
    default:
      return "primary";
  }
}

/** Concatenate every `text` part on a UIMessage into a single string. */
export function getMessageText(message: UIMessage): string {
  let text = "";
  for (const part of message.parts ?? []) {
    if (part.type === "text") text += part.text;
  }
  return text;
}

export function toFiniteNumber(
  value: string | number | undefined,
): number | undefined {
  if (value == null || value === "") return undefined;
  const parsed = typeof value === "number" ? value : Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function isEnabled(value: string | boolean | undefined): boolean {
  if (typeof value === "boolean") return value;
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return ["1", "true", "yes", "on", "enabled"].includes(normalized);
}

export function stripHtml(html: string): string {
  if (typeof DOMParser !== "undefined") {
    const text = new DOMParser().parseFromString(html, "text/html").body
      .textContent;
    return (text ?? "").replace(/\s+/g, " ").trim();
  }
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function getImageSrc(
  source: ImageSource | undefined,
): string | undefined {
  if (!source) return undefined;
  if (typeof source === "object" && "value" in source) {
    const v = (source as { value?: unknown }).value;
    if (v && typeof v === "object" && "src" in v) {
      const src = (v as { src?: unknown }).src;
      if (typeof src === "string" && src.trim().length > 0) return src;
    }
  }
  if (typeof source === "object" && "src" in source) {
    const src = (source as { src?: unknown }).src;
    if (typeof src === "string" && src.trim().length > 0) return src;
  }
  return undefined;
}

export function getRichTextAsPlainText(
  value: RichTextSource | undefined,
): string | undefined {
  if (value == null) return undefined;
  if (typeof value === "string") {
    const stripped = stripHtml(value);
    return stripped || undefined;
  }
  if (typeof value === "object" && "value" in value) {
    const inner = (value as { value?: unknown }).value;
    if (typeof inner === "string") {
      const stripped = stripHtml(inner);
      return stripped || undefined;
    }
  }
  return undefined;
}

/**
 * Compose the system prompt from per-instance fields. Order is deliberate:
 * SystemPrompt → page context → Skills → Context items → attachments.
 * Each section is Markdown-headed so the LLM treats them as discrete.
 */
export function composeSystemPrompt(
  basePrompt: string | undefined,
  pageContext: string | undefined,
  skills: AIChatSkill[] | undefined,
  context: AIChatContextItem[] | undefined,
  attachments: AttachedFile[] | undefined,
): string | undefined {
  const segments: string[] = [];
  if (basePrompt) segments.push(basePrompt);
  if (pageContext) segments.push(pageContext);

  for (const skill of skills ?? []) {
    const instructions = getSourceText(skill.Instructions);
    if (!instructions) continue;
    const label = getSourceText(skill.Name) ?? skill.name ?? "Skill";
    segments.push(`## Skill: ${label}\n${instructions}`);
  }

  for (const item of context ?? []) {
    const content = getSourceText(item.Content);
    if (!content) continue;
    const label = getSourceText(item.Title) ?? item.name ?? "Context";
    segments.push(`## Context: ${label}\n${content}`);
  }

  let attachmentBudget = ATTACHMENT_TOTAL_TEXT_LIMIT;
  for (const file of attachments ?? []) {
    if (file.unreadable || !file.content) continue;
    if (attachmentBudget <= 0) break;
    const slice = file.content.slice(0, attachmentBudget);
    attachmentBudget -= slice.length;
    segments.push(`## Attached: ${file.name}\n${slice}`);
  }

  return segments.length > 0 ? segments.join("\n\n") : undefined;
}
