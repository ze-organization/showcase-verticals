"use client";

import { Mic, MicOff, Paperclip } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/registry/components/ui/cta-button";
import { LibraryIcon } from "@/components/registry/primitives/core/library-icon";
import { Spinner } from "@/components/registry/primitives/core/spinner";
import { Textarea } from "@/components/registry/primitives/core/textarea";
import { TypographyMuted } from "@/components/registry/primitives/core/typography";
import { cn } from "@/lib/registry/cn";
import { resolveSpinnerScheme } from "./compose";
import {
  DEFAULT_LABELS,
  formatLabel,
  type ResolvedAIChatLabels,
} from "./labels";
import type { AIChatColorScheme, AttachedFile } from "./types";
import { useSpeechRecognition } from "./use-speech";

interface ComposerProps {
  id?: string;
  placeholder: string;
  /**
   * Localizable chrome strings (Send, hints, tooltips, …). Defaults to the
   * English label set when omitted; the chat variants always pass a resolved
   * set through.
   */
  labels?: ResolvedAIChatLabels;
  schemeKey: AIChatColorScheme;
  isStreaming: boolean;
  error: Error | undefined;
  attachedFiles: AttachedFile[];
  attachmentError: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFilePick: (fileList: FileList | null) => void | Promise<void>;
  removeAttachment: (id: string) => void;
  onSubmit: (value: string) => void;
  onStop: () => void;
  /** Tight layout — used by the floating-widget variant (~28rem canvas). */
  compact?: boolean;
}

/**
 * Composer surface — status/error banners sit above as soft rounded
 * pills, attachment chips and the textarea + toolbar live inside a
 * single rounded container.
 *
 * Built on the project's `Textarea` primitive (not the Vercel AI
 * Elements `PromptInputTextarea`) so the input chrome matches every
 * other form input in the registry. `field-sizing: content` lets the
 * textarea auto-grow with content up to `max-h-80`; the placeholder
 * lives at the textarea's natural top edge — multiline textareas
 * anchor placeholders to the top by design, so we use a comfortable
 * min-height that's "tall enough to feel multiline" but not so tall
 * the placeholder floats in dead space.
 *
 * Local controlled state holds the input value (used to be lifted to
 * a Vercel AI Elements provider context, but that abstraction layer
 * isn't earning its keep here). The speech hook writes directly into
 * the setter as transcript arrives.
 */
export function Composer({
  id,
  placeholder,
  labels = DEFAULT_LABELS,
  schemeKey,
  isStreaming,
  error,
  attachedFiles,
  attachmentError,
  fileInputRef,
  handleFilePick,
  removeAttachment,
  onSubmit,
  onStop,
  compact = false,
}: ComposerProps) {
  const [value, setValue] = useState("");
  const composerId = `${id ?? "ai-chat"}-composer`;

  // Speech recognition. Baseline captured at mic-start so additional typing
  // during dictation doesn't get clobbered by interim transcript replacement.
  const speechBaselineRef = useRef("");
  const speechFinalRef = useRef("");
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const onTranscript = useCallback((text: string, isFinal: boolean) => {
    if (process.env.NODE_ENV !== "production") {
      console.log(
        `[ai-chat] composer transcript text=${JSON.stringify(text)} final=${isFinal}`,
      );
    }
    if (isFinal) {
      const sep =
        speechFinalRef.current && !speechFinalRef.current.endsWith(" ")
          ? " "
          : "";
      speechFinalRef.current = `${speechFinalRef.current}${sep}${text.trim()}`;
    }
    const interim = isFinal ? "" : text;
    const parts = [
      speechBaselineRef.current,
      speechFinalRef.current,
      interim,
    ].filter((part) => part.length > 0);
    setValue(parts.join(" "));
  }, []);

  const speech = useSpeechRecognition({
    onTranscript,
    onEnd: () => {
      speechFinalRef.current = "";
    },
  });

  const toggleMic = useCallback(() => {
    if (speech.recording) {
      speech.stop();
      return;
    }
    speechBaselineRef.current = valueRef.current;
    speechFinalRef.current = "";
    speech.start();
  }, [speech]);

  // Esc cancels an active stream. Standard chat-surface affordance —
  // ChatGPT / Claude / Perplexity all bind this.
  useEffect(() => {
    if (!isStreaming) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onStop();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isStreaming, onStop]);

  const trySubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || isStreaming) return;
    onSubmit(trimmed);
    setValue("");
  }, [value, isStreaming, onSubmit]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Standard chat send-on-Enter: Enter submits, Shift+Enter inserts a
      // newline. `nativeEvent.isComposing` skips during IME composition so
      // mid-character commits (Japanese / Chinese / Korean) don't fire.
      if (
        event.key === "Enter" &&
        !event.shiftKey &&
        !event.nativeEvent.isComposing
      ) {
        event.preventDefault();
        trySubmit();
      }
    },
    [trySubmit],
  );

  const canSend = value.trim().length > 0 && !isStreaming;
  const sendColorScheme = schemeKey === "neutral" ? "primary" : schemeKey;
  // min-h aligns with the Textarea primitive's built-in `min-h-16`
  // (64px ≈ 3 line-heights). Floating widget shrinks one notch.
  const textareaSizing = compact
    ? "min-h-[3rem] max-h-64"
    : "min-h-16 max-h-80";

  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        compact ? "px-3 pt-2 pb-3" : "px-4 pt-2 pb-4 sm:px-5",
      )}
    >
      <ComposerBanners
        isStreaming={isStreaming}
        schemeKey={schemeKey}
        error={error}
        attachmentError={attachmentError}
        onStop={onStop}
        labels={labels}
      />

      <form
        onSubmit={(event) => {
          event.preventDefault();
          trySubmit();
        }}
        className="rounded-lg border border-input bg-background shadow-sm transition-shadow focus-within:border-primary focus-within:ring-1 focus-within:ring-primary"
      >
        {attachedFiles.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5 px-3 pt-3">
            {attachedFiles.map((file) => (
              <span
                key={file.id}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border bg-muted/60 py-0.5 ps-2 pe-1 text-xs",
                  file.unreadable && "border-warning/40 text-warning",
                )}
                title={file.unreadable ? labels.unreadableFileHint : undefined}
              >
                <Paperclip className="size-3" aria-hidden />
                <span className="max-w-56 truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(file.id)}
                  aria-label={formatLabel(labels.removeAttachmentLabel, {
                    name: file.name,
                  })}
                  className="ms-1 inline-flex size-4 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-muted-foreground"
                >
                  <LibraryIcon name="x" className="size-3" aria-hidden />
                </button>
              </span>
            ))}
          </div>
        ) : null}

        <label htmlFor={composerId} className="sr-only">
          {labels.composerAriaLabel}
        </label>
        <Textarea
          id={composerId}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            speech.recording ? labels.listeningPlaceholder : placeholder
          }
          disabled={isStreaming}
          maxLength={4000}
          className={cn(
            // Strip the Textarea primitive's outer chrome — the form
            // wrapper owns the border + focus ring now.
            "field-sizing-content w-full resize-none border-0 bg-transparent px-4 py-3 text-sm shadow-none focus:ring-0 focus-visible:border-0 focus-visible:ring-0",
            textareaSizing,
          )}
        />
        {/* Hidden file input wired to the existing `useAttachments` hook. */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="sr-only"
          onChange={(event) => {
            void handleFilePick(event.target.files);
            event.target.value = "";
          }}
        />

        <div className="flex items-center gap-1 px-2 pb-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isStreaming}
            aria-label={labels.attachLabel}
            title={labels.attachHint}
            className="inline-flex size-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-muted-foreground disabled:opacity-50"
          >
            <Paperclip className="size-5" aria-hidden />
          </button>
          {speech.supported ? (
            <button
              type="button"
              onClick={toggleMic}
              disabled={isStreaming}
              aria-label={
                speech.recording
                  ? labels.stopDictationLabel
                  : labels.startDictationLabel
              }
              aria-pressed={speech.recording}
              title={
                speech.recording
                  ? labels.stopDictationLabel
                  : labels.dictateHint
              }
              className={cn(
                "inline-flex size-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-muted-foreground disabled:opacity-50",
                speech.recording &&
                  "bg-destructive/10 text-destructive hover:bg-destructive/15",
              )}
            >
              {speech.recording ? (
                <MicOff className="size-5 animate-pulse" aria-hidden />
              ) : (
                <Mic className="size-5" aria-hidden />
              )}
            </button>
          ) : null}
          <Button
            type="submit"
            size="sm"
            colorScheme={sendColorScheme}
            disabled={!canSend}
            className="ms-auto"
          >
            <LibraryIcon name="arrow-up" className="size-4" aria-hidden />
            {compact ? null : labels.sendLabel}
          </Button>
        </div>
      </form>

      <p
        className={cn(
          "hidden text-center text-[11px] text-muted-foreground/70 sm:block",
          compact && "sm:hidden",
        )}
      >
        {speech.recording ? labels.listeningHint : labels.composerHint}
      </p>
    </div>
  );
}

/**
 * Status / error / attachment-error banners that sit above the composer
 * form as soft rounded pills.
 */
function ComposerBanners({
  isStreaming,
  schemeKey,
  error,
  attachmentError,
  onStop,
  labels,
}: {
  isStreaming: boolean;
  schemeKey: AIChatColorScheme;
  error: Error | undefined;
  attachmentError: string | null;
  onStop: () => void;
  labels: ResolvedAIChatLabels;
}) {
  return (
    <>
      {isStreaming ? (
        <div
          className="flex items-center gap-2 rounded-md bg-muted/40 px-3 py-2"
          role="status"
          aria-live="polite"
        >
          <Spinner
            size="sm"
            colorScheme={resolveSpinnerScheme(schemeKey)}
            aria-label={labels.thinkingAriaLabel}
          />
          <TypographyMuted className="text-xs">
            {labels.thinkingLabel}
          </TypographyMuted>
          <button
            type="button"
            onClick={onStop}
            className="ms-auto inline-flex h-7 items-center rounded-md px-2 text-muted-foreground text-xs hover:bg-muted hover:text-muted-foreground"
            aria-keyshortcuts="Escape"
            title={labels.stopHint}
          >
            {labels.stopLabel}
          </button>
        </div>
      ) : null}

      {!isStreaming && error ? (
        <div
          className="rounded-md bg-destructive/5 px-3 py-2 text-destructive text-xs"
          role="alert"
          aria-live="polite"
        >
          {error.message || labels.sendError}
        </div>
      ) : null}

      {attachmentError ? (
        <div
          className="rounded-md bg-destructive/5 px-3 py-2 text-destructive text-xs"
          role="alert"
          aria-live="polite"
        >
          {attachmentError}
        </div>
      ) : null}
    </>
  );
}
