"use client";

import { Upload } from "lucide-react";
import { useId, useRef, useState } from "react";
import {
  FormFieldShell,
  type FormFieldSize,
  type FormFieldWidth,
  type FormLabelOrientation,
  ORIENTATION_INSET_INPUT_CLASSES,
  SIZE_INPUT_CLASSES,
} from "@/components/registry/blocks/form-field-shell";
import { Button } from "@/components/registry/primitives/core/button";
import { getSourceText } from "@/components/registry/primitives/editables/source-normalizers";
import type { TextSource } from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import type { CmsProps } from "@/lib/registry/sitecore";

export interface FormUploadFieldFields {
  Name?: TextSource;
  Label?: TextSource;
  ButtonText?: TextSource;
  Description?: TextSource;
  Multiple?: string | boolean;
  Accept?: TextSource;
  MaxFileSizeMB?: number | string;
}

export interface FormUploadFieldProps extends CmsProps {
  name?: TextSource;
  label?: TextSource;
  buttonText?: TextSource;
  description?: TextSource;
  multiple?: string | boolean;
  accept?: TextSource;
  maxFileSizeMB?: number | string;
  required?: string | boolean;
  width?: FormFieldWidth;
  size?: FormFieldSize;
  labelOrientation?: FormLabelOrientation;
}

function isEnabled(value: string | boolean | TextSource | undefined): boolean {
  if (typeof value === "boolean") return value;
  if (value == null) return false;
  const raw =
    typeof value === "object" && "value" in value
      ? (value as { value?: unknown }).value
      : value;
  if (typeof raw === "boolean") return raw;
  if (typeof raw !== "string") return false;
  const normalized = raw.trim().toLowerCase();
  return ["1", "true", "yes", "on", "enabled"].includes(normalized);
}

function parseSize(value: number | string | undefined): number | undefined {
  if (value === undefined || value === "") return undefined;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

function summarizeSelection(files: File[]): string {
  if (files.length === 0) return "";
  if (files.length === 1) return files[0]?.name ?? "";
  return `${files.length} files selected`;
}

/**
 * Returns the first file exceeding `maxBytes`, or undefined when every
 * file is within the limit (or no limit is set).
 */
function findOversizedFile(
  files: File[],
  maxBytes: number | undefined,
): File | undefined {
  if (maxBytes === undefined) return undefined;
  return files.find((file) => file.size > maxBytes);
}

/**
 * File upload input rendered inside a FormBuilder's `form-fields-{*}`
 * placeholder. Native `<input type="file">` is hidden behind a styled
 * Button trigger because the native file-input chrome is impossible
 * to theme cross-browser; the trigger forwards clicks to the hidden
 * input, and the input drives the value the browser submits.
 *
 * Submitted under the field's `Name` as part of a `multipart/form-data`
 * encoded form (FormBuilder detects file inputs and sets `encType`
 * accordingly).
 */
export function Default(props: FormUploadFieldProps) {
  const fieldId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<File[]>([]);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isDragging, setDragging] = useState(false);
  const {
    name,
    label,
    buttonText,
    description,
    multiple,
    accept,
    maxFileSizeMB,
    required,
    width = "full",
    size = "default",
    labelOrientation = "stack",
    styles,
    id,
  } = props;

  const nameText = getSourceText(name) || "file";
  const labelText = getSourceText(label) || "Upload";
  const acceptText = getSourceText(accept) || undefined;
  const descriptionText = getSourceText(description) || undefined;
  const isMultiple = isEnabled(multiple);
  const fallbackButtonText = isMultiple ? "Choose files" : "Choose file";
  const buttonLabel = getSourceText(buttonText) || fallbackButtonText;
  const maxBytes = (() => {
    const mb = parseSize(maxFileSizeMB);
    return mb !== undefined ? mb * 1024 * 1024 : undefined;
  })();
  const oversizeMessage = (offender: File) => {
    const mb = parseSize(maxFileSizeMB);
    return `"${offender.name}" is larger than the ${mb}MB limit.`;
  };
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const offender = findOversizedFile(files, maxBytes);
    if (offender) {
      setError(oversizeMessage(offender));
      setSelected([]);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    setError(undefined);
    setSelected(files);
  };
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    const dropped = Array.from(event.dataTransfer.files);
    if (dropped.length === 0) return;
    const offender = findOversizedFile(dropped, maxBytes);
    if (offender) {
      setError(oversizeMessage(offender));
      return;
    }
    const files = isMultiple ? dropped : dropped.slice(0, 1);
    // Mirror dropped files into the hidden input so FormData picks
    // them up. DataTransfer assignment is the only cross-browser way
    // to set `<input type=file>`'s value programmatically.
    if (inputRef.current) {
      const dt = new DataTransfer();
      for (const file of files) {
        dt.items.add(file);
      }
      inputRef.current.files = dt.files;
    }
    setError(undefined);
    setSelected(files);
  };

  return (
    <FormFieldShell
      slot="form-upload-field"
      label={labelText}
      name={nameText}
      inputId={fieldId}
      required={isEnabled(required)}
      description={descriptionText}
      error={error}
      width={width}
      size={size}
      labelOrientation={labelOrientation}
      styles={styles}
      id={id}
    >
      {({ inputId, descId, errorId, isInset, isRequired }) => {
        const describedBy =
          [descId, errorId].filter(Boolean).join(" ") || undefined;
        return (
          <>
            {/*
             * Drop zone — wraps the trigger row + selection summary.
             * Listens to dragenter/dragleave/dragover/drop on the
             * zone so users can drop files anywhere inside without
             * scrubbing the cursor over the button precisely. The
             * `<input type=file>` still backs FormData; we mirror the
             * dropped files into it via DataTransfer assignment so
             * native validation + the form's existing submit path
             * stay unchanged.
             */}
            {/* biome-ignore lint/a11y/noStaticElementInteractions: file dropzone — drag/drop has no semantic HTML element; the keyboard-accessible affordances are the real <Button> and the <input type="file"> it backs, so drop is a mouse-only enhancement. */}
            <div
              className={cn(
                "flex flex-col items-stretch gap-3 rounded-md border-2 border-dashed p-4 transition-colors",
                isDragging
                  ? // surface-tinted re-derives the helper caption's muted
                    // text against the primary tint while dragging.
                    "surface-tinted border-primary bg-primary-background [--surface-tint:var(--color-primary)]"
                  : "border-border bg-muted/30",
                isInset && ORIENTATION_INSET_INPUT_CLASSES,
              )}
              data-slot="form-upload-dropzone"
              data-drag-over={isDragging || undefined}
              onDragEnter={(e) => {
                e.preventDefault();
                if (e.dataTransfer.types.includes("Files")) setDragging(true);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "copy";
              }}
              onDragLeave={(e) => {
                // Only flip the drag state when the cursor LEAVES the
                // dropzone — not when it crosses internal element
                // edges (which fire dragleave on every child boundary).
                if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                setDragging(false);
              }}
              onDrop={handleDrop}
            >
              <div
                className="flex items-center gap-3"
                data-slot="form-upload-trigger-row"
              >
                <Button
                  type="button"
                  variant="outline"
                  colorScheme="neutral"
                  onClick={() => inputRef.current?.click()}
                  className={cn(SIZE_INPUT_CLASSES[size], "shrink-0 gap-2")}
                  aria-describedby={describedBy}
                >
                  <Upload aria-hidden="true" className="size-4" />
                  {buttonLabel}
                </Button>
                <span
                  className="min-w-0 truncate text-muted-foreground text-sm"
                  aria-live="polite"
                >
                  {selected.length === 0
                    ? "Drag files here or click to browse"
                    : summarizeSelection(selected)}
                </span>
              </div>
              {selected.length > 0 ? (
                <ul
                  className="flex w-full flex-col gap-1 text-sm"
                  data-slot="form-upload-list"
                >
                  {selected.map((file) => (
                    <li
                      key={`${file.name}-${file.size}`}
                      className="flex items-center justify-between gap-2 rounded-sm bg-background px-2 py-1"
                    >
                      <span className="min-w-0 truncate">{file.name}</span>
                      <span className="text-muted-foreground text-xs">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            {/*
              The actual form-data carrier. Visually hidden but kept
              in the accessibility tree (no `hidden`) so the browser's
              form validation + native required behavior still apply.
            */}
            <input
              ref={inputRef}
              id={inputId}
              name={nameText}
              type="file"
              required={isRequired}
              multiple={isMultiple}
              accept={acceptText}
              onChange={handleChange}
              className="sr-only"
              aria-describedby={describedBy}
            />
          </>
        );
      }}
    </FormFieldShell>
  );
}

export default Default;

export const componentType = "universal";
