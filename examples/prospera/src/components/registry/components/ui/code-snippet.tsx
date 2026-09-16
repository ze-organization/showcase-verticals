import { CodeBlock } from "@/components/registry/primitives/core/code-block";
import {
  getSourceText,
  isEmptySource,
} from "@/components/registry/primitives/editables/source-normalizers";
import {
  Text,
  type TextSource,
} from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import { isEnabled } from "@/lib/registry/param-parsers";
import type { CmsProps } from "@/lib/registry/sitecore";

/**
 * Flat props delivered by `withSitecore`'s default convention:
 * `fields.Code` → `code`, `fields.Language` → `language`,
 * `fields.Caption` → `caption`; `params.ShowLineNumbers` /
 * `params.ShowCopy` → the matching camelCase props.
 */
export interface CodeSnippetProps extends CmsProps {
  /** The code snippet. Multi-line text — whitespace is preserved. */
  code?: TextSource;
  /**
   * Language identifier (e.g. `typescript`, `bash`). Shown as the
   * panel's badge; when it matches the highlighter's vocabulary it
   * also drives syntax highlighting.
   */
  language?: TextSource;
  /** Optional caption rendered below the panel. */
  caption?: TextSource;
  /** Render line numbers in the gutter. Checkbox param, default off. */
  showLineNumbers?: string | boolean;
  /** Show the copy-to-clipboard button. Checkbox param, default ON. */
  showCopy?: string | boolean;
}

/**
 * Displays a code snippet through the design system's `CodeBlock`
 * primitive — shiki syntax highlighting (when the Language matches the
 * highlighter's vocabulary), language badge, copy-to-clipboard button,
 * optional line numbers, horizontal scroll for long lines — plus an
 * optional caption below.
 *
 * EDITING mode renders the fields through editable `<Text>` primitives
 * on a plain panel instead (inline-editable code/language/caption;
 * the highlighter would swallow Pages' field chrome).
 *
 * Returns `null` outside editing mode when there's no code — keeps
 * stray empty panels off the page.
 */
export function Default({
  code,
  language,
  caption,
  showLineNumbers,
  showCopy,
  styles,
  id,
  isEditing,
}: CodeSnippetProps) {
  const hasCode = code != null && !isEmptySource(code);
  const hasCaption = caption != null && !isEmptySource(caption);
  if (!hasCode && !isEditing) return null;

  const codeText = getSourceText(code) ?? "";
  const languageText = getSourceText(language)?.trim().toLowerCase();
  // ShowCopy defaults ON (the primitive's own default): the param is a
  // checkbox whose Standard Value seeds "1"; only an explicit uncheck
  // ("0"/"false") hides the button.
  const copyOff =
    typeof showCopy === "string"
      ? ["0", "false", "no", "off"].includes(showCopy.trim().toLowerCase())
      : showCopy === false;

  return (
    <figure
      className={cn("component code-snippet w-full", styles?.trimEnd())}
      id={id}
      data-slot="code-snippet"
    >
      {isEditing ? (
        // Editable authoring surface — plain panel, Pages field chrome.
        <div className="relative rounded-[var(--card-radius,var(--radius-lg,0.75rem))] bg-muted">
          <span
            className="absolute end-3 top-2 select-none font-mono text-muted-foreground text-xs uppercase tracking-wider"
            data-slot="code-snippet-language"
          >
            <Text
              value={language}
              tag="span"
              placeholder="Language"
              isEditing
            />
          </span>
          <pre className="overflow-x-auto whitespace-pre p-4 pt-6 font-mono text-foreground text-sm leading-relaxed">
            <Text value={code} tag="code" placeholder="Code" isEditing />
          </pre>
        </div>
      ) : (
        <CodeBlock
          // `code` + `language` drive shiki highlighting; the primitive's
          // plain path (no/unknown language) renders `children` — pass
          // the text on both channels so every path shows the snippet.
          code={codeText}
          language={languageText || undefined}
          showLineNumbers={isEnabled(showLineNumbers)}
          showCopy={!copyOff}
        >
          {codeText}
        </CodeBlock>
      )}
      {hasCaption || isEditing ? (
        <figcaption className="mt-2 text-muted-foreground text-sm">
          <Text
            value={caption}
            tag="span"
            placeholder="Caption"
            isEditing={isEditing}
          />
        </figcaption>
      ) : null}
    </figure>
  );
}

/**
 * `universal` opts this file into BOTH the server and client component
 * maps the SDK generates — Pages chrome resolves named-export variants
 * client-side. See content-block.tsx for the full rationale.
 */
export const componentType = "universal";
