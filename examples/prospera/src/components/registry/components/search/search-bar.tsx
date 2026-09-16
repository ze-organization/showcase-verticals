"use client";

import {
  SearchBar as BlockSearchBar,
  type SearchBarVariant,
} from "@/components/registry/blocks/search-bar";
import type { LinkSource } from "@/components/registry/primitives/editables/link";
import {
  getLinkHref,
  getSourceText,
} from "@/components/registry/primitives/editables/source-normalizers";
import type { TextSource } from "@/components/registry/primitives/editables/text";
import {
  FORM_CHROME,
  resolveChromeText,
  useDictionaryTranslate,
} from "@/lib/registry/forms/form-chrome";
import { useSearchControllerContext } from "@/lib/registry/search/search-controller-context";

/**
 * Sitecore-aware `SearchBar` rendering.
 *
 * - Inside a `<family>-search-experience` wrapper: reads context,
 *   drives `controller.query` on submit / change.
 * - Standalone: navigates to `action` on submit (existing block
 *   default behavior).
 *
 * Props are flat and editable-typed (`TextSource`) so the same
 * component works under Sitecore, under a Coveo-backed page, or in
 * Storybook with plain-string props.
 */
export interface SearchBarProps {
  placeholder?: TextSource;
  submitLabel?: TextSource;
  action?: string | LinkSource;
  variant?: SearchBarVariant | string;
  className?: string;
  onSubmit?: (query: string) => void;
}

export function Default({
  placeholder,
  submitLabel,
  action = "/search",
  variant = "default",
  className,
  onSubmit,
}: SearchBarProps) {
  const controller = useSearchControllerContext();
  const resolvedAction =
    typeof action === "string" ? action : getLinkHref(action, "/search");
  const resolvedVariant: SearchBarVariant =
    variant === "medium" || variant === "large" || variant === "input-only"
      ? variant
      : "default";

  // Chrome text resolves author field → core-ui-labels dictionary phrase
  // → English net. The recipe ships PlaceholderText / SubmitLabel with no
  // Standard Value so a blank field falls through to the localized
  // dictionary default rather than a hardcoded English string.
  const t = useDictionaryTranslate();
  const resolvedPlaceholder = resolveChromeText(
    getSourceText(placeholder),
    FORM_CHROME.searchPlaceholder.key,
    FORM_CHROME.searchPlaceholder.en,
    t,
  );
  const resolvedSubmitLabel = resolveChromeText(
    getSourceText(submitLabel),
    FORM_CHROME.searchSubmit.key,
    FORM_CHROME.searchSubmit.en,
    t,
  );

  if (controller) {
    return (
      <BlockSearchBar
        action={resolvedAction}
        placeholder={resolvedPlaceholder}
        submitLabel={resolvedSubmitLabel}
        variant={resolvedVariant}
        className={className}
        value={controller.query}
        onQueryChange={controller.setQuery}
        onSubmit={(next) => {
          controller.setQuery(next);
          onSubmit?.(next);
        }}
      />
    );
  }

  return (
    <BlockSearchBar
      action={resolvedAction}
      placeholder={resolvedPlaceholder}
      submitLabel={resolvedSubmitLabel}
      variant={resolvedVariant}
      className={className}
      onSubmit={onSubmit}
    />
  );
}

export const SearchBar = Default;
export default Default;

export const componentType = "universal";
