"use client";

import { useCallback, useRef, useState } from "react";
import { ATTACHMENT_FILE_SIZE_LIMIT, ATTACHMENT_TEXT_LIMIT } from "./constants";
import type { AttachedFile } from "./types";

function isReadableTextMime(type: string, name: string): boolean {
  if (!type) {
    return /\.(txt|md|markdown|csv|tsv|json|jsonl|xml|html|htm|css|js|ts|tsx|jsx|yaml|yml|log)$/i.test(
      name,
    );
  }
  return (
    type.startsWith("text/") ||
    type === "application/json" ||
    type === "application/xml" ||
    type === "application/javascript" ||
    type === "application/x-yaml" ||
    type === "application/yaml"
  );
}

export interface UseAttachmentsResult {
  attachedFiles: AttachedFile[];
  attachmentError: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFilePick: (fileList: FileList | null) => Promise<void>;
  removeAttachment: (id: string) => void;
  resetAttachments: () => void;
  isDraggingFiles: boolean;
  dndHandlers: {
    onDragEnter: (event: React.DragEvent) => void;
    onDragOver: (event: React.DragEvent) => void;
    onDragLeave: (event: React.DragEvent) => void;
    onDrop: (event: React.DragEvent) => void;
  };
}

/**
 * Session-attached files + drag-and-drop intake. File text is held in memory
 * and folded into the composed system prompt at request time — the BFF never
 * sees a raw upload. Non-text MIME types stage as chips but skip compose.
 */
export function useAttachments(): UseAttachmentsResult {
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFilePick = useCallback(async (fileList: FileList | null) => {
    setAttachmentError(null);
    if (!fileList || fileList.length === 0) return;
    const next: AttachedFile[] = [];
    for (const file of Array.from(fileList)) {
      if (file.size > ATTACHMENT_FILE_SIZE_LIMIT) {
        const limitMb = ATTACHMENT_FILE_SIZE_LIMIT / 1_000_000;
        setAttachmentError(`"${file.name}" is too large (max ${limitMb}MB).`);
        continue;
      }
      const id = `${file.name}-${file.size}-${file.lastModified}`;
      const readable = isReadableTextMime(file.type, file.name);
      if (readable) {
        try {
          const text = await file.text();
          next.push({
            id,
            name: file.name,
            size: file.size,
            content: text.slice(0, ATTACHMENT_TEXT_LIMIT),
          });
        } catch {
          next.push({
            id,
            name: file.name,
            size: file.size,
            content: "",
            unreadable: true,
          });
        }
      } else {
        next.push({
          id,
          name: file.name,
          size: file.size,
          content: "",
          unreadable: true,
        });
      }
    }
    setAttachedFiles((previous) => {
      const seen = new Set(previous.map((f) => f.id));
      const additions = next.filter((f) => !seen.has(f.id));
      return [...previous, ...additions];
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const removeAttachment = useCallback((id: string) => {
    setAttachedFiles((previous) => previous.filter((f) => f.id !== id));
  }, []);

  const resetAttachments = useCallback(() => {
    setAttachedFiles([]);
    setAttachmentError(null);
  }, []);

  // Drag-and-drop depth counter — `dragenter`/`dragleave` fire on every child,
  // so we count to keep the overlay mounted while the cursor is anywhere over
  // the panel.
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const dragCounterRef = useRef(0);

  const onDragEnter = useCallback((event: React.DragEvent) => {
    if (!event.dataTransfer?.types?.includes("Files")) return;
    event.preventDefault();
    dragCounterRef.current += 1;
    setIsDraggingFiles(true);
  }, []);
  const onDragOver = useCallback((event: React.DragEvent) => {
    if (!event.dataTransfer?.types?.includes("Files")) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }, []);
  const onDragLeave = useCallback((event: React.DragEvent) => {
    if (!event.dataTransfer?.types?.includes("Files")) return;
    event.preventDefault();
    dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);
    if (dragCounterRef.current === 0) setIsDraggingFiles(false);
  }, []);
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      if (!event.dataTransfer?.types?.includes("Files")) return;
      event.preventDefault();
      dragCounterRef.current = 0;
      setIsDraggingFiles(false);
      void handleFilePick(event.dataTransfer.files);
    },
    [handleFilePick],
  );

  return {
    attachedFiles,
    attachmentError,
    fileInputRef,
    handleFilePick,
    removeAttachment,
    resetAttachments,
    isDraggingFiles,
    dndHandlers: { onDragEnter, onDragOver, onDragLeave, onDrop },
  };
}
