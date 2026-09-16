import { LibraryIcon } from "@/components/registry/primitives/core/library-icon";
import { isEmptySource } from "@/components/registry/primitives/editables/source-normalizers";
import {
  Text,
  type TextSource,
} from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";

/**
 * Repeating check-mark mask. Black strokes punch through `bg-success`
 * so the glyph follows the theme token instead of a hardcoded fill.
 * Height (28) matches `text-sm` + `leading-7` so one check lands per
 * authored line.
 */
const CHECK_MASK = `url("data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="28" viewBox="0 0 16 28" fill="none"><path d="M3 14.5l3 3 6-7" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
)}")`;

export interface EditableMultilineListProps {
  /**
   * Sitecore multi-line text field, or an already-split `string[]`
   * from search/list adapters that have not kept the field object.
   */
  value?: TextSource | string[];
  isEditing?: boolean;
  /** Pages empty-slot label. Defaults to `"Features"`. */
  placeholder?: string;
  className?: string;
}

function toSource(
  value: EditableMultilineListProps["value"],
): TextSource | undefined {
  if (value == null) return undefined;
  if (Array.isArray(value)) {
    const joined = value.filter(Boolean).join("\n");
    return joined || undefined;
  }
  return value;
}

/**
 * Checklist whose Sitecore field stays in the tree.
 *
 * Pricing (and any later consumer) used to `adaptFeatures` → `<span>`
 * per line, which dropped the field object so Pages had nothing to
 * bind. This always mounts `<Text>` with `whitespace-pre-line` and
 * paints a check on each line via a repeating mask.
 *
 * @param value - Multi-line field or split strings.
 * @param isEditing - Keep the empty-slot placeholder clickable.
 * @returns A checklist wrapping the editable field.
 */
export function EditableMultilineList({
  value,
  isEditing,
  placeholder = "Features",
  className,
}: EditableMultilineListProps) {
  const source = toSource(value);
  const hasContent = source != null && !isEmptySource(source);
  const showSlot = hasContent || isEditing;
  if (!showSlot) return null;

  // Empty editing slot: a single check + the Text placeholder, not a
  // repeating mask over blank space.
  if (!hasContent) {
    return (
      <div
        className={cn(
          "flex items-start gap-2 text-foreground text-sm",
          className,
        )}
      >
        <LibraryIcon
          name="check"
          className="mt-0.5 size-4 text-success"
          aria-hidden="true"
        />
        <Text
          value={source}
          isEditing={isEditing}
          placeholder={placeholder}
          tag="span"
        />
      </div>
    );
  }

  return (
    <div className={cn("relative text-foreground text-sm", className)}>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 start-0 w-4 bg-success"
        style={{
          maskImage: CHECK_MASK,
          WebkitMaskImage: CHECK_MASK,
          maskRepeat: "repeat-y",
          WebkitMaskRepeat: "repeat-y",
          maskSize: "1rem 1.75rem",
          WebkitMaskSize: "1rem 1.75rem",
        }}
      />
      <Text
        value={source}
        isEditing={isEditing}
        placeholder={placeholder}
        tag="span"
        className="block whitespace-pre-line ps-6 leading-7"
      />
    </div>
  );
}
