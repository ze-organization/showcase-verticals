"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// biome-ignore lint/suspicious/noExplicitAny: SpeechRecognition has no DOM lib type
type SpeechRecognitionInstance = any;

interface UseSpeechRecognitionOptions {
  onTranscript: (text: string, final: boolean) => void;
  onEnd?: () => void;
}

const FATAL_SR_ERRORS = new Set([
  "not-allowed",
  "service-not-allowed",
  "audio-capture",
  "language-not-supported",
]);

type SpeechResultEvent = {
  resultIndex: number;
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
};

/** Dev-only console.log gated on a boolean — collapses `if (dev)` branches. */
const logDev = (dev: boolean, ...args: unknown[]) => {
  if (dev) console.log(...args);
};

/**
 * Construct + configure a fresh SpeechRecognition instance (continuous,
 * interim results, resolved language). Returns null when the API is
 * unavailable or the constructor throws.
 */
const createRecognition = (dev: boolean): SpeechRecognitionInstance | null => {
  const w = window as typeof window & {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  };
  const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (!SR) {
    logDev(dev, "[ai-chat] SpeechRecognition not available");
    return null;
  }
  let rec: SpeechRecognitionInstance;
  try {
    rec = new SR();
  } catch (err) {
    logDev(dev, "[ai-chat] SpeechRecognition constructor threw", err);
    return null;
  }
  rec.continuous = true;
  rec.interimResults = true;
  // `navigator.language` (e.g. "en-US") is more reliable than `<html lang>`
  // which is often empty in Next.js apps — empty lang silently returns zero
  // results from SR.
  rec.lang =
    typeof navigator !== "undefined" && navigator.language
      ? navigator.language
      : "en-US";
  return rec;
};

/** Accumulate the final + interim transcript text from a result event. */
const collectTranscripts = (
  event: SpeechResultEvent,
): { finalText: string; interimText: string } => {
  let finalText = "";
  let interimText = "";
  for (let i = event.resultIndex; i < event.results.length; i++) {
    const result = event.results[i];
    if (!result) continue;
    if (result.isFinal) finalText += result[0].transcript;
    else interimText += result[0].transcript;
  }
  return { finalText, interimText };
};

type WireContext = {
  dev: boolean;
  recognitionRef: React.MutableRefObject<SpeechRecognitionInstance | null>;
  callbacksRef: React.MutableRefObject<UseSpeechRecognitionOptions>;
  intentionalStopRef: React.MutableRefObject<boolean>;
  setRecording: (value: boolean) => void;
};

/**
 * Attach all event handlers to a fresh SpeechRecognition instance.
 * Extracted from `start` to keep that callback under the cognitive
 * complexity budget; the restart/finish closures all capture `rec`.
 */
const wireRecognition = (rec: SpeechRecognitionInstance, ctx: WireContext) => {
  const {
    dev,
    recognitionRef,
    callbacksRef,
    intentionalStopRef,
    setRecording,
  } = ctx;

  rec.onstart = () => {
    logDev(
      dev,
      `[ai-chat] SpeechRecognition session started (lang=${rec.lang})`,
    );
  };
  rec.onaudiostart = () => {
    logDev(dev, "[ai-chat] mic audio capture started");
  };
  rec.onaudioend = () => {
    logDev(dev, "[ai-chat] mic audio capture ended");
  };
  rec.onresult = (event: SpeechResultEvent) => {
    const { finalText, interimText } = collectTranscripts(event);
    logDev(
      dev,
      `[ai-chat] onresult final=${JSON.stringify(finalText)} interim=${JSON.stringify(interimText)}`,
    );
    if (finalText) callbacksRef.current.onTranscript(finalText, true);
    if (interimText) callbacksRef.current.onTranscript(interimText, false);
  };
  const finishSession = () => {
    recognitionRef.current = null;
    setRecording(false);
    callbacksRef.current.onEnd?.();
  };
  const restartFreshInstance = () => {
    try {
      const SR =
        (
          window as unknown as {
            SpeechRecognition?: typeof rec.constructor;
          }
        ).SpeechRecognition ??
        (
          window as unknown as {
            webkitSpeechRecognition?: typeof rec.constructor;
          }
        ).webkitSpeechRecognition;
      if (!SR) {
        finishSession();
        return;
      }
      // biome-ignore lint/suspicious/noExplicitAny: Web Speech API typings vary across vendors
      const fresh = new (SR as any)();
      fresh.continuous = rec.continuous;
      fresh.interimResults = rec.interimResults;
      fresh.lang = rec.lang;
      fresh.onresult = rec.onresult;
      fresh.onend = rec.onend;
      fresh.onerror = rec.onerror;
      fresh.onaudiostart = rec.onaudiostart;
      fresh.onaudioend = rec.onaudioend;
      fresh.start();
      recognitionRef.current = fresh;
      logDev(dev, "[ai-chat] SR fresh-instance restart ok");
    } catch (freshErr) {
      logDev(
        dev,
        "[ai-chat] SR fresh-instance restart also failed; giving up",
        freshErr,
      );
      finishSession();
    }
  };
  const autoRestart = () => {
    if (intentionalStopRef.current) return;
    try {
      rec.start();
      logDev(dev, "[ai-chat] SR auto-restarted (browser silence-end)");
      return;
    } catch (restartErr) {
      logDev(
        dev,
        "[ai-chat] SR same-instance restart failed; trying fresh instance",
        restartErr,
      );
    }
    restartFreshInstance();
  };
  rec.onend = () => {
    logDev(dev, "[ai-chat] SpeechRecognition ended");
    if (!intentionalStopRef.current) {
      // Chromium throws InvalidStateError when `.start()` runs synchronously
      // inside its own `onend` — defer to next microtask. If same-instance
      // restart still fails, instantiate a fresh SR to sidestep stuck state.
      queueMicrotask(autoRestart);
      return;
    }
    finishSession();
  };
  rec.onerror = (event: { error?: string; message?: string }) => {
    logDev(
      dev,
      `[ai-chat] SpeechRecognition error: ${event.error ?? "unknown"}${
        event.message ? ` — ${event.message}` : ""
      }`,
    );
    // Fatal errors should surface the next `onend`, not auto-restart.
    if (event.error && FATAL_SR_ERRORS.has(event.error)) {
      intentionalStopRef.current = true;
    }
  };
};

/**
 * Web Speech API wrapper. Browser-native, no backend cost. Hidden by callers
 * when `supported` is false (Safari pre-15, Firefox without a flag).
 *
 * The hook intentionally doesn't own the textarea — composer keeps it, so
 * paste/typing still works while the mic is active.
 */
export function useSpeechRecognition(opts: UseSpeechRecognitionOptions) {
  // First render must match server's render. SR availability is read in an
  // effect (post-hydration) — a lazy useState initializer would diverge.
  const [supported, setSupported] = useState(false);
  useEffect(() => {
    const w = window as typeof window & {
      SpeechRecognition?: unknown;
      webkitSpeechRecognition?: unknown;
    };
    if (w.SpeechRecognition ?? w.webkitSpeechRecognition) {
      setSupported(true);
    }
  }, []);

  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const callbacksRef = useRef(opts);
  callbacksRef.current = opts;
  // Chrome/Edge auto-end on silence even with `continuous=true`. We track
  // "user wanted to stop" so onend either surfaces (intentional) or
  // transparently restarts (browser silence-end).
  const intentionalStopRef = useRef(false);

  const start = useCallback(() => {
    if (typeof window === "undefined") return;
    const dev = process.env.NODE_ENV !== "production";
    const rec = createRecognition(dev);
    if (!rec) return;
    wireRecognition(rec, {
      dev,
      recognitionRef,
      callbacksRef,
      intentionalStopRef,
      setRecording,
    });
    intentionalStopRef.current = false;
    try {
      rec.start();
      logDev(dev, "[ai-chat] rec.start() returned");
    } catch (err) {
      logDev(dev, "[ai-chat] SpeechRecognition.start threw", err);
      return;
    }
    recognitionRef.current = rec;
    setRecording(true);
  }, []);

  const stop = useCallback(() => {
    intentionalStopRef.current = true;
    recognitionRef.current?.stop();
    recognitionRef.current = null;
  }, []);

  useEffect(() => {
    return () => recognitionRef.current?.stop();
  }, []);

  return { supported, recording, start, stop };
}
