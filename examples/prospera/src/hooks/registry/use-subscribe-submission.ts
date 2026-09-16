"use client";

import { useCallback, useMemo, useState } from "react";

export type SubscribeSubmissionStatus =
  | "idle"
  | "submitting"
  | "success"
  | "error";

export type SubscribeSubmissionMethod = "POST" | "GET";

export interface UseSubscribeSubmissionOptions {
  action: string;
  method?: SubscribeSubmissionMethod;
  successMessage?: string;
  errorMessage?: string;
}

export interface SubscribeSubmissionPayload {
  email: string;
  consentAccepted?: boolean;
}

function getMessageFromPayload(value: unknown): string | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }
  const record = value as Record<string, unknown>;
  const message = record.message;
  if (typeof message === "string" && message.trim().length > 0) {
    return message;
  }
  const error = record.error;
  if (typeof error === "string" && error.trim().length > 0) {
    return error;
  }
  return undefined;
}

/**
 * Manages subscribe-form submission state and request lifecycle.
 * @param {UseSubscribeSubmissionOptions} options - Submission endpoint and UI copy options.
 * @returns {{
 *   status: SubscribeSubmissionStatus;
 *   message: string;
 *   submit: (payload: SubscribeSubmissionPayload) => Promise<boolean>;
 *   reset: () => void;
 * }} Submission state and actions.
 */
export function useSubscribeSubmission(options: UseSubscribeSubmissionOptions) {
  const [status, setStatus] = useState<SubscribeSubmissionStatus>("idle");
  const [message, setMessage] = useState("");

  const method: SubscribeSubmissionMethod = useMemo(() => {
    return options.method === "GET" ? "GET" : "POST";
  }, [options.method]);

  const action = options.action.trim();

  const reset = useCallback(() => {
    setStatus("idle");
    setMessage("");
  }, []);

  const submit = useCallback(
    async (payload: SubscribeSubmissionPayload) => {
      // Showcase mode — recipe documents that an empty `SubmitAction`
      // means "skip the network call, succeed locally, fire CDP events
      // and reset". Without this branch the showcase form would surface
      // a misleading "Missing submit endpoint" error; callers that
      // actually want validation should populate SubmitAction.
      if (!action) {
        setStatus("success");
        setMessage(options.successMessage || "Thanks for subscribing!");
        return true;
      }

      setStatus("submitting");
      setMessage("");

      try {
        const email = payload.email.trim();
        const consentAccepted = Boolean(payload.consentAccepted);

        let requestUrl = action;
        const requestInit: RequestInit = {
          method,
          headers: {
            accept: "application/json",
          },
        };

        if (method === "GET") {
          const url = new URL(action, window.location.origin);
          url.searchParams.set("email", email);
          if (consentAccepted) {
            url.searchParams.set("consentAccepted", "true");
          }
          requestUrl = url.toString();
        } else {
          requestInit.headers = {
            ...requestInit.headers,
            "content-type": "application/json",
          };
          requestInit.body = JSON.stringify({
            email,
            consentAccepted,
            pageUrl: window.location.href,
          });
        }

        const response = await fetch(requestUrl, requestInit);
        const isJson = response.headers
          .get("content-type")
          ?.includes("application/json");
        const payloadData = isJson
          ? ((await response.json()) as unknown)
          : null;
        const payloadMessage = getMessageFromPayload(payloadData);

        if (!response.ok) {
          setStatus("error");
          setMessage(
            payloadMessage ||
              options.errorMessage ||
              "We could not submit your request. Please try again.",
          );
          return false;
        }

        setStatus("success");
        setMessage(
          payloadMessage ||
            options.successMessage ||
            "Thanks for subscribing. Please check your inbox.",
        );
        return true;
      } catch {
        setStatus("error");
        setMessage(
          options.errorMessage ||
            "Network error while submitting. Please try again.",
        );
        return false;
      }
    },
    [action, method, options.errorMessage, options.successMessage],
  );

  return {
    status,
    message,
    submit,
    reset,
  };
}
