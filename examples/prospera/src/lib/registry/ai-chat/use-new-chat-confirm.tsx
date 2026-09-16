"use client";

import { useCallback, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/registry/primitives/core/alert-dialog";
import type { ResolvedAIChatLabels } from "./labels";

/**
 * Confirmation guard for "Start a new chat" — wiping the conversation
 * is destructive, so we surface an AlertDialog before calling through.
 *
 * Usage:
 *   const newChat = useNewChatConfirm(controller.handleNewChat, labels);
 *   <Header onNewChat={newChat.request} ... />
 *   {newChat.dialog}
 */
export function useNewChatConfirm(
  onConfirm: () => void,
  labels: ResolvedAIChatLabels,
) {
  const [open, setOpen] = useState(false);
  const request = useCallback(() => setOpen(true), []);
  const handleConfirm = useCallback(() => {
    setOpen(false);
    onConfirm();
  }, [onConfirm]);

  const dialog = (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{labels.discardTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            {labels.discardDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{labels.discardCancelLabel}</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            {labels.discardConfirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return { request, dialog };
}
