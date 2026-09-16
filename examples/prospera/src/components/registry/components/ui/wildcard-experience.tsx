"use client";

import { type ReactNode, useMemo } from "react";
import {
  getSourceText,
  isEmptySource,
} from "@/components/registry/primitives/editables/source-normalizers";
import type { TextSource } from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import type { CmsProps } from "@/lib/registry/sitecore";
import { Placeholder } from "@/lib/registry/sitecore";
import type { WildcardFieldMap } from "@/lib/registry/wildcard/normalize";
import {
  useWildcardItem,
  type WildcardItemState,
} from "@/lib/registry/wildcard/use-wildcard-item";
import { WildcardItemProvider } from "@/lib/registry/wildcard/wildcard-item-context";

/**
 * `WildcardExperience` — the composable wrapper for Sitecore *wildcard
 * pages* (a page item literally named `*`), modeled on
 * `search-experience@1`.
 *
 * Where `wildcard-detail@1` is the quick all-in-one detail rendering,
 * this wrapper lets authors build the detail page out of ANY registry
 * components and then map the resolved content model onto them:
 *
 *   1. The wrapper resolves `<SourceRoot>/<slug>` ONCE via
 *      `useWildcardItem` and provides the result through
 *      `WildcardItemContext`.
 *   2. It renders a dynamic placeholder (`wildcard-content-{*}`,
 *      unrestricted) that authors fill with ordinary renderings —
 *      heros, content blocks, media, card lists.
 *   3. Each child rendering can carry a `WildcardBindings` rendering
 *      param (JSON: prop name → resolved field name, e.g.
 *      `{"title":"Title","image":"Image","body":"Story"}`). The
 *      `withSitecore` seam overlays the mapped resolved fields onto
 *      that component's final props — resolved values win; the child's
 *      authored datasource content remains the fallback (preview,
 *      editing mode, unresolved slugs, environments without Edge).
 *
 * The wrapper itself renders no content of its own — an editing-mode
 * hint when `SourceRoot` is missing, the placeholder, and (composed /
 * non-Sitecore mode) fallback `children`.
 */
export interface WildcardExperienceProps extends CmsProps {
  /**
   * Content-tree path of the data folder the URL slug resolves under.
   * Comes from the datasource's `SourceRoot` field. Empty → no runtime
   * resolution; children render their authored content.
   */
  sourceRoot?: string;
  /** Item language for resolution. Defaults to `"en"`. */
  language?: string;
  /**
   * Authored label — only surfaced in the editing-mode hint so authors
   * can tell wildcard wrappers apart on the canvas. Never rendered on
   * the live page.
   */
  title?: TextSource;
  /**
   * Pre-resolved wildcard field map. When provided (and non-empty) it
   * takes precedence over the client-side resolver and suppresses the
   * fetch entirely — mirrors `wildcard-detail@1`'s injected
   * `resolvedFields` (showcase preview / tests / server-side fetchers).
   */
  resolvedFields?: WildcardFieldMap;
  /** Composed-mode fallback children (showcase preview / non-Sitecore). */
  children?: ReactNode;
}

const PLACEHOLDER_KEY = "wildcard-content-{*}";

function WildcardExperienceInner({
  sourceRoot,
  language,
  title,
  resolvedFields,
  children,
  rendering,
  styles,
  id,
  isEditing,
}: WildcardExperienceProps) {
  const hasInjectedFields =
    resolvedFields != null && Object.keys(resolvedFields).length > 0;
  // Injected fields suppress the client-side fetch (preview / test path).
  const hookState = useWildcardItem({
    sourceRoot: hasInjectedFields ? undefined : sourceRoot,
    language,
  });
  const state: WildcardItemState = useMemo(
    () =>
      hasInjectedFields
        ? {
            status: "resolved",
            item: { fields: resolvedFields as WildcardFieldMap },
            fields: resolvedFields as WildcardFieldMap,
          }
        : hookState,
    [hasInjectedFields, resolvedFields, hookState],
  );

  const hintLabel =
    title != null && !isEmptySource(title) ? getSourceText(title) : undefined;

  return (
    <WildcardItemProvider state={state}>
      <section
        className={cn(
          "component wildcard-experience w-full",
          styles?.trimEnd(),
        )}
        id={id}
        dir="inherit"
        data-slot="wildcard-experience"
      >
        {isEditing && !sourceRoot?.trim() && !hasInjectedFields ? (
          <span className="is-empty-hint">
            {hintLabel ?? "Wildcard experience"} — set a Source Root so
            renderings dropped below can bind resolved fields via
            WildcardBindings; authored content renders until then
          </span>
        ) : null}
        {rendering ? (
          <Placeholder name={PLACEHOLDER_KEY} rendering={rendering as never} />
        ) : (
          children
        )}
      </section>
    </WildcardItemProvider>
  );
}

export function Default(props: WildcardExperienceProps) {
  return <WildcardExperienceInner {...props} />;
}

export default Default;

// Sitecore-aware multi-export components MUST declare this so the SDK
// lists them in BOTH server and client component maps (Pages chrome
// resolves named-export variants client-side).
export const componentType = "universal";
