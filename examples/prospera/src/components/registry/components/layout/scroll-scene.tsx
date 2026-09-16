import type { ImageSource } from "@/components/registry/primitives/editables/image";
import {
  Text,
  type TextSource,
} from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import { parseBoolParam } from "@/lib/registry/param-parsers";
import {
  hasSectionBackgroundImage,
  parseSectionBackgroundPosition,
  parseSectionBackgroundScrim,
  SectionBackground,
  sectionBackgroundToneClass,
} from "@/lib/registry/section-background";
import {
  SECTION_BACKGROUND_BY_SCHEME,
  type SectionColorScheme,
} from "@/lib/registry/section-surface";
import { type CmsProps, Placeholder } from "@/lib/registry/sitecore";
import { ScrollSceneTint } from "./scroll-scene.client";

/**
 * Flat props delivered by the sibling `.sitecore.ts` adapter (same
 * shapes `withSitecore`'s default convention would produce). One
 * canonical name per concept.
 */
export interface ScrollSceneProps extends CmsProps {
  // Fields
  /**
   * Editing-mode label for the scene — shown in the Pages canvas
   * hint bar so authors can tell scenes apart. NEVER rendered on the
   * published page.
   */
  title?: TextSource;
  /**
   * The scene's SHARED background image (section-background
   * vocabulary): one photo persists behind every child section while
   * the content scrolls over it.
   */
  backgroundImage?: ImageSource;
  // Params
  /**
   * `ColorStops` — comma-separated `color-scheme@1` tokens, one per
   * DIRECT child of the content placeholder, in order (e.g.
   * `"neutral,accent,primary,neutral"`). As each child scrolls into
   * view the scene's tint layer cross-fades to that child's stop.
   * Invalid or missing tokens degrade to no tint for that stop.
   */
  colorStops?: string;
  /**
   * `TransitionMs` — cross-fade duration in milliseconds (integer-ish
   * string). Defaults to 600; non-numeric / negative values fall back.
   */
  transitionMs?: string;
  /**
   * `StickyBackground` — Sitecore string-boolean. When on (the
   * default) the background layer is `position: sticky` behind the
   * scrolling content so the image persists viewport-filling while
   * the sections pass over it. Off = the image stretches across the
   * whole scene and scrolls with it.
   */
  stickyBackground?: string | boolean;
  /** Scrim over the BackgroundImage — shared `background-scrim@1` axis. */
  backgroundScrim?: string;
  /** Crop anchor of the BackgroundImage — shared `background-position@1` axis. */
  backgroundPosition?: string;
  /**
   * Per-placement digit suffix SXA injects when the rendering is
   * marked `IsRenderingsWithDynamicPlaceholders=true`. Builds
   * `scroll-scene-content-<id>` to match the SDK's `^…-\d+$` pattern.
   */
  dynamicPlaceholderId?: string;
}

const SECTION_COLOR_SCHEMES = Object.keys(
  SECTION_BACKGROUND_BY_SCHEME,
) as SectionColorScheme[];

const isSectionColorScheme = (value: string): value is SectionColorScheme =>
  (SECTION_COLOR_SCHEMES as string[]).includes(value);

/**
 * Parse the `ColorStops` param into one scheme token per comma
 * segment. Position is the contract — stop N belongs to the Nth
 * direct child of the placeholder — so an invalid / empty segment is
 * kept as `"none"` (no tint for that stop) rather than dropped, which
 * would shift every later stop onto the wrong section. A missing /
 * blank param yields `[]` (scene renders untinted).
 */
export function parseColorStops(
  value: string | undefined,
): SectionColorScheme[] {
  if (!value || value.trim() === "") return [];
  return value.split(",").map((segment) => {
    const token = segment.trim().toLowerCase();
    return isSectionColorScheme(token) ? token : "none";
  });
}

/** Default cross-fade duration when `TransitionMs` is unset/invalid. */
export const DEFAULT_TRANSITION_MS = 600;
/** Sanity cap — a stop cross-fade longer than this reads as broken. */
const MAX_TRANSITION_MS = 10_000;

/**
 * Parse the `TransitionMs` param (integer-ish string). Non-numeric,
 * negative, and absent values fall back to {@link DEFAULT_TRANSITION_MS};
 * absurd values clamp to a 10s ceiling.
 */
export function parseTransitionMs(
  value: string | undefined,
  fallback: number = DEFAULT_TRANSITION_MS,
): number {
  if (value == null || value.trim() === "") return fallback;
  const parsed = Number.parseInt(value.trim(), 10);
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return Math.min(parsed, MAX_TRANSITION_MS);
}

/**
 * Tall layout "scene": several child renderings share ONE background
 * image, and a scroll-driven tint layer cross-fades the scene's
 * surface color to each child's `ColorStops` entry as that child
 * scrolls into view — the signature premium-brand pattern (ketelone /
 * emirates style story scenes).
 *
 * Mechanics mirror the other layout hosts (section-wrapper /
 * column-splitter): a permissive dynamic placeholder
 * (`scroll-scene-content-{*}`) hosts the children; the background
 * layer reuses the shared section-background vocabulary
 * (BackgroundScrim / BackgroundPosition); the tint stops reference
 * the shared section-surface `color-scheme@1` vocabulary.
 *
 * Layering (scene root is `relative`):
 *   1. Background image — sticky viewport-height when StickyBackground
 *      is on (default), full-scene absolute otherwise. Scrim + tone
 *      flip via the shared SectionBackground treatment.
 *   2. Tint layer — `absolute inset-0`, painted by the client
 *      controller (`scroll-scene.client.tsx`), cross-fading between
 *      scheme fills with a `TransitionMs` CSS transition.
 *   3. Content — `relative z-10` wrapper around the placeholder; the
 *      controller observes its DIRECT children with an
 *      IntersectionObserver (viewport-centre band) to pick the stop.
 *
 * Editing mode renders no scroll effects: children mount normally
 * inside a dashed scene outline with a small label chip (the Title
 * field — canvas-only, never rendered on the live page).
 *
 * SSR/hydration-safe: the initial render paints the FIRST stop (or no
 * tint) with no observer; the observer attaches on mount.
 *
 * Exported as `ScrollScenePresentation` for unit tests, and
 * re-exported as `Default` for the Sitecore component map.
 */
export function ScrollScenePresentation({
  id,
  styles,
  isEditing,
  title,
  backgroundImage,
  colorStops,
  transitionMs,
  stickyBackground,
  backgroundScrim,
  backgroundPosition,
  dynamicPlaceholderId,
  rendering,
}: ScrollSceneProps) {
  const stops = parseColorStops(colorStops);
  const transition = parseTransitionMs(transitionMs);
  // Default ON — the persistent shared backdrop is the point of the
  // component; authors opt out per placement.
  const sticky = parseBoolParam(stickyBackground, true);
  const hasBackground = hasSectionBackgroundImage(backgroundImage);
  const scrim = parseSectionBackgroundScrim(backgroundScrim);
  const scrimPosition = parseSectionBackgroundPosition(backgroundPosition);

  // Substitute the SXA-injected DynamicPlaceholderId into the slot
  // name so the SDK's `^scroll-scene-content-\d+$` regex matches —
  // see container.tsx for why the literal `{*}` token doesn't work.
  const phSuffix = dynamicPlaceholderId ?? "1";
  const placeholderName = `scroll-scene-content-${phSuffix}`;

  const background = hasBackground ? (
    <SectionBackground
      image={backgroundImage}
      scrim={scrim}
      position={scrimPosition}
      isEditing={isEditing}
      placeholder="Scene background"
    />
  ) : null;

  const content = rendering ? (
    <Placeholder name={placeholderName} rendering={rendering} />
  ) : null;

  return (
    <section
      id={id}
      data-scroll-scene
      className={cn(
        "component scroll-scene relative",
        // `overflow-clip`, NOT `overflow-hidden`: `clip` does not
        // create a scroll container, so the sticky background layer
        // keeps sticking to the viewport while the scene scrolls.
        // `hidden` would silently kill the sticky treatment.
        hasBackground && "overflow-clip",
        hasBackground && sectionBackgroundToneClass(scrim),
        // Editing hint — subtle scene outline so authors see the
        // scene's extent in the canvas (same spirit as the dashed
        // slot chrome the other layout hosts get from Pages).
        isEditing && "outline-dashed outline-1 outline-border",
        styles,
      )}
    >
      {background ? (
        sticky && !isEditing ? (
          // Sticky treatment: the full-scene absolute rail hosts a
          // viewport-height sticky box; the image (absolute inset-0
          // inside it) stays pinned while content scrolls past.
          // Editing mode keeps the simpler full-scene layer so the
          // canvas doesn't fight Pages' own scroll handling.
          <div className="absolute inset-0">
            <div className="sticky top-0 h-screen">{background}</div>
          </div>
        ) : (
          background
        )
      ) : null}
      {isEditing ? (
        <>
          {/* Canvas-only label — the Title field is an authoring aid
              and is deliberately never rendered on the live page. */}
          <div className="relative z-10 flex items-center gap-2 px-4 py-2">
            <span className="rounded-sm bg-muted px-2 py-0.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">
              Scroll Scene
            </span>
            <Text
              value={title}
              tag="span"
              className="text-muted-foreground text-xs"
              placeholder="Scene label"
              isEditing={isEditing}
            />
          </div>
          <div className="relative z-10">{content}</div>
        </>
      ) : (
        <ScrollSceneTint colorStops={stops} transitionMs={transition}>
          {content}
        </ScrollSceneTint>
      )}
    </section>
  );
}

export { ScrollScenePresentation as Default };

/**
 * `universal` opts this file into BOTH the server and client
 * component maps the SDK generates. Server-only by default would land
 * here in the server map alone, which means Sitecore Pages chrome
 * (browser-side) cannot look the component up and its named-export
 * variants fail to resolve. See section-wrapper.tsx for the full
 * rationale.
 */
export const componentType = "universal";
