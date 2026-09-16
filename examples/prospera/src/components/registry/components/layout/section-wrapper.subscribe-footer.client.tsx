"use client";

import type { FormEvent } from "react";
import { useCallback } from "react";
import { Button } from "@/components/registry/components/ui/cta-button";
import { useSubscribeSubmission } from "@/hooks/registry/use-subscribe-submission";

interface SectionWrapperSubscribeFooterProps {
  /**
   * URL the subscribe POST goes to. Defaults to `/api/forms/subscribe`
   * — the same route SubscribeBlock / subscribe-section /
   * subscription-banner post to (the old `/api/subscribe` default
   * pointed at a route that doesn't exist, so every submit surfaced
   * the error message). Authors can wire this to a different endpoint
   * (HubSpot, Mailchimp proxy, custom BFF) without forking the
   * component.
   */
  submitAction?: string;
  successMessage?: string;
  errorMessage?: string;
}

/**
 * Inline subscribe form rendered under a SectionWrapper when the
 * author picks `BottomContent="subscribe"`. Posts via the shared
 * `useSubscribeSubmission` hook (same chain `SubscribeBlock` uses);
 * surfaces inline success / error feedback below the input row.
 *
 * Previously this just `preventDefault`'d on submit — clicking
 * Subscribe did nothing observable. Authors had to use the dedicated
 * SubscribeBlock to get a working CTA, which defeated the point of
 * the SectionWrapper's `BottomContent="subscribe"` shortcut.
 */
export function SectionWrapperSubscribeFooter({
  submitAction = "/api/forms/subscribe",
  successMessage = "Thanks — you're on the list.",
  errorMessage = "Something went wrong. Please try again.",
}: SectionWrapperSubscribeFooterProps = {}) {
  const { status, message, submit, reset } = useSubscribeSubmission({
    action: submitAction,
    method: "POST",
    successMessage,
    errorMessage,
  });

  const onSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const form = event.currentTarget;
      const email = String(new FormData(form).get("email") ?? "").trim();
      if (!email) return;
      const ok = await submit({ email });
      if (ok) form.reset();
    },
    [submit],
  );

  return (
    <div className="mx-auto w-full max-w-md">
      <form
        className="flex w-full flex-col items-center gap-2 sm:flex-row"
        onSubmit={onSubmit}
      >
        <input
          type="email"
          name="email"
          required
          aria-label="Email address"
          placeholder="Enter your email"
          disabled={status === "submitting"}
          onChange={() => {
            if (status === "error" || status === "success") reset();
          }}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />
        <Button type="submit" size="sm" disabled={status === "submitting"}>
          {status === "submitting" ? "Sending…" : "Subscribe"}
        </Button>
      </form>
      {status === "success" ? (
        <output className="mt-2 block text-center text-sm text-success">
          {message}
        </output>
      ) : status === "error" ? (
        <p
          className="mt-2 text-center text-destructive text-sm"
          role="alert"
          aria-live="polite"
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}

export const componentType = "universal";
