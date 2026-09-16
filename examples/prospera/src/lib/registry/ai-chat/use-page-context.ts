"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  PAGE_CONTEXT_BODY_LIMIT,
  PAGE_CONTEXT_HEADING_LIMIT,
  PAGE_CONTEXT_META_LIMIT,
  PAGE_CONTEXT_QUERY_VALUE_LIMIT,
} from "./constants";

/** "### Location" section: full URL, path, query string, and hash. */
function collectLocationLines(pathname: string | null): string[] {
  const lines: string[] = ["### Location"];
  if (typeof window !== "undefined") lines.push(`URL: ${window.location.href}`);
  lines.push(`Path: ${pathname ?? "/"}`);
  if (typeof window === "undefined") return lines;

  const params = new URLSearchParams(window.location.search);
  if (params.toString()) {
    const parts: string[] = [];
    for (const [key, value] of params.entries()) {
      const trimmed =
        value.length > PAGE_CONTEXT_QUERY_VALUE_LIMIT
          ? `${value.slice(0, PAGE_CONTEXT_QUERY_VALUE_LIMIT)}…`
          : value;
      parts.push(`${key}=${trimmed}`);
    }
    lines.push(`Query: ${parts.join("&")}`);
  }
  const hash = window.location.hash;
  if (hash && hash !== "#") lines.push(`Hash: ${hash}`);
  return lines;
}

/** "### Document" section: title, language, non-default charset. */
function collectDocumentLines(): string[] {
  const title = document.title?.trim();
  const lang = document.documentElement.lang?.trim();
  const charset = document.characterSet;
  if (!(title || lang || charset)) return [];
  const lines = ["### Document"];
  if (title) lines.push(`Title: ${title}`);
  if (lang) lines.push(`Language: ${lang}`);
  if (charset && charset !== "UTF-8") lines.push(`Charset: ${charset}`);
  return lines;
}

/** "### Metadata" section: meaningful meta tags, capped at the limit. */
function collectMetadataLines(): string[] {
  const metaTags: string[] = [];
  for (const meta of document.querySelectorAll<HTMLMetaElement>(
    "meta[content]",
  )) {
    if (metaTags.length >= PAGE_CONTEXT_META_LIMIT) break;
    const key = (
      meta.getAttribute("name") ??
      meta.getAttribute("property") ??
      meta.getAttribute("http-equiv") ??
      ""
    ).trim();
    const value = (meta.getAttribute("content") ?? "").trim();
    if (!key || !value) continue;
    if (key === "viewport" || key === "generator") continue;
    metaTags.push(`${key}: ${value}`);
  }
  if (metaTags.length === 0) return [];
  return ["### Metadata", ...metaTags.map((entry) => `- ${entry}`)];
}

/** "### Outline" section: heading text, capped at the limit. */
function collectOutlineLines(): string[] {
  const headings: string[] = [];
  for (const heading of document.querySelectorAll<HTMLElement>(
    "h1, h2, h3, h4, h5, h6",
  )) {
    if (headings.length >= PAGE_CONTEXT_HEADING_LIMIT) break;
    const text = heading.innerText?.replace(/\s+/g, " ").trim();
    if (!text) continue;
    headings.push(`${heading.tagName.toLowerCase()}: ${text}`);
  }
  if (headings.length === 0) return [];
  return ["### Outline", ...headings.map((entry) => `- ${entry}`)];
}

/** "### Visible content" section: truncated body/main text. */
function collectVisibleContentLines(): string[] {
  const main =
    document.querySelector<HTMLElement>("main") ??
    document.querySelector<HTMLElement>("article") ??
    document.querySelector<HTMLElement>("[role='main']");
  const bodyText = (main ?? document.body)?.innerText
    ?.replace(/\s+/g, " ")
    .trim();
  if (!bodyText) return [];
  const truncated =
    bodyText.length > PAGE_CONTEXT_BODY_LIMIT
      ? `${bodyText.slice(0, PAGE_CONTEXT_BODY_LIMIT)}… (truncated; ${bodyText.length - PAGE_CONTEXT_BODY_LIMIT} chars omitted)`
      : bodyText;
  return ["### Visible content", truncated];
}

/** Assemble the full page-context snapshot from the live DOM. */
function buildPageContextSnapshot(pathname: string | null): string {
  return [
    "## Page Context",
    ...collectLocationLines(pathname),
    ...collectDocumentLines(),
    ...collectMetadataLines(),
    ...collectOutlineLines(),
    ...collectVisibleContentLines(),
  ].join("\n");
}

/**
 * Snapshot of the current page folded into the system prompt so the assistant
 * can answer about whatever the visitor is looking at. Captured client-side
 * after mount and re-captured on route change, bounded by PAGE_CONTEXT_* limits
 * so a verbose page can't blow the BFF's `MAX_SYSTEM_LENGTH`.
 */
export function usePageContext(): string | undefined {
  const pathname = usePathname();
  const [snapshot, setSnapshot] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (typeof document === "undefined") return;
    // Defer one frame so RSC hydration and post-mount DOM writes settle.
    const handle = window.requestAnimationFrame(() => {
      setSnapshot(buildPageContextSnapshot(pathname));
    });
    return () => window.cancelAnimationFrame(handle);
  }, [pathname]);

  return snapshot;
}
