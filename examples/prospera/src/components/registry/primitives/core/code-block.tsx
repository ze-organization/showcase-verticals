"use client";

import * as React from "react";
import { ThemeIcon } from "@/components/registry/primitives/core/theme-icon";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/registry/primitives/core/tooltip";
import { cn } from "@/lib/registry/cn";

/** Supported when using syntax highlighting (code + language). */
const SHIKI_LANGS = [
  "typescript",
  "javascript",
  "tsx",
  "jsx",
  "json",
  "css",
  "html",
  "bash",
  "shell",
  "markdown",
  "yaml",
  "xml",
] as const;

export interface CodeBlockProps
  extends Omit<React.ComponentProps<"div">, "children"> {
  /** Raw code string. When provided with `language`, enables syntax highlighting (shiki). */
  code?: string;
  /** Child content when not using `code` + `language`. */
  children?: React.ReactNode;
  /** Language identifier (e.g. "typescript", "bash"). Shown as badge; with `code`, enables highlighting. */
  language?: string;
  /** Optional file path or title shown in the header. */
  filename?: string;
  /** Show line numbers. Default false. */
  showLineNumbers?: boolean;
  /** Show copy button. Default true. */
  showCopy?: boolean;
  /** Called after copy (e.g. analytics). */
  onCopy?: () => void | Promise<void>;
  /** Called when copy fails (clipboard permission denied, iframe
   *  without `allow=clipboard-write`, etc.). The component logs to
   *  `console.error` first; this hook lets consumers surface a toast
   *  or fallback UI. */
  onCopyError?: (error: unknown) => void;
  /** Accessible label for the copy button. */
  copyLabel?: string;
  /** Label shown in tooltip after copy. */
  copiedLabel?: string;
}

async function copyToClipboard(value: string) {
  await navigator.clipboard.writeText(value);
}

function addLineNumbersToShikiHtml(
  html: string,
  lineNumberClass: string,
): string {
  if (typeof DOMParser === "undefined") return html;
  const doc = new DOMParser().parseFromString(html, "text/html");
  const pre = doc.querySelector("pre");
  const code = pre?.querySelector("code");
  if (!pre || !code) return html;

  const codeClass = code.getAttribute("class")?.trim() || "";
  const lineEls = code.querySelectorAll(".line");
  const rawLines =
    lineEls.length > 0
      ? Array.from(lineEls).map((line) => line.innerHTML)
      : code.innerHTML.split("\n");
  const lines = rawLines.length ? rawLines : [""];
  const numbered = lines
    .map(
      (line, i) =>
        `<div class="table-row font-mono text-sm"><span class="${lineNumberClass} table-cell w-8 shrink-0 select-none pr-4 text-right">${i + 1}</span><span class="table-cell">${line || "&nbsp;"}</span></div>`,
    )
    .join("");

  return `<pre class="w-full table border-collapse"><code class="table-row-group ${codeClass}">${numbered}</code></pre>`;
}

function CodeBlock({
  className,
  children,
  code: codeProp,
  language,
  filename,
  showLineNumbers = false,
  showCopy = true,
  onCopy,
  onCopyError,
  copyLabel = "Copy code",
  copiedLabel = "Copied!",
  ...props
}: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);
  const [highlightedHtml, setHighlightedHtml] = React.useState<string | null>(
    null,
  );
  const [highlightError, setHighlightError] = React.useState(false);
  const contentRef = React.useRef<HTMLElement | null>(null);
  const setPreRef = React.useCallback((node: HTMLPreElement | null) => {
    contentRef.current = node;
  }, []);
  const setDivRef = React.useCallback((node: HTMLDivElement | null) => {
    contentRef.current = node;
  }, []);
  const isDarkRef = React.useRef(false);

  const hasHighlighting = Boolean(codeProp && language);
  const showHeader = Boolean(filename || language);
  const copyOverContent = showCopy && !showHeader;

  React.useEffect(() => {
    const check = () => {
      isDarkRef.current = document.documentElement.classList.contains("dark");
    };
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (!hasHighlighting || !codeProp || !language) {
      setHighlightedHtml(null);
      setHighlightError(false);
      return;
    }
    let cancelled = false;
    setHighlightError(false);
    import("shiki").then(({ createHighlighter }) => {
      if (cancelled) return;
      createHighlighter({
        themes: ["github-light", "github-dark"],
        langs: [...SHIKI_LANGS],
      })
        .then((highlighter) => {
          if (cancelled) return;
          const theme = isDarkRef.current ? "github-dark" : "github-light";
          const html = highlighter.codeToHtml(codeProp, {
            lang: language,
            theme,
          });
          const withNumbers = showLineNumbers
            ? addLineNumbersToShikiHtml(html, "text-muted-foreground")
            : html;
          setHighlightedHtml(withNumbers);
        })
        .catch(() => {
          if (!cancelled) setHighlightError(true);
        });
    });
    return () => {
      cancelled = true;
    };
  }, [codeProp, language, showLineNumbers, hasHighlighting]);

  const handleCopy = async () => {
    const toCopy =
      codeProp ??
      (typeof children === "string"
        ? children
        : (contentRef.current?.textContent ?? ""));
    try {
      await copyToClipboard(toCopy);
    } catch (err) {
      // Clipboard can fail when the user denies permission, the page
      // is in an iframe without the right `allow=clipboard-write`,
      // or Safari rejects a programmatic write outside a user-gesture
      // window. Surface the failure so consumers can show a toast
      // instead of the silent "did the click do anything?" state.
      console.error("[code-block] Clipboard copy failed:", err);
      onCopyError?.(err);
      return;
    }
    onCopy?.();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderContent = () => {
    if (hasHighlighting && highlightedHtml && !highlightError) {
      return (
        <div
          data-slot="code-block-highlighted"
          dir="ltr"
          className={cn(
            "overflow-x-auto p-4 text-sm leading-relaxed [&_pre]:m-0 [&_pre]:bg-transparent! [&_pre]:p-0",
            copyOverContent && "pe-12",
          )}
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Shiki generates syntax-highlighted HTML from developer-supplied code.
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        />
      );
    }
    if (hasHighlighting && (highlightError || !highlightedHtml)) {
      return (
        <pre
          data-slot="code-block-pre"
          ref={setPreRef}
          className={cn(
            "overflow-x-auto p-4 font-mono text-sm leading-relaxed",
            copyOverContent && "pe-12",
          )}
        >
          <code
            data-slot="code-block-code"
            className="block"
            data-language={language}
          >
            {codeProp}
          </code>
        </pre>
      );
    }
    const textContent = typeof children === "string" ? children : undefined;
    const lines =
      textContent != null && showLineNumbers ? textContent.split("\n") : null;

    if (lines != null && lines.length > 0) {
      const lineNumClass =
        "table-cell w-8 shrink-0 select-none pr-4 text-right font-mono text-sm text-muted-foreground";
      return (
        <div
          data-slot="code-block-pre"
          ref={setDivRef}
          className={cn(
            "overflow-x-auto p-4 text-sm leading-relaxed",
            copyOverContent && "pe-12",
          )}
        >
          <pre className="table w-full border-collapse">
            <code
              data-slot="code-block-code"
              className="table-row-group"
              data-language={language}
            >
              {lines.map((line, i) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: code lines are positional and may repeat (blank lines, duplicate braces); the line number IS the stable identity, and the list never reorders or splices — it re-splits wholesale when the code changes.
                  key={`${i}-${line}`}
                  className="table-row font-mono text-sm"
                >
                  <span className={lineNumClass} aria-hidden>
                    {i + 1}
                  </span>
                  <span className="table-cell">{line || "\u00A0"}</span>
                </div>
              ))}
            </code>
          </pre>
        </div>
      );
    }

    return (
      <pre
        data-slot="code-block-pre"
        ref={setPreRef}
        className={cn(
          "overflow-x-auto p-4 font-mono text-sm leading-relaxed",
          copyOverContent && "pe-12",
        )}
      >
        <code
          data-slot="code-block-code"
          className="block"
          data-language={language}
        >
          {children}
        </code>
      </pre>
    );
  };

  const copyButton = showCopy ? (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={handleCopy}
          className="flex size-8 shrink-0 items-center justify-center rounded border border-transparent text-muted-foreground outline-none hover:bg-muted hover:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={copyLabel}
        >
          {copied ? (
            <ThemeIcon name="check" className="size-4" aria-hidden />
          ) : (
            <ThemeIcon name="clipboard" className="size-4" aria-hidden />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent>{copied ? copiedLabel : copyLabel}</TooltipContent>
    </Tooltip>
  ) : null;

  return (
    <div
      data-slot="code-block"
      className={cn("relative rounded-lg border bg-muted", className)}
      {...props}
    >
      {showHeader ? (
        <div
          data-slot="code-block-header"
          className="flex flex-wrap items-center justify-between gap-2 border-border border-b px-3 py-1.5 text-xs"
        >
          <span
            data-slot="code-block-filename"
            className="min-w-0 truncate font-mono font-semibold text-muted-foreground"
          >
            {filename}
          </span>
          <div className="flex shrink-0 items-center gap-1">
            {language && (
              <span
                data-slot="code-block-language"
                className="rounded bg-muted-hover px-2 py-0.5 font-mono font-semibold text-muted-foreground uppercase"
              >
                {language}
              </span>
            )}
            {copyButton}
          </div>
        </div>
      ) : (
        copyButton && (
          <div className="absolute end-2 top-2 z-10">{copyButton}</div>
        )
      )}
      {renderContent()}
    </div>
  );
}
CodeBlock.displayName = "CodeBlock";

function CodeBlockCode({ className, ...props }: React.ComponentProps<"code">) {
  return (
    <code
      data-slot="code-block-inline"
      className={cn(
        "rounded bg-muted-hover px-[0.3rem] py-[0.2rem] font-mono text-sm",
        className,
      )}
      {...props}
    />
  );
}
CodeBlockCode.displayName = "CodeBlockCode";

export { CodeBlock, CodeBlockCode };
