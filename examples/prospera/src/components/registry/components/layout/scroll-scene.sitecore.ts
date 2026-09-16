import type { ScrollSceneProps } from "@/components/registry/components/layout/scroll-scene";
import type { Field, ImageField } from "@/lib/registry/sitecore";
import type { SitecoreInput } from "@/lib/registry/with-sitecore";

/**
 * Layout-service field shapes for `scroll-scene@1`. Keys match the
 * recipe's `fields[].name` — that's the template ↔ adapter contract.
 */
export interface ScrollSceneFields {
  /** Editing-mode label only — never rendered on the live page. */
  Title?: Field<string>;
  /** The scene's shared background image (section-background vocabulary). */
  BackgroundImage?: ImageField;
}

/**
 * Translate the Sitecore Layout Service input (`{fields, params,
 * rendering}`) into `ScrollSceneProps`. Params stay raw strings — the
 * presentation component owns the parsing (`parseColorStops`,
 * `parseTransitionMs`, `parseBoolParam`) so the preview surface and
 * direct test invocations share one validation path.
 *
 * `rendering` MUST be forwarded: the component hosts a nested
 * `<Placeholder>` (`scroll-scene-content-{*}`) and renders nothing in
 * the slot without the envelope.
 */
export function mapScrollScene({
  fields,
  params,
  isEditing,
  rendering,
}: SitecoreInput<ScrollSceneFields>): ScrollSceneProps {
  return {
    title: fields?.Title,
    backgroundImage: fields?.BackgroundImage,
    colorStops: params?.ColorStops,
    transitionMs: params?.TransitionMs,
    stickyBackground: params?.StickyBackground,
    backgroundScrim: params?.BackgroundScrim,
    backgroundPosition: params?.BackgroundPosition,
    dynamicPlaceholderId: params?.DynamicPlaceholderId,
    id: params?.RenderingIdentifier,
    styles: params?.styles,
    isEditing,
    rendering,
  };
}

// Pair with the `Default` variant the auto-generated component map
// resolves via `component.Default` (Sitecore's variant lookup falls
// through `component.default || component.Default || component`).
export { mapScrollScene as Default };
